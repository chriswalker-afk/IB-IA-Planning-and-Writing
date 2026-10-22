import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {
 newStatStudio,newStatDraft,normalizeStatStudio,parseStatTable,importStatTable,
 statAnalysis,boxStats,saveStatFigure
} from "../src/diagrams/stat-studio-core.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {renderStatStudio} from "../src/diagrams/stat-studio-view.js";
import {statSummaryCSV} from "../src/diagrams/stat-studio-export.js";
import {setStatField,changeStatKind,toggleStatSeries,saveStatDraft,saveAndLinkStat,loadStat,freshStat} from "../src/diagrams/stat-studio-actions.js";
const f=(d,props={})=>Object.assign(d,{title:"Distribution of walking speed",
 variable:"Walking speed",unit:"m/s",unitMode:"unit",sourceKind:"primary",...props});
function rawHistogram(){
 const s=newStatStudio();f(s.draft,{kind:"histogram",binWidth:"5",binStart:"0"});
 importStatTable(s,"Speed (m/s)\n0\n3\n4\n5\n9\n10");
 s.draft.title="Distribution of walking speed";
 return s;
}
function freqHistogram(){
 const s=newStatStudio();
 f(s.draft,{kind:"histogram",histogramInput:"table"});
 importStatTable(s,"Lower\tUpper\tFrequency\n0\t5\t10\n5\t15\t10\n15\t25\t5");
 s.draft.title="Unequal-width classes";return s;
}
function boxSample(){
 const s=newStatStudio();f(s.draft,{kind:"box",quartileRule:"halves"});
 importStatTable(s,"Group A (cm)\tGroup B (cm)\n1\t4\n2\t5\n3\t6\n4\t7\n5\t8\n6\t9\n7\t10\n8\t11\n100\t12");
 s.draft.title="Group distributions";return s;
}
function groupedBars(){
 const s=newStatStudio();f(s.draft,{kind:"bar",variable:"Transport preference"});
 importStatTable(s,"Choice\tYear 12\tYear 13\nWalk\t10\t25\nBus\t30\t25\nCar\t10\t50");
 s.draft.title="Transport preference by year";return s;
}
test("accepts a single numeric Google Sheets column and correctly detects its heading",()=>{
 const r=parseStatTable("Speed (m/s)\n0\n5\n10","auto","histogram");
 assert.deepEqual(r.columns,["Speed (m/s)"]);
 assert.equal(r.hasHeaders,true);
 assert.equal(r.matrix.length,3);
 const s=rawHistogram();
 assert.equal(s.draft.unit,"m/s");
 assert.equal(s.draft.pendingPaste,false);
 assert.equal(statAnalysis(s.draft).ready,true);
});
test("CSV parser respects quoted headings and explicit no-heading mode",()=>{
 const t=parseStatTable('"Travel, km",Age\n3,5\n4,6',"yes","box");
 assert.deepEqual(t.columns,["Travel, km","Age"]);
 assert.deepEqual(t.matrix,[["3","5"],["4","6"]]);
 const r=parseStatTable("A,10,20\nB,20,30","auto","bar");
 assert.equal(r.hasHeaders,false);
 assert.deepEqual(r.columns,["Column 1","Column 2","Column 3"]);
 assert.throws(()=>parseStatTable('x,y\n"unfinished,2'),/unfinished/i);
 assert.throws(()=>parseStatTable("1\t2\n3"),/same number of columns/i);
});
test("raw histogram never mistakes frequencies for heights and includes endpoint correctly",()=>{
 const q=statAnalysis(rawHistogram().draft);
 assert.equal(q.ready,true);
 assert.deepEqual(q.result.bins.map(b=>b.frequency),[3,2,1]);
 assert.deepEqual(q.result.bins.map(b=>b.density),[.6,.4,.2]);
 assert.equal(q.result.total,6);
 const svg=renderStatSvg(q.draft);
 assert.match(svg,/Frequency density/);
 assert.ok(svg.includes('<rect'));
 assert.ok(!svg.includes("<script>"));
});
test("saved statistical figure numbers remain visible in standalone, reader and export SVGs",()=>{
 const draft=rawHistogram().draft;
 draft.figureNumber=" Figure 7 ";
 const svg=renderStatSvg(draft);
 assert.match(svg,/<text[^>]*class="stat-figure-number"[^>]*>Figure 7<\/text>/);
 assert(!svg.includes("Figure Figure"));
 draft.figureNumber="";
 assert(!renderStatSvg(draft).includes('class="stat-figure-number"'));
 draft.figureNumber='<script>8</script>';
 const escaped=renderStatSvg(draft);
 assert(!escaped.includes('<script>'));
 assert(escaped.includes('&lt;script&gt;'));
});
test("grouped histogram handles unequal intervals using frequency density, not misleading counts",()=>{
 const q=statAnalysis(freqHistogram().draft);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.result.bins.map(b=>b.frequency),[10,10,5]);
 assert.deepEqual(q.result.bins.map(b=>b.density),[2,1,.5]);
 assert.equal(q.result.total,25);
 assert.match(renderStatSvg(q.draft),/frequency/gi);
 assert.match(statSummaryCSV(q.draft),/Frequency density/);
});
test("overlapping classes and invalid frequencies block histogram export",()=>{
 const s=freqHistogram();
 s.draft.matrix[1][0]="4";
 assert.ok(statAnalysis(s.draft).problems.some(p=>p.code==="histogram-data"));
 s.draft.matrix[1][0]="5";s.draft.matrix[1][2]="1.5";
 assert.ok(statAnalysis(s.draft).problems.some(p=>p.code==="histogram-data"));
 s.draft.matrix[1][2]="10";s.draft.matrix[1][0]="7";
 const q=statAnalysis(s.draft);
 assert.equal(q.ready,true);
 assert.ok(q.warnings.some(p=>p.code==="class-gaps"));
});
test("median-of-halves and linear quartile definitions both return mathematically correct values",()=>{
 const values=[0,1,2,3,4,5,6,7,8];
 const half=boxStats(values,"halves");
 assert.equal(half.median,4);assert.equal(half.q1,1.5);assert.equal(half.q3,6.5);
 const linear=boxStats(values,"linear");
 assert.equal(linear.q1,2);assert.equal(linear.q3,6);
 assert.equal(boxStats([0,0,0,0,0],"halves").q1,0);
});
test("box plot displays actual outliers, whiskers and sample size",()=>{
 const q=statAnalysis(boxSample().draft);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 const a=q.result.series[0].box;
 assert.equal(a.median,5);assert.equal(a.lowWhisker,1);assert.equal(a.highWhisker,8);
 assert.deepEqual(a.outliers,[100]);
 const svg=renderStatSvg(q.draft);
 assert.match(svg,/Median/);
 assert.ok(svg.includes('r="5"'));
 assert.match(svg,/n = 9/);
});
test("dot plots stack repeated observations instead of replacing them with a fitted curve",()=>{
 const s=boxSample();
 changeStatKind(s,"dot");
 assert.equal(statAnalysis(s.draft).ready,true);
 const svg=renderStatSvg(s.draft);
 assert.match(svg,/Each dot represents one supplied value/);
 assert.match(svg,/<circle/);
 const p=newStatStudio();f(p.draft,{kind:"dot",unitMode:"dimensionless",unit:""});
 importStatTable(p,"Count\n100\n100\n101\n102\n103\n104");
 p.draft.title="Repeated counts";
 const pic=renderStatSvg(p.draft);
 assert.ok(!pic.includes(" -10 ")); // no invented zero baseline for observations near 100
});
test("categorical bars respect zero baselines, real counts and group denominators",()=>{
 const s=groupedBars();
 const q=statAnalysis(s.draft);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.result.totals,[50,100]);
 assert.ok(q.warnings.some(w=>w.code==="group-size"));
 assert.ok(renderStatSvg(q.draft).includes("n=50"));
 s.draft.barMode="percent";
 const percent=statAnalysis(s.draft);
 assert.equal(percent.ready,true);
 assert.equal(percent.result.categories[0].values[0],20);
 assert.equal(percent.result.categories[0].values[1],25);
 const sums=[0,1].map(i=>percent.result.categories.reduce((sum,row)=>sum+row.values[i],0));
 assert.deepEqual(sums,[100,100]);
});
test("bar chart blocks empty, fractional, negative or overlapping category data",()=>{
 const s=groupedBars();
 s.draft.matrix[0][1]="-1";
 assert.equal(statAnalysis(s.draft).ready,false);
 s.draft.matrix[0][1]="1.2";
 assert.ok(statAnalysis(s.draft).problems.some(x=>x.code==="bar-data"));
 s.draft.matrix[0][1]="10";s.draft.matrix[1][0]="Walk";
 assert.ok(statAnalysis(s.draft).problems.some(x=>x.code==="bar-data"));
 s.draft.matrix[1][0]="Bus";s.draft.min="2";s.draft.max="70";
 assert.ok(statAnalysis(s.draft).problems.some(x=>x.code==="zero-bar"));
});
test("quality check explicitly prevents misleading scales and missing provenance",()=>{
 let s=rawHistogram(),d=s.draft;
 setStatField(s,"raw",d.raw.replace("\n9","\n90"));
 assert.ok(statAnalysis(s.draft).problems.some(x=>x.code==="pending"));
 d.pendingPaste=false;d.min="3";d.max="11";
 assert.ok(statAnalysis(d).problems.some(x=>x.code==="cropped-classes"));
 d.min="";d.max="";d.sourceKind="secondary";d.sourceText="";
 assert.ok(statAnalysis(d).problems.some(x=>x.code==="source"));
 d.sourceText="Published dataset, table 2";assert.equal(statAnalysis(d).ready,true);
});
test("selection changes respect at most four bar series, distinct category and selected measurement",()=>{
 const s=groupedBars();
 assert.equal(toggleStatSeries(s,0,true),false);
 assert.equal(toggleStatSeries(s,2,false),true);
 assert.deepEqual(s.draft.selected,[1]);
 assert.equal(toggleStatSeries(s,2,true),true);
 assert.deepEqual(s.draft.selected,[1,2]);
 changeStatKind(s,"histogram");
 assert.equal(s.draft.kind,"histogram");
 assert.equal(s.draft.selected.length,1);
});
test("escaped student strings and formula-safe CSV prevent stored-script and spreadsheet injection",()=>{
 const s=groupedBars();
 s.draft.title="<script>alert(1)</script>";
 s.draft.variable="<img src=x onerror=alert(1)>";
 s.draft.columns[1]="=HYPERLINK(1)";
 const svg=renderStatSvg(s.draft);
 assert.ok(!svg.includes("<script>")&&!svg.includes("<img src=x"));
 assert.match(svg,/&lt;script&gt;/);
 const csv=statSummaryCSV(s.draft);
 assert.ok(csv.includes("'=HYPERLINK(1)"));
});
test("linking a diagram never invents an IA result and persists after JSON round trip",()=>{
 const state=createProjectState();state.route="completing";state.completion.current="C31";state.statStudio=rawHistogram();
 const result=saveAndLinkStat(state);
 assert.equal(result.ok,true);
 assert.equal(state.entries.length,1);
 assert.equal(state.entries[0].status,"planned");
 assert.equal(state.entries[0].result,"");
 assert.equal(state.entries[0].statFigureId,result.record.id);
 const recovered=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(recovered.entries[0].statFigureId,result.record.id);
 assert.equal(recovered.statStudio.figures[0].draft.matrix.length,6);
 assert.equal(loadStat(recovered.statStudio,result.record.id),true);
 freshStat(recovered.statStudio);
 assert.equal(recovered.statStudio.figures.length,1);
});
test("changing histogram class width reopens review of completed conclusions without deleting writing",()=>{
 const state=createProjectState();state.statStudio=rawHistogram();
 const initial=saveAndLinkStat(state);assert.equal(initial.ok,true);
 const entry=state.entries[0];
 entry.result="The histogram appeared unimodal.";
 entry.status="completed";
 setStatField(state.statStudio,"binWidth","10");
 const newer=saveStatDraft(state);
 assert.equal(newer.ok,true);assert.equal(newer.reviewNeeded,true);
 assert.equal(entry.reviewNeeded,"yes");
 assert.equal(entry.result,"The histogram appeared unimodal.");
 assert.equal(state.completion.stages.C30,"needs-review");
});
test("the editor exposes all four real chart types, table fields, quality gates and output",()=>{
 const s=createProjectState();s.statStudio=rawHistogram();
 const markup=renderStatStudio(s,icon,escapeHtml);
 for(const name of ["data-action=\"stat-kind\"","data-stat-value=\"box\"",
 "data-stat-value=\"dot\"","data-stat-value=\"bar\"","data-stat-field=\"raw\"",
 "data-action=\"stat-use\"","data-action=\"stat-csv\"","data-action=\"stat-png\"",
 "data-stat-quality","data-stat-preview"]){
  assert.ok(markup.includes(name),name);
 }
 assert.ok(!markup.includes('data-action="stat-use" disabled'));
 const empty=renderStatStudio(createProjectState(),icon,escapeHtml);
 assert.ok(empty.includes('data-action="stat-use" disabled'));
});
test("invalid data cannot create a false completed step or delete existing statistical diagrams",()=>{
 const state=createProjectState();
 assert.equal(saveAndLinkStat(state).ok,false);
 assert.equal(state.entries.length,0);
 const studio=rawHistogram();
 studio.figures=Array.from({length:12},(_,i)=>({id:"stat-"+i,entryId:"",savedAt:"",draft:rawHistogram().draft}));
 const ids=studio.figures.map(f=>f.id);
 assert.equal(saveStatFigure(studio).ok,false);
 assert.deepEqual(studio.figures.map(f=>f.id),ids);
});

