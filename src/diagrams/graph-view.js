import {representationEmpty,representationOutputActions} from "./workspace-ui.js";
import {diagramNotationControls} from "./diagram-notation.js";
import {renderNativeDataGrid} from "./native-data-view.js";
import {renderPresentationCoach,renderFigureHandover} from "./presentation-coach-view.js";
/** Cohesive graph editing surface inside C31. Every editor control has a real action. */
import {analyseGraph,renderGraphSvg,graphData} from "./graph-core.js";
import {GRAPH_MODEL_TYPES,MAX_GRAPH_MODELS} from "./graph-models.js";
import {metricText,renderModelComparison,renderResidualOptions,renderResidualPanel} from "./graph-diagnostics-view.js";

const types=[
 ["scatter","Scatter diagram","Genuine paired measurements. Points are not joined or fitted automatically."],
 ["time","Time series","Plot observed values against time and join readings in chronological order."],
 ["function","Function graph","Plot a chosen mathematical expression over a stated domain."]
];
const opt=(value,label,selected)=>'<option value="'+value+'"'+(String(value)===String(selected)?" selected":"")+'>'+label+'</option>';
const field=(key,label,value,e,{placeholder="",hint="",rows=0}={})=>{
 const element=rows?
  '<textarea data-graph-field="'+key+'" rows="'+rows+'" placeholder="'+e(placeholder)+'">'+e(value)+'</textarea>':
  '<input type="text" data-graph-field="'+key+'" value="'+e(value)+'" placeholder="'+e(placeholder)+'" autocomplete="off">';
 return '<label class="graph-form-field"><span>'+e(label)+'</span>'+element+(hint?'<small>'+e(hint)+'</small>':"")+'</label>'+ (["title","xLabel","yLabel","xUnit","yUnit","caption"].includes(key)?diagramNotationControls(e,{studio:"graph",key}):"");
};
const pick=(key,label,value,choices,e)=>'<label class="graph-form-field"><span>'+e(label)+'</span>'+
 '<select data-graph-field="'+key+'">'+choices.map(([v,n])=>opt(e(v),e(n),value)).join("")+'</select></label>';
