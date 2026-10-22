import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {renderInvestigativeRoutes} from "../src/ui/investigative-routes-view.js";
import {REPRESENTATION_TOOLS,representationTool,representationReturnNode} from "../src/diagrams/representation-registry.js";
import {REPRESENTATION_ROUTE_GUIDANCE,representationAdvice,representationVisibleTools,renderRepresentationHub} from "../src/diagrams/representation-hub.js";
import {resourceCreatorHub} from "../src/resources/views.js";
import {resourceAction} from "../src/resources/actions.js";
import {newResourceSession} from "../src/resources/state.js";
import {firstSavedFigures} from "../src/completing/first-figure-gallery.js";
import {collectProjectFigures,figureForEntry} from "../src/handover/figure-report.js";
import {linkRepresentationFigure,linkedRepresentationEntry} from "../src/diagrams/figure-linking.js";
const icon=name=>'<svg data-icon="'+name+'"></svg>';
const esc=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const routes=INVESTIGATIVE_ROUTES.map(r=>r.id);
const purpose=["data","geometry","models","decisions"];
const keys=REPRESENTATION_TOOLS.map(t=>t.id);

test("all 16 defined mathematical journeys have distinct, justified and existing recommendations",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.equal(new Set(routes).size,16);
 assert.deepEqual(new Set(Object.keys(REPRESENTATION_ROUTE_GUIDANCE)),new Set(routes));
 for(const route of INVESTIGATIVE_ROUTES){
  const state=createProjectState();state.planning.routeExplorer.selectedRoute=route.id;
  const info=representationAdvice(state);
  assert.equal(info.source,"route",route.id);
  assert.equal(info.ids.length,2,route.id);
  assert.equal(new Set(info.ids).size,info.ids.length,route.id);
  assert.equal(info.why.length,info.ids.length,route.id);
  for(const id of info.ids)assert(keys.includes(id),"Unknown creator "+id+" on "+route.id);
  assert(info.why.every(t=>t.length>28&&!/must use|should always/i.test(t)),route.id);
 }
});
test("method-specific advice overrides all 16 provisional routes at the actual mathematical stage",()=>{
 for(const id of routes){
  const state=createProjectState();
  state.planning.routeExplorer.selectedRoute=id;
  state.route="completing";state.completion.current="C40";
  state.entries=[{id:"real",phase:"substantial",status:"planned",methodId:"probability",kind:"other"}];
  state.completion.activeEntryIndex=0;
  const advice=representationAdvice(state);
  assert.equal(advice.source,"method",id);
  assert.equal(advice.ids[0],"probability",id);
 }
});
test("category filters show only matching creators across featured and catalog, never duplicate or invent emptiness",()=>{
 const state=createProjectState();
 for(const route of routes){
  state.planning.routeExplorer.selectedRoute=route;
  for(const filter of ["all",...purpose]){
   state.ui.representationFilter=filter;
   const v=representationVisibleTools(state);
   const combined=[...v.recommended,...v.remaining];
   assert.equal(combined.length,v.total,route+" "+filter);
   assert.equal(new Set(combined.map(x=>x.id)).size,combined.length,route+" "+filter);
   const expected=REPRESENTATION_TOOLS.filter(t=>filter==="all"||t.groups.includes(filter));
   assert.deepEqual(new Set(combined.map(x=>x.id)),new Set(expected.map(x=>x.id)),route+" "+filter);
   const html=renderRepresentationHub(state,icon,esc);
   for(const tool of expected)assert(html.includes('data-action="'+tool.action+'"'),route+" "+filter+" "+tool.id);
   assert(!html.includes("No tools in this category yet"),route+" "+filter);
  }
 }
});
test("reduced advice trims optional prose but preserves seven tools, stage-relevant reasons and expandable help",()=>{
 const state=createProjectState();state.planning.routeExplorer.selectedRoute="chance";
 const guided=renderRepresentationHub(state,icon,esc);
 state.ui.adviceMode="reduced";
 const reduced=renderRepresentationHub(state,icon,esc);
 assert(guided.includes('data-representation-advice-mode="guided"'));
 assert(reduced.includes('data-representation-advice-mode="reduced"'));
 assert(reduced.includes("Why these tools? (optional)"));
 assert(reduced.includes('data-action="probability-open"'));
 assert(reduced.includes("introduce each relevant figure"));
 assert(reduced.length<guided.length);
 assert(reduced.includes('data-representation-filter="all"'));
 assert(reduced.includes('data-representation-filter="geometry"'));
});
test("Tools & Tutorials exposes every registered creator exactly once and all launch intents are supported",()=>{
 const html=resourceCreatorHub();
 for(const tool of REPRESENTATION_TOOLS){
  assert.equal(html.split('data-resource-creator="'+tool.id+'"').length-1,1,tool.id);
  const state=createProjectState(),session=newResourceSession();
  const response=resourceAction(state,session,"resource-creator-open",{resourceCreator:tool.id});
  assert(response.ok&&response.creator===tool.id);
 }
});
test("saved figures from all seven tools are uniquely tied to their writing stages and retain editability",()=>{
 for(const tool of REPRESENTATION_TOOLS){
  const s=createProjectState();s.route="completing";s.completion.current="C31";
  s.entries=[
   {id:"first",phase:"first",status:"completed",result:"Earlier analysed result"},
   {id:"later",phase:"substantial",status:"planned",result:""}
  ];
  s.completion.activeEntryIndex=1;
  const studio=s[tool.studio];
  studio.figures.push({id:"test-figure",entryId:"first",savedAt:"2026-10-22T00:00:00.000Z",
    draft:JSON.parse(JSON.stringify(studio.draft))});
  s.entries[0][tool.entryKey]="test-figure";
  const saved=studio.figures[0];
  assert(linkRepresentationFigure(s,tool.id,saved,s.entries[1]));
  assert.equal(s.entries[0][tool.entryKey],"",tool.id);
  assert.equal(s.entries[1][tool.entryKey],"test-figure",tool.id);
  assert.equal(saved.entryId,"later",tool.id);
  assert.equal(s.entries[0].reviewNeeded,"yes",tool.id);
  assert.equal(firstSavedFigures(s,{scope:"active"}).filter(x=>x.kind===tool.id).length,1,tool.id);
  assert.equal(firstSavedFigures(s,{scope:"first"}).filter(x=>x.kind===tool.id).length,0,tool.id);
  const reports=collectProjectFigures(s).filter(x=>x.kind===tool.id&&x.id==="test-figure");
  assert.equal(reports.length,1,tool.id);
  assert.equal(reports[0].entryId,"later",tool.id);
  assert(figureForEntry(reports[0],s.entries[1]),tool.id);
  assert(!figureForEntry(reports[0],s.entries[0]),tool.id);
  const copy=normalizeProjectState(JSON.parse(JSON.stringify(s)));
  assert.equal(copy.entries[1][tool.entryKey],"test-figure",tool.id);
 }
});
test("replacing a figure unlinks the older saved figure but does not destroy it",()=>{
 const s=createProjectState(),key="probabilityFigureId";
 const entry={id:"later",phase:"substantial",status:"completed",result:"Old interpretation"};
 s.entries=[entry];
 for(const id of ["one","two"])s.probabilityStudio.figures.push({id,entryId:id==="one"?"later":"",draft:{title:id}});
 entry[key]="one";
 const figure=s.probabilityStudio.figures[1];
 linkRepresentationFigure(s,"probability",figure,entry);
 assert.equal(s.probabilityStudio.figures.length,2);
 assert.equal(s.probabilityStudio.figures[0].entryId,"");
 assert.equal(s.probabilityStudio.figures[1].entryId,"later");
 assert.equal(entry[key],"two");
 assert.equal(entry.reviewNeeded,"yes");
});
test("legacy backups with explicit figure IDs override stale internal record linkage",()=>{
 const entries=[
  {id:"old",phase:"first",probabilityFigureId:"other"},
  {id:"new",phase:"substantial",probabilityFigureId:"tree"}
 ];
 const file={id:"tree",entryId:"old",draft:{title:"Example"}};
 const out=linkedRepresentationEntry(entries,"probabilityFigureId",file);
 assert.equal(out.linked.id,"new");
 assert.equal(out.entryIndex,1);
 const legacy=linkedRepresentationEntry([{id:"old",phase:"first"}],"probabilityFigureId",file);
 assert.equal(legacy.linked.id,"old");
});
test("stage return targets include the first and both later writing stages",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C31";
 s.entries=[{id:"first",phase:"first"},{id:"second",phase:"substantial"},{id:"third",phase:"substantial"}];
 s.completion.activeEntryIndex=0;assert.equal(representationReturnNode(s),"C30");
 s.completion.activeEntryIndex=1;assert.equal(representationReturnNode(s),"C40");
 s.completion.activeEntryIndex=2;assert.equal(representationReturnNode(s),"C50");
 s.completion.editorReturnNode="C40";assert.equal(representationReturnNode(s),"C40");
});

test("planning offers one directly usable launch per recommended creator in every one of 16 journeys",()=>{
 for(const route of INVESTIGATIVE_ROUTES){
  const state=createProjectState();state.planning.routeExplorer.mode="routes";
  state.planning.routeExplorer.openRoute=route.id;
  const markup=renderInvestigativeRoutes(state,{icon,e:esc,catalogue:()=>""});
  const section=markup.split('data-journey-creators="'+route.id+'"')[1];
  assert(section,"Missing creator shelf on "+route.id);
  const shelf=section.split('</div><div class="journey-detail-actions">')[0];
  const expected=REPRESENTATION_ROUTE_GUIDANCE[route.id].ids;
  for(const id of expected){
   assert(shelf.includes('data-resource-creator="'+id+'"'),route.id+" "+id);
   assert.equal(shelf.split('data-resource-creator="'+id+'"').length-1,1,route.id+" "+id+" duplicated");
  }
  const linkIds=[...shelf.matchAll(/data-resource-creator="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(new Set(linkIds).size,linkIds.length,route.id);
  assert(linkIds.every(id=>keys.includes(id)),route.id);
  assert(shelf.includes("diagram is not required"),route.id);
 }
});
