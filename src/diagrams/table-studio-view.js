import {representationEmpty} from "./workspace-ui.js";
import {renderNativeDataGrid} from "./native-data-view.js";
/** Short, readable tables, contextual mathematical help and reliable quality gates. */
import {analyzeTable,TABLE_MAX_SAVED} from "./table-studio-core.js";
import {renderTableSvg} from "./table-studio-render.js";
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
 ["compact","Short results","Up to 8 meaningful rows and 5 columns; never an oversized raw-data table."],
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
function numericColumn(d,index){
 let count=0;
 for(const row of d.matrix){if(/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(String(row[index]??"").trim()))count++;}
 return count>0&&count>=Math.max(0,d.matrix.length-count);
}
function unitsEditors(d,e){
 if(d.mode==="frequency")return"";
 const visible=d.mode==="compact"?d.columns.map((_,i)=>i):d.selected;
 const numeric=visible.filter(i=>numericColumn(d,i));
 if(!numeric.length)return"";
 return '<div class="ia-table-column-settings"><strong>'+e(d.mode==="compact"?"Name columns and check units":"Confirm the units of each selected measurement")+'</strong>'+
 '<p>A unit belongs in the column heading, not repeated beside every number.</p>'+
 numeric.map(i=>{
  const dec=d.unitDecisions[i]||{mode:"unsure",unit:""};
  return '<div class="ia-table-column-card">'+
   '<label class="ia-table-form-field"><span>Column '+(i+1)+' heading</span><input type="text" data-table-col="'+i+'" data-table-part="heading" value="'+e(d.headings[i]||"")+'" placeholder="Variable name"></label>'+
   '<label class="ia-table-form-field"><span>Units for this column</span><select data-table-col="'+i+'" data-table-part="unitMode">'+
    [["unsure","Confirm units"],["unit","Has a measurement unit"],["dimensionless","Dimensionless / counts"]].map(([value,desc])=>
      '<option value="'+value+'"'+(value===dec.mode?" selected":"")+'>'+desc+'</option>').join("")+'</select></label>'+
   (dec.mode==="unit"?'<label class="ia-table-form-field"><span>Unit</span><input type="text" data-table-col="'+i+'" data-table-part="unit" value="'+e(dec.unit)+'" placeholder="e.g. cm, s, kg"></label>':"")+
   '</div>';
 }).join("")+'</div>';
}
function headerEditors(d,e){
 if(!d.columns.length||d.mode==="summary")return"";
 if(d.mode==="frequency"){
  const options=d.columns.map((text,i)=>[String(i),d.headings[i]||text]);
  return pick("categoryIndex","Column containing the categories",String(d.categoryIndex),options,e)+
   label("Category heading",'<input type="text" data-table-col="'+d.categoryIndex+'" data-table-part="heading" value="'+e(d.headings[d.categoryIndex]||"")+'">');
 }
 const indexes=d.columns.map((_,i)=>i).filter(i=>!numericColumn(d,i));
 if(!indexes.length)return"";
 return '<div class="ia-table-column-settings"><strong>Text headings</strong>'+
  indexes.map(i=>label("Column "+(i+1)+' heading',
   '<input type="text" data-table-col="'+i+'" data-table-part="heading" value="'+e(d.headings[i]||"")+'" placeholder="e.g. Trial">')).join("")+'</div>';
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
function preview(studio,e){
 const check=analyzeTable(studio.draft);
 return '<section class="ia-table-preview" data-table-preview>'+
 '<div class="ia-table-preview-top"><strong>Live, page-width table</strong><span>Automatically sized columns</span></div>'+
 '<div class="ia-table-preview-art">'+renderTableSvg(studio.draft)+'</div>'+
 '<p>No rows are shortened or silently omitted. This preview is deliberately limited to a concise IA output.</p>'+
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
export const tablePreviewHtml=preview,tableQualityHtml=quality,tableOutputHtml=output;
export function renderTableStudio(state,icon,e){
 const s=state.tableStudio,d=s.draft,route=state.planning?.routeExplorer?.selectedRoute;
 const accuracy=state.planning?.accuracyPlans||[];
 const sparks=accuracy.filter(a=>d.columns.some(h=>h&&[a.quantity,a.symbol].some(ref=>String(ref||"").toLowerCase()===h.toLowerCase())));
 return '<section class="ia-table-studio representation-studio" data-table-studio aria-label="Mathematical Table Studio">'+
 '<header class="ia-table-head"><div><span class="intro-writing-guide-eyebrow">'+icon("table")+' MATHEMATICAL TABLE STUDIO</span>'+
 '<h2>Make a table worth showing</h2><p>Turn real information into a short, easy-to-read mathematical table. Pathfinder chooses suitable widths so columns do not stretch across the page.</p></div>'+
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
 (d.mode==="compact"?'<p class="ia-table-strong-rule"><strong>Maximum 8 rows and 5 columns in the finished table.</strong> Long raw-data tables do not belong in an IA or appendix. For a large dataset, switch to a summary or frequency table rather than making the font smaller.</p>':
 '<p class="ia-table-strong-rule"><strong>Full dataset in; short summary out.</strong> The tool calculates from actual input values without silently selecting only the first few rows.</p>')+
 headerEditors(d,e)+selectionControls(d,e)+unitsEditors(d,e)+
 (d.mode==="frequency"?toggle("showPercent","Include percentage of all responses",d.showPercent):"")+
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
 '<section class="ia-table-control-card"><h3><span>3</span> Automatic size and numerical precision</h3>'+
 '<p>Column widths, header wrapping, row heights and number alignment are automatic. No shrinking to unreadable text.</p>'+
 (d.mode==="compact"?pick("numberFormat","How should numerical cells be displayed?",d.numberFormat,[
  ["source","Exactly as entered (recommended for measured values)"],["fixed","Fixed decimal places (display only)"]],e):"")+
 (d.mode!=="compact"||d.numberFormat==="fixed"?pick("decimals","Number of decimal places",d.decimals,
  ["0","1","2","3","4"].map(n=>[n,n==="0"?"Whole numbers":n+" decimal place"+(n==="1"?"":"s")]),e):"")+
 toggle("showRowLines","Use subtle horizontal row separators",d.showRowLines)+
 '<p class="ia-table-precision-advice">Rounding changes the displayed output, not the original data used in calculations. Explain important uncertainty and degree of accuracy in the surrounding writing.</p>'+
 '</section></div>'+
 '<div class="ia-table-preview-stack">'+preview(s,e)+
 '<section class="ia-table-quality-card" data-table-quality>'+quality(s,icon,e)+'</section>'+
 '<section class="ia-table-output-card" data-table-output data-representation-step="use">'+output(s,icon)+'</section>'+
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
