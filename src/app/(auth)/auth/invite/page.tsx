import Link from "next/link";

import { InvitationAcceptanceForm } from "@/components/auth/invitation-acceptance-form";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashInvitationCredential } from "@/modules/identity/invitations";
import { roleLabel } from "@/modules/identity/roles";

type InviteQuery = {
  invitation?: string;
  token?: string;
  token_hash?: string;
  type?: string;
  auth_error?: "expired" | "invalid";
};

function ErrorState({ expired = false }: { expired?: boolean }) {
  return (
    <div className="auth-card">
      <p className="eyebrow">Organization invitation</p>
      <h2>{expired ? "This invitation has expired" : "This invitation is no longer valid"}</h2>
      <p className="auth-copy">
        {expired
          ? "For security, ANUMA invitations are time-limited. Ask your administrator to send a new invitation."
          : "Ask your organization administrator for a new invitation."}
      </p>
      <Link className="button button-secondary" href="/sign-in">
        Return to sign in
      </Link>
    </div>
  );
}

export default async function InvitePage({ searchParams }: { searchParams: Promise<InviteQuery> }) {
  const query = await searchParams;
  if (query.auth_error) return <ErrorState expired={query.auth_error === "expired"} />;
  if (!query.token) return <ErrorState />;

  const tokenHash = hashInvitationCredential(query.token);
  const currentUser = await getAuthenticatedUser();
  const admin = createAdminClient() as unknown as { from: (relation: string) => any };
  const { data: activeInvitation } = await admin
    .from("organization_invitations")
    .select(
      "id,email,role,status,expires_at,requires_first_access,organizations(name),locations(name),teams(name)",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();
  let invitation = activeInvitation;
  if (!invitation && query.invitation && currentUser) {
    const { data: acceptedInvitation } = await admin
      .from("organization_invitations")
      .select(
        "id,email,role,status,expires_at,requires_first_access,organizations(name),locations(name),teams(name)",
      )
      .eq("id", query.invitation)
      .eq("invited_user_id", currentUser.id)
      .eq("status", "accepted")
      .maybeSingle();
    invitation = acceptedInvitation;
  }
  if (!invitation) return <ErrorState />;
  if (invitation.status === "accepted") {
    return (
      <div className="auth-card">
        <p className="eyebrow">Organization invitation</p>
        <h2>You&apos;ve already joined {(invitation.organizations as { name: string }).name}</h2>
        <Link className="button button-primary" href="/conversations">
          Continue to ANUMA
        </Link>
      </div>
    );
  }
  if (invitation.status !== "pending") {
    return <ErrorState expired={invitation.status === "expired"} />;
  }
  const organization = (invitation.organizations as { name: string }).name;
  const scope = [
    (invitation.locations as { name: string } | null)?.name,
    (invitation.teams as { name: string } | null)?.name,
  ]
    .filter(Boolean)
    .join(" · ");
  const wrongEmail =
    currentUser?.email && currentUser.email.toLowerCase() !== invitation.email.toLowerCase();

  return (
    <div className="auth-card invite-card">
      <p className="eyebrow">Organization invitation</p>
      <h2>You&apos;ve been invited to</h2>
      <div className="invite-context">
        <strong>{organization}</strong>
        <span>{roleLabel(invitation.role)}</span>
        {scope ? <span>{scope}</span> : null}
        <small>{invitation.email}</small>
      </div>
      <p className="auth-copy">
        {invitation.role === "admin"
          ? "You'll help configure and manage this organization's ANUMA environment."
          : "This invitation gives you access to the organization and scope shown above."}
      </p>
      {wrongEmail ? (
        <div className="auth-message auth-message-error" role="alert">
          <p>This invitation was sent to {invitation.email}.</p>
          <Link href="/sign-in">Sign in with that email to continue.</Link>
        </div>
      ) : (
        <InvitationAcceptanceForm
          requiresFirstAccess={invitation.requires_first_access}
          token={query.token}
          tokenHash={query.token_hash ?? null}
          type={query.type ?? null}
        />
      )}
      <p className="auth-footnote">
        This invitation can only be used by the invited email address.
      </p>
    </div>
  );
}
