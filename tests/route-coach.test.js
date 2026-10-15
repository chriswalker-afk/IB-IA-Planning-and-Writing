import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {normalizeEntry} from "../src/completing/entry-record.js";
import {setCompletionNode,setCompletionField,flagDependentMathematics} from "../src/completing/engine.js";
import {routeAdvice,routeNextQuestions,resultFamily,resultSignalOptions,isAdviceReduced} from "../src/completing/route-coach.js";
import {createCompletingViews} from "../src/completing/views.js";

const e=x=>String(x??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const base=(methodId,resultSignal="",extras={})=>({
 id:"result",fromEntryId:"scatter",phase:"substantial",kind:"model",
 methodId,status:"completed",result:"Genuine working with results",
 resultSignal,technique:methodId,purpose:"Answer the question",title:"Actual result",...extras
});
function stateWith(first,second){
 const state=createProjectState();state.route="completing";
 state.planning.fields.aim="What does this mathematics tell me?";
 state.planning.fields.course="AA SL";
 state.planning.fields.kind="statistics";
 state.entries=second?[first,second]:[first];state.completion.activeEntryIndex=state.entries.length-1;
 state.completion.nextFromEntryId=(second||first).id;
 return state;
}
const scatter=(observation="linear")=>({id:"scatter",phase:"first",kind:"scatter",
 status:"completed",result:"I drew a genuine graph",title:"Observed plot",observation,
 localTakeaway:"The actual points follow the observed shape"});
function render(state,node){
 state.completion.current=node;
 const ctx={getState:()=>state,e,icon:()=>"",button:(label,action)=>'<button data-action="'+action+'">'+label+'</button>',
 field:(path,label)=>'<label data-path="'+e(path)+'">'+e(label)+'</label>',
 choose:(path,items)=>'<div data-choice-path="'+e(path)+'">'+items.map(x=>e(x.title)).join(" | ")+'</div>',
 summary:(a,b)=>'<p>'+e(a)+": "+e(b)+'</p>',sheetTitle:(_,title)=>title,tabletNav:()=>"",
 filled:x=>typeof x==="string"&&!!x.trim()};
 return createCompletingViews(ctx).viewCompleting();
}
test("no prediction, planned calculation or missing result can trigger completed-result advice",()=>{
 const s=createProjectState();s.planning.fields.prediction="I expect a straight line";
 assert.equal(routeAdvice(s,{id:"x",methodId:"pmcc",status:"planned",result:""}),null);
 assert.equal(routeAdvice(s,{id:"x",methodId:"pmcc",status:"planned",result:"r = 0.4"}),null);
 assert.equal(routeAdvice(s,{id:"x",methodId:"pmcc",status:"completed",result:""}),null);
 assert.equal(routeNextQuestions(s,null).length,0);
});
test("scatter choices support linear, curved, unclear and outlier branches with appropriate cautions",()=>{
 for(const [shape,expected] of [["linear","straight"],["curved","curved"],["unclear","No clear"],["unexpected","unusual"]]){
  const s=stateWith(scatter(shape));
  const advice=routeAdvice(s,s.entries[0]);
  assert(advice.heading.toLowerCase().includes(expected.toLowerCase()),shape);
  assert(advice.questions.length>=1);
 }
 assert(routeAdvice(stateWith(scatter("curved")),scatter("curved")).essential.includes("Do not use a straight-line"));
 assert(routeAdvice(stateWith(scatter("unexpected")),scatter("unexpected")).essential.includes("never remove"));
});
test("the student can refine a shape later without retaining a contradictory broad category",()=>{
 const first=scatter("linear");const s=stateWith(first);
 setCompletionNode(s,"C35B");
 setCompletionField(s,"scatterPattern","linear");
 setCompletionField(s,"scatterDetail","monotonic");
 assert.equal(s.completion.fields.scatterPattern,"curved");
 assert.equal(s.completion.scatterPatternForEntryId,first.id);
 assert.equal(s.entries[0].observation,"curved");
 assert(routeAdvice(s,s.entries[0]).heading.includes("curved"));
 setCompletionField(s,"scatterPattern","unclear");
 assert.equal(s.completion.fields.scatterDetail,"");
 assert.equal(s.entries[0].observation,"unclear");
});
test("PMCC branches use the real ancestral graph, not the originally predicted sign",()=>{
 const p=base("pmcc","weak-linear");
 const s=stateWith(scatter("curved"),p);
 assert.equal(resultFamily(p),"pmcc");
 let x=routeAdvice(s,p);
 assert(x.heading.includes("curved"),"Weak r should not rule out nonlinear structure.");
 assert(x.detail.includes("does NOT rule out"));
 s.entries[0].observation="unclear";
 x=routeAdvice(s,p);
 assert(x.heading.includes("no clear pattern"));
 assert(x.detail.includes("independence"));
 s.entries[0].observation="linear";p.resultSignal="meaningful-linear";
 x=routeAdvice(s,p);
 assert(x.questions.some(t=>t.includes("fitted line")));
 assert(!x.detail.includes("proof of cause"));
 setCompletionNode(s,"C35P");setCompletionField(s,"pmccSignal","weak-linear");
 assert.equal(s.entries[1].resultSignal,"weak-linear");
 assert.equal(s.completion.pmccSignalForEntryId,p.id);
});
test("regression prompt explicitly interprets slope, intercept, residuals and range",()=>{
 const regression=base("linear-regression","fit-sensible");
 const s=stateWith(scatter("linear"),regression);
 let c=routeAdvice(s,regression);
 for(const term of ["gradient","intercept","residuals","range"])assert(c.essential.includes(term),term);
 regression.resultSignal="poor-fit";c=routeAdvice(s,regression);
 assert(c.detail.includes("systematic residual"));
 assert(c.questions.some(x=>x.includes("residuals")));
 regression.resultSignal="outlier-effect";c=routeAdvice(s,regression);
 assert(c.detail.includes("sensitivity check"));
 assert(c.detail.includes("do not silently exclude"));
});
test("nonlinear models are not told to interpret a linear intercept by rote",()=>{
 const s=stateWith(scatter("curved"),base("exponential","poor-fit"));
 const advice=routeAdvice(s,s.entries[1]);
 assert(advice.essential.includes("parameters"));
 assert(advice.detail.includes("residual pattern"));
 assert(!advice.essential.includes("gradient using output-units"));
});
test("optimisation branches distinguish stationary points, constraints and valid optima",()=>{
 const o=base("optimisation","unchecked-stationary");
 const s=stateWith(o);
 let advice=routeAdvice(s,o);
 assert(advice.essential.includes("endpoints"));assert(advice.detail.includes("derivative of zero"));
 o.resultSignal="not-feasible";advice=routeAdvice(s,o);
 assert(advice.detail.includes("violate"));
 o.resultSignal="checked-optimum";advice=routeAdvice(s,o);
 assert(advice.heading.includes("constraints"));
});
test("conjecture-proof cases distinguish evidence, proof and refutation at first exploration",()=>{
 const proof={id:"proof",phase:"first",kind:"theory",methodId:"other",title:"Integer cases",
 status:"completed",result:"Cases n=1..4 agree",resultSignal:"pattern-only"};
 const s=stateWith(proof);let a=routeAdvice(s,proof);
 assert(a.essential.includes("cannot prove"));
 proof.resultSignal="counterexample";a=routeAdvice(s,proof);
 assert(a.detail.includes("universal"));assert(a.questions.some(q=>q.includes("conjecture")));
 proof.resultSignal="proof-established";a=routeAdvice(s,proof);
 assert(a.essential.includes("logical argument"));
 assert.equal(resultSignalOptions(proof).length,4);
});
test("guided mode displays selected next-question options; reduced mode keeps essential checks and controls",()=>{
 const s=stateWith(scatter("linear"),base("linear-regression","fit-sensible"));
 s.completion.activeEntryIndex=1;
 let html=render(s,"C40");
 assert(html.includes('data-action="toggle-advice-mode"'));
 assert(html.includes('aria-pressed="false"'));
 assert(html.includes("Explain the gradient"));
 assert(html.includes('data-choice-path="entries.1.resultSignal"'));
 assert(html.includes("route-coach-detail"));
 html=render(s,"C35");
 assert(html.includes('data-action="route-coach-next"'));
 assert(html.includes("Questions your result might raise"));
 assert(html.includes("Enough to conclude"));
 s.ui.adviceMode="reduced";
 html=render(s,"C40");
 assert(html.includes('aria-pressed="true"'));
 assert(html.includes("Explain the gradient"));
 assert(html.includes('data-path="entries.1.resultSignal"'));
 assert(!html.includes("route-coach-detail"));
 assert(!html.includes("guidance-optional"));
 assert(!html.includes("criteria-writing-tools"));
 html=render(s,"C35");
 assert(!html.includes('data-action="route-coach-next"'));
 assert(html.includes("Enough to conclude"));
 assert(isAdviceReduced(s));
});
test("preferences and result decisions are preserved by backups without rewriting mathematical evidence",()=>{
 const s=stateWith(scatter("linear"),base("linear-regression","poor-fit"));
 const result=s.entries[1].result;
 s.ui.adviceMode="reduced";
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.ui.adviceMode,"reduced");
 assert.equal(restored.entries[1].resultSignal,"poor-fit");
 assert.equal(restored.entries[1].result,result);
 assert.equal(normalizeProjectState({...s,ui:{...s.ui,adviceMode:"unknown"}}).ui.adviceMode,"guided");
 assert.equal(normalizeEntry({resultSignal:"checked-optimum"}).resultSignal,"checked-optimum");
});
test("guide choices and optional branches do not mutate recorded mathematics on rendering",()=>{
 const s=stateWith(scatter("unexpected"),base("pmcc","weak-linear"));
 for(const node of ["C40","C35","C35P"]){s.completion.current=node;const before=JSON.stringify(s);render(s,node);assert.equal(JSON.stringify(s),before,node);}
});
