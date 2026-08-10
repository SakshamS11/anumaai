# ANUMA motion design

Motion is evidence grammar, not decoration. A transition must communicate one of: extraction, connection, transformation, progression, focus, resolution, or drill-down. If it does none of these, remove it.

## Research principles retained

Sarvam demonstrates a product capability rather than merely naming it; ANUMA takes the principle of an explorable demonstration, not its visual system. Linear demonstrates disciplined hierarchy and rapid state changes; ANUMA takes the restraint, not the dark product-tool aesthetic. ElevenLabs and Stripe demonstrate clear product stories; ANUMA takes narrative clarity but does not copy layouts, media, colors, or motion. Recent research on AI web-design homogenization identifies frictionless first outputs as a convergence risk. ANUMA responds with deliberate alternatives: its public experience is built from source turns, evidence traces, question-response links, and conversation measures rather than cards, gradients, generic dashboards, or AI imagery.

## Signature interactions

- **Signal Theatre:** a visitor selects a structured finding or dialogue lens; the original spoken phrase gains focus and its trace becomes active.
- **Conversation lenses:** the same illustrative interaction moves from raw speech to structured facts, dialogue relationships, deterministic measures, and organization evaluation. The visitor controls the lens.
- **Evidence thread:** a finding, question, response, objection, or handling state links to an exact timestamped source turn. A trace may draw on selection; it must remain an ordinary accessible link without animation.

## Timing and triggers

- Product controls: 150–220ms, `ease-out`; pressed states are clear but do not use generic scale effects.
- Evidence focus: 180–300ms; opacity and transform only where possible.
- Marketing state change: 250–450ms; never block reading or LCP. Initial entrance is optional; meaningful progression stays visitor-controlled.
- Native scrolling always wins. Do not scroll-jack, force horizontal galleries, autoplay carousels, or run perpetual motion.

## Responsive, performance, and accessibility

Use CSS transitions, IntersectionObserver, or the Web Animations API before adding a motion dependency. Avoid layout-heavy continuous animation and use `will-change` only during active transitions. Mobile uses stacked, touch-friendly states rather than pinned storytelling. `prefers-reduced-motion` removes travel, drawing, and non-essential transitions while retaining all content, evidence paths, hierarchy, and controls. Hover interactions must also work through focus, keyboard, and touch.

## Marketing versus product

Marketing may be narrative and exploratory. Product motion is calm and operational: evidence focus, drill-down, navigation continuity, correction state, and real processing state only. No cinematic product screens, fake progress, waveforms, gradients, glass, glows, particles, floating cards, or generic KPI animation.

## QA

Review at 390px, tablet, 1024px, and 1440px. Test rapid reversal, resize, long/code-mixed text, keyboard focus, touch, reduced motion, content without JS, and a normal mobile device profile. Do not commit temporary screenshots.
