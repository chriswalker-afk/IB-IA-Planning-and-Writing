import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {createPlanningViews} from "../src/ui/planning-views.js";
import {createCompletingViews} from "../src/completing/views.js";
import {groupedDashboard} from "../src/ui/journey-views.js";
import {METHOD_OPTIONS} from "../src/completing/guidance-context.js";
import {methodFamilies} from "../src/completing/method-identity.js";
import {ENTRY_BASE} from "../src/completing/entry-record.js";
import {
 isAaHl,aaHlExplorationPrompts,aaHlStagePrompt,
 renderAaHlPlanningAdvice,renderAaHlStagePrompt
} from "../src/planning/aa-hl-depth-guidance.js";
import {
 VALIDITY_CHECKS,mathematicalValidityContext,
 renderMathematicalValidityAid,renderCourseUnderstandingAid
} from "../src/completing/mathematical-validity.js";
import {consequentialReflectionCue,renderConsequentialReflectionCue} from "../src/completing/consequential-reflection.js";

const e=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const icon=()=>'<span class="icon"></span>';
const field=(path,label)=>'<label data-path="'+e(path)+'">'+e(label)+'</label>';
const ctx=s=>({
 getState:()=>s,e,icon,field,
 button:(label,action)=>'<button data-action="'+e(action)+'">'+e(label)+'</button>',
 choose:(path,options)=>'<div data-choice-path="'+e(path)+'">'+options.map(x=>e(x.title)).join(",")+'</div>',
 summary:(label,value)=>'<p>'+e(label)+": "+e(value)+'</p>',
 sheetTitle:(_,title)=>'<h1>'+e(title)+'</h1>',
 numberPick:()=>"",note:x=>x,tabletNav:()=>"",helpButton:()=>"",helpBox:()=>"",
 filled:v=>typeof v==="string"&&!!v.trim()
});
const planning=(s,node)=>{s.planning.current=node;s.route="planning";return createPlanningViews(ctx(s)).viewPlanning();};
const completing=(s,node)=>{s.completion.current=node;s.route="completing";return createCompletingViews(ctx(s)).viewCompleting();};
const withEntry=(course="AA HL",method="piecewise-model",status="completed")=>{
 const s=createProjectState();
 s.planning.fields.course=course;
 s.planning.fields.kind="modelling";
 s.planning.fields.aim="Can a two-stage model describe the observed change?";
 s.entries=[{...ENTRY_BASE,id:"real",phase:"first",status,methodId:method,
   title:"Observed two-stage function",result:"The actual one-sided limits were calculated",
   interpretation:"A corner changes the plausible interpretation",
   limitations:"The model changes rule at an observed threshold"}];
 s.completion.activeEntryIndex=0;
 return s;
};

test("AA HL is the only course granted the dedicated, non-syllabus-mapped depth guide",()=>{
 const s=createProjectState();s.planning.fields.kind="theoretical";
 for(const course of ["AI SL","AA SL","AI HL","other",""]){
  s.planning.fields.course=course;
  assert.equal(isAaHl(s),false,course);
  assert.equal(aaHlExplorationPrompts(s),null,course);
  assert.equal(renderAaHlPlanningAdvice(s,{e,icon}),"",course);
  assert.equal(renderAaHlStagePrompt(s,withEntry(course).entries[0],{e}),"",course);
 }
 s.planning.fields.course="AA HL";
 assert.equal(isAaHl(s),true);
 assert.equal(aaHlExplorationPrompts(s).kind,"theoretical");
 const markup=renderAaHlPlanningAdvice(s,{e,icon});
 assert.match(markup,/data-aa-hl-depth="planning"/);
 assert.match(markup,/<details/);
 assert(!markup.includes(" open>"),"Help should start collapsed");
 assert.match(markup,/not an official AA HL topic list/);
 assert.match(markup,/including one taught at SL/);
 assert.match(markup,/teacher approval/);
});

