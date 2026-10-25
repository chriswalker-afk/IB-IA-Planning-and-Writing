/**
 * Maths Workshop entry-point guidance for Help & Tips and I am stuck.
 * Read-only and strictly contextual: only explicit route/method/field/issue
 * choices are used. Do not inspect student prose or infer a mathematical
 * finding, course approval, completion, or grade.
 */
import {selectedInvestigativeRoute} from "../completing/adaptive-journey.js";
import {completeEntry,sourceResultForNext} from "../completing/engine.js";
import {routeById} from "../planning/investigative-routes.js";
import {lessonById,definitionById,workshopLessonForEntry} from "../workshop/catalog.js";

const profile=(start,calculate,interpret,follow,lesson)=>Object.freeze({start,calculate,interpret,follow,lesson});
export const WORKSHOP_HELP_ROUTES=Object.freeze({
 relationships:profile("paired-data","correlation","correlation","residual","pearson"),
 groups:profile("sampling","standard-deviation","interquartile-range","sampling-variability","distributions"),
 categorical:profile("two-way-table","conditional-proportion","percentage-point","conditional-probability","two-way-proportions"),
 variation:profile("instrument-resolution","standard-deviation","interquartile-range","sensitivity-analysis","distributions"),
 "fitted-models":profile("model","regression-line","residual","residual-pattern","linear-regression"),
 growth:profile("exponential-model","doubling-time","extrapolation","residual-plot","exponential-logarithms"),
 cycles:profile("period","amplitude","phase-shift","residual","sinusoidal-functions"),
 trajectories:profile("quadratic-model","vertex-form","instantaneous-rate","feasible-domain","quadratic-functions"),
 optimisation:profile("objective-function","stationary-point","global-extremum","constraint","optimisation"),
 images:profile("calibration-factor","scale-factor","uncertainty","sensitivity-check","image-calibration"),
 triangulation:profile("baseline","sine-rule","uncertainty","sensitivity-check","triangulation"),
 voronoi:profile("voronoi-cell","euclidean-distance","distance-metric","voronoi-boundary","voronoi-regions"),
 finance:profile("compound-interest","profit-function","net-present-value","financial-scenario","finance-sensitivity"),
 chance:profile("sample-space","conditional-probability","expected-value","sampling-variability","conditional-probability-tree"),
 proof:profile("conjecture","mathematical-proof","counterexample","inductive-step","proof-conjectures"),
 iteration:profile("recurrence-relation","fixed-point","convergence","iteration-residual","iteration-fixed-points")
});
const methodRoute=Object.freeze({
 pmcc:"relationships",spearman:"relationships","linear-regression":"fitted-models","quadratic-fit":"fitted-models",
 exponential:"growth",power:"growth",sinusoidal:"cycles",
 optimisation:"optimisation",derivatives:"trajectories",integration:"images","geometric-model":"images",
 triangulation:"triangulation",voronoi:"voronoi",normal:"variation",binomial:"chance",probability:"chance",
 "expected-value":"chance","two-sample-t":"groups","chi-independence":"categorical","chi-fit":"categorical",
 "finance-compound":"finance","finance-loan":"finance","finance-break-even":"finance","finance-cashflow":"finance",
 proof:"proof",induction:"proof",iteration:"iteration",recurrence:"iteration",bisection:"iteration","newton-raphson":"iteration"
});
const noSupportIssue=/^(?:consent-waiting|permission|no-data|source-real|result-needs-review|source-kind|published-origin|published-comparison|data-not-verifiable|availability|restore|overwhelmed|feedback|teacher-specific|timeline-stuck|course-choice|intro-no-start|intro-unsupported|conclusion-|mla-|writing|story|motivation-|aim-|interest-)/;
const samplingIssue=/(?:sample-choice|population-frame|sample-relevance|sampling|partial|bias)/;
const proofIssue=/(?:proof|theory-first|counterexample)/;
const focusForSpot=(spot,node)=>{
 const s=String(spot||"");
 if(/(?:interpretation|reflection|meaning|conclusionBenefit|outcome)/i.test(s)||s==="part:reflect"||s==="part:meaning")return "interpret";
 if(/(?:nextQuestion|nextReason|nextWhy|conclusionExtension|alternative|limitations|evaluation)/i.test(s)||s==="part:next")return "follow";
 if(/(?:result|firstWorkResult|firstOutput|technologyInput|technologyOutcome|calculat|show)/i.test(s)||s==="part:show")return "calculate";
 if(/(?:method|purpose|aimLink|bridge|courseWhy|introduce)/i.test(s)||s==="part:introduce"||s==="part:method")return "start";
 if(["C32","C33","C40T","C40L"].includes(node))return "calculate";
 if(["C34","C34B","C34U"].includes(node))return "interpret";
 if(["C35","C35B","C35P"].includes(node))return "follow";
 return "start";
};
const safe=v=>typeof v==="string"?v.trim():"";
export const workshopHelpFocus=(spot="",issue="",node="")=>{
 const id=safe(issue).replace(/^fix:(?:planning|studio|checking):/,"");
 if(samplingIssue.test(id))return "sampling";
 if(proofIssue.test(id))return "proof";
 if(/(?:precision|accuracy|resolution|scale)/.test(id))return "precision";
 if(/(?:meaning|interpret|outcome|pmcc-curved|unexpected)/.test(id))return "interpret";
 if(/(?:residual|next-|stages-dont-link|method-alternative)/.test(id))return "follow";
 if(id==="not-yet-result")return "calculate";
 if(/(?:real-calculation|tool-|technology-input|table-long|show-axis)/.test(id))return "calculate";
 if(/(?:first-purpose|first-choice|method-conditions|out-of-course|method-choice|course-depth)/.test(id))return "start";
 return focusForSpot(spot,node);
};
const fieldLabel=(focus,spot,node)=>{
 if(focus==="sampling")return "Sampling and data selection";
 if(focus==="precision")return "Measurement, accuracy and uncertainty";
 if(focus==="proof")return "Conjectures and mathematical proof";
 if(focus==="interpret")return "Explaining the mathematical meaning";
 if(focus==="follow")return "Checking what the next mathematics needs to answer";
 if(focus==="calculate")return "Showing and checking the calculation";
 if(String(spot).startsWith("field:"))return "Choosing the mathematics for this writing box";
 if(node==="N04S"||node==="N02M")return "Selecting mathematics for your investigation";
 return "Understanding the mathematical method";
};
/** One explicit selected entry can change the immediate method even if the
 * broader route in Planning stays the same. No titles/technique prose is read.
 */
