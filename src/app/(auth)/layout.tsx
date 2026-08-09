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
        <section className="auth-panel">{children}</section>
      </section>
    </main>
  );
}
