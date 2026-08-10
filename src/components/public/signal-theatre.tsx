"use client";

import { useState } from "react";
import styles from "./signal-theatre.module.css";

type Finding = {
  label: string;
  value: string;
  source: number;
  phrase: string;
  kind: "signal" | "dialogue";
};
const dialogue = [
  {
    speaker: "Customer",
    time: "00:12",
    text: "Camera important hai, but ₹1.2 lakh se zyada nahi.",
  },
  { speaker: "Customer", time: "00:41", text: "Does the Ultra have 5x optical zoom?" },
  {
    speaker: "Representative",
    time: "01:06",
    text: "It does. I’ll also confirm the final EMI options.",
  },
];
const findings: Finding[] = [
  {
    label: "Decision driver",
    value: "Camera quality",
    source: 0,
    phrase: "Camera important",
    kind: "signal",
  },
  {
    label: "Maximum budget",
    value: "₹120,000",
    source: 0,
    phrase: "₹1.2 lakh se zyada nahi",
    kind: "signal",
  },
  {
    label: "Customer question",
    value: "5x optical zoom",
    source: 1,
    phrase: "5x optical zoom",
    kind: "dialogue",
  },
  {
    label: "Response",
    value: "Answered · confirm EMI",
    source: 2,
    phrase: "confirm the final EMI options",
    kind: "dialogue",
  },
];
function highlight(text: string, phrase: string, active: boolean) {
  const position = text.toLowerCase().indexOf(phrase.toLowerCase());
  return !active || position < 0 ? (
    text
  ) : (
    <>
      {text.slice(0, position)}
      <mark>{text.slice(position, position + phrase.length)}</mark>
      {text.slice(position + phrase.length)}
    </>
  );
}
export function SignalTheatre() {
  const [active, setActive] = useState(0);
  const [lens, setLens] = useState<"signals" | "dialogue">("signals");
  const available = findings
    .map((finding, index) => ({ finding, index }))
    .filter(({ finding }) => finding.kind === lens);
  const activeFinding = findings[active];
  function select(index: number) {
    setActive(index);
    setLens(findings[index].kind === "signal" ? "signals" : "dialogue");
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
      <div className={styles.lenses} role="tablist" aria-label="Illustrative conversation lens">
        <button
          aria-selected={lens === "signals"}
          onClick={() => {
            setLens("signals");
            setActive(0);
          }}
          role="tab"
          type="button"
        >
          Structured signals
        </button>
        <button
          aria-selected={lens === "dialogue"}
          onClick={() => {
            setLens("dialogue");
            setActive(2);
          }}
          role="tab"
          type="button"
        >
          Question → response
        </button>
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
        <div
          className="evidence-findings"
          aria-label="Illustrative structured findings"
          role="group"
        >
          {available.map(({ finding, index }) => (
            <button
              aria-pressed={active === index}
              className={
                active === index ? "canvas-finding canvas-finding-active" : "canvas-finding"
              }
              key={finding.label}
              onClick={() => select(index)}
              onFocus={() => select(index)}
              type="button"
            >
              <span>{finding.label}</span>
              <strong>{finding.value}</strong>
            </button>
          ))}
        </div>
      </div>
      <footer>
        <span className="verified-dot" aria-hidden="true" /> Select a finding to focus its original
        source phrase.
      </footer>
    </section>
  );
}
