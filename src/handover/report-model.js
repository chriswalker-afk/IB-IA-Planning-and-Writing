/** A shared document model: PDF and Word render precisely the same student-owned plan. */
import {PLANNING_CATALOG} from "../planning/catalog.js";
import {normalizePlanningEnvelope} from "./schema.js";

const trim=x=>String(x??"").trim();
const row=(label,value,{required=false,link=false}={})=>({label,value:trim(value)||(required?"To confirm":""),link});
const section=(title,rows,description="")=>{
 const present=rows.filter(x=>x&&x.value);
 return present.length?{title,description,rows:present}:null;
};
const yes=v=>["yes","unsure"].includes(v);
export function modelFromEnvelope(envelope){
 const payload=normalizePlanningEnvelope(envelope),f=payload.planning.fields;
 const data=f.kind!=="theoretical",prim=data&&["primary","both"].includes(f.dataSource),
  sec=data&&["secondary","both"].includes(f.dataSource);
 const chosen=payload.planning.mathSelected.map(id=>PLANNING_CATALOG.math.find(m=>m.id===id)?.label||"").filter(Boolean);
 const predictionPrompt=PLANNING_CATALOG.predictions.find(p=>p.id===f.predictionId)?.question||"";
 const flags=payload.teacher.openFlags;
 const main=[
  section("01 · The question and its purpose",[
    row("Optional plan label",f.planIdentifier),
    row("My investigation aim",f.aim,{required:true}),
    row("Why I chose it",f.motivation),
    row("Intended beneficiary",f.beneficiary||f.beneficiaryType,{required:true}),
    row("How the answer might be useful",f.intendedUse)
  ],"This is the student's current intention, not an established finding or a promise of useful advice."),
  section("02 · Intended mathematical investigation",[
    row("Course",f.course,{required:true}),
    row("Investigation approach",f.kind,{required:true}),
    row("Possible mathematical techniques",chosen.join("; ") + (f.otherMaths?(chosen.length?"; ":"")+f.otherMaths:"") + (f.otherCourseMaths?"; "+f.otherCourseMaths:"")),
    row("Mathematical suitability self-check",f.courseSuitability),
    row("Mathematics beyond / uncertain within syllabus",f.mathsOutside),
    row("Why this mathematics could help",f.suitabilityWhy||f.mathsRevisedWhy)
  ],"Provisional selections only. Selecting a technique does not imply that it has been used or understood."),
  section("03 · Prediction and mathematical purpose",[
    row("Contextual prompt I considered",predictionPrompt),
    row("My tentative prediction or conjecture",f.prediction|| (f.predictionId==="X02"?"Not sure yet":""),{required:true}),
    row("Why I expect it",f.predictionWhy),
    row("What it could mean IF TRUE",f.predictionImplication),
    row("Exploration if uncertain",f.predictionExploration),
    row("Earlier prediction (not current)",f.predictionPrior)
  ],"This is a hypothesis or conjecture. The actual mathematics must decide what can be concluded."),
  prim&&section("04 · Primary data collection plan",[
    row("Proposed measurements or observations",f.primaryWhat),
    row("Target population or objects",f.primaryPopulation),
    row("Collection date (planned)",f.primaryWhen),
    row("Location or setting",f.primaryWhere),
    row("Collection method",f.primaryHow),
    row("Equipment and resolution",f.primaryEquipment),
    row("Sampling approach",f.primarySampling),
    row("Status of source plan",f.primaryStatus)
  ],"Planned collection only. No data are asserted as collected or approved."),
  sec&&section(prim?"05 · Secondary data source plan":"04 · Secondary data source plan",[
    row("Publisher",f.secondaryPublisher),
    row("Original source URL",f.secondaryUrl,{link:true}),
    row("Relevant variables, units and definitions",f.secondaryVariables),
    row("Intended dates, population or subset",f.secondaryScope),
    row("Student's verification status",f.secondaryVerified),
    row("Status of source plan",f.secondaryStatus)
  ],"The source URL identifies original provenance, not independent verification by Pathfinder."),
  data&&section("Data access and method justification",[
    row("Source route",f.dataSource),
    row("First usable evidence (target date)",f.sourceFirstDate),
    row("Complete dataset (target date)",f.sourceFullDate),
    row("Data presently available",f.dataAvailability),
    row("Other method considered",f.alternativeMethod),
    row("Why I chose this method",f.methodReason),
    row("Anticipated limitation",f.methodLimitation),
    row("Reduction or justification of limitation",f.methodMitigation)
  ]),
  f.kind==="theoretical"&&section("Theoretical / no-data investigation",[
    row("Mathematical question",f.theoreticalAim||f.aim),
    row("An initial case or diagram",f.theoreticalCase),
    row("Tentative mathematical conjecture",f.theoreticalPrediction),
    row("Why I suspect it",f.theoreticalWhy)
  ],"A suitable scope and level should be discussed with the teacher. No dataset is required by this route."),
  section("Practical readiness",[
    row("Data readiness (historical planning snapshot)",data?(f.dataReadiness?f.dataReadiness+"/5":"Not yet assessed"):"Not applicable — theoretical route"),
    row("One way to improve data readiness",f.readinessImprovement),
    row("Practical completion ease (historical snapshot)",f.practicalEase?f.practicalEase+"/5":"Not yet assessed"),
    row("One way to improve feasibility",f.easeImprovement),
    row("Essential resources and dependencies",f.dependencies),
    row("Access still to arrange",f.unsecured),
    row("Estimated setup workload",f.workloadHours?f.workloadHours+" hours":""),
    row("Tool and software readiness",f.softwareReady),
    row("Cleaning and merging burden",f.cleaningBurden),
    row("External uncertainty",f.externalRisks),
    row("Minimum viable investigation",f.minimumVersion),
    row("Contingency / backup data source",f.backupMethod),
    row("Permissions / privacy need",f.permissionNeed||"To confirm"),
    row("Permissions questions",f.permissionDetails),
    row("Rights to use source material",f.sourceRights)
  ],"The /5 assessments concern practical planning only, never predicted IA marks or teacher approval."),
  section("The first mathematical step",[
    row("Planned representation",f.figureOther||f.figureType,{required:true}),
    row("What the first figure / example might reveal",f.figurePurpose),
    row("First purposeful calculation or investigation",f.firstAction,{required:true}),
    row("Measurement accuracy or symbolic precision",f.firstAccuracy)
  ],"Purpose comes before the mathematics; interpretation should follow the actual result."),
  section("Timeline and review",[
    row("Time available for the project",f.timelineWeeks?f.timelineWeeks+" "+(f.timelineWeeks==="1"?"week":"weeks"):""),
    row("Preference for finishing early",f.timelineEarly==="yes"?"Yes — leave a breathing-space buffer":f.timelineEarly==="no"?"No — use the available weeks":""),
    row("Provisional start of the timeline",f.timelineStart),
    row("School teacher-draft deadline (student entered)",f.milestoneSchoolDraft),
    row("School final deadline (student entered)",f.milestoneSchoolFinal),
    row("Planning and introduction",f.milestonePlan),
    row(f.kind==="theoretical"?"Definitions and starting examples":"Usable data / source material",f.milestoneData),
    row("First representation",f.milestoneFirstVisual),
    row("Interpret first representation",f.milestoneVisualReview),
    row("First substantial maths",f.milestoneFirstMath),
    row("Further maths and conclusion",f.milestoneFurtherMath),
    row("Full written draft",f.milestoneDraft),
    row("Revision and final checks",f.milestoneReview),
    row("Timeline adjustment",f.milestoneAdjustment)
  ],"All dates are student-entered targets until confirmed by the school."),
  section("Evolution and alternatives",[
    row("What might change the investigation",f.changeTrigger),
    row("How I could respond",f.changeAdaptation),
    row("Alternative evidence or mathematical route",f.fallbackEvidence),
    row("A previously considered topic",f.otherIdea1),
    row("A second alternative",f.otherIdea2)
  ]),
  section("Questions for my teacher",[
    row("What needs discussion",f.teacherNeed),
    row("Specific question",f.teacherQuestion||f.universalTeacherQuestion),
    row("Other notes",f.teacherExtra),
    row("Potential meeting date",f.teacherSchedule),
    row("Safe next action while awaiting advice",f.teacherSafeAction)
  ],"Teacher advice is recommended where relevant. A document export is not confirmation of approval.")
 ].filter(Boolean);
 const flagsOut=[...flags];
 if(payload.teacher.pendingReview&&!flagsOut.length){
  flagsOut.push({id:"pending-teacher",title:"Teacher discussion may still be outstanding",
   note:"The original project recorded an unresolved teacher-review status. Confirm directly with your teacher; the document is not approval.",
   needsApproval:false});
 }
 return {
  title:"My IB Mathematics IA Plan",
  strapline:"IA PATHFINDER · PERSONAL PLANNING RECORD",
  status:flagsOut.length?"PROVISIONAL · TEACHER DISCUSSION NEEDED":"PROVISIONAL · STUDENT WORKING PLAN",
  subtitle:"A record of choices to revisit as actual mathematics develops",
  course:f.course||"Course to confirm",
  aim:f.aim||"Investigation aim to confirm",
  exportedAt:payload.exportedAt,
  isDemonstration:payload.demo,
  flags:flagsOut,
  sections:main,
  footnote:"Generated by IA Pathfinder. Not an IA submission, grade prediction, verified dataset, permission or teacher approval. The document contains a portable planning snapshot. Edits to the printed or Word text after export are not automatically synced back into Pathfinder."
 };
}
export function suggestedFilename(model,extension){
 const slug=String(model.aim||"My IA").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45)||"my-ia";
 return "IA-Pathfinder-Plan-"+slug+"."+extension;
}
