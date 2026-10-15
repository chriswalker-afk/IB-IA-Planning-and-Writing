# IA essentials and contextual assessment guidance

## Source-based reference

The user-supplied `IB DP-Maths Internal Assessment.pdf` (AA guide, printed pp.80–88) and `JIS SL Maths IA Guide 2025` inform the reference. The public site identifies the sources without publishing the files or private Drive links. It distinguishes official descriptor wording, IB guidance, JIS recommendations/workflow and practical advice, and does not claim a live policy lookup.

The complete A–D descriptors and both Criterion E rubrics retain the supplied wording. A–D are shared; E uses an unambiguous SL/HL course or an explicit reference-level choice. Switching the reference never changes the course. Best-fit judgement is explained. JIS slides 43–47 inform separately labelled opportunities, not compulsory mark-earning checklists.

Formatting preserves the approximate 12–20 double-spaced-page recommendation, inclusion of diagrams/graphs, bibliography exclusion and cover title/page count. It invents no word count, mandatory font, margin, extra page exclusions or identity rule. Familiar versus unfamiliar mathematics, notation, sources, ownership, collaboration, one-draft feedback and school deadlines are explained. JIS's written-feedback workflow remains distinct from the IB one-draft wording. The active appendix review action permits large supporting datasets rather than imposing the former stronger editorial preference; the original source-sheet snapshots are unchanged.

## Discovery and contextual help

IA essentials is a persistent topbar/sidebar action, including phones. Its three sections are Format & length, Assessment criteria and Before submission. Planning offers an at-a-glance summary, writing an introduction offers document setup guidance, and draft/final reviews link to the rubric and self-review.

One Show the criteria here panel sits below the task introduction and above the inputs. Two criterion actions are normally visible in full, with a comparison link and rubric link. Existing private writing tools are grouped within this panel instead of repeating advice below the task; the dedicated writing-helper stage remains expanded. Open writing editors stay open on re-render.

Context selection respects the task, theoretical work, planned versus actual results, the explicitly selected earlier finding, the writing-helper origin and linked accuracy policies. Familiar, mixed, first unfamiliar use and later reuse receive different explanations. Hiding tips is an in-session UI preference for that task/record, not a criterion achievement. The example and rubric links remain available. All 29 original examples explain their relevant criterion features without assigning marks to excerpts.

## Reference navigation and self-review

Reference navigation is ephemeral and never writes findings, methods, course choices, permissions or completion. The native dialog preserves its originating task, focus and scroll. Rubric/example navigation supports a return to the underlying viewer rather than losing the current work.

Before my teacher draft and Before final submission reuse `draft-D02`–`D06` and `final-D02`–`D06`. Page references, evidence and improvement actions are shared with the existing detailed review. Optional student-entered selfMark and Criterion E markLevel fields are additive defaults in the existing normalizer. There is no generated mark, total, teacher approval or submission. Unknown E levels and invalid grades are rejected; zero marks are preserved. Switching reference level does not silently reinterpret an earlier judgement. JSON backups retain the records; the working report identifies these as student provisional judgements.

## Verification

`tests/essentials.test.js` checks rubrics, source distinctions, level selection, contextual boundaries, read-only viewing, linked accuracy, unfamiliar-method reuse, annotations, explicit edits and backup normalization. `scripts/essentials-browser.py` exercises the real production build on desktop and phone viewports, including both dialogue directions, saved evidence, reload, JSON export, visible placement, dismissal and retained writing tools. The examples browser suite is updated for the visible comparison location while retaining its preservation checks. Automated scenarios verify the tested synthetic journeys, not classroom impact or all assistive technology.
