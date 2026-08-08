export type AnalysisInputSegment = {
  id: string;
  speaker: string;
  startMilliseconds: number;
  endMilliseconds: number;
  text: string;
};
export type ExtractedObservation = {
  type: ObservationType;
  key: string;
  text: string | null;
  amountMajor: number | null;
  currency: string | null;
  attributes: Record<string, unknown>;
  evidenceSegmentIds: string[];
};

export const observationTypes = [
  "need",
  "budget",
  "product",
  "spec",
  "price",
  "competitor",
  "competitor_price",
  "store_quote",
  "question",
  "objection",
  "barrier",
  "decision_driver",
  "commitment",
  "next_action",
  "finance",
] as const;

export type ObservationType = (typeof observationTypes)[number];

export function amountMajorToMinor(amountMajor: number | null, currency: string | null) {
  if (amountMajor === null || amountMajor < 0 || !Number.isFinite(amountMajor) || !currency)
    return null;
  return Math.round(amountMajor * 100);
}
export interface AnalysisProvider {
  extract(input: {
    vertical: string;
    country: string;
    currency: string;
    segments: AnalysisInputSegment[];
  }): Promise<{
    observations: ExtractedObservation[];
    requestId: string | null;
    inputTokens: number | null;
    outputTokens: number | null;
  }>;
}
