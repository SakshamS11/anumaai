import Link from "next/link";
import type { ReactNode } from "react";
import { requirePlatformAdmin } from "@/lib/platform/authorization";
export default async function PlatformLayout({ children }: { children: ReactNode }) {
  await requirePlatformAdmin();
  return (
    <main className="platform-page">
      <header className="public-nav">
        <Link className="wordmark" href="/platform">
          ANUMA
        </Link>
        <p>Platform operations</p>
      </header>
      {children}
    </main>
  );
}
