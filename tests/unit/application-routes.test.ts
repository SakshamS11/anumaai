import { describe, expect, it } from "vitest";

import { applicationRoutes, getApplicationRoute } from "@/modules/application/routes";

describe("application route registry", () => {
  it("contains the five Phase 1 protected destinations", () => {
    expect(applicationRoutes.map((route) => route.href)).toEqual([
      "/conversations",
      "/customer-intelligence",
      "/frontline-performance",
      "/outcome-intelligence",
      "/administration",
    ]);
  });

  it("provides the intended empty state for a registered route", () => {
    expect(getApplicationRoute("/conversations").description).toContain("Prepared interactions");
  });
});
