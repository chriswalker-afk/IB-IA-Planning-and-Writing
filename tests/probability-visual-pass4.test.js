import test from "node:test";
import assert from "node:assert/strict";
import {newProbabilityDraft,newProbabilityStudio,normalizeProbabilityDraft,probabilityAnalysis,probabilitySignature,saveProbabilityFigure} from "../src/diagrams/probability-core.js";
import {chooseProbabilityPreset,changeProbabilityContinuation,moveProbabilityOutcome,removeProbabilityOutcome,setProbabilityLabelOffset} from "../src/diagrams/probability-flexible-actions.js";
import {setProbabilityField,setProbabilityBranch,toggleProbabilityLeaf,saveAndLinkProbability} from "../src/diagrams/probability-actions.js";
import {renderProbabilitySvg} from "../src/diagrams/probability-render.js";
import {probabilityFigureDiagnostics} from "../src/diagrams/probability-flexible-render.js";
import {probabilityPreviewHtml,renderProbabilityStudio} from "../src/diagrams/probability-view.js";
import {probabilityPngScale} from "../src/diagrams/probability-export.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";
const icon=()=>"<svg></svg>";
const escape=x=>String(x??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,a+" compared with "+b);
function prepare(kind="three-way"){
 const s=newProbabilityStudio();assert(chooseProbabilityPreset(s,kind));return s;
}
function fill(s,parent,values){
 values.forEach((value,index)=>assert(setProbabilityBranch(s,parent,index,"probability",value)));
}
function figureSize(svg){
 const match=/viewBox="0 0 ([0-9]+) ([0-9]+)"/.exec(svg);
 assert(match);return {width:Number(match[1]),height:Number(match[2])};
}
function rectFor(svg,path){
 const start=svg.indexOf('data-branch="'+path+'"');
 assert(start>=0,"Missing branch panel "+path);
 const match=/class="probability-label-panel" x="([\d.]+)" y="([\d.]+)" width="(\d+)" height="(\d+)"/.exec(svg.slice(start,start+330));
 assert(match,"Missing label rectangle for "+path);
 return {x:Number(match[1]),y:Number(match[2]),width:Number(match[3]),height:Number(match[4])};
}
test("long outcome labels wrap completely and do not crowd the stage headings",()=>{
 const s=prepare();
 const label="Significant change following the first review of a randomly allocated experimental treatment";
 assert(setProbabilityBranch(s,"0",0,"label",label));
 const check=probabilityAnalysis(s.draft),svg=renderProbabilitySvg(s.draft);
 const rect=rectFor(svg,"00");
 assert(rect.width>140&&rect.height>47,JSON.stringify(rect));
 assert(rect.y>=145,"The first label must be beneath the stage heading");
 for(const word of ["Significant","change","following","randomly","experimental","treatment"])
  assert(svg.includes(word),"Missing authored word: "+word);
 assert(!svg.includes("Significant change…"));
 assert(probabilityFigureDiagnostics(check).longLabels>=1);
});
test("mathematical outcome expressions stay typeset rather than being truncated",()=>{
 const s=prepare();
 const formula="Conditional \\(\\frac{P(A\\cap B)}{P(B)}\\) after the intervention";
 assert(setProbabilityBranch(s,"",0,"label",formula));
 const svg=renderProbabilitySvg(s.draft);
 assert(svg.includes("diagram-math-typeset"));
 assert(svg.includes("Conditional")&&svg.includes("intervention"));
 assert(!svg.includes("<script"));
});
test("outcome reordering keeps conditional subtrees, calculated event values and label nudges",()=>{
 const s=prepare();
 fill(s,"",[".2",".3",".5"]);
 fill(s,"0",[".4",".6"]);fill(s,"1",[".7",".3"]);fill(s,"2",[".1",".9"]);
 s.draft.showEventCalculation=true;
 assert(toggleProbabilityLeaf(s,"eventLeaves","20",true));
 assert(toggleProbabilityLeaf(s,"conditionLeaves","11",true));
 assert(setProbabilityLabelOffset(s,"20","x",18));
 assert(setProbabilityLabelOffset(s,"11","y",-16));
 const before=probabilityAnalysis(s.draft);assert(before.ready);
 assert(moveProbabilityOutcome(s,"",2,-1).ok);
 assert.equal(s.draft.branches[""][1].probability,".5");
 assert.deepEqual(s.draft.branches["1"].map(x=>x.probability),[".1",".9"]);
 assert.deepEqual(s.draft.branches["2"].map(x=>x.probability),[".7",".3"]);
 assert.deepEqual(s.draft.eventLeaves,["10"]);
 assert.deepEqual(s.draft.conditionLeaves,["21"]);
 assert.deepEqual(s.draft.labelOffsets["10"],{x:18,y:0});
 assert.deepEqual(s.draft.labelOffsets["21"],{x:0,y:-16});
 const after=probabilityAnalysis(s.draft);assert(after.ready,after.issues.join("; "));
 near(after.total,before.total);near(after.event,before.event);
 near(after.condition,before.condition);near(after.conditional,before.conditional);
 assert(moveProbabilityOutcome(s,"",1,1).ok);
 assert.deepEqual(s.draft.eventLeaves,["20"]);
 assert.equal(moveProbabilityOutcome(s,"",0,-1).ok,false);
});
test("nested reordering preserves dormant child values and remaps their annotation positions",()=>{
 const s=prepare("custom");s.draft.terminalNodes=["1"];
 assert(changeProbabilityContinuation(s,"0",true).ok);
 assert(changeProbabilityContinuation(s,"00",true).ok);
 s.draft.branches["00"][0].probability="3/5";
 s.draft.branches["00"][1].probability="2/5";
 assert(toggleProbabilityLeaf(s,"eventLeaves","000",true));
 assert(setProbabilityLabelOffset(s,"000","x",12));
 assert(changeProbabilityContinuation(s,"00",false).ok);
 assert(moveProbabilityOutcome(s,"0",0,1).ok);
 assert(s.draft.terminalNodes.includes("01"));
 assert.deepEqual(s.draft.branches["01"].map(x=>x.probability),["3/5","2/5"]);
 assert.deepEqual(s.draft.labelOffsets["010"],{x:12,y:0});
 assert.deepEqual(s.draft.eventLeaves,[]);
 assert(changeProbabilityContinuation(s,"01",true).ok);
 assert.equal(s.draft.branches["01"][0].probability,"3/5");
});
test("removing siblings also reindexes surviving annotations and removes discarded ones",()=>{
 const s=prepare();
 assert(setProbabilityLabelOffset(s,"20","x",-20));
 assert(setProbabilityLabelOffset(s,"10","y",-10));
 assert(removeProbabilityOutcome(s,"",1).ok);
 assert.deepEqual(s.draft.labelOffsets["10"],{x:-20,y:0});
 assert.equal(s.draft.labelOffsets["20"],undefined);
});
test("manual adjustments are bounded, reversible and leave every branch probability unchanged",()=>{
 const s=prepare();
 fill(s,"",[".2",".3",".5"]);
 for(const p of ["0","1","2"])fill(s,p,["1/4","3/4"]);
 const before=probabilityAnalysis(s.draft),rect=rectFor(renderProbabilitySvg(s.draft),"0");
 assert(setProbabilityLabelOffset(s,"0","x",16));
 assert(setProbabilityLabelOffset(s,"0","y",-11));
 const after=rectFor(renderProbabilitySvg(s.draft),"0");
 near(after.x,rect.x+16);near(after.y,rect.y-11);
 for(const [axis,bad] of [["y",-31],["x",55],["x","invalid"]])
  assert.equal(setProbabilityLabelOffset(s,"0",axis,bad),false);
 assert.equal(setProbabilityLabelOffset(s,"missing","x",2),false);
 near(probabilityAnalysis(s.draft).total,before.total);
 assert(setProbabilityLabelOffset(s,"0","x",0));assert(setProbabilityLabelOffset(s,"0","y",0));
 assert.equal(s.draft.labelOffsets["0"],undefined);
});
test("monochrome path styles distinguish selected events and show a useful legend",()=>{
 const s=prepare("asymmetric");
 fill(s,"",[".6",".4"]);fill(s,"0",[".2",".3",".5"]);
 assert(toggleProbabilityLeaf(s,"eventLeaves","01",true));
 assert(toggleProbabilityLeaf(s,"conditionLeaves","02",true));
 assert(toggleProbabilityLeaf(s,"eventLeaves","1",true));
 assert(toggleProbabilityLeaf(s,"conditionLeaves","1",true));
 assert(setProbabilityField(s,"printStyle","mono"));
 const svg=renderProbabilitySvg(s.draft);
 for(const kind of ["event","condition","both"])assert(svg.includes('data-prob-legend="'+kind+'"'));
 for(const dash of ["9 4","2 4","9 4 2 4"])assert(svg.includes('stroke-dasharray="'+dash+'"'));
 assert(setProbabilityField(s,"showPathLegend",false));
 assert(!renderProbabilitySvg(s.draft).includes("probability-event-legend"));
 assert.equal(probabilityAnalysis(s.draft).ready,true);
});
test("32 terminal outcomes stay inside the SVG and large PNG sizes are limited safely",()=>{
 const s=prepare("custom"),d=s.draft;
 d.stages=3;d.terminalNodes=[];
 d.branches={"":[{label:"Part 1",probability:".5"},{label:"Part 2",probability:".5"}]};
 for(const a of ["0","1"]){
  d.branches[a]=Array.from({length:4},(_,i)=>({label:"Group "+(i+1),probability:".25"}));
  for(let i=0;i<4;i++)d.branches[a+i]=Array.from({length:4},(_,j)=>({
   label:"Assessment after extended pathway "+(j+1)+" and recorded evidence",probability:"1/4"}));
 }
 const check=probabilityAnalysis(d);assert(check.ready,check.issues.join(" / "));
 assert.equal(check.paths.length,32);near(check.total,1);
 const svg=renderProbabilitySvg(d),dims=figureSize(svg);
 const panels=[...svg.matchAll(/class="probability-label-panel" x="([\d.]+)" y="([\d.]+)" width="(\d+)" height="(\d+)"/g)];
 assert.equal(panels.length,42);
 for(const match of panels){
  const [x,y,w,h]=match.slice(1).map(Number);
  assert(x>=0&&y>=145&&x+w<=dims.width&&y+h<=dims.height,JSON.stringify({x,y,w,h}));
 }
 const review=probabilityFigureDiagnostics(check);
 assert(review.tall&&review.terminalPaths===32);
 assert(review.estimatedFontPt<8);
 const scale=probabilityPngScale(dims.width,dims.height);
 assert(scale>0&&scale<=2&&dims.height*scale<=8192.01);
 assert(dims.width*dims.height*scale*scale<=24000001);
});
test("small PNG exports retain double resolution and old projects receive safe presentation defaults",()=>{
 assert.equal(probabilityPngScale(800,450),2);
 assert.equal(probabilityPngScale(0,450),0);
 assert(probabilityPngScale(1700,5200)<2);
 const classic=newProbabilityDraft();
 delete classic.printStyle;delete classic.labelOffsets;delete classic.showPathLegend;
 const normal=normalizeProbabilityDraft(classic);
 assert.equal(normal.treeMode,"standard");
 assert.equal(normal.printStyle,"colour");
 assert.equal(normal.showPathLegend,true);
 const s=prepare();s.draft.printStyle="<script>";
 s.draft.labelOffsets={"00":{x:3,y:-4},"01":{x:10000,y:"bad"},"<script>":{x:1,y:1}};
 const clean=normalizeProbabilityDraft(JSON.parse(JSON.stringify(s.draft)));
 assert.equal(clean.printStyle,"colour");
 assert.deepEqual(clean.labelOffsets["00"],{x:3,y:-4});
 assert.equal(clean.labelOffsets["01"],undefined);
 assert.equal(clean.labelOffsets["<script>"],undefined);
});
test("actual SVG width controls zoom and visual advice remains outside the exported image",()=>{
 const state=createProjectState(),s=state.probabilityStudio;
 assert(chooseProbabilityPreset(s,"three-way"));
 assert(setProbabilityBranch(s,"",0,"label","A longer-than-average application of conditional probability"));
 const svg=renderProbabilitySvg(s.draft),dims=figureSize(svg),preview=probabilityPreviewHtml(s);
 assert(preview.includes("--prob-natural-width:"+dims.width+"px"));
 assert(preview.includes('data-prob-flexible="true"'));
 const html=renderProbabilityStudio(state,icon,escape);
 for(const attr of ['data-action="probability-outcome-move"','data-prob-offset-path="0"',
   'data-prob-field="printStyle"','data-prob-field="showPathLegend"','data-prob-visual-review'])
  assert(html.includes(attr),attr);
 assert(!svg.includes("IA figure readability check"));
});
test("print options and annotations survive JSON backup, stage linking and IA reports",()=>{
 const state=createProjectState();state.route="completing";state.completion.current="C31";
 state.entries=[{id:"pass-four-stage",phase:"first",status:"planned",title:"",result:"",technique:""}];
 state.completion.activeEntryIndex=0;
 const s=state.probabilityStudio;assert(chooseProbabilityPreset(s,"asymmetric"));
 fill(s,"",[".6",".4"]);fill(s,"0",[".2",".3",".5"]);
 assert(setProbabilityField(s,"printStyle","mono"));
 assert(setProbabilityLabelOffset(s,"01","x",-14));
 assert(toggleProbabilityLeaf(s,"eventLeaves","01",true));
 assert(toggleProbabilityLeaf(s,"conditionLeaves","1",true));
 const saved=saveAndLinkProbability(state);assert(saved.ok,saved.error);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 const draft=restored.probabilityStudio.figures[0].draft;
 assert.equal(draft.printStyle,"mono");
 assert.deepEqual(draft.labelOffsets["01"],{x:-14,y:0});
 assert(probabilitySignature(draft).includes("mono"));
 const report=collectProjectFigures(restored).find(f=>f.kind==="probability");
 assert(report&&report.svg.includes('data-prob-legend="event"'));
 assert(report.rows.some(row=>row.label==="IA printing and event legend"));
 assert(report.rows.some(row=>row.label==="Student-adjusted branch labels"));
 assert.equal(saveProbabilityFigure(restored.probabilityStudio).ok,true);
});
