import { redirect } from "next/navigation";

import { createLocation, createTeam } from "@/app/(app)/administration/actions";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getApplicationContext } from "@/modules/identity/application-context";
import { roleLabel } from "@/modules/identity/roles";

type AdministrationPageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

export default async function AdministrationPage({ searchParams }: AdministrationPageProps) {
  const [context, message] = await Promise.all([getApplicationContext(), searchParams]);
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");

  const { organization, membership, locations, teams } = context.current;
  const isAdmin = membership.role === "admin";

  return (
    <>
      <PageHeader eyebrow="Organization foundation" title="Administration" />
      {message.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {message.error}
        </p>
      ) : null}
      {message.created ? (
        <p className="auth-message" role="status">
          Saved to {organization.name}.
        </p>
      ) : null}

      <section className="summary-grid" aria-label="Organization summary">
        <article className="summary-card summary-card-primary">
          <p className="eyebrow">Organization</p>
          <h2>{organization.name}</h2>
          <p>
            {organization.countryCode} · {organization.defaultCurrency} · {organization.timezone}
          </p>
        </article>
        <article className="summary-card">
          <p className="eyebrow">Your access</p>
          <h2>{roleLabel(membership.role)}</h2>
          <StatusBadge label="Active membership" tone="verified" />
        </article>
      </section>

      <div className="administration-grid">
        <section className="product-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Physical context</p>
              <h2>Locations</h2>
            </div>
            <span className="count-label">{locations.length}</span>
          </div>
          {locations.length ? (
            <ul className="record-list">
              {locations.map((location) => (
                <li key={location.id}>
                  <div>
                    <strong>{location.name}</strong>
                    <span>{location.locationType}</span>
                  </div>
                  <StatusBadge label="Active" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-copy">No locations yet. Add the first store, showroom or site.</p>
          )}
          {isAdmin ? (
            <form action={createLocation} className="compact-form">
              <label className="form-field">
                <span>Name</span>
                <input name="name" required />
              </label>
              <label className="form-field">
                <span>Type</span>
                <select defaultValue="store" name="location_type">
                  <option value="store">Store</option>
                  <option value="showroom">Showroom</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="form-field">
                <span>Business code (optional)</span>
                <input name="business_code" />
              </label>
              <label className="form-field">
                <span>Timezone override (optional)</span>
                <input name="timezone" placeholder={organization.timezone} />
              </label>
              <button className="button button-secondary" type="submit">
                Add location
              </button>
            </form>
          ) : null}
        </section>

        <section className="product-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Frontline scope</p>
              <h2>Teams</h2>
            </div>
            <span className="count-label">{teams.length}</span>
          </div>
          {teams.length ? (
            <ul className="record-list">
              {teams.map((team) => (
                <li key={team.id}>
                  <div>
                    <strong>{team.name}</strong>
                    <span>Active team</span>
                  </div>
                  <StatusBadge label="Active" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="section-copy">No teams yet. One level is enough for the MVP.</p>
          )}
          {isAdmin ? (
            <form action={createTeam} className="compact-form">
              <label className="form-field">
                <span>Team name</span>
                <input name="name" required />
              </label>
              <button className="button button-secondary" type="submit">
                Add team
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </>
  );
}
