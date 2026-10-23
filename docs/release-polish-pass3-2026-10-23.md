# Release polish — Pass 3: guidance interface and content consistency

23 October 2026 · branch `release-polish-pass3-guidance-content`

## Goal
Keep the site’s three distinctly useful support systems — *I am stuck*, *Writer’s Field Guide* and *IB criteria* — while making their entry points, pop-ins, close and return actions, responsive geometry, and descriptions behave like parts of the same product. Remove outdated student-facing claims introduced by subsequent export and Checking upgrades. Do not change mathematical advice, results, assessments or saved project state.

## Audit findings and changes

| Surface | Purpose students should understand | Changes |
|---|---|---|
| Amber I am stuck | **I cannot progress** — diagnose a specific problem, try one action, check it and choose a fallback | Keep existing 16-path, planning, writing and checking recovery content, native modals, problem-first choices and return destinations. Add consistent accessible shell landmarks and touch-sized close/return controls. Checking now asks about the *checking* difficulty, not an unrelated mathematical obstacle. |
| Purple Writer’s Field Guide | **I can work, but need to communicate mathematics better** | Preserve all 14 tips, comparisons, contextual links and reduced-advice behaviour. Give its modeless contextual panel the same labelled header/body/footer pattern and an accessible description of the exact writing-box focus. Preserve Escape, outside-click dismissal and focus return. |
| Green Criteria | **What is relevant in the assessment here?** — never a grade prediction | Preserve contextual A–E guidance, the `revised2029` separation and its existing native `<dialog>` behaviour. Share layout, focus visibility and mobile-close hit areas. Keep the rubric action separate from the action that returns to work. |
| Help drawer | **Which type of help do I need?** | Replace an undifferentiated list with three clearly labelled, short purpose/destination choices; keep Tools & tutorials, My path, Save & export, and illustrative samples beneath them. The criteria choice opens the *Assessment criteria* tab directly, not Format & length. |
| C91 project backup | **How do I keep and restore work?** | Remove the incorrect statement that PDF/Word exports are only Planning documents. Offer the existing full-project PDF/Word/ZIP entry point and explain the critical distinction: **full JSON restores everything**; PDF/Word are readable working-record snapshots, and reimporting them into Pathfinder restores Planning fields only. |

## Implementation

- `src/ui/guidance-interface.js`: a single student-facing source for the names, purposes and correct existing actions of the three kinds of support.
- `data/release-guidance.css`: final, explicitly scoped shared visual layer. Common surface header/body/action structure, 44px close/action targets, coherent typography, phone bottom-sheet geometry, distinct semantic colours, focus-visible, reduced motion and printable behaviour. It leaves mathematical fields and pop-in content untouched.
- Mark up the existing Planning and IA Studio `I am stuck` native dialogs, Criteria native dialog and Writer’s Field Guide contextual popover with a common `guidance-surface` class, labelled parts and `data-guidance-kind`.
- Help drawer now shows the three support destinations first, with plain-English, non-overlapping descriptions.
- Preserved original action handlers, saved notes, context-sensitive guidance and course/cohort boundaries; no automatic writing, marking, source verification or change to `Reduce advice`.

## Acceptance and testing

- Dedicated Node tests in `tests/release-guidance-consistency.test.js` cover action destinations, source labels, native modality, Writer’s Guide focus/descriptions, old export copy removal, all three visual themes, original student authoring preservation and CSS ordering.
- The isolated `app.js` smoke-test harness now provides the new shared helper.
- Extended existing `scripts/stuck-browser.py` with Help drawer choice checks, direct criteria-rubric navigation and Checking-specific recovery wording.
- Existing Writer’s Field Guide, Criteria bubbles, revised-cohort, MLA and contextual stuck tests must remain green.
- The production CSS source order is now **35** stylesheets, still bundled to one `site.css`. Existing source-hosted import maps, paths and backups are retained.
- Test on 320–390px phones, tablets and desktop. Confirm Esc/close returns focus, the Help drawer survives a criteria reference modal, purple/amber/green remain distinguishable, and long guidance scrolls without horizontal overflow.

## Boundaries and remaining release gate

This pass is **not** an instructional content rewrite of every one of the 16 mathematical routes, and it does not collapse recovery help into rubric or writing advice. The existing general-browser conformance issue [#65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65) predates this pass and needs separate repair and full-green revalidation before final release. Pass 4 will standardise interaction patterns across diagram generators, and Passes 5–6 will complete accessibility, mobile and release QA.
