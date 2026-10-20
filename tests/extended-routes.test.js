import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {methodFamilies} from "../src/completing/method-identity.js";
import {METHOD_OPTIONS,SCATTER_DETAILS} from "../src/completing/guidance-context.js";
import {EXTENDED_SIGNALS,extendedPlanningCheck} from "../src/completing/extended-routes.js";
import {resultFamily,routeAdvice,routeNextQuestions,resultSignalOptions} from "../src/completing/route-coach.js";
import {setCompletionField,setCompletionNode} from "../src/completing/engine.js";
import {createCompletingViews} from "../src/completing/views.js";

const e=t=>String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const s=(course="AI SL")=>{const x=createProjectState();x.route="completing";x.planning.fields.course=course;x.planning.fields.aim="Which mathematical decision is supported?";return x;};
const item=(methodId,signal="",extra={})=>({id:"step",phase:"substantial",status:"completed",kind:"model",title:"Actual mathematics",
  methodId,technique:methodId,purpose:"Investigate a real question",result:"I calculated and checked my own result",
  resultSignal:signal,...extra});
const attach=(state,step,first=false)=>{state.entries=[step];state.completion.activeEntryIndex=0;state.completion.nextFromEntryId=step.id;state.completion.current=first?"C34":"C40";return state;};
function render(state,node="C40"){
 state.completion.current=node;
 const ctx={getState:()=>state,e,icon:()=>"",button:t=>t,filled:t=>!!String(t||"").trim(),tabletNav:()=>"",
   field:(path,label)=>'<label data-bind="'+path+'">'+label+'</label>',
   choose:(path,items)=>'<section data-choice="'+path+'">'+items.map(a=>a.title||a[1]).join("|")+"</section>",
   summary:(t,v)=>t+": "+v,sheetTitle:(_,t)=>t};
 return createCompletingViews(ctx).viewCompleting();
}
const cases=[
 ["finance-break-even","break-even-unrealistic","break-even","demand","formula"],
 ["finance-compound","rate-period-mismatch","rate","period","substitution"],
 ["finance-loan","longer-loan-cost","repayment","interest","formula"],
 ["finance-cashflow","cash-shortfall","cash","Profit","formula"],
 ["voronoi","new-site","Voronoi","best","Software"],
 ["spearman","turning-pattern","Spearman","monotonic","technology-generated"],
 ["quadratic-fit","competing-models","parameters","residuals","technology-generated"],
 ["exponential","extrapolation-fails","parameters","domain","technology-generated"],
 ["sinusoidal","model-fit","parameters","period","technology-generated"],
 ["power","residual-structure","parameters","residuals","technology-generated"],
 ["chi-independence","insufficient-evidence","expected","prove","Computing"],
 ["chi-fit","expected-too-small","expected","conditions","Computing"],
 ["expected-value","large-variation","Expected","risk","substituted"],
 ["triangulation","angle-sensitive","angle","uncertainty","substitution"]
];
test("every new course/route choice is available in the existing method menu",()=>{
 const menu=new Set(METHOD_OPTIONS.map(x=>x[0]));
 for(const [method] of cases){
  assert(menu.has(method),"Not selectable: "+method);
  const entry=item(method);
  assert(resultFamily(entry),method);
  assert(resultSignalOptions(entry).length>=3,method);
  assert(methodFamilies(entry).size>0,method);
 }
 assert(SCATTER_DETAILS.some(x=>x[0]==="periodic"));
});
test("actual results, not predictions or planned formulas, control route-specific guidance",()=>{
 for(const [method,choice] of cases){
  const state=s();state.planning.fields.prediction="I expect a spectacular result";
  const x=item(method,choice);
  assert(routeAdvice(state,x),method);
  assert.equal(routeAdvice(state,{...x,status:"planned"}),null,method);
  assert.equal(routeAdvice(state,{...x,result:""}),null,method);
  assert(extendedPlanningCheck(state,{...x,status:"planned",result:""}),method);
  assert.equal(extendedPlanningCheck(state,x),null,method);
 }
});
test("each student-confirmed finding changes the prompt and meaningful next question",()=>{
 for(const [method,choice,core,detail,depth] of cases){
  const state=s();const x=item(method,choice);
  const advice=routeAdvice(state,x);
  const undecided=routeAdvice(state,{...x,resultSignal:""});
  assert(advice&&advice.essential.length>45,method);
  assert(advice.heading!==undecided.heading || advice.detail!==undecided.detail,method);
  assert(advice.essential.toLowerCase().includes(core.toLowerCase()),method+" essential: "+core);
  assert((advice.detail+" "+advice.essential).toLowerCase().includes(detail.toLowerCase()),method+" depth: "+detail);
  assert(advice.depth.toLowerCase().includes(depth.toLowerCase()),method+" development check: "+depth);
  assert(advice.questions.length>=1&&advice.questions.length<=2);
  assert(routeNextQuestions(state,x).every(q=>q.length>12));
  assert(resultSignalOptions(x).some(opt=>opt.value===choice));
 }
});
test("all finance routes keep formula-substitution warnings and distinguish time-dependent models",()=>{
 const state=s("AI SL");
 for(const method of ["finance-break-even","finance-compound","finance-loan","finance-cashflow"]){
  const x=item(method);
  const a=routeAdvice(state,x);
  assert(/substitution/.test(a.depth),method);
  assert(/AI SL/.test(a.depth),method);
  assert(/compound-interest/i.test(a.depth));
 }
 assert(routeAdvice(state,item("finance-break-even")).essential.includes("demand"));
 assert(routeAdvice(state,item("finance-loan")).essential.includes("outstanding balance"));
 assert(routeAdvice(state,item("finance-cashflow")).essential.includes("Profit"));
 assert(routeAdvice(state,item("finance-compound","rate-period-mismatch")).detail.includes("nominal annual"));
 assert(routeAdvice(state,item("finance-loan","longer-loan-cost")).detail.includes("total paid"));
 const higher=routeAdvice(s("AA HL"),item("finance-loan"));
 assert(higher.depth.includes("AA HL"));
 assert(higher.depth.includes("mathematical development"));
 assert(!higher.depth.includes("you must use"));
});
test("Voronoi guidance separates nearest site, population demand and location objectives",()=>{
 const x=item("voronoi");
 const v=routeAdvice(s(),x);assert(v.essential.includes("nearest"));
 for(const signal of ["nearest-cells","unequal-cells","poor-coverage","new-site","distance-issue"]){
  const a=routeAdvice(s(),{...x,resultSignal:signal});
  assert(a.questions.length>0);assert(a.depth.includes("optimization")===false);
 }
 const site=routeAdvice(s(),{...x,resultSignal:"new-site"});
 assert(site.detail.includes("NOT automatically"));
 assert(site.detail.includes("objective"));
 const unequal=routeAdvice(s(),{...x,resultSignal:"unequal-cells"});
 assert(unequal.detail.includes("number of customers"));
});
test("nonlinear routes distinguish rank monotonicity, curve fit and periodic interpretations",()=>{
 const rank=routeAdvice(s(),item("spearman","turning-pattern"));
 assert(rank.essential.includes("monotonic"));
 assert(rank.detail.includes("rank coefficient"));
 const quad=routeAdvice(s(),item("quadratic-fit","model-fit"));
 assert(quad.essential.includes("turning point"));
 const exp=routeAdvice(s(),item("exponential","model-fit"));
 assert(exp.essential.includes("growth/decay factor"));
 const sine=routeAdvice(s(),item("sinusoidal","model-fit"));
 assert(sine.essential.includes("amplitude"));
 const power=routeAdvice(s(),item("power","model-fit"));
 assert(power.essential.includes("positivity"));
 const graph={id:"plot",phase:"first",kind:"scatter",status:"completed",result:"I graphed real data",observation:"curved"};
 const state=attach(s(),graph,true);
 setCompletionNode(state,"C35B");
 setCompletionField(state,"scatterPattern","curved");
 setCompletionField(state,"scatterDetail","periodic");
 assert.equal(state.completion.fields.scatterPattern,"curved");
 assert.equal(graph.observation,"curved");
 assert(routeAdvice(state,graph).heading.includes("repeating"));
});
test("categorical inference avoids claims of independence or causation, expected value distinguishes risk",()=>{
 const x=routeAdvice(s(),item("chi-independence","insufficient-evidence"));
 assert(x.essential.includes("does not prove"));
 assert(x.detail.includes("independent"));
 assert(routeAdvice(s(),item("chi-independence","evidence-against")).essential.includes("causation"));
 const chance=routeAdvice(s(),item("expected-value","positive-expectation"));
 assert(chance.essential.includes("not the most likely single outcome"));
 assert(chance.detail.includes("guarantee"));
});
test("legacy nonlinear model findings retain their specific interpretation and can be revised",()=>{
 const x=item("exponential","poor-fit");const state=s();
 let a=routeAdvice(state,x);
 assert(a.heading.includes("Residuals"));
 assert(a.detail.includes("residual pattern"));
 assert(resultSignalOptions(x).some(o=>o.value==="poor-fit"));
 x.resultSignal="outlier-effect";a=routeAdvice(state,x);
 assert(a.detail.includes("sensitivity check"));
 x.resultSignal="fit-sensible";a=routeAdvice(state,x);
 assert(a.heading.includes("plausible"));
});
test("measurement results lead to uncertainty analysis, not another arbitrary formula",()=>{
 const x=routeAdvice(s(),item("triangulation","angle-sensitive"));
 assert(x.essential.includes("precision"));
 assert(x.detail.includes("unstable"));
 assert(x.questions.some(q=>q.includes("uncertainty")));
});
test("prominent mathematical development is present before formula and after actual result, even with reduced advice",()=>{
 for(const method of ["finance-compound","finance-loan","voronoi","exponential","chi-independence","expected-value","triangulation"]){
  const state=attach(s("AA HL"),item(method,"",{status:"planned",result:""}));
  let html=render(state,"C40");
  assert(html.includes("BEFORE THE MATHEMATICS"),method);
  assert(html.includes("route-preflight"),method);
  assert(!html.includes("route-depth-check"),method);
  state.entries[0].status="completed";state.entries[0].result="A genuine calculated result";
  html=render(state,"C40");
  assert(!html.includes("route-preflight"),method);
  assert(html.includes("route-depth-check"),method);
  assert(html.includes('data-bind="entries.0.journeyOutcome"'),method);
   assert(html.includes("route-depth-check"),method+" retains mathematical development");
  state.ui.adviceMode="reduced";
  html=render(state,"C40");
  assert(html.includes("route-coach-compact"),method);
  assert(html.includes("route-depth-check"),method);
  assert(!html.includes("route-coach-detail"),method);
  assert(html.includes('data-bind="entries.0.journeyOutcome"'),method);
  state.ui.adviceMode="guided";
  const e1=state.entries[0];e1.phase="first";
  state.completion.activeEntryIndex=0;
  html=render(state,"C34");
  assert(html.includes("route-depth-check"),method+" first actual calculation");
 }
});
test("confirmed route choices survive JSON project roundtrip without asserting IB marks",()=>{
 const state=attach(s(),item("voronoi","new-site"));state.ui.adviceMode="reduced";
 const snapshot=JSON.parse(JSON.stringify(state));
 const restored=normalizeProjectState(snapshot);
 assert.equal(restored.entries[0].resultSignal,"new-site");
 assert.equal(restored.ui.adviceMode,"reduced");
 assert.equal(restored.entries[0].result,state.entries[0].result);
 assert.equal(restored.teacher.feedbackStatus,"not-requested");
});
