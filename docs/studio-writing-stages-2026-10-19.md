# IA Studio writing stages: Data & Methods, Mathematical Exploration, Conclusion
19 October 2026

The **Introduction** established the preferred Studio reading order: **brief writing advice → relevant saved sparks → the actual task and its marking-criterion bubbles → optional examples and help**.

This pass applies the same pattern throughout the appropriate Data & Methods (C20–C26), Mathematical Exploration (C30–C35, C40 and C50 with their conditional substeps), and Conclusion (C60–C64) pages — 31 source-linked steps in total.

## Principles retained
- Original state fields, mathematical records, conditional routes, status controls, source verification, accuracy records, mathematical interpretation, and conclusions are unchanged.
- Students always write their actual IA independently in Word/Google Docs. Pathfinder input fields are editable **notes/decisions**, not finished prose that the site automatically inserts.
- A plan is not real evidence; a conjecture is not an established result. Theoretical investigations do not have to invent a dataset; advanced maths is not automatically better; genuine mathematical limitations matter more than generic lab-report criticism.
- There is no required count of calculations or extension. Later mathematical work follows real findings and the aim.
- Main landing pages show four expandable, purpose-specific writing tips. Supporting pages offer one focused sentence and a collapsed entry to the same principles rather than repeating a large guide at each step.
- Relevant saved sparks (two contextual highlights where available) and the full collection are kept once, before the task. Their original edit and reference actions remain available.
- Criteria bubbles are next to genuinely relevant writing fields: local source/method A/C; sampling C/D; mathematical purpose E or A; interpretation D/E; and conclusion A/D. The separate criteria panel is not repeated, and the full official rubric remains available. Bubble explanations are guidance, not marks.
- Examples and secondary tools remain available behind a single optional help section at the end of the four-step sequence. That disclosure also contains the previous optional writing-moment actions, mathematical help, limitations help and external tutorials. No student ledger is erased.
- The original route prompts and buttons remain below the four-part layout; status and milestone tracking are unchanged.

## What was added
- `src/completing/studio-writing-stages.js`: shared content map and renderer for 31 source nodes using the established `renderWritingStageFlow` component.
- Updated `renderSparkShelf` with an optional hidden-heading flag so the stage header appears once without affecting other users.
- Local criteria entries for the relevant data, method and mathematical checks, preserving the popup and official descriptor paths.
- Styles for desktop and mobile layout, keyboard-accessible native disclosure and reduced motion.
- Regression coverage for the original mathematical pathways, stage order, criterion spots, actual evidence safeguards, user fields and route links. Browser acceptance captures Data & Methods, Mathematical Exploration and Conclusion on mobile and desktop, and tests optional examples and criterion popups.

## Next
Review the three stages with students, particularly the way optional help is exposed after the main task and whether a specific conditional substep warrants a more specialised writing comparison. This pass deliberately does not change the separate Set up, Introduction or final marking-review screens.
