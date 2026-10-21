/** Explicit, non-live handover from a student-selected Graph Plotter model.
 * This captures the full-precision predictions used for plotted residuals.
 * Never infer coefficients from a rounded equation or drop invalid rows.
 */
import {analyseGraph,finiteCell} from "./graph-core.js";
import {newTableDraft,normalizeTableGraphSnapshot,TABLE_MAX_ROWS} from "./table-studio-core.js";

const fmt=n=>Number(n).toString();
/** Returns an uncommitted draft when the selected model is valid. */
export function prepareGraphModelTable(graphStudio,modelId){
 const studio=graphStudio,d=studio?.draft;
 if(!d||!["scatter","time"].includes(d.kind))
  return {ok:false,error:"Open a scatter or time-series graph with genuine paired data first."};
 if(d.pendingPaste)return {ok:false,error:"Read the changed graph source values before transferring a model."};
 const q=analyseGraph(d);
 if(!q.ready)return {ok:false,error:"Resolve the required graph checks before transferring this model."};
 if(q.skipped)return {ok:false,error:
  "The graph has "+q.skipped+" incomplete or non-numeric source row(s). Resolve these first; no observations are silently omitted."};
 if(d.matrix.length<2||d.matrix.length>TABLE_MAX_ROWS)
  return {ok:false,error:"Transfer between two and "+TABLE_MAX_ROWS+" valid paired source rows."};
 const model=q.models.find(m=>m.id===modelId);
 if(!model||!model.valid||!model.diagnostics?.ok||
   !Array.isArray(model.diagnostics.residuals)||model.diagnostics.residuals.length!==d.matrix.length)
  return {ok:false,error:"Choose a model with valid, full-dataset predictions and residuals."};
 const sourceKind=d.sourceKind;
 if(!["primary","secondary","theoretical"].includes(sourceKind))
  return {ok:false,error:"Confirm the source of the observations in Graph Plotter before transferring them."};
 const i=d.xIndex,j=d.yIndex;
 if(i===j||i>=d.columns.length||j>=d.columns.length)
  return {ok:false,error:"Choose two different existing source variables in the plotter."};
 const pairs=[];
 for(let index=0;index<d.matrix.length;index++){
  const row=d.matrix[index],r=model.diagnostics.residuals[index];
  if(!r||!Number.isFinite(r.x)||!Number.isFinite(r.y)||
   !Number.isFinite(r.predicted)||!Number.isFinite(r.residual))
   return {ok:false,error:"The selected model does not have a finite prediction for source row "+(index+1)+"."};
  const x=String(row[i]??""),y=String(row[j]??"");
  if(!x.trim()||!y.trim()||finiteCell(x)!==r.x||finiteCell(y)!==r.y)
   return {ok:false,error:"Source row "+(index+1)+" differs from the fitted observations. Recheck the graph data."};
  pairs.push({x,y,predicted:r.predicted,residual:r.residual});
 }
 const snapshot=normalizeTableGraphSnapshot({
  version:1,rows:pairs,
  graphTitle:d.title,graphFigureId:studio.activeId||"",modelId:model.id,
  modelType:model.type,modelLabel:model.label,equation:model.equation,
  method:model.method,modelNote:model.note||"",
  graphSourceX:d.columns[i],graphSourceY:d.columns[j],
  coefficients:Array.isArray(model.coefficients)?model.coefficients:[],
  parameters:model.parameters&&typeof model.parameters==="object"?model.parameters:{}
 });
 if(!snapshot)return {ok:false,error:"Could not make a faithful, full-precision copy of the graph model."};
 const draft=newTableDraft();
 draft.mode="calculated";
 draft.columns=[String(d.columns[i]),String(d.columns[j])];
 draft.matrix=pairs.map(p=>[p.x,p.y]);
 draft.headings=[d.xLabel||d.columns[i],d.yLabel||d.columns[j]];
 draft.unitDecisions=[
  {mode:d.xUnitMode,unit:d.xUnit||""},{mode:d.yUnitMode,unit:d.yUnit||""}
 ];
 draft.calcXIndex=0;draft.calcYIndex=1;
 draft.title=("Model predictions and residuals: "+d.title).slice(0,85);
 draft.sourceKind=sourceKind;draft.sourceText=d.sourceText||"";
 draft.graphSnapshot=snapshot;
 draft.numberFormat="source";
 // Populate full-precision coefficients for a deliberate switch to manual mode.
 if(model.type==="linear"&&snapshot.coefficients.length===2){
  draft.calcModel="linear";draft.calcA=fmt(snapshot.coefficients[1]);draft.calcB=fmt(snapshot.coefficients[0]);
 }else if(model.type==="quadratic"&&snapshot.coefficients.length===3){
  draft.calcModel="quadratic";draft.calcA=fmt(snapshot.coefficients[2]);
  draft.calcB=fmt(snapshot.coefficients[1]);draft.calcC=fmt(snapshot.coefficients[0]);
 }
 return {ok:true,draft,model:snapshot,rows:pairs.length,requiresSelection:pairs.length>8};
}
/** Called only from a deliberate graph-model button; saved tables are untouched. */
export function copyGraphModelToTable(state,modelId){
 const result=prepareGraphModelTable(state?.graphStudio,modelId);
 if(!result.ok)return result;
 if(!state?.tableStudio)return {ok:false,error:"Table Studio is unavailable in this project."};
 state.tableStudio.activeId="";
 state.tableStudio.draft=result.draft;
 state.tableStudio.open=true;
 return result;
}
/** Switch to independent editable coefficients, never pretending a snapshot is live. */
export function detachTableGraphModel(studio){
 const d=studio?.draft;
 if(!d||d.mode!=="calculated"||!d.graphSnapshot)return false;
 const source=d.graphSnapshot.modelType;
 d.graphSnapshot=null;
 if(!["linear","quadratic"].includes(source)){
  d.calcModel="linear";d.calcA="";d.calcB="";d.calcC="";
 }
 return true;
}
