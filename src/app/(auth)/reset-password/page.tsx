import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="auth-card">
      <div>
        <p className="eyebrow">Account recovery</p>
        <h2>Choose a new password</h2>
        <p className="auth-copy">Set a new password for your confirmed ANUMA account.</p>
      </div>
      <ResetPasswordForm />
      <p className="auth-switch">
        Need a new link? <Link href="/forgot-password">Request another reset</Link>.
      </p>
    </div>
  );
}
