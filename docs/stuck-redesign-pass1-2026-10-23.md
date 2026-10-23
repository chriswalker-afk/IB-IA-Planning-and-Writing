# "I am stuck" redesign — Pass 1 audit and implementation contract
23 October 2026 · editorial/architecture foundation; **no student-facing interface changes in this pass**.

## Decisions

The help system becomes **one source of conditional guidance** with two entrances: (1) an optional, accessible help bubble beside a relevant working field or decision, opening a focused pop-in; and (2) a problem-first hub in the existing Help drawer. Both read a single editorial library and the same guarded current-work context. It is **not** a mark predictor, automatic diagnosis or AI text generator.

The committed `src/help/contextual-support-plan.js` is **an editorial registry only**; it is intentionally not imported into `app.js`. It inventories exactly **24** durable legacy topic IDs, **28** proposed new help intents, **57** possible placements (some overlap on the same field), **16** mathematical-route overlays, six browse categories and a factual/selection vocabulary. Its strings are *specification data*, not student-visible final advice. Pass 2 implements and tests the selectors and first real content.

## Audit: what is live, what must change

| Existing asset | What works | Required improvement |
| --- | --- | --- |
| `src/help/stuck-catalog.js` | 24 focused problems with action, rationale, stopping point, example, boundary and provenance | Preserve durable IDs, rewrite and split some advice; stop using page-general wording where field-specific action exists |
| `src/help/stuck.js` | Selects five broad recommendations, extracts current selected entry, guards against imaginary results | Reuse the current 16-route outcome model and source/figure links; match individual fields and actual work rather than just C/N prefixes |
| `src/help/stuck-state.js` | Private notes, selected topic, return origin, old backups, normalization | Support `checking` as a first-class origin, preserve a specific field/anchor and check return to the same selected mathematical stage; migrate with optional keys only |
| `src/help/stuck-views.js` | Problem-first drawer; useful exit/action and save controls | One concise hub with contextual choices, browse/filter, targeted tool/example links and practical features in a quiet subsection |
| `src/help/stuck-actions.js` | Explicit intent to navigate; saving does not mark mathematics complete | Route links must be current/reachable; no automatic writes, completion changes or unsafe approval assumptions |
| `src/essentials/criteria-badges.js` | Accessible focus-restoring green criteria pop-ins and field header | Reuse the field-help rail patterns, but avoid green/A-E semantics: the new support badge applies to both assessment cohorts |
| `src/completing/writer-guide-context.js` | Purple field lessons; actual-result and method-specific advice | Remain separate writing-craft support; avoid repeating the same paragraph in both pop-ins |
| `src/completing/adaptive-journey.js` | All 16 routes with explicit actual-result outcome selection, inherited source signatures | Use as single source of outcomes; no second guessed-results engine |
| `src/diagrams/representation-registry.js` | Seven live generators and explicit selected figure links | Link only relevant installed tools and return to original stage; never generate an unsolicited figure |
| `src/resources/catalog.js`, `src/resources/mla-guide.js` | Curated tutorials, single MLA path | Offer specific tool/tutorial from a help card; keep a single canonical MLA guide |
| `src/checking/views.js` | Actual-document checking, D09 citations, D12 authorship, draft/final modes | Attach help to these *real checks*, not generic Completing route; cannot inspect the external IA document itself |
| `src/ui/planning-views.js`, `src/ideas/math-pathways.js` | Idea Lab, mathematical lenses, optional comparison/selection | Offer genuinely separate help for interest-first and evidence-first paths; no prescribed IA titles |

**Important navigation audit:** `src/help/stuck.js` still proposes `N05V`, `N05`, `N03J` and `N04R` for some destinations. These were deliberately retired/redirected during 22 October cleanup. The current first mathematical work is `C30`; current Planning uses `N01P`, `N03D`, `N04S`, `N06T` and its other live nodes. Do not treat source-workbook node lists as proof of a live page. In addition, the old support state's origin route allowlist omits `checking`, so a supported help return should retain actual route and field identity. `C61`-`C64` are redirects to the unified `C60`; `C95*` and `C10E` remain compatibility mechanisms, not new help screens.

## Non-negotiable role boundary: stuck help is a repair, not a lesson

These three systems may appear near the same field, but they must have **different jobs**:

| Support | The student is asking | The system should do | It must not do |
| --- | --- | --- | --- |
| Green Criteria bubbles | "What does the appropriate IB criterion look for here?" | Explain assessment relevance, avoiding promises of marks | Diagnose a missing result as an assessment failure |
| Purple Writer's Field Guide | "How can I communicate my mathematical thinking more effectively?" | Teach reusable writing craft, with illustrative weaker/stronger approaches | Pretend to solve a mathematical difficulty merely by asking for clearer prose |
| Amber "I am stuck" | "I cannot do this particular thing. What is going wrong, and what can I try now?" | Clarify the student's chosen obstacle; give a bounded corrective action and a way to check whether it worked | Repeat criterion language, copy generic writing advice, or offer a vague "read more" link as the only next step |

