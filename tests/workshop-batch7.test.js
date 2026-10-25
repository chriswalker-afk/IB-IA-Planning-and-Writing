import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {newResourceSession} from "../src/resources/state.js";
import {resourceAction,resourceFilter} from "../src/resources/actions.js";
import {renderWorkshop,workshopList} from "../src/workshop/views.js";
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,definitionById,lessonById,workshopLessonForEntry} from "../src/workshop/catalog.js";
import {BATCH7_DEFINITIONS} from "../src/workshop/batch-7-definitions.js";
import {BATCH7_LESSONS} from "../src/workshop/batch-7-lessons.js";
import {WORKSHOP_LESSON_FORMULAS,WORKSHOP_DEFINITION_FORMULAS} from "../src/workshop/math-notation.js";
import {resourceById,RESOURCES} from "../src/resources/catalog.js";
import {representationTool} from "../src/diagrams/representation-registry.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";

const close=(a,b,eps=1e-10)=>assert(Math.abs(a-b)<eps,a+" not close to "+b);
const snapshot=s=>JSON.stringify({entries:s.entries,planning:s.planning,completion:s.completion,project:s.project,scratch:s.scratch,resources:s.resources});

test("Batch 7: 40 domain-conscious glossary terms, seven complete read-only lessons, accessible formulas and real resources",()=>{
 assert.equal(BATCH7_DEFINITIONS.length,40);
 assert.equal(BATCH7_DEFINITIONS.filter(d=>d.category==="Proof").length,18);
 assert.equal(BATCH7_DEFINITIONS.filter(d=>d.category==="Iteration").length,22);
 assert.equal(BATCH7_DEFINITIONS.filter(d=>d.notation).length,21);
 assert.equal(BATCH7_LESSONS.length,7);
 assert.equal(WORKSHOP_DEFINITIONS.length,230);
 assert.equal(WORKSHOP_LESSONS.length,42);
 assert.equal(new Set(WORKSHOP_DEFINITIONS.map(d=>d.id)).size,230);
 assert.equal(new Set(WORKSHOP_LESSONS.map(l=>l.id)).size,42);
 assert.deepEqual(BATCH7_LESSONS.map(l=>l.id),[
  "proof-conjectures","proof-direct-reasoning","proof-induction-patterns",
  "iteration-sequences","iteration-fixed-points","iteration-bisection","iteration-newton"
 ]);
 for(const d of BATCH7_DEFINITIONS){
  assert.equal(definitionById(d.id),d);
  assert(d.title&&d.category&&d.meaning&&d.example,d.id);
  if(d.notation)assert(WORKSHOP_DEFINITION_FORMULAS[d.id]?.spoken,d.id+" missing spoken formula");
 }
 for(const l of BATCH7_LESSONS){
  assert.equal(lessonById(l.id),l);
  assert(l.skill&&l.when&&l.avoid&&l.formula&&l.ia,l.id);
  assert(l.worked.context&&l.worked.steps.length===7&&l.worked.answer&&l.worked.interpretation,l.id);
  assert.equal(l.guided.parts.length,2,l.id);
  for(const part of l.guided.parts){
   assert(part.question&&part.hint&&part.feedback&&part.options.length>=3,l.id);
   assert(part.options.some(([k])=>k===part.correct),l.id);
  }
  assert(l.independent.question&&l.independent.answer&&l.independent.reasoning,l.id);
  assert(l.technology.length>=2&&l.technology.every(t=>t.name&&t.command&&t.why),l.id);
  assert(resourceById(l.existingGuide),l.id+" missing tutorial");
  for(const id of l.relatedGuides||[])assert(resourceById(id),l.id+" missing guide "+id);
  assert(representationTool(l.creator),l.id+" missing native creator");
  for(const id of l.definitionIds)assert(definitionById(id),l.id+" missing definition "+id);
  assert(WORKSHOP_LESSON_FORMULAS[l.id]?.length>=2,l.id+" missing typeset maths");
  assert(/proof|claim|argument|reason|limit|method|convergence|conclusion|precision|iteration/i.test(l.ia),l.id+" needs mathematical narrative");
 }
});
test("Batch 7: all sixteen pathways remain grounded; proof and iteration are now fully available",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.deepEqual(Object.keys(PATHWAY_LEARNING).sort(),INVESTIGATIVE_ROUTES.map(r=>r.id).sort());
 for(const [r,p] of Object.entries(PATHWAY_LEARNING)){
  assert.equal(new Set(p.terms).size,p.terms.length,r);
  assert.equal(new Set(p.lessons).size,p.lessons.length,r);
  for(const id of p.terms)assert(definitionById(id),r+" term "+id);
  for(const id of p.lessons)assert(lessonById(id),r+" lesson "+id);
 }
 for(const l of BATCH7_LESSONS){
  const pathway=l.id.startsWith("proof-")?"proof":"iteration";
  assert(PATHWAY_LEARNING[pathway].lessons.includes(l.id),l.id);
 }
 assert.equal(PATHWAY_LEARNING.proof.lessons.length,3);
 assert.equal(PATHWAY_LEARNING.iteration.lessons.length,4);
 assert.deepEqual(["proof","induction","iteration","recurrence","bisection","newton-raphson"].map(methodId=>
  workshopLessonForEntry({methodId})),[
   "proof-direct-reasoning","proof-induction-patterns","iteration-fixed-points","iteration-sequences","iteration-bisection","iteration-newton"
  ]);
 assert.equal(workshopLessonForEntry({methodId:"other",title:"Maybe a proof by induction"}),"");
 assert.equal(workshopLessonForEntry({methodId:"other",technique:"bisection from other investigation"}),"");
});
test("Batch 7: a valid counterexample disproves a universal claim but finite tests never establish it",()=>{
 const f=n=>n*n+n+1;
 assert.deepEqual([1,2,3,4].map(f),[3,7,13,21]);
 assert.equal(f(4),3*7);
 const independent=n=>n*n-n+1;
 assert.deepEqual([2,3,4,5].map(independent),[3,7,13,21]);
 for(let n=-20;n<=20;n++){
  assert.equal((n+1)**2-n*n,2*n+1);
  assert.equal(((n+1)**2-n*n)%2===0,false);
  assert.equal(n*(n+1)%2,0);
 }
 const l=lessonById("proof-conjectures");
 assert.match(l.avoid,/not a deductive proof/);
 assert.match(l.worked.steps.join(" "),/counterexample/);
 assert.match(lessonById("proof-direct-reasoning").worked.steps.join(" "),/CONVERSE/);
});
test("Batch 7: induction works with a valid base and algebraic k-to-k+1 step",()=>{
 for(let n=1;n<=30;n++){
  const odds=Array.from({length:n},(_,k)=>2*k+1);
  const evens=Array.from({length:n},(_,k)=>2*(k+1));
  assert.equal(odds.reduce((a,b)=>a+b,0),n*n);
  assert.equal(evens.reduce((a,b)=>a+b,0),n*(n+1));
  assert.equal(n*n+(2*n+1),(n+1)**2);
  assert.equal(n*(n+1)+2*(n+1),(n+1)*(n+2));
 }
 const l=lessonById("proof-induction-patterns");
 assert.match(l.avoid,/not induction/);
 assert.match(l.avoid,/teacher/);
 assert.match(l.independent.answer,/k\(k\+1\)/);
});
test("Batch 7: recurrence, explicit form and partial-sum indices agree",()=>{
 const a=n=>4*n-1;let cumulative=0;for(let n=1;n<=25;n++){cumulative+=a(n);assert.equal(cumulative,n*(2*n+1))}
 assert.deepEqual([1,2,3,4].map(a),[3,7,11,15]);
 assert.equal(a(4),15);
 const b=n=>2*3**(n-1);
 assert.deepEqual([1,2,3].map(b),[2,6,18]);
 assert.equal([1,2,3].map(b).reduce((x,y)=>x+y,0),26);
 const independ=n=>3*n+2;
 assert.deepEqual([1,2,3,4].map(independ),[5,8,11,14]);
 assert.equal([1,2,3,4].map(independ).reduce((x,y)=>x+y,0),38);
 for(let n=1;n<=20;n++)close(Array.from({length:n},(_,i)=>independ(i+1)).reduce((x,y)=>x+y,0),n*(3*n+7)/2);
 assert.match(lessonById("iteration-sequences").avoid,/finite partial sum/);
});
test("Batch 7: fixed-point convergence has a proved contraction; a fixed point need not attract",()=>{
 let x=0;
 for(let n=0;n<=16;n++){
  close(x,1-3**(-n));
  close(Math.abs(x-1),3**(-n));
  x=(x+2)/3;
 }
 let y=0;
 for(let n=0;n<=8;n++){close(y,1-5**(-n));y=(y+4)/5}
 close(y,1-5**(-9));
 let z=0;
 assert.deepEqual(Array.from({length:4},()=>{let v=z;z=2-z;return v}),[0,2,0,2]);
 const l=lessonById("iteration-fixed-points");
 assert.match(l.avoid,/fixed point equation alone cannot establish convergence/i);
 assert.match(l.worked.steps.join(" "),/error/);
});
test("Batch 7: bisection signs, retained endpoints and midpoint error bounds are correct",()=>{
 const f=x=>x*x-2;
 const brackets=[[1,2],[1,1.5],[1.25,1.5],[1.375,1.5]];
 let a=1,b=2;
 for(let k=0;k<3;k++){
  assert.deepEqual([a,b],brackets[k]);
  assert(f(a)<0&&f(b)>0);
  const m=(a+b)/2;
  if(f(m)<0)a=m;else b=m;
 }
 assert.deepEqual([a,b],brackets[3]);
 assert(f(a)<0&&f(b)>0);
 close((a+b)/2,1.4375);
 close((b-a)/2,.0625);
 assert(Math.abs((a+b)/2-Math.SQRT2)<=.0625);
 const g=x=>x*x-3;let u=1,v=2;
 for(let k=0;k<3;k++){const m=(u+v)/2;assert(g(u)*g(v)<0);if(g(m)<0)u=m;else v=m}
 assert.deepEqual([u,v],[1.625,1.75]);close((u+v)/2,1.6875);
 assert(Math.abs((u+v)/2-Math.sqrt(3))<=.0625);
 const l=lessonById("iteration-bisection");
 assert.match(l.avoid,/continuity/);assert.match(l.avoid,/residual/i);
 assert.match(l.worked.answer,/0.0625/);
});
test("Batch 7: Newton updates, exact residuals and zero-derivative hazard are correct",()=>{
 const update=(x,c)=>(x+c/x)/2;
 let x=1.5;x=update(x,2);close(x,17/12);x=update(x,2);close(x,577/408);
 close(x*x-2,1/166464,1e-12);
 assert(Math.abs(x-Math.SQRT2)<.000003);
 let y=2;y=update(y,3);close(y,7/4);y=update(y,3);close(y,97/56);
 close(y*y-3,1/3136,1e-12);
 const l=lessonById("iteration-newton");
 assert.match(l.avoid,/f'\(x_n\)=0/);
 assert.match(l.avoid,/not by itself/);
 assert.match(l.worked.steps.join(" "),/residual/);
});
test("Batch 7: official tutorial links exist and make a clear separation between experiment, proof and a certified numerical answer",()=>{
 assert.equal(RESOURCES.length,36);
 const proof=resourceById("proof-exploration"),iteration=resourceById("iteration-sheet");
 for(const r of [proof,iteration]){
  assert(r?.category==="Proof and iteration");
  assert(r.steps.length>=5&&r.check&&r.after&&r.when);
  assert(r.sources.every(s=>s.checkedAt==="2026-10-25"&&s.url.startsWith("https://")&&s.publisher));
  assert(r.videos.length===0);
  assert(r.related.length<=2&&r.related.every(resourceById));
 }
 assert.equal(proof.tool,"desmos");assert.equal(iteration.tool,"sheets");
 assert.match(JSON.stringify(proof),/cannot silently become a general proof/);
 assert.match(JSON.stringify(iteration),/half-width|bracket/);
});
test("Batch 7: two guided checkpoints, native creators and independent answers remain read-only",()=>{
 const s=createProjectState();s.planning.fields.course="AA SL";s.planning.fields.aim="My actual investigation";
 s.entries=[{id:"genuine-stage",phase:"substantial",methodId:"proof",status:"completed",result:"My genuine argument"}];
 const before=snapshot(s),session=newResourceSession();
 assert(resourceAction(s,session,"resource-workshop",{workshopRoute:"proof"}).ok);
 assert(workshopList(session).includes("Build a direct algebraic proof"));
 assert(workshopList(session).includes("Prove a sequence pattern by induction"));
 assert(resourceFilter(session,"workshopRoute","iteration"));
 assert(workshopList(session).includes("Bracket a root"));
 for(const l of BATCH7_LESSONS){
  assert(resourceAction(s,session,"resource-workshop-lesson",{workshopId:l.id}).ok,l.id);
  let html=renderWorkshop(s,session);
  assert(html.includes('data-workshop-lesson="'+l.id+'"'),l.id);
  assert(html.includes('data-resource-id="'+l.existingGuide+'"'),l.id);
  assert(html.includes('data-resource-creator="'+l.creator+'"'),l.id);
  assert(html.includes("not a course recommendation")&&html.includes("fictional worked calculations"),l.id);
  assert(!/<script|<iframe|onerror=/i.test(html),l.id);
  assert(resourceAction(s,session,"resource-workshop-step",{workshopStep:"help"}).ok);
  for(let i=0;i<2;i++){
   assert(renderWorkshop(s,session).includes("Checkpoint "+(i+1)+" of 2"),l.id);
   assert(resourceAction(s,session,"resource-workshop-choice",{workshopChoice:l.guided.parts[i].correct}).ok,l.id);
   assert(renderWorkshop(s,session).includes("That's right"),l.id);
   if(i===0)assert(resourceAction(s,session,"resource-workshop-checkpoint",{workshopDirection:1}).ok,l.id);
  }
  assert(resourceAction(s,session,"resource-workshop-step",{workshopStep:"turn"}).ok);
  assert(renderWorkshop(s,session).includes("Reveal answer and reasoning"),l.id);
 }
 assert.equal(snapshot(s),before);
});
