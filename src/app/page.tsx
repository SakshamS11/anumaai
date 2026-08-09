import Link from "next/link";

import { PublicNavigation } from "@/components/public/public-navigation";
import { SignalTheatre } from "@/components/public/signal-theatre";

const questions = [
  [
    "What are customers asking for that we do not currently offer?",
    "Needs · questions · product gaps",
  ],
  [
    "Which competitors keep entering your conversations?",
    "Competitor · price comparison · objection",
  ],
  ["Where are price objections going unresolved?", "Concern · response · supporting evidence"],
  [
    "What questions appear before customers walk away?",
    "Question · decision barrier · next action",
  ],
  [
    "What are stronger representatives doing differently?",
    "Talk dynamics · expected behaviours · evidence",
  ],
  ["What happened before the outcome?", "Interaction context · traceable source"],
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <PublicNavigation />

      <section className="marketing-hero" id="product">
        <div className="hero-copy">
          <p className="eyebrow">Frontline interaction intelligence</p>
          <h1>Every conversation leaves a signal. ANUMA turns it into intelligence.</h1>
          <p>
            ANUMA turns frontline customer interactions into structured, evidence-backed
            intelligence — revealing what customers need, how teams respond, and what happens next.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#evidence-canvas">
              See ANUMA in action
            </a>
            <a className="text-link" href="mailto:hello@anuma.ai?subject=ANUMA%20demo">
              Book a demo <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <SignalTheatre />
      </section>

      <section className="record-comparison">
        <div className="record-side">
          <p className="eyebrow">The transaction tells you what happened.</p>
          <h2>System of record</h2>
          <dl>
            <dt>Product</dt>
            <dd>Lenovo LOQ</dd>
            <dt>Transaction</dt>
            <dd>₹81,000</dd>
            <dt>Store</dt>
            <dd>Delhi</dd>
            <dt>Time</dt>
            <dd>4:18 PM</dd>
          </dl>
        </div>
        <span className="comparison-plus" aria-hidden="true">
          +
        </span>
        <div className="anuma-side">
          <p className="eyebrow">The conversation tells you why.</p>
          <h2>ANUMA</h2>
          <dl>
            <dt>Need</dt>
            <dd>College + gaming</dd>
            <dt>Budget</dt>
            <dd>₹80,000</dd>
            <dt>Compared</dt>
            <dd>Amazon · ₹78,000</dd>
            <dt>Concern</dt>
            <dd>Online price</dd>
            <dt>Finance</dt>
            <dd>HDFC EMI</dd>
            <dt>Next action</dt>
            <dd>Confirm offer + EMI</dd>
          </dl>
          <p>ANUMA adds the interaction context around the outcome.</p>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>From a human interaction to evidence-backed understanding.</h2>
          <p>Each step preserves the source while making the interaction more useful.</p>
        </div>
        <ol>
          {[
            ["01", "Capture", "What was said"],
            ["02", "Structure", "What it meant"],
            ["03", "Measure", "How the interaction happened"],
            ["04", "Evaluate", "What expectations were met"],
            ["05", "Learn", "What the organization can learn"],
          ].map(([number, label, meaning]) => (
            <li key={number}>
              <span>{number}</span>
              <strong>{label}</strong>
              <small>{meaning}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="business-questions">
        <p className="eyebrow">What could your business know?</p>
        <div>
          <h2>The questions already inside your conversations.</h2>
          <div className="question-list">
            {questions.map(([question, signals], index) => (
              <details key={question}>
                <summary>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {question}
                </summary>
                <p>{signals}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="intelligence-pillars">
        <p className="eyebrow">From conversations to decisions</p>
        <div>
          {[
            [
              "01",
              "Customer truth",
              "Needs, budgets, preferences, competitor references, questions and decision barriers.",
            ],
            [
              "02",
              "Frontline execution",
              "Talk dynamics, configured expectations, questions addressed, scorecards and coaching.",
            ],
            [
              "03",
              "Outcome intelligence",
              "Planned aggregate intelligence will connect trustworthy interaction patterns to what happened next.",
            ],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dynamics">
        <div>
          <p className="eyebrow">Conversation dynamics</p>
          <h2>How the interaction behaved.</h2>
          <p>Objective measures describe the interaction. They do not judge it.</p>
        </div>
        <div className="dynamics-data">
          <div className="speech-lines">
            <p>
              <span>Customer</span>
              <i className="customer-line" />
            </p>
            <p>
              <span>Representative</span>
              <i className="rep-line" />
            </p>
          </div>
          <dl>
            <dt>Duration</dt>
            <dd>4:18</dd>
            <dt>Customer talk</dt>
            <dd>52%</dd>
            <dt>Representative talk</dt>
            <dd>48%</dd>
            <dt>Turns</dt>
            <dd>37</dd>
            <dt>Longest rep stretch</dt>
            <dd>22 sec</dd>
          </dl>
        </div>
      </section>

      <section className="trace-proof">
        <div>
          <p className="eyebrow">Intelligence you can trace</p>
          <div className="trace-proof-grid">
            <article>
              <span>Finding</span>
              <strong>
                Customer budget
                <br />
                ₹80,000
              </strong>
              <small>
                <i /> Verified
              </small>
            </article>
            <svg viewBox="0 0 100 170" aria-hidden="true">
              <path d="M50 0 V170" />
            </svg>
            <article>
              <span>Source</span>
              <strong>
                Customer · <time>00:42</time>
              </strong>
              <blockquote>“Budget around ₹80,000 hai.”</blockquote>
              <a href="#evidence-canvas">View surrounding context →</a>
            </article>
          </div>
        </div>
      </section>

      <section className="language-story">
        <div>
          <p className="eyebrow">Built for how people actually speak</p>
          <h2>Natural conversations do not follow perfect scripts.</h2>
          <p>
            ANUMA is designed to structure business meaning from natural, code-mixed interactions
            while preserving the original source evidence. Language quality is validated through
            controlled pilot evaluation, not a universal language claim.
          </p>
        </div>
        <div
          className="language-trace"
          aria-label="Illustrative source phrase linked to a normalized finding"
          role="group"
        >
          <article>
            <span>How it was said</span>
            <blockquote>“Budget around eighty thousand hai.”</blockquote>
          </article>
          <i aria-hidden="true" />
          <article>
            <span>How ANUMA structures it</span>
            <strong>
              Budget
              <br />
              ₹80,000
            </strong>
          </article>
          <small>Different words. Consistent business meaning.</small>
        </div>
      </section>

      <section className="expectations">
        <p className="eyebrow">Your business. Your expectations.</p>
        <h2>Evaluate the behaviours your organization chooses.</h2>
        <ul>
          {[
            "Requirement discovery",
            "Budget discovery",
            "Relevant product discussed",
            "Finance explained",
            "Warranty discussed",
            "Customer question addressed",
            "Next action captured",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          ANUMA evaluates the expectations an organization chooses against what actually happened in
          the interaction.
        </p>
      </section>

      <section className="marketing-final">
        <p className="eyebrow">Every conversation leaves a signal.</p>
        <h2>Make the next one usable.</h2>
        <a className="button button-primary" href="mailto:hello@anuma.ai?subject=ANUMA%20demo">
          Book a demo
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
          <a href="mailto:hello@anuma.ai?subject=ANUMA%20demo">Book a demo</a>
        </nav>
      </footer>
    </main>
  );
}
