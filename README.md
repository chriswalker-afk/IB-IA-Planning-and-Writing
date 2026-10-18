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

## Investigative mathematics journeys — 17 October 2026

The Planning course-and-mathematics page provides **three explicit ways to find mathematics**: **Based on my aim**, **Typical investigative routes**, and **Complete list**. All three lead to the same manually chosen, device-local `planning.mathSelected` array; moving between the three views never selects or removes techniques automatically. The full AI SL / AA SL reference list is in the third mode, with free-text and honest teacher-check guidance for other courses.

The **16 editorial journeys** in `src/planning/investigative-routes.js` are grouped into four families: data/statistics (4), functions/modelling (4), geometry/optimisation/decisions (5), and probability/theoretical reasoning (3). Each journey has a small, attainable mathematical start, a question to ask of genuine mathematical findings, several *conditional* possible branches, and a closing reflection tied to the aim/motivation. These are exploratory pathways rather than standardised IA templates. Statistics routes emphasise distributions/shape/assumptions before regression or inference. Theory/iteration routes explicitly advise teacher consultation, especially where the question may become more suitable for an EE.

The **Based on my aim** view uses conservative, deterministic matching of student-authored question words, investigation type and (where relevant) statistics data structure. It is not an LLM guess about the real dataset and deliberately does not fill a shortlist with unrelated options. **Typical investigative routes** has a visually connected expand/collapse explorer and four family filters; **Complete list** retains the original verified course-scoped catalogue and search.

Opening a journey does not mutate student mathematical records. **Save this as my provisional route** independently stores `planning.routeExplorer.selectedRoute`, the canonical first-step wording, and `status: provisional`. A student can remove or replace that spark without deleting previously selected techniques or genuine calculations. The chosen route appears as a compact return spark in later Planning, is included in **My Toolkit** and selected contextual IA Studio support, and is reflected in the student’s on-screen report and PDF/Word planning snapshots. Backups and reviewed imports normalise or omit this optional information safely; historical document snapshots do not automatically replace an existing route.

Checks: `tests/investigative-routes.test.js`, `tests/handover.test.js`, `tests/ui-smoke.test.js`, `scripts/investigative-routes-browser.py` and `.github/workflows/investigative-routes-browser.yml`. The optional browser workflow captures responsive screenshots. None of this records an actual mathematical result, predicts an IA grade or guarantees course suitability.

## Sampling, data access and accuracy sparks — 17 October 2026

**Primary-data Planning (N03P)** now asks students, *before collecting*, to define their target population and sampling unit; select from a census, simple random, systematic, stratified, cluster, convenience/opportunity or voluntary-response sample (with **not applicable** and **unsure** as honest alternatives); examine whether a sampling frame exists; and decide whether they can obtain quick initial and follow-up observations. An expandable recap gives the terminology and genuine advantages/disadvantages of each method, including why a convenience sample cannot be claimed to be random or necessarily representative.

**Degree-of-accuracy planning** is recorded separately for each quantity, as a provisional student-owned spark in `planning.accuracyPlans`. Primary measurements differentiate analogue division marks, digital display resolution, estimates and exact counts. Secondary published datasets distinguish explicitly documented precision, apparent rounding, exact counts and unknown original resolution. Students enter a quantity, unit, recording increment and optional uncertainty; multiple quantities can be added, edited or removed. Rounding precision is never treated as proof of measurement accuracy. The summaries are available in later Planning screens, IA Studio guidance for sampled datasets and measured results, My Toolkit and planning exports. IA Studio still requires confirmation of the *actual* source before recording a verified accuracy decision.

A student may always continue with the **uncertain** primary-data status. To mark a primary plan **workable**, the student now needs to say what will be measured and how, plus either a saved per-quantity recording rule (including an exact-count choice) or an earlier documented accuracy note. Statistics routes additionally require a selected sampling option; a ready probability sample needs a workable sampling frame and the population/unit decision. These are planning readiness checks, not assertions that collection or permission occurred.

