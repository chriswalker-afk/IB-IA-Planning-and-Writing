import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newStatDraft,newStatStudio,statAnalysis,saveStatFigure} from "../src/diagrams/stat-studio-core.js";
import {statReadingGuide,statMethodNote} from "../src/diagrams/stat-reading-guide.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {renderStatStudio,statReadingGuideHtml} from "../src/diagrams/stat-studio-view.js";
import {statSummaryCSV} from "../src/diagrams/stat-studio-export.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";
import {figureCaption,handoverQuestions,presentationDiagnostics} from "../src/diagrams/presentation-coach-core.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";

const origin=()=>({sourceKind:"primary",title:"An actual statistics sample",variable:"Time",unit:"s",unitMode:"unit"});
function continuous(kind){
 const d=newStatDraft();Object.assign(d,origin(),{kind,histogramInput:"table",
  columns:["Lower (s)","Upper (s)","Frequency"],matrix:[["0","10","4"],["10","20","6"],["20","40","10"]],
  lowIndex:0,highIndex:1,frequencyIndex:2,selected:[0],binWidth:"10"});
 return d;
}
function measured(kind){
 const d=newStatDraft();Object.assign(d,origin(),{kind,columns:["Sample (s)"],
  matrix:[["1"],["2"],["2"],["3"],["5"],["8"],["12"],["12"],["12"]],
  selected:[0],binWidth:"2",binStart:"0"});
 return d;
}
function bars(){
 const d=newStatDraft();Object.assign(d,{kind:"bar",title:"Categorical counts",variable:"Choice",
 sourceKind:"primary",columns:["Choice","A","B"],categoryIndex:0,selected:[1,2],
 matrix:[["Walk","10","20"],["Bus","30","10"],["Cycle","5","5"]],barStyle:"stacked100"});
 return d;
}
const allKinds=[
 ["histogram",()=>measured("histogram")],
 ["ogive",()=>continuous("ogive")],
 ["polygon",()=>continuous("polygon")],
 ["box",()=>measured("box")],
 ["dot",()=>measured("dot")],
 ["bar",bars]
];
test("six diagrams each show a source-grounded observation, a separate writing question and a limitation",()=>{
 const s=createProjectState();
 for(const [kind,make] of allKinds){
  const d=make(),q=statAnalysis(d);
  assert.equal(q.ready,true,kind+": "+JSON.stringify(q.problems));
  const info=statReadingGuide(d);
  assert.equal(info.kind,kind);
  assert.equal(info.valid,true,kind);
  assert.ok(info.observation.length>15&&info.question.includes("?")&&info.caution.length>35,kind+": "+JSON.stringify(info));
  assert.ok(!info.observation.includes("significant difference"),"The guidance must not claim significance");
  assert.ok(!info.observation.includes("caused"),"No causal interpretation is invented");
  const html=statReadingGuideHtml({draft:d},icon,escapeHtml);
  assert.match(html,/1 · Read/);assert.match(html,/2 · Interpret/);assert.match(html,/3 · Evaluate/);
  assert.match(html,/data-stat-reading-guide/);
  const coach=presentationDiagnostics(s,"stat",d);
  assert.ok(coach.some(c=>c.detail.length>20));
  const cap=figureCaption(s,"stat",d);
  assert.ok(cap.includes(statMethodNote(d)),kind+" missing method in caption");
  const prompts=handoverQuestions(s,"stat",d);
  assert.ok(prompts.before&&prompts.after&&prompts.limitation&&prompts.next);
  assert.ok(prompts.before.length>20&&prompts.after.length>20);
 }
});
test("invalid and pending datasets never masquerade as valid results",()=>{
 const d=measured("histogram");
 d.matrix[0][0]="?";
 assert.equal(statReadingGuide(d).valid,false);
 assert.match(statReadingGuide(d).observation,/Enter and check/);
 const studio=newStatStudio();studio.draft=d;
 assert.match(statReadingGuideHtml(studio,icon,escapeHtml),/Enter and check/);
});
test("ogive quartile annotations remain in a distinct key outside the plotted area",()=>{
 const d=continuous("ogive");
 d.curveShowQuartiles=true;d.curveShowPercentile=true;d.curvePercentile="90";
 const svg=renderStatSvg(d);
 assert.match(svg,/viewBox="0 0 960 750"/);
 assert.match(svg,/Q1 ≈/);assert.match(svg,/Median ≈/);assert.match(svg,/Q3 ≈/);
 assert.match(svg,/P90 ≈/);
 assert.match(svg,/<rect x="119" y="572" width="794" height="66"/);
 assert.match(svg,/<title>.*<\/title>/);
 assert.match(svg,/<desc>.*<\/desc>/);
 const guide=statReadingGuide(d);
 assert.match(guide.observation,/estimated median/);
 assert.match(guide.caution,/interpolation/);
});
test("compared histograms use key and tooltips instead of overlapping bar labels",()=>{
 const d=measured("histogram");
 d.columns=["A (s)","B (s)"];d.selected=[0,1];
 d.matrix=[["1","2"],["2","3"],["4","6"],["5","8"],["9","10"]];
 d.histogramCompare="overlay";d.histogramLabels="frequency";
 const q=statAnalysis(d);assert.ok(q.ready,JSON.stringify(q.problems));
 const svg=renderStatSvg(d);
 assert.match(svg,/viewBox="0 0 960 726"/);
 assert.match(svg,/relative density/);
 assert.match(svg,/A \(s\) \(n=5\)/);assert.match(svg,/B \(s\) \(n=5\)/);
 assert.ok(!/>5<\/text>/.test(svg),"Bar heights must not be misread as overlapping labels");
 const source=statSummaryCSV(d);
 assert.match(source,/Relative-frequency density/);
});
test("all dot observations stay visible, and mean/median captions occupy separate key positions",()=>{
 const d=measured("dot");d.dotMean=true;d.dotMedian=true;
 const svg=renderStatSvg(d);
 assert.match(svg,/Mean /);assert.match(svg,/Median /);
 assert.match(svg,/stroke-dasharray="5 3"/);assert.match(svg,/stroke-dasharray="2 4"/);
 assert.equal((svg.match(/<circle cx=/g)||[]).length,9);
 const many=measured("dot");
 many.matrix=Array.from({length:180},()=>["2"]);
 assert.equal(statAnalysis(many).ready,false);
 many.dotMode="counted";
 assert.equal(statAnalysis(many).ready,true,JSON.stringify(statAnalysis(many).problems));
 assert.match(renderStatSvg(many),/×180/);
 assert.match(statReadingGuide(many).observation,/180/);
});
test("box-plot tooltip notes do not falsely say outlier labels were omitted when never requested",()=>{
 const d=measured("box");
 d.matrix=Array.from({length:9},(_,i)=>[String(i+1)]).concat([["100"],["110"],["120"]]);
 const svg=renderStatSvg(d);
 assert.ok(!svg.includes("Some outlier values are listed only"));
});
test("very small axis ticks retain scientific notation rather than all becoming zero",()=>{
 const d=continuous("ogive");
 d.matrix=[["0.00000001","0.00000002","3"],["0.00000002","0.00000003","5"]];
 const svg=renderStatSvg(d);
 assert.ok(statAnalysis(d).ready,JSON.stringify(statAnalysis(d).problems));
 assert.match(svg,/e-8/);
 assert.ok(!svg.includes("NaN"));
});
test("full-project figure collection retains all six generated SVGs, methods and source data without mutations",()=>{
 const state=createProjectState();
 const originals=[];
 for(const [kind,make] of allKinds){
  const draft=make(),studio=newStatStudio();
  studio.draft=draft;const saved=saveStatFigure(studio);
  assert.ok(saved.ok,kind);
  state.statStudio.figures.push(saved.record);
  originals.push(saved.record);
 }
 state.statStudio.draft=newStatDraft();
 const before=JSON.stringify(state);
 const files=collectProjectFigures(state).filter(f=>f.kind==="stat");
 assert.equal(files.length,6);
 for(const fig of files){
  assert.match(fig.svg,/class="stat-figure-svg"/);
  assert.ok(fig.rows.some(r=>r.label==="Statistical method and convention"));
  assert.ok(fig.rows.some(r=>r.label==="Entered source data"));
  assert.equal(fig.error,"");
 }
 assert.equal(JSON.stringify(state),before);
 const back=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(back.statStudio.figures.map(f=>f.draft.kind),allKinds.map(x=>x[0]));
});
test("six source-grounded diagrams all expose usable controls on the smallest layout",()=>{
 const state=createProjectState();
 for(const [kind,make] of allKinds){
  state.statStudio.draft=make();
  const html=renderStatStudio(state,icon,escapeHtml);
  assert.match(html,/data-stat-reading-guide/);
  assert.match(html,/data-stat-preview/);
  assert.match(html,/data-stat-quality/);
  assert.match(html,/data-figure-handover="stat"/);
  assert.match(html,/Save &amp; link to this mathematical stage/);
   assert.match(html,/data-action="stat-save"/);
  assert.match(html,/data-action="stat-svg"/);
  assert.match(html,/data-action="stat-png"/);
  assert.match(html,/data-action="stat-csv"/);
 }
});
