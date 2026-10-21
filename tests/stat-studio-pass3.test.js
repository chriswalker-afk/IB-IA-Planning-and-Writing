import test from "node:test";
import assert from "node:assert/strict";
import {newStatStudio,newStatDraft,statAnalysis,normalizeStatStudio,statSignature} from "../src/diagrams/stat-studio-core.js";
import {groupedCurve,cumulativeClasses,frequencyPolygon,categoricalBars} from "../src/diagrams/stat-curve-analysis.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {renderStatStudio,statSummaryHtml} from "../src/diagrams/stat-studio-view.js";
import {statSummaryCSV} from "../src/diagrams/stat-studio-export.js";
import {setStatField,changeStatKind} from "../src/diagrams/stat-studio-actions.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newTableStudio,importTableData,analyzeTable} from "../src/diagrams/table-studio-core.js";
import {chooseTableMode} from "../src/diagrams/table-studio-actions.js";
import {renderTableStudio} from "../src/diagrams/table-studio-view.js";
import {prepareTableCurve,transferTableCurve,prepareStatFrequencyTable,transferStatFrequencyTable} from "../src/diagrams/frequency-handover.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";

const classes=[{low:0,high:10,frequency:4},{low:10,high:20,frequency:6},{low:20,high:40,frequency:10}];
function grouped(kind="ogive"){
 const s=newStatStudio(),d=s.draft;
 Object.assign(d,{kind,histogramInput:"table",columns:["Lower (cm)","Upper (cm)","Frequency"],matrix:[["0","10","4"],["10","20","6"],["20","40","10"]],
 selected:[0],lowIndex:0,highIndex:1,frequencyIndex:2,title:"Grouped heights",variable:"Height",unit:"cm",unitMode:"unit",sourceKind:"primary"});
 return s;
}
function raw(kind="ogive"){
 const s=newStatStudio();
 Object.assign(s.draft,{kind,histogramInput:"raw",curveCompare:"multiple",binWidth:"5",binStart:"0",
 columns:["A (s)","B (s)"],selected:[0,1],matrix:[["1","6"],["2","7"],["3","8"],["4","9"],["6","10"],["8","11"],["9","12"],["12","13"]],
 title:"Two groups",variable:"Time",unit:"s",unitMode:"unit",sourceKind:"primary"});
 return s;
}
function bars(){
 const d=newStatDraft();Object.assign(d,{kind:"bar",columns:["Choice","Year 10","Year 11"],matrix:[["Walk","10","20"],["Bus","30","10"],["Cycle","5","5"]],
 categoryIndex:0,selected:[1,2],title:"Travel choices",variable:"Transport",sourceKind:"primary"});return d;
}
function table(){
 const s=newTableStudio();s.draft.headers="yes";
 importTableData(s,"Lower (cm)\tUpper (cm)\tFrequency\n0\t10\t4\n10\t20\t6\n20\t40\t10");
 chooseTableMode(s,"grouped");
 Object.assign(s.draft,{groupInput:"classes",title:"Grouped heights",sourceKind:"primary",purpose:"Illustrate the distribution by intervals"});
 return s;
}
test("cumulative frequencies and grouped quartile estimates preserve all source frequencies",()=>{
 const c=groupedCurve(classes,90);
 assert.equal(c.total,20);
 assert.deepEqual(c.points.map(p=>[p.x,p.cumulative]),[[0,0],[10,4],[20,10],[40,20]]);
 assert.deepEqual(c.rows.map(b=>b.cumulativePercent),[20,50,100]);
 assert.ok(Math.abs(c.estimates.q1-(10+10/6))<1e-9);
 assert.equal(c.estimates.median,20);
 assert.equal(c.estimates.q3,30);
 assert.equal(c.estimates.percentile,36);
 const gaps=cumulativeClasses([{low:0,high:2,frequency:2},{low:5,high:8,frequency:1}]);
 assert.deepEqual(gaps.points.map(p=>[p.x,p.cumulative]),[[0,0],[2,2],[5,2],[8,3]]);
 assert.ok(cumulativeClasses([{low:0,high:2,frequency:2},{low:1,high:3,frequency:1}]).error);
});
test("frequency polygon uses class midpoints and frequency density for unequal widths",()=>{
 const polygon=frequencyPolygon(classes);
 assert.deepEqual(polygon.points.map(p=>[p.x,p.y]),[[5,.4],[15,.6],[30,.5]]);
 assert.deepEqual(frequencyPolygon(classes,true).points.map(p=>p.y),[.02,.03,.025]);
 assert.equal(polygon.points.reduce((n,p)=>n+p.frequency,0),20);
 assert.equal(frequencyPolygon([{low:0,high:2,frequency:1},{low:4,high:6,frequency:2}]).points[1].gapBefore,true);
});
test("ogive shows estimated quartiles and exports boundary frequencies, percentages and percentile methods",()=>{
 const s=grouped(),q=statAnalysis(s.draft);
 assert.ok(q.ready,JSON.stringify(q.problems));
 const svg=renderStatSvg(s.draft),csv=statSummaryCSV(s.draft);
 for(const term of ["Cumulative percentage","Q1 ≈","Median ≈","Q3 ≈","grouped class intervals"])assert.ok(svg.includes(term),term);
 for(const term of ["Cumulative frequency","Estimated median","INTERPOLATED PERCENTILES"])assert.ok(csv.includes(term),term);
 assert.match(statSummaryHtml(s,icon,escapeHtml),/linear interpolation within classes/);
 s.draft.ogiveYMode="count";
 assert.match(renderStatSvg(s.draft),/Cumulative frequency \(count\)/);
 s.draft.curveShowPercentile=true;s.draft.curvePercentile="90";
 assert.match(renderStatSvg(s.draft),/P90 ≈/);
 s.draft.curvePercentile="100";
 assert.equal(statAnalysis(s.draft).ready,false);
 assert.ok(statAnalysis(s.draft).problems.some(p=>p.code==="percentile"));
});
test("grouped polygons offer histogram overlays and a truthful midpoint table",()=>{
 const s=grouped("polygon");s.draft.polygonShowHistogram=true;
 assert.ok(statAnalysis(s.draft).ready);
 const svg=renderStatSvg(s.draft);
 assert.match(svg,/Frequency polygon/);
 assert.match(svg,/fill-opacity=".22"/);
 assert.equal((svg.match(/<circle/g)||[]).length,3);
 assert.match(statSummaryCSV(s.draft),/Class midpoint/);
 assert.match(statSummaryHtml(s,icon,escapeHtml),/midpoint/);
});
test("raw group comparisons share class boundaries and use cumulative percentages",()=>{
 const s=raw(),q=statAnalysis(s.draft);
 assert.ok(q.ready,JSON.stringify(q.problems));
 assert.equal(q.result.curves.length,2);
 assert.equal(q.result.curveYMode,"percent");
 assert.ok(q.result.curves.every(group=>group.curve.points.at(-1).percent===100));
 assert.deepEqual(q.result.curves[0].bins.map(b=>b.low),q.result.curves[1].bins.map(b=>b.low));
 const source=JSON.stringify(s.draft.matrix);
 assert.ok(changeStatKind(s,"polygon"));
 assert.equal(s.draft.curveCompare,"multiple");
 assert.ok(statAnalysis(s.draft).result.polygons.every(p=>p.polygon.relative));
 assert.match(renderStatSvg(s.draft),/relative-frequency density/);
 assert.ok(changeStatKind(s,"histogram"));assert.equal(s.draft.selected.length,2);
 assert.equal(JSON.stringify(s.draft.matrix),source);
});
test("stacked and 100%-stacked bars preserve counts and use correct category denominators",()=>{
 const d=bars();d.barStyle="stacked";d.barSort="total-desc";
 let q=statAnalysis(d);assert.ok(q.ready);
 assert.deepEqual(q.result.categories.map(x=>x.category),["Bus","Walk","Cycle"]);
 assert.deepEqual(q.result.categories.map(x=>x.categoryTotal),[40,30,10]);
 assert.deepEqual(q.result.categories[0].values,[30,10]);
 assert.match(renderStatSvg(d),/Stacked raw counts/);
 d.barStyle="stacked100";q=statAnalysis(d);
 assert.deepEqual(q.result.categories[0].values,[75,25]);
 assert.ok(q.result.categories.every(c=>Math.abs(c.values.reduce((a,b)=>a+b,0)-100)<1e-9));
 assert.match(renderStatSvg(d),/Percent of category/);
 assert.match(statSummaryCSV(d),/ORIGINAL CATEGORY COUNTS/);
 d.barStyle="grouped";d.barMode="percent";q=statAnalysis(d);
 assert.ok(Math.abs(q.result.categories[0].values[0]-30/45*100)<1e-10);
 assert.equal(q.result.denominator,"group");
 d.barSort="name";assert.deepEqual(statAnalysis(d).result.categories.map(c=>c.category),["Bus","Cycle","Walk"]);
});
test("empty category percentage denominator and stacked-axis cropping block export",()=>{
 const d=bars();d.barStyle="stacked100";d.matrix.push(["Nobody","0","0"]);
 assert.ok(statAnalysis(d).problems.some(p=>p.code==="bar-data"));
 d.matrix.pop();d.barStyle="stacked";d.min="0";d.max="35";
 assert.ok(statAnalysis(d).problems.some(p=>p.code==="cropped-bars"));
 d.max="50";assert.ok(statAnalysis(d).ready);
 d.min="1";assert.ok(statAnalysis(d).problems.some(p=>p.code==="zero-bar"));
});
test("grouped Table Studio copies exactly to ogive or polygon and never overwrites saved figures",()=>{
 const state=createProjectState();state.tableStudio=table();
 const t=analyzeTable(state.tableStudio.draft);assert.ok(t.ready,JSON.stringify(t.problems));
 const before=JSON.stringify(state.tableStudio.draft);
 for(const kind of ["ogive","polygon"]){
  const copy=prepareTableCurve(state.tableStudio,kind);
  assert.ok(copy.ok,copy.error);assert.equal(copy.draft.kind,kind);
  assert.deepEqual(statAnalysis(copy.draft).result.bins.map(b=>[b.low,b.high,b.frequency]),[[0,10,4],[10,20,6],[20,40,10]]);
  assert.equal(transferTableCurve(state,kind).ok,true);
  assert.equal(state.statStudio.draft.kind,kind);
  assert.equal(JSON.stringify(state.tableStudio.draft),before);
 }
 assert.match(renderTableStudio(state,icon,escapeHtml),/data-action="table-to-ogive"/);
 assert.match(renderTableStudio(state,icon,escapeHtml),/data-action="table-to-polygon"/);
 assert.match(renderStatStudio(state,icon,escapeHtml),/data-action="stat-to-table"/);
 const reversed=prepareStatFrequencyTable(state.statStudio);
 assert.ok(reversed.ok,reversed.error);
 assert.deepEqual(analyzeTable(reversed.draft).model.bins.map(b=>b.frequency),[4,6,10]);
 assert.equal(transferStatFrequencyTable(state).ok,true);
});
test("new settings survive backups; older diagrams retain safe defaults",()=>{
 const state=createProjectState();state.statStudio.draft=grouped().draft;
 state.statStudio.draft.curveShowPercentile=true;state.statStudio.draft.curvePercentile="83";state.statStudio.draft.curveGuides=false;
 const copy=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(copy.statStudio.draft.kind,"ogive");
 assert.equal(copy.statStudio.draft.curvePercentile,"83");
 assert.equal(copy.statStudio.draft.curveGuides,false);
 const s=newStatStudio();s.draft=bars();
 for(const [key,value] of [["barStyle","stacked100"],["barSort","total-desc"],["barLabels","percent"]])
  assert.equal(setStatField(s,key,value),true);
 assert.match(renderStatStudio({...state,statStudio:s},icon,escapeHtml),/data-stat-field="barStyle"/);
 assert.notEqual(statSignature(s.draft),statSignature({...s.draft,barSort:"source"}));
 assert.equal(normalizeStatStudio({draft:{kind:"histogram"}}).draft.barStyle,"grouped");
});
