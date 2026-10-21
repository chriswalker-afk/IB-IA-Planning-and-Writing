# Diagram generators — integration foundation (Pass 1)

This pass prepares existing IA Pathfinder generators for additional mathematical
drawing tools. It changes shared metadata and recommendations but **does not**
create Geometry & Measurement Studio or Probability Tree Studio.

## Student discovery map

Use the **same registered creator** through all of these entry points; never
create a parallel editor or a separate unsaved diagram workspace.

| Entry point | Display | Next-pass action |
| --- | --- | --- |
| Tools & Tutorials library and each tutorial's optional creator panel | All active creators; correct back-to-origin navigation | Both new generators appear by registering them after they work |
| Planning welcome / Tools & Tutorials link | Existing compact explanation; no extra compulsory step | Describe the expanded set as optional |
| Planning's expanded 16 mathematical journey cards | Mathematically contextual, provisional choices | Add a discrete optional recommended creator link where relevant |
| Writing welcome | Describe native creators without an outdated fixed list | Keep wording accurate without seven repetitive buttons |
| Introduce first mathematics | Route/method-linked mathematical guidance | Add a discreet generator suggestion only where it helps the first step |
| Show first mathematics (C30, part 2) | Stage-aware featured creators plus all other active tools | Register both creators and extend linked figure previews |
| Show later mathematics (C40/C50, part 2) | Current mathematical method first; previous confirmed result next; planning route is not allowed to override either | Extend recommendations for new generators |
| Main creator workspace (C31) | Shared chooser, switcher, create/refine/use flow | Add the new editor rendering and action handlers |
| Saved figure gallery and project exports | Registry-derived figure store and entry link key | Add preview, save/link, quality checks, SVG/PNG and PDF/Word/ZIP export for each new tool |
| Checking and I am stuck | Existing return-to-work and review flow | Link back to a relevant saved figure when it needs correction; no unsolicited extra creation |

### Sixteen provisional investigative pathways

Existing recommended tools remain conservative until the corresponding new
editor is fully functional. Suggested future priorities:

- Relationships, comparing groups, categorical comparisons, variation: graph,
  statistical diagrams and tables as appropriate.
- Fitted models, growth, cycles: graphs and concise tables.
- Trajectories: coordinate tracing and graphing; geometry when angle/length
  construction is the actual mathematical task.
- Optimisation: geometry only for a geometrically constrained design; graph and
  tables otherwise.
- Modelling from images: tracer first; geometry for dimensioned construction
  or explicit geometric decomposition.
- Triangulation: **Geometry & Measurement Studio** first once implemented,
  with tracing as a secondary aid for scaled photographs.
- Voronoi: existing Voronoi Studio and tracing.
- Financial decisions: table/graph, probability tree only for genuinely
  successive conditional risk events.
- Probability and simulation: **Probability Tree Studio** for successive or
  dependent outcomes; statistical diagrams for observed simulation
  distributions; table for outcomes and expectations.
- Proof: geometry for geometric construction, not to imply diagrams prove a
  general claim.
- Iteration: graph and short calculated-iterate table, with a cobweb extension
  considered as a later Graph Plotter enhancement.

## Implementation contracts

1. Add new creator metadata to `src/diagrams/representation-registry.js`
   **only when** the editor actually works. ID, title, icon, action, categories,
   state store, figure-link key and linked-return reason live here.
2. Add the new creator's functional editor to `src/completing/views.js`, its
   launch/navigation implementation in `app.js` and its new normalized
   saved state to `src/core/project-state.js`.
3. Register preview rendering in `src/completing/first-figure-gallery.js` and
   complete figure/image production plus meaningful raw input and provenance
   details in `src/handover/figure-report.js`. Registry metadata is already
   reused by both.
4. Add the new studio's actions to the shared `diagramNavigators` in
   `app.js`; launch through the existing `resource-creator-open` action.
   Saving a figure should link it to the active mathematical entry, not create
   an additional writing stage or mark a result complete.
5. Add conditional suggestions to `src/diagrams/representation-hub.js`. The
   stage's **selected method** takes priority. A confirmed earlier result can
   justify a question but does not automatically determine a new method.
   Provisional planning route remains useful for the initial exploration.
6. Extend presentation coach checks, notation support and editable
   SVG/PNG exports. Keep real entered measurements versus calculated
   quantities explicit; do not fabricate sources, interpretations or IB grades.
7. Check successful round-tripping through JSON backup and readable full
   project PDF/Word/ZIP. Export only occupied and relevant figure data; saved
   unlinked drafts must remain identifiable as drafts, never as findings.
8. On desktop/mobile, verify that opening, saving, switching, returning and
   editing from Planning, C30, C40, C50, Checking and Tools & Tutorials
   preserves state and respects the origin. Restore the original editor when
   leaving a library-launched creator.

## Remaining passes

- **Pass 2:** Geometry & Measurement Studio core (triangles, bearings, basic
  polygons, labels, numerical vs calculated values and exports), integrated
  end-to-end using these contracts.
- **Pass 3:** Geometry extensions (composite shapes, constraints, optionally
  calculated lengths/angles, and coordinate handover from the tracer).
- **Pass 4:** Probability Tree Studio (editable conditional events, 2–3 stages,
  probability validation and optional path calculations), integrated end-to-end.
- **Pass 5:** Audit all entry points, 16 pathways, link relevance, origin
  navigation, saved figures, mathematical claims, mobile UI and exports.

Do not add buttons for future generators until their actual handlers exist.
