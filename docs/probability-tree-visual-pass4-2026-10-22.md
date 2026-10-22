# Probability Tree Studio — Pass 4: visual quality, ordering and IA exports (22 October 2026)

## What changes for students

The flexible probability-tree editor now responds to the *actual* content of the figure instead of squeezing every label into the same fixed box.

1. **Readable annotations:** Outcome labels use mathematically aware word-wrapping. Long plain text can occupy multiple lines, while LaTeX expressions remain complete and are typeset by the same mathematical renderer used elsewhere on the site. Label-box widths adapt up to a bounded limit and the figure widens or gains vertical spacing when necessary; no outcome wording is silently omitted.
2. **More reliable layout:** Stage columns respond to the widest annotations; root and child junctions remain aligned with descendants, and extra top clearance prevents long labels covering the headings. Short labels retain the familiar compact appearance.
3. **Reorder outcomes:** Move up/down swaps two outcomes **and all their dependent branches** in one operation. Their entered probabilities, terminal status, selected event paths, and label offsets move with them. Outcomes are not reweighted, normalised, or changed mathematically.
4. **Fine-tune labels:** Each outcome has a collapsed horizontal/vertical adjustment. Offsets are bounded (x: −48 to 48 SVG pixels, y: −28 to 8), and are stored against active history-path IDs so they survive a JSON backup and reorder/removal. Student-adjusted placement is explicitly flagged for visual review.
5. **Colour or monochrome:** Choose coloured event-path highlighting or monochrome printing with distinct dashed/dotted terminal paths. A small mathematical key identifies the selected event, conditioning event and intersection where relevant. The key can be hidden.
6. **Enlarge to actual figure width:** The detailed preview uses the SVG's true width for wide or deep trees, while Fit continues to show the whole diagram without introducing site-level horizontal overflow.
7. **Print-ready guidance:** The editor—not the SVG—flags dense trees, long labels, manual nudges, and small estimated text when placed at approximately 17 cm wide. The advice encourages landscape or vector output, and a focused secondary explanatory tree where suitable. This is a readability estimate, not an automatic validation of the modelling assumptions.
8. **Safe PNG export:** Small diagrams retain 2× raster resolution. Large trees use an adaptive cap of 8,192 pixels per side and 24 million pixels overall to reduce canvas-memory failures. SVG remains unlimited vector artwork and is recommended for complex IA figures.

## Mathematical safeguards

No modelling probabilities, dependency assumptions, source evidence or exact outcome names are fabricated. The renderer does not change conditional branch values or path probabilities. Saving still requires every active split to sum to one, the same source-provenance checks, and meaningful terminal paths.

Original binary-mode diagrams are preserved unchanged except for new optional default fields when normalised. Flexible saved figures remain editable with their new print style and offsets. Existing figure handover, stage linkage, project backup, reporting and SVG/PNG export are retained.

## Verification

- **Unit tests**: long labels, mathematical notation, stage clearance, 32-path figures, print-colour/monochrome semantics, legend bounds, manual offsets, subtree reorder (including dormant branches), event calculations, JSON persistence, and adaptive raster sizing.
- **Browser acceptance**: original and flexible trees on 1440px desktop and 390px mobile; label wrapping, a long-label screenshot, monochrome event legend, reorder/restore, zoom to true native width, save/link, SVG and PNG downloads.
- **Central validation**: full `npm test` and production build; report-export and other impacted feature browser workflows on the pull request.

## Limits and deliberate decisions

A 32-path tree can still be difficult to read on a single portrait IA page even if all labels fit in the SVG; the studio does not falsely suggest that mathematical or typographic completeness guarantees a good final figure. For complex investigations, a full labelled tree plus one small focused explanatory diagram may be clearer than reducing all text to tiny font sizes. No separate CAD-like connector editing or automatic multi-page PDF pagination is added in this pass.
