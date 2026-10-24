# Information ordering, Pass 2: decisions within Planning and IA Studio

24 October 2026

## Rule
Inside each individual task: **ground the decision → show a short relevant caution or optional explanation → ask the student to choose/justify → offer optional alternatives → continue**. Preserve the student's existing inputs and established mathematical sequence.

## Improvements implemented
- **Prediction (N01P):** tell students that a surprising result is legitimate *before* requesting the prediction; the optional plan-refinement section remains *after* the prediction and its reason.
- **Sampling (N03P2):** define the population and unit, then establish frame feasibility; place the existing collapsed sampling/census method recap *before* the method selector. Keep personalised method feedback and frame warnings after the selection. Keep the secondary sampling-planner renderer consistent.
- **Methods (C22):** name the actual method, explain its mathematical suitability, then optionally compare a method that the student genuinely considered. Store the same field; automatically expand the comparison when it contains earlier notes. Do not require a manufactured alternative.
- **Precision (C24/C34A):** give essential guard-digit and relevance guidance *before* students choose a display-accuracy policy or explain its defensibility.
- **Definitions (C25):** explain just-in-time notation *before* asking students to record symbols and specialist terms.
- **Optional first-output details (C32):** ask for a title, purpose, technique, selected method and relevant definitions *before* showing saved figure panels. Keep figure location and source/accuracy links available.
- **Next steps (C35):** state explicitly that no extra mathematical stage is required *before* asking for another question or method; an appropriately limited conclusion can be the correct decision.
- **Scatter follow-up (C35B):** explain Pearson's r measures linear association *before* the student classifies the scatter and considers PMCC.
- **First-method transition (C20):** the source/accuracy disclosure already precedes the continue button. Make its relevance clearer in the continue text; do not force a dataset for theoretical mathematics.

## Verified already in a sensible order
- **Sampling frame** already appeared before the selected method in N03P2.
- **Prediction plan refinement** already followed the recorded expectation on N01P.
- **Further mathematical stages (C40/C50)** already required a mathematical question, identified the method, and *then* asked for a bridge and suitability explanation.
- **PMCC follow-up (C35P)** already showed a causation caveat before interpretation and continuation.
- **Conclusion (C60)** already displayed the mathematical reminder before the meaning/limitations field, and optional questions before the extension field.
- **C20** already put its source/accuracy section before the continue action.

No change was made to those working sequences other than guarding them with regression tests. The four-part Introduce → Show → Reflect → Next mathematical narrative is unchanged. Student data schemas, field paths, criterion and Writer's Guide bubbles, and the Reduce advice setting are unchanged.

Pass 3 remains reserved for Checking/teacher feedback and support/resource discovery.
