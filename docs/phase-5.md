# Phase 5 — Contextual mathematics and writing guidance

**Implementation:** 15 October 2026 · **Status:** implemented in the existing Phase 4 IA Studio with automated tests.
**Website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

## Why this phase exists

The real IB Mathematics IA is written by the student in Word / Google Docs. Pathfinder should not become an automated IA writer, a giant checklist, or a mechanism for manufacturing sophistication. Phase 5 turns the more nuanced parts of the source workbook into **quiet, evidence-sensitive advice**: what to explain, exactly where, and only after the necessary mathematical event.

The source material now has a direct, reviewable code mapping:

| Source tab | Core IDs | Connected rules |
|---|---|---:|
| Writing Moments | W01–W66 | **66** |
| Maths & Technology | M01–M30 | **30** |
| Limitation Examples | L01–L38 | **38** |
| Bivariate Decisions | B01–B12 | **12** |
| **Total** | | **146** |

Every source item retains its original sheet row in src/completing/guidance-catalog.js. A source row is **not a diagnosis**: application code checks the current C-node, actual technique, data status, subject, course, method, confirmed result and student choice before deciding whether to display the corresponding help.

## 1. One useful writing moment, not a nagging queue

- The main IA Studio form remains dominant. **At most one optional writing cue** appears by default, below the actual task. It specifies *where in the student's own IA* to write: for example just before a first figure, immediately after a real calculation, alongside the sampling method, at a mathematical transition, or in the conclusion.
- Controls: **Write now**, **Already covered**, **Not relevant**, **Show an example**, **Dismiss for now**. “Write now” opens a student-owned note and optional figure/section reference inside Pathfinder. The note is **not** written into Word or Google Docs. “I've updated my actual IA” is a separate explicit student confirmation.
- “Already covered” offers a place to record the **student's own IA location**, then remembers that decision. “Show an example” displays generic, clearly illustrative *structure*, not supposed actual findings.
- Status is stored per **source cue and relevant mathematical result/stage**, with a context fingerprint. An acknowledged cue stays suppressed unless the relevant aim/source/method/result context genuinely changes. Handling a cue does **not immediately unleash another cue** on the same screen. Other relevant advice is tucked behind an optional link.
- Return-to-work is not interrupted. Student notes, decisions, locations and suppression statuses survive autosave and full JSON backup. Earlier prototype projects gain the new empty guidance state without claiming prior cues were addressed.

Examples of precise timing:

- **Before** the first figure/calculation: mathematical purpose and necessary symbols.
- **After** a *genuine* graph/calculation: what is observed and what it means for the aim, tentative prediction and beneficiary.
- **Between** sections: the prior real result → still-unanswered question → why the chosen next method follows.
- **With** sampling/source description: actual sample scope, verification and only applicable methodological limitations.
- **After** an actual Pearson coefficient, fitted model or substantial proof: interpretation in mathematical context and limitations of the technique that was *actually used*.
- **At** the first genuinely unfamiliar beyond-syllabus mathematical idea: a short student-owned demonstration of understanding. Never force a tutorial on ordinary syllabus methods.
- **At** conclusion: an honest synthesis of actual mathematics, rather than moving all method criticisms or copying rubrics into an evaluation paragraph.

## 2. Maths, unfamiliar techniques and genuine mathematical learning

Each substantial mathematical section now distinguishes **what technique is intended or actually used** from whether the student has verified its course status:

- Verified within the chosen course → **use the method correctly** and interpret it, without textbook-style instructions.
- Familiar method with a **specific new or out-of-course extension** → explain only that unfamiliar component.
- Verified outside the syllabus → explain the key idea, relevant conditions, and a genuine mathematical step/check; cite an actual source if used.
- Unsure → privately check the correct course guide or ask the teacher; **no inferred course classification** from a technique name or independent research alone.

Students can capture the original research source, unfamiliar concept, mathematical demonstration/check, a genuinely new mathematical connection, and why a surprising finding led them to change method. These notes belong to the **actual linked mathematical record**, not to a global invented “reflection”. A brief mathematical-understanding panel opens only on request, and its reference questions depend on the active method or output.

Technology guidance is likewise attached to the **actual calculation** that used the GDC, spreadsheet, regression tool or code. A previous use of software does not automatically generate “black-box” warnings for a later unrelated calculation.

## 3. Limitations only where they apply

The workbook's 38 possible limitations are **possible questions, not detected flaws**:

- At **C20–C26**, offer source, sampling, selection, nonresponse, time/video measurement and source-precision questions only when the **actual** data/source method supports that example.
- At **C40/C50**, offer technique-specific questions only after the **active mathematical method has actually produced a result**: Pearson linear assumptions; regression prediction range; Spearman monotonicity; normal/binomial/test assumptions; polynomial/sinusoidal/power fit; optimisation domain and endpoints; derived geometry precision; Voronoi distance; mathematical proof/generalisation and so on.
- Show **two or three optional examples at a time, only on request**. “Show more” stays within the **same stage**. An explicit “None of these apply” is respected.
- To record a limitation, the student must supply **what genuinely applies to their method or result** AND **how it affects a mathematical conclusion or permissible scope**. They may add a real check or mitigation and original IA location. The suggested source question alone is never written into the limitation record.
- Only **student-confirmed** limitations are recalled at C60/C61; the conclusion prompt encourages a concise treatment of material consequences without repeating every earlier method explanation.

