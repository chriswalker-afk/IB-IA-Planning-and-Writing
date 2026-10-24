# Page-order audit — Pass 2 (24 October 2026)

## Goal
Students should see the mathematical conditions and relevant earlier choices **before** they choose a technique, justify a decision, interpret a result or move on. This pass improves the order of fields *within* Planning and IA Studio tasks; the separate shared Guided-mode page scaffold was addressed in Pass 1.

## Implemented changes

| Page | Previously | Now |
| --- | --- | --- |
| N01P — Prediction | Optional **Refine the plan** before the prediction or explanation | Aim and motivation → prediction/conjecture (or consciously no prediction) → why/implications → optional plan refinement → review |
| N03P2 — Sampling | Choose method first; check the sampling frame afterwards | Define population/unit → check frame availability → choose method → method-specific feedback and mismatch warning → repeatability → readiness |
| Shared sampling planner | Same method-before-frame order | Frame and its description before selecting a method, consistent with the current primary-data pathway |
| C22 — Methods | Alternative method before identifying the actual method | Record actual chosen method → consider realistic alternative → justify suitability |
| C20 — Introducing first maths | **Ready to show the mathematics?** before the source/sampling/accuracy review | Introduce and justify → (optional) review source/sampling/accuracy → proceed to actual mathematical work |
| C35P — After genuine PMCC | Correlation/causation caution below interpretation and next-step fields | Confirm actual result → short caution → interpret coefficient → choose/justify any follow-up |
| C40 / C50 — Further mathematical stage | Explain the appropriateness of a technique before identifying it | Earlier confirmed finding → next mathematical question → identify actual technique → write bridge and justify choice → show, reflect, decide |
| C60 — Conclusion | Mathematical reminder below interpretation; optional future questions below the extension text area | The original evidence selector and writing sequence are unchanged; within the sections, the context-sensitive reminder and questions now appear **before** their respective writing tasks |

## Design and mathematical constraints
- No IA writing is generated. Students' original field paths, sources, prior maths, criterion badges, conditional route choices and submitted status are untouched.
- Sampling decisions remain provisional; a missing frame for methods that need one still triggers the warning, and no survey is automatically considered representative.
- Prediction/conjecture remains optional and cannot become a confirmed result merely by appearing before a planning refinement.
- Any future questions in Conclusion are inferred only from actual, non-review-flagged findings, not fictitious or planned results.
- Reduced advice continues to reach the main task directly. The mathematical cautions and input fields retain their original mode behaviour.
- A further mathematical stage continues to be **Introduce → Show → Reflect → Decide next**, with the method identity advanced within its Introduce section.
- Checking and the Tools & Tutorials library remain for Pass 3.

## Verification
Added tests for field-order invariants using the real Planning and IA Studio renderers, both sampling renderers, genuine C40/C50 stage fixtures and an evidence-based Conclusion fixture. The existing full test/build and desktop/phone browser suites remain authoritative before merging.
