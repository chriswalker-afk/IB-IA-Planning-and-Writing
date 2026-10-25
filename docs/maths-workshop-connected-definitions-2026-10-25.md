# Maths Workshop — Connected mathematical definitions

25 October 2026 · Follow-up to the completed Batch 0–7 Maths Workshop

## Purpose

A definition should be a starting point in the student's mathematical understanding, not a dead end. Its **Related definitions** area now displays direct links to a small, curated network of meaningful adjacent ideas. Students can explore, compare and return to the previous definition or worked lesson without leaving Maths Workshop or writing any practice data to their IA.

## Coverage and editorial design

- **240 glossary definitions** total: the 230 definitions from Batches 0–7 plus ten genuinely missing sampling concepts.
- **47 explicitly curated topic groups**, spanning data, sampling, statistics, modelling, calculus, measurement, geometry, probability, finance, proof and numerical iteration. Every one of the 240 terms belongs to at least one cluster and has at least four meaningful connections. Standard definitions show at most ten links, grouped under topic headings.
- A **featured Sampling hub** deliberately shows all relevant concepts in four manageable groups rather than hiding some links behind a short automatic list:
  1. Start with the population and frame: population, sample, census, sampling unit, observational unit, frame, sample size.
  2. Compare probability methods: probability sampling, simple random, stratified, systematic, interval, cluster.
  3. Compare non-probability methods: non-probability sampling, convenience, quota, voluntary response.
  4. Check bias and quality: representative sample, selection bias, nonresponse bias, sampling variability.
- Important bridges connect approaches across groups (e.g. stratified sampling → representative sample; voluntary response → selection/nonresponse bias; standard deviation → normal models; NPV → discount rate; Newton–Raphson → numerical stability). No generic text similarity is used as a substitute for mathematical relevance.
- The new glossary terms define **Sampling**, **Sampling unit**, **Observational unit**, **Probability sampling**, **Non-probability sampling**, **Systematic sample**, **Sampling interval**, **Cluster sample**, **Quota sample**, and **Voluntary-response sample**. The existing Show me → Help me → My turn sampling lesson links to the new sampling hub and sampling-unit definitions.
- The Group comparisons investigative route includes the new sampling terms, while Relationships and Categorical comparisons can reach the sampling hub without showing an overwhelming full set in those routes.

## User experience

Open any glossary card to see its short definition, mathematically formatted formula where available, example, **Related definitions** topic groups, and any relevant worked lessons. The related links use the existing 44px touch-friendly definition chips and the existing Workshop action system, maintaining keyboard focus visibility and responsive wrapping.

Following a related link adds the current term to a bounded **in-Workshop back history** (up to twelve entries). Back returns to the immediately prior term or worked lesson, while Browse Workshop returns to the home list and clears browsing history. Opening a definition from a worked lesson also offers a return path. The saved student state, work, teacher feedback, source citations and IA progress are unaffected; this history exists only in the temporary resource-drawer session.

## Mathematical cautions

Connected terms are **not** suggestions that every method should be used in an IA or that methods are equivalent. In particular, a census is not a probability-sampling method; a quota sample is not stratified random sampling simply because target proportions match; systematic sampling can be affected by ordered-frame periodicity; and selecting a class rather than individual students changes the sampling unit and the analysis.

## QA

Automated tests verify that all 240 terms have valid, unique, deduplicated curated links (minimum four), that the Sampling hub exposes all 21 required related terms, that source and destination IDs exist, that key cross-topic relationships are preserved, and that navigating multiple terms and returning to a lesson leaves all authored work unchanged.

Desktop and 360px-wide mobile browser journeys check the Sampling hub, linked terms, backtracking, mathematical lesson navigation, cross-topic links, keyboard-friendly controls, horizontal overflow and preserved student work.

## Next

A separate **pedagogical relevance audit** could examine whether the ten most visited definitions display the best **order** of suggested connections and whether students benefit from short one-sentence distinctions between closely related terms such as stratified versus quota, sampling unit versus observational unit, or iteration residual versus actual error.
