# Maths Workshop — Batch 4: geometry and measurement

25 October 2026

## Purpose

Extend the optional, **read-only** Maths Workshop with geometry that students can use in actual investigations, rather than isolated textbook exercises. The same **Show me → Help me → My turn** sequence continues: worked method, two guided checkpoints, independent task, technology guidance and a short explanation of what merits inclusion in an IA.

This release adds **22 canonical definitions** and **five guided lessons** to Batches 0–3, yielding **122 definitions and 23 lessons**.

## Coverage

| New lesson | Core mathematical ideas | Optional existing tool |
| --- | --- | --- |
| Calibrate an image and measure with coordinates | Independent reference length, pixels/metres, Euclidean distance, squared scale factor for area, perspective limitations | Image & coordinate tracer |
| Triangulate an inaccessible point | Baseline, correctly labelled interior angles, sine rule, bearings vs angles, verification and measurement sensitivity | Geometry & Measurement Studio |
| Measure composite regions, area and volume | Outer-minus-cut-out regions, prism area times perpendicular length, area vs volume units and scale | Geometry & Measurement Studio |
| Build and check a Voronoi nearest-site region | Perpendicular bisectors, equidistance, three-site vertex, checking a third site, distance metrics | Voronoi Studio |
| Test how measurement uncertainty changes geometric results | Positive-input bounds, sensitivity scenarios, uncertainty provenance and decision implications | Geometry & Measurement Studio |

### Learning and mathematical validity

- The examples deliberately use **fictional points and dimensions**; none are inserted into the student's project or represented as their measurements.
- Image scale is valid only when the reference and measured feature lie in the same appropriate plane and the image has consistent scale. Coordinate tracing does not independently validate perspective.
- Triangulation explicitly separates **three-figure bearings** from triangle interior angles and documents the baseline and angle assumptions.
- Voronoi boundaries are **restricted portions of pairwise bisectors**; a third site may be nearer. The model requires an explicit Euclidean (or alternative justified) metric and sensible map projection.
- Area calculations avoid double-counted regions. Volume requires a third dimension, with units of cubic length.
- Input intervals and output bounds are not automatically confidence intervals. Resolution alone cannot certify instrument accuracy. Model assumptions should be challenged where they could change the outcome.
- A method being included is **not an IB syllabus statement or a compulsory IA technique**. Students may need to discuss mathematical scope with their teacher.

## Integration

The lessons appear in the Maths Workshop searchable catalog and are accessible from relevant investigative pathways, notably **modelling shapes from images**, **measurement and triangulation**, **locations and Voronoi diagrams**, and geometry-based **optimisation**. IA Studio technique choices for geometric modelling, triangulation and Voronoi now resolve to the corresponding method lessons. Each lesson offers direct links to implemented native diagram creators and relevant existing tutorials without duplicating their instructions.

MathJax display formulas have curated accessible spoken labels. Phone and desktop acceptance journeys cover the two-checkpoint sequence, the Voronoi third-site reasoning, accessible equations, native creator links and preservation of the authored IA.

## Next: Batch 5 — Probability and statistical inference

Prioritise probability rules, conditional probability and trees, expected value, random simulation and its limitations, binomial and normal models, and **carefully bounded** inferential methods (for example when two-sample or categorical tests are genuinely justified). Use existing Probability Tree Studio, calculator, Sheets and statistics guides. Teach the assumptions, meaning, interpretation and limitations before introducing test statistics or p-values. The course and appropriateness of a statistical test must be checked, not assumed because a tool supports it.

Later roadmap: Batch 6 business and financial decisions, Batch 7 proof, iteration and convergence.
