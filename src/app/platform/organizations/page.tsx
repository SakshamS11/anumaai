import Link from "next/link";

import { NewOrganizationDialog } from "@/components/platform/new-organization-dialog";
import { createAdminClient } from "@/lib/supabase/admin";

const countryNames: Record<string, string> = { IN: "India", AE: "United Arab Emirates" };

export default async function PlatformOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string; include_test?: string }>;
}) {
  const query = await searchParams;
  const admin = createAdminClient() as unknown as { from: (relation: string) => any };
  let organizationQuery = admin
    .from("organizations")
    .select("id,name,country_code,default_currency,timezone,created_at,environment_type")
    .order("created_at", { ascending: false });
  if (query.q?.trim()) organizationQuery = organizationQuery.ilike("name", `%${query.q.trim()}%`);
  if (query.include_test !== "1")
    organizationQuery = organizationQuery.eq("environment_type", "customer");
  const [
    { data: organizations },
    { data: memberships },
    { data: locations },
    { data: invitations },
  ] = await Promise.all([
    organizationQuery,
    admin.from("organization_memberships").select("organization_id,status"),
    admin.from("locations").select("organization_id,is_active"),
    admin.from("organization_invitations").select("organization_id,status"),
  ]);
  const count = (
    rows: Array<{ organization_id: string; status?: string; is_active?: boolean }> | null,
    id: string,
    predicate?: (row: any) => boolean,
  ) =>
    rows?.filter((row) => row.organization_id === id && (!predicate || predicate(row))).length ?? 0;
  return (
    <>
      <section className="platform-header platform-header-row">
        <div>
          <p className="eyebrow">Customer environments</p>
          <h1>Organizations</h1>
          <p>Manage customer organizations and track their setup.</p>
        </div>
        <NewOrganizationDialog />
      </section>
      {query.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {query.error}
        </p>
      ) : null}
      <form className="directory-filters" method="get">
        <label className="form-field">
          <span>Search</span>
          <input defaultValue={query.q ?? ""} name="q" type="search" />
        </label>
        <label className="filter-check">
          <input
            defaultChecked={query.include_test === "1"}
            name="include_test"
            type="checkbox"
            value="1"
          />{" "}
          Include test environments
        </label>
        <button className="button button-secondary" type="submit">
          Apply
        </button>
      </form>
      <section className="product-panel platform-directory">
        <div className="directory-table" role="table" aria-label="Organizations">
          <div className="directory-row directory-head" role="row">
            <span>Organization</span>
            <span>Setup status</span>
            <span>People</span>
            <span>Locations</span>
            <span>Created</span>
          </div>
          {organizations?.map((organization: any) => {
            const people = count(memberships, organization.id, (row) => row.status === "active");
            const locationCount = count(locations, organization.id, (row) => row.is_active);
            const pending = count(invitations, organization.id, (row) => row.status === "pending");
            const setup =
              people && locationCount
                ? "Active"
                : pending
                  ? "Setup in progress"
                  : "Needs attention";
            return (
              <Link
                className="directory-row"
                href={`/platform/organizations/${organization.id}`}
                key={organization.id}
                role="row"
              >
                <span>
                  <strong>{organization.name}</strong>
                  <small>
                    {countryNames[organization.country_code] ?? organization.country_code} ·{" "}
                    {organization.default_currency}
                    {organization.environment_type === "test" ? " · Test" : ""}
                  </small>
                </span>
                <span>{setup}</span>
                <span>{people}</span>
                <span>{locationCount}</span>
                <span>
                  {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                    new Date(organization.created_at),
                  )}
                </span>
              </Link>
            );
          })}
        </div>
        {!organizations?.length ? (
          <div className="editorial-empty">
            <h2>No matching organizations</h2>
            <p>Change the search or include test environments.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
