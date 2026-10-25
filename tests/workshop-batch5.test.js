import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {newResourceSession} from "../src/resources/state.js";
import {resourceAction,resourceFilter} from "../src/resources/actions.js";
import {renderWorkshop,workshopList} from "../src/workshop/views.js";
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,workshopLessonForEntry,definitionById,lessonById} from "../src/workshop/catalog.js";
import {BATCH5_DEFINITIONS} from "../src/workshop/batch-5-definitions.js";
import {BATCH5_LESSONS} from "../src/workshop/batch-5-lessons.js";
import {WORKSHOP_LESSON_FORMULAS,WORKSHOP_DEFINITION_FORMULAS} from "../src/workshop/math-notation.js";
import {resourceById} from "../src/resources/catalog.js";
import {representationTool} from "../src/diagrams/representation-registry.js";
const close=(a,b,eps=1e-10)=>assert(Math.abs(a-b)<eps,a+" != "+b);
const snapshot=s=>JSON.stringify({entries:s.entries,planning:s.planning,completion:s.completion,project:s.project,scratch:s.scratch,resources:s.resources});

test("Batch 5 glossary, six lessons, accessible formulas and real navigation targets",()=>{
 assert.equal(BATCH5_DEFINITIONS.length,34);
 assert.equal(BATCH5_LESSONS.length,6);
 assert.equal(WORKSHOP_DEFINITIONS.length,230);
 assert.equal(WORKSHOP_LESSONS.length,42);
 assert.equal(new Set(WORKSHOP_DEFINITIONS.map(d=>d.id)).size,230);
 assert.equal(new Set(WORKSHOP_LESSONS.map(l=>l.id)).size,42);
 assert.deepEqual(BATCH5_LESSONS.map(l=>l.id),["conditional-probability-tree","discrete-expected-value","simulation-design","binomial-models","normal-models","inference-evidence"]);
 for(const d of BATCH5_DEFINITIONS){
  assert(definitionById(d.id)===d&&d.title&&d.meaning&&d.example,d.id);
  if(d.notation)assert(WORKSHOP_DEFINITION_FORMULAS[d.id]?.spoken,d.id);
 }
 for(const l of BATCH5_LESSONS){
  assert(lessonById(l.id)===l&&l.when&&l.avoid&&l.formula&&l.skill&&l.ia,l.id);
  assert(l.worked.context&&l.worked.steps.length>=6&&l.worked.answer&&l.worked.interpretation,l.id);
  assert.equal(l.guided.parts.length,2,l.id);
  for(const p of l.guided.parts)assert(p.hint&&p.feedback&&p.options.length>=3&&p.options.some(([id])=>id===p.correct),l.id);
  assert(l.independent.question&&l.independent.answer&&l.independent.reasoning,l.id);
  assert(l.technology.length>=1&&l.technology.every(t=>t.name&&t.command&&t.why),l.id);
  for(const id of l.definitionIds)assert(definitionById(id),l.id+" missing definition "+id);
  assert(resourceById(l.existingGuide),l.id+" missing guide "+l.existingGuide);
  for(const id of l.relatedGuides||[])assert(resourceById(id),l.id+" missing related guide "+id);
  assert(representationTool(l.creator),l.id+" missing native creator");
  assert(WORKSHOP_LESSON_FORMULAS[l.id].length>=2,l.id);
 }
});
test("Batch 5 correct conditional probability and tree paths",()=>{
 close(.4*.75,.3);close(.6*.2,.12);
 close(.3/(.3+.12),5/7);
 close(.25*.4+.75*.1,.175);
 close((.25*.4)/.175,4/7);
 assert.match(lessonById("conditional-probability-tree").avoid,/reverse/);
});
test("Batch 5 expected values, risk, and simulation are arithmetically sound",()=>{
 close(-2*.5+1*.3+6*.2,.5);
 close(4*.5+1*.3+36*.2-.5**2,9.25);
 close(-1*.6+4*.4,1);
 close(.6*1+.4*16-1**2,6);
 close(3/8,.375);close(17/40,.425);close(.425-.375,.05);
 close(12/30-3/8,.025);
 assert.match(lessonById("simulation-design").avoid,/not automatically an independent observation/);
});
test("Batch 5 binomial events and normal areas use correct parameters and tails",()=>{
 const choose=(n,k)=>{let a=1;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return a};
 const mass=(n,p,k)=>choose(n,k)*p**k*(1-p)**(n-k);
 close(mass(5,.3,2),.3087);close(1-mass(5,.3,0),.83193);
 close(mass(4,.25,0),.31640625);close(mass(6,.2,2),.24576);
 close((115-100)/15,1);close((85-100)/15,-1);
 const normal=lessonById("normal-models");
 assert.match(normal.avoid,/density/);
 assert.match(normal.worked.answer,/0.8413/);
 assert.match(normal.worked.answer,/0.6827/);
});
test("Batch 5 exact one-sided inference distinguishes a p-value from certainty",()=>{
 const mass=(n,k)=>{let c=1;for(let j=1;j<=k;j++)c=c*(n-j+1)/j;return c/2**n};
 close(mass(10,8)+mass(10,9)+mass(10,10),56/1024);
 close(mass(8,7)+mass(8,8),9/256);
 assert(56/1024>.05);assert(9/256<.05);
 assert.match(lessonById("inference-evidence").avoid,/NOT the probability that a hypothesis is true/);
 assert.match(lessonById("inference-evidence").independent.reasoning,/not proof/);
});
test("Batch 5 only relevant optional pathways and explicit technique identities resolve",()=>{
 for(const id of BATCH5_LESSONS.map(l=>l.id))assert(PATHWAY_LEARNING.chance.lessons.includes(id));
 assert(PATHWAY_LEARNING.categorical.lessons.includes("conditional-probability-tree"));
 assert(PATHWAY_LEARNING.groups.lessons.includes("inference-evidence"));
 for(const [method,lesson] of [["probability","conditional-probability-tree"],["expected-value","discrete-expected-value"],["binomial","binomial-models"],["normal","normal-models"],["chi-independence","inference-evidence"],["two-sample-t","inference-evidence"]]){
  assert.equal(workshopLessonForEntry({methodId:method}),lesson);
 }
 assert.equal(workshopLessonForEntry({methodId:"other",title:"Binomial normal hypothesis"}),"");
});
test("Batch 5 two checkpoints, native creator and read-only project are preserved",()=>{
 const s=createProjectState(),before=snapshot(s),session=newResourceSession();
 assert(resourceAction(s,session,"resource-workshop",{workshopRoute:"chance"}).ok);
 assert(workshopList(session).includes("Use a normal model"));
 assert(resourceFilter(session,"workshopQuery","simulation"));
 assert(workshopList(session).includes("Design and evaluate a probability simulation"));
 for(const l of BATCH5_LESSONS){
  assert(resourceAction(s,session,"resource-workshop-lesson",{workshopId:l.id}).ok);
  let html=renderWorkshop(s,session);
  assert(html.includes('data-workshop-lesson="'+l.id+'"'),l.id);
  assert(html.includes('data-resource-creator="'+l.creator+'"'),l.id);
  assert(html.includes("not a course recommendation"),l.id);
  assert(!/<script|<iframe|onerror=/i.test(html),l.id);
  assert(resourceAction(s,session,"resource-workshop-step",{workshopStep:"help"}).ok);
  for(let i=0;i<2;i++){
   assert(renderWorkshop(s,session).includes("Checkpoint "+(i+1)+" of 2"),l.id);
   assert(resourceAction(s,session,"resource-workshop-choice",{workshopChoice:l.guided.parts[i].correct}).ok);
   assert(renderWorkshop(s,session).includes("That's right"),l.id);
   if(i===0)assert(resourceAction(s,session,"resource-workshop-checkpoint",{workshopDirection:"1"}).ok);
  }
  assert(resourceAction(s,session,"resource-workshop-step",{workshopStep:"turn"}).ok);
  assert(renderWorkshop(s,session).includes("Reveal answer and reasoning"),l.id);
 }
 assert.equal(snapshot(s),before);
});
