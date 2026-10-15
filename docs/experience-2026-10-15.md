# Focus, progress and interaction cohesion - 15 October 2026

## Design rules

1. The working task has one heading. Four compact support routes stay in the same place: Compare examples, Relevant criteria, Tools & tutorials, I am stuck. Criterion explanations start collapsed; expanding them never changes student progress. IA-at-a-glance is a disclosure below the opening choices, not a prerequisite reading task. Contextual mathematical, accuracy, limitation and writing guidance is retained.
2. The sidebar, Studio stage dashboard and My path use the same four chapters: Planning; Set up; Explore & develop; Bring it together. These are views over the existing source-linked stages, not a new curriculum or a locked sequence. Inactive path chapters fold away; Show full path exposes every route. Planning no longer displays completion ticks just because a later node was visited.
3. Saving and readiness are different. Stage labels are Not started, Working on it, Ready for now and Needs review. Mathematical records separately identify planned work and actual results. Existing completion keys and saved projects remain compatible. There are no points, streaks, grades, required calculation counts or automatic claims that the external IA has changed.
4. Specific, non-blocking checkpoints acknowledge an explicitly marked stage, a recorded real result or a reviewed connection. The return screen retains the most recent checkpoint, with changed work shown as needing another look. The resume action remembers whether the student was actually in Planning or Studio, including introduction-only work. Editing does not interrupt typing or rerender the form to update status controls.
5. Samples are tab-local previews. They never overwrite the personal project key. Editing, switching samples and reloading the preview retain the student's original workspace. Return reads newer personal work if another tab has updated it. A sample backup is labelled as a sample; importing a plan, restoring a project or starting a new project requires leaving the preview first. This does not recover personal work overwritten by the old sample loader before this update.
6. Help panels return keyboard focus and scroll position to their origin. Escape in a tutorial opened from I am stuck returns to that support panel first. Background controls are inert while a drawer is open. Reduced-motion preferences retain static feedback without animation.

## Implementation

- `src/ui/journey.js`: shared derived chapter/status model, resume selection, bounded recent-checkpoint metadata.
- `src/ui/journey-views.js`: rail, dashboard, unfolding map and recent-checkpoint components.
- `src/core/sample-preview.js`: separate sessionStorage sandbox, with memory-only fallback if session storage is unavailable. It never writes the personal project key.
- `src/ui/return-context.js`: scroll and focus return utility.
- `data/experience.css`: shared component refinements using the established colour/type tokens; phone and reduced-motion rules.
- Existing project version and local-storage key remain unchanged. New optional UI metadata is included in full JSON backups. PDF/Word reports remain planning-only.

No source Sheets, mathematical catalogues, example content, assessment descriptors, participant information or student-authored findings were changed.

## Verification

The existing 291 unit tests, plus 16 new experience regression tests, pass locally. The thin DOM harness was updated for the new imports and intentional label changes; mathematical assertions are unchanged. Existing browser assertions were updated to open the deliberately collapsed criteria before inspecting them.

The conformance workflow also runs `experience-browser.py`: first actions on 360/390/1440px screens, common status labels and editing, folding/unfolding the full path without changing work, focus return and nested Escape, safe sample editing/switching/reload/return, no phantom personal project, newer personal work, clearly labelled sample backups and guarded imports, checkpoint backups, and reduced motion. The browser suite produces machine-readable results and screenshots. This is regression/interaction testing, not a claim of measured student enjoyment or full accessibility certification.
