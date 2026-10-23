# “I am stuck” redesign — Pass 4: one troubleshooting hub and Checking repairs

23 October 2026 · Student-facing implementation, direct GitHub feature branch

## Goal: help a blocked student take a specific, testable step

**Amber I am stuck help:** “What exact mathematical, evidence or process obstacle prevents the next action? What can I test right now?”

This intentionally does **not** duplicate either of the established support systems:
- **Green Criteria bubbles:** assessment relevance, not a score prediction.
- **Purple Writer’s Field Guide:** writing craft, not a mathematical repair.

Passes 2 and 3 already introduced properly authored recovery cards at selected Planning and IA Studio surfaces. In Pass 4, the global drawer is no longer mainly a long list of 24 old topics. The drawer is a **single route-aware entry point** to these same authored repairs, including real Checking, citation and feedback obstacles.

## What changed

### Central hub

`src/help/hub-issues.js` is the shared index for the pre-existing live Planning and IA Studio recovery cards and the new Checking cards. It does not rewrite their advice separately.

When a student reaches the hub from a contextual amber bubble, the saved help origin also includes that **specific part or check** (e.g. `C30:part:show` or `D09:check:D09`). Suggestions prioritise that obstacle; returning to work restores the original focus where available.

The hub now presents:
1. **Likely difficulties at this step:** up to four selectable, first-person problems, derived from the source chapter and saved entry/outcome/source state. Being shown a choice does **not** mean the site thinks the student has made that mistake.
2. **Find another problem:** local, immediate text search and six task filters — Ideas & planning; Data, sources & methods; Doing mathematics; Understanding results; Checking & improving; Practical help. Source-backed cards are grouped into collapsible sections so a long catalogue never dominates the first screen.
3. **More general difficulties and earlier help topics:** all 24 historical topic IDs remain available, including the original saved actions.
4. **Saved next action, teacher question, tools/tutorials, examples and complete JSON backup:** kept but no longer competing with the first corrective action.

The selected issue displays its authored short diagnostic, **one mathematical/source/document action**, an observable success check, a minimal stopping point and a realistic fallback. It can open the correct working stage, Checking row or targeted resource. Saving the student's *own* next action is optional and never marks an IA stage complete.

### Checking-specific help

`src/help/checking-help.js` adds **19 specifically authored repair paths** on the actual review screen (`src/checking/views.js`). Each of the 21 relevant D-numbered document checks has at least one contextual amber bubble, and the teacher-feedback panel has its own.

Most consequential:
- **D09 / MLA:** decide what requires citation, trace in-text references to Works Cited *and* back, distinguish authorship of a graph from its underlying data, locate the genuine source metadata; link to the single existing `mla-citations` tutorial.
- **D12 / authenticity:** verify who actually created mathematical work, acknowledge outside help honestly and confirm current school/IB restrictions; a citation does not legalise prohibited assistance.
- **D13–D15 / feedback:** distinguish pending teacher feedback from actual comments, turn an authentic comment into one mathematically checkable correction, and verify that the actual draft/PDF contains the change.
- **D01–D08, D10–D11, D16–D21:** check mathematical coherence, one decisive computation, units and signs, legibility, accurate final PDF and current submission instructions rather than guessing from earlier-cohort requirements.

The wording is intentionally procedural and specific; it never claims Pathfinder inspected the student's external IA file, verified a source, issued feedback, detected plagiarism, predicted criteria marks or submitted the IA.

### One accessible pop-in

Pass 3's `src/help/studio-help-popin.js` now handles a Checking bubble via the same native-dialog keyboard and Escape behaviour. It can open the **exact live D-numbered Checking record** without changing its status. Where supported, a context card offers the existing resource-library MLA guide. The control preserves keyboard focus and works in both old A–E and revised 2029 A–D assessment-cohort modes, including Reduce advice.

### Saved project, origin and recovery

- Existing 24 ID values, all legacy drafts, saved pending action, teacher question action, C95 compatibility and old completion fields remain untouched.
- New card IDs are namespaced `fix:planning:…`, `fix:studio:…` and `fix:checking:…`; their student-owned action drafts are created only when chosen, not eagerly in every project.
- `normalizeStuckState()` accepts only bounded issue-key patterns; trims text lengths and rejects unsafe object/prototype paths. The original saved action and its pending/resolved state survive a backup/restore round trip.
- `captureStuckOrigin()` records the **Checking mode** (draft/feedback/final) alongside the original route, Planning node, mathematical entry ID, next-result ID, focus ID and scroll. Returning from help restores the exact original place and never silently marks a check complete.
- A changed project can make a once-selected contextual card irrelevant; the card is then unavailable for new action while the student's saved action remains retained.

## Entry, suggestions and safeguards

`hubOriginalView()` reconstructs the work the student came from, without mutating the project; `suggestedHubIssues()` prefers the current, real task. A source/permission block is surfaced first when it would be unsafe to proceed. Mathematical-route overlays are offered only for the chosen route or stage. A result/outcome next step requires `status === 'completed'`, a nonempty genuine result and a valid, student-chosen, nonstale outcome from the already deployed `adaptiveNextDirections` system.

A planned calculation, graph title, optional prediction or saved result-like text is **not evidence**. A changed earlier result never silently rewrites the later mathematics. Where the student is stuck with later-stage mathematics, the work link remains on that stage rather than incorrectly returning to the first mathematics. This is not a general-purpose chatbot and does not generate IA paragraphs.

## Verification

- `tests/stuck-hub-pass4.test.js`: checks authored repair quality, all Checking placements, course/cohort safeguarding, D09 real-file caveats, no invented teacher comments, true 16-route availability, all seven diagram tools, outcome evidence gating, permission priority, filter/category search, student-owned saved actions, JSON normalization, original Checking mode and HTML escaping.
- Existing `tests/stuck.test.js` continues checking 24 topic IDs, old note/backup compatibility, theoretical projects and no phantom findings.
- `scripts/stuck-browser.py`: legacy navigation acceptance updated for the new collapsed topic section; additional desktop/mobile flows cover a D09 modal and its real record, searchable MLA troubleshooting, help-to-checking-to-origin return, absent teacher feedback and task filters.
- Full project build, Node foundation tests and other browser acceptance should be green before merge. Manual visual QA should check small phone width, focus and scroll after modal/Checking navigation and cohort 2029.

## Next — Pass 5

Cross-site audit and polish: verify every route/field/trail link, de-duplicate prompts, review long-card density and 360px layout, check reduced advice, keyboard Escape/tab order, all 16 mathematical route outcomes, seven representations, both cohort modes and restored student backups. Run the full browser suite and address any unrelated failing checks rather than weakening assertions.
