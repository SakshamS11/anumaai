"use client";

import { useState } from "react";

import { EvidenceMarker } from "@/components/evidence/evidence-marker";

type Finding = "need" | "budget" | "product" | "graphics" | "competitor" | "price" | "payment";

const findings: Record<Finding, { label: string; value: string; source: string }> = {
  need: { label: "Need", value: "Gaming", source: "customer-need" },
  budget: { label: "Budget", value: "₹80,000", source: "customer-budget" },
  product: { label: "Product", value: "Lenovo LOQ", source: "representative-product" },
  graphics: { label: "Graphics", value: "RTX 4060", source: "representative-product" },
  competitor: { label: "Compared with", value: "Amazon", source: "customer-competitor" },
  price: { label: "Quoted price", value: "₹78,000", source: "customer-competitor" },
  payment: { label: "Payment question", value: "EMI", source: "customer-emi" },
};

export function EvidenceExplainer() {
  const [activeFinding, setActiveFinding] = useState<Finding>("need");
  const active = findings[activeFinding];

  return (
    <section className="evidence-explainer" aria-labelledby="illustration-title">
      <div className="illustration-heading">
        <p className="eyebrow">Illustrative interaction</p>
        <h2 id="illustration-title">A finding should lead back to what was said.</h2>
        <p>This staged example explains ANUMA’s evidence relationship. It is not customer data.</p>
      </div>
      <div className="illustration-content">
        <div className="turns" role="group" aria-label="Illustrative electronics conversation">
          <p
            className={`turn turn-customer ${active.source === "customer-budget" ? "turn-active" : ""}`}
            id="customer-budget"
          >
            <span>Customer</span>“I need something around ₹80,000 for gaming and college.”
          </p>
          <p
            className={`turn turn-representative ${active.source === "representative-product" ? "turn-active" : ""}`}
            id="representative-product"
          >
            <span>Representative</span>“The Lenovo LOQ with RTX 4060 is a strong fit.”
          </p>
          <p
            className={`turn turn-customer ${active.source === "customer-competitor" ? "turn-active" : ""}`}
            id="customer-competitor"
          >
            <span>Customer</span>“Amazon has it at ₹78,000. Is EMI available?”
          </p>
          <p
            className={`turn turn-customer ${active.source === "customer-emi" ? "turn-active" : ""}`}
            id="customer-emi"
          >
            <span>Customer</span>“I would need EMI for the purchase.”
          </p>
          <p
            className={`turn turn-customer ${active.source === "customer-need" ? "turn-active" : ""}`}
            id="customer-need"
          >
            <span>Customer</span>“Mostly gaming, but I’ll use it for college too.”
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
                aria-label={`${item.label} ${item.value} Source turn`}
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
