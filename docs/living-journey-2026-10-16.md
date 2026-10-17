# IA Pathfinder: Living Journey & Insight Threads — 16 October 2026

## Purpose

Make sustained work feel lighter and accomplished without turning an IB Mathematics IA into a compulsory game. The existing four source-linked chapters remain unchanged: Planning, Set up, Explore & develop, Bring it together. A student may revisit all parts; substantive mathematics may branch or finish whenever the genuine aim has been addressed.

## Design system and placement

- **Discovery Trail**: a visually winding path on the returning homepage and My Path, with a compact version on the IA Studio stage dashboard. Only stages explicitly marked Ready for now illuminate the corresponding segment. Needs-review statuses remain visible rather than being hidden by earlier success. The navigation rail and chapter ribbon use the same derived model.
- **Planning anchors**: five provisional markers — working title, investigation aim, evidence/theoretical starting route, intended first mathematics and reviewed provisional plan. These show recorded decisions, not completed mathematics or grades. A vertical Discovery Trail and source-defined screen completions are visible on the right of every desktop Planning screen. On mobile, a compact expandable trail keeps the actual question prominent, with a small Help & examples disclosure for contextual controls. Mere visits do not increment the screen count.
- **Growing Constellation**: every entered mathematical record may appear as a star, but only records explicitly set to completed *with a nonempty actual result* become filled discovery stars. Lines use `fromEntryId` and therefore never connect unrelated results. Need-review and planned states have distinct shapes/colours and text labels. There is no target number of calculations, points or grade.
- **Insight Threads**: consistent token types (Question, Evidence, Accuracy, Discovery, Reflection) at capture points in Planning/Studio, contextual echoes at relevant later nodes, and a personal read-only Toolkit on Home and My Path. A curved link diagram on My Path lists only verified explicit relationships such as a chosen input linked to a mathematical entry or a record connected by `fromEntryId`. Echoes show student-authored values and an actionable link to their original location.

## Reuse and factual guarantees

The source of truth remains the existing project state. This pass adds no duplicate storage, separate progress ledger, locked steps, mandatory workflows or inferred marks. Familiar UI statuses are unchanged.

- **Question**: Planned investigation aim and provisional prediction, referenced in actual interpretation or conclusion when present.
- **Evidence**: Proposed evidence displayed explicitly as a *plan*. An actual source/method is represented only when recorded in the existing source manager or source note.
- **Accuracy**: Only source-specific, explicit links using `linkedAccuracy` bring a policy into a mathematical result's echoes. A general policy is **not** silently applied to unrelated quantities. Exact mathematics may legitimately require no measurement rounding.
- **Discovery**: Only completed result records with nonblank actual results get a discovery token. `fromEntryId` alone creates a connection between records; a numerically adjacent calculation is not assumed to be logically linked.
- **Reflection**: Only student-confirmed limitations with both explanation and mathematical consequence echo in the conclusion. Library suggestions never become student findings.
- **Changes**: Existing dependency logic flags affected completed calculations and stages for review. Revisions do not destroy previous work, inflate progress or infer that a Word/Docs IA changed.
- **Samples & backups**: These components are read-only over the active state, preserving the existing sample-preview isolation, legacy-version normalization and full-project JSON backup contract.

## Files

`src/ui/living-journey.js`: progress anchors, chapter ribbon, Trail and Constellation. `src/ui/insight-threads.js`: derived spark catalogue, capture/echo components, original-location links, Toolkit and visual explicit-connection map. `data/living-journey.css`: shared colours, sizes, responsive and reduced-motion controls.

Existing `src/ui/journey-views.js`, `src/ui/project-views.js`, `src/ui/planning-views.js` and `src/completing/views.js` now render those components, and `app.js` handles direct spark navigation and a few honest micro-celebrations. The source sheets, mathematics catalogues, routes, assessment criteria and the student's actual document remain unchanged.

## Acceptance expectations

1. First phone-sized Planning interaction remains visible; navigation, source tasks and optional help work unchanged.
2. Recording and revisiting an aim produces the same token in Planning, echoes later and appears on My Path.
3. An actual numerical result may light a new constellation star only when explicitly completed; a planned step remains hollow.
4. Two mathematical entries connected by `fromEntryId` have a line; otherwise no line appears.
5. A source/accuracy link is surfaced only for the mathematical record to which it was explicitly attached. Changes still flag dependents for review.
6. A confirmed real limitation can be echoed at conclusion, but hypothetical limitations are not.
7. Clicking an echo or Toolkit spark jumps to its original stored decision or result. No popup overwrites student work.
8. A sample preview remains isolated; switching samples and leaving restores the original project.
9. At 360, 390 and 1440 CSS-pixel widths there is no horizontal page overflow. All controls remain reachable. Reduced-motion preference removes decorative animations.
10. `npm test`, `npm run build`, and the existing Playwright suites must pass before merging to main.

## Open questions for classroom review

Check whether four planning anchors accurately represent students choosing different legitimate pathways, whether the first echo appears soon enough to be motivating, and whether long mathematical investigations benefit from more ways to group constellations. These are questions for observation, not claims that student enjoyment or accessibility has been scientifically measured.
