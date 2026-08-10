"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { csvChecksum, parseProductCatalogueCsv } from "@/modules/catalogue/product-catalogue";
import { getApplicationContext } from "@/modules/identity/application-context";

export async function importProductCatalogue(formData: FormData) {
  const context = await getApplicationContext();
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin")
    redirect("/administration?error=Administrator+access+is+required.");
  const current = context.current;
  const file = formData.get("catalogue") as File | null;
  if (!file || !file.name.toLowerCase().endsWith(".csv") || file.size === 0 || file.size > 900_000)
    redirect("/administration/catalogue?error=Choose+a+CSV+file+under+900KB.");
  const source = await file.text();
  const parsed = parseProductCatalogueCsv(source);
  const supabase = await createClient();
  const { data: run, error: runError } = await supabase
    .from("product_catalogue_import_runs")
    .insert({
      organization_id: current.organization.id,
      source_filename: file.name,
      source_checksum: csvChecksum(source),
      status: "pending",
      total_row_count: parsed.rows.length + parsed.errors.length,
      invalid_row_count: parsed.errors.length,
      error_summary: parsed.errors.slice(0, 50),
      created_by_membership_id: current.membership.id,
    })
    .select("id")
    .single();
  if (runError || !run)
    redirect(
      "/administration/catalogue?error=This+file+has+already+been+imported+or+could+not+be+started.",
    );
  const { data: existing } = parsed.rows.length
    ? await supabase
        .from("product_catalogue_items")
        .select("external_sku")
        .eq("organization_id", current.organization.id)
        .in(
          "external_sku",
          parsed.rows.map((row) => row.sku),
        )
    : { data: [] };
  const known = new Set((existing ?? []).map((item) => item.external_sku.toLowerCase()));
  const accepted = parsed.rows.filter((row) => !known.has(row.sku.toLowerCase()));
  const conflicts = parsed.rows
    .filter((row) => known.has(row.sku.toLowerCase()))
    .map((row) => ({
      row: row.rowNumber,
      message: "SKU already exists. Existing catalogue facts were left unchanged.",
    }));
  const { error: insertError } = accepted.length
    ? await supabase.from("product_catalogue_items").insert(
        accepted.map((row) => ({
          organization_id: current.organization.id,
          external_sku: row.sku,
          name: row.name,
          category: row.category,
          subcategory: row.subcategory ?? null,
          brand: row.brand ?? null,
          model: row.model ?? null,
          aliases: row.aliases,
          specifications: row.specifications,
          source_import_run_id: run.id,
          source_row_number: row.rowNumber,
        })),
      )
    : { error: null };
  const errors = [...parsed.errors, ...conflicts];
  await supabase
    .from("product_catalogue_import_runs")
    .update({
      status: insertError ? "failed" : errors.length ? "completed_with_errors" : "completed",
      imported_row_count: insertError ? 0 : accepted.length,
      invalid_row_count: errors.length,
      error_summary: insertError ? [{ row: 0, message: "Valid rows could not be saved." }] : errors,
      completed_at: new Date().toISOString(),
    })
    .eq("id", run.id);
  if (insertError) redirect("/administration/catalogue?error=The+catalogue+could+not+be+saved.");
  revalidatePath("/administration/catalogue");
  redirect(`/administration/catalogue?imported=${accepted.length}&invalid=${errors.length}`);
}
