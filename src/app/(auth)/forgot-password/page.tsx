import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-card">
      <div>
        <p className="eyebrow">Account recovery</p>
        <h2>Reset your password</h2>
        <p className="auth-copy">Enter your account email and we will send you a secure reset link.</p>
      </div>
      <ForgotPasswordForm />
      <p className="auth-switch">
        Remembered your password? <Link href="/sign-in">Return to sign in</Link>.
      </p>
    </div>
  );
}
