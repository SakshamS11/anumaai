import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { signUp } from "@/app/(auth)/actions";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="auth-card">
      <div>
        <p className="eyebrow">Development access</p>
        <h2>Create your ANUMA account</h2>
        <p className="auth-copy">
          This creates a real Supabase email/password account for development use.
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
      <AuthForm action={signUp} mode="sign-up" />
      <p className="auth-switch">
        Already have an account? <Link href="/sign-in">Sign in</Link>.
      </p>
    </div>
  );
}
