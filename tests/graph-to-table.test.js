import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {analyseGraph,applyPastedGraphData} from "../src/diagrams/graph-core.js";
import {addGraphModel,updateGraphModelExpression} from "../src/diagrams/graph-actions.js";
import {renderGraphModelSummary} from "../src/diagrams/graph-view.js";
import {prepareGraphModelTable,copyGraphModelToTable,detachTableGraphModel} from "../src/diagrams/graph-to-table.js";
import {analyzeTable,normalizeTableDraft,saveTableFigure,tableGraphSnapshotIssue,tableSignature} from "../src/diagrams/table-studio-core.js";
import {setTableField,setTableColumnFormat} from "../src/diagrams/table-studio-actions.js";
import {tableCSV} from "../src/diagrams/table-studio-export.js";
import {tableToHtml,renderTableSvg} from "../src/diagrams/table-studio-render.js";
import {renderTableStudio} from "../src/diagrams/table-studio-view.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";

const xy=(n=5)=>"Time (s)\tDistance (m)\n"+Array.from({length:n},(_,i)=>{
 const x=i+1,y=2*x+1+(i%2?.15:-.1);
 return x+"\t"+y.toFixed(3);
}).join("\n");
function graph(source=xy(),kind="linear",sourceKind="primary"){
 const state=createProjectState(),studio=state.graphStudio;
 applyPastedGraphData(studio,source);
 studio.draft.title="Observed distance against time";
 studio.draft.sourceKind=sourceKind;
 const added=addGraphModel(studio,kind);
 assert.equal(added.ok,true);
 return {state,studio,id:added.model.id};
}
const close=(a,b)=>Math.abs(a-b)<1e-10*Math.max(1,Math.abs(a),Math.abs(b));

