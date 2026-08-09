import { createAdminClient } from "@/lib/supabase/admin";
import { createCustomerOrganization } from "./actions";
export default async function PlatformOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const [message, admin] = await Promise.all([searchParams, Promise.resolve(createAdminClient())]);
  const [{ data: organizations }, { data: memberships }, { data: locations }] = await Promise.all([
    admin
      .from("organizations")
      .select("id,name,country_code,default_currency,timezone,created_at")
      .order("created_at", { ascending: false }),
    admin.from("organization_memberships").select("organization_id"),
    admin.from("locations").select("organization_id"),
  ]);
  const count = (rows: { organization_id: string }[] | null, id: string) =>
    rows?.filter((r) => r.organization_id === id).length ?? 0;
  return (
    <>
      <section className="platform-header">
        <p className="eyebrow">ANUMA internal</p>
        <h1>Customer organizations</h1>
        <p>
          Provision and oversee customer environments. This surface is not visible to customer
          users.
        </p>
      </section>
      {message.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {message.error}
        </p>
      ) : null}
      {message.created ? (
        <p className="auth-message" role="status">
          Customer organization provisioned.
        </p>
      ) : null}
      <details className="admin-drawer">
        <summary className="button button-primary">Create organization</summary>
        <form action={createCustomerOrganization} className="product-form">
          <label className="form-field form-field-wide">
            <span>Organization name</span>
            <input name="name" required />
          </label>
          <label className="form-field form-field-wide">
            <span>Initial administrator email</span>
            <input name="email" required type="email" />
          </label>
          <label className="form-field">
            <span>Country</span>
            <input defaultValue="IN" name="country" required />
          </label>
          <label className="form-field">
            <span>Currency</span>
            <input defaultValue="INR" name="currency" required />
          </label>
          <label className="form-field">
            <span>Timezone</span>
            <input defaultValue="Asia/Kolkata" name="timezone" required />
          </label>
          <button className="button button-primary" type="submit">
            Create organization
          </button>
        </form>
      </details>
      <section className="product-panel">
        <div className="directory-table" role="table">
          <div className="directory-row directory-head">
            <span>Organization</span>
            <span>Country</span>
            <span>People</span>
            <span>Locations</span>
          </div>
          {organizations?.map((o) => (
            <div className="directory-row" key={o.id}>
              <span>
                <strong>{o.name}</strong>
                <small>
                  {o.default_currency} · {o.timezone}
                </small>
              </span>
              <span>{o.country_code}</span>
              <span>{count(memberships, o.id)}</span>
              <span>{count(locations, o.id)}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
