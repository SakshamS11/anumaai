"use client";
import { useState } from "react";
import styles from "./conversation-lenses.module.css";
const lenses = [
  ["01", "Raw", "What was said", "Customer: I need something that shoots better at night."],
  ["02", "Structure", "What it meant", "Need: low-light camera · Budget: ₹120,000 maximum"],
  [
    "03",
    "Dialogue",
    "How people responded",
    "Question → response · price objection → partially resolved",
  ],
  [
    "04",
    "Measure",
    "How it behaved",
    "Customer 52% talk · 19 turns · representative longest stretch 22 sec",
  ],
  [
    "05",
    "Evaluate",
    "What expectations occurred",
    "Requirement understood · question addressed · next action captured",
  ],
] as const;
export function ConversationLenses() {
  const [active, setActive] = useState(0);
  const lens = lenses[active];
  return (
    <section className={styles.story} id="how-it-works">
      <div className={styles.copy}>
        <p className="eyebrow">One conversation. Multiple lenses.</p>
        <h2>The interaction stays intact. Its meaning becomes usable.</h2>
        <p>
          ANUMA does not replace the conversation with a summary. It gives each useful layer a path
          back to what was actually said.
        </p>
      </div>
      <div className={styles.explorer}>
        <div className={styles.steps} role="tablist" aria-label="Conversation lenses">
          {lenses.map(([number, label, meaning], index) => (
            <button
              aria-selected={active === index}
              className={active === index ? styles.active : ""}
              key={number}
              onClick={() => setActive(index)}
              role="tab"
              type="button"
            >
              <span>{number}</span>
              <strong>{label}</strong>
              <small>{meaning}</small>
            </button>
          ))}
        </div>
        <article className={styles.scene} aria-live="polite">
          <p>
            {lens[0]} · {lens[1]}
          </p>
          <strong>{lens[2]}</strong>
          <blockquote>{lens[3]}</blockquote>
          <span>Illustrative interaction layer</span>
        </article>
      </div>
    </section>
  );
}
