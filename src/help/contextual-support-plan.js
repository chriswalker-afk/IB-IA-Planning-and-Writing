/**
 * EDITORIAL-ONLY Pass 1 blueprint: not imported by app.js, no live UI change.
 * This extends the 24 durable help topics without changing saved support state.
 * A contextual bubble offers help; it must never diagnose from student prose.
 */
export const SUPPORT_PLAN_VERSION="2026-10-23-pass1";
const freeze=items=>Object.freeze(items.map(x=>Object.freeze(x)));
export const SUPPORT_FAMILIES=freeze([
 ["ideas","Ideas & planning"],["evidence","Data, sources & methods"],
 ["mathematics","Doing mathematics"],["writing","Explaining & writing"],
 ["checking","Checking & improving"],["practical","Practical & technical help"]
].map(([id,label])=>({id,label})));
/** Draft fact vocabulary. Pass 2 must implement guarded selectors from explicit state. */
export const SUPPORT_FACTS=Object.freeze({
 "idea-unset":"No provisional idea selected",
 "ideas-compared":"The compare-ideas mode is active",
 "aim-recorded":"A current provisional aim is saved",
 "route-chosen":"An investigative route or kind has been chosen",
 "course-chosen":"An IB mathematics course is selected",
 "data-primary":"Primary evidence is planned or present",
 "data-secondary":"Secondary evidence is planned or present",
 "data-not-ready":"Real required evidence is not ready",
 "data-partial":"Real evidence is recorded as partial",
 "permission-unresolved":"Access/consent is explicitly pending or unsure",
 "theoretical":"Investigation or active stage is explicitly theoretical",
 "selected-method":"Current mathematical entry declares a method",
 "method-unfamiliar":"Current method is marked outside/partly outside known course",
 "selected-actual-result":"Selected entry is completed AND has real recorded results",
 "no-selected-actual-result":"No completed result is selected at this location",
 "selected-outcome":"An outcome belongs to the selected result and is current",
 "result-needs-review":"A dependent mathematical record is flagged for review",
 "linked-figure":"A saved diagram is actually linked to the selected stage",
 "real-feedback":"Permitted teacher feedback has actually been recorded",
 "sources-recorded":"There is a saved source/research note; not proof of a document citation",
 "legacy-criteria":"Student explicitly selected the through-2028 A-E rubric",
 "revised-criteria":"Student explicitly selected the 2029 A-D rubric"
});
const legacy=(id,family,decision,change)=>({id,family,decision,change});
/** Every one of the 24 original topic IDs remains valid for old JSON backups. */
export const SUPPORT_LEGACY_AUDIT=freeze([
 legacy("idea","ideas","split","Interest vs mathematical route vs too-specific topic"),
 legacy("aim","ideas","split","Scope/variables vs authentic motivation"),
 legacy("method","ideas","split","Purpose, route choice and course suitability"),
 legacy("prediction","ideas","deepen","Optional provisional idea, not invented finding"),
 legacy("no-data","evidence","split","Delay vs insufficient evidence vs safe preparatory maths"),
 legacy("source","evidence","split","Definitions, units, observation level, provenance"),
 legacy("partial","evidence","split","Missing pairs, outliers, small/biased samples"),
 legacy("permission","practical","deepen","Pending approval is not an IA mathematical limitation"),
 legacy("first","mathematics","split","First diagram, small case or useful calculation"),
 legacy("calculation","mathematics","split","Maths error vs source input vs software operation"),
 legacy("interpret","mathematics","split","Linked finding, selected technique, units and aim"),
 legacy("next","mathematics","split","Finding -> still unknown -> justified next method or stop"),
 legacy("unexpected","mathematics","deepen","Genuine surprising/inconclusive outcomes"),
 legacy("understanding","mathematics","deepen","Syllabus method vs researched unfamiliar component"),
 legacy("proof","mathematics","deepen","Domain, conjecture, counterexample, general argument"),
 legacy("precision","evidence","split","Input accuracy vs derived precision vs exact equality"),
 legacy("limitations","writing","deepen","Real mathematical consequences, not practical delays"),
 legacy("writing","writing","split","Where to write vs connecting genuine mathematical work"),
 legacy("story","writing","split","Synthesis of answers, coherence, judicious shortening"),
 legacy("conclusion","writing","split","Evidence answer, scope, beneficiary, honest next steps"),
 legacy("feedback","checking","deepen","Actually received feedback and dependent revisions"),
 legacy("overwhelmed","practical","deepen","One bounded self-chosen next action; no invented date"),
 legacy("restore","practical","relocate","Move prominent recovery tools to practical help"),
 legacy("unsure","practical","deepen","No-diagnosis fallback and better teacher questions")
]);
const newIntent=(id,family,need,pass)=>({id,family,need,pass});
/** Specific missing situations; editorial drafts, not yet saved user problem IDs. */
export const SUPPORT_NEW_INTENTS=freeze([
 newIntent("idea-math-lens","ideas","Find productive maths from broad interests/evidence",2),
 newIntent("idea-over-narrow","ideas","Reconnect overly specific topic to broader mathematical lens",2),
 newIntent("idea-feasibility","ideas","Check startability and realistic evidence/maths",2),
 newIntent("beneficiary-purpose","ideas","Explain genuine purpose and intended usefulness",2),
 newIntent("route-uncertainty","ideas","Choose statistical, model or theory direction",2),
 newIntent("course-suitability","ideas","Check AA SL, AI SL or AA HL mathematics safely",2),
 newIntent("population-frame","evidence","Distinguish population, units, sampling frame",2),
 newIntent("source-provenance","evidence","Verify original secondary data definitions",2),
 newIntent("source-compatibility","evidence","Resolve mismatched sources and variable meanings",2),
 newIntent("paired-values","evidence","Validate paired rows and missingness",3),
 newIntent("assumption-domain","evidence","State mathematical model assumptions and domain",3),
 newIntent("first-purpose","mathematics","Use purposeful first maths rather than decoration",3),
 newIntent("figure-repair","mathematics","Correct graph/figure scale, notation or units",3),
 newIntent("tool-choice","mathematics","Choose from seven live representation tools",3),
 newIntent("result-validation","mathematics","Check truth and scope of actual output",3),
 newIntent("outcome-dependent","mathematics","Use confirmed 16-route outcome to decide next",3),
 newIntent("model-diagnostics","mathematics","Test residuals, domain and model alternatives",3),
 newIntent("technology-explanation","writing","Explain mathematical operation and output of technology",3),
 newIntent("coherence-bridge","writing","Link finding, unanswered gap and next method",3),
 newIntent("student-synthesis","writing","Combine separate notes into fluent student prose",3),
 newIntent("conclusion-readiness","writing","Decide honestly when enough maths is enough",3),
 newIntent("mla-workflow","checking","Learn one MLA referencing workflow",4),
 newIntent("citation-two-way","checking","Match in-text sources with actual Works Cited",4),
 newIntent("source-authorship","checking","Audit acknowledgement and independent work",4),
 newIntent("draft-priority","checking","Prioritise mathematical over cosmetic draft repair",4),
 newIntent("review-evidence","checking","Ground review answers in actual submitted document",4),
 newIntent("saving-backups","practical","Distinguish JSON full backup from PDF/Word plan",4),
 newIntent("teacher-question","practical","Prepare precise teacher question from issue",4)
]);
const current={kind:"stay"};
const stage=(route,node)=>({kind:"stage",route,node});
const resource=id=>({kind:"resource",id});
const p=(id,family,route,nodes,anchor,intents,facts=[],destination=current,resourceIds=[],toolIds=[],priority=50)=>({
 id,family,route,nodes,anchor,intents,facts,destination,resourceIds,toolIds,priority
});
/**
 * Placement/eligibility decisions ONLY. Single icon per meaningful anchor;
 * each opens up to three problem choices, not three separate badges.
 * Checking uses a phase/mode and has no Completing node.
 */
