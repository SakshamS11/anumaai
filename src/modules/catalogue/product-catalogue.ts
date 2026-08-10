import { createHash } from "node:crypto";

import { z } from "zod";

export const productCatalogueRowSchema = z.object({
  sku: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(120),
  subcategory: z.string().trim().max(120).optional(),
  brand: z.string().trim().max(120).optional(),
  model: z.string().trim().max(120).optional(),
  aliases: z.array(z.string().trim().min(1).max(160)).max(30).default([]),
  specifications: z.record(z.string(), z.string()).default({}),
});

export type ProductCatalogueRow = z.infer<typeof productCatalogueRowSchema>;

export function csvChecksum(source: string) {
  return createHash("sha256").update(source, "utf8").digest("hex");
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else current += character;
  }
  if (quoted) throw new Error("Unclosed quoted CSV value.");
  values.push(current.trim());
  return values;
}

export function parseProductCatalogueCsv(source: string) {
  const lines = source
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2)
    return {
      rows: [],
      errors: [{ row: 1, message: "Add a header and at least one product row." }],
    };
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const required = ["sku", "name", "category"];
  if (required.some((header) => !headers.includes(header)))
    return {
      rows: [],
      errors: [{ row: 1, message: "CSV requires sku, name and category columns." }],
    };
  const rows: Array<ProductCatalogueRow & { rowNumber: number }> = [];
  const errors: Array<{ row: number; message: string }> = [];
  const seenSku = new Set<string>();
  for (let index = 1; index < lines.length; index += 1) {
    try {
      const values = parseCsvLine(lines[index]);
      const value = (name: string) => values[headers.indexOf(name)] ?? "";
      const aliases = value("aliases")
        .split("|")
        .map((alias) => alias.trim())
        .filter(Boolean);
      const specifications = value("specifications") ? JSON.parse(value("specifications")) : {};
      const parsed = productCatalogueRowSchema.safeParse({
        sku: value("sku"),
        name: value("name"),
        category: value("category"),
        subcategory: value("subcategory") || undefined,
        brand: value("brand") || undefined,
        model: value("model") || undefined,
        aliases,
        specifications,
      });
      if (!parsed.success)
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid product row.");
      const sku = parsed.data.sku.toLowerCase();
      if (seenSku.has(sku)) throw new Error("SKU is repeated in this file.");
      seenSku.add(sku);
      rows.push({ ...parsed.data, rowNumber: index + 1 });
    } catch (error) {
      errors.push({
        row: index + 1,
        message: error instanceof Error ? error.message : "Invalid product row.",
      });
    }
  }
  return { rows, errors };
}

export type CatalogueMatch = "confirmed" | "ambiguous" | "unresolved";
export function resolveProductMention(
  mention: string,
  items: Array<{
    id: string;
    name: string;
    aliases: string[];
    brand: string | null;
    model: string | null;
    externalSku?: string;
    isActive?: boolean;
  }>,
) {
  const normalized = mention.trim().toLocaleLowerCase();
  const matches = items.filter(
    (item) =>
      item.isActive !== false &&
      [item.name, item.brand, item.model, ...item.aliases]
        .filter(Boolean)
        .some((candidate) => candidate!.toLocaleLowerCase() === normalized),
  );
  return matches.length === 1
    ? { state: "confirmed" as const, item: matches[0] }
    : matches.length > 1
      ? { state: "ambiguous" as const, item: null }
      : { state: "unresolved" as const, item: null };
}
