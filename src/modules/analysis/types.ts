export type AnalysisInputSegment = {
  id: string;
  speaker: string;
  startMilliseconds: number;
  endMilliseconds: number;
  text: string;
};
export type ExtractedObservation = {
  type: string;
  key: string;
  text: string | null;
  amountMinor: number | null;
  currency: string | null;
  attributes: Record<string, unknown>;
  evidenceSegmentIds: string[];
};
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
