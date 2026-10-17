/**
 * Phase 2 Planning engine. Transitions are explicitly anchored to the source
 * sheet's 61 N-node routes. No implied teacher approval or predicted IA grade.
 */
import { PLANNING_ROUTES } from "./route-table.js";
import { PLANNING_CATALOG } from "./catalog.js";
import {TIMELINE_KEYS} from "./timeline.js";

export const PLANNING_NODE_IDS = Object.freeze([...new Set(PLANNING_ROUTES.flatMap(r=>[r.from,r.to]).filter(n=>n.startsWith("N")))]);
export const PROGRESS_GROUPS = Object.freeze([
 {id:"direction",label:"Find your question",nodes:["N00","N00B","N00C","N01","N01V","N02","N02M","N02U","N02T"]},
 {id:"practical",label:"Plan your evidence",nodes:["N03","N03B","N03P","N03S","N03J","N03D","N03E","N03R","N03F","N03G","N03H"]},
 {id:"mathematical",label:"Plan your mathematics",nodes:["N04","N04T","N04S","N01P","N04R","N04M","N05V","N05"]},
 {id:"review",label:"Review your idea",nodes:["N06E","N06T","N08","N06","N07"]}
]);
const val = x => String(x??"").trim();
const now = () => new Date().toISOString();
export const PLANNING_FIELD_DEFAULTS = Object.freeze({
 planIdentifier:"",provisionalTitle:"",ideaStatus:"",idea:"",originalIdea:"",interest:"",otherIdea1:"",otherIdea2:"",ideaSelected:"",ideaAccess:"",ideaValue:"",
 aim:"",motivation:"",beneficiaryType:"",beneficiary:"",intendedUse:"",
 kind:"",statisticsContext:"",dataSource:"",primaryWhat:"",primaryWhen:"",primaryWhere:"",
 primaryPopulation:"",primaryHow:"",primaryEquipment:"",primaryStatus:"",primarySampling:"",
 secondaryUrl:"",secondaryPublisher:"",secondaryVariables:"",secondaryScope:"",secondaryVerified:"",
 secondaryStatus:"",alternativeMethod:"",methodReason:"",methodLimitation:"",methodMitigation:"",
 sourceFirstDate:"",sourceFullDate:"",dataAvailability:"",dataReadiness:"",readinessImprovement:"",
 dependencies:"",unsecured:"",permissionNeed:"",permissionDetails:"",softwareReady:"",
 workloadHours:"",cleaningBurden:"",externalRisks:"",minimumVersion:"",backupMethod:"",
 pilotReady:"",costIssue:"",sourceRights:"",dataSufficiency:"",negativeResultViable:"",presentationManageable:"",
 practicalEase:"",easeImprovement:"",mathsOutside:"",otherMaths:"",mathsWhy:"",
 course:"",predictionId:"",prediction:"",predictionPrior:"",predictionWhy:"",predictionImplication:"",
 predictionExploration:"",courseSuitability:"",suitabilityWhy:"",mathsRevisedWhy:"",
 figureType:"",figureOther:"",figurePurpose:"",firstAction:"",firstAccuracy:"",
 changeTrigger:"",changeAdaptation:"",fallbackEvidence:"",
 teacherNeed:"",teacherQuestion:"",teacherSafeAction:"",teacherExtra:"",teacherSchedule:"",
 theoreticalAim:"",theoreticalCase:"",theoreticalPrediction:"",theoreticalWhy:"",otherCourseMaths:"",universalTeacherQuestion:"",
 timelineWeeks:"",timelineEarly:"",timelineStart:"",
 milestonePlan:"",milestoneData:"",milestoneFirstVisual:"",milestoneVisualReview:"",milestoneFirstMath:"",
 milestoneFurtherMath:"",milestoneDraft:"",milestoneReview:"",milestoneSchoolDraft:"",
 milestoneSchoolFinal:"",milestoneAdjustment:""
});
export function createPlanningState(){
 return {
  current:"N00", fields:{...PLANNING_FIELD_DEFAULTS}, mathSelected:[],
  history:[], visited:[], completedNodes:[], sourceBranches:{primary:false,secondary:false},
  teacherFlagsAcknowledged:[], returnToPrediction:false, sourceSnapshot:"2026-10-14",
  completed:false, notices:[], mathSearch:"", mathsReviewVersion:0,timelineAuto:{}
 };
}
export function normalizePlanningState(value,project={}){
 const base=createPlanningState(), v=value&&typeof value==="object"?value:{};
 const fields={...base.fields};
 const migrated = !v.fields;
 const p=project||{};
 const fallback={
  ideaStatus:p.ideaStatus,idea:p.idea,aim:p.aim,beneficiaryType:p.beneficiaryType,
  beneficiary:p.beneficiary,kind:p.kind,dataSource:p.dataSource,course:p.course,
  dataReadiness:p.readiness,practicalEase:p.ease,otherMaths:p.mathsCustom,
  prediction:p.prediction,predictionWhy:p.predictionWhy,firstAction:p.firstMove,
  firstAccuracy:p.precision,permissionNeed:p.permissions==="pending"?"yes":p.permissions==="clear"?"no":""
 };
 for(const key of Object.keys(fields)){
  const raw=migrated?fallback[key]:v.fields[key];
  if(typeof raw==="string"||typeof raw==="number")fields[key]=String(raw);
 }
 const cleanIds = Array.isArray(v.mathSelected) ?
  [...new Set(v.mathSelected.filter(id=>PLANNING_CATALOG.math.some(m=>m.id===id)))].slice(0,55) : [];
 const entries=arr=>Array.isArray(arr)?arr.filter(x=>typeof x==="string"&&PLANNING_NODE_IDS.includes(x)).slice(-450):[];
 const current=PLANNING_NODE_IDS.includes(v.current)?v.current:"N00";
 return {
  ...base,fields,mathSelected:cleanIds,current,
  history:entries(v.history),visited:entries(v.visited),
  completedNodes:entries(v.completedNodes),
  sourceBranches:{
   primary:v.sourceBranches?.primary===true,secondary:v.sourceBranches?.secondary===true
  },
  teacherFlagsAcknowledged:Array.isArray(v.teacherFlagsAcknowledged)?v.teacherFlagsAcknowledged.filter(x=>typeof x==="string").slice(0,30):[],
  returnToPrediction:v.returnToPrediction===true,
  completed:v.completed===true,
  notices:[],mathSearch:typeof v.mathSearch==="string"?v.mathSearch.slice(0,90):"",
  mathsReviewVersion:Number.isInteger(v.mathsReviewVersion)?v.mathsReviewVersion:0,
  timelineAuto:Object.fromEntries(["weeks","early","start",...TIMELINE_KEYS].filter(key=>typeof v.timelineAuto?.[key]==="string").map(key=>[key,v.timelineAuto[key].slice(0,24)])),
  sourceSnapshot:"2026-10-14"
 };
}
const refFields = Object.freeze({
 ideaStatus:"ideaStatus",idea:"idea",aim:"aim",beneficiaryType:"beneficiaryType",beneficiary:"beneficiary",
 kind:"kind",dataSource:"dataSource",course:"course",prediction:"prediction",predictionWhy:"predictionWhy",
 firstAction:"firstMove",firstAccuracy:"precision",otherMaths:"mathsCustom"
});
const mathIds=new Map(PLANNING_CATALOG.math.map(m=>[m.id,m]));
export function selectedMaths(state){
 return state.planning.mathSelected.map(id=>mathIds.get(id)).filter(Boolean);
}
export function syncPlanningToProject(state) {
 const f=state.planning.fields,p=state.project;
 for(const [key,to] of Object.entries(refFields)) if(typeof f[key]==="string")p[to]=f[key];
 p.readiness=Number(f.dataReadiness)||0;
 p.ease=Number(f.practicalEase)||0;
 p.dataStatus=f.kind==="theoretical"?"theoretical":f.dataAvailability==="in-hand"?"ready":f.dataAvailability==="some"?"partial":"not-started";
 p.permissions=f.permissionNeed==="no"?"clear":f.permissionNeed==="yes"?"pending":"unknown";
 const parts=[];
 if(f.kind!=="theoretical"&&["primary","both"].includes(f.dataSource))parts.push("Primary: "+(f.primaryWhat||"To confirm")+"; "+(f.primaryHow||"method not confirmed"));
 if(f.kind!=="theoretical"&&["secondary","both"].includes(f.dataSource))parts.push("Secondary: "+(f.secondaryPublisher||f.secondaryUrl||"Source to confirm")+"; "+(f.secondaryVariables||"variables to confirm"));
 if(f.kind==="theoretical")parts.push(f.theoreticalCase||"Mathematical conjecture or examples still being planned");
 p.dataDetails=parts.join("\n");
 const selected=selectedMaths(state);
 p.mathsCustom=selected.map(x=>x.label).join("; ")+(f.otherMaths?(selected.length?"; ":"")+f.otherMaths:"");
 p.mathsArea=selected.some(x=>/correlation|sampling|regression|statistic|normal distribution/i.test(x.label))?"relationships":
 selected.some(x=>/differentiat|optimis|stationary|integral/i.test(x.label))?"optimisation":
 f.kind==="theoretical"?"proof":selected.length?"models":"unsure";
 if(f.permissionNeed==="yes"||f.permissionNeed==="unsure")state.teacher.pendingApproval=true;
 else if(f.permissionNeed==="no")state.teacher.pendingApproval=false;
 return state;
}
export function planningFlags(state){
 const f=state.planning.fields,m=state.planning.mathSelected,c=f.course;
 const flags=[];
 const add=(id,title,note,needsApproval=false)=>flags.push({id,title,note,needsApproval});
 if(f.kind==="theoretical")add("theoretical","Theoretical/no-data route","Discuss mathematical suitability and scope with your teacher.");
 if(c&&!["AI SL","AA SL"].includes(c))add("other-course","Course-specific mathematics needs review","The supplied AI SL/AA SL menu cannot verify your course.");
 if(f.permissionNeed==="yes"||f.permissionNeed==="unsure")add("permission","Permissions, privacy or safety to confirm","Do not collect or use affected personal/restricted data until appropriate guidance and permission are in place.",true);
 if(f.kind!=="theoretical"&&["inaccessible","unsure"].includes(f.dataAvailability))add("data-access","Data availability is uncertain","Check a workable source or an alternative before relying on this plan.");
 if(f.kind!=="theoretical"&&f.dataSource==="both"&&(!state.planning.sourceBranches.primary||!state.planning.sourceBranches.secondary))
  add("two-sources","Both source plans need attention","The primary and secondary question sets must both be addressed.");
 if(f.mathsOutside==="outside"||f.mathsOutside==="unsure")add("outside-maths","Mathematics suitability to check","Ask about techniques beyond or not clearly within your course.");
 if(f.courseSuitability==="unsure"||f.courseSuitability==="no")add("depth","Mathematical suitability remains open","Discuss the mathematical purpose and level, without treating this as an IA grade.");
 if(Number(f.dataReadiness)>0&&Number(f.dataReadiness)<3)add("readiness","Data plan needs strengthening","Consider a smaller pilot, confirmed source or earlier usable material.");
 if(Number(f.practicalEase)>0&&Number(f.practicalEase)<3)add("practical","Practical workload may be high","Reduce dependencies and try a small end-to-end test.");
 if(m.some(id=>mathIds.get(id)?.course!==c)&&["AI SL","AA SL"].includes(c))add("different-course-maths","Selected techniques from another course","Review which options suit your current course; do not silently discard them.");
 return flags;
}
export function planningStage(node){
 return PROGRESS_GROUPS.find(g=>g.nodes.includes(node))?.id||"review";
}
export function relevantPredictionOptions(state){
 const f=state.planning.fields;
 const route=f.kind==="statistics"?"Statistics":f.kind==="modelling"?"Modelling":"Teacher-led/no-data";
 const all=PLANNING_CATALOG.predictions;
 const possibilities=all.filter(x=>x.route===route);
 if(route==="Statistics"){
  const context=f.statisticsContext;
  return [...(context?possibilities.filter(x=>x.context===context):possibilities),...all.filter(x=>x.id==="X01"||x.id==="X02")];
 }
 return [...possibilities,...all.filter(x=>x.id==="X01"||x.id==="X02")];
}
export function predictionMathSuggestions(state){
 const f=state.planning.fields;const pred=PLANNING_CATALOG.predictions.find(x=>x.id===f.predictionId);
 if(!pred||!["AI SL","AA SL"].includes(f.course))return [];
 const names=(f.course==="AI SL"?pred.aiSuggestions:pred.aaSuggestions||"").split(";").map(x=>x.trim().toLowerCase()).filter(Boolean);
 const candidates=PLANNING_CATALOG.math.filter(x=>x.course===f.course);
 const selectedIds=new Set(state.planning.mathSelected);
 const exact = candidates.filter(x=>names.some(n=>x.label.toLowerCase()===n||n.includes(x.label.toLowerCase())) && !selectedIds.has(x.id));
 return exact.slice(0,4);
}
export function applyPlanningField(state,key,value){
 if(!Object.hasOwn(PLANNING_FIELD_DEFAULTS,key))return false;
 const f=state.planning.fields;
 const before=f[key];
 f[key]=String(value??"");
 if(before!==f[key]&&state.completion?.stages){
  const groups=key==='provisionalTitle'?["C10","C60"]:
   /^(aim|motivation|beneficiaryType|beneficiary|intendedUse|prediction|predictionWhy|predictionImplication)$/.test(key)?
    ["C10","C40","C60"]:
   /^(course|kind|mathsOutside|otherMaths|otherCourseMaths|courseSuitability|mathsRevisedWhy)$/.test(key)?
    ["C20","C30","C40","C60"]:
   /^(dataSource|primary|secondary|source|method|firstAccuracy)/.test(key)?
    ["C20","C30","C40","C60"]:[];
  for(const stage of groups)if(state.completion.stages[stage]==="complete")
    state.completion.stages[stage]="needs-review";
 }
 if(before!==f[key]&&state.handover?.confirmedAt){
  state.handover.confirmedAt="";
  state.handover.needsReview=true;
 }
 if(before!==f[key]&&state.planning.completed){
  state.planning.completed=false;
  state.planning.notices=["Your planning choices changed. Review the updated provisional plan before using it."];
 }
 if(key==="dataSource"&&before!==f[key]){
  state.planning.sourceBranches={primary:false,secondary:false};
  state.planning.notices=["Your evidence route changed. Earlier details are retained, but review each relevant source plan again."];
 }
 if(key==="course"&&before!==f[key])state.planning.mathsReviewVersion++;
 if(key==="kind"&&before!==f[key]){
  // Old branches remain in the plan history; their source is not asserted as appropriate for the new route.
  state.planning.notices=["You changed the investigation type. Check earlier source and mathematics choices."];
 }
 if(key==="ideaSelected"){
  const selected = f[key]==="other1"?f.otherIdea1:f[key]==="other2"?f.otherIdea2:f.originalIdea||f.idea;
  if(selected)f.idea=selected;
 }
 if(key==="idea"&&!f.originalIdea)f.originalIdea=f.idea;
 if(key==="predictionId"){
  const old=PLANNING_CATALOG.predictions.find(p=>p.id===before);
  if(old&&f.prediction===old.question)f.prediction="";
  if(f[key]==="X02"&&f.prediction.trim()){
    f.predictionPrior=f.prediction;
    f.prediction="";
    state.planning.notices=["Your earlier prediction is retained in a planning note. You can revisit it after an initial example."];
  }
 }
 if(["beneficiary","beneficiaryType"].includes(key)&&before!==f[key]&&f.predictionImplication.trim()){
  state.planning.notices=["Your intended beneficiary changed. Revisit what the prediction might mean for them."];
 }
 syncPlanningToProject(state);
 return true;
}
export function toggleMath(state,id){
 const item=mathIds.get(id);if(!item)return false;
 const f=state.planning.fields;
 if(item.course!==f.course)return false;
 const ids=state.planning.mathSelected,i=ids.indexOf(id);
 if(state.handover?.confirmedAt){state.handover.confirmedAt="";state.handover.needsReview=true;}
 if(state.planning.completed){state.planning.completed=false;state.planning.notices=["Your mathematics selections changed. Review the provisional plan again."];}
 if(i>=0)ids.splice(i,1);else ids.push(id);
 syncPlanningToProject(state);return true;
}
export function setPlanCurrent(state,id,{history=true,internal=false}={}){
 if(!PLANNING_NODE_IDS.includes(id))return {ok:false,error:"Unknown planning stage."};
 const current=state.planning.current;
 if(history&&current!==id)state.planning.history.push(current);
 state.planning.history=state.planning.history.slice(-400);
 state.planning.current=id;
 state.journey.currentNodeId=id;
 if(!state.planning.visited.includes(id))state.planning.visited.push(id);
 if(!state.journey.visited.includes(id))state.journey.visited.push(id);
 return {ok:true,current:id,internal};
}
export function planningBack(state){
 const old=state.planning.history.pop();
 if(!old)return{ok:false,error:"This is the first stage. Use Home to leave."};
 return setPlanCurrent(state,old,{history:false});
}
export function planningEdit(state,id){
 if(!PLANNING_NODE_IDS.includes(id))return{ok:false,error:"Unknown stage."};
 return setPlanCurrent(state,id);
}
function routeCondition(from,condition){
 return PLANNING_ROUTES.find(r=>r.from===from&&r.answer===condition);
}
function recordTransition(state,from,to,condition,sourceRow){
 state.journey.answers[from]={route:condition,sourceRow:sourceRow??null,recordedAt:now()};
 state.journey.history.push({from,to,condition,sourceRow:sourceRow??null});
 state.journey.history=state.journey.history.slice(-500);
 if(!state.planning.completedNodes.includes(from))state.planning.completedNodes.push(from);
}
export function planningMove(state,condition) {
 const from=state.planning.current;
 const route=routeCondition(from,condition);
 if(!route)return{ok:false,error:"That transition isn't defined for this question."};
 const to=route.to,f=state.planning.fields;
 if(from==="N03B"&&to==="N03J"&&!(state.planning.sourceBranches.primary&&state.planning.sourceBranches.secondary))
  return{ok:false,error:"Answer both primary and secondary source questions first."};
 if(["N03P","N03S"].includes(from)&&to==="N03J"&&f.dataSource==="both"){
  const branch=from==="N03P"?"primary":"secondary";
  const statusKey=branch+"Status";
  if(!["ready","unsure"].includes(f[statusKey]))
   return{ok:false,error:"Select whether your "+branch+" data plan is ready or still uncertain."};
  state.planning.sourceBranches[branch]=true;
  if(!(state.planning.sourceBranches.primary&&state.planning.sourceBranches.secondary)){
    // Internal return to the choice within N03B; does not claim an invented sheet edge.
    recordTransition(state,from,"N03B","Continue remaining combined-data questions (internal)",null);
    return setPlanCurrent(state,"N03B",{internal:true});
  }
 }
 if(from==="N03P"&&to==="N03J"&&!["ready","unsure"].includes(f.primaryStatus))return{ok:false,error:"Confirm whether your primary data plan is ready or uncertain."};
 if(from==="N03S"&&to==="N03J"&&!["ready","unsure"].includes(f.secondaryStatus))return{ok:false,error:"Confirm whether your secondary source plan is ready or uncertain."};
 if(from==="N03F"&&to==="N02T"&&!["yes","unsure"].includes(f.permissionNeed))
  return{ok:false,error:"This checkpoint is for unresolved permission or safety concerns."};
 if(from==="N04"&&condition==="AI SL / AA SL"&&!["AI SL","AA SL"].includes(f.course))
  return{ok:false,error:"Select AI SL or AA SL before using this course-specific menu."};
 if(from==="N04S"&&!f.course)return{ok:false,error:"Choose a course or request teacher guidance."};
 if(from==="N01P"&&to==="N01V")state.planning.returnToPrediction=true;
 if(from==="N01V"&&to==="N01P")state.planning.returnToPrediction=false;
 if(from==="N06"&&to==="N07")state.planning.completed=true;
 if(from==="N03B"&&to==="N03J"&&!(state.planning.sourceBranches.primary&&state.planning.sourceBranches.secondary))
  return{ok:false,error:"Both source sections need to be addressed."};
 recordTransition(state,from,to,condition,route.sourceRow);
 if(to==="C00")return{ok:true,completePlanning:true,route};
 setPlanCurrent(state,to);
 return{ok:true,route};
}
export function planAutoAdvance(state){
 const n=state.planning.current,f=state.planning.fields;
 const go=s=>planningMove(state,s);
 switch(n){
  case "N00":if(!f.ideaStatus)return{ok:false,error:"Choose whether you have an idea, or select the option to explore."};return go(f.ideaStatus==="no"?"No":f.ideaStatus==="unsure"?"Optional: compare more than one idea":"Yes");
  case "N00B":return go("Ready with one idea");
  case "N00C":if(!f.ideaSelected)return{ok:false,error:"Choose which idea you want to develop."};return go(f.ideaSelected==="original"?"Keep original idea":"Selected one idea");
  case "N01":return go("Continue");
  case "N01V":
   if(!f.beneficiaryType&&!state.planning.returnToPrediction)return{ok:false,error:"Choose who might benefit, including Still working it out."};
   if(f.beneficiaryType!=="unsure"&&!f.beneficiary.trim()&&!state.planning.returnToPrediction)
    return{ok:false,error:"Write a brief motivation: who might benefit from answering your question, and how? You can choose Still working it out if you're not ready yet."};
   return go(state.planning.returnToPrediction?"Return to prediction after editing beneficiary":
   f.beneficiaryType==="others"?"I could offer advice to someone else":
   f.beneficiaryType==="both"?"Both personal benefit and advice":
   f.beneficiaryType==="unsure"?"I'm not sure yet":"The results could help me directly");
  case "N02":
   if(!f.kind)return{ok:false,error:"Choose an investigation route, including Not sure yet."};
   return go(f.kind==="statistics"?"Choose maths after statistics":
    f.kind==="modelling"?"Choose maths after modelling":
    f.kind==="theoretical"?"Choose maths after theoretical route":"Unsure");
  case "N02M":
   if(!["statistics","modelling","theoretical"].includes(f.kind))
    return{ok:false,error:"Choose your investigation type before exploring course mathematics."};
   if(!f.course)return{ok:false,error:"Choose your IB Mathematics course before continuing. It is okay to be unsure about techniques."};
   return go(f.kind==="theoretical"?"Discuss theoretical maths with teacher":"Proceed to evidence planning");
  case "N02U":return go("Return");
  case "N02T":return go("Continue with provisional plan");
  case "N03":if(!f.dataSource)return{ok:false,error:"Choose primary, secondary or both data sources."};return go(f.dataSource==="secondary"?"Secondary":f.dataSource==="both"?"Both":"Primary");
  case "N03B":return go(state.planning.sourceBranches.primary&&state.planning.sourceBranches.secondary?"Both data sources complete":
   !state.planning.sourceBranches.primary?"Primary questions":"Secondary questions");
  case "N03P":case "N03S":return go("Complete");
  case "N03J":return go("Method justification or 'not sure'");
  case "N03D":return go("Continue");
  case "N03E":if(Number(f.dataReadiness)===5&&f.dataAvailability!=="in-hand")return{ok:false,error:"A readiness rating of 5 means usable data are already in hand. Please adjust the rating or confirm the evidence is available."};return go("Continue");
  case "N03R":return go("Retry");
  case "N03F":return go("Feasibility questions answered");
  case "N03G":return go("Practical plan is workable");
  case "N03H":return go("Continue with mathematics already explored");
  case "N04":if(!f.course)return{ok:false,error:"Choose your course, or select Another course / unsure."};return go(["AI SL","AA SL"].includes(f.course)?"AI SL / AA SL":"Other / AA HL");
  case "N04T":return go("Record tentative maths and teacher question");
  case "N04S":return go("Techniques selected or unsure");
  case "N01P":
   if(!f.predictionId&&!f.prediction.trim())return{ok:false,error:"Choose a prediction, describe your own, or select Not sure yet."};
   if(f.predictionId==="X01"&&!f.prediction.trim())return{ok:false,error:"Write your own tentative prediction or choose Not sure yet."};
   return go("Prediction made or 'not sure'");
  case "N04R":return go("Keep / add / remove maths or remain unsure");
  case "N04M":return go("Continue");
  case "N05V":return go("Representation planned or uncertain");
  case "N05":return go("Continue");
  case "N06E":return go("Possible changes considered or unsure");
  case "N06T":return go("Record question or skip");
  case "N08":return go("Review answers and export provisional plan");
  case "N06":return go("Student reviews plan and chooses to generate");
  case "N07":return {ok:true,completePlanning:true};
  default:return{ok:false,error:"Choose one of the actions shown on this page."};
 }
}
export function planningSourceRouteCovered(state,from,to){
 return PLANNING_ROUTES.some(r=>r.from===from&&r.to===to);
}
