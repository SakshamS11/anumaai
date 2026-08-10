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
  it("normalizes CSV values while preserving aliases and controlled specifications", () => {
    const result = parseProductCatalogueCsv(
      'sku,name,category,subcategory,brand,model,aliases,specifications\n S24U , Samsung Galaxy S24 Ultra , Smartphone , Flagship , Samsung , S24 Ultra , "S24 Ultra|Galaxy S24 Ultra" , "{""storage"":""256GB"",""camera"":""200MP""}"',
    );
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({
      sku: "S24U",
      category: "Smartphone",
      aliases: ["S24 Ultra", "Galaxy S24 Ultra"],
      specifications: { storage: "256GB", camera: "200MP" },
    });
  });
  it("rejects duplicate SKUs in one upload without contaminating accepted rows", () => {
    const result = parseProductCatalogueCsv(
      "sku,name,category\nTV1,LG OLED,TV\ntv1,LG OLED duplicate,TV",
    );
    expect(result.rows).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({ row: 3, message: "SKU is repeated in this file." });
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
  it("resolves multiple electronics categories only within the supplied tenant catalogue", () => {
    const orgA = [
      {
        id: "phone",
        name: "Samsung Galaxy S24 Ultra",
        aliases: ["S24 Ultra"],
        brand: "Samsung",
        model: "S24 Ultra",
        externalSku: "ABC123",
      },
      {
        id: "laptop",
        name: "Lenovo LOQ",
        aliases: ["LOQ"],
        brand: "Lenovo",
        model: "LOQ",
        externalSku: "LOQ4060",
      },
      {
        id: "tv",
        name: "LG OLED C4",
        aliases: ["LG OLED"],
        brand: "LG",
        model: "C4",
        externalSku: "OLED-C4",
      },
      {
        id: "audio",
        name: "Sony WH-1000XM5",
        aliases: ["XM5"],
        brand: "Sony",
        model: "WH-1000XM5",
        externalSku: "SONY-XM5",
      },
    ];
    expect(resolveProductMention("S24 Ultra", orgA)).toMatchObject({
      state: "confirmed",
      item: { id: "phone" },
    });
    expect(resolveProductMention("LOQ", orgA)).toMatchObject({
      state: "confirmed",
      item: { id: "laptop" },
    });
    expect(resolveProductMention("LG OLED", orgA)).toMatchObject({
      state: "confirmed",
      item: { id: "tv" },
    });
    expect(resolveProductMention("XM5", orgA)).toMatchObject({
      state: "confirmed",
      item: { id: "audio" },
    });
    expect(resolveProductMention("S24 Ultra", [])).toMatchObject({ state: "unresolved" });
  });
  it("does not resolve inactive catalogue items", () => {
    expect(
      resolveProductMention("iPhone 16", [
        {
          id: "old",
          name: "Apple iPhone 16",
          aliases: [],
          brand: "Apple",
          model: "iPhone 16",
          isActive: false,
        },
      ]).state,
    ).toBe("unresolved");
  });
});
