# Idea Lab: Pass 1 mathematical-content audit
23 October 2026. Editorial crosswalk; the live student UI is intentionally unchanged.

## Problem and objective

The old chain (Hobbies → Sport → Football) progressively narrows the
*activity* before helping a student recognise any useful mathematics. The
proposed chain is Hobbies → Sport → Find the best (optimisation). Then the
student sees various sport-related investigations and selects an authentic
personal context if one appeals.

Mathematical routes must be offers, not prescribed IA topics or guarantees
about depth, marks or approved syllabus methods.

## Findings in the existing repository

- src/ideas/catalog.js: 12 broad topics, four activity-tagged starting
  prompts each, 48 prompts total. Examples include football, instruments
  and cooling. These are often useful ideas but do not represent distinct
  *mathematical* ways to explore a broad interest.
- src/planning/investigative-routes.js: a maintained library of 16
  investigative routes in four families. It already carries first steps,
  actual-result contingencies, assumptions, warnings and the AI SL/AA SL
  technique references. Do not invent a second independent course taxonomy.
- src/ideas/mindmap.js: three evidence roots, with nine practical branches.
  They currently jump straight to a narrow seed; they should instead
  converge on the same mathematical route vocabulary as interests.
- The existing map does not promote proof-heavy number-pattern ideas as an
  easy IA starting choice. Retain that distinction.
- A correlation, plotted curve, proof attempt or stationary point alone
  does not create a meaningful IA; recommendations must define why the
  mathematics matters, what a student could try and what would count as
  a defensible mathematical claim.

## New content foundation

Two data files were added without connecting them to the visible map yet:

1. src/ideas/math-pathways.js defines 16 student-friendly mathematical
   lenses, mapped one-to-one to the maintained routes. It also maps all
   nine data-first evidence branches to several of the same lenses and
   provides course-aware but non-prescriptive review notes.
2. src/ideas/math-direction-cards.js holds 60 curated contextual invitations,
   five for each broad topic. Every card has the lens route ID, title,
   possible question, genuine first mathematics, mathematical development,
   required evidence, personalisation, caution, optional contexts,
   appropriate review warning and a legacy seed reference where relevant.

Every one of the 48 existing ideas has exactly one provenance link. Twelve
new invitations fill mathematical coverage gaps. No earlier student draft
is deleted, no previously saved aim is changed and no UI options have yet
been migrated.

## Topic audit

| Broad topic | Five mathematical routes | Evidence / limitations |
| --- | --- | --- |
| Nature and wildlife | Calibrated shape modelling; iteration; comparing groups; growth; two-variable relationships | Photos, defined growth measures, safe records; no causality claims |
| Sport and performance | Variation; trajectories; probability; optimisation; relationships | Defined performance measures, feasible positions and calibrated images |
| Music and sound | Ratios/relationships; proof of rhythm alignment; cycles; function models; optimisation | Specified frequencies and beats; specialist theory needs review |
| Art, architecture and design | Image models; optimisation; proof of a design rule; trigonometric measurement; Voronoi | Scale drawings, model constraints and real-world qualifications |
| Games and puzzles | Probability; trajectories; optimisation of small strategies; iteration; invariants/proof | Explicit rules and small cases; simulations do not prove optimality |
| Food and cooking | Optimising containers; growth/decay; similarity and scaling; fitting a packaging model; group comparisons | Safe, non-sensitive measurements; avoid unsafe experiments |
| Travel and transport | Reliability/variation; route optimisation; waiting probability; comparing journeys; nearest-site geometry | Safe trip records, meaningful time/cost/straight-line distinctions |
| Environment and weather | Cycles; triangulation; optimisation of a resource decision; variation; relationships | Dated sourced records; no unqualified climate or causal claims |
| Technology and media | Data relationships; animated movement; storage models; generalising patterns; numerical iteration | Valid digital units and explainable mathematics rather than unexplained code |
| Money and business | Subscription cost functions; constrained optimisation; conditional pricing; sensitivity of a budget model; compound growth | Hypothetical or published terms, not private accounts |
| School and daily activities | Queuing variability; categorical comparisons; space optimisation; discrete scheduling; Voronoi | Permission, anonymity, constrained hypothetical or verified layouts |
| Mathematical patterns (teacher-gated) | Proof of sequences; geometric proof; counterexample; model a growing count; numerical iteration | Precise statements and justified general arguments; consider EE suitability |