export const SUPPORT_PLACEMENTS=freeze([
 p("idea-interest","ideas","planning",["N00B"],"Interest-first mind map / maths lens",["idea","idea-math-lens","idea-over-narrow"]),
 p("idea-evidence","ideas","planning",["N00B"],"Evidence-first mind map / maths lens",["idea","idea-math-lens","route-uncertainty"]),
 p("idea-compare","ideas","planning",["N00C"],"Compare ideas",["idea","idea-feasibility"],["ideas-compared"]),
 p("aim","ideas","planning",["N01"],"Provisional aim",["aim","idea-over-narrow"]),
 p("beneficiary","ideas","planning",["N01V"],"Meaningful motivation",["aim","beneficiary-purpose"]),
 p("kind","ideas","planning",["N02","N02U"],"Investigation type",["method","route-uncertainty"]),
 p("course","ideas","planning",["N02M","N04","N04S","N04T"],"Course / maths choice",["method","course-suitability"],[],stage("planning","N04S")),
 p("theory-teacher","practical","planning",["N02T"],"Theory scope and teacher check",["permission","teacher-question"],["theoretical"],stage("planning","N06T"),[],[],90),
 p("data-choice","evidence","planning",["N03","N03B"],"Primary or secondary plan",["no-data","source"]),
 p("primary-data","evidence","planning",["N03P"],"Collection when/where/how",["no-data","permission"],["data-primary"]),
 p("sampling","evidence","planning",["N03P2"],"Population / units / frame",["partial","population-frame"],["data-primary"]),
 p("secondary","evidence","planning",["N03S"],"Published-source check",["source","source-provenance","source-compatibility"],["data-secondary"],current,["secondary-data"]),
 p("data-status","evidence","planning",["N03D","N03R"],"Readiness and recovery",["no-data","partial","idea-feasibility"],[],stage("planning","N03D")),
 p("permission","practical","planning",["N02T","N03P","N06T"],"Consent/permission",["permission","teacher-question"],["permission-unresolved"],stage("planning","N06T"),[],[],100),
 p("timeline","practical","planning",["N03H"],"Workload and school milestones",["overwhelmed","idea-feasibility"]),
 p("prediction","ideas","planning",["N01P"],"Prediction / refine the plan",["prediction","first"]),
 p("planning-review","ideas","planning",["N06","N07","N08"],"Plan checkpoint",["aim","teacher-question"],[],stage("planning","N06T")),
 p("intro-aim","writing","completing",["C10"],"Aim and genuine motivation",["writing","beneficiary-purpose"]),
 p("intro-prediction","writing","completing",["C10"],"Original prediction (if present)",["prediction","writing"]),
 p("first-maths-reason","writing","completing",["C20"],"Explain why this mathematics first",["first","first-purpose"]),
 p("actual-source","evidence","completing",["C20","C26"],"Real source vs plan",["source","source-provenance"],[],current,["secondary-data"]),
 p("actual-sampling","evidence","completing",["C21S"],"Actual sample and limits",["partial","population-frame"],["data-primary"],current,["summary-stats"],["stat"]),
 p("model-conditions","evidence","completing",["C21M"],"Model assumptions / domain",["method","assumption-domain"],[],current,["restrictions"],["graph"]),
 p("theory","mathematics","completing",["C21T"],"Theory domain and counterexamples",["proof","understanding"],["theoretical"]),
 p("method-rationale","mathematics","completing",["C22","C40D"],"Explain mathematical method choice",["method","course-suitability"]),
 p("mathematical-limits","writing","completing",["C23"],"Relevant limitations",["limitations","assumption-domain"]),
 p("precision","evidence","completing",["C24","C34A"],"Precision and resolution",["precision"],[],current,["reporting-precision"]),
 p("definitions","writing","completing",["C25"],"Meaningful variable definitions",["writing","figure-repair"]),
 p("first-move","mathematics","completing",["C30","C32"],"Purposeful small representation",["first","first-purpose"],[],current,["chart-choice"],["graph","table","geometry"]),
 p("first-figure","mathematics","completing",["C30","C31","C33"],"Seven representation options",["tool-choice","figure-repair"],[],current,["export-figure"],["graph","stat","table","trace","voronoi","geometry","probability"]),
 p("first-result","mathematics","completing",["C30","C34","C34B"],"Actual result interpretation",["interpret","result-validation"],["selected-actual-result"]),
 p("no-result","mathematics","completing",["C30","C34","C35"],"No selected real result yet",["first","result-validation"],["no-selected-actual-result"],stage("completing","C30")),
 p("surprise","mathematics","completing",["C30","C34U"],"Genuine unexpected finding",["unexpected","outcome-dependent"],["selected-actual-result"]),
 p("link-next","writing","completing",["C30","C35","C35H","C40","C50"],"Finding / gap / next method",["next","coherence-bridge"],["selected-actual-result"]),
 p("journey-next","mathematics","completing",["C35","C40","C50"],"Confirmed adaptive outcome",["next","outcome-dependent"],["selected-actual-result","selected-outcome"]),
 p("stale-journey","mathematics","completing",["C40","C50"],"Dependent record needs review",["result-validation","coherence-bridge"],["result-needs-review"],current,[],[],95),
 p("stage-calculation","mathematics","completing",["C40","C50"],"Mathematical correctness",["calculation","understanding"],["selected-method"]),
 p("later-result","mathematics","completing",["C40","C50"],"Actual later-stage findings",["interpret","result-validation"],["selected-actual-result"]),
 p("unfamiliar-method","mathematics","completing",["C40L"],"Research-backed new mathematics",["understanding","technology-explanation"],["method-unfamiliar"],current,["organise"]),
 p("technology","writing","completing",["C40T"],"Technology output and meaning",["calculation","technology-explanation"]),
 p("paired-graph","evidence","completing",["C35B"],"Matched pairs and scatter shape",["paired-values","result-validation"],["selected-actual-result"],current,["sheets-scatter"],["graph"]),
 p("pmcc","mathematics","completing",["C35P"],"Correlation vs curvature / prediction",["interpret","model-diagnostics"],["selected-actual-result"],current,["pmcc-meaning"],["graph"]),
 p("conclusion","writing","completing",["C60"],"Evidence-led final answer",["conclusion","conclusion-readiness"]),
 p("conclusion-limits","writing","completing",["C60"],"Meaning, uncertainty and beneficiary",["limitations","student-synthesis"]),
 p("presentation","writing","completing",["C70","C70N"],"Notation, axes and units",["story","figure-repair"],[],current,["reporting-precision"],["graph","geometry"]),
 p("draft-feedback","checking","completing",["C80","C80D"],"Real teacher feedback",["feedback","draft-priority"],["real-feedback"]),
 p("mla","checking","completing",["C70","C90"],"Reference workflow",["mla-workflow","citation-two-way"],[],resource("mla-citations"),["mla-citations"]),
 p("final-check","checking","completing",["C90","C90F"],"Final work and authenticity",["feedback","source-authorship"]),
 p("checking-draft","checking","checking",[],"Review draft evidence",["draft-priority","review-evidence"]),
 p("checking-final","checking","checking",[],"Review final evidence",["review-evidence","conclusion-readiness"]),
 p("checking-cites","checking","checking",[],"D09: citation tracing",["citation-two-way","mla-workflow"],[],resource("mla-citations"),["mla-citations"]),
 p("checking-integrity","checking","checking",[],"D12: authorship",["source-authorship"]),
 p("checking-mathematics","checking","checking",[],"Calculations and figure checks",["result-validation","figure-repair"]),
 p("hub-unknown","practical","hub",[],"I am not sure what's wrong",["unsure","teacher-question"]),
 p("hub-workload","practical","hub",[],"Choose one small action",["overwhelmed"]),
 p("hub-save","practical","hub",[],"Backup and recovery",["restore","saving-backups"]),
 p("hub-teacher","practical","hub",[],"Prepare a teacher question",["permission","teacher-question"],[],stage("planning","N06T"),[],[],100)
]);
/**
 * 16 editorial overlays use existing INVESTIGATIVE_ROUTES and the actual,
 * selected adaptive-journey outcome; not a competing outcomes taxonomy.
 */
