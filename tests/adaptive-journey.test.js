import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {addMathematicalStage,flagDependentMathematics,acknowledgeMathReview,setCompletionField} from "../src/completing/engine.js";
import {actualMathematics,journeyOutcomeOptions,selectedJourneyOutcome,
 adaptiveNextDirections,selectedInvestigativeRoute,journeySelectionIsStale,
 journeySourceSignature,stageLinkContext,flagJourneyRouteDependents,journeyCourseNote,outcomeRouteForEntry
} from "../src/completing/adaptive-journey.js";

const make=(route="fitted-models")=>{
 const s=createProjectState();
 s.planning.fields.course="AI SL";
 s.planning.routeExplorer.selectedRoute=route;
 s.completion.current="C30";
 s.entries=[{id:"genuine-first",phase:"first",title:"My first mathematics",status:"completed",
  result:"Actual recorded numerical or mathematical work",localTakeaway:"The evidence suggests something to investigate",
  interpretation:"Interpretation of an actual result",technique:"",kind:"",journeyOutcome:""}];
 s.completion.activeEntryIndex=0;
 return s;
};
test("every one of the 16 investigative journeys offers distinct, evidence-led outcomes",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 for(const route of INVESTIGATIVE_ROUTES){
  const s=make(route.id),options=journeyOutcomeOptions(s);
  assert(options.length>=4,route.id+" needs meaningful alternatives");
  assert(options.every(x=>x.value.startsWith(route.id+":")),route.id);
  assert(new Set(options.map(x=>x.value)).size===options.length,route.id+" duplicate outcomes");
  assert(options.some(x=>x.id==="uncertain"),route.id+" must allow uncertainty");
  assert(!selectedJourneyOutcome(s,s.entries[0]),"do not infer "+route.id+" from text or plan");
  assert.equal(adaptiveNextDirections(s,s.entries[0]).status,"choose");
  s.entries[0].journeyOutcome=options[0].value;
  const advice=adaptiveNextDirections(s,s.entries[0]);
  assert.equal(advice.status,"ready",route.id);
  assert.equal(advice.route.id,route.id);
  assert.equal(advice.chosen.value,options[0].value);
  assert.equal(advice.directions.length,2);
  assert(advice.directions[0].question.length>16,route.id+" needs a worthwhile next question");
  assert(advice.directions[0].why.length>25,route.id+" needs real mathematical rationale");
  assert(advice.directions[0].check.length>14,route.id+" needs validity check");
  assert(advice.stop.toLowerCase().includes("conclude"),route.id);
  assert(advice.courseNote.includes("AI SL"),route.id+" respects course");
 }
});
test("quadratic and non-quadratic findings produce different evidence-based mathematical directions",()=>{
 const s=make("fitted-models");
 const one=s.entries[0];
 one.journeyOutcome="fitted-models:quadratic-plausible";
 const yes=adaptiveNextDirections(s,one);
 assert.match(yes.directions[0].question,/quadratic model/i);
 assert.match(yes.directions[0].why,/residuals/i);
 one.journeyOutcome="fitted-models:not-quadratic";
 const no=adaptiveNextDirections(s,one);
 assert.match(no.directions[0].question,/alternative function structure/i);
 assert.match(no.directions[0].why,/polynomial|shape|family/i);
 assert.notEqual(yes.directions[0].question,no.directions[0].question);
 one.journeyOutcome="fitted-models:uncertain";
 const unsure=adaptiveNextDirections(s,one);
 assert.match(unsure.directions[0].question,/defensibly conclude/i);
 assert(!unsure.directions[0].question.includes("quadratic model"));
});
test("method choices and predicted findings do not activate result advice before genuine mathematical work",()=>{
 const s=make("relationships"),e=s.entries[0];
 e.status="planned";e.result="";e.technique="quadratic model";e.journeyOutcome="relationships:quadratic-looking";
 assert(!actualMathematics(e));
 assert.equal(adaptiveNextDirections(s,e).status,"unverified");
 e.result="A proposed curve";
 assert.equal(adaptiveNextDirections(s,e).status,"unverified");
 e.status="completed";e.journeyOutcome="";
 assert.equal(adaptiveNextDirections(s,e).status,"choose");
 e.journeyOutcome="relationships:not-quadratic";
 assert.equal(adaptiveNextDirections(s,e).status,"ready");
 s.planning.routeExplorer.selectedRoute="";
 assert.equal(adaptiveNextDirections(s,e).status,"no-route");
 assert(!selectedJourneyOutcome(s,e));
});
test("new stages preserve the preceding confirmed outcome, decision and revision token through a save/load round trip",()=>{
 const s=make("growth"),previous=s.entries[0];
 previous.journeyOutcome="growth:multiplicative";
 previous.journeyDirection="follow";
 s.completion.fields.nextQuestion="Do ratios justify an exponential model?";
 s.completion.fields.nextReason="Observed ratios might be approximately stable.";
 const result=addMathematicalStage(s);
 assert(result.ok);
 const current=s.entries[1];
 assert.equal(current.phase,"substantial");
 assert.equal(current.fromEntryId,previous.id);
 assert.equal(current.journeySourceOutcome,previous.journeyOutcome);
 assert.equal(current.journeySourceSignature,journeySourceSignature(s,previous));
 assert.equal(current.journeyRouteId,"growth");
 assert.equal(current.status,"planned");
 assert.equal(current.result,"");
 assert.equal(stageLinkContext(s,current).needsReview,false);
 const saved=normalizeProjectState(s);
 assert.equal(saved.entries[1].journeySourceOutcome,previous.journeyOutcome);
 assert.equal(saved.entries[1].journeySourceSignature,journeySourceSignature(saved,saved.entries[0]));
 assert.equal(saved.entries[1].title,"Do ratios justify an exponential model?");
});
test("editing a predecessor interpretation flags every later mathematical stage without rewriting text",()=>{
 const s=make("optimisation"),parent=s.entries[0];
 parent.journeyOutcome="optimisation:stationary";
 s.completion.fields.nextQuestion="Check the feasible boundary";
 s.completion.fields.nextReason="A stationary candidate must be compared with feasible endpoints.";
 assert(addMathematicalStage(s).ok);
 const second=s.entries[1];second.status="completed";second.result="Feasible endpoint calculations";
 second.localTakeaway="Best value is on the boundary";second.journeyOutcome="optimisation:boundary";
 second.nextQuestion="Would a practical constraint change the choice?";
 second.nextWhy="The endpoint depends on feasible constraints and measurement assumptions.";
 s.completion.activeEntryIndex=1;
 assert(addMathematicalStage(s).ok);
 const third=s.entries[2];
 third.bridge="The mathematical connection I wrote";
 third.result="";third.status="planned";
 const oldSig=third.journeySourceSignature;
 const earlier=parent.journeyOutcome;
 parent.journeyOutcome="optimisation:real-world";
 assert.deepEqual(flagDependentMathematics(s,0,"journeyOutcome",earlier,parent.journeyOutcome),[1,2]);
 assert.equal(second.reviewNeeded,"yes");
 assert.equal(third.reviewNeeded,"yes");
 assert.equal(third.bridge,"The mathematical connection I wrote");
 assert.notEqual(journeySourceSignature(s,parent),second.journeySourceSignature);
 assert.equal(stageLinkContext(s,second).needsReview,true);
 assert.equal(third.journeySourceSignature,oldSig,"signatures remain frozen until reviewed");
 assert(acknowledgeMathReview(s,1));
 assert.equal(second.journeySourceOutcome,parent.journeyOutcome);
 assert.equal(second.journeySourceSignature,journeySourceSignature(s,parent));
 assert.equal(second.reviewNeeded,"");
 assert.equal(third.reviewNeeded,"yes","later descendants need a separate review");
});
test("revising investigative route invalidates route-dependent subsequent pages, not the actual findings",()=>{
 const s=make("relationships"),first=s.entries[0];
 first.journeyOutcome="relationships:curve";
 s.completion.fields.nextQuestion="Which curve best describes the observations?";
 s.completion.fields.nextReason="The real scatter is curved, so a justified model could answer the aim.";
 assert(addMathematicalStage(s).ok);
 const before=s.entries[1].previousTakeaway;
 const changed=flagJourneyRouteDependents(s,"relationships");
 assert.equal(changed,0);
 s.planning.routeExplorer.selectedRoute="fitted-models";
 assert.equal(journeySelectionIsStale(s,first),true);
 assert.equal(adaptiveNextDirections(s,first).status,"stale");
 assert.equal(flagJourneyRouteDependents(s,"relationships"),1);
 assert.equal(s.entries[1].reviewNeeded,"yes");
 assert.equal(s.entries[1].previousTakeaway,before);
 assert.equal(first.result,"Actual recorded numerical or mathematical work");
});
test("evidence-dependent context never silently accepts an unverified or newly changed parent",()=>{
 const s=make("proof");s.entries[0].journeyOutcome="proof:pattern";
 s.completion.fields.nextQuestion="Can this pattern be proved?";
 s.completion.fields.nextReason="Examples suggest a pattern but do not establish a universal proof.";
 assert(addMathematicalStage(s).ok);
 const second=s.entries[1],parent=s.entries[0];
 parent.result="Revised statement";
 assert.equal(stageLinkContext(s,second).needsReview,true);
 flagDependentMathematics(s,0,"result","Actual recorded numerical or mathematical work",parent.result);
 assert.equal(second.reviewNeeded,"yes");
 parent.status="planned";
 assert.equal(acknowledgeMathReview(s,1),false);
 assert.equal(second.reviewNeeded,"yes");
});
test("course notes are explicitly conditional without inventing course prerequisites",()=>{
 const s=make("categorical");
 assert.match(journeyCourseNote(s,selectedInvestigativeRoute(s)),/AI SL/);
 assert.match(journeyCourseNote(s,selectedInvestigativeRoute(s)),/expected frequencies/);
 s.planning.fields.course="AA HL";
 assert.match(journeyCourseNote(s,selectedInvestigativeRoute(s)),/AA HL/);
 s.planning.routeExplorer.selectedRoute="finance";
 assert.match(journeyCourseNote(s,selectedInvestigativeRoute(s)),/mathematical development/);
});

