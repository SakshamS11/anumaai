import { redirect } from "next/navigation";

import { createConversation } from "@/app/(app)/conversations/actions";
import { PageHeader } from "@/components/ui/page-header";
import { deriveConversationState, listConversations } from "@/modules/conversations/data";
import { getApplicationContext } from "@/modules/identity/application-context";
import { createClient } from "@/lib/supabase/server";

type ConversationsPageProps = { searchParams: Promise<{ created?: string; error?: string }> };

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const [context, message] = await Promise.all([getApplicationContext(), searchParams]);
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");

  const { organization, membership, assignments, locations, teams } = context.current;
  const supabase = await createClient();
  const [conversations, profileResult] = await Promise.all([
    listConversations(organization.id),
    supabase
      .from("user_profiles")
      .select("display_name")
      .eq("user_id", context.user.id)
      .maybeSingle(),
  ]);
  const assignedLocationIds = new Set(
    assignments.flatMap((item) => (item.locationId ? [item.locationId] : [])),
  );
  const assignedTeamIds = new Set(
    assignments.flatMap((item) => (item.teamId ? [item.teamId] : [])),
  );
  const allowedLocations =
    membership.role === "admin"
      ? locations
      : locations.filter((item) => assignedLocationIds.has(item.id));
  const allowedTeams =
    membership.role === "admin" ? teams : teams.filter((item) => assignedTeamIds.has(item.id));
  const canCreate =
    membership.role === "admin" || (membership.role === "representative" && assignments.length > 0);
  const locationNames = new Map(locations.map((item) => [item.id, item.name]));
  const teamNames = new Map(teams.map((item) => [item.id, item.name]));
  const dateFormatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: organization.timezone,
  });
  const timeFormatter = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: organization.timezone,
  });
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      hour12: false,
      timeZone: organization.timezone,
    }).format(new Date()),
  );
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName =
    profileResult.data?.display_name ?? context.user.email?.split("@")[0] ?? "there";
  const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: organization.timezone });
  const today = localDate.format(new Date());
  const todayCount = conversations.filter(
    (conversation) => localDate.format(new Date(conversation.startedAt)) === today,
  ).length;
  const representativeView = membership.role === "representative";

  return (
    <>
      <div className="page-heading-row">
        <PageHeader
          eyebrow={representativeView ? "Your frontline work" : "Interactions"}
          title={representativeView ? `${greeting}, ${displayName}.` : "Conversations"}
        />
        {canCreate ? (
          <a className="button button-primary" href="#new-interaction">
            {representativeView ? "Start interaction" : "New interaction"}
          </a>
        ) : null}
      </div>
      {message.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {message.error}
        </p>
      ) : null}
      {message.created ? (
        <p className="auth-message" role="status">
          New interaction created. No audio is attached yet.
        </p>
      ) : null}

      {representativeView ? (
        <section className="representative-today">
          <span>Today</span>
          <strong>
            {todayCount} interaction{todayCount === 1 ? "" : "s"}
          </strong>
        </section>
      ) : null}

      {canCreate ? (
        <section
          className="interaction-creation"
          id="new-interaction"
          aria-labelledby="new-interaction-title"
        >
          <div>
            <p className="eyebrow">Prepare an interaction</p>
            <h2 id="new-interaction-title">Prepare the interaction before recording.</h2>
            <p>
              Record the interaction context and the customer&apos;s recording-consent decision. You
              can record or upload audio after this step.
            </p>
          </div>
          <form action={createConversation} className="product-form">
            <label className="form-field form-field-wide">
              <span>Interaction label (optional)</span>
              <input maxLength={160} name="title" placeholder="Saturday laptop enquiry" />
            </label>
            <label className="form-field">
              <span>Vertical</span>
              <select defaultValue="electronics" name="vertical">
                <option value="electronics">Electronics</option>
                <option value="automotive">Automotive</option>
              </select>
            </label>
            {representativeView && allowedLocations.length === 1 ? (
              <>
                <input name="location_id" type="hidden" value={allowedLocations[0].id} />
                <p className="form-context">
                  <span>Location</span>
                  <strong>{allowedLocations[0].name}</strong>
                </p>
              </>
            ) : (
              <label className="form-field">
                <span>Location</span>
                <select defaultValue="" name="location_id">
                  <option value="">No location</option>
                  {allowedLocations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {representativeView && allowedTeams.length === 1 ? (
              <>
                <input name="team_id" type="hidden" value={allowedTeams[0].id} />
                <p className="form-context">
                  <span>Team</span>
                  <strong>{allowedTeams[0].name}</strong>
                </p>
              </>
            ) : (
              <label className="form-field">
                <span>Team</span>
                <select defaultValue="" name="team_id">
                  <option value="">No team</option>
                  {allowedTeams.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="form-field">
              <span>Customer recording consent</span>
              <select defaultValue="unknown" name="consent_status">
                <option value="granted">Granted</option>
                <option value="declined">Declined</option>
                <option value="not_required">Not required</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
            <label className="form-field">
              <span>How was consent captured?</span>
              <select defaultValue="verbal" name="consent_capture_method">
                <option value="verbal">Verbal</option>
                <option value="written">Written</option>
                <option value="digital">Digital</option>
                <option value="other">Other</option>
              </select>
            </label>
            <p className="consent-note form-field-wide">
              This records product-level consent provenance. Legal requirements remain specific to
              the organization and jurisdiction.
            </p>
            <button className="button button-primary form-field-wide" type="submit">
              {representativeView ? "Start interaction" : "Create interaction"}
            </button>
          </form>
        </section>
      ) : (
        <p className="security-note">
          An administrator must assign your membership to a location or team before you can prepare
          an interaction.
        </p>
      )}

      <section className="conversation-section" aria-labelledby="conversation-list-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your authorized scope</p>
            <h2 id="conversation-list-title">
              {representativeView ? "Recent interactions" : "Interaction record"}
            </h2>
          </div>
          <span className="count-label">{conversations.length}</span>
        </div>
        {conversations.length ? (
          <ol className="interaction-list">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <time dateTime={conversation.startedAt}>
                  <strong>{timeFormatter.format(new Date(conversation.startedAt))}</strong>
                  <span>{dateFormatter.format(new Date(conversation.startedAt))}</span>
                </time>
                <div className="interaction-main">
                  <h3>
                    <a href={`/conversations/${conversation.id}`}>
                      {conversation.title ?? "Untitled interaction"}
                    </a>
                  </h3>
                  <p>
                    {conversation.vertical} <span aria-hidden="true">·</span>{" "}
                    {conversation.locationId
                      ? (locationNames.get(conversation.locationId) ?? "Scoped location")
                      : "No location"}
                    {conversation.teamId ? (
                      <>
                        <span aria-hidden="true">·</span>{" "}
                        {teamNames.get(conversation.teamId) ?? "Scoped team"}
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="interaction-status">
                  <span>
                    Customer recording consent:{" "}
                    {conversation.consentStatus?.replaceAll("_", " ") ?? "not recorded"}
                  </span>
                  <span className="status-badge status-badge-neutral">
                    {deriveConversationState(conversation)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="editorial-empty">
            <p className="eyebrow">No interactions yet</p>
            <h3>This is where prepared customer interactions will appear.</h3>
            <p>
              Start a new interaction to record its business context and customer recording consent,
              then record or upload its audio.
            </p>
            {canCreate ? (
              <a className="button button-secondary" href="#new-interaction">
                Start interaction
              </a>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
