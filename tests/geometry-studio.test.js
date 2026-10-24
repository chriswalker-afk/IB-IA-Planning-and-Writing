import test from "node:test";
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import {newGeometryDraft,newGeometryStudio,geometryAnalysis,normalizeGeometryStudio,saveGeometryFigure} from "../src/diagrams/geometry-core.js";
import {renderGeometrySvg} from "../src/diagrams/geometry-render.js";
import {renderGeometryStudio,geometryQualityHtml,geometryOutputHtml} from "../src/diagrams/geometry-view.js";
import {geometryTemplate,setGeometryVertex,saveAndLinkGeometry,saveGeometryDraft} from "../src/diagrams/geometry-actions.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";
import {renderRepresentationHub,representationAdvice} from "../src/diagrams/representation-hub.js";
import {firstSavedFigures} from "../src/completing/first-figure-gallery.js";
const icon=()=>'<svg aria-hidden="true"></svg>',e=v=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
test("schematic geometry cannot imply measured side lengths or angles",()=>{
 const d=newGeometryDraft();d.showLengths=true;d.showAngles=true;d.vertices[0].edgeLabel="Known length \\(a\\)";
 const analysis=geometryAnalysis(d),svg=renderGeometrySvg(d);
 assert.equal(analysis.ready,true);
 assert.match(svg,/Not to scale/);
 assert.match(svg,/Known length/);
 assert(!svg.includes("≈ 7"),"No inferred lengths in schematic mode");
});
test("coordinate triangle derives lengths, angles, enclosed area and bearings",()=>{
 const d=newGeometryDraft();
 d.mode="coordinate";d.unit="m";d.showLengths=true;d.showAngles=true;
 d.northAligned=true;d.showBearings=true;
 d.vertices=[{id:"v-a",label:"A",x:0,y:0},{id:"v-b",label:"B",x:3,y:0},{id:"v-c",label:"C",x:0,y:4}];
 const q=geometryAnalysis(d);
 assert.equal(q.ready,true);
 assert.equal(q.lengths[0],3);
 assert.equal(q.lengths[1],5);
 assert.equal(q.lengths[2],4);
 assert.equal(Math.abs(q.area),6);
 assert.equal(q.bearings[0],90);
 assert(q.angles.every(x=>x>0&&x<180));
 assert.doesNotMatch(renderGeometrySvg(d),/Coordinate length unit:/);
});
test("reject crossing polygons, missing labels, degenerate edges and unconfirmed bearings",()=>{
 const d=newGeometryDraft("rectangle");
 d.vertices[1].y=4;d.vertices[2].y=0;
 assert(geometryAnalysis(d).issues.some(x=>/crosses/.test(x)));
 const tri=newGeometryDraft();tri.vertices[1].label="A";
 assert(geometryAnalysis(tri).issues.some(x=>/different/.test(x)));
 const coord=newGeometryDraft();coord.mode="coordinate";coord.showBearings=true;
 assert(geometryAnalysis(coord).issues.some(x=>/north/.test(x)));
});
test("saving does not overwrite drafts and figure exports preserve the stage",()=>{
 const s=createProjectState();
 s.route="completing";s.completion.current="C31";
 const original=JSON.stringify(s.graphStudio);
 const first=saveGeometryDraft(s);
 assert(first.ok);assert.equal(s.geometryStudio.figures.length,1);
 assert.equal(JSON.stringify(s.graphStudio),original);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.geometryStudio.figures.length,1);
 assert.equal(restored.geometryStudio.figures[0].id,first.record.id);
});
test("linked geometry is included in saved gallery and full project export",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C31";
 s.entries=[{id:"stage-1",phase:"first",status:"planned",title:"",technique:""}];
 s.completion.activeEntryIndex=0;
 const result=saveAndLinkGeometry(s);
 assert(result.ok,result.error);
 assert.equal(s.entries[0].geometryFigureId,result.record.id);
 assert(firstSavedFigures(s).some(x=>x.kind==="geometry"));
 assert(collectProjectFigures(s).some(x=>x.kind==="geometry"&&x.entryId==="stage-1"));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.entries[0].geometryFigureId,result.record.id);
 assert.equal(restored.geometryStudio.figures[0].entryId,"stage-1");
});
test("geometry is discoverable in the common tool chooser and its editor renders without invented mathematics",()=>{
 const s=createProjectState();s.planning.routeExplorer.selectedRoute="triangulation";
 assert.deepEqual(representationAdvice(s).ids,["geometry","trace"]);
 const chooser=renderRepresentationHub(s,icon,e);
 assert(chooser.includes('data-action="geometry-open"'));
 const html=renderGeometryStudio(s,icon,e);
 assert(html.includes('data-geometry-studio'));
 assert(html.includes('data-action="geometry-save"'));
 assert(html.includes('data-action="geometry-use"'));
 assert(html.includes('data-action="geometry-svg"'));
 assert(html.includes('data-action="geometry-png"'));
 assert(html.includes('data-presentation-coach="geometry"'));
});

