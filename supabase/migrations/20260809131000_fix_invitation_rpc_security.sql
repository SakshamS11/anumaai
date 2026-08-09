-- Organization invitations are intentionally not directly writable through RLS.
-- The RPC performs the admin, tenant, scope, email, and token checks before insert.

alter function public.create_organization_invitation(
  uuid, text, public.membership_role, uuid, uuid, text
) security definer;

comment on function public.create_organization_invitation(
  uuid, text, public.membership_role, uuid, uuid, text
) is 'Creates an email-bound organization invitation after server-enforced admin and tenant validation.';
