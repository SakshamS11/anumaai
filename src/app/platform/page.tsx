import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";

export default async function PlatformPage() {
  const admin = createAdminClient();
  const [{ count: organizations }, { count: members }, { count: locations }, { count: pending }] =
    await Promise.all([
      admin.from("organizations").select("*", { count: "exact", head: true }),
      admin
        .from("organization_memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      admin.from("locations").select("*", { count: "exact", head: true }).eq("is_active", true),
      admin
        .from("organization_invitations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);
  return (
    <>
      <section className="platform-header">
        <p className="eyebrow">ANUMA internal</p>
        <h1>ANUMA Platform</h1>
        <p>Manage customer organizations and keep onboarding moving.</p>
      </section>
      <section className="platform-metrics" aria-label="Platform foundation counts">
        <p>
          <span>Organizations</span>
          <strong>{organizations ?? 0}</strong>
        </p>
        <p>
          <span>Active members</span>
          <strong>{members ?? 0}</strong>
        </p>
        <p>
          <span>Locations</span>
          <strong>{locations ?? 0}</strong>
        </p>
        <p>
          <span>Pending invitations</span>
          <strong>{pending ?? 0}</strong>
        </p>
      </section>
      <section className="platform-next">
        <div>
          <p className="eyebrow">Customer environments</p>
          <h2>Provision and support organizations.</h2>
          <p>Track setup progress without entering or impersonating a customer account.</p>
        </div>
        <Link className="button button-primary" href="/platform/organizations">
          View organizations
        </Link>
      </section>
    </>
  );
}
