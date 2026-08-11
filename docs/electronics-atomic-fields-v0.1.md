# Electronics Atomic Fields v0.1

## Purpose

This is ANUMA's proposed canonical field dictionary for offline electronics retail.
It supports laptops, smartphones, televisions, tablets, gaming, audio, wearables,
cameras, appliances, and other configurable electronics categories. It turns the
founder guide's forty conversation facts into a stable contract for
extraction, human annotation, corrections, integrations, and later
bottom-up analytics.

It is a **specification, not a migration or product commitment**. A field
may be added to the persisted product only when its extraction rule,
evidence requirement, correction behaviour, and evaluation fixture are
ready. It must not be surfaced merely because the field exists here.

## Non-negotiable rules

- An atomic fact is one assertion or event, never an editable wide
  `conversation` column.
- Every `evidence_extracted` fact links to one or more immutable transcript
  segments from the analysis run that produced it.
- `verified` facts come from deterministic system context or an authoritative
  retail source. They must not be presented as conversational evidence.
- `evaluated` facts are a versioned judgement. They retain the input evidence,
  rubric version, and evaluator/model lineage.
- `inferred` facts are later aggregate conclusions. They never masquerade as a
  direct conversation observation.
- Repeated needs, products, prices, objections, requirements, and actions are
  separate instances. Do not overwrite the first one with the last one.
- Use `not_stated`, `insufficient_evidence`, `ambiguous`, or `unknown` when
  appropriate. Absence is useful information; ANUMA must not fill it with a
  guess.
- Monetary facts retain their spoken or authoritative currency. There is no FX
  conversion. Evidence-extracted money needs a numeric source span; store
  integer minor units only after deterministic ISO-exponent conversion.
- A customer claim remains a claim. For example, “Amazon has it for ₹78,000”
  is not a verified competitor price until an authorised external source
  confirms it.

## Source classes

| Class                | Meaning                                                              | Required lineage                                                 |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `verified`           | System-generated, deterministic, or authoritative retail-system fact | source system, record identifier, captured timestamp             |
| `evidence_extracted` | Explicitly stated in the interaction                                 | transcript run, segment IDs, time range, speaker mapping version |
| `evaluated`          | Judgement against a declared rubric                                  | input fact/evidence IDs, rubric version, evaluator/model version |
| `inferred`           | Aggregate conclusion across compatible facts                         | metric definition, cohort, eligibility, sample size              |

## Cardinality and value conventions

- **One** means one effective value per Commercial Interaction Record, while
  retaining immutable historical assertions/corrections.
- **Many** means a separate linked object for each occurrence.
- **Range** stores lower and/or upper amount with a qualifier; do not collapse
  “₹70–80k” into an exact ₹75k.
- **Entity** stores canonical entity ID when matched plus the original surface
  text. Optional future enrichment must not invent or replace a spoken product claim.
- **Relation** identifies the object to which a fact applies, for example a
  price to a considered product, or a response to an objection.

## The 40 pilot fields

### A. Interaction identity and arrival context

|   # | Canonical field        | Grain / cardinality              | Source class       | Rule                                                                                                 |
| --: | ---------------------- | -------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
|   1 | `conversation_id`      | interaction / one                | verified           | ANUMA-generated immutable identifier.                                                                |
|   2 | `store_id`             | interaction / one                | verified           | Store/location context captured at interaction creation; do not infer from speech.                   |
|   3 | `representative_id`    | interaction / one                | verified           | Membership/assignment snapshot, not provider speaker number.                                         |
|   4 | `started_at`           | interaction / one                | verified           | Device or recording start timestamp in UTC.                                                          |
|   5 | `ended_at`             | interaction / one                | verified           | Recording end timestamp in UTC.                                                                      |
|   6 | `language_mix`         | interaction / one-or-many labels | evidence_extracted | Evidence-backed language/code-mix classification; never changes the UI language.                     |
|   7 | `customer_party_size`  | interaction / one                | evidence_extracted | Capture only when confidently audible or visually/manual confirmed; otherwise abstain.               |
|   8 | `purchase_category`    | interaction / one                | evidence_extracted | Canonical electronics category; evidence required.                                                   |
|   9 | `arrival_intent_state` | interaction / one                | evaluated          | `unknown`, `exploratory`, `partial`, or `defined`; based on opening evidence and a versioned rubric. |
|  10 | `initial_request`      | interaction / many               | evidence_extracted | Verbatim-normalised request with exact opening evidence span.                                        |

