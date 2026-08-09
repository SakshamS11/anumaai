import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getApplicationContext } from "@/modules/identity/application-context";
import { createOrganizationCheck, seedStarterElectronicsChecks } from "../actions";
import { AdminNavigation } from "@/components/administration/admin-navigation";
import { ActionDialog } from "@/components/ui/action-dialog";
export default async function ChecksPage() {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") redirect("/administration");
  const c = context.current;
  const supabase = await createClient();
  const { data: checks } = await supabase
    .from("check_definitions")
    .select("id,name,description,purpose,applicability,active,is_starter,weight")
    .eq("organization_id", c.organization.id)
    .order("is_starter", { ascending: false });
  return (
    <>
      <PageHeader eyebrow="Interaction review" title="Checks" />
      <p className="section-copy">
        Choose what ANUMA should monitor or include in your organization&apos;s evaluation.
      </p>
      <AdminNavigation />
      {checks?.length ? (
        <section className="product-panel">
          {checks.map((check) => (
            <p className="record-line" key={check.id}>
              <strong>{check.name}</strong>
              <small>
                {check.is_starter ? "Starter" : "Custom"} ·{" "}
                {check.purpose === "scorecard" ? "Included in scorecard" : "Monitor only"} ·{" "}
                {check.active ? "Active" : "Inactive"}
              </small>
            </p>
          ))}
        </section>
      ) : (
        <form action={seedStarterElectronicsChecks}>
          <p className="section-copy">No checks are configured yet.</p>
          <button className="button button-secondary" type="submit">
            Add Starter Electronics checks
          </button>
        </form>
      )}
      <ActionDialog buttonLabel="Add check" eyebrow="Custom expectation" title="Add check">
        <form action={createOrganizationCheck} className="product-form">
          <label className="form-field">
            <span>Check name</span>
            <input name="name" required />
          </label>
          <label className="form-field form-field-wide">
            <span>What should ANUMA look for?</span>
            <textarea name="description" required rows={3} />
          </label>
          <label className="form-field">
            <span>Purpose</span>
            <select name="purpose">
              <option value="monitor">Monitor only</option>
              <option value="scorecard">Include in scorecard</option>
            </select>
          </label>
          <label className="form-field">
            <span>Applicability</span>
            <select name="applicability">
              <option value="every_interaction">Every interaction</option>
              <option value="when_relevant">When relevant</option>
            </select>
          </label>
          <label className="form-field">
            <span>How to check</span>
            <select name="evaluation_strategy">
              <option value="semantic">Review the interaction</option>
              <option value="phrase">Match an exact phrase</option>
            </select>
          </label>
          <label className="form-field">
            <span>Exact phrase</span>
            <input name="phrase" />
          </label>
          <label className="form-field">
            <span>Weight</span>
            <input min="0.01" name="weight" step="0.01" type="number" />
          </label>
          <button className="button button-primary" type="submit">
            Add check
          </button>
        </form>
      </ActionDialog>
    </>
  );
}
