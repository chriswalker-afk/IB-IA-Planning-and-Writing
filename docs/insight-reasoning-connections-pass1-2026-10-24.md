# Insight Threads — Pass 1 canonical reasoning connections (24 October 2026)

## Purpose
Make existing mathematical reasoning reusable without adding a second record of student work. The canonical IA Studio mathematical entry remains authoritative. A Spark is a derived, read-only view; following it opens the original entry. A plan, proposed next question, or limitation note is never promoted into proven mathematics.

## Source-to-recall inventory

| Student-owned source | Derived insight | Appropriate recall |
| --- | --- | --- |
| Planning aim and motivation | Aim / motivation | Introduction, first mathematics, interpretation, conclusion |
| Planning source, sampling and precision | Planned evidence / sampling / accuracy | Data setup, explicitly distinguished from collected evidence |
| Actual sourceRecords and accuracyDecisions | Source / precision | Mathematical stage only when explicitly linked by sourceRefs / accuracyRefs |
| entry.result and entry.localTakeaway / interpretation | Discovery, with a structured record of interpretation, limitation and next question | Current result, linked next step, conclusion |
| entry.purpose, bridge, methodChangeReason | Method reasoning | Before presenting the current stage; particularly useful after the linked predecessor result |
| entry.limitations | Student limitation note | Interpretation of that exact mathematical stage; not treated as a confirmed limitation |
| completion.confirmedLimitations | Confirmed-by-student limitation plus consequence | Full shelf and conclusion; original location retained |
| entry.nextQuestion / nextWhy | Possible direction (planned) | Immediately before deciding the next mathematical question, tied to the chosen preceding entry |
| entry.knowledgeNotes / mathsInsight | Mathematical learning | Existing course-scope and reflection pathways |

## Invariants
- No state-version change, new localStorage key or duplicate writing ledger.
- Only status=completed with a nonempty result produces Discovery or Direction insights.
- A method reason or limitation note attached to a draft is labelled planned.
- A direction remains planned even when its preceding result is completed.
- No inference of result values from an aim, suggested outcome, or diagram.
- Actual source and precision echoes require explicit links; unrelated mathematical stages do not inherit them.
- All links use canonical IDs/indexes, and full values remain accessible in View all.
- Existing downstream review flags and changes to earlier mathematical work are left intact.
- The presentation avoids completing an IA paragraph for the student.

## Follow-up boundaries
Pass 2: technique- and result-specific interpretation assistance.
Pass 3: richer decision/reason threads for subsequent mathematics.
Pass 4: mathematical accuracy, model diagnostics and course-scope advice.
Pass 5: in-field bubble placement and Toolkit polish.
Pass 6: end-to-end student pathway and accessibility testing.

## Tests
`tests/spark-shelf.test.js` checks read-only derivation, planned vs completed truthfulness, exact stage and predecessor relevance, continued source/accuracy isolation, and original editing/navigation alongside prior tests.