test("deselecting every group cannot silently reselect or plot another column",()=>{
 const s=boxSample();
 s.draft.selected=[];
 assert.equal(statAnalysis(s.draft).ready,false);
 assert.ok(statAnalysis(s.draft).problems.some(x=>x.code==="series"));
});
test("invalid measurements never silently disappear from a plotted histogram or box plot",()=>{
 const histogram=rawHistogram();
 histogram.draft.matrix[2][0]="measurement uncertain";
 assert.ok(statAnalysis(histogram.draft).problems.some(x=>x.code==="invalid-values"));
 const box=boxSample();
 box.draft.matrix[3][0]="NA";
 assert.ok(statAnalysis(box.draft).problems.some(x=>x.code==="invalid-values"));
});
test("numeric year headings can be explicitly or automatically detected in category comparisons",()=>{
 const r=parseStatTable("Category\t2025\t2026\nFirst\t3\t4\nSecond\t6\t5","auto","bar");
 assert.equal(r.hasHeaders,true);
 assert.equal(r.columns[1],"2025");
 assert.equal(r.matrix.length,2);
});

test("a box plot cannot suppress actual observations by hiding Tukey outliers",()=>{
 const s=boxSample();
 assert.equal(statAnalysis(s.draft).ready,true);
 s.draft.showOutliers=false;
 const result=statAnalysis(s.draft);
 assert.equal(result.ready,false);
 assert.ok(result.problems.some(p=>p.code==="hidden-outliers"));
 s.draft.outlierRule="minmax";
 assert.equal(statAnalysis(s.draft).ready,true);
});

test("statistic generated during a later stage stays linked to that stage, not first mathematics",()=>{
 const project=createProjectState();
 project.entries=[
  {id:"math-first",phase:"first",status:"completed",title:"First exploration",technique:"",result:"A real finding from stage 1"},
  {id:"math-second",phase:"substantial",status:"planned",fromEntryId:"math-first",
   title:"Mathematical stage 2",technique:"",kind:"",methodId:"",result:""}
 ];
 project.completion.activeEntryIndex=1;
 project.statStudio=rawHistogram();
 const linked=saveAndLinkStat(project);
 assert.equal(linked.ok,true,linked.error||"Figure should pass its established checks");
 assert.equal(project.entries.length,2,"No additional first-stage record was created");
 assert.equal(project.statStudio.figures.at(-1).entryId,"math-second");
 assert.equal(project.entries[1].statFigureId,linked.record.id);
 assert.equal(project.entries[1].status,"planned","Saving a figure is not performing all the mathematical work");
 assert.equal(project.entries[0].result,"A real finding from stage 1");
});
