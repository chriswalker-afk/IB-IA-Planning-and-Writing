import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {diagramUnitPower,diagramNotationControls,formatDiagramShorthand} from "../src/diagrams/diagram-notation.js";
import {newStatStudio,importStatTable,statAnalysis} from "../src/diagrams/stat-studio-core.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {renderStatStudio} from "../src/diagrams/stat-studio-view.js";
import {statSummaryCSV} from "../src/diagrams/stat-studio-export.js";
import {newImageTracer,renderCleanTraceSvg,renderTraceOverlaySvg,renderPrintableTraceSvg,imageTraceChecks} from "../src/diagrams/image-tracer-core.js";
import {renderImageTracer,traceCoordinatesTable} from "../src/diagrams/image-tracer-view.js";
import {traceCSV} from "../src/diagrams/image-tracer-export.js";
import {newVoronoiStudio,importVoronoiSites,analyzeVoronoi} from "../src/diagrams/voronoi-core.js";
import {renderVoronoiSvg} from "../src/diagrams/voronoi-render.js";
import {renderVoronoiStudio,voronoiInspectionHtml,voronoiResultHtml} from "../src/diagrams/voronoi-view.js";
import {voronoiCSV} from "../src/diagrams/voronoi-export.js";

function histogram(){
 const studio=newStatStudio(),d=studio.draft;
 Object.assign(d,{title:"Distribution \\(\\bar{x}\\)",kind:"histogram",
  variable:"Distance \\(x_i\\)",binWidth:"5",binStart:"0",sourceKind:"primary"});
 importStatTable(studio,"Distance (cm)\n0\n3\n4\n5\n9\n10");
 d.title="Distribution \\(\\bar{x}\\)";
 d.variable="Distance \\(x_i\\)";
 return studio;
}
function tracer(){
 const studio=newImageTracer(),d=studio.draft;
 Object.assign(d,{title:"Shape of \\(\\sqrt{x}\\)",xLabel:"Horizontal \\(x_1\\)",
  yLabel:"Height \\(h(t)\\)",unit:"m s^-1",caption:"Slope \\(\\frac{dy}{dx}\\)",
  imageSrc:"data:image/png;base64,aGVsbG8=",width:500,height:300,
  sourceKind:"primary",origin:{x:100,y:120},direction:{x:190,y:120},
  refA:{x:100,y:200},refB:{x:300,y:200},knownLength:"10",
  precision:"2",perspective:"front-on",
  points:[{x:140,y:70},{x:240,y:50},{x:310,y:110}]});
 return studio;
}
function voronoi(){
 const studio=newVoronoiStudio(),d=studio.draft;
 importVoronoiSites(studio,"Site\tx (km)\ty (km)\nA\t0\t0\nB\t10\t0\nC\t5\t10");
 Object.assign(d,{title:"Zones \\(\\alpha\\)",xLabel:"Distance \\(x_i\\)",
  note:"Boundary \\(\\theta\\)",sourceKind:"primary",
  coordSystem:"cartesian",metricConfirmed:true,regionMode:"manual",
  xMin:"0",xMax:"10",yMin:"0",yMax:"10",showAreas:true});
 d.sites[0].name="Site \\(\\mu\\)";
 return studio;
}
test("whole-unit powers are correct for simple, powered, compound and TeX units",()=>{
 assert.equal(diagramUnitPower("cm",-1),"cm^-1");
 assert.equal(diagramUnitPower("cm^2",-1),"cm^-2");
 assert.equal(diagramUnitPower("km",2),"km^2");
 assert.equal(diagramUnitPower("m/s",2),"(m/s)^2");
 assert.equal(formatDiagramShorthand(diagramUnitPower("m s^-1",2)),"(m s⁻¹)²");
 assert.equal(diagramUnitPower("\\(\\frac{m}{s}\\)",-1),"\\((\\frac{m}{s})^{-1}\\)");
});
test("Pass 2 exposes the same editor for annotation fields, not measured numbers",()=>{
 const state=createProjectState();
 state.statStudio=histogram();state.imageTracer=tracer();state.voronoiStudio=voronoi();
 const stat=renderStatStudio(state,icon,escapeHtml);
 const trace=renderImageTracer(state,icon,escapeHtml);
 const vor=renderVoronoiStudio(state,icon,escapeHtml);
 for(const key of ["title","variable","unit","caption"])
  assert(stat.includes('data-notation-studio="stat" data-notation-key="'+key+'"'),key);
 for(const key of ["title","xLabel","yLabel","unit","caption"])
  assert(trace.includes('data-notation-studio="trace" data-notation-key="'+key+'"'),key);
 for(const key of ["title","xLabel","yLabel","unit","note","addName"])
  assert(vor.includes('data-notation-studio="voronoi" data-notation-key="'+key+'"'),key);
 assert(vor.includes('data-notation-site-index="0"'));
 for(const studio of ["stat","trace","voronoi"]){
  assert.match(diagramNotationControls(escapeHtml,{studio,key:"unit"}),/data-action="diagram-notation-insert"/);
 }
 assert(!trace.includes('data-notation-key="knownLength"'));
 assert(!stat.includes('data-notation-key="binWidth"'));
 assert(!vor.includes('data-notation-key="xMin"'));
});
test("statistics render inline maths and reciprocal histogram units while source data remain exact",()=>{
 const studio=histogram(),d=studio.draft;
 assert.equal(statAnalysis(d).ready,true,JSON.stringify(statAnalysis(d).problems));
 const original=JSON.stringify(d.matrix),freq=statAnalysis(d).result.bins.map(b=>b.frequency);
 const svg=renderStatSvg(d),csv=statSummaryCSV(d);
 assert(svg.includes("diagram-math-typeset"));
 assert(svg.includes("Frequency density (cm⁻¹)"));
 assert(svg.includes("<path"));
 assert(csv.includes("Frequency density (cm^-1)"));
 assert.deepEqual(statAnalysis(d).result.bins.map(b=>b.frequency),freq);
 assert.equal(JSON.stringify(d.matrix),original);
});
test("tracer photo and mathematical SVGs render labels and optional caption; CSV remains raw",()=>{
 const studio=tracer(),d=studio.draft;
 assert.equal(imageTraceChecks(d).ready,true);
 const clean=renderCleanTraceSvg(d),photo=renderTraceOverlaySvg(d),print=renderPrintableTraceSvg(d,"photo");
 for(const svg of [clean,photo,print]){
  assert(svg.includes("diagram-math-typeset"));
  assert(!svg.includes("<script>"));
 }
 assert(clean.includes("Slope "));
 assert(print.includes("Slope "));
 const csv=traceCSV(d);
 assert(csv.includes("Horizontal \\(x_1\\)"));
 assert(csv.includes("m s^-1"));
 assert.equal(d.knownLength,"10");
 const table=traceCoordinatesTable(studio,escapeHtml,icon);
 assert(table.includes("diagram-inline-math"));
});
test("Voronoi SVG, results and CSV preserve mathematical site names, squared units and caption",()=>{
 const studio=voronoi(),d=studio.draft;
 const result=analyzeVoronoi(d);
 assert.equal(result.ready,true,JSON.stringify(result.errors));
 const coords=d.sites.map(s=>[s.x,s.y]),svg=renderVoronoiSvg(d);
 assert(svg.includes("diagram-math-typeset"));
 assert(svg.includes("km²"));
 assert(svg.includes("Boundary "));
 assert(svg.includes('height="774"'));
 assert.match(voronoiResultHtml(studio,escapeHtml),/km²/);
 assert.match(voronoiResultHtml(studio,escapeHtml),/diagram-inline-math/);
 assert(voronoiCSV(d).includes("Clipped cell area (km^2)"));
 assert.deepEqual(d.sites.map(s=>[s.x,s.y]),coords);
 assert.doesNotThrow(()=>normalizeProjectState({...createProjectState(),voronoiStudio:studio}));
 d.unit="m s^-1";
 const compound=renderVoronoiSvg(d);
 assert(compound.includes("(m s⁻¹)²"));
 assert(voronoiCSV(d).includes("Clipped cell area ((m s^-1)^2)"));
});
