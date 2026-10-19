# IA Studio writing-stage pattern — 19 October 2026

## Goal

The first writing screen had accumulated overlapping guidance: a long introductory prompt, two separate spark presentations, six writing tips, a separate A/C criterion panel, scattered example actions, a contextual Field Guide card, and multiple reminders to write in the actual IA. All contain useful ideas, but too much must be read before taking action.

This pass pilots a single repeatable **Advice → Relevant sparks → Writing task → Optional examples** layout at **C10 Introduction**, preserving the existing official criteria, guided Writing Studio workflow, and student records. A small shared `renderWritingStageFlow` layout module can be reused as the remaining writing pages are reviewed; they are deliberately not all rewritten at once.

## Introduction layout

1. **Before you write**: four brief, visible tip summaries, each expandable into the existing substantial explanation and before/after writing comparison. The two extra craft tips remain under one disclosure. One link reopens the full Writer's Field Guide. Repetition of the same advice in separate blocks is removed.
2. **Turn your sparks into an opening**: one compact presentation of the saved aim, motivation and an optional prediction/hope, with safe excerpts and a route back to the original Planning fields. The original prediction and reason remain editable once in a small disclosure. A single **Browse all saved sparks** disclosure preserves access to every other spark without duplicating the two featured cards.
3. **Write your introduction**: one clearly named primary notes textarea. The site explains prominently that this is a private Pathfinder notes box and that the actual IA paragraphs are written in Word or Google Docs. **Criterion A and Criterion C bubbles** sit beside this textarea, with the same contextual popovers and official rubric links used elsewhere in Planning. No separate 'Why this matters in the criteria' panel remains.
4. **Compare introductions (optional)**: one collapsed help section holds the fictional introduction comparisons and specialist-vocabulary example. The example guidance has not been removed, just placed on demand after the main task.

The general IA writing reminder, contextual Writer's Field Guide card and repeated 'writing moment' suggestions no longer crowd **C10**. They remain on other relevant stages. C10's actual stage controls and status tracking are unchanged.

## Visual and accessibility

- On desktop the contextual A/C bubbles form a small vertical pair on the edge of the writing field; on narrow phones they align with the field label, away from the editable text.
- Disclosures use native keyboard-accessible `details/summary` elements. Criterion bubbles preserve their existing accessible labels and keyboard-focusable popups.
- Reduced advice mode keeps the essential one-paragraph advice and all sparks, writing input and criterion bubbles while hiding lengthy examples.
- No new grading, no claim that Pathfinder read the student's external IA, and no background changes to saved answers.

## Future rollout

Use the same layout for each reviewed Studio stage, selecting only actually relevant spark IDs and criterion bubbles. Useful examples include data/source work (sampling, accuracy and provenance), first mathematical steps (aim and purpose), reflection (recent finding and limitations), and conclusion (actual results, earlier prediction and answer to aim). Do not add a generic tip that does not serve the particular screen. One optional example entrance per page should replace scattered duplicate links when a stage is migrated.

## Verification

Update Introduction unit tests and the established 390px/1360px onboarding browser acceptance journey. Check ordering, exactly two A/C badges on the notes box, lack of separate criteria panel, original spark access, optional example viewer, reduced advice, persistence, and no horizontal overflow. Existing broader regression workflows still apply.
