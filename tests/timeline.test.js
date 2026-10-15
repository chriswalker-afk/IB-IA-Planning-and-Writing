import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {applyPlanningField} from "../src/planning/engine.js";
import {TIMELINE_KEYS,addDays,timelineWeek,milestoneLabel,suggestTimeline,applySuggestedTimeline} from "../src/planning/timeline.js";
import {createPlanningViews} from "../src/ui/planning-views.js";
import {createPlanningEnvelope,normalizePlanningEnvelope} from "../src/handover/schema.js";
import {modelFromEnvelope} from "../src/handover/report-model.js";
import {modelFromFullProject} from "../src/handover/full-project-model.js";
import {createPdfPlanningReport,importEmbeddedPdfReport} from "../src/handover/formats/pdf.js";
import {createDocxPlanningReport,importEmbeddedDocxReport} from "../src/handover/formats/docx.js";

const fields=s=>s.planning.fields;
function project(weeks="8",early="yes"){
 const s=createProjectState();
 applyPlanningField(s,"timelineWeeks",weeks);
 applyPlanningField(s,"timelineEarly",early);
 return s;
}
const offset=(a,b)=>(Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/86400000;
function view(s){
 s.route="planning";s.planning.current="N03H";
 const e=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
 const ctx={getState:()=>s,icon:()=>"",e,button:t=>t,
  field:(path,label)=>'<label data-test-field="'+e(path)+'">'+e(label)+'</label>',
  choose:(path,items)=>items.map(x=>'<span>'+e(x.title)+'</span>').join(""),
  numberPick:()=>"",note:x=>x,summary:(x,y)=>x+" "+y,helpButton:()=>"",helpBox:()=>"",tabletNav:()=>""};
 return createPlanningViews(ctx).viewPlanning();
}
test("default timeline asks just two accessible questions and hides detailed date inputs",()=>{
 const html=view(project("",""));
 assert(html.includes('id="timeline-weeks"'));
 assert(html.includes("Would you like to finish early"));
 assert(html.includes('data-action="timeline-generate"'));
 assert(html.includes("<details class=\"timeline-advanced\">"));
 assert(!html.includes('<details class="timeline-advanced" open'));
 assert(!html.includes('id="timeline-suggestion"'));
});
test("suggested milestones progress in order over 1–52 weeks, including short projects",()=>{
 for(const weeks of [1,2,4,8,12,52]){
  for(const early of ["yes","no"]){
   const x=suggestTimeline({weeks:String(weeks),finishEarly:early,startDate:"2026-10-15"});
   assert(x.ok,JSON.stringify(x));
   assert.equal(x.finalDay,addDays("2026-10-15",weeks*7));
   assert.equal(TIMELINE_KEYS.length,8);
   assert.equal(Object.keys(x.dates).length,8);
   const days=TIMELINE_KEYS.map(k=>offset(x.startDate,x.dates[k]));
   assert(days.every((d,i)=>d>=0&&d<=weeks*7&&(i===0||d>=days[i-1])));
   assert.equal(x.dates.milestoneReview,x.workingFinish);
   assert.equal(offset(x.workingFinish,x.finalDay),x.bufferDays);
   if(early==="yes")assert(x.bufferDays>=1);else assert.equal(x.bufferDays,0);
   assert(timelineWeek(x.startDate,x.finalDay)<=weeks);
  }
 }
});
test("must explicitly choose weeks, preference and a valid start date",()=>{
 for(const weeks of ["","0","-2","2.5","53","abc","250","99999"]){
  assert.equal(suggestTimeline({weeks,finishEarly:"yes",startDate:"2026-10-15"}).ok,false,weeks);
 }
 assert.equal(suggestTimeline({weeks:"8",finishEarly:"",startDate:"2026-10-15"}).ok,false);
 assert.equal(suggestTimeline({weeks:"8",finishEarly:"yes",startDate:"2026-02-30"}).ok,false);
});
test("generation preserves official deadlines, existing custom dates and student-owned working records",()=>{
 const s=project("10","yes");
 fields(s).milestoneSchoolFinal="2027-02-15";
 fields(s).milestoneFirstMath="2026-12-12";
 s.entries=[{id:"existing",result:"Actual student result should remain unchanged."}];
 const before=JSON.stringify(s.entries);
 let x=applySuggestedTimeline(s,applyPlanningField,{today:"2026-10-15"});
 assert(x.ok);assert(x.preserved.includes("milestoneFirstMath"));
 assert.equal(fields(s).milestoneFirstMath,"2026-12-12");
 assert.equal(fields(s).milestoneSchoolFinal,"2027-02-15");
 assert.equal(fields(s).timelineStart,"2026-10-15");
 assert.equal(JSON.stringify(s.entries),before);
 const originalDraft=fields(s).milestoneDraft;
 applyPlanningField(s,"milestoneDraft","2026-11-09");
 applyPlanningField(s,"timelineWeeks","12");
 x=applySuggestedTimeline(s,applyPlanningField,{today:"2026-10-20"});
 assert(x.ok);assert(x.preserved.includes("milestoneDraft"));
 assert.equal(fields(s).milestoneDraft,"2026-11-09");
 assert.notEqual(fields(s).milestonePlan,x.dates.milestonePlan+"not"); // changed dates remain valid
 assert.notEqual(fields(s).milestoneReview,originalDraft);
 assert.equal(fields(s).timelineStart,"2026-10-15","regeneration does not silently move start date");
 assert.equal(fields(s).milestoneSchoolFinal,"2027-02-15");
 const fresh=applySuggestedTimeline(s,applyPlanningField,{force:true});
 assert(fresh.ok);assert.equal(fields(s).milestoneDraft,fresh.dates.milestoneDraft);
 assert.equal(fields(s).milestoneSchoolFinal,"2027-02-15");
});
test("theoretical IA changes the evidence wording without inventing a dataset",()=>{
 const s=project();applyPlanningField(s,"kind","theoretical");
 applySuggestedTimeline(s,applyPlanningField,{today:"2026-10-15"});
 const html=view(s);
 assert(html.includes("Choose definitions and useful starting examples"));
 assert(!html.includes("Obtain usable data from participants"));
 assert.equal(milestoneLabel("milestoneData","theoretical"),"Choose definitions and useful starting examples");
});
test("new and imported full/Planning reports retain the suggested timetable and correct provenance",async()=>{
 const s=project("7","yes");
 applyPlanningField(s,"aim","An original synthetic project");
 applySuggestedTimeline(s,applyPlanningField,{today:"2026-10-15"});
 const e=createPlanningEnvelope(s,{exportedAt:"2026-10-15T10:00:00Z"});
 const m=modelFromEnvelope(e),full=modelFromFullProject(s);
 const text=m.sections.flatMap(x=>x.rows.map(y=>y.label+": "+y.value)).join("\n");
 assert(text.includes("7 weeks"));assert(text.includes("breathing-space buffer"));
 assert(text.includes(fields(s).milestoneData));
 assert(full.sections.some(x=>x.title.startsWith("Planning · Timeline and review")));
 const back=normalizePlanningEnvelope(e);
 assert.equal(back.planning.fields.timelineWeeks,"7");
 assert.equal(back.planning.fields.milestoneReview,fields(s).milestoneReview);
 const pdf=await createPdfPlanningReport(e);
 const docx=await createDocxPlanningReport(e);
 assert.equal((await importEmbeddedPdfReport(pdf)).planning.fields.milestoneData,fields(s).milestoneData);
 assert.equal((await importEmbeddedDocxReport(docx)).planning.fields.timelineEarly,"yes");
 const copied=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(copied.planning.timelineAuto.milestoneData,s.planning.timelineAuto.milestoneData);
 assert.equal(copied.planning.fields.milestoneReview,s.planning.fields.milestoneReview);
});
