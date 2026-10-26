# Examiner feedback: Pass 2 — sampling and statistical precision

**Date:** 26 October 2026  
**Follows:** [Pass 1 coverage and duplication audit](examiner-feedback-coverage-pass1-2026-10-26.md), especially source recommendations **EF203**, **EF214** and **EF230–251**.

## What changed

**1. Sampling size is justified beside the actual sample count (C21S).** The existing `completion.fields.samplingRationale` field, not a duplicate text field, now sits after `sampleSize` in a collapsed optional explanation. Its prompt distinguishes an actual sample, an attempted census, published observations and an uncertain status. Existing saved answers automatically expand; no text is overwritten. Planning N03P2 now prompts the student, within the *existing* optional sampling discussion, to think about coverage and plausible sample size without guessing a final sample count.

**2. Paired observations should be checked as (x, y) pairs (EF214).** C21S offers a collapsed optional explanation when the student has described pairing or selected paired numerical data. Pearson, Spearman and straight-line regression mathematical-validity advice now explicitly checks influential *pairs*, source matching and justified inclusion/exclusion decisions. The advice never deletes, modifies or judges an observation.

**3. Hypothesis-test readiness belongs BEFORE the calculation.** A new read-only method-specific aid in `src/completing/statistical-readiness.js` appears in the *Introducing* part of C30, C40 and C50, after the student explicitly chooses **two-sample t-test**, **chi-squared independence**, or **chi-squared goodness of fit**, and before the *Showing* mathematics part. It asks about the actual investigation question, H0/H1, significance level selected before result inspection, data conditions, correct statistic/df, and honest interpretation.

The independence test addresses a contingency table with expected count `(row total × column total)/grand total`, its usual `(r−1)(c−1)` degrees of freedom, low expected-frequency checks and **Yates only as a conditional 2×2-table consideration**. The goodness-of-fit test addresses prespecified category probabilities, expected count `n×p`, category grouping, parameter-estimation effects on df and no blanket use of Yates. The t-test distinguishes independent groups from matched/paired observations and accounts for assumptions and meaningful effect size.

## Implementation guardrails

- This pass adds **no new stored field**, no mandatory sampling response, no mathematical result, no auto-calculated significance, no p-value, and no text inserted into an IA.
- Never infer a statistical method from the student's writing, title, original plan or a previous stage; use the current explicit `methodId` only.
- Existing sampling rationale, student writing, linked sources, diagrams, results and review flags remain unchanged and editable in place.
- Keep the new aids **collapsed**, keyboard and touch accessible via native `details/summary`, and available in Reduce advice mode.
- In contexts that are theoretical, non-statistical, or have no selected hypothesis test, render no pre-test aid. Do not treat a planned calculation as completed work.
- The aid explicitly instructs students not to claim hypotheses or significance levels were specified beforehand if they were not. It does not certify assumptions or mathematical correctness.
- No universal significance cut-off, minimum-sample-number rule or Yates correction is imposed; teacher/current IB guidance remains authoritative.

## Test cases

`tests/examiner-feedback-pass2.test.js` covers: explicit test method gating; inherited/unsafe method IDs; different t/independence/goodness-of-fit methods; significance/hypothesis timing; Yates not appearing in goodness-of-fit; reduced mode and review flags; positioning before the mathematics in C30/C40/C50; reusing the original rationale field, including old saved text; optional paired-data explanation; census/secondary/sample/uncertain prompts; theoretical route exclusion; and preservation through project normalisation.

Existing project suites and production build are required to pass before merge. These tests check generated HTML, mathematical wording and data-state boundaries; they do not claim to inspect a student's actual IA PDF, or to replace interactive browser-based accessibility evaluation.

## Next

**Pass 3 — Consequential reflection and coherence.** Link mathematical limitations to one genuine sensitivity or robustness check, reusing existing tools; introduce one title–aim–conclusion self-check without another compulsory prose box. Preserve all saved records, numerical outputs, review flags, conditional help and reduced-advice behaviour.
