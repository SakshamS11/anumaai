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
        <p className="eyebrow">Organization access</p>
        <h2>Sign up to ANUMA</h2>
        <p className="auth-copy">
          Create a new organization workspace. If your organization invited you, use the invitation
          sent by your administrator.
        </p>
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
    </div>
  );
}
