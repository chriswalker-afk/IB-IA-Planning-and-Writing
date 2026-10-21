import test from "node:test";
import assert from "node:assert/strict";
import {
 newStatDraft,newStatStudio,normalizeStatDraft,normalizeStatStudio,
 statAnalysis,statSignature,boxStats
} from "../src/diagrams/stat-studio-core.js";
import {boxComparisons,formatBoxNumber} from "../src/diagrams/box-analysis.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {statSummaryHtml,renderStatStudio} from "../src/diagrams/stat-studio-view.js";
import {statSummaryCSV} from "../src/diagrams/stat-studio-export.js";
import {setStatField} from "../src/diagrams/stat-studio-actions.js";
import {createProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";

const sample=[1,2,3,4,5,6,7,8,20,100];
function boxDraft(){
 const d=newStatDraft();
 Object.assign(d,{
  kind:"box",title:"Distribution comparison",variable:"Travel time",
  unit:"s",unitMode:"unit",sourceKind:"primary",
  columns:["Sample A","Sample B"],matrix:sample.map((n,i)=>[String(n),String(i+4)]),
  selected:[0,1]
 });
 return d;
}
test("all four screening rules calculate flags without removing observations",()=>{
 const tukey=boxStats(sample,"halves","tukey");
 assert.deepEqual(tukey.outliers,[20,100]);
 assert.deepEqual(tukey.fences,[-4.5,15.5]);
 assert.deepEqual(tukey.limits,[-4.5,15.5]);
 assert.deepEqual([tukey.lowWhisker,tukey.highWhisker],[1,8]);
 assert.equal(tukey.n,10);
 const extreme=boxStats(sample,"halves","extreme");
 assert.deepEqual(extreme.outliers,[100]);
 assert.deepEqual(extreme.limits,[-12,23]);
 const z2=boxStats(sample,"halves","zscore",{zThreshold:"2"});
 const z3=boxStats(sample,"halves","zscore",{zThreshold:"3"});
 assert.deepEqual(z2.outliers,[100]);
 assert.deepEqual(z3.outliers,[]);
 assert.ok(z2.flagged[0].score>2);
 assert.ok(z2.sd>0);
 const robust=boxStats(sample,"halves","modified");
 assert.deepEqual(robust.outliers,[20,100]);
 assert.ok(robust.mad>0);
 assert.ok(robust.flagged[0].score>3.5);
 for(const box of [tukey,extreme,z2,z3,robust])
  assert.deepEqual(box.values,sample);
});
test("separate whisker choice retains all observed extrema regardless of screening rule",()=>{
 const normal=boxStats(sample,"halves","tukey",{whiskerMode:"minmax"});
 assert.deepEqual(normal.outliers,[20,100]);
 assert.equal(normal.highWhisker,100);
 assert.deepEqual(boxStats(sample,"halves","none").outliers,[]);
 assert.deepEqual(boxStats(sample,"halves","minmax").outliers,[]);
 assert.equal(boxStats(sample,"halves","minmax").highWhisker,100);
});
test("modified Z-score fails clearly on non-identical data when MAD is zero",()=>{
 const b=boxStats([1,1,1,1,10],"halves","modified");
 assert.equal(b.methodAvailable,false);
 assert.match(b.methodNote,/MAD is zero/);
 const d=boxDraft();d.selected=[0];d.matrix=[[1],[1],[1],[1],[10]].map(a=>a.map(String));
 d.outlierRule="modified";
 const q=statAnalysis(d);
 assert.ok(!q.ready);
 assert.ok(q.problems.some(x=>x.code==="outlier-method"));
 const allSame=boxStats([2,2,2,2,2],"halves","modified");
 assert.equal(allSame.methodAvailable,true);
 assert.deepEqual(allSame.outliers,[]);
});
test("quartile and label precision calculations do not silently round the actual statistics",()=>{
 const b=boxStats([0,1,2,3,4,5,6,7,8],"linear","tukey");
 assert.equal(b.q1,2);assert.equal(b.q3,6);
 assert.equal(formatBoxNumber(123.456789,"1"),"123.5");
 assert.equal(formatBoxNumber(123.456789,"auto"),"123.46");
 assert.equal(formatBoxNumber(-0.0001,"0"),"0");
});
test("comparative box plots retain independent group denominators and label meaningful differences",()=>{
 const d=boxDraft(),q=statAnalysis(d);
 assert.ok(q.ready,JSON.stringify(q.problems));
 assert.equal(q.result.series.length,2);
 assert.equal(q.result.comparisons.length,1);
 const c=q.result.comparisons[0];
 assert.equal(c.first,"Sample A");assert.equal(c.second,"Sample B");
 assert.equal(c.medianDifference,q.result.series[1].box.median-q.result.series[0].box.median);
 assert.equal(boxComparisons(q.result.series).length,1);
 assert.match(statSummaryHtml({draft:d},icon,escapeHtml),/Comparing groups/);
 assert.match(statSummaryHtml({draft:d},icon,escapeHtml),/Median Δ/);
 assert.match(statSummaryHtml({draft:d},icon,escapeHtml),/flagged observation/);
});
test("optional numerical annotations render at corresponding positions and expand SVG without clipping",()=>{
 const d=boxDraft();
 Object.assign(d,{
  showBoxQuartiles:true,showBoxMedian:true,showBoxExtremes:true,
  showBoxWhiskers:true,showBoxFences:true,showBoxMean:true,
  showBoxOutlierValues:true,showOutliers:true,showLabels:true
 });
 const svg=renderStatSvg(d);
 for(const label of ["Q1 ","Q3 ","Median ","Min ","Max ","Whisker ","Flag ","Mean "])
  assert.ok(svg.includes(label),label);
 assert.match(svg,/viewBox="0 0 960 [6-9]\d\d"/);
 assert.ok(svg.includes("stroke-dasharray"));
 assert.ok(svg.includes("Circled points are flagged"));
 assert.ok(!svg.includes("NaN"));
});
test("quality checks prohibit invisible non-whisker outliers but permit explicit min–max whiskers",()=>{
 const d=boxDraft();d.showOutliers=false;
 assert.ok(statAnalysis(d).problems.some(p=>p.code==="hidden-outliers"));
 d.whiskerMode="minmax";
 assert.equal(statAnalysis(d).problems.some(p=>p.code==="hidden-outliers"),false);
 d.showOutliers=true;
 d.outlierRule="modified";
 assert.equal(statAnalysis(d).ready,true);
});
test("new controls and old drafts round trip with backwards-compatible defaults",()=>{
 const project=createProjectState();project.statStudio.draft=boxDraft();
 const view=renderStatStudio(project,icon,escapeHtml);
 for(const control of ["showBoxQuartiles","showBoxMedian","showBoxMean",
  "showBoxOutlierValues","showBoxFences","whiskerMode","zThreshold","boxPrecision"]){
  if(control==="zThreshold")continue; // only present when Z-score is the selected rule
  assert.ok(view.includes('data-stat-field="'+control+'"'),control);
 }
 const d=project.statStudio.draft;
 const initial=statSignature(d);
 assert.equal(setStatField(project.statStudio,"outlierRule","zscore"),true);
 assert.equal(setStatField(project.statStudio,"zThreshold","2"),true);
 assert.notEqual(statSignature(d),initial);
 assert.ok(renderStatStudio(project,icon,escapeHtml).includes('data-stat-field="zThreshold"'));
 assert.equal(setStatField(project.statStudio,"showBoxQuartiles",true),true);
 assert.equal(setStatField(project.statStudio,"showBoxFences",true),true);
 assert.equal(setStatField(project.statStudio,"boxPrecision","2"),true);
 const round=normalizeStatDraft(JSON.parse(JSON.stringify(d)));
 assert.equal(round.whiskerMode,"nonoutlier");
 assert.equal(round.zThreshold,"2");
 assert.equal(round.boxPrecision,"2");
 assert.equal(round.showBoxQuartiles,true);
 const old=normalizeStatDraft({kind:"box",outlierRule:"minmax"});
 assert.equal(old.outlierRule,"minmax");
 assert.equal(boxStats(sample,old.quartileRule,old.outlierRule).highWhisker,100);
 assert.equal(old.showBoxMedian,true);
 const preserved=normalizeStatStudio({figures:[{
  id:"stat-example",entryId:"",savedAt:"2026-10-21",draft:d
 }],activeId:"stat-example"});
 assert.equal(preserved.figures[0].draft.zThreshold,"2");
});
test("calculations CSV lists raw thresholds, identified values and descriptive differences",()=>{
 const d=boxDraft();
 const csv=statSummaryCSV(d);
 for(const marker of ["Lower screening threshold","Upper screening threshold",
  "Flagged measurements","Sample standard deviation",
  "PAIRWISE DESCRIPTIVE COMPARISONS","Median difference"]){
  assert.ok(csv.includes(marker),marker);
 }
 assert.ok(csv.includes('"20; 100"'));
 assert.ok(csv.includes('"Sample A"'));
});
