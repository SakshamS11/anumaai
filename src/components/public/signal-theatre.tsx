"use client";

import { useEffect, useState } from "react";

type Finding = { label: string; value: string; source: number; phrase: string };

const dialogue = [
  {
    speaker: "Customer",
    time: "00:12",
    text: "College aur gaming ke liye laptop chahiye. Budget around ₹80,000 hai.",
  },
  { speaker: "Customer", time: "00:41", text: "Amazon pe LOQ ₹78,000 dikha raha tha." },
  {
    speaker: "Representative",
    time: "01:06",
    text: "I’ll confirm the HDFC EMI and today’s final offer.",
  },
];

const findings: Finding[] = [
  { label: "Need", value: "College + gaming", source: 0, phrase: "College aur gaming" },
  { label: "Budget", value: "₹80,000", source: 0, phrase: "Budget around ₹80,000 hai" },
  { label: "Competitor", value: "Amazon · ₹78,000", source: 1, phrase: "Amazon pe LOQ ₹78,000" },
  {
    label: "Next action",
    value: "Confirm EMI + final offer",
    source: 2,
    phrase: "confirm the HDFC EMI and today’s final offer",
  },
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
  const [active, setActive] = useState(1);
  const [guided, setGuided] = useState(true);
  const activeFinding = findings[active];

  useEffect(() => {
    if (!guided || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sequence = [2, 3];
    const timers = sequence.map((finding, index) =>
      window.setTimeout(() => setActive(finding), 2300 * (index + 1)),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [guided]);

  function select(index: number) {
    setGuided(false);
    setActive(index);
  }

  return (
    <section
      className="evidence-canvas"
      id="evidence-canvas"
      aria-label="Illustrative conversation transformed into evidence-backed signals"
    >
      <div className="evidence-canvas-head">
        <div>
          <p>Illustrative interaction</p>
          <strong>Conversation → evidence-backed signals</strong>
        </div>
        <span className="canvas-status">
          <i aria-hidden="true" /> Source linked
        </span>
      </div>
      <div className="evidence-canvas-body">
        <div className="evidence-transcript" aria-live="polite">
          {dialogue.map((line, index) => (
            <article
              className={
                index === activeFinding.source
                  ? "canvas-turn canvas-turn-active"
                  : "canvas-turn canvas-turn-muted"
              }
              key={line.time}
            >
              <div className="turn-meta">
                <strong>{line.speaker}</strong>
                <time>{line.time}</time>
              </div>
              <p>{highlight(line.text, activeFinding.phrase, index === activeFinding.source)}</p>
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
            className={activeFinding.source === 0 ? "trace-path trace-path-active" : "trace-path"}
            d="M0 59 C82 59, 78 51, 260 51"
          />
          <path
            className={activeFinding.source === 1 ? "trace-path trace-path-active" : "trace-path"}
            d="M0 157 C72 157, 76 150, 260 150"
          />
          <path
            className={activeFinding.source === 2 ? "trace-path trace-path-active" : "trace-path"}
            d="M0 258 C74 258, 78 255, 260 255"
          />
        </svg>
        <div className="evidence-findings" aria-label="Illustrative structured findings">
          {findings.map((finding, index) => (
            <button
              aria-pressed={active === index}
              className={
                active === index ? "canvas-finding canvas-finding-active" : "canvas-finding"
              }
              key={finding.label}
              onClick={() => select(index)}
              onFocus={() => select(index)}
              onMouseEnter={() => select(index)}
              type="button"
            >
              <span>{finding.label}</span>
              <strong>{finding.value}</strong>
            </button>
          ))}
        </div>
      </div>
      <footer>
        <span className="verified-dot" aria-hidden="true" /> Natural, code-mixed source. Normalized
        business meaning.
      </footer>
    </section>
  );
}
