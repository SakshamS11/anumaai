import { createHash, randomBytes } from "node:crypto";
import "server-only";

import type { EmailOtpType } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

export type InvitationEmailInput = {
  email: string;
  invitationId: string;
  rawToken: string;
  existingUserId: string | null;
};

export function createInvitationCredential() {
  const rawToken = randomBytes(32).toString("base64url");
  return { rawToken, tokenHash: hashInvitationCredential(rawToken) };
}

export function hashInvitationCredential(rawToken: string) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function invitationSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured ? configured.replace(/\/$/, "") : "http://localhost:3000";
}

export async function sendOrganizationInvitation(input: InvitationEmailInput) {
  const admin = createAdminClient();
  const redirectTo = `${invitationSiteUrl()}/auth/invite?invitation=${encodeURIComponent(input.invitationId)}&token=${encodeURIComponent(input.rawToken)}`;
  let invitedUserId = input.existingUserId;
  let error: { message: string } | null = null;

  if (input.existingUserId) {
    const result = await admin.auth.signInWithOtp({
      email: input.email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });
    error = result.error;
  } else {
    const result = await admin.auth.admin.inviteUserByEmail(input.email, {
      redirectTo,
      data: { anuma_invitation_id: input.invitationId },
    });
    error = result.error;
    invitedUserId = result.data.user?.id ?? null;
  }

  const { data: currentInvitation } = await admin
    .from("organization_invitations")
    .select("send_attempt_count")
    .eq("id", input.invitationId)
    .maybeSingle();
  await admin
    .from("organization_invitations")
    .update({
      delivery_status: error ? "failed" : "sent",
      invited_user_id: invitedUserId,
      last_sent_at: error ? null : new Date().toISOString(),
      send_attempt_count: (currentInvitation?.send_attempt_count ?? 0) + 1,
    } as never)
    .eq("id", input.invitationId);

  return { error, invitedUserId };
}

export function parseInvitationOtpType(value: string | null): EmailOtpType | null {
  return value === "invite" || value === "magiclink" ? value : null;
}

export function safeInvitationMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("expired")) return "This invitation has expired.";
  if (normalized.includes("invited email") || normalized.includes("sign in with")) {
    return "Sign in with the email address that received this invitation.";
  }
  if (normalized.includes("already") || normalized.includes("no longer available")) {
    return "This invitation is no longer valid.";
  }
  return "The invitation could not be accepted. Please request a new invitation.";
}
