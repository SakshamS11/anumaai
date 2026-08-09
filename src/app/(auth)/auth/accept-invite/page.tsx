import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { AcceptInvitationButton } from "@/components/auth/accept-invitation-button";
export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ invitation?: string }>;
}) {
  const { invitation } = await searchParams;
  if (!(await getAuthenticatedUser()))
    redirect("/sign-in?message=Sign+in+to+accept+your+invitation.");
  if (!invitation)
    return (
      <div className="auth-card">
        <h2>No invitation found</h2>
        <p className="auth-copy">Open the invitation link sent by your administrator.</p>
      </div>
    );
  const database = (await createClient()) as unknown as { from: (relation: string) => any };
  const { data } = await database
    .from("organization_invitations")
    .select("organization_id,role,organizations(name)")
    .eq("id", invitation)
    .maybeSingle();
  if (!data)
    return (
      <div className="auth-card">
        <h2>This invitation is unavailable</h2>
        <p className="auth-copy">It may have expired or been revoked.</p>
      </div>
    );
  const organization = (data.organizations as { name: string } | null)?.name ?? "this organization";
  return (
    <div className="auth-card">
      <p className="eyebrow">Organization invitation</p>
      <h2>You&apos;ve been invited to: {organization}</h2>
      <p className="auth-copy">Role: {data.role}</p>
      <AcceptInvitationButton invitationId={invitation} />
    </div>
  );
}
