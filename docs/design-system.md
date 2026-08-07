# ANUMA Design System

## Experience principles

The interface communicates trust, evidence, intelligence, clarity, and action. It is an analytical enterprise product, not a promotional “AI” interface.

- Facts before prose.
- Evidence before judgment.
- Insights before collections of charts.
- Business language before model terminology.
- Strong hierarchy, substantial whitespace, restrained shadow and motion.
- Every semantic claim should offer an evidence path.
- Uncertainty and sample size are visible, never buried.

## Brand tokens

### Core color

| Token | Value | Use |
|---|---|---|
| `--signal-coral` | `#FF4F3D` | mark, primary action, selection, key insight emphasis |
| `--carbon` | `#10131A` | navigation, headings, premium/dark surfaces |
| `--electric-aqua` | `#20D6C7` | verified evidence, positive data signal, active processing |
| `--porcelain` | `#F7F6F2` | application canvas and report surfaces |
| `--graphite` | `#4C5364` | secondary text, labels, inactive states |
| `--risk` | `#B42318` | error/risk; visually distinct from Signal Coral |

Supporting neutrals should be derived as explicit accessible tokens, not opacity-only text. Suggested MVP values: white `#FFFFFF`, border `#D9D9D4`, muted surface `#EFEEE9`, muted text `#6A7180`, dark border `#2A2F39`, warning `#9A6700` with a light warning surface.

Signal Coral is intentional and sparse. Carbon and Porcelain carry most large surfaces. Electric Aqua is a verification/active analytical signal, not a second general CTA color.

## Typography

Use a precise modern grotesk/sans family with excellent Latin and Devanagari coverage; approve the production family in Phase 1 after rendering Hindi and Hinglish. Maintain a system-font fallback stack. Use tabular numerals for metrics and money.

Suggested scale:

| Style | Size / line | Use |
|---|---|---|
| Display | 32/40, 650 | rare page-level insight headline |
| H1 | 26/34, 650 | page title |
| H2 | 20/28, 650 | major section |
| H3 | 16/24, 650 | card/section title |
| Body | 14/21, 400 | product copy |
| Small | 12/18, 450 | metadata and supporting labels |
| Data | 24/30, 650, tabular | primary metric |

Sentence case is preferred. Avoid all-caps except compact status/eyebrow labels with appropriate letter spacing.

## Spacing, shape, and elevation

- Base spacing unit: 4px; common rhythm 8, 12, 16, 24, 32, 48.
- Content density can be compact in tables, but primary analysis sections retain 24–32px breathing room.
- Radius: 6px controls, 8px cards, 12px major panels; avoid pill-shaped containers except statuses/filters.
- Use a 1px neutral border as the default separation. Shadows are subtle and limited to overlays or elevated focus surfaces.
- Desktop application content max width is contextual; Conversation Intelligence may use a wide evidence layout. Mobile becomes one column without hiding evidence access.

## Application shell

Carbon navigation provides stable areas: Conversations, Customer Intelligence, Frontline Performance, Outcome Intelligence, and Administration according to role. The active item uses a restrained Coral indicator. Organization/location context and user menu are explicit.

The first viewport of a detail page prioritizes the interaction and its status, not generic dashboard chrome. Avoid decorative gradients, glowing effects, glassmorphism, brain imagery, and arbitrary chart walls.

## Component language

### Status and quality badges

Text plus icon/color; never color alone. Separate:

- processing: queued, transcribing, analyzing, ready, partial, failed;
- evidence quality: verified, measured, estimated, inferred, uncertain;
- evaluation: pass, partial, fail, not applicable, uncertain;
- outcome: vertical-specific event/state.

Coral is not used for generic error. Aqua indicates verified/active positive signal; risk red indicates failure; neutral gray indicates N/A/unsupported; warning amber indicates uncertain/partial.

### Evidence link

An evidence link shows timestamp, speaker label, short excerpt, and a play/seek affordance. Keyboard activation seeks audio and focuses the corresponding transcript segment. The source run/review metadata is available in a details disclosure without cluttering the main surface.

### Insight card

One operational statement, value/comparison, date range, cohort, sample size, quality/maturity label, and “View conversations” drill-down. Avoid a chart when a sentence and number communicate more clearly.

### Metric card

Label, value/unit, quality badge, concise definition tooltip, and optional denominator/sample. No green/red judgment unless a client expectation or approved comparison exists.

### Data tables

Sticky accessible headers, keyboard sorting/filtering, clear empty/loading/error states, density suitable for management review, and row navigation. Use alignment and typography before excessive gridlines.

### Filters

Date, organization, team/location/region, representative, interaction type, vertical, product/category/brand. Active filters remain visible and removable; saved views can wait until justified.

## Core screen composition

### Conversation Intelligence

1. Header: representative, location/team, date/time, duration, language, processing state, outcome.
2. Customer intent and commercial facts with evidence.
3. Questions/answers, objections/handling, and next steps.
4. Objective interaction metrics and quality labels.
5. Process/scorecard criteria with applicability and evidence.
6. Limited coaching.
7. Persistent or easily reached audio player with searchable, speaker-correctable transcript.

On desktop, use an intelligence column plus evidence/transcript column. Evidence selection synchronizes the player and transcript. On mobile, the audio player remains sticky and evidence opens a focused transcript sheet/section.

### Customer Intelligence

Lead with two to four useful findings, then needs, questions, unanswered questions, objections, competitors/pricing, feature requests, financing/warranty, and availability. All aggregates show cohort and drill-down.

### Frontline Performance

Show coverage first, then scorecard adherence, tracker rates, question-answer coverage, discovery behavior, distributions, team/store comparison, and coaching opportunity frequency. No early public leaderboard.

### Outcome Intelligence

Below sufficiency, show “Outcome Intelligence is learning,” eligible interactions, labeled interactions, required additional observations, and why comparisons are gated. When mature, comparisons use descriptive language, explicit cohort `n`, and no causal styling/copy.

## States and accessibility

- Loading uses stable skeleton geometry sparingly; processing state text remains available.
- Empty states explain whether data is absent, not applicable, filtered out, or still learning.
- Failure states give a safe next action and support correlation without exposing provider details.
- Meet WCAG 2.2 AA contrast, keyboard, focus, target size, headings, labels, announcements, and reduced-motion expectations.
- Charts require text summaries, accessible labels/tables, and non-color differentiation.
- Audio controls expose play/pause, time, seeking, speed, and keyboard operation; transcript highlights do not flash.
- Long Hindi/English code-mixed text must wrap predictably and preserve readable speaker/timestamp alignment.

## Content rules

Prefer “Evidence,” “Customer Intelligence,” “Process,” and “Outcome Intelligence.” Avoid “AI Magic,” “AI Brain,” “sentiment AI,” causal claims, and personality judgments. State uncertainty directly: “Could not determine from the available evidence.” State sample context: “Detected in 18 of 58 eligible conversations.”

## Phase 1 design decisions

1. Choose and license a font with tested Devanagari and tabular-number quality.
2. Validate token contrast and focus styles in light/dark navigation contexts.
3. Prototype the Conversation Intelligence evidence/audio interaction first.
4. Establish responsive table/filter patterns before building aggregate screens.
5. User-test quality labels and outcome-learning copy with pilot managers.

