import Link from "next/link";
import type { ReactNode } from "react";

import { signOutPlatform } from "@/app/platform/actions";
import { requirePlatformAdmin } from "@/lib/platform/authorization";
import { getApplicationContext } from "@/modules/identity/application-context";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const [user, context] = await Promise.all([requirePlatformAdmin(), getApplicationContext()]);
  const backHref = context?.current ? "/conversations" : "/";
  const backLabel = context?.current
    ? `Back to ${context.current.organization.name}`
    : "Back to ANUMA";
  return (
    <div className="platform-frame">
      <aside className="platform-sidebar">
        <Link className="wordmark wordmark-inverse" href="/platform">
          ANUMA <small>/ Platform</small>
        </Link>
        <nav aria-label="Platform navigation">
          <Link href="/platform">Overview</Link>
          <Link href="/platform/organizations">Organizations</Link>
        </nav>
        <div>
          <Link href={backHref}>← {backLabel}</Link>
          <small>{user.email}</small>
          <form action={signOutPlatform}>
            <button className="button button-quiet" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="platform-page">{children}</main>
    </div>
  );
}
