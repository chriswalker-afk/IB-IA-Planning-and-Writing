import {methodFamilies as familyOf} from "./method-identity.js";
import {linkedAccuracy,sourceContextFields} from "./evidence-links.js";
/** Context facts used by every Phase 5 pedagogical selector. */
import {completeEntry,sourceResultForNext,scatterForNext,isPearsonResult,completionStage} from "./engine.js";

export const METHOD_OPTIONS=Object.freeze([
 ["","Choose a technique for relevant guidance (optional)"],
 ["pmcc","Pearson's product-moment correlation coefficient"],
 ["linear-regression","Straight-line regression / line of best fit"],
 ["spearman","Spearman's rank correlation"],
 ["quadratic-fit","Fitted quadratic, cubic or polynomial model"],
 ["exponential","Exponential growth/decay model"],
 ["sinusoidal","Trigonometric / periodic model"],
 ["optimisation","Differentiation / optimisation"],
 ["finance-break-even","Business revenue, costs, profit and break-even"],
 ["finance-compound","Compound interest / growth of an investment"],
 ["finance-loan","Loan repayments, annuities and amortisation"],
 ["finance-cashflow","Cumulative cash flow, business viability and sensitivity"],
 ["geometric-model","Measured geometric area/volume model"],
 ["normal","Normal-distribution model"],
 ["binomial","Binomial-probability model"],
 ["two-sample-t","Two-sample t-test"],
 ["chi-independence","Chi-squared test of independence"],
 ["chi-fit","Chi-squared goodness-of-fit test"],
 ["probability","Conditional probability / expected value"],
 ["voronoi","Voronoi diagram"],
 ["triangulation","Triangulation, surveying and measurement accuracy"],
 ["expected-value","Expected value and risk-based decisions"],
 ["numerical-integration","Trapezoidal rule / numerical integration"],
 ["rates-from-data","Empirical rates of change"],
 ["power","Power law or transformed model"],
 ["proof","Theoretical proof / counterexample"],
 ["algebra","Algebraic derivation / domains"],
 ["other","Other mathematical technique"]
]);
export const COURSE_OPTIONS=Object.freeze([
 ["unsure","I need to check the course/scope"],
 ["syllabus","Verified as in my course"],
 ["mixed","Main method is familiar, but part is new/outside my course"],
 ["outside","Verified outside my course and independently understood"]
]);
export const SCATTER_DETAILS=Object.freeze([
 ["","Choose only if you have examined the actual graph"],
 ["near-perfect","Points very close to one straight line"],
 ["rough-linear","Roughly linear, with noticeable scatter"],
 ["monotonic","Curved and generally increasing/decreasing"],
 ["turning","Curved with a turning point, reversal or repeated cycle"],
 ["unclear","No identifiable consistent pattern"],
 ["unexpected","Genuine unusual point or cluster"],
 ["periodic","Repeating peaks and troughs across several cycles"],
 ["unsure","I cannot yet identify its shape"]
]);
const str=v=>typeof v==="string"?v.trim():"";
const lo=v=>str(v).toLowerCase();
const joined=(...parts)=>parts.map(str).filter(Boolean).join(" ").toLowerCase();
export const isDone=entry=>entry?.status==="completed"&&!!str(entry.result);
export {methodFamilies as familyOf} from "./method-identity.js";
export function guidanceContext(state,node=state.completion.current){
 const c=state.completion,next=sourceResultForNext(state),
  entry=["C35","C35H","C35B","C35P"].includes(node)?next:completeEntry(state),
  f={...sourceContextFields(state,entry,node)},p=state.planning?.fields||{},
  scatter=scatterForNext(state),
  stage=completionStage(node,state);
 if(c.pairedDataForEntryId!==scatter?.id){f.pairedDataType="";f.scatterAimRelevance="";}
 if(c.pmccSignalForEntryId!==next?.id)f.pmccSignal="";
 const inMath=["C40","C50","C40T","C40D","C40L"].includes(node);
 const real=isDone(entry),method=familyOf(entry),plannedMethod=familyOf(entry,{allowPlanned:true});
 const methodText=joined(entry?.methodId,entry?.technique,entry?.title);
 const sample=joined(f.samplingMethod,f.sampleOrCensus,f.actualMethod);
 const statistical=(p.kind||state.project.kind)==="statistics";
 const modelling=(p.kind||state.project.kind)==="modelling";
 const theoretical=(p.kind||state.project.kind)==="theoretical"||entry?.kind==="theory";
 const sourceStatus=f.dataStatus||state.project.dataStatus;
 const hasActualSource=sourceStatus==="ready"||sourceStatus==="partial"||
   (theoretical&&sourceStatus==="theoretical");
 const hasActualSample=hasActualSource&&!!str(f.samplingMethod||f.sampleOrCensus);
 const sourceType=f.actualSourceType||p.dataSource||state.project.dataSource;
 const accuracy=Array.isArray(c.accuracyDecisions)?c.accuracyDecisions:[];
 const sourceAccuracy=c.sourceRecords.length?accuracy.filter(x=>x.sourceId===c.activeSourceId):accuracy;
 const matchingAccuracy=linkedAccuracy(state,entry);
 const latestAccuracy=matchingAccuracy;
 const paired=lo(f.pairedDataType)==="paired-numerical"||
   (!str(f.pairedDataType)&&!!scatter); // A real scatter gives a provisional lead, not verified pairing.
 return {
  node,stage,state,c,f,p,entry,next,scatter,real,inMath,method,plannedMethod,methodText,
  sample,statistical,modelling,theoretical,sourceType,sourceStatus,hasActualSource,
  hasActualSample,accuracy,sourceAccuracy,matchingAccuracy,latestAccuracy,
  course:str(p.course||state.project.course),aim:str(p.aim||state.project.aim),
  beneficiary:str(p.beneficiary||state.project.beneficiary),
  prediction:str(p.prediction||state.project.prediction),
  pairedNumerical:lo(f.pairedDataType)==="paired-numerical",
  pairedProvisional:paired,
  selectedPattern:(c.scatterPatternForEntryId===scatter?.id?f.scatterPattern:"")||str(scatter?.observation),
  selectedDetail:(c.scatterDetailForEntryId===scatter?.id?f.scatterDetail:""),
  confirmedLimitations:Array.isArray(c.confirmedLimitations)?c.confirmedLimitations:[],
  actualResults:state.entries.filter(isDone),
  actualResearch:!!str(entry?.researchSource||f.researchedMethod),
  hasWriting:str(state.scratch?.introduction)
 };
}
export function guidanceScope(ctx,sourceId){
 const {node,entry,next,scatter}=ctx;
 if(/^C2/.test(node)&&ctx.c.activeSourceId)return "source:"+ctx.c.activeSourceId;
 const after=/^W(?:16|17|18|19|23|24|25|26|27|28|38|43|47|48|49|51|52|53|56|57|64)$/.test(sourceId);
 const mathScope=after||/^W(?:20|21|39|40|41|42|45|50|54|58|59|60|61|62|63|65)$/.test(sourceId)||
  /^M/.test(sourceId);
 if(mathScope)return "entry:"+(after?entry?.id||next?.id||"none":entry?.id||next?.id||"none");
 if(["C34","C34A","C34B","C34U","C35","C35B","C35P","C35H"].includes(node))
  return "entry:"+(entry?.id||next?.id||"none");
 return "stage:"+(ctx.stage||node);
}
const nodeForAccuracy=ctx=>/^C2/.test(ctx.node);
const essential=strValue=>lo(strValue).replace(/\s+/g," ").slice(0,180);
export function guidanceFingerprint(ctx,sourceId){
 const {p,f,entry,next,scatter,c}=ctx;
 const common=[p.aim,p.course,p.kind,p.beneficiary,p.dataSource,f.dataStatus];
 let fields=[];
 if(/^W0[1-2]$/.test(sourceId))fields=[p.beneficiary||p.motivation,p.prediction,p.predictionWhy];
 else if(/^W(?:0[3-9]|1[01]|35|36|46)$/.test(sourceId))fields=[f.samplingMethod,f.sampleOrCensus,f.actualMethod,f.actualSource,f.secondaryVerified,f.modelAssumptions,ctx.sourceAccuracy.map(x=>x.id+":"+x.resolution+":"+x.policy).join(";")];
 else if(/^W(?:17|25|47|49|51|52|53|55|56|57)$/.test(sourceId))fields=[entry?.accuracyRef,(nodeForAccuracy(ctx)?ctx.sourceAccuracy:ctx.matchingAccuracy).map(x=>[x.id,x.unit,x.resolution,x.policy].join(":")).join(";"),entry?.reviewNeeded];
 else if(/^W(?:58|59|60|61|62|63|64|65|66)$/.test(sourceId))fields=[entry?.knowledge,entry?.methodId,entry?.unfamiliarComponent,entry?.researchSource,entry?.mathsInsight,entry?.reviewNeeded];
 else fields=[entry?.id,entry?.methodId,entry?.technique,entry?.status,entry?.observation,entry?.reviewNeeded,next?.id,scatter?.id,
   f.scatterPattern,f.scatterDetail,f.pmccSignal,f.nextMethod];
 // Hash is stable, compact, and does NOT include every keystroke of a result/essay.
 const base=[sourceId,...common,...fields].map(x=>Array.isArray(x)?x.join(";"):String(x??"")).map(essential).join("|");
 let h=2166136261;
 for(let i=0;i<base.length;i++){h^=base.charCodeAt(i);h=Math.imul(h,16777619)}
 return (h>>>0).toString(36);
}
export function hypotheticalExample(id){
 if(/^W(?:14|20|21|39|50)$/.test(id))return "Illustrative structure (not your findings): “The previous result leaves [a mathematical question] unanswered. I will use [a suitable method] because it could show [what is missing].” Replace every bracket with your own genuine reasoning.";
 if(/^W(?:16|18|26|38|48|64)$/.test(id))return "Illustrative structure: “The actual result suggests [a feature], which matters because [link to my aim]. However, it cannot establish [unsupported claim].” Use only what your own calculation supports.";
 if(/^W(?:60|61|62|63|65)$/.test(id))return "An appropriate first-use explanation might state what an unfamiliar parameter means, why the method applies under its conditions and one genuine mathematical step that illustrates your understanding. Do not copy a formula you cannot explain.";
 if(/^W(?:17|25|46|47|49|51|52|53|55|56|57)$/.test(id))return "Illustrative example: an exact value 2/3 stays 2/3; if rounded, write 2/3 ≈ 0.67. Measured input precision must be considered separately when it actually affects the final interpretation.";
 if(/^W(?:03|04|05|06|07|08|09|10|11)$/.test(id))return "Illustrative structure: “I used [actual method/source] because [link to my aim]. Its relevant scope is [real population or conditions], so I can only conclude [defensible inference].”";
 return "Try one short sentence in your own words explaining what the real mathematical choice or result means for your investigation. The example is not a model answer to copy.";
}
export const readable=(value,max=160)=>str(value).slice(0,max);
