import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {newResourceSession} from "../src/resources/state.js";
import {resourceAction,resourceFilter} from "../src/resources/actions.js";
import {renderWorkshop,workshopList} from "../src/workshop/views.js";
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,definitionById,lessonById,workshopLessonForEntry} from "../src/workshop/catalog.js";
import {BATCH6_DEFINITIONS} from "../src/workshop/batch-6-definitions.js";
import {BATCH6_LESSONS} from "../src/workshop/batch-6-lessons.js";
import {WORKSHOP_LESSON_FORMULAS,WORKSHOP_DEFINITION_FORMULAS} from "../src/workshop/math-notation.js";
import {resourceById,RESOURCES} from "../src/resources/catalog.js";
import {representationTool} from "../src/diagrams/representation-registry.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
const approx=(a,b,eps=1e-9)=>assert(Math.abs(a-b)<eps,a+" differs from "+b);
const saved=s=>JSON.stringify({entries:s.entries,planning:s.planning,completion:s.completion,project:s.project,scratch:s.scratch,resources:s.resources});

test("Batch 6: 34 complete finance definitions, six guides, real resource targets and all accessible equations",()=>{
 assert.equal(BATCH6_DEFINITIONS.length,34);
 assert.equal(BATCH6_LESSONS.length,6);
 assert.equal(WORKSHOP_DEFINITIONS.length,243);
 assert.equal(WORKSHOP_LESSONS.length,45);
 assert.equal(new Set(WORKSHOP_DEFINITIONS.map(d=>d.id)).size,243);
 assert.equal(new Set(WORKSHOP_LESSONS.map(l=>l.id)).size,45);
 const expected=["finance-compound-growth","finance-loan-repayments","finance-break-even","finance-cashflow","finance-present-value","finance-sensitivity"];
 assert.deepEqual(BATCH6_LESSONS.map(l=>l.id),expected);
 for(const d of BATCH6_DEFINITIONS){
  assert.equal(definitionById(d.id),d);
  assert(d.category==="Finance"&&d.title&&d.meaning&&d.example,d.id);
  if(d.notation)assert(WORKSHOP_DEFINITION_FORMULAS[d.id]?.spoken,d.id+" has unregistered notation");
 }
 assert.equal(BATCH6_DEFINITIONS.filter(d=>d.notation).length,16);
 for(const l of BATCH6_LESSONS){
  assert.equal(lessonById(l.id),l);
  assert(l.category==="Finance & decisions",l.id);
  assert(l.skill&&l.when&&l.avoid&&l.formula&&l.ia,l.id);
  assert(l.worked.context&&l.worked.steps.length>=7&&l.worked.answer&&l.worked.interpretation,l.id);
  assert.equal(l.guided.parts.length,2,l.id);
  for(const part of l.guided.parts){
   assert(part.question&&part.hint&&part.feedback&&part.options.length>=3,l.id);
   assert(part.options.some(([key])=>key===part.correct),l.id+" checkpoint answer");
  }
  assert(l.independent.question&&l.independent.answer&&l.independent.reasoning,l.id);
  assert(l.technology.length>=2&&l.technology.every(t=>t.name&&t.command&&t.why),l.id);
  assert(resourceById(l.existingGuide),l.id+" tutorial missing");
  for(const id of l.relatedGuides||[])assert(resourceById(id),l.id+" related "+id);
  assert(representationTool(l.creator),l.id+" native creator missing");
  for(const id of l.definitionIds)assert(definitionById(id),l.id+" definition "+id);
  assert(WORKSHOP_LESSON_FORMULAS[l.id]?.length>=2,l.id+" accessible notation");
  assert(/assumptions|rate|feasib|limitations|comparison|uncertain|terms/i.test(l.ia),l.id+" needs mathematical judgement");
 }
});
test("Batch 6: 16 pathways still resolve, finance methods remain optional and explicit",()=>{
 assert.deepEqual(Object.keys(PATHWAY_LEARNING).sort(),INVESTIGATIVE_ROUTES.map(r=>r.id).sort());
 for(const [route,p] of Object.entries(PATHWAY_LEARNING)){
  assert.equal(new Set(p.terms).size,p.terms.length,route);
  assert.equal(new Set(p.lessons).size,p.lessons.length,route);
  for(const id of p.terms)assert(definitionById(id),route+" missing "+id);
  for(const id of p.lessons)assert(lessonById(id),route+" missing lesson "+id);
 }
 for(const l of BATCH6_LESSONS)assert(PATHWAY_LEARNING.finance.lessons.includes(l.id));
 for(const [method,id] of [["finance-compound","finance-compound-growth"],["finance-loan","finance-loan-repayments"],["finance-break-even","finance-break-even"],["finance-cashflow","finance-cashflow"]]){
  assert.equal(workshopLessonForEntry({methodId:method}),id);
 }
 assert.equal(workshopLessonForEntry({methodId:"other",title:"Finance loan and NPV"}),"");
 assert.equal(workshopLessonForEntry({methodId:"other",technique:"finance-loan"}),"");
 assert(!PATHWAY_LEARNING.proof.lessons.includes("finance-loan-repayments"));
});
test("Batch 6: nominal-to-period rate conversion and amount are arithmetically sound",()=>{
 const monthly=.06/12;
 approx(monthly,.005);
 approx(1200*(1+monthly)**12,1274.013374237398);
 approx(((1+monthly)**12-1)*100,6.167781186449828);
 approx(1200*(1+.06),1272);
 approx((1200*(1+monthly)**12-1272),2.013374237398);
 approx(1500*(1+.048/4)**8,1650.1953503077302);
 approx(((1+.048/4)**4-1)*100,4.887093273599996);
 const lesson=lessonById("finance-compound-growth");
 assert.match(lesson.avoid,/effective annual rate/i);
 assert.match(lesson.ia,/comparable|rate/i);
});
test("Batch 6: repayments match the closed formula, recurrence, interest and negative amortisation",()=>{
 const payment=(P,i,n)=>P*i/(1-(1+i)**(-n));
 const M=payment(1200,.01,12);
 approx(M,106.61854641400993);
 approx(1200*.01,12);
 approx(1200*(1+.01)-M,1105.3814535859901);
 approx(12*M-1200,79.42255696811912);
 let B=1200;for(let k=1;k<=12;k++)B=B*(1+.01)-M;approx(B,0,1e-8);
 const m=payment(600,.01,6);
 approx(m,103.52902002652878);
 approx(600*1.01-m,502.47097997347123);
 approx(6*m-600,21.17412015917273);
 approx(900*1.02-15,903);
 assert.match(lessonById("finance-loan-repayments").avoid,/end-of-period/);
 assert.match(lessonById("finance-loan-repayments").independent.reasoning,/monthly/);
});
test("Batch 6: break-even and sensitivity respect integer capacity and joint adverse scenarios",()=>{
 const profit=(p,v,F,q)=>(p-v)*q-F;
 approx(profit(11,5,120,30),60);
 approx(profit(11,5,120,19),-6);
 approx(120/(11-5),20);
 approx(profit(15,6,180,18),-18);
 assert(180/(15-6)>18,"Required break-even exceeds capacity");
 assert((10-12)<0,"Nonpositive margin with positive fixed cost cannot break even");
 approx(profit(15,6,180,25),45);
 approx(profit(13,6,180,25),-5);
 approx(profit(15,8,180,25),-5);
 approx(profit(13,8,180,25),-55);
 approx(6+180/25,13.2);
 approx(Math.ceil(100/(7-4)),34);
 approx(profit(12,6,150,30),30);
 approx(profit(11,6,150,30),0);
 approx(profit(12,7,150,30),0);
 approx(profit(11,7,150,30),-30);
 assert.match(lessonById("finance-sensitivity").avoid,/one-variable-at-a-time/i);
});
test("Batch 6: cash running balances reconcile, and a loss of liquidity is not profit",()=>{
 const flows=[[150,100],[60,170],[110,145]];let B=80;
 assert.deepEqual(flows.map(([inflow,outflow])=>(B+=inflow-outflow)),[130,20,-15]);
 approx(80+flows.reduce((a,[i,o])=>a+i-o,0),-15);
 approx(120+90-150,60);
 approx(60+50-140,-30);
 assert.match(lessonById("finance-cashflow").avoid,/cash-flow table is not automatically a profit statement/);
 assert.match(lessonById("finance-cashflow").worked.interpretation,/inside each month/);
});
test("Batch 6: discounting handles time-zero flows and annual periods correctly",()=>{
 const npv=-1000+600/1.1+600/1.1**2;
 approx(npv,41.32231404958662);
 approx(-1000+600+600,200);
 approx(110/1.1,100);
 approx(-400+250/1.1+250/1.1**2,33.88429752066111);
 assert.match(lessonById("finance-present-value").avoid,/first argument cash flow as the end of period one/i);
 assert.match(lessonById("finance-present-value").technology[0].command,/-1000\+NPV/);
});
test("Batch 6: verified finance tutorials remain optional, searchable and read-only",()=>{
 assert.equal(RESOURCES.length,36);
 for(const id of ["finance-model-sheet","finance-loan-sheet"]){
  const r=resourceById(id);
  assert(r?.tool==="sheets"&&r.category==="Financial models");
  assert(r.steps.length>=5&&r.check&&r.after&&r.when,r.id);
  assert(r.sources.every(x=>x.publisher==="Google Docs Editors Help"&&x.checkedAt==="2026-10-25"&&x.url.startsWith("https://support.google.com/docs/")));
  assert.equal(r.videos.length,0);
 }
 assert.match(resourceById("finance-model-sheet").steps.join(" "),/time-zero/i);
 assert.match(resourceById("finance-loan-sheet").steps.join(" "),/closing balance/i);
});
test("Batch 6: two checkpoints, practice reveals, route filters and creators never overwrite an IA",()=>{
 const s=createProjectState();
 s.planning.fields.course="AI SL";
 s.entries=[{id:"my-finance-stage",phase:"substantial",methodId:"finance-loan",status:"completed",result:"My genuine loan modelling is here"}];
 const before=saved(s),u=newResourceSession();
 assert(resourceAction(s,u,"resource-workshop",{workshopRoute:"finance"}).ok);
 assert(workshopList(u).includes("Model a loan payment"));
 assert(workshopList(u).includes("Discount cash flows"));
 assert(resourceFilter(u,"workshopQuery","liquidity"));
 assert(workshopList(u).includes("Track cash flow"));
 assert(resourceFilter(u,"workshopQuery",""));
 for(const l of BATCH6_LESSONS){
  assert(resourceAction(s,u,"resource-workshop-lesson",{workshopId:l.id}).ok,l.id);
  let html=renderWorkshop(s,u);
  assert(html.includes('data-workshop-lesson="'+l.id+'"'),l.id);
  assert(html.includes('data-resource-id="'+l.existingGuide+'"'),l.id);
  assert(html.includes('data-resource-creator="'+l.creator+'"'),l.id);
  assert(html.includes("not a course recommendation")&&html.includes("fictional worked calculations"),l.id);
  assert(!/<script|<iframe|onerror=/i.test(html),l.id);
  assert(resourceAction(s,u,"resource-workshop-step",{workshopStep:"help"}).ok,l.id);
  for(let i=0;i<2;i++){
   assert(renderWorkshop(s,u).includes("Checkpoint "+(i+1)+" of 2"),l.id);
   assert(resourceAction(s,u,"resource-workshop-choice",{workshopChoice:l.guided.parts[i].correct}).ok,l.id);
   assert(renderWorkshop(s,u).includes("That's right"),l.id);
   if(i===0)assert(resourceAction(s,u,"resource-workshop-checkpoint",{workshopDirection:1}).ok,l.id);
  }
  assert(resourceAction(s,u,"resource-workshop-step",{workshopStep:"turn"}).ok);
  assert(renderWorkshop(s,u).includes("Reveal answer and reasoning"));
 }
 assert.equal(saved(s),before);
});
