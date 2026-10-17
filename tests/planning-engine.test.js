import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {
 PLANNING_NODE_IDS,createPlanningState,normalizePlanningState,applyPlanningField,planningMove,
 planAutoAdvance,planningBack,planningEdit,toggleMath,selectedMaths,
 planningFlags,syncPlanningToProject,relevantPredictionOptions,predictionMathSuggestions,
 planningSourceRouteCovered
} from "../src/planning/engine.js";
import {PLANNING_ROUTES} from "../src/planning/route-table.js";
import {PLANNING_CATALOG} from "../src/planning/catalog.js";

function newPlan(){
 const s=createProjectState();
 assert.equal(s.planning.current,"N00");
 return s;
}
function set(s,key,val){assert.equal(applyPlanningField(s,key,val),true)}
function advance(s,id){const r=planAutoAdvance(s);assert.equal(r.ok,true,r.error||"");if(id)assert.equal(s.planning.current,id);return r}
test("all 32 Planning nodes and all 61 source-defined routes are preserved",()=>{
 assert.equal(PLANNING_NODE_IDS.length,32);
 assert.equal(PLANNING_ROUTES.length,61);
 for(const route of PLANNING_ROUTES){
   assert(PLANNING_NODE_IDS.includes(route.from));
   if(route.to.startsWith("N"))assert(PLANNING_NODE_IDS.includes(route.to));
   assert(Number.isInteger(route.sourceRow));
 }
});
test("all course maths options are source-specific and editable independently of technique completion",()=>{
 assert.equal(PLANNING_CATALOG.math.length,51);
 assert.equal(PLANNING_CATALOG.math.filter(x=>x.course==="AI SL").length,26);
 assert.equal(PLANNING_CATALOG.math.filter(x=>x.course==="AA SL").length,25);
 const s=newPlan();set(s,"course","AI SL");
 assert.equal(toggleMath(s,"AI14"),true);
 assert.equal(toggleMath(s,"AA15"),false);
 assert.equal(s.planning.mathSelected.length,1);
 assert.equal(s.evidence.results.length,0);
 assert(s.project.mathsCustom.includes("Scatter plots"));
 assert.equal(toggleMath(s,"AI14"),true);
 assert.equal(s.planning.mathSelected.length,0);
});
test("prediction nudge options respect statistical data context and course suggestions are optional",()=>{
 const s=newPlan();set(s,"kind","statistics");set(s,"statisticsContext","Paired numerical");
 set(s,"course","AI SL");
 assert.deepEqual(relevantPredictionOptions(s).filter(x=>x.route==="Statistics").map(x=>x.id),["S01","S02","S03","S04"]);
 set(s,"predictionId","S01");
 assert.equal(s.planning.fields.predictionId,"S01");
 assert.equal(s.planning.fields.prediction,""); // A source nudge must not be copied into the student answer.
 assert(predictionMathSuggestions(s).some(x=>x.id==="AI14"));
 assert.deepEqual(s.planning.mathSelected,[]);
 assert.equal(s.evidence.results.length,0);
 set(s,"kind","theoretical");
 assert(!relevantPredictionOptions(s).some(x=>x.id==="S01"));
 assert(relevantPredictionOptions(s).some(x=>x.id==="T01"));
});
test("combined primary+secondary plans cannot bypass either question set",()=>{
 const s=newPlan();set(s,"dataSource","both");
 s.planning.current="N03";
 advance(s,"N03B");
 advance(s,"N03P");
 assert.equal(planAutoAdvance(s).ok,false);
 set(s,"primaryStatus","unsure");
 advance(s,"N03B");
 assert.equal(s.planning.sourceBranches.primary,true);
 assert.equal(s.planning.sourceBranches.secondary,false);
 assert.equal(planningMove(s,"Both data sources complete").ok,false);
 advance(s,"N03S");
 set(s,"secondaryStatus","ready");
 advance(s,"N03J");
 assert.equal(s.planning.sourceBranches.secondary,true);
 assert.equal(s.planning.fields.secondaryStatus,"ready");
 assert.equal(s.journey.history.at(-1).sourceRow,20);
});
test("primary-only and secondary-only branches reach the join without false data completion",()=>{
 for(const [source,id,statusKey] of [["primary","N03P","primaryStatus"],["secondary","N03S","secondaryStatus"]]){
  const s=newPlan();s.planning.current="N03";set(s,"dataSource",source);
  advance(s,id);
  set(s,statusKey,"unsure");advance(s,"N03J");
  assert.equal(s.evidence.sources.length,0);
 }
});
test("no-data exploration can request teacher advice, obtain a provisional summary and never fake approval",()=>{
 const s=newPlan();set(s,"ideaStatus","yes");advance(s,"N01");advance(s,"N01V");
 set(s,"beneficiaryType","unsure");advance(s,"N02");
 set(s,"kind","theoretical");advance(s,"N02T");advance(s,"N08");
 assert(planningFlags(s).some(f=>f.id==="theoretical"));
 advance(s,"N06T");advance(s,"N06");advance(s,"N07");
 assert(s.planning.completed);
 assert.equal(s.teacher.pendingApproval,false);
 assert.equal(s.evidence.results.length,0);
});
test("permission concerns flag only restricted activities; report remains accessible",()=>{
 const s=newPlan();
 set(s,"permissionNeed","yes");
 assert(planningFlags(s).some(f=>f.id==="permission"&&f.needsApproval));
 assert.equal(s.teacher.pendingApproval,true);
 s.planning.current="N03F";
 const r=planningMove(s,"Safety / privacy / consent unresolved");
 assert.equal(r.ok,true);assert.equal(s.planning.current,"N02T");
 advance(s,"N08");advance(s,"N06T");advance(s,"N06");advance(s,"N07");
 assert.equal(s.teacher.pendingApproval,true);
 set(s,"permissionNeed","no");assert.equal(s.teacher.pendingApproval,false);
});
test("optional idea comparison retains selected idea and can be skipped entirely",()=>{
 const s=newPlan();
 set(s,"idea","Original question");set(s,"ideaStatus","unsure");
 advance(s,"N00C");
 set(s,"otherIdea1","Alternative question");
 set(s,"ideaSelected","other1");
 advance(s,"N01");assert.equal(s.project.idea,"Alternative question");
});
test("beneficiary edits during prediction return without discarding maths or prediction",()=>{
 const s=newPlan();
 set(s,"course","AI SL");toggleMath(s,"AI15");
 set(s,"prediction","Might be curved.");
 s.planning.current="N01P";
 const r=planningMove(s,"Edit 'Who is this for?' while predicting");
 assert(r.ok);assert.equal(s.planning.current,"N01V");
 set(s,"beneficiaryType","others");set(s,"beneficiary","The sports team");
 advance(s,"N01P");
 assert.equal(s.planning.mathSelected[0],"AI15");
 assert.equal(s.project.prediction,"Might be curved.");
});
test("unsupported course requires teacher checkpoint, not a fabricated SL syllabus assessment",()=>{
 const s=newPlan();s.planning.current="N04";
 set(s,"course","AA HL");advance(s,"N04T");advance(s,"N08");
 assert(planningFlags(s).some(f=>f.id==="other-course"));
 assert.equal(selectedMaths(s).length,0);
 advance(s,"N06T");advance(s,"N06");advance(s,"N07");
 assert(s.planning.completed);
});
test("maths suitability stage remains provisional and can link to specialist support",()=>{
 const s=newPlan();s.planning.current="N04M";
 set(s,"mathsOutside","outside");
 const r=planningMove(s,"Outside-course maths or unclear mathematical depth");
 assert.equal(r.ok,true);assert.equal(s.planning.current,"N08");
 assert.equal(s.teacher.pendingApproval,false);
 assert(planningFlags(s).some(f=>f.id==="outside-maths"));
});
test("editing visited stages and back navigation retain the investigation record",()=>{
 const s=newPlan();set(s,"ideaStatus","yes");advance(s,"N01");
 set(s,"aim","How does something vary?");
 advance(s,"N01V");
 assert.equal(planningBack(s).ok,true);
 assert.equal(s.planning.current,"N01");
 assert.equal(planningEdit(s,"N04S").ok,true);
 assert.equal(s.project.aim,"How does something vary?");
 assert.equal(s.evidence.results.length,0);
});
test("older Phase 1 backup migrates safely and preserves prior plans for re-editing",()=>{
 const p=createProjectState();p.planning.current="N01";set(p,"aim","Mathematical question");
 const saved=JSON.parse(JSON.stringify(p));
 const restored=normalizeProjectState(saved);
 assert.equal(restored.planning.current,"N01");
 assert.equal(restored.planning.fields.aim,"Mathematical question");
 const older={version:2,project:{aim:"Original maths question",dataSource:"primary"},journey:{currentNodeId:"N03"},ui:{planStep:4,planMax:7}};
 const n=normalizeProjectState(older);
 assert.equal(n.planning.current,"N03");
 assert.equal(n.planning.fields.aim,"Original maths question");
});
test("catalog matches the relevant source references for all prompt groups",()=>{
 for(const group of ["math","predictions","feasibility","teacher","prompts"]){
  assert(PLANNING_CATALOG[group].every(r=>typeof r.sourceRow==="number"));
  assert(PLANNING_CATALOG[group].every(r=>typeof r.id==="string"));
 }
 const ids=new Set(PLANNING_CATALOG.math.map(m=>m.id));
 assert.equal(ids.size,51);
 assert.equal(planningSourceRouteCovered(newPlan(),"N03B","N03J"),true);
});

test("a provisional title is retained and its revision affects writing stages, not finished calculations",()=>{
 const s=newPlan();
 s.planning.current="N01";
 assert(set(s,"provisionalTitle","How well does a model describe my observations?")!==false);
 assert.equal(s.planning.fields.provisionalTitle,"How well does a model describe my observations?");
 s.completion.stages.C10="complete";s.completion.stages.C40="complete";s.completion.stages.C60="complete";
 s.entries=[{id:"math1",status:"completed",result:"A genuine observation"}];
 set(s,"provisionalTitle","Which model better describes my observations?");
 assert.equal(s.completion.stages.C10,"needs-review");
 assert.equal(s.completion.stages.C60,"needs-review");
 assert.equal(s.completion.stages.C40,"complete");
 assert.equal(s.entries[0].result,"A genuine observation");
});
