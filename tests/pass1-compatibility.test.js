import test from "node:test";
import assert from "node:assert/strict";
import {screenInventory} from "../scripts/audit-screen-inventory.mjs";
import {
 createProjectState,normalizeProjectState,persistProjectState,loadProjectState,
 STORAGE_KEY
} from "../src/core/project-state.js";
import {LEGACY_DESTINATION,setPlanCurrent} from "../src/planning/engine.js";
import {setCompletionNode} from "../src/completing/engine.js";
import {REPRESENTATION_TOOLS} from "../src/diagrams/representation-registry.js";
import {assessmentFramework,isRevisedAssessment} from "../src/essentials/assessment-cohorts.js";

test("Pass 1 route inventory covers rendered pages, all explicit legacy redirects, all studios and new criteria",()=>{
 const report=screenInventory();
 assert.deepEqual(report.entryPoints,["index.html","app.js"]);
 assert.deepEqual(report.navigation,["home","planning","completing","checking","path","report"]);
 assert.deepEqual(report.planning.filter(x=>x.status==="redirected-legacy").map(x=>x.id).sort(),
  Object.keys(LEGACY_DESTINATION).sort());
 assert.deepEqual(report.completing.filter(x=>x.status==="redirected-legacy").map(x=>x.id),
  ["C61","C62","C63","C64"]);
 assert.equal(report.completing.find(x=>x.id==="C10E")?.status,"legacy-example-intercept");
 assert.equal(report.completing.find(x=>x.id==="C95")?.status,"support-route");
 assert.equal(report.completing.find(x=>x.id==="C96")?.status,"implemented-screen");
 for(const node of ["N00","N01V","N02M","N03P2","N01P","N06","N07"]){
  assert.equal(report.planning.find(x=>x.id===node)?.status,"implemented-screen",node);
 }
 for(const node of ["C00","C04","C10","C20","C30","C31","C40","C50","C60","C70","C90"]){
  assert.equal(report.completing.find(x=>x.id===node)?.status,"implemented-screen",node);
 }
 assert.deepEqual(report.diagramGenerators.map(x=>x.id),REPRESENTATION_TOOLS.map(x=>x.id));
 assert.equal(report.futureCriteria.status,"protected-current-feature");
 assert.equal(report.futureCriteria.verifiedBySource,true);
 assert.deepEqual(report.implementation.missingRelativeImports,[]);
 assert(report.implementation.staticAppModulesReachable>100);
});
test("legacy Planning screens redirect while keeping the student's earlier answers, completed work and teacher status",()=>{
 for(const [oldScreen,newScreen] of Object.entries(LEGACY_DESTINATION)){
  const state=createProjectState();
  state.project.aim="Can my model answer the original question?";
  state.planning.current=oldScreen;
  state.planning.history=["N01",oldScreen];
  state.planning.visited=["N01",oldScreen];
  state.planning.completedNodes=[oldScreen,"N01"];
  state.planning.fields.aim="How does the measured height change?";
  state.planning.fields.figurePurpose="An early note about why a figure would help";
  state.planning.fields.changeAdaptation="Check a narrower physical model";
  state.planning.fields.firstAction="Try a justified first case";
  state.planning.fields.teacherQuestion="Does this method suit the investigation?";
  state.teacher.pendingApproval=true;
  state.entries=[{id:"real-1",phase:"first",status:"completed",title:"My actual graph",
   result:"The observed points increase over the measured interval."}];
  const copy=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(copy.planning.current,newScreen,oldScreen);
  assert.equal(copy.planning.fields.figurePurpose,state.planning.fields.figurePurpose,oldScreen);
  assert.equal(copy.planning.fields.changeAdaptation,state.planning.fields.changeAdaptation,oldScreen);
  assert.equal(copy.planning.fields.firstAction,state.planning.fields.firstAction,oldScreen);
  assert.equal(copy.planning.fields.teacherQuestion,state.planning.fields.teacherQuestion,oldScreen);
  assert(copy.planning.history.includes("N01"),oldScreen);
  assert(!copy.planning.history.includes(oldScreen),oldScreen);
  assert(!copy.planning.completedNodes.includes(oldScreen),oldScreen);
  assert.equal(copy.teacher.pendingApproval,true,oldScreen);
  assert.equal(copy.entries[0].result,state.entries[0].result,oldScreen);
  assert.equal(copy.entries[0].status,"completed",oldScreen);
  assert.equal(setPlanCurrent(copy,oldScreen,{history:false}).current,newScreen,oldScreen);
 }
});
test("old four-part Conclusion links redirect to the unified C60 without rewriting a saved conclusion",()=>{
 for(const oldScreen of ["C61","C62","C63","C64"]){
  const state=createProjectState();
  state.route="completing";state.completion.current=oldScreen;
  state.completion.fields.mainConclusion="The actual calculation supports a restricted answer.";
  state.completion.fields.conclusionEvidence="Results in Figure 2 and Equation 5.";
  state.completion.fields.conclusionUncertainty="Only valid in the measured range.";
  state.completion.fields.conclusionExtension="A new mathematical question, not a promise.";
  state.completion.history=["C30",oldScreen];state.completion.visited=["C30",oldScreen];
  state.scratch.conclusion="A student's own rough paragraph.";
  const recovered=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(recovered.completion.current,"C60",oldScreen);
  for(const key of ["mainConclusion","conclusionEvidence","conclusionUncertainty","conclusionExtension"]){
   assert.equal(recovered.completion.fields[key],state.completion.fields[key],oldScreen+" "+key);
  }
  assert.equal(recovered.scratch.conclusion,state.scratch.conclusion);
  assert.equal(setCompletionNode(recovered,oldScreen,{history:false}).id,"C60");
 }
});
test("a full local JSON backup retains all seven linked figures, writing notes, source choices, and a revised-cohort decision",()=>{
 const state=createProjectState();
 state.route="completing";state.planning.fields.assessmentFramework="revised2029";
 state.planning.fields.aim="How accurately can I compare the measured curves?";
 state.project.aim=state.planning.fields.aim;
 state.completion.current="C40";state.completion.activeEntryIndex=0;
 state.entries=[{
  id:"first",phase:"first",status:"completed",title:"First measured result",
  result:"I computed a real value from the recorded measurements.",
  resultRef:"Figure 2",interpretation:"The result restricts my conclusion."
 }];
 state.completion.fields.mainConclusion="A cautious, student-authored answer";
 state.completion.guidanceUi.noteDraft="Notes that belong to the student, not the guide.";
 state.scratch.introduction="My own draft introduction";
 state.cueNotes["legacy-intro"]="Earlier student reflection";
 state.cueLocations["legacy-intro"]="After Figure 2";
 for(const tool of REPRESENTATION_TOOLS){
  const studio=state[tool.studio],id="saved-"+tool.id;
  studio.figures.push({
   id,entryId:"first",savedAt:"2026-10-22T00:00:00.000Z",
   draft:JSON.parse(JSON.stringify(studio.draft))
  });
  state.entries[0][tool.entryKey]=id;
 }
 const memory=new Map(),storage={
  setItem:(key,value)=>memory.set(key,value),
  getItem:key=>memory.get(key)??null
 };
 persistProjectState(state,storage);
 assert(memory.has(STORAGE_KEY));
 const copy=loadProjectState(storage);
 assert.equal(copy.version,state.version);
 assert.equal(copy.entries[0].status,"completed");
 assert.equal(copy.entries[0].result,state.entries[0].result);
 assert.equal(copy.scratch.introduction,state.scratch.introduction);
 assert.equal(copy.completion.fields.mainConclusion,state.completion.fields.mainConclusion);
 assert.equal(copy.completion.guidanceUi.noteDraft,state.completion.guidanceUi.noteDraft);
 assert.equal(copy.cueNotes["legacy-intro"],state.cueNotes["legacy-intro"]);
 assert.equal(copy.cueLocations["legacy-intro"],state.cueLocations["legacy-intro"]);
 assert.equal(assessmentFramework(copy),"revised2029");
 assert(isRevisedAssessment(copy));
 for(const tool of REPRESENTATION_TOOLS){
  assert.equal(copy.entries[0][tool.entryKey],"saved-"+tool.id,tool.id);
  assert.equal(copy[tool.studio].figures.length,1,tool.id);
  assert.equal(copy[tool.studio].figures[0].id,"saved-"+tool.id,tool.id);
 }
 // Changing a displayed rubric view must not erase the previous cohort's notes.
 copy.planning.fields.assessmentFramework="legacy";
 assert.equal(assessmentFramework(copy),"legacy");
 assert.equal(copy.entries[0].result,state.entries[0].result);
});
test("older version-one backups still import as drafts without fabricated results or revised-criteria consent",()=>{
 const old={version:1,route:"completing",
  project:{aim:"My original question",precision:"Nearest 0.1 cm",permissions:"pending",
   prediction:"The graph may be curved"},
  ui:{planStep:5,planMax:5,studioSection:"math"},
  entries:[{id:"old-draft",phase:"legacy",status:"planned",result:"",
   title:"A proposed scatter diagram"}],
  scratch:{introduction:"Original words from the student"},
  cueNotes:{"old-writing-cue":"Something I noticed"}
 };
 const next=normalizeProjectState(old);
 assert.equal(next.version,2);
 assert.equal(next.entries[0].status,"planned");
 assert.equal(next.entries[0].result,"");
 assert.equal(next.teacher.pendingApproval,true);
 assert.equal(next.scratch.introduction,old.scratch.introduction);
 assert.equal(next.cueNotes["old-writing-cue"],old.cueNotes["old-writing-cue"]);
 assert.equal(assessmentFramework(next),"legacy");
 assert.equal(next.entries.length,1);
});
