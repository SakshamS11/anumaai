import Link from "next/link";

import { SignalTheatre } from "@/components/public/signal-theatre";

export default function HomePage() {
  return (
    <main className="public-page">
      <header className="public-nav">
        <Link className="wordmark" href="/">
          ANUMA
        </Link>
        <nav aria-label="Public navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div>
          <Link className="public-sign-in" href="/sign-in">
            Sign in
          </Link>
          <Link className="button button-primary" href="/sign-up">
            Create workspace
          </Link>
        </div>
      </header>
      <section className="public-hero" id="product">
        <div>
          <p className="eyebrow">Frontline interaction intelligence</p>
          <h1>
            Your frontline is already telling you what customers want.
            <br />
            ANUMA makes it visible.
          </h1>
          <p className="public-lede">
            Every day, customers reveal their needs, budgets, objections, competitor comparisons and
            buying signals in conversation. ANUMA turns those interactions into structured,
            evidence-backed intelligence your organization can use.
          </p>
          <p className="public-actions">
            <a className="button button-primary" href="#how-it-works">
              See how ANUMA works
            </a>
            <Link className="button button-secondary" href="/sign-up">
              Create workspace
            </Link>
          </p>
        </div>
        <SignalTheatre />
      </section>
      <section className="editorial-comparison" id="how-it-works">
        <div>
          <p className="eyebrow">The transaction tells you what happened.</p>
          <h2>The conversation tells you why.</h2>
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
        <div className="comparison-signal">
          <p className="eyebrow">What ANUMA adds</p>
          <dl>
            <dt>Need</dt>
            <dd>College + gaming</dd>
            <dt>Budget</dt>
            <dd>₹80,000</dd>
            <dt>Compared</dt>
            <dd>Amazon ₹78,000</dd>
            <dt>Finance</dt>
            <dd>HDFC EMI</dd>
            <dt>Next action</dt>
            <dd>Confirm offer + EMI</dd>
          </dl>
          <p>
            ANUMA complements systems of record by preserving the interaction context around the
            outcome.
          </p>
        </div>
      </section>
      <section className="question-section">
        <p className="eyebrow">Business questions</p>
        <h2>What happened in the conversation before the outcome?</h2>
        <ul>
          <li>What are customers asking for that we do not currently offer?</li>
          <li>Which competitors keep entering our conversations?</li>
          <li>Where are price objections going unresolved?</li>
          <li>What questions appear before customers walk away?</li>
        </ul>
        <p>ANUMA structures the interaction data required to answer these questions.</p>
      </section>
      <section className="public-pillars">
        <p className="eyebrow">From conversations to decisions</p>
        <div>
          <article>
            <h2>Customer truth</h2>
            <p>
              Needs, budgets, preferences, competitor references, questions and decision barriers.
            </p>
          </article>
          <article>
            <h2>Frontline execution</h2>
            <p>Talk dynamics, expected behaviours, questions addressed, scorecards and coaching.</p>
          </article>
          <article>
            <h2>Outcome intelligence</h2>
            <p>
              Connect interaction patterns to what happened next. Planned as organizations build
              sufficient evidence.
            </p>
          </article>
        </div>
      </section>
      <section className="trace-section">
        <p className="eyebrow">Intelligence you can trace</p>
        <div>
          <strong>
            Customer budget
            <br />
            ₹80,000
          </strong>
          <span aria-hidden="true">↕</span>
          <blockquote>“Budget around ₹80,000 hai.”</blockquote>
        </div>
        <p>ANUMA findings remain connected to the source interaction that produced them.</p>
      </section>
      <section className="public-cta">
        <p className="eyebrow">Your customers are already giving you the signals.</p>
        <h2>ANUMA makes them usable.</h2>
        <Link className="button button-primary" href="/sign-up">
          Create workspace
        </Link>
        <Link className="public-sign-in" href="/sign-in">
          Sign in
        </Link>
      </section>
    </main>
  );
}
