"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { applicationRoutes } from "@/modules/application/routes";
import { developmentContext } from "@/modules/identity/future-boundaries";

type AppShellProps = {
  children: ReactNode;
  signOut: () => Promise<void>;
  userEmail: string | null;
};

export function AppShell({ children, signOut, userEmail }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link className="brand" href="/conversations">
          <span aria-hidden="true" className="brand-mark">
            A
          </span>
          <span>ANUMA</span>
        </Link>
        <p className="sidebar-kicker">Frontline Interaction Intelligence</p>
        <nav aria-label="Primary navigation" className="primary-navigation">
          {applicationRoutes.map((route) => {
            const active = pathname === route.href;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "nav-link nav-link-active" : "nav-link"}
                href={route.href}
                key={route.href}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="context-dot" aria-hidden="true" />
          <span>{developmentContext.label}</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="context-label">{developmentContext.label}</p>
            <p className="context-copy">{developmentContext.description}</p>
          </div>
          <details className="user-menu">
            <summary aria-label="Open user menu">{userEmail ?? "Authenticated user"}</summary>
            <div className="user-menu-panel">
              <p>{userEmail ?? "Authenticated user"}</p>
              <form action={signOut}>
                <button className="button button-quiet" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </header>
        <nav aria-label="Primary navigation on small screens" className="mobile-navigation">
          {applicationRoutes.map((route) => {
            const active = pathname === route.href;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "mobile-nav-link mobile-nav-link-active" : "mobile-nav-link"}
                href={route.href}
                key={route.href}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
