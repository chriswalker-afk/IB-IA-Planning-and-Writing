import test from "node:test";
import assert from "node:assert/strict";
import {
 newImageTracer,newImageTraceDraft,normalizeTraceDraft,normalizeImageTracer,
 traceCalibration,photoToCoordinates,coordinatesToPhoto,traceCoordinates,
 addPhotoPoint,undoTrace,removeTracePoint,renderTraceOverlaySvg,renderCleanTraceSvg,
 renderPrintableTraceSvg,imageTraceChecks,tracedMeasurements,saveTraceFigure
} from "../src/diagrams/image-tracer-core.js";
import {
 setTraceField,setTraceTool,tapTrace,usePhoto,saveTraceDraft,saveAndLinkTrace,
 restoreSavedTrace,startNewTrace
} from "../src/diagrams/image-tracer-actions.js";
import {traceCSV} from "../src/diagrams/image-tracer-export.js";
import {renderImageTracer} from "../src/diagrams/image-tracer-view.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
const fakeRaster="data:image/png;base64,aGVsbG8=";
function prepared(){
 const t=newImageTracer(),d=t.draft;
 Object.assign(d,{
  imageSrc:fakeRaster,width:500,height:300,imageName:"calibration.png",title:"Coordinates of an arch",
  sourceKind:"primary",xLabel:"Horizontal displacement",yLabel:"Vertical displacement",
  origin:{x:100,y:120},direction:{x:190,y:120},refA:{x:100,y:200},refB:{x:300,y:200},
  knownLength:"10",unit:"cm",precision:"2",perspective:"front-on",
  points:[{x:140,y:70},{x:240,y:50},{x:310,y:110}]
 });
 return t;
}
test("coordinate system uses explicit calibration and is invertible",()=>{
 const d=prepared().draft,c=traceCalibration(d);
 assert.equal(c.referencePixels,200);
 assert.equal(c.unitsPerPixel,0.05);
 assert.deepEqual(photoToCoordinates(d,{x:140,y:70}),{x:2,y:2.5});
 const restored=coordinatesToPhoto(d,{x:2,y:2.5});
 assert.ok(Math.abs(restored.x-140)<1e-8);
 assert.ok(Math.abs(restored.y-70)<1e-8);
 const p=traceCoordinates(d);assert.equal(p.length,3);
 assert.ok(p.every(x=>x.coordinate.x>=0));
});
test("orientation can rotate and preserves the right-handed coordinates",()=>{
 const d=prepared().draft;
 d.origin={x:100,y:100};d.direction={x:100,y:20};
 const east=photoToCoordinates(d,{x:140,y:100}),up=photoToCoordinates(d,{x:100,y:60});
 assert.ok(Math.abs(east.x)<1e-8);
 assert.equal(east.y,-2);
 assert.equal(up.x,2);
 assert.ok(Math.abs(up.y)<1e-8);
});
test("guided point marking advances origin, direction and two scale ends",()=>{
 const t=newImageTracer();
 usePhoto(t,{src:fakeRaster,width:500,height:300,name:"photo.png"});
 let d=t.draft;
 assert.equal(d.mode,"origin");
 for(const [mode,p] of [
  ["direction",{x:100,y:150}],["refA",{x:150,y:150}],
  ["refB",{x:100,y:210}],["trace",{x:300,y:210}]
 ]){
  const moved=tapTrace(t,p.x,p.y);
  assert.equal(moved.ok,true);
  assert.equal(d.mode,mode);
 }
 tapTrace(t,180,120);tapTrace(t,260,110);
 assert.equal(d.points.length,2);
 assert.equal(removeTracePoint(d,0),true);
 assert.equal(d.points.length,1);
 assert.equal(undoTrace(d),true);
 assert.equal(d.points.length,0);
});
test("quality gates require source, camera check, axes, calibrated reference and two points",()=>{
 const t=newImageTracer();
 let result=imageTraceChecks(t.draft);
 assert.ok(result.problems.some(x=>x.code==="image"));
 assert.ok(result.problems.some(x=>x.code==="precision"));
 const valid=imageTraceChecks(prepared().draft);
 assert.equal(valid.ready,true,JSON.stringify(valid.problems));
 for(const [k,v,expected] of [
  ["title","","title"],["unit","","units"],["sourceKind","unsure","source-type"],
  ["origin",null,"origin"],["direction",null,"direction"],["knownLength","0","length"],
  ["perspective","unsure","perspective"],["precision","unsure","precision"],["points",[],"points"]
 ]){
  const d={...prepared().draft,[k]:v};
  assert.ok(imageTraceChecks(d).problems.some(x=>x.code===expected),k);
 }
 const secondary=prepared().draft;secondary.sourceKind="secondary";
 assert.ok(imageTraceChecks(secondary).problems.some(x=>x.code==="source-credit"));
 secondary.sourceCredit="Photographer and date";
 assert.ok(imageTraceChecks(secondary).ready);
});
test("oblique photographs warn but are not falsely corrected by a single scale",()=>{
 const d=prepared().draft;
 d.perspective="oblique";
 const checks=imageTraceChecks(d);
 assert.equal(checks.ready,true);
 assert.ok(checks.warnings.some(x=>x.code==="perspective-distortion"));
 d.refB={x:101,y:201};
 assert.ok(imageTraceChecks(d).problems.some(x=>x.code==="reference-short"));
});
test("photo and mathematical SVG views are distinct and escape the student input",()=>{
 const d=prepared().draft;
 d.title='<script>alert(1)</script>';
 d.sourceKind="secondary";d.sourceCredit='<img src=x onerror=alert(1)>';
 const overlay=renderTraceOverlaySvg(d,{interactive:true});
 const clean=renderCleanTraceSvg(d);
 const printable=renderPrintableTraceSvg(d);
 assert.match(overlay,/data-trace-tap/);
 assert.match(overlay,/<image href="data:image\/png;base64,/);
 assert.ok(!overlay.includes("<script>")&&!overlay.includes('<img src=x'));
 assert.ok(clean.includes("clean-trace-clip"));
 assert.ok(!clean.includes("<image href="));
 assert.ok(printable.includes("<image href="));
 assert.ok(!printable.includes("<script>"));
});
test("tracing a closed polygon exposes approximate perimeter and shoelace area",()=>{
 const d=prepared().draft;
 d.points=[{x:100,y:120},{x:200,y:120},{x:200,y:20},{x:100,y:20}];
 d.closeShape=true;
 const m=tracedMeasurements(d);
 assert.ok(Math.abs(m.perimeter-20)<1e-8);
 assert.ok(Math.abs(m.area-25)<1e-8);
 assert.ok(imageTraceChecks(d).warnings.some(x=>x.code==="polygon"));
});
test("CSV coordinates use confirmed units and protect formula-like headings",()=>{
 const d=prepared().draft;d.xLabel="=IMPORTXML";
 const csv=traceCSV(d);
 assert.ok(csv.startsWith('"Point","\'=IMPORTXML (cm)"'));
 assert.match(csv,/P1/);
 assert.match(csv,/2\.00/);
 assert.equal(csv.split("\r\n").filter(Boolean).length,4);
});
test("saved and linked photo tracing preserves the student maths status and JSON image",()=>{
 const s=createProjectState();
 s.route="completing";s.completion.current="C31";
 s.imageTracer=prepared();
 const result=saveAndLinkTrace(s);
 assert.equal(result.ok,true);
 assert.equal(s.entries.length,1);
 assert.equal(s.entries[0].phase,"first");
 assert.equal(s.entries[0].status,"planned");
 assert.equal(s.entries[0].result,"");
 assert.equal(s.entries[0].imageTraceId,result.record.id);
 assert.equal(s.graphStudio.figures.length,0);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.imageTracer.figures[0].draft.imageSrc,fakeRaster);
 assert.equal(restored.entries[0].imageTraceId,result.record.id);
 assert.equal(restoreSavedTrace(restored.imageTracer,result.record.id),true);
 startNewTrace(restored.imageTracer);
 assert.equal(restored.imageTracer.figures.length,1);
 assert.equal(restored.imageTracer.activeId,"");
});
test("changing calibrated points flags any completed mathematical conclusion for review",()=>{
 const s=createProjectState();s.imageTracer=prepared();
 const saved=saveAndLinkTrace(s);assert.ok(saved.ok);
 s.entries[0].status="completed";s.entries[0].result="Estimated trajectory height is 3.5 cm";
 s.imageTracer.draft.refB={x:280,y:200};
 const changed=saveTraceDraft(s);
 assert.equal(changed.ok,true);
 assert.equal(changed.reviewNeeded,true);
 assert.equal(s.completion.stages.C30,"needs-review");
 assert.equal(s.entries[0].result,"Estimated trajectory height is 3.5 cm");
 assert.equal(s.entries[0].reviewNeeded,"yes");
});
test("invalid photo cannot create a mathematical step, even if linking is attempted",()=>{
 const s=createProjectState();
 const linked=saveAndLinkTrace(s);
 assert.equal(linked.ok,false);
 assert.equal(s.entries.length,0);
});
test("tracer UI exposes image upload, calibration, preview, axes and export gating",()=>{
 const s=createProjectState();s.imageTracer=prepared();
 const html=renderImageTracer(s,icon,escapeHtml);
 for(const text of ['data-action="trace-upload"','data-action="trace-use"',
  'data-action="trace-svg"','data-action="trace-csv"','data-trace-canvas="true"',
  'data-action="trace-mode"','data-trace-field="precision"','data-trace-field="sourceKind"'])
  assert.ok(html.includes(text),text);
 assert.ok(!html.includes('data-action="trace-use" disabled'));
 const initial=renderImageTracer(createProjectState(),icon,escapeHtml);
 assert.ok(initial.includes('data-action="trace-use" disabled'));
});
test("import-normalizer rejects SVG or arbitrary remote image sources",()=>{
 const t=prepared(),d=t.draft;
 d.imageSrc="data:image/svg+xml;base64,c2NyaXB0";
 assert.equal(normalizeTraceDraft(d).imageSrc,"");
 d.imageSrc="https://third-party.example.edu/image.png";
 assert.equal(normalizeTraceDraft(d).imageSrc,"");
 d.imageSrc=fakeRaster;
 const n=normalizeImageTracer({...t,figures:[{id:"trace-good",draft:d},{id:"invalid",draft:d}]});
 assert.equal(n.figures.length,1);
 assert.equal(n.figures[0].id,"trace-good");
});

