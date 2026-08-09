"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createInvitationCredential,
  sendOrganizationInvitation,
} from "@/modules/identity/invitations";
import { getApplicationContext } from "@/modules/identity/application-context";

async function adminContext() {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin")
    redirect("/administration?error=Administrator+access+is+required.");
  return context.current;
}
type UntypedClient = {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};
export async function invitePerson(formData: FormData) {
  const current = await adminContext();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "representative");
  const locationId = String(formData.get("location_id") ?? "") || null;
  const teamId = String(formData.get("team_id") ?? "") || null;
  const credential = createInvitationCredential();
  const supabase = await createClient();
  const result = await (supabase as unknown as UntypedClient).rpc(
    "create_organization_invitation",
    {
      p_organization_id: current.organization.id,
      p_email: email,
      p_role: role,
      p_location_id: locationId,
      p_team_id: teamId,
      p_token_hash: credential.tokenHash,
    },
  );
  if (result.error)
    redirect(`/administration/people?error=${encodeURIComponent(result.error.message)}`);
  const invitation = (
    result.data as Array<{
      invitation_id: string;
      existing_user_id: string | null;
      requires_first_access: boolean;
    }>
  )[0];
  if (!invitation) redirect("/administration/people?error=The+invitation+could+not+be+created.");
  const delivery = await sendOrganizationInvitation({
    email,
    invitationId: invitation.invitation_id,
    rawToken: credential.rawToken,
    existingUserId: invitation.existing_user_id,
  });
  if (delivery.error) {
    redirect(
      "/administration/people?error=The+invitation+was+saved+but+the+email+could+not+be+sent.+Use+Resend+to+try+again.",
    );
  }
  revalidatePath("/administration/people");
  redirect("/administration/people?created=invite");
}

export async function resendInvitation(formData: FormData) {
  await adminContext();
  const invitationId = String(formData.get("invitation_id") ?? "");
  const credential = createInvitationCredential();
  const supabase = await createClient();
  const result = await (supabase as unknown as UntypedClient).rpc(
    "rotate_organization_invitation",
    { p_invitation_id: invitationId, p_token_hash: credential.tokenHash },
  );
  if (result.error) {
    redirect("/administration/people?error=This+invitation+could+not+be+resent.");
  }
  const invitation = (
    result.data as Array<{
      invitation_id: string;
      email: string;
      existing_user_id: string | null;
    }>
  )[0];
  if (!invitation) redirect("/administration/people?error=This+invitation+could+not+be+resent.");
  const delivery = await sendOrganizationInvitation({
    email: invitation.email,
    invitationId: invitation.invitation_id,
    rawToken: credential.rawToken,
    existingUserId: invitation.existing_user_id,
  });
  if (delivery.error) {
    redirect("/administration/people?error=The+invitation+email+could+not+be+sent.");
  }
  revalidatePath("/administration/people");
  redirect("/administration/people?created=resent");
}
export async function updateMember(formData: FormData) {
  const current = await adminContext();
  const supabase = await createClient();
  const result = await (supabase as unknown as UntypedClient).rpc("update_organization_member", {
    p_membership_id: String(formData.get("membership_id")),
    p_role: String(formData.get("role")),
    p_status: String(formData.get("status")),
    p_location_id: String(formData.get("location_id") ?? "") || null,
    p_team_id: String(formData.get("team_id") ?? "") || null,
  });
  if (result.error)
    redirect(`/administration/people?error=${encodeURIComponent(result.error.message)}`);
  revalidatePath("/administration/people");
  redirect("/administration/people?created=member");
}
