import test from "node:test";
import assert from "node:assert/strict";
import {
 newGraphDraft,newGraphStudio,normalizeGraphStudio,readPastedGraphData,applyPastedGraphData,
 graphData,analyseGraph,compileGraphFunction,renderGraphSvg,saveGraphFigure
} from "../src/diagrams/graph-core.js";
import {updateGraphField,chooseGraphType,saveAndLinkGraph,saveGraphDraft,loadSavedGraph,freshGraph} from "../src/diagrams/graph-actions.js";
import {renderGraphStudio} from "../src/diagrams/graph-view.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";

const dataset="Time (s)\tDistance (m)\tUnused\n0\t0\tA\n1\t2.1\tB\n2\t4.5\tC\n3\t7.2\tD";
function validData(){
 const g=newGraphStudio();
 applyPastedGraphData(g,dataset);
 Object.assign(g.draft,{title:"Observed distance against elapsed time",sourceKind:"primary"});
 return g;
}
test("pastes Google Sheets multi-column TSV, preserves source and extracts labels and units",()=>{
 const g=validData(),d=g.draft;
 assert.deepEqual(d.columns,["Time (s)","Distance (m)","Unused"]);
 assert.equal(d.matrix.length,4);
 assert.equal(d.xLabel,"Time");assert.equal(d.xUnit,"s");
 assert.equal(d.yLabel,"Distance");assert.equal(d.yUnit,"m");
 assert.equal(d.xUnitMode,"unit");assert.equal(d.yUnitMode,"unit");
 assert.equal(graphData(d).points.length,4);
 assert.equal(analyseGraph(d).ready,true);
 assert.match(renderGraphSvg(d),/Elapsed time|Time \(s\)/);
 assert.match(renderGraphSvg(d),/Distance \(m\)/);
});
test("accepts quoted CSV fields and numbers without headings, rejecting malformed rows",()=>{
 const csv='Elapsed time (s),"distance, measured (m)"\n0,0.2\n1,2.3\n2,3.0';
 const parsed=readPastedGraphData(csv);
 assert.equal(parsed.columns[1],"distance, measured (m)");
 assert.equal(parsed.matrix.length,3);
 const plain=readPastedGraphData("1,2\n3,4\n5,6");
 assert.deepEqual(plain.columns,["Column 1","Column 2"]);
 assert.deepEqual(plain.matrix[0],["1","2"]);
 const g=newGraphStudio();applyPastedGraphData(g,"x\ty\n0\t1\nbad\t2\n3\t4");
 assert.equal(graphData(g.draft).skipped,1);
 assert.match(analyseGraph(g.draft).warnings.map(x=>x.message).join(" " ),/not plotted/);
 assert.throws(()=>readPastedGraphData('x,y\n"unfinished,1'),/unfinished/);
});
test("does not silently treat changed unimported table values as plotted results",()=>{
 const g=validData();
 assert.equal(analyseGraph(g.draft).ready,true);
 assert.equal(updateGraphField(g,"raw",dataset.replace("7.2","72")) ,true);
 assert.equal(analyseGraph(g.draft).ready,false);
 assert.match(analyseGraph(g.draft).problems.map(x=>x.message).join(" " ),/pasted values changed/i);
 applyPastedGraphData(g,g.draft.raw);
 assert.equal(analyseGraph(g.draft).ready,true);
 assert.equal(graphData(g.draft).points.at(-1).y,72);
});
test("function graph uses a safe parser with usual precedence, domain handling and radians",()=>{
 assert.equal(compileGraphFunction("y = x^2 - 3*x + 2")(3),2);
 assert.equal(compileGraphFunction("-x^2")(3),-9);
 assert.equal(compileGraphFunction("2^3^2")(3),512);
 assert.ok(Math.abs(compileGraphFunction("sin(pi/2)")(0)-1)<1e-10);
 assert.equal(compileGraphFunction("sqrt(x)")(9),3);
 for(const bad of ["globalThis","Math.random()","x;alert(1)","2x","new Function(x)","window","x**2"])
  assert.throws(()=>compileGraphFunction(bad),undefined,bad);
 const g=newGraphDraft();
 Object.assign(g,{kind:"function",expression:"1/x",title:"Reciprocal function",
  xLabel:"x",yLabel:"f(x)",xUnitMode:"dimensionless",yUnitMode:"dimensionless"});
 const assessment=analyseGraph(g);
 assert.equal(assessment.ready,true);
 assert.ok(assessment.points.length>100);
 assert.match(renderGraphSvg(g),/ia-plot-clip/);
});
test("enforces titles, named axes, units, valid scales and published-source acknowledgement",()=>{
 const g=validData();
 for(const [key,value,code] of [
  ["title","","title"],["xLabel","","xlabel"],["yLabel","","ylabel"],
  ["xUnitMode","unsure","xunit-status"],["yUnitMode","unit","yunit"],
  ["xMin","10","x-range"],["sourceKind","unsure","source-kind"],
  ["sourceKind","secondary","source"]]){
  const current={...g.draft,[key]:value};
  if(key==="yUnitMode")current.yUnit="";
  assert.ok(analyseGraph(current).problems.some(x=>x.code===code),key);
 }
 assert.equal(analyseGraph({...g.draft,sourceKind:"secondary",sourceText:"Publisher, 2026"}).ready,true);
 assert.ok(analyseGraph({...g.draft,xMin:"10",xMax:"0"}).problems.some(x=>x.code==="x-range"));
 assert.ok(analyseGraph({...g.draft,xMin:"20",xMax:"30",yMin:"20",yMax:"40"}).warnings.some(x=>x.code==="empty-viewport"));
 assert.ok(analyseGraph({...g.draft,showPoints:false}).problems.some(x=>x.code==="scatter-hidden"));
});
test("rendered graphs escape source, title, units and expression content",()=>{
 const d=validData().draft;
 d.title='<svg onload="alert(1)">';d.xLabel='<img src=x onerror=alert(1)>';
 d.sourceKind="secondary";d.sourceText='<script>alert(1)</script>';
 const svg=renderGraphSvg(d);
 assert.ok(!svg.includes('<script>')&&!svg.includes('<img src=x'));
 assert.ok(svg.includes('&lt;script&gt;'));
 assert.ok(svg.includes('&lt;svg'));
 const html=renderGraphStudio({graphStudio:{...newGraphStudio(),draft:d}},icon,escapeHtml);
 assert.ok(!html.includes('<script>'));
 assert.ok(html.includes('data-action="graph-parse"'));
 assert.ok(html.includes('data-action="graph-use"'));
});
test("plots scatter dots without invented regression; time plot connects chronological observations",()=>{
 const d=validData().draft;
 let svg=renderGraphSvg(d);
 assert.ok(svg.includes('<circle'));
 assert.ok(!svg.includes('fill="none" stroke="#137d75"'));
 assert.equal(analyseGraph(d).ready,true);
 const t={...d,kind:"time"};
 svg=renderGraphSvg(t);
 assert.ok(svg.includes('stroke="#137d75"'));
});
test("saving a figure cannot mark mathematics completed and survives JSON backup",()=>{
 const s=createProjectState();s.completion.current="C31";s.graphStudio=validData();
 const result=saveAndLinkGraph(s);
 assert.equal(result.ok,true);
 assert.equal(s.entries.length,1);
 assert.equal(s.entries[0].status,"planned");
 assert.equal(s.entries[0].result,"");
 assert.equal(s.entries[0].graphFigureId,result.record.id);
 assert.equal(s.graphStudio.figures.length,1);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.entries[0].graphFigureId,result.record.id);
 assert.equal(restored.graphStudio.figures[0].draft.matrix.length,4);
 assert.equal(loadSavedGraph(restored.graphStudio,result.record.id),true);
 freshGraph(restored.graphStudio);
 assert.equal(restored.graphStudio.figures.length,1);
 assert.equal(restored.graphStudio.activeId,"");
});
test("graph changes flag dependent completed mathematics for review",()=>{
 const s=createProjectState();s.completion.current="C31";s.graphStudio=validData();
 const linked=saveAndLinkGraph(s);assert.equal(linked.ok,true);
 const entry=s.entries[0];entry.status="completed";entry.result="A positive trend is visible.";
 updateGraphField(s.graphStudio,"raw",dataset.replace("7.2","72"));
 applyPastedGraphData(s.graphStudio,s.graphStudio.draft.raw);
 const revised=saveAndLinkGraph(s);
 assert.equal(revised.ok,true);
 assert.equal(revised.reviewNeeded,true);
 assert.equal(s.entries.length,1);
 assert.equal(entry.result,"A positive trend is visible.");
 assert.equal(entry.reviewNeeded,"yes");
});
test("invalid graph cannot secretly create a mathematical record",()=>{
 const state=createProjectState();
 const before=JSON.stringify(state.entries);
 const result=saveAndLinkGraph(state);
 assert.equal(result.ok,false);
 assert.equal(JSON.stringify(state.entries),before);
});