test("at maximum photo capacity, saving another tracing never deletes earlier student work",()=>{
 const tracer=prepared();
 tracer.figures=Array.from({length:6},(_,i)=>({id:"trace-"+i,entryId:"",
  savedAt:"2026-10-19T00:00:00.000Z",draft:normalizeTraceDraft(prepared().draft)}));
 tracer.activeId="";
 const firstIds=tracer.figures.map(x=>x.id);
 const saving=saveTraceFigure(tracer);
 assert.equal(saving.ok,false);
 assert.match(saving.error,/nothing has been overwritten/i);
 assert.deepEqual(tracer.figures.map(x=>x.id),firstIds);
});

test("trace generated during a later stage stays linked to that stage, not first mathematics",()=>{
 const project=createProjectState();
 project.entries=[
  {id:"math-first",phase:"first",status:"completed",result:"A real finding from stage 1"},
  {id:"math-second",phase:"substantial",status:"planned",fromEntryId:"math-first",result:""}
 ];
 project.completion.activeEntryIndex=1;
 project.imageTracer=prepared();
 const linked=saveAndLinkTrace(project);
 assert.equal(linked.ok,true,linked.error||"Figure should pass its established checks");
 assert.equal(project.entries.length,2,"No additional first-stage record was created");
 assert.equal(project.imageTracer.figures.at(-1).entryId,"math-second");
 assert.equal(project.entries[1].imageTraceId,linked.record.id);
 assert.equal(project.entries[1].status,"planned","Saving a figure is not performing all the mathematical work");
 assert.equal(project.entries[0].result,"A real finding from stage 1");
});
