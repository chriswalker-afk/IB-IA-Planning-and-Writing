# IA Pathfinder — IB Mathematics IA companion

**Live website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

**IA timeline:** By default, students answer only how many weeks they have and whether they want to finish early. Pathfinder suggests a sequence for evidence, mathematics, drafting and review; each date can be edited in the optional detailed planner. Student-set weeks, buffer preference and dates appear in Planning and full-project PDF/Word exports. See [timeline design and safeguards](docs/simple-timeline-2026-10-15.md).

**Whole-project export:** Backups & reports offers readable full project PDF, editable Word and a ZIP containing both reports and the restorable full-project JSON. These include actual mathematical records, sources, interpretations, accuracy decisions, limitations, writing and review notes as well as Planning. The reports are working records, not a finished IA or an assessed grade. PDF/Word reimport remains planning-only; the full project is restored from JSON. Existing Planning-only exports are preserved.

IA Pathfinder is a responsive, device-local **planning and writing companion** for IB Mathematics Internal Assessments. Students author their actual IAs in Word or Google Docs; Pathfinder helps with meaningful aims, mathematically justified choices, authentic results, interpretation, precision and coherent mathematical transitions. It never fabricates observations, assigns grades or rewrites an IA on the student's behalf.

## Living Journey & Insight Threads — 16 October 2026

The site now shares a **Discovery Trail** and compact chapter markers across Planning, IA Studio, the returning student homepage, and My Path. The Planning journey shows five provisional anchors (including a working title), plus source-defined screens actually advanced through; IA Studio readiness still comes only from explicit stage statuses. A **Growing Constellation** distinguishes real mathematical results, planned mathematics and work needing review, and draws connections only where an explicit `fromEntryId` exists. There is no required calculation count.

**Insight Threads** visually carry a student's saved aim, proposed evidence, recorded actual source/method, linked accuracy policy, actual mathematical discovery and confirmed limitation into relevant later contexts. The same spark family appears when information is recorded, when it echoes later, and inside **My Toolkit**. Echo links go back to their original section or mathematical step. Input links refer only to explicit evidence IDs; unrelated decisions are not presented as calculation inputs. The toolkit shows a small selection of recent or pinned sparks first, with earlier ones expandable.

The new presentation introduces no points, grades, streaks, compulsory content or automatic document edits. It stays browser-local, respects reduced motion and retains existing JSON storage and imports. See [Living Journey design, logic, and test notes](docs/living-journey-2026-10-16.md).

## Focus, progress and a cohesive journey - 15 October 2026

Working tasks now use a compact, shared support dock. Criteria open on request, the first Planning choices come before IA essentials, and the sidebar, stage dashboard and unfolding path share four chapters and honest readiness labels. Small checkpoints acknowledge explicit student actions and improve the return/resume experience without grades or artificial rewards.

Sample investigations now open in a separate, tab-local preview: experimenting, switching samples and reloading never replace the student's own workspace. Return restores their investigation; backups made inside the preview are clearly labelled samples. Help panels preserve focus/scroll and support nested Escape; reduced motion is respected.

See [design principles, compatibility and regression checks](docs/experience-2026-10-15.md).

## Compare examples - 15 October 2026

A shared optional viewer now offers **30 original fictional less-effective / more-effective comparisons**, with explanations and a transfer question. Visible links sit beside Planning and Completing tasks; the existing writing-cue and introduction routes use the same collection. The library is searchable by topic and exploration type. Original SVG graphs, residuals, diagrams and native tables are included. Viewing, filtering or closing examples never writes student results, marks a stage complete or changes an IA document.

See [implementation, editorial boundaries and testing](docs/examples-2026-10-15.md).

## Tools & tutorials - 15 October 2026

Optional task-based resources are available during Planning, beside the current mathematics and through "I am stuck". The searchable library has 31 written guides, 19 with externally hosted video routes. It separates software instructions from interpretation, and visual image fitting from regression on recorded coordinates. Task-specific tool/picture preferences and dismissed cards survive full JSON backups without counting as completed work.

