import Link from "next/link";

export function AdminNavigation() {
  return (
    <nav className="admin-subnav" aria-label="Administration">
      <Link href="/administration">Overview</Link>
      <Link href="/administration/people">People</Link>
      <Link href="/administration/structure">Structure</Link>
      <Link href="/administration/checks">Checks</Link>
      <Link href="/administration/settings">Settings</Link>
    </nav>
  );
}