**Editorial rejection rule:** Do not release an "I am stuck" card unless it could genuinely help a blocked student take their next action. "State a limitation", "write coherently", "explain the method" and "link to your aim" are writing/assessment guidance **until** the card identifies a precise source of difficulty and a specific way to resolve it.

### Every help card must be a small recovery path

1. **Recognisable first-person difficulty:** Something a student would actively select, not a judgement made by the site because a field is blank.
2. **Tiny diagnostic:** Ask a single, discriminating question *only if* different answers would change the remedy. Example: is the source mismatch a unit mismatch or a mismatch in what each row represents?
3. **One immediate action:** A task the student can realistically attempt without finishing a whole IA stage. Prefer inspecting one value, labelling one object, comparing one assumption or checking one calculation.
4. **Concrete success check:** State how the student will know the immediate problem has been reduced. Do not just say "check your work" or rely on an unexplained software output.
5. **Useful stopping point:** A small output in the student's own notes or mathematical work, not generated IA prose.
6. **Fallback:** If the action fails, offer one credible alternative, an existing tool/tutorial, or a focused teacher question. Never trap a student in a support loop.

The required schema and the worked exemplars are in `src/help/contextual-support-plan.js` as `SUPPORT_BLOCKER_STANDARD` and `SUPPORT_RECOVERY_EXEMPLARS`. They are a **content-review standard**, not live auto-diagnosis.

### Side-by-side test of genuine distinctness

**Student has plotted data and sees a curve, but Pearson's r is small.** The Writer's Field Guide can teach the student to explain association appropriately. A Criteria bubble can explain mathematical understanding/reflection where applicable. **Stuck help instead asks them to examine the actual paired scatter and distinguish curved association from weak *linear* association.** It offers a concrete interpretation check and what to do if they still cannot classify the pattern; no unperformed model fitting is asserted.

**Student cannot connect two mathematical stages.** The Field Guide can teach synthesis into continuous prose. The criterion guidance may explain coherent mathematical development. **Stuck help asks the student to identify the previous real finding, the gap that remains, and the specific job of the proposed next mathematics.** If there is no genuine gap, it recommends considering a conclusion rather than manufacturing a bridge. Only after that mathematical decision should the Field Guide be suggested for prose.

**Student cannot choose a topic or distinguish population from sampling frame.** General personal engagement, sampling reflection or writing tips do not unblock the decision. Stuck help prompts a choice of mathematical lens and a first plausible calculation, or helps the student separate the population, actual list of selectable units and individual observation. The small resulting decision can then be used in their real work.

**Student's probability tree branches are inconsistent.** Do not send them only to the diagram generator instructions. Help them find the first node whose mutually exclusive outgoing probabilities do not sum to one, identify the condition on that node and check the corrected branches.

**Student cannot cite an image or dataset because the origin is unknown.** Direct them to recover the original source identity and verify attribution, then to the existing MLA tutorial for formatting. Merely repeating "remember to cite sources" is not stuck help.

### Bubble placement and relevance gate

The placement register is a **candidate coverage map, not instructions to attach 57 icons**. Show the bubble only where at least one specific *student-selectable* blocker and credible recovery path has been authored for the task. Presence of a field, an empty answer, a low score or a plan is never itself a diagnosis that the student is struggling. If only generic advice is available, use existing Field Guide/Criteria links and **do not add a stuck bubble**.

A bubble should open a small menu such as "I don't know how to start / I don't understand this result / I tried but it isn't working" tailored to that exact task. It can skip the question when the student's selected concern already defines the problem. Do not force a checklist or quiz before helping. Use saved, still-valid context to make options and actions specific, but avoid guessing the cause of the problem from free-text input.

The intervention belongs in the student's **current** mathematical or planning task; opening, closing and returning should leave progress and authored work unchanged. When a problem is genuinely resolved, a link to the Field Guide, Criterion help or specific tutorial may be useful as an *optional next step*, not as the substance of the repair.

### Quality gate for Passes 2–5

Before merging each new help family, review at least one **realistic student-blocker scenario** per new bubble, including insufficient data, no actual result, theoretical mathematics and an adverse mathematical outcome. For each candidate card, reviewers should be able to answer all of these questions:

- What exactly is the student unable to do?
- What new actionable information does this offer **that the Writer's Field Guide and Criteria bubbles do not**?
- What one specific action can the student take right now?
- How will the student know whether that action helped?
- What happens if it still fails, or if the relevant source/result is not genuinely available?

**Reject or revise** any card that only offers encouragement, general writing advice, an assessment criterion, multiple unrelated tasks, an unnecessary extra mathematical method or a compulsory trip to another screen.

## Content expansion: editorial rules

