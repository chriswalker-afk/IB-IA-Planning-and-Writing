# IA Pathfinder — Interactive prototype

IA Pathfinder is a calm, responsive thinking-and-writing companion for IB Mathematics Internal Assessments. This first prototype explores the agreed **Hybrid Pathfinder** direction: focused guidance in the main workspace, with a growing mathematical journey available on demand.

## Try it

Once GitHub Pages has deployed this repository, open:

**https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/**

If the link is not live yet, check [Actions](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/actions) or [Settings → Pages](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/settings/pages). This repository includes a Pages deployment workflow; GitHub may require repository Pages settings to be enabled by the owner.

To run it locally, open \`index.html\` in a browser or serve the repository directory with a small local HTTP server. There is no build process and no dependency installation.

## What this prototype explores

- **Home:** welcoming start/resume screen, focused actions and an explanation of the two IA phases.
- **Guided Planning:** short questions, optional help, investigation type and data decisions, feasibility and mathematical direction. Decisions can be revisited.
- **IA Studio:** writing notes for introduction, real data/methods, actual mathematical work, contextual interpretation, subsequent maths, conclusion and final self-review.
- **A real mathematical cycle:** purpose → *planned or actual* work → result → interpretation → optional logical next question. No fixed number of steps.
- **Contextual suggestions:** example branches for linear, curved, unclear and unexpected scatter patterns, plus theoretical mathematical work.
- **Evolving journey map:** students see what they chose and which mathematical steps are plans versus actual recorded results.
- **Contextual writing prompts:** surface when relevant, with "Write a note", "Already covered" and "Not relevant" controls.
- **Responsive experience:** desktop journey sidebar; tablet quick tabs; mobile four-item bottom navigation and single-column task cards.
- **Local work and portability:** browser-local save, a JSON project backup/import and a printable working-record report.
- **Five illustrative demo scenarios** to review without entering a full project.

## Important limits

This is a **prototype of the student experience**, not a complete implementation of the \`IA Pathfinder — Flowchart Draft.xlsx\` decision engine. The workbook contains 24 sheets and considerably more rules and branches, including permissions and teacher check-ins, course-specific mathematics, references, final communication and precise contextual writing guidance.

Sample results are fictional and explicitly labelled as illustrations. The site **does not** create mathematical answers, validate a student's data, import or export Word documents, grade the IA, communicate with teachers, or sync between devices. Its printable report is only a working record; use the JSON file for reliable restoration.

Work is saved **only in the current browser**. Clearing browser storage or switching devices will lose local progress unless a backup has been exported. Do not use this prototype for sensitive student information or restricted personal data.

## Suggested review route

1. Open the homepage on a desktop and a phone. Can a student tell how to start?
2. Try Planning with **statistics** and then revisit **theoretical exploration**. Is the guidance brief enough?
3. From Home, choose **Explore a sample**. Try curved, unclear and unexpected patterns.
4. In IA Studio, check the distinction between **Only planned so far** and **I've completed some mathematics**.
5. Test recording a result, interpreting it, and choosing a follow-up mathematical question.
6. Open **My path** and revisit a previous stage; use optional Writing moments only when relevant.
7. Reload, export a JSON backup, and restore it. Check mobile layout and accessibility.

## Design intention

The user owns the mathematical thinking. Pathfinder prompts questions at the right moment, respects uncertainty, recalls prior decisions such as measurement accuracy, and supports an IA that develops logically from genuine findings. It should feel rewarding without imposing scores, streaks, compulsory mathematics, or grade predictions.

Source design: \`IA_Pathfinder_Responsive_UX_Spec_v1.md\` (maintained separately) and \`IA Pathfinder — Flowchart Draft.xlsx\`. The latter remains the authoritative decision-logic reference for future implementation.

**Implementation:** static HTML + CSS + vanilla JavaScript; no application framework or analytics.