const overlay=(routeId,focus,question,boundary,toolIds=[])=>({routeId,focus,question,boundary,toolIds});
export const SUPPORT_JOURNEY_OVERLAYS=freeze([
 overlay("relationships","Paired data and observed shape","Does the aim need association or prediction?","Pearson r describes linear association, not causation.",["graph","table"]),
 overlay("groups","Comparability and distributions","Do the groups differ in centre, shape or spread?","Different means alone are not causal/population evidence.",["stat","table"]),
 overlay("categorical","Conditional proportions and denominators","Are the categories and denominators appropriate?","Do not assert dependence with an invalid test.",["table"]),
 overlay("variation","Spread against measurement resolution","Is variation meaningful relative to uncertainty?","Precision alone is not accuracy or lack of bias.",["stat"]),
 overlay("fitted-models","Residuals and model domain","Does the fit answer the intended question?","High R-squared alone does not justify extrapolation.",["graph"]),
 overlay("growth","Additive, multiplicative or bounded change","Does observed change match the chosen rule?","Few values do not prove exponential growth.",["graph"]),
 overlay("cycles","Enough observed cycles","Does the evidence support an actual period?","One peak and trough is not proof of periodicity.",["graph"]),
 overlay("trajectories","Scaling, perspective, motion assumptions","Is the trajectory model physically justified?","Polynomial interpolation alone is not physics.",["trace","graph"]),
 overlay("optimisation","Constraints, endpoints and sensitivity","Is a candidate best in the feasible domain?","A stationary point alone is not necessarily an optimum.",["graph","geometry"]),
 overlay("images","Calibration and boundary sensitivity","How sensitive is the result to a defensible trace?","Pixel counts require justified scale.",["trace","geometry"]),
 overlay("triangulation","Baseline and angle error","Could measurement error change the conclusion?","Calculator digits cannot fix a poor measurement.",["geometry"]),
 overlay("voronoi","Site choice and distance assumptions","Would site/coordinate changes alter regions?","Euclidean nearest is not necessarily fastest travel.",["voronoi"]),
 overlay("finance","Break-even and assumption sensitivity","Which uncertain input might change the decision?","Forecasts must not be reported as observations.",["table","graph"]),
 overlay("chance","Independence and conditional branches","Are event probabilities and paths defined correctly?","Simulation does not prove exact probabilities.",["probability"]),
 overlay("proof","Domains, counterexamples, generality","Does the argument establish all allowed cases?","Finite examples are not proof.",["table"]),
 overlay("iteration","Rules, stopping tests, convergence","What demonstrates convergence under the conditions?","Stable digits in examples do not prove convergence.",["table","graph"])
]);
export const SUPPORT_SELECTION_POLICY=Object.freeze({
 priority:["unresolved permission/safety","stale linked result","confirmed route outcome","current field","current stage","broad diagnosis"],
 maxBubblesPerAnchor:1,maxInitialHubProblems:4,maxPopinProblems:3,maxAlternativeActions:2,
 automaticPopups:false,reducedAdviceKeepsAccess:true,readOnlyUntilExplicitAction:true
});


