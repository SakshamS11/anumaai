import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getApplicationContext } from "@/modules/identity/application-context";
import { AdminNavigation } from "@/components/administration/admin-navigation";

const sections = [
  ["People", "Manage access, roles and operating scope.", "/administration/people"],
  ["Structure", "Set up locations and frontline teams.", "/administration/structure"],
  ["Checks", "Set the interaction expectations that matter.", "/administration/checks"],
  ["Settings", "Review organization defaults and display context.", "/administration/settings"],
] as const;
export default async function AdministrationPage() {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") redirect("/conversations");
  const current = context.current;
  const supabase = await createClient();
  const [{ count: people }, { count: checks }] = await Promise.all([
    supabase
      .from("organization_memberships")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", current.organization.id),
    supabase
      .from("check_definitions")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", current.organization.id)
      .eq("active", true),
  ]);
  return (
    <>
      <PageHeader eyebrow="Organization foundation" title="Administration" />
      <p className="section-copy">Is your ANUMA organization ready for frontline interactions?</p>
      <AdminNavigation />
      <section className="directory-summary">
        <span>People {people ?? 0}</span>
        <span>Locations {current.locations.length}</span>
        <span>Teams {current.teams.length}</span>
        <span>Checks {checks ?? 0}</span>
      </section>
      <section className="readiness-list">
        <p>✓ Organization created</p>
        <p>
          {current.locations.length ? "✓" : "○"} {current.locations.length || "No"} location
          {current.locations.length === 1 ? "" : "s"} configured
        </p>
        <p>
          {current.teams.length ? "✓" : "○"} {current.teams.length || "No"} team
          {current.teams.length === 1 ? "" : "s"} configured
        </p>
        <p>{people && people > 1 ? "✓" : "○"} Invite your first representative</p>
      </section>
      <section className="admin-section-links">
        {sections.map(([title, copy, href]) => (
          <Link href={href} key={href}>
            <strong>{title}</strong>
            <span>{copy}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
