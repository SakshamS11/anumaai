export type CheckState = "met" | "not_met" | "partial" | "not_applicable" | "insufficient_evidence";

export type ReviewCheck = {
  applicability: "every_interaction" | "when_relevant";
  evaluationStrategy: "observation" | "phrase" | "semantic";
  key: string;
  observationTypes: string[];
  phrase: string | null;
};

export type ReviewObservation = {
  evidenceGroupId: string;
  type: string;
  valueText: string | null;
};

export type ReviewSegment = { role: string; text: string };

export function evaluateCheck(
  check: ReviewCheck,
  observations: ReviewObservation[],
  segments: ReviewSegment[],
): { evidenceGroupId: string | null; explanation: string; state: CheckState } {
  const relevantObservations = observations.filter((observation) =>
    check.observationTypes.includes(observation.type),
  );
  const transcript = segments
    .map((segment) => segment.text)
    .join("\n")
    .toLocaleLowerCase();
  const priceRelevant = observations.some((item) =>
    ["objection", "competitor", "competitor_price", "price"].includes(item.type),
  );
  const financeRelevant = observations.some(
    (item) => item.type === "finance" || /\bemi\b/i.test(item.valueText ?? ""),
  );
  const relevant = check.key.includes("price")
    ? priceRelevant
    : check.key.includes("finance")
      ? financeRelevant
      : true;
  if (check.applicability === "when_relevant" && !relevant) {
    return {
      evidenceGroupId: null,
      explanation: "This check was not relevant to the interaction.",
      state: "not_applicable",
    };
  }
  if (check.evaluationStrategy === "observation") {
    return relevantObservations.length
      ? {
          evidenceGroupId: relevantObservations[0].evidenceGroupId,
          explanation: "Matching interaction evidence was observed.",
          state: "met",
        }
      : {
          evidenceGroupId: null,
          explanation: "Applicable check, but no matching evidence was observed.",
          state: "not_met",
        };
  }
  if (check.evaluationStrategy === "phrase") {
    const found = check.phrase && transcript.includes(check.phrase.toLocaleLowerCase());
    return found
      ? {
          evidenceGroupId: null,
          explanation: "The configured phrase was observed in the transcript.",
          state: "met",
        }
      : {
          evidenceGroupId: null,
          explanation: "The configured phrase was not observed in the transcript.",
          state: "not_met",
        };
  }
  const representativeText = segments
    .filter((segment) => segment.role === "representative")
    .map((segment) => segment.text)
    .join(" ");
  if (check.key === "customer_greeted") {
    const greeted = /\b(hello|hi|welcome|namaste|vanakkam)\b/i.test(representativeText);
    return {
      evidenceGroupId: null,
      explanation: greeted ? "A greeting was observed." : "No clear greeting was observed.",
      state: greeted ? "met" : "not_met",
    };
  }
  if (check.key === "price_objection_handled") {
    const valueResponse = /\b(bank offer|warranty|availability|alternative|exchange|value)\b/i.test(
      representativeText,
    );
    return {
      evidenceGroupId: relevantObservations[0]?.evidenceGroupId ?? null,
      explanation: valueResponse
        ? "A value response followed the price comparison."
        : "No clear value response was observed after the price comparison.",
      state: valueResponse ? "partial" : "not_met",
    };
  }
  if (check.key === "finance_emi_addressed") {
    const addressed = /\b(emi|bank offer|finance)\b/i.test(representativeText);
    return {
      evidenceGroupId: relevantObservations[0]?.evidenceGroupId ?? null,
      explanation: addressed
        ? "A finance response was observed."
        : "No clear finance response was observed.",
      state: addressed ? "met" : "not_met",
    };
  }
  if (check.key === "customer_questions_addressed") {
    const addressed =
      observations.some((item) => item.type === "question") && representativeText.trim().length > 0;
    return {
      evidenceGroupId: relevantObservations[0]?.evidenceGroupId ?? null,
      explanation: addressed
        ? "A representative response was observed after the customer question."
        : "The question could not be linked to a clear response.",
      state: addressed ? "met" : "insufficient_evidence",
    };
  }
  return {
    evidenceGroupId: null,
    explanation: "The available evidence is insufficient for this check.",
    state: "insufficient_evidence",
  };
}

export function calculateScorecard(results: Array<{ state: CheckState; weight: number }>) {
  const applicable = results.filter((item) => item.state !== "not_applicable");
  const evaluated = applicable.filter((item) => item.state !== "insufficient_evidence");
  const denominator = evaluated.reduce((total, item) => total + item.weight, 0);
  const numerator = evaluated.reduce(
    (total, item) =>
      total +
      (item.state === "met" ? item.weight : item.state === "partial" ? item.weight * 0.5 : 0),
    0,
  );
  return {
    applicableCheckCount: applicable.length,
    evaluatedCheckCount: evaluated.length,
    insufficientEvidenceCount: applicable.length - evaluated.length,
    scorePercent: denominator === 0 ? null : (numerator / denominator) * 100,
  };
}
