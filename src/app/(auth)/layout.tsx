import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="auth-layout">
      <header className="auth-brandbar">
        <Link className="wordmark" href="/">
          ANUMA
        </Link>
        <p>Evidence operating system for frontline interactions</p>
      </header>
      <section className="auth-composition">
        <aside className="auth-visual" aria-label="ANUMA evidence illustration">
          <p className="eyebrow">Evidence operating system</p>
          <h1>From what was said to what it means.</h1>
          <p>
            ANUMA structures frontline interaction signals while keeping each material finding
            connected to its source evidence.
          </p>
          <div className="auth-trace" aria-hidden="true">
            <span>“Budget around ₹80,000 hai.”</span>
            <i />
            <strong>
              Budget
              <br />
              ₹80,000
            </strong>
          </div>
        </aside>
        <section className="auth-panel">{children}</section>
      </section>
    </main>
  );
}
