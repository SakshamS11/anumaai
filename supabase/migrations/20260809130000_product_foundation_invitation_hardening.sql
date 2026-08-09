-- Final pre-Phase-6 product foundation: durable, prefetch-safe invitations
-- and explicit customer/test environment classification.

alter table public.organizations
  add column environment_type text not null default 'customer'
  constraint organizations_environment_type_check
    check (environment_type in ('customer', 'test'));

-- This retained hosted acceptance fixture is explicitly classified by its
-- durable identifier. Runtime code never infers environment type from a name.
update public.organizations
set environment_type = 'test'
where id = '58a6cca8-6448-48fb-90e5-475ae4f58f93';

alter table public.organization_invitations
  add column token_hash text,
  add column delivery_status text not null default 'pending'
    constraint organization_invitations_delivery_status_check
      check (delivery_status in ('pending', 'sent', 'failed')),
  add column last_sent_at timestamptz,
  add column send_attempt_count integer not null default 0
    constraint organization_invitations_send_attempt_count_check check (send_attempt_count >= 0),
  add column requires_first_access boolean not null default false;

alter table public.organization_invitations
  add constraint organization_invitations_token_hash_check
    check (token_hash is null or token_hash ~ '^[0-9a-f]{64}$');

create unique index organization_invitations_token_hash_idx
  on public.organization_invitations(token_hash)
  where token_hash is not null;

-- Links created by the old callback-first flow cannot be made prefetch-safe.
-- Retain their history and require an administrator to resend a fresh link.
update public.organization_invitations
set status = 'expired', delivery_status = 'failed'
where status = 'pending' and token_hash is null;

drop function if exists public.create_organization_invitation(
  uuid, text, public.membership_role, uuid, uuid
);

