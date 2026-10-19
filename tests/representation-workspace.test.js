import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {representationFocusActive,renderRepresentationSwitcher,REPRESENTATION_TOOLS} from "../src/diagrams/representation-hub.js";
import {representationEmpty} from "../src/diagrams/workspace-ui.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const icon=name=>'<svg data-icon="'+name+'"></svg>';
const e=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;");
test("generator icon references resolve to local SVG definitions",()=>{
 const names=new Set([...read("index.html").matchAll(/<symbol\s+id="i-([^"]+)"/g)].map(m=>m[1]));
 const files=["src/completing/views.js","src/diagrams/representation-hub.js",...[
  "graph-view","stat-studio-view","table-studio-view","image-tracer-view","voronoi-view"
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
 assert.match(html,/data-action="representation-back"/);
 for(const stage of ["create","refine","use"])assert.ok(html.includes('data-representation-step="'+stage+'"'));
 assert.match(html,/Voronoi Studio/);
});
test("five studios provide consistent empty states and a completion anchor",()=>{
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
