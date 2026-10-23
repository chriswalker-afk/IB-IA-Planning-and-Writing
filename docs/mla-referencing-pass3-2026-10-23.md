# Referencing in Checking — Pass 3 (23 October 2026)

## Purpose
One MLA method, one tutorial and **one existing student review system**. This pass refines D09 (source integrity) and D12 (authenticity) within the Checking page rather than creating another list of tasks or a separate bibliography database.

## What students see
- A quiet **Check references in both directions** callout in the teacher-draft and final modes, with an anchor to D09 and a direct link to the MLA tutorial added in Pass 1.
- An expanded **D09 source-by-source audit** inside the original review detail:
  1. Scan the actual IA for external datasets, pictures, quotations, paraphrases and new mathematical methods.
  2. For every in-text MLA citation, verify its corresponding Works Cited entry and the original material.
  3. For every Works Cited entry, check there is actual cited use in the IA; remove unused Google Docs saved sources.
  4. Review any page-number placeholders, source/figure credits and regenerated Google Docs bibliography after editing.
- A small read-only **Pathfinder notes to trace** section. It only surfaces saved external-source notes, *completed* stages using researched methods, and externally sourced **linked saved** diagrams, and does not claim these items appear in the actual IA or cover all sources.
- An expanded **D12 authenticity audit** in both the teacher draft and final check. It asks about the student's independent mathematical explanations, permitted support, AI output acknowledgement under school/IB rules, participant permissions and data privacy.
- The old separate "process not marks" labelling is preserved for both the A–E and 2029 assessment cohorts, and the referencing guide is available in both advice modes.

## Data integrity
- Existing `completion.review.records` provide the **only** audit evidence. D09 and D12 now require a brief student-written note before they can be marked checked. A location alone is insufficient for these two checks.
- D12 is deliberately revisited in **final** as well as **draft**. Its pre-existing draft record is not copied or automatically validated. Source sheet retains historical "Before teacher draft" wording; the final check is a website-level reinforcement.
- D12 cannot newly be marked "not applicable" because original authorship always applies. Existing restored legacy records, including older sample self-reviews, are left untouched.
- Editing a checked review note reopens that existing check as needs-work, using the existing `reviewEditChanged` behaviour. Statuses survive backup and restore without being inferred from text or figures.
- Pathfinder cannot read the student's actual Google Docs/Word/PDF file, verify a publisher, or generate/supply MLA citations automatically. A saved source hint is never treated as source verification.

## Tested
- New unit cases for two-way tracing, absent source data, local backup round trips, review status and guardrails, 2029 process badges, Reduce advice and untrusted source text escaping.
- Desktop/phone browser acceptance in the existing focused conformance workflow. Checks the guide navigation, evidence requirement, independent draft/final status and authorship review.

## Not part of Pass 3
The remaining Pass 4 concerns the illustrative IAs: their attribution should be checked case by case, never completed using invented publications or fictitious data citations.
