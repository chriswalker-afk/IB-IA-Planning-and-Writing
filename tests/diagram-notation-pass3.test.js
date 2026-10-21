import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {diagramNotationControls,diagramSafeExcerpt,diagramWrapLines,
 diagramHtmlMath,svgDiagramText} from "../src/diagrams/diagram-notation.js";
import {editNativeHeading,editNativeCell,nativeSnapshot,applyNativeDataset,
 saveNativeDataset} from "../src/diagrams/native-data-core.js";
import {setStatField} from "../src/diagrams/stat-studio-actions.js";
import {renderGraphSvg} from "../src/diagrams/graph-core.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {renderCleanTraceSvg,newImageTraceDraft} from "../src/diagrams/image-tracer-core.js";
import {newVoronoiStudio,importVoronoiSites} from "../src/diagrams/voronoi-core.js";
import {renderVoronoiSvg} from "../src/diagrams/voronoi-render.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";

const escape=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

test("all five generators expose one button/panel accessibility pattern",()=>{
 const choices=[
  {studio:"graph",key:"xUnit"},{studio:"stat",key:"unit"},
  {studio:"trace",key:"xLabel"},{studio:"voronoi",siteIndex:1},
  {studio:"table",index:2,part:"unit"},{studio:"table",key:"title"}
 ];
 for(const choice of choices){
  const html=diagramNotationControls(escape,choice);
  assert.match(html,/<button type="button" class="diagram-notation-toggle"/);
  assert.match(html,/aria-expanded="false"/);
  assert.match(html,/aria-controls="diagram-notation-/);
  assert.match(html,/data-notation-panel id="diagram-notation-[^"]+" hidden/);
  assert.match(html,/data-notation-value-preview hidden/);
  assert.doesNotMatch(html,/<details/);
  assert.match(html,/data-action="diagram-notation-close"/);
 }
 assert.match(diagramNotationControls(escape,{studio:"table",index:2,part:"unit"}),/data-action="table-symbol"/);
 assert.match(diagramNotationControls(escape,{studio:"voronoi",siteIndex:1}),/data-notation-site-index="1"/);
});

test("shortening captions never cuts student mathematics or alters the stored text",()=>{
 const input="Comparing growth at \\(\\frac{dy}{dx}\\) with two observed quantities";
 const before=input;
 const cropped=diagramSafeExcerpt(input,45);
 assert.match(cropped,/\\\(\\frac\{dy\}\{dx\}\\\)/);
 assert(!cropped.includes("\\(\\frac{dy}{"));
 assert.equal(input,before);
 const longExpression="\\(\\frac{1}{\\sqrt{1+x^2}}\\)";
 assert.equal(diagramSafeExcerpt(longExpression+" after",8),longExpression);
 const lines=diagramWrapLines("Here is "+longExpression+" and a comparison",22);
 assert(lines.some(line=>line.includes(longExpression)));
 assert(lines.every(line=>!line.includes("\\(")||line.includes("\\)")));
 const svg=svgDiagramText(cropped,480,50,'font-size="12" text-anchor="middle"',{maxWidth:120});
 assert.match(svg,/diagram-math-typeset/);
 assert.match(svg,/<path/);
 assert(!svg.includes("<script>"));
 assert.match(diagramHtmlMath("<b> \\(\\theta\\)"),/&lt;b&gt;/);
});

test("dataset snapshots retain mathematical headings and unit decisions without touching original readings",()=>{
 const state=createProjectState(),studio=state.graphStudio,d=studio.draft;
 editNativeHeading(studio,"graph",0,"Time (s)");
 editNativeHeading(studio,"graph",1,"Velocity (m s^-2)");
 editNativeCell(studio,"graph",0,0,"01.230");
 editNativeCell(studio,"graph",0,1,"5.000");
 editNativeCell(studio,"graph",1,0,"2.500");
 editNativeCell(studio,"graph",1,1,"7.25");
 d.sourceKind="primary";
 d.xLabel="Elapsed \\(t_i\\)";d.xUnit="\\(\\mathrm{s}\\)";d.xUnitMode="unit";
 d.yLabel="Measured \\(\\bar{v}\\)";d.yUnit="m s^-2";d.yUnitMode="unit";
 const matrix=JSON.stringify(d.matrix),columns=JSON.stringify(d.columns);
 const snapshot=nativeSnapshot(d);
 assert(snapshot.ok);
 assert.equal(snapshot.dataset.presentation[0].label,"Elapsed \\(t_i\\)");
 assert.equal(snapshot.dataset.presentation[1].unit,"m s^-2");
 assert.equal(applyNativeDataset(state.tableStudio,"table",snapshot.dataset).ok,true);
 assert.equal(state.tableStudio.draft.headings[0],"Elapsed \\(t_i\\)");
 assert.equal(state.tableStudio.draft.headings[1],"Measured \\(\\bar{v}\\)");
 assert.equal(state.tableStudio.draft.unitDecisions[0].unit,"\\(\\mathrm{s}\\)");
 assert.equal(state.tableStudio.draft.unitDecisions[1].unit,"m s^-2");
 assert.equal(applyNativeDataset(state.statStudio,"stat",snapshot.dataset).ok,true);
 assert.equal(state.statStudio.draft.variable,"Elapsed \\(t_i\\)");
 assert.equal(state.statStudio.draft.unit,"\\(\\mathrm{s}\\)");
 assert.equal(saveNativeDataset(state,"graph","Measurements").ok,true);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.dataShelf[0].presentation[1].label,"Measured \\(\\bar{v}\\)");
 assert.equal(applyNativeDataset(restored.graphStudio,"graph",restored.dataShelf[0]).ok,true);
 assert.equal(restored.graphStudio.draft.yLabel,"Measured \\(\\bar{v}\\)");
 assert.equal(restored.graphStudio.draft.yUnit,"m s^-2");
 assert.equal(JSON.stringify(d.matrix),matrix);
 assert.equal(JSON.stringify(d.columns),columns);
 assert.equal(restored.tableStudio.draft.matrix[0][0],"01.230");
});

