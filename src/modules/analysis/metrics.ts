export type MetricRole =
  "representative" | "customer" | "unknown" | "manager" | "additional_customer";

export type MetricSegment = {
  end_milliseconds: number;
  original_text: string;
  role: MetricRole;
  start_milliseconds: number;
};

export type MetricRow = {
  metric_key: string;
  numeric_value: number;
  unit: "milliseconds" | "ratio" | "turns" | "words" | "words_per_minute";
};

type DialogueProjection = {
  questions: Array<{
    speakerRole: string;
    response: { evidenceSegmentIds: string[]; state: string };
  }>;
  objections: Array<{
    handling: { evidenceSegmentIds: string[]; state: string };
  }>;
};

/** Counts are computed from the one persisted dialogue projection, never by another model call. */
export function dialogueMetricRows(dialogue: DialogueProjection): MetricRow[] {
  const customerQuestions = dialogue.questions.filter((question) =>
    ["customer", "additional_customer"].includes(question.speakerRole),
  );
  const representativeQuestions = dialogue.questions.filter(
    (question) => question.speakerRole === "representative",
  );
  const answered = customerQuestions.filter(
    (question) => question.response.state === "answered",
  ).length;
  const partial = customerQuestions.filter(
    (question) => question.response.state === "partially_answered",
  ).length;
  const unanswered = customerQuestions.filter(
    (question) => question.response.state === "unanswered",
  ).length;
  const uncertain = customerQuestions.filter(
    (question) => question.response.state === "uncertain",
  ).length;
  const questionsWithResponse = customerQuestions.filter(
    (question) => question.response.evidenceSegmentIds.length > 0,
  ).length;
  const objectionsWithResponse = dialogue.objections.filter(
    (objection) => objection.handling.evidenceSegmentIds.length > 0,
  ).length;
  const objectionsResolved = dialogue.objections.filter(
    (objection) => objection.handling.state === "resolved",
  ).length;
  const objectionsPartiallyResolved = dialogue.objections.filter(
    (objection) => objection.handling.state === "partially_resolved",
  ).length;
  const objectionsUnresolved = dialogue.objections.filter(
    (objection) => objection.handling.state === "unresolved",
  ).length;
  const rows: MetricRow[] = [
    {
      metric_key: "customer_question_count",
      numeric_value: customerQuestions.length,
      unit: "turns",
    },
    { metric_key: "customer_questions_answered", numeric_value: answered, unit: "turns" },
    { metric_key: "customer_questions_partially_answered", numeric_value: partial, unit: "turns" },
    { metric_key: "customer_questions_unanswered", numeric_value: unanswered, unit: "turns" },
    { metric_key: "customer_questions_uncertain", numeric_value: uncertain, unit: "turns" },
    {
      metric_key: "customer_questions_with_response",
      numeric_value: questionsWithResponse,
      unit: "turns",
    },
    {
      metric_key: "representative_question_count",
      numeric_value: representativeQuestions.length,
      unit: "turns",
    },
    { metric_key: "objection_count", numeric_value: dialogue.objections.length, unit: "turns" },
    {
      metric_key: "objections_with_response",
      numeric_value: objectionsWithResponse,
      unit: "turns",
    },
    { metric_key: "objections_resolved", numeric_value: objectionsResolved, unit: "turns" },
    {
      metric_key: "objections_partially_resolved",
      numeric_value: objectionsPartiallyResolved,
      unit: "turns",
    },
    { metric_key: "objections_unresolved", numeric_value: objectionsUnresolved, unit: "turns" },
  ];
  if (customerQuestions.length) {
    rows.push({
      metric_key: "customer_question_response_coverage",
      numeric_value: questionsWithResponse / customerQuestions.length,
      unit: "ratio",
    });
  }
  if (dialogue.objections.length) {
    rows.push({
      metric_key: "objection_response_coverage",
      numeric_value: objectionsWithResponse / dialogue.objections.length,
      unit: "ratio",
    });
  }
  return rows;
}

/** Provider chunks within this gap are one conversational turn. */
export const SAME_SPEAKER_GAP_TOLERANCE_MILLISECONDS = 250;

type ParticipantGroup = "representative" | "customer" | null;
type MergedTurn = { endMilliseconds: number; group: ParticipantGroup; startMilliseconds: number };

function participantGroup(role: MetricRole): ParticipantGroup {
  if (role === "representative") return "representative";
  if (role === "customer" || role === "additional_customer") return "customer";
  return null;
}

function orderedValidSegments(segments: MetricSegment[]) {
  return segments
    .filter(
      (segment) =>
        Number.isFinite(segment.start_milliseconds) &&
        Number.isFinite(segment.end_milliseconds) &&
        segment.end_milliseconds >= segment.start_milliseconds,
    )
    .sort((left, right) => left.start_milliseconds - right.start_milliseconds);
}

function positiveDurationSegments(segments: MetricSegment[]) {
  return orderedValidSegments(segments).filter(
    (segment) => segment.end_milliseconds > segment.start_milliseconds,
  );
}

