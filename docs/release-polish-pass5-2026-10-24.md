# Release polish — Pass 5: responsive and accessibility audit

24 October 2026 · branch `release-polish-pass5-responsive-accessibility`

## Scope

Audit keyboard and mobile access across Home, Planning, IA Studio, Checking, My path, the shared navigation, contextual help and the seven mathematical figure tools. Preserve existing site flow, student data, mathematical algorithms, examples, exports, and assessment frameworks. The goal is a student-usable release, **not** an unsupported claim of WCAG certification or full assistive-technology coverage.

## Main findings and fixes

| Area | Evidence from source | Improvement |
|---|---|---|
| Keyboard entry | Repeated top navigation before main content, no skip link | A visible-on-focus **Skip to main content** link, first in the document tab order, focusses the actual `<main>` landmark; the landmark is labelled and accepts programmatic focus |
| Dynamic pages | Route changes replace main HTML; keyboard focus can be lost on a stage-transition redraw | Announce only a changed Planning/IA Studio/Checking screen in a dedicated polite, atomic live region. If focus was inside the replaced main page and its screen actually changes, move focus to the main landmark. Ordinary live field/diagram preview refreshes do not steal input focus |
| Hidden file controls | Eight CSS visually-hidden file inputs used behind visible upload actions still remained Tab stops | Exclude all eight from sequential keyboard navigation with `tabindex="-1"`, leave programmatic file-picker actions unchanged, label the two previously unlabelled project/report imports |
| Screen-reader navigation icons | Several static SVG icons were visually decorative but not explicitly aria-hidden | Hide static decorative icons from assistive technology, retaining readable button text and intentional accessible labels |
| Small screens and zoom | Many controls written at 37–40px; phone bottom navigation fixed, specialised tools must not be forcibly clipped | Increase phone nav and header controls to practical touch targets, add 320–400px and tablet reflow rules, leave mathematics canvases scrollable, preserve space above fixed bottom nav and within tall drawer overlays |
| Focus and contrast | Form focus outlines exist in some features but are inconsistent; Windows forced-colors and reduced motion need global coverage | Shared `:focus-visible` ring, 44px dialog/toolbar controls, forced-colours states for current navigation, CSS-reduced motion, and explicit reduced-motion-aware JavaScript scroll behaviour |
| Test coverage | Prior suites test particular tools/flows, not the initial skip link, drawer focus cycle or five viewport widths together | New Playwright test for 320, 390, 768, 1024, 1440px, keyboard-only skip/navigation/drawer, focus restoration, horizontal reflow, current-page indicators, reduced motion and screenshots |

## Code boundaries

- `index.html` adds the skip link, dynamic screen announcer and a named main landmark. Hidden upload inputs are still controlled by the same import actions and retain the same accepted formats.
- `app.js` adds *presentation-only* focus and screen-change logic, plus a `matchMedia` preference for smooth scrolling. The current route, mathematical stage, saved figures and student fields remain under the same data/state authorities.
- `data/release-accessibility.css` adds a final scoped responsive/focus/high-contrast layer after the prior 36 styles. The build still emits **one** minified `site.css` from 37 ordered sources.
- No new telemetry, server data capture, third-party UI dependencies or changes to student backup content.

## Acceptance

- `tests/release-accessibility.test.js` checks markup, focus policies, hidden import controls, CSS and workflow.
- `scripts/release-accessibility-browser.py` checks actual Chromium rendering and keyboard flow at five widths, and a reduced-motion emulation.
- `.github/workflows/release-accessibility-browser.yml` runs built-site Playwright QA on relevant pull requests and pushes and uploads screenshots.
- Existing `npm test` and `npm run build` must pass, as must focused Planning, Checking, writer help, tool journey, sample and figure-generator browser workflows.
- Browser QA is a strong regression screen, not a formal third-party accessibility audit. Manual testing with VoiceOver, TalkBack and a real mobile device remains part of final Pass 6 release verification.

## Known separate release gate

The broad conformance browser suite had a pre-existing test locator ambiguity involving two identical `data-action="export-json"` buttons in the export drawer. This is tracked by [issue #65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65). Do not claim all CI is green until this separate export-browser issue is fixed. Pass 6 should confirm end-to-end restore/export, old saved projects, screen reader devices and the actual Pages deployment.
