import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {representationFocusActive,renderRepresentationSwitcher,REPRESENTATION_TOOLS} from "../src/diagrams/representation-hub.js";
import {representationTool,activeRepresentationTool,activateRepresentationTool,closeRepresentationTools,representationFigureKey,representationReturnNode} from "../src/diagrams/representation-registry.js";
import {FIRST_FIGURE_TYPES} from "../src/completing/first-figure-gallery.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {representationEmpty} from "../src/diagrams/workspace-ui.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const icon=name=>'<svg data-icon="'+name+'"></svg>';
const e=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;");
test("generator icon references resolve to local SVG definitions",()=>{
 const names=new Set([...read("index.html").matchAll(/<symbol\s+id="i-([^"]+)"/g)].map(m=>m[1]));
 const files=["src/completing/views.js","src/diagrams/representation-hub.js",...[
  "graph-view","stat-studio-view","table-studio-view","image-tracer-view","voronoi-view","geometry-view"
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
test("shared toolbar offers IA return, all tools, and three stages",()=>{
 const html=renderRepresentationSwitcher({route:"completing",completion:{current:"C31"},voronoiStudio:{open:true}},icon,e);
 assert.match(html,/data-node="C30"/);
 assert.match(html,/data-action="representation-return"/);
 assert.match(html,/data-action="representation-back"/);
 for(const stage of ["create","refine","use"])assert.ok(html.includes('data-representation-step="'+stage+'"'));
 assert.match(html,/Voronoi Studio/);
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
 assert.equal(REPRESENTATION_TOOLS.length,6,"Only implemented generators should be listed");
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
 assert.equal(representationTool("probability"),null,"Probability editor is not implemented in Pass 1");
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
 assert.equal(activateRepresentationTool(state,"probability"),false);
 assert.equal(activeRepresentationTool(state).id,"trace");
 closeRepresentationTools(state);
 assert.equal(activeRepresentationTool(state),null);
 const restored=normalizeProjectState(state);
 assert.equal(restored.graphStudio.draft.title,"My existing graph");
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
