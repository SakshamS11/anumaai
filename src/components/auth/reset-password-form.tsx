"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        setMessage("This reset session is invalid or has expired. Request a new reset link.");
        return;
      }
      router.replace("/setup");
      router.refresh();
    } catch {
      setMessage("The password could not be updated. Please request a new reset link.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="form-field">
        <span>New password</span>
        <input autoComplete="new-password" minLength={8} name="password" required type="password" />
      </label>
      <label className="form-field">
        <span>Confirm new password</span>
        <input
          autoComplete="new-password"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
      </label>
      <button className="button button-primary auth-submit" disabled={pending} type="submit">
        {pending ? "Please wait..." : "Set new password"}
      </button>
      {message ? (
        <p className="auth-message auth-message-error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
