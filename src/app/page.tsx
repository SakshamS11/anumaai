import Link from "next/link";
import { ConversationLenses } from "@/components/public/conversation-lenses";
import { PublicNavigation } from "@/components/public/public-navigation";
import { SignalTheatre } from "@/components/public/signal-theatre";

const reviewExpectations = [
  ["01", "Requirement discovery", "Observed in the conversation"],
  ["02", "Customer question addressed", "Linked to the representative response"],
  ["03", "Next action captured", "Kept as a reviewable commitment"],
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <PublicNavigation />

      <section className="marketing-hero" id="product">
        <div className="hero-copy">
          <p className="eyebrow">Frontline interaction intelligence</p>
          <h1>Your customers say more than your systems ever keep.</h1>
          <p>
            ANUMA turns frontline conversations into evidence-backed customer context: the needs,
            questions, objections and commitments that usually disappear when an interaction ends.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#evidence-canvas">
              Follow a conversation
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
          <p className="eyebrow">The missing interaction layer</p>
          <h2 id="signal-gap-heading">
            The record tells you what happened. The conversation explains why.
          </h2>
        </div>
        <div className="signal-gap-copy">
          <p>
            A sale, service ticket or follow-up captures an endpoint. It rarely preserves what the
            customer needed, what they questioned, or what the representative committed to do.
          </p>
          <p>
            ANUMA makes that context reviewable without asking your team to turn every interaction
            into manual notes.
          </p>
        </div>
      </section>

      <ConversationLenses />

      <section className="language-story" aria-labelledby="language-heading">
        <div>
          <p className="eyebrow">Natural speech remains the source</p>
          <h2 id="language-heading">Different words. The same standard of evidence.</h2>
          <p>
            ANUMA keeps original wording available for review while making the business meaning
            usable in English. The source is never replaced by a detached summary.
          </p>
        </div>
        <div
          className="language-trace"
          aria-label="Illustrative original speech linked to a structured business finding"
          role="group"
        >
          <article>
            <span>What the customer said</span>
            <blockquote>“Budget around eighty thousand hai.”</blockquote>
          </article>
          <i aria-hidden="true" />
          <article>
            <span>What the team can inspect</span>
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
        <div className="expectations-copy">
          <p className="eyebrow">Your expectations, applied to evidence</p>
          <h2 id="expectations-heading">
            Define the interactions your organization expects to see.
          </h2>
          <p>
            ANUMA evaluates the expectations you choose against what actually happened, then keeps
            the supporting conversation in reach.
          </p>
        </div>
        <ol className="expectation-ledger">
          {reviewExpectations.map(([number, expectation, outcome]) => (
            <li key={number}>
              <span>{number}</span>
              <strong>{expectation}</strong>
              <small>{outcome}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="marketing-final">
        <p className="eyebrow">The conversation already happened.</p>
        <h2>Make its value visible.</h2>
        <a className="button button-primary" href="mailto:hello@anuma.ai?subject=ANUMA%20demo">
          Talk to ANUMA
        </a>
        <Link className="text-link" href="/sign-in">
          Sign in <span aria-hidden="true">→</span>
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
