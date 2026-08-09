import { redirect } from "next/navigation";

import {
  resendInvitation,
  invitePerson,
  updateMember,
} from "@/app/(app)/administration/people/actions";
import { AdminNavigation } from "@/components/administration/admin-navigation";
import { ActionDialog } from "@/components/ui/action-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getApplicationContext } from "@/modules/identity/application-context";
import { roleLabel } from "@/modules/identity/roles";

type Member = {
  id: string;
  user_id: string;
  role: "representative" | "manager" | "admin";
  status: "active" | "inactive";
  created_at: string;
};
type Profile = { user_id: string; email: string; display_name: string | null };
type Assignment = { membership_id: string; location_id: string | null; team_id: string | null };
type Invitation = {
  id: string;
  email: string;
  role: "representative" | "manager" | "admin";
  status: "pending" | "accepted" | "expired" | "revoked";
  created_at: string;
  delivery_status: "pending" | "sent" | "failed";
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    created?: string;
    q?: string;
    role?: string;
    status?: string;
  }>;
}) {
  const [context, message] = await Promise.all([getApplicationContext(), searchParams]);
  if (!context) redirect("/sign-in");
  if (!context.current) redirect("/setup");
  if (context.current.membership.role !== "admin") redirect("/administration");
  const current = context.current;
  const database = (await createClient()) as unknown as { from: (relation: string) => any };
  const [{ data: members }, { data: profiles }, { data: assignments }, { data: invitations }] =
    await Promise.all([
      database
        .from("organization_memberships")
        .select("id,user_id,role,status,created_at")
        .eq("organization_id", current.organization.id),
      database.from("user_profiles").select("user_id,email,display_name"),
      database
        .from("member_assignments")
        .select("membership_id,location_id,team_id")
        .eq("organization_id", current.organization.id)
        .is("effective_to", null),
      database
        .from("organization_invitations")
        .select("id,email,role,status,created_at,delivery_status")
        .eq("organization_id", current.organization.id)
        .order("created_at", { ascending: false }),
    ]);
  const allMembers = (members ?? []) as Member[];
  const allInvitations = (invitations ?? []) as Invitation[];
  const profileById = new Map(
    ((profiles ?? []) as Profile[]).map((profile) => [profile.user_id, profile]),
  );
  const assignmentById = new Map(
    ((assignments ?? []) as Assignment[]).map((assignment) => [
      assignment.membership_id,
      assignment,
    ]),
  );
  const locations = new Map(current.locations.map((location) => [location.id, location.name]));
  const teams = new Map(current.teams.map((team) => [team.id, team.name]));
  const query = message.q?.trim().toLowerCase() ?? "";
  const filteredMembers = allMembers.filter((member) => {
    const profile = profileById.get(member.user_id);
    const matchesQuery =
      !query ||
      profile?.email.toLowerCase().includes(query) ||
      profile?.display_name?.toLowerCase().includes(query);
    return (
      matchesQuery &&
      (!message.role || member.role === message.role) &&
      (!message.status || member.status === message.status)
    );
  });
  const visibleInvitations = allInvitations.filter((invitation) => {
    const matchesQuery = !query || invitation.email.toLowerCase().includes(query);
    return (
      matchesQuery &&
      (!message.role || invitation.role === message.role) &&
      (!message.status || invitation.status === message.status)
    );
  });
  const date = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
  return (
    <>
      <div className="page-heading-row">
        <div>
          <PageHeader eyebrow="Organization access" title="People" />
          <p className="section-copy">Manage who can access ANUMA and where they work.</p>
        </div>
        <ActionDialog
          buttonLabel="Invite person"
          eyebrow="Organization access"
          title="Invite person"
        >
          <form action={invitePerson} className="product-form">
            <label className="form-field form-field-wide">
              <span>Work email</span>
              <input autoComplete="email" name="email" required type="email" />
            </label>
            <label className="form-field">
              <span>Role</span>
              <select defaultValue="representative" name="role">
                <option value="representative">Representative</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </label>
            <p className="role-explanation form-field-wide">
              <strong>Representative</strong> captures and reviews their own interactions.{" "}
              <strong>Manager</strong> reviews assigned scope. <strong>Administrator</strong>{" "}
              manages the organization.
            </p>
            <label className="form-field">
              <span>Location</span>
              <select defaultValue="" name="location_id">
                <option value="">No location scope</option>
                {current.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Team</span>
              <select defaultValue="" name="team_id">
                <option value="">No team scope</option>
                {current.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button button-primary form-field-wide" type="submit">
              Send invitation
            </button>
          </form>
        </ActionDialog>
      </div>
      <AdminNavigation />
      {message.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {message.error}
        </p>
      ) : null}
      {message.created ? (
        <p className="auth-message" role="status">
          {message.created === "resent"
            ? "Invitation resent."
            : message.created === "member"
              ? "Member access updated."
              : "Invitation sent."}
        </p>
      ) : null}
      <section className="directory-summary">
        <span>Active {allMembers.filter((member) => member.status === "active").length}</span>
        <span>Invited {allInvitations.filter((invite) => invite.status === "pending").length}</span>
        <span>
          Managers{" "}
          {
            allMembers.filter((member) => member.role === "manager" && member.status === "active")
              .length
          }
        </span>
        <span>
          Representatives{" "}
          {
            allMembers.filter(
              (member) => member.role === "representative" && member.status === "active",
            ).length
          }
        </span>
      </section>
      <form className="directory-filters" method="get">
        <label className="form-field">
          <span>Search</span>
          <input defaultValue={message.q ?? ""} name="q" type="search" />
        </label>
        <label className="form-field">
          <span>Role</span>
          <select defaultValue={message.role ?? ""} name="role">
            <option value="">All roles</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="representative">Representative</option>
          </select>
        </label>
        <label className="form-field">
          <span>Status</span>
          <select defaultValue={message.status ?? ""} name="status">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Invited</option>
            <option value="expired">Expired</option>
          </select>
        </label>
        <button className="button button-secondary" type="submit">
          Apply
        </button>
      </form>
      <section className="product-panel">
        <div className="directory-table people-directory" role="table" aria-label="People">
          <div className="directory-row directory-head" role="row">
            <span>Person</span>
            <span>Role</span>
            <span>Scope</span>
            <span>Status</span>
            <span>Joined / invited</span>
          </div>
          {visibleInvitations.map((invitation) => (
            <div className="directory-row" key={invitation.id} role="row">
              <span>
                <strong>{invitation.email}</strong>
                <small>Invitation</small>
              </span>
              <span>{roleLabel(invitation.role)}</span>
              <span>Pending assignment</span>
              <span>
                {invitation.status === "pending" && invitation.delivery_status === "failed"
                  ? "Send failed"
                  : invitation.status}
              </span>
              <span>
                {date.format(new Date(invitation.created_at))}
                {["pending", "expired"].includes(invitation.status) ? (
                  <form action={resendInvitation}>
                    <input name="invitation_id" type="hidden" value={invitation.id} />
                    <button className="text-button" type="submit">
                      Resend
                    </button>
                  </form>
                ) : null}
              </span>
            </div>
          ))}
          {filteredMembers.map((member) => {
            const profile = profileById.get(member.user_id);
            const assignment = assignmentById.get(member.id);
            const scope =
              [
                assignment?.location_id ? locations.get(assignment.location_id) : null,
                assignment?.team_id ? teams.get(assignment.team_id) : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Organization-wide";
            return (
              <details className="directory-row" key={member.id}>
                <summary>
                  <span>
                    <strong>{profile?.display_name ?? profile?.email ?? "Team member"}</strong>
                    <small>{profile?.email ?? "Profile pending"}</small>
                  </span>
                  <span>{roleLabel(member.role)}</span>
                  <span>{scope}</span>
                  <span>{member.status}</span>
                  <span>{date.format(new Date(member.created_at))}</span>
                </summary>
                <form action={updateMember} className="compact-form">
                  <input name="membership_id" type="hidden" value={member.id} />
                  <label className="form-field">
                    <span>Role</span>
                    <select defaultValue={member.role} name="role">
                      <option value="representative">Representative</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Status</span>
                    <select defaultValue={member.status} name="status">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Location</span>
                    <select defaultValue={assignment?.location_id ?? ""} name="location_id">
                      <option value="">No location</option>
                      {current.locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Team</span>
                    <select defaultValue={assignment?.team_id ?? ""} name="team_id">
                      <option value="">No team</option>
                      {current.teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="button button-secondary" type="submit">
                    Save access
                  </button>
                </form>
              </details>
            );
          })}
        </div>
        {!visibleInvitations.length && !filteredMembers.length ? (
          <div className="editorial-empty">
            <h2>No one matches these filters</h2>
            <p>Clear the filters or invite a manager or representative.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