The same information is preserved in full JSON backups and the reviewed PDF/Word Planning snapshot, with backward-compatible defaults for earlier plans. Relevant new fields are in the import review groups, and importing a source or accuracy revision can flag earlier completed maths for checking without modifying student calculations or teacher approval. See `tests/planning-data-decisions.test.js` and `scripts/data-decisions-browser.py` (desktop and phone Chromium checks).

## Primary evidence and readiness — 17 October 2026

The primary-evidence journey has **two focused screens**, not three: `N03P` (*What will I collect, and how?*) groups the collection method, named quantities, units and per-quantity recording-accuracy sparks, and `N03P2` (*How will I choose my data?*) covers population, sampling unit, method, frame, follow-up feasibility and readiness. Students do not retype quantities or their units to set recording accuracy. Measurement-device and sampling guides remain optional disclosures. The sampling optional details include a single alternative-method note, not a compulsory essay.

Four lengthy Planning pages are **removed from the normal route**: `N03J` (*Why is this method worth choosing?*), `N03F` (*Could you complete the practical work?*), `N03E` (*Data readiness /5*) and `N03G` (*Practical manageability /5*). Source planning (primary, secondary or both) goes directly to `N03D` (*Can you get started?*), then `N03H` (the existing timeline, pending a separate design review). The 61 original workbook-route rows remain in `src/planning/route-table.js` for provenance, while new user-facing shortcuts have explicit UX notes. Completed-screen progress excludes retired stages; old snapshot histories and current pages resume at `N03D` rather than retired questionnaires.

The combined `N03D` checkpoint asks only what evidence is actually available, whether consent/privacy/safety/permissions may need checking, and whether essential access is blocked or uncertain. All answers including *not sure* are acceptable; unanswered essential decisions are not treated as permission or readiness. Conditional short notes help students identify the next step. Evidence target dates are optional inside a disclosure. The secondary-data route includes a source-use/citation reminder. Permission answers still drive teacher warnings in Planning and IA Studio; a meaningful access blocker is shown as a planning flag. Unresolved consent does not authorize collection, but students can continue *planning*.

Older saved responses about alternative methods, anticipated limitations, resources, workload, risks, contingencies and the retired /5 self-ratings are **not deleted**. The report/export and import data structures retain them as historical planning information; missing scores are not fabricated in new reports or used for teacher-warning flags. When actual evidence exists, IA Studio still asks students to justify the chosen method and evaluate genuine mathematical and data limitations.

Regression coverage includes legacy-state migration, two-source branch guards, permission checks, PDF/Word handover, source-sheet provenance, and desktop/mobile acceptance in `scripts/data-decisions-browser.py`.

## Lean prediction-to-Studio pathway — 18 October 2026

The student-facing sequence after the initial course/mathematical route and evidence-source decisions is now **source plan → optional prediction (`N01P`) → source availability/permission/access (`N03D`) → timeline (`N03H`) → optional teacher question (`N06T`) → review (`N06`) → handover (`N07`)**. For primary data the optional prediction is reached immediately after `N03P2` (sampling); for secondary data or both, it follows the completed source questions. An investigation may proceed without a prediction; no pattern is asserted by selecting a suggested question.

The prediction screen has a deliberately small **Refine the plan (optional)** toggle. It expands the existing mathematical-route explorer and a further optional suitability/syllabus disclosure *on that same screen*, without discarding course, selected techniques or investigative-route sparks. The expanded/collapsed state survives re-rendering, local storage and project import. Course uncertainty and outside-syllabus concerns still raise teacher-review reminders; the toggle does not claim an IB syllabus verification.

Five former compulsory screens are bypassed: `N04R` (review maths after prediction), `N04M` (separate mathematical suitability form), `N05V` (proposed first representation), `N05` (proposed first mathematical action), and `N06E` (hypothetical adaptation). First **actual** diagrams, graphs, calculations and their interpretations belong to IA Studio `C30`–`C35`. Earlier student-authored fields remain in backups and, if populated, the planning report as historical intentions—not required new-page entries or completed mathematics. The Planning progress anchors now recognise a **mathematical direction** rather than demanding a first graph before Studio.

