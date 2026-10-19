# Three-part first-mathematics writing pass — 19 October 2026

## Objective

The page directly after Introduction already brought back the student's Planning choices and supplied technique-specific first-step advice. Its writing inputs, however, did not clearly distinguish the three separate decisions that make the mathematics read as a coherent investigation. This pass changes **only the C20 writing area** into three named, visually distinct and persistently saved parts:

1. **Connect the Introduction, aim and first maths.** In a short bridge, explain why the mathematical start follows naturally from the aim. Use the existing self-assessment to avoid rewriting this if the Introduction already makes the connection. The earlier \`completion.fields.dataAimLink\` value and A/C bubbles remain intact.
2. **2a — Introduce and justify the chosen mathematical technique.** Identify the mathematics and the question it can investigate, with an authentic reason for using it. Treat the intended reader as another student familiar with the course: do not describe syllabus calculations step by step. The primary text box **reuses** \`completion.fields.methodReason\` from the optional Methods step, preventing two conflicting reasons being stored. The existing \`completion.fields.firstPurpose\` remains a smaller supporting field in this same card, reused at C31.
3. **2b — Mathematical limitations, alternatives and suitability.** Give a mathematical assumption, domain or limitation that might affect this method; consider a plausible alternative or check; explain why the preferred method still seems suitable for the aim. The new saved field \`completion.fields.firstMethodEvaluation\` is **separate from** the legacy \`completion.fields.methodLimitation\`, which is about the source and data-collection design. Its D/E bubbles emphasise meaningful reflection and appropriate mathematical use. Students are warned not to report *anticipated* limitations as observed findings before work has been carried out.

The existing optional source/accuracy section, subsequent mathematical work, original C22/C23 methods/source notes and result records remain accessible. C26 and C30 bring forward a concise read-only summary of the two new parts, prompting students to revise provisional thoughts after the actual mathematics has happened. Nothing is auto-written into the IA; all fields remain Pathfinder working notes.

## Contextual advice

A new writing-specific library covers **all 16 investigative journeys**, with separate material for 2a and 2b. Each 2a panel explains what mathematically to introduce and why, without course-level tutorials. Each 2b panel gives a mathematical limitation, a meaningful alternative or validation, and conditions in which the starting approach would be justified.

Examples:
- **Relationships:** inspect paired data in a scatter diagram before applying linear correlation; identify curvature, outliers or subgroup issues and consider nonlinear or rank approaches if actually warranted.
- **Models:** justify a simple baseline from variables, domain and evidence; compare against residuals, overfitting and simpler alternatives rather than using more parameters automatically.
- **Optimisation:** define objective, feasible domain and constraints; compare stationary points and boundary cases and examine idealised assumptions.
- **Conjecture/proof:** define a precise claim, start with small cases as reconnaissance, distinguish a counterexample from a valid general proof, and consider an algebraic or induction argument where suitable.
- **Statistics:** distinguish sampling and distribution limitations from the mathematical restrictions of tests, such as expected counts or independence.
- **Financial and geometric projects:** explain assumptions, constraints, accuracy and the kind of conclusion the model can really support.

If a previously chosen journey no longer matches the user's investigation type, do not display its advice as current. Instead, use the selected course technique's mathematical guidance, or a conservative general starting prompt when no choice is available. Choosing a route does not make it mandatory.

## UX and storage

- Three cards with clear **1, 2a, 2b** labels; a restrained teal, violet and warm-neutral treatment differentiates the jobs.
- A compact route-specific advice panel appears **inside each relevant card**, not in another long criteria panel. On mobile, the advice collapses to a single column; reduced-advice mode retains the essential route-specific prompt and all writing fields.
- The new field is added to \`C_FIELD_DEFAULTS\`, allowing existing local saves, backups and imported projects to normalize without losing previous work.
- Criteria bubbles attached to the actual writing fields: 1 = A/C, 2a = E/C, 2b = D/E, plus the existing E purpose bubble.
- All dynamic route descriptions and user-saved notes are HTML-escaped.
- No mark is automatically awarded, no invented mathematical findings and no requirement to discuss a second technique simply to increase length.

## Verification

- Unit coverage tests all 16 route entries for both writing steps, safe fallbacks, relevant mathematics, read-only rendering and preservation of existing source/method/result fields.
- UI regression checks ordering and distinct textareas, criteria labels, persistence, reuse in C22/C30, avoiding repetition when the introduction already contains the connection, and updated journey advice after a changed Planning choice.
- Phone/desktop browser acceptance checks the new three-card layout, source/accuracy controls, writing fields, criteria pop-ups and saved notes carried into C30.
