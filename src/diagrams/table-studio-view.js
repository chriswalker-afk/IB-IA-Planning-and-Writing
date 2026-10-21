import {representationEmpty} from "./workspace-ui.js";
import {renderNativeDataGrid} from "./native-data-view.js";
import {renderPresentationCoach,renderFigureHandover} from "./presentation-coach-view.js";
/** Short, readable tables, contextual mathematical help and reliable quality gates. */
import {analyzeTable,tableColumnFormat,tableDisplayColumns,tableDisplayRows,TABLE_MAX_SAVED} from "./table-studio-core.js";
import {TABLE_MATH_SYMBOLS,formatTableMath} from "./table-studio-math.js";
import {renderTableSvg,assessTableA4} from "./table-studio-render.js";
const routes={
 groups:"A compact comparison of means or medians is usually more useful than several pages of measurements. Keep the raw values in working files.",
 variation:"Summarise n, mean, spread or IQR from unrounded measurements. Show the mathematical method and justify your choice of statistics in your writing.",
 categorical:"A frequency table of response categories and percentages can be helpful. State which population, sample and denominator the percentages represent.",
 relationships:"Two numerical variables usually warrant a scatter diagram. Use a short table only to show a few purposeful computed values, not every pair.",
 growth:"If you use a table, choose relevant model parameters or summary values rather than copying a long chronological dataset.",
 chance:"A short frequency and percentage table can document observed outcomes. Observed relative frequencies need not equal theoretical probabilities.",
 trajectories:"A few carefully chosen coordinate values may support your model, but a labelled graph or annotated image is generally more informative.",
 optimisation:"Use a short table of candidate values or relevant constraints, then justify why those values are mathematically meaningful."
};
const kinds=[
 ["compact","Short results","Select up to 8 purposeful source rows and 5 columns without deleting any observations."],
 ["calculated","Calculated results","Compare original observations with model predictions, residuals and percentage deviations."],
 ["summary","Summary statistics","Use up to 3 measures to condense hundreds of numerical observations."],
 ["frequency","Frequency table","Count up to 8 discrete categories and optionally show within-sample percentages."]
];
const metricLabels={mean:"Mean",median:"Median",minmax:"Minimum–maximum",sd:"Sample standard deviation",iqr:"Interquartile range"};
const label=(title,contents)=>'<label class="ia-table-form-field"><span>'+title+'</span>'+contents+'</label>';
const input=(key,title,value,e,placeholder="",hint="")=>
 label(e(title),'<input type="text" data-table-field="'+key+'" value="'+e(value)+'" placeholder="'+e(placeholder)+'" autocomplete="off">'+
 (hint?'<small>'+e(hint)+'</small>':""));
const textarea=(key,title,value,e,placeholder="")=>
 label(e(title),'<textarea data-table-field="'+key+'" rows="'+(key==="raw"?6:2)+'" placeholder="'+e(placeholder)+'">'+e(value)+'</textarea>');
const pick=(key,title,value,items,e)=>
 label(e(title),'<select data-table-field="'+key+'">'+items.map(([val,text])=>
  '<option value="'+e(val)+'"'+(String(value)===String(val)?" selected":"")+'>'+e(text)+'</option>').join("")+'</select>');
const toggle=(key,text,checked)=>'<label class="ia-table-switch"><input data-table-field="'+key+'" type="checkbox"'+(checked?" checked":"")+'><span>'+text+'</span></label>';
/** Palettes target their own column heading or unit; inserting keeps the caret. */
const mathPalette=(index,part,e)=>
 '<details class="ia-table-math-palette"><summary>∑ Mathematical symbols</summary>'+
 '<div role="group" aria-label="Insert notation into '+(part==="unit"?"unit":"column heading")+'">'+
 TABLE_MATH_SYMBOLS.map(symbol=>
  '<button type="button" data-action="table-symbol" data-table-col="'+index+
   '" data-table-part="'+part+'" data-table-token="'+e(symbol.token)+'" title="'+e(symbol.title)+
   '" aria-label="'+e(symbol.title)+'">'+e(symbol.label)+'</button>').join("")+
 '</div><small>Insert at the cursor. Try x_i, \\bar{x}, \\hat{y} or m s^-2; the preview formats these automatically.</small></details>';