For each problem write a **specific obstacle** (not "students are failing"), **exactly one immediate next action**, **why it matters mathematically**, **a bounded stopping point**, **an illustrative worked thinking move if genuinely useful**, **a warning that prevents a false claim**, **up to two alternatives**, and an **explicit valid return/action**. Short copy in the pop-in, deeper examples hidden under disclosure; library text remains available in Reduce advice.

Reuse the actual aim, chosen course, declared method, selected mathematical entry, selected outcome, linked source, linked accuracy decisions, data state, and consent state *only where those facts are explicitly recorded and still associated with the current context*. Never infer results from a route, technique title, proposed prediction, planned graph, absent field or unrelated historical result. Never infer suitability at AA HL or apply through-2028 A-E descriptors to the 2029 assessment cohort.

The central coherence problem deserves its own detailed help: ask for **(1) the actual prior finding, (2) what it does NOT establish, (3) why the next mathematics addresses that specific gap**; show how separate notes become student-owned continuous prose, not a canned IA paragraph. Mathematical limitations must explain the impact on an inference, rather than list a delayed survey or broken laptop. Cite unfamiliar methods accurately without turning syllabus methods into textbook tutorials.

## Eligibility, priority, visibility and presentation

1. An eligible help bubble **offers** support; lack of text or low confidence must never be represented as student failure. No automatic opening. A single life-buoy-style icon sits in the existing field help rail alongside green criteria and purple writer tips; distinguish colour/icon, accessible name and tooltip. No duplicate bubbles on nested wrappers. On mobile use a bottom sheet or correctly contained dialog; desktop may use an anchored pop-in. Keyboard/Escape/focus/scroll restoration must work.
2. Order: explicit permission/safety concern; invalidated dependent mathematics; selected real mathematical outcome; current field; current stage; broad fallback. A bubble contains at most three distinct choices and one actionable primary route. The hub initially offers at most four context-appropriate problems; the full searchable library stays available without unnecessary category scrolling.
3. `Reduce advice` only suppresses verbose inline exposition; it **never hides the entry point** or abridges the content that can be opened. Essential mathematical accuracy, source integrity, permissions, units and no-fabrication cautions are never suppressed.
4. Prevent duplicate content across criterion guidance (assessment), purple Field Guide (writing craft), amber "I am stuck" (recover from an obstacle), route coach (mathematical options) and resource tutorials (tool operation). Help should reference those systems and return to the original working task rather than cloning them.
5. Navigation to an earlier or later stage requires explicit click, with an origin token (route + live node + field anchor + entry ID + source/figure ID where applicable + current scroll/focus). Never silently replace the current mathematical stage. Leaving or closing help does not change anything about the IA. A saved "next action" is a private note, not a completed mathematical result or readiness check.
6. Keep legacy saved support drafts/actions and six C95 compatibility IDs; use optional schema fields and normalizers. Do not change data sheet snapshots or source workbook provenance.

## Rollout mapping

**Pass 2:** implement neutral reusable help badge/pop-in, new selector/condition layer, live-node destination validation, refreshed advice and placements for both Idea Lab directions, Planning, evidence/sampling and maths choice. Verify reduced advice, phone and desktop, approvals and old backups.

**Pass 3:** connect all 16 routes through the *existing* selected-outcome API, selected entry/method, actual-result checks, source signatures and seven installed diagram editors. Place targeted bubbles at first mathematics, each four-part mathematical stage, interpretation and next-step bridge, later-stage dependencies, conclusion, notation and technology. Complete subject-specific examples after mathematical validity review.

**Pass 4:** redesign the main hub around "Help with this task", browsable problem groups and practical tools; integrate Checking D09/D12, actual draft/final modes, MLA and teacher-question prompts. Preserve legacy help notes, private next actions and full JSON backup workflows. Audit navigation between hub, pop-in and resource/example viewers.

**Pass 5:** unit and browser regression audit across 24 legacy IDs, 28 candidate new intents, all 16 routes and route outcomes, all seven generators, planned vs actual math, theory without data, stale/cross-entry data, permission, matching accuracy, checking origin, A-E versus revised2029, Reduce advice, old JSON data, XSS/escaping, keyboard focus, Escape/back, phone width and no unsolicited progress/IA edits. Production build and required GitHub Actions must pass before deployment.

## Pass 1 acceptance

- [x] Source audit conducted against current live code, not only dated workbook snapshots.
- [x] All 24 old IDs retained in a separate compatibility disposition table.
- [x] 16 specialist overlays keyed to the existing route IDs.
- [x] Seven working representation tools identified; no future/unfinished generator promises.
- [x] Candidate field, stage and Checking placements recorded; duplicate badges prohibited by selection policy.
- [x] New structured editorial intentions and context-fact vocabulary defined.
- [x] Existing historical navigation problems identified for Pass 2 repair.
- [x] No alteration to student-facing screens, IA entries, project state, saved notes, routes or deployment.

This document is the **current implementation contract** for Passes 2-5; `docs/help-2026-10-15.md` remains historical evidence for the original implementation.
