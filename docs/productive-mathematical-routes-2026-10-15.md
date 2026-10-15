# Productive mathematical routes and advice visibility — 15 October 2026

## Purpose

A result should open **appropriate decisions**, not a fixed mathematical checklist. Students remain responsible for describing what their graph, calculation or proof **actually shows**; Pathfinder does not infer a fitted model, suggest an IB mark or add mathematics to their IA document.

The six audited routes now include result-specific choices and prominent, minimal checks:

| Route | Selection made by student | Visible essential mathematical check | Optional natural next question |
| --- | --- | --- | --- |
| Approximate linearity | Graph looks approximately straight; r has meaningful linear association | Interpret r in context; when fitting a line interpret slope with units, intercept, residuals and valid prediction range | Would prediction help the original aim? |
| Curvature / weak linear association | Graph curved/turning or monotonic; Pearson r weak | Small \`|r|\` does not rule out curvature; Pearson is a **linear** measure | Would a justified nonlinear model help? |
| Outlier / influence | Unusual point; model seems influenced | Check source; keep authentic data; a with/without fit is sensitivity analysis, not licence to delete a result | How much does the conclusion change? |
| Inconclusive result | No clear pattern or weak linear association with no shape | Do not force a regression or claim independence; a cautious conclusion can be sufficient | Is a particular data limitation worth checking? |
| Optimisation | Stationary point only / feasible optimum / not feasible | Check actual domain, endpoints, candidate extrema, units and feasibility | Does the model need revising to satisfy real constraints? |
| Theory / proof | Examples only / general proof / counterexample | Finite checks do not prove universal statements; show logic, domains, or revise an incorrect conjecture | Can the statement be proved, corrected or meaningfully extended? |

### Visibility rule

The **Mathematical check · at this result** region is rendered next to the actual completed record, not at the bottom of optional tutorials. It is intentionally **not shown for merely planned mathematics**, unperformed PMCC or an absent result.

- In **full guidance**, students see a concise mathematical check, selectable interpretation cards, a short explanation and up to two *optional* relevant next questions. Selecting a question fills a private next-question field only; it never supplies the student's justification or starts another technique automatically.
- In **Reduce advice**, optional writing prompts, criterion nudges, suggested supplementary mathematics and limitation/help drawers disappear from the current Studio screen. A one-line validity check and a compact result selector stay visible, alongside the navigation, actual source/permission checks, mathematical work and ability to conclude. Full guidance can be restored with one click. This preference is saved with the project and follows illustrative previews.
- The scatter shape and its detailed refinement now share an actual result identity. Selecting “turning” automatically makes the broad pattern “curved”; picking “unclear” clears a stale incompatible detail. Revising a meaningful observation flags downstream reasoning to recheck instead of silently overwriting later work.
- Recorded outcome choices are stored **per mathematical step** and included in full-project JSON and readable exports. Existing projects and previous records default to having no chosen outcome; no selection is fabricated.

### Non-goals and safeguards

- No automatic numerical diagnosis from a student's result text. No automatic proof of causation, correlation thresholds or test significance labels.
- No compulsory PMCC after a linear scatter; nor compulsory regression, extra proof or additional maths merely for completeness.
- No inference that a stationary point is a global optimum, that r is a causal relationship, that an outlier is an error, or that a few cases establish a theorem.
- Unconfirmed choices remain unconfirmed. Existing mathematical results and writing are never replaced.
- Methods not on the student's actual IB syllabus may still require teacher confirmation and explanation. The existing syllabus/outside-mathematics guidance remains accessible in full mode.

### Quality gates

\`tests/route-coach.test.js\`: validates the six scenarios, technique timing, choice persistence, no-result safeguards, visible core prompts, reduced mode and no auto-authored mathematics.

\`scripts/math-routes-browser.py\`: exercises the real controls for scatter classification, curved refinement, calculated PMCC, model fit, constrained optimum and proof/counterexample at 1440px desktop and 390px phone widths. It also checks state preservation, advice-toggle persistence, no horizontal overflow, exports and the existing site acceptance suite.

This is a just-in-time guidance pass, not an IA-topic-specific automatic assessment. Classroom feedback should particularly test whether the **selected branching choices** feel natural, and whether reduced advice remains usable for students who do not want extra hints.