function numericColumn(d,index){
 let count=0;
 for(const row of d.matrix){if(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(String(row[index]??"").trim()))count++;}
 return count>0&&count>=Math.max(0,d.matrix.length-count);
}
function unitsEditors(d,e){
 if(d.mode==="frequency")return"";
 const visible=d.mode==="compact"?tableDisplayColumns(d):d.mode==="calculated"?[d.calcXIndex,d.calcYIndex]:d.selected;
 const numeric=visible.filter(i=>numericColumn(d,i));
 if(!numeric.length)return"";
 return '<div class="ia-table-column-settings"><strong>'+e(d.mode==="compact"?"Name columns and check units":"Confirm the units of each selected measurement")+'</strong>'+
 '<p>A unit belongs in the column heading, not repeated beside every number.</p>'+
 numeric.map(i=>{
  const dec=d.unitDecisions[i]||{mode:"unsure",unit:""};
  return '<div class="ia-table-column-card">'+
   '<label class="ia-table-form-field"><span>Column '+(i+1)+' heading</span><input type="text" data-table-col="'+i+'" data-table-part="heading" value="'+e(d.headings[i]||"")+'" placeholder="Variable name"></label>'+mathPalette(i,"heading",e)+
   '<label class="ia-table-form-field"><span>Units for this column</span><select data-table-col="'+i+'" data-table-part="unitMode">'+
    [["unsure","Confirm units"],["unit","Has a measurement unit"],["dimensionless","Dimensionless / counts"]].map(([value,desc])=>
      '<option value="'+value+'"'+(value===dec.mode?" selected":"")+'>'+desc+'</option>').join("")+'</select></label>'+
   (dec.mode==="unit"?'<label class="ia-table-form-field"><span>Unit</span><input type="text" data-table-col="'+i+'" data-table-part="unit" value="'+e(dec.unit)+'" placeholder="e.g. m s^-1, cm^2, kg m^-3"><small>Use ^ for powers. For example, m s^-1 displays as m s⁻¹, and cm^2 displays as cm².</small></label>'+mathPalette(i,"unit",e):"")+
   '</div>';
 }).join("")+'</div>';
}
function headerEditors(d,e){
 if(!d.columns.length||["summary","calculated"].includes(d.mode))return"";
 if(d.mode==="frequency"){
  const options=d.columns.map((text,i)=>[String(i),d.headings[i]||text]);
  return pick("categoryIndex","Column containing the categories",String(d.categoryIndex),options,e)+
   '<div class="ia-table-column-card">'+
   label("Category heading",'<input type="text" data-table-col="'+d.categoryIndex+'" data-table-part="heading" value="'+e(d.headings[d.categoryIndex]||"")+'">')+
   mathPalette(d.categoryIndex,"heading",e)+'</div>';
 }
 const indexes=d.columns.map((_,i)=>i).filter(i=>!numericColumn(d,i));
 if(!indexes.length)return"";
 return '<div class="ia-table-column-settings"><strong>Text headings</strong>'+
  indexes.map(i=>'<div class="ia-table-column-card">'+label("Column "+(i+1)+' heading',
   '<input type="text" data-table-col="'+i+'" data-table-part="heading" value="'+e(d.headings[i]||"")+'" placeholder="e.g. Trial">')+
   mathPalette(i,"heading",e)+'</div>').join("")+'</div>';
}
function selectionControls(d,e){
 if(d.mode!=="summary"||!d.columns.length)return"";
 return '<div class="ia-table-selection"><strong>Which comparable variables or groups?</strong>'+
  '<p>Choose up to four numerical columns that use the same unit.</p>'+
  d.columns.map((name,i)=>'<label><input type="checkbox" data-table-variable="'+i+'"'+(d.selected.includes(i)?" checked":"")+'><span>'+e(d.headings[i]||name)+'</span></label>').join("")+'</div>'+
  '<div class="ia-table-selection"><strong>Which statistics help answer your aim?</strong>'+
  '<p>Choose up to three. The number of observations (n) is always shown.</p>'+
  Object.entries(metricLabels).map(([key,name])=>'<label><input type="checkbox" data-table-measure="'+key+'"'+(d.measures.includes(key)?" checked":"")+'><span>'+e(name)+'</span></label>').join("")+'</div>'+
  (d.measures.includes("iqr")?pick("quartileRule","Quartile convention",d.quartileRule,[
   ["halves","Median of lower and upper halves"],["linear","Linear interpolation (n − 1)p"]],e):"");
}

