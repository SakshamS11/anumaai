import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const entrySchema = z.object({
  providerSpeakerIdentifier: z.string().trim().min(1).max(120),
  participantRole: z.enum([
    "representative",
    "customer",
    "additional_customer",
    "manager",
    "unknown",
  ]),
  participantId: z.string().uuid().nullable(),
});
const requestSchema = z.object({ entries: z.array(entrySchema).min(1).max(20) });
type RouteContext = { params: Promise<{ runId: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const { runId } = await params;
  const payload = requestSchema.safeParse(await request.json().catch(() => null));
  if (!z.string().uuid().safeParse(runId).success || !payload.success) {
    return NextResponse.json({ error: "The speaker mapping is invalid." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_speaker_mapping_version", {
    p_transcription_run_id: runId,
    p_entries: payload.data.entries,
  });
  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Speaker mapping could not be saved." },
      { status: error?.code === "42501" ? 403 : 400 },
    );
  }
  return NextResponse.json({ mappingVersionId: data });
}
