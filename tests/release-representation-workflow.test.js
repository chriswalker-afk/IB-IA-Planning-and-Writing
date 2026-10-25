import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState} from "../src/core/project-state.js";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {REPRESENTATION_TOOLS,activateRepresentationTool} from "../src/diagrams/representation-registry.js";
import {representationOutputActions} from "../src/diagrams/workspace-ui.js";
import {representationWorkflowState,renderRepresentationWorkflow} from "../src/diagrams/representation-workflow.js";
import {renderRepresentationSwitcher} from "../src/diagrams/representation-hub.js";
import {renderGraphActions} from "../src/diagrams/graph-view.js";
import {statOutputHtml} from "../src/diagrams/stat-studio-view.js";
import {tableOutputHtml} from "../src/diagrams/table-studio-view.js";
import {traceOutputHtml} from "../src/diagrams/image-tracer-view.js";
import {voronoiOutputHtml} from "../src/diagrams/voronoi-view.js";
import {geometryOutputHtml} from "../src/diagrams/geometry-view.js";
import {distributionOutputHtml} from "../src/diagrams/distribution-view.js";
import {probabilityOutputHtml} from "../src/diagrams/probability-view.js";
import {stylePaths} from "../scripts/build-styles.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

const ACTIONS=Object.freeze({
 graph:{save:"graph-save",link:"graph-use",export:["graph-copy","graph-png","graph-svg"]},
 stat:{save:"stat-save",link:"stat-use",export:["stat-copy","stat-png","stat-svg","stat-csv"]},
 table:{save:"table-save",link:"table-use",export:["table-editable","table-html","table-png","table-svg","table-copy","table-csv"]},
 trace:{save:"trace-save",link:"trace-use",export:["trace-copy","trace-png","trace-svg","trace-csv"]},
 voronoi:{save:"voronoi-save",link:"voronoi-use",export:["voronoi-svg","voronoi-png","voronoi-csv","voronoi-copy"]},
 geometry:{save:"geometry-save",link:"geometry-use",export:["geometry-svg","geometry-png"]},
 distribution:{save:"distribution-save",link:"distribution-use",export:["distribution-svg","distribution-png"]},
 probability:{save:"probability-save",link:"probability-use",export:["probability-svg","probability-png"]}
});
const render=(state)=>({
 graph:renderGraphActions(state.graphStudio,icon,escapeHtml),
 stat:statOutputHtml(state.statStudio,icon,escapeHtml),
 table:tableOutputHtml(state.tableStudio,icon),
 trace:traceOutputHtml(state.imageTracer,icon,escapeHtml),
 voronoi:voronoiOutputHtml(state.voronoiStudio,icon),
 geometry:geometryOutputHtml(state.geometryStudio,icon),
 distribution:distributionOutputHtml(state.distributionStudio,icon,escapeHtml),
 probability:probabilityOutputHtml(state.probabilityStudio,icon)
});

test("one shared output hierarchy preserves all eight specialist save/link/export handlers",()=>{
 const state=createProjectState(),html=render(state);
 assert.equal(REPRESENTATION_TOOLS.length,8);
 assert.deepEqual(REPRESENTATION_TOOLS.map(x=>x.id).sort(),Object.keys(ACTIONS).sort());
 for(const [type,{save,link,export:outputs}] of Object.entries(ACTIONS)){
  const source=html[type];
  assert(source.includes('data-representation-actions="'+type+'"'),type+" missing workflow");
  assert(source.includes('data-action="'+save+'"'),type+" draft save missing");
  assert(source.includes('data-action="'+link+'"'),type+" stage link missing");
  assert(source.includes("Save &amp; link")||source.includes("Save & link"),type+" link title missing");
  assert(source.includes("Save editable draft"),type+" draft label missing");
  for(const id of outputs)assert(source.includes('data-action="'+id+'"'),type+": "+id);
  assert(source.includes("Copying or downloading makes a file"),type+" export explanation");
  assert(source.includes("data-representation-ready="),type+" readiness gating");
 }
});

