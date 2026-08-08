import { NextResponse } from "next/server";
import { z } from "zod";
import { start } from "workflow/api";
import { createClient } from "@/lib/supabase/server";
import { processAnalysisRunWorkflow } from "@/workflows/process-analysis-run";
type Context = { params: Promise<{ conversationId: string }> };
export async function POST(_request: Request, { params }: Context) {
  const { conversationId } = await params;
  if (!z.string().uuid().safeParse(conversationId).success)
    return NextResponse.json({ error: "Invalid interaction." }, { status: 400 });
  const db = await createClient();
  const { data, error } = await db.rpc("request_interaction_understanding", {
    p_conversation_id: conversationId,
  });
  if (error || !data)
    return NextResponse.json(
      { error: error?.message ?? "Understanding could not start." },
      { status: error?.code === "42501" ? 403 : 400 },
    );
  await start(processAnalysisRunWorkflow, [data]);
  return NextResponse.json({ analysisRunId: data, status: "pending" }, { status: 202 });
}
