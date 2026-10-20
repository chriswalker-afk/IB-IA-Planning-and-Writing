import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {C_NODES,C_ROUTES,C_PROMPTS} from "../src/completing/catalog.js";
import {
 C_NODE_IDS,C_MAJOR_STAGES,C_STAGE_STATUS,completionStage,createCompletionState,normalizeCompletionState,
 setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,
 startFirstRepresentation,startNextMathematics,addMathematicalStage,addAccuracyDecision,actualPmccExists,actualScatterExists,
 latestRealResult,sourceResultForNext,observedFeatureForNext,scatterForNext,canViewPmccFollowup,canViewScatterFollowup,
 flagDependentMathematics,acknowledgeMathReview,completionSuggestions,routesAt,completionFlags
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
 assert.equal(s.completion.stages.C10,"needs-review"); // editing a self-completed stage invalidates the earlier check
 place(s,"C10");
 assert.equal(s.completion.stages.C10,"needs-review");
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
 assert.equal(s.project.dataStatus,"theoretical");
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
test("source route to Planning check-in never invents teacher permission",()=>{
 const s=state();place(s,"C03");
 const r=moveCompletionRoute(s,"Return to update planning answers");
 assert.equal(r.ok,true);
 assert.equal(r.targetRoute,"planning");
 assert.equal(s.planning.current,"N06");
 assert.equal(s.teacher.pendingApproval,false);
 assert.equal(s.completion.transitions.at(-1).to,"N06");
});

test("Pearson advice is linked to the actual plot behind that coefficient, not a stale global scatter choice",()=>{
 const s=state();
 s.entries=[
  {id:"plot-1",phase:"first",status:"completed",kind:"scatter",title:"Paired data scatter",technique:"Scatter graph",result:"Graph curves upward",observation:"curved",localTakeaway:"Curved relationship"},
  {id:"pmcc-1",phase:"substantial",fromEntryId:"plot-1",status:"completed",kind:"other",technique:"Pearson PMCC",title:"Linear correlation",result:"r = 0.08",interpretation:"Weak linear association"}
 ];
 s.completion.activeEntryIndex=1;
 place(s,"C35");
 assert.equal(sourceResultForNext(s).id,"pmcc-1");
 assert(canViewPmccFollowup(s));
 assert(canViewScatterFollowup(s));
 assert.equal(scatterForNext(s).id,"plot-1");
 assert.equal(observedFeatureForNext(s),"curved");
 move(s,"Pearson r was ACTUALLY calculated: contextual next-step ideas","C35P");
 assert(completionSuggestions(s).some(([label])=>/nonlinear/i.test(label)));
 // Subsequent unrelated maths does not inherit the earlier correlation or shape.
 s.entries.push({id:"algebra",phase:"substantial",fromEntryId:"pmcc-1",status:"completed",
  kind:"theory",technique:"Algebraic reasoning",title:"A different mathematical result",result:"A separate inequality",observation:"",interpretation:"The expression is positive"});
 place(s,"C04");place(s,"C35");
 assert.equal(sourceResultForNext(s).id,"algebra");
 assert.equal(canViewPmccFollowup(s),false);
 assert.equal(canViewScatterFollowup(s),false);
 assert(!completionSuggestions(s).some(([label])=>/curved function|nonlinear model/i.test(label)));
});
test("Pearson coefficient alone never presumes that the scatter was linear",()=>{
 const s=state();
 s.entries=[{id:"pmcc",phase:"substantial",status:"completed",kind:"other",
   technique:"Pearson product-moment correlation",title:"PMCC",result:"r = 0.7"}];
 place(s,"C35");move(s,"Pearson r was ACTUALLY calculated: contextual next-step ideas","C35P");
 const suggestions=completionSuggestions(s);
 assert(suggestions.some(([label])=>/actual scatter graph/i.test(label)));
 assert(!suggestions.some(([label])=>/regression line/i.test(label)));
});
test("student may explicitly resume a previously interpreted finding rather than blindly using the latest one",()=>{
 const s=state();
 s.entries=[
  {id:"first",phase:"first",status:"completed",kind:"scatter",result:"An actual curved scatter",observation:"curved",localTakeaway:"Curvature"},
  {id:"later",phase:"substantial",fromEntryId:"first",status:"completed",result:"A fitted quadratic",interpretation:"A partial model"}
 ];
 s.completion.activeEntryIndex=0;
 place(s,"C34B");move(s,"Consistent with prediction, or no prediction, or sufficiently explained","C35");
 assert.equal(sourceResultForNext(s).id,"first");
 setCompletionField(s,"nextQuestion","What accounts for the curvature?");
 setCompletionField(s,"nextReason","The original scatter graph bends.");
 move(s,"Begin ANOTHER meaningful mathematical section","C50");
 assert.equal(s.entries.at(-1).fromEntryId,"first");
 // Return to dashboard and resume generally: the most recent actual result is used instead.
 place(s,"C04");place(s,"C35");
 assert.equal(sourceResultForNext(s).id,"later");
});
test("editing an earlier result flags every dependent mathematical section without erasing actual findings",()=>{
 const s=state();
 s.entries=[
  {id:"first",phase:"first",status:"completed",result:"Initial value",interpretation:"Earlier conclusion",localTakeaway:"An upward trend"},
  {id:"second",phase:"substantial",fromEntryId:"first",status:"completed",result:"Regression model",interpretation:"Further interpretation",previousTakeaway:"An upward trend",reviewNeeded:""},
  {id:"third",phase:"substantial",fromEntryId:"second",status:"planned",purpose:"Validate the model",previousTakeaway:"Further interpretation"}
 ];
 s.completion.stages.C40="complete";s.completion.stages.C60="complete";
 const changed=flagDependentMathematics(s,0,"result","Initial value","Recalculated value");
 assert.deepEqual(changed,[1,2]);
 assert.equal(s.entries[0].reviewNeeded,"yes");
 assert.equal(s.entries[1].reviewNeeded,"yes");
 assert.equal(s.entries[2].reviewNeeded,"yes");
 assert.equal(s.entries[1].result,"Regression model");
 assert.equal(s.entries[2].purpose,"Validate the model");
 assert.equal(s.completion.stages.C40,"needs-review");
 assert.equal(s.completion.stages.C60,"needs-review");
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.entries[2].reviewNeeded,"yes");
 assert(acknowledgeMathReview(restored,1));
 assert.equal(restored.entries[1].reviewNeeded,"");
 assert.equal(restored.entries[1].previousTakeaway,"An upward trend");
 assert.equal(restored.entries[2].reviewNeeded,"yes");
});
test("a student self-confirmation does not silently clear pre-existing teacher approval questions",()=>{
 const s=state();
 s.teacher.pendingApproval=true;
 setCompletionField(s,"permissionStatus","confirmed");
 assert.equal(s.teacher.pendingApproval,true);
 assert(completionFlags(s).some(x=>/teacher\/consent concern/i.test(x)));
});

