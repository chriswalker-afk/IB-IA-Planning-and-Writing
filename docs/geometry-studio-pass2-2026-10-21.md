# Pass 2 — Geometry & Measurement Studio

Status: implementation and browser verification in PR #49. Do not merge before
the relevant browser checks have finished. This is the first geometry creator,
not the more advanced composite/constraint editor reserved for Pass 3.

## First working version

- Native IA Pathfinder creator in Tools & Tutorials and the C31 shared representation workspace.
- Provisional route-aware suggestions in triangulation and modelling shapes
  from images; optional context-specific links in the expanded Planning route
  detail for triangulation, image modelling and physical optimisation.
- Triangles, rectangles and editable polygon templates (3–8 points), with
  coordinate editing and direct point dragging/keyboard nudge.
- Separate **schematic** diagrams (no claims of scale or automatically
  measured side length/angle) and **coordinate** diagrams (calculated Euclidean
  lengths, interior angles and area from student-entered coordinates).
- Optional bearings clockwise from grid north only after confirming x-east /
  y-north orientation. Editable point labels, side annotations, vertex-angle
  annotations, figure title, unit and source/limitations notes.
- Existing shared mathematical notation UI for figure units, including
  manual LaTeX syntax in labels and annotations.
- Local editable saved figures and stage links, on-page preview, hide/restore,
  change-review safeguard for linked results, full-project figure metadata,
  SVG and 2x PNG download, and return to the originating mathematical stage.
- Student-facing guidance never asserts that a diagram validates a proof,
  that a schematic is to scale, or that derived results are measurements.

## Validation

Unit tests cover non-crossing polygons, invalid vertices, nonconfirmed north
orientation, Pythagorean triangle calculations and report/backup round trips.
The shared creator browser test was updated for six active creators, with the
new creator included in desktop/mobile navigation and origin-return checks.

Existing separate site-wide failures for MathJax-backed report download and
mixed-mathematics Planning field visibility predate this change; they are not
success criteria for the new geometrical calculations, but remain important
follow-up work.

## Pass 3 / refinements

- Composite shapes and curve/arc constructions.
- Constrained dimensions, parallel/perpendicular/right-angle construction,
  precision/sensitivity and measurement uncertainty support.
- One-way, transparent coordinate import from Image Tracer, with calibration
  and provenance explicitly retained.
- Broader geometry-specific visual QA, including challenging notational
  labels, touch gestures and PNG/SVG text rendering on mobile.

Do not mark Geometry Studio as a result-producing mathematics stage. A saved
figure is a student-authored representation; the mathematics and interpretation
remain the student's responsibility.
