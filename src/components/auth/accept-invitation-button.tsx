"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export function AcceptInvitationButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function accept() {
    setPending(true);
    const supabase = createClient();
    const { error } = await (
      supabase.rpc as unknown as (
        name: string,
        args: Record<string, string>,
      ) => Promise<{ error: { message: string } | null }>
    )("accept_organization_invitation", { p_invitation_id: invitationId });
    if (error) {
      setMessage(error.message);
      setPending(false);
      return;
    }
    router.replace("/conversations");
    router.refresh();
  }
  return (
    <>
      <button className="button button-primary" disabled={pending} onClick={accept} type="button">
        {pending ? "Joining…" : "Join organization"}
      </button>
      {message ? (
        <p className="auth-message auth-message-error" role="alert">
          {message}
        </p>
      ) : null}
    </>
  );
}
