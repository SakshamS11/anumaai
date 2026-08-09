"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export function PasswordRecoveryForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setMessage(
      error
        ? "We could not send a recovery email. Please try again."
        : "Check your email for a secure recovery link.",
    );
    setPending(false);
  }
  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="form-field">
        <span>Email address</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Sending…" : "Send recovery link"}
      </button>
      {message ? (
        <p className="auth-message" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
