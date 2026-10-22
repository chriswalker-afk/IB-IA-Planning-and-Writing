# Geometry & Measurement Studio — Pass 3 working implementation

This branch extends the six existing diagram tools; it does **not** introduce a
new compulsory writing step. The student creates/refines a construction, saves
an editable figure and chooses whether it supports the current IA stage.

## Included in this Pass 3 batch

### Composite geometry
- New L-shaped (six vertex) and T-shaped (eight vertex) polygon templates.
- Exact axis-aligned rectangular decomposition of a *simple orthogonal
  polygon* into disjoint strips. The pieces' calculated area sum is displayed
  alongside the independent shoelace area. No area is claimed for invalid
  polygons, and general arbitrary-angle polygons are not presented as
  rectangular composites.
- SVG drawing of each individual rectangle with its own calculated area.
- Normal student-editable coordinate/annotation fields remain available.

### Constructions with conditions
- Per-edge horizontal/vertical requirements and per-vertex right-angle
  requirements. These are **checked** against actual coordinates; they cannot
  silently certify a wrong diagram.
- Explicit "Align next point" and "Construct perpendicular side" actions
  change the adjacent point. The action checks for a locked endpoint.
- Locking a vertex prevents coordinate typing and drag/keyboard movement.
  A marked right angle must be an interior 90° corner, never a reflex 270°.
- An edited figure still requires the existing student-owned Save or Use
  action; it cannot automatically mark the IA mathematics complete.

### Measurement choices
- Local finite perturbation: change one coordinate by ± a student-selected
  shift while leaving every other coordinate fixed, and compare valid
  neighbouring polygons' area and perimeter.
- This is explicitly *not* a bound for simultaneous errors, a statistical
  confidence interval, an instrument's resolution or a measurement accuracy
  claim. The report retains both the method and scope of this comparison.

### Image Tracer handover
- One-way coordinate import from a working or saved Image Tracer outline,
  provided its existing calibration/quality checks pass, the image is
  front-on and the outline has 3–8 ordered points and a closed boundary.
- The original tracing and its embedded raster photograph are never
  overwritten or duplicated. The new geometry project has its own editable
  coordinates and a compact source record (saved tracer ID, title, image,
  original pixel points, reference length, pixel scale, source and notes).
- Subsequent changes to the original image, calibration or polygon do not
  automatically replace a student's already-linked geometry figure.
- Full-project figure export includes provenance, composite area working,
  constraint requirements and any local sensitivity result.

## User journey / discoverability

1. Image Tracer suggests "Continue in Geometry Studio" only when its
   completed outline supports a valid coordinate handover.
2. Geometry Studio offers "Transfer a calibrated outline" with current and
   saved tracing choices without losing existing saved geometrical figures.
3. Planning and first/later writing pathway suggestions still use the
   existing shared registry; composite shapes have not been given a new,
   duplicate tool entry.
4. All existing figure linking, stage-return behaviour, SVG/PNG downloads,
   JSON backup and report-generation pathways continue to operate.

## Remaining refinements / limits to validate

- Browser regression across desktop, narrow-screen and native touch.
- Verify that math labels are legible with many constrained segments.
- Curved boundaries/arcs, construction by fixed-distance radii, and fully
  constrained draggable polygons are **not** implemented in this batch.
- If the original image has oblique perspective or its tracing has more than
  eight points, the import is declined with a reason. The student must
  re-photograph appropriately or simplify the source outline, not silently
  truncate points.
- A local sensitivity experiment cannot be presented as a full error
  propagation model. A more rigorous uncertainty method would require a
  new explicit mathematical specification and evidence of input accuracy.

PR #50 contains the implementation; merging should depend on satisfactory CI
and browser checks. Existing unrelated browser failures are tracked separately.
