/** Guided, optional model comparison and residual analysis.
 * Advice asks students to interpret genuine results: it never chooses a winner
 * or asserts a residual pattern based on a small, possibly noisy sample.
 */
import {renderGraphResidualSvg} from "./graph-core.js";

export const metricText=(value,digits=4)=>{
 if(value===null||value===undefined||!Number.isFinite(value))return "Undefined";
 if(value===0)return "0";
 const a=Math.abs(value);
 return (a<0.0001||a>=1e7)?value.toExponential(digits-1):String(Number(value.toPrecision(digits)));
};
const unitLabel=d=>d.yUnitMode==="unit"&&d.yUnit.trim()?d.yUnit.trim():"";
const validModel=m=>m&&m.visible&&m.valid&&m.diagnostics?.ok;

export function renderModelComparison(d,analysis,e){
 const models=analysis.models||[];
 if(models.length<2)return "";
 const unit=unitLabel(d);
 const rows=models.map(m=>{
  const stats=m.diagnostics||{},ok=m.valid&&stats.ok;
  const metric=ok?metricText(stats.rmse):"—";
  const r2=ok?(stats.r2===null?"Undefined":metricText(stats.r2)):"—";
  const status=!m.visible?" (hidden)":"";
  return '<tr><th scope="row"><span class="graph-comparison-marker" style="background:'+m.color+'"></span>'+e(m.label+status)+'</th>'+
   '<td>'+e(metric)+'</td><td>'+e(r2)+'</td><td>'+e(String(ok?stats.n:"—"))+'</td></tr>'+
   (!ok?'<tr class="graph-comparison-explainer"><td colspan="4">'+e(stats.reason||m.error||"Model diagnostics unavailable.")+'</td></tr>':"");
 }).join("");
 return '<section class="graph-model-comparison" aria-label="Compare chosen mathematical models">'+
  '<h4>Compare your candidate models</h4>'+
  '<p>These error measures use the <strong>same complete observations</strong> (not different subsets). An unavailable value is not silently calculated from fewer points.</p>'+
  '<div class="graph-comparison-table-scroll"><table class="graph-comparison-table">'+
   '<caption>In-sample model errors for your selected dataset</caption>'+
   '<thead><tr><th scope="col">Model</th><th scope="col">RMSE'+(unit?" ("+e(unit)+")":"")+'</th><th scope="col">R²</th><th scope="col">n</th></tr></thead>'+
   '<tbody>'+rows+'</tbody></table></div>'+
  '<p class="graph-comparison-caution"><strong>How to judge:</strong> Lower RMSE means smaller errors in the original y-units. R² describes variation explained relative to a constant-mean baseline; it may be negative for a student-entered model and is undefined if every y-value is equal. More parameters can improve in-sample fit without improving usefulness. Neither statistic establishes causation or chooses the best model.</p>'+
  '<p class="graph-comparison-question">Which model is justified by the context, shape of the residuals, and mathematical complexity—not just the largest R²?</p>'+
  '</section>';
}

export function renderResidualOptions(d,analysis,e){
 if(!analysis.models?.length)return "";
 const selected=analysis.selectedResidualModel;
 const hasChoice=!!selected;
 const options=['<option value="">Choose a model to examine</option>',...analysis.models.map(m=>
  '<option value="'+e(m.id)+'"'+(m.id===d.residualModelId?' selected':'')+'>'+
   e(m.label+(m.visible?"":" (hidden)"))+'</option>')].join("");
 const state=!selected?"Choose a model to examine its errors.":
  !selected.visible?"Show this model before displaying its residuals.":
  !selected.valid?"Correct its equation or choose another model.":
  !selected.diagnostics?.ok?selected.diagnostics?.reason||"Residuals unavailable for this dataset.":
  selected.diagnostics.r2===null?"The residual plot is available, but R² is undefined because every y-value is identical.":
  "Each residual is the observed y minus that model's predicted y; the zero line means no error.";
 return '<div class="graph-residual-options" aria-label="Residual diagram choices">'+
  '<h4>Examine the errors <span>Optional</span></h4>'+
  '<label class="graph-form-field"><span>Which model should I check?</span><select data-graph-field="residualModelId">'+options+'</select></label>'+
  '<label class="graph-check"><input type="checkbox" data-graph-field="showResidualSegments"'+(d.showResidualSegments?" checked":"")+(hasChoice?"":" disabled")+'><span>Show vertical residual distances on the original graph</span></label>'+
  '<label class="graph-check"><input type="checkbox" data-graph-field="showResidualPlot"'+(d.showResidualPlot?" checked":"")+(hasChoice?"":" disabled")+'><span>Show a separate residual plot</span></label>'+
  '<p class="graph-residual-state">'+e(state)+'</p></div>';
}

export function renderResidualPanelContents(d,analysis,icon,e){
 const m=analysis.selectedResidualModel,usable=validModel(m),ready=usable&&analysis.ready;
 if(!usable)return '<p class="graph-residual-unavailable">'+
  e(!m?"Select a model to see residuals.":!m.visible?
   "The selected model is hidden. Show it again to see the signed residuals.":
   m.diagnostics?.reason||m.error||"The selected model cannot predict every observed value.")+'</p>';
 const stats=m.diagnostics,unit=unitLabel(d);
 return '<p class="graph-residual-maths"><strong>'+e(m.label)+'</strong> · e = observed y − predicted y. Positive values mean the model under-predicted; negative values mean it over-predicted.</p>'+
  '<div class="graph-svg-wrap graph-residual-svg-wrap" data-graph-residual-plot>'+renderGraphResidualSvg(d)+'</div>'+
  '<p class="graph-residual-explainer">The zero reference line is not a regression fit. '+e(String(stats.n))+
   ' residuals correspond to '+e(String(stats.n))+' original paired measurements.'+
   (unit?" Residuals are measured in "+e(unit)+".":"")+'</p>'+
  '<div class="graph-buttons graph-residual-export">'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="graph-residual-png"'+(ready?"":' disabled title="Complete the required data and figure checks first"')+'>'+icon("download")+' Residual PNG</button>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="graph-residual-svg"'+(ready?"":' disabled title="Complete the required data and figure checks first"')+'>'+icon("download")+' Residual SVG</button></div>'+
  '<div class="graph-residual-prompts"><strong>Before describing your model, ask:</strong>'+
   '<ul><li>Are the residuals scattered around zero, or is there a systematic curve?</li>'+
   '<li>Do the errors grow as x changes, or do particular observations stand out?</li>'+
   '<li>What do the size and pattern of these errors mean for your aim and predictions?</li></ul></div>';
}
export function renderResidualPanel(d,analysis,icon,e){
 if(!d.showResidualPlot||d.kind==="function")return "";
 return '<section class="graph-preview-card graph-residual-panel" data-graph-residual-panel aria-label="Residual plot">'+
  '<div class="graph-preview-heading"><strong>Residual plot</strong><small>Independent figure · optional for your IA</small></div>'+
  '<div data-graph-residual-content>'+renderResidualPanelContents(d,analysis,icon,e)+'</div></section>';
}
