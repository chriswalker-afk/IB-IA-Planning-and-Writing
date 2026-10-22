import test from "node:test";
import assert from "node:assert/strict";
import {newGeometryDraft,newGeometryStudio,normalizeGeometryDraft,geometryAnalysis,geometrySignature} from "../src/diagrams/geometry-core.js";
import {formatGeometryMeasure} from "../src/diagrams/geometry-overlay.js";
import {projectedHeight,geometryAnnotationIssues,MAX_GEOMETRY_AUX_POINTS,MAX_GEOMETRY_GUIDES} from "../src/diagrams/geometry-annotations.js";
import {renderGeometrySvg} from "../src/diagrams/geometry-render.js";
import {renderGeometryStudio} from "../src/diagrams/geometry-view.js";
import {geometryAddAuxPoint,geometryRemoveAuxPoint,setGeometryAuxPoint,moveGeometryAuxPoint,
 geometryAddGuide,geometryRemoveGuide,setGeometryGuide,setGeometryField,setGeometryVertex,
 saveGeometryDraft,saveAndLinkGeometry} from "../src/diagrams/geometry-actions.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";
const icon=()=>'<svg aria-hidden="true"></svg>';
const e=x=>String(x??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");

test("old saved polygons receive safe optional construction defaults without changing their area",()=>{
 const old={...newGeometryDraft("rectangle"),mode:"coordinate"};
 delete old.auxPoints;delete old.guides;delete old.lengthDigits;delete old.dimensionStyle;
 for(const p of old.vertices)delete p.edgeLabelDx;
 const d=normalizeGeometryDraft(old),a=geometryAnalysis(d);
 assert.equal(a.ready,true,a.issues.join("; "));
 assert.equal(a.area,32);
 assert.deepEqual(d.auxPoints,[]);
 assert.deepEqual(d.guides,[]);
 assert.equal(d.dimensionStyle,"inline");
 assert.equal(d.lengthDigits,2);
 assert(d.vertices.every(p=>p.edgeLabelDx===0&&p.angleMark==="single"));
});

test("dimension arrows and mathematical precision change SVG, never model calculations",()=>{
 const studio=newGeometryStudio();
 studio.draft.mode="coordinate";
 studio.draft.showLengths=true;studio.draft.showAngles=true;
 const before=geometryAnalysis(studio.draft);
 assert(setGeometryField(studio,"dimensionStyle","dimension"));
 assert(setGeometryField(studio,"dimensionOffset",42));
 assert(setGeometryField(studio,"lengthFormat","sf"));
 assert(setGeometryField(studio,"lengthDigits",3));
 assert(setGeometryField(studio,"angleDigits",2));
 assert(setGeometryVertex(studio,0,"edgeLabelDx",12));
 assert(setGeometryVertex(studio,0,"pointLabelDy",-10));
 const after=geometryAnalysis(studio.draft),svg=renderGeometrySvg(studio.draft);
 assert.deepEqual(after.lengths,before.lengths);
 assert.deepEqual(after.angles,before.angles);
 assert.match(svg,/geometry-dimension-lines/);
 assert.match(svg,/geometry-angle-arc/);
 assert.match(svg,/≈ /);
 assert.equal(formatGeometryMeasure(3.4,studio.draft),"3.40");
 assert.equal(formatGeometryMeasure(82.5,studio.draft,"angle"),"82.50");
 assert.notEqual(geometrySignature(studio.draft),geometrySignature(newGeometryDraft("triangle")));
});

test("all labelled reflex angles use the large arc, including reversed winding",()=>{
 const d=newGeometryDraft("polygon");d.mode="coordinate";d.showAngles=true;
 d.vertices=[
  {id:"v-a",label:"A",x:0,y:0},
  {id:"v-b",label:"B",x:5,y:0},
  {id:"v-c",label:"C",x:5,y:5},
  {id:"v-d",label:"D",x:2,y:2},
  {id:"v-e",label:"E",x:0,y:5}
 ];
 let a=geometryAnalysis(d);
 assert(a.ready,a.issues.join(" / "));
 let index=a.angles.findIndex(x=>x>180);
 assert(index>=0);
 d.vertices[index].angleMark="triple";
 let svg=renderGeometrySvg(d);
 assert.equal((svg.match(new RegExp('data-angle-vertex="'+index+'"','g'))||[]).length,3);
 assert.match(svg,/geometry-angle-arc/);
 assert.match(svg,/ A19 19 0 1 [01] /);
 d.vertices.reverse();
 a=geometryAnalysis(d);
 index=a.angles.findIndex(x=>x>180);
 assert(a.ready&&index>=0);
 d.vertices[index].angleMark="double";
 svg=renderGeometrySvg(d);
 assert.match(svg,/ A19 19 0 1 [01] /);
});

test("right-angle square replaces arc for derived 90° vertices",()=>{
 const d=newGeometryDraft("rectangle");d.mode="coordinate";d.showAngles=true;
 const svg=renderGeometrySvg(d);
 assert.equal((svg.match(/geometry-angle-arc/g)||[]).length,0);
 assert.equal((svg.match(/stroke="#89602a"/g)||[]).length,4);
});

test("extra points and constructed lines never change perimeter or area",()=>{
 const studio=newGeometryStudio();studio.draft.mode="coordinate";
 const old=geometryAnalysis(studio.draft);
 assert(geometryAddAuxPoint(studio));
 assert.equal(studio.draft.auxPoints[0].label,"P");
 assert(setGeometryAuxPoint(studio,0,"x","3"));
 assert(setGeometryAuxPoint(studio,0,"label","P"));
 assert(setGeometryAuxPoint(studio,0,"labelDx","17"));
 assert(moveGeometryAuxPoint(studio,0,3,2));
 assert(geometryAddGuide(studio,"solid"));
 assert(setGeometryGuide(studio,0,"to",studio.draft.auxPoints[0].id));
 assert(setGeometryGuide(studio,0,"label","median"));
 assert(setGeometryGuide(studio,0,"showLength",true));
 assert(geometryAddGuide(studio,"height"));
 const a=geometryAnalysis(studio.draft),svg=renderGeometrySvg(studio.draft);
 assert(a.ready,a.issues.join(" / "));
 assert.equal(a.area,old.area);
 assert.deepEqual(a.lengths,old.lengths);
 assert.match(svg,/geometry-aux-point/);
 assert.match(svg,/geometry-construction-line/);
 assert.match(svg,/geometry-height-square/);
 assert.match(svg,/median/);
 assert.match(svg,/≈ /);
 assert.equal((svg.match(/data-guide-id=/g)||[]).length,2);
 assert.equal(geometryRemoveAuxPoint(studio,0).ok,false,"Referenced points must not disappear silently");
 assert(geometryRemoveGuide(studio,0));
 assert(geometryRemoveAuxPoint(studio,0).ok);
});

test("perpendicular projection extends the baseline when its foot falls beyond its ends",()=>{
 const h=projectedHeight({x:10,y:5},{x:0,y:0},{x:4,y:0});
 assert.equal(h.x,10);
 assert.equal(h.y,0);
 assert(h.t>1);
 assert.equal(h.length,5);
 const d=newGeometryDraft("triangle");
 d.mode="coordinate";d.vertices=[
  {id:"v-a",label:"A",x:10,y:5},
  {id:"v-b",label:"B",x:0,y:0},
  {id:"v-c",label:"C",x:4,y:0}
 ];
 d.guides=[{id:"guide-1",kind:"height",from:"v-a",baseStart:"v-b",baseEnd:"v-c",
   label:"h",showLength:true,labelDx:0,labelDy:0}];
 const a=geometryAnalysis(d),svg=renderGeometrySvg(d);
 assert(a.ready,a.issues.join(" / "));
 assert.match(svg,/geometry-height-extension/);
 assert.match(svg,/geometry-height-square/);
 assert.match(svg,/geometry-construction-line/);
});

test("invalid guide endpoints, north references and schematic lengths are not silently accepted",()=>{
 const studio=newGeometryStudio();
 assert(geometryAddGuide(studio,"dashed"));
 assert(setGeometryGuide(studio,0,"showLength",true));
 assert(geometryAnalysis(studio.draft).issues.some(x=>/coordinate mode/.test(x)));
 assert(setGeometryGuide(studio,0,"showLength",false));
 assert(setGeometryGuide(studio,0,"from",studio.draft.vertices[0].id));
 assert(setGeometryGuide(studio,0,"to",studio.draft.vertices[0].id));
 assert(geometryAnalysis(studio.draft).issues.some(x=>/distinct endpoints/.test(x)));
 assert(setGeometryGuide(studio,0,"kind","north"));
 assert(geometryAnalysis(studio.draft).issues.some(x=>/North-reference lines/.test(x)));
 assert(setGeometryField(studio,"mode","coordinate"));
 assert(setGeometryField(studio,"northAligned",true));
 assert.equal(geometryAnnotationIssues(studio.draft).length,0);
 assert.match(renderGeometrySvg(studio.draft),/geometry-north-guide/);
 assert.equal(setGeometryAuxPoint(studio,55,"label","A"),false);
 assert.equal(setGeometryField(studio,"lengthDigits","nine"),false);
 assert.equal(setGeometryVertex(studio,0,"angleLabelDx","200"),false);
});

test("annotation limits prevent unbounded project data",()=>{
 const studio=newGeometryStudio();
 for(let i=0;i<MAX_GEOMETRY_AUX_POINTS;i++)assert(geometryAddAuxPoint(studio));
 assert.equal(geometryAddAuxPoint(studio),false);
 for(let i=0;i<MAX_GEOMETRY_GUIDES;i++)assert(geometryAddGuide(studio,"dashed"));
 assert.equal(geometryAddGuide(studio,"dashed"),false);
 studio.draft.auxPoints[0].label="<svg onload=alert(1)>";
 const svg=renderGeometrySvg(studio.draft);
 assert(!svg.includes("<svg onload="),"Student text must not become an SVG element");
});

test("the IA controls and annotations survive JSON backup and linked report",()=>{
 const state=createProjectState();state.route="completing";state.completion.current="C31";
 state.entries=[{id:"stage-geometry-pass2",phase:"first",status:"planned",title:"",technique:"",result:""}];
 state.completion.activeEntryIndex=0;
 const studio=state.geometryStudio;studio.draft.mode="coordinate";
 geometryAddAuxPoint(studio);geometryAddGuide(studio,"height");
 setGeometryField(studio,"lengthFormat","sf");setGeometryField(studio,"lengthDigits",4);
 setGeometryVertex(studio,1,"angleMark","double");setGeometryVertex(studio,1,"angleLabelDx",12);
 const html=renderGeometryStudio(state,icon,e);
 for(const action of ["geometry-aux-add","geometry-guide-add","geometry-guide-remove",
  "geometry-aux-remove","geometry-svg","geometry-use"])assert(html.includes('data-action="'+action+'"'),action);
 assert(html.includes('data-geometry-field="dimensionStyle"'));
 assert(html.includes('data-geometry-vertex-key="pointLabelDx"'));
 assert(html.includes('data-geometry-aux="0"'));
 const saved=saveGeometryDraft(state);assert(saved.ok,saved.error);
 const linked=saveAndLinkGeometry(state);assert(linked.ok,linked.error);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.geometryStudio.figures[0].draft.auxPoints.length,1);
 assert.equal(restored.geometryStudio.figures[0].draft.guides.length,1);
 assert.equal(restored.geometryStudio.figures[0].draft.lengthDigits,4);
 const result=collectProjectFigures(restored).find(x=>x.kind==="geometry");
 assert(result&&result.svg.includes("geometry-height-square"));
 assert(result.rows.some(x=>x.label==="Construction points"));
 assert(result.rows.some(x=>x.label==="Auxiliary constructions"));
});