const methodEntry=(state,node)=>{
 if(state?.route!=="completing")return null;
 if(["C35","C35B","C35P","C35H"].includes(node))return sourceResultForNext(state);
 return completeEntry(state);
};
const spotKey=(spot,node)=>String(spot||"").startsWith(node+":")?String(spot).slice(node.length+1):String(spot||"");
export function contextualWorkshopHelp(state,{spot="",issueId="",entry=null}={}){
 if(!state||!["planning","completing"].includes(state.route))return null;
 const planning=state.route==="planning";
 const node=planning?state.planning?.current||"":state.completion?.current||"";
 const location=spotKey(spot,node);
 const issue=safe(issueId).replace(/^fix:(?:planning|studio|checking):/,"");
 if(noSupportIssue.test(issue))return null;
 // Intro, conclusion, and final checking are communication tasks. Keep the
 // generic Workshop available from Help & Tips without injecting maths here.
 if(!planning&&["C10","C60","C61","C62","C63","C64","C70","C80","C90"].some(x=>node===x))return null;
 const samplingBox=planning&&node==="N03P2";
 const accuracyBox=planning&&node==="N03P"||!planning&&node==="C24";
 if(planning&&!samplingBox&&!accuracyBox&&
    !["N02","N02U","N02M","N02T","N04","N04S","N04T","N05","N05V","N03","N03B"].includes(node)&&
    !(location==="page"&&["N00B","N00C"].includes(node)))return null;
 // On broad idea/route-selection pages, a selected mathematical route is
 // necessary before providing named mathematical methods.
 const selected=selectedInvestigativeRoute(state),current=entry||methodEntry(state,node);
 const methodId=safe(current?.methodId),methodLesson=methodId&&methodId!=="other"?workshopLessonForEntry({methodId}):"";
 const explicitMethodRoute=methodId&&methodId!=="other"?methodRoute[methodId]:"";
 const routeId=explicitMethodRoute||selected?.id||"";
 const route=routeById(routeId);
 const focus=samplingBox?"sampling":workshopHelpFocus(location,issue,node);
 // A question about a sampling procedure supersedes the overall route,
 // because this particular box is asking how observations will be selected.
 const sampling=focus==="sampling"||samplingBox;
 const precision=focus==="precision"||accuracyBox;
 const proof=focus==="proof";
 const topic=sampling?"sampling":precision?"uncertainty":proof?"mathematical-proof":"";
 const profile=WORKSHOP_HELP_ROUTES[routeId];
 if(!topic&&!route&&!methodLesson)return null;
 // Do not offer a sampling/data-collection route to a theoretical study.
 const theory=state.planning?.fields?.kind==="theoretical"||state.planning?.fields?.dataSource==="theoretical";
 if(theory&&sampling)return null;
 let termId=topic||(profile?.[focus]||profile?.start||"");
 if(methodId==="finance-loan"&&focus==="calculate")termId="loan-amortisation";
 if(methodId==="finance-break-even"&&focus==="calculate")termId="break-even-point";
 if(methodId==="binomial"&&focus==="calculate")termId="binomial-distribution";
 if(methodId==="normal"&&focus==="calculate")termId="normal-distribution";
 if(methodId==="pmcc"&&focus==="interpret")termId="correlation";
 if(methodId==="optimisation"&&focus==="interpret")termId="global-extremum";
 if(methodId==="voronoi"&&focus==="interpret")termId="distance-metric";
 if(methodId==="finance-cashflow"&&focus==="calculate")termId="cash-balance";
 if(methodId==="finance-compound"&&focus==="calculate")termId="effective-annual-rate";
 if(!definitionById(termId))termId="";
 const lessonId=sampling?"sampling":precision?(routeId==="images"||routeId==="triangulation"?"geometry-sensitivity":"measurement"):
  (methodLesson||profile?.lesson||"");
 const lesson=lessonById(lessonId)||null,term=definitionById(termId)||null;
 if(!term&&!lesson)return null;
 return Object.freeze({
  routeId:route?.id||"",routeTitle:route?.title||"",focus,
  title:fieldLabel(focus,location,node),termId:term?.id||"",termTitle:term?.title||"",
  lessonId:lesson?.id||"",lessonTitle:lesson?.title||"",
  // The labels describe learning, never claim syllabus entitlement.
  note:focus==="interpret"?"Understand what a mathematical quantity means before explaining an actual result.":
   focus==="follow"?"Check which mathematical question remains before choosing another technique.":
   focus==="sampling"?"Compare how units are selected, what the frame includes and where bias might arise.":
   focus==="precision"?"Understand how measurement or rounding affects what your results can justify.":
   focus==="proof"?"Check what a conjecture, counterexample or proof can establish.":
   focus==="calculate"?"Work through a small invented example, then check your own method and inputs.":
   "Review the meaning and conditions of this method before deciding whether it fits your aim."
 });
}
/** Escaped, consistent buttons for the top-right menu, recovery hub and
 * both amber modal pop-ins. Host app handles all resource-* actions.
 */
