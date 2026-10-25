import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {C_NODE_IDS,addMathematicalStage} from "../src/completing/engine.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {REPRESENTATION_TOOLS} from "../src/diagrams/representation-registry.js";
import {
 journeyOutcomeOptions,journeySourceSignature,adaptiveNextDirections
} from "../src/completing/adaptive-journey.js";
import {
 STUDIO_RECOVERY_CARDS,STUDIO_RECOVERY_SPOTS,ROUTE_RECOVERY,TOOL_RECOVERY,
 studioHelpFor,studioHelpBadge
} from "../src/help/studio-help.js";
const fixture=(route="relationships",node="C30",real=false)=>{
 const s=createProjectState();s.route="completing";s.completion.current=node;
 s.ui.writingIntroSeen=true;s.planning.fields.course="AA SL";
 s.planning.fields.kind="statistics";s.planning.fields.aim="Can I investigate this mathematical question?";
 s.planning.routeExplorer.selectedRoute=route;
 s.entries=[{id:"first",phase:"first",title:"First actual figure or calculation",
   status:real?"completed":"planned",result:real?"Actual recorded mathematical output":"",
   journeyOutcome:"",methodId:"",kind:"",localTakeaway:"",interpretation:"",
   accuracyRefs:[]}];
 s.completion.activeEntryIndex=0;
 return s;
};
const all=help=>help?.choices?.map(x=>x.id)||[];
const escapeHtml=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
test("Pass 3: all authored repair cards have a precise problem, diagnostic, action, check and stopping point",()=>{
 assert(STUDIO_RECOVERY_CARDS.length>=32);
 const ids=new Set();
 for(const card of STUDIO_RECOVERY_CARDS){
  assert(!ids.has(card.id),card.id);ids.add(card.id);
  assert(card.label.length>19&&card.label.length<120,card.id);
  assert(card.question.endsWith("?"),card.id);
  for(const key of ["action","check","stop","fallback","boundary"])
   assert(card[key].length>=28,card.id+": "+key);
  assert(!/Criterion [A-E]|guaranteed score|write a stronger paragraph/i.test(card.action),card.id);
 }
});
test("every placement is an actual Completing node and has authored advice",()=>{
 const allCards=new Set([...STUDIO_RECOVERY_CARDS,...Object.values(ROUTE_RECOVERY),...Object.values(TOOL_RECOVERY)].map(x=>x.id));
 assert(Object.keys(STUDIO_RECOVERY_SPOTS).length>45);
 for(const [key,ids] of Object.entries(STUDIO_RECOVERY_SPOTS)){
  const node=key.split(":")[0];assert(C_NODE_IDS.includes(node),key);
  assert(ids.every(x=>allCards.has(x)),key);
  assert(ids.length<=3,key);
 }
});
test("every one of the 16 published investigative pathways has DISTINCT mathematical recovery",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.deepEqual(new Set(Object.keys(ROUTE_RECOVERY)),new Set(INVESTIGATIVE_ROUTES.map(x=>x.id)));
 const actions=new Set(Object.values(ROUTE_RECOVERY).map(x=>x.action));
 assert.equal(actions.size,16,"do not repeat generic mathematics advice for distinct routes");
 for(const route of INVESTIGATIVE_ROUTES){
  const s=fixture(route.id,"C30",false);
  const help=studioHelpFor(s,"part:show");
  assert(help,route.id);
  assert.equal(help.route,route.title,route.id);
  assert(all(help).includes("route-"+route.id),route.id);
  assert(!all(help).includes("selected-outcome-help"),route.id);
  assert(!help.selectedOutcome,route.id);
  assert(help.choices.every(x=>!x.action.includes("I found ")),route.id);
 }
});
test("no completed work means no outcome-specific advice anywhere in the current mathematics",()=>{
 const s=fixture("fitted-models","C30",false),first=s.entries[0];
 first.journeyOutcome=journeyOutcomeOptions(s,first)[0].value;
 for(const spot of ["page","part:introduce","part:show","part:reflect","part:next"]){
  const help=studioHelpFor(s,spot);
  assert(help,spot);
  assert(!all(help).includes("selected-outcome-help"),spot);
  if(spot==="part:reflect"||spot==="part:next")
   assert.equal(help.choices[0].id,"not-yet-result");
 }
 first.result="This looks like an actual output but is still marked planned";
 assert(!all(studioHelpFor(s,"part:next")).includes("selected-outcome-help"));
 first.status="completed";first.result="";
 assert(!all(studioHelpFor(s,"part:next")).includes("selected-outcome-help"));
});
test("16 route outcomes are read from the existing student-confirmed result selector only",()=>{
 for(const route of INVESTIGATIVE_ROUTES){
  const s=fixture(route.id,"C30",true),first=s.entries[0];
  const options=journeyOutcomeOptions(s,first);
  assert(options.length>=4);
  let help=studioHelpFor(s,"part:next");
  assert(!all(help).includes("selected-outcome-help"),route.id+" unchosen");
  first.journeyOutcome=options[0].value;
  help=studioHelpFor(s,"part:next");
  assert(all(help).includes("selected-outcome-help"),route.id);
  assert.equal(help.selectedOutcome,options[0].title);
  const item=help.choices.find(x=>x.id==="selected-outcome-help");
  assert(item.action.length>45&&item.check.length>20,route.id);
  assert.equal(adaptiveNextDirections(s,first).status,"ready",route.id);
  const oldAction=item.action;
  first.journeyOutcome=options[1].value;
  const revised=studioHelpFor(s,"part:next");
  assert.equal(revised.selectedOutcome,options[1].title);
  assert(!all(revised).includes("not-yet-result"),route.id);
  if(adaptiveNextDirections(s,first).status==="ready")
   assert(all(revised).includes("selected-outcome-help"),route.id);
  assert.equal(s.entries[0].status,"completed");
  assert.equal(s.entries[0].result,"Actual recorded mathematical output");
 }
});
test("a stale selected route or unreviewed result blocks the tempting next-method suggestion",()=>{
 const s=fixture("relationships","C30",true);
 s.entries[0].journeyOutcome="relationships:curve";
 assert(all(studioHelpFor(s,"part:next")).includes("selected-outcome-help"));
 s.planning.routeExplorer.selectedRoute="finance";
 const help=studioHelpFor(s,"part:next");
 assert(!all(help).includes("selected-outcome-help"));
 assert(all(help).includes("result-needs-review"));
 assert.equal(help.selectedOutcome,"");
});
test("Pearson troubleshooting requires a completed PMCC and a linked actual scatter, not a keyword",()=>{
 const s=fixture("relationships","C35P",true);
 const scatter=s.entries[0];scatter.kind="scatter";scatter.technique="Scatter plot";
 s.entries.push({id:"r",phase:"substantial",fromEntryId:"first",methodId:"pmcc",
  title:"A PMCC calculation",status:"planned",result:"",journeyOutcome:""});
 s.completion.activeEntryIndex=1;s.completion.nextFromEntryId="r";
 assert(!all(studioHelpFor(s,"page")).includes("pmcc-curved"));
 s.entries[1].status="completed";s.entries[1].result="r = 0.15";
 const now=studioHelpFor(s,"page");
 assert(all(now).includes("pmcc-curved"));
 assert(now.choices.find(x=>x.id==="pmcc-curved").fallback.includes("monotonicity"));
 s.entries[1].methodId="normal";s.entries[1].title="PMCC (an outdated title)";
 assert(!all(studioHelpFor(s,"page")).includes("pmcc-curved"));
});
test("stage-two incomplete work returns to the CURRENT mathematical page, never overwrites C30",()=>{
 const s=fixture("growth","C30",true),first=s.entries[0];
 first.journeyOutcome=journeyOutcomeOptions(s,first)[0].value;
 s.completion.fields.nextQuestion="Do repeated ratios suggest another model?";
 s.completion.fields.nextReason="A genuine observed pattern remains unexplained.";
 assert(addMathematicalStage(s).ok);
 s.completion.current="C40";s.completion.activeEntryIndex=1;
 const later=studioHelpFor(s,"part:reflect");
 assert.equal(later.choices[0].id,"not-yet-result");
 assert.equal(later.choices[0].targetNode,"C40");
 const laterSaved=JSON.stringify(s.entries[1]);
 assert(studioHelpFor(s,"page"));assert.equal(JSON.stringify(s.entries[1]),laterSaved);
});
test("a changed earlier result triggers dependency repair rather than automatically rewriting a later stage",()=>{
 const s=fixture("growth","C30",true),first=s.entries[0];
 first.journeyOutcome=journeyOutcomeOptions(s,first)[0].value;
 s.completion.fields.nextQuestion="Why might an alternative be useful?";
 s.completion.fields.nextReason="This would answer a real remaining question.";
 assert(addMathematicalStage(s).ok);
 const later=s.entries[1];later.bridge="Earlier student-authored reasoning";
 s.completion.current="C40";s.completion.activeEntryIndex=1;
 assert(!all(studioHelpFor(s,"page")).includes("selected-outcome-help"));
 first.result="A revised genuine result";
 assert.equal(studioHelpFor(s,"page").choices[0].id,"result-needs-review");
 assert.equal(later.bridge,"Earlier student-authored reasoning");
});
test("all seven registered mathematical generators offer one actionable tool-specific repair",()=>{
 assert.equal(REPRESENTATION_TOOLS.length,8);
 assert.deepEqual(new Set(Object.keys(TOOL_RECOVERY)),new Set(REPRESENTATION_TOOLS.map(t=>t.id)));
 for(const tool of REPRESENTATION_TOOLS){
  const s=fixture("images","C31",false);
  for(const candidate of REPRESENTATION_TOOLS)s[candidate.studio].open=false;
  s[tool.studio].open=true;
  const help=studioHelpFor(s,"page");
  assert(help,tool.id);
  assert(help.title.includes(tool.title),tool.id);
  assert.equal(help.choices[0].id,"tool-"+tool.id,tool.id);
  assert(help.choices[0].action.length>65,tool.id);
 }
});
test("C60 treats a missing finding as a genuine block and respects narrow real evidence",()=>{
 const empty=fixture("proof","C60",false);
 assert.equal(studioHelpFor(empty,"page").choices[0].id,"conclusion-no-result");
 empty.entries[0].status="completed";empty.entries[0].result="A mathematical counterexample";
 const help=studioHelpFor(empty,"part:answer");
 assert(help);
 assert(!help.choices.some(x=>x.id==="not-yet-result"));
 assert(help.choices.some(x=>x.id==="conclusion-narrow"));
});
test("contextual Studio help works for both 2026 A–E and revised 2029 cohorts, including reduced advice",()=>{
 const s=fixture("chance","C30",true),before=JSON.stringify(s);
 s.ui.adviceMode="reduced";
 const older=studioHelpFor(s,"part:show");
 assert(older&&studioHelpBadge(s,"part:show",escapeHtml).includes('aria-haspopup="dialog"'));
 s.planning.fields.assessmentFramework="revised2029";
 assert.deepEqual(all(studioHelpFor(s,"part:show")),all(older));
 s.route="planning";
 assert.equal(studioHelpFor(s,"part:show"),null);
 s.route="completing";
 assert.equal(s.entries[0].result,"Actual recorded mathematical output");
 assert(s.completion.stages&&Object.keys(s.completion.stages).length>0);
});
test("support selectors are read-only, do not infer findings from titles, and save/load leaves data untouched",()=>{
 const s=fixture("growth","C30",false);
 s.entries[0].title='<img src=x onerror="alert(1)">';s.entries[0].result="";
 s.completion.fields.nextQuestion="My own early idea";
 s.scratch.introduction="My actual IA notes";
 const before=JSON.stringify([s.planning,s.completion,s.entries,s.scratch,s.teacher]);
 for(const spot of ["page","part:introduce","part:show","part:reflect","part:next",
   "field:result","field:interpretation"])studioHelpFor(s,spot);
 assert.equal(JSON.stringify([s.planning,s.completion,s.entries,s.scratch,s.teacher]),before);
 assert(!studioHelpBadge(s,"part:reflect",escapeHtml).includes("<img"));
 const copy=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(copy.entries[0].title,s.entries[0].title);
 assert.equal(copy.scratch.introduction,s.scratch.introduction);
});