### B. Customer demand and requirement development

|   # | Canonical field             | Grain / cardinality         | Source class       | Rule                                                                                                 |
| --: | --------------------------- | --------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
|  11 | `purchase_use_case`         | requirement / many          | evidence_extracted | One use case per assertion, such as study, coding, or gaming.                                        |
|  12 | `target_budget`             | requirement / many          | evidence_extracted | Target spend/range; numeric evidence and currency required.                                          |
|  13 | `maximum_budget`            | requirement / one-or-many   | evidence_extracted | Ceiling only when explicitly stated; never derive it from target budget.                             |
|  14 | `purchase_timing`           | requirement / one-or-many   | evidence_extracted | Stated timing with precision, for example `this_week` or `before_college_starts`.                    |
|  15 | `brand_preference`          | requirement / many          | evidence_extracted | Explicit positive/negative/neutral preference only; retain strength and brand entity relation.       |
|  16 | `specification_requirement` | requirement / many          | evidence_extracted | Entity-normalised technical requirement, such as RTX 4060 or 16 GB RAM.                              |
|  17 | `portability_requirement`   | requirement / many          | evidence_extracted | Explicit portability requirement with importance/constraint text; distinguish stated from confirmed. |
|  18 | `battery_requirement`       | requirement / many          | evidence_extracted | Duration/range where stated; do not convert “good battery” into hours.                               |
|  19 | `other_constraint`          | requirement / many          | evidence_extracted | Any separately evidenced constraint, for example weight under 2 kg.                                  |
|  20 | `decision_driver`           | decision observation / many | evaluated          | Repeated or explicit driver such as performance, value, portability; retain `assertion_basis`.       |
|  21 | `requirement_origin`        | requirement / one           | evaluated          | `stated`, `discovered`, or `inferred`; required provenance for the effective requirement set.        |
|  22 | `requirement_clarity_start` | interaction / one           | evaluated          | Versioned opening-state rubric; never infer from a missing transcript.                               |
|  23 | `requirement_clarity_end`   | interaction / one           | evaluated          | Versioned end-state rubric, independent of purchase outcome.                                         |

### C. Product, commercial context, and friction

|   # | Canonical field          | Grain / cardinality                            | Source class                    | Rule                                                                                                         |
| --: | ------------------------ | ---------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
|  24 | `product_considered`     | product relation / many                        | evidence_extracted              | Product/model candidate considered by either party; preserve the source claim.                               |
|  25 | `product_recommended`    | product relation / many                        | evidence_extracted              | Representative-proposed model/SKU candidate with evidence.                                                   |
|  26 | `recommendation_reason`  | recommendation relation / many                 | evidence_extracted              | Reason linked to a recommended product and customer requirement, such as performance/value.                  |
|  27 | `store_price_quoted`     | price assertion / many                         | evidence_extracted or verified  | Spoken price is evidence-extracted; system price is verified. Retain product relation and price role.        |
|  28 | `competitor_named`       | competitor relation / many                     | evidence_extracted              | Exact retailer/brand mention, for example Amazon.                                                            |
|  29 | `competitor_product`     | competitor relation / many                     | evidence_extracted              | Product/model asserted for a competitor; cautious entity normalisation.                                      |
|  30 | `competitor_price_claim` | price claim / many                             | evidence_extracted              | Speaker-labelled claim with currency/numeric evidence; not externally verified price.                        |
|  31 | `stock_status`           | product/store context / many                   | verified preferred              | Inventory snapshot/feed is authoritative. Preserve a separate spoken availability assertion when relevant.   |
|  32 | `promotion_discussed`    | commercial event / many                        | evidence_extracted              | Bank cashback, bundle, discount, exchange, or other offer; evidence required.                                |
|  33 | `finance_requested`      | question/requirement / many                    | evidence_extracted              | EMI/finance request linked to the question and any response; terms are absent until stated.                  |
|  34 | `objection`              | objection event / many                         | evidence_extracted              | One object per resistance, with family such as price, weight, warranty, stock, finance, or competitor offer. |
|  35 | `objection_response`     | objection-response relation / one-or-many      | evaluated                       | Linked to one objection; `resolved`, `partially_resolved`, `unresolved`, `deferred`, or `uncertain`.         |
|  36 | `alternative_offered`    | response/recommendation relation / one-or-many | evaluated                       | `yes`, `no`, or `not_applicable`; applicability must be explicit and evidence/rubric retained.               |
|  37 | `product_demo_performed` | product event / many                           | evidence_extracted or evaluated | Audible evidence when available; visual/manual confirmation is permitted but separately sourced.             |

