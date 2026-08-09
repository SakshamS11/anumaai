"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const result = await (supabase as unknown as UntypedClient).rpc(
    "create_organization_invitation",
    {
      p_organization_id: current.organization.id,
      p_email: email,
      p_role: role,
      p_location_id: locationId,
      p_team_id: teamId,
    },
  );
  if (result.error)
    redirect(`/administration/people?error=${encodeURIComponent(result.error.message)}`);
  const invitation = (
    result.data as Array<{ invitation_id: string; existing_user_id: string | null }>
  )[0];
  if (!invitation?.existing_user_id) {
    try {
      const admin = createAdminClient();
      const invite = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/auth/accept-invite?invitation=${invitation.invitation_id}`,
      });
      if (invite.error) throw invite.error;
      await (supabase as unknown as UntypedClient).rpc("attach_organization_invitation_user", {
        p_invitation_id: invitation.invitation_id,
        p_user_id: invite.data.user.id,
      });
    } catch {
      redirect(
        "/administration/people?error=The+invitation+was+saved+but+the+access+email+could+not+be+sent.+Please+try+again.",
      );
    }
  }
  revalidatePath("/administration/people");
  redirect("/administration/people?created=invite");
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
