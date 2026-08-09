import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="auth-card">
      <div>
        <p className="eyebrow">Create your ANUMA workspace</p>
        <h2>Sign up to ANUMA</h2>
        <p className="auth-copy">For organizations starting a new ANUMA environment.</p>
      </div>
      {error ? (
        <p className="auth-message auth-message-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="auth-message" role="status">
          {message}
        </p>
      ) : null}
      <AuthForm mode="sign-up" />
      <p className="auth-switch">
        Already have an account? <Link href="/sign-in">Sign in</Link>.
      </p>
      <p className="auth-switch">
        <strong>Invited by your organization?</strong>
        <br />
        Use the invitation sent by your administrator.
      </p>
    </div>
  );
}
