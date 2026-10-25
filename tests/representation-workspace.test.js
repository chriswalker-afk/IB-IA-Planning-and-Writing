import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {representationFocusActive,renderRepresentationSwitcher,REPRESENTATION_TOOLS} from "../src/diagrams/representation-hub.js";
import {representationTool,activeRepresentationTool,activateRepresentationTool,switchRepresentationEditor,closeRepresentationTools,representationFigureKey,representationReturnNode} from "../src/diagrams/representation-registry.js";
import {FIRST_FIGURE_TYPES} from "../src/completing/first-figure-gallery.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {representationEmpty} from "../src/diagrams/workspace-ui.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const icon=name=>'<svg data-icon="'+name+'"></svg>';
const e=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;");
test("generator icon references resolve to local SVG definitions",()=>{
 const names=new Set([...read("index.html").matchAll(/<symbol\s+id="i-([^"]+)"/g)].map(m=>m[1]));
 const files=["src/completing/views.js","src/diagrams/representation-hub.js",...[
  "graph-view","stat-studio-view","table-studio-view","image-tracer-view","voronoi-view","geometry-view","probability-view"
 ].map(x=>"src/diagrams/"+x+".js")];
 const missing=[];
 for(const file of files)for(const match of read(file).matchAll(/\bicon\(\s*["']([^"']+)["']/g))
  if(!names.has(match[1]))missing.push(file+": "+match[1]);
 for(const tool of REPRESENTATION_TOOLS)if(!names.has(tool.icon))missing.push("tool "+tool.id+": "+tool.icon);
 assert.deepEqual(missing,[]);
});
test("focus is limited to C31 when a studio is open",()=>{
 const s={route:"completing",completion:{current:"C31"},graphStudio:{open:true}};
 assert.equal(representationFocusActive(s),true);
 assert.equal(representationFocusActive({...s,completion:{current:"C30"}}),false);
 assert.equal(representationFocusActive({...s,route:"planning"}),false);
 assert.equal(representationFocusActive({...s,graphStudio:{open:false}}),false);
});
test("studio toolbar has one Back control and all eight distinct diagram tools",()=>{
 const state=createProjectState();
 state.route="completing";state.completion.current="C31";
 state.completion.editorReturnNode="C40";
 assert(activateRepresentationTool(state,"voronoi"));
 const html=renderRepresentationSwitcher(state,icon,e);
 assert.match(html,/data-action="representation-return" data-node="C40"/);
 assert.match(html,/data-action="representation-back"/);
 assert(!html.includes('data-action="representation-jump"'),"Obsolete Create/Refine/Use strip should be removed");
 assert.equal((html.match(/data-action="representation-switch"/g)||[]).length,8);
 for(const tool of REPRESENTATION_TOOLS){
  assert.equal((html.match(new RegExp('data-representation-tool="'+tool.id+'"','g'))||[]).length,1);
  assert.match(html,new RegExp('data-icon="'+tool.icon+'"'));
  assert(html.includes(tool.navLabel),"The toolbar shows a short text label for "+tool.id);
 }
 assert.match(html,/data-representation-tool="voronoi" aria-current="page"/);
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
 assert.match(html,/aria-label="Diagram creators and return navigation"/);
});
test("toolbar Back uses the original library origin without duplicate return controls",()=>{
 const state=createProjectState();
 state.route="completing";state.completion.current="C31";
 state.ui.resourceCreatorReturnRoute="planning";
 assert(activateRepresentationTool(state,"geometry"));
 const html=renderRepresentationSwitcher(state,icon,e);
 assert.match(html,/data-action="resource-creator-return"/);
 assert.match(html,/aria-label="Back to Planning"/);
 assert.equal((html.match(/data-action="resource-creator-return"/g)||[]).length,1);
 assert.doesNotMatch(html,/data-action="representation-return"/);
 assert.match(html,/data-representation-tool="geometry" aria-current="page"/);
});

test("studios provide consistent empty states and a completion anchor",()=>{
 for(const name of ["graph-view","stat-studio-view","table-studio-view","image-tracer-view","voronoi-view"]){
  const source=read("src/diagrams/"+name+".js");
  assert.match(source,/representation-studio/);
  assert.match(source,/representationEmpty/);
  assert.match(source,/data-representation-step="use"/);
 }
 const html=representationEmpty(icon,e,{symbol:"image",title:"Choose a photo",description:"Upload a real photograph",action:"trace-upload",actionText:"Upload"});
 assert.match(html,/data-action="trace-upload"/);
 assert.match(html,/Choose a photo/);
});
test("focus CSS requires activation and does not remove the IA writing content",()=>{
 const styles=read("data/representation-workspace.css");
 assert.ok(styles.includes("body.representation-focus-active .sidebar"));
 assert.ok(styles.includes("body.representation-focus-active .completing-page"));
 const views=read("src/completing/views.js");
 assert.match(views,/representation-prelude/);
 assert.match(views,/firstPurpose/);
});

test("one registry supplies all creator stores, figure link keys, and gallery metadata",()=>{
 assert.equal(REPRESENTATION_TOOLS.length,8,"Every implemented generator should be registered exactly once");
 assert.deepEqual(new Set(REPRESENTATION_TOOLS.map(t=>t.id)).size,REPRESENTATION_TOOLS.length);
 const gallery=new Map(FIRST_FIGURE_TYPES.map(t=>[t.kind,t]));
 for(const tool of REPRESENTATION_TOOLS){
  assert.equal(representationTool(tool.id),tool);
  assert.equal(gallery.get(tool.id).studio,tool.studio);
  assert.equal(gallery.get(tool.id).entryKey,tool.entryKey);
  assert.equal(representationFigureKey(tool.id+":abc-12").id,"abc-12");
  assert.equal(representationFigureKey(tool.id+":abc-12").tool.id,tool.id);
 }
 assert.ok(representationTool("geometry"),"Pass 2 Geometry Studio is implemented");
 assert.ok(representationTool("probability"),"Pass 4 Probability Tree Studio is implemented");
 assert.equal(representationFigureKey("geometry:abc-12").id,"abc-12");
});
test("registry switching keeps exactly one editor open and preserves saved figure data",()=>{
 const state=createProjectState();
 state.graphStudio.draft.title="My existing graph";
 assert.equal(activateRepresentationTool(state,"graph"),true);
 assert.equal(activeRepresentationTool(state).id,"graph");
 assert.equal(activateRepresentationTool(state,"trace"),true);
 assert.equal(activeRepresentationTool(state).id,"trace");
 assert.equal(state.graphStudio.open,false);
 assert.equal(state.graphStudio.draft.title,"My existing graph");
 assert.equal(activateRepresentationTool(state,"probability"),true);
 assert.equal(activeRepresentationTool(state).id,"probability");
 assert.equal(state.imageTracer.open,false);
 closeRepresentationTools(state);
 assert.equal(activeRepresentationTool(state),null);
 const restored=normalizeProjectState(state);
 assert.equal(restored.graphStudio.draft.title,"My existing graph");
});
test("switching keeps unsaved drafts and never overwrites figures owned by another stage",()=>{
 const state=createProjectState();
 state.entries=[
  {id:"first",phase:"first",status:"planned",geometryFigureId:"geometry-earlier"},
  {id:"later",phase:"substantial",status:"planned"}
 ];
 state.completion.activeEntryIndex=1;
 const original=JSON.parse(JSON.stringify(state.geometryStudio.draft));
 original.title="Original saved geometry";
 state.geometryStudio.figures.push({id:"geometry-earlier",entryId:"first",savedAt:"2026-10-22",draft:original});
 state.geometryStudio.activeId="geometry-earlier";
 state.geometryStudio.draft.title="Unsaved geometry refinements";
 assert(activateRepresentationTool(state,"probability"));
 const result=switchRepresentationEditor(state,"geometry");
 assert.deepEqual(result,{ok:true,detached:true});
 assert.equal(activeRepresentationTool(state).id,"geometry");
 assert.equal(state.geometryStudio.activeId,"");
 assert.equal(state.geometryStudio.draft.title,"Unsaved geometry refinements");
 assert.equal(state.geometryStudio.figures[0].draft.title,"Original saved geometry");
 assert.equal(state.entries[0].geometryFigureId,"geometry-earlier");
 assert.equal(switchRepresentationEditor(state,"probability").ok,true);
 assert.deepEqual(switchRepresentationEditor(state,"geometry"),{ok:true,detached:false});
 assert.equal(state.geometryStudio.draft.title,"Unsaved geometry refinements");
 const restored=normalizeProjectState(state);
 assert.equal(restored.geometryStudio.figures[0].draft.title,"Original saved geometry");
 assert.equal(restored.geometryStudio.draft.title,"Unsaved geometry refinements");
});
test("same-stage linked figures keep their identity when switching tools",()=>{
 const state=createProjectState();
 state.entries=[{id:"this-stage",phase:"first",status:"planned",geometryFigureId:"geometry-current"}];
 state.completion.activeEntryIndex=0;
 state.geometryStudio.figures.push({id:"geometry-current",entryId:"this-stage",draft:state.geometryStudio.draft});
 state.geometryStudio.activeId="geometry-current";
 assert(activateRepresentationTool(state,"graph"));
 assert.deepEqual(switchRepresentationEditor(state,"geometry"),{ok:true,detached:false});
 assert.equal(state.geometryStudio.activeId,"geometry-current");
 assert.deepEqual(switchRepresentationEditor(state,"geometry"),{ok:false,detached:false});
});
test("return target follows the actual writing stage, with a first-stage fallback",()=>{
 const state=createProjectState();
 state.route="completing";state.completion.current="C31";
 assert.equal(representationReturnNode(state),"C30");
 state.entries=[
  {id:"first",phase:"first"},{id:"math1",phase:"substantial"},
  {id:"math2",phase:"substantial"}
 ];
 state.completion.activeEntryIndex=2;
 assert.equal(representationReturnNode(state),"C50");
 state.completion.editorReturnNode="C40";
 assert.equal(representationReturnNode(state),"C40");
 state.completion.editorReturnNode="";
 const toolbar=renderRepresentationSwitcher({...state,graphStudio:{open:true}},icon,e);
 assert.match(toolbar,/data-action="representation-return" data-node="C50"/);
});
