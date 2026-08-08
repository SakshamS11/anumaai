import { redirect } from "next/navigation";

import { createConversation } from "@/app/(app)/conversations/actions";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { listConversations } from "@/modules/conversations/data";
import { getApplicationContext } from "@/modules/identity/application-context";

type ConversationsPageProps = { searchParams: Promise<{ created?: string; error?: string }> };

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const [context, message] = await Promise.all([getApplicationContext(), searchParams]);
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");

  const { organization, membership, assignments, locations, teams } = context.current;
  const conversations = await listConversations(organization.id);
  const assignedLocationIds = new Set(
    assignments.flatMap((assignment) => (assignment.locationId ? [assignment.locationId] : [])),
  );
  const assignedTeamIds = new Set(
    assignments.flatMap((assignment) => (assignment.teamId ? [assignment.teamId] : [])),
  );
  const allowedLocations =
    membership.role === "admin"
      ? locations
      : locations.filter((location) => assignedLocationIds.has(location.id));
  const allowedTeams =
    membership.role === "admin" ? teams : teams.filter((team) => assignedTeamIds.has(team.id));
  const canCreate = membership.role === "admin" || assignments.length > 0;
  const locationNames = new Map(locations.map((location) => [location.id, location.name]));
  const teamNames = new Map(teams.map((team) => [team.id, team.name]));
  const formatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: organization.timezone,
  });

  return (
    <>
      <PageHeader eyebrow="Persistent interaction records" title="Conversations" />
      {message.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {message.error}
        </p>
      ) : null}
      {message.created ? (
        <p className="auth-message" role="status">
          Conversation shell created. No audio is attached yet.
        </p>
      ) : null}

      <section className="product-panel conversation-create-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Phase 2 foundation</p>
            <h2>Create a conversation shell</h2>
          </div>
          <StatusBadge label="No recording yet" />
        </div>
        <p className="section-copy">
          Create the secure business record that Phase 3 will attach audio to. No transcript or
          intelligence is fabricated.
        </p>
        {canCreate ? (
          <form action={createConversation} className="product-form">
            <label className="form-field form-field-wide">
              <span>Label (optional)</span>
              <input maxLength={160} name="title" placeholder="Saturday showroom visit" />
            </label>
            <label className="form-field">
              <span>Vertical</span>
              <select defaultValue="electronics" name="vertical">
                <option value="electronics">Electronics</option>
                <option value="automotive">Automotive</option>
              </select>
            </label>
            <label className="form-field">
              <span>Location</span>
              <select defaultValue="" name="location_id">
                <option value="">No location</option>
                {allowedLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Team</span>
              <select defaultValue="" name="team_id">
                <option value="">No team</option>
                {allowedTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Consent status</span>
              <select defaultValue="unknown" name="consent_status">
                <option value="granted">Granted</option>
                <option value="declined">Declined</option>
                <option value="not_required">Not required</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
            <label className="form-field">
              <span>Capture method</span>
              <select defaultValue="verbal" name="consent_capture_method">
                <option value="verbal">Verbal</option>
                <option value="written">Written</option>
                <option value="digital">Digital</option>
                <option value="other">Other</option>
              </select>
            </label>
            <button className="button button-primary form-field-wide" type="submit">
              Create conversation
            </button>
          </form>
        ) : (
          <p className="security-note">
            An administrator must assign your membership to a location or team before you can create
            conversations.
          </p>
        )}
      </section>

      <section className="conversation-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Visible in your scope</p>
            <h2>Conversation records</h2>
          </div>
          <span className="count-label">{conversations.length}</span>
        </div>
        {conversations.length ? (
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <article className="conversation-card" key={conversation.id}>
                <div className="conversation-card-heading">
                  <div>
                    <p className="eyebrow">{conversation.vertical}</p>
                    <h3>{conversation.title ?? "Untitled interaction"}</h3>
                  </div>
                  <StatusBadge label={conversation.lifecycleStatus.replaceAll("_", " ")} />
                </div>
                <dl className="metadata-grid">
                  <div>
                    <dt>Started</dt>
                    <dd>{formatter.format(new Date(conversation.startedAt))}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {conversation.locationId
                        ? (locationNames.get(conversation.locationId) ?? "Scoped location")
                        : "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt>Team</dt>
                    <dd>
                      {conversation.teamId
                        ? (teamNames.get(conversation.teamId) ?? "Scoped team")
                        : "Not set"}
                    </dd>
                  </div>
                  <div>
                    <dt>Consent</dt>
                    <dd>{conversation.consentStatus?.replaceAll("_", " ") ?? "Not recorded"}</dd>
                  </div>
                </dl>
                <p className="audio-state">
                  {conversation.recordingCount
                    ? `${conversation.recordingCount} recording record${conversation.recordingCount === 1 ? "" : "s"}`
                    : "No audio attached — recording begins in Phase 3."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="section-copy">No conversation records exist in your authorized scope.</p>
        )}
      </section>
    </>
  );
}