test("first-figure interpretation is tracked under First Exploration; later reflection under Mathematics",()=>{
 const s=state(),scatter=realScatter(s,"linear");
 assert.equal(completionStage("C34",s),"C30");
 move(s,"Observation made; check accuracy where new, then reconnect to aim/prediction","C34B");
 assert.equal(completionStage("C34B",s),"C30");
 assert.equal(s.completion.stages.C30,"working");
 assert.equal(s.completion.stages.C40,"not-started");
 scatter.interpretation="A linear shape appears in the observed data";
 move(s,"Consistent with prediction, or no prediction, or sufficiently explained","C35");
 assert.equal(completionStage("C35",s),"C30");
 setCompletionField(s,"nextQuestion","Would a numerical correlation help?");
 setCompletionField(s,"nextReason","The paired points appear roughly straight.");
 move(s,"Begin FIRST justified mathematical section (or the next appropriate method)","C40");
 assert.equal(completionStage("C40",s),"C40");
 s.entries.at(-1).status="completed";s.entries.at(-1).result="Actual Pearson coefficient";
 move(s,"Actual later mathematical result warrants reinterpretation","C34");
 assert.equal(completionStage("C34",s),"C40");
});

test("general next-step help never introduces Pearson regression for unconfirmed or unpaired observations",()=>{
 const s=state(),first=realScatter(s,"linear");
 first.kind="scatter";s.completion.nextFromEntryId=first.id;
 place(s,"C35H");
 let ideas=completionSuggestions(s).map(x=>x.join(" ")).join(" ");
 assert(!/Pearson's r or a fitted line|Pearson's r address/i.test(ideas));
 setCompletionField(s,"pairedDataType","unpaired");
 ideas=completionSuggestions(s).map(x=>x.join(" ")).join(" ");
 assert(!/Pearson's r or a fitted line|Pearson's r address/i.test(ideas));
 setCompletionField(s,"pairedDataType","paired-numerical");
 ideas=completionSuggestions(s).map(x=>x.join(" ")).join(" ");
 assert(/Pearson/.test(ideas));
});
 
test("inline first-output data stays draft until explicitly confirmed and remains one canonical result",()=>{
 const s=state();place(s,"C30");
 setCompletionField(s,"firstWorkTitle","Quadratic case");
 setCompletionField(s,"firstWorkResult","Maximum y = 3.4 m");
 setCompletionField(s,"firstWorkLocation","Figure 2");
 assert.equal(s.entries.length,1);
 assert.equal(s.entries[0].title,"Quadratic case");
 assert.equal(s.entries[0].result,"Maximum y = 3.4 m");
 assert.equal(s.entries[0].resultRef,"Figure 2");
 assert.equal(latestRealResult(s),null);
 setCompletionField(s,"firstWorkStatus","completed");
 assert.equal(s.entries.length,1);
 assert.equal(latestRealResult(s).result,"Maximum y = 3.4 m");
 setCompletionField(s,"firstWorkResult","Maximum y = 3.2 m");
 assert.equal(s.entries[0].result,"Maximum y = 3.2 m");
 const restored=normalizeProjectState(s);
 assert.equal(restored.entries[0].result,"Maximum y = 3.2 m");
 assert.equal(restored.entries[0].status,"completed");
});
test("revisiting first mathematics retains the first entry, not a later calculation",()=>{
 const s=state();s.entries=[
  {id:"first",phase:"first",status:"completed",result:"Actual scatter"},
  {id:"second",phase:"substantial",status:"planned",result:""}
 ];
 s.completion.activeEntryIndex=1;place(s,"C30");
 assert.equal(s.completion.activeEntryIndex,0);
});

