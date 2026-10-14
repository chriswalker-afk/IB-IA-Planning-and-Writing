/**
 * IA Pathfinder v1 portable PLANNING snapshot.
 * A document contains a point-in-time copy of the student's plan. It does not
 * contain the IA document, validate teacher approvals, or recover edits later
 * made to the human-readable PDF/Word body.
 */
import { PLANNING_FIELD_DEFAULTS, normalizePlanningState, planningFlags, syncPlanningToProject } from "../planning/engine.js";

export const REPORT_KIND = "ia-pathfinder-planning-report";
export const REPORT_SCHEMA = 1;
export const REPORT_ATTACHMENT = "ia-pathfinder-plan.json";
export const REPORT_MAX_BYTES = 850_000;
export const REPORT_MAX_FILE_BYTES = 8_000_000;
const valid = x => x && typeof x === "object" && !Array.isArray(x);
const own = (object,key) => Object.prototype.hasOwnProperty.call(object,key);
const text = value => String(value ?? "");
const fields = Object.keys(PLANNING_FIELD_DEFAULTS);

export const FIELD_GROUPS = Object.freeze({
 "Your question and its meaning": ["idea","interest","aim","motivation","beneficiaryType","beneficiary","intendedUse"],
 "Investigation and sources": ["kind","dataSource","statisticsContext","primaryWhat","primaryWhen","primaryWhere","primaryPopulation","primaryHow","primaryEquipment","primarySampling","primaryStatus","secondaryUrl","secondaryPublisher","secondaryVariables","secondaryScope","secondaryVerified","secondaryStatus","alternativeMethod","methodReason","methodLimitation","methodMitigation","sourceFirstDate","sourceFullDate","dataAvailability"],
 "Readiness, practicality and permissions": ["dataReadiness","readinessImprovement","dependencies","unsecured","permissionNeed","permissionDetails","softwareReady","workloadHours","cleaningBurden","externalRisks","minimumVersion","backupMethod","pilotReady","costIssue","sourceRights","dataSufficiency","negativeResultViable","presentationManageable","practicalEase","easeImprovement"],
 "Mathematics and prediction": ["course","mathsOutside","otherMaths","mathsWhy","predictionId","prediction","predictionWhy","predictionImplication","predictionExploration","courseSuitability","suitabilityWhy","mathsRevisedWhy","figureType","figureOther","figurePurpose","firstAction","firstAccuracy","theoreticalAim","theoreticalCase","theoreticalPrediction","theoreticalWhy","otherCourseMaths"],
 "Timeline and adaptations": ["milestoneSchoolDraft","milestoneSchoolFinal","milestonePlan","milestoneFirstVisual","milestoneVisualReview","milestoneFirstMath","milestoneFurtherMath","milestoneDraft","milestoneReview","milestoneAdjustment","changeTrigger","changeAdaptation","fallbackEvidence"],
 "Teacher conversation": ["teacherNeed","teacherQuestion","teacherSafeAction","teacherExtra","teacherSchedule","universalTeacherQuestion"],
 "Optional idea comparison": ["originalIdea","otherIdea1","otherIdea2","ideaSelected","ideaAccess","ideaValue","ideaStatus"]
});
export const FIELD_LABELS = Object.freeze({
 idea:"Working idea", interest:"Interest", aim:"Investigation aim", motivation:"Why this interests me",
 beneficiaryType:"Intended type of benefit", beneficiary:"Who could benefit", intendedUse:"Possible use of the findings",
 course:"IB Mathematics course",kind:"Investigation type",dataSource:"Source route",statisticsContext:"Data context",
 primaryWhat:"Primary variables / units", primaryWhen:"Collection target",primaryWhere:"Collection setting",
 primaryPopulation:"Population or objects",primaryHow:"How I plan to collect data",primaryEquipment:"Equipment",
 primarySampling:"Sampling approach",primaryStatus:"Primary source plan status",
 secondaryUrl:"Source URL",secondaryPublisher:"Publisher",secondaryVariables:"Variables and definitions",
 secondaryScope:"Population / dates / useful subset",secondaryVerified:"Verification status",
 secondaryStatus:"Secondary source plan status",alternativeMethod:"Alternative considered",
 methodReason:"Reason for chosen method",methodLimitation:"Anticipated limitation",
 methodMitigation:"Possible mitigation",sourceFirstDate:"First usable-data target",
 sourceFullDate:"Full dataset target",dataAvailability:"Availability of evidence",
 dataReadiness:"Data readiness out of 5 (planning only)",readinessImprovement:"Readiness improvement",
 dependencies:"Essential dependencies",unsecured:"Unarranged access",permissionNeed:"Permissions and privacy",
 permissionDetails:"Permission questions",softwareReady:"Tools readiness",workloadHours:"Practical setup hours",
 cleaningBurden:"Data cleaning effort",externalRisks:"External uncertainty",
 minimumVersion:"Smallest viable scope",backupMethod:"Data fallback",pilotReady:"Small test",
 costIssue:"Cost or restricted access",sourceRights:"Source use and citation",
 dataSufficiency:"Sufficient usable data",negativeResultViable:"Useful if no expected pattern",
 presentationManageable:"Manageable presentation",practicalEase:"Practical ease out of 5 (planning only)",
 easeImprovement:"Practical improvement",mathsOutside:"Familiarity with mathematics",
 otherMaths:"Other technique",mathsWhy:"Why it is useful",predictionId:"Contextual prediction prompt ID",
 prediction:"Student's prediction or conjecture",predictionWhy:"Why I expect it",
 predictionImplication:"What it might mean IF TRUE",predictionExploration:"Exploration if uncertain",
 courseSuitability:"Mathematical suitability self-check",suitabilityWhy:"Why maths may answer aim",
 mathsRevisedWhy:"Reason for revised mathematics",figureType:"First representation type",
 figureOther:"First representation detail",figurePurpose:"Purpose of first representation",
 firstAction:"First mathematical action",firstAccuracy:"Units / accuracy decisions",
 theoreticalAim:"Theoretical question",theoreticalCase:"Small theoretical case",
 theoreticalPrediction:"Tentative conjecture",theoreticalWhy:"Reasons for conjecture",otherCourseMaths:"Provisional other-course mathematics",
 milestoneSchoolDraft:"School teacher-draft deadline",milestoneSchoolFinal:"School final deadline",
 milestonePlan:"Planning and introduction milestone",milestoneFirstVisual:"First figure / example milestone",
 milestoneVisualReview:"Interpret first figure",milestoneFirstMath:"Initial mathematics milestone",
 milestoneFurtherMath:"Further mathematics and conclusion",milestoneDraft:"Written first draft",
 milestoneReview:"Revision and final checks",milestoneAdjustment:"Timeline adjustment",
 changeTrigger:"What might change",changeAdaptation:"How the plan could evolve",
 fallbackEvidence:"Alternative material",teacherNeed:"Area needing teacher advice",
 teacherQuestion:"Specific question for teacher",teacherSafeAction:"Safe next step",
 teacherExtra:"Other teacher notes",teacherSchedule:"Possible teacher conversation date",
 universalTeacherQuestion:"Optional general teacher check-in",
 originalIdea:"Original idea",otherIdea1:"Alternative idea one",otherIdea2:"Alternative idea two",
 ideaSelected:"Chosen idea",ideaAccess:"Practical comparison",ideaValue:"Interest and usefulness",ideaStatus:"Idea starting point"
});
export const FIELD_ORDER = Object.freeze([...new Set(Object.values(FIELD_GROUPS).flat())]);

