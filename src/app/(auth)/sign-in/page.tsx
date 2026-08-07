import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { signIn } from "@/app/(auth)/actions";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="auth-card">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to ANUMA</h2>
        <p className="auth-copy">
          Use your development account to enter the application foundation.
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
      <AuthForm action={signIn} mode="sign-in" />
      <p className="auth-switch">
        New to ANUMA? <Link href="/sign-up">Create a development account</Link>.
      </p>
    </div>
  );
}
