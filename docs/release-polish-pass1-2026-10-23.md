# Release polish — Pass 1: shared design system

23 October 2026 · branch `release-polish-pass1-design-system`

## Goal and scope
Make the existing Planning, IA Studio, Checking, support systems and seven mathematical diagram studios look like one product without altering mathematical logic, saved work, content guidance or flow state. This is a **foundation pass**; a full navigation redesign and individual studio layout rework belong to later passes.

## Audit findings
- The application already has shared `.btn`, `.field` and `.task-shell` primitives. Styling diverges when specialist routes override button heights, font sizes, border radii and form states.
- 32 source stylesheets (before this pass) are minified into a single production stylesheet. Their established cascade order is essential to responsive charts, help pop-ins and mathematical tools.
- Planning/IA Studio/Checking and seven tools share action types but have local visual implementations.
- Recovery (amber), writing support (purple), and assessment (green) must remain distinguishable; polish their geometry, **not** merge their meaning or contents.
- Most mathematical figure panels should keep their authored arrangements and input grids, which are not interchangeable with long-answer student fields.

## Implemented
1. Defined semantic, centrally named tokens in `styles.css`: spacing, typography, reading width, card/control/dialog geometry, borders, focus/validation, elevation and motion, plus colour aliases for the three advice families.
2. Added `data/release-design-system.css` as a final, explicit shared-component layer. It standardises card surfaces, heading rhythm, primary/secondary actions, field styling, focus rings, tool action bars, dialog close hit areas, responsive text-entry font sizes and reduced motion. Selectors are deliberately restricted so specialist mathematical diagram, probability branch and table-grid editors retain their controls.
3. Integrated the extra stylesheet into the **existing** static-hosted source and minified production pipeline without rewriting or inlining original CSS.
4. Added regression tests that guard source load order, required tokens, protected advice palettes, responsive/reduced-motion rules and untouched project roots.

## Acceptance and safety
- Source `index.html` loads 33 source CSS links; the release layer is **last**. The production build is still required to emit one `site.css`.
- The seven studio CSS sources, Idea Lab animations, Writer’s Field Guide, Criteria pop-ins, amber recovery help, sample reader, and existing routes remain in place.
- No mutations to `src/`, `app.js`, assessment-cohort configuration or project state. No data migration needed.
- Run `npm test` and `npm run build` in GitHub CI and inspect representative desktop (1440px), tablet (768px), phone (390px and 320px) visuals; check dialog focus and all seven tool inputs. In particular assess the final-layer specificity against existing small-screen rules.
- Outstanding end-to-end conformance failures in [issue #65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65) are independent release blockers; the visual layer does not claim to repair them.

## Next pass
Pass 2 should harmonise page structure, Back/Continue placement and Discovery Trail navigation in Planning, IA Studio and Checking. Pass 3 then harmonises help and terminology, Pass 4 studio interaction flows, Pass 5 accessibility and responsive QA, Pass 6 release verification.