test("stage-local model-fitness options replace scatter-shape options after fitting a quadratic",()=>{
 const s=make("relationships");
 s.entries[0].journeyOutcome="relationships:curve";
 s.entries.push({id:"fit",phase:"substantial",fromEntryId:"genuine-first",methodId:"quadratic-fit",
  status:"completed",result:"Residuals show a systematic pattern",journeyOutcome:""});
 const fit=s.entries[1];
 assert.equal(outcomeRouteForEntry(s,s.entries[0]).id,"relationships");
 assert.equal(outcomeRouteForEntry(s,fit).id,"nonlinear-model");
 const options=journeyOutcomeOptions(s,fit);
 assert(options.some(x=>x.value==="nonlinear-model:residual-structure"));
 assert(!options.some(x=>x.value==="relationships:quadratic-looking"));
 fit.journeyOutcome="nonlinear-model:residual-structure";
 const result=adaptiveNextDirections(s,fit);
 assert.equal(result.status,"ready");
 assert.match(result.directions[0].question,/residual/i);
 assert.match(result.directions[0].why,/model|residual|predict/i);
 const before=journeySourceSignature(s,fit);
 fit.methodId="exponential";
 assert.equal(outcomeRouteForEntry(s,fit).id,"nonlinear-model");
 assert.notEqual(journeySourceSignature(s,fit),before,
  "changing method identity must flag dependents even within a model family");
 fit.methodId="pmcc";
 assert.equal(outcomeRouteForEntry(s,fit).id,"relationships");
 assert(journeySelectionIsStale(s,fit));
 assert.notEqual(journeySourceSignature(s,fit),before);
});
test("later-stage finance, Voronoi and chi-squared work use specific confirmed-method outcomes",()=>{
 for(const [method,expected,sig] of [
  ["finance-compound","finance-compound","rate-sensitive"],
  ["finance-loan","finance-loan","repayment-unaffordable"],
  ["voronoi","voronoi","distance-issue"],
  ["chi-independence","categorical-test","expected-too-small"],
  ["expected-value","expected-value","large-variation"],
  ["triangulation","measurement","angle-sensitive"]
 ]){
  const s=make("finance");
  const e={id:"method",phase:"substantial",fromEntryId:"genuine-first",status:"completed",
   result:"Actual calculation",methodId:method,journeyOutcome:""};
  s.entries.push(e);
  const route=outcomeRouteForEntry(s,e);
  assert.equal(route.id,expected,method);
  assert(journeyOutcomeOptions(s,e).some(x=>x.value===expected+":"+sig),method);
  e.journeyOutcome=expected+":"+sig;
  const result=adaptiveNextDirections(s,e);
  assert.equal(result.status,"ready",method);
  assert(result.directions[0].question.length>15,method);
  assert(result.courseNote.includes("AI SL"),method);
 }
});

