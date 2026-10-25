/** Read-only workflow context for the seven creator workspaces.
 * Uses existing mathematical checks, saved figure records, and stage links.
 * A ready diagram is NOT a completed mathematical stage or an IB grade.
 */
import {activeRepresentationTool} from "./representation-registry.js";
import {analyseGraph} from "./graph-core.js";
import {statAnalysis} from "./stat-studio-core.js";
import {analyzeTable} from "./table-studio-core.js";
import {imageTraceChecks} from "./image-tracer-core.js";
import {analyzeVoronoi} from "./voronoi-core.js";
import {geometryAnalysis} from "./geometry-core.js";
import {analyzeDistribution} from "./distribution-core.js";
import {probabilityAnalysis} from "./probability-core.js";

const assess=Object.freeze({
 graph:analyseGraph,stat:statAnalysis,table:analyzeTable,trace:imageTraceChecks,
 voronoi:analyzeVoronoi,geometry:geometryAnalysis,probability:probabilityAnalysis,distribution:analyzeDistribution
});
export function representationWorkflowState(state){
 const tool=activeRepresentationTool(state);
 if(!tool)return null;
 const studio=state?.[tool.studio],record=studio?.figures?.find(f=>f.id===studio.activeId)||null;
 const index=state?.completion?.activeEntryIndex,entry=state?.entries?.[index];
 const linked=!!record&&!!entry&&(entry[tool.entryKey]===record.id||
  entry.figureRefs?.includes(tool.id+":"+record.id));
 // The check describes the current working draft, not the last saved copy.
 const ready=assess[tool.id]?.(studio?.draft)?.ready===true;
 return {
  tool:tool.id,ready,saved:!!record,linked:!!linked,
  label:!ready?"Needs checks":linked?"Saved copy linked to this stage":
   record?"Saved copy available":"Checks passed — ready to save",
  detail:!ready?"Complete the required figure checks below before saving, linking or exporting.":
   linked?"A saved figure is linked to this stage. Save again after any changes; review your written interpretation.":
   record?"A saved editable copy exists. Save again after changes, or link it to the relevant mathematical stage.":
   "Your figure passes the required checks. Save an editable copy, link it to your mathematical stage or export it."
 };
}
export function renderRepresentationWorkflow(status,icon,e){
 if(!status)return "";
 const steps=[
  ["create","1. Create & refine"],["check","2. Check"],["save","3. Save or link"],["export","4. Export"]
 ];
 return '<section class="representation-workflow" data-representation-workflow="'+e(status.tool)+
  '" data-representation-ready="'+status.ready+'" aria-label="Figure creation workflow">'+
  '<div class="representation-workflow-status"><span class="representation-workflow-kicker">YOUR FIGURE WORKFLOW</span>'+
   '<strong class="representation-workflow-state '+(status.ready?"ready":"pending")+'" role="status">'+
    icon(status.ready?"check-circle":"alert-circle")+e(status.label)+'</strong></div>'+
  '<ol class="representation-workflow-steps">'+steps.map(([id,label],i)=>
   '<li class="representation-workflow-step'+
    (id==="check"&&status.ready?" is-checked":"")+
    (id==="save"&&status.saved?" is-saved":"")+
    '" data-workflow-step="'+id+'">'+
    '<span aria-hidden="true">'+(i+1)+'</span>'+e(label)+'</li>').join("")+'</ol>'+
  '<p>'+e(status.detail)+' These are figure-readiness checks, not evidence of an IA grade or completed mathematics.</p>'+
  '</section>';
}