function sourceSelectionControls(d,e){
 if(!["compact","calculated"].includes(d.mode)||!d.columns.length)return "";
 const rows=tableDisplayRows(d),selected=tableDisplayColumns(d);
 const many=d.matrix.length>8||d.columns.length>5;
 return '<details class="ia-table-source-selection"'+(many||d.columnSelectionMode==="custom"||d.rowSelection.trim()?' open':'')+'>'+
 '<summary>Choose the evidence to display · original dataset stays complete</summary>'+
 '<p>The full dataset stays in your working table. There is no automatic first-eight-row selection. Select and justify only rows that help explain a calculation or comparison. Use Summary statistics when the whole sample matters.</p>'+
 (d.mode==="compact"?
  pick("columnSelectionMode","Which source columns?",d.columnSelectionMode,[
    ["all","All source columns (at most five)"],["custom","Choose source columns below"]
  ],e)+
  (d.columnSelectionMode==="custom"?'<div class="ia-table-source-columns" role="group" aria-label="Source columns to display">'+
   d.columns.map((name,i)=>'<label><input type="checkbox" data-table-display-column="'+i+'"'+(selected.includes(i)?' checked':"")+
    '><span>'+e(d.headings[i]||name)+'</span></label>').join("")+'</div>':''):"")+
 '<label class="ia-table-form-field"><span>Source row numbers to display</span>'+
 '<input type="text" data-table-field="rowSelection" value="'+e(d.rowSelection)+'" placeholder="'+e(d.matrix.length>8?"e.g. 1, 4, 8-10":"Leave blank to use all rows")+
 '" autocomplete="off"><small>Use 1-based row numbers: 1, 5, 12 or 2-6. Maximum eight rows. '+
 (d.matrix.length>8?'There are '+d.matrix.length+' source rows: an explicit selection is required.':
 'Blank means all '+d.matrix.length+' rows (if no more than eight).')+'</small></label>'+
 (d.rowSelection.trim()&&rows.ok?
  '<small class="ia-table-source-count">Selected source rows: '+rows.indices.map(i=>i+1).join(", ")+'</small>':"")+
 textarea("selectionReason","Why have you chosen these rows or columns?",d.selectionReason,e,
  "e.g. I chose the first, median and largest values to show the overall model trend and deviation.")+
 '<small>Required for a subset. Explain an objective or mathematically useful choice; do not hide anomalies or inconvenient results.</small>'+
 '</details>';
}
function graphModelSnapshotControls(d,e){
 const snap=d.graphSnapshot;
 if(!snap)return "";
 const param=snap.coefficients.length?
  '<p><strong>Polynomial coefficients, in ascending powers of x:</strong> '+
    e(snap.coefficients.map((v,i)=>"c"+i+" = "+String(v)).join("; "))+'</p>':"";
 const others=Object.entries(snap.parameters||{});
 const parameters=others.length?
  '<p><strong>Underlying fit parameters:</strong> '+
  e(others.map(([key,value])=>key+" = "+String(value)).join("; "))+'</p>':"";
 const err=snap.rows.length!==d.matrix.length?
  '<p class="ia-table-snapshot-warning">The number of source rows changed. Re-transfer from Graph Plotter before exporting.</p>':"";
 return '<div class="ia-table-model-snapshot" data-table-model-snapshot>'+
  '<strong>Copied from Graph Plotter: '+e(snap.modelLabel)+'</strong>'+
  '<p>Graph: '+e(snap.graphTitle||"Untitled graph")+' · '+snap.rows.length+' original paired source rows.</p>'+
  '<p class="ia-table-model-snapshot-equation">'+e(snap.equation)+'</p>'+
  '<small>'+e(snap.method)+'</small>'+
  '<details><summary>Full-precision model parameters and provenance</summary>'+
   (param||parameters?param+parameters:
   '<p>Predictions are retained at full precision from the fitted model. '+
   'Use the original graph for the underlying student-entered model or fit.</p>')+
   '<p>Graph source columns: '+e(snap.graphSourceX)+' and '+e(snap.graphSourceY)+'.</p>'+
   (snap.modelNote?'<p>'+e(snap.modelNote)+'</p>':"")+'</details>'+
  '<p><strong>Snapshot, not a live link.</strong> Editing the graph does not change these predictions. '+
   'Editing source measurements here invalidates the snapshot rather than silently reusing old predictions.</p>'+
   err+
  '<div class="ia-table-snapshot-actions">'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="table-return-to-graph">Return to Graph Plotter to update</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="table-detach-model">Switch to my own coefficients</button>'+
  '</div></div>';
}
function calculatedControls(d,e){
 if(d.mode!=="calculated")return "";
 const options=d.columns.map((column,i)=>[String(i),d.headings[i]||column]);
 const copied=!!d.graphSnapshot;
 return '<div class="ia-table-calculated-options"><strong>Build a model-checking table</strong>'+
 (copied?graphModelSnapshotControls(d,e):
 '<p>Choose genuine numerical observations, then enter coefficients from your own justified model. No regression is fitted or coefficients invented here.</p>')+
 (copied?"":
 (d.columns.length?pick("calcXIndex","Source x variable",String(d.calcXIndex),options,e)+
  pick("calcYIndex","Observed y variable",String(d.calcYIndex),options,e):"")+
 pick("calcModel","Model to evaluate",d.calcModel,[
  ["linear","Linear: predicted y = a x + b"],["quadratic","Quadratic: predicted y = a x² + b x + c"]],e)+
 '<div class="ia-table-two-col">'+
 input("calcA",d.calcModel==="quadratic"?"Coefficient a (x²)":"Slope a",d.calcA,e,"e.g. 1.25")+
 input("calcB",d.calcModel==="quadratic"?"Coefficient b (x)":"Intercept b",d.calcB,e,"e.g. 2.4")+
 (d.calcModel==="quadratic"?input("calcC","Constant c",d.calcC,e,"e.g. 0.5"):"")+
 '</div>')+
 toggle("calcShowPrediction","Include model predictions (ŷ)",d.calcShowPrediction)+
 toggle("calcShowResidual","Include signed residuals (y − ŷ)",d.calcShowResidual)+
 toggle("calcShowPercent","Include signed percentage deviation (%)",d.calcShowPercent)+
 '<p class="ia-table-calculated-note">Residual = observed − predicted. Percentage deviation = 100 × residual / |observed| and is undefined for observed values of zero. All calculations use full-precision source values; rounding affects display only.</p></div>';
}
export function tableDataChoices(studio,e){
 const d=studio.draft;
 return calculatedControls(d,e)+sourceSelectionControls(d,e)+headerEditors(d,e)+selectionControls(d,e)+unitsEditors(d,e)+
  (d.mode==="frequency"?toggle("showPercent","Include percentage of all responses",d.showPercent):"");
}