test("clearing a coordinate invalidates both the preview and download buttons rather than reusing an old value",()=>{
 const studio=newGeometryStudio();
 assert.equal(setGeometryVertex(studio,0,"x",""),true);
 assert.equal(studio.draft.vertices[0].x,null);
 assert.equal(geometryAnalysis(studio.draft).ready,false);
 assert.match(renderGeometrySvg(studio.draft),/Enter valid coordinates for every vertex/);
 assert.match(geometryOutputHtml(studio,icon),/data-action="geometry-save" disabled/);
 assert.match(geometryOutputHtml(studio,icon),/data-action="geometry-svg" disabled/);
 assert.equal(setGeometryVertex(studio,0,"x","0"),true);
 assert.equal(geometryAnalysis(studio.draft).ready,true);
 assert(!geometryOutputHtml(studio,icon).includes('data-action="geometry-save" disabled'));
});
test("concave and reverse-ordered polygons have correct reflex angles and no phantom self-crossings",()=>{
 const d=newGeometryDraft("polygon");
 d.mode="coordinate";
 d.vertices=[
  {id:"v-a",label:"A",x:0,y:0},
  {id:"v-b",label:"B",x:5,y:0},
  {id:"v-c",label:"C",x:5,y:5},
  {id:"v-d",label:"D",x:2,y:2},
  {id:"v-e",label:"E",x:0,y:5}
 ];
 const q=geometryAnalysis(d);
 assert(q.ready,q.issues.join(" / "));
 assert(q.angles[3]>180,q.angles.join(","));
 assert(Math.abs(q.angles.reduce((s,v)=>s+v,0)-540)<1e-7);
 d.vertices.reverse();
 const reversed=geometryAnalysis(d);
 assert(reversed.ready,reversed.issues.join(" / "));
 assert(reversed.angles.some(v=>v>180));
 assert(Math.abs(reversed.angles.reduce((s,v)=>s+v,0)-540)<1e-7);
});
test("all geometry text labels expose optional shared mathematical notation controls",()=>{
 const state=createProjectState();
 const markup=renderGeometryStudio(state,icon,e);
 for(const key of ["label","edgeLabel","angleLabel"])
  assert(markup.includes('data-notation-key="'+key+'" data-notation-vertex-index="0"'),key);
 assert(markup.includes('data-notation-studio="geometry" data-notation-key="unit"'));
 assert(markup.includes('data-action="geometry-new"'));
});

test("angle arcs, captions and display-only guidance obey IA figure settings",()=>{
 const d=newGeometryDraft("triangle");
 d.mode="coordinate";d.showAngles=true;d.caption="Survey triangle";d.figureNumber="4";
 d.showCaption=true;d.showTitle=false;
 const svg=renderGeometrySvg(d);
 assert.match(svg,/geometry-angle-arc/);
 assert.match(svg,/Figure 4\. Survey triangle/);
 assert.doesNotMatch(svg,/Labelled triangle|Coordinate length unit:|Student-entered side and angle labels/);
 d.vertices[0].rightAngle=true;d.vertices[2].x=0;
 assert.equal(geometryAnalysis(d).ready,true);
 const rightSvg=renderGeometrySvg(d);
 assert.equal((rightSvg.match(/class="geometry-angle-arc"/g)||[]).length,2,"A right-angle square replaces the arc");
 const restored=normalizeGeometryStudio({draft:d,figures:[],open:true});
 assert.equal(restored.draft.caption,"Survey triangle");
 assert.equal(restored.draft.showTitle,false);
});

test("geometry confirmation and warnings stay compact while only the mathematical canvas expands",()=>{
 const studio=newGeometryStudio();
 const glyph=name=>'<svg class="icon" data-glyph="'+name+'" aria-hidden="true"></svg>';
 const ready=geometryQualityHtml(studio,glyph,e);
 assert.match(ready,/class="geometry-quality-status geometry-quality-status--ready"/);
 assert.match(ready,/data-glyph="check"/);
 assert.match(ready,/Shape is valid/);
 assert.doesNotMatch(ready,/check-circle/,"An outlined check is enough for a small status.");

 setGeometryVertex(studio,0,"x","");
 const blocked=geometryQualityHtml(studio,glyph,e);
 assert.match(blocked,/class="geometry-quality-status geometry-quality-status--warning"/);
 assert.match(blocked,/data-glyph="alert-triangle"/);
 assert.match(blocked,/Check before saving/);

 const css=readFileSync(new URL("../data/geometry-studio.css",import.meta.url),"utf8");
 assert.match(css,/\.geometry-main \.geometry-preview > svg\{display:block;width:100%;/);
 assert.match(css,/\.geometry-quality \.geometry-quality-status \.icon\{/);
 assert.match(css,/width:17px;height:17px/);
 assert.doesNotMatch(css,/\.geometry-main svg\s*\{/,
   "SVG layout sizing must never apply to a status or toolbar icon.");
});
