# Release polish — Pass 2: navigation and page hierarchy

23 October 2026 · branch `release-polish-pass2-navigation-hierarchy`

## Goal
Students should know **where they are**, **which part of their IA they are working on**, **how to return to a chapter or stage**, and **where to inspect the whole journey** without reading competing progress indicators.

## Implemented

### One location header
- `src/ui/workspace-navigation.js` provides a consistent compact location bar across Planning, IA Studio and Checking. It uses the existing `JOURNEY_GROUPS/currentGroup` model, not a second progress model.
- Planning labels its actual Planning chapter and currently selected group; the existing contextual, right-side Discovery Trail stays intact.
- IA Studio shows the current writing chapter, or an **IA Studio overview** label on its overview/welcome screen. The existing five-chapter ribbon remains only on focused writing pages.
- Checking shows Chapter 5, its current phase (teacher draft, feedback or final check) and the same five-chapter ribbon.
- Every working page has the same `Full path` action, linking to the existing **My Path** view. It does not claim that entering a chapter has completed it.
- Existing contextual onboarding and Writing advice controls stay in their actual workspace; nothing has moved into an unrelated popup.

### Navigation parity
- Tablet navigation now includes **Checking** rather than only Home, Planning, IA Studio and My Path.
- Sidebar, tablet and mobile primary navigation now expose `aria-current="page"` only on their currently active destination, with the existing active visual state.
- The sidebar's numeric My Path pill is hidden when zero and described as **mathematical work records, including planned ones** when nonzero. It is not represented as an IA progress score.

### Consistent actions and hierarchy
- New `data/workspace-navigation.css` places current location and utility controls in a predictable order across screen sizes, preserves the title hierarchy below, and standardises separation of **Back** and task continuation actions without changing the underlying route transitions.
- The existing Planning route graph, writing history and stage branch controls, Checking modes, and diagram-tool return mechanisms are untouched.
- The new source stylesheet is included last, after the Pass 1 shared design layer, in the one-bundle production pipeline.

## Safety boundaries
- No project schema, save logic, mathematics, sample data, A–E/2029 criteria, help rules or route graph altered.
- The Discovery Trail remains the only chapter-progress model. Recording a route visit, an empty figure, or a planned mathematical stage never becomes a completion claim.
- Original `data-action` and `data-nav` handlers remain active; the common heading uses the existing global My Path navigation.
- Source CSS links rise from **33 to 34**; the build still publishes exactly **one `site.css`**. Tests protect that ordering.

## Checks
- `tests/release-workspace-navigation.test.js` checks chapter identity and honest overview labels, route integration, tablet Checking parity, keyboard navigation semantics, full-path actions, escaping and responsive CSS.
- Existing release design and production CSS-order tests updated to recognise the extra stylesheet.
- PR acceptance must include `npm test` and `npm run build`, then desktop/tablet/phone checks of Planning welcome/normal task/finish, Writing introduction/first and later mathematical stages/studio overview, Checking draft/feedback/final, Discovery Trail links, a diagram-tool return, sample preview and old restored projects.
- Known broad browser conformance failures remain tracked in [#65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65) and must not be silently considered fixed by this pass.

## Next
Pass 3: contextual guidance presentation, terminology and content consistency. Keep the three distinct help families and preserve the reduce-advice boundary.