function speechDuration(segments: MetricSegment[]) {
  return segments.reduce(
    (total, segment) => total + (segment.end_milliseconds - segment.start_milliseconds),
    0,
  );
}

/** Whitespace tokens are an explicit multilingual approximation. */
export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSegmentWords(segments: MetricSegment[]) {
  return segments.reduce((total, segment) => total + countWords(segment.original_text), 0);
}

export function mergeConversationalTurns(segments: MetricSegment[]): MergedTurn[] {
  const turns: MergedTurn[] = [];
  for (const segment of positiveDurationSegments(segments)) {
    const group = participantGroup(segment.role);
    const previous = turns.at(-1);
    if (
      previous &&
      previous.group === group &&
      group !== null &&
      segment.start_milliseconds <=
        previous.endMilliseconds + SAME_SPEAKER_GAP_TOLERANCE_MILLISECONDS
    ) {
      previous.endMilliseconds = Math.max(previous.endMilliseconds, segment.end_milliseconds);
      continue;
    }
    turns.push({
      endMilliseconds: segment.end_milliseconds,
      group,
      startMilliseconds: segment.start_milliseconds,
    });
  }
  return turns;
}

export function longestUninterruptedSpeech(segments: MetricSegment[]) {
  return mergeConversationalTurns(segments).reduce(
    (longest, turn) => Math.max(longest, turn.endMilliseconds - turn.startMilliseconds),
    0,
  );
}

function participantMetrics(segments: MetricSegment[], group: Exclude<ParticipantGroup, null>) {
  const participantSegments = positiveDurationSegments(segments).filter(
    (segment) => participantGroup(segment.role) === group,
  );
  const duration = speechDuration(participantSegments);
  const wordCount = countSegmentWords(participantSegments);
  const turns = mergeConversationalTurns(segments).filter((turn) => turn.group === group);
  return {
    duration,
    longestMonologue: turns.reduce(
      (longest, turn) => Math.max(longest, turn.endMilliseconds - turn.startMilliseconds),
      0,
    ),
    turnCount: turns.length,
    wordCount,
    wordsPerMinute: duration === 0 ? null : (wordCount * 60_000) / duration,
  };
}

export function metricRows(segments: MetricSegment[]): MetricRow[] {
  const valid = orderedValidSegments(segments);
  const interactionDuration =
    valid.length === 0
      ? 0
      : Math.max(...valid.map((segment) => segment.end_milliseconds)) -
        Math.min(...valid.map((segment) => segment.start_milliseconds));
  const representative = participantMetrics(valid, "representative");
  const customer = participantMetrics(valid, "customer");
  const bilateralDuration = representative.duration + customer.duration;
  const rows: MetricRow[] = [
    {
      metric_key: "interaction_duration",
      numeric_value: interactionDuration,
      unit: "milliseconds",
    },
    {
      metric_key: "representative_talk_duration",
      numeric_value: representative.duration,
      unit: "milliseconds",
    },
    {
      metric_key: "customer_talk_duration",
      numeric_value: customer.duration,
      unit: "milliseconds",
    },
    {
      metric_key: "representative_word_count",
      numeric_value: representative.wordCount,
      unit: "words",
    },
    { metric_key: "customer_word_count", numeric_value: customer.wordCount, unit: "words" },
    {
      metric_key: "representative_turn_count",
      numeric_value: representative.turnCount,
      unit: "turns",
    },
    { metric_key: "customer_turn_count", numeric_value: customer.turnCount, unit: "turns" },
    {
      metric_key: "representative_longest_monologue",
      numeric_value: representative.longestMonologue,
      unit: "milliseconds",
    },
    {
      metric_key: "customer_longest_monologue",
      numeric_value: customer.longestMonologue,
      unit: "milliseconds",
    },
    {
      metric_key: "turn_count",
      numeric_value: representative.turnCount + customer.turnCount,
      unit: "turns",
    },
    {
      metric_key: "longest_uninterrupted_speech",
      numeric_value: Math.max(representative.longestMonologue, customer.longestMonologue),
      unit: "milliseconds",
    },
  ];
  if (bilateralDuration > 0) {
    rows.push(
      {
        metric_key: "representative_talk_share",
        numeric_value: representative.duration / bilateralDuration,
        unit: "ratio",
      },
      {
        metric_key: "customer_talk_share",
        numeric_value: customer.duration / bilateralDuration,
        unit: "ratio",
      },
    );
  }
  if (representative.wordsPerMinute !== null) {
    rows.push({
      metric_key: "representative_words_per_minute",
      numeric_value: representative.wordsPerMinute,
      unit: "words_per_minute",
    });
  }
  if (customer.wordsPerMinute !== null) {
    rows.push({
      metric_key: "customer_words_per_minute",
      numeric_value: customer.wordsPerMinute,
      unit: "words_per_minute",
    });
  }
  return rows;
}
