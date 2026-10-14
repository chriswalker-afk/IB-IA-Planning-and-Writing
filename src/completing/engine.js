/**
 * Phase 4 — source-linked Completing journey.
 * The C node/route table is a verbatim index of the spreadsheet, but
 * only student actions execute transitions. Predictions/plans are never results.
 */
import {C_NODES,C_ROUTES} from "./catalog.js";
import {MAX_ENTRIES} from "../core/limits.js";

export const C_NODE_IDS=Object.freeze(C_NODES.map(x=>x.id));
export const C_MAJOR_STAGES=Object.freeze([
 {id:"C10",key:"intro",name:"Introduction",icon:"pencil"},
 {id:"C20",key:"data",name:"Sources & methods",icon:"flask"},
 {id:"C30",key:"first",name:"First exploration",icon:"chart"},
 {id:"C40",key:"math",name:"Mathematics",icon:"calculator"},
 {id:"C60",key:"conclusion",name:"Conclusion",icon:"flag"},
 {id:"C70",key:"presentation",name:"Communication",icon:"book"},
 {id:"C80",key:"feedback",name:"Teacher draft",icon:"pencil"},
 {id:"C90",key:"final",name:"Final checks",icon:"check-circle"}
]);
export const C_STAGE_STATUS=Object.freeze(["not-started","working","complete","needs-review"]);
export const C_FIELD_DEFAULTS=Object.freeze({
 changedSincePlanning:"",permissionStatus:"",permissionNotes:"",courseConcern:"",
 dataStatus:"",actualSource:"",sourceCitation:"",actualMethod:"",methodAim:"",
 actualDate:"",sourcePopulation:"",dataCount:"",collectionStatus:"",
 statisticalPopulation:"",sampleOrCensus:"",samplingMethod:"",samplingRationale:"",
 sampleSize:"",responseBias:"",pairing:"",groupFairness:"",dataCleaning:"",
 modelEvidence:"",modelInputs:"",modelAssumptions:"",modelDomain:"",
 modelValidation:"",modelAlternative:"",modelSensitivity:"",
 theoreticalObject:"",theoreticalCase:"",theoreticalAssumptions:"",theoreticalQuestion:"",
 alternativeMethod:"",chosenMethod:"",methodReason:"",methodLimitation:"",
 limitationConsequence:"",limitationMitigation:"",limitationAcceptable:"",
 accuracyQuantity:"",accuracySymbol:"",accuracyUnit:"",accuracyResolution:"",
 accuracyReason:"",accuracyPolicy:"",accuracyDataType:"",
 variableDefinitions:"",specialistTerms:"",sourceReferences:"",
 dataAimLink:"",dataStatusSummary:"",
 firstType:"",firstPurpose:"",firstDefinitions:"",firstPresentation:"",
 firstResultSummary:"",firstObservedFeature:"",firstInterpretation:"",
 accuracyForResult:"",aimLinkedResult:"",predictionComparison:"",
 benefitFinding:"",surpriseReason:"",surpriseCheck:"",
 nextQuestion:"",nextMethod:"",nextReason:"",nextLocation:"",
 scatterPattern:"",pmccMeaning:"",pmccInterpretation:"",
 technologyTool:"",technologyInput:"",technologyOutcome:"",
 technologyInterpretation:"",courseLevel:"",courseWhy:"",
 researchedMethod:"",researchedUnderstanding:"",mathsLearning:"",
 mainConclusion:"",conclusionEvidence:"",conclusionUncertainty:"",
 conclusionBenefit:"",conclusionAdvice:"",conclusionExtension:"",
 conclusionFocus:"",notationIssue:"",presentationIssue:"",referencesIssue:"",
 draftComplete:"",draftCriteria:"",writtenFeedback:"",feedbackAction:"",
 revisionEvidence:"",finalCriteria:"",finalProofread:"",finalRequirements:"",
 blocker:"",blockedBy:"",alternateSource:"",alternateFit:"",
 limitedDataIssue:"",oneSafeAction:"",stuckFollowup:"",
 writingLocation:"",writingDecision:"",nextStepSelected:""
});
const str=v=>typeof v==="string"?v:"";
const validNode=id=>C_NODE_IDS.includes(id);
const hasOwn=(x,key)=>Object.prototype.hasOwnProperty.call(x,key);
export function createCompletionState(){
 return {
  current:"C00",history:[],visited:[],transitions:[],fields:{...C_FIELD_DEFAULTS},
  stages:Object.fromEntries(C_MAJOR_STAGES.map(x=>[x.id,"not-started"])),
  activeEntryIndex:-1,returnTo:"",latestMeaningfulNode:"",
  sourceVersion:"2026-10-14",helpersExpanded:false,stageExpanded:false,
  accuracyDecisions:[],confirmedCurrentAimAt:"",notices:[]
 };
}
export function normalizeCompletionState(data,project={}){
 const v=data&&typeof data==="object"?data:{},base=createCompletionState();
 const fields={...base.fields};
 for(const key of Object.keys(fields))
  if(typeof v.fields?.[key]==="string")fields[key]=v.fields[key].slice(0,20000);
 const states={...base.stages};
 for(const key of Object.keys(states))
  if(C_STAGE_STATUS.includes(v.stages?.[key]))states[key]=v.stages[key];
 const ids=items=>Array.isArray(items)?items.filter(x=>typeof x==="string"&&validNode(x)).slice(-400):[];
 const transitions=Array.isArray(v.transitions)?v.transitions.filter(x=>x&&validNode(x.from)&&
  (validNode(x.to)||x.to==="N06")).slice(-400).map(x=>({...x,condition:str(x.condition),sourceRow:Number.isInteger(x.sourceRow)?x.sourceRow:null})):[];
 const accuracy=Array.isArray(v.accuracyDecisions)?v.accuracyDecisions.filter(x=>x&&typeof x==="object")
  .slice(0,40).map(x=>({id:str(x.id),quantity:str(x.quantity),symbol:str(x.symbol),unit:str(x.unit),
  resolution:str(x.resolution),policy:str(x.policy),reason:str(x.reason)})):[];
 return {...base,current:validNode(v.current)?v.current:(project.aim?"C04":"C00"),
  history:ids(v.history),visited:ids(v.visited),transitions,
  fields,stages,accuracyDecisions:accuracy,
  activeEntryIndex:Number.isInteger(v.activeEntryIndex)?Math.max(-1,Math.min(119,v.activeEntryIndex)):-1,
  returnTo:validNode(v.returnTo)?v.returnTo:"",
  latestMeaningfulNode:validNode(v.latestMeaningfulNode)?v.latestMeaningfulNode:"",
  confirmedCurrentAimAt:str(v.confirmedCurrentAimAt),
  sourceVersion:"2026-10-14",notices:[]};
}
export function completionStage(id){
 if(["C00","C01","C02","C03","C04","C91","C95","C95D","C95L","C95A","C95Q","C95N","C96"].includes(id))return null;
 if(["C10","C10E"].includes(id))return "C10";
 if(["C20","C21S","C21M","C21T","C22","C23","C24","C25","C26"].includes(id))return "C20";
 if(["C30","C31","C32","C33"].includes(id))return "C30";
 if(["C60","C61","C62","C63","C64"].includes(id))return "C60";
 if(["C70","C70N"].includes(id))return "C70";
 if(["C80","C80D"].includes(id))return "C80";
 if(["C90","C90F"].includes(id))return "C90";
 return "C40";
}
export const sectionForNode=id=>({C10:"intro",C20:"data",C30:"first",C40:"math",C50:"math",C60:"conclusion",
 C70:"presentation",C80:"feedback",C90:"final",C04:"overview"})[completionStage(id)||id]||"overview";