### D. Closing and authoritative outcome

|   # | Canonical field        | Grain / cardinality                     | Source class       | Rule                                                                                                                                   |
| --: | ---------------------- | --------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
|  38 | `next_action`          | commitment/action / many                | evidence_extracted | Owner, action, timing, and precision when stated; evidence required.                                                                   |
|  39 | `final_decision_state` | interaction / one                       | evaluated          | `purchased`, `researching`, `deferred`, `follow_up`, `unknown`, etc.; evidence plus later outcome may refine, never overwrite history. |
|  40 | `commercial_outcome`   | external outcome event / many over time | verified           | POS/manual-confirmed event, such as invoice, no sale, cancellation, or unknown. Never manufacture it from conversation alone.          |

## Required linked objects

The forty fields are intentionally not forty new columns. They are implemented through
the existing ANUMA grains plus a small number of future typed projections:

| Object                        | Holds                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Commercial Interaction Record | interaction identity, effective arrival/final state, and links to all facts/context/outcomes |
| Requirement assertion         | use case, budget, specification, preference, constraint, timing, provenance                  |
| Product relation              | considered/recommended product, entity match status, recommendation reason                   |
| Commercial assertion          | price, promotion, finance, competitor, availability claim/context                            |
| Objection and response link   | objection occurrence, response/handling, resolution and alternatives                         |
| Evidence group/reference      | immutable transcript evidence and timestamps for every evidence-extracted claim              |
| Retail context snapshot       | product-master, price, inventory, promotion, finance offer inputs with source timestamps     |
| Outcome event                 | invoice/no-sale/follow-up/return history, separate from conversation observations            |

## Current ANUMA mapping

The current Phase 5 observation contract already provides the starting set:
`need`, `budget`, `product`, `spec`, `price`, `competitor`,
`competitor_price`, `store_quote`, `question`, `objection`, `barrier`,
`decision_driver`, `commitment`, `next_action`, and `finance`.

This v0.1 dictionary deliberately adds no synonyms to that contract. Future work should
add typed, versioned attributes and first-class relations rather than letting extraction
invent keys such as `customer_budget` or `amazon_price`. Existing canonical observations
remain reusable inputs; a future Commercial Interaction Record is their evidence-led
projection, not a second extraction pass.

## Pilot implementation order

### P0: validate before exposing

Fields 1–16, 24–30, 33–35, and 38 are the first evaluation set for a
electronics-wide gold set. Laptop, phone, TV, and appliance fixtures should exercise the
same shared concepts; category-specific specifications remain controlled data. They directly support the pilot questions about customer demand,
recommendation, online-price friction, finance, and next action.

### P1: optional enrichment or manual outcome context

External product, inventory, price, promotion, POS, and similar operational sources are optional enrichment, never a prerequisite for core interaction intelligence. Manual outcomes remain a later dedicated workflow.

### P2: introduce only after rubric calibration

Fields 9, 20–23, 35–36, and 39 are evaluated judgements. They need a published rubric,
inter-rater review, and held-out fixtures before becoming trusted analytical inputs.

## Acceptance tests for every field

Before a field is enabled for a pilot, its fixture set must include:

1. explicit positive evidence;
2. a legitimate absence / `not_stated` case;
3. ambiguous or insufficient evidence;
4. multiple instances where its cardinality is many;
5. English, light Hinglish, heavy Hinglish, and Hindi/Devanagari where relevant;
6. corrected effective value without source-history mutation;
7. evidence belonging to the same organization, conversation, and transcription run;
8. money/currency edge cases where applicable; and
9. an authoritative-system conflict case for any field that may later be verified.

## Explicitly not fields

Do not add sentiment, personality, emotion, conversion propensity, “rep quality”, or
unverified revenue leakage as atomic facts. They are either prohibited inference types,
evaluations requiring a rubric, or later aggregate analyses that must be calculated from
compatible atomic data and disclosed cohorts.
