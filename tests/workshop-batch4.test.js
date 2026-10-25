import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {BATCH4_DEFINITIONS} from "../src/workshop/batch-4-definitions.js";
import {BATCH4_LESSONS} from "../src/workshop/batch-4-lessons.js";
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,lessonById,definitionById,workshopLessonForEntry} from "../src/workshop/catalog.js";
import {WORKSHOP_LESSON_FORMULAS,WORKSHOP_DEFINITION_FORMULAS} from "../src/workshop/math-notation.js";
import {resourceById} from "../src/resources/catalog.js";
import {representationTool} from "../src/diagrams/representation-registry.js";
import {resourceAction,resourceFilter} from "../src/resources/actions.js";
import {newResourceSession} from "../src/resources/state.js";
import {renderWorkshop,workshopList} from "../src/workshop/views.js";

const close=(a,b,eps=1e-9)=>assert(Math.abs(a-b)<eps,String(a)+" differs from "+String(b));
const state=()=>createProjectState();
const authored=s=>JSON.stringify({entries:s.entries,planning:s.planning,completion:s.completion,project:s.project,scratch:s.scratch,resources:s.resources});

test("Batch 4: exactly 22 distinct definitions and five complete geometry lessons",()=>{
 assert.equal(BATCH4_DEFINITIONS.length,22);
 assert.equal(BATCH4_LESSONS.length,5);
 assert.equal(WORKSHOP_DEFINITIONS.length,156);
 assert.equal(WORKSHOP_LESSONS.length,29);
 assert.equal(new Set(BATCH4_DEFINITIONS.map(d=>d.id)).size,22);
 const expected=["image-calibration","triangulation","geometric-areas","voronoi-regions","geometry-sensitivity"];
 assert.deepEqual(BATCH4_LESSONS.map(l=>l.id),expected);
 for(const d of BATCH4_DEFINITIONS)assert(definitionById(d.id)===d&&d.title&&d.meaning&&d.example,d.id);
 for(const l of BATCH4_LESSONS){
  assert.equal(lessonById(l.id),l);
  assert(l.title&&l.when&&l.avoid&&l.formula&&l.ia&&l.skill,l.id);
  assert(l.worked.context&&l.worked.steps.length>=6&&l.worked.answer&&l.worked.interpretation,l.id);
  assert.equal(l.guided.parts.length,2,l.id);
  for(const part of l.guided.parts){
   assert(part.question&&part.hint&&part.feedback&&part.options.length>=3,l.id);
   assert(part.options.some(([key])=>key===part.correct),l.id);
  }
  assert(l.independent.question&&l.independent.answer&&l.independent.reasoning,l.id);
  assert(l.technology.length>=1&&l.technology.every(t=>t.name&&t.command&&t.why),l.id);
  assert(resourceById(l.existingGuide),l.id+" existing guide");
  for(const id of l.relatedGuides||[])assert(resourceById(id),l.id+" related "+id);
  assert(representationTool(l.creator),l.id+" creator");
  for(const id of l.definitionIds)assert(definitionById(id),l.id+" definition "+id);
  assert(WORKSHOP_LESSON_FORMULAS[l.id]?.length>=2,l.id+" accessible formula");
 }
 for(const d of BATCH4_DEFINITIONS.filter(d=>d.notation))assert(WORKSHOP_DEFINITION_FORMULAS[d.id],d.id+" accessible notation");
});
test("Batch 4: all sixteen investigative pathways still resolve with relevant geometry additions",()=>{
 assert.deepEqual(Object.keys(PATHWAY_LEARNING).sort(),INVESTIGATIVE_ROUTES.map(r=>r.id).sort());
 for(const r of INVESTIGATIVE_ROUTES){
  const p=PATHWAY_LEARNING[r.id];assert(p,r.id);
  assert.equal(new Set(p.terms).size,p.terms.length,r.id);
  assert.equal(new Set(p.lessons).size,p.lessons.length,r.id);
  for(const id of p.terms)assert(definitionById(id),r.id+" missing definition "+id);
  for(const id of p.lessons)assert(lessonById(id),r.id+" missing lesson "+id);
 }
 assert(PATHWAY_LEARNING.images.lessons.includes("image-calibration"));
 assert(PATHWAY_LEARNING.images.lessons.includes("geometric-areas"));
 assert(PATHWAY_LEARNING.triangulation.lessons.includes("triangulation"));
 assert(PATHWAY_LEARNING.voronoi.lessons.includes("voronoi-regions"));
 assert(PATHWAY_LEARNING.optimisation.lessons.includes("geometry-sensitivity"));
 assert.equal(workshopLessonForEntry({methodId:"voronoi",title:"My results"}),"voronoi-regions");
 assert.equal(workshopLessonForEntry({methodId:"triangulation"}),"triangulation");
 assert.equal(workshopLessonForEntry({methodId:"geometric-model"}),"geometric-areas");
 assert.equal(workshopLessonForEntry({methodId:"other",title:"Voronoi"}),"");
});
test("Batch 4: image scale, pixel distance, planar area and independent task calculations are correct",()=>{
 const s=2.5/100,dx=160-40,dy=140-50;
 close(s,0.025);
 close(Math.hypot(dx,dy),150);
 close(s*Math.hypot(dx,dy),3.75);
 close(600*s*s,0.375);
 close(3/150,0.02);
 close((3/150)*Math.hypot(130-10,110-20),3);
 const l=lessonById("image-calibration");
 assert.match(l.avoid,/perspective/i);
 assert.match(l.ia,/reference|calibration/i);
});
test("Batch 4: triangulation uses the correct opposite sides and angle/bearing distinction",()=>{
 const rad=x=>Math.PI*x/180;
 const ac=100*Math.sin(rad(60))/Math.sin(rad(90));
 const bc=100*Math.sin(rad(30))/Math.sin(rad(90));
 close(ac,50*Math.sqrt(3));
 close(bc,50);
 close(ac*ac+bc*bc,100*100);
 close(80*Math.sin(rad(45)),40*Math.sqrt(2));
 close(120*Math.sin(rad(60)),60*Math.sqrt(3));
 assert.match(lessonById("triangulation").avoid,/bearings/i);
});
test("Batch 4: composite area, prism volume, and area similarity work as described",()=>{
 close(10*8-4*3,68);
 close((10*8-4*3)*0.25,17);
 close(6*5-2*3,24);
 close(12*9-3*4,96);
 close((12*9-3*4)*0.2,19.2);
 close(3*3,9);
 assert.match(lessonById("geometric-areas").avoid,/volume/i);
});
test("Batch 4: Voronoi equal-distance vertex and clipped-bisector counterexample are correct",()=>{
 const A=[0,0],B=[8,0],C=[4,6],V=[4,5/3],P=[4,2];
 const d=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
 close(d(V,A),13/3);close(d(V,B),13/3);close(d(V,C),13/3);
 assert(d(P,C)<d(P,A));
 close(d(P,A),d(P,B));
 const q=[5,39/16],a=[0,0],b=[10,0],c=[5,8];
 close(d(q,a),89/16);close(d(q,b),89/16);close(d(q,c),89/16);
 assert.match(lessonById("voronoi-regions").avoid,/metric/i);
});
test("Batch 4: worst-case bounds and sensitivity arithmetic distinguish limits from certainty",()=>{
 close(10*4,40);
 close(9.9*3.9,38.61);
 close(10.1*4.1,41.41);
 close(40-38.61,1.39);
 close(41.41-40,1.41);
 close(5.9*2.9,17.11);
 close(6.1*3.1,18.91);
 const l=lessonById("geometry-sensitivity");
 assert.match(l.avoid,/not statistical confidence intervals/i);
 assert.match(l.worked.interpretation,/assumptions|measurements/i);
});
test("Batch 4: guided practice, route search and native tool links remain read-only",()=>{
 const s=state(),before=authored(s),session=newResourceSession();
 assert(resourceAction(s,session,"resource-workshop",{workshopRoute:"voronoi"}).ok);
 assert.equal(session.workshopRoute,"voronoi");
 assert(workshopList(session).includes("Build and check a Voronoi nearest-site region"));
 assert(resourceFilter(session,"workshopQuery","perpendicular bisector"));
 assert(workshopList(session).includes("Perpendicular bisector"));
 assert(resourceAction(s,session,"resource-workshop-lesson",{workshopId:"voronoi-regions"}).ok);
 assert.equal(session.workshopStep,"show");
 assert(resourceAction(s,session,"resource-workshop-step",{workshopStep:"help"}).ok);
 assert(renderWorkshop(s,session).includes("Checkpoint 1 of 2"));
 assert(resourceAction(s,session,"resource-workshop-choice",{workshopChoice:"3"}).ok);
 assert(renderWorkshop(s,session).includes("That's right"));
 assert(resourceAction(s,session,"resource-workshop-checkpoint",{workshopDirection:"1"}).ok);
 assert(resourceAction(s,session,"resource-workshop-choice",{workshopChoice:"C"}).ok);
 assert(renderWorkshop(s,session).includes("That's right"));
 const html=renderWorkshop(s,session);
 assert(html.includes('data-resource-creator="voronoi"'));
 assert(html.includes('data-resource-id="image-points"'));
 assert(resourceAction(s,session,"resource-creator-open",{resourceCreator:"voronoi"}).ok);
 assert(resourceAction(s,session,"resource-workshop-step",{workshopStep:"turn"}).ok);
 assert(renderWorkshop(s,session).includes("Reveal answer and reasoning"));
 assert.equal(authored(s),before);
});
test("Batch 4: route choice does not automatically modify project evidence or validate syllabus suitability",()=>{
 const s=state(),before=JSON.stringify(s),session=newResourceSession();
 for(const l of BATCH4_LESSONS){
  resourceAction(s,session,"resource-workshop-lesson",{workshopId:l.id});
  const html=renderWorkshop(s,session);
  assert(html.includes('data-workshop-lesson="'+l.id+'"'),l.id);
  assert(html.includes("not a course recommendation"),l.id);
  assert(!/<script|<iframe|autoplay/i.test(html),l.id);
  assert(!html.includes("Your IA has been updated"),l.id);
 }
 assert.equal(JSON.stringify(s),before);
});
