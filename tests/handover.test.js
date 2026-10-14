import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import {PDFDocument} from "pdf-lib";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {applyPlanningField,planningFlags,toggleMath} from "../src/planning/engine.js";
import {createPlanningEnvelope,normalizePlanningEnvelope,getFieldDiff,mergePlanningEnvelope,createPartialEnvelope,validateDocumentFile,REPORT_ATTACHMENT} from "../src/handover/schema.js";
import {modelFromEnvelope,suggestedFilename} from "../src/handover/report-model.js";
import {createPdfPlanningReport,importEmbeddedPdfReport} from "../src/handover/formats/pdf.js";
import {createDocxPlanningReport,importEmbeddedDocxReport,extractReadableDocxText} from "../src/handover/formats/docx.js";
import {extractRecognisedFields} from "../src/handover/read-document.js";

function example(){
 const s=createProjectState();s.planning.completed=true;
 const answers={
  idea:"Is there a link between sleep and reaction time?",
  aim:"Does more sleep relate to shorter reaction time?",
  motivation:"I am interested in human responses and sports.",
  beneficiaryType:"me",beneficiary:"My own training",intendedUse:"Think about my routine if the results support it",
  course:"AI SL",kind:"statistics",statisticsContext:"Paired numerical",
  dataSource:"both",primaryWhat:"Reaction time in ms",primaryHow:"Timed test, permitted volunteers",
  primaryStatus:"unsure",secondaryUrl:"https://example.org/dataset",secondaryPublisher:"Statistics Office",
  secondaryVariables:"Hours of sleep, response time in ms",secondaryStatus:"ready",
  predictionId:"S02",prediction:"Perhaps reaction time decreases as hours slept increases",
  predictionWhy:"I've noticed I react slowly when tired",
  predictionImplication:"If true, it could inform my training routine",
  firstAction:"Make an honest scatter graph of actual paired observations",
  figureType:"scatter",figurePurpose:"Look for linear or non-linear association",
  dataReadiness:"3",practicalEase:"4",permissionNeed:"yes",
  permissionDetails:"Ask whether collecting response measurements is permitted",
  teacherQuestion:"Can this method meet our consent requirements?",
  milestoneSchoolDraft:"2027-01-12",milestoneSchoolFinal:"2027-02-10",
  firstAccuracy:"Reaction times rounded to nearest 1 ms"
 };
 for(const [key,value] of Object.entries(answers))assert(applyPlanningField(s,key,value));
 toggleMath(s,"AI14");toggleMath(s,"AI15");
 s.entries=[{id:"actual1",status:"completed",result:"An actual result I do not want overwritten",interpretation:"Student work."}];
 s.scratch.introduction="Original IA introduction notes";
 s.teacher.pendingApproval=true;
 return s;
}
test("a planning snapshot includes beneficiary, prediction, source, scores, questions and historical flags",()=>{
 const state=example();
 const envelope=createPlanningEnvelope(state,{exportedAt:"2026-10-14T08:00:00.000Z"});
 assert.equal(envelope.schemaVersion,1);
 assert.equal(envelope.planning.fields.beneficiary,"My own training");
 assert.equal(envelope.planning.fields.predictionImplication,"If true, it could inform my training routine");
 assert.equal(envelope.planning.fields.teacherQuestion,"Can this method meet our consent requirements?");
 assert.equal(envelope.planning.mathSelected.length,2);
 assert.equal(envelope.historicalScores.dataReadiness,"3");
 assert(envelope.teacher.openFlags.some(f=>f.id==="permission"));
 assert.equal(envelope.status,"PROVISIONAL");
 assert.equal(JSON.stringify(envelope).includes("An actual result I do not want overwritten"),false);
});
test("model groups a full Both plan with correct types and caution labels",()=>{
 const model=modelFromEnvelope(createPlanningEnvelope(example()));
 const titles=model.sections.map(x=>x.title);
 assert(titles.some(t=>t.includes("Primary data")));
 assert(titles.some(t=>t.includes("Secondary data")));
 assert(titles.some(t=>t.includes("mathematical")));
 assert(model.status.includes("TEACHER"));
 assert(model.sections.flatMap(x=>x.rows).some(x=>x.label.includes("IF TRUE")));
 assert(suggestedFilename(model,"docx").endsWith(".docx"));
});
test("theoretical planning report never invents primary/secondary datasets",()=>{
 const s=example();
 applyPlanningField(s,"kind","theoretical");
 const model=modelFromEnvelope(createPlanningEnvelope(s));
 assert(model.sections.some(x=>x.title.includes("Theoretical")));
 assert(!model.sections.some(x=>x.title.includes("Primary data")));
 assert(!model.sections.some(x=>x.title.includes("Secondary data")));
 assert(model.sections.flatMap(x=>x.rows).some(r=>r.label.includes("Data readiness")&&r.value.includes("Not applicable")));
});
test("DOCX export round-trips its private versioned planning part and is editable Word XML",async()=>{
 const envelope=createPlanningEnvelope(example(),{exportedAt:"2026-10-14T09:12:00.000Z"});
 const bytes=await createDocxPlanningReport(envelope);
 assert(bytes.length>2000);
 const zip=await JSZip.loadAsync(bytes);
 assert(zip.file("[Content_Types].xml"));
 assert(zip.file("word/document.xml"));
 assert(zip.file("customXml/iaPathfinderPlan.xml"));
 assert((await zip.file("word/_rels/document.xml.rels").async("string")).includes("iaPathfinderPlan.xml"));
 const body=await zip.file("word/document.xml").async("string");
 assert(body.includes("Does more sleep relate"));
 assert(body.includes("PROVISIONAL"));
 const restored=await importEmbeddedDocxReport(bytes);
 assert.equal(restored.planning.fields.predictionWhy,envelope.planning.fields.predictionWhy);
 assert.deepEqual(restored.planning.mathSelected,envelope.planning.mathSelected);
 assert.equal(restored.teacher.pendingReview,true);
 assert((await extractReadableDocxText(bytes)).includes("My IB Mathematics IA Plan"));
});
test("PDF export and attachment-based reimport round-trip core Planning values",async()=>{
 const original=createPlanningEnvelope(example(),{exportedAt:"2026-10-14T09:12:00.000Z"});
 const bytes=await createPdfPlanningReport(original);
 assert.equal(new TextDecoder().decode(bytes.subarray(0,8)).startsWith("%PDF"),true);
 const pdf=await PDFDocument.load(bytes);
 assert(pdf.getPageCount()>=2);
 assert.equal(pdf.getTitle(),"My IB Mathematics IA Plan");
 const imported=await importEmbeddedPdfReport(bytes);
 assert(imported);
 assert.equal(imported.planning.fields.aim,original.planning.fields.aim);
 assert.equal(imported.planning.fields.intendedUse,original.planning.fields.intendedUse);
 assert.equal(imported.planning.fields.firstAccuracy,original.planning.fields.firstAccuracy);
 assert.equal(imported.planning.mathSelected.length,2);
});
test("field-level comparison defaults only to filling blanks and preserves completed mathematics",()=>{
 const incoming=createPlanningEnvelope(example());
 const existing=createProjectState();
 applyPlanningField(existing,"aim","Newer aim I want to keep");
 existing.entries=[{id:"work",status:"completed",result:"A valuable real result"}];
 existing.scratch.introduction="Recent introduction";
 existing.teacher.pendingApproval=true;
 const changes=getFieldDiff(existing,incoming);
 assert(changes.some(c=>c.key==="aim"&&!c.recommended));
 assert(changes.some(c=>c.key==="motivation"&&c.recommended));
 const selected=changes.filter(c=>c.recommended).map(c=>c.key);
 const merged=mergePlanningEnvelope(existing,incoming,selected,{origin:"test"});
 assert.equal(merged.state.planning.fields.aim,"Newer aim I want to keep");
 assert.equal(merged.state.planning.fields.motivation,"I am interested in human responses and sports.");
 assert.equal(merged.state.entries[0].result,"A valuable real result");
 assert.equal(merged.state.scratch.introduction,"Recent introduction");
 assert.equal(merged.state.teacher.pendingApproval,true);
 assert.equal(merged.state.planning.completed,false);
 assert.equal(merged.state.changeLog.at(-1).kind,"planning-import");
});
test("unselected conflicting fields never override existing work",()=>{
 const existing=example();
 const from=createProjectState();
 applyPlanningField(from,"aim","Different investigation");
 applyPlanningField(from,"permissionNeed","no");
 const envelope=createPlanningEnvelope(from);
 const merge=mergePlanningEnvelope(existing,envelope,[],{origin:"other.docx"});
 assert.equal(merge.unchanged,true);
 assert.equal(merge.state.teacher.pendingApproval,true);
 assert.equal(merge.state.planning.fields.aim,existing.planning.fields.aim);
 assert.equal(merge.state.entries[0].result,existing.entries[0].result);
});
test("incoming document never confers teacher approval, even with malicious metadata",()=>{
 const original=createPlanningEnvelope(example());
 original.teacher.pendingReview=false;
 original.teacher.approved=true;
 const normalized=normalizePlanningEnvelope(original);
 assert.equal(normalized.teacher.pendingReview,true);
 assert.equal("approved" in normalized.teacher,false);
});
test("partial labelled recovery does not hallucinate missing data or permissions",()=>{
 const text="Investigation aim\nCould a design be optimised?\nCourse\nAA SL\nPrediction\nA mathematical optimum may exist\nOther page text\nThis is just commentary.";
 const fields=extractRecognisedFields(text);
 assert.equal(fields.aim,"Could a design be optimised?");
 assert.equal(fields.course,"AA SL");
 assert.equal(fields.prediction,"A mathematical optimum may exist");
 assert.equal(fields.permissionNeed,undefined);
 const partial=createPartialEnvelope(fields);
 assert.equal(partial.planning.fields.aim,"Could a design be optimised?");
 assert.equal(partial.planning.mathSelected.length,0);
 assert.throws(()=>createPartialEnvelope({}),/No labelled/);
});
test("unsupported schema or invalid files are rejected without mutating existing work",()=>{
 const payload=createPlanningEnvelope(example());
 payload.schemaVersion=23;
 assert.throws(()=>normalizePlanningEnvelope(payload),/unsupported/);
 assert.throws(()=>validateDocumentFile({name:"virus.exe",size:123}),/pdf or/);
 assert.throws(()=>validateDocumentFile({name:"scan.pdf",size:9_000_000}),/8 MB/);
 assert.equal(REPORT_ATTACHMENT,"ia-pathfinder-plan.json");
 const v1=normalizeProjectState({version:1,project:{aim:"Older idea"},ui:{planStep:3,planMax:4}});
 assert.equal(createPlanningEnvelope(v1).planning.fields.aim,"Older idea");
});