test("unready figures disable save, link and export equally without blocking data entry",()=>{
 const html=representationOutputActions(icon,escapeHtml,{
  type:"graph",ready:false,saveAction:"graph-save",linkAction:"graph-use",
  formats:[["graph-svg","Download SVG","download"]]
 });
 assert.equal((html.match(/ disabled aria-disabled="true"/g)||[]).length,3);
 assert.equal((html.match(/data-action="/g)||[]).length,3);
 assert.match(html,/data-representation-ready="false"/);
 assert.match(html,/aria-label="Keep an editable saved figure"/);
 assert.match(html,/aria-label="Copy or download a finished figure"/);
 const okay=representationOutputActions(icon,escapeHtml,{
  type:"graph",ready:true,saveAction:"graph-save",linkAction:"graph-use",formats:[["graph-svg","Download SVG"]]
 });
 assert.doesNotMatch(okay,/aria-disabled="true"/);
 assert.match(okay,/data-representation-ready="true"/);
});

test("readiness workflow works for every registered tool without changing project data",()=>{
 const state=createProjectState(),initial=JSON.stringify(state);
 state.route="completing";state.completion.current="C31";
 for(const {id} of REPRESENTATION_TOOLS){
  assert(activateRepresentationTool(state,id));
  const before=JSON.stringify(state);
  const status=representationWorkflowState(state);
  assert.equal(status.tool,id);
  assert.equal(typeof status.ready,"boolean");
  assert.equal(status.saved,false);
  assert.equal(status.linked,false);
  assert.equal(JSON.stringify(state),before,id+" readiness must be read-only");
  const html=renderRepresentationWorkflow(status,icon,escapeHtml);
  assert(html.includes('data-representation-workflow="'+id+'"'));
  assert.equal((html.match(/data-workflow-step="/g)||[]).length,4);
  assert(html.includes("not evidence of an IA grade"));
 }
 assert.notEqual(JSON.stringify(state),initial,"Test changed only explicit studio-selection flags");
});

test("saved-copy status distinguishes a stored figure from a stage link without declaring completion",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C31";activateRepresentationTool(s,"graph");
 s.graphStudio.figures=[{id:"figure-test",draft:s.graphStudio.draft,savedAt:"2026-10-23",entryId:""}];
 s.graphStudio.activeId="figure-test";
 let status=representationWorkflowState(s);
 assert(status.saved);
 assert(!status.linked);
 s.entries=[{id:"mathematics-1",phase:"first",status:"planned",graphFigureId:"figure-test"}];
 s.completion.activeEntryIndex=0;
 status=representationWorkflowState(s);
 assert(status.saved&&status.linked);
 assert.equal(s.entries[0].status,"planned","Linking a figure is not a completed result");
 assert.equal(status.label==="Saved copy linked to this stage"||status.label==="Needs checks",true);
});

test("switcher gives truthful return context and preserves the eight-tool chooser",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C31";
 activateRepresentationTool(s,"probability");
 let html=renderRepresentationSwitcher(s,icon,escapeHtml);
 assert.equal((html.match(/data-action="representation-switch"/g)||[]).length,8);
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
 assert.match(html,/Back to first mathematics/);
 assert.match(html,/data-action="representation-return"/);
 assert.match(html,/data-action="representation-back"/);
 assert.match(html,/data-representation-workflow="probability"/);
 s.ui.resourceCreatorReturnRoute="planning";
 html=renderRepresentationSwitcher(s,icon,escapeHtml);
 assert.match(html,/Tools &amp; tutorials/);
 assert.match(html,/Back to Planning/);
 assert.match(html,/data-action="resource-creator-return"/);
 assert.doesNotMatch(html,/data-action="representation-return"/);
});

test("pass 4 keeps production styles and existing safety boundaries",()=>{
 const paths=stylePaths(read("index.html"));
 assert.equal(paths.length,37);
 assert(paths.includes("data/release-representation.css"));
 assert.equal(paths.at(-1),"data/release-accessibility.css");
 for(const path of ["data/representation-workspace.css","data/release-design-system.css",
  "data/release-guidance.css","data/graph-studio.css","data/probability-studio.css"])
  assert(paths.includes(path),path);
 const css=read("data/release-representation.css");
 for(const term of ["representation-figure-formats","representation-workflow",
  "@media(max-width:760px)","@media(max-width:380px)","prefers-reduced-motion:reduce","focus-visible"])
  assert(css.includes(term),term);
 const app=read("app.js");
 for(const action of Object.values(ACTIONS).flatMap(x=>[x.link,x.save,...x.export]))
  assert(app.includes('"'+action+'"'),"Missing original application handler: "+action);
 assert(app.includes('returnToShowingFirstMaths("representation-return")'),
  "Tool-switch navigation must still return to its original mathematical stage");
});