test("a second generated first-stage figure never inherits a previously verified result",()=>{
 const s=state();place(s,"C30");
 setCompletionField(s,"firstWorkTitle","First graph");
 setCompletionField(s,"firstWorkResult","Verified first numerical result");
 setCompletionField(s,"firstWorkLocation","Figure 1");
 setCompletionField(s,"firstWorkStatus","completed");
 s.entries[0].interpretation="The first graph is curved";
 s.completion.fields.firstInterpretation="The first graph is curved";
 assert.equal(s.entries[0].status,"completed");
 const created=startFirstRepresentation(s);
 assert(created.ok);
 assert.equal(s.entries.length,2);
 assert.equal(s.entries[1].status,"planned");
 assert.equal(s.entries[1].result,"");
 assert.equal(s.entries[1].resultRef,"");
 assert.equal(s.entries[1].interpretation,"");
 assert.notEqual(s.entries[1].title,"First graph");
 assert.equal(latestRealResult(s).result,"Verified first numerical result");
});

test("repeatable stages link actual prior results without inventing mathematical evidence",()=>{
 const s=state();place(s,"C30");
 assert.equal(addMathematicalStage(s).ok,false);
 setCompletionField(s,"firstWorkResult","Observed a curved relation");
 assert.equal(addMathematicalStage(s).ok,false);
 setCompletionField(s,"firstWorkStatus","completed");
 s.entries[0].title="Initial observed graph";
 s.entries[0].localTakeaway="The linear model misses the curvature";
 s.completion.fields.nextQuestion="Would a quadratic model improve this fit?";
 s.completion.fields.nextReason="The curvature suggests comparing a quadratic";
 const second=addMathematicalStage(s);
 assert(second.ok);assert.equal(second.stage,2);
 assert.equal(s.entries.length,2);
 assert.equal(s.entries[1].fromEntryId,s.entries[0].id);
 assert.equal(s.entries[1].previousTakeaway,"The linear model misses the curvature");
 assert.equal(s.entries[1].title,"Would a quadratic model improve this fit?");
 assert.equal(s.entries[1].bridge,"The curvature suggests comparing a quadratic");
 assert.equal(s.entries[1].result,"");
 assert.equal(s.entries[1].status,"planned");
 assert.equal(latestRealResult(s).id,s.entries[0].id);
 place(s,"C40");
 assert.equal(addMathematicalStage(s).ok,false,"must not skip an unfinished stage");
 s.entries[1].result="Quadratic has smaller residuals";
 s.entries[1].status="completed";
 s.entries[1].localTakeaway="The quadratic fits better";
 s.entries[1].nextQuestion="Can the quadratic model be optimised?";
 s.entries[1].nextWhy="The vertex identifies a model extremum";
 const third=addMathematicalStage(s);
 assert(third.ok);assert.equal(third.stage,3);
 assert.equal(s.entries[2].fromEntryId,s.entries[1].id);
 assert.equal(s.entries[2].title,"Can the quadratic model be optimised?");
 assert.equal(s.entries[2].bridge,"The vertex identifies a model extremum");
 assert.equal(s.entries[2].status,"planned");
 assert.equal(s.entries[2].result,"");
 place(s,"C50");
 const reloaded=normalizeProjectState(s);
 assert.equal(reloaded.entries.length,3);
 assert.equal(reloaded.entries[2].fromEntryId,s.entries[1].id);
 assert.equal(reloaded.completion.activeEntryIndex,2);
});
test("revisiting an unfinished stage from the first exploration does not duplicate pages",()=>{
 const s=state();place(s,"C30");
 setCompletionField(s,"firstWorkResult","Actual observation");
 setCompletionField(s,"firstWorkStatus","completed");
 assert(addMathematicalStage(s).ok);
 place(s,"C30");
 const resumed=addMathematicalStage(s);
 assert(resumed.ok&&resumed.existing);
 assert.equal(s.entries.length,2);
 assert.equal(s.completion.activeEntryIndex,1);
});
test("conclusion warning and generator return context survive saving and loading",()=>{
 const s=state();
 s.completion.conclusionWarningOpen=true;
 s.completion.editorReturnNode="C50";
 const saved=normalizeProjectState(s);
 assert(saved.completion.conclusionWarningOpen);
 assert.equal(saved.completion.editorReturnNode,"C50");
 const bad=normalizeProjectState({...s,completion:{...s.completion,editorReturnNode:"unknown"}});
 assert.equal(bad.completion.editorReturnNode,"");
});
