import { NextResponse } from "next/server";
import { z } from "zod";
import { start } from "workflow/api";

import { createClient } from "@/lib/supabase/server";
import { processInteractionReviewWorkflow } from "@/workflows/process-interaction-review";

const bodySchema = z.object({
  trigger: z.enum(["initial", "correction", "configuration_change", "manual"]).default("initial"),
});
type Context = { params: Promise<{ conversationId: string }> };

export async function POST(request: Request, { params }: Context) {
  const { conversationId } = await params;
  if (!z.string().uuid().safeParse(conversationId).success) {
    return NextResponse.json({ error: "Invalid interaction." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid review request." }, { status: 400 });

  const db = await createClient();
  const { data, error } = await db.rpc("request_interaction_review", {
    p_conversation_id: conversationId,
    p_trigger_reason: parsed.data.trigger,
  });
  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Interaction review could not start." },
      { status: error?.code === "42501" ? 403 : 400 },
    );
  }
  await start(processInteractionReviewWorkflow, [data]);
  return NextResponse.json({ reviewRunId: data, status: "pending" }, { status: 202 });
}
