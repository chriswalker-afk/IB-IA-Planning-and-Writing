# Maths Workshop — Batch 6: financial modelling

25 October 2026

## Scope and learning goals

Batch 6 adds **34 finance glossary definitions** and **six Show me → Help me → My turn lessons** to the existing read-only Maths Workshop, bringing it to **190 definitions and 35 lessons**. Each lesson has a complete fictional worked example, **two guided checkpoints**, independent practice with revealable reasoning, accessible mathematical formula labels, technology shortcuts and focused IA writing guidance.

| Lesson | Main mathematical decision | Optional tools |
| --- | --- | --- |
| Compound growth and quoted rates | Distinguish nominal annual versus effective annual rates; convert only a defined nominal rate to periodic growth; compare the same rate convention | Google Sheets, Graph plotter |
| Level-payment loans | Derive the end-of-period repayment and balance recurrence; distinguish interest from principal and check total repayment and final balance | Google Sheets repayment tutorial, Table Studio |
| Break-even and feasible profit | Separate revenue from variable and fixed costs; solve contribution threshold; respect integer sales and capacity | Graph plotter, Google Sheets |
| Cash-flow and liquidity | Build a dated running cash balance; explain payment timing and liquidity versus accounting profit | Table Studio, Google Sheets |
| Discounted present value and NPV | Treat time-zero flows correctly, discount future receipts by their specific period, justify the discount rate | Google Sheets NPV tutorial, Table Studio |
| Financial sensitivity and thresholds | Use one-at-a-time and combined scenarios, then solve a decision threshold and test feasibility | Graph plotter, Google Sheets |

The finance pathway now surfaces all six lessons alongside earlier exponential and modelling guidance. Only **explicitly selected** finance technique identifiers map directly to specific Workshop guides; an “other” method or student prose is never reclassified by keyword matching.

## Important mathematical cautions

- Every monetary amount is invented for teaching. The lessons provide **no real interest offers, financial products, or personal financial recommendations**.
- A rate must be matched to its period and quotation convention. “APR”, nominal annual rate and effective annual rate are not interchangeable without knowing the underlying terms.
- The loan recurrence assumes interest is applied before each **end-of-period** repayment. Real fees, variable rates, dates, early repayment and rounding policies can change the result. A spreadsheet PMT() check is not a substitute for deriving the balance model.
- A positive break-even solution may be impossible when **capacity** or demand is insufficient, and negative contribution cannot overcome positive fixed costs.
- Positive modelled profit does not mean cash is available **on time**. Cash flow, profitability and discounted value answer different questions.
- **Time-zero cash flows are not discounted**. In Google Sheets, NPV() treats its first supplied cash flow as occurring at the end of period one; add the initial amount separately.
- Sensitivity scenarios need justified assumptions and should include combined changes when relevant. They are not confidence intervals or predictions of what will occur.
- Financial content is not a requirement or automatic endorsement for any IB Mathematics AI SL, AA SL or AA HL student. Check course suitability; clarity and correct reasoning matter more than unnecessary complexity.

## Connected tutorials and interface

Two new curated **Google Sheets tutorials** cover a reusable financial scenario model and a checkable loan repayment/amortisation table, with direct links to Google’s current official PMT, IPMT, PPMT, NPV and general formula documentation (checked 25 October 2026). Lessons link to these guides and to the existing graph/table creators rather than duplicating editors.

All definitions with formulas and all new lessons have curated spoken MathJax notation. Practice figures are **read-only and never imported into actual IA evidence, student answers, progress, source records or teacher approvals**. Reduce Advice and contextual availability continue to be handled by the shared Workshop system.

## Validation

Automated tests cover loan recurrences, payment totals and rounding, future value and effective rates, profit thresholds and feasibility, running cash flow, correctly timed NPV, scenario interactions, method navigation, glossary/resource identities, accessible formula registry, guided checkpoints and unchanged authored project state. Phone and desktop acceptance paths exercise the finance filters, practice navigation, creator links and layout.

## Roadmap: Batch 7 — proof and iteration

Next implement conjectures, counterexamples and explanatory proofs, sequences and recurrence relations, numerical iteration, convergence and appropriate error checks. Focus on students learning **why** a mathematical claim holds or when a numerical procedure is trustworthy, not simply producing a table of repeated values. Batch 7 should complete the remaining **proof** and **iteration** investigative pathways.
