import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {renderConclusionValidityAid} from "../src/completing/mathematical-validity.js";
import {renderConclusionReasoningThread,mathematicalReasoningThread,renderPriorDecisionLink} from "../src/completing/reasoning-thread.js";
import {renderConclusionWorkspace} from "../src/completing/conclusion-workspace.js";
import {featuredSparkItems,insightToolkit} from "../src/ui/insight-threads.js";
import {renderStudioWritingStage} from "../src/completing/studio-writing-stages.js";
import {escapeHtml as e,icon} from "../src/ui/primitives.js";
const journeys=[
 ["relationships","pmcc","r = 0.35 in the sample","Association is weak; not evidence of causality","Would fitting be justified?"],
 ["fitted-models","linear-regression","Residuals curve over observed x values","The straight line has structured errors","Would a curved fit improve residual behaviour?"],
 ["optimisation","optimisation","The stationary candidate is x=4","Endpoints still need comparison","What is the feasible maximum?"],
 ["proof","proof","The formula holds for n = 1,2,3","Examples do not prove every n","Could induction establish all natural numbers?"],
 ["chance","binomial","P(X = 3) was calculated under independence","The assumption has not been justified","Is independence plausible?"],
 ["triangulation","triangulation","A distance was derived from measured angles","Precision is limited by the angular readings","How sensitive is the value to angle errors?"]
];
const renderConclusion=s=>renderConclusionWorkspace({state:s,e,icon,
 field:(p)=>'<textarea data-bind="'+e(p)+'"></textarea>',
 F:(p)=>'<textarea data-bind="completion.fields.'+e(p)+'"></textarea>',
 criterionMarkedWritingBox:x=>x,criteriaField:x=>x,
 currentAim:()=>s.planning.fields.aim,plannedPrediction:()=>s.planning.fields.prediction,
 currentBenefit:()=>"",savedLimitations:()=>""});
for(const [route,method,result,interpretation,question] of journeys){
 test("end-to-end IA reasoning journey: "+route,()=>{
  const s=createProjectState();
  s.route="completing";s.planning.routeExplorer.selectedRoute=route;
  s.planning.fields.aim="What can the observed mathematics establish?";
  s.planning.fields.course="AA SL";
  s.planning.fields.prediction="The first result will settle the aim";
  s.entries=[{id:"observed",phase:"first",status:"completed",methodId:method,
   title:"Real mathematics",result,interpretation,nextQuestion:question,
   nextWhy:"This unresolved condition changes the mathematical answer.",
   sourceRefs:[],accuracyRefs:[]}];
  const before=JSON.stringify(s);
  const t=mathematicalReasoningThread(s,s.entries[0]);
  assert.equal(t.question,question);
  assert.equal(t.finding,interpretation);
  assert.equal(t.status,"linked");
  assert(t.check.length>12);
  const spark=featuredSparkItems(s,"C35");
  assert(spark.some(x=>x.id==="result:observed"));
  const full=insightToolkit(s);
  assert(full.includes('data-toolkit-spark-id="result:observed"'));
  assert(full.includes('data-toolkit-spark-id="direction:observed"'));
  for(const reduced of [false,true]){
   s.ui.adviceMode=reduced?"reduced":"guided";
   const view=renderStudioWritingStage(s,"C30",{e,icon,taskHtml:"<textarea></textarea>",reduced});
   assert(view.includes("data-advice-mode="));
   assert(view.includes("data-spark-shelf="));
   const conclusion=renderConclusion(s);
   assert(conclusion.includes("What is your best-supported mathematical answer?"));
   assert(conclusion.includes("Your mathematical findings"));
  }
  const loaded=normalizeProjectState(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.entries[0].result,result);
  assert.equal(loaded.entries[0].nextQuestion,question);
  assert.equal(JSON.parse(before).entries[0].result,result);
 });
}
test("selected stale results never substitute unrelated mathematical guidance",()=>{
 const s=createProjectState();s.planning.fields.aim="Which model is defensible?";
 s.entries=[
  {id:"chosen",status:"completed",phase:"first",methodId:"linear-regression",result:"Residuals curve",reviewNeeded:"yes",nextQuestion:"Check model assumptions"},
  {id:"unrelated",status:"completed",phase:"substantial",methodId:"proof",result:"A separate theorem",nextQuestion:"Extend domain"}
 ];
 s.completion.conclusionResultIds=["chosen"];
 const validity=renderConclusionValidityAid(s,{e,icon});
 const reasoning=renderConclusionReasoningThread(s,{e,icon});
 assert(validity.includes("No other result has been substituted"));
 assert(!validity.includes('data-validity-result="unrelated"'));
 assert(reasoning.includes('data-conclusion-reasoning="pending"'));
 assert(!reasoning.includes("A separate theorem"));
 const conclusion=renderConclusion(s);
 assert(!conclusion.includes("Questions suggested by your real findings"));
 assert(!conclusion.includes("a separate theorem"));
 assert(!featuredSparkItems(s,"C60").some(x=>x.id==="result:unrelated"));
 s.entries[0].reviewNeeded="";
 assert(renderConclusionValidityAid(s,{e,icon}).includes('data-validity-result="chosen"'));
 assert(!renderConclusionValidityAid(s,{e,icon}).includes('data-validity-result="unrelated"'));
});
test("a selected inconclusive result is a defensible end point, not a forced extra method",()=>{
 const s=createProjectState();s.planning.fields.aim="Can the evidence support the prediction?";
 s.entries=[{id:"inconclusive",phase:"first",status:"completed",methodId:"two-sample-t",
  result:"The test did not reject the null hypothesis",interpretation:"Evidence was insufficient to establish a difference",
  nextQuestion:"Could a larger representative sample improve power?",
  nextWhy:"The current sample limits inference"}];
 s.completion.conclusionResultIds=["inconclusive"];
 const a=renderConclusionValidityAid(s,{e,icon,reduced:true});
 const b=renderConclusionReasoningThread(s,{e,icon,reduced:true});
 assert(a.includes("nonsignificant result does not prove equal means"));
 assert(b.includes("optional future extension"));
 assert(!a.includes("<details open"));
 assert(!b.includes("<details open"));
});