Repeated lenses within one topic are allowed when the actual questions differ:
for example, comparing two conditional money offers and finding a
subscription break-even are both financial decisions, not duplicate titles.
The new content is an *invitation to investigate*, not 60 prescribed IAs.

## Data-first audit: same routes, different starting evidence

| Existing evidence choice | Suggested mathematics |
| --- | --- |
| Measure / time something | Variation, growth, fitting models, cycles |
| Measure / shape | Image-based geometry, triangulation, optimisation, function models |
| Measure / change | Growth, paired-variable relationships, functions, cycles |
| Record / compare | Comparing groups, variation, relationships, categorical proportions |
| Record / survey | Categorical comparisons, group comparisons, relationships |
| Record / repeated outcomes | Variation, probability, group comparison |
| Find / weather | Cycles, variation, relationships, fitted models |
| Find / published figures | Financial decisions, groups, relationships, fitted models |
| Find / photo or video | Calibrated image geometry, trajectories, trigonometry, functions |

A student who can take photographs need not immediately choose
football, architecture or leaves. They should first consider *what
mathematical question calibrated visual information can answer*, then
personalise the context. Photo permissions, camera perspective, scales,
timestamps and data provenance are checked before claims are made.

## Worked progression: sport

Old: Hobby → Sport → Badminton → a handful of narrow seeds.

New: Hobby → Sport → Find the best → a question such as “Where should a
player or object be positioned to optimise a clearly defined geometric
quantity?” The suggestion then asks students to:

1. Sketch a playing area with defensible dimensions.
2. Define the variable, the relevant angle/distance and feasible domain.
3. Build a valid function and examine possible extrema and endpoints.
4. Explain what the model ignores and whether a geometrically optimal
   position is practically useful.
5. Personalise the sport and question. Badminton, football and swimming
   are examples, not required nodes.

Selecting “Check consistency” would instead require comparable repeated
performance records, distributions and interpretation of variation.
Both lead to real mathematics, but neither chooses the student's aim for them.

## Curriculum and safeguarding audit

**AI SL:** The existing reference library supports candidate statistical
and modelling first steps. Voronoi has AI SL reference entries; it is
still not guaranteed suitable for every question. Proof- or convergence-
heavy ideas should be teacher-reviewed.

**AA SL:** The existing references offer candidate calculus, function,
trigonometric and statistical starts. Voronoi and other specialist
methods are not silently claimed as AA SL methods. Where the student's
aim asks for something beyond the course, ask a teacher before committing.

**AA HL:** The current route list does not provide a separate,
validated AA HL technique mapping. Do not silently inherit AA SL
recommendations and label them HL-level or sufficient for HL. Teacher
review is needed for the proposed mathematics and scope.

**General:** No route automatically selects a syllabus method, predicts
data, declares causation, proves an optimum, awards marks or guarantees
approval. Measurement, timing and filming need safe practice and
appropriate permission. Surveys need school permission, consent, privacy
and a realistic understanding of selection bias. Secondary data needs
source definitions, units and dates. Abstract patterns remain teacher-
gated, with the EE distinction explained.

## Pass 2 implementation acceptance criteria (NOT included in Pass 1)

- Keep the organic floating map and stable hit targets.
- Replace activity-specific third-tier nodes with the student-friendly
  mathematical lenses. Keep technical names as subtitles.
- Show the applicable cards for topic + lens, retaining several possible
  personal contexts and the student's ability to decline all of them.
- In data-first mode, show the shared route lenses after the evidence
  choice; context examples can appear optionally, never as a gate.
- Keep the student able to explore another lens without losing saved
  ideas or existing Planning answers.
- Migrate saved old third-tier values *reversibly*: never silently
  interpret “Football” as “Optimisation”.
- Verify readable bubble spacing, keyboard focus, mobile behaviour,
  reduced motion, accessibility and branching navigation.

## Pass 3 integration acceptance criteria (NOT included in Pass 1)

- Offer an optional, editable provisional route insight at the
  existing Planning maths-choice step.
- Connect evidence cautions and candidate first steps contextually,
  without filling the student's answers automatically.
- Let actual mathematical results, not a suggested initial lens,
  determine the subsequent writing journey.
- Keep teacher/course guidance appropriate, concise and optional
  when it should be hidden by reduced-advice settings.

## Automated checks

tests/idea-math-pathways.test.js covers: 12 topics, 60 invitations,
48/48 legacy seed links, all 16 maintained mathematical routes, all
9 evidence-led branches, cross-topic consistency, and course cautions.
Existing Idea Lab and planning tests must still pass because the
current live map and saved-state format have not changed.
