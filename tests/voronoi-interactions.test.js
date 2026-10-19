import test from "node:test";
import assert from "node:assert/strict";
import {newVoronoiStudio,analyzeVoronoi,normalizeVoronoiStudio} from "../src/diagrams/voronoi-core.js";
import {addVoronoiSite,removeVoronoiSite,setVoronoiSite} from "../src/diagrams/voronoi-actions.js";
import {renderVoronoiSvg,voronoiLayout} from "../src/diagrams/voronoi-render.js";
import {renderVoronoiStudio,voronoiPreviewHtml,voronoiComparisonHtml,voronoiInspectionHtml} from "../src/diagrams/voronoi-view.js";
import {createProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {displayVoronoiBounds,coordinateFromCanvas,canvasPosition,freezeVoronoiWindow,
 voronoiFrame,recordVoronoiHistory,undoVoronoi,redoVoronoi,moveVoronoiSite,
 setVoronoiTool,proposeVoronoiComparison,showVoronoiComparison,finishVoronoiComparison,
 selectVoronoiSite,voronoiInspection,voronoiComparison,selectNearestBisector} from "../src/diagrams/voronoi-interactions.js";
const put=(studio,x,y,kind="observed")=>addVoronoiSite(studio,{x,y,kind});
test("blank Voronoi studio is a clickable coordinate grid even before pasting any data",()=>{
 const studio=newVoronoiStudio(),bounds=displayVoronoiBounds(studio.draft);
 assert.deepEqual([bounds.xMin,bounds.xMax,bounds.yMin,bounds.yMax],[0,10,0,10]);
 assert.equal(studio.tool,"existing");
 const svg=renderVoronoiSvg(studio.draft,{interactive:true});
 assert.match(svg,/data-voronoi-plane/);
 assert.match(svg,/Place existing and click the grid/);
 assert.match(svg,/data-voronoi-interactive/);
 assert.ok(!studio.draft.sites.length);
});
test("canvas and rectangular coordinate mapping preserve equal x/y physical scales",()=>{
 const bounds={xMin:0,xMax:10,yMin:0,yMax:10};
 const L=voronoiLayout(bounds),p=coordinateFromCanvas(L,bounds,{x:L.x(2.5),y:L.y(8)});
 assert.ok(Math.abs(p.x-2.5)<1e-10);
 assert.ok(Math.abs(p.y-8)<1e-10);
 assert.equal(coordinateFromCanvas(L,bounds,{x:L.left-30,y:L.top}),null);
 assert.equal(canvasPosition(1.23456789123),1.2345679);
});
test("two native clicks are sufficient for a correctly divided pair of cells",()=>{
 const s=newVoronoiStudio(),initial=voronoiFrame(s.draft);
 freezeVoronoiWindow(s);
 assert.equal(s.draft.regionMode,"interactive");
 assert.equal(put(s,2,5).ok,true);
 assert.equal(put(s,8,5).ok,true);
 const q=analyzeVoronoi(s.draft);
 assert.equal(q.cells.length,2);
 assert.ok(Math.abs(q.cells[0].area-50)<1e-8);
 assert.ok(Math.abs(q.cells[1].area-50)<1e-8);
 assert.ok(q.warnings.some(w=>w.code==="working-window"));
 assert.ok(q.errors.some(e=>e.code==="source")); // no claim of real data
 assert.match(renderVoronoiSvg(s.draft,{interactive:true}),/data-voronoi-cell-index="0"/);
 assert.equal(s.draft.raw,""); // no invented spreadsheet
 assert.ok(initial.sites.length===0);
});
test("moving and editing sites updates coordinates and cells and supports bounded undo/redo",()=>{
 const s=newVoronoiStudio();
 freezeVoronoiWindow(s);put(s,2,5);put(s,8,5);setVoronoiTool(s,"select");
 const before=analyzeVoronoi(s.draft).cells.map(x=>x.area);
 assert.equal(moveVoronoiSite(s,0,3,3).ok,true);
 assert.equal(s.draft.sites[0].x,3);
 assert.notDeepEqual(analyzeVoronoi(s.draft).cells.map(x=>x.area),before);
 assert.equal(undoVoronoi(s),true);
 assert.equal(s.draft.sites[0].x,2);
 assert.equal(redoVoronoi(s),true);
 assert.equal(s.draft.sites[0].x,3);
 const count=s.history.past.length;
 assert.equal(moveVoronoiSite(s,0,8,5).ok,false); // coincident point rejected
 assert.equal(s.history.past.length,count);
 assert.equal(s.draft.edited,true);
});
test("mouse-drag sessions can record a single undo checkpoint",()=>{
 const s=newVoronoiStudio();freezeVoronoiWindow(s);put(s,2,5);put(s,8,5);
 const start=voronoiFrame(s.draft),count=s.history.past.length;
 assert.equal(moveVoronoiSite(s,0,2.5,5,{record:false}).ok,true);
 assert.equal(moveVoronoiSite(s,0,3,5,{record:false}).ok,true);
 assert.equal(s.history.past.length,count);
 assert.equal(recordVoronoiHistory(s,start),true);
 assert.equal(s.history.past.length,count+1);
 assert.equal(undoVoronoi(s),true);assert.equal(s.draft.sites[0].x,2);
});
test("selecting a region exposes the corresponding site, area, distances and bisector",()=>{
 const s=newVoronoiStudio();freezeVoronoiWindow(s);put(s,2,5);put(s,8,5);
 assert.equal(selectVoronoiSite(s,0),true);
 const info=voronoiInspection(s);
 assert.equal(info.cell.area,50);
 assert.ok(Math.abs(info.neighbours[0].distance-6)<1e-10);
 assert.deepEqual(info.bisector.midpoint,{x:5,y:5});
 assert.equal(selectNearestBisector(s),true);
 assert.equal(s.draft.showBisector,true);
 assert.match(voronoiInspectionHtml(s,icon,escapeHtml),/Perpendicular bisector/);
 assert.match(voronoiPreviewHtml(s,icon,escapeHtml),/data-action="voronoi-bisector-selected"/);
});
test("what-if proposal preserves existing site positions and compares clipped areas",()=>{
 const s=newVoronoiStudio();freezeVoronoiWindow(s);put(s,2,5);put(s,8,5);
 const source=s.draft.sites.map(x=>({id:x.id,x:x.x,y:x.y,kind:x.kind}));
 assert.equal(proposeVoronoiComparison(s),true);
 assert.equal(s.tool,"candidate");
 assert.equal(put(s,5,7,"candidate").ok,true);
 assert.deepEqual(s.draft.sites.slice(0,2).map(x=>({id:x.id,x:x.x,y:x.y,kind:x.kind})),source);
 assert.equal(moveVoronoiSite(s,0,3,5).ok,false);
 assert.equal(setVoronoiSite(s,0,"x","4"),false);
 assert.equal(removeVoronoiSite(s,0),false);
 const comparison=voronoiComparison(s);
 assert.equal(comparison.before.cells.length,2);
 assert.equal(comparison.after.cells.length,3);
 assert.ok(comparison.changes.some(x=>x.delta!==null&&x.delta<0));
 assert.match(voronoiComparisonHtml(s,icon,escapeHtml),/Before \/ after comparison/);
 assert.equal(showVoronoiComparison(s,true),true);
 assert.equal(s.scenario.showOriginal,true);
 assert.equal(finishVoronoiComparison(s,{restore:true}),true);
 assert.equal(s.draft.sites.length,2);
 assert.deepEqual(s.draft.sites.map(x=>({id:x.id,x:x.x,y:x.y,kind:x.kind})),source);
});
test("what-if can be retained and remains distinguishable after project JSON reload",()=>{
 const s=newVoronoiStudio();freezeVoronoiWindow(s);put(s,2,5);put(s,8,5);
 proposeVoronoiComparison(s);put(s,5,7,"candidate");
 const copy=normalizeVoronoiStudio(JSON.parse(JSON.stringify(s)));
 assert.equal(copy.scenario.active,true);
 assert.equal(copy.scenario.before.sites.length,2);
 assert.equal(copy.draft.sites.length,3);
 assert.equal(finishVoronoiComparison(copy,{restore:false}),true);
 assert.equal(copy.draft.sites[2].kind,"candidate");
 assert.equal(copy.scenario.active,false);
 assert.ok(analyzeVoronoi(copy.draft).warnings.some(x=>x.code==="candidate"));
});
test("student UI exposes all five drawing modes and the scenario comparison",()=>{
 const state=createProjectState();
 state.voronoiStudio.open=true;
 const html=renderVoronoiStudio(state,icon,escapeHtml);
 for(const name of ["existing","select","inspect","test","candidate"])
  assert.ok(html.includes('data-voronoi-tool="'+name+'"'),name);
 for(const action of ["voronoi-undo","voronoi-redo","voronoi-scenario-start","voronoi-fit"])
  assert.ok(html.includes('data-action="'+action+'"'),action);
 assert.ok(html.includes('data-voronoi-site-editor')===false); // empty list does not fake rows
});
