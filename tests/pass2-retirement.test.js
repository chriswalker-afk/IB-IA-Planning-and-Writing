import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {createLegacyMathHelpers} from "../src/completing/legacy-math-helpers.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {LEGACY_DESTINATION,setPlanCurrent} from "../src/planning/engine.js";
import {setCompletionNode} from "../src/completing/engine.js";
import {assessmentFramework} from "../src/essentials/assessment-cohorts.js";
import {REPRESENTATION_TOOLS} from "../src/diagrams/representation-registry.js";

const code=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("the retired six-tab Studio renderer is gone but math-action helpers keep their behaviour",()=>{
 assert.equal(existsSync(new URL("../src/ui/studio-views.js",import.meta.url)),false);
 const state=createProjectState(),helpers=createLegacyMathHelpers({getState:()=>state});
 assert.deepEqual(Object.keys(helpers).sort(),["currentMath","mathDefault","suggestions"]);
 const first=helpers.mathDefault();
 assert.equal(first.status,"planned");assert.equal(first.result,"");
 assert.equal(first.knowledge,"unsure");assert.equal(first.interpretation,"");
 assert.equal(first.nextQuestion,"");assert(first.id.startsWith("step-"));
 assert.equal(helpers.currentMath(),null);
 state.entries=[{id:"first",kind:"scatter",observation:"curved"},{id:"second",kind:"theory"}];
 state.ui.mathIndex=99;
 assert.equal(helpers.currentMath().id,"second");assert.equal(state.ui.mathIndex,1);
 state.ui.mathIndex=-8;
 assert.equal(helpers.currentMath().id,"first");assert.equal(state.ui.mathIndex,0);
 assert.equal(helpers.suggestions(state.entries[0]).length,2);
 assert.match(helpers.suggestions(state.entries[0])[0][0],/curvature/);
 assert.match(helpers.suggestions(state.entries[1])[0][0],/generalise/);
 assert(!code("app.js").includes("studio-views.js"));
 assert(code("app.js").includes("createLegacyMathHelpers(viewDependencies)"));
});

test("retired Planning renderers and auto-advance cases are absent, but historic routes and answers remain",()=>{
 const screen=code("src/ui/planning-views.js"),engine=code("src/planning/engine.js");
 for(const node of Object.keys(LEGACY_DESTINATION)){
  assert(!screen.includes('case "'+node+'":'),node+" still has a standalone Planning screen");
  assert(!engine.includes('case "'+node+'":'),node+" still has a standalone auto-advance handler");
  assert(engine.includes(node+':"'),node+" needs its saved-project redirection");
  const state=createProjectState();
  state.planning.fields.figurePurpose="My earlier reason for a diagram";
  state.planning.fields.changeAdaptation="My earlier suggested alternative";
  assert.equal(setPlanCurrent(state,node,{history:false}).current,LEGACY_DESTINATION[node],node);
  assert.equal(state.planning.fields.figurePurpose,"My earlier reason for a diagram");
  assert.equal(state.planning.fields.changeAdaptation,"My earlier suggested alternative");
 }
 for(const node of ["N03P","N03P2","N03S","N03D","N03H","N01P","N06T","N06","N07"])
  assert(screen.includes('case "'+node+'":'),node+" must remain live");
 assert(engine.includes("shortRoute"),"Historical route conditions must remain available");
 assert(code("src/planning/route-table.js").includes('"from": "N03J"'),
  "Original source-route provenance must be kept");
});

test("C61–C64 old view cases are retired without losing student conclusion writing or 2029 decisions",()=>{
 const views=code("src/completing/views.js"),workspace=code("src/completing/conclusion-workspace.js");
 assert(views.includes('case "C60":'));
 for(const node of ["C61","C62","C63","C64"]){
  assert(!views.includes('case "'+node+'":'),node+" old renderer remains");
  const state=createProjectState();
  state.completion.current=node;state.planning.fields.assessmentFramework="revised2029";
  state.completion.fields.mainConclusion="The student's own conclusion";
  state.completion.fields.conclusionEvidence="Two recorded figures";
  state.completion.fields.conclusionUncertainty="A measured-domain restriction";
  state.completion.fields.conclusionAdvice="My cautious recommendation";
  state.completion.fields.conclusionFocus="Unnecessary repetition";
  state.scratch.conclusion="My older notes";
  const copy=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(copy.completion.current,"C60",node);
  for(const key of ["mainConclusion","conclusionEvidence","conclusionUncertainty","conclusionAdvice","conclusionFocus"])
   assert.equal(copy.completion.fields[key],state.completion.fields[key],node+" "+key);
  assert.equal(copy.scratch.conclusion,state.scratch.conclusion);
  assert.equal(assessmentFramework(copy),"revised2029");
  assert.equal(setCompletionNode(copy,node,{history:false}).id,"C60");
 }
 for(const key of ["mainConclusion","conclusionBenefit","conclusionExtension",
  "conclusionEvidence","conclusionUncertainty","conclusionAdvice","conclusionFocus"])
  assert(workspace.includes('"'+key+'"'),"Saved old field missing: "+key);
 for(const section of ["answer","meaning","next"])
  assert(workspace.includes('data-conclusion-part="'+section+'"'),section);
 assert(workspace.includes("conclusion-previous-notes"));
 assert(workspace.includes("completing:C61:mainConclusion"));
 assert(workspace.includes("completing:C63:extension"));
});

test("Pass 2 protects seven generators, retained writing advice, and both assessment cohorts",()=>{
 assert.deepEqual(REPRESENTATION_TOOLS.map(t=>t.id),
  ["graph","stat","table","trace","voronoi","geometry","distribution","probability"]);
 assert(code("src/ui/planning-views.js").includes("revised2029"));
 assert(code("src/completing/views.js").includes("renderConclusionWorkspace"));
 assert(code("src/essentials/assessment-cohorts.js").includes("revised2029"));
 assert(code("src/completing/studio-writing-stages.js").includes('"C61"'),
  "Keep historical Field Guide metadata for compatibility");
});
