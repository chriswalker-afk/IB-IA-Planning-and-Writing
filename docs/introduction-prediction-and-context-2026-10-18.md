# Introduction prediction and specialist context pass — 18 October 2026

## What was already present

Planning already records a **tentative prediction or conjecture** in `planning.fields.prediction` and its **reason** in `planning.fields.predictionWhy` on node N01P. A single original prediction spark is built from those fields, and actual results can be compared with the earlier expectation. Neither a prediction nor its reasoning is mathematical evidence.

The previous Introduction screen showed only the aim and motivation as sparks to write about. A tucked-away optional disclosure showed the prediction, but it did not prompt students to write it and refine the same original spark there.

## Updated C10 introduction

1. Prominently prompt: **Aim**, **genuine motivation**, and an **optional initial prediction or hope**. The first two belong in the written Introduction. An honest prediction/conjecture or what the student hopes to investigate (and why) is welcome where useful, not a required scientific hypothesis.
2. Explain exactly **where** each piece goes: write the explanation in the student's real Word/Docs IA and separately update the original Planning spark in Pathfinder. Two clearly-labelled fields in C10 edit the existing `planning.fields.prediction` and `planning.fields.predictionWhy`; do not create another copy or pretend an IA has been written.
3. Show a live 'Spark saved' or 'To consider' indicator while editing; the status refers only to the Pathfinder note, **never to completed IA writing**. The full spark shelf remains limited to two featured sparks and links to the same C10 editor for the prediction, rather than exposing a second competing editor.
4. Add the prediction *and its reason* to the existing spark's returned text, along with context-specific advice when interpreting results and a reminder during the C34B interpretation and C60 conclusion stages.
5. Clarify that editing the optional prediction from C10 must not reset otherwise completed Planning. The established stage review mechanism can still flag affected completed IA sections for review; normal Planning edits outside this specific case retain the existing semantics.

## Specialist terminology: visibly promoted

The writing principle **'Define specialist terms briefly — then return to the maths'** is now one of the four always-present essential Introduction writing tips rather than buried in the extra disclosure. It explicitly says that non-mathematical specialist terms need only a brief explanation to give a superficial understanding; extended science, economics or sports context should not displace the mathematics. This remains consistent with the specialist-vocabulary example and the reduced-advice view.

## Guardrails

- A prediction may be missing. Students may say what they hope to discover instead of inventing a prediction.
- Do not reward confirming a prior expectation or imply that the final answer is already known.
- Changes save into the canonical Planning fields and the mirrored project context. No student prose is automatically inserted into an IA.
- Existing project records are preserved on load, export and import.
- No new marking checkboxes, scores, or forced progress steps.

## Validation

Unit tests assert the three introduction prompts, four prominent tips, the canonical prediction/rationale spark and read-only views, the Planning-versus-C10 edit semantics, and the absence of duplicate prediction editors. The phone/desktop Playwright onboarding flow tests saving both fields, rendering explanatory advice and survival across reload. Existing build and general UI regression checks remain in CI.