See [the resource catalogue, editorial boundaries and checks](docs/resources-2026-10-15.md). Videos are publisher-listed, not claimed to have been watched end to end or teacher-approved. Every task has written steps. Custom screen recordings remain a documented production backlog, not placeholder video buttons.

## Conformance pass - 15 October 2026

The audit corrections are now integrated: authoritative actual-method identity, no assumed monotonicity, multiple relevant precision inputs, source-specific dependency review, an origin-aware writing helper, first-use unfamiliar-mathematics guidance, and optional D01-D21 draft/final checks with separately verified feedback actions. Student work, original source rows and the current visual design are preserved.

See [the conformance change and test map](docs/conformance-2026-10-15.md). Full JSON backups include input/source links and review evidence. Word/PDF reports are still planning-only. Automated checks do not certify external IA edits, teacher approval, all editorial examples or classroom outcomes.

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

The source 24-tab Google Sheet remains untouched. The optional detailed teacher-draft/final-review checks are now connected by the conformance pass. **Phase 6** still includes broader accessibility, rendered-document QA and real classroom acceptance testing. Phase 5 does not claim that every editorial example or all 24 tabs are fully implemented.

## Optional Idea Explorer

Planning's optional brainstorming branch now offers twelve broad topics, 48 starting directions, a three-idea shortlist, optional narrowing/first-step notes and safe idea adoption. The direct route for a clear idea is unchanged. See `docs/ideas-first-pass-2026-10-15.md` for the JIS guide basis, boundaries, verification and remaining work. Full JSON backups preserve explorer notes; the full shortlist is not yet part of the planning PDF/Word report.

## IA essentials and assessment guidance

**IA essentials** provides source-labelled formatting/length guidance, the complete A-E rubric (including both SL and HL Criterion E), and draft/final evidence-based self-review. A visible **Show the criteria here** panel connects the current task to relevant criteria and the shared example library. Optional self-marks are entered only by students, retain their rubric level, and survive full JSON backups; browsing never awards marks or completes work. See [implementation notes](docs/essentials-and-criteria-2026-10-15.md).

## Planning screen review — 17 October 2026

Screen 1 asks only whether the student has one idea, several to compare, or needs inspiration. The shared N01 screen asks for a **provisional IA title** and a **mathematical aim**, not a compulsory enthusiasm story. Its title spark appears immediately, stays in device-local state and the planning report, and returns contextually during Planning and IA Studio. A new fictional EX30 comparison teaches students to prefer focused, revisable titles rather than broad labels or predetermined results. Personal engagement is explained as mathematical ownership, independent choices, interpretation and development.

The right-hand **Discovery Trail** shows five provisional decisions and a cumulative count of **screens actually advanced through**; merely visiting a screen does not count as finishing it. Contextual controls sit below the trail on desktop and inside compact Help & examples on mobile. Duplicate Planning tool prompts are removed; the resource library remains accessible through its single control. None of these indicators claims an IA mark or completed calculation.

## Idea Lab mind maps — 17 October 2026

The “Help me find an idea” Planning route now starts with a **branching Idea Lab**, not a topic dropdown. Three keyboard-accessible entry points (My hobbies & interests, My daily life, My world) expand into categories, subtopics and editable directions as connected nodes in one diagram. SVG connectors are measured from the real DOM positions and redrawn after changes in screen width or node size, while the selected ancestry remains visible throughout exploration. Alternatively, the student can start with what is easy to **measure, count, survey with permission or verify as secondary data**. The same quick-access test appears above both maps. Displayed directions ask students for a missing detail, rather than offering finished IA titles; choosing a direction opens an editable working question. A pure-maths-pattern caution encourages a teacher discussion instead of presenting speculative sequences as an effortless IA route.

