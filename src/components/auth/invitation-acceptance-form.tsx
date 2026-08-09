"use client";

import { useActionState } from "react";

import { acceptInvitation, type AcceptInvitationState } from "@/app/(auth)/auth/invite/actions";

const initialState: AcceptInvitationState = { error: null };

export function InvitationAcceptanceForm({
  token,
  tokenHash,
  type,
  requiresFirstAccess,
}: {
  token: string;
  tokenHash: string | null;
  type: string | null;
  requiresFirstAccess: boolean;
}) {
  const [state, action, pending] = useActionState(acceptInvitation, initialState);
  return (
    <form action={action} className="auth-form">
      <input name="token" type="hidden" value={token} />
      <input name="token_hash" type="hidden" value={tokenHash ?? ""} />
      <input name="type" type="hidden" value={type ?? ""} />
      {requiresFirstAccess ? (
        <>
          <label className="form-field">
            <span>Display name</span>
            <input autoComplete="name" minLength={2} name="display_name" required />
          </label>
          <label className="form-field">
            <span>Create password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
        </>
      ) : null}
      <button className="button button-primary auth-submit" disabled={pending} type="submit">
        {pending ? "Accepting invitation…" : "Accept invitation"}
      </button>
      {state.error ? (
        <p className="auth-message auth-message-error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
