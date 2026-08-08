"use client";

import { useState } from "react";

import { EvidenceMarker } from "@/components/evidence/evidence-marker";

type Finding = "budget" | "need";

const findings: Record<Finding, { label: string; value: string; source: string }> = {
  budget: { label: "Budget", value: "₹80,000", source: "customer-budget" },
  need: { label: "Need", value: "Gaming", source: "customer-gaming" },
};

export function EvidenceExplainer() {
  const [activeFinding, setActiveFinding] = useState<Finding>("budget");
  const active = findings[activeFinding];

  return (
    <section className="evidence-explainer" aria-labelledby="illustration-title">
      <div className="illustration-heading">
        <p className="eyebrow">Illustrative interaction</p>
        <h2 id="illustration-title">A finding should lead back to what was said.</h2>
        <p>
          This short example illustrates how ANUMA connects structured information to conversation
          evidence. It is not customer data.
        </p>
      </div>
      <div className="illustration-content">
        <div className="turns" role="group" aria-label="Illustrative conversation turns">
          <p
            className={`turn turn-customer ${active.source === "customer-budget" ? "turn-active" : ""}`}
            id="customer-budget"
          >
            <span>Customer</span>
            “I need something around ₹80,000.”
          </p>
          <p className="turn turn-representative">
            <span>Representative</span>
            “Is gaming the main use case?”
          </p>
          <p
            className={`turn turn-customer ${active.source === "customer-gaming" ? "turn-active" : ""}`}
            id="customer-gaming"
          >
            <span>Customer</span>
            “Yes, mostly gaming.”
          </p>
        </div>
        <div
          className="illustration-findings"
          role="group"
          aria-label="Illustrative structured findings"
        >
          {(Object.keys(findings) as Finding[]).map((finding) => {
            const item = findings[finding];
            return (
              <button
                aria-controls={item.source}
                aria-pressed={activeFinding === finding}
                className={
                  activeFinding === finding
                    ? "illustration-finding illustration-finding-active"
                    : "illustration-finding"
                }
                key={finding}
                onFocus={() => setActiveFinding(finding)}
                onMouseEnter={() => setActiveFinding(finding)}
                onClick={() => setActiveFinding(finding)}
                type="button"
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <EvidenceMarker timestamp="Source turn" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
