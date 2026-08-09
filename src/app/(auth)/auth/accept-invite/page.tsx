import Link from "next/link";

export default function LegacyInvitePage() {
  return (
    <div className="auth-card">
      <p className="eyebrow">Organization invitation</p>
      <h2>A new invitation is required</h2>
      <p className="auth-copy">
        This invitation used an older access link. Ask your administrator to resend it from ANUMA.
      </p>
      <Link className="button button-secondary" href="/sign-in">
        Return to sign in
      </Link>
    </div>
  );
}
