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
        <h2>Start a new organization</h2>
        <p className="auth-copy">
          For organizations starting a new ANUMA environment. Invited people should use the access
          email sent by their administrator.
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
