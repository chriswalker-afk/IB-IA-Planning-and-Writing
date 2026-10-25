# Maths Workshop — Batch 7: proof, sequences and iteration

25 October 2026

## Final content batch: what was delivered

**Batch 7 adds 40 carefully scoped definitions and seven complete Show me → Help me → My turn lessons**, reaching **230 definitions and 42 lessons** in the Maths Workshop. It also adds **two curated Tutorials** (a conjecture/proof investigation guide using Desmos, and a reproducible numerical iteration table in Google Sheets), reaching **36 tutorials** in Tools & Tutorials. All 16 original investigative pathways now have at least one optional mathematical lesson, including the last two previously empty paths, **Proof** and **Iteration**.

| Pathway | Guided lesson | What a student must distinguish |
| --- | --- | --- |
| Proof | Test conjectures and counterexamples | Finitely many positive checks versus a universally valid proof; counterexamples must belong to the stated domain |
| Proof | Direct algebraic proof | A valid identity and justified logical implication versus an unproven converse |
| Proof | Induction | Base case, explicit P(k) hypothesis and the k-to-k+1 implication versus simply checking examples |
| Iteration | Recurrence, nth term and partial sum | Index conventions; constant difference versus constant ratio; term value versus running total |
| Iteration | Fixed points and convergence | Existence of a fixed point versus convergence to it; exact contraction versus apparently stable rounded values |
| Iteration | Bisection root finding | Continuity and sign-change bracket; retained interval, half-width and certified absolute error |
| Iteration | Newton–Raphson | Correct derivative update and residual; nonzero derivative, starting values, failure to converge and residual versus root error |

Every lesson contains a seven-step invented worked example, **two guided checkpoints with feedback**, independent practice with revealable explanation, **curated accessible typeset equations with spoken equivalents**, efficient technology tips, a connected Tutorial, and contextual IA writing guidance.

## Mathematical assurance

### Conjecture and induction

The optional prime conjecture `n²+n+1` for positive integer `n` is **false at n=4**, producing 21. Students are shown a precise counterexample, and a genuinely justified parity statement. The induction example proves the first `n` positive odd numbers sum to `n²`, with both the initial case and an explicit conditional step. Formal induction is not automatically in the syllabus of every IB Maths course; students are encouraged to check educational suitability with their teacher.

### Sequences

The teaching recurrence `a₁=3, aₙ₊₁=aₙ+4` has explicit term `aₙ=4n−1` and first-`n` sum `n(2n+1)`. Its geometric contrast has first term 2, ratio 3 and nth term `2×3^(n−1)`. Examples explicitly check the first-term indexing.

### Convergence and numerical accuracy

The fixed-point example `xₙ₊₁=(xₙ+2)/3`, starting at `x₀=0`, admits the **exact formula** `xₙ=1−3^(−n)`; its contraction factor of 1/3 gives a proof of convergence to 1. The counterexample `yₙ₊₁=2−yₙ` starting at 0 cycles 0,2,0,2 despite having a fixed point at 1.

For bisection of `x²−2=0` on [1,2], three retained-bracket decisions produce [1.375,1.5]. Its midpoint 1.4375 has absolute error **at most 0.0625** *because a root remains bracketed by a continuous sign-changing function*. This is not inferred from a residual or displayed decimal digits.

For Newton–Raphson, `x₀=1.5` leads to `x₁=17/12` and `x₂=577/408`. The equation residual `f(x₂)=1/166464` is tiny but **not by itself** a guarantee that the distance to a root is that small. The method is undefined at an input with zero derivative, and may fail or converge to an unintended root. Students are explicitly told when bracketing or additional justification is warranted.

## Connections and student safeguards

- The **Proof** pathway now presents three lessons and the new proof definitions; **Iteration** presents four lessons and the iteration definitions. No student's selected method is inferred from their free text: only explicit method IDs are linked.
- Conjecture checking and iteration tables are **illustrative tools**, never automatic evidence, teacher approval, a course recommendation or a proof.
- The two new tools reuse **existing Desmos and Sheets**, with official guidance checked on 25 October 2026. The read-only Workshop remains separate from actual IA student content, progress and exported evidence.
- Lesson navigation keeps the existing optional degree of advice and does not require proof or advanced numerical methods from SL or HL students. The IA purpose should determine appropriate mathematics, not the existence of a guide.
- Show Me → Help Me → My Turn and both instructional/checkpoint modes remain accessible on mobile and desktop, with independent practice deliberately ungated.

## QA and next phase

The Batch 7 test suite verifies canonical uniqueness and 16-pathway coverage, logical counterexamples and algebraic structures, induction identities, sequence indexing and sums, fixed-point contractions and oscillations, bisection brackets and bounds, exact Newton updates and residuals, both tutorials, native representation links, accessible notation and **unchanged student-authored state**. Browser acceptance covers phone proof and desktop iteration alongside the existing site-wide matrix.

**Next after Batch 7: a cross-workshop consistency audit rather than another content batch.** Review completeness and course appropriateness across all 16 pathways, check mathematical examples and accessibility end-to-end, and consider lightweight teacher review of whether students can locate help at the precise point they get stuck. This is the conclusion of the original Batch 0–7 content roadmap.
