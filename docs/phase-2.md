# IA Pathfinder — Phase 2: Complete Planning

**Implemented on GitHub:** 14 October 2026  
**Source:** 24-tab Google Sheet snapshot preserved in \`data/sheets/\` and normalized in \`data/flow/\`. The connected Google Sheet itself was not modified.

## Scope delivered

- All **32 Planning nodes (N...)** have a corresponding screen, checkpoint or optional support branch in \`src/ui/planning-views.js\`.
- All **61 Planning route labels** from the original Routes tab are available to \`src/planning/engine.js\`, with their source row numbers. The engine refuses undefined route labels and guards the combined-source join. Internal return from a combined-source questionnaire back to the combined-source choice is explicitly tagged as a UI transition, not invented as a Google Sheet route.
- 51 source-listed **AI SL / AA SL mathematics options** are presented as course-specific, searchable, independently selectable techniques, with a free-text alternative and an undecided route.
- 22 **prediction nudges** are filtered by investigation type and, when relevant, statistical context; the prediction's WHAT, WHY and IF TRUE implications are separate.
- **Data planning:** primary (when/where/what/who/how/equipment/sampling), secondary (link/publisher/variables/scope/verification), Both (two source question sets), method alternatives/justification, first usable evidence date, full dataset date and a separately described readiness assessment.
- **Practical feasibility:** dependencies, resources, permissions/privacy, tooling, estimated setup effort, cleaning, backup, optionally a minimum viable scope and more precise risk checks; separate /5 practical ease assessment. Neither /5 rating predicts IB marks.
- **Teacher pathways:** theoretical/no-data checkpoint, unconfirmed permission status, other/HL course, advanced mathematics suitability, unavailable data and universal optional questions. Teacher discussion never blocks saving a provisional summary.
- **Mathematical planning:** syllabus-aware check without claiming to assess HL or guaranteeing course suitability, meaningful first representation and purpose, precision decision, possible contingency, review and printable working report.
- **Persistence:** existing version-one and Phase-one version-two projects continue to load; Planning fields are versioned and mirrored into the project context needed by IA Studio. The local JSON backup remains the only reliable full restore method.
- **Responsive layout:** the established design remains; broad Planning stages show progress rather than a fixed number of questions. Multi-select retains scroll and focus.
- **Traceability:** source-node markers in rendered stage cards; update to the 1,430-item coverage register and automated UI/engine scenario tests.

## Three particularly important safety distinctions

1. **A plan is not a result.** Recording a statistical technique or prediction does not populate actual mathematical evidence. The Studio's actual-result record remains separate.
2. **A teacher flag is not approval.** Pending consent, privacy and access issues remain visible; the site does not enable restricted collection or claim to receive teachers' decisions.
3. **A planning report is not a formal handover file yet.** The existing readable report can be printed/saved to PDF and JSON backups can be restored. Versioned machine-readable PDF/DOCX imports, change confirmation and final report design are **Phase 3** work.

## Where to review

1. **Statistics → secondary → AI SL**: verify source questions, evidence timing, readiness, separate practical score, contextual prediction choices, searchable math and report.
2. **Statistics → Both**: complete primary question set, return to source selector, complete secondary questions, then justify the combined approach. The join must be unavailable until both are addressed.
3. **Modelling → primary → AA SL**: select purposeful functions/calculus and check predictions don't force a technique.
4. **No-data / theoretical**: check the teacher checkpoint, tentative conjecture and numerical-case questions; save a provisional plan without statistical sampling prompts.
5. **AA HL / AI HL / unknown course**: record tentative mathematics and teacher questions; the website must not pretend to use the AI SL or AA SL syllabus.
6. **Permissions unresolved**: verify advice doesn't block a plan report, but cautions against affected data collection.
7. Change your aim or selected course **after** reaching the review checkpoint. The previous plan should remain available, but be marked as needing fresh review.
8. Refresh the browser and restore a saved JSON project, then confirm choices and source flags remain.

The CI workflow runs the Planning engine, UI, data-migration and prior IA Studio tests through \`npm test\`.

## Editorial considerations

Working-draft guidance and the one **Needs discussion** node remain explicitly provisional. The Grade and syllabus menus are source-listed possibilities for the programme represented in the Sheet, not independently verified IB syllabus certifications for later programme revisions. Avoid adding a blanket IA grade, mandatory number of calculations or copied student prose.

Source routes are explicit, not arbitrary evaluations of English-language spreadsheet cells. The rules and guard checks are in \`src/planning/engine.js\`, and the source-row-preserving values are in \`src/planning/route-table.js\`.

## Deferred by design

**Phase 3:** polished personalised planning PDF, optional Word, embedded machine-readable payloads and robust merge/reimport.

**Phases 4–6:** remaining Completing IA flow and fully contextual guidance libraries, including actual post-PMCC interpretation, advanced mathematics understanding prompts, limitation placement, teacher-draft/final review and broader classroom acceptance tests.