function columnPrecisionOptions(d,e){
 const model=analyzeTable(d).model;
 if(!model)return '<p class="ia-table-precision-note">Finish entering a valid table to customise its numerical columns.</p>';
 const options=model.headers.map((header,i)=>({header,index:i})).filter(({index:i})=>
  ["compact","calculated"].includes(d.mode)?!!model.numeric[i]:i>=2);
 if(!options.length)return '<p class="ia-table-precision-note">No precision-adjustable columns in the current table.</p>';
 return '<div class="ia-table-column-precision-grid">'+options.map(({header,index})=>{
  const rule=tableColumnFormat(d,index),selected=rule.mode,digits=rule.digits;
  const showDigits=selected==="dp"||selected==="sf";
  const choices=[["default","Use overall table setting"],...(d.mode==="compact"||d.mode==="calculated"&&index<2?[["source","Exactly as entered"]]:[]),
   ["dp","Decimal places"],["sf","Significant figures"]];
  return '<div class="ia-table-column-precision-row"><strong>'+e(formatTableMath(header))+'</strong>'+
   '<label class="ia-table-form-field"><span>Display format</span><select data-table-format-index="'+index+'" data-table-format-part="mode">'+
   choices.map(([v,t])=>'<option value="'+v+'"'+(selected===v?' selected':"")+'>'+t+'</option>').join("")+
   '</select></label>'+
   '<label class="ia-table-form-field ia-table-format-digits" data-table-format-digits'+(!showDigits?' hidden':"")+
   '><span>'+(selected==="sf"?"Significant figures":"Decimal places")+'</span>'+
   '<select data-table-format-index="'+index+'" data-table-format-part="digits">'+
   Array.from({length:7},(_,n)=>'<option value="'+n+'"'+(String(n)===String(digits)?' selected':"")+
    (selected==="sf"&&n===0?' disabled':"")+'>'+n+'</option>').join("")+
   '</select></label></div>';
 }).join("")+'</div>';
}
function a4Preview(studio,e){
 const q=analyzeTable(studio.draft),fit=assessTableA4(studio.draft),d=studio.draft;
 const warnings=fit.warnings||[];
 const headline=!fit.ready?"Check A4 fit once the data are valid":warnings.length?
  "A4 check: review readability":"A4 check: likely to fit comfortably";
 const widthPercent=fit.ready?Math.min(100,Math.max(10,100*fit.usedWidth/fit.contentWidth)).toFixed(1):"0";
 return '<section class="ia-table-paper-check" data-table-a4><details>'+
  '<summary>'+e(headline)+'</summary>'+
  (fit.ready?'<p>Estimated portrait A4, with 20 mm margins. This is a guide; Google Docs and your final IA may lay out the table differently.</p>'+
    '<div class="ia-table-paper-surround"><div class="ia-table-paper-page" aria-label="Portrait A4 page preview">'+
     '<div class="ia-table-paper-figure" style="width:'+widthPercent+'%">'+renderTableSvg(d)+'</div>'+
    '</div></div>'+
    '<p>Width '+fit.width+' × height '+fit.height+' SVG units · '+Math.round(fit.scale*100)+
    '% A4 print scale · estimated body '+fit.bodyPt+' pt, source '+fit.footerPt+' pt.</p>':
    '<p>Complete the essential table details before checking page fit.</p>')+
   (warnings.length?'<ul>'+warnings.map(w=>'<li>'+e(w)+'</li>').join("")+'</ul>':
    '<p class="ia-table-a4-ok">No automatic A4 sizing or heading-wrap issues detected.</p>')+
  '</details></section>';
}
function preview(studio,e){
 const check=analyzeTable(studio.draft);
 return '<section class="ia-table-preview" data-table-preview>'+
 '<div class="ia-table-preview-top"><strong>Live, compact table</strong><span>Widths adapt to your headings and values</span></div>'+
 '<div class="ia-table-preview-art">'+renderTableSvg(studio.draft)+'</div>'+
 '<p>'+e(["compact","calculated"].includes(studio.draft.mode)?
 "The preview uses your chosen source values; the complete original dataset remains unchanged in the worksheet.":
 "Summary values are derived from all applicable source data; no observations have been silently removed.")+'</p>'+
 '</section>';
}
function quality(studio,icon,e){
 const q=analyzeTable(studio.draft);
 return '<div class="ia-table-quality-top"><strong>'+icon(q.ready?"check-circle":"alert-circle")+' Table quality check</strong>'+
 '<span class="graph-quality-status '+(q.ready?"pass":"attention")+'">'+(q.ready?"Required checks passed":q.problems.length+" to fix")+'</span></div>'+
 (q.problems.length||q.warnings.length?'<ul class="ia-table-issues">'+
 q.problems.map(x=>'<li class="problem">'+icon("x-circle")+'<span>'+e(x.message)+'</span></li>').join("")+
 q.warnings.map(x=>'<li class="warning">'+icon("alert-triangle")+'<span>'+e(x.message)+'</span></li>').join("")+'</ul>':
 '<p class="ia-table-clean">No missing titles, units, sources or oversized raw tables detected.</p>')+
 '<p class="ia-table-quality-note">Criterion A — presentation and Criterion B — mathematical communication: help the reader see only relevant mathematics, accurately labelled. These checks do not award an IB grade.</p>';
}
function output(studio,icon){
 const ready=analyzeTable(studio.draft).ready,disable=ready?"":' disabled title="Resolve the essential table checks first"';
 const btn=(action,text)=>'<button type="button" class="btn btn-secondary btn-sm" data-action="'+action+'"'+disable+'>'+text+'</button>';
 return '<button type="button" class="btn btn-primary" data-action="table-use"'+disable+'>'+
 icon("check-circle")+' Save and link to my first mathematics</button>'+
 '<div class="ia-table-export-buttons">'+
 btn("table-editable",icon("copy")+' Copy editable table')+
 btn("table-html",icon("download")+' Editable HTML')+
 btn("table-png",icon("download")+' PNG')+
 btn("table-svg",icon("download")+' SVG')+
 btn("table-copy",icon("copy")+' Copy image')+
 btn("table-csv",icon("table")+' Table CSV')+
 '</div><p>The editable version can be pasted into Google Docs, but check its column widths after pasting. The SVG/PNG preserves the precise on-screen layout.</p>';
}
export const tablePreviewHtml=preview,tableA4PreviewHtml=a4Preview,tableQualityHtml=quality,tableOutputHtml=output;
export function renderTableStudio(state,icon,e){
 const s=state.tableStudio,d=s.draft,route=state.planning?.routeExplorer?.selectedRoute;
 const accuracy=state.planning?.accuracyPlans||[];
 const sparks=accuracy.filter(a=>d.columns.some(h=>h&&[a.quantity,a.symbol].some(ref=>String(ref||"").toLowerCase()===h.toLowerCase())));
 return '<section class="ia-table-studio representation-studio" data-table-studio aria-label="Mathematical Table Studio">'+
 '<header class="ia-table-head"><div><span class="intro-writing-guide-eyebrow">'+icon("table")+' MATHEMATICAL TABLE STUDIO</span>'+
 '<h2>Make a table worth showing</h2><p>Turn real information into a concise, easy-to-read mathematical table. The width adapts to its contents for a better fit in your IA.</p></div>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="table-close">'+icon("x")+' Close studio</button></header>'+
 (routes[route]?'<aside class="ia-table-context"><strong>Your investigative pathway:</strong> '+e(routes[route])+'</aside>':"")+
 '<div class="ia-table-types" role="group" aria-label="Table purpose">'+kinds.map(([key,title,desc])=>
 '<button type="button" data-action="table-mode" data-table-mode="'+key+'" class="ia-table-type'+(d.mode===key?" selected":"")+'" aria-pressed="'+(d.mode===key)+'"><strong>'+e(title)+'</strong><small>'+e(desc)+'</small></button>').join("")+'</div>'+
 '<div class="ia-table-layout"><div class="ia-table-controls">'+
 '<section class="ia-table-control-card" data-representation-step="create"><h3><span>1</span> Start with real information</h3>'+
 '<p>Type source values directly in the worksheet. Finished tables automatically wrap headings and size columns.</p>'+renderNativeDataGrid(state,"table",icon,e)+
  '<details class="native-import-details"><summary>Or paste / import an existing spreadsheet</summary>'+
 textarea("raw","Paste your table or dataset",d.raw,e,"Paste copied cells from Google Sheets here")+
 '<div class="ia-table-import-actions"><button type="button" class="btn btn-secondary btn-sm" data-action="table-parse">'+icon("clipboard")+' Read pasted table</button>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="table-upload">'+icon("upload")+' Import CSV / TSV</button></div>'+
 pick("headers","Does the first row contain headings?",d.headers,[["auto","Detect automatically"],["yes","Yes, headings"],["no","No, first row is data"]],e)+'</details>'+
 (d.matrix.length?'<p class="ia-table-imported">'+icon("check-circle")+' '+d.matrix.length+' source rows, '+d.columns.length+' columns'+
 (d.pendingPaste?' · Pasted text changed; read it again.':' · imported.')+'</p>':
 '<p class="native-grid-tip">Enter actual source values in the worksheet; none have been invented.</p>')+
 (["compact","calculated"].includes(d.mode)?'<p class="ia-table-strong-rule"><strong>Choose up to eight source rows for display.</strong> The complete dataset remains in your workspace. Justify every subset; do not silently omit unwanted values.</p>':
 '<p class="ia-table-strong-rule"><strong>Full dataset in; short summary out.</strong> The tool calculates from actual input values without silently selecting only the first few rows.</p>')+
 '<div data-native-choices="table">'+tableDataChoices(s,e)+'</div>'+
 
 '</section>'+
 '<section class="ia-table-control-card" data-representation-step="refine"><h3><span>2</span> Title, units and source</h3>'+
 '<div class="ia-table-two-col">'+input("number","Table number",d.number,e,"e.g. 1")+
 input("title","Descriptive table title",d.title,e,"e.g. Median times for two groups")+'</div>'+
 textarea("purpose","Why is this table useful for my aim?",d.purpose,e,
  "Introduce the table BEFORE it appears in your IA. Why does the reader need these values?")+
 pick("sourceKind","Source of the genuine information",d.sourceKind,[["unsure","Choose source"],["primary","My own collected data"],["secondary","Published or other external source"]],e)+
 (d.sourceKind==="secondary"?input("sourceText","Full external source",d.sourceText,e,"Publisher, dataset, link or DOI"):"")+
 (sparks.length?'<aside class="ia-table-accuracy"><strong>Previously planned accuracy:</strong> '+
  sparks.slice(0,2).map(a=>e([a.quantity,a.resolution,a.unit].filter(Boolean).join(" · "))).join("; ")+
  '. Report a justifiable number of decimal places.</aside>':"")+
 textarea("note","Short note beneath the table (optional)",d.note,e,
  "e.g. Missing readings excluded from n, with reason stated in text")+
 '</section>'+
 '<section class="ia-table-control-card"><h3><span>3</span> Table presentation and numerical precision</h3>'+
 '<p>The table stays as narrow as its contents allow. Long headings wrap rather than making the whole table too wide.</p>'+
 (["compact","calculated"].includes(d.mode)?pick("numberFormat","How should numerical cells be displayed?",d.numberFormat,[
  ["source","Exactly as entered (recommended for measured values)"],["fixed","Fixed decimal places (display only)"]],e):"")+
 (d.mode!=="compact"&&d.mode!=="calculated"||d.numberFormat==="fixed"||d.mode==="calculated"?pick("decimals","Number of decimal places",d.decimals,
  ["0","1","2","3","4"].map(n=>[n,n==="0"?"Whole numbers":n+" decimal place"+(n==="1"?"":"s")]),e):"")+
 pick("cellAlignment","How should the columns be aligned?",d.cellAlignment,[
  ["center","Centre all headings and values (recommended)"],["numeric","Text left; numerical values right"]],e)+
 toggle("showColumnLines","Show subtle vertical column separators",d.showColumnLines)+
 toggle("showRowLines","Use subtle horizontal row separators",d.showRowLines)+
 '<details class="ia-table-precision-options"><summary>Customise individual column precision (optional)</summary>'+
 '<p>Choose decimal places or significant figures for each result column. Values remain unrounded in your working data.</p>'+
 columnPrecisionOptions(d,e)+'</details>'+
 '<p class="ia-table-precision-advice">Rounding changes the displayed output, not the original data used in calculations. Explain important uncertainty and degree of accuracy in the surrounding writing.</p>'+
 '</section></div>'+
 '<div class="ia-table-preview-stack">'+preview(s,e)+a4Preview(s,e)+
 '<section class="ia-table-quality-card" data-table-quality>'+quality(s,icon,e)+'</section>'+
 renderPresentationCoach(state,"table",d,icon,e)+
 '<section class="ia-table-output-card" data-table-output data-representation-step="use">'+output(s,icon)+'</section>'+
 renderFigureHandover(state,"table",d,icon,e)+
 '<p class="ia-table-ia-reminder"><strong>In your actual IA:</strong> Introduce the table before showing it; then interpret it using your aim and prediction. Do not use long tables, even in appendices. Keep full data in your working files.</p>'+
 '</div></div>'+
 (s.figures.length?'<details class="ia-table-saved"><summary>'+icon("layers")+' Saved tables ('+s.figures.length+')</summary>'+
 '<div class="ia-table-saved-list">'+s.figures.map(fig=>'<div><span><strong>'+e(fig.draft.title||"Untitled table")+'</strong>'+
 '<small>'+e(fig.savedAt.slice(0,10))+(fig.entryId?" · linked to mathematics":"")+'</small></span>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="table-load" data-table-id="'+e(fig.id)+'">Edit table</button></div>').join("")+'</div></details>':"")+
 '<div class="ia-table-new"><span>You can save up to '+TABLE_MAX_SAVED+' editable tables in this project.</span>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="table-new">'+icon("plus-circle")+' Start another table</button></div>'+
 '</section>';
}
