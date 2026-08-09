import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { getApplicationContext } from "@/modules/identity/application-context";
import { createLocation, createTeam } from "../actions";
import { AdminNavigation } from "@/components/administration/admin-navigation";
import { ActionDialog } from "@/components/ui/action-dialog";
export default async function StructurePage() {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") redirect("/administration");
  const c = context.current;
  return (
    <>
      <PageHeader eyebrow="Operating context" title="Structure" />
      <p className="section-copy">
        Locations and teams give interactions the scope they need without rewriting historical
        assignments.
      </p>
      <AdminNavigation />
      <div className="administration-grid">
        <section className="product-panel">
          <h2>Locations</h2>
          {c.locations.map((x) => (
            <p className="record-line" key={x.id}>
              {x.name} <small>{x.locationType}</small>
            </p>
          ))}
          <ActionDialog
            buttonLabel="Add location"
            eyebrow="Operating structure"
            title="Add location"
          >
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
              <button className="button button-primary" type="submit">
                Add location
              </button>
            </form>
          </ActionDialog>
        </section>
        <section className="product-panel">
          <h2>Teams</h2>
          {c.teams.map((x) => (
            <p className="record-line" key={x.id}>
              {x.name}
            </p>
          ))}
          <ActionDialog buttonLabel="Add team" eyebrow="Operating structure" title="Add team">
            <form action={createTeam} className="compact-form">
              <label className="form-field">
                <span>Team name</span>
                <input name="name" required />
              </label>
              <button className="button button-primary" type="submit">
                Add team
              </button>
            </form>
          </ActionDialog>
        </section>
      </div>
    </>
  );
}
