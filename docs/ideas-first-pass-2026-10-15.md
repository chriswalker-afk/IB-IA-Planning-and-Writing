# Optional Idea Explorer - first pass, 15 October 2026

## Delivered scope

The existing `I have an idea` route remains N00 -> N01 with no extra questions. Only the optional brainstorming N00B and comparison N00C views are upgraded. No source flow nodes or route definitions are changed.

The explorer has twelve broad topics (including nature, sport, music, design and mathematical patterns), four optional subtopic chips per topic, a free-text interest, and an Other route. There are 48 manually written starting directions, four per topic, with three cards visible at a time. Subtopic matches are prioritised; other angles remain explicitly labelled as nearby possibilities. Free text is retained for the student to use; it is not claimed to trigger bespoke AI suggestions.

Opening a card reveals an editable suggested starting question, one optional narrowing prompt, a small-first-step check with private notes, and links to relevant existing tool guides. Possible mathematics remains an optional preview, not a chosen technique or a claim of course suitability. A tiny first step is not the whole IA.

Up to three ideas can be saved, edited, compared and removed. The four optional checks are interest, access, mathematical purpose and knowing a first step. There are no numerical scores, predicted grades or automatically selected winners. A variation can be saved separately through the optional narrowing panel.

## Editorial basis and additions

The idea explorer helps students begin with accessible data, relevant course mathematics, everyday activities, hobbies and existing records, while allowing them to refine an investigation instead of repeatedly restarting. A simple diagram, table or reduced problem can support a productive first step. Engagement arises from genuine mathematical decisions, not just from choosing a personal topic.

The twelve categories, 48 direction cards, checks and interactions are Pathfinder editorial work: prompts for student inquiry, not prescribed IA titles. The option to begin with theoretical mathematics complements practical data-first starting points.

The distinction between practical obstacles and mathematical limitations belongs to subsequent guidance. This pass concerns finding and comparing ideas only.

## Ownership and safe adoption

Browsing, editing an explorer draft, opening a tutorial and saving a possibility leave the current topic, aim, predictions, methods, sources, results and permissions unchanged. These notes are private planning material, not automatically written into the IA. No data are uploaded and no external search is performed.

A new project can select a direction and go straight to N01 to develop an aim. Existing topics/aims trigger a before-and-after confirmation; cancellation preserves the plan. Confirmation changes the topic only, retains the existing aim for explicit editing on N01, archives the previous topic and aim-at-choice, and preserves original predictions and mathematics. Already-completed introduction/mathematics/conclusion stages are flagged for review when the topic changes; actual results are not rewritten. No teacher permission is inferred.

Earlier typed alternatives and comparison notes remain available in N00C. They use the same confirmation boundary instead of the old dropdown's immediate topic replacement. The first recorded idea is not accidentally substituted when keeping the current topic.

Full JSON backups retain explorer filters, drafts, shortlist checks, trial notes and choice history. A pending replacement approval is deliberately not restored: review it again after import. The planning PDF/Word export and readable report have not yet been extended to include the full shortlist; the selected topic still flows through the existing plan.

## Verification

`npm test` covers the original 228 tests plus 27 new catalogue/state/safety regressions. `scripts/ideas-browser.py` provides 16 synthetic browser journeys alongside the existing 39 resource/help/conformance journeys. Tests cover the unchanged fast route, dropdown/chips, saving and adoption, confirmation/cancellation, comparison, maximum shortlist size, resource return, custom variants, edits, old notes, full backup, keyboard focus and no network requests during exploration.

Browser acceptance must run on GitHub Actions or an unrestricted local development browser; the managed browser used during development blocks localhost navigation. No access restriction is bypassed.

## Remaining work after this pass

1. Student testing and a mathematics-teacher content review: check that directions are useful but not too prescriptive, and that students move beyond a simple starter into suitable mathematical depth.
2. Alternative entry points: start from accessible material or preferred mathematics rather than an interest. These are not implemented yet.
3. Practical adjustments: filters such as fewer measurements, public records only, or another mathematical angle matched to a custom subtopic. Current cards are an explicit curated catalogue, not bespoke generation.
4. Handover polish: optionally carry a student's chosen narrowing/first-step notes into the aim view and include a shortlist page in the readable/portable planning reports, without overwriting existing answers.
5. Broader content: more distinct directions for subtopics that students actually use; course-specific review rather than automatic suitability labels.

This is the first pass, not a claim of full classroom acceptance, all-browser testing, accessibility certification, or AI-generated personalised investigations.

## Verified release checks

[GitHub QA run 38677857954](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/actions/runs/38677857954) passed **255 unit/regression tests**, the production build and **all 55 Chromium browser journeys** (16 Idea Explorer, 14 resource, 15 help and 10 conformance journeys). No page-script errors were recorded. Desktop and 360px/390px phone screenshots were visually inspected. The tests include adding a custom idea from the comparison view as well as from the explorer.

Validated application revision: `adb4bb752d52481a011234f188f6d649774c6db6`. All thirteen application, documentation and test files were byte-compared with the downloaded validated source before release. Only this verification section and the permanent read-only browser workflow are added after that check. Temporary transfer files and the isolated QA workflow are not part of the main-branch release. The permanent browser workflow now runs all four suites on pull requests or manual invocation.
