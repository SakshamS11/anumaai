"use client";

import { useFormStatus } from "react-dom";

type AuthFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "sign-in" | "sign-up";
};

function SubmitButton({ mode }: Pick<AuthFormProps, "mode">) {
  const { pending } = useFormStatus();
  const label = mode === "sign-in" ? "Sign in" : "Create development account";

  return (
    <button className="button button-primary auth-submit" disabled={pending} type="submit">
      {pending ? "Please wait..." : label}
    </button>
  );
}

export function AuthForm({ action, mode }: AuthFormProps) {
  return (
    <form action={action} className="auth-form">
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
      <SubmitButton mode={mode} />
    </form>
  );
}