create function public.create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role public.membership_role,
  p_location_id uuid default null,
  p_team_id uuid default null,
  p_token_hash text default null
)
returns table(invitation_id uuid, existing_user_id uuid, requires_first_access boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inviter uuid;
  v_email text := lower(btrim(p_email));
  v_user_id uuid;
begin
  v_inviter := private.require_org_admin(p_organization_id);
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid work email is required.' using errcode = '22023';
  end if;
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'A valid invitation credential is required.' using errcode = '22023';
  end if;
  if p_location_id is not null and not exists(
    select 1 from public.locations
    where id = p_location_id and organization_id = p_organization_id and is_active
  ) then
    raise exception 'Location is not part of this organization.' using errcode = '23503';
  end if;
  if p_team_id is not null and not exists(
    select 1 from public.teams
    where id = p_team_id and organization_id = p_organization_id and is_active
  ) then
    raise exception 'Team is not part of this organization.' using errcode = '23503';
  end if;
  if exists(
    select 1
    from public.organization_memberships m
    join public.user_profiles p on p.user_id = m.user_id
    where m.organization_id = p_organization_id
      and lower(p.email) = v_email
      and m.status = 'active'
  ) then
    raise exception 'This person already has access to this organization.' using errcode = '23505';
  end if;

  update public.organization_invitations
  set status = 'expired'
  where organization_id = p_organization_id
    and lower(email) = v_email
    and status = 'pending'
    and expires_at <= now();

  if exists(
    select 1 from public.organization_invitations
    where organization_id = p_organization_id
      and lower(email) = v_email
      and status = 'pending'
  ) then
    raise exception 'A pending invitation already exists for this email.' using errcode = '23505';
  end if;

  select user_id into v_user_id
  from public.user_profiles
  where lower(email) = v_email;

  insert into public.organization_invitations(
    organization_id, email, role, invited_by_membership_id,
    invited_user_id, location_id, team_id, token_hash, requires_first_access
  ) values (
    p_organization_id, v_email, p_role, v_inviter,
    v_user_id, p_location_id, p_team_id, p_token_hash, v_user_id is null
  ) returning id into invitation_id;

  existing_user_id := v_user_id;
  requires_first_access := v_user_id is null;
  return next;
end;
$$;

create or replace function public.rotate_organization_invitation(
  p_invitation_id uuid,
  p_token_hash text
)
returns table(
  invitation_id uuid,
  email text,
  existing_user_id uuid,
  requires_first_access boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.organization_invitations%rowtype;
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'A valid invitation credential is required.' using errcode = '22023';
  end if;
  select * into v_inv
  from public.organization_invitations
  where id = p_invitation_id
  for update;
  if not found then
    raise exception 'Invitation was not found.' using errcode = 'P0002';
  end if;
  perform private.require_org_admin(v_inv.organization_id);
  if v_inv.status not in ('pending', 'expired') then
    raise exception 'This invitation cannot be resent.' using errcode = '23514';
  end if;

  update public.organization_invitations
  set status = 'pending',
      token_hash = p_token_hash,
      expires_at = now() + interval '7 days',
      delivery_status = 'pending',
      accepted_at = null,
      revoked_at = null
  where id = p_invitation_id;

  invitation_id := v_inv.id;
  email := v_inv.email;
  existing_user_id := v_inv.invited_user_id;
  requires_first_access := v_inv.requires_first_access;
  return next;
end;
$$;

drop function if exists public.accept_organization_invitation(uuid);

create function public.accept_organization_invitation(
  p_invitation_id uuid,
  p_token_hash text
)
returns table(organization_id uuid, membership_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.organization_invitations%rowtype;
  v_email text;
  v_membership_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;
  select * into v_inv
  from public.organization_invitations
  where id = p_invitation_id
  for update;
  if not found or v_inv.token_hash is null or v_inv.token_hash <> p_token_hash then
    raise exception 'This invitation is no longer valid.' using errcode = '42501';
  end if;
  if v_inv.status = 'pending' and v_inv.expires_at <= now() then
    update public.organization_invitations set status = 'expired' where id = v_inv.id;
    raise exception 'This invitation has expired.' using errcode = '42501';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'This invitation is no longer available.' using errcode = '42501';
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null or v_email <> lower(v_inv.email) then
    raise exception 'Sign in with the invited email address to join this organization.' using errcode = '42501';
  end if;

  insert into public.user_profiles(user_id, email)
  values(auth.uid(), v_email)
  on conflict(user_id) do update set email = excluded.email;

  insert into public.organization_memberships(organization_id, user_id, role, status)
  values(v_inv.organization_id, auth.uid(), v_inv.role, 'active')
  on conflict(organization_id, user_id)
  do update set role = excluded.role, status = 'active'
  returning id into v_membership_id;

  if v_inv.location_id is not null or v_inv.team_id is not null then
    update public.member_assignments
    set effective_to = now()
    where membership_id = v_membership_id and effective_to is null;
    insert into public.member_assignments(organization_id, membership_id, location_id, team_id)
    values(v_inv.organization_id, v_membership_id, v_inv.location_id, v_inv.team_id);
  end if;

  update public.organization_invitations
  set status = 'accepted', accepted_at = now(), invited_user_id = auth.uid(), token_hash = null
  where id = v_inv.id;

  organization_id := v_inv.organization_id;
  membership_id := v_membership_id;
  return next;
end;
$$;

create function public.provision_customer_organization(
  p_name text,
  p_slug text,
  p_country_code text,
  p_default_currency text,
  p_timezone text,
  p_initial_admin_email text,
  p_token_hash text,
  p_environment_type text default 'customer'
)
returns table(organization_id uuid, invitation_id uuid, existing_user_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_initial_admin_email));
begin
  if char_length(btrim(p_name)) < 2 or char_length(btrim(p_name)) > 120 then
    raise exception 'A valid organization name is required.' using errcode = '22023';
  end if;
  if p_country_code !~ '^[A-Z]{2}$'
     or p_default_currency !~ '^[A-Z]{3}$'
     or p_environment_type not in ('customer', 'test')
     or p_token_hash !~ '^[0-9a-f]{64}$'
     or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Organization provisioning details are invalid.' using errcode = '22023';
  end if;

  insert into public.organizations(
    name, slug, country_code, default_currency, timezone, environment_type
  ) values (
    btrim(p_name), p_slug, p_country_code, p_default_currency, p_timezone, p_environment_type
  ) returning id into organization_id;

  select user_id into existing_user_id
  from public.user_profiles
  where lower(email) = v_email;

  insert into public.organization_invitations(
    organization_id, email, role, invited_user_id, token_hash, requires_first_access
  ) values (
    organization_id, v_email, 'admin', existing_user_id, p_token_hash,
    existing_user_id is null
  ) returning id into invitation_id;

  return next;
end;
$$;

revoke all on function public.create_organization_invitation(
  uuid, text, public.membership_role, uuid, uuid, text
) from public;
revoke all on function public.rotate_organization_invitation(uuid, text) from public;
revoke all on function public.accept_organization_invitation(uuid, text) from public;
revoke all on function public.provision_customer_organization(
  text, text, text, text, text, text, text, text
) from public;

grant execute on function public.create_organization_invitation(
  uuid, text, public.membership_role, uuid, uuid, text
) to authenticated;
grant execute on function public.rotate_organization_invitation(uuid, text) to authenticated;
grant execute on function public.accept_organization_invitation(uuid, text) to authenticated;
grant execute on function public.provision_customer_organization(
  text, text, text, text, text, text, text, text
) to service_role;

comment on column public.organization_invitations.token_hash is
  'SHA-256 hash of the application invitation capability; raw credentials are never stored.';
comment on function public.accept_organization_invitation(uuid, text) is
  'Atomically activates email-bound membership and assignment after explicit invitation acceptance.';
