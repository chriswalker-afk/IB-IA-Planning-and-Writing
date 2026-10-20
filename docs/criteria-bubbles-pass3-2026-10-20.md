# Criteria bubbles: Pass 3 — Broadening legitimate evidence

Date: 20 October 2026. This implementation supports the **current five IA criteria A–E**. No attempt is made to apply the first-assessment-2029 rubric here.

## Design decision

Keep all 67 existing criterion bubble locations from Passes 1–2. Where a contextual **C, D or E** pop-in is relevant, place a single **collapsed** section entitled *Other ways to demonstrate Criterion [letter]* inside the existing dialog. No new student writing field, stage, mandatory step, mark prediction or alternative checklist is created.

A student only explores an option if it genuinely advances the investigation; the options do not confer a mark by being selected, viewed or completed in Pathfinder.

## Mathematical variety

There are 13 editorial advice profiles used across all 16 investigative routes and current mathematical methods:

- Relationships and correlation
- Comparing numerical groups or variation
- Categorical data
- Modelling, including cycles, fitted functions, growth and trajectories
- Optimisation
- Measured geometry and image tracing
- Voronoi regions
- Financial modelling
- Probability and simulation
- Proof, conjecture and counterexample
- Iteration and convergence
- Numerical methods and approximation
- General mathematical reasoning

For **C**, opportunities include independently developing conjectures, exploring different mathematical perspectives, selecting useful model tests, refining assumptions and making meaningful methodological decisions. For **D**, opportunities include actual mathematical sensitivity and robustness checks, alternative interpretations, comparison of genuine approaches and counterexamples. For **E**, suggestions emphasise coherent mathematical justification, validation, mathematically supported generalisations, correct calculations and precise statement of conditions.

A student never needs to perform all three suggestions. A single strong and suitable mathematical line of reasoning can be better than three irrelevant techniques.

## Selection and integrity rules

1. **The method in the active mathematical record takes priority** over the original investigative route. Thus, a proof stage in a modelling investigation offers proof-related guidance.
2. A route selected in Planning is used as a fallback only if the current step has not identified a mathematical method. An explicit **Other** choice uses general, non-prescriptive advice rather than guessing from the earlier route.
3. The active record is chosen from the mathematical stage the student is working in, not an unrelated previous or later record. The conclusion uses the most recent genuinely confirmed, review-free result.
4. Incomplete, planned or review-flagged mathematical work produces **possible** suggestions, not claims of completed evidence. The chosen route/technique is a prompt for future mathematical work, not a finding.
5. These suggestions are static editorial guidance. They never inspect or claim to have verified calculations in the actual IA file, and never populate a result or a criterion self-review automatically.
6. Only existing C/D/E bubbles in relevant Planning and Writing stages receive the collapsed disclosure. A, B and multi-criterion review controls retain their existing scope.

## Criterion E, SL and HL

For SL, the optional guidance foregrounds relevant, correct, course-appropriate mathematics and visible understanding through meaningful checks. For HL, it foregrounds precision **and** appropriate mathematical sophistication **and** rigour. This can arise within the HL course. Mathematics beyond the syllabus is **not required** for the top descriptor. The real rubrics remain accessible from every bubble.

If the student has not confirmed SL or HL, the wording asks them to confirm the relevant descriptors rather than guessing.

## UI and acceptance criteria

- Collapsed by default; uses the browser's native **details/summary** interaction inside the existing accessible dialog.
- Only a concise description and 2–3 optional mathematical opportunities; no additional visible bubbles.
- Does not add user-editable controls or modify stored work.
- Supports keyboard Enter and Escape, restores focus to the original bubble and does not cause horizontal overflow at 360px.
- Unit checks verify all 16 routes, method precedence, theoretical and modelling cases, review flags, confirmed/planned distinction, and SL/HL/unknown E messages.
- Browser tests verify the disclosure on first and later mathematical stages, the conclusion and both phone/desktop sizes.

## Next

**Pass 4 — UI consistency and full acceptance.** Review interaction and visual consistency of bubbles across Planning, Writing and Checking; long-form/mobile readability; location/meaning of badges; comprehensive representative journeys; and future assessment-cohort-specific rubric versioning without altering current students' A–E experience.
