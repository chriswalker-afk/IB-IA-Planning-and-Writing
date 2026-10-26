# Examiner feedback Pass 4 — AA HL suitability, piecewise models and final consistency

**Date:** 26 October 2026  
**Follows:** [Pass 1 coverage and duplication audit](examiner-feedback-coverage-pass1-2026-10-26.md), [Pass 2](examiner-feedback-pass2-2026-10-26.md), [Pass 3](examiner-feedback-pass3-2026-10-26.md).  
**Source basis:** the supplied 2021–2026 examiner-feedback synthesis, especially **EF006, EF008–009, EF012–014, EF021** (course choice/depth), **EF275** (piecewise continuity/smoothness), and the general cautions about relevance, mathematical rigour and understanding in **EF168–196**. These are *paraphrased* feedback statements, not new IB descriptors.

## 1. AA HL is not AI SL or AA SL with a different label

The AI SL and AA SL mathematics catalogues stay intact and course-specific. **No selectable AA HL syllabus map** has been invented. For AA HL only, a collapsed **“What makes my mathematics suitable for AA HL?”** guide appears where the student chooses their course (Planning N02M); the legacy teacher checkpoint N04T reuses the same guide rather than creating another advice bank.

Its three potential investigative directions respond to the recorded investigation **type** (statistics, modelling, theoretical, or still undecided), not to speculative results. It emphasises how mathematical depth emerges from precisely defined objects and variables, justified steps, appropriate generalisation, genuine counterexamples, checking assumptions, mathematical limitations, and a defensible response to the aim.

A technique that is usually met at SL can be a useful *starting point* for AA HL, but naming more difficult mathematics, using software or adding unnecessary chapters does not establish course-appropriate sophistication or rigour. No route is automatically approved, recommended as officially on-syllabus, or assigned an HL mark. A student still needs to check the course and mathematical depth with their teacher.

During mathematical writing, the existing **“How much of this mathematics should I explain?”** disclosure now includes one concise AA HL question appropriate to the **explicit selected method** (proof/algebra, modelling/optimisation, statistics/inference, or general). It does not infer the technique from title, predicted outcome, route, or prose. The existing distinction between familiar mathematics and unfamiliar first-use explanation remains intact.

For the through-2028 assessment cohort, the AA HL reminder uses accurate **A–E Criterion E context**: precision, rigour and sophistication depend on actual reasoning. For the first-assessment-2029 cohort it instead explicitly disclaims the legacy E criteria and directs students to the revised four-criterion overview. The 2021–2026 PDF must **not** be treated as a source of 2029 rubric descriptors.

## 2. Piecewise function checks are truly conditional

The student can now explicitly identify **“Piecewise functions / models and their joins”** in the existing method selector. The guidance engine also recognises a narrowly matched legacy *technique* label while protecting explicit `other` choices. It **never** recognises piecewise use from a speculative title, plan, result paragraph, or a word in an unrelated source.

The established **Accuracy, assumptions & validity for this result** disclosure now checks a real piecewise mathematical record:

- specify each function branch, its interval and endpoint convention;
- compare one-sided limits and the actual value at a join **if the context requires continuity**;
- compare one-sided derivatives **only if differentiability or a smooth transition matters** and the derivatives exist;
- allow a justified jump or corner; do **not** automatically smooth a discontinuity simply to make a model look sophisticated.

The Pass 3 optional consequential-reflection aid can propose testing **one** change to a boundary or join, while preserving the original function. It requires a completed and review-free result, remains inside the **existing collapsed** validity disclosure, and links to existing mathematical tools without introducing a second modelling form. No calculations, fit claims or error bounds are generated.

## 3. Assessment-framework and duplication pass

The site already has an explicitly chosen legacy/revised framework, a separate 2029 rubric overview, cohort-aware criteria badges and checking. Pass 4 fixes remaining places where **legacy A–E phrasing incorrectly appeared unconditionally**:

| Surface | Before | Now |
| --- | --- | --- |
| Planning welcome, N00 | Promised current A–E criterion badges to every cohort | Legacy retains A–E; revised cohort points to four revised criteria and explains why old criterion bubbles are hidden |
| Writing welcome, C00 | Promised green A–E bubbles on every cohort | Legacy A–E vs revised 2029 advice is differentiated; Writer's Field Guide support stays available |
| IA Studio dashboard, C04 | “Open A–E checking checklist” regardless of cohort | Revised 2029 gets a corresponding review label |
| Final IA Studio self-check, C90F | Asked every student to locate evidence for A–E | Revised students are directed to their four-criterion overview; old notes, if present, remain visibly labelled as earlier notes |
| Mathematical presentation repair, C70/C70N | Attributed source/citation points specifically to legacy A or B | Cohort-neutral academic-integrity language, without inventing criteria marks |
| AA HL in actual mathematical writing | Generic advice about course scope only | One method-specific mathematical-depth question inside the *existing* course disclosure |

This pass does **not** change the legacy A–E rubric, 2029 criterion definitions or marks, existing teacher feedback or review records, source-classification logic, figure generators, citations, file exports, project schemas or backup format. It does **not** create a permanent rubric card or multiple reflection boxes.

### Editorial decisions: opportunities intentionally **not** implemented

- No prescriptive AA HL topic checklist, manufactured “HL only” badge, automatic mapping of AA SL topics to AA HL, automatic mathematical-depth score or teacher sign-off.
- No mathematical-quality grades inferred from a technique name, calculation length, graph type, p-value or apparent complexity.
- No universal continuity/differentiability requirement for piecewise definitions. Corners, jumps, changes of rules and restricted domains can all be mathematically appropriate.
- No extra AA HL writing fields, no generic limitation paragraph, no new hypothetical result and no new numerical engine.
- No automatic retrofit of the pre-2029 A–E assessment scheme to the revised 2029 criteria.

## 4. Verification and preservation contracts

**Automated code tests** in `tests/examiner-feedback-pass4.test.js` cover all three school courses (AI SL, AA SL, AA HL) plus AI HL/other for non-matching safety, three investigative types and undecided status, collapsed teacher-review guidance, preservation of existing AI/AA SL catalogues, partial vs completed mathematics, revised vs legacy cohort wording, A–E notes retained after cohort change, method-ID vs text inference, piecewise joins and nonmandatory differentiability, reduced-advice mode, and import/export-compatible project normalisation.

**Live browser conformance** is extended in `scripts/conformance-browser.py` for AA HL planning, a genuine piecewise stage (including keyboard, 390 px and 320 px), revised Planning and Writing welcomes, revised final review, and preservation of previously authored writing and notes. Existing full project/build and browser workflows must all pass before merging.

A rendering or completed checklist **does not certify** the mathematical validity, authenticity, curriculum suitability or assessment outcome of any finished IA. The student and teacher must still inspect the actual submitted document and current assessment guide.

## Final state and handover

Passes 1–4 now address the prioritised examiner-feedback opportunities with **existing fields, compact contextual prompts and a small number of optional disclosures**. The 392-item ledger remains a developer audit rather than 392 student requirements. Further work should be driven by genuine classroom observations or new examiner feedback, not by a desire to add more prominent advice boxes.
