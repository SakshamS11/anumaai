/** A persisted observation set is the durable completion boundary for an analysis run. */
export function hasPersistedAnalysisResult(observationCount: number) {
  return observationCount > 0;
}
