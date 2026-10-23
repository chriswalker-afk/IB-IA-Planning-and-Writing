# "I am stuck" redesign — Pass 2 implementation
23 October 2026 · directly developed in GitHub on the Pass 2 feature branch.

## Student-visible changes

The contextual help system is now implemented in the **active Planning chapter**, including both Idea Lab approaches, comparing ideas, narrowing an aim, real motivation, choosing an investigation type/course/mathematics, primary/secondary evidence, sampling, source readiness, permission, timelines, provisional predictions, the teacher checkpoint and Planning review.

An unobtrusive amber **?** bubble opens a native modal pop-in alongside the relevant page heading or editable field label. It is visually and semantically separate from green marking-criteria advice and purple writing craft. Each pop-in offers up to three **student-selectable first-person difficulties**. After choosing a difficulty, the student receives (1) a short diagnostic question, (2) exactly one concrete first action, (3) a check of whether that action helped, (4) a small stopping point, and (5) a collapsed fallback and safeguarding boundary.

The bubble is an **offer of help**, never an assumption that a blank, brief or incomplete answer means the student is wrong. Opening or closing help does not change any answer, progress flag, source, data or mathematical record. The pop-in remains available under **Reduce advice**. Students may use the existing central I am stuck drawer for a different obstacle.

### Targeted content

`src/help/planning-help.js` defines 29 authored problem-recovery cards and 24 selective placements. The data-first and interest-first Idea Lab modes show different choices. The system checks only explicit live state needed for relevance: the current Planning node, chosen Idea Lab mode, investigation kind, recorded course/source choice and pending permission. It does **not** guess from student essay text or planned techniques, invent results, claim teachers have approved work, or decide whether any student is struggling.

Examples include:

- From sport or another hobby to a mathematical job, instead of simply choosing more specific activities.
- Distinguishing a mathematical aim from a list of attractive techniques.
- Separating genuine motivation from invented personal stories.
- Choosing a purposeful first technique and reviewing uncertain course scope with a teacher.
- Distinguishing population, sampling frame and one observation.
- Verifying secondary-data provenance, units, aggregation and compatibility.
- Choosing a safe first step during permissions/access delays, without collecting affected data.
- Leaving a prediction optional and explicitly not treating one as evidence.

### Interaction and accessibility

The modal uses the native HTML `dialog` element for focus containment, Escape handling, background inertness and keyboard support. Clicking outside its panel or choosing Return closes it. Closing restores focus to the originating bubble; field-specific work actions focus the native input where appropriate. A secondary action opens the original I am stuck hub while preserving the student's current page. Responsive CSS provides a compact bottom sheet on mobile without taking a permanent portion of the student workspace. New rendering escapes all data inserted into the pop-in.

### Existing systems and compatibility

- The 24 long-standing global help topic IDs, private student notes, pending action and compatibility `C95*` routes are retained.
- Old global-help navigation no longer targets retired `N05V`, `N05` or `N03J` Planning pages; conclusion goes to unified `C60`; first mathematics points to the current `C30` stage where appropriate.
- `checking` is recognised as a valid origin route by the global support normalizer, so returning from help does not automatically lose the review chapter.
- The Writing Field Guide and Criteria pop-ins are not modified.
- Existing student data schemas are not extended for Planning pop-ins; the selection inside a pop-in is ephemeral.
- Historical Pass 1 candidate places beyond Planning remain untouched until Passes 3–4.

## Verification

`tests/stuck-planning-pass2.test.js` checks (a) all authored cards and spots have genuine action/check/fallback wording, (b) Idea Lab mode switching, (c) relevant page/field availability, (d) native label preservation, (e) theory and permission branching, (f) course and source context cues, (g) reduced-advice access, (h) read-only behaviour, (i) live destination rules and (j) Checking-return JSON normalization. The original `tests/stuck.test.js` continues to protect the 24 legacy topic IDs and saved task semantics.

CI must pass the node test suite and browser bundle. Manual desktop/mobile checking should confirm the amber icon does not collide with the green criteria letters and that the pop-in returns to the original field after Escape or clicking its primary action.

## Next

**Pass 3** connects the same blocker-first interaction to the four-part IA Studio mathematical writing process, the selected *real* mathematical result, each of the 16 investigative route outcomes, the seven diagram generators, later-stage dependency checks, technology interpretation and conclusion readiness.

**Pass 4** restructures the existing I am stuck drawer and makes Checking, referencing, draft feedback and saved-next-action features easier to locate, while preserving the private legacy records.
