import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="auth-layout">
      <section className="auth-introduction">
        <Link className="brand brand-dark" href="/sign-in">
          <span aria-hidden="true" className="brand-mark">
            A
          </span>
          <span>ANUMA</span>
        </Link>
        <p className="eyebrow">Frontline Interaction Intelligence</p>
        <h1>Understand the conversation that shaped the outcome.</h1>
        <p>
          ANUMA turns frontline interaction evidence into structured, reviewable business
          intelligence.
        </p>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
