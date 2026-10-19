/** Cohesive graph editing surface inside C31. Every editor control has a real action. */
import {analyseGraph,renderGraphSvg,graphData} from "./graph-core.js";

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
 return '<label class="graph-form-field"><span>'+e(label)+'</span>'+element+(hint?'<small>'+e(hint)+'</small>':"")+'</label>';
};
const pick=(key,label,value,choices,e)=>'<label class="graph-form-field"><span>'+e(label)+'</span>'+
 '<select data-graph-field="'+key+'">'+choices.map(([v,n])=>opt(e(v),e(n),value)).join("")+'</select></label>';
const check=(key,label,value)=>'<label class="graph-check"><input type="checkbox" data-graph-field="'+key+'"'+(value?" checked":"")+'><span>'+label+'</span></label>';
const tableExample='<span class="graph-inline-example">Example column headings: <code>Time (s)</code> and <code>Distance (m)</code></span>';
export function renderGraphStudio(state,icon,e){
 const studio=state.graphStudio,d=studio.draft,q=analyseGraph(d),data=graphData(d);
 const selectCols=(key,title,index)=>pick(key,title,String(index),d.columns.map((name,i)=>[String(i),name]),e);
 const unit=(axis)=>'<div class="graph-units">'+pick(axis+"UnitMode",axis==="x"?"Horizontal quantity":"Vertical quantity",d[axis+"UnitMode"],[
  ["unsure","Choose if units apply"],["unit","Has a unit"],["dimensionless","Dimensionless / no units"]
 ],e)+
 (d[axis+"UnitMode"]==="unit"?field(axis+"Unit",axis==="x"?"Horizontal unit":"Vertical unit",d[axis+"Unit"],e,{placeholder:"e.g. seconds / cm / dollars"}):"")+'</div>';
 const problems=q.problems.map(x=>'<li>'+icon("x-circle")+'<span>'+e(x.message)+'</span></li>').join("");
 const warnings=q.warnings.map(x=>'<li>'+icon("alert-circle")+'<span>'+e(x.message)+'</span></li>').join("");
 const zero=q.ready&&q.points.length?"Ready to export":"Add the missing details before exporting";
 return '<section class="graph-studio" data-graph-studio aria-label="Mathematical graph plotter">'+
  '<div class="graph-studio-head"><div><span class="intro-writing-guide-eyebrow">'+icon("chart")+' MY MATHEMATICS · GRAPH STUDIO</span>'+
  '<h2>Build a graph worth including</h2><p>Create one clear mathematical representation, check it at print size and export it to your actual IA document.</p></div>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-close">'+icon("x")+' Close plotter</button></div>'+
  '<div class="graph-type-picker" role="group" aria-label="Choose a graph type">'+
  types.map(([id,name,description])=>'<button class="graph-type'+(d.kind===id?" selected":"")+'" type="button" aria-pressed="'+(d.kind===id)+'" data-action="graph-type" data-graph-value="'+id+'"><strong>'+e(name)+'</strong><small>'+e(description)+'</small></button>').join("")+
  '</div>'+
  '<div class="graph-studio-layout">'+
  '<div class="graph-controls">'+
  (d.kind!=="function"?'<section class="graph-control-card" data-graph-section="data"><h3><span>1</span> Bring in your own data</h3>'+
   '<p>Copy a rectangular range from Google Sheets and paste it here, including headings if possible. CSV files work too. Nothing is sent to a server.</p>'+
   field("raw","Paste table or CSV",d.raw,e,{rows:5,placeholder:"Paste two or more columns copied from Google Sheets."})+
   '<div class="graph-buttons"><button type="button" class="btn btn-secondary btn-sm" data-action="graph-parse">'+icon("clipboard")+' Read pasted values</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-upload">'+icon("upload")+' Import CSV</button></div>'+
   tableExample+
   (d.matrix.length?'<p class="graph-import-ok">'+icon("check-circle")+' '+d.matrix.length+' rows and '+d.columns.length+' columns imported. Missing or invalid selected values are flagged below.</p>'+
   '<div class="graph-field-grid">'+selectCols("xIndex","Horizontal (x) column",d.xIndex)+selectCols("yIndex","Vertical (y) column",d.yIndex)+'</div>':
   '<p class="graph-import-prompt">No table imported yet. Paste genuine data or choose a function graph above.</p>')+
   '</section>':
   '<section class="graph-control-card" data-graph-section="function"><h3><span>1</span> Define your function</h3>'+
   '<p>Use <code>x</code>, numbers, <code>^</code>, <code>*</code>, brackets, and functions such as <code>sin(x)</code>, <code>sqrt(x)</code> or <code>ln(x)</code>. Trigonometric inputs use radians.</p>'+
   field("expression","Function y = f(x)",d.expression,e,{placeholder:"e.g. x^2 - 4*x + 3"})+
   '<small>Values are calculated locally. A function graph is not evidence of collected measurements.</small></section>')+
  '<section class="graph-control-card" data-graph-section="labels"><h3><span>2</span> Make the mathematics clear</h3>'+
  field("title","Descriptive graph title",d.title,e,{placeholder:"e.g. How distance changes with elapsed time"})+
  '<div class="graph-field-grid">'+field("xLabel","Horizontal axis name",d.xLabel,e,{placeholder:"e.g. Time"})+
  field("yLabel","Vertical axis name",d.yLabel,e,{placeholder:"e.g. Distance"})+'</div>'+
  '<div class="graph-field-grid">'+unit("x")+unit("y")+'</div>'+
  (d.kind!=="function"?pick("sourceKind","Where did these data come from?",d.sourceKind,[
   ["unsure","Select the genuine origin"],["primary","My own observations / measurements"],["secondary","Published / secondary source"],["theoretical","Calculated or constructed example"]
  ],e)+
  (d.sourceKind==="secondary"?field("sourceText","Original data source (required)",d.sourceText,e,{placeholder:"Publisher, dataset name, or source URL"}):""):"")+
  '</section>'+
  '<section class="graph-control-card" data-graph-section="scale"><h3><span>3</span> Review your scales</h3>'+
  '<p>Start with automatically chosen bounds. Override them only for a mathematical reason. Both ends must be given for a manual range.</p>'+
  '<div class="graph-field-grid">'+field("xMin","x minimum",d.xMin,e,{placeholder:d.kind==="function"?"-10":"Auto"})+
  field("xMax","x maximum",d.xMax,e,{placeholder:d.kind==="function"?"10":"Auto"})+
  field("yMin","y minimum",d.yMin,e,{placeholder:"Auto"})+
  field("yMax","y maximum",d.yMax,e,{placeholder:"Auto"})+'</div>'+
  '<div class="graph-checks">'+check("showGrid","Show light grid lines",d.showGrid)+
   (d.kind!=="function"?check("showPoints","Show observed points",d.showPoints):"")+
   (d.kind!=="function"?check("includeZeroY","Include zero on vertical axis",d.includeZeroY):"")+'</div>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-clear-scale">Reset scales to automatic</button>'+
   '</section></div>'+
  '<div class="graph-preview-column"><section class="graph-preview-card" aria-label="Live graph preview">'+
   '<div class="graph-preview-heading"><strong>Live preview</strong><small>Check how this will look on an IA page</small></div>'+
   '<div class="graph-svg-wrap" data-graph-preview>'+renderGraphSvg(d)+'</div>'+
   '<div class="graph-preview-meta" data-graph-preview-meta>'+e(d.kind==="function"?"Function (not collected observations)":data.points.length+" paired observations plotted")+'</div></section>'+
  '<section class="graph-quality-card" aria-label="Diagram quality checks" data-graph-quality>'+
  renderGraphQuality(studio,icon,e)+
  '</section>'+
  '<div class="graph-output-actions" data-graph-output>'+
   renderGraphActions(studio,icon,e)+
  '</div>'+
  '<p class="graph-export-note">A saved graph is a working figure, not proof of a result. Copy or download it, put it <strong>after your introduction</strong> in the real IA and interpret only the mathematics you genuinely observe.</p>'+
  '</div></div>'+
  (studio.figures.length?'<details class="graph-saved-figures"><summary>'+icon("layers")+' Saved graph drafts ('+studio.figures.length+')</summary>'+
   '<div class="graph-saved-list">'+studio.figures.map(fig=>
    '<div class="graph-saved-item"><span><strong>'+e(fig.draft.title||"Untitled graph")+'</strong>'+
     '<small>'+e(fig.savedAt?fig.savedAt.slice(0,10):"Saved")+(fig.entryId?" · linked to a mathematical step":"")+'</small></span>'+
     '<button type="button" class="btn btn-quiet btn-sm" data-action="graph-load" data-graph-id="'+e(fig.id)+'">Edit graph</button></div>').join("")+'</div></details>':"")+
  '</section>';
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
 const q=analyseGraph(studio.draft),disabled=q.ready?"":' disabled title="Fix the required presentation checks first"';
 return '<div class="graph-actions-primary"><button type="button" class="btn btn-primary" data-action="graph-use"'+disabled+'>'+icon("check-circle")+' Save & link to my first maths</button></div>'+
  '<div class="graph-buttons"><button type="button" class="btn btn-secondary btn-sm" data-action="graph-save"'+disabled+'>'+icon("layers")+' Save draft</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="graph-copy"'+disabled+'>'+icon("copy")+' Copy PNG</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="graph-png"'+disabled+'>'+icon("download")+' PNG</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="graph-svg"'+disabled+'>'+icon("download")+' SVG</button></div>';
}
