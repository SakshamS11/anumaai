import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AudioCapturePanel } from "@/components/conversations/audio-capture-panel";
import { ConversationEvidence } from "@/components/conversations/conversation-evidence";
import { CustomerConsentPanel } from "@/components/conversations/customer-consent-panel";
import { InteractionUnderstanding } from "@/components/conversations/interaction-understanding";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { deriveConversationState, getConversationDetail } from "@/modules/conversations/data";
import { getApplicationContext } from "@/modules/identity/application-context";

type ConversationPageProps = { params: Promise<{ conversationId: string }> };

export default async function ConversationPage({ params }: ConversationPageProps) {
  const [context, route] = await Promise.all([getApplicationContext(), params]);
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  const conversation = await getConversationDetail(route.conversationId);
  if (!conversation) notFound();

  const { membership, organization } = context.current;
  const canProcessAudio =
    membership.role === "admin" || membership.id === conversation.representativeMembershipId;
  const consentAllowsRecording =
    conversation.consentStatus === "granted" || conversation.consentStatus === "not_required";
  const latestRecording =
    conversation.recordings.find((recording) => recording.status === "uploaded") ?? null;

  return (
    <>
      <Link className="back-link" href="/conversations">
        ← Conversations
      </Link>
      <div className="page-heading-row">
        <PageHeader eyebrow="Interaction" title={conversation.title ?? "Untitled interaction"} />
        <StatusBadge
          label={deriveConversationState(conversation)}
          tone={
            conversation.transcriptionStatus === "failed"
              ? "risk"
              : conversation.activeTranscriptionRunId
                ? "warning"
                : "neutral"
          }
        />
      </div>
      <section className="interaction-context" aria-label="Interaction context">
        <dl className="metadata-grid">
          <div>
            <dt>Vertical</dt>
            <dd>{conversation.vertical}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{conversation.locationName ?? "No location"}</dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>{conversation.teamName ?? "No team"}</dd>
          </div>
          <div>
            <dt>Customer recording consent</dt>
            <dd>{conversation.consentStatus?.replaceAll("_", " ") ?? "Not recorded"}</dd>
          </div>
        </dl>
        <p className="consent-note">
          This records product-level consent provenance. Legal requirements remain specific to{" "}
          {organization.name} and the applicable jurisdiction.
        </p>
      </section>
      <CustomerConsentPanel
        conversationId={conversation.id}
        history={conversation.consentHistory}
        canUpdate={canProcessAudio}
      />
      <AudioCapturePanel
        conversationId={conversation.id}
        consentAllowsRecording={consentAllowsRecording}
        canProcessAudio={canProcessAudio}
      />
      {conversation.transcriptionStatus === "pending" ||
      conversation.transcriptionStatus === "running" ? (
        <p className="processing-note" role="status">
          Transcription is continuing securely in the background. You can leave this page and return
          to review its status.
        </p>
      ) : null}
      <ConversationEvidence
        recordingId={latestRecording?.id ?? null}
        transcriptionRunId={conversation.activeTranscriptionRunId}
        segments={conversation.transcriptSegments}
        participants={conversation.participants}
        mappings={conversation.activeMappings}
        canProcessAudio={canProcessAudio}
      />
      <InteractionUnderstanding
        canRequest={
          canProcessAudio &&
          Boolean(conversation.activeTranscriptionRunId) &&
          Boolean(conversation.activeSpeakerMappingVersionId)
        }
        conversationId={conversation.id}
        observations={conversation.observations}
      />
    </>
  );
}
