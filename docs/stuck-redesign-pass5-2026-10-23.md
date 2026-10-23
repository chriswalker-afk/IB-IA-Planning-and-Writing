# “I am stuck” Pass 5 — final coherence, cohort and accessibility audit

23 October 2026 · implemented quality-assurance and regression pass

## Student-facing intent

A student who is **actually stuck** must be able to find one relevant obstacle, perform one small mathematical/source/review action, decide whether that action resolved the obstacle and return to the exact place where they were working.

**Amber help** is recovery, distinct from the **purple Writer’s Field Guide** (communication craft) and **green Criteria bubbles** (assessment expectations). No system automatically writes the IA, assigns a grade, diagnoses an error from student prose, invents a mathematical result, approves research, verifies a source, submits the IA or impersonates teacher feedback.

## Defects found and corrected

1. **Outcome safety in global search.** The hub previously listed some result-dependent repairs even when the current active mathematical stage had only a plan. The eligibility rules in `src/help/hub-issues.js` now suppress interpretations, chosen-outcome follow-ups and unwarranted model diagnostics until real, student-confirmed mathematics exists. `result-needs-review` only appears for an actual stale dependency; an unperformed result has its own preparatory repair; a conclusion without verified work offers an honest alternative.
2. **2029 Checking destinations.** Rather than searching the raw D01–D21 catalogue and occasionally linking to a hidden A–E criterion check, the hub derives valid destinations from `reviewChecksFor()` and `isRevisedAssessment()`. Only checks present in the student's cohort and a real Checking mode are offered. D09 MLA and D12 authorship remain available. Final PDF checks link to D17; submission uncertainty links to D21; actual feedback corrections use the feedback workflow. No historical marks or judgement are translated into the revised four-criterion scheme.
3. **Sampling return/backup loss.** The stored help origin used a too-restrictive regex that rejected legitimate Planning node `N03P2`. Origin normalization now validates against the canonical Planning route table and Completing node catalogue, so all legitimate nodes, their focus IDs, scroll positions and context tags round-trip safely.
4. **Lost search on opening advice.** Students can search and select a task filter, inspect a problem and return to the same search. Browse/filter state is ephemeral UI state, not extra persisted project data; a changed project's saved notes remain intact. While searching, unrelated contextual suggestions are hidden, matching groups expand and empty searches give clear feedback.
5. **Archived tasks.** The previous task and note remain visible when the old issue is no longer applicable. The interface stops inviting the student to open an issue that cannot safely be offered in the new context, without deleting the saved action.
6. **Navigation, keyboard and 320px polish.** Back to problems returns focus to the problems heading. Amber tap targets on small phones are enlarged, help panels reflow, reduced-motion users are respected and long recovery labels wrap. Original mathematical stage, Checking draft/feedback/final mode and available field focus still restore.

## Test matrix

Automated Node regressions (`tests/stuck-pass5.test.js` alongside existing support tests) verify:
- Every Planning and IA Studio help placement points to a valid registered node; `N03P2` survives a complete project JSON round trip.
- Sixteen independent investigative routes and seven registered diagram-generator repair links; advice inspection never changes saved maths or teacher data.
- Planned versus genuinely completed mathematics, optional selected outcomes and no phantom PMCC or result-derived advice.
- All live Checking destinations in **both** legacy A–E and revised 2029 A–D cohorts, in draft, feedback and final modes.
- MLA citation and authorship boundaries, honest pending teacher feedback, route provenance, searchable topic groups and historical project state.

Desktop/mobile browser acceptance (`scripts/stuck-browser.py`, run by the **Writing and help** matrix of the existing Conformance browser workflow) adds:
- A **320px viewport** with a search, issue card, Back to problems and restored category/filter.
- A revised **2029 Checking** page, live MLA help bubble, accessible Escape/focus return, and exclusion of historical A–E-only repair links.
- Direct Planning sampling **N03P2** help/work/return navigation.
- A planned mathematical stage that cannot unlock result interpretation.
- Existing browser journeys still cover permission waiting, theoretical routes, selected actual result, legacy C95, note/backup import, teacher question, 360px layout, retained writing help, Checking MLA and feedback.

## Maintenance and final acceptance

The source-of-truth editorial cards remain in `planning-help.js`, `studio-help.js` and `checking-help.js`; `hub-issues.js` indexes these same cards. Do not introduce a duplicate generic advice list for each surface.

All regression tests must pass after the final commit, including production build, the Conformance **Writing and help** browser group, and the existing Criteria-bubbles/Writer’s Field Guide preservation suites. A successful browser test confirms navigation and boundaries, not the correctness of a student's own final mathematics or IA document.

The next substantive improvements (if any) should be based on actual student observations of a missing blocker or a confusing advice choice rather than additional blanket bubbles.
