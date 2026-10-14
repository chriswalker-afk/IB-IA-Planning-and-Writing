# IA Pathfinder — Phase 1 migration and coverage audit

**Source:** 24-tab live Google Sheet `IA Pathfinder — Flowchart Draft`, captured 14 October 2026. Stored in GitHub as a versioned, read-only snapshot. The student-facing site is still the Phase 0 prototype.

## Source coverage

| Item | Count |
|---|---:|
| catalog-entry | 950 |
| report-section | 25 |
| handover-field | 87 |
| flow-node | 84 |
| flow-route | 284 |
| **Indexed records** | **1430** |
| Source tabs fully represented as cell values | 24 |

| Current runtime status | Count |
|---|---:|
| not-implemented | 1373 |
| prototype-partial | 57 |

The source contains **84 unique nodes**, **284 route connections**, and 24 source tabs. Node editorial statuses are **41 agreed, 42 working drafts, 1 needs discussion**. These editorial statuses are *not* the website implementation status. Every indexed source item has a unique reference and row number, including cases where an ID repeats in a different catalogue.

## Files and definitions

- [Detailed coverage register](coverage.csv) has one row per indexed source record, with exact source ID, tab/row, runtime status, responsible future phase and partial prototype mapping.
- [Sheet manifest](../data/catalog/index.json) identifies all 24 preserved tabs, captures row counts, and points to source snapshots.
- [Compact record index](../data/catalog/records.json) lists record IDs for application indexing.
- Three `data/catalog/audit-part-*.json` files contain full content for indexed rows, retaining their cells and source references.
- `data/sheets/*.json` preserves **all nonempty source cells**, including editorial preambles, explanations, rules, annotations and diagrams' associated text.
- `data/flow/nodes.json` and `data/flow/routes.json` normalize the flowchart's two explicit tables.

These are faithful cell-value captures, not a clone of spreadsheet formatting, embedded drawings, shape connectors, formulas or comments. Diagram geometry remains in the original Sheet; website runtime logic must be driven by the normalized tables and reviewed rule definitions.

## Status definitions

- `sourceCaptured: true` = accessible in the repository as text, **not** implemented.
- `prototype-partial` = an illustrative on-screen analogue exists but does not necessarily follow the Google Sheet's complete rules.
- `not-implemented` = browser behaviour not yet verified.
- `Agreed`, `Working draft` and `Needs discussion` remain distinct editorial statuses in the source.
- Original route-condition prose is not executable; must be mapped to explicit, tested predicates before activation.

## Outstanding implementation work

1. **Phase 2 Planning:** replace ten generic screens with reviewed N-node graph, joins (especially primary+secondary), student-entered values, course-specific multi-select mathematics, teacher checkpoints and genuine feasibility questions.
2. **Phase 3 Handover:** versioned PDF/Word working report and controlled reimport/merge of data; a JSON backup does not make arbitrary documents reimportable.
3. **Phase 4 Completing:** convert C-node flow to meaningful stage navigation without a fixed number of maths sections; support real results, true interpretations and changing investigations.
4. **Phase 5 Guidance:** rule-based triggers and suppression ledgers for relevant writing moments, accuracy memory, PMCC decisions, limitations and explanations of new mathematics. Never show limits for unperformed techniques.
5. **Phase 6 Quality:** teacher-draft policy, final A–E checks and end-to-end accessibility scenarios.

## Definition of done for an individual requirement

Before changing `runtimeStatus` to `implemented`, an item must have a verified source reference, an explicit predicate (or documented unconditional display), a state/field mapping, a view, and at least one passing end-to-end or unit test. Tests must include negative cases where irrelevant advice stays hidden. Changes to draft guidance require a deliberate editorial review. The source snapshot is frozen until intentionally regenerated from the original Sheet.

No feature counts as implemented merely because its source text is in `data/`.
