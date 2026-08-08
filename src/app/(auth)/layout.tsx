import Link from "next/link";
import type { ReactNode } from "react";

import { EvidenceExplainer } from "@/components/auth/evidence-explainer";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="auth-layout">
      <header className="auth-brandbar">
        <Link className="wordmark" href="/sign-in">
          ANUMA
        </Link>
        <p>Frontline Interaction Intelligence</p>
      </header>
      <section className="auth-composition">
        <div className="auth-message-block">
          <p className="eyebrow">Evidence-backed intelligence</p>
          <h1>Frontline conversations, made measurable.</h1>
          <p>
            ANUMA turns real customer interactions into structured, evidence-backed business
            intelligence.
          </p>
          <EvidenceExplainer />
        </div>
        <section className="auth-panel">{children}</section>
      </section>
    </main>
  );
}