test("revising a first-page next question or reason flags already-created mathematics without destroying it",()=>{
 const s=make("relationships"),first=s.entries[0];
 first.journeyOutcome="relationships:curve";
 setCompletionField(s,"nextQuestion","Which curved model would be reasonable?");
 setCompletionField(s,"nextReason","The observed shape is not straight.");
 assert(addMathematicalStage(s).ok);
 const child=s.entries[1];child.bridge="My original reason for continuing";
 assert.equal(child.journeySourceSignature,journeySourceSignature(s,first));
 s.completion.current="C30";s.completion.activeEntryIndex=0;
 setCompletionField(s,"nextQuestion","Would a different function family be justified?");
 assert.equal(first.nextQuestion,"Would a different function family be justified?");
 assert.equal(child.reviewNeeded,"yes");
 assert.equal(child.bridge,"My original reason for continuing");
 assert(stageLinkContext(s,child).needsReview);
});
test("selecting a result description after a dependent stage already exists requires review",()=>{
 const s=make("models"),first=s.entries[0];
 s.planning.routeExplorer.selectedRoute="fitted-models";
 s.completion.fields.nextQuestion="What could I investigate next?";
 // Previously saved projects may contain a later page without a recorded outcome.
 s.entries.push({id:"legacy-child",phase:"substantial",fromEntryId:first.id,status:"planned",result:"",bridge:"Existing reasoning"});
 const child=s.entries[1];const earlier=first.journeyOutcome||"";
 first.journeyOutcome="fitted-models:not-quadratic";
 const flagged=flagDependentMathematics(s,0,"journeyOutcome",earlier,first.journeyOutcome);
 assert.deepEqual(flagged,[1]);
 assert.equal(child.reviewNeeded,"yes");
});
