"use client";

import { useState } from "react";

const examples = {
  Hinglish: [
    ["Customer", "College aur gaming ke liye laptop chahiye. Budget around ₹80,000 hai."],
    ["Customer", "Amazon pe LOQ ₹78,000 dikha raha tha."],
    ["Representative", "I'll confirm today's HDFC EMI and the final offer."],
  ],
  English: [
    ["Customer", "I need a laptop for college and gaming. My budget is around ₹80,000."],
    ["Customer", "Amazon shows the LOQ at ₹78,000."],
    ["Representative", "I'll confirm today's HDFC EMI and the final offer."],
  ],
  "Tamil + English": [
    ["Customer", "College-um gaming-um use panna laptop venum. Budget around ₹80,000."],
    ["Customer", "Amazon-la LOQ ₹78,000 kaamikudhu."],
    ["Representative", "Today's HDFC EMI-um final offer-um confirm panren."],
  ],
} as const;

const signals = [
  { label: "Budget", value: "₹80,000", source: 0 },
  { label: "Product", value: "Lenovo LOQ", source: 1 },
  { label: "Competitor", value: "Amazon", source: 1 },
  { label: "Competitor price", value: "₹78,000", source: 1 },
  { label: "Next action", value: "Confirm EMI + offer", source: 2 },
];

export function SignalTheatre() {
  const [language, setLanguage] = useState<keyof typeof examples>("Hinglish");
  const [active, setActive] = useState(0);
  const dialogue = examples[language];

  return (
    <section
      className="signal-theatre"
      aria-label="Illustrative conversation to intelligence example"
    >
      <div className="signal-theatre-toolbar">
        <span>Illustrative interaction</span>
        <div className="language-switcher" aria-label="Illustrative conversation language">
          {(Object.keys(examples) as Array<keyof typeof examples>).map((item) => (
            <button
              aria-pressed={language === item}
              key={item}
              onClick={() => setLanguage(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="signal-theatre-grid">
        <div className="signal-dialogue">
          {dialogue.map(([speaker, text], index) => (
            <p
              className={active === index ? "source-line source-line-active" : "source-line"}
              key={`${language}-${text}`}
            >
              <strong>{speaker}</strong>
              <span>{text}</span>
            </p>
          ))}
        </div>
        <div className="signal-findings" aria-label="Structured findings">
          {signals.map((signal) => (
            <button
              className={
                active === signal.source ? "signal-finding signal-finding-active" : "signal-finding"
              }
              key={signal.label}
              onBlur={() => setActive(0)}
              onClick={() => setActive(signal.source)}
              onFocus={() => setActive(signal.source)}
              onMouseEnter={() => setActive(signal.source)}
              onMouseLeave={() => setActive(0)}
              type="button"
            >
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
            </button>
          ))}
        </div>
      </div>
      <p className="signal-theatre-note">Different language. Same business truth.</p>
    </section>
  );
}
