type Evidence = {
  text: string | null;
  state: string;
  rationale: string | null;
  evidenceSegmentId: string | null;
};
type Dialogue = {
  questions: Array<{
    id: string;
    text: string;
    topic: string;
    type: string;
    speakerRole: string;
    evidenceSegmentId: string | null;
    responses: Evidence[];
  }>;
  objections: Array<{
    id: string;
    text: string;
    family: string;
    speakerRole: string;
    evidenceSegmentId: string | null;
    handling: Evidence & { strategy: string | null };
  }>;
};
function sentenceCase(value: string) {
  return value.replaceAll("_", " ");
}
function EvidenceLink({ id, label }: { id: string | null; label: string }) {
  return id ? (
    <a className="evidence-link" href={`#segment-${id}`}>
      {label}
    </a>
  ) : null;
}
function ResponseTrace({ item }: { item: Evidence }) {
  return (
    <div className="dialogue-response">
      <span aria-hidden="true">→</span>
      <div>
        <p className="dialogue-meta">{sentenceCase(item.state)}</p>
        <p>{item.text ?? item.rationale ?? "No linked response was evidenced."}</p>
        <EvidenceLink id={item.evidenceSegmentId} label="View response evidence" />
      </div>
    </div>
  );
}
export function DialogueIntelligence({ dialogue }: { dialogue: Dialogue }) {
  if (!dialogue.questions.length && !dialogue.objections.length) return null;
  return (
    <section className="dialogue-intelligence" aria-labelledby="dialogue-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Dialogue intelligence</p>
          <h2 id="dialogue-title">Questions, responses, and resistance</h2>
        </div>
        <p className="section-copy">Each relationship remains linked to the source interaction.</p>
      </div>
      {dialogue.questions.length ? (
        <div className="dialogue-stream" aria-labelledby="questions-title">
          <h3 id="questions-title">Questions</h3>
          {dialogue.questions.map((question) => (
            <article className="dialogue-trace" key={question.id}>
              <p className="dialogue-meta">
                {sentenceCase(question.speakerRole)} · {sentenceCase(question.type)}
              </p>
              <blockquote>{question.text}</blockquote>
              <EvidenceLink id={question.evidenceSegmentId} label="View question evidence" />
              {question.responses.length ? (
                question.responses.map((response, index) => (
                  <ResponseTrace item={response} key={`${question.id}-${index}`} />
                ))
              ) : (
                <ResponseTrace
                  item={{
                    text: null,
                    state: "unanswered",
                    rationale: null,
                    evidenceSegmentId: null,
                  }}
                />
              )}
            </article>
          ))}
        </div>
      ) : null}
      {dialogue.objections.length ? (
        <div className="dialogue-stream" aria-labelledby="objections-title">
          <h3 id="objections-title">Objections</h3>
          {dialogue.objections.map((objection) => (
            <article className="dialogue-trace" key={objection.id}>
              <p className="dialogue-meta">
                {sentenceCase(objection.speakerRole)} · {sentenceCase(objection.family)}
              </p>
              <blockquote>{objection.text}</blockquote>
              <EvidenceLink id={objection.evidenceSegmentId} label="View objection evidence" />
              <ResponseTrace item={objection.handling} />
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
