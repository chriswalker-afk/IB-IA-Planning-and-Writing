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
test("all 61 source-sheet routes are preserved alongside explicit later UX routes",()=>{
 assert.equal(PLANNING_NODE_IDS.length,34);
 const source=PLANNING_ROUTES.filter(r=>Number.isInteger(r.sourceRow));
 const extra=PLANNING_ROUTES.filter(r=>r.sourceRow===null);
 assert.equal(source.length,61);
 assert.equal(extra.length,17);
 for(const route of PLANNING_ROUTES){
  assert(PLANNING_NODE_IDS.includes(route.from));
  if(route.to.startsWith("N"))assert(PLANNING_NODE_IDS.includes(route.to));
  assert(Number.isInteger(route.sourceRow)||route.sourceRow===null);
 }
 assert(extra.every(r=>/UX 2026/.test(r.editorial)));
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
 const s=newPlan();set(s,"kind","statistics");set(s,"dataSource","both");
 s.planning.current="N03";
 advance(s,"N03B");
 advance(s,"N03P");
 assert.equal(planAutoAdvance(s).ok,false);
 set(s,"primaryWhat","Reaction times and group categories");
 advance(s,"N03P2");
 assert.equal(planAutoAdvance(s).ok,false);
 set(s,"primarySamplingMethod","unsure");
 assert.equal(planAutoAdvance(s).ok,false);
 set(s,"primaryStatus","unsure");
 advance(s,"N03B");
 assert.equal(s.planning.sourceBranches.primary,true);
 assert.equal(s.planning.sourceBranches.secondary,false);
 assert.equal(planningMove(s,"Both data sources complete").ok,false);
 advance(s,"N03S");
 set(s,"secondaryStatus","ready");
 advance(s,"N03D");
 assert.equal(s.planning.sourceBranches.secondary,true);
 assert.equal(s.planning.fields.secondaryStatus,"ready");
 assert.equal(s.journey.history.at(-1).sourceRow,null); // shortcut is editorial, legacy sheet edge is still preserved
});
test("primary-only and secondary-only branches reach the join without false data completion",()=>{
 for(const [source,id,statusKey] of [["primary","N03P","primaryStatus"],["secondary","N03S","secondaryStatus"]]){
  const s=newPlan();s.planning.current="N03";set(s,"dataSource",source);
  advance(s,id);
  if(source==="primary"){
   set(s,"primaryWhat","A short planned measurement");
   advance(s,"N03P2");set(s,"primarySamplingMethod","unsure");
  }
  set(s,statusKey,"unsure");advance(s,"N03D");
  assert.equal(s.evidence.sources.length,0);
 }
});
test("no-data exploration can request teacher advice, obtain a provisional summary and never fake approval",()=>{
 const s=newPlan();set(s,"ideaStatus","yes");advance(s,"N01");advance(s,"N01V");
 set(s,"beneficiaryType","unsure");advance(s,"N02");
 set(s,"kind","theoretical");advance(s,"N02M");
 set(s,"course","AA SL");assert(!planningFlags(s).some(f=>f.id==="other-course"));
 advance(s,"N02T");advance(s,"N08");
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
 s.planning.current="N03D";
 const r=planningMove(s,"Safety / privacy / consent unresolved");
 assert.equal(r.ok,true);assert.equal(s.planning.current,"N02T");
 advance(s,"N08");advance(s,"N06T");advance(s,"N06");advance(s,"N07");
 assert.equal(s.teacher.pendingApproval,true);
 set(s,"permissionNeed","no");assert.equal(s.teacher.pendingApproval,false);
});
test("single evidence checkpoint replaces readiness and manageability with explicit consent and access",()=>{
 const s=newPlan();
 set(s,"kind","statistics");set(s,"dataSource","primary");
 s.planning.current="N03P";
 set(s,"primaryHow","Measure each item carefully");
 advance(s,"N03P2");
 set(s,"primarySamplingMethod","convenience");set(s,"primaryStatus","unsure");
 advance(s,"N03D");
 assert(!planAutoAdvance(s).ok); // Don't assume actual evidence access without a decision.
 set(s,"dataAvailability","soon");
 assert(!planAutoAdvance(s).ok); // Unanswered consent is never interpreted as consent.
 set(s,"permissionNeed","no");
 assert(!planAutoAdvance(s).ok); // Nor is missing resource access tacitly cleared.
 set(s,"practicalBlocker","no");
 advance(s,"N03H");
 assert(s.planning.completedNodes.includes("N03D"));
 for(const id of ["N03J","N03F","N03E","N03G"]){
  assert(!s.planning.completedNodes.includes(id));
  assert(!s.planning.visited.includes(id));
 }
 assert(!planningFlags(s).some(x=>x.id==="permission"||x.id==="practical-access"));
});
test("uncertain consent and access permit provisional planning but retain teacher warnings",()=>{
 const s=newPlan();s.planning.current="N03D";
 set(s,"dataAvailability","unsure");
 set(s,"permissionNeed","unsure");set(s,"practicalBlocker","yes");
 assert(planningFlags(s).some(x=>x.id==="permission"&&x.needsApproval));
 assert(planningFlags(s).some(x=>x.id==="practical-access"));
 assert(planAutoAdvance(s).ok);
 assert.equal(s.planning.current,"N03H");
 assert.equal(s.teacher.pendingApproval,true);
 set(s,"dataReadiness","1");set(s,"practicalEase","1");
 assert(!planningFlags(s).some(x=>x.id==="readiness"||x.id==="practical"));
});
test("historical method and feasibility answers survive moving old checkpoints",()=>{
 const legacy=newPlan();
 Object.assign(legacy.planning.fields,{
  methodReason:"Compare measurements in the relevant population",
  methodLimitation:"Only one local class is accessible",
  methodMitigation:"Avoid generalising beyond the class",
  dependencies:"Teacher equipment cupboard",
  unsecured:"Need to borrow the school's tape measure",
  permissionNeed:"yes",
  permissionDetails:"Teacher must confirm survey approval",
  sourceRights:"unsure",
  workloadHours:"4"
 });
 legacy.planning.current="N03J";
 legacy.planning.history=["N03P2","N03J","N03E","N03F","N03G"];
 legacy.planning.completedNodes=["N03J","N03E","N03F","N03G","N03P2"];
 let restored=normalizeProjectState(JSON.parse(JSON.stringify(legacy)));
 assert.equal(restored.planning.current,"N03D");
 assert.deepEqual(restored.planning.history,["N03P2"]);
 assert.equal(restored.planning.fields.methodReason,legacy.planning.fields.methodReason);
 assert.equal(restored.planning.fields.methodLimitation,legacy.planning.fields.methodLimitation);
 assert.equal(restored.planning.fields.unsecured,legacy.planning.fields.unsecured);
 assert.equal(restored.planning.fields.practicalBlocker,"yes");
 assert.equal(restored.planning.fields.permissionNeed,"yes");
 assert(!restored.planning.completedNodes.includes("N03J"));
 assert(!restored.planning.completedNodes.includes("N03F"));
 legacy.planning.current="N03F";
 restored=normalizeProjectState(JSON.parse(JSON.stringify(legacy)));
 assert.equal(restored.planning.current,"N03D");
 assert.equal(restored.planning.fields.permissionDetails,"Teacher must confirm survey approval");
 for(const previous of ["N03E","N03G"]){legacy.planning.current=previous;assert.equal(normalizeProjectState(JSON.parse(JSON.stringify(legacy))).planning.current,"N03D");}
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

test('motivation has one meaningful response; uncertain students can continue honestly',()=>{
 const s=newPlan();s.planning.current='N01V';
 set(s,'beneficiaryType','me');
 const blank=planAutoAdvance(s);
 assert.equal(blank.ok,false);
 assert.match(blank.error,/motivation/i);
 set(s,'beneficiary','I want to understand how my chosen comparison could help me make a decision.');
 assert(planAutoAdvance(s).ok);
 assert.equal(s.planning.current,'N02');
 assert.equal(s.project.beneficiary,s.planning.fields.beneficiary);
 const unsure=newPlan();unsure.planning.current='N01V';
 set(unsure,'beneficiaryType','unsure');
 assert(planAutoAdvance(unsure).ok);
 assert.equal(unsure.planning.current,'N02');
});
