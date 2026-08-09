import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";
import { getApplicationContext } from "@/modules/identity/application-context";
import { invitePerson, updateMember } from "./actions";

type Member = {
  id: string;
  user_id: string;
  role: "representative" | "manager" | "admin";
  status: "active" | "inactive";
};
type Profile = { user_id: string; email: string; display_name: string | null };
type Assignment = { membership_id: string; location_id: string | null; team_id: string | null };
export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
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
        .select("id,user_id,role,status")
        .eq("organization_id", current.organization.id),
      database.from("user_profiles").select("user_id,email,display_name"),
      database
        .from("member_assignments")
        .select("membership_id,location_id,team_id")
        .eq("organization_id", current.organization.id)
        .is("effective_to", null),
      database
        .from("organization_invitations")
        .select("id,email,role,status")
        .eq("organization_id", current.organization.id),
    ]);
  const allMembers = (members ?? []) as Member[];
  const profileById = new Map(((profiles ?? []) as Profile[]).map((p) => [p.user_id, p]));
  const assignmentById = new Map(
    ((assignments ?? []) as Assignment[]).map((a) => [a.membership_id, a]),
  );
  const locations = new Map(current.locations.map((l) => [l.id, l.name]));
  const teams = new Map(current.teams.map((t) => [t.id, t.name]));
  return (
    <>
      <PageHeader eyebrow="Organization access" title="People" />
      <p className="section-copy">Manage who can access ANUMA and where they work.</p>
      {message.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {message.error}
        </p>
      ) : null}
      {message.created ? (
        <p className="auth-message" role="status">
          Saved to {current.organization.name}.
        </p>
      ) : null}
      <section className="directory-summary">
        <span>Active {allMembers.filter((m) => m.status === "active").length}</span>
        <span>
          Invited{" "}
          {(invitations ?? []).filter((i: { status: string }) => i.status === "pending").length}
        </span>
        <span>
          Managers {allMembers.filter((m) => m.role === "manager" && m.status === "active").length}
        </span>
        <span>
          Representatives{" "}
          {allMembers.filter((m) => m.role === "representative" && m.status === "active").length}
        </span>
      </section>
      <details className="admin-drawer">
        <summary className="button button-primary">Invite person</summary>
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
          <label className="form-field">
            <span>Location</span>
            <select defaultValue="" name="location_id">
              <option value="">No location scope</option>
              {current.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Team</span>
            <select defaultValue="" name="team_id">
              <option value="">No team scope</option>
              {current.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-primary" type="submit">
            Send invitation
          </button>
        </form>
      </details>
      <section className="product-panel">
        <div className="directory-table" role="table">
          <div className="directory-row directory-head">
            <span>Person</span>
            <span>Role</span>
            <span>Scope</span>
            <span>Status</span>
          </div>
          {allMembers.map((member) => {
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
                  <span>{member.role}</span>
                  <span>{scope}</span>
                  <span>{member.status}</span>
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
                      {current.locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Team</span>
                    <select defaultValue={assignment?.team_id ?? ""} name="team_id">
                      <option value="">No team</option>
                      {current.teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
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
      </section>
    </>
  );
}
