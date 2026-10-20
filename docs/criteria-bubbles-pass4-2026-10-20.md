# Pass 4: Criterion-bubble experience, quality assurance and assessment cohort protection
Date: 20 October 2026

## Intent
Complete the criterion-bubble improvement programme without changing a student's mathematics or falsely creating assessment marks. The current five-criterion A–E system remains the default for existing projects. The revised assessment first assessed May 2029 has four criteria and **must not inherit A–E bubble labels or self-marks**.

## Unified bubbles
- In **Planning**, **IA Studio**, and **Checking**, a single circular criterion control now opens the same accessible contextual pop-in. Students see why the criterion matters at the selected step, good practice, what to avoid, their own previously recorded **unverified** evidence where relevant, and a link to read the full rubric.
- The five bubbles in Checking now use shared pop-ins rather than bypassing contextual advice. The underlying Checklist and saved draft/final records are untouched. Administrative checks remain visibly separate from awarded marks.
- The existing Pass 3 optional "Other ways to demonstrate Criterion C/D/E" stays folded away; no extra writing fields are introduced.
- The mobile UI uses larger 44px touch targets, comfortable mathematical guidance text, clearer Checking questions and adjustable dialog layouts.

## First assessment 2029: safe cohort architecture
- A **reversible, explicit** assessment-cohort choice is added to Planning's course and mathematics page. Earlier projects and projects without a value stay on the **current (first assessment through 2028)** scheme.
- Choosing **first assessment 2029 onwards** displays the IB-published criteria **A Problem specification /4**, **B Abstraction /6**, **C Computation /4**, **D Interpretation /6** with their publicly announced strands. The sources are the official International Baccalaureate Mathematics AA and AI curriculum update pages (2026). Both SL and HL use these four criteria.
- Existing current-cohort A–E bubbles and the legacy A–E self-mark worksheet are not shown while revised mode is selected. The old review records are preserved unchanged, not converted into new criterion values.
- The 2029 view is clearly labelled a **published overview, not full achievement-level descriptors**. It does not invent marking bands or assume 2019-format rules remain unchanged. Consult the full official guide and teacher for current course-specific submission requirements.
- The student's Planning, mathematical work, diagrams, downloads and draft records remain intact when changing cohort.
- The 2029 Checking screen continues useful non-scored document and process checks while omitting the legacy five-criterion evidence checks from the visible workflow and progress count.

Sources: 
- https://www.ibo.org/university-admission/latest-curriculum-updates/dp-mathematics-analysis-and-approaches-updates/
- https://ibo.org/university-admission/latest-curriculum-updates/dp-mathematics-applications-and-interpretation-updates/

## Scenario testing
- Current-cohort A–E read-only help, correct rubric navigation and focus restoration in Planning, Writing and Checking.
- Full representative statistical (PMCC), fitted-model and proof journeys through initial method choice, later mathematical evidence and conclusion, at 1440px and 360px.
- Explicit 2029 cohort selection, accurate A–D overview, hidden old A–E controls, no fake self-assessment, and safe reversible switching with old notes retained.
- Keyboard Enter/Escape, reasonable mobile targets, no horizontal overflow, no mutation when guidance opens, and planned-result safeguards.
- Unit tests cover state normalization and preservation, current versus revised criteria, Checking badges and full official-criteria mapping.

## Appropriate next task
A teacher-facing acceptance review in a real school environment: check updated subject guides when issued and verify which class cohort is first assessed in 2029, look at the longest Writing/Checking pop-ins on physical phones, and have several students follow an actual IA. The full 2029 rubric wording must only be implemented once it is available and confirmed from the IB; **do not translate legacy personal engagement directly into 2029 computation**.
