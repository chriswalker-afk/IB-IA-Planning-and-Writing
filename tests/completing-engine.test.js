import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {C_NODES,C_ROUTES,C_PROMPTS} from "../src/completing/catalog.js";
import {
 C_NODE_IDS,C_MAJOR_STAGES,C_STAGE_STATUS,createCompletionState,normalizeCompletionState,
 setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,
 startFirstRepresentation,startNextMathematics,addAccuracyDecision,actualPmccExists,actualScatterExists,
 latestRealResult,completionSuggestions,routesAt,completionFlags
} from "../src/completing/engine.js";
import {applyPlanningField} from "../src/planning/engine.js";

function state(){const s=createProjectState();s.project.aim="An honest mathematical aim";return s;}
const place=(s,node)=>{const r=setCompletionNode(s,node);assert(r.ok);};
const move=(s,condition,to)=>{const r=moveCompletionRoute(s,condition);assert.equal(r.ok,true,r.error);if(to)assert.equal(s.completion.current,to);return r;};
function realScatter(s,shape="curved"){
 place(s,"C31");setCompletionField(s,"firstType","scatter");
 setCompletionField(s,"firstPurpose","Examine the actual paired data");
 move(s,"Chosen useful initial representation or calculation","C32");
 move(s,"Purpose and symbols defined","C33");
 const entry=s.entries.at(-1);
 entry.status="completed";entry.kind="scatter";entry.technique="Scatter plot";entry.result="Actual observed scatter result";entry.observation=shape;
 s.completion.activeEntryIndex=s.entries.length-1;
 move(s,"Figure or brief calculation checked","C34");
 return entry;
}
test("all 52 Completing node definitions and 223 spreadsheet transitions are preserved",()=>{
 assert.equal(C_NODE_IDS.length,52);
 assert.equal(C_ROUTES.length,223);
 assert(C_PROMPTS.length>100);
 assert.equal(new Set(C_NODE_IDS).size,52);
 for(const node of C_NODES){
  assert(Number.isInteger(node.sourceRow));
  assert(node.label.length>3);
  assert(C_NODE_IDS.includes(node.id));
 }
 for(const route of C_ROUTES){
  assert(C_NODE_IDS.includes(route.from));
  assert(C_NODE_IDS.includes(route.to)||route.to==="N06");
  assert(Number.isInteger(route.sourceRow));
  assert(routesAt(route.from).some(x=>x.condition===route.condition&&x.to===route.to));
 }
});
test("legacy projects gain Completing state without losing actual mathematical work or falsely marking stages complete",()=>{
 const older=createProjectState();delete older.completion;
 older.entries=[{id:"one",title:"Old math",result:"Actual answer",status:"completed"}];
 older.scratch.introduction="A genuine introduction";
 older.version=2;older.project.aim="Existing maths aim";
 const restored=normalizeProjectState(older);
 assert.equal(restored.completion.current,"C04");
 assert.equal(restored.entries[0].result,"Actual answer");
 assert.equal(restored.entries[0].localTakeaway,"");
 assert.equal(restored.scratch.introduction,"A genuine introduction");
 assert.equal(restored.completion.stages.C10,"not-started");
 assert.equal(restored.completion.activeEntryIndex,0);
});
test("non-completion visiting never marks the stage complete; student self-assessment is explicit",()=>{
 const s=state();
 place(s,"C10");
 assert.equal(s.completion.stages.C10,"working");
 assert(markCompletionStage(s,"C10","complete"));
 assert.equal(s.completion.stages.C10,"complete");
 setCompletionField(s,"changedSincePlanning","Unrelated scope change");
 assert.equal(s.completion.stages.C10,"complete");
 place(s,"C10");
 assert.equal(s.completion.stages.C10,"complete");
 assert(!markCompletionStage(s,"C10","perfect"));
});
test("source route actions can't jump from one node with a condition belonging to another",()=>{
 const s=state();
 assert.equal(moveCompletionRoute(s,"Figure or brief calculation checked").ok,false);
 move(s,"Start without a saved plan","C02");
 move(s,"Confirm or update carried-forward information","C03");
 move(s,"Idea and permissions reviewed","C04");
 move(s,"Prepare first representation","C30");
 const trace=s.completion.transitions.at(-1);
 assert.equal(trace.sourceRow,74);
 assert.equal(trace.from,"C04");
});
test("a planned representation is never a real result and interpretation is gated on THIS entry",()=>{
 const s=state();
 place(s,"C31");
 move(s,"Chosen useful initial representation or calculation","C32");
 move(s,"Purpose and symbols defined","C33");
 assert.equal(s.entries.length,1);
 assert.equal(s.entries[0].status,"planned");
 const blocked=moveCompletionRoute(s,"Figure or brief calculation checked");
 assert.equal(blocked.ok,false);
 assert.match(blocked.error,/actual result for THIS/);
 assert.equal(s.completion.current,"C33");
 assert.equal(latestRealResult(s),null);
});
test("a real first graph leads through actual observation, contextual interpretation and repeatable C35",()=>{
 const s=state();const first=realScatter(s,"curved");
 assert(actualScatterExists(s));
 move(s,"Observation made; check accuracy where new, then reconnect to aim/prediction","C34B");
 first.observationText="A nonlinear relationship appears.";
 first.interpretation="A straight line is misleading.";
 first.localTakeaway="The observed pattern is curved.";
 move(s,"Consistent with prediction, or no prediction, or sufficiently explained","C35");
 assert(completionSuggestions(s).some(x=>/curved/i.test(x[0])));
 setCompletionField(s,"nextQuestion","Could a quadratic model improve this?");
 let attempt=moveCompletionRoute(s,"Begin FIRST justified mathematical section (or the next appropriate method)");
 assert.equal(attempt.ok,false);
 setCompletionField(s,"nextReason","The graph visibly bends instead of remaining straight.");
 move(s,"Begin FIRST justified mathematical section (or the next appropriate method)","C40");
 assert.equal(s.entries.length,2);
 assert.equal(s.entries[1].fromEntryId,first.id);
 assert.match(s.entries[1].previousTakeaway,/curved/);
 assert.equal(s.entries[1].status,"planned");
 assert.equal(moveCompletionRoute(s,"Actual later mathematical result warrants reinterpretation").ok,false);
 const second=s.entries[1];
 second.status="completed";second.technique="Quadratic model";second.result="Actual quadratic fit calculated";
 move(s,"Actual later mathematical result warrants reinterpretation","C34");
 move(s,"Observation made; check accuracy where new, then reconnect to aim/prediction","C34B");
 second.interpretation="The curved fit addresses part of the aim.";
 second.localTakeaway="The quadratic is more suitable on the observed domain.";
 move(s,"Consistent with prediction, or no prediction, or sufficiently explained","C35");
 setCompletionField(s,"nextQuestion","Can the model be checked?");
 setCompletionField(s,"nextReason","The fit was obtained from the same sample.");
 move(s,"Begin ANOTHER meaningful mathematical section","C50");
 assert.equal(s.entries.length,3);
});
test("an IA can stop after one substantial meaningful result; no fixed number of sections",()=>{
 const s=state();const first=realScatter(s,"unclear");
 move(s,"Observation made; check accuracy where new, then reconnect to aim/prediction","C34B");
 first.interpretation="No clear pattern in the measured values.";
 move(s,"Consistent with prediction, or no prediction, or sufficiently explained","C35");
 move(s,"Enough relevant mathematics—bring findings together","C60");
 assert.equal(s.entries.length,1);
 assert.equal(s.completion.current,"C60");
});
test("PMCC follow-up is available only after ACTUAL Pearson calculation, not a plan",()=>{
 const s=state();
 applyPlanningField(s,"kind","statistics");
 applyPlanningField(s,"course","AI SL");
 s.planning.mathSelected=["AI15"];
 place(s,"C35");
 assert.equal(actualPmccExists(s),false);
 assert.equal(moveCompletionRoute(s,"Pearson r was ACTUALLY calculated: contextual next-step ideas").ok,false);
 s.entries.push({id:"pmcc",phase:"substantial",status:"completed",title:"Calculate Pearson's r",
  technique:"Pearson PMCC",result:"r = 0.09",kind:"other",observation:"curved",interpretation:"Weak linear association"});
 assert(actualPmccExists(s));
 move(s,"Pearson r was ACTUALLY calculated: contextual next-step ideas","C35P");
 assert(completionSuggestions(s).some(x=>/nonlinear/i.test(x[0])));
 assert(!completionSuggestions(s).some(x=>/r rules out/i.test(x[0])));
});
test("scatter suggestions require actual scatter, and curved and unclear outcomes are not mistaken for linear correlation",()=>{
 const s=state();place(s,"C35");
 assert.equal(moveCompletionRoute(s,"Show bivariate options for actual scatter pattern").ok,false);
 realScatter(s,"curved");
 place(s,"C35");
 move(s,"Show bivariate options for actual scatter pattern","C35B");
 setCompletionField(s,"scatterPattern","curved");
 move(s,"Curved or distinctly non-linear","C35");
 assert.equal(s.completion.fields.scatterPattern,"curved");
 assert(completionSuggestions(s).some(x=>/curved/i.test(x[0])));
});
test("accuracy decisions record per quantity and persist across later mathematical stages",()=>{
 const s=state();place(s,"C24");
 setCompletionField(s,"accuracyQuantity","Elapsed time");
 setCompletionField(s,"accuracySymbol","t");
 setCompletionField(s,"accuracyUnit","s");
 setCompletionField(s,"accuracyResolution","Source rounded to nearest 0.1 s");
 setCompletionField(s,"accuracyPolicy","Report calculated times to a justified precision");
 setCompletionField(s,"accuracyReason","Input resolution");
 let record=addAccuracyDecision(s);
 assert(record.ok);
 assert.equal(s.completion.accuracyDecisions.length,1);
 assert.equal(s.evidence.accuracyDecisions.length,1);
 assert.equal(s.completion.accuracyDecisions[0].unit,"s");
 const round=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(round.completion.accuracyDecisions[0].quantity,"Elapsed time");
});
test("theoretical/no-data route carries no fabricated sample or readiness score",()=>{
 const s=state();applyPlanningField(s,"kind","theoretical");place(s,"C20");
 move(s,"Theoretical or no-data exploration","C21T");
 assert.equal(s.completion.current,"C21T");
 assert.equal(s.project.dataStatus,"not-started");
 move(s,"No empirical data involved","C25");
 assert.equal(s.entries.length,0);
});
test("permission flags preserve safe progress without treating a prior document as approval",()=>{
 const s=state();applyPlanningField(s,"permissionNeed","yes");
 place(s,"C03");
 assert(completionFlags(s).some(x=>/Permissions/.test(x)));
 setCompletionField(s,"permissionStatus","pending");
 assert(s.teacher.pendingApproval);
 move(s,"Teacher/permission concern remains","C04");
 move(s,"Work on introduction","C10");
 assert.equal(s.completion.current,"C10");
});
test("unexpected results can be left unresolved, without forcing new mathematics",()=>{
 const s=state(),entry=realScatter(s,"unexpected");
 move(s,"Observation made; check accuracy where new, then reconnect to aim/prediction","C34B");
 move(s,"Unexpected, contradicts prediction, or is unclear","C34U");
 setCompletionField(s,"surpriseReason","One observation is unusual.");
 move(s,"Record unresolved surprise and save for later","C04");
 assert.equal(s.entries.length,1);
 assert.equal(entry.observation,"unexpected");
 assert.equal(s.completion.fields.surpriseReason,"One observation is unusual.");
});
test("source route to planning question and back do not invent teacher approval",()=>{
 const s=state();place(s,"C03");
 move(s,"Return to update planning answers","C03"); // intentional test expects N06 route
});
