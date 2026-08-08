import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getOpenAIEnvironment } from "@/lib/env";
import type { Json } from "@/lib/supabase/database.generated";
import { OpenAIAnalysisProvider } from "@/modules/analysis/openai-provider";
import { amountMajorToMinor } from "@/modules/analysis/types";

type TranscriptSegment = {
  end_milliseconds: number;
  id: string;
  original_text: string;
  provider_speaker_identifier: string | null;
  start_milliseconds: number;
};

type MappedSegment = TranscriptSegment & {
  role: "representative" | "customer" | "unknown" | "manager" | "additional_customer";
};

const METRIC_ALGORITHM_VERSION = "phase4.v1";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function longestUninterruptedSpeech(segments: MappedSegment[]) {
  const ordered = [...segments].sort(
    (left, right) => left.start_milliseconds - right.start_milliseconds,
  );
  let longest = 0;
  let currentRole: MappedSegment["role"] | null = null;
  let currentStart = 0;
  let currentEnd = 0;
  for (const segment of ordered) {
    const start = Number(segment.start_milliseconds);
    const end = Number(segment.end_milliseconds);
    if (segment.role === currentRole && start <= currentEnd) {
      currentEnd = Math.max(currentEnd, end);
    } else {
      longest = Math.max(longest, Math.max(0, currentEnd - currentStart));
      currentRole = segment.role;
      currentStart = start;
      currentEnd = end;
    }
  }
  return Math.max(longest, Math.max(0, currentEnd - currentStart));
}

export function metricRows(segments: MappedSegment[]) {
  const ordered = [...segments].sort(
    (left, right) => left.start_milliseconds - right.start_milliseconds,
  );
  const duration =
    Math.max(...ordered.map((segment) => segment.end_milliseconds)) -
    Math.min(...ordered.map((segment) => segment.start_milliseconds));
  const byRole = (role: MappedSegment["role"]) =>
    ordered.filter((segment) => segment.role === role);
  const speechDuration = (items: MappedSegment[]) =>
    items.reduce(
      (total, item) => total + Math.max(0, item.end_milliseconds - item.start_milliseconds),
      0,
    );
  const representative = byRole("representative");
  const customer = [...byRole("customer"), ...byRole("additional_customer")];
  const representativeDuration = speechDuration(representative);
  const customerDuration = speechDuration(customer);
  const mappedSpeechDuration = speechDuration(ordered);
  const longest = longestUninterruptedSpeech(ordered);
  const wordsPerMinute = (items: MappedSegment[]) => {
    const milliseconds = speechDuration(items);
    return milliseconds === 0
      ? 0
      : (wordCount(items.map((item) => item.original_text).join(" ")) * 60_000) / milliseconds;
  };

  return [
    { metric_key: "interaction_duration", numeric_value: duration, unit: "milliseconds" },
    {
      metric_key: "representative_talk_duration",
      numeric_value: representativeDuration,
      unit: "milliseconds",
    },
    { metric_key: "customer_talk_duration", numeric_value: customerDuration, unit: "milliseconds" },
    {
      metric_key: "representative_talk_share",
      numeric_value: mappedSpeechDuration === 0 ? 0 : representativeDuration / mappedSpeechDuration,
      unit: "ratio",
    },
    {
      metric_key: "customer_talk_share",
      numeric_value: mappedSpeechDuration === 0 ? 0 : customerDuration / mappedSpeechDuration,
      unit: "ratio",
    },
    { metric_key: "turn_count", numeric_value: ordered.length, unit: "turns" },
    {
      metric_key: "representative_turn_count",
      numeric_value: representative.length,
      unit: "turns",
    },
    { metric_key: "customer_turn_count", numeric_value: customer.length, unit: "turns" },
    {
      metric_key: "representative_words_per_minute",
      numeric_value: wordsPerMinute(representative),
      unit: "words_per_minute",
    },
    {
      metric_key: "customer_words_per_minute",
      numeric_value: wordsPerMinute(customer),
      unit: "words_per_minute",
    },
    { metric_key: "longest_uninterrupted_speech", numeric_value: longest, unit: "milliseconds" },
  ];
}

async function persistDeterministicMetrics(
  db: ReturnType<typeof createAdminClient>,
  run: {
    conversation_id: string;
    organization_id: string;
    source_transcription_run_id: string;
    speaker_mapping_version_id: string;
  },
  segments: MappedSegment[],
) {
  const { data: metricRun, error } = await db
    .from("metric_runs")
    .insert({
      algorithm_version: METRIC_ALGORITHM_VERSION,
      conversation_id: run.conversation_id,
      organization_id: run.organization_id,
      source_transcription_run_id: run.source_transcription_run_id,
      speaker_mapping_version_id: run.speaker_mapping_version_id,
    })
    .select("id")
    .single();
  if (error || !metricRun) throw new Error("Deterministic metrics could not be saved.");

  const { error: valuesError } = await db.from("metric_values").insert(
    metricRows(segments).map((metric) => ({
      ...metric,
      conversation_id: run.conversation_id,
      metric_run_id: metricRun.id,
      organization_id: run.organization_id,
    })),
  );
  if (valuesError) throw new Error("Deterministic metric values could not be saved.");
  return metricRun.id;
}

