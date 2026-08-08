import { createClient } from "@/lib/supabase/server";

export type ConversationListItem = {
  id: string;
  title: string | null;
  vertical: "electronics" | "automotive";
  startedAt: string;
  lifecycleStatus: string;
  locationId: string | null;
  teamId: string | null;
  recordingCount: number;
  consentStatus: string | null;
};

export async function listConversations(organizationId: string): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, title, vertical, started_at, lifecycle_status, location_id, team_id")
    .eq("organization_id", organizationId)
    .order("started_at", { ascending: false });

  if (error) throw new Error("Could not load conversations.");
  if (conversations.length === 0) return [];

  const ids = conversations.map((conversation) => conversation.id);
  const [recordingsResult, consentResult] = await Promise.all([
    supabase.from("recordings").select("conversation_id").in("conversation_id", ids),
    supabase
      .from("consent_records")
      .select("conversation_id, status, captured_at")
      .in("conversation_id", ids)
      .order("captured_at", { ascending: false }),
  ]);

  if (recordingsResult.error || consentResult.error) {
    throw new Error("Could not load conversation foundation metadata.");
  }

  const recordingCount = new Map<string, number>();
  for (const recording of recordingsResult.data) {
    recordingCount.set(
      recording.conversation_id,
      (recordingCount.get(recording.conversation_id) ?? 0) + 1,
    );
  }
  const consentByConversation = new Map<string, string>();
  for (const consent of consentResult.data) {
    if (!consentByConversation.has(consent.conversation_id)) {
      consentByConversation.set(consent.conversation_id, consent.status);
    }
  }

  return conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    vertical: conversation.vertical,
    startedAt: conversation.started_at,
    lifecycleStatus: conversation.lifecycle_status,
    locationId: conversation.location_id,
    teamId: conversation.team_id,
    recordingCount: recordingCount.get(conversation.id) ?? 0,
    consentStatus: consentByConversation.get(conversation.id) ?? null,
  }));
}
