export type MetricSegment = {
  end_milliseconds: number;
  original_text: string;
  role: "representative" | "customer" | "unknown" | "manager" | "additional_customer";
  start_milliseconds: number;
};

/**
 * Provider chunks occasionally leave a tiny timestamp gap within one turn.
 * The metric reports the full conversational-turn span, so this tolerance is
 * included in the duration instead of treating provider chunking as a new turn.
 */
export const SAME_SPEAKER_GAP_TOLERANCE_MILLISECONDS = 250;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function longestUninterruptedSpeech(segments: MetricSegment[]) {
  const ordered = [...segments].sort(
    (left, right) => left.start_milliseconds - right.start_milliseconds,
  );
  let longest = 0;
  let currentRole: MetricSegment["role"] | null = null;
  let currentStart = 0;
  let currentEnd = 0;
  for (const segment of ordered) {
    const start = Number(segment.start_milliseconds);
    const end = Number(segment.end_milliseconds);
    if (
      segment.role === currentRole &&
      start <= currentEnd + SAME_SPEAKER_GAP_TOLERANCE_MILLISECONDS
    ) {
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

export function metricRows(segments: MetricSegment[]) {
  const ordered = [...segments].sort(
    (left, right) => left.start_milliseconds - right.start_milliseconds,
  );
  const duration =
    Math.max(...ordered.map((segment) => segment.end_milliseconds)) -
    Math.min(...ordered.map((segment) => segment.start_milliseconds));
  const byRole = (role: MetricSegment["role"]) =>
    ordered.filter((segment) => segment.role === role);
  const speechDuration = (items: MetricSegment[]) =>
    items.reduce(
      (total, item) => total + Math.max(0, item.end_milliseconds - item.start_milliseconds),
      0,
    );
  const representative = byRole("representative");
  const customer = [...byRole("customer"), ...byRole("additional_customer")];
  const representativeDuration = speechDuration(representative);
  const customerDuration = speechDuration(customer);
  const mappedSpeechDuration = speechDuration(ordered);
  const wordsPerMinute = (items: MetricSegment[]) => {
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
    {
      metric_key: "longest_uninterrupted_speech",
      numeric_value: longestUninterruptedSpeech(ordered),
      unit: "milliseconds",
    },
  ];
}
