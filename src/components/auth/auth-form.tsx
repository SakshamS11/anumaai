"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const label = mode === "sign-in" ? "Sign in" : "Create account";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    setMessage(null);
    setPending(true);

    try {
      const supabase = createClient();
      const result =
        mode === "sign-in"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/setup`,
              },
            });

      if (result.error) {
        setMessage(
          mode === "sign-in"
            ? "We could not sign you in. Check your details or reset your password."
            : "We could not create your account. Please try again.",
        );
        return;
      }
      if (mode === "sign-up" && !result.data.session) {
        setMessage("Check your email to confirm your account.");
        return;
      }

      // The root route resolves the fresh server-side organization context. This
      // avoids racing a first account through an application-only destination.
      router.replace(mode === "sign-up" ? "/setup" : "/");
      router.refresh();
    } catch {
      setMessage("Authentication is temporarily unavailable. Please try again shortly.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="form-field">
        <span>Email address</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label className="form-field">
        <span>Password</span>
        <input
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      <button className="button button-primary auth-submit" disabled={pending} type="submit">
        {pending ? "Please wait..." : label}
      </button>
      {message ? (
        <p className="auth-message auth-message-error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
