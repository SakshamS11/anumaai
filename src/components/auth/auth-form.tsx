import { PasswordInput } from "@/components/auth/password-input";

type AuthFormProps = { mode: "sign-in" | "sign-up" };

export function AuthForm({ mode }: AuthFormProps) {
  const label = mode === "sign-in" ? "Sign in" : "Sign up";
  const action = mode === "sign-in" ? "/auth/sign-in" : "/auth/sign-up";

  return (
    <form action={action} className="auth-form" method="post">
      <label className="form-field">
        <span>Work email</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label className="form-field" htmlFor="password">
        <span>Password</span>
        <PasswordInput autoComplete={mode === "sign-in" ? "current-password" : "new-password"} />
      </label>
      <button className="button button-primary auth-submit" type="submit">
        {label}
      </button>
    </form>
  );
}
