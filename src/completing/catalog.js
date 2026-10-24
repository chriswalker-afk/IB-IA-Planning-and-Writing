/** Source sheet snapshot, never executable instructions. Source row numbers preserved. */
export const C_NODES=Object.freeze([
  {
    "id": "C00",
    "label": "Begin / resume Completing the IA",
    "purpose": "Continue directly from Planning; upload a saved IA Pathfinder planning PDF/Word; or start with empty fields.",
    "notes": "Three choices, no sign-in assumption. Preserve current work when using the direct handover.",
    "status": "Agreed",
    "sourceRow": 36
  },
  {
    "id": "C01",
    "label": "Upload planning document / import",
    "purpose": "Accept a saved IA Pathfinder planning document in PDF or DOCX, and (if supported later) a completion progress snapshot.",
    "notes": "Extract only whitelisted planning fields. Embedded versioned resume data preferred; older/edited/unrecognized files reviewed rather than blindly trusted. No forced upload.",
    "status": "Agreed",
    "sourceRow": 37
  },
  {
    "id": "C02",
    "label": "Review prepopulated project details",
    "purpose": "Review editable carried-forward fields including who could benefit, what decision/recommendation was proposed and why it matters, alongside aim, course, maths, sources, milestones and teacher flags.",
    "notes": "When C02 is opened from Introduction, allow students to edit the shared aim, motivation, beneficiary and prediction; after confirmation return directly to the introduction with the student's written draft intact, showing changes for review rather than rewriting it.",
    "status": "Agreed",
    "sourceRow": 38
  },
  {
    "id": "C03",
    "label": "Check current idea and permissions",
    "purpose": "What has changed since planning? Is the investigation aim still workable? Does any consent/access/teacher discussion remain unresolved?",
    "notes": "Carry teacher flags forward; if access is restricted do not encourage collection/use before permission. Student can still plan, write safe sections and save.",
    "status": "Working draft",
    "sourceRow": 39
  },
  {
    "id": "C04",
    "label": "Where are you in the IA?",
    "purpose": "Flexible IA stage dashboard: Introduction, data/theory, first representation, active mathematics, further exploration, conclusion, teacher draft and final review. Include one visible optional 'I'm stuck' / 'Something isn't working' link (C95) at all stages; preserve the original stage and student work.",
    "notes": "Help is student-invoked, never modal or compulsory. In C95D, offer constructive work before data arrive; C95A tests alternative public/approved data sources; C95L handles partial/unusable data; C95Q directs to existing guidance. Any unresolved issue can be saved. No permission bypass, no fake data.\nWRITING MOMENT: a single contextual, dismissible 'Where should I write this?' action (C96) appears only when stage-relevant actual work creates a new writing need. Resume existing Already covered / Not relevant statuses; never present every cue.",
    "status": "Working draft",
    "sourceRow": 40
  },
  {
    "id": "C10",
    "label": "Introduction · short, personal, revisitable",
    "purpose": "Student-facing opening advice: 'Keep your introduction comfortably under one page; a few short paragraphs (often half a page or less) is usually enough.' Suggest relevant previously entered aim, motivation, personal benefit/beneficiary, tentative prediction and reason, and a brief outline of intended approach; each can be Used, Edited or Skipped. Encourage natural first-person writing with optional examples. The student writes their own introduction.",
    "notes": "Offer one optional Compare Examples action at C10E. Present a small weak-versus-effective introduction pair only if requested; do not force a heading template. Introduction remains short, personal and always editable.\nWRITING MOMENT: opening aim/motivation and optional original prediction may be written now even when data have not arrived. Show current plan details but no invented outcome; keep prose student-authored.",
    "status": "Working draft",
    "sourceRow": 41
  },
  {
    "id": "C20",
    "label": "Data collection · methods, sampling, accuracy",
    "purpose": "Open statistics, modelling or theoretical prompts conditionally. Compare realistic methods and justify the choice, but focus the limitations discussion on mathematical consequences: measurement precision, bias and representativeness, model assumptions, fit, sensitivity or domain. Explain mitigation and the defensible scope of conclusions; define symbols/terms as needed.",
    "notes": "When data are still Pending, allow the student to open C95D and work on introduction, tentative prediction with WHY, definitions, method comparison, or alternative sources. Do not pretend a planned dataset is already available. Collection-stage limitations still depend on ACTUAL collection/method; practical delays are project barriers, not generic written IA criticism.\nWRITING MOMENT: after source/method is confirmed ACTUALLY USED, encourage student to write a concise choice-specific justification WHERE the data are introduced. Candidate source/method remains a private planning note, not completed IA prose.",
    "status": "Working draft",
    "sourceRow": 42
  },
  {
    "id": "C30",
    "label": "First purposeful diagram or brief calculation",
    "purpose": "Guide through C31–C35H: select meaningful first representation/calculation → introduce/define → check presentation → observe actual result → consider accuracy if not covered → reconnect to aim and original prediction → investigate surprises → justify logical next mathematics. Every result should contribute to the investigation's story.",
    "notes": "At this point avoid detailing routine course-level procedures (e.g., how to draw a bar chart). Graphs must be readable on one printed page, correctly scaled/labeled, not repetitive or misleadingly precise. No long data tables anywhere, including appendices. Diagram is optional; PMCC/test/model-specific limitations wait until C40–C50.",
    "status": "Working draft",
    "sourceRow": 43
  },
  {
    "id": "C40",
    "label": "First substantial mathematics",
    "purpose": "First substantial mathematical section STARTS from C35's reasoned next mathematical question, not a disconnected technique. Put a one- or two-sentence bridge after the preceding result explaining why this method follows; define new variables and assumptions before first use. Show ACTUAL maths with equations/appropriate ≈, not routine technique tutorials; interpret the substantive output in C34 with aim/beneficiary/prediction, local takeaway and the next question. Actual PMCC or software output may trigger C35P AFTER interpretation.\nAT METHOD CHOICE: Briefly justify why the actual technique follows from the preceding evidence and is suitable for [aim]. ACCURACY REMINDER: If the new mathematical output uses quantitative inputs with a recorded C24 resolution/source policy, display that policy unobtrusively at calculation setup and again when reporting results; derived values may need a DIFFERENT defensible precision.\nMATHEMATICAL LEARNING: If [actual technique] is within the student's verified course, USE it with correct work, a concise reason for choosing it, and interpretation—NO tutorial or formula derivation. If the student independently learned mathematics beyond the course, show an optional C40L cue BEFORE first use to demonstrate their own understanding, explain the necessary new idea and cite sources. Partly outside: explain only the new component.",
    "notes": "When actual maths starts, use the reasoning from latest C35: clear prior-result reference, specific new question and why this technique helps. After each substantive calculation, route C40→C34 before optional further work/conclusion. PMCC, regression and fit caveats belong with active method results. Avoid explaining maths at or below the course in lengthy prose. Software output must be interpreted.\nAFTER RESULT: Before continuing, return to C34's short aim-linked interpretation; identify one real method-specific weakness only if it changes the conclusion. Reuse previously discussed source precision rather than re-explaining it. Keep extra digits through working, round final results sensibly; exact and approximate signs must remain correct.\nFirst-use mathematics check (course-specific, teacher-confirmed if unsure) is separate from post-result insight. Do not generate copied explanations, reward off-syllabus sophistication automatically, or force routine technique descriptions.",
    "status": "Working draft",
    "sourceRow": 44
  },
  {
    "id": "C50",
    "label": "Further mathematics · reflect as you go",
    "purpose": "FURTHER mathematical section follows the SAME repeatable sequence: previous meaningful result and local takeaway → C35 Next logical mathematical step, with why/current course/method → actual new maths here → C34 observation, interpretation, relevant limitations, aim/prediction, section-level takeaway → C35 again or C60. The number of loops depends on worthwhile unanswered questions, never a quota. Record revisited methods and what changed when evidence challenges the original plan.\nAT EACH FURTHER SECTION: Start from the previous local takeaway, explain WHY the new method advances the aim, and bring forward only relevant C24 accuracy/source decisions for its inputs. After the meaningful result, interpret what it adds to [aim], whether limitations alter its claim, and what mathematical question logically follows.\nAt the start of EACH further substantial technique, recall the verified course status: within syllabus → use without procedural explanation; novel beyond-syllabus → clarify mathematical meaning, relevant step/assumption and own understanding at first use, citing independent sources. After ACTUAL new result, optionally ask whether this led to a genuine NEW MATHEMATICAL INSIGHT, in addition to what the result means for the aim.",
    "notes": "Each new meaningful method section closes locally (what answer it gave, how reliable, what question remains) at C34/C34B before the NEXT C35 decision. Use W26/W27 Writing Moments or Already covered to avoid repeated prompts. Optional targeted choices; don't add a method solely to increase apparent difficulty.\nRECHECK ON CHANGE: If input/source/units or a modelling assumption genuinely changes, review the applicable prior accuracy policy; otherwise respect Already covered and avoid duplicate limitations. Keep accurate working precision; apply a justified final reporting decision for new derived values, not the raw-input decimal count by default.\nLearning reflection must concern an authentic mathematical discovery or independent understanding, not 'I used a calculator' or fabricated personal engagement. Where meaningful, write it BESIDE the relevant mathematical work; don't accumulate general statements for the conclusion.",
    "status": "Working draft",
    "sourceRow": 45
  },
  {
    "id": "C60",
    "label": "Conclusion · synthesis and what next",
    "purpose": "At C60, the conclusion draws together the main mathematical findings into a defensible response to the original aim; revisits the intended beneficiary and meaning; briefly acknowledges only essential scope/boundaries already evaluated; then considers one or two realistic mathematical next steps. Do NOT summarise the whole IA or repeat calculations, figures, method descriptions or detailed limitations.",
    "notes": "Ongoing reflection/evaluation is embedded beside choices and findings throughout C20–C26, C34–C35, C40 and C50. The conclusion is NOT the place to retroactively add a long evaluation. Use C61–C64 with optional links back to the exact earlier work when reflection is missing; no required section template and no invented future work.\nWRITING MOMENT: conclusion ONLY draws together existing evidence, its meaning for beneficiary, appropriate scope and worthwhile FUTURE mathematics. No copied figures, repeated calculations or first-ever generic evaluation.",
    "status": "Working draft",
    "sourceRow": 46
  },
  {
    "id": "C70",
    "label": "Clarity, presentation and referencing",
    "purpose": "Presentation checks include appropriate diagram placement and source, defined variables/units, clearly typeset equations using an editor, consistent mathematical language, '=' for exact equality versus '≈' for justified rounding, and appropriate reporting accuracy. Technology-generated results must be interpreted in the student's own mathematical reasoning. Appendix advice: avoid lengthy raw tables in the main discussion, while allowing necessary, clearly referenced supporting data.\nEDITORIAL PRECISION CHECK: Verify that figures, derived results and model predictions consistently apply the student's earlier C24 decisions (or an explicit justified revision). Check units, meaningful digits, '=' versus '≈' and any causal/scope statements in their ORIGINAL locations; do not create a final accuracy essay.",
    "notes": "C70N is an optional notation/technology checklist. Use only at student request or genuine communication issue, not as a long interruption after every graph. Verify current school requirements for references and formatting; Pathfinder's no-long-tables preference is NOT an IB prohibition.\nWRITING MOMENT: prompt corrections at the ORIGINAL mathematical/figure/citation location. Presentation review is not a new IA paragraph.",
    "status": "Working draft",
    "sourceRow": 47
  },
  {
    "id": "C80",
    "label": "Draft, teacher feedback and revisions",
    "purpose": "Complete teacher draft checkpoint: IA genuinely finished (introduction, relevant data/theoretical setup, substantial course-level mathematics, diagrams and ongoing reflection, conclusion, sources), plus concise A–E self-review and print-readability. Follow one permitted written teacher feedback round, record verbal advice and planned revisions.",
    "notes": "Use C80D to check teacher draft readiness when relevant, then return to teacher-led process. Prompt optional peer or non-mathematician clarity read. Don't imply this tool submits or grades a draft; incomplete students may save progress without declaring readiness.\nWRITING MOMENT: teacher feedback stays as private project notes; student's actual revisions belong alongside the affected calculation, interpretation or diagram, not in a new feedback section.",
    "status": "Working draft",
    "sourceRow": 48
  },
  {
    "id": "C90",
    "label": "Final self-check and readiness",
    "purpose": "Before FINAL submission, ask for evidence across Criteria A–E (A/4 presentation, B/4 communication, C/3 engagement, D/3 ongoing reflection, E/6 relevant understood maths), accuracy, clear source citations, proofread/printed diagram fit, allowed feedback/revisions and current school dates and formatting. Conclusion still synthesises rather than repeats.",
    "notes": "C90F holds the final student-led check; do NOT calculate an IB grade, invent deadlines, demand a fixed IA structure or claim authenticity approval. Distinguish the complete teacher draft review from final review, with one written teacher feedback round.\nFINAL CONSISTENCY: Confirm meaningful results were related to the aim where they appear; consequential assumptions/limitations were justified at actual method use; precision/reporting decisions are consistent with C24 or explained updates. Avoid a final repetitive evaluation section.",
    "status": "Working draft",
    "sourceRow": 49
  },
  {
    "id": "C91",
    "label": "Save a progress snapshot / resume",
    "purpose": "Save/restore introduction, confirmed planning context, data availability (Pending/Partial/Verified), source candidates/fit checks, the student's optional 'I'm stuck' issue and ONE next action, return-stage pointer, active maths and genuine reflections, and latest conclusion draft. No imported prediction automatically becomes a real result.",
    "notes": "The import/save feature is still a design requirement. Preserve unresolved consent/teacher flags and original aim/prediction; Save can occur even with no data, no maths and an unresolved hiccough. Do not claim the IA is completed or that the site will automatically search/monitor sources.\nSave cue ID, relevance basis and CURRENT writing state (noted is NOT written in IA), student's optional own IA location/result reference and re-evaluation flag after substantive context change. PDF/DOCX save/reimport remains specification only.\nSAVE ACCURACY IN CONTEXT: Preserve per-input C24 precision/source decisions, later output-specific derived-accuracy decisions, the student's reference to earlier explanations and any revision flags. Do not infer a reported accuracy was applied to the actual IA merely because this rule was displayed.\nSAVE LEARNING STATE: Preserve course/technique status (with teacher verification or uncertainty), actual independent learning sources, the student's own concept explanation and where it appears, plus any genuine post-result mathematical insight. Planned research is not automatically performed mathematics.",
    "status": "Working draft",
    "sourceRow": 50
  },
  {
    "id": "C21S",
    "label": "Statistics · population and sampling",
    "purpose": "Identify target population, observations/units, sampling frame, plausible sampling methods or a census, nonresponse and representativeness. If using secondary data, examine how it was originally sampled rather than claiming a method not chosen.",
    "notes": "Compare realistic alternatives in context (random/stratified/systematic/opportunity/census etc.). Justify the chosen method against aim, time, access and risks. Sampling methods only when a sample/population exists; not every statistics project is a survey.\nWRITING MOMENT: justify ACTUAL census/sampling choice, procedure and target population at first data description. Volunteer, random, stratified and census methods have different prompts; show only matching example.",
    "status": "Agreed",
    "sourceRow": 52
  },
  {
    "id": "C21M",
    "label": "Modelling · inputs, measurements and testing",
    "purpose": "Identify model inputs, parameters, relevant units, restrictions, assumptions and whether evidence is empirical or theoretical. Compare ways of measuring/estimating inputs and plan a reasonable model check.",
    "notes": "Consider measurement method, accuracy, repeat readings, independence of validation data where feasible, parameter calibration and domain. Sampling also relevant if empirical model uses a sample; no mandatory statistical sampling for a theoretical model.\nWRITING MOMENT: explain chosen measurement/input source at first relevant use; model assumptions before construction; evaluate output/model fit later once mathematics is actually performed.\nPRECISION FOR MODELLING: Track the actual input resolution/source accuracy here, but discuss its mathematical consequence for a derived prediction, derivative or fit only when that calculation/model is genuinely used.",
    "status": "Agreed",
    "sourceRow": 53
  },
  {
    "id": "C21T",
    "label": "Theoretical / other route",
    "purpose": "For no-data or unusual work, identify definitions, assumptions, constraints and a simple case; select a mathematical approach. Avoid irrelevant dataset/sampling prompts.",
    "notes": "Allow teacher review for out-of-scope methods, retain a path to C25 definitions and save; if empirical data are later used the route can be revised.\nWRITING MOMENT: define objects, conditions, constraints and initial mathematical question before theoretical mathematics; no data-collection paragraph for a pure investigation.",
    "status": "Agreed",
    "sourceRow": 54
  },
  {
    "id": "C22",
    "label": "Compare methods → justify choice",
    "purpose": "Record feasible collection/source/measurement options, specific pros and cons for this investigation, and WHY the chosen approach best addresses the aim and intended beneficiary.\nAT THE WRITING MOMENT: When a chosen source/method is genuinely used, justify it beside the first method description with one relevant alternative, explaining how the choice serves the aim; when the chosen method changes, justify that change where it happens.",
    "notes": "Compare collection methods mainly for quality of mathematical evidence, including potential systematic error, variability, sampling bias, relevant assumptions and the inference each can support. Cost/time are planning trade-offs, not mathematical limitations.\nWRITING MOMENT: as actual method is described, prompt a student-owned why-this-method explanation versus one feasible alternative, tied to aim and type of evidence. Avoid generic lists of every method.",
    "status": "Agreed",
    "sourceRow": 55
  },
  {
    "id": "C23",
    "label": "Collection-stage limitations only",
    "purpose": "At C23, show optional examples solely for actual sampling/census, survey, data source, data cleaning and measurement choices. Focus on consequences for data precision, coverage and validity. Do not show PMCC, regression, fitting, derivatives or optimisation weaknesses—even if the student selected those during Planning.",
    "notes": "Stage K of Limitation Examples is a HARD filter: C20-C26 here. After filtering, require confirmed source/method relevance (column L), then show up to 3 on request. Reject/None apply allowed. Mathematical technique limitations are held until C40-C50 when genuinely performed.\nWRITING MOMENT: place a genuinely relevant data-stage mathematical limitation beside the method that causes it, with effect on inference/precision and defensible scope; do not mention PMCC/test/model weaknesses before those methods are active.\nLIMITATION TIMING: Show a data/source limitation only if actually relevant to a current inference or input precision. If it compromises the aim, suggest narrowing or revising it, not declaring the weakness acceptable. Never insert later PMCC/model limitations prematurely.",
    "status": "Agreed",
    "sourceRow": 56
  },
  {
    "id": "C24",
    "label": "Measurement accuracy → reported precision",
    "purpose": "Identify the actual precision/resolution/uncertainty of measured inputs and any limitations inherited from source data. Explain how this constrains the sensible accuracy of subsequent numerical results.\nPERSIST AN ACCURACY BASELINE: For each actual quantitative input, record meaningful symbol, units, measurement/source resolution or stated uncertainty (when justified), provenance, and a defensible approach to working precision versus reported accuracy. Treat resolution and reliability as different; do not invent an error margin.",
    "notes": "At C24, use only measurement/source examples tagged C20-C26 (e.g. stopwatch resolution or capped source data). How uncertainty affects AREA/volume/derivative results is prompted later during that actual mathematics (C40-C50).\nWRITING MOMENT: explain observed/source resolution and justified reporting precision where inputs are first described, and refer back later unless a NEW calculation changes the uncertainty effect.\nREUSE RULE: The C24 baseline follows its quantities to later figures and calculations (C33, C34A, C40, C50, C70). Show a short reminder only when reporting/plotting/deriving a value affected by it. If source, measurement, units or intended use changes, ask the student to review the baseline; previously explained limits need not be rewritten.",
    "status": "Agreed",
    "sourceRow": 57
  },
  {
    "id": "C25",
    "label": "Define terms and name variables meaningfully",
    "purpose": "Define data-collection and non-mathematical specialist terms at first relevant use; use meaningful variable symbols such as h for height, t for time, L for length, with units and clear descriptions.",
    "notes": "Do not default automatically to x and y. If conventional notation is genuinely clearer, define it. Introduce later mathematical/specialist terms immediately before their first later use, not in a long up-front glossary.\nWRITING MOMENT: define meaningful variable symbols/units and field-specific terms immediately BEFORE the first occurrence in written work. Do not add a complete glossary or repeat definitions.",
    "status": "Agreed",
    "sourceRow": 58
  },
  {
    "id": "C26",
    "label": "Data/method record · link back to aim",
    "purpose": "Review what data and mathematical assumptions were actually used, why those choices fit the aim, the limitations that affect numerical accuracy/inference and how the remaining restrictions bound results. Skip generic practical obstacles, define terms and sources and connect to next maths.",
    "notes": "Summarise decisions in the student's own voice. Where it fits in their IA (short introduction passage, separate methods section or contextual explanation) is flexible. Link to next graph/calculation; allow revisiting. Outstanding teacher/permission flags persist, but progress saving is always available.\nWRITING MOMENT: student confirms which of methods/limitations/accuracy they have ACTUALLY WRITTEN in the IA; use 'Already covered' plus their own section reference or 'Not relevant' to suppress repeats.",
    "status": "Agreed",
    "sourceRow": 59
  },
  {
    "id": "C31",
    "label": "Choose a purposeful FIRST move",
    "purpose": "Using the student's aim, beneficiary, expected pattern (if any), route, actual data readiness, initially chosen maths and planned first representation, offer at most 2–3 relevant starting representations or brief calculations (or a small theoretical case). Ask which helps reveal the next useful mathematical step, with Other/None/Not ready.",
    "notes": "Never require a diagram if it adds nothing. Recommendations are possibilities, not automatic figures, calculated answers or proof of a prediction. Show conditional suggestions on request; preserve changed choices and let the student return when data arrive.",
    "status": "Agreed",
    "sourceRow": 60
  },
  {
    "id": "C32",
    "label": "Before it: purpose and definitions",
    "purpose": "Before any diagram or calculation, ask students to introduce it in their own words: what question/feature does it illuminate and why is it useful for the overall aim? Define EVERY symbol, quantity and unit BEFORE first appearance (from C25 if available), and explain unfamiliar specialist terms where first used.",
    "notes": "One or two meaningful introductory sentences can be enough. Do not explain routine course-or-below skills such as HOW to make a bar chart, calculate a mean or plot a scatter diagram; explain choice and relevance, not construction.\nWRITING MOMENT: make 'Write this in your IA NOW—immediately BEFORE this figure or calculation' prominent with aim-linked purpose and any first-use definitions.\nPRECISION BEFORE DISPLAY: If data precision was agreed at C24, show units and an unobtrusive reminder before inserting a relevant graph/calculation; this supports appropriate labels and quantities but is not a new written limitations paragraph.",
    "status": "Agreed",
    "sourceRow": 61
  },
  {
    "id": "C33",
    "label": "Create + presentation check",
    "purpose": "For any diagram/plot, run the full Diagram Checklist: descriptive title/caption, axis labels with variables/units, sensible scales, printable legibility, attractive uncluttered layout, entire figure on a SINGLE printed page, appropriate precision from C24 and source citation. For initial calculation, use concise notation, correct units and justified reported accuracy.\nACCURACY CARRY-FORWARD: Retrieve the exact relevant C24 per-variable/source accuracy policy and units while checking the figure. Inspect labels, tick scale, displayed numerical precision and any visual impression of certainty; keep the graph readable and its data fidelity honest.",
    "notes": "Use a short relevant summary, not extensive raw-data tables in the main text OR appendix. Never repeat figures unless a direct side-by-side comparison genuinely helps; keep comparable axes/scales. If no diagram, skip diagram-only checks; saved output may be a figure reference/notes, not an auto-created image.\nWRITING MOMENT: a diagram-specific quality check improves the FIGURE, not a prose checklist in the IA; skip when working is mathematical without figure.\nDo not force a fixed number of decimals on every axis or apply one universal rule. If data are rounded/aggregated, a polished figure does not add measurement precision. The student only explains a mathematical implication in their IA if it affects interpretation.",
    "status": "Agreed",
    "sourceRow": 62
  },
  {
    "id": "C34",
    "label": "After it: what do you SEE?",
    "purpose": "After EACH genuinely meaningful first figure/calculation or later C40/C50 result, give a short evidence-led interpretation beside the output: WHAT is observed, accuracy/validity if NEW, connection to original aim, prediction and beneficiary, and a short LOCAL TAKEAWAY stating what this mathematical section established (or could not establish). Then C35 chooses whether another question is worth investigating. Routine intermediate algebra needs no mini-conclusion.\nAIM FIRST: After each genuinely meaningful output, show the student's CURRENT aim (and beneficiary when useful) and ask what the ACTUAL result means for that aim. Then show the prior accuracy reminder or one relevant current-method limitation ONLY if it affects interpretation. End with a short local takeaway and next mathematical question.",
    "notes": "Mandatory lightweight reflection for a NEW substantive output, not after routine rearrangements: observed result → novel accuracy/validity where needed → aim/prediction → section takeaway. Return to C35 to select next maths. For a performed PMCC, only NOW consider the technique and its calculated coefficient. Student owns any prose; keep result IDs and writing-cue suppression.\nLightweight default = What does this result actually show about [aim]? Optional follow-up = Is there a meaningful new accuracy/validity consequence? Don't force repeated caveats or prompt after routine intermediate algebra. Record writing status per resultRef.",
    "status": "Agreed",
    "sourceRow": 63
  },
  {
    "id": "C35",
    "label": "Next logical mathematical step · repeat",
    "purpose": "This is an EXPLICIT, REPEATABLE 'NEXT LOGICAL MATHEMATICAL STEP' section after the FIRST meaningful figure/calculation AND after EACH substantive C40/C50 result. From the previous section's actual resultRef and LOCAL TAKEAWAY, ask: What did we learn? What remains unanswered for my AIM? What specific mathematical question is worth tackling NEXT, and WHY would the proposed technique answer it? Show up to two context-matched optional ideas; record chosen method and brief bridge BEFORE starting C40/C50. After the new maths, interpret its actual result at C34 and return HERE again. Repeat as many times as useful, or move toward a concise C60 conclusion when evidence and depth are sufficient.",
    "notes": "Display [previous real figure/calculation or section title], student-authored local conclusion, aim/beneficiary and still-open question. Student may Write the brief link in IA now / Already covered / Show examples / Not sure / Enough mathematics—conclude. Before first maths use actual initial observation, thereafter use the MOST RECENT substantial result. If Pearson r has ACTUALLY been calculated, C35P offers interpretation-dependent follow-ups: useful linear fit (if aim needs prediction), or justified investigation of weak linear association (scatter shape/curvature/groups/scope/precision). Never assume a small r proves no relationship, recommend arbitrary correlation hunting, prescribe an automatic regression, or show limits of unstarted methods. Allow returning to data, course-check or Save; no forced number of sections.\nEACH TRANSITION: Reuse the last result's aim-linked takeaway and any consequential uncertainty/limitation to judge what can logically be investigated next. Ask the student WHY their chosen method would overcome an unanswered issue; do not require repeating earlier limitations or adding a technique merely for difficulty.\nLEARNING-CHECK TIMING: Before starting a NEW technique, classify only the actually chosen technique against the student's confirmed course (within syllabus / partly beyond / beyond / unsure). If outside or uncertain, offer optional C40L and teacher review; this is a preparation decision, not a required IA paragraph.",
    "status": "Agreed",
    "sourceRow": 64
  },
  {
    "id": "C34A",
    "label": "Accuracy of THIS result · if needed",
    "purpose": "Only if the accuracy of this actual figure/calculation hasn't already been addressed or the representation creates a NEW accuracy issue: What resolution, uncertainty, sample scope or approximation affects how confidently I can interpret what I see?\nRECALL EARLIER ACCURACY: Show the relevant C24 source/units/resolution/precision decision alongside THIS actual output. Ask whether measurement resolution, sampling scope, approximation or current technique affects the defensible interpretation or displayed digits. Reuse earlier justification; only write a NEW consequence next to this result if it changes what can be claimed.",
    "notes": "Reuse confirmed C24/C23 and figure checks. If sufficient, skip without repeated questions. Distinguish visual impression from numerical evidence; do not offer PMCC/regression/optimisation assumptions before those methods start.\nWRITING MOMENT: write a NEW uncertainty consequence beside the actual result only if not previously explained; otherwise 'Already covered' references earlier precision paragraph.\nDistinguish measured-input precision from derived-result precision: retain sensible intermediate accuracy, consider how the actual operation/model affects uncertainty, then justify final reporting. Pearson r (dimensionless) does not automatically inherit input decimal places. No made-up ± value or unnecessary restatement of C24.",
    "status": "Agreed",
    "sourceRow": 65
  },
  {
    "id": "C34B",
    "label": "Reconnect with aim and prediction",
    "purpose": "Display current AIM, intended BENEFICIARY, original prediction/WHY and student-confirmed ACTUAL output. Prompt a one- or two-sentence section-level takeaway: what did this result establish or leave unresolved, and why is that meaningful for the original aim? Store localTakeaway with resultRef, not as a second overall conclusion. If unexpected, explore it at C34U.\nEXPLICIT RELEVANCE CHECK: The student explains in context what the actual result establishes, does NOT establish, or means for the aim and intended beneficiary, referring to original prediction when useful. Offer a concise local conclusion rather than generic 'the graph shows a trend' or a conclusion-section evaluation dump.\nOPTIONAL MATHS LEARNING: After an actual meaningful result, when the student has independently worked out or researched a concept, ask 'What did you learn MATHEMATICALLY about why this method works, its structure or its conditions—and how did it affect your investigation?' This is distinct from the essential aim-linked interpretation. Allow None / Already covered / Show example.",
    "notes": "Use student-authored actual values and localTakeaway; mark whether the earlier section substantially answered the immediate mathematical question, partly answered it or left it unresolved. Do not repeat whole calculations as a 'mini-conclusion'; write 1–2 sentences IMMEDIATELY after output, then use them to motivate C35. Original prediction persists.\nOnly surface extra learning cue when student confirms genuine conceptual learning; do not insert a reflective claim by default after every graph/algebra step. The earlier aim-linked result interpretation remains the primary task. Save learning insight linked to this resultRef.",
    "status": "Agreed",
    "sourceRow": 66
  },
  {
    "id": "C34U",
    "label": "Unexpected or unclear? Investigate, don't skip",
    "purpose": "If different from expectation, unclear, or an apparent anomaly: Ask exactly what differed and why it matters. Offer contextual possible checks: revisit what is plotted, verify data/units/exclusions, compare relevant subgroups or scope, examine alternate relation/model or try a justified small counterexample. Ask what would distinguish the explanations.",
    "notes": "An unexpected result is valuable mathematical reflection, not failure. Offer only 1–3 relevant optional possibilities based on REAL observed feature/route, without inventing causes or demanding extra figures. Recheck accuracy if relevant; record what is suspected versus actually tested. Preserve original prediction.\nWRITING MOMENT: document surprising/unclear actual finding and a worthwhile alternative check immediately after the result, before changing mathematics; differentiate contemplated check from test actually done.",
    "status": "Agreed",
    "sourceRow": 67
  },
  {
    "id": "C35H",
    "label": "Optional next-step ideas from actual finding",
    "purpose": "Optional C35H suggests at most 2–3 course-appropriate next actions from student-confirmed ACTUAL observations, aim and beneficiary. For paired numeric data, show the C35B four-outcome choice; don't force Pearson, Spearman or regression. Each technique needs a reason.",
    "notes": "PMCC is not always necessary: very clear straight lines may need purposeful modelling rather than redundant r; approximately linear plots may benefit from quantifying association; curves often require different mathematics; no apparent pattern can justify a scoped conclusion. No predictions treated as observed evidence.",
    "status": "Agreed",
    "sourceRow": 68
  },
  {
    "id": "C61",
    "label": "Draw together the essential answer",
    "purpose": "Show current aim, original prediction and a SHORT pick-list of the student's confirmed meaningful results and reflections (figure/calculation IDs). Ask: what is the best-supported answer to the investigation question, drawing on the key mathematical findings AS A WHOLE?",
    "notes": "Synthesis rather than recap: no re-running calculations, explaining plots, duplicating figures/tables, or copying paragraphs already evaluated. Distinguish a well-supported answer from an inconclusive result. Short own-voice explanation, not auto-generated prose.",
    "status": "Agreed",
    "sourceRow": 69
  },
  {
    "id": "C62",
    "label": "Meaning for the intended beneficiary",
    "purpose": "Revisit the student-confirmed intended beneficiary, original predicted implication and actual key findings. Ask what practical decision, understanding or advice the mathematics really supports for themselves or others. If the investigation is theoretical, ask what the insight establishes and why that matters to their mathematical curiosity.",
    "notes": "Avoid inventing an impact, overclaiming causality or introducing fresh evaluation. Briefly reference earlier qualified uncertainty/scope only where essential to calibrate advice. The conclusion need not separately repeat all limitations or reflect on every procedure.",
    "status": "Agreed",
    "sourceRow": 70
  },
  {
    "id": "C63",
    "label": "What would you investigate next?",
    "purpose": "Ask for one or two plausible mathematical next directions arising SPECIFICALLY from the findings or an unresolved question, and WHY each could add value. Offer on-demand choices from students' actual course/methods/observations such as a targeted additional comparison, alternate model assumption, new data or a theoretical extension.",
    "notes": "Extensions are FUTURE possibilities, not work already completed or a generic 'more time, more data' list. If a meaningful extension is not clear, record None/not yet or an unresolved question; never force a new experiment or another calculation into the finished conclusion.",
    "status": "Agreed",
    "sourceRow": 71
  },
  {
    "id": "C64",
    "label": "Keep the conclusion focused",
    "purpose": "Self-check: Does the ending answer the aim, draw together rather than repeat the mathematics, explain the most meaningful implication and look towards plausible next questions? Remove repeated descriptions, calculations, figure screenshots, methodological justifications and a new list of generic limitations.",
    "notes": "Reflection/evaluation belong THROUGHOUT Data Collection and mathematical exploration at their point of relevance. If a key earlier choice/result has not been reflected upon, offer a reversible link to that exact section instead of pasting a belated evaluation paragraph into the conclusion. No mandatory fixed template or length.",
    "status": "Agreed",
    "sourceRow": 72
  },
  {
    "id": "C10E",
    "label": "Compare introductions: optional examples",
    "purpose": "Only on request, show 2–3 short illustrative weak-versus-effective introduction pairs. Ask what makes authentic, concise purpose clearer; return directly to own draft.",
    "notes": "Don't prescribe an IA template or generate a student introduction. An authentic first-person voice is natural when describing genuine choices, not obligatory in every sentence.",
    "status": "Working draft",
    "sourceRow": 73
  },
  {
    "id": "C35B",
    "label": "Bivariate: which observed pattern?",
    "purpose": "For student-confirmed paired QUANTITATIVE data, offer four observed scatter patterns: clearly straight, approximately linear, curved, no clear relation; plus unsure. Show optional matched next steps, never infer from prediction.",
    "notes": "Very clear straight line: PMCC may add little unless quantification matters. Roughly linear: PMCC may be useful. Curved: consider a nonlinear model or relevant rank measure if course-appropriate. No pattern: consider honest inconclusive answer or a justified alternative. Student retains choice.",
    "status": "Working draft",
    "sourceRow": 74
  },
  {
    "id": "C40T",
    "label": "Explain technology-assisted mathematics",
    "purpose": "When technology ACTUALLY performs a statistical calculation, fitting, plotting or numerical analysis, ask what was computed, WHY that tool/method fits the aim, what the key output means, and how interpretation/validity can be checked.",
    "notes": "Avoid click-by-click instructions, unexplained screenshots and merely naming an app. Calculations in course can be concise; unfamiliar methods need enough demonstration of mathematical understanding.\nWRITING MOMENT: the actual software result belongs beside its explanation (what/why/meaning), not a screenshot with a button-click tutorial. No tool-use explanation if no technology was used.\nTECHNOLOGY/LEARNING SPLIT: For syllabus mathematics calculated using technology, explain WHAT was calculated, why and its meaning—not menu commands or a derivation of familiar mathematics. For mathematical algorithms/techniques independently learnt beyond course, C40L should require concise conceptual understanding in addition to interpreting the software's result.",
    "status": "Working draft",
    "sourceRow": 75
  },
  {
    "id": "C40D",
    "label": "Assess ACTUAL mathematical relevance and depth",
    "purpose": "At C40/C50, assess mathematics actually USED: relevance to current aim, correctness, grasp of meaning, appropriateness to AI SL or AA SL, and whether it goes beyond merely listing prior-learning skills.\nCOURSE-LEVEL DECISION: From student-selected course and ACTUAL mathematical technique, ask 'On my syllabus / New extension only / Outside my syllabus / Not sure'. If unsure or outside, seek teacher suitability guidance. If within: normal mathematical use and interpretation, NO procedural teaching. If new: demonstrate actual understanding where it first appears, with reliable cited learning source.",
    "notes": "A few well-understood course-level approaches often beat many superficial or gratuitously complex ones. Course not supported/outside-course or uncertain → teacher guidance, not automatic rejection or predicted mark.\nDo not automatically label topics in/out of the IB course from a generic list or promise higher marks for extra difficulty. Verify against the student's real course/version or teacher where uncertain. Keep a genuinely useful course-level technique over an obscure one that the student can't explain.",
    "status": "Working draft",
    "sourceRow": 76
  },
  {
    "id": "C70N",
    "label": "Notation and mathematical presentation",
    "purpose": "On active mathematical work or final readability review, check clearly typeset equations (use equation editor), correct symbols/units/definitions, '≈' versus '=' when results are rounded, readable graphs and justified precision.",
    "notes": "No mandatory repetition after every calculation. Explained technology output can coexist with concise own mathematical notation. Do not force a long account of routine maths at or below course level.",
    "status": "Working draft",
    "sourceRow": 77
  },
  {
    "id": "C80D",
    "label": "Teacher-draft: complete, criteria, readability",
    "purpose": "Before the one permitted written teacher feedback, check a genuinely COMPLETE IA: concise introduction, relevant substantial mathematics and evidence, ongoing reflection, integrated figures, conclusion and sources. Optional criteria A–E evidence check, print-read, peer/non-mathematician clarity check.",
    "notes": "Use actual school timeline and one round of written feedback; verbal advice may be recorded. Saving a partial draft is allowed but must not label it complete or imply teacher approval.",
    "status": "Working draft",
    "sourceRow": 78
  },
  {
    "id": "C90F",
    "label": "Final review A–E and proofreading",
    "purpose": "After permitted written/verbal teacher feedback, use a concise A–E self-check with evidence, mathematical accuracy/notation/precision, print/PDF readability, citations, title/page numbers and identity/style per school.",
    "notes": "No guessed due dates, scores or auto-submission. Reader checks are recommended and optional; progress save remains possible before completion.",
    "status": "Working draft",
    "sourceRow": 79
  },
  {
    "id": "C95",
    "label": "I'm stuck — what is blocking me?",
    "purpose": "Show a small I'm stuck link in every Completing stage. Offer concise choices: No data / Not enough or unusable data / Another source / Maths or writing problem / Permissions, timing or other. Choose based on current issue.",
    "notes": "This is process help, not an automatic IA weakness. Only appears when requested; offer at most 1–3 relevant suggestions, with Close, Not sure and Save. Preserve current stage and entered work.",
    "status": "Working draft",
    "sourceRow": 80
  },
  {
    "id": "C95D",
    "label": "No data yet: make progress anyway",
    "purpose": "While waiting for real evidence, suggest one immediate useful task: write brief introduction based on aim/motivation; draft or revise prediction, WHY and possible implication; define quantities/units and sampling scope; compare data methods; investigate alternative primary/secondary sources; keep a provisional first diagram/maths plan; Save.",
    "notes": "No prediction mistaken for a result, no invented observations. Pending means pending; cannot calculate conclusions from nonexistent data. Keep teacher consent/access flags. Practical delay is not an IA mathematical limitation to write about.\nWRITING MOMENT: with data pending, student may write introduction and tentative prediction NOW; searching sources and waiting for consent are project notes, not data/results passages.",
    "status": "Working draft",
    "sourceRow": 81
  },
  {
    "id": "C95A",
    "label": "Find and check alternative data sources",
    "purpose": "Follow up original source, use another permitted method, seek a credible publicly accessible secondary dataset/report, narrow to a feasible group/time period, or review revised aim. Ask whether the new data have relevant variable definitions, population, units, source dates, provenance, sampling quality, permissions and accuracy.",
    "notes": "Switch only after student confirms that source still serves the original aim/beneficiary or updates aim transparently. No fabricated data, private information, unexplained mixing, unattributed secondary data or silent methodology switch. Refer to C20/C02/C03 as needed.",
    "status": "Working draft",
    "sourceRow": 82
  },
  {
    "id": "C95L",
    "label": "Some data, but incomplete or poor quality",
    "purpose": "Ask whether response count too low, groups unbalanced, measurements missing, units inconsistent or source has unusable scope. Check genuine errors/definitions, see if more representative observations or equivalent sources are feasible; adjust claims to actual sample and consider revised aim. Save legitimate partial observations.",
    "notes": "Do not assume small n always invalid, but explain consequence for estimates/inference. Do not fill gaps with invented values, drop inconvenient results or assert population claims without support. Separate practical obstacle from mathematical limitation discussed at C20.",
    "status": "Working draft",
    "sourceRow": 83
  },
  {
    "id": "C95Q",
    "label": "Other hiccough: targeted support",
    "purpose": "Route only to relevant existing help: unexpected result→C34U; can't choose method→C40D or C35H; technology/notation→C40T/C70N; diagram unhelpful→C31; writing/feedback→C10/C80D; ethical permission or access→C03; lost progress→C00/C01; timeline/aim unclear→C02/C04.",
    "notes": "One specific action then return. Don't show all checklists or imply an unexpected result is bad. No automatic second teacher written-feedback round; all edits student-authored.",
    "status": "Working draft",
    "sourceRow": 84
  },
  {
    "id": "C95N",
    "label": "One helpful next action",
    "purpose": "Ask: What ONE worthwhile thing will you do next? Choose Write introduction, Record a tentative prediction, Search/check alternate data, Prepare definitions/method, Ask teacher where needed, Continue actual maths, Return, or Save; Other/Not sure allowed. Optional date only if student chooses.",
    "notes": "Persist issue category, blocker status, selected action, source alternatives, current plan, unresolved permissions and origin stage. Don't invent deadlines, background reminders or auto-complete work; Save and resume preserve drafts.",
    "status": "Working draft",
    "sourceRow": 85
  },
  {
    "id": "C96",
    "label": "Where should I write this?",
    "purpose": "Look at student's CURRENT stage, data/source status, actual selected method, course, aim/beneficiary, observation and prior cue ledger. Match at most ONE applicable Writing Moments ID. State exactly 'Write this in your IA now: [specific purpose] — [precise location]', or 'Planning note — not IA text' where there is no real evidence. Offer Write now / Already covered / Not relevant / Show an example / Dismiss for now.",
    "notes": "No generic checklist, generated student prose, guessed result or unstarted-technique limitations. 'Already covered' stores student's own text location; 'Not relevant' suppresses until meaningful change; 'Noted' is not 'written'. Preserve the origin stage/unsaved work. After changing aim/method/result, re-check only affected cues. Save/Resume remains available.\nONE RELEVANT WRITING CUE: Prioritise a missing aim-linked interpretation after a real result over stylistic reminders. Show an earlier-accuracy application only when a current output needs it. Persist Already covered / Not relevant per specific result, source and changed context; no repeated nagging.\nWRITING PRIORITY: If a new method is confirmed beyond syllabus and currently about to be used, show the brief 'explain what the unfamiliar mathematics means' cue at FIRST USE, not after all results. Within syllabus, never prompt method-teaching prose. If actual output yields real mathematical insight, allow separate optional 'what did I learn mathematically?' next to result.",
    "status": "Working draft",
    "sourceRow": 86
  },
  {
    "id": "C35P",
    "label": "After PMCC: which mathematical step follows?",
    "purpose": "Only when Pearson's r was ACTUALLY calculated for paired quantitative data, after student has interpreted its sign/magnitude and considered real scatter, display the computed r (do not invent it), the original aim, current question, actual observed graph and relevant scope. Offer ONE or TWO contextual NEXT steps: if sample r indicates useful linear association and a predictive model would help, consider fitting/interpreting a line of best fit then checking suitable fit/domain; if weak linear association, examine whether scatter hints at curvature, clusters, unusual values or limited range and whether a justified alternative model/comparison could answer the aim, or conclude there is little evidence of a LINEAR association. If intermediate/uncertain, record what r can and cannot answer; allow stop if enough.",
    "notes": "Do not equate low |r| with no relationship of any kind, or high |r| with causation/valid prediction. Never manufacture coefficients, statistical significance or thresholds; sample size, domain and justified uncertainty matter. Don't cherry-pick points/subgroups or search multiple correlations just to get a desirable answer. Spearman only when relationship appears monotonic and course/teacher-appropriate. The next section must be student-chosen, based on previous conclusion; keep original result and previous section's writing intact.",
    "status": "Working draft",
    "sourceRow": 87
  },
  {
    "id": "C40L",
    "label": "Explain new mathematics · only when relevant",
    "purpose": "Show ONLY for the actual chosen substantial mathematical technique, at its FIRST use (or on demand while reviewing it), if beyond syllabus, partly beyond, independently researched, or course status is uncertain; or AFTER a real finding when the student opts to describe mathematical learning. Display current course, technique, original aim and previous real result. Ask 'Is this within your course, beyond it, partly new, or not sure?' COURSE: skip method tutorial; simply apply it, justify purpose and interpret. BEYOND: invite student's OWN concise description of the unfamiliar principle, key notation/conditions and why method works/is appropriate, ideally by a relevant step, derivation, checked example or comparison. Cite the researched source(s). PARTLY BEYOND: explain novel extension only. AFTER RESULT: optional authentic insight about what the student learned mathematically, linked to current working/aim. Unsure: ask teacher for syllabus and suitability review.",
    "notes": "No compulsory stage or interruption for syllabus maths. Don't auto-classify any topic without verified course/version; don't assume 'researched' implies beyond syllabus or that more advanced maths earns more marks. Keep explanation adjacent to FIRST use, not conclusion, and avoid copied sources, long generic tutorials or describing software clicks. The student owns written explanation and can choose Already covered (with location), Not relevant, Example, Teacher check, or Save. Preserve originStage, techniqueId, genuine resultRef and unsaved draft; later insight is optional and must not replace result-to-aim interpretation.",
    "status": "Working draft",
    "sourceRow": 88
  }
]);
export const C_ROUTES=Object.freeze([
  {
    "from": "C00",
    "condition": "Continue from completed Planning in this session",
    "to": "C02",
    "sourceRow": 60,
    "notes": "Prepopulate from in-session plan without needing to upload"
  },
  {
    "from": "C00",
    "condition": "Upload saved planning report PDF/DOCX",
    "to": "C01",
    "sourceRow": 61,
    "notes": "Read compatible saved report and continue"
  },
  {
    "from": "C00",
    "condition": "Start without a saved plan",
    "to": "C02",
    "sourceRow": 62,
    "notes": "Open editable empty summary with Not provided fields"
  },
  {
    "from": "C01",
    "condition": "Recognized document / fields extracted",
    "to": "C02",
    "sourceRow": 63,
    "notes": "Review imported fields before applying; display document date and source"
  },
  {
    "from": "C01",
    "condition": "Only some fields recognized",
    "to": "C02",
    "sourceRow": 64,
    "notes": "Prefill recognized values, flag missing or uncertain; allow manual edits"
  },
  {
    "from": "C01",
    "condition": "Unreadable/scanned/unsupported file",
    "to": "C02",
    "sourceRow": 65,
    "notes": "Explain problem and offer manual completion; do not block access"
  },
  {
    "from": "C01",
    "condition": "Try a different file",
    "to": "C01",
    "sourceRow": 66,
    "notes": "Allow retry without clearing existing work"
  },
  {
    "from": "C02",
    "condition": "Confirm or update carried-forward information",
    "to": "C03",
    "sourceRow": 67,
    "notes": "Preserve student's edits and provenance of imported values"
  },
  {
    "from": "C02",
    "condition": "Change / replace imported file",
    "to": "C01",
    "sourceRow": 68,
    "notes": "Review conflicts before merging; never overwrite later work by default"
  },
  {
    "from": "C03",
    "condition": "Idea and permissions reviewed",
    "to": "C04",
    "sourceRow": 69,
    "notes": "Continue to flexible stages; leave unresolved alerts visible"
  },
  {
    "from": "C03",
    "condition": "Teacher/permission concern remains",
    "to": "C04",
    "sourceRow": 70,
    "notes": "Still guide safe work and review; do not authorise restricted data collection"
  },
  {
    "from": "C03",
    "condition": "Return to update planning answers",
    "to": "N06",
    "sourceRow": 71,
    "notes": "Optional back-navigation to planning review; preserve completion progress"
  },
  {
    "from": "C04",
    "condition": "Work on introduction",
    "to": "C10",
    "sourceRow": 72,
    "notes": "Introduction can be opened or revisited at any time from the stage dashboard; existing writing is restored."
  },
  {
    "from": "C04",
    "condition": "Work with data and sources",
    "to": "C20",
    "sourceRow": 73,
    "notes": "Data or no-data small example route"
  },
  {
    "from": "C04",
    "condition": "Prepare first representation",
    "to": "C30",
    "sourceRow": 74,
    "notes": "Graph/table/diagram/simplified problem"
  },
  {
    "from": "C04",
    "condition": "Work on first mathematics",
    "to": "C40",
    "sourceRow": 75,
    "notes": "Explain method, notation, result and link to aim"
  },
  {
    "from": "C04",
    "condition": "Develop further mathematics",
    "to": "C50",
    "sourceRow": 76,
    "notes": "Iterative analysis and reflection"
  },
  {
    "from": "C04",
    "condition": "Write/revise the concise concluding synthesis",
    "to": "C60",
    "sourceRow": 77,
    "notes": "Open C60, with optional C61–C64 guided synthesis and future mathematical questions"
  },
  {
    "from": "C04",
    "condition": "Check presentation",
    "to": "C70",
    "sourceRow": 78,
    "notes": "Presentation/communication/citations/appendix"
  },
  {
    "from": "C04",
    "condition": "Manage teacher feedback",
    "to": "C80",
    "sourceRow": 79,
    "notes": "Draft feedback, changes and deadlines"
  },
  {
    "from": "C04",
    "condition": "Final readiness review",
    "to": "C90",
    "sourceRow": 80,
    "notes": "Student self-check, not an IB grade"
  },
  {
    "from": "C04",
    "condition": "Save progress",
    "to": "C91",
    "sourceRow": 81,
    "notes": "Accessible at any stage via persistent Save option"
  },
  {
    "from": "C10",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 82,
    "notes": "Leaving the introduction never locks it; the student's draft and optional planning edits remain available."
  },
  {
    "from": "C20",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 83,
    "notes": "Can return to data when new observations arrive"
  },
  {
    "from": "C30",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 84,
    "notes": "Record first visual and its interpretation"
  },
  {
    "from": "C40",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 85,
    "notes": "Record mathematical evidence and reflections"
  },
  {
    "from": "C50",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 86,
    "notes": "Further mathematics can repeat as often as necessary"
  },
  {
    "from": "C60",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 87,
    "notes": "Conclusion stays editable after later maths; avoid using C60 to replace earlier reflection"
  },
  {
    "from": "C70",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 88,
    "notes": "Communicate, reference and revise where necessary"
  },
  {
    "from": "C80",
    "condition": "Continue / choose another stage",
    "to": "C04",
    "sourceRow": 89,
    "notes": "Keep feedback and actions while navigating"
  },
  {
    "from": "C90",
    "condition": "Revise issues found",
    "to": "C04",
    "sourceRow": 90,
    "notes": "Return to relevant task, not automatically mark as finished"
  },
  {
    "from": "C90",
    "condition": "Record / save current work",
    "to": "C91",
    "sourceRow": 91,
    "notes": "Snapshot for later upload; does not submit the IA"
  },
  {
    "from": "C91",
    "condition": "Keep working",
    "to": "C04",
    "sourceRow": 92,
    "notes": "Return to selected stage after save"
  },
  {
    "from": "C91",
    "condition": "Resume from saved snapshot later",
    "to": "C00",
    "sourceRow": 93,
    "notes": "Use entry choice and import; preserve version and confirmations"
  },
  {
    "from": "C10",
    "condition": "Edit aim, audience or prediction while writing introduction",
    "to": "C02",
    "sourceRow": 100,
    "notes": "Open shared planning fields with current draft preserved. On confirmation, return to introduction rather than restarting other stages."
  },
  {
    "from": "C02",
    "condition": "Return to introduction after editing fields",
    "to": "C10",
    "sourceRow": 101,
    "notes": "Only when opened from Introduction; restore written draft and ask to review any passages affected by changed aim or prediction."
  },
  {
    "from": "C20",
    "condition": "Statistics with sampled or secondary data",
    "to": "C21S",
    "sourceRow": 102,
    "notes": "Ask about population, observation type, sampling/census and representativeness where relevant; use existing plan route"
  },
  {
    "from": "C20",
    "condition": "Empirical modelling or measured model inputs",
    "to": "C21M",
    "sourceRow": 103,
    "notes": "Ask how model inputs are sourced or measured and whether/where it can be checked"
  },
  {
    "from": "C20",
    "condition": "Statistical and modelling elements",
    "to": "C21S",
    "sourceRow": 104,
    "notes": "Complete statistics prompts first and then modelling prompts as needed; remember which branches are done"
  },
  {
    "from": "C20",
    "condition": "Theoretical or no-data exploration",
    "to": "C21T",
    "sourceRow": 105,
    "notes": "Do not force data collection or statistical sampling onto a proof/conjecture"
  },
  {
    "from": "C20",
    "condition": "Other or currently unsure",
    "to": "C21T",
    "sourceRow": 106,
    "notes": "Offer assumptions and definitions; student can change route later"
  },
  {
    "from": "C21S",
    "condition": "Statistical design considered",
    "to": "C22",
    "sourceRow": 107,
    "notes": "Continue to compare the real collection/source options and justify the decision"
  },
  {
    "from": "C21S",
    "condition": "Also modelling with measured/calibrated inputs",
    "to": "C21M",
    "sourceRow": 108,
    "notes": "When both routes apply, ask modelling questions once; preserve completed statistics answers"
  },
  {
    "from": "C21M",
    "condition": "Model inputs or validation considered",
    "to": "C22",
    "sourceRow": 109,
    "notes": "Compare actual methods, including any measurement/repeated data options"
  },
  {
    "from": "C21M",
    "condition": "Also collecting a sample for model fitting",
    "to": "C21S",
    "sourceRow": 110,
    "notes": "Show sampling questions if needed and not already completed; avoid infinite loop"
  },
  {
    "from": "C21T",
    "condition": "No empirical data involved",
    "to": "C25",
    "sourceRow": 111,
    "notes": "Define specialist language, symbols and assumptions; bypass sampling/measurement precision"
  },
  {
    "from": "C21T",
    "condition": "Empirical measurements or sources do apply",
    "to": "C22",
    "sourceRow": 112,
    "notes": "Optional context-based comparison of methods; route can evolve"
  },
  {
    "from": "C22",
    "condition": "Method selected and reason recorded",
    "to": "C23",
    "sourceRow": 113,
    "notes": "Consider limitations, attempted mitigation and why residual limits are acceptable"
  },
  {
    "from": "C23",
    "condition": "Quantitative measurements or rounded source values",
    "to": "C24",
    "sourceRow": 114,
    "notes": "Record accuracy/resolution and plan precision of subsequent work"
  },
  {
    "from": "C23",
    "condition": "No numerical measurements",
    "to": "C25",
    "sourceRow": 115,
    "notes": "Skip irrelevant instrument accuracy; still define key terms and symbols"
  },
  {
    "from": "C24",
    "condition": "Accuracy/precision decision explained",
    "to": "C25",
    "sourceRow": 116,
    "notes": "Set meaningful variable symbols, units and just-in-time term definitions"
  },
  {
    "from": "C25",
    "condition": "Variables and terms reviewed",
    "to": "C26",
    "sourceRow": 117,
    "notes": "Summarize choices and intended evidence; connect data to the investigation aim"
  },
  {
    "from": "C26",
    "condition": "Return to flexible stage dashboard",
    "to": "C04",
    "sourceRow": 118,
    "notes": "Retain student answers and reopen at any point"
  },
  {
    "from": "C26",
    "condition": "Proceed to first representation",
    "to": "C30",
    "sourceRow": 119,
    "notes": "Continue with graph, table, diagram or a simplified theoretical case"
  },
  {
    "from": "C26",
    "condition": "Change source or collection approach",
    "to": "C20",
    "sourceRow": 120,
    "notes": "Revisit prompts while preserving prior notes; flag what changed"
  },
  {
    "from": "C26",
    "condition": "Seek teacher advice without stopping work",
    "to": "C03",
    "sourceRow": 121,
    "notes": "Track unresolved permissions/approvals, then allow safe next stages or saving"
  },
  {
    "from": "C40",
    "condition": "Check precision of a reported calculation",
    "to": "C24",
    "sourceRow": 122,
    "notes": "Return to original collection resolution/uncertainty; then return to mathematical work via the stage dashboard"
  },
  {
    "from": "C50",
    "condition": "Reconsider data or model inputs after results",
    "to": "C20",
    "sourceRow": 123,
    "notes": "Investigations evolve: record the change without overwriting the original justification"
  },
  {
    "from": "C70",
    "condition": "Review specialist terms and notation",
    "to": "C25",
    "sourceRow": 124,
    "notes": "Check variables and data-specific jargon at their first use"
  },
  {
    "from": "C90",
    "condition": "Review whether reported accuracy is defensible",
    "to": "C24",
    "sourceRow": 125,
    "notes": "Review actual measurement limits and rounding across tables, maths and conclusions"
  },
  {
    "from": "C30",
    "condition": "Begin purposeful initial exploration",
    "to": "C31",
    "sourceRow": 126,
    "notes": "Select a diagram, concise first calculation, compact summary or small theoretical case (or None); use prior Planning + actual data"
  },
  {
    "from": "C31",
    "condition": "Chosen useful initial representation or calculation",
    "to": "C32",
    "sourceRow": 127,
    "notes": "Ask why this move is relevant and define variables before first appearance"
  },
  {
    "from": "C31",
    "condition": "No helpful diagram or calculation right now",
    "to": "C04",
    "sourceRow": 128,
    "notes": "Skip without penalty; student may go directly to first substantial mathematics or another stage"
  },
  {
    "from": "C31",
    "condition": "Required measurements/data not ready",
    "to": "C20",
    "sourceRow": 129,
    "notes": "Return to collecting/preparing actual evidence without inventing data or locking the stage"
  },
  {
    "from": "C32",
    "condition": "Purpose and symbols defined",
    "to": "C33",
    "sourceRow": 130,
    "notes": "Make student-selected diagram/compact calculation then apply corresponding checks"
  },
  {
    "from": "C33",
    "condition": "Figure or brief calculation checked",
    "to": "C34",
    "sourceRow": 131,
    "notes": "Ask what was observed, not how to perform routine graphing"
  },
  {
    "from": "C33",
    "condition": "Presentation fails a relevant check",
    "to": "C32",
    "sourceRow": 132,
    "notes": "Correct titles, notation, scale, single-page fit, precision etc. without losing work"
  },
  {
    "from": "C34",
    "condition": "Observation made; check accuracy where new, then reconnect to aim/prediction",
    "to": "C34B",
    "sourceRow": 133,
    "notes": "Existing route when accuracy is already covered; C34B is an explicit mandatory connection to aim/prediction before next step."
  },
  {
    "from": "C35",
    "condition": "Begin FIRST justified mathematical section (or the next appropriate method)",
    "to": "C40",
    "sourceRow": 134,
    "notes": "C35's explicit next question and bridging explanation must reference preceding actual result and local conclusion; method rationale written BEFORE maths at C40."
  },
  {
    "from": "C35",
    "condition": "Return to dashboard / save",
    "to": "C04",
    "sourceRow": 135,
    "notes": "Persist choices, representation reference, observation and intended next mathematical step"
  },
  {
    "from": "C35",
    "condition": "Different representation would help more",
    "to": "C31",
    "sourceRow": 136,
    "notes": "Reconsider a figure/calculation; avoid duplication and repeat content only for a meaningful side-by-side comparison"
  },
  {
    "from": "C35",
    "condition": "Need better/more data",
    "to": "C20",
    "sourceRow": 137,
    "notes": "Preserve original observations and note reason for changed data plan"
  },
  {
    "from": "C35",
    "condition": "Begin ANOTHER meaningful mathematical section",
    "to": "C50",
    "sourceRow": 138,
    "notes": "Repeat C35→C50 using last completed section's result/takeaway; each substantive output returns via C34/C34B to C35."
  },
  {
    "from": "C40",
    "condition": "Review an earlier initial representation when interpretation changes",
    "to": "C30",
    "sourceRow": 139,
    "notes": "Optional reversible navigation; refer to existing figure rather than duplicate it"
  },
  {
    "from": "C50",
    "condition": "A genuinely new observation needs a different figure",
    "to": "C30",
    "sourceRow": 140,
    "notes": "Revisit only if it advances the story or makes a side-by-side comparison useful"
  },
  {
    "from": "C70",
    "condition": "Review a specific diagram quality issue",
    "to": "C33",
    "sourceRow": 141,
    "notes": "Apply relevant presentation checklist; no need to redo or duplicate a correct figure"
  },
  {
    "from": "C34",
    "condition": "This result's accuracy or interpretation remains uncertain",
    "to": "C34A",
    "sourceRow": 142,
    "notes": "Only show C34A when input resolution/source scope or THIS figure/calculation introduces an unresolved precision/validity issue; otherwise skip"
  },
  {
    "from": "C34A",
    "condition": "Accuracy/uncertainty meaningfully considered",
    "to": "C34B",
    "sourceRow": 143,
    "notes": "Use relevant C24 and C23 records, don't duplicate earlier accurate explanations"
  },
  {
    "from": "C34A",
    "condition": "Need to check original measurement/source uncertainty",
    "to": "C24",
    "sourceRow": 144,
    "notes": "Optional revisit to established precision notes; keep current finding to return to"
  },
  {
    "from": "C34B",
    "condition": "Consistent with prediction, or no prediction, or sufficiently explained",
    "to": "C35",
    "sourceRow": 145,
    "notes": "After actual figure or calculation and short local takeaway, go to C35's explicit Next logical mathematical step; further mathematics is optional and justified."
  },
  {
    "from": "C34B",
    "condition": "Unexpected, contradicts prediction, or is unclear",
    "to": "C34U",
    "sourceRow": 146,
    "notes": "Investigate a plausible other angle rather than simply ticking next stage"
  },
  {
    "from": "C34B",
    "condition": "Earlier aim/prediction/beneficiary needs revisiting",
    "to": "C04",
    "sourceRow": 147,
    "notes": "Make edits from dashboard, preserve original prediction and current interpretation notes"
  },
  {
    "from": "C34U",
    "condition": "A plausible explanation or alternative has been considered",
    "to": "C35",
    "sourceRow": 148,
    "notes": "After documenting surprise vs conjecture, return to next-step reasoning grounded in real result; no cherry-picking or unperformed tests."
  },
  {
    "from": "C34U",
    "condition": "One different view/example is genuinely needed",
    "to": "C31",
    "sourceRow": 149,
    "notes": "No duplicate charts unless meaningful comparison; preserve current figure and interpretation"
  },
  {
    "from": "C34U",
    "condition": "Possible data/source/collection issue warrants checking",
    "to": "C20",
    "sourceRow": 150,
    "notes": "Return to data stage when justified, not automatically whenever result surprising"
  },
  {
    "from": "C34U",
    "condition": "Need to review accuracy of this observation",
    "to": "C34A",
    "sourceRow": 151,
    "notes": "Only for a NEW uncertainty/assumption or incorrect reporting precision"
  },
  {
    "from": "C34U",
    "condition": "Record unresolved surprise and save for later",
    "to": "C04",
    "sourceRow": 152,
    "notes": "Do not force a false interpretation; restore observations/unfinished question on resume"
  },
  {
    "from": "C35",
    "condition": "Show me relevant NEXT mathematical ideas",
    "to": "C35H",
    "sourceRow": 153,
    "notes": "On-demand only. Match actual observed feature + aim + course, not prediction or proposed maths alone"
  },
  {
    "from": "C35H",
    "condition": "Choose an idea, another method, or none",
    "to": "C35",
    "sourceRow": 154,
    "notes": "Return to the student's own next-step rationale; no automatic method execution"
  },
  {
    "from": "C35H",
    "condition": "Need better evidence before deciding",
    "to": "C20",
    "sourceRow": 155,
    "notes": "Student can fetch more relevant data when justified, keeping earlier observations"
  },
  {
    "from": "C40",
    "condition": "Actual later mathematical result warrants reinterpretation",
    "to": "C34",
    "sourceRow": 156,
    "notes": "ACTUAL substantive first mathematics result → C34 observation/accuracy if new/aim/prediction/LOCAL TAKEAWAY → C35; don't jump directly to another technique without interpreting this."
  },
  {
    "from": "C60",
    "condition": "Open guided conclusion synthesis",
    "to": "C61",
    "sourceRow": 157,
    "notes": "Reuse previous genuine results and ongoing reflection notes; stage remains revisitable"
  },
  {
    "from": "C61",
    "condition": "Main answer identified or honestly inconclusive",
    "to": "C62",
    "sourceRow": 158,
    "notes": "Move to implications without repeating mathematical work"
  },
  {
    "from": "C61",
    "condition": "Need to check an earlier result or missing reflection",
    "to": "C04",
    "sourceRow": 159,
    "notes": "Offer go-to-relevant-stage shortcut; return to conclusion without losing draft"
  },
  {
    "from": "C62",
    "condition": "Meaning for beneficiary considered",
    "to": "C63",
    "sourceRow": 160,
    "notes": "Choose a realistic mathematical extension or outstanding question"
  },
  {
    "from": "C62",
    "condition": "Audience/aim has changed",
    "to": "C02",
    "sourceRow": 161,
    "notes": "Review relevant carried-forward fields; preserve student-authored conclusion and original aim history"
  },
  {
    "from": "C63",
    "condition": "Next steps recorded or no meaningful extension",
    "to": "C64",
    "sourceRow": 162,
    "notes": "Do not block completion if an extension is not justified"
  },
  {
    "from": "C63",
    "condition": "Proposed extension seems already completed",
    "to": "C61",
    "sourceRow": 163,
    "notes": "Return to overall synthesis; never present performed work as future research"
  },
  {
    "from": "C64",
    "condition": "Conclusion complete or provisional",
    "to": "C04",
    "sourceRow": 164,
    "notes": "Preserve the draft for later revision or move to another stage"
  },
  {
    "from": "C64",
    "condition": "Check overall presentation",
    "to": "C70",
    "sourceRow": 165,
    "notes": "Review readability/references without repeating evaluation"
  },
  {
    "from": "C64",
    "condition": "Save current conclusion notes",
    "to": "C91",
    "sourceRow": 166,
    "notes": "Snapshot stores student-authored synthesis, purpose and next steps"
  },
  {
    "from": "C64",
    "condition": "Earlier mathematical reflection needs attention",
    "to": "C50",
    "sourceRow": 167,
    "notes": "Return to relevant mathematical evidence; edit reflection THERE, not in ending"
  },
  {
    "from": "C64",
    "condition": "Earlier diagram/result reflection needs attention",
    "to": "C34",
    "sourceRow": 168,
    "notes": "Return to relevant result-ledger entry; keep conclusion draft intact"
  },
  {
    "from": "C40",
    "condition": "After appropriate reflection, begin final synthesis if ready",
    "to": "C60",
    "sourceRow": 169,
    "notes": "Only if the latest substantive result has already received C34/C34B local interpretation and C35 has established that sufficient relevant course-level mathematics now answers the aim. Otherwise use C40→C34 first."
  },
  {
    "from": "C50",
    "condition": "Reflect on a new mathematical result as it happens",
    "to": "C34",
    "sourceRow": 170,
    "notes": "ACTUAL substantive further mathematics result → C34 result interpretation + local takeaway → C35 repeated step or evidence-based conclusion. Do not send routine algebra through the loop."
  },
  {
    "from": "C10",
    "condition": "See optional intro contrast examples",
    "to": "C10E",
    "sourceRow": 171,
    "notes": "Only when requested; don't interrupt writing"
  },
  {
    "from": "C10E",
    "condition": "Return to own introduction",
    "to": "C10",
    "sourceRow": 172,
    "notes": "Preserve student prose and revised plan fields"
  },
  {
    "from": "C35",
    "condition": "Show bivariate options for actual scatter pattern",
    "to": "C35B",
    "sourceRow": 173,
    "notes": "Only paired quantitative data with actual observation; on demand"
  },
  {
    "from": "C35H",
    "condition": "Show specific paired-data suggestions",
    "to": "C35B",
    "sourceRow": 174,
    "notes": "Optional on-demand deeper advice"
  },
  {
    "from": "C35B",
    "condition": "Clearly straight-line scatter",
    "to": "C35",
    "sourceRow": 175,
    "notes": "PMCC may be unnecessary if quantification adds nothing; fitting only if useful"
  },
  {
    "from": "C35B",
    "condition": "Approximately straight line",
    "to": "C35",
    "sourceRow": 176,
    "notes": "PMCC may help quantify the LINEAR association; make purpose explicit"
  },
  {
    "from": "C35B",
    "condition": "Curved or distinctly non-linear",
    "to": "C35",
    "sourceRow": 177,
    "notes": "Try a justified nonlinear model/rank alternative as course permits; no forced PMCC"
  },
  {
    "from": "C35B",
    "condition": "No clear relationship",
    "to": "C35",
    "sourceRow": 178,
    "notes": "Discuss lack of visible evidence; no forced regression or data fishing"
  },
  {
    "from": "C35B",
    "condition": "Uncertain pattern or inspect actual plot again",
    "to": "C34",
    "sourceRow": 179,
    "notes": "Revisit observation; don't silently choose a category"
  },
  {
    "from": "C40",
    "condition": "Used technology for an actual calculation",
    "to": "C40T",
    "sourceRow": 180,
    "notes": "Conditional; tool-based calculation only"
  },
  {
    "from": "C40T",
    "condition": "Explain result and reflect",
    "to": "C34",
    "sourceRow": 181,
    "notes": "Normal observation → aim → next maths loop"
  },
  {
    "from": "C40T",
    "condition": "Continue the active calculation",
    "to": "C40",
    "sourceRow": 182,
    "notes": "No extra tech gate when already explained"
  },
  {
    "from": "C40T",
    "condition": "Save a provisional explanation",
    "to": "C04",
    "sourceRow": 183,
    "notes": "Do not mark calculation or commentary complete"
  },
  {
    "from": "C40",
    "condition": "Check course suitability and depth",
    "to": "C40D",
    "sourceRow": 184,
    "notes": "On request or when actual maths is inadequate/uncertain"
  },
  {
    "from": "C50",
    "condition": "Recheck maths as investigation develops",
    "to": "C40D",
    "sourceRow": 185,
    "notes": "Actual methods may change from Planning"
  },
  {
    "from": "C40D",
    "condition": "Current method adequate: continue first maths",
    "to": "C40",
    "sourceRow": 186,
    "notes": "Record reasoning, don't invent more techniques"
  },
  {
    "from": "C40D",
    "condition": "Return to later maths",
    "to": "C50",
    "sourceRow": 187,
    "notes": "Preserve section and mathematical work"
  },
  {
    "from": "C40D",
    "condition": "Need teacher discussion about suitability",
    "to": "C03",
    "sourceRow": 188,
    "notes": "Course-specific concerns, including unsupported course"
  },
  {
    "from": "C40D",
    "condition": "Leave unresolved and return to dashboard",
    "to": "C04",
    "sourceRow": 189,
    "notes": "Keep reason and no fake rating"
  },
  {
    "from": "C70",
    "condition": "Check notation and maths presentation",
    "to": "C70N",
    "sourceRow": 190,
    "notes": "Optional or triggered by a specific communication concern"
  },
  {
    "from": "C70N",
    "condition": "Review finished or resume later",
    "to": "C04",
    "sourceRow": 191,
    "notes": "No global compulsory notation quiz"
  },
  {
    "from": "C70N",
    "condition": "Move to teacher draft",
    "to": "C80",
    "sourceRow": 192,
    "notes": "Use appropriately typeset mathematics in a full draft"
  },
  {
    "from": "C70N",
    "condition": "Save notes",
    "to": "C91",
    "sourceRow": 193,
    "notes": "Save snapshot, not final submission"
  },
  {
    "from": "C80",
    "condition": "Full teacher-draft review before written feedback",
    "to": "C80D",
    "sourceRow": 194,
    "notes": "Once near school's draft milestone; not on every session"
  },
  {
    "from": "C80D",
    "condition": "Full draft prepared",
    "to": "C80",
    "sourceRow": 195,
    "notes": "Return to school's teacher feedback process"
  },
  {
    "from": "C80D",
    "condition": "Missing essential work: jump to stage",
    "to": "C04",
    "sourceRow": 196,
    "notes": "Revision without losing earlier notes"
  },
  {
    "from": "C80D",
    "condition": "Save incomplete draft review",
    "to": "C91",
    "sourceRow": 197,
    "notes": "No false declaration of readiness"
  },
  {
    "from": "C90",
    "condition": "Final submission self-review",
    "to": "C90F",
    "sourceRow": 198,
    "notes": "Student chooses once after draft/revisions"
  },
  {
    "from": "C90F",
    "condition": "Check complete: save progress",
    "to": "C91",
    "sourceRow": 199,
    "notes": "Doesn't submit the school's IA"
  },
  {
    "from": "C90F",
    "condition": "Return to edit an identified section",
    "to": "C04",
    "sourceRow": 200,
    "notes": "Save results of checks and navigation"
  },
  {
    "from": "C90F",
    "condition": "Review teacher corrections",
    "to": "C80",
    "sourceRow": 201,
    "notes": "Don't initiate another written-feedback round"
  },
  {
    "from": "C04",
    "condition": "I'm stuck / Something isn't working",
    "to": "C95",
    "sourceRow": 202,
    "notes": "Optional help, persistent return location"
  },
  {
    "from": "C10",
    "condition": "Need help beginning writing",
    "to": "C95",
    "sourceRow": 203,
    "notes": "On demand without overwriting intro"
  },
  {
    "from": "C20",
    "condition": "Data access / collection problem",
    "to": "C95",
    "sourceRow": 204,
    "notes": "On demand, no fabricated data"
  },
  {
    "from": "C31",
    "condition": "No useful initial diagram",
    "to": "C95",
    "sourceRow": 205,
    "notes": "Diagram remains optional"
  },
  {
    "from": "C35",
    "condition": "Unsure what mathematics should come next",
    "to": "C95",
    "sourceRow": 206,
    "notes": "Use real observed result"
  },
  {
    "from": "C40",
    "condition": "Mathematics or software difficulty",
    "to": "C95",
    "sourceRow": 207,
    "notes": "Explain active maths only"
  },
  {
    "from": "C50",
    "condition": "Subsequent investigation has stalled",
    "to": "C95",
    "sourceRow": 208,
    "notes": "Keep earlier reflections"
  },
  {
    "from": "C70",
    "condition": "Writing / presentation trouble",
    "to": "C95",
    "sourceRow": 209,
    "notes": "Targeted help"
  },
  {
    "from": "C80",
    "condition": "Teacher draft / feedback obstacle",
    "to": "C95",
    "sourceRow": 210,
    "notes": "Respect school's one written feedback round"
  },
  {
    "from": "C03",
    "condition": "Access, consent or permission obstacle",
    "to": "C95",
    "sourceRow": 211,
    "notes": "Leave restrictions visible"
  },
  {
    "from": "C95",
    "condition": "I cannot get data",
    "to": "C95D",
    "sourceRow": 212,
    "notes": "Safe things to do now"
  },
  {
    "from": "C95",
    "condition": "Data are too limited or unusable",
    "to": "C95L",
    "sourceRow": 213,
    "notes": "Consider actual scope and quality"
  },
  {
    "from": "C95",
    "condition": "Look for an alternative source",
    "to": "C95A",
    "sourceRow": 214,
    "notes": "Compare mathematical relevance and provenance"
  },
  {
    "from": "C95",
    "condition": "Something else",
    "to": "C95Q",
    "sourceRow": 215,
    "notes": "Conditional stage-specific help"
  },
  {
    "from": "C95",
    "condition": "Pick just one next action",
    "to": "C95N",
    "sourceRow": 216,
    "notes": "Optional, no mandatory form"
  },
  {
    "from": "C95",
    "condition": "Back to project",
    "to": "C04",
    "sourceRow": 217,
    "notes": "Return to saved origin in website, dashboard fallback"
  },
  {
    "from": "C95D",
    "condition": "Write/revisit introduction",
    "to": "C10",
    "sourceRow": 218,
    "notes": "Aim and motivation available before data"
  },
  {
    "from": "C95D",
    "condition": "Make/revise prediction, reason, beneficiary",
    "to": "C02",
    "sourceRow": 219,
    "notes": "Keep it tentative, Not sure valid"
  },
  {
    "from": "C95D",
    "condition": "Find other primary/secondary data",
    "to": "C95A",
    "sourceRow": 220,
    "notes": "Assess source suitability first"
  },
  {
    "from": "C95D",
    "condition": "Plan source/method, sample, terms and units",
    "to": "C20",
    "sourceRow": 221,
    "notes": "Do not mark collected"
  },
  {
    "from": "C95D",
    "condition": "Ask about permission/access",
    "to": "C03",
    "sourceRow": 222,
    "notes": "No collection before approvals"
  },
  {
    "from": "C95D",
    "condition": "Record one step and Save if useful",
    "to": "C95N",
    "sourceRow": 223,
    "notes": "No compulsory plan"
  },
  {
    "from": "C95A",
    "condition": "Inspect alternative sources and method",
    "to": "C20",
    "sourceRow": 224,
    "notes": "Compare definitions, source/precision/coverage"
  },
  {
    "from": "C95A",
    "condition": "Change aim/beneficiary only if needed",
    "to": "C02",
    "sourceRow": 225,
    "notes": "Preserve history of original plan"
  },
  {
    "from": "C95A",
    "condition": "Source has too little or incompatible data",
    "to": "C95L",
    "sourceRow": 226,
    "notes": "Never invent or mix without justification"
  },
  {
    "from": "C95A",
    "condition": "Teacher approval needed",
    "to": "C03",
    "sourceRow": 227,
    "notes": "Retain permission flag"
  },
  {
    "from": "C95A",
    "condition": "Record source or next step",
    "to": "C95N",
    "sourceRow": 228,
    "notes": "Student decides"
  },
  {
    "from": "C95L",
    "condition": "Check data availability/method",
    "to": "C20",
    "sourceRow": 229,
    "notes": "Scope the maths honestly"
  },
  {
    "from": "C95L",
    "condition": "Seek appropriate alternate source",
    "to": "C95A",
    "sourceRow": 230,
    "notes": "No padding data"
  },
  {
    "from": "C95L",
    "condition": "Choose limited-scope conclusion or next check",
    "to": "C95N",
    "sourceRow": 231,
    "notes": "No unsupported claims"
  },
  {
    "from": "C95Q",
    "condition": "My result contradicts prediction",
    "to": "C34U",
    "sourceRow": 232,
    "notes": "Surprise investigated where it occurs"
  },
  {
    "from": "C95Q",
    "condition": "Can't choose or explain maths",
    "to": "C40D",
    "sourceRow": 233,
    "notes": "Active maths and course reviewed"
  },
  {
    "from": "C95Q",
    "condition": "Notation or mathematical communication",
    "to": "C70N",
    "sourceRow": 234,
    "notes": "On-demand targeted check"
  },
  {
    "from": "C95Q",
    "condition": "Draft or feedback help",
    "to": "C80D",
    "sourceRow": 235,
    "notes": "No unearned readiness"
  },
  {
    "from": "C95Q",
    "condition": "Access, consent or deadline issue",
    "to": "C03",
    "sourceRow": 236,
    "notes": "Current policies, teacher check"
  },
  {
    "from": "C95Q",
    "condition": "Other/Not sure",
    "to": "C95N",
    "sourceRow": 237,
    "notes": "Single next action or Save"
  },
  {
    "from": "C95N",
    "condition": "Write introduction now",
    "to": "C10",
    "sourceRow": 238,
    "notes": "Restore earlier draft"
  },
  {
    "from": "C95N",
    "condition": "Review provisional prediction",
    "to": "C02",
    "sourceRow": 239,
    "notes": "No false evidence"
  },
  {
    "from": "C95N",
    "condition": "Research source/method",
    "to": "C20",
    "sourceRow": 240,
    "notes": "Pending ≠ obtained"
  },
  {
    "from": "C95N",
    "condition": "Resume maths with real evidence",
    "to": "C40",
    "sourceRow": 241,
    "notes": "Do not proceed from invented observations"
  },
  {
    "from": "C95N",
    "condition": "Return to my previous work",
    "to": "C04",
    "sourceRow": 242,
    "notes": "Restore origin stage in website; dashboard fallback"
  },
  {
    "from": "C95N",
    "condition": "Save this obstacle and action",
    "to": "C91",
    "sourceRow": 243,
    "notes": "Resume with same issue and chosen task"
  },
  {
    "from": "C04",
    "condition": "Where should I write this? (optional)",
    "to": "C96",
    "sourceRow": 244,
    "notes": "Current stage context; hide when nothing new; exact stage return pointer"
  },
  {
    "from": "C10",
    "condition": "Optional placement help for introduction",
    "to": "C96",
    "sourceRow": 245,
    "notes": "Student may ask but never force writing prompt"
  },
  {
    "from": "C20",
    "condition": "Write about THIS chosen data/source method",
    "to": "C96",
    "sourceRow": 246,
    "notes": "Only when actual method/source relevant; pending means planning note"
  },
  {
    "from": "C22",
    "condition": "Write selection rationale at the right place",
    "to": "C96",
    "sourceRow": 247,
    "notes": "Confirm chosen/used method and actual alternative first"
  },
  {
    "from": "C26",
    "condition": "Already explained data choice or write it now?",
    "to": "C96",
    "sourceRow": 248,
    "notes": "Preserve prior section reference, don't duplicate"
  },
  {
    "from": "C32",
    "condition": "Where to introduce this figure/calculation",
    "to": "C96",
    "sourceRow": 249,
    "notes": "Before output; purpose + definitions; actual figure not compulsory"
  },
  {
    "from": "C34",
    "condition": "Write interpretation after meaningful result",
    "to": "C96",
    "sourceRow": 250,
    "notes": "After actual output, only when not adequately covered"
  },
  {
    "from": "C35",
    "condition": "Write the bridge to next mathematics",
    "to": "C96",
    "sourceRow": 251,
    "notes": "Justified next question before new method starts"
  },
  {
    "from": "C40",
    "condition": "Where to justify/interpret active mathematics",
    "to": "C96",
    "sourceRow": 252,
    "notes": "Method before working, results/limitations when active"
  },
  {
    "from": "C50",
    "condition": "Place reflection with later meaningful findings",
    "to": "C96",
    "sourceRow": 253,
    "notes": "Return to actual result, not generic conclusion"
  },
  {
    "from": "C60",
    "condition": "Keep conclusion concise and in its place",
    "to": "C96",
    "sourceRow": 254,
    "notes": "Synthesis only; avoid repetition"
  },
  {
    "from": "C70",
    "condition": "Where to repair a communication issue",
    "to": "C96",
    "sourceRow": 255,
    "notes": "At original equation/figure/citation"
  },
  {
    "from": "C95",
    "condition": "Can I write anything useful while stuck?",
    "to": "C96",
    "sourceRow": 256,
    "notes": "Distinguish private progress note from IA-ready writing"
  },
  {
    "from": "C96",
    "condition": "Return to my original stage (with cue status)",
    "to": "C04",
    "sourceRow": 257,
    "notes": "Website returns to stored origin stage; dashboard is fallback"
  },
  {
    "from": "C96",
    "condition": "Save writing state / resume later",
    "to": "C91",
    "sourceRow": 258,
    "notes": "Preserve cue/trigger/status/section reference"
  },
  {
    "from": "C96",
    "condition": "Do a planning-only next action instead",
    "to": "C95N",
    "sourceRow": 259,
    "notes": "No invented data or completed method statement"
  },
  {
    "from": "C35",
    "condition": "Pearson r was ACTUALLY calculated: contextual next-step ideas",
    "to": "C35P",
    "sourceRow": 260,
    "notes": "Post-PMCC branch only AFTER a real coefficient and its C34/C34B interpretation; not on first scatter or Planning prediction"
  },
  {
    "from": "C35P",
    "condition": "Useful apparent linear association; prediction/model would benefit aim",
    "to": "C35",
    "sourceRow": 261,
    "notes": "Optional next step: fit/interprete an appropriate line and later inspect fit, domain, parameters; student chooses and justifies, not automatic regression"
  },
  {
    "from": "C35P",
    "condition": "Little evidence of LINEAR association in these data",
    "to": "C35",
    "sourceRow": 262,
    "notes": "Inspect real scatter for curvature/subgroups/unusual values/range; only then consider justified alternate method or an honest limited finding, not correlation fishing"
  },
  {
    "from": "C35P",
    "condition": "Moderate, uncertain or context-dependent linear relationship",
    "to": "C35",
    "sourceRow": 263,
    "notes": "Clarify what the actual sample r tells you and whether precision/aim justify additional mathematics; no rigid strength threshold"
  },
  {
    "from": "C35P",
    "condition": "Coefficient and scatter disagree or result is unexpected",
    "to": "C34U",
    "sourceRow": 264,
    "notes": "Check observed pattern/data, domain and actual limitations; explain discrepancy next to output rather than bypassing it"
  },
  {
    "from": "C35P",
    "condition": "No useful further calculation is necessary",
    "to": "C35",
    "sourceRow": 265,
    "notes": "Student returns to C35, may choose conclusion when sufficient appropriate mathematics; no quota"
  },
  {
    "from": "C35P",
    "condition": "Need to reread/interprete the actual r or result",
    "to": "C34",
    "sourceRow": 266,
    "notes": "Return to original resultRef and latest local takeaway; preserve coefficient and existing text"
  },
  {
    "from": "C35P",
    "condition": "Save the next question or decide later",
    "to": "C04",
    "sourceRow": 267,
    "notes": "Keep PMCC result and tentative next-step choice; source data status unchanged"
  },
  {
    "from": "C35",
    "condition": "Enough relevant mathematics—bring findings together",
    "to": "C60",
    "sourceRow": 268,
    "notes": "Stop looping when current aim can be answered or honestly scoped, actual maths suitably substantial; no mandatory extra method or automatic grade"
  },
  {
    "from": "C35",
    "condition": "Unsure whether chosen NEXT maths is course-appropriate",
    "to": "C40D",
    "sourceRow": 269,
    "notes": "Optional teacher/course level check of proposed technique; no artificial complexity"
  },
  {
    "from": "C35H",
    "condition": "PMCC result already calculated; see appropriate follow-ups",
    "to": "C35P",
    "sourceRow": 270,
    "notes": "Only if PMCC actually performed and the prior result was interpreted; scatter-only use C35B"
  },
  {
    "from": "C50",
    "condition": "New meaningful result already interpreted: revisit next-step decision",
    "to": "C35",
    "sourceRow": 271,
    "notes": "Only if C34/C34B reflection is complete for latest section; otherwise use C50→C34, no bypassing interpretation"
  },
  {
    "from": "C33",
    "condition": "Check earlier recorded source/measurement precision for this figure",
    "to": "C24",
    "sourceRow": 272,
    "notes": "Optional ONLY when C24 accuracy missing/changed or real axis precision unclear; save return pointer C33; don't restart data collection"
  },
  {
    "from": "C24",
    "condition": "Return to current figure after accuracy clarification",
    "to": "C33",
    "sourceRow": 273,
    "notes": "Only if originStage was C33; otherwise use normal collection path; preserve diagram state"
  },
  {
    "from": "C24",
    "condition": "Return to current numerical result's accuracy reflection",
    "to": "C34A",
    "sourceRow": 274,
    "notes": "Only if originStage was C34A; active result must exist; avoid changing written prose automatically"
  },
  {
    "from": "C24",
    "condition": "Return to active first mathematical calculation",
    "to": "C40",
    "sourceRow": 275,
    "notes": "Only if originStage was C40 and genuine active maths/result exists; a planning-only C24 review cannot bypass current method setup"
  },
  {
    "from": "C50",
    "condition": "Check earlier input/source precision relevant to later mathematics",
    "to": "C24",
    "sourceRow": 276,
    "notes": "Optional targeted accuracy review if data/source has changed or output accuracy is uncertain; preserve C50 work and stage"
  },
  {
    "from": "C24",
    "condition": "Return to active later mathematical section",
    "to": "C50",
    "sourceRow": 277,
    "notes": "Only if originStage was C50, preserve previous maths and source history; no fictitious completed method"
  },
  {
    "from": "C35",
    "condition": "Check syllabus level of newly chosen mathematics (optional)",
    "to": "C40D",
    "sourceRow": 278,
    "notes": "Only if new technique is uncertain/partly beyond; teacher check does not stall work"
  },
  {
    "from": "C40D",
    "condition": "I need to explain mathematics beyond this course",
    "to": "C40L",
    "sourceRow": 279,
    "notes": "Only after student confirms outside/partly outside or requests help. Not an automatic detour"
  },
  {
    "from": "C40",
    "condition": "First-use beyond-syllabus explanation or new independent research",
    "to": "C40L",
    "sourceRow": 280,
    "notes": "Offer only when relevant to current ACTUAL technique and before first use; preserve active calculation"
  },
  {
    "from": "C50",
    "condition": "First-use mathematics explanation in this later section",
    "to": "C40L",
    "sourceRow": 281,
    "notes": "Only for current novel/beyond-course technique; no repeated general tutorials"
  },
  {
    "from": "C34B",
    "condition": "I genuinely learned something mathematically from this result",
    "to": "C40L",
    "sourceRow": 282,
    "notes": "Optional AFTER a real result, once the aim-link is understood; no fake personal engagement"
  },
  {
    "from": "C40L",
    "condition": "Continue first substantial mathematics",
    "to": "C40",
    "sourceRow": 283,
    "notes": "Only if originStage C40 or first-method setup; keep chosen technique/notes"
  },
  {
    "from": "C40L",
    "condition": "Continue later mathematical section",
    "to": "C50",
    "sourceRow": 284,
    "notes": "Only if originStage C50; preserve section ID and student writing"
  },
  {
    "from": "C40L",
    "condition": "Return to the mathematical result and its aim-linked reflection",
    "to": "C34B",
    "sourceRow": 285,
    "notes": "Only if originStage C34B and actual resultRef exists"
  },
  {
    "from": "C40L",
    "condition": "Return to course suitability/teacher check",
    "to": "C40D",
    "sourceRow": 286,
    "notes": "When course status or understood level is still uncertain"
  },
  {
    "from": "C40L",
    "condition": "Return to the next-method decision",
    "to": "C35",
    "sourceRow": 287,
    "notes": "If originStage C35; no forced new maths"
  },
  {
    "from": "C40L",
    "condition": "Save current learning note and resume",
    "to": "C91",
    "sourceRow": 288,
    "notes": "Persist method course classification, student learning source, own explanation and resume pointer"
  }
]);
export const C_PROMPTS=Object.freeze([
  {
    "id": "CO01",
    "node": "C00",
    "stage": "Get started",
    "prompt": "How would you like to continue?",
    "trigger": "Do not require a document for same-session handover.",
    "sourceRow": 9
  },
  {
    "id": "CO02",
    "node": "C01",
    "stage": "Resume from file",
    "prompt": "Choose your saved IA Pathfinder planning PDF or Word document.",
    "trigger": "If unsupported, offer retry/manual path.",
    "sourceRow": 10
  },
  {
    "id": "CO03",
    "node": "C02",
    "stage": "Review carried-forward plan",
    "prompt": "Is this still your current investigation aim and Maths course?",
    "trigger": "Student confirms values; none is locked.",
    "sourceRow": 11
  },
  {
    "id": "CO04",
    "node": "C02",
    "stage": "Review carried-forward plan",
    "prompt": "Which of these ideas, deadlines and proposed methods have changed?",
    "trigger": "Never mark planned data as already collected.",
    "sourceRow": 12
  },
  {
    "id": "CO05",
    "node": "C03",
    "stage": "Current status / permissions",
    "prompt": "Do you still need any teacher guidance or permission before carrying out your method?",
    "trigger": "Do not assume approval when a PDF/Word was uploaded.",
    "sourceRow": 13
  },
  {
    "id": "CO06",
    "node": "C04",
    "stage": "Select what to work on",
    "prompt": "What would you like to work on today? If something is preventing progress, select 'I'm stuck' for one helpful alternative—not a long questionnaire.",
    "trigger": "All help can be dismissed; preserve stage and draft. Don't repeatedly present checklists or require students to solve an obstacle before continuing.",
    "sourceRow": 14
  },
  {
    "id": "IN01",
    "node": "C10",
    "stage": "Introduction",
    "prompt": "WRITE IN YOUR IA NOW: use your current aim and authentic interest to draft a concise opening in your own words. Do you want to use, edit or skip the planning note?",
    "trigger": "Use real aim/motivation. Preserve existing introduction prose; no invented result.",
    "sourceRow": 15
  },
  {
    "id": "IN02",
    "node": "C10",
    "stage": "Introduction",
    "prompt": "What is the minimum context or terminology your reader needs to understand why you chose this problem?",
    "trigger": "Avoid an extended background section; the introduction is deliberately brief and details can appear when needed in the exploration.",
    "sourceRow": 16
  },
  {
    "id": "IN03",
    "node": "C10",
    "stage": "Introduction",
    "prompt": "Would mentioning your original prediction and WHY help explain where you are starting?",
    "trigger": "Never force a prediction, especially if the student was unsure or on a no-data route; a prediction is not an established result. Student may update it later.",
    "sourceRow": 17
  },
  {
    "id": "DA01",
    "node": "C20",
    "stage": "Data / method",
    "prompt": "Are you working with actual collected/verified evidence or still PLANNING? If pending, write the introduction/prediction now and keep data-method ideas as Pathfinder notes.",
    "trigger": "Do not show a 'write collected data' prompt until data source/procedure truly used.",
    "sourceRow": 18
  },
  {
    "id": "DA02",
    "node": "C20",
    "stage": "Data / method",
    "prompt": "When you FIRST describe the method or source you ACTUALLY used in your IA, explain why [chosen method] best supports [aim] compared with [real alternative]. Does a confirmed limitation affect what can be concluded?",
    "trigger": "Use selected statistics/census/modelling/secondary-data method; not a universal template or premature technique limitation.",
    "sourceRow": 19
  },
  {
    "id": "DA03",
    "node": "C20",
    "stage": "Data / method",
    "prompt": "Is your intended collection/source access permitted and ethically appropriate? What still needs to be confirmed?",
    "trigger": "Do not treat a planning report or teacher check-in as permission. Continue safe writing but avoid affected restricted collection before approvals.",
    "sourceRow": 20
  },
  {
    "id": "VI01",
    "node": "C30",
    "stage": "First representation",
    "prompt": "Which initial diagram, brief calculation, compact summary or small theoretical case would most usefully reveal what to investigate next? A figure is not compulsory.",
    "trigger": "Do not force a plot or lengthy table; use the Initial Exploration Guide. If no diagram helps, start an appropriate calculation or progress to later maths.",
    "sourceRow": 21
  },
  {
    "id": "VI02",
    "node": "C30",
    "stage": "First representation",
    "prompt": "WRITE IN YOUR IA NOW—immediately BEFORE this real diagram or calculation: what does it help the reader investigate, and why is that useful for [aim]? Define any new symbols here.",
    "trigger": "Show purposeful diagram/calculation introduction; bring forward relevant C24 units and measurement/source accuracy to help figure design without making a new limitations paragraph. Suppress if already explained.",
    "sourceRow": 22
  },
  {
    "id": "VI03",
    "node": "C30",
    "stage": "First representation",
    "prompt": "For this ACTUAL figure, recall the previously recorded [quantity/units/source resolution] from C24. Are axes, scales, labels and displayed precision defensible, with the whole figure legible on one printed page?",
    "trigger": "This is a figure-quality action, not text to paste into the IA.",
    "sourceRow": 23
  },
  {
    "id": "VI04",
    "node": "C30",
    "stage": "First reflection",
    "prompt": "WRITE DIRECTLY AFTER this ACTUAL first figure or calculation: what does it show about [current aim] and [intended beneficiary]? Compare with the original prediction if useful. Does any NEW accuracy issue change that meaning?",
    "trigger": "Aim interpretation is the core question. Reuse C24 accuracy where relevant and mention only a new consequential limitation beside the result; routine algebra requires no separate paragraph.",
    "sourceRow": 24
  },
  {
    "id": "VI05",
    "node": "C30",
    "stage": "First reflection",
    "prompt": "NEXT LOGICAL MATHEMATICAL STEP: after the previous ACTUAL result, what did this section establish, which worthwhile mathematical question remains, and why would [chosen method] help answer it? Write the bridge BEFORE starting new maths.",
    "trigger": "This is REPEATABLE C35 after first AND every later substantive result; no fixed number of mathematical sections, no mandatory Pearson's r or regression.",
    "sourceRow": 25
  },
  {
    "id": "MA01",
    "node": "C40",
    "stage": "First maths",
    "prompt": "Just BEFORE this first substantial method, explain WHY [chosen technique] follows from [previous real finding] and how it helps [aim]. If calculations use earlier measured/source quantities, check [C24 recorded precision and units] as you begin.",
    "trigger": "Before the mathematical section, explain WHY the chosen method helps the aim. If within the student's verified course, do not add a how-to/tutorial; if beyond it, C40L provides optional first-use explanation of unfamiliar maths in the student's own words.",
    "sourceRow": 26
  },
  {
    "id": "MA02",
    "node": "C40",
    "stage": "First maths",
    "prompt": "Define every NEW term, variable and necessary assumption directly BEFORE its FIRST mathematical use. Are these already clear in your IA?",
    "trigger": "Define all NEW symbols/units at first use. This is NOT a reason to teach a familiar syllabus method. Only an unfamiliar mathematical concept beyond the student's verified course needs a separate explanation of how it works.",
    "sourceRow": 27
  },
  {
    "id": "MA03",
    "node": "C40",
    "stage": "First maths",
    "prompt": "IMMEDIATELY AFTER this meaningful ACTUAL calculation, explain what its result means for [current aim and beneficiary], at a defensible degree of reported accuracy informed by the relevant C24 inputs. Give a short local takeaway.",
    "trigger": "Primary reflection is what the real result means for the aim; after that, C40L can offer an OPTIONAL mathematical-learning insight when something was genuinely understood for the first time. Don't manufacture learning.",
    "sourceRow": 28
  },
  {
    "id": "MA04",
    "node": "C40",
    "stage": "First maths",
    "prompt": "Does a limitation of the method you ACTUALLY used change what you can conclude about [aim]? If so, explain that consequence beside this result. Has your earlier data-source/accuracy limitation already covered it?",
    "trigger": "Only NEW consequential technique-specific limitations after actual use. Earlier accuracy rules should be applied rather than restated; focus mathematical consequences, not equipment frustration.",
    "sourceRow": 29
  },
  {
    "id": "FU01",
    "node": "C50",
    "stage": "Further maths",
    "prompt": "What did your PREVIOUS substantive section actually establish? Which mathematical question now follows logically, if any?",
    "trigger": "A changed dataset or additional measurements may change uncertainty; revisit C24 and adapt the explanation of limitations, not just the calculations.",
    "sourceRow": 30
  },
  {
    "id": "FU02",
    "node": "C50",
    "stage": "Further maths",
    "prompt": "Which specific course-appropriate technique will clarify THAT unanswered question, and WHY is it a better next move than merely repeating calculations?",
    "trigger": "Use genuine next-method rationale. Check actual course match (within / partly beyond / outside / unsure) separately from whether the student independently researched it; no automatic sophistication benefit.",
    "sourceRow": 31
  },
  {
    "id": "FU03",
    "node": "C50",
    "stage": "Ongoing reflection",
    "prompt": "RIGHT AFTER this NEW substantial result, explain what it tells you about [aim]. Reapply the relevant earlier precision/uncertainty decision when reporting it; state any NEW method-specific limitation that affects its meaning, then record a short takeaway before choosing the next step.",
    "trigger": "After an actual meaningful result, connect to aim and real mathematical consequences. Offer optional genuine mathematical insight, not a compulsory second paragraph after every routine algebra line.",
    "sourceRow": 32
  },
  {
    "id": "CN01",
    "node": "C60",
    "stage": "Conclusion — main answer",
    "prompt": "In your CONCLUSION now, bring together your strongest actual findings into one best-supported answer to [aim]. What remains uncertain?",
    "trigger": "Synthesis only; do not re-describe individual graphs and workings.",
    "sourceRow": 33
  },
  {
    "id": "CN02",
    "node": "C60",
    "stage": "Conclusion — significance",
    "prompt": "In the CONCLUSION, explain what your combined answer means for [beneficiary], and a meaningful next question if one arises.",
    "trigger": "No recycled detailed limitations, manufactured practical impact or duplicated calculations.",
    "sourceRow": 34
  },
  {
    "id": "PR01",
    "node": "C70",
    "stage": "Presentation",
    "prompt": "Review your existing mathematical writing: are definitions, notation and logic clear at their ORIGINAL points of use? Edit those passages rather than adding a new explanation here.",
    "trigger": "Editorial review, not a paragraph for the IA.",
    "sourceRow": 35
  },
  {
    "id": "PR02",
    "node": "C70",
    "stage": "Presentation",
    "prompt": "Have you cited every data source and placed excessive raw data or repeated work appropriately?",
    "trigger": "Use references and appendix without dumping full dataset into main IA.",
    "sourceRow": 36
  },
  {
    "id": "FB01",
    "node": "C80",
    "stage": "Draft and feedback",
    "prompt": "Is your teacher's draft complete enough for meaningful feedback?",
    "trigger": "The teacher draft should be COMPLETE and student self-checked against A–E before the one permitted written feedback round. Encourage print-read, citations and readable equations/figures; no automatic grades.",
    "sourceRow": 37
  },
  {
    "id": "FB02",
    "node": "C80",
    "stage": "Teacher feedback",
    "prompt": "Record actual teacher feedback as a PRIVATE action note. When revising the IA, change the mathematics/interpretation exactly WHERE the issue arose.",
    "trigger": "Don't copy teacher feedback into an IA section or imply second written draft review.",
    "sourceRow": 38
  },
  {
    "id": "FB03",
    "node": "C80",
    "stage": "Corrections",
    "prompt": "What will you correct first, and how will you check it worked?",
    "trigger": "Review actual work after feedback, not automatic approval.",
    "sourceRow": 39
  },
  {
    "id": "CK01",
    "node": "C90",
    "stage": "Self-review A–E",
    "prompt": "Before the full teacher draft and again before final submission, where can you point to evidence for Criteria A–E? Check actual mathematics at an appropriate course level and meaningful reflection throughout.",
    "trigger": "Guide: A presentation, B communication, C engagement, D reflection, E mathematics.",
    "sourceRow": 40
  },
  {
    "id": "CK02",
    "node": "C90",
    "stage": "Final check",
    "prompt": "Have you read your finished IA, checked citations and mathematical accuracy, and confirmed deadlines?",
    "trigger": "Check current school instructions for title/identifier, consistent citation style, proofreading, page numbering, suggested spacing/length and deadlines. Print/PDF preview every graph. This is student review, not an automatic mark.",
    "sourceRow": 41
  },
  {
    "id": "SV01",
    "node": "C91",
    "stage": "Save / resume",
    "prompt": "Would you like to save a progress document to reupload later?",
    "trigger": "Must be reimportable; not a teacher submission.",
    "sourceRow": 42
  },
  {
    "id": "IN04",
    "node": "C10",
    "stage": "Introduction: meaningful purpose",
    "prompt": "Who might benefit from knowing the answer, and why is this investigation worth doing?",
    "trigger": "Suggest personal relevance in the student's own voice; avoid invented motivation or inflated claims about practical impact.",
    "sourceRow": 43
  },
  {
    "id": "CN03",
    "node": "C60",
    "stage": "Conclusion: meaningful outcome",
    "prompt": "Now that you have results, what can you reasonably decide for yourself or recommend to your intended audience? What evidence supports that?",
    "trigger": "Revisit the student's 'If this were true...' statement, then compare with real results. Advise only on what the evidence actually supports.",
    "sourceRow": 44
  },
  {
    "id": "CK03",
    "node": "C90",
    "stage": "Final self-check: impact",
    "prompt": "Does your conclusion return to who would benefit, and distinguish evidence-based advice from speculation?",
    "trigger": "An uncertain result can still be valuable; do not force unwarranted practical advice.",
    "sourceRow": 45
  },
  {
    "id": "IN05",
    "node": "C10",
    "stage": "Introduction · length",
    "prompt": "Try to keep your introduction comfortably under one page. A few short paragraphs—perhaps half a page or less—are often plenty.",
    "trigger": "This is a helpful writing recommendation, not an IB-mandated length requirement. Detailed maths, graphs and results belong in the exploration.",
    "sourceRow": 46
  },
  {
    "id": "IN06",
    "node": "C10",
    "stage": "Introduction · use earlier aim",
    "prompt": "Would you like to use, edit or skip your investigation aim from Planning?",
    "trigger": "Prefill the suggestion, NOT a completed prose paragraph; editing updates the confirmed planning aim, preserves drafted introduction text.",
    "sourceRow": 47
  },
  {
    "id": "IN07",
    "node": "C10",
    "stage": "Introduction · personal relevance",
    "prompt": "Would you like to refer to why you chose this topic, who might benefit and what the answer could help you or them decide?",
    "trigger": "Only show fields that exist. Encourage authentic purpose, not a made-up social impact; student can change the proposed beneficiary.",
    "sourceRow": 48
  },
  {
    "id": "IN08",
    "node": "C10",
    "stage": "Introduction · prediction",
    "prompt": "Would your initial prediction—and why you expected it—help explain how the investigation began?",
    "trigger": "Use only when meaningful and supplied. No obligation to state a prediction; it may be revised in the light of results.",
    "sourceRow": 49
  },
  {
    "id": "IN09",
    "node": "C10",
    "stage": "Introduction · brief route",
    "prompt": "Would one short sentence about your intended approach help orient the reader?",
    "trigger": "Outline the approach only; save calculations, methodology detail and conclusions for later sections.",
    "sourceRow": 50
  },
  {
    "id": "IN10",
    "node": "C10",
    "stage": "Introduction · write personally",
    "prompt": "It is fine—and often more engaging—to write in the first person. For example: 'I noticed…', 'I wanted to find out whether…', or 'I expect… because…'.",
    "trigger": "First person can sound natural, without a fabricated backstory. Offer optional contrast between a weak and a clearer real-purpose introduction at C10E; students must write their own wording.",
    "sourceRow": 51
  },
  {
    "id": "IN11",
    "node": "C10",
    "stage": "Introduction · revise anytime",
    "prompt": "You can return to your introduction at any point. As the data and mathematics develop, you may need to refine your aim, prediction, focus or description of what you are investigating.",
    "trigger": "Never lock this stage as permanently complete; returning restores the previous draft, allowing revision without wiping other work.",
    "sourceRow": 52
  },
  {
    "id": "IN12",
    "node": "C10",
    "stage": "Introduction · edit supporting details",
    "prompt": "Want to change an earlier planning detail? Edit the suggested aim, personal purpose or prediction, then come straight back to your introduction.",
    "trigger": "Preserve written draft; show a gentle prompt to check any text that may now be outdated. Never silently rewrite authored prose.",
    "sourceRow": 53
  },
  {
    "id": "IN13",
    "node": "C10",
    "stage": "Introduction · quick self-check",
    "prompt": "Have you told the reader what you want to explore and why it matters, without beginning a long explanation of your mathematics?",
    "trigger": "The introduction can remain a provisional draft. Do not insist on filling every suggested element before proceeding.",
    "sourceRow": 54
  },
  {
    "id": "VI06",
    "node": "C34",
    "stage": "What I notice",
    "prompt": "Immediately AFTER this ACTUAL result, describe the important observation AND why it matters for [current aim]; refer to real values, not just the procedure or graph appearance.",
    "trigger": "Only meaningful actual observation; suppress for repeated/intermediate calculations.",
    "sourceRow": 93
  },
  {
    "id": "VI07",
    "node": "C34A",
    "stage": "Accuracy, only if needed",
    "prompt": "Earlier you established [quantity, units, source/measurement precision and any justified uncertainty] at C24. Does that rule affect the accuracy you can responsibly report for THIS result? Apply it; only write a NEW consequential effect beside the result.",
    "trigger": "Use sensible working precision; final derived accuracy depends on the calculation and evidence, not automatically the original number of decimal places. No fabricated uncertainty or repeated limitations paragraph.",
    "sourceRow": 94
  },
  {
    "id": "VI08",
    "node": "C34B",
    "stage": "Back to the aim",
    "prompt": "IMMEDIATELY after this real figure/calculation, explain specifically what its value or pattern means for [current aim/beneficiary] and what question it has answered (or left unresolved).",
    "trigger": "Aim-link comes FIRST and remains essential. After actual substantial maths, offer optional 'what did you learn mathematically?' only for an authentic change in understanding, in context beside the result.",
    "sourceRow": 95
  },
  {
    "id": "VI09",
    "node": "C34B",
    "stage": "Back to the prediction",
    "prompt": "Beside the actual result, say whether it supports, challenges or leaves [original prediction and WHY] unresolved.",
    "trigger": "Preserve original dated prediction; one plot need not establish proof.",
    "sourceRow": 96
  },
  {
    "id": "VI10",
    "node": "C34U",
    "stage": "Unexpected? Investigate",
    "prompt": "DIRECTLY AFTER this unexpected result, write what differs and why a particular alternative explanation or test would be worth exploring.",
    "trigger": "Considered ≠ tested; no fabricated reason or suppression of contrary data.",
    "sourceRow": 97
  },
  {
    "id": "VI11",
    "node": "C35",
    "stage": "Next step from evidence",
    "prompt": "Between the previous LOCAL conclusion and the NEXT calculation, write why [chosen next technique] logically follows from [actual finding] and which new mathematical question it will answer. Use your own words.",
    "trigger": "This transition must follow the prior aim-linked conclusion and respect any established accuracy/scope boundary. Only justify the next method when it answers a real open question; do not re-list earlier limitations.",
    "sourceRow": 98
  },
  {
    "id": "VI12",
    "node": "C35H",
    "stage": "Show relevant examples",
    "prompt": "Would you like up to TWO possible logical next investigations based on the latest ACTUAL result, such as a real PMCC, fitted model, optimum or theoretical finding?",
    "trigger": "If PMCC ACTUALLY calculated, use C35P; before computing r, only use observed scatter pattern C35B. Do not fish for a desirable correlation.",
    "sourceRow": 99
  },
  {
    "id": "VI13",
    "node": "C34U",
    "stage": "Look from another angle",
    "prompt": "Could a justified alternative view, comparison, calculation or counterexample illuminate this unexpected result?",
    "trigger": "Avoid repeated decorative plots, p-hacking or hunting only for a preferred answer.",
    "sourceRow": 100
  },
  {
    "id": "VI14",
    "node": "C34U",
    "stage": "Revise mathematical plan?",
    "prompt": "Is your originally intended method still appropriate now that you've seen this result?",
    "trigger": "Changing mathematical direction can be good reflection; don't lose the original prediction.",
    "sourceRow": 101
  },
  {
    "id": "CN03",
    "node": "C61",
    "stage": "Synthesize real results",
    "prompt": "Which two or three actual findings together support the most useful overall answer?",
    "trigger": "SYNTHESISE, don't list every graph/table or repeat calculated steps. Results may be partly inconclusive.",
    "sourceRow": 113
  },
  {
    "id": "CN04",
    "node": "C61",
    "stage": "Original prediction, if relevant",
    "prompt": "Does your original expectation affect your final interpretation? If so, how?",
    "trigger": "Never paste a duplicate evaluation of unexpected results or replace the original prediction.",
    "sourceRow": 114
  },
  {
    "id": "CN05",
    "node": "C62",
    "stage": "Significance for intended audience",
    "prompt": "What does the combined result mean for you or whoever might benefit?",
    "trigger": "Don't invent an effect, prove causation by association or manufacture advice for a theoretical project.",
    "sourceRow": 115
  },
  {
    "id": "CN06",
    "node": "C62",
    "stage": "One essential boundary (if needed)",
    "prompt": "Is there one qualification the person using your conclusion must understand?",
    "trigger": "Refer to existing discussion. Do not re-list all limitations or suddenly evaluate every method in the conclusion.",
    "sourceRow": 116
  },
  {
    "id": "CN07",
    "node": "C63",
    "stage": "Future mathematical question",
    "prompt": "What worthwhile mathematical investigation might follow naturally from what you actually found?",
    "trigger": "Suggestions optional and matched to REAL outcomes; no generic 'more data' unless specific mathematical benefit.",
    "sourceRow": 117
  },
  {
    "id": "CN08",
    "node": "C63",
    "stage": "Why that extension helps",
    "prompt": "What new mathematics, data or comparison would your proposed next step use—and what might that add to the original aim?",
    "trigger": "Do not complete a new calculation in the conclusion or present work already performed as a future step.",
    "sourceRow": 118
  },
  {
    "id": "CN09",
    "node": "C64",
    "stage": "Remove repetition",
    "prompt": "Would anything important be lost if you deleted repeated graph descriptions, calculations, methodological details or a list of earlier limitations?",
    "trigger": "If no, remove repetition; one short reference to earlier evidence is enough.",
    "sourceRow": 119
  },
  {
    "id": "CN10",
    "node": "C64",
    "stage": "Evaluate at the right point",
    "prompt": "Have you already reflected on important method choices, accuracy, surprises and changed direction where they actually occurred?",
    "trigger": "Do NOT manufacture a large final evaluation paragraph to replace missing reflection earlier.",
    "sourceRow": 120
  },
  {
    "id": "CN11",
    "node": "C64",
    "stage": "Student's own concise voice",
    "prompt": "Does this read like a clear mathematical conclusion that draws things together and looks forward, rather than a list of everything you did?",
    "trigger": "No generated formulaic conclusion, rigid headings, prescribed page count or prewritten advice.",
    "sourceRow": 121
  },
  {
    "id": "SC01",
    "node": "C40",
    "stage": "Method purpose",
    "prompt": "What mathematical question will this calculation answer and WHY is it appropriate now?",
    "trigger": "No pressure to add techniques merely for difficulty.",
    "sourceRow": 141
  },
  {
    "id": "SC02",
    "node": "C40T",
    "stage": "Technology purpose",
    "prompt": "When technology ACTUALLY calculates something, explain WHAT it calculated and WHY beside that output—not the menu buttons.",
    "trigger": "No technology writing prompt when not used.",
    "sourceRow": 142
  },
  {
    "id": "SC03",
    "node": "C40T",
    "stage": "Interpret tech output",
    "prompt": "Immediately AFTER the actual technology-generated result, interpret it in context with suitable units and accuracy.",
    "trigger": "No invented coefficients or pasted screenshot without understanding.",
    "sourceRow": 143
  },
  {
    "id": "SC04",
    "node": "C40T",
    "stage": "Justify model/test",
    "prompt": "Which assumption or range affects whether this tool's output can be trusted HERE?",
    "trigger": "No PMCC limitations before PMCC exists; avoid generic critique.",
    "sourceRow": 144
  },
  {
    "id": "SC05",
    "node": "C40D",
    "stage": "Course fit",
    "prompt": "Does [actual chosen technique] belong to my verified maths syllabus, partly extend it, fall beyond it, or am I unsure? If beyond/uncertain, can I demonstrate understanding and seek teacher suitability guidance?",
    "trigger": "Course-level classification is a private pathway decision, not automatic IA prose. Independently researched mathematics may still be on the course. Don't claim official coverage without verification.",
    "sourceRow": 145
  },
  {
    "id": "SC06",
    "node": "C40D",
    "stage": "Understanding and relevance",
    "prompt": "Can you explain why each substantial technique contributes to the aim and what the answer tells you?",
    "trigger": "In-course: apply correct maths without teaching the method; beyond-course: short first-use explanation of key mathematical principle in OWN words, with cited source and clear worked application. Always justify choice and interpret output.",
    "sourceRow": 146
  },
  {
    "id": "SC07",
    "node": "C70N",
    "stage": "Typeset equations",
    "prompt": "Have you written clear mathematical notation using an equation editor or other proper maths formatting?",
    "trigger": "Don't require a lesson about arithmetic/plotting in the IA.",
    "sourceRow": 147
  },
  {
    "id": "SC08",
    "node": "C70N",
    "stage": "Exact or approximate",
    "prompt": "For an ACTUAL rounded or estimated result, is '=' or '≈' appropriate? Does the reported accuracy respect the relevant C24 measurement/source precision and the calculation used?",
    "trigger": "Keep working precision; don't claim made-up measurement error.",
    "sourceRow": 148
  },
  {
    "id": "SC09",
    "node": "C35B",
    "stage": "Actual scatter pattern",
    "prompt": "Looking at your actual paired numerical scatter, is it clearly straight, approximately linear, curved, or showing no clear relationship?",
    "trigger": "No inference from predicted result and no forced PMCC.",
    "sourceRow": 149
  },
  {
    "id": "SC10",
    "node": "C35B",
    "stage": "Reasoned next maths",
    "prompt": "Before PMCC: what is the observed shape of this ACTUAL paired numerical scatter? The next-step choice may be different AFTER r is genuinely calculated.",
    "trigger": "Observed scatter (C35B) is separate from interpreted real Pearson coefficient (C35P); don't show r/its limitations for only a planned PMCC.",
    "sourceRow": 150
  },
  {
    "id": "SC11",
    "node": "C80D",
    "stage": "Teacher draft complete?",
    "prompt": "What worthwhile mathematical question follows from the last actual section's mini-conclusion, or does the current investigation already have enough relevant mathematics?",
    "trigger": "Actual PMCC triggers C35P on request; students choose and justify another method or stop, with course suitability and data evidence.",
    "sourceRow": 151
  },
  {
    "id": "SC12",
    "node": "C80D",
    "stage": "Evidence A–E",
    "prompt": "Can you point to evidence of A Presentation, B Communication, C Engagement, D Reflection, E Mathematics?",
    "trigger": "Do not generate numerical grade predictions.",
    "sourceRow": 152
  },
  {
    "id": "SC13",
    "node": "C80D",
    "stage": "Print and reader check",
    "prompt": "Have you printed or previewed the draft and found any unclear or split diagrams/equations?",
    "trigger": "Correct actual layout, not a hypothetical preview.",
    "sourceRow": 153
  },
  {
    "id": "SC14",
    "node": "C80D",
    "stage": "One written feedback",
    "prompt": "Are you preparing for the school's one permitted round of written teacher feedback?",
    "trigger": "Do not invite second written draft feedback or claim school submission.",
    "sourceRow": 154
  },
  {
    "id": "SC15",
    "node": "C80D",
    "stage": "Attributions and clarity",
    "prompt": "Are data, graphics and ideas cited consistently, and does the IA read like your own work?",
    "trigger": "2025 guide suggests MLA in Google Docs; follow current school/teacher style.",
    "sourceRow": 155
  },
  {
    "id": "SC16",
    "node": "C90F",
    "stage": "Before final: A–E",
    "prompt": "After feedback and revisions, what genuine evidence demonstrates each assessment criterion?",
    "trigger": "No automatic IA mark, no copying feedback paragraphs.",
    "sourceRow": 156
  },
  {
    "id": "SC17",
    "node": "C90F",
    "stage": "Revisions and proofreading",
    "prompt": "Have you applied the feedback, rechecked maths, proofread and print-previewed the final file?",
    "trigger": "No assumption feedback imported = change completed.",
    "sourceRow": 157
  },
  {
    "id": "SC18",
    "node": "C90F",
    "stage": "Current school format",
    "prompt": "Have you confirmed current final deadline, identity and bibliography/format requirements?",
    "trigger": "Suggested 12–20 pages and double-spacing aren't an automatic IB pass/fail rule.",
    "sourceRow": 158
  },
  {
    "id": "ST01",
    "node": "C95",
    "stage": "What isn't working?",
    "prompt": "What's making progress difficult right now?",
    "trigger": "Help stays optional, short and returnable; no mark implication.",
    "sourceRow": 168
  },
  {
    "id": "ST02",
    "node": "C95D",
    "stage": "Introduction while waiting",
    "prompt": "Data not available? You can WRITE your introduction in your IA NOW, using [aim], [motivation] and [beneficiary], without inventing a result.",
    "trigger": "Don't mark planned method as performed.",
    "sourceRow": 169
  },
  {
    "id": "ST03",
    "node": "C95D",
    "stage": "Tentative prediction",
    "prompt": "Can you record what you expect and WHY, or explain that you're unsure?",
    "trigger": "Prediction must remain tentative, not a finding.",
    "sourceRow": 170
  },
  {
    "id": "ST04",
    "node": "C95D",
    "stage": "Meaning if prediction true",
    "prompt": "If your expectation were true, what could that mean for the person you hope to advise?",
    "trigger": "No made-up impact or prediction forced if irrelevant.",
    "sourceRow": 171
  },
  {
    "id": "ST05",
    "node": "C95D",
    "stage": "Plan variables and definitions",
    "prompt": "What quantities, units, populations or specialist terms can you define before data arrive?",
    "trigger": "No mandatory glossary or invented measurements.",
    "sourceRow": 172
  },
  {
    "id": "ST06",
    "node": "C95D",
    "stage": "Prepare, don't pretend",
    "prompt": "Could you compare two feasible data methods or plan the first purposeful representation while you wait?",
    "trigger": "Planned methodology and diagrams aren't completed collection or observations.",
    "sourceRow": 173
  },
  {
    "id": "ST07",
    "node": "C95A",
    "stage": "Secondary source candidate",
    "prompt": "This is SOURCE SEARCH, so keep candidates in private Pathfinder notes. Only when a verified source is ACTUALLY used should you write its selection rationale in the IA.",
    "trigger": "A candidate URL isn't an IA data source until confirmed.",
    "sourceRow": 174
  },
  {
    "id": "ST08",
    "node": "C95A",
    "stage": "Source quality and fit",
    "prompt": "Do source definitions, units, population/time, accuracy, provenance and permissions support your intended maths and audience?",
    "trigger": "Don't treat a source as used until accessible and verified; cite origin.",
    "sourceRow": 175
  },
  {
    "id": "ST09",
    "node": "C95A",
    "stage": "Revising the aim",
    "prompt": "If this source answers a DIFFERENT question, would you like to revise the aim or keep looking?",
    "trigger": "No silent plan rewrite, retain original prediction and concerns.",
    "sourceRow": 176
  },
  {
    "id": "ST10",
    "node": "C95L",
    "stage": "Limited/poor data",
    "prompt": "What genuine observations do you have and what could their size, missingness, imbalance or accuracy prevent you concluding?",
    "trigger": "No fabricated values or unsupported population claims.",
    "sourceRow": 177
  },
  {
    "id": "ST11",
    "node": "C95Q",
    "stage": "Other specific issue",
    "prompt": "Is the problem the result, the next mathematics, software, writing, permission, deadline or something else?",
    "trigger": "Don't open every checklist or conflate practical delays with IA mathematical limitations.",
    "sourceRow": 178
  },
  {
    "id": "ST12",
    "node": "C95N",
    "stage": "One next action",
    "prompt": "What's ONE useful thing you can do now, even if the original problem remains unresolved?",
    "trigger": "No invented deadline or unnecessary full action plan.",
    "sourceRow": 179
  },
  {
    "id": "ST13",
    "node": "C95N",
    "stage": "Save and resume",
    "prompt": "Would you like to save this issue and return to your previous section later?",
    "trigger": "No automatic approval, issue resolution or implemented reminder.",
    "sourceRow": 180
  },
  {
    "id": "ST14",
    "node": "C95D",
    "stage": "Data status",
    "prompt": "Which is true: no usable data yet, some data but incomplete, accessible source found, or data verified and ready?",
    "trigger": "Don't show actual maths as completed based on a planned source.",
    "sourceRow": 181
  },
  {
    "id": "NS01",
    "node": "C34B",
    "stage": "Local section conclusion",
    "prompt": "Just AFTER the ACTUAL result, write a concise local conclusion: what did this numerical/pictorial/theoretical result show about [aim]? If its accuracy or method changes the claim, acknowledge only the relevant new consequence.",
    "trigger": "Write immediately AFTER result; no routine-algebra prompts or a duplicated final conclusion.",
    "sourceRow": 190
  },
  {
    "id": "NS02",
    "node": "C35",
    "stage": "Question still unanswered",
    "prompt": "From [previous actual result and local takeaway], what ONE worthwhile mathematical question remains?",
    "trigger": "Available after first figure and every later substantive result; never force a new question.",
    "sourceRow": 191
  },
  {
    "id": "NS03",
    "node": "C35",
    "stage": "Choose purposeful technique",
    "prompt": "Which actual mathematical question remains after the last aim-linked result, and WHY would [chosen technique] answer it? Check whether the earlier source/accuracy boundary affects that choice.",
    "trigger": "No disconnected extra mathematics or predetermined positive result.",
    "sourceRow": 192
  },
  {
    "id": "NS04",
    "node": "C35",
    "stage": "Write between sections",
    "prompt": "Just AFTER [previous section takeaway] and BEFORE [next calculation], explain why [new method] follows and what it will investigate.",
    "trigger": "One or two sentences, in student's voice; no system-authored final prose.",
    "sourceRow": 193
  },
  {
    "id": "NS05",
    "node": "C35",
    "stage": "Choose to stop or continue",
    "prompt": "Has the investigation now produced enough relevant, understood mathematics to answer the aim honestly, even if the answer is limited?",
    "trigger": "No calculation quota; don't automatically grant a grade or final readiness.",
    "sourceRow": 194
  },
  {
    "id": "NS06",
    "node": "C35P",
    "stage": "Only after real PMCC",
    "prompt": "You ACTUALLY calculated Pearson's r = [student's number] for [real paired variables]. What does it show about LINEAR association in this sample?",
    "trigger": "Do not show for proposed r, predicted linearity or merely visual estimate.",
    "sourceRow": 195
  },
  {
    "id": "NS07",
    "node": "C35P",
    "stage": "Linear fit if useful",
    "prompt": "If actual r and the scatter suggest a useful straight-line relationship, would fitting a line help predict [meaningful quantity] for [aim]?",
    "trigger": "Line is NOT compulsory and its validity/domain must be considered when actually fitted.",
    "sourceRow": 196
  },
  {
    "id": "NS08",
    "node": "C35P",
    "stage": "Weak r; examine another angle",
    "prompt": "Your r shows little LINEAR association in this sample. Does the real scatter show curvature, groups, unusual points or restricted range worth investigating?",
    "trigger": "No claim there is NO relationship, no guessed curve, and no p-hacking.",
    "sourceRow": 197
  },
  {
    "id": "NS09",
    "node": "C35P",
    "stage": "No alternative visible",
    "prompt": "If the linear prediction is unsupported and there's no convincing other pattern, is that finding itself meaningful for the original aim?",
    "trigger": "Never try correlations repeatedly until one becomes positive.",
    "sourceRow": 198
  },
  {
    "id": "NS10",
    "node": "C35P",
    "stage": "Unexpected sign/pattern",
    "prompt": "What exactly differs from [original prediction], and what real data feature or assumption would justify checking another interpretation?",
    "trigger": "No point deletion, invented explanation or quiet change to earlier hypothesis.",
    "sourceRow": 199
  },
  {
    "id": "NS11",
    "node": "C35P",
    "stage": "Do additional maths serve purpose?",
    "prompt": "Will your proposed regression/other measure answer a NEW worthwhile question, or just add more equations?",
    "trigger": "No automatic Spearman for every curve or rigid Pearson coefficient cut-offs.",
    "sourceRow": 200
  },
  {
    "id": "NS12",
    "node": "C40/C50",
    "stage": "Before each new section",
    "prompt": "What does the previous mathematical section conclude, and how does your next calculation follow from it?",
    "trigger": "Use same logic for FIRST and ALL later substantive maths, not for each algebraic step.",
    "sourceRow": 201
  },
  {
    "id": "NS13",
    "node": "C40/C50",
    "stage": "After significant result",
    "prompt": "RIGHT AFTER the new substantive result, what does it show about [aim]? When reporting its value, have you applied the earlier C24 measurement/source precision appropriately to this calculation? Does an ACTUAL new method limitation affect the claim?",
    "trigger": "Ask aim connection first; accuracy and limitation cues only when materially relevant. Skip duplicate discussions and routine algebra; preserve original evidence and writing status.",
    "sourceRow": 202
  },
  {
    "id": "NS14",
    "node": "C35",
    "stage": "How many sections?",
    "prompt": "Does another calculation genuinely help your investigation, or would your mathematical story be stronger by drawing things together now?",
    "trigger": "Never require a fixed number of methods, figures or pleasing results.",
    "sourceRow": 203
  },
  {
    "id": "NS15",
    "node": "C35",
    "stage": "Need help deciding",
    "prompt": "Would a relevant example or teacher discussion help you choose the next method for THIS result?",
    "trigger": "Keep help optional; no unsupported out-of-course technique.",
    "sourceRow": 204
  },
  {
    "id": "NS16",
    "node": "C35",
    "stage": "Plan changed during mathematics",
    "prompt": "If a result made you change model, data or method, how will you explain that change RIGHT HERE between sections?",
    "trigger": "Do not erase prior method/prediction or silently overwrite student text.",
    "sourceRow": 205
  },
  {
    "id": "AC01",
    "node": "C24",
    "stage": "Establish accuracy once",
    "prompt": "What is the ACTUAL source/resolution or justified uncertainty for [named quantity], in [units]? How might this affect later numerical results?",
    "trigger": "Do not invent an error range from d.p. alone. Planning-only source has no confirmed numeric accuracy.",
    "sourceRow": 213
  },
  {
    "id": "AC02",
    "node": "C33",
    "stage": "Recall when plotting",
    "prompt": "Earlier you recorded [C24 quantity + units + precision/source]. Does THIS graph's scale, labels and displayed accuracy respect it?",
    "trigger": "Primarily fix the graph, not write another limitations paragraph; no universal axis d.p. rule.",
    "sourceRow": 214
  },
  {
    "id": "AC03",
    "node": "C32",
    "stage": "Why before the figure?",
    "prompt": "Just BEFORE this figure or calculation, what does it help you investigate about [aim]? Are any new units or variables clear to the reader?",
    "trigger": "The earlier precision reminder may inform display; don't explain below-course plotting mechanics.",
    "sourceRow": 215
  },
  {
    "id": "AC04",
    "node": "C34B",
    "stage": "Aim-linked meaning first",
    "prompt": "Directly AFTER [actual result], what does the value or observation MEAN for [current aim]? Could it change your prediction or advice to [beneficiary]?",
    "trigger": "Prioritise aim over generic 'the graph shows'. No inference from imagined or planned results.",
    "sourceRow": 216
  },
  {
    "id": "AC05",
    "node": "C34A",
    "stage": "Apply earlier precision",
    "prompt": "C24 recorded [source/resolution and units]. Does this ACTUAL derived result or diagram require different reporting precision or a NEW uncertainty qualification?",
    "trigger": "Keep sufficient working precision; don't simply carry raw decimal places into derived numbers or invent ±.",
    "sourceRow": 217
  },
  {
    "id": "AC06",
    "node": "C40",
    "stage": "Justify current maths before use",
    "prompt": "WHY does [the mathematical method you are about to use] answer the question raised by [previous real result] and help with [aim]?",
    "trigger": "Never require a catalogue of alternatives or limitations of techniques not yet performed.",
    "sourceRow": 218
  },
  {
    "id": "AC07",
    "node": "C40/C50",
    "stage": "Report derived numerical result",
    "prompt": "You used [recorded quantities and units] with [C24 resolution/source precision] in [calculation]. Are the reported units/digits for [ACTUAL output] defensible, and what does it show about [aim]?",
    "trigger": "Do not assume input d.p. equals output d.p.; avoid premature rounding and fake bounds.",
    "sourceRow": 219
  },
  {
    "id": "AC08",
    "node": "C40/C50",
    "stage": "Current-method limitation",
    "prompt": "Only if the method has ACTUALLY been used: is there a specific assumption, domain or sensitivity which changes what [current result] can tell you about [aim]?",
    "trigger": "Do not repeat practical difficulty or earlier caveat if it doesn't add a new mathematical consequence.",
    "sourceRow": 220
  },
  {
    "id": "AC09",
    "node": "C35",
    "stage": "Purposeful next technique",
    "prompt": "Considering what the previous result REALLY established and what its accuracy/scope can support, WHY would [chosen next technique] be the most logical next step for [aim]?",
    "trigger": "Do not demand extra maths or repeat a limitations paragraph at every transition.",
    "sourceRow": 221
  },
  {
    "id": "AC10",
    "node": "C40/C50",
    "stage": "Statistics have their own precision",
    "prompt": "For ACTUAL r or another statistic, what does the calculated value mean for [aim]? Report sensible precision for that statistic and consider only relevant data/method limits.",
    "trigger": "A dimensionless statistic doesn't automatically inherit raw input d.p.; no invented p-values or causation.",
    "sourceRow": 222
  },
  {
    "id": "AC11",
    "node": "C70/C90",
    "stage": "Review local consistency",
    "prompt": "Did your later graphs, calculated results and predictions USE the earlier C24 decisions or explicitly justify a revision? Are aim interpretations and relevant limitations beside their results?",
    "trigger": "A presentation check, not a new evaluation chapter; preserve the student's earlier prose.",
    "sourceRow": 223
  },
  {
    "id": "ML01",
    "node": "C35/C40D",
    "stage": "At new substantial method choice",
    "prompt": "Is [technique] on my actual IB Maths course, partly an extension, outside, or am I unsure?",
    "trigger": "Verify topic status with student's actual syllabus or teacher; not automatically classified by tool. Independently researched and beyond-syllabus are separate flags.",
    "sourceRow": 230
  },
  {
    "id": "ML02",
    "node": "C40/C50",
    "stage": "Confirmed syllabus mathematics begins",
    "prompt": "This method is ON my course: can I use it correctly, showing my mathematics and WHY it helps [aim], without explaining how the method works?",
    "trigger": "In the IA: normal calculations, purpose and contextual interpretation. NO textbook-style procedural explanation.",
    "sourceRow": 231
  },
  {
    "id": "ML03",
    "node": "C40L",
    "stage": "Confirmed beyond-course method at first use",
    "prompt": "What is the central NEW mathematical idea in [technique]? Can I explain it briefly in MY words, demonstrate a relevant step/check and show why it is applicable?",
    "trigger": "Explain only the necessary new maths beside FIRST use, not a full tutorial or copied formula. Cite the researched source.",
    "sourceRow": 232
  },
  {
    "id": "ML04",
    "node": "C40L",
    "stage": "Partly unfamiliar extension to taught maths",
    "prompt": "Exactly which part of [technique] goes beyond my syllabus? Can I explain that extension without re-teaching the standard steps?",
    "trigger": "At first use of NOVEL component; no exhaustive prerequisite derivation.",
    "sourceRow": 233
  },
  {
    "id": "ML05",
    "node": "C40D/C40L",
    "stage": "Course coverage uncertain",
    "prompt": "Before deciding how much I need to explain, can I check whether [technique] is covered by [selected maths course] and ask my teacher if necessary?",
    "trigger": "Private decision, not IA prose. Avoid inventing official syllabus verdicts or forcing irrelevant explanation.",
    "sourceRow": 234
  },
  {
    "id": "ML06",
    "node": "C40L",
    "stage": "Student INDEPENDENTLY researched a mathematical idea now actually used",
    "prompt": "What did I understand from [resource] that helps me carry out [technique] correctly? If new to the syllabus, what explanation do I need to include and cite?",
    "trigger": "Research on an in-course idea does NOT require writing a tutorial. Include referenced mathematical sources appropriately.",
    "sourceRow": 235
  },
  {
    "id": "ML07",
    "node": "C40L",
    "stage": "Beyond-course mathematics has been introduced",
    "prompt": "Can I show that I truly understand the unfamiliar idea with a relevant relationship, short derivation, parameter explanation or checked example?",
    "trigger": "At FIRST use. A copied equation or software screenshot alone does not demonstrate understanding.",
    "sourceRow": 236
  },
  {
    "id": "ML08",
    "node": "C40T/C40L",
    "stage": "Actual software calculation relies on method unfamiliar or beyond course",
    "prompt": "Do I understand the mathematics that produced [actual output]? If the technique is new, what principle/condition must I explain?",
    "trigger": "If in course, interpret result without software tutorial; if outside, demonstrate relevant mathematical understanding in own writing.",
    "sourceRow": 237
  },
  {
    "id": "ML09",
    "node": "C34B",
    "stage": "Student genuinely learns something MATHEMATICAL from actual substantive result",
    "prompt": "Beyond what this result means for [aim], did I discover something NEW about a pattern, relationship, mathematical condition or method?",
    "trigger": "AFTER essential interpretation, beside the work. Optional; don't manufacture engagement or demand this after routine algebra.",
    "sourceRow": 238
  },
  {
    "id": "ML10",
    "node": "C34B",
    "stage": "Earlier taught maths yields a genuine new connection",
    "prompt": "Did this ACTUAL finding change how I understand two familiar mathematical ideas or when a technique can/cannot be used?",
    "trigger": "A genuine learning insight is allowed for syllabus maths; still NO how-to tutorial for the familiar technique.",
    "sourceRow": 239
  },
  {
    "id": "ML11",
    "node": "C40/C50",
    "stage": "Student cannot explain a beyond-syllabus technique",
    "prompt": "Could a simpler, well-understood syllabus method answer [aim] better, or should I research the essential maths and check with my teacher?",
    "trigger": "No automatic rejection, but don't treat unexplained complexity as stronger mathematics.",
    "sourceRow": 240
  },
  {
    "id": "ML12",
    "node": "C50/C40L",
    "stage": "Later new technique or source differs from first section",
    "prompt": "Have I already explained this exact NEW mathematical idea where it first appeared, or does this section introduce genuinely different mathematics?",
    "trigger": "Suppress repeated conceptual teaching; only explain a new component or substantive mathematical insight.",
    "sourceRow": 241
  },
  {
    "id": "ML13",
    "node": "C70/C90",
    "stage": "Student reviews full mathematical draft",
    "prompt": "Did I spend pages explaining routine syllabus maths while leaving any independent, beyond-course technique unexplained? Can I correct the original passage and source citation?",
    "trigger": "This is a LOCAL revision checklist, not a new conclusion paragraph or automatic judgement of grade.",
    "sourceRow": 242
  }
]);
export const C_NEXT_STEP_REFERENCES=Object.freeze([
  {
    "id": "L01",
    "label": "Previous result and takeaway",
    "context": "C34/C34B; real substantive figure or calculation",
    "question": "Previous resultRef, observation, original aim/prediction/beneficiary",
    "guidance": "What did THIS result establish or fail to establish?",
    "sourceRow": 9
  },
  {
    "id": "L02",
    "label": "One unresolved question",
    "context": "C35 entered from meaningful result",
    "question": "Local takeaway, aim, currently understood scope",
    "guidance": "What specific mathematical question still matters to [aim/beneficiary]?",
    "sourceRow": 10
  },
  {
    "id": "L03",
    "label": "Choose a useful mathematical method",
    "context": "A real question has been identified",
    "question": "Observed feature, available evidence, course, prior methods",
    "guidance": "Why would [chosen technique] help answer THAT question better than doing more of the same?",
    "sourceRow": 11
  },
  {
    "id": "L04",
    "label": "Bridge into next section",
    "context": "C35 chosen a justified method",
    "question": "previousResultRef, localTakeaway, openQuestion, chosenMethod",
    "guidance": "WRITE now: 'Because the last result showed [student observation], I will investigate [new question] using [technique] to find out [mathematical purpose].' Adapt in your OWN words.",
    "sourceRow": 12
  },
  {
    "id": "L05",
    "label": "New mathematical section setup",
    "context": "C40/C50; method confirmed ACTUALLY relevant",
    "question": "Student-chosen technique, relevant symbols, constraints",
    "guidance": "Before using [actual new method], define variables and assumptions. If this is in the student's VERIFIED syllabus, proceed directly with mathematical working. If a new component is beyond, explain just that unfamiliar principle in the student's own words at first use.",
    "sourceRow": 13
  },
  {
    "id": "L06",
    "label": "Perform mathematical work",
    "context": "Method genuinely underway",
    "question": "Active technique, real inputs, course and source accuracy",
    "guidance": "Carry out the mathematics. What exactly was calculated or tested and why was this appropriate?",
    "sourceRow": 14
  },
  {
    "id": "L07",
    "label": "Interpret actual new result",
    "context": "A NEW substantial output exists",
    "question": "Real figure/equation/resultRef, aim and preceding question",
    "guidance": "What does your ACTUAL new result establish for [aim] and, ONLY IF a real mathematical insight occurred, what did you understand about the mathematics itself? Accuracy and limitations are checked separately when relevant.",
    "sourceRow": 15
  },
  {
    "id": "L08",
    "label": "Close section locally",
    "context": "Student has interpreted substantial result",
    "question": "Confirmed meaning, method validity and still-open aim",
    "guidance": "In one or two sentences, what has THIS mathematical section established or left open?",
    "sourceRow": 16
  },
  {
    "id": "L09",
    "label": "Continue, adapt or stop",
    "context": "A meaningful section was reflected on",
    "question": "Local takeaway, overall aim, course-depth review if needed",
    "guidance": "Does another question genuinely follow? If yes, what? If enough mathematics already answers the aim, move to the conclusion.",
    "sourceRow": 17
  },
  {
    "id": "L10",
    "label": "Preserve revisions and provenance",
    "context": "Earlier result or aim is revised",
    "question": "Original prediction, previous resultRef, chosen section nextStep",
    "guidance": "Does a changed finding alter the rationale for any LATER mathematical section? Review only affected transitions.",
    "sourceRow": 18
  },
  {
    "id": "P01",
    "label": "No Pearson r calculated",
    "context": "Only prediction or first scatter exists",
    "question": "NONE—do not show post-PMCC suggestions",
    "guidance": "First decide whether r would serve the question; if appropriate, calculate and interpret it.",
    "sourceRow": 24
  },
  {
    "id": "P02",
    "label": "Fairly strong sample linear association; prediction matters",
    "context": "Actual numerical r and scatter roughly linear; student confirms a relevant predictive aim",
    "question": "real r, named variables, domain, original aim and sample",
    "guidance": "A line of best fit might help predict [dependent quantity]. Would fitting and interpreting one add value?",
    "sourceRow": 25
  },
  {
    "id": "P03",
    "label": "Fairly strong sample association; aim only relationship strength",
    "context": "Real r interpreted; no prediction/estimation needed",
    "question": "r, actual scatter, beneficiary and question already answered",
    "guidance": "If the aim was only to describe linear association, have you obtained enough relevant evidence?",
    "sourceRow": 26
  },
  {
    "id": "P04",
    "label": "Small |r| and ACTUAL curved scatter",
    "context": "Real r near zero/small in context, student-confirmed curved plot",
    "question": "r, actual curve, possible monotonic/turning/cyclical feature",
    "guidance": "PMCC measures linear association. Could [observed curvature] explain the weak r? What suitable model would test it?",
    "sourceRow": 27
  },
  {
    "id": "P05",
    "label": "Small |r| and no clear scatter trend",
    "context": "Real small sample r, genuinely scattered observations",
    "question": "r, plot, population/sample scope, aim",
    "guidance": "You found little apparent linear association IN THIS SAMPLE. Is that itself a useful answer, or is there a justified different question?",
    "sourceRow": 28
  },
  {
    "id": "P06",
    "label": "Small |r| and one unusual observation matters",
    "context": "Real r plus visible unusual point and actual data",
    "question": "r and source records of point; observed difference",
    "guidance": "Could that genuine observation be affecting r? Check its accuracy and, if useful, compare the legitimate sensitivity without deleting it.",
    "sourceRow": 29
  },
  {
    "id": "P07",
    "label": "Low/moderate r with meaningful subgroups",
    "context": "Real graph shows groups tied to substantive contextual variable",
    "question": "Actual group definitions, sample sizes, aim, r",
    "guidance": "Do real, pre-existing subgroups suggest a different within-group relationship worth investigating?",
    "sourceRow": 30
  },
  {
    "id": "P08",
    "label": "Restricted explanatory-variable range",
    "context": "Actual sample only covers narrow range of variable",
    "question": "real sample domain, aim, coefficient and intended advice",
    "guidance": "Could the narrow sampled range limit what the coefficient tells you about the intended population?",
    "sourceRow": 31
  },
  {
    "id": "P09",
    "label": "Strong r but curved plot / cluster / leverage",
    "context": "A large |r| together with actual pattern inconsistent with single stable linear model",
    "question": "r, graph, evidence source, possible exceptions",
    "guidance": "Despite r, does the actual scatter justify a single straight-line model over the range relevant to your aim?",
    "sourceRow": 32
  },
  {
    "id": "P10",
    "label": "Observed direction differs from original prediction",
    "context": "Real PMCC sign and scatter don't match expected direction",
    "question": "original hypothesis and why, actual r, variables",
    "guidance": "What does this negative/positive sample association mean for the prediction? Is a different mathematical check genuinely needed?",
    "sourceRow": 33
  },
  {
    "id": "P11",
    "label": "Intermediate/ambiguous |r| or limited sample",
    "context": "Actual coefficient but its relevance unclear or data sparse",
    "question": "r, sample size, scatter, measurement precision, aim",
    "guidance": "What can THIS sample's r answer about linear association, and what remains uncertain?",
    "sourceRow": 34
  },
  {
    "id": "P12",
    "label": "Student proposes 'try another correlation'",
    "context": "Student reports small r and wants a different calculation",
    "question": "observed shape/actual groups/aim, course options",
    "guidance": "What NEW evidence-based mathematical question would a different relationship measure answer?",
    "sourceRow": 35
  },
  {
    "id": "P13",
    "label": "Correlation is real but causal recommendation proposed",
    "context": "Student wants to use sample correlation to advise causal intervention",
    "question": "r, data-collection design and beneficiary",
    "guidance": "Does your design justify causal conclusions, or only a description/association? What advice remains defensible?",
    "sourceRow": 36
  },
  {
    "id": "S01",
    "label": "First scatter looks roughly straight",
    "context": "C34/C35: real paired quantitative plot",
    "question": "Would quantifying linear association answer the aim better than a visual impression?",
    "guidance": "Optional PMCC if course-suitable, then interpret r and decide again",
    "sourceRow": 41
  },
  {
    "id": "S02",
    "label": "First scatter curves",
    "context": "C34: student-confirmed curve",
    "question": "What shape/feature matters mathematically—turning, monotonic rise, repetition?",
    "guidance": "Compare meaningful model families or a valid monotonic measure if suitable",
    "sourceRow": 42
  },
  {
    "id": "S03",
    "label": "Histogram actually skewed",
    "context": "C34: observed skew/outliers",
    "question": "Do median and IQR describe the distribution more usefully than mean and SD?",
    "guidance": "Compute appropriate centre/spread and interpret groups if warranted",
    "sourceRow": 43
  },
  {
    "id": "S04",
    "label": "Observed distribution approximately symmetric",
    "context": "C34: real relevant numerical data",
    "question": "Is a normal model useful for a concrete probability or comparison in this context?",
    "guidance": "Only if justified, estimate parameters/probabilities and test suitability",
    "sourceRow": 44
  },
  {
    "id": "S05",
    "label": "Groups differ on a comparable chart",
    "context": "C34: actual common-scale comparison",
    "question": "What mathematical measure would establish whether the difference is meaningful?",
    "guidance": "Compare centre/spread or a permitted statistical test after justification",
    "sourceRow": 45
  },
  {
    "id": "S06",
    "label": "Categorical counts differ",
    "context": "C34: actual categories and counts",
    "question": "Are conditional proportions or a relevant measure/test needed to answer association question?",
    "guidance": "Calculate appropriate proportions; chi-squared only when course-approved and assumptions relevant",
    "sourceRow": 46
  },
  {
    "id": "S07",
    "label": "Fitted line/model gives useful predictions",
    "context": "C40/C50: genuine fitted model and observed performance",
    "question": "Can the model predict a meaningful new situation within its evidence-supported domain?",
    "guidance": "Interpret coefficients then check residuals/scope or independent observation where feasible",
    "sourceRow": 47
  },
  {
    "id": "S08",
    "label": "A model fails to explain a real pattern",
    "context": "C40/C50: actual large/misleading discrepancies",
    "question": "What assumption/model feature might explain the mismatch?",
    "guidance": "Inspect residual structure, range or one justified alternative model",
    "sourceRow": 48
  },
  {
    "id": "S09",
    "label": "Model estimated outside valid range",
    "context": "Active model with real outside-domain prediction",
    "question": "Does that result respect physical/mathematical constraints?",
    "guidance": "Restrict prediction range, change scenario or evaluate endpoint",
    "sourceRow": 49
  },
  {
    "id": "S10",
    "label": "Optimisation yields stationary point",
    "context": "C40/C50: actual derivative and candidate",
    "question": "Is this the feasible optimum given constraints and endpoints?",
    "guidance": "Check boundaries/other candidates; interpret best admissible choice",
    "sourceRow": 50
  },
  {
    "id": "S11",
    "label": "Measured inputs feed derived calculation",
    "context": "C40/C50: geometry, speed or similar computed",
    "question": "Could source precision materially affect the conclusion or decision?",
    "guidance": "Consider justified uncertainty/sensitivity only if consequential",
    "sourceRow": 51
  },
  {
    "id": "S12",
    "label": "Time-series looks periodic",
    "context": "C34: observed cycles; suitable actual period",
    "question": "Is estimating period/amplitude useful for the question, or is trend more relevant?",
    "guidance": "If appropriate, fit/compare a periodic model and interpret parameters",
    "sourceRow": 52
  },
  {
    "id": "S13",
    "label": "Several theoretical examples support a conjecture",
    "context": "C34: actual exact examples",
    "question": "Can the pattern be proved, or can a counterexample be found?",
    "guidance": "Reasoned proof, special cases or restrictions, appropriate for course",
    "sourceRow": 53
  },
  {
    "id": "S14",
    "label": "Counterexample contradicts conjecture",
    "context": "C34U: real counterexample",
    "question": "Can the original statement be narrowed and proved under a valid condition?",
    "guidance": "Revise proposition, seek proof or more counterexamples",
    "sourceRow": 54
  },
  {
    "id": "S15",
    "label": "Significant question is already answered",
    "context": "C34B: real results with adequate course-level maths",
    "question": "Would any further technique tell the reader something necessary?",
    "guidance": "If no, synthesise in conclusion; explain any remaining limits concisely",
    "sourceRow": 55
  },
  {
    "id": "W01",
    "label": "Scatter → PMCC",
    "context": "Previous scatter appears roughly linear; no coefficient calculated yet",
    "question": "Observation/takeaway: some points appear to follow a straight trend.",
    "guidance": "Open question: how much LINEAR association is present?",
    "sourceRow": 61
  },
  {
    "id": "W02",
    "label": "PMCC → line of best fit",
    "context": "ACTUAL r + observed roughly linear pattern + prediction need",
    "question": "Takeaway: sample data show [student's honest interpretation of r].",
    "guidance": "Open question: can a simple line estimate [meaningful quantity]?",
    "sourceRow": 62
  },
  {
    "id": "W03",
    "label": "PMCC small → curve",
    "context": "ACTUAL small |r| and actual curved scatter",
    "question": "Takeaway: little sample LINEAR association measured.",
    "guidance": "Open question: does [observed nonlinearity] explain the pattern?",
    "sourceRow": 63
  },
  {
    "id": "W04",
    "label": "PMCC small → stop honestly",
    "context": "ACTUAL small r and no convincing alternative shape",
    "question": "Takeaway: sample has little evidence of the proposed linear relationship.",
    "guidance": "Open question: is further maths genuinely useful for the original aim?",
    "sourceRow": 64
  },
  {
    "id": "W05",
    "label": "Fitted model → validation",
    "context": "ACTUAL model fit obtained",
    "question": "Takeaway: fitted function approximates observed values within a limited domain.",
    "guidance": "Open question: are its predictions reliable for [intended decision]?",
    "sourceRow": 65
  },
  {
    "id": "W06",
    "label": "Optimisation → constraints",
    "context": "Stationary point actually calculated",
    "question": "Takeaway: derivative gives a candidate best value.",
    "guidance": "Open question: is it feasible and best on the full allowed interval?",
    "sourceRow": 66
  },
  {
    "id": "W07",
    "label": "Theoretical example → proof",
    "context": "Actual pattern found across a few cases",
    "question": "Takeaway: examples suggest a conjecture but don't establish it.",
    "guidance": "Open question: under what conditions can it be proved?",
    "sourceRow": 67
  },
  {
    "id": "G01",
    "label": "Relevance",
    "context": "Use student-confirmed resultRef and observed feature; never infer from Planning predictions or proposed techniques.",
    "question": "Default to a plain 'What's left to find out?' if no specific evidence.",
    "guidance": "Working draft",
    "sourceRow": 73
  },
  {
    "id": "G02",
    "label": "Timing",
    "context": "A section-level takeaway comes directly AFTER meaningful mathematics; bridging sentence BEFORE next new calculation.",
    "question": "No big list of evaluation in final conclusion.",
    "guidance": "Working draft",
    "sourceRow": 74
  },
  {
    "id": "G03",
    "label": "Depth",
    "context": "Offer at most two tailored suggestions on demand; show only one compact main prompt.",
    "question": "No mandatory series of techniques or fixed section count.",
    "guidance": "Working draft",
    "sourceRow": 75
  },
  {
    "id": "G04",
    "label": "Course",
    "context": "Offer maths appropriate to the student's verified AI SL / AA SL (or other selected course); on-syllabus methods are USED without procedural explanation, while new beyond-course parts require first-use conceptual understanding and teacher/course check if uncertain.",
    "question": "Don't assume a researched topic is outside syllabus or that advanced complexity boosts marks; do not force a mathematical-learning sentence after routine results.",
    "guidance": "Working draft",
    "sourceRow": 76
  },
  {
    "id": "G05",
    "label": "Statistical honesty",
    "context": "'No linear association in sample' is NOT a proof there is no nonlinear or population relationship.",
    "question": "No significance inference without appropriate test; no fabricated r/threshold.",
    "guidance": "Working draft",
    "sourceRow": 77
  },
  {
    "id": "G06",
    "label": "Result meaning",
    "context": "High |r| doesn't by itself prove a line will predict reliably or imply causality.",
    "question": "Check actual scatter/domain/residuals only at model stage where useful.",
    "guidance": "Working draft",
    "sourceRow": 78
  },
  {
    "id": "G07",
    "label": "Exploring alternatives",
    "context": "Choose alternative relationship/model only when actual shape/context motivates it.",
    "question": "No data dredging, cherry-picked exclusion or re-plotting until a positive result appears.",
    "guidance": "Working draft",
    "sourceRow": 79
  },
  {
    "id": "G08",
    "label": "Section history",
    "context": "Store each prior result, local conclusion and next question with stable IDs; repeating loop creates new section record.",
    "question": "A revisit never overwrites earlier student text or original prediction.",
    "guidance": "Working draft",
    "sourceRow": 80
  },
  {
    "id": "G09",
    "label": "Already covered",
    "context": "Use Writing Moments W20/W21/W23/W26 statuses and student's own IA section reference.",
    "question": "Don't repeat the same bridging paragraph or method limitation.",
    "guidance": "Working draft",
    "sourceRow": 81
  },
  {
    "id": "G10",
    "label": "Stop/Save",
    "context": "Allow Not sure, return to data, teacher check, Save or conclusion after enough purposeful maths.",
    "question": "Don't require another calculation merely because a prompt exists.",
    "guidance": "Working draft",
    "sourceRow": 82
  },
  {
    "id": "G11",
    "label": "Accuracy",
    "context": "Collection-stage sampling/source accuracy stays with methods; new PMCC/model/derivative validity only when used.",
    "question": "Avoid generic practical equipment difficulties as IA limitations.",
    "guidance": "Working draft",
    "sourceRow": 83
  },
  {
    "id": "T01",
    "label": "First scatter → approx linear",
    "context": "C35 proposes PMCC only if quantification helps the aim, with why to write at transition.",
    "question": "No PMCC result or limitation until actually computed.",
    "guidance": "To test",
    "sourceRow": 89
  },
  {
    "id": "T02",
    "label": "First scatter → curved",
    "context": "Offer model/other relevant maths, not automatic PMCC.",
    "question": "No coefficient inferred from eye or prediction.",
    "guidance": "To test",
    "sourceRow": 90
  },
  {
    "id": "T03",
    "label": "PMCC completed, r fairly strong and scattered roughly along line, predictive aim",
    "context": "Optional line of best fit; student writes purpose, then later interprets fitted coefficients/domain.",
    "question": "No automatic regression or causal conclusion.",
    "guidance": "To test",
    "sourceRow": 91
  },
  {
    "id": "T04",
    "label": "PMCC completed, r fairly strong but aim already answered",
    "context": "Allow stop and conclusion (subject to appropriate depth); no compulsory extra line.",
    "question": "No grade promise.",
    "guidance": "To test",
    "sourceRow": 92
  },
  {
    "id": "T05",
    "label": "PMCC completed, r small; scatter actually curves",
    "context": "Explain PMCC is only linear; justify a suitable nonlinear model or course-approved rank method.",
    "question": "No 'no correlation' blanket statement or forced Spearman.",
    "guidance": "To test",
    "sourceRow": 93
  },
  {
    "id": "T06",
    "label": "PMCC completed, r small; scatter unstructured",
    "context": "Permit honest weak linear finding and conclusion, or an evidence-grounded question.",
    "question": "No trying new correlations until positive.",
    "guidance": "To test",
    "sourceRow": 94
  },
  {
    "id": "T07",
    "label": "PMCC completed, r small; actual outlier",
    "context": "Offer data check and appropriate transparent sensitivity analysis.",
    "question": "No dropping genuine inconvenient points.",
    "guidance": "To test",
    "sourceRow": 95
  },
  {
    "id": "T08",
    "label": "PMCC completed, strong r; scatter has two clusters",
    "context": "Prompt whether a single line makes sense; possible justified subgroup scope.",
    "question": "No confusing high r with predictive validation.",
    "guidance": "To test",
    "sourceRow": 96
  },
  {
    "id": "T09",
    "label": "Student has ONLY planned PMCC",
    "context": "No C35P branch; ordinary plot/first-stage advice only.",
    "question": "No premature coefficient or method limitation.",
    "guidance": "To test",
    "sourceRow": 97
  },
  {
    "id": "T10",
    "label": "New meaningful mathematical result at C50",
    "context": "Auto-offer small local interpretation; return to C35 for next step if appropriate.",
    "question": "Do not silently jump to another section.",
    "guidance": "To test",
    "sourceRow": 98
  },
  {
    "id": "T11",
    "label": "Routine rearrangement in a calculation",
    "context": "Do not trigger mini-conclusion or forced 'new question'.",
    "question": "No interruptions after every algebra line.",
    "guidance": "To test",
    "sourceRow": 99
  },
  {
    "id": "T12",
    "label": "Student chooses Already covered",
    "context": "Suppress repeated transition cue, link existing IA passage.",
    "question": "No duplicate prose when revisiting same result.",
    "guidance": "To test",
    "sourceRow": 100
  },
  {
    "id": "T13",
    "label": "Student's earlier result is corrected",
    "context": "Flag only affected later-section rationale for review, retain student text.",
    "question": "No global wipe or silent reauthoring.",
    "guidance": "To test",
    "sourceRow": 101
  },
  {
    "id": "T14",
    "label": "Course-appropriate mathematical aim now sufficiently answered",
    "context": "Offer conclusion; no fixed count of stages.",
    "question": "No forced sophistication for appearances.",
    "guidance": "To test",
    "sourceRow": 102
  },
  {
    "id": "T15",
    "label": "Modelling fit poor after actual regression",
    "context": "Discuss fit/domain at result and consider a justified alternative, not generic source issues.",
    "question": "Don't invent results or p-values.",
    "guidance": "To test",
    "sourceRow": 103
  },
  {
    "id": "T16",
    "label": "Theoretical conjecture falsified",
    "context": "Use counterexample to motivate narrower statement/proof where worthwhile.",
    "question": "No pretending earlier pattern was proved.",
    "guidance": "To test",
    "sourceRow": 104
  },
  {
    "id": "T17",
    "label": "Student can't find next useful question",
    "context": "Allow Not sure/Save, help or conclusion if defensible.",
    "question": "No requirement to manufacture a technique.",
    "guidance": "To test",
    "sourceRow": 105
  },
  {
    "id": "T18",
    "label": "Student says 'r low, I want another correlation'",
    "context": "Ask actual mathematical reason and data type/shape before suggesting a new measure.",
    "question": "No automatic multiple testing/data fishing.",
    "guidance": "To test",
    "sourceRow": 106
  },
  {
    "id": "A01",
    "label": "C33 · actual diagram",
    "context": "Graph includes measured or published rounded values",
    "question": "C24 variable/unit/source resolution and any actual uncertainty",
    "guidance": "Do the axes, plotted points and labels preserve the meaning and accuracy of the original data?",
    "sourceRow": 116
  },
  {
    "id": "A02",
    "label": "C40/C50 · derived area or volume",
    "context": "Lengths with documented source/measurement resolution enter a formula",
    "question": "Original dimensional accuracy and current geometry/equation",
    "guidance": "Does the resolution of the measured dimensions meaningfully constrain this area/volume estimate? Use sensible working precision then report a justified result.",
    "sourceRow": 117
  },
  {
    "id": "A03",
    "label": "C40/C50 · speed/rate",
    "context": "A rate is calculated from time/distance readings",
    "question": "Earlier measurement resolution/uncertainty and time interval used",
    "guidance": "Could the precision of either reading, especially a small measured difference, materially affect this rate?",
    "sourceRow": 118
  },
  {
    "id": "A04",
    "label": "C40/C50 · ratio/percentage change",
    "context": "Calculated percentage uses rounded/source values",
    "question": "Earlier data/source precision and relevant denominator",
    "guidance": "What accuracy is justified for this ratio or percentage, given the source and computation?",
    "sourceRow": 119
  },
  {
    "id": "A05",
    "label": "C40/C50 · PMCC",
    "context": "Pearson r ACTUALLY computed on paired data",
    "question": "C24 measurement/source quality, actual scatter, sample and r",
    "guidance": "Interpret the real r in context and report it at useful precision. Does data quality or relevant PMCC validity affect the claim?",
    "sourceRow": 120
  },
  {
    "id": "A06",
    "label": "C40/C50 · fitted model prediction",
    "context": "Actual model/forecast used for meaningful advice",
    "question": "Accuracy of measured/calibrated inputs, real fit and valid domain",
    "guidance": "Are the digits and confidence of this prediction justified by the input data, model fit and domain?",
    "sourceRow": 121
  },
  {
    "id": "A07",
    "label": "C40/C50 · rounded secondary data",
    "context": "Real public-source values are rounded or aggregated",
    "question": "Provenance, source reporting resolution, population and dates",
    "guidance": "The software may give a long result; what could the original source's rounding/aggregation mean for its interpretation?",
    "sourceRow": 122
  },
  {
    "id": "A08",
    "label": "C40/C50 · inferential sample",
    "context": "Actual sample statistic used to make a wider claim",
    "question": "Sample method/size/coverage already discussed at data stage",
    "guidance": "Given your original population and sampling decision, which group does this result actually describe?",
    "sourceRow": 123
  },
  {
    "id": "A09",
    "label": "C40/C50 · exact theoretical work",
    "context": "No empirical measurements, exact symbolic result",
    "question": "Proven relation, exact variables and mathematical constraints",
    "guidance": "Keep exact values where useful; if decimals are used, is ≈ appropriate? What does the proof establish about the aim?",
    "sourceRow": 124
  },
  {
    "id": "A10",
    "label": "C40/C50 · numerical method",
    "context": "Approximate integration/iteration/regression computed",
    "question": "Input/source resolution plus approximation method and step size if used",
    "guidance": "Does numerical approximation introduce a NEW limitation beyond the earlier measurement/source precision?",
    "sourceRow": 125
  },
  {
    "id": "A11",
    "label": "C40/C50 · optimisation",
    "context": "Real optimum obtained from a fitted or measured model",
    "question": "Earlier parameter/source accuracy, physical constraints, derived stationary point",
    "guidance": "Is the claimed optimal value meaningful to the supported precision and within the valid domain and constraints?",
    "sourceRow": 126
  },
  {
    "id": "A12",
    "label": "C35 · transition",
    "context": "Student chooses next method after a limited result",
    "question": "Prior local takeaway and only material earlier accuracy/assumption boundary",
    "guidance": "Given what the previous evidence can support, WHY is this next mathematical method a sensible way to investigate what remains?",
    "sourceRow": 127
  },
  {
    "id": "T19",
    "label": "Student measured lengths to nearest 0.1 cm and plots a graph later",
    "context": "Recall recorded units/source resolution when checking graph and its labels.",
    "question": "No graph that pretends the readings have extra measurement precision.",
    "guidance": "To test",
    "sourceRow": 135
  },
  {
    "id": "T20",
    "label": "A student uses those length measurements in an area formula",
    "context": "Preserve working accuracy; check derived area accuracy in context and interpret for aim.",
    "question": "No automatic rule that area must be rounded to 1 d.p.; no fabricated ± error.",
    "guidance": "To test",
    "sourceRow": 136
  },
  {
    "id": "T21",
    "label": "Actual Pearson r reported after calculating from rounded measurements",
    "context": "Interpret the real coefficient and relevant data/method scope, with sensible precision for r itself.",
    "question": "Do not force r to the input measurement decimal places or invent a significance test.",
    "guidance": "To test",
    "sourceRow": 137
  },
  {
    "id": "T22",
    "label": "Student replaces secondary dataset with a source of different precision",
    "context": "Flag only dependent diagrams and computations for review; preserve original source history and prose.",
    "question": "No global reset or silent alteration of previous result wording.",
    "guidance": "To test",
    "sourceRow": 138
  },
  {
    "id": "T23",
    "label": "Theoretical exact proof without measured quantities",
    "context": "Prompt conclusion about what mathematics proves; skip measurement accuracy entirely.",
    "question": "No forced C24 sampling/resolution limitations or arbitrary decimal output.",
    "guidance": "To test",
    "sourceRow": 139
  },
  {
    "id": "T24",
    "label": "Meaningful later model result interpreted and accuracy already discussed",
    "context": "Show one explicit aim-linked local takeaway; mark earlier limitation Already covered and optionally reference it.",
    "question": "No duplicate evaluation paragraph and no prompt after each intermediate algebra line.",
    "guidance": "To test",
    "sourceRow": 140
  },
  {
    "id": "T25",
    "label": "Student's only problem is late survey responses",
    "context": "Offer safe planning/writing work; don't treat access inconvenience as a mathematical data limitation.",
    "question": "No 'I struggled to get respondents' as required IA mathematical critique.",
    "guidance": "To test",
    "sourceRow": 141
  },
  {
    "id": "T26",
    "label": "Actual regression produces a prediction outside supported domain",
    "context": "At the real model result, remind source/model limitations and qualified usefulness for intended audience.",
    "question": "No model extrapolation warning presented while only collecting data; no false predictive certainty.",
    "guidance": "To test",
    "sourceRow": 142
  }
]);
export const C_INTERPRETATION_REFERENCES=Object.freeze([
  {
    "id": "I01",
    "type": "Statistics | scatter, roughly straight-line",
    "condition": "Student confirms paired data and points appear approximately linear",
    "prompt": "What direction, spread and rough linear form do you ACTUALLY see? Are there clusters or unusual points?",
    "caution": "How does a possible linear association answer the aim? Is direction as predicted, and what might it mean for the intended beneficiary?",
    "sourceRow": 9
  },
  {
    "id": "I02",
    "type": "Statistics | scatter, visibly curved",
    "condition": "Student confirms curved or changing-slope pattern from actual scatter, especially after predicted linear trend",
    "prompt": "Does the direction or steepness change? Where does the curvature appear?",
    "caution": "A curve may challenge the original linear expectation; does a different model better answer the aim?",
    "sourceRow": 10
  },
  {
    "id": "I03",
    "type": "Statistics | scatter, weak or no apparent association",
    "condition": "Student reports points look scattered or relationship unclear",
    "prompt": "Is there a consistent direction or merely an indistinct cloud? What are the observed limits?",
    "caution": "Does no obvious association challenge the prediction, and what decision can/can't this evidence support?",
    "sourceRow": 11
  },
  {
    "id": "I04",
    "type": "Statistics | scatter with surprising extreme observation",
    "condition": "Student actually notices one/few unusual plotted observations",
    "prompt": "What makes this point unusual in context? Could it be a genuine part of the data?",
    "caution": "How much does it change the story and prediction? Would ignoring it misrepresent the intended population?",
    "sourceRow": 12
  },
  {
    "id": "I05",
    "type": "Statistics | single variable appears bell-shaped",
    "condition": "Student reports a roughly symmetric, single-peaked histogram of numerical observations",
    "prompt": "How symmetric is the shape, and what spread or tail behaviour can you actually see?",
    "caution": "Would a particular distribution model help with the probabilities or comparison in the aim?",
    "sourceRow": 13
  },
  {
    "id": "I06",
    "type": "Statistics | skewed, clumped or multimodal histogram",
    "condition": "Student observes asymmetry, several peaks or marked grouping",
    "prompt": "What does the skew or clustering imply about typical values and variability?",
    "caution": "How does this affect any predicted normality and who might benefit from comparing subgroups?",
    "sourceRow": 14
  },
  {
    "id": "I07",
    "type": "Statistics | side-by-side comparison, visible group difference",
    "condition": "Student reports meaningful difference in location/spread on common-scale plots",
    "prompt": "Which centre, spread or unusual values differ between groups?",
    "caution": "Does the difference support the prediction? What advice can be cautiously drawn for the stated group?",
    "sourceRow": 15
  },
  {
    "id": "I08",
    "type": "Statistics | group plots unexpectedly similar",
    "condition": "Student expected a group difference but common-scale plots show little",
    "prompt": "Are the groups alike in centre, spread, or both? Do the scales hide an actual small difference?",
    "caution": "What would a lack of meaningful difference mean for the original advice/choice?",
    "sourceRow": 16
  },
  {
    "id": "I09",
    "type": "Statistics | categorical bars/proportions",
    "condition": "Student has counts/proportions across categories/groups",
    "prompt": "Which relative proportions appear different? Are the denominators comparable?",
    "caution": "Which category pattern directly bears on the aim and expected usefulness?",
    "sourceRow": 17
  },
  {
    "id": "I10",
    "type": "Statistics/modelling | time series looks periodic",
    "condition": "Student observes repeated ups/downs over actual ordered measurements",
    "prompt": "How many visible cycles, and are intervals/peaks broadly consistent?",
    "caution": "Would a recurring pattern help the original aim or predicted future behaviour?",
    "sourceRow": 18
  },
  {
    "id": "I11",
    "type": "Statistics/modelling | expected cycle absent",
    "condition": "Student predicted periodicity but actual series appears irregular or mainly trending",
    "prompt": "What trend or variability replaces the expected repeating pattern?",
    "caution": "How does the result revise the original decision or prediction?",
    "sourceRow": 19
  },
  {
    "id": "I12",
    "type": "Modelling | expected exponential vs observed changes",
    "condition": "Student predicted percentage growth but observed interval differences/ratios vary",
    "prompt": "Are absolute differences or percentage changes roughly stable over meaningful equal intervals?",
    "caution": "Which model would produce predictions relevant to the aim and beneficiary?",
    "sourceRow": 20
  },
  {
    "id": "I13",
    "type": "Modelling | motion data, changing intervals",
    "condition": "Student's time-position data or interval calculation suggests changing speed",
    "prompt": "Are equal-time changes in position becoming larger, smaller or irregular?",
    "caution": "How does this support/challenge constant-speed prediction and subsequent modelling aim?",
    "sourceRow": 21
  },
  {
    "id": "I14",
    "type": "Modelling | labelled geometry and constraints",
    "condition": "Student has drawn a useful scale/sketch or calculated an initial area/volume relation",
    "prompt": "What quantity is fixed, what varies and how are they related?",
    "caution": "Why does the relationship help find an actionable optimum or geometric conclusion?",
    "sourceRow": 22
  },
  {
    "id": "I15",
    "type": "Modelling | calculated optimum is outside constraints",
    "condition": "Student has ACTUALLY differentiated/compared candidates and result lies outside allowable domain",
    "prompt": "What value did the mathematics return, and why is it infeasible in context?",
    "caution": "Can the intended practical decision be answered by endpoints or realistic discrete options?",
    "sourceRow": 23
  },
  {
    "id": "I16",
    "type": "Modelling | measured dimensional result",
    "condition": "Student computes area, volume, speed or similar from measured input values",
    "prompt": "What derived value and units does this calculation produce?",
    "caution": "Would the result meet the original design/decision aim within defensible accuracy?",
    "sourceRow": 24
  },
  {
    "id": "I17",
    "type": "Modelling | fitted model misses actual observations",
    "condition": "Student has ACTUALLY fitted a model and observed mismatched residuals/points",
    "prompt": "Where and how does the model deviate? Is a consistent pattern apparent?",
    "caution": "Does the model still answer the aim accurately within a restricted domain?",
    "sourceRow": 25
  },
  {
    "id": "I18",
    "type": "Modelling | fitted model unexpectedly strong",
    "condition": "Student has ACTUALLY fitted a model and observed unusually good agreement",
    "prompt": "What supports the apparent agreement and over which input range?",
    "caution": "Would the model's supported range cover the decision needed by beneficiary?",
    "sourceRow": 26
  },
  {
    "id": "I19",
    "type": "Modelling | spatial points suggest nearest-location regions",
    "condition": "Student has a labelled location sketch or coordinates",
    "prompt": "Which locations seem to compete to be nearest for the decision area?",
    "caution": "Would a nearest-place partition support the original service/location advice?",
    "sourceRow": 27
  },
  {
    "id": "I20",
    "type": "Theory | first examples support conjecture",
    "condition": "Student checked a small number of exact cases that appear to agree",
    "prompt": "What common structure actually appears across these examples?",
    "caution": "What GENERAL statement would advance the investigation beyond individual examples?",
    "sourceRow": 28
  },
  {
    "id": "I21",
    "type": "Theory | counterexample contradicts conjecture",
    "condition": "Student ACTUALLY finds counterexample or special case that invalidates proposed universal claim",
    "prompt": "Which specific condition/example fails, and where did the original reasoning stop applying?",
    "caution": "How might a narrower conjecture still address the aim or inspire new mathematics?",
    "sourceRow": 29
  },
  {
    "id": "I22",
    "type": "Any | initial calculation gives surprising value",
    "condition": "Student explicitly reports numerical result conflicts with prediction/context",
    "prompt": "Is the value larger, smaller, opposite sign or unexpectedly impossible?",
    "caution": "Does the result change the intended decision or indicate original aim needs narrowing?",
    "sourceRow": 30
  },
  {
    "id": "I23",
    "type": "Statistics | visible clusters in combined scatter",
    "condition": "Student notices group-specific clusters in actual paired data",
    "prompt": "Are clusters associated with known categories, conditions or time periods?",
    "caution": "Would separate interpretations be more relevant to the chosen beneficiary than a single overall association?",
    "sourceRow": 31
  },
  {
    "id": "I24",
    "type": "Any | apparent effect may be comparable to measurement uncertainty",
    "condition": "Student observes a small difference/change near actual measurement/source resolution",
    "prompt": "Is the apparent effect meaningfully distinguishable at the precision supported by data?",
    "caution": "Can the original aim be answered with a useful range or cautious conclusion instead?",
    "sourceRow": 32
  },
  {
    "id": "I25",
    "type": "Any | little useful pattern or evidence",
    "condition": "Student cannot yet identify a pattern, or original diagram adds nothing to story",
    "prompt": "Does the figure answer any part of the aim? Is absence of pattern itself informative?",
    "caution": "Is the original question still meaningful, or should it be narrowed honestly?",
    "sourceRow": 33
  },
  {
    "id": "I26",
    "type": "Any | calculation or diagram confirms an earlier conclusion",
    "condition": "Student revisits an earlier result with no new information",
    "prompt": "What, if anything, is learned that the first figure/result did not show?",
    "caution": "Does repetition advance the aim or just restate earlier work?",
    "sourceRow": 34
  },
  {
    "id": "D01",
    "type": "Always after actual output",
    "condition": "What do you SEE in this diagram or calculation? Name the pattern/value/difference, not how you created it.",
    "prompt": "Short observation in student's words; 'Not sure yet' allowed.",
    "caution": "Never derive a pattern from Planning prediction alone; no auto-written observation.",
    "sourceRow": 40
  },
  {
    "id": "D02",
    "type": "Only when precision/inference isn't already covered or new uncertainty arises",
    "condition": "How accurate or trustworthy is THIS observation? Could established measurement/source limits affect the conclusion?",
    "prompt": "Conditional brief note or 'Covered earlier' with reference to C24/C23.",
    "caution": "Don't repeat limitations after every chart; if nothing new, refer to earlier discussion.",
    "sourceRow": 41
  },
  {
    "id": "D03",
    "type": "Always",
    "condition": "How does the observation help ANSWER or refine your original aim?",
    "prompt": "One short aim-linked statement.",
    "caution": "Observation can be inconclusive; do not promise advice.",
    "sourceRow": 42
  },
  {
    "id": "D04",
    "type": "If prediction exists",
    "condition": "How does the evidence relate to what you originally predicted, and WHY you predicted it?",
    "prompt": "Supports / challenges / unclear + short explanation.",
    "caution": "Preserve original prediction; allow later revision with a reason.",
    "sourceRow": 43
  },
  {
    "id": "D05",
    "type": "If an intended beneficiary/use exists",
    "condition": "What might this result mean for you or the person you hoped to advise? What can it NOT yet justify?",
    "prompt": "Optional contextual note.",
    "caution": "Do not invent a useful result or causal advice.",
    "sourceRow": 44
  },
  {
    "id": "D06",
    "type": "Only when student marks result as unexpected/unclear",
    "condition": "Exactly what was different from your expectation? What could explain that, and which one check would genuinely distinguish the explanations?",
    "prompt": "Short discrepancy + optional on-demand suggestions; no mandatory explanation claim.",
    "caution": "Do not force progress until the discrepancy is considered; still allow Save/Not sure.",
    "sourceRow": 45
  },
  {
    "id": "D07",
    "type": "After reflection (all paths)",
    "condition": "What mathematical question follows from THIS observation, and WHY would the next method help answer it?",
    "prompt": "Student selects or writes next step; 1–3 optional suggestions.",
    "caution": "Do not automatically run PMCC from a scatter plot or offer PMCC limitations before use.",
    "sourceRow": 46
  },
  {
    "id": "D08",
    "type": "When surprise involves data quality/measurement",
    "condition": "What do your existing collection notes already tell you? Is there a specific data/source error or resolution issue to verify?",
    "prompt": "Optional check / return to C20 or C24.",
    "caution": "Do not invent errors or ask generic practical difficulties.",
    "sourceRow": 47
  },
  {
    "id": "D09",
    "type": "When surprise involves a model/theoretical assumption",
    "condition": "Which assumption, range or special case would be meaningful to vary or test?",
    "prompt": "Optional compare small case, model alternative or condition; only if appropriate.",
    "caution": "Do not mistake an unexpected result for proof of model failure.",
    "sourceRow": 48
  },
  {
    "id": "D10",
    "type": "When a planned method conflicts with actual pattern",
    "condition": "Is the originally proposed method still sensible? If not, which course-appropriate method better addresses the observed question?",
    "prompt": "Keep / Revise / Not sure; student reason.",
    "caution": "A changed plan is positive reflection, not an automatic failure. No overfitting or fishing.",
    "sourceRow": 49
  },
  {
    "id": "Q01",
    "type": "Scatter appears roughly linear; PMCC planned",
    "condition": "C34 observation and C34B purpose first; C35H may suggest PMCC to QUANTIFY linear association if in course.",
    "prompt": "Don't run PMCC automatically or show PMCC-specific limitation before C40.",
    "caution": "To test",
    "sourceRow": 55
  },
  {
    "id": "Q02",
    "type": "Predicted linear; actual scatter visibly curves",
    "condition": "C34U asks exactly what differs and offers alternative shape/range checks.",
    "prompt": "Don't force PMCC because it was selected in Planning.",
    "caution": "To test",
    "sourceRow": 56
  },
  {
    "id": "Q03",
    "type": "Expected normal; actual histogram skewed",
    "condition": "Student describes skew, revisits normal prediction; suggests appropriate summary/comparison.",
    "prompt": "Don't label curve normal or force normal probability model.",
    "caution": "To test",
    "sourceRow": 57
  },
  {
    "id": "Q04",
    "type": "Observed no clear correlation",
    "condition": "Allow a worthwhile inconclusive observation; options to check range, sample, true absence.",
    "prompt": "No repeated chart fishing until a correlation appears.",
    "caution": "To test",
    "sourceRow": 58
  },
  {
    "id": "Q05",
    "type": "Plot shows surprising outlier",
    "condition": "Student may verify source and retain genuine value; discuss relevance to aim.",
    "prompt": "Do not delete automatically or pop PMCC limitations before PMCC is used.",
    "caution": "To test",
    "sourceRow": 59
  },
  {
    "id": "Q06",
    "type": "Graph accuracy already analysed in C24",
    "condition": "No repeat; simply refer to earlier accuracy record if sufficient.",
    "prompt": "No unnecessary mandatory 'accuracy discussion' box.",
    "caution": "To test",
    "sourceRow": 60
  },
  {
    "id": "Q07",
    "type": "New result small relative to source precision",
    "condition": "Ask specific accuracy/uncertainty question, link to C24 where needed.",
    "prompt": "No invention of a tolerance or spurious decimal precision.",
    "caution": "To test",
    "sourceRow": 61
  },
  {
    "id": "Q08",
    "type": "Theoretical counterexample",
    "condition": "Record contradicted conjecture and prompt narrower condition/proof.",
    "prompt": "No data collection or sampling prompts; don't hide the counterexample.",
    "caution": "To test",
    "sourceRow": 62
  },
  {
    "id": "Q09",
    "type": "Optimisation result infeasible AFTER differentiation",
    "condition": "Check admissible domain/endpoints and revise interpretation.",
    "prompt": "No stationary-point limitation while only drawing original sketch.",
    "caution": "To test",
    "sourceRow": 63
  },
  {
    "id": "Q10",
    "type": "Student changes beneficiary or aim",
    "condition": "Offer review of current interpretation; preserve old prediction and observation.",
    "prompt": "No silent rewriting, deleting or presenting old impact as proved.",
    "caution": "To test",
    "sourceRow": 64
  },
  {
    "id": "Q11",
    "type": "Student selects 'Not sure' after an unexpected finding",
    "condition": "Preserve unresolved discrepancy, allow save and contextual examples later.",
    "prompt": "No gate demanding a fabricated cause.",
    "caution": "To test",
    "sourceRow": 65
  },
  {
    "id": "Q12",
    "type": "Student opts out of examples",
    "condition": "Brief core questions remain; no 'show more' block.",
    "prompt": "No unwanted hint cards or automatically authored paragraph.",
    "caution": "To test",
    "sourceRow": 66
  },
  {
    "id": "E01",
    "type": "Actual Pearson r suggests linear association",
    "condition": "If a relevant estimation/prediction aim remains, a fitted line may answer it.",
    "prompt": "C35P→C35→C50",
    "caution": "Working draft",
    "sourceRow": 76
  },
  {
    "id": "E02",
    "type": "Actual Pearson r small AND scatter curved",
    "condition": "A suitable nonlinear model or approved rank approach may describe REAL observed shape.",
    "prompt": "C35P→C35→C50",
    "caution": "Working draft",
    "sourceRow": 77
  },
  {
    "id": "E03",
    "type": "Actual Pearson r small; no real pattern",
    "condition": "The honest limited finding may answer the aim; further maths only if real open question.",
    "prompt": "C35P→C35→C60",
    "caution": "Working draft",
    "sourceRow": 78
  },
  {
    "id": "E04",
    "type": "Actual fitted model has useful but limited domain",
    "condition": "A justified residual or prediction/domain check can add evidence.",
    "prompt": "C34→C35→C50",
    "caution": "Working draft",
    "sourceRow": 79
  },
  {
    "id": "E05",
    "type": "Actual optimum is candidate but not globally justified",
    "condition": "Endpoint/constraints comparison could close the mathematical argument.",
    "prompt": "C34→C35→C50",
    "caution": "Working draft",
    "sourceRow": 80
  },
  {
    "id": "E06",
    "type": "Actual theoretical conjecture supported by examples",
    "condition": "A proof or counterexample may genuinely establish scope.",
    "prompt": "C34→C35→C50",
    "caution": "Working draft",
    "sourceRow": 81
  },
  {
    "id": "E07",
    "type": "Latest section has answered open question",
    "condition": "The IA can proceed to final synthesis if relevant course-level mathematics adequate.",
    "prompt": "C34→C35→C60",
    "caution": "Working draft",
    "sourceRow": 82
  }
]);
