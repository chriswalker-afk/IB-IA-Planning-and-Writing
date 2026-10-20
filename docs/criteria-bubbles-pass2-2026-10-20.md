# Criterion bubbles — Pass 2: Repeatable mathematical-journey coverage

**Implemented for the current A–E IB mathematics assessment criteria.**

## What changed
The existing four-part **C40/C50 repeatable mathematical stage** now has seven targeted contextual opportunities per stage, positioned by the corresponding *existing* student field:

| Stage component | Field | Criterion opportunities | Why |
| --- | --- | --- | --- |
| 1. Connect the mathematics | Linked previous-result bridge | A | Coherent progression from a verified prior finding |
| 1. Choose the mathematics | Why this method suits the aim | E (existing) | Relevance, mathematical suitability and student understanding |
| 2. Show actual work | Genuine mathematical result | B and E | Legible mathematical communication and justified, correct working |
| 3. Interpret | Implication for the aim | D | Mathematical reflection on a genuine finding and relevant limitations |
| 4. What follows | Optional next question | C | Student-owned mathematical decision; stopping is valid |
| 4. Justify next step or stop | What remains and why | D | Reflection on the result rather than a compulsory extra technique |

**C40 and C50 each use identical semantic locations** and can be repeated. These are optional help bubbles, never checklist requirements or awarded marks. The first mathematical stage C30 and all older saved student fields remain unchanged.

## Adaptive guidance
- Method-specific suggestions for **proof/algebra, optimisation, geometric constructions including Voronoi and triangulation, finance, probability/simulation, statistics, fitted modelling, numerical methods and a general fallback**. The chosen method ID takes precedence over ambiguous free text.
- A bubble only refers to a *completed and review-free* active mathematical result. Planned, stale or flagged work cannot be used to generate an invented outcome or claim credit.
- The introductory Criterion A advice may refer to the specifically linked previous stage **only when verified**; otherwise its context is labelled as a note requiring verification.
- Different advice for introducing method, actually presenting calculations, interpreting a completed outcome, choosing an optional new mathematical question and justifying a stopping point.
- For mathematical ideas genuinely outside or partly outside the course, Criterion E explains what should be justified when first introduced, without treating advanced material as inherently better.
- Shared pop-ins still link to the complete rubrics and remain read-only.

## Verification and safeguards
- Registry coverage tests include all new bubble keys and require the same mapping on both C40/C50.
- Unit tests check **planned versus completed versus flagged**, active-entry scoping, verified predecessor relationships, pathway-specific mathematical advice and state immutability.
- End-to-end desktop and mobile browser acceptance checks cover all four parts, both C40/C50, actual mathematical result in the pop-in, keyboard dismissal, read-only behaviour and planned-work guardrails.
- Student fields, entry IDs, evidence links, stored notes, sequence controls, exporting and Checking review records were **not renamed or migrated**.

## Next
**Pass 3 — Broaden legitimate criterion evidence pathways.** The current bubbles correctly support a compact set of opportunities. Extend *optionally and conditionally*, rather than adding compulsory fields or more bubbles: C can recognise conjectures, creative modelling choices and student-designed tests; D can recognise appropriate comparisons, counterexamples, sensitivity and robustness; E can foreground rigorous reasoning, mathematical validation, generalisation, and distinct SL/HL descriptor guidance. Do not reward any technique merely for seeming advanced. Then **Pass 4**: comprehensive UI harmonisation and browser acceptance, mobile reading comfort, and cohort-aware handling of the first-assessment-2029 revised criteria.
