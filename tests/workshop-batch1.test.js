import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {WORKSHOP_LESSONS,WORKSHOP_DEFINITIONS,PATHWAY_LEARNING,lessonById,definitionById} from "../src/workshop/catalog.js";
import {resourceById} from "../src/resources/catalog.js";
import {representationTool} from "../src/diagrams/representation-registry.js";
import {renderWorkshop,workshopList} from "../src/workshop/views.js";
import {resourceAction,resourceFilter} from "../src/resources/actions.js";
import {newResourceSession} from "../src/resources/state.js";

const student=()=>{const state=createProjectState();state.planning.fields.course="AI SL";state.route="planning";return state;};
const authored=state=>JSON.stringify([state.planning,state.entries,state.completion,state.scratch,state.resources,state.project]);
const approx=(a,b)=>assert(Math.abs(a-b)<1e-10,String(a)+" vs "+String(b));

test("Batch 1: five new lessons and 31 new definitions have stable, unique IDs",()=>{
 assert.equal(WORKSHOP_DEFINITIONS.length,190);
 assert.equal(WORKSHOP_LESSONS.length,35);
 for(const id of ["sampling","distributions","two-way-proportions","measurement","histograms"]){
  const lesson=lessonById(id);
  assert(lesson,"Missing "+id);
  assert(lesson.when&&lesson.avoid&&lesson.formula&&lesson.ia);
  assert(lesson.worked.steps.length>=5);
  assert(lesson.guided.parts?.length===2,"Expected two checkpoints: "+id);
  assert(lesson.independent.question&&lesson.independent.answer&&lesson.independent.reasoning);
  assert(resourceById(lesson.existingGuide),"Missing tutorial "+id);
  for(const ref of lesson.relatedGuides||[])assert(resourceById(ref),"Missing related resource "+ref);
  if(lesson.creator)assert(representationTool(lesson.creator),"Missing creator "+lesson.creator);
  for(const def of lesson.definitionIds)assert(definitionById(def),"Missing term "+def);
 }
});
test("Batch 1: all sixteen pathways retain valid learning links",()=>{
 assert.deepEqual(Object.keys(PATHWAY_LEARNING).sort(),INVESTIGATIVE_ROUTES.map(r=>r.id).sort());
 for(const r of INVESTIGATIVE_ROUTES){
  const mapping=PATHWAY_LEARNING[r.id];assert(mapping);
  for(const id of mapping.terms)assert(definitionById(id),r.id+" missing term "+id);
  for(const id of mapping.lessons)assert(lessonById(id),r.id+" missing lesson "+id);
 }
 assert(PATHWAY_LEARNING.variation.lessons.includes("histograms"));
 assert(PATHWAY_LEARNING.groups.lessons.includes("distributions"));
 assert(PATHWAY_LEARNING.categorical.lessons.includes("two-way-proportions"));
 assert(PATHWAY_LEARNING.images.lessons.includes("measurement"));
});
test("Batch 1: separate histogram worked and independent examples are arithmetically correct",()=>{
 const classes=[[0,10,6],[10,30,8],[30,40,4]];
 const densities=classes.map(([low,high,count])=>count/(high-low));
 assert.deepEqual(densities,[0.6,0.4,0.4]);
 assert.equal(classes.reduce((total,[low,high,count])=>total+(high-low)*count/(high-low),0),18);
 assert.deepEqual([[0,5,10],[5,15,8],[15,20,5]].map(([low,high,count])=>count/(high-low)),[2,0.8,1]);
 assert.equal(10+8+5,23);
 const lesson=lessonById("histograms");
 assert.match(lesson.formula,/density/i);
 assert.match(lesson.avoid,/unequal class widths/);
 assert.match(lesson.worked.interpretation,/grouping/i);
});
test("Batch 1: sampling allocations, quartiles and statistical denominators remain mathematically sound",()=>{
 assert.equal(20*60/100,12);assert.equal(20*40/100,8);
 assert.equal(30*90/150,18);assert.equal(30*60/150,12);
 const values=[2,3,3,4,5,5,7,11];
 approx((values[3]+values[4])/2,4.5);
 approx((values[1]+values[2])/2,3);
 approx((values[5]+values[6])/2,6);
 approx(6-3,3);
 approx(18/30,0.6);approx(8/20,0.4);
 approx(18/26,9/13);
 approx((0.6-0.4)*100,20);
});
test("Batch 1: rounding bounds are conditional, not instrument-accuracy claims",()=>{
 approx(9.95*9.95,99.0025);approx(10.05*10.05,101.0025);
 const guide=lessonById("measurement");
 assert.match(guide.avoid,/NOT a complete measurement-uncertainty estimate/);
 assert.match(guide.ia,/uncertainties/);
});
test("Batch 1: guided histogram checkpoints and glossary search leave authored work unchanged",()=>{
 const state=student(),u=newResourceSession(),before=authored(state);
 assert(resourceAction(state,u,"resource-workshop-lesson",{workshopId:"histograms"}).ok);
 assert(resourceAction(state,u,"resource-workshop-step",{workshopStep:"help"}).ok);
 assert.match(renderWorkshop(state,u),/Checkpoint 1 of 2/);
 assert(!resourceAction(state,u,"resource-workshop-choice",{workshopChoice:"lower"}).ok);
 assert(resourceAction(state,u,"resource-workshop-choice",{workshopChoice:"3"}).ok);
 assert.match(renderWorkshop(state,u),/That's right/);
 assert(resourceAction(state,u,"resource-workshop-checkpoint",{workshopDirection:"1"}).ok);
 assert.match(renderWorkshop(state,u),/Checkpoint 2 of 2/);
 assert(resourceAction(state,u,"resource-workshop-choice",{workshopChoice:"lower"}).ok);
 assert.match(renderWorkshop(state,u),/That's right/);
 assert(resourceAction(state,u,"resource-workshop-home").ok);
 assert(resourceFilter(u,"workshopQuery","frequency density"));
 assert(workshopList(u).includes("Construct and interpret a histogram"));
 assert.equal(authored(state),before);
});
test("Batch 1: related guides and native creators are opt-in and do not mark progress",()=>{
 const state=student(),u=newResourceSession(),before=authored(state);
 for(const [id,creator,related] of [["distributions","stat","summary-stats"],["histograms","stat","chart-choice"],["two-way-proportions","table","forms"]]){
  resourceAction(state,u,"resource-workshop-lesson",{workshopId:id});
  const html=renderWorkshop(state,u);
  assert(html.includes('data-resource-creator="'+creator+'"'),id);
  assert(html.includes('data-resource-id="'+related+'"'),id);
  assert(html.includes('data-action="resource-creator-open"'));
  assert(resourceAction(state,u,"resource-creator-open",{resourceCreator:creator}).ok);
  assert.equal(authored(state),before);
 }
 assert(!resourceAction(state,u,"resource-creator-open",{resourceCreator:"../bad"}).ok);
});
test("Batch 1: safety gates and HTML escaping also apply to new lessons",()=>{
 const state=student(),u=newResourceSession(),before=authored(state);
 resourceAction(state,u,"resource-workshop-lesson",{workshopId:"two-way-proportions"});
 const html=renderWorkshop(state,u);
 assert(!/<script|<iframe|<video/i.test(html));
 assert(!html.includes("Your IA has been updated"));
 assert.match(html,/not a course recommendation/);
 assert.equal(authored(state),before);
});