test("saving a changed linked graph flags existing completed mathematics, without deleting its result",()=>{
 const s=createProjectState();s.completion.current="C31";s.graphStudio=validData();
 const saved=saveAndLinkGraph(s);assert.equal(saved.ok,true);
 s.entries[0].status="completed";s.entries[0].result="The data suggest an increasing trend.";
 updateGraphField(s.graphStudio,"raw",dataset.replace("4.5","45"));
 applyPastedGraphData(s.graphStudio,s.graphStudio.draft.raw);
 const changed=saveGraphDraft(s);
 assert.equal(changed.ok,true);assert.equal(changed.reviewNeeded,true);
 assert.equal(s.entries[0].reviewNeeded,"yes");
 assert.equal(s.entries[0].result,"The data suggest an increasing trend.");
 assert.equal(s.completion.stages.C30,"needs-review");
});

test("graph generated during a later stage stays linked to that stage, not first mathematics",()=>{
 const project=createProjectState();
 project.entries=[
  {id:"math-first",phase:"first",status:"completed",title:"First exploration",technique:"",result:"A real finding from stage 1"},
  {id:"math-second",phase:"substantial",status:"planned",fromEntryId:"math-first",
   title:"Mathematical stage 2",technique:"",kind:"",methodId:"",result:""}
 ];
 project.completion.activeEntryIndex=1;
 project.graphStudio=validData();
 const linked=saveAndLinkGraph(project);
 assert.equal(linked.ok,true,linked.error||"Figure should pass its established checks");
 assert.equal(project.entries.length,2,"No additional first-stage record was created");
 assert.equal(project.graphStudio.figures.at(-1).entryId,"math-second");
 assert.equal(project.entries[1].graphFigureId,linked.record.id);
 assert.equal(project.entries[1].status,"planned","Saving a figure is not performing all the mathematical work");
 assert.equal(project.entries[0].result,"A real finding from stage 1");
});
