# Maths Workshop — Mathematical notation and presentation pass
24 October 2026

## Why this pass was necessary

The original workshop displayed mathematics as long plain-text strings, for example the mean, population standard deviation and sample standard deviation on one wrapped monospace line. This was hard to scan, especially on narrow screens. It also obscured the distinction between population and sample quantities.

## Implementation

- Reuses the site's **existing locally bundled MathJax 3 SVG engine** and equation editor infrastructure. There is **no new dependency, CDN, remote font or network call**.
- Introduces a **curated typesetting registry** in `src/workshop/math-notation.js`, with labelled, accessible mathematical expressions for all seven current methods and all thirteen glossary definitions that already supplied formal notation.
- Splits long relationships into individually labelled equations rather than rendering several formulas in a single line. The original mean/SD relationship is now displayed as three distinct rows: arithmetic mean, population SD (divisor N) and sample SD (divisor n−1).
- Converts the important calculation lines, worked answers, guided questions and independent practice across the seven Maths Workshop lessons to **explicit TeX expressions** surrounded by `\\(...\\)`. Symbols, fractions, summation signs, powers, subscripts and units use consistent notation.
- Adds **readable inline mathematical expressions** within otherwise normal prose. Every other word remains text. No pattern-matching guesswork rewrites sentences or students' mathematics.
- Uses the established SVG rendering and escaping helpers, spoken labels on display formulas and **visible plain-text fallback** if a formula fails to render.
- Updates the existing Workshop CSS to use a flexible label + equation row on wide screens, stacked labels on phones, and keyboard-focusable, horizontally scrollable equations. The page and drawer should never overflow just because one formula is long.
- Existing Show Me → Help Me → My Turn navigation, lessons, technology shortcuts, aid hints, student-project state and backup format remain unchanged.

## Mathematical safeguards

- For standard deviation, distinguish explicitly between **population** `σ` (divisor `N`) and **sample** `s` (divisor `n−1`). Their formulas use the appropriate means.
- Pearson's correlation is presented through centred sums `Sxy`, `Sxx`, `Syy` to avoid an unwieldy mobile-only formula; the calculation and caveats are unchanged.
- Optimisation still calls for feasible-domain and boundary checks; `f′(x)=0` alone does not establish a global maximum.
- Rounding-only bounds remain distinguished from actual measurement uncertainty; a typeset interval is not automatically a statistically justified error bound.
- Quartile convention, conditional-group denominators and histogram frequency density are preserved.

## Validation

`tests/workshop-math-notation.test.js` verifies that every authored TeX expression can be converted by MathJax, every lesson and formal glossary definition has matching display math, SVG markup is escaped and labelled, and the student project is untouched.

`scripts/resources-browser.py` verifies desktop and 360px-wide-phone display, scroll containment, three separate standard-deviation relationships, typeset steps and the original help/tutorial workflows.

## Authoring guidance for later batches

When adding a new method, provide the original readable fallback formula in the lesson schema, then add one or more `{label, tex, spoken}` rows to `WORKSHOP_LESSON_FORMULAS`. If a glossary definition includes a `notation` field, include the corresponding `{tex, spoken}` entry in `WORKSHOP_DEFINITION_FORMULAS`. Write only the mathematical fragments of static teaching text within explicit `\\(...\\)` delimiters, rather than attempting automatic parsing of prose.

Next planned content batch remains **Batch 2: Relationships and fitting**, including Spearman rank correlation, linear and nonlinear regression, residuals and model comparisons.
