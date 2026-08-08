"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Observation = {
  id: string;
  type: string;
  key: string;
  text: string | null;
  amountMinor: number | null;
  currencyCode: string | null;
  evidenceGroupId: string;
};

export function InteractionUnderstanding({
  conversationId,
  canRequest,
  observations,
}: {
  conversationId: string;
  canRequest: boolean;
  observations: Observation[];
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "working" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  async function request() {
    setState("working");
    setMessage(null);
    const response = await fetch(`/api/conversations/${conversationId}/understanding`, {
      method: "POST",
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setState("error");
      setMessage(payload.error ?? "Interaction understanding could not start.");
      return;
    }
    setMessage("Interaction understanding is being prepared from the confirmed transcript.");
    router.refresh();
    setState("idle");
  }
  return (
    <section className="interaction-understanding" aria-labelledby="understanding-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Interaction understanding</p>
          <h2 id="understanding-title">What the interaction tells us</h2>
        </div>
        {canRequest && !observations.length ? (
          <button
            className="button button-primary"
            disabled={state === "working"}
            onClick={() => void request()}
            type="button"
          >
            {state === "working" ? "Preparing…" : "Prepare understanding"}
          </button>
        ) : null}
      </div>
      {observations.length ? (
        <ul className="observation-list">
          {observations.map((item) => (
            <li key={item.id}>
              <span>{item.type.replaceAll("_", " ")}</span>
              <strong>
                {item.text ??
                  (item.amountMinor !== null
                    ? `${item.currencyCode ?? ""} ${item.amountMinor}`
                    : item.key)}
              </strong>
              <a href="#source-transcript">Evidence</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-inline">
          {canRequest
            ? "Use the confirmed speaker mapping and transcript to create evidence-backed observations. This does not reprocess audio."
            : "A confirmed speaker mapping is required before ANUMA can structure this interaction."}
        </p>
      )}
      {message ? (
        <p className="auth-message" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
