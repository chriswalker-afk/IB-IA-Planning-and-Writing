import test from "node:test";
import assert from "node:assert/strict";
import {
 newGraphDraft,newGraphStudio,normalizeGraphStudio,readPastedGraphData,applyPastedGraphData,
 graphData,analyseGraph,compileGraphFunction,renderGraphSvg,renderGraphResidualSvg,saveGraphFigure
} from "../src/diagrams/graph-core.js";
import {updateGraphField,chooseGraphType,saveAndLinkGraph,saveGraphDraft,loadSavedGraph,freshGraph} from "../src/diagrams/graph-actions.js";
import {renderGraphStudio} from "../src/diagrams/graph-view.js";
import {fitPolynomialLeastSquares,normalizeGraphModels,assessGraphModels,sampleGraphModel,diagnoseGraphModel} from "../src/diagrams/graph-models.js";
import {renderModelComparison,renderResidualOptions,renderResidualPanel,metricText} from "../src/diagrams/graph-diagnostics-view.js";
import {addGraphModel,toggleGraphModel,removeGraphModel,updateGraphModelExpression} from "../src/diagrams/graph-actions.js";
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


test("regression is always opt-in and the default scatter diagram remains untouched",()=>{
 const g=validData(),a=analyseGraph(g.draft),svg=renderGraphSvg(g.draft);
 assert.equal(g.draft.models.length,0);
 assert.equal(a.models.length,0);
 assert(!svg.includes('class="graph-model-overlay"'));
 assert(!svg.includes('Observed points</text>'));
 assert.match(renderGraphStudio({graphStudio:g},icon,escapeHtml),/data-action="graph-model-add"/);
 assert.match(renderGraphStudio({graphStudio:g},icon,escapeHtml),/No models added/);
 assert.equal(a.ready,true);
});
test("linear and quadratic least squares reproduce known coefficients and resist large x offsets",()=>{
 const line=[0,1,2,3,4].map(x=>({x,y:2+3*x}));
 const l=fitPolynomialLeastSquares(line,1);
 assert(l.ok,l.error);
 for(const pt of line)assert(Math.abs(l.predict(pt.x)-pt.y)<1e-10);
 assert(Math.abs(l.coefficients[0]-2)<1e-10);
 assert(Math.abs(l.coefficients[1]-3)<1e-10);
 const poly=[-2,-1,0,1,2,3].map(x=>({x,y:1+2*x+4*x*x}));
 const p=fitPolynomialLeastSquares(poly,2);
 assert(p.ok,p.error);
 for(const pt of poly)assert(Math.abs(p.predict(pt.x)-pt.y)<1e-9);
 assert(Math.abs(p.coefficients[2]-4)<1e-9);
 assert(Math.abs(p.coefficients[1]-2)<1e-9);
 assert(Math.abs(p.coefficients[0]-1)<1e-9);
 const shifted=[0,1,2,3,4].map(x=>({x:x+1000000000,y:4*x*x-3*x+6}));
 const stable=fitPolynomialLeastSquares(shifted,2);
 assert(stable.ok,stable.error);
 for(const pt of shifted)assert(Math.abs(stable.predict(pt.x)-pt.y)<1e-8);
 assert(stable.equation.includes("where t"),"Centered equation should avoid cancellation from giant x");
 assert.equal(fitPolynomialLeastSquares([{x:1,y:1},{x:1,y:3}],1).ok,false);
 assert.equal(fitPolynomialLeastSquares([{x:1,y:1},{x:2,y:4}],2).ok,false);
 assert.equal(fitPolynomialLeastSquares([{x:1,y:1},{x:1,y:4},{x:2,y:5}],2).ok,false);
});
test("linear, quadratic and student-written overlays coexist with independent controls",()=>{
 const g=validData();
 assert(addGraphModel(g,"linear").ok);
 assert(addGraphModel(g,"quadratic").ok);
 const model=addGraphModel(g,"custom");
 assert(model.ok);
 assert.equal(addGraphModel(g,"linear").ok,false);
 assert.equal(addGraphModel(g,"custom").ok,false);
 assert(updateGraphModelExpression(g,model.model.id,"x^2 + 1"));
 const a=analyseGraph(g.draft);
 assert.equal(a.ready,true);
 assert.equal(a.models.length,3);
 assert(a.models.every(m=>m.valid));
 let svg=renderGraphSvg(g.draft);
 assert.equal((svg.match(/class="graph-model-overlay"/g)||[]).length,3);
 assert(svg.includes("Linear regression:"));
 assert(svg.includes("Quadratic regression:"));
 assert(svg.includes("My own equation:"));
 assert(svg.includes("Observed points"));
 assert.equal((svg.match(/<circle cx=/g)||[]).length,5); // four measured points + legend marker
 assert.equal(sampleGraphModel(a.models[0],a.points).length,261);
 assert(Math.max(...sampleGraphModel(a.models[0],a.points).map(p=>p.x))===3);
 assert(toggleGraphModel(g,a.models[1].id));
 svg=renderGraphSvg(g.draft);
 assert.equal((svg.match(/class="graph-model-overlay"/g)||[]).length,2);
 assert(!svg.includes('data-graph-model-plot="'+a.models[1].id+'"'));
 assert.equal(analyseGraph(g.draft).ready,true);
 assert(removeGraphModel(g,a.models[1].id));
 assert.equal(g.draft.models.length,2);
});
test("bad manual equations are never evaluated as code and hidden invalid overlays do not block export",()=>{
 const g=validData(),model=addGraphModel(g,"custom").model;
 assert(updateGraphModelExpression(g,model.id,"window.alert(1)"));
 let a=analyseGraph(g.draft);
 assert.equal(a.ready,false);
 assert(a.problems.some(p=>p.code==="model-"+model.id));
 assert.equal((renderGraphSvg(g.draft).match(/class="graph-model-overlay"/g)||[]).length,0);
 assert(toggleGraphModel(g,model.id));
 a=analyseGraph(g.draft);assert.equal(a.ready,true);
 assert(updateGraphModelExpression(g,model.id,'<script>alert("x")</script>'));
 const html=renderGraphStudio({graphStudio:g},icon,escapeHtml);
 assert(!html.includes('<script>'));
 assert(html.includes("&lt;script&gt;"));
 assert.equal(normalizeGraphModels([{id:"model-1",type:"custom",expression:"x^2",visible:false}])[0].visible,false);
});
test("source changes recompute selected least-squares models while saved figures restore them",()=>{
 const state=createProjectState();state.completion.current="C31";state.graphStudio=validData();
 const g=state.graphStudio;
 assert(addGraphModel(g,"linear").ok);
 let original=analyseGraph(g.draft).models[0].predict(3);
 let linked=saveAndLinkGraph(state);
 assert(linked.ok,linked.error);
 state.entries[0].status="completed";state.entries[0].result="Student original interpretation";
 updateGraphField(g,"raw",dataset.replace("7.2","24.2"));
 assert.equal(analyseGraph(g.draft).ready,false,"Changed unparsed values should never silently refit");
 applyPastedGraphData(g,g.draft.raw);
 let later=analyseGraph(g.draft).models[0].predict(3);
 assert(Math.abs(later-original)>1);
 const saved=saveAndLinkGraph(state);
 assert(saved.ok,saved.error);
 assert(saved.reviewNeeded,"Linked completed mathematics must be flagged for review");
 assert.equal(state.entries[0].result,"Student original interpretation");
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.graphStudio.figures[0].draft.models[0].type,"linear");
 assert.equal(restored.graphStudio.draft.models[0].visible,true);
 assert.equal(loadSavedGraph(restored.graphStudio,saved.record.id),true);
 assert(Math.abs(analyseGraph(restored.graphStudio.draft).models[0].predict(3)-later)<1e-10);
});
test("malformed model imports are constrained and existing function mode still behaves normally",()=>{
 const raw={...validData().draft,models:[
  {id:"model-1",type:"linear",visible:true},{id:"model-1",type:"linear",visible:true},
  {id:"model-2",type:"quadratic",visible:false},
  {id:"wrong-tag",type:"custom",expression:"a".repeat(400)},{id:"hack",type:"dangerous"}]};
 const g=normalizeGraphModels(raw.models);
 assert.equal(g.length,3);
 assert(g[2].expression.length<=180);
 assert.notEqual(g[0].id,g[1].id);
 const func=newGraphDraft();
 Object.assign(func,{kind:"function",expression:"x^2 + 1",title:"Function",
  xLabel:"x",yLabel:"f(x)",xUnitMode:"dimensionless",yUnitMode:"dimensionless",models:raw.models});
 assert.equal(analyseGraph(func).ready,true);
 assert.equal(analyseGraph(func).models.length,0);
 assert(!renderGraphSvg(func).includes('class="graph-model-overlay"'));
});


