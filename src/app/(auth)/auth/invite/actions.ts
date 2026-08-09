"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { organizationCookieName } from "@/modules/identity/application-context";
import {
  hashInvitationCredential,
  parseInvitationOtpType,
  safeInvitationMessage,
} from "@/modules/identity/invitations";

export type AcceptInvitationState = { error: string | null };

export async function acceptInvitation(
  _state: AcceptInvitationState,
  formData: FormData,
): Promise<AcceptInvitationState> {
  const rawToken = String(formData.get("token") ?? "");
  const authTokenHash = String(formData.get("token_hash") ?? "");
  const otpType = parseInvitationOtpType(String(formData.get("type") ?? ""));
  const displayName = String(formData.get("display_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!rawToken) return { error: "This invitation is no longer valid." };

  const tokenHash = hashInvitationCredential(rawToken);
  const admin = createAdminClient() as unknown as { from: (relation: string) => any };
  const { data: invitation } = await admin
    .from("organization_invitations")
    .select("id,email,status,expires_at,requires_first_access")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!invitation) return { error: "This invitation is no longer valid." };
  if (invitation.status !== "pending") {
    return {
      error:
        invitation.status === "accepted"
          ? "You have already joined this organization."
          : "This invitation is no longer valid.",
    };
  }
  if (Date.parse(invitation.expires_at) <= Date.now()) {
    return { error: "This invitation has expired." };
  }
  if (invitation.requires_first_access && (displayName.length < 2 || password.length < 8)) {
    return { error: "Enter your name and a password of at least 8 characters." };
  }

  const supabase = await createClient();
  if (authTokenHash && otpType) {
    const verification = await supabase.auth.verifyOtp({
      token_hash: authTokenHash,
      type: otpType,
    });
    if (verification.error) return { error: "This invitation has expired." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Sign in with the invited email address to continue." };
  if (user.email.toLowerCase() !== String(invitation.email).toLowerCase()) {
    return { error: `Sign in with ${invitation.email} to continue.` };
  }

  if (invitation.requires_first_access) {
    const updated = await supabase.auth.updateUser({
      password,
      data: { full_name: displayName },
    });
    if (updated.error) return { error: "Your account could not be completed. Please try again." };
    await supabase
      .from("user_profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
  }

  const result = await (
    supabase.rpc as unknown as (
      name: string,
      args: Record<string, string>,
    ) => Promise<{
      data: Array<{ organization_id: string }> | null;
      error: { message: string } | null;
    }>
  )("accept_organization_invitation", {
    p_invitation_id: invitation.id,
    p_token_hash: tokenHash,
  });
  if (result.error) return { error: safeInvitationMessage(result.error.message) };
  const organizationId = result.data?.[0]?.organization_id;
  if (!organizationId) return { error: "The organization could not be joined. Please try again." };
  (await cookies()).set(organizationCookieName, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/conversations?joined=1");
}
