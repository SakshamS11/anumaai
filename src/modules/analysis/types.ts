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

export const questionTypes = [
  "discovery",
  "clarification",
  "product_or_service_information",
  "commercial",
  "finance",
  "comparison",
  "process",
  "objection_related",
  "closing",
  "other",
] as const;
export const responseStates = [
  "answered",
  "partially_answered",
  "unanswered",
  "uncertain",
] as const;
export const objectionFamilies = [
  "price",
  "value",
  "product_or_service_fit",
  "competitor",
  "timing",
  "trust",
  "process",
  "finance",
  "availability_claim",
  "policy",
  "risk",
  "other",
] as const;
export const objectionHandlingStates = [
  "resolved",
  "partially_resolved",
  "unresolved",
  "deferred",
  "uncertain",
] as const;

export type ExtractedQuestion = {
  text: string;
  normalizedTopic: string;
  questionType: (typeof questionTypes)[number];
  speakerRole: string;
  evidenceSegmentIds: string[];
  response: {
    text: string | null;
    speakerRole: string | null;
    state: (typeof responseStates)[number];
    rationale: string | null;
    evidenceSegmentIds: string[];
  };
};

export type ExtractedObjection = {
  text: string;
  family: (typeof objectionFamilies)[number];
  speakerRole: string;
  evidenceSegmentIds: string[];
  handling: {
    text: string | null;
    speakerRole: string | null;
    state: (typeof objectionHandlingStates)[number];
    strategy: string | null;
    rationale: string | null;
    evidenceSegmentIds: string[];
  };
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

/** Current POC support is explicit: INR and AED use two minor-unit decimals. */
const currencyExponents: Readonly<Record<string, number>> = { AED: 2, INR: 2 };

export function amountMajorToMinor(amountMajor: number | null, currency: string | null) {
  if (amountMajor === null || amountMajor < 0 || !Number.isFinite(amountMajor) || !currency) {
    return null;
  }
  const exponent = currencyExponents[currency];
  return exponent === undefined ? null : Math.round(amountMajor * 10 ** exponent);
}
export interface AnalysisProvider {
  extract(input: {
    vertical: string;
    country: string;
    currency: string;
    segments: AnalysisInputSegment[];
  }): Promise<{
    observations: ExtractedObservation[];
    questions: ExtractedQuestion[];
    objections: ExtractedObjection[];
    requestId: string | null;
    inputTokens: number | null;
    outputTokens: number | null;
  }>;
}
