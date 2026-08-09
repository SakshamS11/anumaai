"use client";

import { useState } from "react";

type Language = "Hinglish" | "English" | "Tamil + English";
type Finding = { label: string; value: string; source: number; phrase: string };

const examples: Record<Language, Array<{ speaker: string; time: string; text: string }>> = {
  Hinglish: [
    {
      speaker: "Customer",
      time: "00:12",
      text: "College aur gaming ke liye laptop chahiye. Budget around ₹80,000 hai.",
    },
    { speaker: "Customer", time: "00:41", text: "Amazon pe LOQ ₹78,000 dikha raha tha." },
    {
      speaker: "Representative",
      time: "01:06",
      text: "I’ll confirm today’s HDFC EMI and final offer.",
    },
  ],
  English: [
    {
      speaker: "Customer",
      time: "00:12",
      text: "I need a laptop for college and gaming. My budget is around ₹80,000.",
    },
    { speaker: "Customer", time: "00:41", text: "Amazon shows the LOQ at ₹78,000." },
    {
      speaker: "Representative",
      time: "01:06",
      text: "I’ll confirm today’s HDFC EMI and final offer.",
    },
  ],
  "Tamil + English": [
    {
      speaker: "Customer",
      time: "00:12",
      text: "College-um gaming-um use panna laptop venum. Budget around ₹80,000.",
    },
    { speaker: "Customer", time: "00:41", text: "Amazon-la LOQ ₹78,000 kaamikudhu." },
    {
      speaker: "Representative",
      time: "01:06",
      text: "Today’s HDFC EMI-um final offer-um confirm panren.",
    },
  ],
};

const findings: Finding[] = [
  { label: "Need", value: "College + gaming", source: 0, phrase: "College aur gaming" },
  { label: "Budget", value: "₹80,000", source: 0, phrase: "₹80,000" },
  { label: "Product", value: "Lenovo LOQ", source: 1, phrase: "LOQ" },
  { label: "Competitor", value: "Amazon", source: 1, phrase: "Amazon" },
  { label: "Competitor price", value: "₹78,000", source: 1, phrase: "₹78,000" },
  { label: "Next action", value: "Confirm EMI + final offer", source: 2, phrase: "confirm" },
];

function highlight(text: string, phrase: string, active: boolean) {
  const position = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (!active || position < 0) return text;
  return (
    <>
      {text.slice(0, position)}
      <mark>{text.slice(position, position + phrase.length)}</mark>
      {text.slice(position + phrase.length)}
    </>
  );
}

export function SignalTheatre() {
  const [language, setLanguage] = useState<Language>("Hinglish");
  const [active, setActive] = useState(1);
  const dialogue = examples[language];
  const activeFinding = findings[active];
  const source = activeFinding.source;

  return (
    <section
      className="evidence-canvas"
      id="evidence-canvas"
      aria-label="Illustrative conversation transformed into evidence-backed signals"
    >
      <div className="evidence-canvas-head">
        <div>
          <p>Illustrative interaction</p>
          <strong>Conversation → structured truth</strong>
        </div>
        <label className="source-language">
          <span>Source language</span>
          <select
            aria-label="Source language for illustrative interaction"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            {(Object.keys(examples) as Language[]).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="evidence-canvas-body">
        <div className="evidence-transcript" aria-live="polite">
          {dialogue.map((line, index) => (
            <article
              className={
                index === source
                  ? "canvas-turn canvas-turn-active"
                  : "canvas-turn canvas-turn-muted"
              }
              key={`${language}-${line.time}`}
            >
              <div className="turn-meta">
                <strong>{line.speaker}</strong>
                <time>{line.time}</time>
              </div>
              <p>{highlight(line.text, activeFinding.phrase, index === source)}</p>
            </article>
          ))}
        </div>
        <svg
          className="canvas-traces"
          viewBox="0 0 260 320"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            className={source === 0 ? "trace-path trace-path-active" : "trace-path"}
            d="M0 59 C82 59, 78 51, 260 51"
          />
          <path
            className={source === 1 ? "trace-path trace-path-active" : "trace-path"}
            d="M0 157 C72 157, 76 150, 260 150"
          />
          <path
            className={source === 2 ? "trace-path trace-path-active" : "trace-path"}
            d="M0 258 C74 258, 78 255, 260 255"
          />
        </svg>
        <div className="evidence-findings" aria-label="Illustrative structured findings">
          {findings.map((finding, index) => (
            <button
              className={
                active === index ? "canvas-finding canvas-finding-active" : "canvas-finding"
              }
              key={finding.label}
              onBlur={() => setActive(1)}
              onClick={() => setActive(index)}
              onFocus={() => setActive(index)}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(1)}
              type="button"
            >
              <span>{finding.label}</span>
              <strong>{finding.value}</strong>
            </button>
          ))}
        </div>
      </div>
      <footer>
        <span className="verified-dot" aria-hidden="true" /> Different language. Same business
        truth.
      </footer>
    </section>
  );
}
