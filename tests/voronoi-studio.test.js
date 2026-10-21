import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {
 newVoronoiDraft,newVoronoiStudio,normalizeVoronoiStudio,parseVoronoiSites,importVoronoiSites,
 analyzeVoronoi,voronoiBounds,clipNearest,voronoiCells,nearestSite,bisectorInBounds,saveVoronoiFigure
} from "../src/diagrams/voronoi-core.js";
import {voronoiLayout,renderVoronoiSvg} from "../src/diagrams/voronoi-render.js";
import {renderVoronoiStudio} from "../src/diagrams/voronoi-view.js";
import {voronoiCSV} from "../src/diagrams/voronoi-export.js";
import {
 setVoronoiField,setVoronoiSite,addVoronoiSite,removeVoronoiSite,useVoronoiMap,
 saveVoronoiDraft,saveAndLinkVoronoi,loadVoronoi,beginVoronoi
} from "../src/diagrams/voronoi-actions.js";
import {
 representationAdvice,renderRepresentationHub,renderRepresentationSwitcher
} from "../src/diagrams/representation-hub.js";
const two="Site\tx (km)\ty (km)\nA\t0\t0\nB\t10\t0";
const many="Site\tx (km)\ty (km)\nSchool\t0\t0\nLibrary\t10\t0\nHospital\t5\t10";
function studio(){
 const s=newVoronoiStudio();
 importVoronoiSites(s,many);
 Object.assign(s.draft,{
  title:"Nearest-site study with true Euclidean distances",sourceKind:"primary",
  coordSystem:"cartesian",metricConfirmed:true,
  regionMode:"manual",xMin:"0",xMax:"10",yMin:"0",yMax:"10"
 });
 return s;
}
test("Google Sheets TSV site coordinates import without inventing data; automatically reads units",()=>{
 const s=studio(),d=s.draft;
 assert.equal(d.sites.length,3);
 assert.deepEqual(d.sites.map(p=>p.name),["School","Library","Hospital"]);
 assert.equal(d.unit,"km");assert.equal(d.unitMode,"unit");
 assert.equal(d.xLabel,"x");assert.equal(d.yLabel,"y");
 assert.equal(d.sites.every(p=>p.kind==="observed"),true);
 assert.equal(analyzeVoronoi(d).ready,true,JSON.stringify(analyzeVoronoi(d).errors));
});
test("two numeric columns can be explicitly marked without headings",()=>{
 const s=newVoronoiStudio();s.draft.headers="no";
 const imported=importVoronoiSites(s,"0\t0\n10\t0\n5\t10");
 assert.equal(imported.sites,3);
 assert.deepEqual(s.draft.sites.map(p=>p.name),["Site 1","Site 2","Site 3"]);
 assert.ok(!s.draft.title);
});
test("CSV parsing detects extra columns, duplicates and missing coordinates rather than dropping rows",()=>{
 assert.throws(()=>parseVoronoiSites("Site,x,y\nA,0,0\nA,3,4","yes"),/different name/);
 assert.throws(()=>parseVoronoiSites("Site,x,y\nA,0,0\nB,0,0","yes"),/same coordinates/);
 assert.throws(()=>parseVoronoiSites("Site,x,y\nA,2,4\nB,,5","yes"),/row 2/i);
 assert.throws(()=>parseVoronoiSites("Site,x,y,color\nA,1,2,red\nB,2,3,blue","yes"),/2 columns|3 columns/);
 assert.throws(()=>parseVoronoiSites("Site,x,y\nA,1,2","yes"),/at least two/i);
});
test("Voronoi perpendicular-bisector geometry divides an axis-aligned rectangle correctly",()=>{
 const bounds={xMin:0,xMax:10,yMin:0,yMax:10},
  sites=[{name:"A",x:0,y:0},{name:"B",x:10,y:0}];
 const cells=voronoiCells(sites,bounds);
 assert.equal(cells.length,2);
 assert.ok(Math.abs(cells[0].area-50)<1e-9);
 assert.ok(Math.abs(cells[1].area-50)<1e-9);
 assert.ok(cells[0].polygon.every(p=>p.x<=5+1e-9));
 assert.ok(cells[1].polygon.every(p=>p.x>=5-1e-9));
 const bisector=bisectorInBounds(sites[0],sites[1],bounds);
 assert.ok(bisector?.every(p=>Math.abs(p.x-5)<1e-9));
 assert.deepEqual(nearestSite(sites,{x:5,y:5}).tied,["A","B"]);
});
test("three site cells cover the rectangular window without overlaps or gaps",()=>{
 const q=analyzeVoronoi(studio().draft);
 assert.equal(q.ready,true,JSON.stringify(q.errors));
 assert.ok(Math.abs(q.cells.reduce((s,c)=>s+c.area,0)-100)<1e-9);
 for(const c of q.cells)for(const v of c.polygon){
  const dis=Math.hypot(c.site.x-v.x,c.site.y-v.y);
  for(const other of q.draft.sites)
   assert.ok(dis<=Math.hypot(other.x-v.x,other.y-v.y)+1e-7);
 }
});
test("correct region for a test location and distance is calculated rather than guessed",()=>{
 const s=studio();s.draft.probeX="5";s.draft.probeY="8";
 const q=analyzeVoronoi(s.draft);
 assert.equal(q.ready,true);
 assert.equal(q.nearest.name,"Hospital");
 assert.ok(Math.abs(q.nearest.distance-2)<1e-8);
 s.draft.probeY="bad";
 assert.ok(analyzeVoronoi(s.draft).errors.some(x=>x.code==="probe"));
});
test("equal physical x/y scale holds even in a nonsquare study window",()=>{
 const b={xMin:0,xMax:20,yMin:0,yMax:5},l=voronoiLayout(b);
 assert.ok(Math.abs(l.x(4)-l.x(3)-l.scale)<1e-9);
 assert.ok(Math.abs(l.y(3)-l.y(4)-l.scale)<1e-9);
 assert.ok(Math.abs(l.width/20-l.height/5)<1e-9);
});
test("geographic coordinates in degrees, unknown metric or inconsistent units block export",()=>{
 const s=studio();
 s.draft.coordSystem="latlon";
 assert.ok(analyzeVoronoi(s.draft).errors.some(x=>x.code==="latlon"));
 s.draft.coordSystem="cartesian";s.draft.metricConfirmed=false;
 assert.ok(analyzeVoronoi(s.draft).errors.some(x=>x.code==="metric"));
 s.draft.metricConfirmed=true;s.draft.unitMode="unsure";
 assert.ok(analyzeVoronoi(s.draft).errors.some(x=>x.code==="units"));
});
test("manual bounding box must contain all sites and rectangular clipping is identified as an assumption",()=>{
 const s=studio();
 s.draft.xMax="7";
 assert.ok(analyzeVoronoi(s.draft).errors.some(x=>x.code==="site-outside"));
 s.draft.xMax="10";s.draft.regionMode="auto";
 const q=analyzeVoronoi(s.draft);
 assert.equal(q.ready,true);
 assert.ok(q.warnings.some(x=>x.code==="auto-window"));
 assert.equal(q.bounds.manual,false);
});
test("hypothetical candidate site changes cells but is distinguished from collected locations",()=>{
 const s=studio(),initial=analyzeVoronoi(s.draft).cells.map(c=>c.area);
 const added=addVoronoiSite(s,{name:"Candidate D",x:5,y:5,kind:"candidate"});
 assert.equal(added.ok,true);
 assert.equal(added.site.kind,"candidate");
 const q=analyzeVoronoi(s.draft);
 assert.equal(q.ready,true,JSON.stringify(q.errors));
 assert.ok(q.warnings.some(w=>w.code==="candidate"));
 assert.ok(Math.abs(q.cells.reduce((sum,c)=>sum+c.area,0)-100)<1e-8);
 assert.notDeepEqual(q.cells.slice(0,3).map(c=>c.area),initial);
 assert.match(renderVoronoiSvg(s.draft),/Proposed:/);
 assert.match(voronoiCSV(s.draft),/Hypothetical candidate/);
});
test("students can edit or remove coordinates without silently rewriting imported source",()=>{
 const s=studio(),raw=s.draft.raw;
 assert.equal(setVoronoiSite(s,0,"x","1.5"),true);
 assert.equal(s.draft.sites[0].x,1.5);
 assert.equal(s.draft.raw,raw);
 assert.equal(s.draft.edited,true);
 assert.equal(removeVoronoiSite(s,1),true);
 assert.equal(s.draft.sites.length,2);
 setVoronoiField(s,"raw",s.draft.raw+"\nNew\t3\t4");
 assert.ok(analyzeVoronoi(s.draft).errors.some(x=>x.code==="stale"));
});
test("aspect mismatch and missing provenance block map image export, never stretch silently",()=>{
 const s=studio();
 useVoronoiMap(s,{src:"data:image/png;base64,AAAA",width:200,height:100,name:"map.png"});
 let q=analyzeVoronoi(s.draft);
 assert.ok(q.errors.some(x=>x.code==="map-calibration"));
 assert.ok(q.errors.some(x=>x.code==="map-credit"));
 s.draft.mapCredit="Student-created coordinate grid";
 s.draft.mapConfirmed=true;
 q=analyzeVoronoi(s.draft);
 assert.ok(q.errors.some(x=>x.code==="map-ratio"));
 s.draft.yMax="5"; // All 3 locations must still fit; expanding x span instead.
 s.draft.yMax="10";s.draft.xMax="20";
 q=analyzeVoronoi(s.draft);
 assert.equal(q.ready,true,JSON.stringify(q.errors));
 const svg=renderVoronoiSvg(s.draft);
 assert.match(svg,/<image href=/);
});
test("SVG and CSV escape student labels, including spreadsheet formulas",()=>{
 const s=studio();
 s.draft.title="<script>alert(1)</script>";
 s.draft.sites[0].name="=HYPERLINK(1)";
 assert.equal(analyzeVoronoi(s.draft).ready,true);
 const svg=renderVoronoiSvg(s.draft);
 assert.ok(!svg.includes("<script>"));
 assert.match(svg,/&lt;script&gt;/);
 assert.match(voronoiCSV(s.draft),/'=HYPERLINK\(1\)/);
});
test("saving and IA linking are explicit, do not invent a completed result and survive JSON backup",()=>{
 const state=createProjectState();state.route="completing";state.completion.current="C31";
 state.voronoiStudio=studio();
 const result=saveAndLinkVoronoi(state);
 assert.equal(result.ok,true,JSON.stringify(result));
 assert.equal(state.entries.length,1);
 assert.equal(state.entries[0].status,"planned");
 assert.equal(state.entries[0].result,"");
 assert.equal(state.entries[0].voronoiFigureId,result.record.id);
 assert.equal(state.entries[0].methodId,"voronoi");
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.entries[0].voronoiFigureId,result.record.id);
 assert.equal(restored.voronoiStudio.figures[0].draft.sites.length,3);
 assert.equal(loadVoronoi(restored.voronoiStudio,result.record.id),true);
 beginVoronoi(restored.voronoiStudio);
 assert.equal(restored.voronoiStudio.figures.length,1);
});
test("changing site coordinates flags prior completed interpretations without deleting any writing",()=>{
 const state=createProjectState();state.voronoiStudio=studio();
 const first=saveAndLinkVoronoi(state);
 assert.equal(first.ok,true);
 const entry=state.entries[0];entry.status="completed";entry.result="The school cell was smaller.";
 setVoronoiSite(state.voronoiStudio,0,"x","2");
 const update=saveVoronoiDraft(state);
 assert.equal(update.ok,true);assert.equal(update.reviewNeeded,true);
 assert.equal(entry.reviewNeeded,"yes");assert.equal(entry.result,"The school cell was smaller.");
 assert.equal(state.completion.stages.C30,"needs-review");
});
test("saved geometry capacity never overwrites older diagrams",()=>{
 const s=studio();
 s.figures=Array.from({length:8},(_,i)=>({id:"voronoi-"+i,entryId:"",
  savedAt:"2026-10-19T00:00:00.000Z",draft:studio().draft}));
 const ids=s.figures.map(x=>x.id);
 assert.equal(saveVoronoiFigure(s).ok,false);
 assert.deepEqual(s.figures.map(x=>x.id),ids);
});
test("student UI exposes source and projection checks, candidate editor, maps, bisectors and exports",()=>{
 const state=createProjectState();state.voronoiStudio=studio();
 const html=renderVoronoiStudio(state,icon,escapeHtml);
 for(const marker of ['data-voronoi-studio','data-action="voronoi-parse"',
  'data-voronoi-field="coordSystem"','data-voronoi-field="metricConfirmed"',
  'data-action="voronoi-add-site"','data-action="voronoi-map-upload"',
  'data-voronoi-field="showBisector"','data-action="voronoi-svg"',
  'data-action="voronoi-png"','data-action="voronoi-use"']){
  assert.ok(html.includes(marker),marker);
 }
 assert.ok(!html.includes('data-action="voronoi-use" disabled'));
 const missing=renderVoronoiStudio(createProjectState(),icon,escapeHtml);
 assert.ok(missing.includes('data-action="voronoi-use" disabled'));
});
const recommended={
 relationships:["graph","stat"],groups:["stat","table"],categorical:["table","stat"],variation:["stat","table"],
 "fitted-models":["graph","table"],growth:["graph","table"],cycles:["graph","stat"],
 trajectories:["trace","graph"],optimisation:["graph","table"],images:["trace","geometry"],
 triangulation:["geometry","trace"],voronoi:["voronoi","trace"],finance:["table","graph"],
 chance:["stat","table"],proof:["graph","table"],iteration:["graph","table"]
};
test("every planned investigative journey has two contextually relevant representation suggestions",()=>{
 const state=createProjectState();
 for(const [route,ids] of Object.entries(recommended)){
  state.planning.routeExplorer.selectedRoute=route;
  assert.deepEqual(representationAdvice(state).ids,ids,route);
  const markup=renderRepresentationHub(state,icon,escapeHtml);
  assert.match(markup,/provisional/i);
  for(const id of ids){
   assert.ok(markup.includes('data-action="'+({graph:"graph-open",stat:"stat-open",
    table:"table-open",trace:"trace-open",voronoi:"voronoi-open",geometry:"geometry-open"}[id])+'"'),route+" "+id);
  }
  assert.ok(markup.includes('data-representation-filter="geometry"'));
 }
});
test("the chooser preserves access to all six available tools without duplicated buttons",()=>{
 const state=createProjectState();state.planning.routeExplorer.selectedRoute="voronoi";
 const markup=renderRepresentationHub(state,icon,escapeHtml);
 for(const action of ["graph-open","stat-open","table-open","trace-open","voronoi-open","geometry-open"])
  assert.equal(markup.split('data-action="'+action+'"').length-1,1,action);
 state.ui.representationFilter="data";
 const filtered=renderRepresentationHub(state,icon,escapeHtml);
 assert.ok(filtered.includes("data-representation-filter=\"data\""));
 assert.ok(filtered.includes('data-action="voronoi-open"')); // current pathway remains recommended.
 assert.ok(filtered.includes('data-action="stat-open"')); // available data option.
});
test("representation chooser uses fallback first type when no route is selected, not invented findings",()=>{
 const s=createProjectState();
 s.completion.fields.firstType="distribution";
 assert.deepEqual(representationAdvice(s).ids,["stat","table"]);
 assert.ok(renderRepresentationHub(s,icon,escapeHtml).includes("selected first representation"));
 s.completion.fields.firstType="unsure";
 assert.deepEqual(representationAdvice(s).ids,["graph","stat"]);
});

test("voronoi generated during a later stage stays linked to that stage, not first mathematics",()=>{
 const project=createProjectState();
 project.entries=[
  {id:"math-first",phase:"first",status:"completed",title:"First exploration",technique:"",result:"A real finding from stage 1"},
  {id:"math-second",phase:"substantial",status:"planned",fromEntryId:"math-first",
   title:"Mathematical stage 2",technique:"",kind:"",methodId:"",result:""}
 ];
 project.completion.activeEntryIndex=1;
 project.voronoiStudio=studio();
 const linked=saveAndLinkVoronoi(project);
 assert.equal(linked.ok,true,linked.error||"Figure should pass its established checks");
 assert.equal(project.entries.length,2,"No additional first-stage record was created");
 assert.equal(project.voronoiStudio.figures.at(-1).entryId,"math-second");
 assert.equal(project.entries[1].voronoiFigureId,linked.record.id);
 assert.equal(project.entries[1].status,"planned","Saving a figure is not performing all the mathematical work");
 assert.equal(project.entries[0].result,"A real finding from stage 1");
});