export async function processAnalysisRun(runId: string) {
  "use step";

  const db = createAdminClient();
  const { data: run, error: runError } = await db
    .from("analysis_runs")
    .select(
      "id,organization_id,conversation_id,source_transcription_run_id,speaker_mapping_version_id",
    )
    .eq("id", runId)
    .single();
  if (runError || !run) throw new Error("Analysis run not found.");
  if (!run.speaker_mapping_version_id) throw new Error("A confirmed speaker mapping is required.");

  const [{ data: conversation }, { data: segments }, { data: mappings }, { data: organization }] =
    await Promise.all([
      db.from("conversations").select("vertical").eq("id", run.conversation_id).single(),
      db
        .from("transcript_segments")
        .select("id,start_milliseconds,end_milliseconds,original_text,provider_speaker_identifier")
        .eq("transcription_run_id", run.source_transcription_run_id)
        .order("sequence_number"),
      db
        .from("speaker_mapping_entries")
        .select("provider_speaker_identifier,participant_role")
        .eq("speaker_mapping_version_id", run.speaker_mapping_version_id),
      db
        .from("organizations")
        .select("country_code,default_currency")
        .eq("id", run.organization_id)
        .single(),
    ]);
  if (!conversation || !organization || !segments?.length || !mappings?.length) {
    throw new Error("Interaction is not eligible for understanding.");
  }

  const roles = new Map(
    mappings.flatMap((mapping) =>
      mapping.provider_speaker_identifier
        ? [[mapping.provider_speaker_identifier, mapping.participant_role] as const]
        : [],
    ),
  );
  if (
    segments.some(
      (segment) =>
        !segment.provider_speaker_identifier || !roles.has(segment.provider_speaker_identifier),
    )
  ) {
    throw new Error("Every transcript segment needs an active human speaker mapping.");
  }
  const mappedSegments = segments.map((segment) => ({
    ...segment,
    role: roles.get(segment.provider_speaker_identifier!)!,
  }));

  const runtimeModel = getOpenAIEnvironment().ANUMA_ANALYSIS_MODEL;
  await db
    .from("analysis_runs")
    .update({ model: runtimeModel, status: "running", started_at: new Date().toISOString() })
    .eq("id", runId);
  const metricRunId = await persistDeterministicMetrics(
    db,
    { ...run, speaker_mapping_version_id: run.speaker_mapping_version_id },
    mappedSegments,
  );
  await db.from("analysis_runs").update({ metric_run_id: metricRunId }).eq("id", runId);

  const result = await new OpenAIAnalysisProvider().extract({
    vertical: conversation.vertical,
    country: organization.country_code,
    currency: organization.default_currency,
    segments: mappedSegments.map((segment) => ({
      endMilliseconds: Number(segment.end_milliseconds),
      id: segment.id,
      speaker: segment.role,
      startMilliseconds: Number(segment.start_milliseconds),
      text: segment.original_text,
    })),
  });
  const ids = new Set(segments.map((segment) => segment.id));
  if (
    result.observations.some((observation) =>
      observation.evidenceSegmentIds.some((id) => !ids.has(id)),
    )
  ) {
    throw new Error("Model returned invalid evidence references.");
  }

  for (const observation of result.observations) {
    const { data: group, error: groupError } = await db
      .from("evidence_groups")
      .insert({
        conversation_id: run.conversation_id,
        organization_id: run.organization_id,
        purpose: `observation:${observation.type}`,
        source_analysis_run_id: runId,
      })
      .select("id")
      .single();
    if (groupError || !group) throw new Error("Evidence group could not be saved.");

    const references = observation.evidenceSegmentIds.map((id, sequence_number) => {
      const segment = segments.find((item) => item.id === id)!;
      return {
        conversation_id: run.conversation_id,
        end_milliseconds: segment.end_milliseconds,
        evidence_group_id: group.id,
        organization_id: run.organization_id,
        sequence_number,
        start_milliseconds: segment.start_milliseconds,
        transcription_run_id: run.source_transcription_run_id,
        transcript_segment_id: id,
      };
    });
    const { error: referencesError } = await db.from("evidence_references").insert(references);
    if (referencesError) throw new Error("Evidence references could not be saved.");

    const { error: observationError } = await db.from("structured_observations").insert({
      analysis_run_id: runId,
      attributes: observation.attributes as Json,
      conversation_id: run.conversation_id,
      currency_code: observation.currency,
      evidence_group_id: group.id,
      normalized_key: observation.key,
      observation_type: observation.type,
      organization_id: run.organization_id,
      original_model_value: observation as unknown as Json,
      value_amount_minor: amountMajorToMinor(observation.amountMajor, observation.currency),
      value_text: observation.text,
    });
    if (observationError) throw new Error("Structured observation could not be saved.");
  }

  await db
    .from("analysis_runs")
    .update({
      completed_at: new Date().toISOString(),
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      provider_request_id: result.requestId,
      status: "completed",
    })
    .eq("id", runId);
  await db
    .from("conversations")
    .update({ active_analysis_run_id: runId, lifecycle_status: "ready" })
    .eq("id", run.conversation_id);
}

export { METRIC_ALGORITHM_VERSION };
