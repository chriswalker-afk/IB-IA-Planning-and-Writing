import test from "node:test";
import assert from "node:assert/strict";
import {newGeometryStudio,geometryAnalysis,saveGeometryFigure} from "../src/diagrams/geometry-core.js";
import {geometryAddGuide,geometryRemoveGuide,geometryRemoveVertex} from "../src/diagrams/geometry-actions.js";
import {newProbabilityStudio,probabilityAnalysis,saveProbabilityFigure} from "../src/diagrams/probability-core.js";
import {chooseProbabilityPreset} from "../src/diagrams/probability-flexible-actions.js";
import {setProbabilityBranch,toggleProbabilityLeaf,setProbabilityField} from "../src/diagrams/probability-actions.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {modelFromFullProject} from "../src/handover/full-project-model.js";
import {renderGeometryStudio} from "../src/diagrams/geometry-view.js";

test("removing a referenced polygon vertex cannot invalidate an auxiliary guide",()=>{
 const s=newGeometryStudio();s.draft={...s.draft,vertices:[...s.draft.vertices,{...s.draft.vertices[1],id:"v-extra",label:"D",x:5,y:6}]};
 assert(geometryAddGuide(s,"dashed"));
 const before=JSON.stringify(s.draft);
 assert.equal(geometryRemoveVertex(s,0),false);
 assert.equal(JSON.stringify(s.draft),before);
 const html=renderGeometryStudio({...createProjectState(),geometryStudio:s},()=>"",x=>String(x));
 assert.match(html,/data-action="geometry-remove" data-geometry-index="0" disabled/);
 assert(geometryRemoveGuide(s,0));
 assert.equal(geometryRemoveVertex(s,0),true);
 assert.equal(s.draft.vertices.length,3);
});
test("full-project probability calculations omit unselected events, not print null",()=>{
 const state=createProjectState(),s=state.probabilityStudio;
 assert(chooseProbabilityPreset(s,"asymmetric"));
 for(const [parent,values] of [["",["0.6","0.4"]],["0",["0.2","0.3","0.5"]]])
  values.forEach((value,index)=>assert(setProbabilityBranch(s,parent,index,"probability",value)));
 assert(setProbabilityField(s,"showEventCalculation",true));
 assert(probabilityAnalysis(s.draft).ready);
 assert(saveProbabilityFigure(s).ok);
 let model=modelFromFullProject(state);
 let figure=model.sections.flatMap(section=>section.figures||[]).find(x=>x.kind==="probability");
 let row=figure.rows.find(x=>x.label==="Conditional calculations");
 assert.equal(row,undefined);
 assert(toggleProbabilityLeaf(s,"eventLeaves","00",true));
 assert(saveProbabilityFigure(s).ok);
 model=modelFromFullProject(state);
 figure=model.sections.flatMap(section=>section.figures||[]).find(x=>x.kind==="probability");
 row=figure.rows.find(x=>x.label==="Conditional calculations");
 assert(row.value.includes("P(E)="));
 assert(!row.value.includes("null"));
 assert(!row.value.includes("P(C)="));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.probabilityStudio.figures[0].draft.eventLeaves[0],"00");
});
