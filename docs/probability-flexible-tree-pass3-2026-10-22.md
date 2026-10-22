# Probability Tree Studio — Pass 3: flexible branching and IA layout

## Student journey
The existing two-stage and three-stage binary editors remain intact for already-saved work. The new starting-layout choices are:

- **Two-stage binary** and **three-stage binary** (new, initially blank probabilities)
- **Three-way outcomes** (three root outcomes, each followed by a two-way split)
- **Different branch lengths** (one early-ending outcome, three alternatives on another branch)
- **Start from two outcomes** (both initially terminal, extend only the paths worth exploring)

Students can instead select **Keep this tree and unlock flexible branching** to convert their existing binary tree **without losing labels or probabilities**. They can create 2–5 outcomes at each active split, add new splits to individual terminal outcomes, and end a continuing branch early. A maximum of four possible stages and 32 terminal paths keeps the visual manageable.

For all active conditional splits, each entered probability must be valid (decimal, fraction or percentage), and the values must sum to 1. New probabilities are **never invented**, redistributed, automatically normalised or inferred as independent. Zero-probability paths and undefined conditional events receive the existing mathematical safeguards.

## Mathematical representation
The flexible data model keeps the original `branches` mapping (history key → array of outcome objects); keys use digits 0–4. The new `terminalNodes` array identifies paths deliberately ending before the stage ceiling. Dormant descendant splits remain in the saved editable draft when a path is temporarily ended; they do not contribute to its current probability calculations. Leaf-event selections refer to **active terminal paths** only. A removed sibling deletes its own subtree and explicitly reindexes any surviving descendants and matching event selections; the editor asks for confirmation beforehand.

A branch can terminate at an earlier stage without invalidating its probability contribution. Complete path probabilities multiply the conditional branch values along that path, and event, intersection and conditional probabilities sum the appropriate terminal paths.

Legacy drafts lacking `treeMode` remain in `standard` mode. No migration destructively reshapes saved binary trees. New values are capped and normalised on project restoration; the event selection validator rejects nonexistent or inactive leaf references.

## IA diagram rendering
Flexible trees use an ordered, leaf-based layout with each active parent centred over its descendants, so asymmetric splits do not force rows or phantom children. Branch tails turn horizontal before their destination. Two clear label lines sit **above** that horizontal tail inside a white zone, away from the lines they annotate: outcome label above conditional probability. Full SVG and PNG exports preserve editable figure titles, optional stage headings/captions, source provenance in the project report, and optional products and event calculations. Compact and spacious arrangements are available.

This is deliberately an IA presentation tool rather than a system that invents statistical evidence. Students must justify independence if used, specify source and assumptions, and consider how probabilities were estimated.

## Regression expectations
- Historical two-/three-stage binary maths, linked figures, saved JSON and SVG remain unchanged.
- Variable-arity splits, early terminals, downstream branch reindexing, and conditional event calculations are checked mathematically.
- Layout tests check that the probability label rectangles finish above their own horizontal branch lines.
- Desktop/touch browser checks exercise a custom asymmetric tree, editing outcomes, invalid sums, event selections, SVG export, saved figure linking and reopening.
- Main validation and the dedicated Probability Studio browser suite are the merge gates. Unrelated browser suites provide additional regression coverage.