Logistical delays, unavailable sources and teacher-feedback actions stay in Pathfinder project notes, not as pretend mathematical limitations.

## 4. Bivariate mathematics responds to actual evidence

Only an actually completed scatter can unlock shape-based guidance. Before Pearson/regression suggestions, a student must confirm **paired numerical observations**; category or unmatched data lead to an alternative-representation question instead.

The student can distinguish:

- Near-perfect straight scatter → r may add little; fit a line only if meaningful prediction would help the aim.
- Roughly linear scatter → PMCC *may* quantify linear association if appropriate for the data and aim.
- Curved monotonic scatter → investigate a mathematically justified nonlinear model; rank association/Spearman is **optional and course-checked**, never compulsory.
- Turning/periodic scatter → consider relevant non-monotonic modelling; **don't** automatically suggest Spearman.
- Unclear/no pattern → a cautious, restricted conclusion can be sensible.
- Genuine outlier → verify source and influence without silently deleting authentic observations.
- **Actual** PMCC → discuss strength/direction of linear association and graph shape, especially when low r coexists with a real curved scatter. A regression or alternative model is never required merely because a coefficient was calculated.

The extra bivariate questions are **optional ideas**. Choosing one places it in the next-question draft, **not** in the student's mathematics or justification; Pathfinder still asks for the student's reason before a next substantial section can begin.

Correlation is never represented as proof of causation. The engine does not infer a numerical coefficient, fitted equation, sample validity or observed pattern from Planning predictions.

## 5. Accuracy remembers the quantity, not arbitrary decimal places

Students retain per-quantity decisions from C24: symbol, unit, actual reported resolution, final reporting policy and justification. A later real figure/calculation may **explicitly link** to the relevant input quantity. Only that policy is recalled when it matters; no repeated generic precision essay appears on every algebra line.

- An exact symbolic derivation need not be rounded. Approximations are labelled with ≈ where appropriate; avoid false '=' equalities.
- Do not mechanically copy the number of decimal places from raw data to every derived result.
- Do not invent measurement ± uncertainty when only an instrument's recorded resolution is known.
- A material change to a recorded unit/source resolution flags **only mathematical records actually linked to that decision** for review.
- Changes to actual data source, model assumptions or sampling description can also flag affected earlier calculations **without deleting their working or rewritten conclusions**.

## 6. Report and persistence

The readable **working report** now carries real mathematical learning notes, referenced source/precision decisions, student-confirmed limitations, and the student's own writing-note status/location. It explicitly distinguishes “private idea saved only in Pathfinder” from a student assertion that they edited their external IA.

The original PDF/Word **Planning report** remains planning-only. Full JSON backup is the portable snapshot of IA Studio, mathematical records, limitations, writing cues and student choices. Saving is still local-device only. No source data is sent to an AI service or cloud store by these changes.

## QA: acceptance journeys

1. **Purpose → result → interpretation:** Start a first figure with a mathematical reason. Confirm no “describe actual pattern” writing cue appears until a genuine result exists. After one, the contextual advice should point immediately beneath that figure/calculation.
2. **No nagging:** Choose “Already covered”, enter “after Figure 1” and return to the same stage; don't receive another cue automatically. Change the aim or method materially and check relevant advice can reappear.
3. **Sampling:** Mark candidate data; volunteer-selection limitations should **not** be offered as facts. Confirm actual relevant sampling, then open optional limitations and check only source/method questions appear.
4. **PMCC:** Select PMCC in Planning but don't perform it; no real-PMCC limitations or suggestions. Actually calculate r in a later section, with an observed curved scatter, and verify that little linear association is not misrepresented as no relationship.
5. **Nonlinear cases:** Compare near-perfect, rough-linear, monotonic curved, turning curved, uncertain and genuine outlier observations. Check suggestions differ and always remain optional. Unpaired/categorical observations should not get Pearson advice.
6. **Syllabus:** Use a verified within-course method and confirm no generic textbook exposition is demanded. Repeat with a genuinely mixed and out-of-course method and show a student-owned mathematical explanation at first use.
7. **Software:** Record an actual regression-tool output in one mathematical record. Revisit a separate exact proof; technology guidance should **not** follow across to the proof.
8. **Accuracy:** Record input resolution for a measured length, link it to a derived area result, then change the input resolution. Only affected calculations should be flagged; unrelated exact mathematics remains intact.
9. **Consequential limitations:** Accept a *possible* question but provide no actual explanation; saving must fail safely. Record real explanation/consequence and revisit conclusion; only that identified limitation should appear.
10. **Backups / mobile:** Export and restore full JSON, check cue status and location, note, limitations, unit decisions, math-learning fields and review flags. On a phone confirm that options remain optional and controls don't overflow.

The test suite under tests/phase5-guidance.test.js and tests/ui-smoke.test.js covers the above logic, along with earlier 95+ regressions for Planning, Handover and Completing.

## Next work

Phase 5's four **main guidance libraries are connected and context-gated**. The source workbook also contains supporting case descriptions and edge-case examples, recorded as **Phase 5 partial** in docs/coverage.csv because they should be confirmed against real student projects during Phase 6 classroom testing. Detailed teacher feedback/final-criteria procedures, full accessibility and printing QA, and final text/layout polish are deliberately Phase 6; no predicted IA grade or automatic teacher approval is provided.

The source Google Sheet remains untouched.
