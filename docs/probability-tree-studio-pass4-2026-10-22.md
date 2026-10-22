# Pass 4 — Probability Tree Studio (working implementation)

This implementation introduces a seventh **optional** native creator to IA Pathfinder. It follows the existing shared-figure architecture and does not introduce a new mandatory IA writing page. Implementation and tests live in [PR #51](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/pull/51); this branch is not live until the PR is merged and deployed.

## Student workflow

1. From Tools & Tutorials, the first mathematical stage, later mathematical stages or a relevant planning route, open **Probability Tree Studio**.
2. Enter a purposeful title and choose two or three successive **binary** stages (four or eight terminal paths). Edit each stage and outcome label.
3. Supply both conditional branch probabilities for every split. Accept ordinary decimals, fractions such as `3/5`, or percentages such as `60%`. Check each pair sums to one.
4. Optionally show the product of branch probabilities along each full path.
5. Optionally define an event `E` and conditioning event `C` by ticking the full terminal paths that belong to each. Show `P(E)`, `P(C)`, `P(E∩C)`, and `P(E|C)` when defined.
6. Record where the probabilities came from and note independence, data quality and modelling assumptions; save an editable figure, download SVG/PNG, or link it to the current mathematical stage.
7. Return to the exact writing stage to introduce, interpret and evaluate the mathematical outcome in the student's **own IA document**.

### Integration contract

- Registered once in `representation-registry.js` as `probability`, state store `probabilityStudio` and entry link `probabilityFigureId`.
- Appears alongside the six existing creators and uses the common figure chooser and return-to-origin system.
- **Chance** pathway and probability methods recommend a tree when successive outcomes or conditional relationships make one appropriate; expected-value methods prioritize a table unless genuinely sequential. The **finance** pathway provides a qualified optional link for successive dependent financial risk.
- Saved figures appear in first/later mathematics galleries, can be reopened for editing and restored from JSON backups, and are included in PDF/Word/ZIP full-project reports via `figure-report.js`. Current unsaved edits may appear in report working records as drafts but are not treated as completed results.
- The writing stage is never marked complete merely by saving or linking a figure. Editing a previously linked figure can flag an already completed mathematical conclusion for review.
- SVG is regenerated from the stored mathematical model, not a raster screenshot. A fitted preview and enlarged scrollable preview help inspect dense trees on phones.

## Mathematical safeguards and scope

- Every branch distribution is conditional on its **exact prior history**; the software does **not** assume independence because probabilities happen to be repeated.
- Individual branch entries are never filled or normalized automatically. Invalid / absent / out-of-range probabilities block saving and export. The total of all terminal path probabilities is calculated only when every split is valid.
- Conditional probability is `P(E∩C)/P(C)`, and undefined when `P(C)=0`; the interface must not present a numeric result in that case.
- Figure-ready means internal arithmetic is consistent, not that any empirical probability is reliable or any mathematical claim is proven.
- Secondary probability data requires a source citation. Primary/empirical estimates need a student explanation of sampling, dependence, and conditional sample sizes.
- **Not yet supported:** arbitrary multiway splits, conditional expected values/payoffs, Bayes theorem written derivations, simulation, automatic inference from data, or direct LaTeX shorthand in editable outcome labels. Such enhancements require separate mathematical and usability decisions.

## QA and release gate

- `tests/probability-studio.test.js`: branch formats and validation, conditional probabilities, three-stage cases, undefined conditioning, original source, gallery/export persistence, editing and completion honesty, recommendations.
- `scripts/probability-tree-browser.py`: genuine desktop and phone controls, deliberate invalid state, two/three-stage editing, optional calculations, saved SVG, stage linking, restoration and responsive diagram toggles.
- `.github/workflows/probability-tree-browser.yml`: dedicated automated test/build and Playwright acceptance.
- Before merging PR #51: `npm test`, `npm run build`, dedicated Probability Studio browser acceptance and relevant full-project export/browser regression checks should pass. Known preexisting mixed-maths browser failure (formula restoration) must be handled separately, not attributed to the new studio.

## Next pass

**Pass 5** audits all 16 pathways, first and later mathematical stages, Tools & Tutorials, reduced-advice mode, figures, labels, mobile usability, saved work, downloads and misleading/duplicated recommendations.
