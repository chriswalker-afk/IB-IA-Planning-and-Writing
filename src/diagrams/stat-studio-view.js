import {representationEmpty} from "./workspace-ui.js";
import {renderNativeDataGrid} from "./native-data-view.js";
import {renderPresentationCoach,renderFigureHandover} from "./presentation-coach-view.js";
/** One consistent student-facing interface for all four statistical pathways. */
import {STAT_TYPES,statAnalysis,MAX_STAT_FIGURES} from "./stat-studio-core.js";
import {renderStatSvg} from "./stat-studio-render.js";
import {escapeGraph} from "./graph-core.js";
import {diagramNotationControls} from "./diagram-notation.js";
import {BOX_OUTLIER_METHODS,BOX_Z_CUTOFFS,formatBoxNumber} from "./box-analysis.js";
const ROUTES={
 groups:"Comparing groups: begin with comparative box plots when you have numerical measurements, or grouped bars for counts in discrete categories.",
 variation:"Distribution and spread: histograms show shape and frequency density; box plots emphasise median, quartiles and outliers.",
 categorical:"Comparing discrete categories: grouped bar charts show counts; percentages are usually more suitable when groups are different sizes.",
 relationships:"To study correlation between two numerical variables, the scatter plotter is usually more suitable. These diagrams summarise one variable at a time.",
 growth:"To study time-dependent change, consider a time-series graph. A box plot or histogram may instead compare variability before and after an intervention.",
 chance:"For an empirical distribution, a histogram or dot plot is useful. Your chosen samples do not by themselves establish a theoretical probability distribution.",
 "fitted-models":"Inspect spread or compare residual distributions carefully; a plotted distribution is descriptive and does not establish that a model fits.",
 finance:"Compare cost categories with discrete bars, or use box plots for repeated numerical outcomes. Do not make bars represent continuous intervals."
};
const h=(value,e)=>e(value);
function field(key,label,value,e,{hint="",placeholder="",rows=0}={}){
 const control=rows?'<textarea data-stat-field="'+key+'" rows="'+rows+'" placeholder="'+e(placeholder)+'">'+e(value)+'</textarea>':
  '<input type="text" data-stat-field="'+key+'" value="'+e(value)+'" placeholder="'+e(placeholder)+'" autocomplete="off">';
 return '<label class="stat-form-field"><span>'+e(label)+'</span>'+control+(hint?'<small>'+e(hint)+'</small>':"")+'</label>'+
  (["title","variable","unit","caption"].includes(key)?diagramNotationControls(e,{studio:"stat",key}):"");
}
function select(key,label,value,options,e){
 return '<label class="stat-form-field"><span>'+e(label)+'</span><select data-stat-field="'+key+'">'+
  options.map(([v,label])=>'<option value="'+e(v)+'"'+(v===value?" selected":"")+'>'+e(label)+'</option>').join("")+
  '</select></label>';
}
function checkbox(key,label,value){
 return '<label class="stat-checkbox"><input type="checkbox" data-stat-field="'+key+'"'+(value?" checked":"")+'><span>'+label+'</span></label>';
}
const kindDesc={
 histogram:"Continuous data belong in touching class intervals. Class width matters: the vertical axis is frequency density, not frequency.",
 box:"Use raw numerical observations for one or more groups. State the quartile convention and distinguish genuine outliers from mistakes.",
 dot:"Each dot represents an actual observation. Repeated values stack, making a dot plot good for relatively small datasets.",
 bar:"The first column contains discrete category names; other columns are groups of genuine integer counts. Percentages use each group's own denominator."
};
export function statSummaryHtml(studio,icon,e){
 const q=statAnalysis(studio.draft),r=q.result,d=q.draft;
 if(!d.matrix.length)return '<p class="stat-summary-empty">Your selected data summary will appear here once you have imported the table.</p>';
 if(d.kind==="histogram"){
  if(!r.bins?.length)return '<p class="stat-summary-empty">Check the class boundaries or chosen width.</p>';
  return '<div class="stat-summary-metrics"><div><strong>'+r.total+'</strong><span>Total frequency</span></div><div><strong>'+r.bins.length+'</strong><span>Intervals</span></div></div>'+
   '<p class="stat-summary-note">Frequency density = frequency ÷ width. The area of each bar therefore represents its frequency.</p>';
 }
 if(d.kind==="box"||d.kind==="dot"){
  const series=r.series||[],num=v=>formatBoxNumber(v,d.boxPrecision);
  const rows='<div class="stat-summary-rows">'+series.slice(0,5).map(s=>
   '<div class="stat-summary-row"><strong>'+e(s.name)+'</strong><span>n = '+s.values.length+
   (d.kind==="box"&&s.box?' · Median '+num(s.box.median)+' · IQR '+num(s.box.iqr)+
    ' · '+s.box.outliers.length+' flagged':'')+'</span></div>').join("")+'</div>';
  if(d.kind!=="box")return rows;
  const method={
   tukey:"1.5 × IQR",extreme:"3 × IQR",zscore:"Z-score",modified:"Modified Z-score",
   none:"No outlier classification",minmax:"No classification (legacy min–max)"
  }[d.outlierRule];
  const detail=series.map(s=>{
   const b=s.box;if(!b)return "";
   const entries=[
    ["n",String(b.n)],["Minimum",num(b.min)],["Q1",num(b.q1)],
    ["Median",num(b.median)],["Q3",num(b.q3)],["Maximum",num(b.max)],
    ["IQR = Q3 − Q1",num(b.iqr)],["Mean",num(b.mean)],
    ["Sample SD",num(b.sd)],["MAD",num(b.mad)],
    ["Lower whisker",num(b.lowWhisker)],["Upper whisker",num(b.highWhisker)]
   ];
   if(b.limits)entries.push(["Lower threshold",num(b.limits[0])],["Upper threshold",num(b.limits[1])]);
   const extra=b.outlierMethod==="tukey"||b.outlierMethod==="extreme"?
    'Fences = Q1 − '+b.threshold+' × IQR and Q3 + '+b.threshold+' × IQR.':
    b.outlierMethod==="zscore"?'Z = (x − mean) / sample SD. Flag |Z| > '+b.zThreshold+'.':
    b.outlierMethod==="modified"?'Modified Z = 0.6745(x − median) / MAD. Flag |Z| > 3.5.':
    'No numerical outlier thresholds requested.';
   return '<section class="stat-analysis-group"><h4>'+e(s.name)+'</h4>'+
    '<div class="stat-analysis-metrics">'+entries.map(([k,v])=>
     '<span>'+e(k)+'</span><strong>'+e(v)+'</strong>').join("")+'</div>'+
    '<p>'+e(extra)+'</p>'+
    (b.methodNote?'<p class="stat-analysis-warning">'+e(b.methodNote)+'</p>':'')+
    '<p><strong>'+b.outliers.length+' flagged observation(s):</strong> '+
    (b.flagged.length?e(b.flagged.map(f=>num(f.value)+(f.score===null?'':' (score '+num(f.score)+')')).join(', ')):
     'None under the chosen rule')+'</p></section>';
  }).join("");
  const comparisons=r.comparisons||[];
  return rows+'<p class="stat-summary-note">Quartiles: '+
   (d.quartileRule==="halves"?"median of lower and upper halves (middle omitted for odd n)":
    "linear interpolation at position (n − 1)p")+'. Outlier rule: '+e(method)+'.</p>'+
   '<details class="stat-analysis-detail"><summary>Show calculations, thresholds and compared groups</summary>'+
   '<p class="stat-analysis-intro">These are descriptive calculations from every imported observation. A flagged value is not automatically an error or a value to delete.</p>'+
   detail+(comparisons.length?'<section class="stat-analysis-group"><h4>Comparing groups</h4>'+
    '<p>Differences are second group minus first group, using the original measurement units. They are not significance tests.</p>'+
    '<div class="stat-analysis-scroll"><table class="stat-compare-table"><thead><tr><th>Groups (second − first)</th>'+
    '<th>Median Δ</th><th>IQR Δ</th><th>Range Δ</th><th>Flagged Δ</th></tr></thead><tbody>'+
    comparisons.map(x=>'<tr><td>'+e(x.second)+' − '+e(x.first)+'</td><td>'+num(x.medianDifference)+
     '</td><td>'+num(x.iqrDifference)+'</td><td>'+num(x.rangeDifference)+'</td><td>'+
     x.outlierDifference+'</td></tr>').join("")+'</tbody></table></div></section>':'')+
   '</details>';
 }
 return '<div class="stat-summary-metrics"><div><strong>'+(r.categories?.length||0)+'</strong><span>Categories</span></div><div><strong>'+(r.names?.length||0)+'</strong><span>Groups</span></div></div>'+
  '<div class="stat-summary-rows">'+(r.names||[]).map((name,i)=>'<div class="stat-summary-row"><strong>'+e(name)+'</strong><span>n = '+(r.totals?.[i]||0)+'</span></div>').join("")+'</div>';
}
export function statPreviewHtml(studio,icon,e){
 return '<section class="stat-preview" data-stat-preview><div class="stat-preview-heading"><strong>Live diagram preview</strong><small>Readable at IA page width</small></div>'+
 '<div class="stat-figure-frame">'+renderStatSvg(studio.draft)+'</div>'+
 '<p class="stat-preview-hint">Graphs show only the real data you imported. Changing bin widths, quartile rules or denominators can change the apparent pattern.</p></section>';
}
export function statQualityHtml(studio,icon,e){
 const q=statAnalysis(studio.draft);
 return '<div class="stat-quality-top"><strong>'+icon(q.ready?"check-circle":"alert-circle")+' Statistical quality checks</strong>'+
  '<span class="graph-quality-status '+(q.ready?"pass":"attention")+'">'+(q.ready?"Required checks passed":q.problems.length+" to fix")+'</span></div>'+
  (q.problems.length||q.warnings.length?'<ul class="stat-issues">'+
   q.problems.map(p=>'<li class="problem">'+icon("x-circle")+'<span>'+e(p.message)+'</span></li>').join("")+
   q.warnings.map(p=>'<li class="warning">'+icon("alert-triangle")+'<span>'+e(p.message)+'</span></li>').join("")+'</ul>':
   '<p class="stat-quality-clean">All required labelling, source and data checks pass.</p>')+
  '<p class="stat-quality-note">These checks improve communication, but they are not an IB grade. Interpret results in the context of your aim, sampling and measurement limitations.</p>';
}
export function statOutputHtml(studio,icon,e){
 const q=statAnalysis(studio.draft),disabled=q.ready?"":' disabled title="Fix the required mathematical and presentation checks first"';
 return '<button type="button" class="btn btn-primary" data-action="stat-use"'+disabled+'>'+icon("check-circle")+' Save and link to my first mathematics</button>'+
 (q.draft.kind==="histogram"?'<div class="stat-table-transfer"><button type="button" class="btn btn-secondary btn-sm" data-action="stat-to-table"'+disabled+
 '>'+icon("table")+' Create matching grouped-frequency table</button>'+
 '<small>Copies the original measurements or grouped classes, preserving your exact histogram boundaries. No saved table is overwritten.</small></div>':"")+
 '<div class="stat-output-buttons">'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="stat-save"'+disabled+'>'+icon("layers")+' Save draft</button>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="stat-copy"'+disabled+'>'+icon("copy")+' Copy PNG</button>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="stat-png"'+disabled+'>'+icon("download")+' PNG</button>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="stat-svg"'+disabled+'>'+icon("download")+' SVG</button>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="stat-csv"'+disabled+'>'+icon("table")+' '+(q.draft.kind==="box"?"Calculations CSV":"Summary CSV")+'</button></div>';
}
function selectedControls(d,e){
 if(!d.columns.length)return '<p class="stat-placeholder-inline">Paste and read your source values first to select columns.</p>';
 const options=d.columns.map((name,i)=>[String(i),name]);
 const pick=(key,label,index)=>select(key,label,String(index),options,e);
 const numChoices=d.columns.map((name,i)=>'<label class="stat-column-checkbox"><input type="checkbox" data-stat-series="'+i+'"'+(d.selected.includes(i)?" checked":"")+'><span>'+e(name)+'</span></label>').join("");
 if(d.kind==="histogram"){
  if(d.histogramInput==="table")
   return '<div class="stat-form-grid">'+pick("lowIndex","Lower boundary column",d.lowIndex)+pick("highIndex","Upper boundary column",d.highIndex)+
    pick("frequencyIndex","Frequency column",d.frequencyIndex)+'</div>';
  return pick("singleIndex","Measurements column",d.selected[0]||0);
 }
 if(d.kind==="bar")
  return pick("categoryIndex","Discrete category column",d.categoryIndex)+
   '<div class="stat-column-list"><strong>Count columns (up to four groups)</strong>'+numChoices+'</div>';
 return '<div class="stat-column-list"><strong>Measurement columns (up to five groups)</strong>'+numChoices+'</div>';
}
function routeEcho(state,e){
 const route=state.planning?.routeExplorer?.selectedRoute;
 if(!ROUTES[route])return "";
 return '<aside class="stat-context-advice"><strong>From your proposed mathematical pathway:</strong> '+e(ROUTES[route])+
  ' The actual data may lead to a different technique.</aside>';
}
function accuracyEcho(state,e){
 const plans=state.planning?.accuracyPlans||[],d=state.statStudio.draft;
 const name=d.variable.trim().toLowerCase();
 const relevant=plans.filter(p=>name&&[p.quantity,p.symbol].some(t=>String(t||"").trim().toLowerCase()===name));
 if(!relevant.length)return "";
 return '<aside class="stat-accuracy-echo"><strong>Relevant accuracy spark:</strong> '+
  relevant.slice(0,2).map(p=>e([p.quantity,p.resolution,p.unit].filter(Boolean).join(" · "))).join("; ")+
  '. Confirm the actual measurement resolution before selecting class widths or reporting quartiles.</aside>';
}
export const statDataChoices=(studio,e)=>selectedControls(studio.draft,e);
export function renderStatStudio(state,icon,e){
 const studio=state.statStudio,d=studio.draft,q=statAnalysis(d);
 const isHistogram=d.kind==="histogram";
 return '<section class="stat-studio representation-studio" data-stat-studio aria-label="Statistical diagram Studio">'+
 '<header class="stat-studio-head"><div><span class="intro-writing-guide-eyebrow">'+icon("chart")+' STATISTICAL DIAGRAM STUDIO</span>'+
 '<h2>Help your data tell a mathematical story</h2><p>Build clear, honest diagrams from your actual measurements and compare their limitations.</p></div>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="stat-close">'+icon("x")+' Close studio</button></header>'+
 routeEcho(state,e)+
 '<div class="stat-type-switch" role="group" aria-label="Statistical diagram type">'+STAT_TYPES.map(([kind,label,desc])=>
  '<button type="button" class="stat-type'+(d.kind===kind?" selected":"")+'" data-action="stat-kind" data-stat-value="'+kind+'" aria-pressed="'+(d.kind===kind)+'"><strong>'+e(label)+'</strong><small>'+e(desc)+'</small></button>').join("")+'</div>'+
 '<div class="stat-studio-layout"><div class="stat-control-stack">'+
 '<section class="stat-control-card" data-representation-step="create"><h3><span>1</span> Bring in genuine data</h3>'+
 '<p>'+e(kindDesc[d.kind])+'</p>'+renderNativeDataGrid(state,"stat",icon,e)+
  '<details class="native-import-details"><summary>Or paste / import an existing spreadsheet</summary>'+
 field("raw","Paste values from Google Sheets",d.raw,e,{rows:5,placeholder:d.kind==="bar"?
   "Category\\tGroup A\\tGroup B\\nBefore\\t12\\t15\\nAfter\\t18\\t20":
   d.kind==="histogram"&&d.histogramInput==="table"?
   "Lower\\tUpper\\tFrequency\\n0\\t10\\t4\\n10\\t25\\t8":
   "Length (cm)\\tGroup B (cm)\\n10.3\\t12.0\\n11.4\\t13.2"})+
 '<div class="stat-data-actions"><button type="button" class="btn btn-secondary btn-sm" data-action="stat-parse">'+icon("clipboard")+' Read pasted table</button>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="stat-upload">'+icon("upload")+' Import CSV / TSV</button></div>'+
 select("headers","First row of the selected data",d.headers,[["auto","Detect headings"],["yes","Contains headings"],["no","Contains actual observations"]],e)+'</details>'+
 (d.matrix.length?'<p class="stat-import-status">'+icon("check-circle")+' '+d.matrix.length+' rows and '+d.columns.length+' columns imported.'+
  (d.pendingPaste?' Your latest edits have not been parsed yet.':'')+'</p>':
  '<p class="native-grid-tip">Start by entering actual measurements or category counts in the worksheet above.</p>')+
 (isHistogram?select("histogramInput","My histogram starts from",d.histogramInput,[["raw","Individual measurements"],["table","Class intervals and frequencies"]],e):"")+
 '<div data-native-choices="stat">'+statDataChoices(studio,e)+'</div>'+
 (isHistogram&&d.histogramInput==="raw"?'<div class="stat-form-grid">'+
  field("binWidth","Class width (required)",d.binWidth,e,{placeholder:"e.g. 5",hint:"Choose an interpretable interval, not just the prettiest shape."})+
  field("binStart","First boundary (optional)",d.binStart,e,{placeholder:"Automatically aligned"})+'</div>':"")+
 (d.kind==="box"?'<div class="stat-box-methods"><h4>Quartiles and possible outliers</h4>'+
  select("quartileRule","Which quartile convention?",d.quartileRule,[
   ["halves","Median of lower and upper halves"],["linear","Linear interpolation: (n − 1)p"]],e)+
  select("outlierRule","How should possible outliers be identified?",d.outlierRule,BOX_OUTLIER_METHODS,e)+
  (d.outlierRule==="zscore"?select("zThreshold","Flag absolute Z-score greater than",d.zThreshold,
   BOX_Z_CUTOFFS.map(n=>[n,n]),e):"")+
  select("whiskerMode","Where should the whiskers end?",d.whiskerMode,[
   ["nonoutlier","Most extreme observations not flagged"],
   ["minmax","Actual minimum and maximum (retain full range)"]],e)+
  '<p class="stat-method-help">The outlier rule only flags possible unusual observations. It never removes measurements. Whisker ends can be chosen independently.</p></div>':"")+
 (d.kind==="bar"?select("barMode","How do you want to compare groups?",d.barMode,[
  ["count","Compare actual counts"],["percent","Percent of each group's total"]],e):"")+
 '</section>'+
 '<section class="stat-control-card" data-representation-step="refine"><h3><span>2</span> Labels, provenance and precision</h3>'+
 field("title","Descriptive diagram title",d.title,e,{placeholder:"e.g. Comparison of measured walking speeds"})+
 field("figureNumber","Figure number in my IA",d.figureNumber,e,{placeholder:"e.g. 1"})+
 field("variable",d.kind==="bar"?"Categorical characteristic":"Numerical measurement",d.variable,e,{placeholder:d.kind==="bar"?"e.g. Preferred transport":"e.g. Walking speed"})+
 (d.kind!=="bar"?select("unitMode","Does the measurement have units?",d.unitMode,[
  ["unsure","Select units or dimensionless"],["unit","It has units"],["dimensionless","Dimensionless measurement"]],e):"")+
 (d.kind!=="bar"&&d.unitMode==="unit"?field("unit","Units",d.unit,e,{placeholder:"e.g. m/s, cm, seconds"}):"")+
 select("sourceKind","Data origin",d.sourceKind,[["unsure","Choose actual source"],["primary","Measurements I collected"],["secondary","External dataset"],["theoretical","Theoretical / constructed values (not measurements)"]],e)+
 (d.sourceKind==="secondary"?field("sourceText","Full source / citation",d.sourceText,e,{placeholder:"Publisher, dataset name and URL"}):"")+
 accuracyEcho(state,e)+
 field("caption","Optional concise mathematical caption",d.caption,e,{rows:2,placeholder:"e.g. Class width = 5 cm, based on instrument resolution"})+
 '</section>'+
 '<section class="stat-control-card"><h3><span>3</span> Examine the scale</h3>'+
 '<p>'+(d.kind==="bar"?"The frequency axis must start at zero.":"Leave both limits blank to show every observation or class boundary. Never crop inconvenient data.")+'</p>'+
 '<div class="stat-form-grid">'+field("min",d.kind==="bar"?"Frequency minimum (0)":"Horizontal minimum",d.min,e,{placeholder:"Automatic"})+
 field("max",d.kind==="bar"?"Frequency maximum":"Horizontal maximum",d.max,e,{placeholder:"Automatic"})+'</div>'+
 checkbox("showGrid","Use light grid lines",d.showGrid)+checkbox("showLabels","Show figure labels where space permits",d.showLabels)+
 (d.kind==="box"?'<div class="stat-box-options"><h4>Box plot annotations</h4>'+
  '<p>Select only the labels that help explain your investigation. Values appear at their corresponding plotted locations.</p>'+
  checkbox("showBoxMedian","Show numerical median at the median line",d.showBoxMedian)+
  checkbox("showBoxQuartiles","Label Q1 and Q3 at the box edges",d.showBoxQuartiles)+
  checkbox("showBoxWhiskers","Show both whisker endpoint values",d.showBoxWhiskers)+
  checkbox("showBoxExtremes","Show actual minimum and maximum values",d.showBoxExtremes)+
  checkbox("showBoxMean","Show the mean as a diamond marker",d.showBoxMean)+
  checkbox("showOutliers","Show flagged outlier points",d.showOutliers)+
  checkbox("showBoxOutlierValues","Label flagged outlier values",d.showBoxOutlierValues)+
  checkbox("showBoxFences","Show screening thresholds on the plot (if in range)",d.showBoxFences)+
  select("boxPrecision","Precision of numeric labels",d.boxPrecision,[
   ["auto","Automatic (5 significant figures)"],["0","0 decimal places"],["1","1 decimal place"],
   ["2","2 decimal places"],["3","3 decimal places"],["4","4 decimal places"]],e)+
  '</div>':"")+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="stat-reset-scale">Reset limits to automatic</button>'+
 '</section></div>'+
 '<div class="stat-preview-stack">'+statPreviewHtml(studio,icon,e)+
 '<section class="stat-summary-card" data-stat-summary><h3>Compact numerical summary</h3>'+statSummaryHtml(studio,icon,e)+'</section>'+
 '<section class="stat-quality-card" data-stat-quality>'+statQualityHtml(studio,icon,e)+'</section>'+
 renderPresentationCoach(state,"stat",d,icon,e)+
 '<section class="stat-output-card" data-stat-output data-representation-step="use">'+statOutputHtml(studio,icon,e)+'</section>'+
 renderFigureHandover(state,"stat",d,icon,e)+
 '<p class="stat-ia-reminder"><strong>Write in your actual IA:</strong> Introduce the diagram before it appears. Follow it with the interpretation in the context of your aim, sampling, prediction and limitations. Keep raw data tables in your working files—not in the IA or appendix.</p>'+
 '</div></div>'+
 (studio.figures.length?'<details class="stat-saved"><summary>'+icon("layers")+' Saved statistical diagrams ('+studio.figures.length+')</summary>'+
 '<div class="stat-saved-items">'+studio.figures.map(f=>'<div><span><strong>'+e(f.draft.title||"Untitled")+'</strong>'+
 '<small>'+e(f.savedAt.slice(0,10))+(f.entryId?" · linked to a mathematical step":"")+'</small></span>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="stat-load" data-stat-id="'+e(f.id)+'">Edit diagram</button></div>').join("")+'</div></details>':"")+
 '<div class="stat-new-row"><p>You can save up to '+MAX_STAT_FIGURES+' distinct statistical figures without overwriting earlier work.</p>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="stat-new">'+icon("plus-circle")+' Start another diagram</button></div></section>';
}
