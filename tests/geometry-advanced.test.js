import test from "node:test";
import assert from "node:assert/strict";
import {newGeometryDraft,geometryAnalysis,normalizeGeometryDraft,geometrySignature} from "../src/diagrams/geometry-core.js";
import {orthogonalDecomposition,geometrySensitivity,snapGeometryEdge,snapGeometryRightAngle,moveGeometryVertex,geometryFromTrace} from "../src/diagrams/geometry-advanced.js";
import {setGeometryField,setGeometryVertex,importGeometryFromTrace,saveAndLinkGeometry} from "../src/diagrams/geometry-actions.js";
import {renderGeometrySvg} from "../src/diagrams/geometry-render.js";
import {renderGeometryStudio,geometryQualityHtml,geometryImportHtml} from "../src/diagrams/geometry-view.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newImageTraceDraft,traceCoordinates} from "../src/diagrams/image-tracer-core.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const icon=()=>'\u25b9';
function calibratedTrace(){
 const d=newImageTraceDraft();
 Object.assign(d,{
  imageSrc:"data:image/png;base64,AA==",width:200,height:200,
  imageName:"tiling.png",title:"Photographed rectangular tile",
  sourceKind:"secondary",sourceCredit:"Original tile photograph, school lab",
  xLabel:"x",yLabel:"y",unit:"cm",knownLength:"10",precision:"2",perspective:"front-on",
  origin:{x:20,y:170},direction:{x:120,y:170},refA:{x:20,y:170},refB:{x:120,y:170},
  closeShape:true,limitations:"Photograph taken perpendicular to the tile face.",
  points:[{x:20,y:170},{x:100,y:170},{x:100,y:120},{x:20,y:120}]
 });
 return d;
}
test("L and T composite presets decompose into exact rectangular areas",()=>{
 for(const kind of ["l-shape","t-shape"]){
  const d=newGeometryDraft(kind);
  d.mode="coordinate";d.showDecomposition=true;
  const a=geometryAnalysis(d),split=orthogonalDecomposition(d);
  assert.equal(a.ready,true,kind+" "+a.issues);
  assert.equal(split.ok,true,kind+" "+split.reason);
  assert.equal(Math.abs(a.area),36);
  assert.equal(split.area,36);
  assert(split.rectangles.length>=2);
  assert(split.rectangles.every(r=>r.width>0&&r.height>0&&r.area>0));
  const svg=renderGeometrySvg(d);
  assert(svg.includes("stroke-dasharray"),"Rectangular partitions must appear in exported SVG");
  assert(svg.includes("R1:"));
 }
});
test("a diagonal construction never claims rectangular decomposition",()=>{
 const d=newGeometryDraft("triangle");d.mode="coordinate";d.showDecomposition=true;
 const result=orthogonalDecomposition(d);
 assert.equal(result.ok,false);
 assert.match(result.reason,/horizontal and vertical|at least four/);
 assert(geometryQualityHtml({draft:d},icon,esc).includes("decomposition"));
});
test("horizontal and vertical constraints detect violations and can be snapped deliberately",()=>{
 const state=createProjectState(),studio=state.geometryStudio;
 studio.draft.mode="coordinate";
 studio.draft.vertices[0].edgeConstraint="horizontal";
 setGeometryVertex(studio,1,"y",1);
 assert(geometryAnalysis(studio.draft).issues.some(x=>/marked horizontal/.test(x)));
 assert(snapGeometryEdge(studio,0).ok);
 assert.equal(studio.draft.vertices[1].y,studio.draft.vertices[0].y);
 assert.equal(geometryAnalysis(studio.draft).ready,true);
 studio.draft.vertices[1].locked=true;
 setGeometryVertex(studio,1,"x",19);
 assert.notEqual(studio.draft.vertices[1].x,19);
 assert.equal(moveGeometryVertex(studio,1,19,19),false);
 assert.equal(snapGeometryEdge(studio,0).ok,false);
});
test("right-angle constraints check the internal angle and construct a perpendicular side",()=>{
 const studio=createProjectState().geometryStudio;
 studio.draft.mode="coordinate";
 studio.draft.vertices[0].rightAngle=true;
 assert(geometryAnalysis(studio.draft).issues.some(x=>/not perpendicular/.test(x)));
 const applied=snapGeometryRightAngle(studio,0);
 assert.equal(applied.ok,true,applied.error);
 const a=geometryAnalysis(studio.draft);
 assert.equal(a.ready,true,a.issues.join(", "));
 assert(Math.abs(a.angles[0]-90)<0.05);
 assert(renderGeometrySvg(studio.draft).includes('stroke="#89602a"'));
});
test("locked vertices are not changed by typed values or pointer edits",()=>{
 const studio=createProjectState().geometryStudio;
 const was=studio.draft.vertices[0].x;
 assert(setGeometryVertex(studio,0,"locked",true));
 assert.equal(moveGeometryVertex(studio,0,5,4),false);
 assert.equal(setGeometryVertex(studio,0,"x","8"),false);
 assert.equal(studio.draft.vertices[0].x,was);
 const html=renderGeometryStudio({geometryStudio:studio,imageTracer:{draft:{},figures:[]}},icon,esc);
 assert(html.includes('data-geometry-vertex-key="locked"'));
 assert(html.includes('data-action="geometry-align-edge"'));
});
test("one-coordinate-at-a-time sensitivity never claims a confidence or worst-case interval",()=>{
 const d=newGeometryDraft("rectangle");
 d.mode="coordinate";d.showSensitivity=true;d.sensitivityStep="0.1";
 const a=geometrySensitivity(d);
 assert(a.ok,a.reason);
 assert.equal(a.samples,16);
 assert(a.maxAreaChange>0&&a.maxPerimeterChange>0);
 assert.match(a.explanation,/not a worst-case bound/);
 assert.equal(geometryAnalysis(d).ready,true);
 assert.match(geometryQualityHtml({draft:d},icon,esc),/Local coordinate sensitivity/);
 const changed=normalizeGeometryDraft(d);
 changed.sensitivityStep="0.2";
 assert.notEqual(geometrySignature(d),geometrySignature(changed));
});
test("one-way Image Tracer transfer keeps calibrated coordinates and original provenance",()=>{
 const source=calibratedTrace();
 const coords=traceCoordinates(source).map(p=>p.coordinate);
 const imported=geometryFromTrace(source,{traceFigureId:"trace-original"});
 assert(imported.ok,imported.error);
 assert.equal(imported.points,4);
 assert.equal(imported.draft.mode,"coordinate");
 assert.equal(imported.draft.unit,"cm");
 assert.equal(imported.draft.sourceKind,"secondary");
 assert.equal(imported.draft.sourceCredit,source.sourceCredit);
 assert.equal(imported.draft.provenance.traceFigureId,"trace-original");
 assert.equal(imported.draft.provenance.pixelPoints.length,4);
 assert.deepEqual(imported.draft.vertices.map(v=>[v.x,v.y]),coords.map(p=>[p.x,p.y]));
 assert(!JSON.stringify(imported.draft).includes("data:image"),"A full photo must never be silently duplicated");
 const normalized=normalizeGeometryDraft(JSON.parse(JSON.stringify(imported.draft)));
 assert.equal(normalized.provenance.referencePixels,100);
 assert.equal(normalized.provenance.limitations,source.limitations);
});
test("transfer refuses uncertain perspective, nonclosed outlines, and more than eight points",()=>{
 const source=calibratedTrace();
 source.perspective="oblique";
 assert.match(geometryFromTrace(source).error,/front-on/);
 source.perspective="front-on";source.closeShape=false;
 assert.match(geometryFromTrace(source).error,/closed/);
 source.closeShape=true;source.points=Array.from({length:9},(_,i)=>({x:20+i*8,y:120+i%2*8}));
 assert.match(geometryFromTrace(source).error,/3–8/);
});
test("import creates a separate unsaved geometry draft, without touching the original tracing or IA entries",()=>{
 const state=createProjectState();
 const trace=calibratedTrace();
 state.imageTracer.draft=trace;
 const before=JSON.stringify(state.imageTracer);
 state.geometryStudio.draft.title="Previous unsaved sketch";
 state.geometryStudio.draft.edited=true;
 state.entries=[{id:"actual-stage",phase:"first",status:"planned",result:""}];
 const result=importGeometryFromTrace(state);
 assert(result.ok,result.error);
 assert.equal(state.geometryStudio.activeId,"");
 assert(state.geometryStudio.draft.provenance.kind,"image-tracer");
 assert.equal(JSON.stringify(state.imageTracer),before);
 assert.equal(state.entries[0].result,"");
 assert.equal(state.geometryStudio.draft.vertices.length,4);
 const html=geometryImportHtml(state,icon,esc);
 assert(html.includes('data-action="geometry-import-trace"'));
});
test("linked advanced geometry retains the calibration and sensitivity notes in full project export",()=>{
 const state=createProjectState();
 state.route="completing";state.completion.current="C31";
 state.entries=[{id:"geometry-stage",phase:"first",status:"planned",title:"",technique:"",result:""}];
 state.completion.activeEntryIndex=0;
 state.imageTracer.draft=calibratedTrace();
 assert(importGeometryFromTrace(state).ok);
 setGeometryField(state.geometryStudio,"showSensitivity",true);
 setGeometryField(state.geometryStudio,"sensitivityStep","0.1");
 const linked=saveAndLinkGeometry(state);
 assert(linked.ok,linked.error);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.entries[0].geometryFigureId,linked.record.id);
 const figure=collectProjectFigures(restored).find(f=>f.kind==="geometry");
 assert(figure);
 assert(figure.rows.some(r=>JSON.stringify(r).includes("Image Tracer provenance")));
 assert(figure.rows.some(r=>JSON.stringify(r).includes("Local sensitivity")));
 assert(figure.rows.some(r=>JSON.stringify(r).includes("Original tile photograph")));
});
