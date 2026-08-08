import "server-only";

import { createHash } from "node:crypto";
import { parseBuffer } from "music-metadata";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.generated";
import { SarvamSpeechToTextProvider } from "@/modules/transcription/sarvam-provider";

const AUDIO_BUCKET = "conversation-audio";

type ProcessingContext = {
  runId: string;
  recordingId: string;
  conversationId: string;
  organizationId: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  providerRequestId: string | null;
};

function looksLikeSupportedAudio(bytes: Uint8Array): boolean {
  const text = new TextDecoder("latin1").decode(bytes.subarray(0, 16));
  const isWebM =
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3;
  return (
    text.startsWith("RIFF") ||
    text.startsWith("OggS") ||
    text.startsWith("ID3") ||
    isWebM ||
    text.startsWith("\u001aEÃŸÂ£") ||
    (text.length >= 12 && text.slice(4, 8) === "ftyp") ||
    (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
  );
}

async function loadProcessingContext(runId: string): Promise<ProcessingContext> {
  const admin = createAdminClient();
  const { data: run, error: runError } = await admin
    .from("transcription_runs")
    .select(
      "id, organization_id, conversation_id, recording_id, provider, status, provider_request_id",
    )
    .eq("id", runId)
    .maybeSingle();
  if (runError || !run) throw new Error("The transcription run no longer exists.");
  if (run.provider !== undefined && run.provider !== "sarvam") {
    throw new Error("This workflow only processes Sarvam transcription runs.");
  }
  const { data: recording, error: recordingError } = await admin
    .from("recordings")
    .select(
      "id, organization_id, conversation_id, storage_bucket, storage_object_path, mime_type, file_size_bytes, status",
    )
    .eq("id", run.recording_id)
    .maybeSingle();
  if (recordingError || !recording) throw new Error("The source recording no longer exists.");
  if (
    recording.organization_id !== run.organization_id ||
    recording.conversation_id !== run.conversation_id ||
    recording.storage_bucket !== AUDIO_BUCKET
  ) {
    throw new Error("The transcription run and recording relationships do not match.");
  }
  if (recording.status !== "uploaded") throw new Error("The source audio is not secured.");
  return {
    runId: run.id,
    recordingId: recording.id,
    conversationId: run.conversation_id,
    organizationId: run.organization_id,
    storagePath: recording.storage_object_path,
    mimeType: recording.mime_type,
    fileSizeBytes: recording.file_size_bytes,
    providerRequestId: run.provider_request_id,
  };
}

export async function submitTranscriptionStep(
  runId: string,
): Promise<{ providerRequestId: string }> {
  "use step";
  const context = await loadProcessingContext(runId);
  if (context.providerRequestId) return { providerRequestId: context.providerRequestId };

  const admin = createAdminClient();
  const { data: audio, error: downloadError } = await admin.storage
    .from(AUDIO_BUCKET)
    .download(context.storagePath);
  if (downloadError || !audio)
    throw new Error("Private audio could not be downloaded for processing.");
  const bytes = new Uint8Array(await audio.arrayBuffer());
  if (bytes.byteLength !== context.fileSizeBytes) {
    throw new Error("The private audio byte length does not match recording metadata.");
  }
  if (!looksLikeSupportedAudio(bytes))
    throw new Error("The uploaded object is not a recognized supported audio file.");
  const metadata = await parseBuffer(bytes, context.mimeType, { duration: true });
  const actualDurationMilliseconds = Math.round((metadata.format.duration ?? 0) * 1000);
  if (!Number.isFinite(actualDurationMilliseconds) || actualDurationMilliseconds < 1) {
    throw new Error("The private audio duration could not be verified.");
  }
  if (actualDurationMilliseconds > 7_200_000) {
    throw new Error("The private audio is longer than the two-hour processing limit.");
  }
  const checksum = createHash("sha256").update(bytes).digest("hex");

  const { data: recording, error: checksumError } = await admin
    .from("recordings")
    .select("checksum_sha256")
    .eq("id", context.recordingId)
    .single();
  if (checksumError) throw new Error("Recording integrity could not be verified.");
  if (recording.checksum_sha256 && recording.checksum_sha256 !== checksum) {
    throw new Error("The private audio checksum changed unexpectedly.");
  }
  const { error: updateChecksumError } = await admin
    .from("recordings")
    .update({ checksum_sha256: checksum, duration_milliseconds: actualDurationMilliseconds })
    .eq("id", context.recordingId);
  if (updateChecksumError) throw new Error("Recording checksum could not be saved.");

  const provider = new SarvamSpeechToTextProvider();
  const submission = await provider.submit({
    audio: bytes,
    fileName: context.storagePath.split("/").at(-1) ?? "source.audio",
    mimeType: context.mimeType,
  });
  const { data: startedRun, error: startedRunError } = await admin
    .from("transcription_runs")
    .select("started_at")
    .eq("id", runId)
    .single();
  if (startedRunError) throw new Error("The transcription timing could not be read.");
  const { error: runError } = await admin
    .from("transcription_runs")
    .update({
      provider_request_id: submission.providerRequestId,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .is("provider_request_id", null);
  if (runError) throw new Error("The Sarvam job reference could not be persisted.");
  return submission;
}

export async function pollTranscriptionStep(
  runId: string,
): Promise<
  | { state: "pending" | "running" }
  | { state: "completed"; providerRequestId: string; outputFileNames: string[] }
  | { state: "failed"; message: string | null }
> {
  "use step";
  const context = await loadProcessingContext(runId);
  if (!context.providerRequestId) throw new Error("No Sarvam job has been created for this run.");
  const status = await new SarvamSpeechToTextProvider().getStatus(context.providerRequestId);
  if (status.state === "completed")
    return { ...status, providerRequestId: context.providerRequestId };
  return status;
}

export async function persistTranscriptStep(
  runId: string,
  providerRequestId: string,
  outputFileNames: string[],
): Promise<void> {
  "use step";
  const context = await loadProcessingContext(runId);
  if (context.providerRequestId !== providerRequestId) {
    throw new Error("The Sarvam job does not belong to this transcription run.");
  }
  const provider = new SarvamSpeechToTextProvider();
  const normalized = provider.normalize(
    await provider.fetchResult(providerRequestId, outputFileNames),
  );
  const admin = createAdminClient();
  const { data: startedRun, error: startedRunError } = await admin
    .from("transcription_runs")
    .select("started_at")
    .eq("id", runId)
    .single();
  if (startedRunError) throw new Error("The transcription timing could not be read.");

  for (const [sequenceNumber, segment] of normalized.segments.entries()) {
    const { data: existing, error: existingError } = await admin
      .from("transcript_segments")
      .select("original_text, start_milliseconds, end_milliseconds, provider_speaker_identifier")
      .eq("transcription_run_id", runId)
      .eq("sequence_number", sequenceNumber)
      .maybeSingle();
    if (existingError) throw new Error("Existing transcript evidence could not be checked.");
    if (existing) {
      const identical =
        existing.original_text === segment.originalText &&
        existing.start_milliseconds === segment.startMilliseconds &&
        existing.end_milliseconds === segment.endMilliseconds &&
        existing.provider_speaker_identifier === segment.providerSpeakerIdentifier;
      if (!identical) throw new Error("A retry found conflicting immutable transcript evidence.");
      continue;
    }
    const { error: insertError } = await admin.from("transcript_segments").insert({
      organization_id: context.organizationId,
      conversation_id: context.conversationId,
      transcription_run_id: runId,
      sequence_number: sequenceNumber,
      provider_speaker_identifier: segment.providerSpeakerIdentifier,
      start_milliseconds: segment.startMilliseconds,
      end_milliseconds: segment.endMilliseconds,
      original_text: segment.originalText,
      confidence: segment.confidence,
      detected_languages: segment.detectedLanguages,
    });
    if (insertError) throw new Error("Transcript evidence could not be saved.");
  }

  const completedAt = new Date().toISOString();
  const { error: runError } = await admin
    .from("transcription_runs")
    .update({
      status: "completed",
      completed_at: completedAt,
      latency_milliseconds: Math.max(
        0,
        Date.now() - Date.parse(startedRun.started_at ?? completedAt),
      ),
      provider_metadata: normalized.providerMetadata as Json,
    })
    .eq("id", runId);
  if (runError) throw new Error("The transcription run could not be completed.");
  const { error: conversationError } = await admin
    .from("conversations")
    .update({ active_transcription_run_id: runId, lifecycle_status: "partial" })
    .eq("id", context.conversationId)
    .eq("organization_id", context.organizationId);
  if (conversationError) throw new Error("The active transcript could not be selected.");
}

export async function failTranscriptionStep(runId: string, reason: string): Promise<void> {
  "use step";
  const admin = createAdminClient();
  const { data: run } = await admin
    .from("transcription_runs")
    .select("conversation_id, organization_id")
    .eq("id", runId)
    .maybeSingle();
  if (!run) return;
  await admin
    .from("transcription_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_code: "transcription_failed",
      error_message: reason.slice(0, 500),
    })
    .eq("id", runId)
    .in("status", ["pending", "running"]);
  await admin
    .from("conversations")
    .update({ lifecycle_status: "failed" })
    .eq("id", run.conversation_id)
    .eq("organization_id", run.organization_id);
}