/**
 * EDITORIAL ROLE BOUNDARIES — these are distinct tools, not three colours
 * containing variants of the same advice.
 *
 * Criteria:   what matters to the IB's assessment in this location.
 * Field Guide: how a mathematical writer communicates effectively.
 * Stuck help:  what specific obstacle prevents the student's NEXT ACTION,
 *             and what bounded diagnostic/repair will unblock it?
 */
export const SUPPORT_ROLE_BOUNDARIES=Object.freeze({
 criteria:Object.freeze({
  question:"What does the applicable IB assessment framework value here?",
  output:"Criterion-specific explanation and full rubric; never an issue diagnosis",
  avoid:"Never use marks, levels or assessment speculation to decide a stuck remedy"
 }),
 writersGuide:Object.freeze({
  question:"How could an already feasible mathematical explanation be communicated?",
  output:"Writing craft, worked weak/strong comparisons and coherent prose advice",
  avoid:"Do not repeat general writing instructions as a supposed stuck solution"
 }),
 stuck:Object.freeze({
  question:"What exactly cannot the student do now, and which small repair helps?",
  output:"Student-recognisable blocker -> diagnosis -> one action -> specific check -> optional fallback",
  avoid:"Do not prescribe ideal writing, duplicate criteria, predict struggle from blanks or issue generic encouragement"
 })
});

