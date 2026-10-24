import {createStuckState,normalizeStuckState,captureStuckOrigin,isStuckNode} from '../help/stuck-state.js';
/**
 * Phase 4 — source-linked Completing journey.
 * The C node/route table is a verbatim index of the spreadsheet, but
 * only student actions execute transitions. Predictions/plans are never results.
 */
import {methodFamilies} from "./method-identity.js";
import {representationFigureKey} from "../diagrams/representation-registry.js";
import {journeySourceSignature,selectedInvestigativeRoute,adaptiveNextDirections} from "./adaptive-journey.js";
import {beforeSourceChange,linkedAccuracy,flagInputDependents,normalizeSources} from "./evidence-links.js";
import {createReviewState,normalizeReviewState} from "./review.js";
import {C_NODES,C_ROUTES} from "./catalog.js";
import {MAX_ENTRIES} from "../core/limits.js";

export const C_NODE_IDS=Object.freeze(C_NODES.map(x=>x.id));
export const C_MAJOR_STAGES=Object.freeze([
 {id:"C10",key:"intro",name:"Introduction",icon:"pencil"},
 {id:"C20",key:"data",name:"Introduce first maths",icon:"compass"},
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
 dataStatus:"",actualSource:"",actualSourceType:"",sourceCitation:"",actualMethod:"",methodAim:"",
 firstMathsBridgePlacement:"",
 actualDate:"",sourcePopulation:"",dataCount:"",collectionStatus:"",
 statisticalPopulation:"",sampleOrCensus:"",samplingMethod:"",samplingRationale:"",
 sampleSize:"",responseBias:"",pairing:"",groupFairness:"",dataCleaning:"",
 modelEvidence:"",modelInputs:"",modelAssumptions:"",modelDomain:"",
 modelValidation:"",modelAlternative:"",modelSensitivity:"",
 theoreticalObject:"",theoreticalCase:"",theoreticalAssumptions:"",theoreticalQuestion:"",
 alternativeMethod:"",chosenMethod:"",methodReason:"",methodLimitation:"",firstMethodEvaluation:"",
 limitationConsequence:"",limitationMitigation:"",limitationAcceptable:"",
 accuracyQuantity:"",accuracySymbol:"",accuracyUnit:"",accuracyResolution:"",
 accuracyReason:"",accuracyPolicy:"",accuracyDataType:"",
 variableDefinitions:"",specialistTerms:"",sourceReferences:"",
 dataAimLink:"",dataStatusSummary:"",
 firstType:"",firstPurpose:"",firstOutputIntroduction:"",firstDefinitions:"",firstPresentation:"",
 firstWorkTitle:"",firstWorkResult:"",firstWorkLocation:"",firstWorkStatus:"",
 firstResultSummary:"",firstObservedFeature:"",firstInterpretation:"",
 accuracyForResult:"",aimLinkedResult:"",predictionComparison:"",
 benefitFinding:"",surpriseReason:"",surpriseCheck:"",
 nextQuestion:"",nextMethod:"",nextReason:"",nextLocation:"",
 scatterPattern:"",scatterDetail:"",pairedDataType:"",scatterAimRelevance:"",pmccSignal:"",pmccMeaning:"",pmccInterpretation:"",
 technologyTool:"",technologyForEntryId:"",technologyInput:"",technologyOutcome:"",
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
const conclusionPage=id=>["C61","C62","C63","C64"].includes(id)?"C60":id;
const hasOwn=(x,key)=>Object.prototype.hasOwnProperty.call(x,key);
export function createCompletionState(){
 return {
  support:createStuckState(),current:"C00",history:[],visited:[],transitions:[],fields:{...C_FIELD_DEFAULTS},
  stages:Object.fromEntries(C_MAJOR_STAGES.map(x=>[x.id,"not-started"])),
  hiddenFirstFigures:[],conclusionWarningOpen:false,conclusionResultIds:[],editorReturnNode:"",
  activeEntryIndex:-1,nextFromEntryId:"",pairedDataForEntryId:"",pmccSignalForEntryId:"",scatterPatternForEntryId:"",scatterDetailForEntryId:"",returnTo:"",latestMeaningfulNode:"",
  guidanceUi:{writeKey:"",coveredKey:"",exampleKey:"",selectedKey:"",quietNode:"",quietId:"",quietScope:"",quietSignature:"",expanded:false,mathsExpanded:false,limitsExpanded:false,accuracyChanged:false,limitPage:0,limitDraftVisible:false,
   limitNoneKey:"",locationDraft:"",noteDraft:""},
  limitationDraft:{id:"",entryId:"",explanation:"",consequence:"",mitigation:"",location:""},
  confirmedLimitations:[],sourceRecords:[],activeSourceId:"",
  writingOrigin:{node:"",entryId:"",nextFromEntryId:""},review:createReviewState(),
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
  resolution:str(x.resolution),policy:str(x.policy),reason:str(x.reason),sourceId:str(x.sourceId)})):[];
 return {...base,support:normalizeStuckState(v.support),current:validNode(v.current)?conclusionPage(v.current):(project.aim?"C04":"C00"),
  history:ids(v.history),visited:ids(v.visited),transitions,
  fields,stages:states,accuracyDecisions:accuracy,
  conclusionWarningOpen:v.conclusionWarningOpen===true,
  conclusionResultIds:Array.isArray(v.conclusionResultIds)?[...new Set(v.conclusionResultIds.filter(x=>typeof x==="string"&&x.length<=160))].slice(0,3):[],
  editorReturnNode:["C30","C40","C50"].includes(v.editorReturnNode)?v.editorReturnNode:"",
  hiddenFirstFigures:Array.isArray(v.hiddenFirstFigures)?v.hiddenFirstFigures.filter(x=>typeof x==="string"&&!!representationFigureKey(x)).slice(-80):[],
  sourceRecords:normalizeSources(v.sourceRecords),activeSourceId:str(v.activeSourceId).slice(0,160),
  writingOrigin:{node:validNode(v.writingOrigin?.node)?v.writingOrigin.node:"",entryId:str(v.writingOrigin?.entryId).slice(0,160),nextFromEntryId:str(v.writingOrigin?.nextFromEntryId).slice(0,160)},
  review:normalizeReviewState(v.review),
  activeEntryIndex:Number.isInteger(v.activeEntryIndex)?Math.max(-1,Math.min(119,v.activeEntryIndex)):-1,
  nextFromEntryId:str(v.nextFromEntryId).slice(0,160),pairedDataForEntryId:str(v.pairedDataForEntryId).slice(0,160),pmccSignalForEntryId:str(v.pmccSignalForEntryId).slice(0,160),scatterPatternForEntryId:str(v.scatterPatternForEntryId).slice(0,160),scatterDetailForEntryId:str(v.scatterDetailForEntryId).slice(0,160),
  returnTo:validNode(v.returnTo)?v.returnTo:"",
  latestMeaningfulNode:validNode(v.latestMeaningfulNode)?v.latestMeaningfulNode:"",
  confirmedCurrentAimAt:str(v.confirmedCurrentAimAt),
  guidanceUi:{
   ...base.guidanceUi,
   ...Object.fromEntries(Object.keys(base.guidanceUi).filter(k=>typeof v.guidanceUi?.[k]===typeof base.guidanceUi[k])
    .map(k=>[k,typeof base.guidanceUi[k]==="string"?v.guidanceUi[k].slice(0,3000):v.guidanceUi[k]]))
  },
  limitationDraft:{
   ...base.limitationDraft,
   ...Object.fromEntries(Object.keys(base.limitationDraft).filter(k=>typeof v.limitationDraft?.[k]==="string")
    .map(k=>[k,v.limitationDraft[k].slice(0,4000)]))
  },
  confirmedLimitations:Array.isArray(v.confirmedLimitations)?v.confirmedLimitations.filter(x=>x&&typeof x==="object")
   .slice(0,100).map(x=>({id:str(x.id).slice(0,30),sourceId:str(x.sourceId).slice(0,30),
    stage:str(x.stage).slice(0,30),entryId:str(x.entryId).slice(0,160),
    explanation:str(x.explanation).slice(0,5000),consequence:str(x.consequence).slice(0,5000),
    mitigation:str(x.mitigation).slice(0,3000),location:str(x.location).slice(0,500),
    at:str(x.at).slice(0,80)})):[],
  sourceVersion:"2026-10-14",notices:[]};
}
export function completionStage(id,state=null){
 if(["C00","C01","C02","C03","C04","C91","C95","C95D","C95L","C95A","C95Q","C95N","C96"].includes(id))return null;
 if(["C34","C34A","C34B","C34U","C35","C35H","C35B","C35P"].includes(id)){
  const active=["C34","C34A","C34B","C34U"].includes(id) ?
   (state?completeEntry(state):null) : (state?sourceResultForNext(state):null);
  return active?.phase==="first"?"C30":"C40";
 }
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

const genuinelyDone=entry=>entry?.status==="completed"&&str(entry.result).trim();
export const isPearsonResult=entry=>methodFamilies(entry).has("pmcc");
export const isScatterResult=entry=>!!(genuinelyDone(entry)&&(entry.kind==="scatter"||
 (!entry.kind&&/^scatter (?:plot|graph)$/i.test(str(entry.technique).trim()))));

/** The chosen real result to build upon, or the latest one on general entry. */
export function sourceResultForNext(state){
 const id=state.completion.nextFromEntryId;
 if(id){
  const i=state.entries.findIndex(x=>x.id===id);
  if(i>=0&&genuinelyDone(state.entries[i]))return {...state.entries[i],index:i};
 }
 return latestRealResult(state);
}
/** A plotted pattern is relevant only if this step IS that graph or descends from it. */
export function scatterForNext(state){
 let entry=sourceResultForNext(state);
 if(!entry)return null;
 const visited=new Set();
 for(let tries=0;tries<120&&entry&&!visited.has(entry.id);tries++){
  if(isScatterResult(entry))return entry;
  visited.add(entry.id);
  if(!entry.fromEntryId)break;
  const i=state.entries.findIndex(x=>x.id===entry.fromEntryId);
  entry=i<0?null:{...state.entries[i],index:i};
 }
 return null;
}
export function observedFeatureForNext(state){
 const prior=sourceResultForNext(state),scatter=scatterForNext(state);
 if(!prior)return"";
 if(!isScatterResult(prior)&&!isPearsonResult(prior))return str(prior.observation);
 if(scatter && state.completion.scatterPatternForEntryId===scatter.id &&
  ["linear","curved","unclear","unexpected","unsure"].includes(state.completion.fields.scatterPattern))
  return state.completion.fields.scatterPattern;
 // If Pearson's r depends on an observed scatter graph, use THAT observation.
 if(scatter&&isPearsonResult(prior))return str(scatter.observation);
 return str(prior.observation);
}
export const canViewPmccFollowup=state=>isPearsonResult(sourceResultForNext(state));
export const canViewScatterFollowup=state=>!!scatterForNext(state)&&(isScatterResult(sourceResultForNext(state))||isPearsonResult(sourceResultForNext(state)));

export function actualPmccExists(state){return state.entries.some(isPearsonResult);}
export function actualScatterExists(state){return state.entries.some(isScatterResult);}
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
 beforeSourceChange(state,key,previous,str(value).slice(0,20000));
 c.fields[key]=str(value).slice(0,20000);
 // Inline Section 2 inputs become the same canonical mathematical record used
 // by the later result-led guidance. Typing a draft never asserts completion.
 const inlineMap={firstWorkTitle:"title",firstWorkResult:"result",firstWorkLocation:"resultRef",firstWorkStatus:"status"};
 if(hasOwn(inlineMap,key)){
  let index=c.activeEntryIndex;
  if(state.entries[index]?.phase!=="first")index=state.entries.findLastIndex(x=>x.phase==="first");
  if(index<0&&str(value).trim()){
   const started=startFirstRepresentation(state);
   if(started.ok)index=state.completion.activeEntryIndex;
  }
  if(index>=0){
   c.activeEntryIndex=index;
   const entry=state.entries[index],property=inlineMap[key];
   const next=property==="status"?(value==="completed"?"completed":"planned"):c.fields[key];
   if(entry[property]!==next){
    const previousValue=entry[property];entry[property]=next;
    flagDependentMathematics(state,index,property,previousValue,next);
   }
  }
 }
 // Both the first four-part page and its dedicated "What next?" follow-up
 // write to shared Completing fields. Keep their canonical source mathematical
 // entry in sync. This is essential when a student revises a question on C35,
 // or after a later stage has already been created.
 if(["nextQuestion","nextReason"].includes(key)&&
    ["C30","C35","C35H","C35P"].includes(c.current)){
  const chosen=c.current==="C30"?
   (state.entries[c.activeEntryIndex]?.phase==="first"?state.entries[c.activeEntryIndex]:
    state.entries.findLast(x=>x?.phase==="first")):
   sourceResultForNext(state);
  const index=state.entries.findIndex(x=>x?.id===chosen?.id);
  if(index>=0){
   const parent=state.entries[index],property=key==="nextQuestion"?"nextQuestion":"nextWhy";
   const earlier=parent[property]||"",now=c.fields[key];
   if(earlier!==now){
    parent[property]=now;
    flagDependentMathematics(state,index,property,earlier,now);
   }
  }
 }
 if(key==="pairedDataType"||key==="scatterAimRelevance")c.pairedDataForEntryId=scatterForNext(state)?.id||"";
 if(key==="pmccSignal"){
  const prior=sourceResultForNext(state);
  c.pmccSignalForEntryId=prior?.id||"";
  if(isPearsonResult(prior)&&prior.resultSignal!==value){
   const item=state.entries.find(x=>x.id===prior.id);
   if(item){const before=item.resultSignal;item.resultSignal=value;flagDependentMathematics(state,state.entries.indexOf(item),"resultSignal",before,value);}
  }
 }
 if(key==="scatterPattern"||key==="scatterDetail"){
  const scatter=scatterForNext(state),index=state.entries.findIndex(x=>x.id===scatter?.id);
  if(key==="scatterPattern"){
   c.scatterPatternForEntryId=scatter?.id||"";
   const valid={linear:["near-perfect","rough-linear"],curved:["monotonic","turning","periodic"],
    unclear:["unclear"],unexpected:["unexpected"],unsure:["unsure"]};
   if(c.fields.scatterDetail&&!valid[value]?.includes(c.fields.scatterDetail)){
    c.fields.scatterDetail="";c.scatterDetailForEntryId="";
   }
  }else{
   c.scatterDetailForEntryId=scatter?.id||"";
   const byDetail={"near-perfect":"linear","rough-linear":"linear","monotonic":"curved",
    "turning":"curved","periodic":"curved","unclear":"unclear","unexpected":"unexpected","unsure":"unsure"};
   if(byDetail[value]){c.fields.scatterPattern=byDetail[value];c.scatterPatternForEntryId=scatter?.id||"";}
  }
  // An updated choice revises the original observation rather than creating contradictory patterns.
  if(index>=0&&c.fields.scatterPattern&&state.entries[index].observation!==c.fields.scatterPattern){
   const before=state.entries[index].observation;
   state.entries[index].observation=c.fields.scatterPattern;
   flagDependentMathematics(state,index,"observation",before,c.fields.scatterPattern);
  }
 }
 const stage=completionStage(c.current,state);
 if(stage&&c.stages[stage]==="complete"&&previous!==c.fields[key])
  c.stages[stage]="needs-review";
 if(key==="permissionStatus"){
  // A student's own assertion is not documentary proof of teacher sign-off.
  // Leave existing teacher/consent flags intact until separately resolved.
  if(value==="pending"||value==="unsure")state.teacher.pendingApproval=true;
 }
 if(["technologyTool","technologyInput","technologyOutcome","technologyInterpretation"].includes(key)){
  // Tech output belongs to the single active actual mathematical section.
  // Do not display it later as if it explained a different calculation.
  const entry=completeEntry(state);
  if(entry?.id && (c.fields.technologyTool.trim()||c.fields.technologyOutcome.trim()))
   c.fields.technologyForEntryId=entry.id;
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
 // Old C61–C64 links and saved projects now open the unified C60 workspace.
 id=conclusionPage(id);
 const c=state.completion;
 const previous=c.current;
 if(isStuckNode(id)&&!isStuckNode(previous)){captureStuckOrigin(state);c.support.selected=({C95D:"no-data",C95A:"source",C95L:"partial",C95Q:"unsure",C95N:"overwhelmed"})[id]||"";}
 const helperHop=id==="C96"||previous==="C96";
 if(id==="C96"&&previous!=="C96"){
  c.writingOrigin={node:previous,entryId:completeEntry(state)?.id||"",nextFromEntryId:c.nextFromEntryId};
 }
 if(previous==="C96"&&id===c.writingOrigin?.node){
  const index=state.entries.findIndex(x=>x.id===c.writingOrigin.entryId);
  c.activeEntryIndex=index;c.nextFromEntryId=c.writingOrigin.nextFromEntryId;
 }
 if(id==="C35"){
  const original=sourceResultForNext(state)?.id||"";
  if(["C34","C34A","C34B","C34U"].includes(previous)){
   const active=completeEntry(state);
   if(genuinelyDone(active))c.nextFromEntryId=active.id;
  }else if(!["C35","C35H","C35B","C35P"].includes(previous)){
   c.nextFromEntryId=latestRealResult(state)?.id||"";
  }
  // These are legacy shared fields, not a second source of mathematical truth.
  // When "What next?" switches between different confirmed results, show
  // that result's own recorded question/justification, not the last stage's.
  const current=sourceResultForNext(state);
  if(current&&original!==current.id){
   c.fields.nextQuestion=str(current.nextQuestion);
   c.fields.nextReason=str(current.nextWhy);
   c.fields.nextMethod="";
  }
 }
 if(c.current!==id&&history)c.history.push(c.current);
 c.history=c.history.slice(-350);
 c.current=id;
 if(id==="C30"&&state.entries[c.activeEntryIndex]?.phase!=="first"){
  const firstIndex=state.entries.findLastIndex(x=>x.phase==="first");
  if(firstIndex>=0)c.activeEntryIndex=firstIndex;
 }
 if(previous!==id&&c.guidanceUi&&!helperHop){
  c.guidanceUi.quietNode="";
  c.guidanceUi.quietId="";c.guidanceUi.quietScope="";c.guidanceUi.quietSignature="";
  c.guidanceUi.exampleKey="";
  c.guidanceUi.expanded=false;
  c.guidanceUi.mathsExpanded=false;
  c.guidanceUi.limitsExpanded=false;
  c.guidanceUi.limitPage=0;
  c.guidanceUi.selectedKey="";
  // Retain the student's own uncommitted note/limitation text if they return.
 }
 if(!c.visited.includes(id))c.visited.push(id);
 const stage=completionStage(id,state);
 if(stage&&c.stages[stage]==="not-started")c.stages[stage]="working";
 state.ui.studioSection=sectionForNode(id);
 if(id==="C40"||id==="C50"){
  if(state.entries[c.activeEntryIndex]?.phase!=="substantial"){
   const last=state.entries.findLastIndex(x=>x?.phase==="substantial");
   if(last>=0)c.activeEntryIndex=last;
  }
  if(c.activeEntryIndex<0&&state.entries.length)
   c.activeEntryIndex=Math.min(state.ui.mathIndex,state.entries.length-1);
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
 // The first inline draft can seed a record; a later, separate figure MUST NOT
 // inherit earlier verified results, status, interpretation or IA location.
 const firstDraft=!state.entries.some(x=>x?.phase==="first");
 const id="math-"+(Date.now().toString(36))+"-"+(state.entries.length+1);
 state.entries.push({
  id,phase:"first",title:firstDraft?(f.firstWorkTitle||f.firstType||state.planning.fields.figureOther||"First purposeful representation"):"First purposeful representation",
  purpose:firstDraft?(f.firstOutputIntroduction||f.firstPurpose||state.planning.fields.figurePurpose||""):(f.firstPurpose||""),
  technique:"",kind:"",status:firstDraft&&f.firstWorkStatus==="completed"?"completed":"planned",knowledge:"unsure",knowledgeNotes:"",
  result:firstDraft?(f.firstWorkResult||""):"",resultRef:firstDraft?(f.firstWorkLocation||""):"",observation:"",observationText:"",interpretation:firstDraft?(f.firstInterpretation||""):"",limitations:"",
  localTakeaway:firstDraft?(f.firstResultSummary||""):"",nextQuestion:"",nextWhy:"",bridge:"",accuracyRef:"",
  createdAt:new Date().toISOString()
 });
 state.completion.activeEntryIndex=state.entries.length-1;
 state.ui.mathIndex=state.entries.length-1;
 return{ok:true,index:state.entries.length-1};
}

/**
 * Create a new page in Explore & Explain linked to the last actual result.
 * Each page is one substantial entry: plans and figures do not count as results.
 * Repeat visits cannot silently create a duplicate draft page.
 */
export function addMathematicalStage(state){
 const c=state.completion,entries=state.entries||[],prior=entries.at(-1);
 const current=entries[c.activeEntryIndex];
 // The first mathematics page can reopen its existing unfinished successor;
 // never create a second draft for the same pending stage.
 if(c.current==="C30"&&prior?.phase==="substantial"&&!genuinelyDone(prior)){
  c.activeEntryIndex=entries.length-1;state.ui.mathIndex=c.activeEntryIndex;
  return{ok:true,existing:true,index:c.activeEntryIndex};
 }
 if(current&&prior&&current.id!==prior.id&&prior.phase==="substantial")
  return{ok:false,error:"You are reviewing an earlier stage. Open the latest mathematical stage before continuing the journey.",latestIndex:entries.length-1};
 if(prior?.phase==="substantial"&&!genuinelyDone(prior))
  return{ok:false,error:"Your latest stage is unfinished. Return to it and confirm the mathematical result first.",latestIndex:entries.length-1};
 if(!genuinelyDone(prior))
  return{ok:false,error:"Record and confirm genuine mathematical work in Section 2 before adding a stage."};
 if(entries.length>=MAX_ENTRIES)
  return{ok:false,error:"This project has reached the limit of 120 mathematical records. Export a backup first."};
 const ordinal=entries.filter(x=>x.phase==="substantial").length+2;
 const nextQuestion=prior.phase==="first"?str(c.fields.nextQuestion):str(prior.nextQuestion);
 const nextReason=prior.phase==="first"?str(c.fields.nextReason):str(prior.nextWhy);
 const adaptive=!!(selectedInvestigativeRoute(state)||str(prior.journeyOutcome)||str(prior.methodId));
 if(adaptive){
  if(prior.reviewNeeded==="yes")
   return{ok:false,error:"Review the earlier mathematical interpretation before extending this journey."};
  if(adaptiveNextDirections(state,prior).status!=="ready")
   return{ok:false,error:"In Section 3 choose what your confirmed result actually shows. An uncertain result is valid."};
  if(!nextQuestion||!nextReason)
   return{ok:false,error:"Write your next mathematical question AND your OWN mathematical reason in Section 4 before adding a stage."};
 }
 const id="math-"+Date.now().toString(36)+"-"+(entries.length+1);
 const entry={
  id,phase:"substantial",fromEntryId:prior.id,
  title:nextQuestion.trim()||"Mathematical stage "+ordinal,
  purpose:nextReason.trim(),bridge:nextReason.trim(),
  previousTakeaway:prior.localTakeaway||prior.interpretation||prior.observationText||prior.result,
  technique:"",kind:"",status:"planned",knowledge:"unsure",knowledgeNotes:"",
  result:"",resultRef:"",observation:"",observationText:"",
  interpretation:"",localTakeaway:"",limitations:"",
  nextQuestion:"",nextWhy:"",accuracyRef:"",
  journeyRouteId:selectedInvestigativeRoute(state)?.id||"",
  journeySourceOutcome:prior.journeyOutcome||"",
  journeySourceSignature:journeySourceSignature(state,prior),
  createdAt:new Date().toISOString()
 };
 entries.push(entry);
 c.activeEntryIndex=entries.length-1;state.ui.mathIndex=c.activeEntryIndex;
 c.nextFromEntryId=prior.id;
 return{ok:true,index:c.activeEntryIndex,stage:ordinal};
}

export function startNextMathematics(state,first=false){
 const c=state.completion,prior=sourceResultForNext(state);
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
 if(["C35B"].includes(route.to)&&!canViewScatterFollowup(state))
  return{ok:false,error:"First record an actual scatter graph and what it showed."};
 if(route.to==="C35P"&&!canViewPmccFollowup(state))
  return{ok:false,error:"Pearson's r or the PMCC must actually have been calculated before these follow-up ideas are relevant."};
 if(route.to==="C35H"&&!sourceResultForNext(state))
  return{ok:false,error:"The next-step suggestions depend on an actual mathematical finding, not a prediction."};
 if(route.to==="C32"){
  const result=startFirstRepresentation(state);if(!result.ok)return result;
 }
 if(from==="C35"&&["C40","C50"].includes(route.to)){
  const priorSubstantial=state.entries.some(x=>x.phase==="substantial"&&
    x.status==="completed"&&str(x.result).trim());
  if(route.to==="C50"&&!priorSubstantial)
   return{ok:false,error:"Begin the first substantial mathematical section before classifying the next one as further mathematics."};
  const result=startNextMathematics(state,route.to==="C40");if(!result.ok)return result;
 }
 if(from==="C34"&&route.to==="C34B"){
  const entry=completeEntry(state);
  if(entry?.kind==="scatter"&&entry.observation)
  {c.fields.scatterPattern=entry.observation;c.scatterPatternForEntryId=entry.id;}
 }
 if(from==="C02"&&route.to==="C10")c.returnTo="";
 if(route.to==="C02"&&from==="C10")c.returnTo="C10";
 if(["C24","C96","C95"].includes(route.to)&&!["C24","C96","C95"].includes(from))c.returnTo=from;
 if(from==="C96"&&condition.startsWith("Return to my original stage")) {
  const target=c.writingOrigin?.node||c.returnTo||"C04";c.returnTo="";
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
   c.scatterPatternForEntryId=scatterForNext(state)?.id||"";
  }
  if(from==="C35P"&&!c.fields.pmccMeaning)c.fields.pmccMeaning=condition;
 }
 addTransition(state,route);
 return setCompletionNode(state,route.to,{reason:"source-route"});
}
/**
 * Revising a genuine earlier finding does not delete later work.
 * Instead, explicitly flag every downstream step that relied on it.
 * This keeps the student's actual maths and writing intact, while making
 * the logical chain's assumptions visible for rechecking.
 */
export function flagDependentMathematics(state,index,key,before,after){
 const parent=state.entries[index];
 if(!parent||before===after||
  !["result","status","interpretation","localTakeaway","observation","observationText","resultSignal","journeyOutcome","journeyDirection","nextQuestion","nextWhy","purpose","technique","methodId"].includes(key))
  return [];
 // Preserve the initial input workflow: don't nag while a first result is being typed.
 const hasDependents=parent.id&&state.entries.slice(index+1).some(x=>x?.fromEntryId===parent.id);
 const substantive=key==="status"||String(before??"").trim().length>0||
  (hasDependents&&["journeyOutcome","journeyDirection","nextQuestion","nextWhy"].includes(key));
 if(!substantive)return[];
 if(["result","status","technique","methodId","observation"].includes(key)&&
  (parent.interpretation||parent.localTakeaway)){
  parent.reviewNeeded="yes";
  parent.reviewReason="Recheck this step's earlier interpretation against the revised mathematics.";
 }
 if(!parent.id)return [];
 const updated=new Set([parent.id]),flagged=[];
 let changed=true;
 while(changed){
  changed=false;
  for(let i=index+1;i<state.entries.length;i++){
   const child=state.entries[i];
   if(!child?.fromEntryId||!updated.has(child.fromEntryId)||updated.has(child.id))continue;
   updated.add(child.id);changed=true;
   child.reviewNeeded="yes";
   child.reviewReason="An earlier mathematical result or interpretation changed. Recheck why this step follows and whether its own conclusion still holds.";
   flagged.push(i);
  }
 }
 if(flagged.length){
  for(const stage of ["C40","C60"]){
   if(state.completion.stages[stage]==="complete")state.completion.stages[stage]="needs-review";
  }
 }
 if(parent.reviewNeeded==="yes"){
  const stage=parent.phase==="first"?"C30":"C40";
  if(state.completion.stages[stage]==="complete")state.completion.stages[stage]="needs-review";
 }
 return flagged;
}
/** Explicit student action after inspecting the mathematical connection. */
export function acknowledgeMathReview(state,index){
 const record=state.entries[index];
 if(!record||record.reviewNeeded!=="yes")return false;
 // Never acknowledge a link to an unverified or missing previous result.
 const parent=record.fromEntryId?state.entries.find(x=>x.id===record.fromEntryId):null;
 if(record.fromEntryId&&!genuinelyDone(parent))return false;
 if(parent&&adaptiveNextDirections(state,parent).route&&adaptiveNextDirections(state,parent).status!=="ready")return false;
 record.reviewNeeded="";
 record.reviewReason="";
 record.reviewCheckedAt=new Date().toISOString();
 // Rebase only the *recorded original takeaway*, not student-written justifications.
 if(record.fromEntryId){
  const parent=state.entries.find(x=>x.id===record.fromEntryId);
  if(genuinelyDone(parent)){
   record.previousTakeaway=parent.localTakeaway||parent.interpretation||parent.observationText||parent.result;
   record.journeySourceOutcome=parent.journeyOutcome||"";
   record.journeySourceSignature=journeySourceSignature(state,parent);
  }
 }
 return true;
}
export function addAccuracyDecision(state){
 const f=state.completion.fields;
 if(!f.accuracyQuantity.trim()||!f.accuracyPolicy.trim())
  return{ok:false,error:"Name the quantity and your intended reporting-accuracy decision first."};
 const record={id:"accuracy-"+Date.now().toString(36)+"-"+state.completion.accuracyDecisions.length,
  quantity:f.accuracyQuantity,symbol:f.accuracySymbol,unit:f.accuracyUnit,
  resolution:f.accuracyResolution,policy:f.accuracyPolicy,reason:f.accuracyReason,sourceId:state.completion.activeSourceId||""};
 const idx=state.completion.accuracyDecisions.findIndex(x=>x.quantity.trim().toLowerCase()===record.quantity.trim().toLowerCase()&&(x.sourceId||"")===record.sourceId);
 if(idx>=0){
  const old=state.completion.accuracyDecisions[idx];
  record.id=old.id;
  const changed=["quantity","symbol","unit","resolution","policy","reason"].some(k=>String(old[k]||"")!==String(record[k]||""));
  state.completion.accuracyDecisions[idx]=record;
  if(changed){
   state.completion.guidanceUi.accuracyChanged=true;
   const linked=state.entries.filter(x=>linkedAccuracy(state,x).some(a=>a.id===old.id));
   flagInputDependents(state,linked,"Earlier linked input precision, unit or source resolution changed. Recheck this calculation and dependent interpretations.");
  }
 }else if(state.completion.accuracyDecisions.length<40)state.completion.accuracyDecisions.push(record);
 else return{ok:false,error:"The accuracy list is full; edit an existing record."};
 state.evidence.accuracyDecisions=state.completion.accuracyDecisions.map(x=>({...x}));
 for(const key of ["accuracyQuantity","accuracySymbol","accuracyUnit","accuracyResolution","accuracyPolicy","accuracyReason"])f[key]="";
 return{ok:true,record};
}
export function completionSuggestions(state){
 const c=state.completion,f=c.fields,prior=sourceResultForNext(state);
 if(!prior)return[];
 if(c.current==="C35P"&&!canViewPmccFollowup(state))return[];
 const observed=observedFeatureForNext(state).toLowerCase();
 const s=[];
 if(c.current==="C35P"){
  if(observed==="curved")s.push(["Could a justified nonlinear model describe the actual curvature?","Pearson's r measures linear association; it cannot rule out a curved pattern."]);
  else if(observed==="unclear")s.push(["Does the scatter graph show a meaningful pattern that a linear coefficient misses?","No clear linear association need not prove no relationship."]);
  else if(observed==="unexpected")s.push(["Should I verify an unusual observation and examine its influence?","Do not exclude points merely to improve a coefficient."]);
  else s.push(["Does the actual scatter graph justify a straight-line model?","A Pearson coefficient alone is not enough to diagnose the shape. Only consider regression when the plot and aim support it."]);
  s.push(["Could I interpret the strength and direction of linear association without another model?","Further mathematics is optional when the finding already helps answer the aim."]);
 }else if(observed==="curved"){
  s.push(["Which curved function might fit the actual shape, if modelling serves my aim?","Do not force a straight line merely because a PMCC was planned."]);
  s.push(["Would checking a simplified case or residual pattern improve the model?","Use only if it helps the mathematical question."]);
 }else if(observed==="linear"){
  const paired=f.pairedDataType==="paired-numerical"&&!!scatterForNext(state)&&c.pairedDataForEntryId===scatterForNext(state).id;
  if(paired)
   s.push(["Would quantifying the observed LINEAR relationship genuinely help the aim?","Pearson's r or a fitted line may be optional next tools for actual paired numerical observations. Justify any method rather than treating it as compulsory."]);
  else
   s.push(["What mathematical property does the actual graph establish, and is it based on genuine matched numerical pairs?","Do not suggest Pearson's r or regression without confirmed suitable paired data."]);
  s.push(["Could a different justified variable or range help clarify the actual result?","Avoid turning association into causation or searching for a preferred answer."]);
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