const check=(key,label,value)=>'<label class="graph-check"><input type="checkbox" data-graph-field="'+key+'"'+(value?" checked":"")+'><span>'+label+'</span></label>';
const GRAPH_ROUTE_HINTS={
 relationships:"A scatter diagram of genuinely paired measurements is a useful first inspection. Do not fit a line automatically.",
 groups:"Start with a comparable distribution or group chart. The scatter/time/function plotter may not be the right display for your first step.",
 categorical:"This question usually benefits from a two-way summary table or a comparison of proportions, not a numerical scatter plot.",
 variation:"A distribution or box plot may reveal variation better than a connected line. Those diagrams are now available in Statistical Diagrams.",
 "fitted-models":"Compare data with a theoretical model or choose a regression family explicitly. Transformed least squares and original-scale least squares can produce different coefficients.",
 growth:"A chronological plot can suggest exponential or power relationships. Check whether positivity restrictions and the chosen fitting objective match your measurement process.",
 cycles:"Only try sinusoidal fitting if cycles seem plausible. A period inferred from a short series is uncertain; consider supplying an independently measured period.",
 trajectories:"Position-versus-time or coordinate measurements can be plotted. Use Image & Coordinate Tracer for calibrated coordinates.",
 optimisation:"A function graph over the feasible domain can illustrate candidate extrema; the graph alone is not proof of the optimum.",
 images:"Use Image & Coordinate Tracer for calibration and tracing.",
 triangulation:"A labelled scale-aware geometric diagram is more suitable; use Image & Coordinate Tracer for calibrated geometry.",
 voronoi:"A coordinate or map construction is needed; Voronoi Studio is available for nearest-site constructions.",
 finance:"A function graph can compare cost/revenue models; use matching units and a realistic input domain.",
 chance:"Probability trees or distribution charts are often more helpful than a continuous function graph.",
 proof:"Use only a diagram that genuinely helps the argument; plotted examples do not establish a universal proof.",
 iteration:"A sequence plot may suggest behaviour, but a dedicated iteration/cobweb diagram will be more informative."
};
export function renderGraphAccuracyEcho(state,e){
 const d=state.graphStudio.draft,plan=state.planning?.accuracyPlans||[],actual=state.completion?.accuracyDecisions||[];
 const norm=x=>String(x||"").trim().toLowerCase();
 const matches=[...plan.map(x=>({...x,context:"Planned recording accuracy (confirm with actual source)"})),
  ...actual.map(x=>({...x,context:"Recorded actual-source precision"}))].filter(x=>
   [d.xLabel,d.yLabel].some(label=>norm(label)&&[x.quantity,x.symbol].some(name=>norm(name)===norm(label))));
 if(!matches.length){
  const previous=state.planning?.fields?.firstAccuracy;
  return previous?'<p class="graph-context-note">'+e("Earlier intended accuracy: "+previous+". Reconfirm it for the source you actually used before deciding reported precision.")+'</p>':"";
 }
 return '<aside class="graph-context-note" aria-label="Relevant accuracy sparks">'+
  '<strong>Related accuracy sparks</strong><ul>'+matches.slice(0,4).map(x=>
  '<li><strong>'+e(x.quantity||x.symbol)+'</strong> '+e([x.unit&&"("+x.unit+")",x.resolution||x.policy||"",x.context].filter(Boolean).join(" · "))+'</li>').join("")+
  '</ul><p>Do not invent extra measurement precision or apply one universal decimal-place rule. Check the actual source before rounding.</p></aside>';
}
export function graphSourceChoices(studio,icon,e){
 const d=studio.draft;
 const selectCols=(key,title,index)=>pick(key,title,String(index),d.columns.map((name,i)=>[String(i),name]),e);
 return d.matrix.length?
  '<p class="graph-import-ok">'+icon("check-circle")+' '+d.matrix.length+' working rows, '+d.columns.length+' columns.</p>'+
  '<div class="graph-field-grid">'+selectCols("xIndex","Horizontal (x) column",d.xIndex)+
   selectCols("yIndex","Vertical (y) column",d.yIndex)+'</div>':
  '<p class="native-grid-tip">Enter genuine observations in the worksheet above to start plotting.</p>';
}
/** Status is refreshed independently of the input so typing never loses focus. */
export function renderGraphModelSummary(model,e){
 if(!model)return "";
 const visibility=!model.visible?'<p class="graph-model-hidden">Hidden from preview and exported figures.</p>':"";
 if(!model.valid)return visibility+'<p class="graph-model-error" role="status">'+e(model.error||"Model unavailable.")+'</p>';
 const diagnostics=model.diagnostics||{},statistics=!diagnostics.ok?
  '<p class="graph-model-diagnostic-unavailable">'+e(diagnostics.reason||"Comparable diagnostics unavailable.")+'</p>':
  '<p class="graph-model-metrics">RMSE: <strong>'+e(metricText(diagnostics.rmse))+
   '</strong> · R²: <strong>'+e(diagnostics.r2===null?"Undefined":metricText(diagnostics.r2))+'</strong></p>'+
  (diagnostics.r2Note?'<small>'+e(diagnostics.r2Note)+'</small>':'');
 return visibility+'<p class="graph-model-equation">'+e(model.equation)+'</p>'+
  '<p class="graph-model-method">'+e(model.method)+' · '+model.n+' observations</p>'+
  statistics+(model.caution?'<p class="graph-model-caution">'+e(model.caution)+'</p>':'')+
  '<small>'+e(model.note)+'</small>'+
  (diagnostics.ok?'<div class="graph-model-table-transfer"><button type="button" class="btn btn-secondary btn-sm" data-action="graph-to-table" data-graph-model-id="'+e(model.id)+'">'+
    'Use this model in Table Studio</button><small>Copy observed values, full-precision fitted predictions and residuals. Your graph remains unchanged; the table is not live-synced.</small></div>':'');
}
const graphModelOptions=(choice,e)=>{
 const group=items=>items.map(([id,name])=>'<option value="'+e(id)+'"'+(id===choice?" selected":"")+'>'+e(name)+'</option>').join("");
 return '<label class="graph-form-field"><span>Choose a model to try</span><select data-graph-field="modelChoice">'+
  '<optgroup label="Everyday modelling">'+group([
   ["linear","Linear regression (least squares)"],["quadratic","Quadratic regression (least squares)"],
   ["custom","My own equation (no regression)"]])+'</optgroup>'+
  '<optgroup label="More advanced modelling">'+group([
   ["exponential","Exponential (positive y)"],["logarithmic","Logarithmic (positive x)"],
   ["power","Power (positive x and y)"],["cubic","Cubic (four coefficients)"],
   ["sinusoidal","Sinusoidal (cycles and period)"]])+'</optgroup></select></label>';
};
const advancedGraphModelOptions=(model,e)=>{
 if(["exponential","power"].includes(model.type)){
  return '<label class="graph-form-field graph-advanced-model-option"><span>Which errors should the regression minimise?</span>'+
   '<select data-graph-model-method="'+e(model.id)+'">'+
    '<option value="transformed"'+(model.fitMethod==="transformed"?" selected":"")+'>'+
     'Log-transformed: minimise squared errors in ln(y)</option>'+
    '<option value="original"'+(model.fitMethod==="original"?" selected":"")+'>'+
     'Original scale: minimise squared errors in y</option></select>'+
   '<small>These methods can give different coefficients. RMSE and R² below always use the original y-values. Record your choice when writing your IA.</small></label>';
 }
 if(model.type==="sinusoidal"){
  return '<label class="graph-form-field graph-advanced-model-option"><span>Known or estimated period (optional, in x-units)</span>'+
   '<input type="text" inputmode="decimal" autocomplete="off" data-graph-model-period="'+e(model.id)+'" value="'+e(model.period||'')+
    '" maxlength="36" placeholder="Leave blank to explore possible periods"/>'+
   '<small>Enter a positive period if justified by context or observations. Otherwise Pathfinder searches for a candidate period; it cannot prove the data are periodic. Sine phase uses radians.</small></label>';
 }
 if(model.type==="logarithmic")return '<p class="graph-model-domain">Requires x &gt; 0. Fits the original y-values against ln(x) using least squares.</p>';
 if(model.type==="cubic")return '<p class="graph-model-domain">Four coefficients can follow noisy data closely. Check the residuals and justify the extra complexity.</p>';
 return '';
};
export function renderGraphModelControls(d,analysis,icon,e){
 const models=analysis.models||[],choice=GRAPH_MODEL_TYPES[d.modelChoice]?d.modelChoice:"linear";
 const full=models.length>=MAX_GRAPH_MODELS;
 const cards=models.map(model=>
  '<article class="graph-model-card" data-graph-model="'+e(model.id)+'" style="--graph-model-color:'+model.color+'">'+
   '<div class="graph-model-row"><span class="graph-model-swatch'+(model.dash?' dashed':'')+'" aria-hidden="true"></span>'+
    '<strong>'+e(model.label)+'</strong>'+
    '<div class="graph-model-actions"><button type="button" class="btn btn-quiet btn-sm" data-action="graph-model-toggle" data-graph-model-id="'+e(model.id)+'" aria-pressed="'+model.visible+'">'+
     (model.visible?'Hide':'Show')+'</button>'+
    '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-model-remove" data-graph-model-id="'+e(model.id)+'" aria-label="Remove '+e(model.label)+'">'+icon("x")+' Remove</button></div></div>'+
   (model.type==="custom"?'<label class="graph-form-field graph-model-input"><span>Equation y = f(x)</span>'+
    '<input type="text" data-graph-model-expression="'+e(model.id)+'" value="'+e(model.expression)+'" maxlength="180" autocomplete="off" placeholder="e.g. 2*x^2 - 3*x + 1">'+
    '<small>Enter a model you calculated yourself. Use x, ^ and *; functions such as sin(x) are allowed. Nothing is fitted for you.</small></label>':'')+
   advancedGraphModelOptions(model,e)+
   '<div class="graph-model-summary" data-graph-model-summary="'+e(model.id)+'">'+renderGraphModelSummary(model,e)+'</div>'+
   '</article>').join("");
 return '<section class="graph-control-card graph-model-explorer" data-graph-section="models" aria-label="Optional regression and model overlays">'+
  '<h3><span>2</span> Explore a model <small>Optional</small></h3>'+
  '<p>Inspect your observations before choosing an appropriate model. All fitting is optional, and not every regression minimises the same kind of error. The mathematical method and its restrictions appear beside each model.</p>'+
  '<div class="graph-variable-symbols" aria-label="Symbols to use in regression equations">'+
  '<h4>Variables in your model equations</h4>'+
  '<p>Use a meaningful single letter for each quantity, such as <strong>t</strong> for time and <strong>h</strong> for height. Your axis names and units remain separate.</p>'+
  '<div class="graph-field-grid">'+
  field("xSymbol","Horizontal variable",d.xSymbol,e,{placeholder:"x",hint:"Independent variable, e.g. t, r or θ."})+
  field("ySymbol","Vertical variable",d.ySymbol,e,{placeholder:"y",hint:"Dependent variable, e.g. h, A or v."})+
  '</div><small>The equations, key and exported figures use these letters. When typing your own model, still use x in the calculator; only the displayed notation changes.</small>'+
  '</div>'+
  '<div class="graph-model-add">'+graphModelOptions(choice,e)+
    '<button type="button" class="btn btn-secondary btn-sm" data-action="graph-model-add"'+(full?' disabled title="Remove a model before adding another."':'')+'>'+
    icon("plus-circle")+' Add model</button></div>'+
  '<div class="graph-model-list" data-graph-model-list>'+
   (cards||'<p class="graph-model-empty">No models added. Your original points are shown without an automatic line of best fit.</p>')+'</div>'+
  '<div data-graph-comparison>'+renderModelComparison(d,analysis,e)+'</div>'+
  renderResidualOptions(d,analysis,e)+
  (models.length?'<div class="graph-model-reflection"><label class="graph-form-field"><span>My interpretation or reason for choosing a model (optional)</span>'+
   '<textarea data-graph-field="modelReflection" rows="3" maxlength="1200" placeholder="What do the shape and size of the errors tell you? Why might one model be more appropriate?">'+e(d.modelReflection)+'</textarea>'+
   '<small>Your own thinking is saved with the working figure; copy or adapt it yourself when writing your IA.</small></label></div>':'')+
  '<p class="graph-model-guidance">Show or hide each model independently. You can include up to three; curves stop at the observed x-range. Displayed coefficients are rounded but calculations use full precision. A curve does not establish model suitability; inspect and discuss fitting errors before drawing conclusions.</p>'+
  '</section>';
}
const tableExample='<span class="graph-inline-example">Example column headings: <code>Time (s)</code> and <code>Distance (m)</code></span>';
export function renderGraphStudio(state,icon,e){
 const studio=state.graphStudio,d=studio.draft,q=analyseGraph(d),data=graphData(d);
 const selectCols=(key,title,index)=>pick(key,title,String(index),d.columns.map((name,i)=>[String(i),name]),e);
 const unit=(axis)=>'<div class="graph-units">'+pick(axis+"UnitMode",axis==="x"?"Horizontal quantity":"Vertical quantity",d[axis+"UnitMode"],[
  ["unsure","Choose if units apply"],["unit","Has a unit"],["dimensionless","Dimensionless / no units"]
 ],e)+
 (d[axis+"UnitMode"]==="unit"?field(axis+"Unit",axis==="x"?"Horizontal unit":"Vertical unit",d[axis+"Unit"],e,{placeholder:"e.g. m s^-2, cm^3, kg m^-3" ,hint:"Use ^ for powers: m s^-2 appears as m s⁻². Also accepts m/s^2 and 10^(-3)."}):"")+'</div>';
 const problems=q.problems.map(x=>'<li>'+icon("x-circle")+'<span>'+e(x.message)+'</span></li>').join("");
 const warnings=q.warnings.map(x=>'<li>'+icon("alert-circle")+'<span>'+e(x.message)+'</span></li>').join("");
 const zero=q.ready&&q.points.length?"Ready to export":"Add the missing details before exporting";
 return '<section class="graph-studio representation-studio" data-graph-studio aria-label="Mathematical graph plotter">'+
  '<div class="graph-studio-head"><div><span class="intro-writing-guide-eyebrow">'+icon("chart")+' MY MATHEMATICS · GRAPH STUDIO</span>'+
  '<h2>Graph &amp; Model Explorer</h2><p>Plot genuine observations, optionally explore a justified model, and export a clear mathematical figure for your IA.</p></div>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-close">'+icon("x")+' Close plotter</button></div>'+
  '<div class="graph-type-picker" role="group" aria-label="Choose a graph type">'+
  types.map(([id,name,description])=>'<button class="graph-type'+(d.kind===id?" selected":"")+'" type="button" aria-pressed="'+(d.kind===id)+'" data-action="graph-type" data-graph-value="'+id+'"><strong>'+e(name)+'</strong><small>'+e(description)+'</small></button>').join("")+
  '</div>'+
  (GRAPH_ROUTE_HINTS[state.planning?.routeExplorer?.selectedRoute]?
   '<p class="graph-context-note"><strong>From your proposed mathematical pathway:</strong> '+
   e(GRAPH_ROUTE_HINTS[state.planning.routeExplorer.selectedRoute])+
   ' Your actual results can lead you elsewhere.</p>':"")+
  '<div class="graph-studio-layout">'+
  '<div class="graph-controls">'+
  (d.kind!=="function"?'<section class="graph-control-card" data-graph-section="data" data-representation-step="create"><h3><span>1</span> Enter your own data</h3>'+
   '<p>Type paired observations into the worksheet to plot them immediately. Units belong in the headings when appropriate.</p>'+renderNativeDataGrid(state,"graph",icon,e)+
   '<details class="native-import-details"><summary>Or paste / import an existing spreadsheet</summary>'+
   field("raw","Paste table or CSV",d.raw,e,{rows:5,placeholder:"Paste two or more columns copied from Google Sheets."})+
   '<div class="graph-buttons"><button type="button" class="btn btn-secondary btn-sm" data-action="graph-parse">'+icon("clipboard")+' Read pasted values</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-upload">'+icon("upload")+' Import CSV</button></div>'+
   tableExample+'</details>'+
   '<div data-native-choices="graph">'+graphSourceChoices(studio,icon,e)+'</div>'+
   '</section>':
   '<section class="graph-control-card" data-graph-section="function" data-representation-step="create"><h3><span>1</span> Define your function</h3>'+
   '<p>Use <code>x</code>, numbers, <code>^</code>, <code>*</code>, brackets, and functions such as <code>sin(x)</code>, <code>sqrt(x)</code> or <code>ln(x)</code>. Trigonometric inputs use radians.</p>'+
   field("expression","Function y = f(x)",d.expression,e,{placeholder:"e.g. x^2 - 4*x + 3"})+
   '<small>Values are calculated locally. A function graph is not evidence of collected measurements.</small></section>')+
  (d.kind==="function"?"":renderGraphModelControls(d,q,icon,e))+
  '<section class="graph-control-card" data-graph-section="labels" data-representation-step="refine"><h3><span>'+(d.kind==="function"?"2":"3")+'</span> Make the mathematics clear</h3>'+
  field("title","Descriptive graph title",d.title,e,{placeholder:"e.g. How distance changes with elapsed time"})+
  field("figureNumber","Figure number in my IA",d.figureNumber,e,{placeholder:"e.g. 1"})+
  '<div class="graph-field-grid">'+field("xLabel","Horizontal axis name",d.xLabel,e,{placeholder:"e.g. Time"})+
  field("yLabel","Vertical axis name",d.yLabel,e,{placeholder:"e.g. Distance"})+'</div>'+
  '<div class="graph-field-grid">'+unit("x")+unit("y")+'</div>'+
  renderGraphAccuracyEcho(state,e)+
  field("caption","Optional mathematical caption",d.caption,e,{rows:2,placeholder:"e.g. Observed values before selecting a model"})+
  (d.kind!=="function"?pick("sourceKind","Where did these data come from?",d.sourceKind,[
   ["unsure","Select the genuine origin"],["primary","My own observations / measurements"],["secondary","Published / secondary source"],["theoretical","Calculated or constructed example"]
  ],e)+
  (d.sourceKind==="secondary"?field("sourceText","Original data source (required)",d.sourceText,e,{placeholder:"Publisher, dataset name, or source URL"}):""):"")+
  '</section>'+
  '<section class="graph-control-card" data-graph-section="scale"><h3><span>'+(d.kind==="function"?"3":"4")+'</span> Review your scales</h3>'+
  '<p>Start with automatically chosen bounds. Override them only for a mathematical reason. Both ends must be given for a manual range. If zero is outside an axis range, a small break mark is added automatically to the figure; no mark is shown when zero is included.</p>'+
  '<div class="graph-field-grid">'+field("xMin","x minimum",d.xMin,e,{placeholder:d.kind==="function"?"-10":"Auto"})+
  field("xMax","x maximum",d.xMax,e,{placeholder:d.kind==="function"?"10":"Auto"})+
  field("yMin","y minimum",d.yMin,e,{placeholder:"Auto"})+
  field("yMax","y maximum",d.yMax,e,{placeholder:"Auto"})+'</div>'+
  (d.kind!=="function"?'<div class="graph-legend-options">'+
   check("showLegend","Show key / legend",d.showLegend)+
   pick("legendPosition","Key location",d.legendPosition,[["below","Below graph (recommended)"],["above","Above graph"],["right","Right of graph"]],e)+
   pick("equationPlacement","Where should model equations appear?",d.equationPlacement,[
    ["legend","Inside the key"],["annotation","In a separate box below the graph"],["hidden","Do not show equations"]
   ],e)+
   '<small>These presentation choices never hide or remove a regression curve. The equation box only includes models that are currently visible.</small>'+
   (d.equationPlacement==="legend"&&!d.showLegend?
     '<small class="graph-legend-hint">Your key is hidden, so its equations are hidden too. Select a separate box to show equations without the key.</small>':"")+
   '</div>':"")+
  '<div class="graph-checks">'+check("showGrid","Show light grid lines",d.showGrid)+
   (d.kind==="time"?check("showPoints","Show observed points",d.showPoints):"")+
   (d.kind!=="function"?check("includeZeroY","Include zero on vertical axis",d.includeZeroY):"")+'</div>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-clear-scale">Reset scales to automatic</button>'+
   '</section></div>'+
  '<div class="graph-preview-column"><section class="graph-preview-card" aria-label="Live graph preview">'+
   '<div class="graph-preview-heading"><strong>Live preview</strong><small>Check how this will look on an IA page</small></div>'+
   '<div class="graph-svg-wrap" data-graph-preview>'+renderGraphSvg(d)+'</div>'+
   '<div class="graph-preview-meta" data-graph-preview-meta>'+e(d.kind==="function"?"Function (not collected observations)":data.points.length+" paired observations plotted")+'</div></section>'+
  renderResidualPanel(d,q,icon,e)+
  '<section class="graph-quality-card" aria-label="Diagram quality checks" data-graph-quality>'+
  renderGraphQuality(studio,icon,e)+
  '</section>'+renderPresentationCoach(state,"graph",d,icon,e)+
  '<div class="graph-output-actions" data-graph-output data-representation-step="use">'+
   renderGraphActions(studio,icon,e)+
  '</div>'+renderFigureHandover(state,"graph",d,icon,e)+
  '<p class="graph-export-note">A saved graph is a working figure, not proof of a result. Copy or download it, put it <strong>after your introduction</strong> in the real IA and interpret only the mathematics you genuinely observe.</p>'+
  '</div></div>'+
  (studio.figures.length?'<details class="graph-saved-figures"><summary>'+icon("layers")+' Saved graph drafts ('+studio.figures.length+')</summary>'+
   '<div class="graph-saved-list">'+studio.figures.map(fig=>
    '<div class="graph-saved-item"><span><strong>'+e(fig.draft.title||"Untitled graph")+'</strong>'+
     '<small>'+e(fig.savedAt?fig.savedAt.slice(0,10):"Saved")+(fig.entryId?" · linked to a mathematical step":"")+'</small></span>'+
     '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-load" data-graph-id="'+e(fig.id)+'">Edit graph</button></div>').join("")+'</div></details>':"")+
  '<div class="graph-reset-row"><button type="button" class="btn btn-quiet btn-sm" data-action="graph-new">'+icon("plus-circle")+' Start a different graph</button></div></section>';
}
export function renderGraphQuality(studio,icon,e){
 const q=analyseGraph(studio.draft);
 const items=q.problems.concat(q.warnings);
 return '<div class="graph-quality-head"><strong>'+icon(q.ready?"check-circle":"alert-circle")+
  ' Diagram quality check</strong><span class="graph-quality-status '+(q.ready?"pass":"attention")+'">'+
  (q.ready?"Required checks passed":q.problems.length+" to fix")+'</span></div>'+
  (!items.length?'<p class="graph-quality-clean">Your graph has the required labels and mathematical content. Check that it helps answer your aim.</p>':
  '<ul class="graph-quality-list">'+
   q.problems.map(x=>'<li class="problem">'+icon("x-circle")+'<span>'+e(x.message)+'</span></li>').join("")+
   q.warnings.map(x=>'<li class="warning">'+icon("alert-circle")+'<span>'+e(x.message)+'</span></li>').join("")+'</ul>')+
  '<p class="graph-quality-footnote">These are communication checks, not an IB grade. Check whether the representation is mathematically suitable for your question.</p>';
}
export function renderGraphActions(studio,icon,e){
 const q=analyseGraph(studio.draft);
 return representationOutputActions(icon,e,{
  type:"graph",ready:q.ready,saveAction:"graph-save",linkAction:"graph-use",
  disabledReason:"Resolve the required graph checks first.",
  linkGroupClass:"graph-actions-primary",exportGroupClass:"graph-buttons",
  formats:[["graph-copy","Copy PNG","copy"],["graph-png","Download PNG","download"],
   ["graph-svg","Download SVG","download"]]
 });
}
