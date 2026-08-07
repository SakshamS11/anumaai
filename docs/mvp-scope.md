# MVP Scope

## Boundary

The MVP is a pilot-ready modular monolith for automotive and electronics retail. It covers capture, evidence, deterministic interaction metrics, structured intelligence, client configuration, evidence-backed evaluation, limited coaching, management intelligence, and manual outcome capture.

Phase 0 creates architecture documentation only. Later phases must be explicitly authorized and executed sequentially.

## In scope by capability

### Capture and evidence

- Authenticated organization users, teams/locations, and representatives.
- Mobile-web recording and audio upload with consent metadata.
- Private storage, retention metadata, short-lived signed playback, and deletion workflow.
- Durable asynchronous transcription and analysis.
- Sarvam Saaras v3 batch transcription behind `SpeechToTextProvider`.
- Hindi, Hinglish/code-mixed Hindi-English, and Indian English for pilot evaluation.
- Diarized, timestamped, normalized transcript with correctable speaker roles.
- Searchable transcript and evidence-driven audio seeking.

### Objective metrics

- Conversation, participant, representative, customer, interaction, question, and timing metrics defined in `metrics-catalog.md`.
- Deterministic calculation where possible, explicit producer and quality status, and no unsupported precision.

### Structured intelligence

- Versioned semantic facts with evidence and provenance.
- First-class questions, responses, objections, and response/handling links.
- Automotive and electronics vertical packs using shared definitions plus pack configuration.

### Client configuration and evaluation

- Versioned tracker definitions and organization-specific tracker sets.
- Versioned scorecards consuming facts/trackers rather than redetecting events.
- Applicability-aware score results and evidence requirements.
- At most two coaching strengths and one to three improvement priorities.
- Append-only manager corrections and comments.

### Management and outcomes

- Conversation Intelligence as the strongest detail surface.
- Customer Intelligence and Frontline Performance aggregate views with filters and drill-down.
- Manual event-based automotive and electronics outcomes.
- Gated Outcome Intelligence with learning-state progress and descriptive, adequately sampled comparisons.

### Internal quality

- Immutable model runs and provenance.
- Task-specific evaluation fixtures for entities, numerics, speaker attribution, questions, answer linkage, objections, trackers, cost, and latency.

## Explicit exclusions

- Native mobile applications, live/whisper coaching, or real-time transcription requirements.
- Emotion, personality, age, gender, or psychological inference.
- Public representative leaderboards or elaborate gamification.
- Predictive conversion scoring or causal claims.
- Cross-client benchmarks during the MVP.
- General ask-your-data chat, unrestricted model-to-SQL, and AI report builders.
- CRM, dealer-management, ERP, or automated outcome integrations.
- Government, banking, insurance, real-estate, or contact-center packs.
- Production multi-STT routing or multiple speech providers.
- Support for every Indian language.

## Phase sequence and exit criteria

| Phase | Deliverable | Exit criterion |
|---|---|---|
| 0 | Product and engineering architecture | Documents reviewed; expensive data decisions and open questions resolved or accepted |
| 1 | Application foundation | Authenticated shell, tenancy primitives, environment validation, test harness |
| 2 | Data foundation | Migrations, RLS, typed repositories, seed definitions, security tests |
| 3 | Audio to transcript | Private capture-to-review flow with retries and corrected role assignment |
| 4 | Metrics engine | Catalog formulas implemented with unit fixtures and quality statuses |
| 5 | Structured fact engine | Validated analysis output, evidence integrity, evaluation fixtures |
| 6 | Vertical packs | Automotive and electronics definitions versioned and selectable |
| 7 | Trackers, scorecards, coaching | Configurable, applicable, evidence-backed evaluation |
| 8 | Core UX | Four intelligence surfaces with drill-down and corrections |
| 9 | Outcomes and calibration | Manual events, maturity gates, descriptive comparisons |
| 10 | Pilot hardening | Reliability, privacy, audit, cost, mobile capture, and performance targets met |

## Pilot acceptance criteria

- A user can capture a consented interaction and reliably see its processing lifecycle.
- A manager can map speakers, inspect audio-linked evidence, and correct important outputs.
- The system produces typed facts, linked questions/responses, objections, next steps, metrics, tracker observations, score results, and limited coaching.
- An administrator can publish versioned tracker and scorecard configurations without changing historical evaluations.
- Managers can see aggregate findings with date range, cohort, sample size, and conversation drill-down.
- Outcomes are recorded as history and comparison views remain gated below declared thresholds.
- Tenant-isolation tests prove that users cannot read, mutate, sign, export, or analyze another organization's data.

## Product decisions required before or during Phase 1

1. Pilot organization structure: whether one user can belong to multiple organizations and whether one representative can work at multiple locations.
2. Data residency, default audio/transcript retention, legal basis, and consent wording for pilot jurisdictions.
3. Durable workflow provider and operational ownership.
4. Definition of an eligible conversation for benchmarking and minimum sample size per outcome cohort.
5. Whether managers may view all conversations at assigned locations or only explicit teams.
6. Currency and locale scope beyond INR/India in the MVP.
7. Correction authority: manager-only versus representative-proposed corrections requiring review.
8. Initial approved client playbooks for evidence-backed example phrasing.

