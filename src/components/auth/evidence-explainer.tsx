"use client";

import { useState } from "react";

import { EvidenceMarker } from "@/components/evidence/evidence-marker";

type Finding =
  | "need"
  | "budget"
  | "product"
  | "spec"
  | "competitor"
  | "competitorPrice"
  | "storeQuote"
  | "question";

const findings: Record<Finding, { label: string; value: string; source: string }> = {
  need: { label: "Need", value: "Gaming + College", source: "customer-need" },
  budget: { label: "Budget", value: "₹80,000", source: "customer-budget" },
  product: { label: "Product", value: "Lenovo LOQ", source: "representative-product" },
  spec: { label: "Spec", value: "RTX 4060", source: "representative-product" },
  competitor: { label: "Competitor", value: "Amazon", source: "customer-competitor" },
  competitorPrice: { label: "Competitor price", value: "₹78,000", source: "customer-competitor" },
  storeQuote: { label: "Store quote", value: "~₹81,000", source: "representative-quote" },
  question: { label: "Question", value: "EMI", source: "customer-question" },
};

function sourceClass(activeSource: string, source: string) {
  return activeSource === source ? "turn-source turn-source-active" : "turn-source";
}

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
          <p className="turn turn-customer">
            <span>Customer</span>
            <span className={sourceClass(active.source, "customer-need")} id="customer-need">
              “Gaming aur college ke liye laptop chahiye.”
            </span>{" "}
            <span className={sourceClass(active.source, "customer-budget")} id="customer-budget">
              “Budget around ₹80,000 hai.”
            </span>
          </p>
          <p className="turn turn-representative">
            <span>Representative</span>
            <span
              className={sourceClass(active.source, "representative-product")}
              id="representative-product"
            >
              “Lenovo LOQ RTX 4060 dekh sakte hain.”
            </span>{" "}
            “Bank offer bhi available hai.”
          </p>
          <p className="turn turn-customer">
            <span>Customer</span>
            <span
              className={sourceClass(active.source, "customer-competitor")}
              id="customer-competitor"
            >
              “Amazon pe around ₹78,000 ka dikh raha tha.”
            </span>{" "}
            <span
              className={sourceClass(active.source, "customer-question")}
              id="customer-question"
            >
              “EMI kitni padegi?”
            </span>
          </p>
          <p className="turn turn-representative">
            <span>Representative</span>
            <span
              className={sourceClass(active.source, "representative-quote")}
              id="representative-quote"
            >
              “Bank offer ke baad around ₹81,000 padega.”
            </span>{" "}
            “Main exact EMI check karta hoon.”
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
