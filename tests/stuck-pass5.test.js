import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {PLANNING_NODE_IDS} from "../src/planning/engine.js";
import {C_NODE_IDS} from "../src/completing/engine.js";
import {reviewChecksFor} from "../src/completing/review.js";
import {isRevisedAssessment} from "../src/essentials/assessment-cohorts.js";
import {PLANNING_RECOVERY_SPOTS,planningHelpFor} from "../src/help/planning-help.js";
import {STUDIO_RECOVERY_SPOTS,studioHelpFor} from "../src/help/studio-help.js";
import {CHECKING_RECOVERY_SPOTS,checkingHelpFor} from "../src/help/checking-help.js";
import {
 availableHubIssues,suggestedHubIssues,hubFilteredIssues,hubIssueFor,hubOriginalView
} from "../src/help/hub-issues.js";
import {captureStuckOrigin} from "../src/help/stuck-state.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {REPRESENTATION_TOOLS} from "../src/diagrams/representation-registry.js";
import {journeyOutcomeOptions} from "../src/completing/adaptive-journey.js";
import {createStuckViews} from "../src/help/stuck-views.js";
const escapeHtml=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
function state(route="completing",node="C30",real=false){
 const s=createProjectState();s.route=route;
 s.completion.current=node.startsWith("C")?node:"C04";
 s.planning.current=node.startsWith("N")?node:"N01";
 s.ui.checkingMode="draft";s.ui.adviceMode="reduced";
 s.planning.fields.aim="Does a real sample reveal a mathematical structure?";
 s.planning.fields.course="AA SL";
 s.planning.routeExplorer.selectedRoute="growth";
 s.entries=[{id:"first",phase:"first",title:"First calculation",status:real?"completed":"planned",
   result:real?"An actual sequence of computed values":"",
   journeyOutcome:"",kind:"",methodId:"",accuracyRefs:[]}];
 s.completion.activeEntryIndex=0;
 captureStuckOrigin(s);
 return s;
}
const visibleChecks=(s,mode)=>reviewChecksFor(s,mode).map(x=>x.id)
 .filter(id=>!isRevisedAssessment(s)||!["D02","D03","D04","D05","D06","D16"].includes(id));
const baseline=s=>JSON.stringify({entries:s.entries,planning:s.planning,review:s.completion.review,
 teacher:s.teacher,scratch:s.scratch});
