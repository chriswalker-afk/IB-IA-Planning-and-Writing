# Two-question IA timeline — 15 October 2026

## Student experience

The Planning timeline page (N03H) now starts with two questions only:
1. How many weeks are available for the investigation? (1–52 whole weeks.)
2. Would the student prefer to finish early, leaving some free time?

On request, Pathfinder creates a **provisional sequence of eight mathematical and writing milestones**, in sensible order: question and introduction; usable data or theoretical starting cases; first representation; interpretation; first substantial mathematics; further mathematics and conclusion; full first draft; revisions and final checks.

Students see a compact week-by-week schedule, not eight compulsory date fields. An optional **Edit dates or add school deadlines** disclosure reveals the familiar detailed planner. They can edit individual dates, enter a different start date and record school-confirmed teacher-draft/final dates. The simple view remains the default even for existing projects.

Suggested dates are calculated in the browser from the start date (today at first generation) and chosen duration. If the student opts to finish early, around 15% of the available days (at least one day and at most three weeks) is reserved after final checking. No holiday calendar, permission, exact teacher feedback date or school submission deadline is invented.

## Non-destructive editing

- A suggested schedule is only created after both questions are answered and the student requests it.
- Previously entered dates, especially school deadlines, are retained.
- Subsequent regeneration updates untouched suggested dates but preserves manually edited dates. A separate, confirmed reset can restore all suggested dates without modifying school deadlines.
- The start date stays stable on regeneration; it does not silently shift forward each day.
- The theoretical branch labels the data step as definitions and starting examples; it does not require a fictional dataset.
- Editing the time plan never creates completed mathematics, teacher permissions, or marks.
- A change to the plan appropriately flags the Planning summary for review, while leaving all recorded mathematical work intact.

## Exports and backward compatibility

\`timelineWeeks\`, \`timelineEarly\`, \`timelineStart\` and \`milestoneData\` are added to the existing version-2 Planning fields. Existing 7 date fields and both school deadline fields remain; prior snapshots are still accepted. The optional regeneration metadata is kept in the complete JSON project state.

PDF/Word Planning reports now include the student's chosen duration and early-finish preference, provisional start date, generated/edited targets and the data milestone. The same section automatically appears in full-project PDF, Word and ZIP reports. Full JSON backups preserve the entire timeline.

## Quality assurance

\`tests/timeline.test.js\` checks 1–52-week schedules, simple UI default, no fabricated deadlines, manual-date preservation, existing results, old-project normalisation and PDF/Word embedded snapshot round trips. \`scripts/timeline-browser.py\` checks desktop and two mobile widths, editing and refreshing schedules, theoretical wording, legacy date safety, and downloaded timeline content.

Classroom review is still useful for the mathematics of the relative timings and school-specific draft-feedback processes; students should not assume the generated dates are teacher-approved.
