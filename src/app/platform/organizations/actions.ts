"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/platform/authorization";
import {
  createInvitationCredential,
  sendOrganizationInvitation,
} from "@/modules/identity/invitations";
import { organizationSetupSchema } from "@/modules/organizations/validation";
function slug(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "organization"
  );
}
export async function createCustomerOrganization(formData: FormData) {
  await requirePlatformAdmin();
  const input = organizationSetupSchema.safeParse({
    name: formData.get("name"),
    countryCode: formData.get("country"),
    defaultCurrency: formData.get("currency"),
    timezone: formData.get("timezone"),
  });
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const environmentType = formData.get("environment_type") === "test" ? "test" : "customer";
  if (!input.success || !/^\S+@\S+\.\S+$/.test(email))
    redirect(
      "/platform/organizations?error=Enter+an+organization+name+and+initial+administrator+email.",
    );
  const credential = createInvitationCredential();
  const admin = createAdminClient();
  const result = await (
    admin.rpc as unknown as (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>
  )("provision_customer_organization", {
    p_name: input.data.name,
    p_slug: `${slug(input.data.name)}-${crypto.randomUUID().slice(0, 8)}`,
    p_country_code: input.data.countryCode,
    p_default_currency: input.data.defaultCurrency,
    p_timezone: input.data.timezone,
    p_initial_admin_email: email,
    p_token_hash: credential.tokenHash,
    p_environment_type: environmentType,
  });
  const provisioned = (
    result.data as Array<{
      organization_id: string;
      invitation_id: string;
      existing_user_id: string | null;
    }> | null
  )?.[0];
  if (result.error || !provisioned)
    redirect("/platform/organizations?error=The+organization+could+not+be+created.");
  const delivery = await sendOrganizationInvitation({
    email,
    invitationId: provisioned.invitation_id,
    rawToken: credential.rawToken,
    existingUserId: provisioned.existing_user_id,
  });
  revalidatePath("/platform/organizations");
  redirect(
    `/platform/organizations/${provisioned.organization_id}?created=1&delivery=${delivery.error ? "failed" : "sent"}`,
  );
}

export async function resendPlatformInvitation(formData: FormData) {
  await requirePlatformAdmin();
  const invitationId = String(formData.get("invitation_id") ?? "");
  const credential = createInvitationCredential();
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("organization_invitations")
    .select("id,email,invited_user_id,status,organization_id")
    .eq("id", invitationId)
    .maybeSingle();
  if (!invitation || !["pending", "expired"].includes(invitation.status)) {
    redirect("/platform/organizations?error=This+invitation+cannot+be+resent.");
  }
  await admin
    .from("organization_invitations")
    .update({
      status: "pending",
      token_hash: credential.tokenHash,
      expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      delivery_status: "pending",
      accepted_at: null,
      revoked_at: null,
    } as never)
    .eq("id", invitationId);
  const delivery = await sendOrganizationInvitation({
    email: invitation.email,
    invitationId,
    rawToken: credential.rawToken,
    existingUserId: invitation.invited_user_id,
  });
  revalidatePath(`/platform/organizations/${invitation.organization_id}`);
  redirect(
    `/platform/organizations/${invitation.organization_id}?delivery=${delivery.error ? "failed" : "sent"}`,
  );
}
