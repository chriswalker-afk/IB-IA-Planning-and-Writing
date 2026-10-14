# IA Pathfinder — IB Mathematics IA companion

**Live website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

IA Pathfinder is a responsive, device-local **planning and writing companion** for IB Mathematics Internal Assessments. Students author their actual IAs in Word or Google Docs; Pathfinder helps with meaningful aims, mathematically justified choices, authentic results, interpretation, precision and coherent mathematical transitions. It never fabricates observations, assigns grades or rewrites an IA on the student's behalf.

## Current release — Phase 5: contextual mathematics and writing help

The Phase 4 Completing journey has **52 source-linked Completing nodes and 223 directed transitions**, with eight revisitable stages. The repeatable mathematical process is:

**Previous actual result → interpretation → unanswered mathematical question → justified next method → new actual result → interpret or conclude.**

Phase 5 adds **146 context-gated guidance rules** from four original Google Sheet libraries:

- **66 Writing Moments:** one gentle, optional cue at a useful location in the student's real IA. Write now / Already covered / Not relevant / Show an example / Dismiss for now; other advice is optional. The student can save an own note and the place it belongs. Pathfinder never claims the Word/Google Doc changed without the student's explicit confirmation.
- **30 Maths & Technology prompts:** explain unfamiliar researched mathematical ideas at their first genuine use, but simply *apply* ordinary syllabus techniques; relate a calculator or software output to its original actual calculation; allow optional genuine mathematical discoveries and teacher scope checks.
- **38 Limitation Examples:** strict data-method versus mathematical-technique timing, up to three possible questions at a time on demand. Students must confirm that a limitation actually applies and explain its **mathematical consequence** before recording it; only confirmed limitations are revisited in the conclusion.
- **12 Bivariate Decisions:** genuine paired numerical scatter only, distinguishing near-linear, roughly linear, monotonic curved, turning/non-monotonic, unclear and unusual-point patterns. Pearson, nonlinear modelling, rank association and regression are **optional and relevant only where justified by real evidence**. Small Pearson r does not rule out non-linear relationships, and correlation never proves causation.

Input accuracy policies are recorded **by actual quantity, unit, resolution and justified reporting convention**, and recalled only for relevant calculations. Revising source definitions or an earlier input's precision flags dependent mathematics for review without destroying student-authored work.

**Phase 5 implementation and test journeys:** [docs/phase-5.md](docs/phase-5.md). Supplemental editorial examples and classroom-specific edge cases remain **partially validated** in the [source coverage register](docs/coverage.csv), and will be reviewed with real student projects during Phase 6.

## Earlier phases and student data

- **Phase 2 — Planning:** 32 Planning nodes and 61 real source routes, feasibility and teacher flags, 51 possible AI SL/AA SL mathematical techniques, 22 contextual prediction nudges. Planning scores are NOT IA grades.
- **Phase 3 — documents:** readable PDF and editable Word planning reports with versioned planning snapshots and field-level comparison/reimport. **Word/PDF editing after export does not automatically update embedded project data**.
- **Phase 4 — Completing:** flexible stage dashboard, real mathematics separated from plans and predictions, before/after mathematical purpose and interpretation, repeatable next mathematics or honest conclusion, backwards-compatible saved projects.
- **Full JSON project backup:** this is how students transfer the **entire** IA Studio, including actual mathematics, writing notes, contextual decisions and review flags, between devices. PDF/Word reports are **planning-only**.

Students' work is saved in their current browser/device by default, not synchronised to the cloud. The site does not automatically upload IA work, collect source measurements, verify consent, grant teacher approvals, run assessment marking, or provide a substitute for school feedback. Avoid recording identifiable or restricted participant information.

## Documentation and development

- [Phase 5 contextual writing, mathematical accuracy and conditional help](docs/phase-5.md)
- [Phase 4 mathematical journey](docs/phase-4.md)
- [Phase 3 handover and import](docs/phase-3.md)
- [Phase 2 Planning](docs/phase-2.md)
- [Exact 1,430-item source coverage audit](docs/coverage.csv)

Build locally using Node.js 22 or later: run npm install, then npm test and npm run build. GitHub Actions validates, builds and publishes the static distribution to GitHub Pages.

The source 24-tab Google Sheet remains untouched. **Phase 6** will refine complete teacher-draft/final-review criteria, accessibility, rendered document QA and real classroom acceptance testing. Phase 5 does not claim that every editorial example or all 24 tabs are fully implemented.
