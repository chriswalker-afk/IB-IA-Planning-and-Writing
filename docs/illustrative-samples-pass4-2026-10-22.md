# Illustrative student investigations - Pass 4

Pass 4 adds four geometry-and-decisions investigations to the nine completed samples. The registry now has 13 authored samples; probability, proof and iteration remain briefs. Every applicable response is first-person student work. Planning, Writing, the continuous reader, PDF/Word and the editable backup use the same saved answers rather than a second canned narrative.

## Completed mathematical arguments

### Leaf area (`leaf-area`, AA SL)

An original PNG contains a deliberately constructed polygonal leaf, a 120-pixel scale representing exactly 2 cm, and a retained 16-vertex trace. The investigator fits two upper parabolic pieces and a lower quadratic, evaluates their integrals, and compares the result with the exact area of the selected polygon. The curve area is 296/15 = 19.733333 cm squared; the polygon area is 19.8. The apparent 0.337% agreement is explained rather than celebrated: a 0.386667 square-centimetre sampled-width difference and a 0.32 square-centimetre quadrature difference largely cancel. Both estimates use the same boundary, so agreement is not independent validation.

Changing the scale reference to 118-122 pixels and the 14 internal ordinate selections by up to 3 pixels gives a conditional combined polygon area range of approximately 18.4789-21.2008 square centimetres. Those bounds depend on the stated error model; they are not confidence limits. The conclusion recommends about 20 square centimetres for the face area of this design, not a precise material or seam allowance. The original constructed PNG, calibration, coordinates, piecewise models and full width calculations remain editable.

Five mathematical stages; five native figures (two tracer views, one graph and two short tables).

### Inaccessible height (`inaccessible-height`, AA SL)

The construction specifies a 15 m baseline, 42-degree near and 27-degree far elevation, common 1.50 m instrument height and level ground. The investigator derives both tangent and cotangent forms, obtains a nominal height of 19.105675 m, and checks an additional defined angle as internal consistency rather than an independent measurement.

The permitted angular, baseline and instrument-height intervals are varied simultaneously. Monotonicity proves that the extrema occur at the stated corners of the input box, giving 17.775173-20.617299 m. A separate baseline comparison holds the same mast geometry fixed and recalculates the far angle: a 25 m baseline reduces the angular-only height interval width by about 18.6% relative to 15 m, while a 2 m baseline is poorly conditioned. Overlapping angle intervals may permit an unbounded height; a narrow-looking nominal calculation does not overcome that limitation.

Four stages; five native figures (a labelled geometry diagram, a sensitivity graph and three compact tables).

### Water stations (`water-stations`, AI SL)

The defined 120 by 80 m rectangle contains two existing mathematical sites, six demand checkpoints and three feasible new-site candidates. Checkpoints never become station sites. Perpendicular bisectors explain the native Voronoi diagrams. The original maximum nearest-station distance across the six checkpoints is sqrt(4100), approximately 64.0312 m. The central candidate reduces it to sqrt(1700), approximately 41.2311 m, whereas the two side candidates leave about 50.9902 m. This is a finite-candidate, six-checkpoint minimax result, not a continuous-plane optimum.

A demand-weighted mean distance answers a different question. Giving each of the two western checkpoints weight w, with the other four weighted 1, makes the western and central options tie at approximately w = 1.218590. Above this threshold the western option is better for that objective. At w = 4 its weighted mean is about 23.7563 m versus the central site's 33.6891 m. The investigator explains why the central minimax recommendation and western weighted-mean recommendation need not conflict. No real demand, installation permission, walking-path access or map is claimed.

Four stages; six native figures (one coordinate geometry map, two Voronoi diagrams, two comparison tables and one weight-sensitivity graph).

### Repayment plans (`repayment-plans`, AI SL)

Two entirely hypothetical BND 12,000 offers are compared under a BND 300 monthly payment and a separate upfront budget. Offer A charges 0.6% monthly with no setup fee; B charges 0.45% monthly and BND 400 upfront, not financed. The student derives the unrounded geometric balance expression, then applies the stated half-up cent rounding to interest in every actual modelled ledger month. Final payments are smaller than BND 300.

A takes 46 payments, ending with BND 263.06 and total BND 13,763.06. B takes 45 payments, ending with BND 59.91 and instalments of BND 13,259.91; including its upfront fee gives BND 13,659.91, a BND 103.15 full-term advantage. The setup-fee crossover is BND 503.15. However, settlement after 12 monthly payments costs BND 12,771.88 for A versus BND 12,973.82 for B, so A is BND 201.94 cheaper then. B first becomes cheaper at month 29 under the exact stated early-settlement rule. The first affordable monthly payment, the full-term nominal cash total and the early-settlement cost are distinct comparisons.

Four stages; six native figures (two balance plots, a fee graph and three short tables). The complete month-by-month ledgers and all settlement horizons are retained as editable working data, not inserted as long narrative tables. Rates and rules are defined assumptions, not current products or financial advice.

## Shared implementation

`decision-sample-tools.js` maps authored fields and creates normalized native figures; it does not generate student prose. Each investigation has its own source assumptions, mathematical progression, consequential reflection, accuracy records, conclusion and review evidence. Saved source-editor fields are identical to the source records. External teacher feedback, authentication and school deadlines remain unclaimed. The original leaf image is embedded in a small module so offline reader, backup and tracer export use the same image.

The explicit reference suite now covers all 13 sample IDs. Fifteen Pass 4 tests independently recompute integration, polygon and calibration values, simultaneous angle bounds, site distances and weight thresholds, and exact cent-rounded ledgers using a separate BigInt implementation. Tests also verify native figure validity, ownership, JSON reimport and complete browser-matrix coverage. The dedicated and conformance browser matrices each cover all 13 once in five small parallel groups. The post-deployment report workflow additionally checks all published chooser IDs and their reader figures on desktop and phone.

## Verification record

Before browser review, the complete local Node suite passed 1,128 tests, including all 15 Pass 4 tests, and the production build succeeded. Local Chromium navigation is blocked by the execution environment, so actual browser acceptance and PDF/Word downloads are run on GitHub Actions. Export and screenshot artifacts are then inspected separately. Layout review records remain unchecked until that inspection has actually taken place. Final CI, merge, deployment and published-reader results belong to the associated pull request and Actions runs; this document does not imply they have completed merely because authoring is present.

## Next authoring pass

The final three briefs are stop-on-gold probability and simulation, consecutive positive-integer sums, and square-root iteration/convergence. They are not marked as completed or exposed as available samples.
