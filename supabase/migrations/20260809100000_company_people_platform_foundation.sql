-- Phase 5.5: durable customer people management and invitation provenance.
-- Customer administration remains tenant-scoped. Platform provisioning is
-- authorized by server-only application code using the service role.

create type public.organization_invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null check (char_length(btrim(email)) between 3 and 320),
  display_name text check (display_name is null or char_length(btrim(display_name)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index user_profiles_email_lower_idx on public.user_profiles (lower(email));

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null check (char_length(btrim(email)) between 3 and 320),
  role public.membership_role not null,
  invited_by_membership_id uuid references public.organization_memberships(id) on delete set null,
  invited_user_id uuid references auth.users(id) on delete set null,
  location_id uuid,
  team_id uuid,
  status public.organization_invitation_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_invitations_scope_location_fk foreign key (organization_id, location_id)
    references public.locations(organization_id, id),
  constraint organization_invitations_scope_team_fk foreign key (organization_id, team_id)
    references public.teams(organization_id, id),
  constraint organization_invitations_dates_check check (
    (status = 'accepted') = (accepted_at is not null)
    and (status = 'revoked') = (revoked_at is not null)
  )
);

create unique index organization_invitations_pending_email_idx
  on public.organization_invitations(organization_id, lower(email)) where status = 'pending';
create index organization_invitations_organization_status_idx
  on public.organization_invitations(organization_id, status, created_at desc);

create trigger user_profiles_set_updated_at before update on public.user_profiles
  for each row execute function private.set_updated_at();
create trigger organization_invitations_set_updated_at before update on public.organization_invitations
  for each row execute function private.set_updated_at();

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_profiles(user_id, email, display_name)
  values (new.id, coalesce(new.email, ''), nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists auth_user_profile_created on auth.users;
create trigger auth_user_profile_created
  after insert on auth.users for each row execute function public.handle_auth_user_profile();

insert into public.user_profiles(user_id, email, display_name)
select id, email, nullif(raw_user_meta_data ->> 'full_name', '')
from auth.users where email is not null
on conflict (user_id) do update set email = excluded.email;

create or replace function private.require_org_admin(p_organization_id uuid)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_membership_id uuid;
begin
  select id into v_membership_id from public.organization_memberships
  where organization_id = p_organization_id and user_id = auth.uid()
    and role = 'admin' and status = 'active';
  if v_membership_id is null then
    raise exception 'Administrator access is required.' using errcode = '42501';
  end if;
  return v_membership_id;
end;
$$;

create or replace function public.create_organization_invitation(
  p_organization_id uuid, p_email text, p_role public.membership_role,
  p_location_id uuid default null, p_team_id uuid default null
)
returns table(invitation_id uuid, existing_user_id uuid)
language plpgsql security definer set search_path = '' as $$
declare v_inviter uuid; v_email text := lower(btrim(p_email)); v_user_id uuid;
begin
  v_inviter := private.require_org_admin(p_organization_id);
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid work email is required.' using errcode = '22023';
  end if;
  if p_location_id is not null and not exists(select 1 from public.locations where id=p_location_id and organization_id=p_organization_id and is_active) then
    raise exception 'Location is not part of this organization.' using errcode = '23503';
  end if;
  if p_team_id is not null and not exists(select 1 from public.teams where id=p_team_id and organization_id=p_organization_id and is_active) then
    raise exception 'Team is not part of this organization.' using errcode = '23503';
  end if;
  if exists(select 1 from public.organization_memberships m join auth.users u on u.id=m.user_id where m.organization_id=p_organization_id and lower(u.email)=v_email and m.status='active') then
    raise exception 'This person already has access to this organization.' using errcode = '23505';
  end if;
  update public.organization_invitations set status='expired'
    where organization_id=p_organization_id and lower(email)=v_email and status='pending' and expires_at <= now();
  if exists(select 1 from public.organization_invitations where organization_id=p_organization_id and lower(email)=v_email and status='pending') then
    raise exception 'A pending invitation already exists for this email.' using errcode = '23505';
  end if;
  select id into v_user_id from auth.users where lower(email)=v_email limit 1;
  insert into public.organization_invitations(organization_id,email,role,invited_by_membership_id,invited_user_id,location_id,team_id)
  values(p_organization_id,v_email,p_role,v_inviter,v_user_id,p_location_id,p_team_id)
  returning id into invitation_id;
  existing_user_id := v_user_id;
  return next;
end;
$$;

create or replace function public.attach_organization_invitation_user(p_invitation_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform private.require_org_admin((select organization_id from public.organization_invitations where id=p_invitation_id));
  update public.organization_invitations set invited_user_id=p_user_id where id=p_invitation_id and status='pending';
end;
$$;

create or replace function public.accept_organization_invitation(p_invitation_id uuid)
returns table(organization_id uuid, membership_id uuid)
language plpgsql security definer set search_path = '' as $$
declare v_inv public.organization_invitations%rowtype; v_email text; v_membership_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select * into v_inv from public.organization_invitations where id=p_invitation_id for update;
  if not found then raise exception 'Invitation was not found.' using errcode='P0002'; end if;
  if v_inv.status = 'pending' and v_inv.expires_at <= now() then
    update public.organization_invitations set status='expired' where id=v_inv.id;
    raise exception 'This invitation has expired.' using errcode='42501';
  end if;
  if v_inv.status <> 'pending' then raise exception 'This invitation is no longer available.' using errcode='42501'; end if;
  select lower(email) into v_email from auth.users where id=auth.uid();
  if v_email is null or v_email <> lower(v_inv.email) then raise exception 'Sign in with the invited email address to join this organization.' using errcode='42501'; end if;
  insert into public.user_profiles(user_id,email) values(auth.uid(),v_email) on conflict(user_id) do update set email=excluded.email;
  insert into public.organization_memberships(organization_id,user_id,role,status)
  values(v_inv.organization_id,auth.uid(),v_inv.role,'active')
  on conflict(organization_id,user_id) do update set role=excluded.role,status='active'
  returning id into v_membership_id;
  if v_inv.location_id is not null or v_inv.team_id is not null then
    update public.member_assignments set effective_to=now() where membership_id=v_membership_id and effective_to is null;
    insert into public.member_assignments(organization_id,membership_id,location_id,team_id)
    values(v_inv.organization_id,v_membership_id,v_inv.location_id,v_inv.team_id);
  end if;
  update public.organization_invitations set status='accepted', accepted_at=now(), invited_user_id=auth.uid() where id=v_inv.id;
  organization_id := v_inv.organization_id; membership_id := v_membership_id; return next;
end;
$$;

create or replace function public.update_organization_member(
  p_membership_id uuid, p_role public.membership_role, p_status public.membership_status,
  p_location_id uuid default null, p_team_id uuid default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare v_member public.organization_memberships%rowtype; v_actor uuid; v_admin_count integer;
begin
  select * into v_member from public.organization_memberships where id=p_membership_id for update;
  if not found then raise exception 'Member was not found.' using errcode='P0002'; end if;
  v_actor := private.require_org_admin(v_member.organization_id);
  perform 1 from public.organization_memberships where organization_id=v_member.organization_id and role='admin' and status='active' for update;
  select count(*) into v_admin_count from public.organization_memberships where organization_id=v_member.organization_id and role='admin' and status='active';
  if v_member.role='admin' and v_member.status='active' and (p_role <> 'admin' or p_status <> 'active') and v_admin_count <= 1 then
    raise exception 'Assign another administrator before removing this administrator''s access.' using errcode='23514';
  end if;
  if p_location_id is not null and not exists(select 1 from public.locations where id=p_location_id and organization_id=v_member.organization_id and is_active) then raise exception 'Location is not part of this organization.' using errcode='23503'; end if;
  if p_team_id is not null and not exists(select 1 from public.teams where id=p_team_id and organization_id=v_member.organization_id and is_active) then raise exception 'Team is not part of this organization.' using errcode='23503'; end if;
  update public.organization_memberships set role=p_role,status=p_status where id=p_membership_id;
  update public.member_assignments set effective_to=now() where membership_id=p_membership_id and effective_to is null;
  if p_status='active' and (p_location_id is not null or p_team_id is not null) then
    insert into public.member_assignments(organization_id,membership_id,location_id,team_id) values(v_member.organization_id,p_membership_id,p_location_id,p_team_id);
  end if;
end;
$$;

alter table public.user_profiles enable row level security;
alter table public.organization_invitations enable row level security;
create policy user_profiles_select_self_or_shared_org on public.user_profiles for select to authenticated using (
  user_id=auth.uid() or exists(select 1 from public.organization_memberships mine join public.organization_memberships theirs on theirs.organization_id=mine.organization_id where mine.user_id=auth.uid() and mine.role='admin' and mine.status='active' and theirs.user_id=user_profiles.user_id)
);
create policy user_profiles_update_self on public.user_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy organization_invitations_select_admin on public.organization_invitations for select to authenticated using((select private.is_org_admin(organization_id)));

revoke all on function private.require_org_admin(uuid) from public;
grant execute on function private.require_org_admin(uuid) to authenticated, service_role;
revoke all on function public.create_organization_invitation(uuid,text,public.membership_role,uuid,uuid) from public;
revoke all on function public.attach_organization_invitation_user(uuid,uuid) from public;
revoke all on function public.accept_organization_invitation(uuid) from public;
revoke all on function public.update_organization_member(uuid,public.membership_role,public.membership_status,uuid,uuid) from public;
grant execute on function public.create_organization_invitation(uuid,text,public.membership_role,uuid,uuid) to authenticated;
grant execute on function public.attach_organization_invitation_user(uuid,uuid) to authenticated;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;
grant execute on function public.update_organization_member(uuid,public.membership_role,public.membership_status,uuid,uuid) to authenticated;
