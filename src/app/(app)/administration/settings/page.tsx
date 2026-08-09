import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { getApplicationContext } from "@/modules/identity/application-context";
export default async function SettingsPage() {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") redirect("/administration");
  const o = context.current.organization;
  return (
    <>
      <PageHeader eyebrow="Organization context" title="Settings" />
      <section className="product-panel settings-list">
        <p>
          <span>Organization name</span>
          <strong>{o.name}</strong>
        </p>
        <p>
          <span>Country</span>
          <strong>{o.countryCode}</strong>
        </p>
        <p>
          <span>Currency</span>
          <strong>{o.defaultCurrency}</strong>
        </p>
        <p>
          <span>Timezone</span>
          <strong>{o.timezone}</strong>
        </p>
        <small>
          These defaults describe new interactions. Historical records retain their original
          currency and timestamps.
        </small>
      </section>
    </>
  );
}
