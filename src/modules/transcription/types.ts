export type SpeechJobInput = {
  audio: Uint8Array;
  fileName: string;
  mimeType: string;
  callbackUrl?: string;
  callbackToken?: string;
};

export type SpeechSubmission = { providerRequestId: string };

export type SpeechJobStatus =
  | { state: "pending" | "running" }
  | { state: "completed"; outputFileNames: string[] }
  | { state: "failed"; message: string | null };

export type NormalizedTranscriptSegment = {
  providerSpeakerIdentifier: string | null;
  startMilliseconds: number;
  endMilliseconds: number;
  originalText: string;
  detectedLanguages: string[];
  confidence: number | null;
};

export type NormalizedTranscript = {
  segments: NormalizedTranscriptSegment[];
  providerMetadata: Record<string, unknown>;
};

export interface SpeechToTextProvider {
  readonly key: "sarvam";
  submit(input: SpeechJobInput): Promise<SpeechSubmission>;
  getStatus(providerRequestId: string): Promise<SpeechJobStatus>;
  fetchResult(providerRequestId: string, outputFileNames: string[]): Promise<unknown>;
  normalize(raw: unknown): NormalizedTranscript;
}
