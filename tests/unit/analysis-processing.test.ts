import { describe, expect, it } from "vitest";

import { amountMajorToMinor } from "@/modules/analysis/types";
import { longestUninterruptedSpeech } from "@/modules/analysis/metrics";
import { hasPersistedAnalysisResult } from "@/modules/analysis/idempotency";

describe("analysis money semantics", () => {
  it.each([
    [80_000, 8_000_000],
    [78_000, 7_800_000],
    [81_000, 8_100_000],
    [54_999, 5_499_900],
    [3_000, 300_000],
  ])("converts ₹%i major units to paise", (major, minor) => {
    expect(amountMajorToMinor(major, "INR")).toBe(minor);
  });

  it("does not create money without a currency", () => {
    expect(amountMajorToMinor(80_000, null)).toBeNull();
  });
});

describe("analysis retry idempotency", () => {
  it("finalizes a persisted result instead of creating a second result set on retry", () => {
    expect(hasPersistedAnalysisResult(1)).toBe(true);
    expect(hasPersistedAnalysisResult(0)).toBe(false);
  });
});

describe("longest uninterrupted speech", () => {
  it("treats a small provider timestamp gap as one continuous speaker turn span", () => {
    const segments = [
      { role: "representative", start_milliseconds: 0, end_milliseconds: 1000 },
      { role: "representative", start_milliseconds: 1100, end_milliseconds: 3500 },
      { role: "customer", start_milliseconds: 3500, end_milliseconds: 4200 },
      { role: "representative", start_milliseconds: 4200, end_milliseconds: 5000 },
    ] as Parameters<typeof longestUninterruptedSpeech>[0];

    expect(longestUninterruptedSpeech(segments)).toBe(3500);
  });
});
