import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/administration/admin-navigation";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getApplicationContext } from "@/modules/identity/application-context";
import { importProductCatalogue } from "./actions";

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; invalid?: string; error?: string }>;
}) {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") redirect("/conversations");
  const supabase = await createClient();
  const [{ data: items }, { data: imports }] = await Promise.all([
    supabase
      .from("product_catalogue_items")
      .select("id,external_sku,name,category,brand,model,is_active")
      .eq("organization_id", context.current.organization.id)
      .order("name"),
    supabase
      .from("product_catalogue_import_runs")
      .select("id,source_filename,status,imported_row_count,invalid_row_count,created_at")
      .eq("organization_id", context.current.organization.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const query = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Business data" title="Product catalogue" />
      <p className="section-copy">
        Import the products your organization sells. Catalogue records are authoritative context;
        spoken product mentions remain evidence-backed conversation claims.
      </p>
      <AdminNavigation />
      {query.error ? (
        <p role="alert" className="form-error">
          {query.error}
        </p>
      ) : null}
      {query.imported ? (
        <p role="status">
          Imported {query.imported} product{query.imported === "1" ? "" : "s"};{" "}
          {query.invalid ?? "0"} row errors.
        </p>
      ) : null}
      <section className="product-panel">
        <h2>Import CSV</h2>
        <p>
          Required columns: <code>sku</code>, <code>name</code>, <code>category</code>. Optional:
          subcategory, brand, model, aliases (pipe-separated), specifications (JSON).
        </p>
        <form action={importProductCatalogue} className="product-form">
          <label htmlFor="catalogue">
            Product catalogue CSV
            <input id="catalogue" name="catalogue" type="file" accept=".csv,text/csv" required />
          </label>
          <button type="submit">Import catalogue</button>
        </form>
      </section>
      <section className="product-panel">
        <h2>Products</h2>
        {items?.length ? (
          <ul className="directory-list">
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>
                  {item.external_sku} · {item.category}
                  {item.brand ? ` · ${item.brand}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products imported yet.</p>
        )}
      </section>
      <section className="product-panel">
        <h2>Import history</h2>
        {imports?.length ? (
          <ul className="directory-list">
            {imports.map((item) => (
              <li key={item.id}>
                <strong>{item.source_filename}</strong>
                <span>
                  {item.status.replaceAll("_", " ")} · {item.imported_row_count} imported ·{" "}
                  {item.invalid_row_count} invalid
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No imports yet.</p>
        )}
      </section>
    </>
  );
}
