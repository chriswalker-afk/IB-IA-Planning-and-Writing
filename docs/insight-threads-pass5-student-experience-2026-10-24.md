# Insight Threads — Pass 5: student-facing experience
24 October 2026

## Purpose
Make Sparks, Insight Threads and their mathematical guidance *usable at the moment of writing* without additional forms, artificial progress scores, duplicate records, or a wall of generic advice. The student-owned investigation remains the source of truth.

## What changes
### 1. Immediate, specific recall
- The two featured, saved Sparks now each display a concise **why it matters here** prompt without opening a second page.
- The prompt is selected by the *current writing moment and the type of original record*. It never infers a new result from text.
- A proposed mathematical move, predicted outcome, provisional source, or planned precision decision remains visibly provisional. Review flags are visible and take priority over "On this screen".
- For the conclusion, a specifically student-selected, review-free mathematical finding is recalled before an unrelated latest finding. A stale selected result is not silently replaced with a different result.

### 2. Writing is primary
- In Guided mode the **relevant context → actual writing task → supplementary writing advice → optional examples** sequence replaces a long general-advice introduction.
- Every task has small, immediately accessible **Writing tips** (purple) and **I am stuck** (amber) buttons, using existing handlers, with the existing field-specific advice and green criteria bubbles left intact.
- Reduced mode remains task-first with no new buttons, full-surface advice or example cards; the saved Sparks stay accessible on demand.
- First-mathematics C20 keeps the actual aim, proposed first move and source immediately visible. Technique options, broader Planning hints and the full Spark library are combined into one optional **More from my Planning choices** disclosure, while important mismatches remain visible.
- Showing mathematics C30 no longer repeats the same aim, prediction and precision in four additional summary cards; its two selected Sparks, existing result anchors and mathematical-stage prompts supply that context.

### 3. Toolkit as retrieval rather than an arbitrary shortlist
- On My Path the complete original Spark collection appears exactly once, grouped by **question/intentions**, **data/sources/accuracy**, **discoveries/learning**, **methods/next questions**, and **reflections/limitations**.
- Each category is a native disclosure with a count; cards return to the original field or mathematical stage. Full Toolkit access no longer hides everything except the most recent ten items.
- Home retains a bounded, five-card preview and the established link to My Path. It does not duplicate pinned records to fill space.
- A card distinguishes recorded from provisional material and shows real linked-stage counts where available.

### 4. One mathematical-reading aid
- The existing interpretation and validity guidance for a saved mathematical Discovery Spark remains available, but shares one visual reading block instead of two competing cards and a generic third reminder.
- A formula, model-fit metric or selected technique still does not verify data, justify extrapolation or create an IA paragraph.

### 5. Mobile and accessibility
- Consistent 44 px touch targets for task help, visible keyboard focus, native details/summary disclosure semantics and reduced-motion support.
- A long **View all sparks** panel stays within a bounded, vertically scrollable area on phones instead of growing indefinitely.
- The Toolkit stacks readable full-width cards on phones without a sideways page-scrolling strip.
- Existing desktop/phone smoke tests are extended to check immediate Spark cues, expandable early-maths options, full grouped Toolkit and overflow.

## Safety and persistence
- No new saved state fields or migrations.
- No duplicate editable Spark fields, automatic IA prose or fabricated calculations.
- Previously saved source, accuracy and mathematical entry links are unchanged.
- Unperformed and review-needed results are not presented as established mathematics.

## Validation
Unit coverage: \`tests/insight-experience-pass5.test.js\`, existing Studio writing/Spark/validity tests.
Browser coverage: \`scripts/spark-shelf-browser.py\` and \`scripts/chapter-onboarding-browser.py\`, plus full GitHub Actions matrix.

## Next
Pass 6: end-to-end usability walkthroughs across real mathematical pathways, including weak/inconclusive findings and model restrictions, in both full-guidance and reduced-advice modes.
