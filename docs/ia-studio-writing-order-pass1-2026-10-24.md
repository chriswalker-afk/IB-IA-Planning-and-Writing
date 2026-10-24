# IA Studio information-order audit — Pass 1 (24 October 2026)

## Purpose

A student noticed that **Write your introduction** appeared above **Before you write**. The cause was the shared Guided-mode writing-stage renderer, not an isolated Introduction template. This pass restores the intentional learning order across Introduction and all 31 configured IA Studio writing stages.

## Reading sequence

**Guided:** brief contextual writing advice (and relevant citation reminders on Introduction) → relevant saved Sparks → actual writing/mathematical task with criterion and Field Guide bubbles → optional comparisons/examples and further help.

**Reduce advice:** actual task with field-level help immediately visible → saved Sparks in a collapsed, keyboard-accessible disclosure. Optional advice and examples are omitted, not deleted.

Special cases:
- **Conclusion C60:** the conclusion workspace already includes its own evidence selector and saved-context disclosure. Do not add an additional Spark shelf above it; show advice, then the existing evidence-led task, then optional examples.
- **Introduction C10:** keep the single aim/motivation/prediction prompt with canonical editable prediction Sparks; keep the independent saved-Sparks library and one actual task textarea; retain A/C and purple Field Guide bubbles on the task. Put the short source-attribution reminder alongside pre-writing advice, not after the examples.
- **Mathematical stages:** only genuine student-confirmed mathematics is a result; stage-specific content and the internal Introduce → Show → Interpret → Next ordering are unchanged.

## Safety and regression contract

- Rendering does not mutate stored project data, promote plans/predictions to findings, rewrite student IA prose, grade work, or hide existing input controls.
- Keep the full Writer's Guide lessons behind the existing focused pop-in rather than adding long mandatory instruction blocks.
- Do not reorder inputs within a task in this pass; that is a separate targeted decision-sequencing audit (Pass 2).
- Do not alter Checking workflows or resource discovery; those are Pass 3.
- Unit tests cover all 31 configured IA Studio pages, Introduction composition, and Reduced advice. Playwright checks also validate actual vertical ordering, field-level criterion bubbles, saved Sparks, and desktop/phone overflow.