test("dimensionless labels and older snapshots remain backward compatible",()=>{
 const state=createProjectState();
 editNativeHeading(state.tableStudio,"table",0,"f(x)");
 editNativeHeading(state.tableStudio,"table",1,"Speed (m/s)");
 editNativeCell(state.tableStudio,"table",0,0,"Trial A");
 editNativeCell(state.tableStudio,"table",0,1,"2.00");
 state.tableStudio.draft.headings[0]="f(x)";
 state.tableStudio.draft.unitDecisions[0]={mode:"dimensionless",unit:""};
 const snapshot=nativeSnapshot(state.tableStudio.draft);
 assert.equal(snapshot.dataset.presentation[0].label,"f(x)");
 assert.equal(snapshot.dataset.presentation[0].mode,"dimensionless");
 assert.equal(applyNativeDataset(state.graphStudio,"graph",snapshot.dataset).ok,true);
 assert.equal(state.graphStudio.draft.xLabel,"f(x)");
 assert.equal(state.graphStudio.draft.xUnitMode,"dimensionless");
 const old={...snapshot.dataset};
 delete old.presentation;
 assert.equal(applyNativeDataset(state.graphStudio,"graph",old).ok,true);
 assert.equal(state.graphStudio.draft.xLabel,"f(x)");
 assert.equal(state.graphStudio.draft.yUnit,"m/s");
});

test("statistical heading inference treats f(x) as a variable, not measurement x units",()=>{
 const state=createProjectState(),s=state.statStudio;
 s.draft.columns=["f(x)","Time (s)"];
 s.draft.matrix=[["1","3"],["2","6"]];
 assert.equal(setStatField(s,"singleIndex","0"),true);
 assert.equal(s.draft.variable,"f(x)");
 assert.equal(setStatField(s,"singleIndex","1"),true);
 assert.equal(s.draft.variable,"Time");
 assert.equal(s.draft.unit,"s");
});

test("SVGs and full-project figures keep inline mathematical paths without external image fonts",()=>{
 const state=createProjectState(),g=state.graphStudio.draft;
 g.kind="function";g.expression="x^2";g.title="Growth \\(x^2\\)";g.xLabel="Time";
 g.yLabel="Speed \\(v_t\\)";g.sourceKind="theoretical";
 const graphSvg=renderGraphSvg(g);
 assert(graphSvg.includes("diagram-math-typeset"));
 const d=state.statStudio.draft;
 Object.assign(d,{kind:"histogram",title:"Spread \\(\\sigma\\)",variable:"Distance \\(x_i\\)",
  unitMode:"unit",unit:"cm",sourceKind:"primary",histogramInput:"table",
  columns:["Lower","Upper","Frequency"],matrix:[["0","5","3"],["5","10","4"]],
  caption:"Mean \\(\\bar{x}\\)"});
 const statSvg=renderStatSvg(d);
 assert(statSvg.includes("diagram-math-typeset"));
 assert(statSvg.includes("cm⁻¹"));
 const traced=newImageTraceDraft();
 traced.title="Trajectory \\(\\sqrt{t}\\)";traced.caption="Gradient \\(\\frac{dy}{dx}\\)";
 const traceSvg=renderCleanTraceSvg(traced);
 assert(traceSvg.includes("diagram-math-typeset"));
 const v=newVoronoiStudio();
 importVoronoiSites(v,"Site\tx (km)\ty (km)\nA\t0\t0\nB\t10\t0");
 Object.assign(v.draft,{title:"Region \\(\\alpha\\)",note:"Boundary \\(\\theta\\)",
  regionMode:"manual",xMin:"0",xMax:"10",yMin:"0",yMax:"10",
  metricConfirmed:true,coordSystem:"cartesian",sourceKind:"primary"});
 const vorSvg=renderVoronoiSvg(v.draft);
 assert(vorSvg.includes("diagram-math-typeset"));
 assert(vorSvg.includes('height="774" fill="#fff"'));
 state.graphStudio.draft=g;
 state.statStudio.draft=d;
 state.voronoiStudio.draft=v.draft;
 const report=collectProjectFigures(state);
 for(const kind of ["graph","stat","voronoi"]){
  const figure=report.find(x=>x.kind===kind);
  assert(figure,kind);
  assert(figure.svg.includes("diagram-math-typeset"),kind);
  assert(figure.svg.includes("<path"),kind);
 }
});
