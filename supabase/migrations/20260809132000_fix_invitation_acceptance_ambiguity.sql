-- Qualify membership and assignment references so PL/pgSQL output columns do
-- not conflict with table columns during explicit invitation acceptance.

create or replace function public.accept_organization_invitation(
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
  select invitation.* into v_inv
  from public.organization_invitations as invitation
  where invitation.id = p_invitation_id
  for update;
  if not found or v_inv.token_hash is null or v_inv.token_hash <> p_token_hash then
    raise exception 'This invitation is no longer valid.' using errcode = '42501';
  end if;
  if v_inv.status = 'pending' and v_inv.expires_at <= now() then
    update public.organization_invitations as invitation
    set status = 'expired'
    where invitation.id = v_inv.id;
    raise exception 'This invitation has expired.' using errcode = '42501';
  end if;
  if v_inv.status <> 'pending' then
    raise exception 'This invitation is no longer available.' using errcode = '42501';
  end if;
  select lower(auth_user.email) into v_email
  from auth.users as auth_user
  where auth_user.id = auth.uid();
  if v_email is null or v_email <> lower(v_inv.email) then
    raise exception 'Sign in with the invited email address to join this organization.' using errcode = '42501';
  end if;

  insert into public.user_profiles(user_id, email)
  values(auth.uid(), v_email)
  on conflict on constraint user_profiles_pkey
  do update set email = excluded.email;

  insert into public.organization_memberships(organization_id, user_id, role, status)
  values(v_inv.organization_id, auth.uid(), v_inv.role, 'active')
  on conflict on constraint organization_memberships_organization_id_user_id_key
  do update set role = excluded.role, status = 'active'
  returning organization_memberships.id into v_membership_id;

  if v_inv.location_id is not null or v_inv.team_id is not null then
    update public.member_assignments as assignment
    set effective_to = now()
    where assignment.membership_id = v_membership_id and assignment.effective_to is null;
    insert into public.member_assignments(organization_id, membership_id, location_id, team_id)
    values(v_inv.organization_id, v_membership_id, v_inv.location_id, v_inv.team_id);
  end if;

  update public.organization_invitations as invitation
  set status = 'accepted', accepted_at = now(), invited_user_id = auth.uid(), token_hash = null
  where invitation.id = v_inv.id;

  organization_id := v_inv.organization_id;
  membership_id := v_membership_id;
  return next;
end;
$$;

revoke all on function public.accept_organization_invitation(uuid, text) from public;
grant execute on function public.accept_organization_invitation(uuid, text) to authenticated;
