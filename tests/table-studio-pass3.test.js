import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {newTableStudio,importTableData,tableGroupedBins,analyzeTable,saveTableFigure,normalizeTableDraft,
 tableSignature} from "../src/diagrams/table-studio-core.js";
import {setTableField,chooseTableMode,setTableColumnFormat} from "../src/diagrams/table-studio-actions.js";
import {renderTableSvg,tableToHtml} from "../src/diagrams/table-studio-render.js";
import {tableCSV} from "../src/diagrams/table-studio-export.js";
import {newStatStudio,importStatTable,statAnalysis,saveStatFigure} from "../src/diagrams/stat-studio-core.js";
import {prepareStatFrequencyTable,prepareTableHistogram,transferStatFrequencyTable,transferTableHistogram}
 from "../src/diagrams/frequency-handover.js";
import {renderTableStudio} from "../src/diagrams/table-studio-view.js";
import {renderStatStudio} from "../src/diagrams/stat-studio-view.js";
import {statSummaryCSV} from "../src/diagrams/stat-studio-export.js";

function rawTable(){
 const s=newTableStudio();s.draft.headers="yes";
 importTableData(s,"Speed (m/s)\n0\n3\n4\n5\n9\n10");
 chooseTableMode(s,"grouped");
 Object.assign(s.draft,{title:"Grouped walking speed measurements",sourceKind:"primary",
  groupWidth:"5",groupStart:"0",purpose:"Explore where speeds are concentrated within the interval of measured values"});
 return s;
}
function groupedTable(){
 const s=newTableStudio();s.draft.headers="yes";
 importTableData(s,"Lower (s)\tUpper (s)\tFrequency\n0\t5\t10\n5\t15\t10\n15\t25\t5");
 chooseTableMode(s,"grouped");
 Object.assign(s.draft,{groupInput:"classes",title:"Measured reaction time distribution",sourceKind:"secondary",
  sourceText:"Recorded reaction times 2026, School Survey",purpose:"Compare frequencies across unequal class widths"});
 return s;
}
function rawStat(){
 const s=newStatStudio();s.draft.headers="yes";
 importStatTable(s,"Speed (m/s)\n0\n3\n4\n5\n9\n10");
 Object.assign(s.draft,{kind:"histogram",histogramInput:"raw",binWidth:"5",binStart:"0",
  title:"Histogram of walking speeds",variable:"Speed",unit:"m/s",unitMode:"unit",sourceKind:"primary"});
 return s;
}
function groupedStat(){
 const s=newStatStudio();s.draft.headers="yes";
 importStatTable(s,"Lower (s)\tUpper (s)\tFrequency\n0\t5\t10\n5\t15\t10\n15\t25\t5");
 Object.assign(s.draft,{kind:"histogram",histogramInput:"table",lowIndex:0,highIndex:1,frequencyIndex:2,
  title:"Unequal width histogram",variable:"Reaction time",unit:"s",unitMode:"unit",sourceKind:"secondary",
  sourceText:"Recorded reaction times 2026, School Survey"});
 return s;
}
test("continuous grouped frequencies honour half-open boundaries, original n and density",()=>{
 const s=rawTable(),d=s.draft,before=JSON.stringify(d.matrix);
 const q=analyzeTable(d);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.model.bins.map(b=>[b.low,b.high,b.frequency,b.density]),
  [[0,5,3,0.6],[5,10,2,0.4],[10,15,1,0.2]]);
 assert.deepEqual(q.model.headers,["Speed interval (m/s)","Frequency","Frequency density (per m/s)"]);
 assert.deepEqual(q.model.rows[0],["[0, 5)","3","0.60"]);
 assert.deepEqual(q.model.rows.at(-1),["Total","6","—"]);
 assert.match(q.model.metadata,/left-inclusive and right-exclusive/);
 assert.deepEqual(JSON.stringify(d.matrix),before,"Raw source values must remain unchanged");
 assert.deepEqual(statAnalysis(rawStat().draft).result.bins,q.model.bins);
 assert.match(renderTableSvg(d),/Total/);
 assert.match(tableToHtml(d),/Frequency density/);
 assert.match(tableCSV(d),/Total/);
});
test("cumulative frequency and percentages use full counts; density has no total",()=>{
 const s=rawTable();
 assert(setTableField(s,"groupShowCumulative",true));
 assert(setTableField(s,"groupShowPercent",true));
 const q=analyzeTable(s.draft);
 assert(q.ready,JSON.stringify(q.problems));
 assert.deepEqual(q.model.headers,["Speed interval (m/s)","Frequency",
  "Frequency density (per m/s)","Cumulative frequency","Percentage (%)"]);
 assert.deepEqual(q.model.rows[0],["[0, 5)","3","0.60","3","50.00"]);
 assert.deepEqual(q.model.rows[1],["[5, 10)","2","0.40","5","33.33"]);
 assert.deepEqual(q.model.rows.at(-1),["Total","6","—","6","100"]);
 assert.equal(q.model.bins.reduce((n,b)=>n+b.frequency,0),6);
});
test("source measurements must not be dropped, even when they would spoil the distribution",()=>{
 const s=rawTable();
 s.draft.matrix[1][0]="unavailable";
 assert(!analyzeTable(s.draft).ready);
 assert(analyzeTable(s.draft).problems.some(p=>p.code==="grouped-classes"));
 assert.match(tableGroupedBins(s.draft).error,/Source row 2/);
 s.draft.matrix[1][0]="3";
 s.draft.matrix.push([""]);
 assert.match(tableGroupedBins(s.draft).error,/Source row 7/);
 s.draft.matrix.pop();
 assert(setTableField(s,"groupWidth","0.1"));
 assert(!analyzeTable(s.draft).ready);
 assert.match(tableGroupedBins(s.draft).error,/classes/);
 assert(setTableField(s,"groupWidth","5"));
 assert(setTableField(s,"groupStart","1"));
 assert.match(tableGroupedBins(s.draft).error,/above an observation/);
 assert(setTableField(s,"groupStart","0"));
 assert.equal(analyzeTable(s.draft).ready,true);
});
test("grouped input respects unequal widths, supplied totals and warns about missing original observations",()=>{
 const s=groupedTable(),d=s.draft;
 const q=analyzeTable(d);
 assert(q.ready,JSON.stringify(q.problems));
 assert.deepEqual(q.model.bins.map(b=>b.density),[2,1,.5]);
 assert.equal(q.model.total,25);
 assert.match(q.model.metadata,/Supplied grouped frequencies/);
 assert(q.warnings.some(w=>w.code==="grouped-originals"));
 assert.equal(q.model.rows.at(-1)[1],"25");
 d.matrix[1][0]="4";
 assert(!analyzeTable(d).ready);
 assert.match(tableGroupedBins(d).error,/overlap/);
 d.matrix[1][0]="5";d.matrix[1][2]="2.4";
 assert(!analyzeTable(d).ready);
 assert.match(tableGroupedBins(d).error,/whole-number/);
 d.matrix[1][2]="10";
 assert.equal(analyzeTable(d).ready,true);
});
test("source and precision decisions survive saved drafts without editing measurement values",()=>{
 const state=createProjectState();state.tableStudio=groupedTable();
 const studio=state.tableStudio,d=studio.draft;
 setTableField(studio,"groupShowCumulative",true);
 setTableField(studio,"groupShowPercent",true);
 assert(setTableColumnFormat(studio,2,"mode","sf"));
 assert(setTableColumnFormat(studio,2,"digits","3"));
 assert.equal(analyzeTable(d).model.rows[0][2],"2.00");
 const sourceBefore=JSON.stringify(d.matrix);
 assert(setTableField(studio,"highlightMode","selected"));
 assert(setTableField(studio,"highlightRows","2"));
 assert(setTableField(studio,"highlightReason","The middle class contains the same frequency but has double the width, so its density is lower."));
 assert.equal(analyzeTable(d).ready,true,JSON.stringify(analyzeTable(d).problems));
 const saved=saveTableFigure(studio);
 assert(saved.ok);assert.equal(JSON.stringify(d.matrix),sourceBefore);
 const round=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(round.tableStudio.figures[0].draft.groupShowPercent,true);
 assert.equal(round.tableStudio.figures[0].draft.groupInput,"classes");
 assert.equal(round.tableStudio.figures[0].draft.highlightReason,d.highlightReason);
 assert.equal(round.tableStudio.figures[0].draft.columnFormats["grouped:density"].mode,"sf");
 assert.deepEqual(round.tableStudio.figures[0].draft.matrix,d.matrix);
});
test("highlighting is optional, up to two non-total rows, with justified evidence and safe HTML/SVG output",()=>{
 const s=rawTable(),d=s.draft;
 const firstSig=tableSignature(d);
 assert(!renderTableSvg(d).includes('data-table-emphasis-row="'));
 assert(setTableField(s,"highlightMode","selected"));
 assert(setTableField(s,"highlightRows","2, 3"));
 assert(!analyzeTable(d).ready,"unjustified emphasis is not exportable");
 assert(setTableField(s,"highlightReason",
  "These two classes reflect a meaningful contrast at the upper end of the observed speeds."));
 assert(analyzeTable(d).ready);
 assert.notEqual(tableSignature(d),firstSig);
 assert.deepEqual(analyzeTable(d).model.highlightIndices,[1,2]);
 assert.match(renderTableSvg(d),/data-table-emphasis-row="2"/);
 assert.match(renderTableSvg(d),/Emphasis:/);
 assert.match(tableToHtml(d),/data-table-emphasis-row="3"/);
 assert.match(tableToHtml(d),/Emphasised result rows 2, 3/);
 assert.equal(tableCSV(d).split(/\r?\n/).filter(Boolean).length,5,"CSV remains a data table, not invented formatting columns");
 for(const rows of ["4","1,2,3","0","1,1","999","Total","2-3"]){
  const c=normalizeTableDraft({...d,highlightRows:rows});
  assert(!analyzeTable(c).ready,rows);
 }
 assert(setTableField(s,"highlightRows","1"));
 assert(setTableField(s,"highlightReason","<script>alert(1)</script> This is a mathematical claim to inspect."));
 const html=tableToHtml(d),svg=renderTableSvg(d);
 assert(!html.includes("<script>")&&!svg.includes("<script>"));
 assert(html.includes("&lt;script&gt;")&&svg.includes("&lt;script&gt;"));
 assert(setTableField(s,"highlightMode","none"));
 assert(analyzeTable(d).ready);
 assert(!renderTableSvg(d).includes('data-table-emphasis-row="'));
});
test("categorical frequency totals cannot be highlighted or misrepresented",()=>{
 const s=newTableStudio();s.draft.headers="yes";
 importTableData(s,"Choice\nBus\nWalk\nBus\nCycle");
 chooseTableMode(s,"frequency");
 Object.assign(s.draft,{title:"Transport choices",sourceKind:"primary"});
 assert(analyzeTable(s.draft).ready);
 setTableField(s,"highlightMode","selected");setTableField(s,"highlightRows","4");
 setTableField(s,"highlightReason","Transport choices might be unevenly distributed across categories.");
 assert(!analyzeTable(s.draft).ready);
 assert(analyzeTable(s.draft).problems.some(p=>p.code==="highlight-rows"));
});
test("table → histogram keeps class boundaries identical and no saved diagram is overwritten",()=>{
 const state=createProjectState();state.tableStudio=rawTable();
 const before=JSON.stringify(state.tableStudio.draft);
 const prior=groupedStat();
 const old=saveStatFigure(prior);
 assert(old.ok);state.statStudio=prior;
 const r=prepareTableHistogram(state.tableStudio);
 assert(r.ok,r.error);
 assert.equal(statAnalysis(r.draft).ready,true);
 assert.deepEqual(statAnalysis(r.draft).result.bins,analyzeTable(state.tableStudio.draft).model.bins);
 assert.equal(r.draft.histogramInput,"raw");
 assert.deepEqual(r.draft.matrix,state.tableStudio.draft.matrix);
 const changed=transferTableHistogram(state);
 assert(changed.ok,changed.error);
 assert.equal(state.statStudio.activeId,"");
 assert.equal(state.statStudio.figures.length,1,"Previously saved diagram retained");
 assert.equal(state.statStudio.draft.title,"Histogram of Speed");
 assert.equal(JSON.stringify(state.tableStudio.draft),before);
});
test("histogram → table works with raw or supplied grouped observations and preserves independent originals",()=>{
 for(const s of [rawStat(),groupedStat()]){
  const state=createProjectState();state.statStudio=s;
  const old=JSON.stringify(s.draft);
  const r=prepareStatFrequencyTable(s);
  assert(r.ok,r.error);
  assert.equal(analyzeTable(r.draft).ready,true,JSON.stringify(analyzeTable(r.draft).problems));
  assert.deepEqual(analyzeTable(r.draft).model.bins,statAnalysis(s.draft).result.bins);
  const transferred=transferStatFrequencyTable(state);
  assert(transferred.ok);
  assert.equal(state.tableStudio.activeId,"");
  assert.equal(state.tableStudio.draft.groupInput,s.draft.histogramInput==="raw"?"raw":"classes");
  assert.equal(state.tableStudio.draft.matrix.length,s.draft.matrix.length);
  assert.equal(JSON.stringify(s.draft),old);
  assert.equal(state.tableStudio.draft.sourceKind,s.draft.sourceKind);
  assert.equal(state.tableStudio.draft.groupOrigin.startsWith("Statistical Diagram Generator:"),true);
  const ui=renderTableStudio(state,icon,escapeHtml);
  assert.match(ui,/data-action="table-to-stat"/);
  const statUI=renderStatStudio(state,icon,escapeHtml);
  assert.match(statUI,/data-action="stat-to-table"/);
 }
});
test("grouped source ⇄ histogram handles unequal classes and never appends synthetic totals",()=>{
 const state=createProjectState();state.tableStudio=groupedTable();
 const r=transferTableHistogram(state);
 assert(r.ok,r.error);
 assert.equal(r.draft.histogramInput,"table");
 assert.equal(r.draft.matrix.length,3);
 assert.deepEqual(r.draft.matrix[1],["5","15","10"]);
 assert.deepEqual(statAnalysis(r.draft).result.bins.map(b=>b.density),[2,1,.5]);
 const back=transferStatFrequencyTable(state);
 assert(back.ok,back.error);
 assert.equal(back.draft.matrix.length,3);
 assert.equal(analyzeTable(back.draft).model.rows.at(-1)[1],"25");
});
test("transfer rejects invalid mathematics or excessive class counts without mutating either studio",()=>{
 const state=createProjectState();state.tableStudio=rawTable();
 const old=JSON.stringify(state.statStudio);
 setTableField(state.tableStudio,"groupWidth","0.1");
 assert(!transferTableHistogram(state).ok);
 assert.equal(JSON.stringify(state.statStudio),old);
 const hist=rawStat();
 hist.draft.binWidth="0.5";
 state.statStudio=hist;
 const tableBefore=JSON.stringify(state.tableStudio);
 assert(!transferStatFrequencyTable(state).ok);
 assert.equal(JSON.stringify(state.tableStudio),tableBefore);
});
test("table highlighting is not mathematically inherited by the histogram",()=>{
 const state=createProjectState();state.tableStudio=rawTable();
 setTableField(state.tableStudio,"highlightMode","selected");
 setTableField(state.tableStudio,"highlightRows","1");
 setTableField(state.tableStudio,"highlightReason",
  "This interval has the highest observed frequency in these measurements.");
 assert(analyzeTable(state.tableStudio.draft).ready);
 assert(transferTableHistogram(state).ok);
 assert.equal(statAnalysis(state.statStudio.draft).ready,true);
 assert.deepEqual(statAnalysis(state.statStudio.draft).result.bins,analyzeTable(state.tableStudio.draft).model.bins);
});
