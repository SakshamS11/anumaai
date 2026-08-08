"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setMessage(null);
    setPending(true);

    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        setMessage("We could not send the reset email right now. Please try again shortly.");
        return;
      }
      setMessage("If an ANUMA account exists for this email, a password reset link has been sent.");
    } catch {
      setMessage("Password recovery is temporarily unavailable. Please try again shortly.");
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
      <button className="button button-primary auth-submit" disabled={pending} type="submit">
        {pending ? "Please wait..." : "Send reset link"}
      </button>
      {message ? (
        <p className="auth-message" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
