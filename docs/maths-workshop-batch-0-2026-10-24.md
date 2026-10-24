# Maths Workshop — Batch 0 foundation
24 October 2026

## Purpose and boundaries
A **read-only mathematical learning library** inside the existing Tools & Tutorials drawer. It explains core definitions, demonstrates calculation procedures, offers optional guided practice and distinguishes meaningful working from routine arithmetic better left to technology.

- It **never** changes the student's saved mathematics, IA document, review status, investigation route, course, grade, evidence or sources.
- Examples are **invented teaching examples**, not data to paste into an IA or claims about observed results.
- An included method is **not** an IB syllabus recommendation, a guarantee of high marks or a required step.
- The new learning content does not duplicate the existing software walkthroughs: each pilot links to an existing task guide.
- No external player, video, analytics service or mathematical API is embedded.

## What Batch 0 includes

1. **26 canonical quick definitions** covering populations/samples, distributions, correlation, modelling, calculus, optimisation, geometry, probability and reasoning. Each has an explanation, small example, and relevant notation where useful.
2. **Three complete pilot method guides**:
   - Mean and standard deviation: explicit distinction between the population and sample formula, and Sheets AVERAGE, STDEV.P and STDEV.S shortcuts.
   - Pearson's correlation coefficient: a checked worked calculation, direction/strength practice, caution on nonlinearity and causality, and existing Sheets/Desmos help links.
   - Finding a maximum by differentiation: derive an objective function, constrain its domain, differentiate, check candidates and interpret the result.
3. **Show me → Help me → My turn** for each pilot: fully worked maths, one checked multiple-choice practice step with a hint and feedback, and an independent question with an optional revealed worked answer.
4. **All 16 investigative routes** mapped to starter glossary terms and any applicable pilot lessons using stable canonical IDs. A route with no pilot method still offers relevant definitions and makes it clear that later lessons are forthcoming.
5. **Search and pathway filtering**, accessible from Tools & Tutorials and the Help panel; direct links from expanded investigative routes and the key IA Studio method selectors (suppressed when Reduce Advice is active). The original Tools & Tutorials actions, creator library and I am stuck navigation remain usable.
6. **Responsive styles, keyboard controls and read-only state**. Practice choice, filter and lesson navigation are all ephemeral UI state; neither autosave nor JSON backups treat them as real student work.

## Content architecture

| File | Responsibility |
|---|---|
| src/workshop/catalog.js | Canonical definitions, pilot methods, route mappings, method-to-pilot selection |
| src/workshop/views.js | Searchable glossary, lessons, study UI, practice feedback |
| src/resources/actions.js | Session-only Workshop navigation using existing drawer actions |
| src/resources/views.js | Entry point and cross-linking with existing software guides |
| src/ui/investigative-routes-view.js | Optional pathway-contextual Workshop button |
| src/completing/views.js | Compact optional method-selector link; respects Reduce Advice |
| styles.css | Scoped desktop/phone Workshop styling and accessible targets, retaining the existing CSS bundle contract |
| tests/workshop.test.js | Coverage, arithmetic, safety and session behaviour |
| scripts/resources-browser.py | Practical phone and desktop browser checks |

The route mapping is intentionally a short list of **learning resources**, not a roadmap for an IA. Students decide which mathematics is actually useful from their own question and evidence. No free-text NLP makes that decision automatically.

### Pilot arithmetic and teaching checks
- Mean: complete population 2, 4, 4, 6 has mean 4 and population SD √2, while the sample estimator uses √(8/3).
- Pearson: (1,2), (2,3), (3,5), (4,4) yields r = 0.8. The independent example (1,3), (2,5), (3,4), (4,8) yields r = 7/√70 ≈ 0.837.
- Optimisation: rectangle with perimeter 24 m has A(x) = 12x − x², feasible 0 < x < 12 and maximum 36 m² at x = 6 m.

The worked examples remain in their lesson. The Workshop does not copy results into an IA.

## Batch 0 acceptance
- All 16 route IDs resolve and reference only existing definitions and lessons.
- Every method has correct definitions, steps, independent practice, a technology alternative, conditions and IA interpretation.
- Students can enter from Planning, IA Studio and Help, complete an optional question, use a software guide and return without changing their working project.
- In a phone-sized viewport, pathway filters, lesson tabs, practice options and definition cards reflow without horizontal page scrolling.
- Reduced Advice hides optional inline guidance while Help and the library remain accessible.
- Existing resource, writing, mathematical-stage, report and backup tests remain valid.

## What comes next — Batch 1: Data essentials
Add robust, reusable worked guides and glossary terms for **sampling and bias, descriptive distributions/plots, proportions and two-way tables, and measurement uncertainty**. Expand guided practice for students who need it, and reuse the existing Statistical Diagram Studio and Sheets tutorials. Prioritise routes **relationships, comparing groups, categorical relationships and variation/reliability**. Do not add statistical tests simply to make an IA appear sophisticated.

Once the foundation and Batch 1 are verified, Batch 2 addresses **relationships and fitting**: Spearman, regression, nonlinear models, residual diagnostics and justified model comparisons.
