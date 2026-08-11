"use client";

import { useState } from "react";
import styles from "./signal-theatre.module.css";

type Finding = {
  id: string;
  label: string;
  value: string;
  phrase: string;
};

type Turn = {
  speaker: "Customer" | "Representative";
  time: string;
  text: string;
  findings: Finding[];
};

const turns: Turn[] = [
  {
    speaker: "Customer",
    time: "00:12",
    text: "Camera important hai. But ₹1.2 lakh se zyada nahi.",
    findings: [
      {
        id: "need",
        label: "Decision driver",
        value: "Camera quality",
        phrase: "Camera important",
      },
      {
        id: "budget",
        label: "Maximum budget",
        value: "₹120,000",
        phrase: "₹1.2 lakh se zyada nahi",
      },
    ],
  },
  {
    speaker: "Customer",
    time: "00:41",
    text: "Does the Ultra have 5x optical zoom?",
    findings: [
      {
        id: "question",
        label: "Customer question",
        value: "5x optical zoom",
        phrase: "5x optical zoom",
      },
    ],
  },
  {
    speaker: "Representative",
    time: "01:06",
    text: "It does. I’ll show you the EMI options as well.",
    findings: [
      {
        id: "response",
        label: "Response to 00:41",
        value: "Answered · EMI options",
        phrase: "show you the EMI options",
      },
    ],
  },
];

function highlight(text: string, phrase: string, active: boolean) {
  const position = text.toLowerCase().indexOf(phrase.toLowerCase());

  if (!active || position < 0) {
    return text;
  }

  return (
    <>
      {text.slice(0, position)}
      <mark>{text.slice(position, position + phrase.length)}</mark>
      {text.slice(position + phrase.length)}
    </>
  );
}

export function SignalTheatre() {
  const [activeFindingId, setActiveFindingId] = useState("need");
  const activeTurnIndex = turns.findIndex((turn) =>
    turn.findings.some((finding) => finding.id === activeFindingId),
  );

  return (
    <section
      className="evidence-canvas"
      id="evidence-canvas"
      aria-label="Illustrative interaction transformed into evidence-backed customer context"
    >
      <div className="evidence-canvas-head">
        <div>
          <p>Illustrative interaction</p>
          <strong>One conversation. A record you can inspect.</strong>
        </div>
        <span className="canvas-status">
          <i aria-hidden="true" /> Source linked
        </span>
      </div>

      <div className={styles.introduction}>
        <p>Follow a spoken moment to the business context it created.</p>
        <span>Source phrase → usable record</span>
      </div>

      <div className={styles.traceList}>
        {turns.map((turn, turnIndex) => {
          const isActiveTurn = turnIndex === activeTurnIndex;
          const activeFinding = turn.findings.find((finding) => finding.id === activeFindingId);
          const firstFinding = turn.findings[0];

          return (
            <article
              className={styles.traceRow}
              data-active={isActiveTurn || undefined}
              key={turn.time}
            >
              <button
                aria-pressed={isActiveTurn}
                className={styles.sourceTurn}
                onClick={() => setActiveFindingId(firstFinding.id)}
                onFocus={() => setActiveFindingId(firstFinding.id)}
                type="button"
              >
                <span className={styles.turnMeta}>
                  <strong>{turn.speaker}</strong>
                  <time>{turn.time}</time>
                </span>
                <span className={styles.turnText}>
                  {highlight(turn.text, activeFinding?.phrase ?? "", isActiveTurn)}
                </span>
              </button>

              <span className={styles.traceBridge} aria-hidden="true">
                <i />
              </span>

              <div
                aria-label={`${turn.speaker} findings`}
                className={styles.findingList}
                role="group"
              >
                {turn.findings.map((finding) => {
                  const isActive = finding.id === activeFindingId;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={styles.finding}
                      key={finding.id}
                      onClick={() => setActiveFindingId(finding.id)}
                      onFocus={() => setActiveFindingId(finding.id)}
                      type="button"
                    >
                      <span>{finding.label}</span>
                      <strong>{finding.value}</strong>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <footer className={styles.footer}>
        <span aria-hidden="true" /> Select any source moment or record to follow its evidence path.
      </footer>
    </section>
  );
}