test("transfer real linear regression observations, full-precision parameters, predictions and residuals",()=>{
 const {state,studio,id}=graph();
 const original=JSON.stringify(studio.draft),analysis=analyseGraph(studio.draft);
 assert(analysis.ready);
 const m=analysis.models.find(v=>v.id===id);
 assert(m.valid&&m.diagnostics.ok);
 assert.match(renderGraphModelSummary(m,escapeHtml),/data-action="graph-to-table"/);
 assert.match(renderGraphModelSummary(m,escapeHtml),/data-graph-model-id="/);
 const r=copyGraphModelToTable(state,id);
 assert(r.ok,r.error);assert(!r.requiresSelection);
 assert.equal(state.tableStudio.activeId,"");
 assert.equal(state.tableStudio.open,true);
 const d=state.tableStudio.draft;
 assert.equal(d.mode,"calculated");
 assert.deepEqual(d.columns,["Time (s)","Distance (m)"]);
 assert.deepEqual(d.matrix,studio.draft.matrix.map(row=>row.slice(0,2)));
 assert.equal(d.graphSnapshot.modelType,"linear");
 assert.equal(d.graphSnapshot.coefficients.length,2);
 assert.equal(d.calcA,String(m.coefficients[1]));
 assert.equal(d.calcB,String(m.coefficients[0]));
 assert.deepEqual(d.graphSnapshot.rows.map(x=>x.predicted),m.diagnostics.residuals.map(x=>x.predicted));
 assert.deepEqual(d.graphSnapshot.rows.map(x=>x.residual),m.diagnostics.residuals.map(x=>x.residual));
 const q=analyzeTable(d);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 for(let i=0;i<d.matrix.length;i++){
  assert(close(Number(q.model.rows[i][2]),Number(m.diagnostics.residuals[i].predicted.toFixed(2))));
  assert(close(Number(q.model.rows[i][3]),Number(m.diagnostics.residuals[i].residual.toFixed(2))));
 }
 assert.match(q.model.metadata,/Graph Plotter snapshot/);
 assert.match(q.model.metadata,/not a live link/);
 assert.match(q.model.metadata,/full precision/i);
 assert.equal(JSON.stringify(studio.draft),original,"Source graph never mutated");
 assert.equal(d.matrix[0][1],studio.draft.matrix[0][1],"Original measurement strings and precision retained");
 assert.equal(tableGraphSnapshotIssue(d),"");
 const html=tableToHtml(d),svg=renderTableSvg(d);
 assert.match(html,/Graph Plotter snapshot/);
 assert.match(svg,/Graph Plotter snapshot/);
 assert.match(tableCSV(d),/Predicted/);
 assert.match(tableCSV(d),/Residual/);
 assert.match(html,/Source: student-collected data/);
 const ui=renderTableStudio(state,icon,escapeHtml);
 assert.match(ui,/data-table-model-snapshot/);
 assert.match(ui,/data-action="table-detach-model"/);
 assert.match(ui,/data-action="table-return-to-graph"/);
 assert.match(ui,/Full-precision model parameters/);
});

test("long graph datasets are preserved and require a justified, explicit table subset",()=>{
 const {state,id,studio}=graph(xy(21),"quadratic");
 const r=copyGraphModelToTable(state,id);
 assert(r.ok,r.error);assert(r.requiresSelection);
 const d=state.tableStudio.draft;
 assert.equal(d.matrix.length,21);
 assert.equal(d.graphSnapshot.rows.length,21);
 assert.equal(analyzeTable(d).ready,false);
 assert(analyzeTable(d).problems.some(p=>p.code==="raw-table-too-long"));
 setTableField(state.tableStudio,"rowSelection","1, 11, 21");
 assert(analyzeTable(d).problems.some(p=>p.code==="selection-reason"));
 setTableField(state.tableStudio,"selectionReason",
  "The first, middle and final points illustrate whether the fitted model remains suitable over the observed range.");
 const q=analyzeTable(d);
 assert(q.ready,JSON.stringify(q.problems));
 assert.deepEqual(q.model.sourceRowIndices,[0,10,20]);
 assert.equal(q.model.rows.length,3);
 assert.match(q.model.metadata,/Selected source rows 1, 11, 21 of 21/);
 assert.equal(d.graphSnapshot.rows[20].x,studio.draft.matrix[20][0]);
 assert.equal(d.matrix.length,21);
 const saved=saveTableFigure(state.tableStudio);
 assert(saved.ok);assert.equal(saved.record.draft.graphSnapshot.rows.length,21);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.tableStudio.figures[0].draft.graphSnapshot.rows.length,21);
 assert.equal(restored.tableStudio.draft.graphSnapshot.equation,d.graphSnapshot.equation);
 assert(analyzeTable(restored.tableStudio.draft).ready);
});

test("editing copied observations blocks exporting old predictions instead of silently refitting",()=>{
 const {state,id}=graph();
 assert(copyGraphModelToTable(state,id).ok);
 const d=state.tableStudio.draft,savedSig=tableSignature(d);
 d.matrix[1][1]="100.000";
 assert.match(tableGraphSnapshotIssue(d),/Source row 2 changed/);
 const bad=analyzeTable(d);
 assert.equal(bad.ready,false);
 assert(bad.problems.some(p=>p.code==="graph-snapshot-stale"));
 assert.notEqual(tableSignature(d),savedSig);
 assert.throws(()=>tableToHtml(d),/quality checks/);
 assert.equal(saveTableFigure(state.tableStudio).ok,false);
 assert.equal(setTableField(state.tableStudio,"calcA","99"),false);
 assert.equal(setTableField(state.tableStudio,"calcXIndex","1"),false);
 assert(detachTableGraphModel(state.tableStudio));
 assert.equal(d.graphSnapshot,null);
 assert.equal(d.calcModel,"linear");
 assert.equal(d.calcA,String(analyseGraph(state.graphStudio.draft).models[0].coefficients[1]));
 assert.equal(analyzeTable(d).ready,true);
 assert.equal(detachTableGraphModel(state.tableStudio),false);
});

