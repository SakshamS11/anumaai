import { PasswordInput } from "@/components/auth/password-input";

export function ResetPasswordForm() {
  return (
    <form action="/auth/reset-password" className="auth-form" method="post">
      <div className="form-field">
        <label htmlFor="new-password">New password</label>
        <PasswordInput autoComplete="new-password" id="new-password" />
      </div>
      <div className="form-field">
        <label htmlFor="confirm-password">Confirm new password</label>
        <PasswordInput autoComplete="new-password" id="confirm-password" name="confirmPassword" />
      </div>
      <button className="button button-primary auth-submit" type="submit">
        Set new password
      </button>
    </form>
  );
}
