import test from "node:test";
import assert from "node:assert/strict";
import {newStatDraft,newStatStudio,statAnalysis,normalizeStatDraft,normalizeStatStudio} from "../src/diagrams/stat-studio-core.js";
import {histogramBinSuggestions,alignedHistograms,dotPlacement,distributionSummary} from "../src/diagrams/distribution-analysis.js";
import {changeStatKind,toggleStatSeries,setStatField,chooseHistogramSuggestion} from "../src/diagrams/stat-studio-actions.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {statSummaryCSV} from "../src/diagrams/stat-studio-export.js";
import {renderStatStudio} from "../src/diagrams/stat-studio-view.js";
import {createProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
const original=()=>{
 const d=newStatDraft();
 Object.assign(d,{kind:"histogram",title:"Two sets",variable:"Length",unit:"cm",unitMode:"unit",
  sourceKind:"primary",columns:["A (cm)","B (cm)"],selected:[0,1],
  matrix:[["1","2"],["2","3"],["3","4"],["4","5"],["5","6"],["6","7"],["7","8"],["8","9"]],
  binWidth:"2",histogramCompare:"overlay"});
 return d;
};
test("binning suggestions never change the draft without explicit action",()=>{
 const d=original(),before=d.binWidth;
 const q=statAnalysis(d);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.equal(d.binWidth,before);
 const suggestion=q.result.suggestions.find(s=>s.key==="sturges");
 assert.equal(suggestion.available,true);
 const studio=newStatStudio();studio.draft=d;
 assert.equal(chooseHistogramSuggestion(studio,"sturges"),true);
 assert.equal(Number(studio.draft.binWidth),suggestion.width);
 assert.equal(chooseHistogramSuggestion(studio,"unknown"),false);
 assert.ok(histogramBinSuggestions([2,2,2,2]).some(s=>s.available));
 assert.equal(histogramBinSuggestions([1,1,1,1]).find(s=>s.key==="fd").available,false);
});
test("compared histograms always have identical bin edges and preserve each sample size",()=>{
 const d=original();
 d.matrix.pop();
 const q=statAnalysis(d);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.equal(q.result.series.length,2);
 assert.equal(q.result.series[0].n,7);assert.equal(q.result.series[1].n,7);
 for(const group of q.result.series){
  assert.deepEqual(group.bins.map(b=>[b.low,b.high]),q.result.bins.map(b=>[b.low,b.high]));
  assert.equal(group.bins.reduce((n,b)=>n+b.frequency,0),group.n);
  const area=group.bins.reduce((sum,b)=>sum+b.relativeDensity*(b.high-b.low),0);
  assert.ok(Math.abs(area-1)<1e-9);
 }
 const copy=original();copy.matrix[0][1]="";
 const unequal=statAnalysis(copy);
 assert.equal(unequal.ready,true,JSON.stringify(unequal.problems));
 assert.ok(unequal.warnings.some(w=>w.code==="unequal-group-n"));
 assert.match(renderStatSvg(copy),/Relative-frequency density/);
 assert.match(statSummaryCSV(copy),/Relative-frequency density/);
});
test("compared histograms can display small multiples on the same numerical scale",()=>{
 const d=original();d.histogramCompare="smallmultiples";
 const svg=renderStatSvg(d);
 assert.match(svg,/viewBox="0 0 960 900"/);
 assert.match(svg,/Common class boundaries/);
 assert.match(svg,/A \(cm\)/);
 assert.match(svg,/B \(cm\)/);
 d.histogramLabels="density";
 assert.match(renderStatSvg(d),/Relative-frequency density/);
});
test("raw values and configured groups survive changes between histogram, dot and box",()=>{
 const studio=newStatStudio();studio.draft=original();
 const initial=JSON.stringify(studio.draft.matrix);
 assert.equal(changeStatKind(studio,"dot"),true);
 assert.equal(studio.draft.selected.length,2);
 assert.equal(changeStatKind(studio,"box"),true);
 assert.equal(changeStatKind(studio,"histogram"),true);
 assert.equal(studio.draft.selected.length,2);
 assert.equal(JSON.stringify(studio.draft.matrix),initial);
 assert.equal(studio.draft.unit,"cm");
 const copy=normalizeStatStudio({draft:studio.draft});
 assert.equal(copy.draft.histogramCompare,"overlay");
 const legacy=normalizeStatDraft({kind:"histogram"});
 assert.equal(legacy.histogramCompare,"single");
});
test("dot placement retains every original observation even when close together",()=>{
 const values=[1,1,1.001,1.002,1.003,1.004,1.005,1.006];
 const spread=dotPlacement(values,0,2,794,"individual");
 assert.equal(spread.dots.length,values.length);
 assert.deepEqual(spread.dots.map(p=>p.value).sort((a,b)=>a-b),[...values].sort((a,b)=>a-b));
 assert.ok(spread.levels>=values.length-1);
 const counted=dotPlacement(values,0,2,794,"counted");
 assert.equal(counted.dots.reduce((a,x)=>a+x.count,0),values.length);
 assert.equal(counted.dots.filter(x=>x.value===1)[0].count,2);
});
test("dot marker mode and summary lines render without hiding observations",()=>{
 const studio=newStatStudio();studio.draft=original();
 assert.equal(changeStatKind(studio,"dot"),true);
 assert.equal(setStatField(studio,"dotMode","counted"),true);
 assert.equal(setStatField(studio,"dotMean",true),true);
 assert.equal(setStatField(studio,"dotMedian",true),true);
 studio.draft.matrix.push(["1","2"]);
 const q=statAnalysis(studio.draft);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 const svg=renderStatSvg(studio.draft);
 assert.match(svg,/Mean /);assert.match(svg,/Median /);assert.match(svg,/×2/);
 assert.match(svg,/Counted dot plot/);
 assert.match(statSummaryCSV(studio.draft),/GROUP SUMMARIES/);
 const state=createProjectState();state.statStudio=studio;
 const html=renderStatStudio(state,icon,escapeHtml);
 assert.match(html,/data-stat-field="dotMode"/);
 assert.match(html,/data-stat-field="dotMean"/);
});
test("grouped frequencies cannot be treated as raw individual datasets for comparison",()=>{
 const d=original();
 d.histogramInput="table";d.histogramCompare="overlay";
 d.columns=["Low","High","Frequency"];d.matrix=[["0","5","3"],["5","10","6"]];
 d.lowIndex=0;d.highIndex=1;d.frequencyIndex=2;
 const q=statAnalysis(d);
 assert.equal(q.ready,false);
 assert.ok(q.problems.some(p=>p.code==="compare-grouped"));
 const studio=newStatStudio();studio.draft=d;
 assert.equal(setStatField(studio,"histogramCompare","smallmultiples"),false);
});
test("descriptive summaries use source values rather than grouped-midpoint estimates",()=>{
 const s=distributionSummary([1,2,3,4,5]);
 assert.equal(s.mean,3);assert.equal(s.median,3);
 assert.equal(s.q1,1.5);assert.equal(s.q3,4.5);
 assert.ok(s.sd>0);
 const empty=distributionSummary([]);
 assert.equal(empty,null);
});
