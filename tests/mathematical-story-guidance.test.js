import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";
import {mathematicalStoryGuidance,renderConsequentialChoice,renderStorySynthesis} from "../src/completing/mathematical-story-guidance.js";

const make=({kind="statistics",source="primary",route="relationships"}={})=>{
 const state=createProjectState();
 Object.assign(state.planning.fields,{kind,dataSource:source,course:"AI SL"});
 state.planning.routeExplorer.selectedRoute=route;
 return state;
};
const stage=methodId=>({id:"current",phase:"substantial",status:"planned",methodId,result:""});

test("opening reminders use compatible planning context while a changed current method takes precedence",()=>{
 const state=make();
 assert.equal(mathematicalStoryGuidance(state,{phase:"opening"}).id,"relationships");
 assert.equal(mathematicalStoryGuidance(state,{entry:{phase:"first"}}).id,"relationships");
 for(const [methodId,id] of [["proof","proof"],["linear-regression","fitted-models"],["exponential","growth"]]){
  const guide=mathematicalStoryGuidance(state,{entry:stage(methodId)});
  assert.equal(guide.id,id,methodId);
  assert.equal(guide.origin,"method",methodId);
 }
 state.planning.routeExplorer.selectedRoute="optimisation";
 assert.equal(mathematicalStoryGuidance(state,{phase:"opening"}).id,"general","An incompatible old route should not be presented as relevant");
 state.planning.mathSelected=["AI14"];
 const selected=mathematicalStoryGuidance(state,{phase:"opening"});
 assert.equal(selected.id,"relationships");
 assert.equal(selected.origin,"technique","Opening advice should still work without a compatible journey");
});

test("Other, unknown methods and unlinked later work do not inherit the old planning route",()=>{
 const state=make();
 for(const entry of [stage("other"),stage("unknown-method"),stage(""),{status:"planned",result:""}]){
  assert.equal(mathematicalStoryGuidance(state,{entry}).id,"general");
 }
 const current=stage("proof");
 const withOldRoute=mathematicalStoryGuidance(state,{entry:current});
 state.planning.routeExplorer.selectedRoute="";
 assert.deepEqual(mathematicalStoryGuidance(state,{entry:current}),withOldRoute,"A current proof must not depend on a stale relationships route");
 state.planning.fields.kind="theoretical";
 state.planning.routeExplorer.selectedRoute="relationships";
 assert.equal(mathematicalStoryGuidance(state,{entry:stage("follow-journey")}).id,"general");
});

test("a current method and its linked source outrank stale planning assumptions",()=>{
 const state=make({kind:"theoretical",source:"primary"});
 const entry=stage("linear-regression");
 assert.equal(mathematicalStoryGuidance(state,{entry}).example.id,"model-errors","An old investigation kind must not replace current model advice with sequence prose");
 state.planning.fields.dataSource="theoretical";
 assert.equal(mathematicalStoryGuidance(state,{entry}).example.id,"stated-model-domain");
 state.completion.sourceRecords=[{id:"actual",fields:{dataStatus:"ready",actualSourceType:"primary"}}];
 entry.sourceRefs=["actual"];
 assert.equal(mathematicalStoryGuidance(state,{entry}).example.id,"model-errors","The actual linked source should beat a theoretical source planned earlier");
 state.completion.sourceRecords[0].fields.actualSourceType="theoretical";
 assert.equal(mathematicalStoryGuidance(state,{entry}).example.id,"stated-model-domain","Ready theoretical inputs are still theoretical");
});

test("theoretical inputs receive relevant analytic examples rather than invented measurements",()=>{
 const state=make({kind:"modelling",source:"theoretical",route:""});
 const cases=[
  ["optimisation","stipulated-model"],
  ["probability","probability-and-risk"],
  ["geometric-model","defined-geometry"],
  ["linear-regression","stated-model-domain"],
  ["sinusoidal","defined-periodic-rule"],
  ["proof","sequence-reasoning"]
 ];
 for(const [methodId,id] of cases){
  const guide=mathematicalStoryGuidance(state,{entry:stage(methodId)});
  assert.equal(guide.example.id,id,methodId);
  assert.equal(guide.example.notes.length,3,methodId);
  assert(guide.example.notes.every(note=>note.label&&note.text),methodId);
  assert(guide.example.paragraph.trim(),methodId+" needs a continuous passage");
 }
});

test("story examples are closed optional disclosures, preserve the combined prose, and never edit student work",()=>{
 const state=make();
 state.scratch.introduction="My existing writing <img src=x onerror=bad()>";
 const entry={...stage("linear-regression"),bridge:"My own explanation",purpose:"My own purpose"};
 state.entries=[entry];state.completion.activeEntryIndex=0;
 const before=JSON.stringify(state);
 const guide=mathematicalStoryGuidance(state,{entry});
 const reminder=renderConsequentialChoice(state,icon,escapeHtml,{entry});
 const example=renderStorySynthesis(state,icon,escapeHtml,{entry});
 assert.match(reminder,/data-story-choice/);
 const opening=example.match(/^<details\b[^>]*data-story-synthesis[^>]*>/)?.[0];
 assert(opening,"The example should use a native details disclosure");
 assert(!/\sopen(?:[\s=>])/.test(opening),"The example should be closed initially");
 assert(example.includes('<p class="math-story-passage">'+escapeHtml(guide.example.paragraph)+'</p>'));
 assert(example.includes("Combined passage"));
 assert(!example.includes("<img"));
 for(const render of [renderConsequentialChoice,renderStorySynthesis]){
  assert.equal(render(state,icon,escapeHtml,{entry,reduced:true}),"","Reduce advice should remove optional story content");
 }
 assert.equal(JSON.stringify(state),before,"Guidance must not modify planning, fields or mathematical records");
});
