import Link from "next/link";
import { notFound } from "next/navigation";

import { resendPlatformInvitation } from "@/app/platform/organizations/actions";
import { createAdminClient } from "@/lib/supabase/admin";

const countryNames: Record<string, string> = { IN: "India", AE: "United Arab Emirates" };

export default async function PlatformOrganizationPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ created?: string; delivery?: string }>;
}) {
  const [{ organizationId }, message] = await Promise.all([params, searchParams]);
  const admin = createAdminClient() as unknown as { from: (relation: string) => any };
  const [
    { data: organization },
    { data: members },
    { data: invitations },
    { data: locations },
    { data: teams },
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("id,name,country_code,default_currency,timezone,created_at,environment_type")
      .eq("id", organizationId)
      .maybeSingle(),
    admin
      .from("organization_memberships")
      .select("id,role,status")
      .eq("organization_id", organizationId),
    admin
      .from("organization_invitations")
      .select("id,email,role,status,expires_at,delivery_status,last_sent_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    admin.from("locations").select("id,name,is_active").eq("organization_id", organizationId),
    admin.from("teams").select("id,name,is_active").eq("organization_id", organizationId),
  ]);
  if (!organization) notFound();
  const activeMembers = members?.filter((member: any) => member.status === "active") ?? [];
  const adminJoined = activeMembers.some((member: any) => member.role === "admin");
  const pendingAdmin = invitations?.find(
    (invitation: any) =>
      invitation.role === "admin" && ["pending", "expired"].includes(invitation.status),
  );
  const activeLocations = locations?.filter((location: any) => location.is_active) ?? [];
  const activeTeams = teams?.filter((team: any) => team.is_active) ?? [];
  const representativeReady = activeMembers.some((member: any) => member.role === "representative");
  const state =
    adminJoined && activeLocations.length && activeTeams.length
      ? "Active"
      : pendingAdmin
        ? "Setup in progress"
        : "Needs attention";
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/platform">Platform</Link>
        <span>/</span>
        <Link href="/platform/organizations">Organizations</Link>
        <span>/</span>
        <span>{organization.name}</span>
      </nav>
      <section className="platform-header">
        <p className="eyebrow">{state}</p>
        <h1>{organization.name}</h1>
        <p>
          {countryNames[organization.country_code] ?? organization.country_code} ·{" "}
          {organization.default_currency} · {organization.timezone} · Created{" "}
          {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
            new Date(organization.created_at),
          )}
        </p>
      </section>
      {message.created ? (
        <p className="auth-message" role="status">
          {organization.name} created.
        </p>
      ) : null}
      {message.delivery === "sent" ? (
        <p className="auth-message" role="status">
          Administrator invitation sent.
        </p>
      ) : null}
      {message.delivery === "failed" ? (
        <p className="auth-message auth-message-error" role="alert">
          Administrator invitation not sent. Retry the invitation below.
        </p>
      ) : null}
      <section className="platform-detail-grid">
        <article className="product-panel">
          <p className="eyebrow">Setup readiness</p>
          <h2>Customer onboarding</h2>
          <div className="readiness-list">
            <p>✓ Organization created</p>
            <p>
              {pendingAdmin?.delivery_status === "sent" || adminJoined ? "✓" : "○"} Administrator
              invitation sent
            </p>
            <p>{adminJoined ? "✓" : "○"} Administrator joined</p>
            <p>{activeLocations.length ? "✓" : "○"} First location configured</p>
            <p>{activeTeams.length ? "✓" : "○"} First team configured</p>
            <p>{representativeReady ? "✓" : "○"} First representative joined</p>
          </div>
        </article>
        <article className="product-panel">
          <p className="eyebrow">Administrator invitation</p>
          {pendingAdmin ? (
            <>
              <h2>{pendingAdmin.email}</h2>
              <p>
                {pendingAdmin.status === "expired"
                  ? "Expired"
                  : pendingAdmin.delivery_status === "failed"
                    ? "Needs attention"
                    : "Pending"}
              </p>
              <form action={resendPlatformInvitation}>
                <input name="invitation_id" type="hidden" value={pendingAdmin.id} />
                <button className="button button-secondary" type="submit">
                  Resend invitation
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>{adminJoined ? "Administrator active" : "No pending invitation"}</h2>
              <p>
                {adminJoined
                  ? "The customer administrator has joined."
                  : "Provisioning needs attention."}
              </p>
            </>
          )}
        </article>
      </section>
      <section className="platform-detail-grid">
        <article className="product-panel">
          <p className="eyebrow">People</p>
          <h2>{activeMembers.length} active</h2>
          <p>
            {invitations?.filter((invite: any) => invite.status === "pending").length ?? 0} pending
            invitation(s)
          </p>
        </article>
        <article className="product-panel">
          <p className="eyebrow">Structure</p>
          <h2>
            {activeLocations.length} locations · {activeTeams.length} teams
          </h2>
          <p>Support view only. Customer administrators manage their own structure.</p>
        </article>
      </section>
    </>
  );
}