test("guard invalid, incomplete or changed graph data and leave current Table Studio untouched",()=>{
 const {state,id,studio}=graph();
 const prior=JSON.stringify(state.tableStudio);
 studio.draft.matrix[0][1]="not measured";
 const invalid=copyGraphModelToTable(state,id);
 assert(!invalid.ok&&/incomplete|non-numeric/i.test(invalid.error));
 assert.equal(JSON.stringify(state.tableStudio),prior);
 studio.draft.matrix[0][1]="2.900";
 studio.draft.pendingPaste=true;
 assert(!copyGraphModelToTable(state,id).ok);
 assert.equal(JSON.stringify(state.tableStudio),prior);
 studio.draft.pendingPaste=false;
 studio.draft.sourceKind="unsure";
 assert(!copyGraphModelToTable(state,id).ok);
 assert.equal(JSON.stringify(state.tableStudio),prior);
 const missing=prepareGraphModelTable(studio,"model-does-not-exist");
 assert(!missing.ok);
 assert.equal(JSON.stringify(state.tableStudio),prior);
});
test("advanced and custom graph model predictions use the original fitted model, not rounded equations",()=>{
 const data=xy(9);
 for(const kind of ["linear","quadratic","cubic","exponential","logarithmic","power","sinusoidal","custom"]){
  const contents=kind==="sinusoidal"?
   "Time (s)\tDistance (m)\n"+Array.from({length:10},(_,i)=>{
    const x=i+1,y=3+2*Math.sin(2*Math.PI*(x-1)/6);
    return x+"\t"+y.toFixed(7);
   }).join("\n"):data;
  const {state,id,studio}=graph(contents,kind);
  if(kind==="custom")assert(updateGraphModelExpression(studio,id,"2*x+1"));
  if(kind==="sinusoidal")studio.draft.models[0].period="6";
  const model=analyseGraph(studio.draft).models[0];
  assert(model.valid&&model.diagnostics.ok,kind+":"+(model.error||model.diagnostics.reason||""));
  const r=copyGraphModelToTable(state,id);assert(r.ok,kind+":"+(r.error||""));
  const snap=state.tableStudio.draft.graphSnapshot;
  assert.equal(snap.modelType,kind);
  assert.equal(snap.rows.length,9+(kind==="sinusoidal"?1:0));
  assert.equal(snap.rows[0].predicted,model.diagnostics.residuals[0].predicted);
  assert.equal(snap.rows[0].residual,model.diagnostics.residuals[0].residual);
  assert(snap.equation.trim()&&snap.method.trim());
  if(["exponential","power","logarithmic","sinusoidal"].includes(kind))
   assert(Object.keys(snap.parameters).length>0,kind+": full precision parameters");
  if(kind==="custom")assert(snap.equation.includes("2*x+1"));
  setTableField(state.tableStudio,"rowSelection","1, 5, 9");
  setTableField(state.tableStudio,"selectionReason",
   "First, midpoint and near-final observations are compared to illustrate the model performance over the domain.");
  const q=analyzeTable(state.tableStudio.draft);
  assert(q.ready,kind+":"+JSON.stringify(q.problems));
  assert.equal(q.model.rows.length,3);
 }
});
test("theoretical plots are labelled as constructed data in table exports",()=>{
 const {state,id}=graph(xy(),"linear","theoretical");
 const r=copyGraphModelToTable(state,id);
 assert(r.ok,r.error);
 assert.equal(state.tableStudio.draft.sourceKind,"theoretical");
 assert(analyzeTable(state.tableStudio.draft).ready);
 assert.match(tableToHtml(state.tableStudio.draft),/theoretical \/ student-constructed values/);
 assert.match(renderTableSvg(state.tableStudio.draft),/theoretical \/ student-constructed values/);
});
test("invalid snapshot payloads cannot silently provide invented results",()=>{
 const {state,id}=graph();
 assert(copyGraphModelToTable(state,id).ok);
 const d=state.tableStudio.draft;
 const bad=normalizeTableDraft({...d,graphSnapshot:{...d.graphSnapshot,rows:[
  {x:"1",y:"2",predicted:NaN,residual:0}
 ]}});
 assert.equal(bad.graphSnapshot,null);
 const changed=normalizeTableDraft({...d,graphSnapshot:{...d.graphSnapshot,rows:d.graphSnapshot.rows.slice(0,1)}});
 assert.equal(analyzeTable(changed).ready,false);
 assert(analyzeTable(changed).problems.some(p=>p.code==="graph-snapshot-stale"));
});
