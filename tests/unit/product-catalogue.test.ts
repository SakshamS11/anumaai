import { describe, expect, it } from "vitest";
import {
  parseProductCatalogueCsv,
  resolveProductMention,
} from "@/modules/catalogue/product-catalogue";

describe("product catalogue", () => {
  it("keeps valid rows when invalid CSV rows are reported", () => {
    const result = parseProductCatalogueCsv(
      'sku,name,category,aliases,specifications\nLOQ,Lenovo LOQ,Laptop,"LOQ|Lenovo gaming",\nBAD,,TV,,',
    );
    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });
  it("does not invent an authoritative match", () => {
    const items = [
      { id: "1", name: "Samsung S24", aliases: ["S24"], brand: "Samsung", model: "S24" },
      {
        id: "2",
        name: "Samsung S24 Ultra",
        aliases: ["S24"],
        brand: "Samsung",
        model: "S24 Ultra",
      },
    ];
    expect(resolveProductMention("S24", items).state).toBe("ambiguous");
    expect(resolveProductMention("iPhone", items).state).toBe("unresolved");
  });
});
