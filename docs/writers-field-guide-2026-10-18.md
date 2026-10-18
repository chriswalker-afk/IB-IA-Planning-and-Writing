# Writer's Field Guide — Set up and contextual writing, 18 October 2026

## Editorial purpose

The earlier `Write, check, revise` tile at Studio node C00 is replaced by a compact **Key advice to read before you start writing** entrance. The optional Writer's Field Guide develops the student's own mathematical writing rather than generating prose for their IA. Planning-first advice, the actual-document reminder, quick-fill Planning sparks, the primary introduction button, the existing IB criteria access, and the provenance of all student work remain unchanged.

## Content

The guide presents **six essentials** (not a lab report; first person; explaining thought processes; genuine uncertainty and imperfect explorations; writing for a course-familiar peer; building an interesting mathematical story) and **eight additional tips** (why each new step follows; contextual interpretation; assumptions and method limitations; separating predictions and findings; purposeful mathematics; graphs that earn their space; sources, accuracy and technology; selective editing).

Lessons are placed in three visually consistent families: **Your voice**, **Your maths**, and **Your reader**. Each is an accessible disclosure with an explanation, invented weak/strong comparison, and a short practical reminder about when the idea matters. Three have optional thoughtful questions. Comparing styles reveals an explanation only after the stronger example is selected. The short, five-step mathematical thread (Question → Choice → Result → Meaning → Next) is explicitly a possible way to organise ideas, not a compulsory template.

Examples are fictional teaching illustrations, never student-owned evidence or text inserted in an IA. The advice encourages genuine mathematical reflection, not the invention of setbacks or claims; avoids reducing sampling and practical limitations to generic 'human error'; and asks for enough mathematics to follow and check reasoning even when routine syllabus techniques need no lengthy explanation.

## Behaviour and integration

- C00 exposes a compact teaser, with a large accessible guide drawer when requested; the user can dismiss it and continue writing immediately.
- The drawer supports filtering by family, native expandable advice cards, comparison buttons and a selectable mathematical story.
- The guide is accessible again from the Help drawer and the Studio stage overview.
- Relevant nodes display a small, contextual Field Guide link into a particular lesson, separate from the student's **sparks** and from the already implemented contextual writing cue or official IB criterion help.
- The existing *Reduce advice* setting suppresses in-task contextual links but the guide remains available on demand.
- Opening, filtering or reading the guide does not change course, aim, planning progress, student writing, mathematical records, achievement or rubric scores.
- Touch/keyboard interaction uses native buttons/disclosures. Styles have responsive mobile rules and reduced-motion support.

## Verification

New unit tests cover all 14 tips, three families, rendered interactions, criteria route and stage mapping. The UI smoke test checks the introductory replacement and context-aware reopening without altering student records. The existing Playwright chapter-onboarding acceptance suite is extended to exercise the drawer, a before-and-after example, filtering, story interactions, an optional challenge, exit and contextual deep link at **390 px and 1360 px**. This also checks horizontal overflow and preserved local progress.