function assertEnvelopeRaw(value) {
 if(!valid(value) || value.kind!==REPORT_KIND)
  throw new Error("This document does not contain a Pathfinder planning snapshot.");
 if(value.schemaVersion!==REPORT_SCHEMA)
  throw new Error("This Pathfinder snapshot is from an unsupported version. Use the original project backup or manual recovery.");
 if(!valid(value.planning)||!valid(value.planning.fields)||!Array.isArray(value.planning.mathSelected))
  throw new Error("The embedded planning data is incomplete or corrupted.");
 const bytes=new TextEncoder().encode(JSON.stringify(value));
 if(bytes.length>REPORT_MAX_BYTES)throw new Error("The embedded project data is too large.");
}
export function createPlanningEnvelope(state,{exportedAt=new Date().toISOString()}={}) {
 const p=normalizePlanningState(state.planning,state.project);
 const exportData={
  current:p.current,fields:{...p.fields},mathSelected:[...p.mathSelected],
  sourceBranches:{...p.sourceBranches},completedNodes:[...p.completedNodes],
  // Current Planning work only: no actual mathematics, no teacher approval record.
  completed:!!p.completed,sourceSnapshot:p.sourceSnapshot
 };
 const flags=planningFlags({...state,planning:p});
 const envelope={
  kind:REPORT_KIND,schemaVersion:REPORT_SCHEMA,exportedAt,
  source:{app:"IA Pathfinder",stateVersion:state.version??2,snapshot:p.sourceSnapshot,format:"planning-only"},
  status:"PROVISIONAL",demo:!!state.demo,planning:exportData,
  teacher:{openFlags:flags.map(x=>({id:x.id,title:x.title,note:x.note,needsApproval:!!x.needsApproval})),
   pendingReview:flags.length>0||state.teacher?.pendingApproval===true},
  historicalScores:{asOf:exportedAt,dataReadiness:p.fields.kind==="theoretical"?null:(p.fields.dataReadiness||null),
   practicalEase:p.fields.practicalEase||null}
 };
 assertEnvelopeRaw(envelope);
 return envelope;
}
export function normalizePlanningEnvelope(value){
 assertEnvelopeRaw(value);
 const clean=normalizePlanningState(value.planning,{});
 // No imported document is evidence that someone approved a project.
 const openFlags=Array.isArray(value.teacher?.openFlags)?value.teacher.openFlags.filter(x=>valid(x)).slice(0,20).map(x=>({
  id:text(x.id).slice(0,80),title:text(x.title).slice(0,150),
  note:text(x.note).slice(0,500),needsApproval:x.needsApproval===true
 })):[];
 return {
  kind:REPORT_KIND,schemaVersion:REPORT_SCHEMA,
  exportedAt:typeof value.exportedAt==="string"?value.exportedAt.slice(0,64):"",
  source:{app:"IA Pathfinder",snapshot:text(value.source?.snapshot).slice(0,40),stateVersion:2,format:"planning-only"},
  status:"PROVISIONAL",demo:value.demo===true,
  planning:{current:clean.current,fields:clean.fields,mathSelected:clean.mathSelected,
   sourceBranches:clean.sourceBranches,completedNodes:clean.completedNodes,
   completed:clean.completed,sourceSnapshot:clean.sourceSnapshot},
  teacher:{openFlags,pendingReview:true}, // never say that a document proves approval
  historicalScores:{asOf:text(value.exportedAt),dataReadiness:clean.fields.kind==="theoretical"?null:(clean.fields.dataReadiness||null),practicalEase:clean.fields.practicalEase||null}
 };
}
export function createPartialEnvelope(partial,reason="Read-only labelled text"){
 const f={...PLANNING_FIELD_DEFAULTS};
 for(const key of fields)if(own(partial||{},key)&&typeof partial[key]==="string") f[key]=partial[key].slice(0,10000);
 if(!Object.values(f).some(x=>x.trim())) throw new Error("No labelled Pathfinder fields could be identified. Try the original export or enter the details manually.");
 return normalizePlanningEnvelope({
  kind:REPORT_KIND,schemaVersion:REPORT_SCHEMA,exportedAt:"",demo:false,
  planning:{fields:f,mathSelected:[],sourceBranches:{},completedNodes:[]},
  source:{snapshot:"manual-recovery"},
  teacher:{openFlags:[],pendingReview:true}
 });
}
export function getFieldDiff(current,envelope){
 const incoming=normalizePlanningEnvelope(envelope);
 const currentFields=current.planning?.fields||PLANNING_FIELD_DEFAULTS;
 const changes=[];
 for(const key of FIELD_ORDER){
  const next=text(incoming.planning.fields[key]);
  if(!next.trim()||next===text(currentFields[key]))continue;
  const old=text(currentFields[key]);
  changes.push({key,label:FIELD_LABELS[key]||key,old,next,group:Object.keys(FIELD_GROUPS).find(g=>FIELD_GROUPS[g].includes(key)),
   recommended:!old.trim()});
 }
 const newSelected=incoming.planning.mathSelected;
 const oldSelected=current.planning?.mathSelected||[];
 if(JSON.stringify(newSelected)!==JSON.stringify(oldSelected)&&newSelected.length){
  changes.push({key:"mathSelected",label:"Selected possible mathematics",group:"Mathematics and prediction",
   old:oldSelected.join(", ")||"",next:newSelected.join(", "),
   recommended:!oldSelected.length});
 }
 return changes;
}
export function mergePlanningEnvelope(current,envelope,selectedKeys=[],{origin="document"}={}){
 const imported=normalizePlanningEnvelope(envelope), changes=getFieldDiff(current,imported);
 const allow=new Set(changes.map(c=>c.key));
 const requested=new Set(selectedKeys.filter(x=>typeof x==="string"&&allow.has(x)));
 const state=structuredClone(current),existingPending=!!current.teacher?.pendingApproval;
 const applied=[];
 for(const key of requested){
  if(key==="mathSelected"){
   state.planning.mathSelected=[...imported.planning.mathSelected];
  }else{
   state.planning.fields[key]=imported.planning.fields[key];
  }
  applied.push(key);
 }
 // Import is a *reviewed revision*, not a claim that teacher approval or actual work occurred.
 if(applied.length){
  state.planning.completed=false;
  state.planning.notices=["Imported planning answers need review. Completed mathematical results and teacher status were not overwritten."];
  state.journey.history=Array.isArray(state.journey.history)?state.journey.history:[];
  state.journey.history.push({from:"handover",to:"planning",condition:"Confirmed field-level merge",count:applied.length,exportedAt:imported.exportedAt});
  state.teacher.pendingApproval=existingPending;
  syncPlanningToProject(state);
  state.teacher.pendingApproval=existingPending||state.teacher.pendingApproval;
  const changeLog=Array.isArray(state.changeLog)?state.changeLog:[];
  changeLog.push({kind:"planning-import",at:new Date().toISOString(),source:origin,snapshotDate:imported.exportedAt,
   fields:applied,teacherStatus:"unchanged"});
  state.changeLog=changeLog.slice(-400);
 }
 return {state,applied,unchanged:!applied.length};
}
export function validateDocumentFile(file){
 const name=text(file?.name).toLowerCase();
 if(!(/\.(pdf|docx)$/i.test(name)))throw new Error("Choose a .pdf or .docx report.");
 if(!Number.isFinite(file?.size)||file.size<=0||file.size>REPORT_MAX_FILE_BYTES)
  throw new Error("This file is empty or exceeds the 8 MB safety limit.");
 return name.endsWith(".pdf")?"pdf":"docx";
}