test("Pass 5: every authored Planning and Studio placement names a real registered node",()=>{
 for(const name of Object.keys(PLANNING_RECOVERY_SPOTS))
  assert(PLANNING_NODE_IDS.includes(name.split(":")[0]),name);
 for(const name of Object.keys(STUDIO_RECOVERY_SPOTS))
  assert(C_NODE_IDS.includes(name.split(":")[0]),name);
 assert(PLANNING_RECOVERY_SPOTS["N03P2:page"]);
});
test("Pass 5: the real sampling node survives help-origin backup normalization",()=>{
 const s=state("planning","N03P2");
 captureStuckOrigin(s,{helpSpot:"N03P2:page",focusId:"stuck-badge-N03P2-page",scrollY:270});
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 const o=restored.completion.support.origin;
 assert.equal(o.planNode,"N03P2");assert.equal(o.route,"planning");
 assert.equal(o.helpSpot,"N03P2:page");
 assert.equal(o.focusId,"stuck-badge-N03P2-page");
 assert.equal(o.scrollY,270);
 assert.equal(restored.planning.current,"N03P2");
});
test("Pass 5: mathematically premature search matches are withheld until actual work exists",()=>{
 const s=state("completing","C30",false);
 for(const id of ["meaning-units","outcome-choice","next-gap","next-method",
  "unexpected-output","model-residual","conclusion-narrow","conclusion-limits","conclusion-stop"])
  assert(!hubIssueFor(s,"fix:studio:"+id),id);
 assert(hubIssueFor(s,"fix:studio:not-yet-result"));
 assert(!hubIssueFor(s,"fix:studio:result-needs-review"));
 s.entries[0].result="A guess that has not been confirmed";
 assert(!hubIssueFor(s,"fix:studio:meaning-units"));
 s.entries[0].status="completed";
 assert(hubIssueFor(s,"fix:studio:meaning-units"));
 assert(!hubIssueFor(s,"fix:studio:not-yet-result"));
 assert(!hubIssueFor(s,"fix:studio:result-needs-review"));
});
test("Pass 5: a student cannot receive conclusion findings before calculating anything",()=>{
 const s=state("completing","C60",false);
 assert(hubIssueFor(s,"fix:studio:conclusion-no-result"));
 assert(!hubIssueFor(s,"fix:studio:conclusion-narrow"));
 s.entries[0].status="completed";s.entries[0].result="A limited verified finding";
 assert(!hubIssueFor(s,"fix:studio:conclusion-no-result"));
 assert(hubIssueFor(s,"fix:studio:conclusion-narrow"));
});
test("Pass 5: 2029 search and repair links never route to superseded A–E checks",()=>{
 const s=state("checking","C04");
 s.planning.fields.assessmentFramework="revised2029";
 for(const mode of ["draft","feedback","final"]){
  s.ui.checkingMode=mode;captureStuckOrigin(s);
  const issues=availableHubIssues(s);
  assert(issues.length>3,mode);
  for(const x of issues){
   assert.equal(x.target.route,"checking",x.id);
   assert(visibleChecks(s,x.target.mode).includes(x.target.check),
    mode+" "+x.id+" -> "+x.target.mode+"-"+x.target.check);
   assert(!["D02","D03","D04","D05","D06","D16"].includes(x.target.check),x.id);
  }
  assert(!issues.some(x=>x.cardId==="personal-choice"));
  assert(issues.some(x=>x.cardId==="mla-match"));
  const d09=hubIssueFor(s,"fix:checking:mla-match");
  assert.equal(d09.target.check,"D09");
  assert(["draft","final"].includes(d09.target.mode));
 }
});
test("Pass 5: legacy A–E and the 2029 framework share safe common Checking help",()=>{
 const s=state("checking","C04");
 for(const framework of ["legacy","revised2029"]){
  s.planning.fields.assessmentFramework=framework;
  for(const key of ["D09","D12","D13","D15","D17","D21"]){
   const target=hubIssueFor(s,"fix:checking:"+({
    D09:"mla-match",D12:"authorship-own",D13:"feedback-meaning",
    D15:"feedback-verify",D17:"submitted-version",D21:"submission-where"
   })[key]);
   assert(target,framework+" "+key);
   assert.equal(target.target.check,key,framework+" "+key);
  }
 }
});
test("Pass 5: all sixteen mathematical routes produce an accessible, distinctive repair",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 for(const route of INVESTIGATIVE_ROUTES){
  const s=state("completing","C30",false);
  s.planning.routeExplorer.selectedRoute=route.id;
  captureStuckOrigin(s,{helpSpot:"C30:part:show"});
  assert(hubIssueFor(s,"fix:studio:route-"+route.id),route.id);
  const next=suggestedHubIssues(s);
  assert(next.length>0&&next.length<=4,route.id);
  assert(!next.some(x=>x.id==="fix:studio:meaning-units"),route.id+" premature meaning");
  const before=baseline(s);
  for(const item of next)hubIssueFor(s,item.id);
  assert.equal(baseline(s),before,route.id);
 }
});
test("Pass 5: seven diagram-generator repairs navigate to registered tools",()=>{
 assert.equal(REPRESENTATION_TOOLS.length,8);
 const s=state("completing","C31",false);
 for(const tool of REPRESENTATION_TOOLS){
  const x=hubIssueFor(s,"fix:studio:tool-"+tool.id);
  assert(x,tool.id);
  assert.deepEqual(x.target,{route:"completing",node:"C31",tool:tool.id});
 }
});
test("Pass 5: the route and outcome selector cannot be fabricated from an entry title",()=>{
 const s=state("completing","C30",true);
 s.entries[0].title="My graph proves all outcomes: quadratic";
 s.entries[0].journeyOutcome=journeyOutcomeOptions(s,s.entries[0])[0].value;
 assert(hubIssueFor(s,"fix:studio:selected-outcome-help"));
 s.entries[0].status="planned";
 assert(!hubIssueFor(s,"fix:studio:selected-outcome-help"));
 assert(!hubIssueFor(s,"fix:studio:meaning-units"));
});
test("Pass 5: Checking origin and saved notes are not changed by opening help",()=>{
 const s=state("checking","C04");
 s.ui.checkingMode="feedback";captureStuckOrigin(s,{helpSpot:"feedback:feedback",focusId:"checking-stuck-feedback-feedback-feedback"});
 s.completion.support.task={issue:"fix:checking:feedback-verify",action:"Check the actual revised graph",note:"I want to see evidence",status:"pending"};
 const before=baseline(s);
 const html=createStuckViews({getState:()=>s,e:escapeHtml,icon:()=>"",field:()=>""}).render();
 assert(html.includes("My saved next action"));
 assert(html.includes("feedback and revisions"));
 assert.equal(baseline(s),before);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.completion.support.origin.checkMode,"feedback");
 assert.equal(restored.completion.support.task.note,"I want to see evidence");
});
test("Pass 5: practical, evidence, maths and Checking browse queries return useful choices",()=>{
 const s=state("completing","C30",false);
 assert(hubFilteredIssues(s,{group:"practical"}).length>=3);
 assert(hubFilteredIssues(s,{query:"model",group:"maths"}).length>0);
 const check=state("checking","C04");
 assert(hubFilteredIssues(check,{query:"Works Cited",group:"checking"}).length>0);
 assert.equal(hubFilteredIssues(check,{query:"this-will-never-match-1234"}).length,0);
});
