import { sleep } from "workflow";

import {
  failTranscriptionStep,
  persistTranscriptStep,
  pollTranscriptionStep,
  submitTranscriptionStep,
} from "@/modules/transcription/processing";

function safeError(error: unknown): string {
  return error instanceof Error
    ? error.message.slice(0, 500)
    : "Processing could not be completed.";
}

/** Durable polling is used because Sarvam's Batch callback only signals completion;
 * the actual transcript still requires a protected result download. */
export async function processTranscriptionRun(transcriptionRunId: string) {
  "use workflow";

  try {
    await submitTranscriptionStep(transcriptionRunId);
    for (let attempt = 0; attempt < 720; attempt += 1) {
      const status = await pollTranscriptionStep(transcriptionRunId);
      if (status.state === "completed") {
        await persistTranscriptStep(
          transcriptionRunId,
          status.providerRequestId,
          status.outputFileNames,
        );
        return { status: "completed" as const };
      }
      if (status.state === "failed") {
        await failTranscriptionStep(
          transcriptionRunId,
          status.message ?? "Sarvam marked the job as failed.",
        );
        return { status: "failed" as const };
      }
      await sleep("15s");
    }
    await failTranscriptionStep(
      transcriptionRunId,
      "Sarvam did not complete within the three-hour processing window.",
    );
    return { status: "timed_out" as const };
  } catch (error) {
    await failTranscriptionStep(transcriptionRunId, safeError(error));
    return { status: "failed" as const };
  }
}
