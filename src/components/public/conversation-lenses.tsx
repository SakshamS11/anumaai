"use client";

import { useState } from "react";
import styles from "./conversation-lenses.module.css";

const lenses = [
  ["01", "Raw interaction", "The conversation, kept in context."],
  ["02", "Customer context", "What the customer needs and values."],
  ["03", "Dialogue", "What was asked — and how the team responded."],
  ["04", "Interaction dynamics", "How the conversation moved."],
  ["05", "Review", "What your organization expected to happen."],
] as const;

function LensRecord({ active }: { active: number }) {
  switch (active) {
    case 0:
      return (
        <div className={styles.turns}>
          <p className={styles.turn}>
            <span>Customer · 00:12</span>
            Camera important hai. But ₹1.2 lakh se zyada nahi.
          </p>
          <p className={styles.turn}>
            <span>Customer · 00:41</span>
            Does the Ultra have 5x optical zoom?
          </p>
          <p className={`${styles.turn} ${styles.repTurn}`}>
            <span>Representative · 01:06</span>
            It does. I’ll show you the EMI options as well.
          </p>
        </div>
      );
    case 1:
      return (
        <div className={styles.traceRows}>
          <div>
            <p>
              <span>Need</span>
              Camera quality
            </p>
            <small>Customer · 00:12</small>
          </div>
          <div>
            <p>
              <span>Maximum budget</span>
              ₹120,000
            </p>
            <small>Customer · 00:12</small>
          </div>
        </div>
      );
    case 2:
      return (
        <div className={styles.dialogueLink}>
          <div>
            <span>Customer question · 00:41</span>
            <strong>Does the Ultra have 5x optical zoom?</strong>
          </div>
          <i aria-hidden="true" />
          <div>
            <span>Representative response · 01:06</span>
            <strong>It does. I’ll show you the EMI options as well.</strong>
            <small>Answered</small>
          </div>
        </div>
      );
    case 3:
      return (
        <div className={styles.measurement}>
          <div className={styles.speakerRail}>
            <span>Customer</span>
            <i className={styles.customerRail} aria-hidden="true" />
          </div>
          <div className={styles.speakerRail}>
            <span>Representative</span>
            <i className={styles.representativeRail} aria-hidden="true" />
          </div>
          <dl>
            <div>
              <dt>Customer talk</dt>
              <dd>52%</dd>
            </div>
            <div>
              <dt>Turns</dt>
              <dd>37</dd>
            </div>
            <div>
              <dt>Longest rep stretch</dt>
              <dd>22 sec</dd>
            </div>
          </dl>
        </div>
      );
    default:
      return (
        <div className={styles.reviewRows}>
          <p>
            <span>Requirement discovery</span>
            <strong>Observed</strong>
          </p>
          <p>
            <span>Customer question addressed</span>
            <strong>Observed</strong>
          </p>
          <p>
            <span>Next action captured</span>
            <strong>Evidence linked</strong>
          </p>
        </div>
      );
  }
}

export function ConversationLenses() {
  const [active, setActive] = useState(0);
  const lens = lenses[active];

  return (
    <section
      className={styles.story}
      id="how-it-works"
      aria-labelledby="conversation-story-heading"
    >
      <div className={styles.copy}>
        <p className="eyebrow">One interaction. More than one useful truth.</p>
        <h2 id="conversation-story-heading">
          Keep the conversation intact. Make every useful layer reviewable.
        </h2>
        <p>
          Explore the same illustrative interaction through the layers ANUMA separates — without
          losing the source that supports each one.
        </p>
      </div>
      <div className={styles.explorer}>
        <div className={styles.control} aria-label="Choose an interaction layer" role="group">
          <ol>
            {lenses.map(([number, label, meaning], index) => (
              <li key={number}>
                <button
                  aria-pressed={active === index}
                  className={active === index ? styles.active : ""}
                  onClick={() => setActive(index)}
                  type="button"
                >
                  <span>{number}</span>
                  <strong>{label}</strong>
                  <small>{meaning}</small>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <article className={styles.record} aria-live="polite">
          <header>
            <span>Illustrative interaction record</span>
            <p>
              {lens[0]} · {lens[1]}
            </p>
          </header>
          <LensRecord active={active} />
          <footer>Source relationships remain visible at every layer.</footer>
        </article>
      </div>
    </section>
  );
}
