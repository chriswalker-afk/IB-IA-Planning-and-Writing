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