test("in-sample RMSE, R² and signed residuals use every genuine observation",()=>{
 const data=[{x:0,y:1},{x:1,y:3},{x:2,y:5},{x:3,y:7}];
 const exact=diagnoseGraphModel(data,x=>1+2*x);
 assert.equal(exact.ok,true);
 assert.equal(exact.n,4);assert.equal(exact.rmse,0);assert.equal(exact.r2,1);
 assert.deepEqual(exact.residuals.map(p=>p.residual),[0,0,0,0]);
 const offset=diagnoseGraphModel(data,x=>2+2*x);
 assert.equal(offset.ok,true);
 assert.equal(offset.rmse,1);
 assert.equal(offset.r2,.8);
 assert.deepEqual(offset.residuals.map(p=>p.residual),[-1,-1,-1,-1]);
 assert.equal(offset.residuals[0].predicted,2);
 assert.equal(offset.residuals.at(-1).index,3);
 const awful=diagnoseGraphModel(data,x=>x*0+15);
 assert(awful.r2<0,"R² may be negative for an authored, non-OLS model");
});
test("constant-y data produce undefined R² but a meaningful RMSE",()=>{
 const data=[0,1,2,3].map(x=>({x,y:5}));
 const good=diagnoseGraphModel(data,()=>5);
 assert.equal(good.ok,true);assert.equal(good.rmse,0);assert.equal(good.r2,null);
 assert.match(good.r2Note,/undefined/);
 const bad=diagnoseGraphModel(data,()=>7);
 assert.equal(bad.rmse,2);assert.equal(bad.r2,null);
 assert.equal(metricText(null),"Undefined");
});
test("invalid custom model domains never silently discard observations when comparing",()=>{
 const points=[-1,0,1,2,3].map(x=>({x,y:x*x}));
 const evaluated=assessGraphModels([{id:"model-1",type:"custom",expression:"ln(x)",visible:true}],points,compileGraphFunction)[0];
 assert(evaluated.valid,"Function is graphable on part of the observed x-range");
 assert.equal(evaluated.diagnostics.ok,false);
 assert.equal(evaluated.diagnostics.n,points.length);
 assert.match(evaluated.diagnostics.reason,/every observed x-value/);
 const contrast=diagnoseGraphModel(points,()=>Infinity);
 assert.equal(contrast.ok,false);
 const noPoints=diagnoseGraphModel([],()=>0);
 assert.equal(noPoints.ok,false);
});
test("students must opt in to each residual view and its figure retains the correct axes and zero line",()=>{
 const studio=validData(),d=studio.draft;
 assert(addGraphModel(studio,"linear").ok);
 let a=analyseGraph(d);
 assert(a.models[0].diagnostics.ok);
 assert.equal(renderGraphResidualSvg(d),"","No model selected yet");
 assert.equal(d.showResidualSegments,false);
 assert.equal(d.showResidualPlot,false);
 const modelId=a.models[0].id;
 assert(updateGraphField(studio,"residualModelId",modelId));
 assert.equal(updateGraphField(studio,"residualModelId","model-evil"),false);
 assert(updateGraphField(studio,"showResidualSegments",true));
 assert(updateGraphField(studio,"showResidualPlot",true));
 a=analyseGraph(d);assert.equal(a.ready,true);
 const main=renderGraphSvg(d);
 assert.equal((main.match(/class="graph-residual-segment"/g)||[]).length,4);
 assert.match(main,/Residual distances/);
 const separate=renderGraphResidualSvg(d);
 assert.match(separate,/graph-residual-zero/);
 assert.equal((separate.match(/class="graph-residual-point"/g)||[]).length,4);
 assert.match(separate,/Residual: observed/);
 assert.match(separate,/predicted/);
 assert.match(separate,/Distance \(m\)|Residual: observed/);
 assert.match(renderResidualOptions(d,a,escapeHtml),/data-graph-field="showResidualPlot"/);
 const pane=renderResidualPanel(d,a,icon,escapeHtml);
 assert.match(pane,/data-action="graph-residual-svg"/);
 assert.match(pane,/data-action="graph-residual-png"/);
 assert.match(pane,/Are the residuals scattered around zero/);
 assert(updateGraphField(studio,"showResidualSegments",false));
 assert(!renderGraphSvg(d).includes('class="graph-residual-segment"'));
 assert.equal(renderGraphResidualSvg(d)!=="",true);
 assert(updateGraphField(studio,"showResidualPlot",false));
 assert.equal(renderResidualPanel(d,analyseGraph(d),icon,escapeHtml),"");
});
test("comparison table is factual, same-n, includes student entered models and never ranks a winner",()=>{
 const studio=validData(),d=studio.draft;
 assert(addGraphModel(studio,"linear").ok);
 assert(addGraphModel(studio,"quadratic").ok);
 const custom=addGraphModel(studio,"custom").model;
 assert(updateGraphModelExpression(studio,custom.id,"100"));
 const a=analyseGraph(d),comparison=renderModelComparison(d,a,escapeHtml);
 assert.equal(a.models.length,3);
 assert(a.models.every(m=>m.diagnostics.ok&&m.diagnostics.n===4));
 assert.match(comparison,/RMSE \(m\)/);
 assert.match(comparison,/R²/);
 assert.match(comparison,/same complete observations/);
 assert.match(comparison,/undefined/); // R² explanatory footnote
 assert.match(comparison,/not just the largest R²/);
 assert(!comparison.includes("The best model is"));
 assert(a.models.find(m=>m.type==="custom").diagnostics.r2<0);
 assert(updateGraphField(studio,"modelReflection","I need to consider the shape of the residuals."));
 assert.equal(d.modelReflection,"I need to consider the shape of the residuals.");
});
test("residual selection, narrative and plot toggles survive backup; removed model clears dependent controls",()=>{
 const s=createProjectState();s.completion.current="C31";s.graphStudio=validData();
 const studio=s.graphStudio;
 assert(addGraphModel(studio,"linear").ok);
 const id=studio.draft.models[0].id;
 assert(updateGraphField(studio,"residualModelId",id));
 assert(updateGraphField(studio,"showResidualPlot",true));
 assert(updateGraphField(studio,"showResidualSegments",true));
 assert(updateGraphField(studio,"modelReflection","Observed residuals tend to rise then fall."));
 const link=saveAndLinkGraph(s);assert(link.ok,link.error);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.graphStudio.figures[0].draft.residualModelId,id);
 assert.equal(restored.graphStudio.figures[0].draft.showResidualPlot,true);
 assert.equal(restored.graphStudio.figures[0].draft.showResidualSegments,true);
 assert.equal(restored.graphStudio.figures[0].draft.modelReflection,"Observed residuals tend to rise then fall.");
 assert.equal(renderGraphResidualSvg(restored.graphStudio.figures[0].draft).includes("graph-residual-zero"),true);
 s.entries[0].status="completed";s.entries[0].result="My original genuine interpretation.";
 assert(updateGraphField(s.graphStudio,"showResidualSegments",false));
 assert(saveGraphDraft(s).reviewNeeded);
 assert.equal(s.entries[0].result,"My original genuine interpretation.");
 assert(removeGraphModel(s.graphStudio,id));
 assert.equal(s.graphStudio.draft.residualModelId,"");
 assert.equal(s.graphStudio.draft.showResidualPlot,false);
 assert.equal(s.graphStudio.draft.showResidualSegments,false);
});
test("HTML escapes student reflections and does not claim unsupported fit quality",()=>{
 const studio=validData(),d=studio.draft;assert(addGraphModel(studio,"linear").ok);
 assert(updateGraphField(studio,"modelReflection",'<script>alert("wrong")</script>'));
 const html=renderGraphStudio({graphStudio:studio},icon,escapeHtml);
 assert(!html.includes('<script>'));
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/data-graph-field="modelReflection"/);
 const normalized=normalizeProjectState(JSON.parse(JSON.stringify({
  ...createProjectState(),graphStudio:{open:true,draft:{...d,modelReflection:"x".repeat(1800)}}
 })));
 assert.equal(normalized.graphStudio.draft.modelReflection.length,1200);
});

test("residual diagnostic axes still include every observation when the main plot is cropped",()=>{
 const studio=validData();assert(addGraphModel(studio,"linear").ok);
 const id=studio.draft.models[0].id;
 assert(updateGraphField(studio,"residualModelId",id));
 assert(updateGraphField(studio,"showResidualPlot",true));
 Object.assign(studio.draft,{xMin:"2",xMax:"3"});
 const svg=renderGraphResidualSvg(studio.draft);
 const px=[...svg.matchAll(/class="graph-residual-point" cx="([^"]+)"/g)].map(m=>Number(m[1]));
 assert.equal(px.length,4);
 assert(px.every(x=>x>110&&x<886),px.join(", "));
 const analysis=analyseGraph(studio.draft);
 assert.equal(analysis.selectedResidualModel.diagnostics.n,4);
});