/**
 * Every NEW student-visible stuck response must fulfil this shape.
 * The data below are Pass 1 worked exemplars for editorial review, NOT
 * final help text or automatic identification of a student's difficulty.
 */
export const SUPPORT_BLOCKER_STANDARD=Object.freeze({
 required:["id","placementId","problem","quickQuestion","action","check","stoppingPoint","ifStillStuck","boundary","distinctFrom"],
 maxInitialChoices:3,
 problemFirst:true,
 oneImmediateAction:true,
 supportsExplicitStudentChoice:true,
 explainsHowToCheck:true,
 noCopyReadyIAParagraph:true,
 linkToGuideOnlyAfterBlocker:true,
 genericCriteriaOrWritingAdviceIsNotEnough:true
});
const recovery=(id,placementId,problem,quickQuestion,action,check,stoppingPoint,ifStillStuck,boundary,distinctFrom)=>({
 id,placementId,problem,quickQuestion,action,check,stoppingPoint,ifStillStuck,boundary,distinctFrom
});
/**
 * This is the editorial quality bar for Passes 2-4.
 * The first-person difficulty is an OFFER, never a judgement of the student's
 * work. Diagnostic questions branch only when the answer changes the remedy.
 */
export const SUPPORT_RECOVERY_EXEMPLARS=freeze([
 recovery(
  "sport-but-no-question","idea-interest",
  "I am interested in sport but cannot find a mathematical investigation.",
  "Would you rather compare repeated performances, model a movement or optimise a decision?",
  "Choose just one mathematical lens. Name one variable, mathematical property or constraint you could investigate and how you would measure or define it.",
  "Can you now state what a calculation, comparison or model would actually help you find out?",
  "One possible mathematical question and one realistic first check, not a final IA title.",
  "If no safe evidence or useful mathematics is possible, change lens rather than just making the sport more specific.",
  "A suggested direction is not guaranteed course-appropriate or viable; no compulsory survey or invented results.",
  "Unlike Field Guide motivation tips or personal-engagement criteria, this gives an executable route from interest to mathematics."
 ),
 recovery(
  "sample-frame-confusion","sampling",
  "I cannot tell the difference between the population and my sampling frame.",
  "Could somebody be in the population you want to describe but impossible to reach through your actual selection list?",
  "Write three separate short labels: who you want to make a claim about, who could really be selected, and what counts as one observation.",
  "If those first two groups differ, can you name at least one kind of person or unit missing from the frame?",
  "A concrete sample/frame distinction and what it could restrict.",
  "If there is no defensible sampling frame, discuss a narrower claim or different permitted evidence with your teacher.",
  "Never assume permission to contact participants or collect sensitive data.",
  "Not a generic criterion D reflection hint or Field Guide paragraph on sampling."
 ),
 recovery(
  "source-row-mismatch","secondary",
  "I have two useful-looking datasets but cannot tell whether I can combine them.",
  "In each source, what exactly does one row represent: a person, place, event, average or time period?",
  "For each file, check one row's unit, variable definition, date range and measurement units; put them side by side.",
  "Do the values refer to the same kind of observation and meaning, or would combining them change the original aim?",
  "A justified keep, reject or refine-aim decision for these actual sources.",
  "If definitions cannot be verified, look for original publisher metadata rather than treating the numbers as equivalent.",
  "Never silently merge individual measurements with group averages or claim a source was verified without checking.",
  "This solves source compatibility before any writing advice about citation or clarity."
 ),
 recovery(
  "course-maths-uncertain","course",
  "I have a possible technique but am not sure whether it suits my course or question.",
  "What specific mathematical question would this technique answer in your investigation?",
  "Write that mathematical job in one sentence, identify the exact part you understand, and compare it with your chosen course's available methods.",
  "Can you explain why this technique is needed instead of naming it just because it is advanced?",
  "One candidate method with a reason and one exact suitability question if uncertainty remains.",
  "Ask your teacher about course depth or an unfamiliar method before building the investigation around it.",
  "The site must not assert AA HL suitability or guaranteed scoring from a method choice.",
  "Unlike Criterion E guidance, it helps decide an immediate feasible mathematical method, not describe assessment descriptors."
 ),
 recovery(
  "curved-scatter-small-r","pmcc",
  "My Pearson coefficient is small but my actual scatter seems to show a curve.",
  "Have you checked the original paired observations, and does the graph genuinely bend or just have a few unusual points?",
  "Look again at the plotted matched pairs and describe the observed shape before interpreting the coefficient; note explicitly that Pearson measures linear association.",
  "Does your claim distinguish a weak linear association from the possible presence of a non-linear relationship?",
  "A corrected interpretation and a reason either to examine another model or to stop.",
  "If the shape is unclear, check scale, axes and source pairs before choosing another coefficient or curve.",
  "Only offer this case when relevant actual paired results and a user-confirmed shape exist. Curvature alone does not establish monotonicity.",
  "This repairs a mathematical misunderstanding, not a writing style or IB grading issue."
 ),
 recovery(
  "proof-from-examples","theory",
  "I can verify lots of examples, but I cannot establish my general claim.",
  "What are the exact permitted values and assumptions in the claim?",
  "Write the statement with its domain. Test one boundary case or plausible counterexample, then identify the general step that still needs an argument.",
  "Would the reasoning apply beyond the particular numbers already checked?",
  "Either a more precise conjecture, a genuine counterexample, or one justified proof step.",
  "If you cannot justify the general step, ask your teacher which suitable proof approach might apply and label the statement a conjecture.",
  "Examples and numerical checking are not a proof; no invented argument can be supplied as student work.",
  "This targets the mathematical gap, not a general Field Guide instruction to explain unfamiliar notation."
 ),
 recovery(
  "stage-transition-block","link-next",
  "I have a result but cannot explain why another mathematical stage should follow it.",
  "What exact question is left unanswered by the result you have actually obtained?",
  "Write three private notes: the previous finding, what that finding cannot establish, and the job a possible next method would do.",
  "Can you point to a real gap that the next method answers, rather than a desire to use more mathematics?",
  "One justified next mathematical question, or a decision to conclude.",
  "If the aim is already answered, go to the conclusion instead. Only then consult the Field Guide if you need help joining the notes into prose.",
  "Never insert a ready-made bridge into the student's actual IA or turn a predicted result into an established fact.",
  "Field Guide teaches the prose structure; this case decides whether there is any mathematical reason for a second stage."
 ),
 recovery(
  "probability-tree-error","first-figure",
  "My probability tree gives totals that do not make sense.",
  "At which node do the outgoing branch probabilities first fail to total 1?",
  "Inspect just that node. Identify the event being conditioned on and correct the outgoing probabilities using the appropriate conditional group.",
  "For each node checked, do its branches represent mutually exclusive outcomes with a sum of 1?",
  "One independently checked branching step before trusting any final path probability.",
  "If probabilities depend on previous outcomes, revisit the conditioning assumption rather than copying the first branches.",
  "A tree diagram does not create valid probabilities automatically; no external participant data are required.",
  "Unlike generator tutorials, this diagnoses the mathematical source of an inconsistent diagram."
 ),
 recovery(
  "conclusion-or-more-maths","conclusion",
  "I cannot decide whether I should add more mathematics before concluding.",
  "Which exact part of your original aim is not answered by your completed results?",
  "Compare the stated aim with the results you can actually support, then write one unresolved mathematical question only if one remains.",
  "Would further mathematics answer that question, or merely make the IA longer?",
  "A defensible continue-or-conclude decision anchored to actual work.",
  "If essential evidence is missing, return to that mathematical step; do not compensate with unrelated techniques.",
  "A plan or a persuasive prediction is not an actual result; no required number of stages or promised marks.",
  "Criteria discusses evaluation; the Field Guide discusses conclusion prose; this removes the student's decision blockage."
 ),
 recovery(
  "citation-original-source","checking-cites",
  "I used a picture or dataset but cannot find the source details needed to acknowledge it.",
  "Can you find the original publisher or creator rather than only the page where you discovered a copy?",
  "Open the original source, record its author/organisation, title, relevant date and URL or publication details, and mark where the material appears in your actual IA.",
  "Can you trace the actual item to an in-text citation AND an entry in Works Cited?",
  "One genuinely traceable source ready for the site's MLA tutorial.",
  "If the original cannot be verified, do not invent bibliographic details; replace the material or ask your teacher.",
  "The website cannot read, verify or automatically edit a separate Google Docs IA.",
  "Referencing tutorial gives formatting steps; stuck help identifies and repairs missing original-source information."
 )
]);
