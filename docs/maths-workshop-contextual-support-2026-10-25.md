# Maths Workshop in context — Help & Tips and “I am stuck”

25 October 2026

## Purpose

The Maths Workshop is a **mathematical learning library**, not a second writing coach, grading tool or substitute for the existing *I am stuck* recovery guidance. Students should encounter it in three natural ways:

| Entry point | Student sees | How the mathematical focus is chosen |
| --- | --- | --- |
| Top-right **Help & Tips** | The existing full Workshop link, plus a small optional “Maths Workshop” suggestion for the current mathematical stage when a pathway or method has been recorded | The current Planning/Studio node and explicitly chosen investigative route or method, never free-text analysis |
| Small amber **I am stuck** bubble beside a question or writing box | First: the original **one specific action and success check**. After that: an optional related definition and relevant **Show me** guided lesson | Current node, exact `page`/`part:...`/`field:...` help spot, student's chosen problem, and recorded mathematical route/method |
| Main **I am stuck** hub | Current problem triage and the existing recovery action remain primary. An optional contextual Workshop link appears for mathematically relevant stages/problems | Restored original node and exact triggering help spot, selected issue card, chosen investigative route/method; not the generic hub node |

## Box-aware examples

- **Planning → N03P2, Sampling and population**: a sampling-frame or sampling-method problem opens **Sampling** (the definition hub linking population, census, units, frames, sampling methods and bias) and **Sampling fairly and recognising bias** (two-checkpoint guided lesson).
- **Selecting mathematics**: students who have chosen an investigative route see an introductory concept and optional worked lesson for that route. No unchosen path is asserted to be relevant.
- **IA Studio → first/next calculation box** (`field:result`, `part:show`): the relevant calculation concept and a *Show me → Help me → My turn* lesson.
- **IA Studio → interpretation/reflection box** (`field:interpretation`, `part:reflect`): mathematical meaning (such as residuals for a fitted model) rather than merely repeating calculation steps.
- **IA Studio → next-question/next-why box** (`part:next`, `field:nextQuestion`): a concept that helps identify the remaining mathematical gap before choosing another technique.
- **Explicit chosen stage method**, for example PMCC, loan repayments or optimisation, overrides a more general Planning route *for the current mathematical stage*. We do not infer a method from an entry's title, student prose or a topic keyword.
- **Proof and iteration**: appropriate conjecture/proof or recurrence/convergence help, with the existing syllabus warnings retained.

## Design constraints

The bridge provides **at most one named concept and one named guided lesson**. These are learning links, not instructions to carry out a particular calculation, not claims about confirmed findings, and not permission to use outside-syllabus work. The primary *I am stuck* recovery action still comes first.

**Do not offer mathematical instructions** for waiting for permission, unavailable source evidence, unresolved stale results, writing-only introductions, final document checking or teacher feedback. The general Maths Workshop remains browsable from Help & Tips for students who explicitly want it.

The direct Workshop entry point opens exactly the specified **definition** or **lesson**; students can follow related definitions and navigate back. The UI releases the amber dialog before opening the resource drawer, preserving keyboard and focus behaviour. The shared resource-drawer session knows when it came from the central stuck hub so its close action returns students there.

Reading these links, receiving advice and practising fictional examples do **not** mark maths complete, change a selected method, write student results, change IA content or grade a criterion.

## Quality assurance

New tests cover 16 explicit route profiles; the N03P2 Sampling hub without a chosen mathematical route; variation across `field:purpose`, `field:result`, `field:interpretation` and `field:nextQuestion`; explicit method overrides; probability and proof selection; scope and safety guards; the stuck-origin `helpSpot`; direct route/term/lesson navigation and unchanged project state.

Desktop/phone browser journeys cover the top-right Help & Tips, the Planning sampling bubble, central hub sampling issue and return, IA Studio's actual mathematics box, and absence of irrelevant mathematics in Checking.

## Future refinement

Once used in lessons, ask students which connection they expected to see from their precise current task. Tune the **ordering and descriptions** of links based on observed confusion, not on a larger number of suggestions. In particular, consider a one-sentence distinction between easily confused terms such as *stratified vs quota sampling*, *sample unit vs observational unit*, and *small equation residual vs small approximation error*.