test("AA HL mathematical pathways adapt without introducing a purported HL syllabus",()=>{
 const s=createProjectState();s.planning.fields.course="AA HL";
 const expected={
  statistics:["actual data","mathematical summary","inference"],
  modelling:["mathematical model","boundary or join","Challenge the result"],
  theoretical:["conjecture","Prove or delimit","connection"],
  unsure:["question","tractable case","course suitability"]
 };
 for(const [kind,terms] of Object.entries(expected)){
  s.planning.fields.kind=kind;
  const out=aaHlExplorationPrompts(s);
  assert.equal(out.kind,kind);
  assert.equal(out.prompts.length,3);
  const names=out.prompts.map(x=>x.name).join(" ").toLowerCase();
  for(const phrase of terms)assert(names.includes(phrase.toLowerCase()),kind+": "+phrase);
  const content=renderAaHlPlanningAdvice(s,{e,icon});
  assert.equal((content.match(/<li>/g)||[]).length,3);
  assert(!content.includes("data-math-id="),"No automatic HL syllabus selections");
 }
 s.planning.fields.kind="something-unknown";
 assert.equal(aaHlExplorationPrompts(s).kind,"unsure");
});

test("one optional AA HL route aid sits in Planning at the point of course selection",()=>{
 const s=createProjectState();s.planning.fields.course="AA HL";s.planning.fields.kind="modelling";
 s.planning.fields.otherCourseMaths="My original mathematical idea";
 s.planning.routeExplorer.mode="all";
 const before=JSON.stringify(s);
 let html=planning(s,"N02M");
 assert.equal((html.match(/data-aa-hl-depth="planning"/g)||[]).length,1);
 assert.match(html,/different rules are needed in different intervals/);
 assert.match(html,/Only AI SL and AA SL/);
 assert(!html.includes('data-math-id="AA01"'),"Must not relabel AA SL catalogue as HL");
 assert.equal(s.planning.fields.otherCourseMaths,"My original mathematical idea");
 assert(!html.includes("has been approved"));
 html=planning(s,"N04T");
 assert.equal((html.match(/data-aa-hl-depth="planning"/g)||[]).length,1);
 assert.match(html,/Mathematics I'm considering/);
 assert.match(html,/teacher approval/);
 assert.equal(s.planning.fields.otherCourseMaths,"My original mathematical idea");
 // Planned math and source data remain unchanged; navigation is the only mutation.
 assert.equal(JSON.parse(before).entries.length,s.entries.length);
});

test("existing AI SL and AA SL discovery menus are unchanged by AA HL advice",()=>{
 const s=createProjectState();s.planning.routeExplorer.mode="all";
 s.planning.fields.course="AI SL";
 let html=planning(s,"N02M");
 assert(!html.includes("data-aa-hl-depth"));
 assert.match(html,/Voronoi diagrams/);
 assert(!html.includes("Integration by substitution"));
 s.planning.fields.course="AA SL";
 html=planning(s,"N02M");
 assert(!html.includes("data-aa-hl-depth"));
 assert.match(html,/Integration by substitution/);
 assert(!html.includes("Voronoi diagrams"));
 s.planning.fields.course="AI HL";
 html=planning(s,"N02M");
 assert(!html.includes("data-aa-hl-depth"));
 assert.match(html,/Course review needed/);
});

test("legacy and revised Planning welcome show only their appropriate assessment framework",()=>{
 const s=createProjectState();
 let html=planning(s,"N00");
 assert.match(html,/five A–E criteria for the through-2028 cohort/);
 assert.match(html,/onboarding-criterion-letter/);
 s.planning.fields.assessmentFramework="revised2029";
 html=planning(s,"N00");
 assert.match(html,/updated four-criterion overview/);
 assert.match(html,/Earlier A–E criterion bubbles and self-marks are hidden/);
 assert(!html.includes("onboarding-criterion-letter"));
 assert(!html.includes("complete current A–E criteria"));
 assert.equal(s.planning.fields.assessmentFramework,"revised2029");
});

test("IA Studio welcomes distinguish revised cohort rather than promising A–E badges",()=>{
 const s=createProjectState();s.ui.writingIntroSeen=false;
 let html=completing(s,"C00");
 assert.match(html,/green A–E criterion bubbles/i);
 s.planning.fields.assessmentFramework="revised2029";
 html=completing(s,"C00");
 assert.match(html,/updated four-criterion overview/);
 assert.match(html,/old A–E criterion bubbles and self-marks are hidden/);
 assert(!html.includes("Green A–E criterion bubbles explain the current IB expectations"));
});

test("checking button and final-page instructions obey the selected cohort",()=>{
 const s=createProjectState();s.route="completing";
 let dash=groupedDashboard(s);
 assert.match(dash,/Open A–E checking checklist/);
 let final=completing(s,"C90F");
 assert.match(final,/Locate genuine evidence for criteria A–E/);
 s.planning.fields.assessmentFramework="revised2029";
 dash=groupedDashboard(s);
 assert.match(dash,/Review 2029 assessment criteria/);
 assert(!dash.includes("Open A–E checking checklist"));
 final=completing(s,"C90F");
 assert.match(final,/revised 2029 four-criterion overview/);
 assert.match(final,/Earlier A–E notes are saved but are not 2029 marks/);
 assert(!final.includes("Locate genuine evidence for criteria A–E"));
 const notation=completing(s,"C70N");
 assert.match(notation,/does not replace accurate mathematical notation/);
 assert(!notation.includes("Criterion B marking point"));
});

test("student-written older rubric notes remain saved and editable after changing cohorts",()=>{
 const s=createProjectState();
 s.completion.fields.finalCriteria="My original A-E notes from an earlier draft";
 s.completion.fields.draftCriteria="My earlier teacher-draft note";
 s.completion.review.records["draft-D02"].note="Existing assessment commentary";
 s.planning.fields.assessmentFramework="revised2029";
 let html=completing(s,"C90F");
 assert.match(html,/Earlier general A–E final notes/);
 assert.match(html,/completion.fields.finalCriteria/);
 assert.equal(s.completion.fields.finalCriteria,"My original A-E notes from an earlier draft");
 assert.equal(s.completion.review.records["draft-D02"].note,"Existing assessment commentary");
 const restored=normalizeProjectState(structuredClone(s));
 assert.equal(restored.completion.fields.finalCriteria,s.completion.fields.finalCriteria);
 assert.equal(restored.completion.fields.draftCriteria,s.completion.fields.draftCriteria);
 assert.equal(restored.completion.review.records["draft-D02"].note,
  s.completion.review.records["draft-D02"].note);
});

test("AA HL stage guide is inside existing collapsed course help, never a separate writing field",()=>{
 const s=withEntry();
 s.entries[0].knowledge="syllabus";
 const before=JSON.stringify(s);
 let html=renderCourseUnderstandingAid(s,s.entries[0],{e,icon,reduced:true});
 assert.match(html,/class="math-course-aid is-reduced"/);
 assert.match(html,/data-aa-hl-depth="writing"/);
 assert.match(html,/familiar or SL-level starting point/);
 assert.match(html,/join/);
 assert.match(html,/Criterion E level/);
 assert.match(html,/<details><summary>/);
 assert(!html.includes("data-bind="));
 assert.equal(JSON.stringify(s),before);
 s.planning.fields.assessmentFramework="revised2029";
 html=renderCourseUnderstandingAid(s,s.entries[0],{e,icon});
 assert.match(html,/not an A–E Criterion E mark/);
 assert.match(html,/revised four criteria/);
 assert(!html.includes("For the through-2028 A–E framework"));
 for(const course of ["AA SL","AI SL","AI HL"]){
  s.planning.fields.course=course;
  assert(!renderCourseUnderstandingAid(s,s.entries[0],{e,icon}).includes("data-aa-hl-depth"));
 }
});

test("AA HL writing questions depend on selected mathematics, not prose or planned pathways",()=>{
 const s=withEntry("AA HL","proof");
 let prompt=aaHlStagePrompt(s,s.entries[0]);
 assert.match(prompt.question,/logical steps for every permitted case/);
 s.entries[0].methodId="optimisation";
 assert.match(aaHlStagePrompt(s,s.entries[0]).question,/constraints/);
 s.entries[0].methodId="normal";
 assert.match(aaHlStagePrompt(s,s.entries[0]).question,/data and mathematical assumptions/);
 s.entries[0].methodId="other";
 s.entries[0].title="Piecewise and polynomial regression";
 s.entries[0].result="A piecewise distribution proved correct";
 s.entries[0].technique="";
 s.planning.routeExplorer.selectedRoute="trajectories";
 assert(!aaHlStagePrompt(s,s.entries[0]).question.includes("join"),
  "Free-text title/result cannot infer the mathematical method");
 s.entries[0].methodId="piecewise-model";
 assert.match(aaHlStagePrompt(s,s.entries[0]).question,/continuity or smoothness/);
});

test("piecewise functions receive explicit mathematical checks, without imposing false smoothness",()=>{
 assert(METHOD_OPTIONS.some(([id,label])=>id==="piecewise-model"&&/Piecewise/.test(label)));
 assert(VALIDITY_CHECKS["piecewise-model"]);
 const s=withEntry(),entry=s.entries[0];
 const before=JSON.stringify(s);
 const validity=mathematicalValidityContext(s,entry);
 assert.equal(validity.method,"piecewise-model");
 assert.match(validity.rule.question,/one-sided limits/);
 assert.match(validity.rule.question,/one-sided derivatives/);
 assert.match(validity.rule.question,/if a smooth transition is needed/);
 assert.match(validity.rule.limit,/does not automatically imply continuity or differentiability/);
 assert.match(validity.rule.limit,/jump or corner may be appropriate/);
 const html=renderMathematicalValidityAid(s,entry,{e,icon,reduced:true});
 assert.match(html,/data-math-validity-method="piecewise-model"/);
 assert.match(html,/data-consequential-reflection="real"/);
 assert.match(html,/is-reduced/);
 assert.match(html,/data-node="C31"/);
 assert.match(html,/preserving the original piecewise definition/);
 assert.equal(JSON.stringify(s),before);
});

test("piecewise checks require a real completed, review-free mathematical record",()=>{
 const s=withEntry(),entry=s.entries[0];
 let ctx=mathematicalValidityContext(s,entry);
 assert.equal(consequentialReflectionCue(ctx).method,"piecewise-model");
 assert.match(consequentialReflectionCue(ctx).compare,/re-evaluate the left and right behaviour/i);
 entry.status="planned";
 assert.equal(mathematicalValidityContext(s,entry),null);
 assert.equal(renderMathematicalValidityAid(s,entry,{e,icon}),"");
 entry.status="completed";entry.result="";
 assert.equal(mathematicalValidityContext(s,entry),null);
 entry.result="The original result was produced";entry.reviewNeeded="yes";
 const review=renderMathematicalValidityAid(s,entry,{e,icon});
 assert.match(review,/flagged for review/);
 assert(!review.includes("data-consequential-reflection"));
 entry.reviewNeeded="";
 assert.match(renderMathematicalValidityAid(s,entry,{e,icon}),/data-consequential-reflection/);
});

test("piecewise inference is restricted to explicit IDs or eligible legacy technique labels",()=>{
 const s=withEntry("AA HL","other"),entry=s.entries[0];
 entry.title="Piecewise approximation";
 entry.result="I fitted a piecewise function with a join at x=2";
 entry.technique="";
 let v=mathematicalValidityContext(s,entry);
 assert.equal(v.method,"general","Title and result cannot override Other method selection");
 entry.methodId="";
 entry.technique="Consider a piecewise function";
 assert(!methodFamilies(entry).has("piecewise-model"),"Tentative phrase is not verified technique");
 entry.technique="Piecewise function";
 assert(methodFamilies(entry).has("piecewise-model"),"Legacy technique labels can be migrated safely");
 entry.methodId="piecewise-model";
 assert(methodFamilies(entry).has("piecewise-model"));
});

test("no AA HL or piecewise help modifies original writing, links, accuracy or backups",()=>{
 const s=withEntry();
 s.planning.fields.provisionalTitle="My own mathematical title";
 s.completion.fields.mainConclusion="My own conclusion, not a generated judgement";
 s.entries[0].accuracyRefs=["original-accuracy"];
 s.entries[0].sourceRefs=["original-source"];
 s.entries[0].reviewNeeded="yes";
 s.entries[0].reviewReason="Awaiting a source check";
 s.ui.adviceMode="reduced";
 const before=JSON.stringify(s);
 renderAaHlPlanningAdvice(s,{e,icon,reduced:true});
 renderCourseUnderstandingAid(s,s.entries[0],{e,icon,reduced:true});
 renderMathematicalValidityAid(s,s.entries[0],{e,icon,reduced:true});
 assert.equal(JSON.stringify(s),before);
 const restored=normalizeProjectState(structuredClone(s));
 for(const key of ["result","interpretation","limitations","methodId","reviewNeeded","reviewReason"])
  assert.equal(restored.entries[0][key],s.entries[0][key]);
 assert.deepEqual(restored.entries[0].sourceRefs,s.entries[0].sourceRefs);
 assert.deepEqual(restored.entries[0].accuracyRefs,s.entries[0].accuracyRefs);
 assert.equal(restored.completion.fields.mainConclusion,s.completion.fields.mainConclusion);
 assert.equal(restored.planning.fields.provisionalTitle,s.planning.fields.provisionalTitle);
 assert.equal(restored.ui.adviceMode,"reduced");
});
