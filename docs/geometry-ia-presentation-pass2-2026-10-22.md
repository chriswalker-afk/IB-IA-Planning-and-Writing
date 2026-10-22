# Geometry & Measurement Studio: IA presentation Pass 2 (22 October 2026)

Pass 2 extends the existing polygon and mathematical journey, rather than creating a separate diagram tool or introducing unverified claims about measurements.

## What students can now do

1. Choose between **adjacent side labels** and **dimension lines** with extension strokes and inward-pointing arrowheads. The dimension-line distance can be adjusted.
2. Set length measurements as decimal places (0–5) or significant figures (1–5), and angles as decimal places (0–3). Rounding affects text presentation only; area, perimeter, heights and constraints retain full numerical precision.
3. Add one, two or three arcs to labelled ordinary or reflex angles. Verified 90° angles receive a square marker rather than an ordinary arc. Polygon reversal preserves the correct reflex interior.
4. Nudge point, side and angle labels independently on both axes, by up to 90 SVG pixels, without changing the underlying coordinates. The offset editors stay collapsed.
5. Create **up to ten independent labelled construction points**, then add **up to twelve** solid segments, dashed segments, perpendicular heights or north-reference rays. Existing polygon points can also serve as endpoints. Extra points may be edited numerically or moved by pointer and arrow keys.
6. Build a perpendicular height by selecting the start point and the baseline endpoints. Its foot is projected mathematically. The exported SVG shows a right-angle square and extends the baseline with a dashed segment when the foot lies outside the selected edge.
7. Optionally display calculated auxiliary lengths in coordinate mode, using the selected precision. In schematic mode the tool does **not** fabricate a measurement; the student can instead enter a justified label.
8. Save and restore editable annotations through JSON project backup. Source credit, display precision and construction references are included in the project report, and the SVG/PNG export contains the clean geometry only.

## Data integrity

Auxiliary points and guides are stored separately as `auxPoints` and `guides`; neither changes the polygon boundary, its signed area, calculated perimeter, orthogonal decomposition or existing constraints. Annotation references must resolve to a polygon vertex or independent point. An auxiliary point referenced by a guide cannot be deleted until that guide is deleted or redirected. North references require coordinate mode with x-east/y-north confirmed, and calculation of auxiliary lengths requires coordinate mode.

Old saved figures have their existing polygon data retained; normalization supplies default presentation settings and empty annotation collections. Arrays are capped, text is length-restricted, coordinates are checked for finiteness, and SVG labels pass through the shared mathematical text renderer rather than raw HTML.

**Mathematical caution:** coordinate-derived values depend on students' chosen coordinate model, not the accuracy of a physical survey. The short schematic *Not to scale* line is still preserved. Projection of a height is a geometric construction and not independent empirical evidence of a right angle.

## Acceptance scope

- New `tests/geometry-ia-pass2.test.js` checks precision, dimensional arrows, marked/reflex/reversed angles, geometric projection, external baseline extensions, bounded annotations, arbitrary text escaping, JSON restoration and report capture.
- Existing geometry and cross-site tests remain valid and run through the central validation job.
- `scripts/geometry-advanced-browser.py` checks real dimension/precision/auxiliary/height controls in the desktop and narrow-screen journeys, then continues with saved figures, Image Tracer handover, PDF and stage linking.
- Figure output remains SVG and high-resolution PNG. The construction settings stay optional to avoid overwhelming students who only want a labelled triangle.

## Future scope

A completely free-form CAD system, curved conics, circle/arc constructions, automatically optimised collision avoidance for every possible label configuration, and mathematically constrained dragged points are outside this pass. Students can adjust individual labels if automatic positioning collides with their mathematical content.
