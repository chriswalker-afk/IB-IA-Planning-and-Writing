import {WRITING_MOMENTS} from "./guidance-catalog.js";
import {
 guidanceContext,guidanceFingerprint,guidanceScope,hypotheticalExample,
 isDone,familyOf,readable
} from "./guidance-context.js";
import {isPearsonResult,isScatterResult,canViewPmccFollowup,sourceResultForNext} from "./engine.js";

const str=v=>typeof v==="string"?v.trim():"";
const matches=(text,re)=>re.test(String(text||"").toLowerCase());
const exists=v=>!!str(v);
const includesNode=(def,node)=>new RegExp("C\\d{2}[A-Z]?","g").exec(def.nodes)?([...def.nodes.matchAll(/C\d{2}[A-Z]?/g)].map(m=>m[0]).includes(node)):false;
const strong=(entry)=>isDone(entry)&&[entry.interpretation,entry.localTakeaway,entry.observationText].some(exists);
const hasModel=f=>exists(f.modelInputs)||exists(f.modelAssumptions);
const relevance=(id,x)=>{
 const {node,f,p,entry,next,scatter,accuracy,real,method,plannedMethod,
  hasActualSource,hasActualSample,statistical,modelling,theoretical,actualResults,
  course,aim,beneficiary}=x;
 const sample=x.sample,tech=x.methodText;
 const entryMethod=exists(entry?.technique)||exists(entry?.methodId);
 const dataSafe=hasActualSource&&!theoretical;
 const derived=real&&!theoretical&&(method.has("fitted-model")||method.has("statistic")||
   method.has("optimisation")||method.has("geometric-model")||method.has("rates-from-data")||
   entry?.kind==="model");
 const accuracyRelated=accuracy.length>0&&(exists(entry?.accuracyRef)||exists(f.accuracyForResult));
 const nextMath=exists(f.nextQuestion)&&exists(f.nextReason)&&!!next;
 const techUsed=exists(f.technologyTool)&&exists(f.technologyOutcome)&&real&&f.technologyForEntryId===entry?.id;
 const measured=exists(f.actualMethod)&&dataSafe &&
  /measure|timing|stopwatch|ruler|sensor|scale|video|survey|collect/i.test(f.actualMethod);
 const limits=x.confirmedLimitations.length>0||exists(f.methodLimitation);
 const shape=x.selectedPattern,linear=shape==="linear",
  curved=shape==="curved",unclear=shape==="unclear",unusual=shape==="unexpected";
 const weak= f.pmccSignal==="weak-linear",applied=real&&entryMethod;
 const insight=real&&exists(entry?.mathsInsight);
 const sourceConfirmed=hasActualSource&&(x.sourceType==="secondary"||x.sourceType==="both") &&
  exists(f.actualSource||f.sourceCitation)&&matches(p.secondaryVerified,/verified|checked|yes|confirmed|original/i);
 switch(id){
  case "W01":return !!aim&&(!!str(p.motivation)||!!str(p.interest));
  case "W02":return !theoretical&&exists(x.prediction);
  case "W03":return statistical&&hasActualSample&&exists(f.statisticalPopulation)&&exists(f.alternativeMethod);
  case "W04":return statistical&&hasActualSample&&matches(sample,/volunt|convenien|opportun|self.select/)&&exists(f.statisticalPopulation);
  case "W05":return statistical&&hasActualSample&&matches(sample,/simple.random|random.sample/)&&exists(f.samplingRationale);
  case "W06":return statistical&&hasActualSample&&matches(sample,/stratif/)&&exists(f.samplingRationale);
  case "W07":return statistical&&hasActualSample&&matches(sample,/census/)&&exists(f.statisticalPopulation);
  case "W08":return sourceConfirmed&&exists(f.sourceCitation);
  case "W09":return measured;
  case "W10":return (theoretical||modelling)&&hasModel(f);
  case "W11":return limits&&dataSafe;
  case "W12":return exists(f.variableDefinitions||f.firstDefinitions);
  case "W13":return !hasActualSource&&!theoretical;
  case "W14":return entry?.phase==="first"&&exists(entry?.purpose);
  case "W15":return real&&entry?.phase==="first";
  case "W16":case "W38":return real;
  case "W17":return real&&accuracyRelated;
  case "W18":case "W48":return real&&!!aim;
  case "W19":return real&&(unusual||unclear||exists(f.surpriseReason));
  case "W20":case "W39":return nextMath;
  case "W21":return entry?.phase!=="first"&&entryMethod&&exists(entry?.purpose);
  case "W22":return techUsed;
  case "W23":return isPearsonResult(entry);
  case "W24":return real&&method.has("fitted-model");
  case "W25":return derived&&accuracyRelated;
  case "W26":return real&&entry?.phase==="substantial";
  case "W27":case "W45":return real&&exists(entry?.methodChangeReason);
  case "W28":return real&&(method.has("proof")||entry?.kind==="theory");
  case "W29":return actualResults.length>0;
  case "W30":return exists(f.presentationIssue||f.notationIssue||f.referencesIssue);
  case "W31":return exists(f.writtenFeedback);
  case "W32":return actualResults.length>0&&(exists(f.finalCriteria)||exists(f.draftCriteria)||f.draftComplete==="ready");
  case "W33":return !hasActualSource&&exists(f.alternateSource);
  case "W34":return f.firstType==="calculation"&&exists(f.firstPurpose);
  case "W35":return (hasModel(f)&&node==="C21M")||(real&&method.has("fitted-model")&&exists(f.modelAssumptions));
  case "W36":return (modelling||statistical)&&dataSafe&&hasModel(f)&&exists(f.samplingMethod);
  case "W37":return false; // Returning to the dashboard must never trigger another prompt.
  case "W40":return canViewPmccFollowup(x.state)&&linear&&f.pmccSignal==="meaningful-linear"&&
    matches(f.nextMethod,/linear|regress|line|best.fit/);
  case "W41":return canViewPmccFollowup(x.state)&&weak&&curved;
  case "W42":return canViewPmccFollowup(x.state)&&weak&&(unclear||!shape)&&!nextMath;
  case "W43":return real&&(method.has("fitted-model")||method.has("optimisation"))&&
    (exists(entry?.nextQuestion)||exists(f.modelValidation)||exists(f.modelSensitivity));
  case "W44":return actualResults.length>0&&
    x.state.completion.transitions.at(-1)?.from==="C35"&&
    x.state.completion.transitions.at(-1)?.to==="C60";
  case "W46":return accuracy.length>0&&dataSafe;
  case "W47":return real&&entry?.phase==="first"&&accuracyRelated;
  case "W49":return derived&&accuracyRelated;
  case "W50":return entry?.phase!=="first"&&entryMethod&&exists(entry?.purpose)&&accuracyRelated;
  case "W51":return derived&&accuracyRelated;
  case "W52":return real&&method.has("fitted-model")&&(accuracy.length>0||exists(f.modelAssumptions));
  case "W53":return real&&(method.has("statistic")||isPearsonResult(entry));
  case "W54":return !!next&&accuracy.length>0&&exists(next.accuracyRef);
  case "W55":return actualResults.some(st=>exists(st.accuracyRef))&&accuracy.length>0;
  case "W56":return real&&(theoretical||entry?.kind==="theory")&&!accuracyRelated;
  case "W57":return x.c.guidanceUi?.accuracyChanged===true;
  case "W58":return node==="C35"?exists(f.nextMethod)&&!!next:entryMethod;
  case "W59":return applied&&entry.knowledge==="syllabus";
  case "W60":return applied&&entry.knowledge==="outside";
  case "W61":return applied&&entry.knowledge==="mixed";
  case "W62":return entryMethod&&entry.knowledge==="unsure";
  case "W63":return real&&exists(entry?.researchSource);
  case "W64":return insight;
  case "W65":return techUsed&&real&&["outside","mixed"].includes(entry?.knowledge);
  case "W66":return actualResults.some(st=>["syllabus","outside","mixed"].includes(st.knowledge));
  default:return false;
 }
};
const priorities=Object.freeze({
 W14:100,W16:100,W18:96,W48:95,W39:100,W20:91,W21:99,W23:99,W60:97,W61:96,W62:92,W59:85,
 W29:98,W01:94,W03:92,W08:95,W10:93,W11:91,W46:92,W47:92,W49:89,W52:92,W53:94,
 W26:95,W38:84,W40:90,W41:95,W42:85,W43:91,W44:92,W55:92,W56:87,W63:89,W64:87,
 W02:76,W35:87,W51:93,W57:97,W58:93,W65:91,W66:93
});
export function personaliseWritingCue(def,ctx){
 const technique=readable(ctx.entry?.technique||ctx.entry?.methodId||ctx.f.nextMethod||"this method",95);
 const changes={
  "aim":ctx.aim||"your aim",
  "my selected maths course":ctx.course||"your course",
  "beneficiary":ctx.beneficiary||"the intended beneficiary",
  "prediction":ctx.prediction||"your tentative prediction",
  "technique":technique,
  "method":technique,
  "actual result":readable(ctx.entry?.result||ctx.next?.result||"your actual result"),
  "observed result":readable(ctx.entry?.observationText||ctx.next?.observationText||"your observed result"),
  "source":readable(ctx.f.actualSource||ctx.f.sourceCitation||"your actual source"),
  "chosen method":readable(ctx.f.chosenMethod||ctx.f.samplingMethod||"your chosen method"),
  "new technique":technique,
  "unfamiliar technique":technique,
  "recorded c24 units/source precision":ctx.accuracy.map(x=>x.quantity+" ("+x.unit+", "+x.resolution+")").join("; ")||"previously recorded input precision",
  "input precision/source":ctx.accuracy.map(x=>x.policy).join("; ")||"your recorded data precision",
  "previous result":readable(ctx.next?.localTakeaway||ctx.next?.result||"your previous finding"),
  "actual statistic":readable(ctx.entry?.result||"your calculated statistic"),
  "computed result":readable(ctx.entry?.result||"your calculation")
 };
 const cue=def.cue.replace(/\[([^\]]{1,100})\]/g,(_,key)=>{
  const label=key.toLowerCase();
  for(const [name,value] of Object.entries(changes))if(label===name||label.includes(name))return value;
  if(label.includes("quantity"))return ctx.accuracy[0]?.quantity||"the measured quantity";
  if(label.includes("new")||label.includes("method"))return technique;
  if(label.includes("result"))return "your actual finding";
  if(label.includes("programme")||label.includes("course"))return ctx.course||"your course";
  return "your "+key.toLowerCase().replace(/[^a-z0-9 -]/g,"").slice(0,70);
 });
 return cue.length>600?cue.slice(0,600)+"…":cue;
}
export function eligibleWritingCues(state,node=state.completion.current,{includingAcknowledged=false}={}){
 const ctx=guidanceContext(state,node);
 const results=[];
 for(const def of WRITING_MOMENTS){
  if(!includesNode(def,node)||!relevance(def.id,ctx))continue;
  const scope=guidanceScope(ctx,def.id),key=def.id+"@"+scope,
   fingerprint=guidanceFingerprint(ctx,def.id);
  const record=state.writingLedger?.[key];
  const same=record?.fingerprint===fingerprint;
  const suppressed=same&&["already-covered","written","not-relevant","deferred","noted"].includes(record?.status);
  if(suppressed&&!includingAcknowledged)continue;
  results.push({
   ...def,key,scope,fingerprint,location:def.location,
   title:ctx.inMath?"A useful writing moment":"Where this belongs in your IA",
   message:personaliseWritingCue(def,ctx),
   example:hypotheticalExample(def.id),record:same?record:null,
   priority:priorities[def.id]||65
  });
 }
 return results.sort((a,b)=>b.priority-a.priority||Number(a.id.slice(1))-Number(b.id.slice(1)));
}
export function currentWritingCue(state,node=state.completion.current){
 return eligibleWritingCues(state,node)[0]||null;
}
export const allWritingSourceIds=()=>WRITING_MOMENTS.map(x=>x.id);