export function renderContextualWorkshopHelp(help,escapeHtml,{compact=false}={}){
 if(!help)return "";
 const e=escapeHtml;
 const meta=' data-resource-help="true"'+(help.routeId?' data-workshop-route="'+e(help.routeId)+'"':"");
 const term=help.termId?'<button class="btn btn-secondary" type="button" data-action="resource-workshop"'+meta+
  ' data-workshop-term="'+e(help.termId)+'">Understand: '+e(help.termTitle)+'</button>':"";
 const lesson=help.lessonId?'<button class="btn btn-secondary" type="button" data-action="resource-workshop"'+meta+
  ' data-workshop-id="'+e(help.lessonId)+'">Show me · '+e(help.lessonTitle)+'</button>':"";
 const browse=!term&&!lesson?'<button class="btn btn-secondary" type="button" data-action="resource-workshop"'+meta+
  '>Browse related mathematics</button>':"";
 return '<section class="workshop-contextual-help" aria-label="Relevant Maths Workshop support" data-workshop-help-focus="'+e(help.focus)+'">'+
  '<div class="workshop-contextual-head"><strong>Maths Workshop · '+e(help.title)+'</strong>'+
  (help.routeTitle?'<span>Chosen pathway: '+e(help.routeTitle)+'</span>':"")+'</div>'+
  '<p>'+e(help.note)+'</p><div class="workshop-contextual-actions">'+term+lesson+browse+'</div>'+
  (compact?"":'<p class="workshop-contextual-caution">Optional examples only. Check the method against your aim and course; reading this never writes an IA result.</p>')+
  '</section>';
}