export const targetForSection=section=>({overview:"C04",intro:"C10",data:"C20",math:"C40",
 first:"C30",conclusion:"C60",review:"C90",presentation:"C70",feedback:"C80"})[section]||"C04";
export function routesAt(id){
 return C_ROUTES.filter(x=>x.from===id);
}
export function completeEntry(state){
 const index=state.completion.activeEntryIndex;
 return index>=0&&index<state.entries.length?state.entries[index]:null;
}
export function latestRealResult(state){
 for(let i=state.entries.length-1;i>=0;i--){
  const x=state.entries[i];
  if(x?.status==="completed"&&str(x.result).trim())return {...x,index:i};
 }
 return null;
}
export function actualPmccExists(state){
 return state.entries.some(x=>x?.status==="completed"&&str(x.result).trim()&&
  /(?:\bpmcc\b|\bpearson(?:'s)?\b|product.moment correlation)/i.test(str(x.technique)+" "+str(x.title)));
}
export function actualScatterExists(state){
 return state.entries.some(x=>x?.status==="completed"&&str(x.result).trim()&&
  (x.kind==="scatter"||/scatter/i.test(str(x.technique)+" "+str(x.title))));
}
export function completionFlags(state){
 const f=state.completion.fields,plan=state.planning.fields,out=[];
 if(["pending","unsure"].includes(f.permissionStatus)||(!f.permissionStatus&&["yes","unsure"].includes(plan.permissionNeed)))
  out.push("Permissions, privacy or safety have not been confirmed; don't collect or use affected restricted data.");
 if(plan.kind==="theoretical"||["AA HL","AI HL","other"].includes(plan.course)||["outside","unsure"].includes(plan.mathsOutside))
  out.push("Discuss mathematical scope or course suitability with your teacher.");
 if(state.teacher.pendingApproval)out.push("Earlier teacher/consent concern remains unresolved in the project record.");
 return [...new Set(out)];
}
export function setCompletionField(state,key,value){
 if(!hasOwn(C_FIELD_DEFAULTS,key))return false;
 const c=state.completion,previous=c.fields[key];
 c.fields[key]=str(value).slice(0,20000);
 const stage=completionStage(c.current);
 if(stage&&c.stages[stage]==="complete"&&previous!==c.fields[key])
  c.stages[stage]="needs-review";
 if(key==="permissionStatus"){
  // Do not convert a student's self-report into verified third-party teacher approval.
  if(value==="pending"||value==="unsure")state.teacher.pendingApproval=true;
  if(value==="confirmed"||value==="not-needed")state.teacher.pendingApproval=false;
 }
 if(key==="dataStatus" && ["not-started","candidate","partial","ready","theoretical"].includes(value))
  state.project.dataStatus=value==="candidate"?"not-started":value;
 return true;
}
export function markCompletionStage(state,stage,status){
 if(!hasOwn(state.completion.stages,stage)||!C_STAGE_STATUS.includes(status))return false;
 state.completion.stages[stage]=status;
 return true;
}
export function setCompletionNode(state,id,{history=true,reason="revisit"}={}){
 if(!validNode(id))return{ok:false,error:"Unknown Completing stage."};
 const c=state.completion;
 if(c.current!==id&&history)c.history.push(c.current);
 c.history=c.history.slice(-350);
 c.current=id;
 if(!c.visited.includes(id))c.visited.push(id);
 const stage=completionStage(id);
 if(stage&&c.stages[stage]==="not-started")c.stages[stage]="working";
 state.ui.studioSection=sectionForNode(id);
 if(id==="C40"||id==="C50"){
  if(c.activeEntryIndex<0&&state.entries.length){
   c.activeEntryIndex=Math.min(state.ui.mathIndex,state.entries.length-1);
  }
 }
 return {ok:true,id,reason};
}
export function completionBack(state){
 const c=state.completion,id=c.history.pop();
 return id?setCompletionNode(state,id,{history:false}):setCompletionNode(state,"C04",{history:false});
}
export function startFirstRepresentation(state){
 if(state.entries.length>=MAX_ENTRIES)return{ok:false,error:"This project has reached its safety limit of 120 mathematical records. Download a backup before continuing."};
 if(state.completion.activeEntryIndex>=0&&state.entries[state.completion.activeEntryIndex]?.phase==="first"&&state.entries[state.completion.activeEntryIndex]?.status==="planned")return{ok:true,existing:true};
 const f=state.completion.fields;
 const id="math-"+(Date.now().toString(36))+"-"+(state.entries.length+1);
 state.entries.push({
  id,phase:"first",title:f.firstType||state.planning.fields.figureOther||"First purposeful representation",
  purpose:f.firstPurpose||state.planning.fields.figurePurpose||"",
  technique:"",kind:"",status:"planned",knowledge:"unsure",knowledgeNotes:"",
  result:"",resultRef:"",observation:"",observationText:"",interpretation:"",limitations:"",
  localTakeaway:"",nextQuestion:"",nextWhy:"",bridge:"",accuracyRef:"",
  createdAt:new Date().toISOString()
 });
 state.completion.activeEntryIndex=state.entries.length-1;
 state.ui.mathIndex=state.entries.length-1;
 return{ok:true,index:state.entries.length-1};
}
export function startNextMathematics(state,first=false){
 const c=state.completion,prior=latestRealResult(state);
 if(!prior)return{ok:false,error:"Record at least one real mathematical result before adding mathematics that follows from it."};
 if(state.entries.length>=MAX_ENTRIES)return{ok:false,error:"This project has reached 120 mathematical records. Download a full backup before adding more."};
 const f=c.fields;
 if(!f.nextQuestion.trim()||!f.nextReason.trim())
  return{ok:false,error:"State the unanswered question AND why the proposed method follows from the previous result. You can also conclude instead."};
 // Reuse the current planned next section rather than accidentally duplicating it.
 const existing=state.entries.at(-1);
 if(existing?.status==="planned"&&existing.phase==="substantial"&&existing.fromEntryId===prior.id){
  c.activeEntryIndex=state.entries.length-1;state.ui.mathIndex=c.activeEntryIndex;
  return{ok:true,existing:true,index:c.activeEntryIndex};
 }
 const id="math-"+Date.now().toString(36)+"-"+(state.entries.length+1);
 const entry={
  id,phase:"substantial",fromEntryId:prior.id,
  title:f.nextQuestion, purpose:f.nextReason,technique:f.nextMethod||"",
  bridge:"Following "+(prior.title||"the previous result")+", "+f.nextReason,
  previousTakeaway:prior.localTakeaway||prior.interpretation||prior.observationText||prior.result,
  kind:"",status:"planned",knowledge:"unsure",knowledgeNotes:"",
  result:"",resultRef:"",observation:"",observationText:"",
  interpretation:"",localTakeaway:"",limitations:"",nextQuestion:"",nextWhy:"",
  accuracyRef:"",createdAt:new Date().toISOString()
 };
 state.entries.push(entry);
 c.activeEntryIndex=state.entries.length-1;state.ui.mathIndex=c.activeEntryIndex;
 f.nextQuestion="";f.nextReason="";f.nextMethod="";
 return{ok:true,index:c.activeEntryIndex,first};
}
const now=()=>new Date().toISOString();
function addTransition(state,route){
 state.completion.transitions.push({from:route.from,to:route.to,condition:route.condition,sourceRow:route.sourceRow,at:now()});
 state.completion.transitions=state.completion.transitions.slice(-450);
 state.journey.history.push({from:route.from,to:route.to,condition:route.condition,sourceRow:route.sourceRow});
 state.journey.history=state.journey.history.slice(-450);
}
// Exact worksheet route selection + only a few explicit practical safety guards.
export function moveCompletionRoute(state,condition){
 const c=state.completion,from=c.current,route=routesAt(from).find(x=>x.condition===condition);
 if(!route)return{ok:false,error:"This is not an available transition from your current stage."};
 if(route.to==="C34"){
  const active=completeEntry(state);
  if(!(active?.status==="completed"&&str(active.result).trim()))
   return{ok:false,error:"Record the actual result for THIS mathematical section first. A planned calculation or an earlier result is not sufficient."};
 }
 if(["C35B"].includes(route.to)&&!actualScatterExists(state))
  return{ok:false,error:"First record an actual scatter graph and what it showed."};
 if(route.to==="C35P"&&!actualPmccExists(state))
  return{ok:false,error:"Pearson's r or the PMCC must actually have been calculated before these follow-up ideas are relevant."};
 if(route.to==="C35H"&&!latestRealResult(state))
  return{ok:false,error:"The next-step suggestions depend on an actual mathematical finding, not a prediction."};
 if(route.to==="C32"){
  const result=startFirstRepresentation(state);if(!result.ok)return result;
 }
 if(from==="C35"&&["C40","C50"].includes(route.to)){
  const result=startNextMathematics(state,route.to==="C40");if(!result.ok)return result;
 }
 if(from==="C02"&&route.to==="C10")c.returnTo="";
 if(route.to==="C02"&&from==="C10")c.returnTo="C10";
 if(["C24","C96","C95"].includes(route.to)&&!["C24","C96","C95"].includes(from))c.returnTo=from;
 if(from==="C96"&&condition.startsWith("Return to my original stage")) {
  const target=c.returnTo||"C04";c.returnTo="";
  addTransition(state,route);return setCompletionNode(state,target);
 }
 if(route.to==="N06"){
  state.planning.current="N06";
  state.route="planning";addTransition(state,route);
  return{ok:true,targetRoute:"planning"};
 }
 if(!validNode(route.to))return{ok:false,error:"Unknown target for this source route."};
 if(["C35B","C35P"].includes(from)&&route.to==="C35"){
  if(from==="C35B"&&!c.fields.scatterPattern){
   const pattern=route.condition.toLowerCase();
   c.fields.scatterPattern=pattern.includes("curved")?"curved":
    pattern.includes("no clear")?"unclear":pattern.includes("straight")?"linear":"unsure";
  }
  if(from==="C35P"&&!c.fields.pmccMeaning)c.fields.pmccMeaning=condition;
 }
 addTransition(state,route);
 return setCompletionNode(state,route.to,{reason:"source-route"});
}
export function addAccuracyDecision(state){
 const f=state.completion.fields;
 if(!f.accuracyQuantity.trim()||!f.accuracyPolicy.trim())
  return{ok:false,error:"Name the quantity and your intended reporting-accuracy decision first."};
 const record={id:"accuracy-"+Date.now().toString(36)+"-"+state.completion.accuracyDecisions.length,
  quantity:f.accuracyQuantity,symbol:f.accuracySymbol,unit:f.accuracyUnit,
  resolution:f.accuracyResolution,policy:f.accuracyPolicy,reason:f.accuracyReason};
 const idx=state.completion.accuracyDecisions.findIndex(x=>x.quantity.trim().toLowerCase()===record.quantity.trim().toLowerCase());
 if(idx>=0)state.completion.accuracyDecisions[idx]=record;
 else if(state.completion.accuracyDecisions.length<40)state.completion.accuracyDecisions.push(record);
 else return{ok:false,error:"The accuracy list is full; edit an existing record."};
 state.evidence.accuracyDecisions=state.completion.accuracyDecisions.map(x=>({...x}));
 for(const key of ["accuracyQuantity","accuracySymbol","accuracyUnit","accuracyResolution","accuracyPolicy","accuracyReason"])f[key]="";
 return{ok:true,record};
}
export function completionSuggestions(state){
 const c=state.completion,f=c.fields,prior=latestRealResult(state);
 if(!prior)return[];
 if(c.current==="C35P"&&!actualPmccExists(state))return[];
 const observed=str(f.scatterPattern||prior.observation).toLowerCase();
 const s=[];
 if(c.current==="C35P"){
  if(observed==="curved")s.push(["Could a justified nonlinear model describe the actual curvature?","Pearson's r measures linear association; it cannot rule out a curved pattern."]);
  else if(observed==="unclear")s.push(["Does the scatter graph show a meaningful pattern that a linear coefficient misses?","No clear linear association need not prove no relationship."]);
  else if(observed==="unexpected")s.push(["Should I verify an unusual observation and examine its influence?","Do not exclude points merely to improve a coefficient."]);
  else s.push(["Would a regression line answer my aim better than r alone?","Only if a roughly linear scatter and a meaningful prediction justify it."]);
  s.push(["Could I interpret the strength and direction of linear association without another model?","Further mathematics is optional when the finding already helps answer the aim."]);
 }else if(observed==="curved"){
  s.push(["Which curved function might fit the actual shape, if modelling serves my aim?","Do not force a straight line merely because a PMCC was planned."]);
  s.push(["Would checking a simplified case or residual pattern improve the model?","Use only if it helps the mathematical question."]);
 }else if(observed==="linear"){
  s.push(["Would a line of best fit or Pearson's r address my next question?","If prediction or linear strength matters, and suitable paired numerical data exist."]);
  s.push(["Could another variable help test whether this relationship is useful?","Avoid turning association into causation."]);
 }else if(observed==="unclear"){
  s.push(["What cautious conclusion can I draw from the actual evidence?","It may be reasonable to conclude without adding more techniques."]);
  s.push(["Could a justified different range, variable or small case clarify the result?","Only revise the plan when the observed result motivates it."]);
 }else if(observed==="unexpected"){
  s.push(["What might explain the unusual point, cluster or contradiction?","Verify data before interpreting or excluding anything."]);
  s.push(["Would checking the result under a plausible alternative assumption help?","Describe what the test could legitimately show."]);
 }else if(prior.kind==="theory"){
  s.push(["Can a conjecture be proved or refuted by a counterexample?","Several confirming cases are not a general proof."]);
  s.push(["Does the pattern generalise under a precise condition?","State the condition and why it matters."]);
 }else{
  s.push(["What unanswered mathematical question arises directly from this result?","Name the gap and why a new method could address it."]);
 }
 return s.slice(0,2);
}
