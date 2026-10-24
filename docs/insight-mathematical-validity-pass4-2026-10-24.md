# Insight Threads — Pass 4: mathematical validity and understanding
24 October 2026

## What has been connected

Pass 4 reuses canonical student work from earlier passes and adds **read-only, optional, technique-specific validity guidance**. It does not automatically verify numerical results, mathematical understanding, course coverage, data quality or model accuracy.

The new mathematical-validity module reads only:
- completed entries with non-empty recorded mathematics;
- the entry's explicitly selected method (or a restricted legacy technique identifier, never guesses from an aim/title/result);
- source records selected on that exact mathematical stage, with their **student-recorded** status, sampling/method/assumptions and intended domain;
- accuracy decisions explicitly linked to this stage, including actual resolution, reporting policy and reason;
- saved representations that this entry explicitly links (graph, statistics, table, tracer, Voronoi, geometry and probability);
- stage-local limitations and student-recorded limitation/consequence pairs; and
- the entry's course-scope selection and notes.

No new state keys, migrations, self-generated student findings or copied mathematics are introduced.

## Student experience

### At the original mathematics
On both the first and later four-part writing screens, a collapsed **Accuracy, assumptions & validity for this result** disclosure is available at the interpretation step, after the technique-specific reading help. The same context can be reopened on the accuracy review screen. The guidance distinguishes:
1. original input/source uncertainty;
2. mathematical-method and model assumptions;
3. numerical approximation and reporting precision;
4. whether the result is valid for the intended domain or a particular input.

A confirmed result flagged for review visibly retains that warning. Planned work does not generate a purported result-validity diagnosis.

### Course understanding
The first-mathematics page now offers an optional, existing-record method/course-scope selector beside the first explanation, not a new mandatory form. The later-stage method section and the course/explanation review pages reuse the same understanding guidance. For unfamiliar mathematics the student is encouraged to introduce the defining idea, conditions and a meaningful worked step **when first needed**, then refer back rather than repeating a tutorial. For familiar syllabus methods the emphasis remains on appropriate use and contextual interpretation. A course selection is not platform-verified.

### Saved diagram/model diagnostics
Saved figures must be explicitly linked to the current mathematical stage. Saved **graph snapshots** are reanalysed using the same graph evaluator, with:
- the actual observed input interval and units (if supplied);
- only available, valid, visible saved models;
- comparable *in-sample* RMSE in original output units, R-squared and sample count;
- a question about residual patterns and fit-versus-validity.

There are **no automatic claims** about accuracy for a new prediction point, generalisation, an error margin or the superiority of a more complex model. The student's **unsaved working draft** cannot supply evidence for the stage. A graph with failing readiness checks has no presented model metrics. Non-graph generators produce technique-specific mathematical checks (scales/denominators, coordinate calibration, distance definition, geometric constraints, conditional branches) but do not fabricate numerical diagnostics.

### Insight Threads and conclusion
Existing Discovery Sparks receive a brief **mathematical validity to revisit** note showing the technique-specific validity question and how many linked source, accuracy and saved-figure records exist. This is not an additional Spark or stored judgment.

On the conclusion screen, an optional validity summary uses the student-selected, review-free result(s), falling back to the most recent review-free result when nothing has been selected. Flagged/unperformed mathematics is excluded. A limited or qualified conclusion is still possible.

## Explicit limits and guardrails

- No inferred upper/lower error bound: measurement **resolution is not automatically ± uncertainty**.
- Planned accuracy/source policy and unrelated source records never become actual linked evidence.
- No keyword inference from result prose; method identity must be explicit or meet the existing guarded legacy technique rule.
- In-sample R²/RMSE do not prove external predictive accuracy, causal validity or accuracy at a specific unobserved input.
- Graph metrics use the saved figure's own original numerical data, never an unsaved draft or another mathematical stage's diagram.
- A copied or ambiguous figure ownership reference is not treated as a valid current-stage link.
- Non-syllabus explanations are prompted only where a student has marked unfamiliar mathematics; “within course” is explicitly self-reported, not verified.
- Source/figure text is escaped, and all guidance remains a native disclosure in both Guided and Reduce advice modes.
- No claim of a guaranteed grade or automated IA writing.

## Acceptance criteria

Unit tests exercise all method options, no-text-inference, genuine vs planned results, source and accuracy link isolation, measurement resolution caveats, in-sample graph diagnostics, invalid/hidden/unsaved/other-stage models, all seven figure categories, unfamiliar first/later use, saved Discovery Sparks, conclusion selection and review flags, course-scope caveats, XSS and old-project round trips. The existing full GitHub browser acceptance suite remains required before merging.

## Remaining planned work
Pass 5: consolidate contextual bubbles and improve immediate student-facing presentation, mobile spacing and Toolkit polish.
Pass 6: realistic end-to-end mathematical pathway usability checks with student-sized examples.
