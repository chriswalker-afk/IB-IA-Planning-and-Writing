# First Mathematics after Introduction — 19 October 2026

## Intent and editorial rationale

The screen immediately after Introduction (C20) previously presented a general Data & Methods questionnaire. Students had already considered primary data, secondary data or both; an investigation type; course-appropriate mathematical techniques; and often one of sixteen investigative journeys in Planning. Those decisions were not being used explicitly to help students move from their opening paragraphs to the first genuine mathematics.

The revised C20 has one purpose: **Introduce the first piece of mathematics and connect it to the investigation aim, only if this connection hasn't already been written in the Introduction.** The screens containing evidence and sampling detail (C21S, C21M, C21T, C22–C26) are retained as targeted preparation, not positioned as a lengthy mandatory report before any mathematical work.

## What the student sees

1. **Before you write**: four brief, expandable writing principles: connect first mathematics to the aim once; get to the mathematics promptly; explain only the essential source/background context; and treat the saved mathematical route as provisional. The context tip varies for primary observations, secondary published data, combined sources and purely theoretical work. In reduced-advice mode only the compact overview remains.
2. **Your mathematical starting points**: the original aim, a genuinely student-selected first move when recorded (otherwise the optional route's suggested opening), actual Planning source type and relevant draft details, and selected course techniques as **provisional choices**. The chosen route's first question is offered as a possible prompt, not automatically written into a student field. A link back to the original Planning questions and the complete spark library remain available. The site does not invent observations or assume planned methods were performed.
3. **From aim to mathematics**: a three-way self-assessment: I already connected it in my Introduction; I will write a one- or two-sentence transition before the mathematics; or I will decide as I draft. If already covered, no new bridge text is demanded. If still needed, a single reusable text field, `completion.fields.dataAimLink`, stores private drafting notes and shows contextual A/C bubbles. The next question, `completion.fields.firstPurpose`, is the same field used later at C31 and when a first mathematical entry is created, so the student won't repeat an answer across screens. It has its own E bubble.
4. **Begin first mathematics**: a direct action to C30. If data have not arrived, students may prepare an authentic representation or theoretical case without inventing results. A separate collapsed **Source, sampling and accuracy details** area retains current real-source records, source type/status, citation, actual method, legacy notes and appropriately filtered buttons for statistical, modelling or theoretical preparation. Its original source/method A/C bubbles remain attached to the optional writing field.
5. **Compare examples (optional)**: the relevant writing example starts from the selected journey (graphs, diagrams, proof or modelling), with access to every example and the existing mathematical-writing tools.

The Introduction now has a direct action labelled **Introduce my first maths**, so the link between the two pages is explicit. C30 displays the saved mathematical question and the aim-to-maths connection (or confirms that the student already explained it in the Introduction). C26 reviews the same existing bridge field if the student chooses to visit source/method preparation; it does not introduce a duplicate field.

## Preserve established safeguards

- Source plan versus actually obtained material remain distinct. The old C20 source inputs and saved records have not been deleted or rewritten.
- For mixed data, both primary and secondary source plans are shown separately; combining them may require consistent units/definitions. For theoretical maths, ignore stale empirical-plan fields rather than pretending there must be sampling.
- Never assume a saved journey, course technique or mathematical prediction is compulsory. Show caution if a route no longer matches the student's chosen investigation kind, or selected techniques belong to another course.
- An uncertain first move can change. No one is required to forecast a final result, enumerate all future techniques or write a laboratory-methods diary.
- No automatic IA prose, no automatic marking, no invented finding. Rubric bubbles are optional help.
- Keep storage paths, navigation/route-table provenance, evidence records and established progression through C31→C35 and C40/C50 intact. Adding a bridge placement field is backward-compatible with existing saves.

## Verification

- Unit tests cover each source choice (primary, secondary, both, theoretical, undecided), route relevance and mismatch, selected course techniques, honest missing information, safe HTML escaping and preservation through state normalization.
- Studio integration tests verify one purpose field reused at C31/C30, skip-once advice when already included in the Introduction, conditional source details, criterion bubbles and student mathematical records remaining unchanged.
- Browser acceptance tests cover 390px mobile and 1360px desktop and clicking the first mathematical step, optional source details, example viewers, rubric popovers and autosaved fields.
 

## Additional pass: meaningful advice for every selected mathematical starting point

The Planning technique pills alone did not tell students how to actually begin their first piece of mathematics. The same panel now shows a focused **How could I actually start?** guide immediately beneath the selected techniques:

- **Try first:** a mathematical opening, including any essential first observation, sketch, definition or test of a simple case.
- **Look for:** the particular mathematical feature that would justify (or challenge) the technique — e.g. linearity, curvature, repeatability, independent observations or model constraints.
- **Then decide:** a conditional next mathematical step, based on what genuine evidence or reasoning shows rather than a fixed chain of techniques.
- **For your starting material / Watch out:** practical distinctions for primary, secondary, combined and theoretical routes; plus the actual course catalogue's technique-specific caveat.

There are individually authored guides for **all 51 available mathematics choices** (26 AI SL and 25 AA SL), including regression, correlation, sampling, chi-squared, functions, sequences, proof, optimisation, calculus, geometry and financial models. A separate fallback turns **all 16 optional investigative journeys** into actionable opening advice for students who chose a journey but not a particular technique. Another fallback helps students who entered custom mathematics or have not decided yet without pretending it is curriculum-certified.

If a student selected several techniques, the page highlights **one** plausible opening choice, using the chosen investigative route to favour an informative diagnostic before an advanced later method. The others stay behind an **Advice for my other mathematical possibilities** disclosure, with individual guides students can open when relevant. Nothing is auto-filled into their IA, and the selected mathematics and previous sparks are not erased. Mismatches with the current course are visible rather than silently recommended.

Examples of specificity:
- Quadratic/cubic modelling: first plot paired values or derive a function from constraints; establish that a straight line is inadequate before considering a quadratic, and use a cubic only if warranted by structure and enough information.
- Pearson and linear regression: make and inspect a real scatter plot for approximate linearity and influential points **before** applying a coefficient or fitting a line.
- Chi-squared tests: begin with genuine frequency tables, meaningful categories, independence and expected counts before carrying out a formal test.
- Optimisation: define objective and constraints, examine domain and boundaries before applying differentiation.
- Proof: state the precise claim, test small cases and search for counterexamples before general algebraic justification; examples are not proof.

Every guide is authored for a real mathematical question, not a generic 'use this method to calculate...' instruction. Tests enforce catalogue coverage, ensure no IA findings are invented, exercise source contexts and all 16 routes, and verify desktop/phone layout and optional details.
