import Link from "next/link";
import { ConversationLenses } from "@/components/public/conversation-lenses";
import { PublicNavigation } from "@/components/public/public-navigation";
import { SignalTheatre } from "@/components/public/signal-theatre";

const records = [
  {
    number: "01",
    title: "Customer context",
    copy: "What they need, what matters, what they can spend and what is getting in the way.",
    examples: ["Need · night photography", "Maximum budget · ₹120,000"],
  },
  {
    number: "02",
    title: "Frontline execution",
    copy: "What your team asked, answered, clarified, committed to and left unresolved.",
    examples: ["Question · partially answered", "Commitment · EMI options"],
  },
  {
    number: "03",
    title: "Evidence you can inspect",
    copy: "Every material finding stays connected to the speaker, moment and original words that support it.",
    examples: ["Customer · 00:41", "Source evidence retained"],
  },
];

const behaviours = [
  "Requirement discovery",
  "Budget discovery",
  "Customer question addressed",
  "Objection handled",
  "Next action captured",
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <PublicNavigation />

      <section className="marketing-hero" id="product">
        <div className="hero-copy">
          <p className="eyebrow">Frontline interaction intelligence</p>
          <h1>The customer told your team what matters. Did the business keep it?</h1>
          <p>
            ANUMA turns frontline conversations into evidence-backed customer context — the needs,
            questions, objections and commitments that usually disappear when an interaction ends.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#evidence-canvas">
              Explore a conversation
            </a>
            <a className="text-link" href="mailto:hello@anuma.ai?subject=ANUMA%20demo">
              Talk to ANUMA <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="hero-proof">
            <span aria-hidden="true" /> Built from the interaction itself. Every material finding
            keeps its path back to source evidence.
          </p>
        </div>
        <SignalTheatre />
      </section>

      <section className="signal-gap" aria-labelledby="signal-gap-heading">
        <div>
          <p className="eyebrow">The information gap</p>
          <h2 id="signal-gap-heading">The interaction ends. Its business context should not.</h2>
        </div>
        <div className="signal-gap-copy">
          <p>
            A team may remember the sale, the ticket or the next task. But the conversation holds
            the reason behind it: what the customer needed, what they questioned, and where the
            representative earned or lost confidence.
          </p>
          <p>
            ANUMA keeps that context usable without asking your people to turn every conversation
            into manual notes.
          </p>
        </div>
      </section>

      <ConversationLenses />

      <section className="value-threads" aria-labelledby="value-threads-heading">
        <div className="value-threads-intro">
          <p className="eyebrow">What remains after the conversation</p>
          <h2 id="value-threads-heading">Not a summary. A record your business can work with.</h2>
          <p>
            ANUMA does not turn human interaction into a detached score or a black-box conclusion.
            It preserves the useful layers independently so each can be reviewed, corrected and
            reused.
          </p>
        </div>
        <ol>
          {records.map((record) => (
            <li className="value-thread" key={record.number}>
              <span className="value-thread-number">{record.number}</span>
              <div>
                <h3>{record.title}</h3>
                <p>{record.copy}</p>
              </div>
              <ul aria-label={`${record.title} examples`}>
                {record.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="dynamics" aria-labelledby="dynamics-heading">
        <div>
          <p className="eyebrow">Conversation dynamics</p>
          <h2 id="dynamics-heading">
            See how the interaction moved — without pretending to judge it.
          </h2>
          <p>
            Speaking time, turns and pace describe the shape of a conversation. They are objective
            context for a review, not a verdict on a person.
          </p>
        </div>
        <div className="dynamics-data" aria-label="Illustrative conversation dynamics" role="group">
          <div className="speech-lines">
            <p>
              <span>Customer</span>
              <i className="customer-line" aria-hidden="true" />
            </p>
            <p>
              <span>Representative</span>
              <i className="rep-line" aria-hidden="true" />
            </p>
          </div>
          <dl>
            <dt>Interaction duration</dt>
            <dd>4m 18s</dd>
            <dt>Customer talk share</dt>
            <dd>52%</dd>
            <dt>Representative talk share</dt>
            <dd>48%</dd>
            <dt>Conversational turns</dt>
            <dd>37</dd>
            <dt>Longest representative stretch</dt>
            <dd>22 sec</dd>
          </dl>
        </div>
      </section>

      <section className="trace-proof" aria-labelledby="trace-proof-heading">
        <div>
          <p className="eyebrow">A conclusion is only useful if you can inspect it</p>
          <h2 id="trace-proof-heading">
            No detached summaries. Follow every important signal back to the moment it came from.
          </h2>
          <div className="trace-proof-grid">
            <article>
              <span>Structured finding</span>
              <strong>
                Maximum budget
                <br />
                ₹120,000
              </strong>
              <small>
                <i aria-hidden="true" /> Evidence linked
              </small>
            </article>
            <svg viewBox="0 0 100 170" aria-hidden="true">
              <path d="M50 0 V170" />
            </svg>
            <article>
              <span>Original source</span>
              <strong>
                Customer · <time>00:12</time>
              </strong>
              <blockquote>“Camera important hai, but ₹1.2 lakh se zyada nahi.”</blockquote>
              <a href="#evidence-canvas">Return to the source interaction →</a>
            </article>
          </div>
        </div>
      </section>

      <section className="language-story" aria-labelledby="language-heading">
        <div>
          <p className="eyebrow">Built for natural speech</p>
          <h2 id="language-heading">
            People do not speak in perfect forms. Your business still needs a clear record.
          </h2>
          <p>
            ANUMA keeps original wording available as evidence while structuring the business
            meaning in English. Different speech; a consistent record of what mattered.
          </p>
        </div>
        <div
          className="language-trace"
          aria-label="Illustrative source phrase linked to a normalized finding"
          role="group"
        >
          <article>
            <span>What the customer said</span>
            <blockquote>“Budget around eighty thousand hai.”</blockquote>
          </article>
          <i aria-hidden="true" />
          <article>
            <span>What the business can use</span>
            <strong>
              Maximum budget
              <br />
              ₹80,000
            </strong>
          </article>
          <small>Original words retained. Meaning made usable.</small>
        </div>
      </section>

      <section className="expectations" aria-labelledby="expectations-heading">
        <p className="eyebrow">Your expectations, applied to the evidence</p>
        <h2 id="expectations-heading">
          Define what a strong interaction means for your organization.
        </h2>
        <ul>
          {behaviours.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          ANUMA evaluates your chosen expectations against what actually happened — then shows the
          evidence behind the review.
        </p>
      </section>

      <section className="marketing-final">
        <p className="eyebrow">The conversation already happened.</p>
        <h2>Make its value visible.</h2>
        <a className="button button-primary" href="mailto:hello@anuma.ai?subject=ANUMA%20demo">
          Talk to ANUMA
        </a>
        <Link className="text-link" href="/sign-in">
          Sign in →
        </Link>
      </section>

      <footer className="marketing-footer">
        <Link className="wordmark" href="/">
          ANUMA
        </Link>
        <nav aria-label="Footer navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/sign-in">Sign in</Link>
          <a href="mailto:hello@anuma.ai?subject=ANUMA%20demo">Talk to ANUMA</a>
        </nav>
      </footer>
    </main>
  );
}