The map uses neutral and cool-coloured surfaces: the original spark palette is reserved for actually saved insight threads. Mobile uses a vertically connected map, while desktop has a gently animated three-way arrangement with reduced-motion support. Old dropdown selections are migrated to equivalent branches and previous drafts, shortlist items and student results are preserved. The irrelevant “What makes a promising starting point?” and bottom “Help me think” sections have been removed from this route. The original authored seed catalogue, saved-idea comparison and confirmation before replacing existing work remain intact.

See `tests/ideas.test.js`, `tests/planning-ui-coverage.test.js`, and `scripts/ideas-browser.py` for logic and manual-browser checks.

The connected-graph refinement replaces the old separate panels with a single responsive SVG-linked diagram and changes the card cue to **Make it personal**. See `src/ideas/map-layout.js` and `tests/idea-map-layout.test.js` for coordinate-aware links and regression checks.

## Shared idea evaluation — 17 October 2026

The “Help me find an idea” route and the “I'm choosing between ideas” route share **one evaluation screen**. A mind-map direction optionally supplies **Something to get you thinking**; a manually entered idea omits this starter. Students write **one** own-word provisional aim, choose a clarity score (1–5) and quick-start score (1–5), and optionally tick potential difficulties. These are personal planning judgements, not a calculated IA grade or approval.

Saving moves the evaluation and both ratings into **My possible ideas**, without changing the current investigation. From there students may edit, add from mind map, add manually, reject and restore, or select a single possibility. Three active ideas are supported. Rejected possibilities retain their ratings. Older saved ideas without scores remain visible but require rating before selection.

Selection now writes the student's question into the existing Planning aim field and project aim using the normal Planning setter. This creates the **same aim spark** used on the direct ‘I have an idea’ route. An existing aim or established work triggers confirmation before a replacement; previous mathematics, notes, and teacher flags are not erased. Related completed writing is flagged for review when appropriate.

Regression coverage: tests/ideas.test.js and scripts/ideas-browser.py. Responsive presentation: data/idea-map.css. The synthetic UI-smoke harness stubs the purely decorative graph layout because it lacks browser geometry.

## Early course and mathematics pathways — 17 October 2026

The first Planning sequence now offers a compact, interactive **course and possible mathematics** page immediately after the student chooses Statistics, Mathematical modelling, or Theoretical exploration. The main path is **investigation type → course and mathematics → accessible evidence and practical arrangements → tentative prediction → revisit mathematics → suitability and first mathematical action**. The original 61 source-sheet transitions are retained as historical/source references; six explicitly labelled `sourceRow: null` editorial transitions support the revised, less repetitive student-facing experience. Previously saved `N04` and `N04S` checkpoints remain accessible to preserve older plans.

The new suggestions (`src/planning/math-recommendations.js`) are deliberately deterministic and conservative. The student’s selected investigation type, statistical data structure and words in their own aim and motivation may surface **two or three possible initial routes**, each with a reason, a small actionable first step, and a conditional warning where needed. Examples: paired data → scatter/linear association before any justified regression, groups → distributions before any justified test, sports trajectories → geometry/possibly quadratic modelling, optimisation → defining variables and constraints before differentiating. The full AI SL/AA SL planning catalogue is behind an optional expanded section. Nothing is selected automatically; no prediction, course approval, result or IA grade is inferred. Other course levels receive honest custom-input and teacher-check guidance rather than mismatched syllabus suggestions.

All subsequent Planning screens display small, coloured, keyboard-expandable **My question** and **My motivation** sparks, as on the motivation page. Expanding either allows inline edits to the canonical `planning.fields.aim` or `planning.fields.beneficiary` record. Text input updates the small summary without rerendering or stealing keyboard focus. The same existing sparks also continue to provide contextual help in later parts of the IA.

Automated coverage includes `tests/planning-maths-paths.test.js`, updated Planning route and full UI smoke tests, and responsive CSS in `data/motivation-pass.css`. Inspect the desktop and mobile flows manually before declaring the design pass finished.