test("reviewed import of an older aim flags impacted real mathematics but preserves student work",()=>{
 const current=example();
 current.entries[0].phase="substantial";
 current.entries[0].result="A genuine student-calculated result";
 current.entries[0].interpretation="What this meant for my earlier aim";
 current.completion.stages.C40="complete";
 current.completion.stages.C60="complete";
 current.scratch.conclusion="My written synthesis";
 const older=createProjectState();
 applyPlanningField(older,"aim","Different earlier investigation aim");
 const imported=createPlanningEnvelope(older);
 const merged=mergePlanningEnvelope(current,imported,["aim"],{origin:"older-word.docx"});
 assert.equal(merged.state.planning.fields.aim,"Different earlier investigation aim");
 assert.equal(merged.state.entries[0].result,"A genuine student-calculated result");
 assert.equal(merged.state.entries[0].interpretation,"What this meant for my earlier aim");
 assert.equal(merged.state.scratch.conclusion,"My written synthesis");
 assert.equal(merged.state.entries[0].reviewNeeded,"yes");
 assert.equal(merged.state.completion.stages.C40,"needs-review");
 assert.equal(merged.state.completion.stages.C60,"needs-review");
 assert.equal(merged.state.teacher.pendingApproval,true);
 assert.equal(merged.state.changeLog.at(-1).mathLinksFlagged,1);
});
test("importing only a deadline does not question unrelated completed mathematical findings",()=>{
 const current=example();
 current.completion.stages.C40="complete";
 const newer=createProjectState();
 applyPlanningField(newer,"milestoneSchoolFinal","2027-04-23");
 const envelope=createPlanningEnvelope(newer);
 const applied=mergePlanningEnvelope(current,envelope,["milestoneSchoolFinal"]);
 assert.equal(applied.state.completion.stages.C40,"complete");
 assert.equal(applied.state.entries[0].reviewNeeded,undefined);
});