The original 61 workbook routes are retained for traceability; editorial UX shortcut routes carry `sourceRow:null`. Projects saved on retired screens resume at a valid current stage, and retired visits do not inflate the progress indicator. Desktop/mobile checks cover the inline refinement and the short Planning handover; tests also cover imported legacy maths, retained sparks and no invented results.

## Contextual assessment-criteria badges — 18 October 2026

**Pass 1** introduced four selective criteria pop-ins: motivation response (C), course/mathematics choice (E), interpretation title (D), and notation review title (B). These offer task-specific why/strong-response/avoid guidance and a link to the IB rubric, not an automatic mark or checklist. Native, read-only modal behaviour supports Escape, focus, keyboard access and mobile screens. The old generic criteria lists are suppressed on badged screens rather than duplicated.

**Pass 2** extends the same design through the student's genuine mathematical journey. New markers appear beside C31's choice-purpose box (E), C32's purpose-before-work box (A), C33's presentation title (B), C34's observation box (E), two separate C35 boxes (student's next question C, evidence-led justification D), and C40/C50 substantial-mathematics titles (E). Specialised optional screens C35B (actual scatter), C35P (Pearson r), C40T (technology) and C40L (new mathematics) have a single E title badge. No badges are added to routine administrative controls. Reduce-advice mode also hides new badges without hiding student inputs.

The source file src/essentials/criteria-badge-guidance.js assembles **read-only, record-specific guidance** from the current aim, selected mathematical result or next question, technique, course-knowledge status, and precision policies actually linked to that entry. Planned mathematics never becomes a genuine observation; a planned Pearson calculation cannot generate correlation findings; choosing unfamiliar mathematics does not prove syllabus status. Familiar methods need application and interpretation rather than a generic tutorial; genuinely researched methods require actual first-use understanding and citation. Subsequent use refers back to that explanation. Student text is escaped in pop-ins.

Automated checks in tests/criteria-badges.test.js cover placement, no mutation of project state, matching to the right result and accuracy policy, planned-work safeguards, course understanding and correct technology selection. scripts/criteria-badges-browser.py checks mobile/desktop positioning, focus, Escape, rubric navigation, reduced advice and absence of invented mathematical results.

### Pass 3: conclusion and full-review criteria badges

### Pass 3: conclusion and full-review criteria badges

The Pass 3 badge map adds two distinct box-level opportunities to C61 (A for a concise supported answer and D for material uncertainty), a D badge at C62's meaning-for-purpose box, an optional D badge at C63's mathematical-extension box, and single A title badges at C64 and C70. C70N already has its B notation badge. The same 1–2 prominent markers per page rule applies, with the exceptions C35 and C61 where two distinct prompts merit distinct guidance. The site never badges routine administrative or navigation controls.

C80D (teacher draft) and C90F (final review) each have **one compact A–E title badge**. Its read-only pop-in offers concise guidance for each criterion, shows *only the evidence locations the student already recorded for the relevant draft or final mode*, and links to each complete rubric and the **existing** structured five-criteria evidence review. No grade, evidence location, check mark, approval, or completion is inferred. Draft locations do not silently become final locations; Criterion E's SL/HL rubric is resolved in IA essentials, not guessed from the popup.

The former top-level free-text A–E essay fields on C80D/C90F duplicated the existing evidence-review fields. They are no longer displayed when blank. Previously saved values remain editable behind an optional disclosure and are still part of the JSON/project history. Existing review statuses, evidence locations, optional provisional self-marks, and feedback records are preserved unchanged. The pop-in does not mark an action completed, inspect a Word/PDF IA, or submit the exploration.

Conclusions reference only mathematical results that the student explicitly recorded as completed with nonempty genuine outputs. If none are recorded in Pathfinder, the popup explicitly says that Pathfinder cannot confirm external mathematics and never fabricates a result. Earlier mathematical review flags, consequential limits and the student's own repair notes can be recalled without claiming a repair has been verified. Mathematical extensions remain optional.

The Pass 3 acceptance suite tests placement across desktop and mobile, letter/rubric links, access to existing draft versus final review records, no duplicate new forms, legacy note preservation, planned-result safeguards, reduced-advice mode and no unintended changes to saved work.
