# Probability Distribution Studio — Pass 4

Date: 25 October 2026. Fifth-model expansion, in the same native generator.

## Changes shipped

- Normal and binomial functionality from Passes 1–3 is preserved.
- **Poisson**: λ is the mean event count in a specified interval, constrained to [0,100] for a readable generator. PMF and complete-tail CDF calculations use stable evaluation. The chart displays a finite range of nonnegative integer values, not an invented finite probability support. Event probabilities are calculated from the full model.
- **Continuous uniform**: explicitly enter a<b. Density is 1/(b−a) inside [a,b] and zero elsewhere; left, right, between and outside probabilities are the area of the overlap divided by support width. Exact-point selection is not offered.
- **Custom discrete**: enter 2–30 unique numerical values and their model probabilities, one per line; comma, semicolon or tab separates the two fields. Outcomes can be negative, positive or fractional. Validate each probability, uniqueness, and total 1 (a small tolerance accommodates justified rounding); do not silently rescale or infer probabilities from observations. Bars use a calibrated numerical x-axis, not equal-spaced categorical positions.
- Five distributions now share custom random-variable letters, meaningful figure titles, tick labels, printable monochrome shades, preview-only drag controls, mobile nudges, saved figure records, figure linking, JSON backup, and SVG/PNG/report output.
- The Maths Workshop contains three additional complete Show me → Help me → My turn lessons, related definitions and explicit cross-topic links, and native creator shortcuts.
- IA authoring guidance and I am stuck help now branch by chosen model and recorded writing-box context. A printed figure never contains editor guidance.

## Mathematical care

1. A mathematical probability model does not prove suitability for an observed population.
2. Poisson assumptions include constant average rate and independent occurrences in a fixed interval. Its infinite tail is included in probabilities.
3. Continuous uniform requires a justification for equal density throughout the chosen support; bounds alone do not imply uniformity.
4. Custom discrete assigned probabilities require justified outcomes and provenance. Neither a probability bar plot nor a theoretical distribution constitutes measured frequencies.
5. All example values in the Maths Workshop are invented practice, never inserted as student results. Linking a saved figure does not mark a mathematical stage complete.

## Acceptance

- Unit tests: Poisson point/cumulative/tail and edge-case probabilities; uniform intervals beyond support; custom negative/fractional outcomes, duplicates, non-normalised sums, backups, axes, exports, and contextual help.
- Playwright browser acceptance: 1440px desktop and 390px phone, downloaded SVG validity, correct shading, correct probability display, links into Maths Workshop and contextual I am stuck support.
- Full repository test/build and existing cross-site backup, accessibility and mathematics authoring checks must pass before merge.

## Suggested next development pass

**Pass 5: inverse probabilities and parameter exploration.** Allow students to supply a target probability and find cut-offs or percentiles with clear conventions for continuous versus discrete distributions. Add probability-boundary searches, parameter sliders and optional sensitivity comparisons without pretending theoretical scenarios are observed data. Preserve all model-specific validation and printable IA quality rules.
