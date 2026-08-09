"use client";

import { useFormStatus } from "react-dom";

export function ResendInvitationButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button button-secondary" disabled={pending} type="submit">
      {pending ? "Resending invitation…" : "Resend invitation"}
    </button>
  );
}
