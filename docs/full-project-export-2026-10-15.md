# Full project exports — 15 October 2026

Pathfinder now provides **three complete-project export choices** under **Backups & reports**, in addition to the existing Planning-only PDF/Word and JSON backup:

- **Full project PDF:** a paginated, human-readable working record.
- **Full project Word (.docx):** the same record in an editable format.
- **Complete project bundle (.zip):** both documents plus `ia-pathfinder-project.json`, the original complete machine-readable, restorable project state, and a README.

The readable documents cover the aim and Planning; brainstormed shortlist; Studio stages; student-owned introduction, data, conclusion and final-review notes; the ordered mathematical journey (with actual results clearly separated from planned work); method/source and accuracy links; student-confirmed limitations; interpretation and mathematical-learning notes; contextual writing notes; teacher-feedback records; and draft/final self-review evidence.

## Import and authorship boundaries

- **Use the JSON inside the ZIP to restore all project work.** The PDF and Word retain an embedded **Planning-only** snapshot and will reimport only Planning answers with the existing student review/merge interface. Changes to visible exported document text never update the embedded snapshot.
- This is an export of **student-entered working records**, not the finished IA, an automated piece of mathematical writing, a predicted IB mark, checked source validity, teacher approval, or an edit to the student's actual Word/Google Docs IA.
- All generation occurs locally in the browser. The ZIP may contain sensitive personal notes or source details; keep exported files private.
- Export actions do not alter the local project, complete stages, claim that a technique was used or replace personal work with demonstration work.
- The original Planning-only exports, Planning document import, readable working record and JSON backup/restore remain supported.

## Automated verification

`tests/full-export.test.js` checks coverage of authentic saved work, the plan-vs-result distinction, the restorable JSON archive, Word contents, PDF validity and existing planning-only embedded imports. `scripts/report-exports-browser.py` now tests old and new download buttons on source, production build and post-deployment live site, with empty and populated fictional projects on desktop/phone widths, while comparing local project state before/after exporting.

The readable report is designed for students to review and share their planning process, not to submit as an IA. Long real projects and broader assistive-technology access still warrant classroom QA.
