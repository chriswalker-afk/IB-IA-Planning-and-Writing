import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState,normalizeProjectState,STATE_VERSION,STORAGE_KEY}
 from "../src/core/project-state.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const jsonClone=value=>JSON.parse(JSON.stringify(value));

test("normal backup and hidden failure-recovery action are disambiguated without deleting either",()=>{
 const code=read("app.js");
 assert.equal((code.match(/data-backup-primary="true"/g)||[]).length,1);
 assert.equal((code.match(/data-backup-recovery="true"/g)||[]).length,1);
 assert.match(code,/data-export-recovery role="alert"/);
 assert.match(code,/fullExportFailure\?'':' hidden'/);
 assert.match(code,/button\("Download entire project \(\.json\)","export-json"/);
 assert.match(code,/button\("Download full JSON backup","export-json"/);
 assert.match(code,/case "export-json":exportJson\(\)/);
 assert.match(code,/case "import-json":\$\("#importFile"\)\.click\(\)/);
 assert.match(code,/if\(file.size>4_000_000\)/);
 assert.match(code,/const imported=normalise\(JSON\.parse\(await file\.text\(\)\)\)/);
 const confirm=code.indexOf('if(!window.confirm("Replace the current local project with this backup?"))return;');
 assert(confirm>0);
 assert(code.indexOf("state=imported;state.route=\"home\"",confirm)>confirm,
  "No imported project is installed until the student accepts.");
});

test("entire current project retains planned mathematics, saved figure and self-review on JSON round-trip",()=>{
 const v2=createProjectState();
 v2.project.aim="Compare measurements from two methods";
 v2.project.course="AA SL";
 v2.scratch.introduction="My own research motivation.";
 v2.ui.adviceMode="reduced";
 v2.entries=[{id:"first",title:"My proposed graph",phase:"first",status:"planned",
  result:"",figureRefs:["graph:figure-release-1"],graphFigureId:"figure-release-1"}];
 v2.graphStudio.figures=[{id:"figure-release-1",entryId:"first",savedAt:"2026-10-24",
  draft:jsonClone(v2.graphStudio.draft)}];
 v2.graphStudio.activeId="figure-release-1";
 v2.resources.preferences["entry:graph"]={tool:"desmos",image:"points"};
 v2.completion.review.records["draft-D02"].location="Page 3";
 const restored=normalizeProjectState(jsonClone(v2));
 assert.equal(restored.version,STATE_VERSION);
 assert.equal(restored.project.aim,v2.project.aim);
 assert.equal(restored.scratch.introduction,v2.scratch.introduction);
 assert.equal(restored.entries[0].status,"planned");
 assert.equal(restored.entries[0].result,"");
 assert.deepEqual(restored.entries[0].figureRefs,["graph:figure-release-1"]);
 assert.equal(restored.graphStudio.figures[0].id,"figure-release-1");
 assert.equal(restored.graphStudio.activeId,"figure-release-1");
 assert.deepEqual(restored.resources.preferences["entry:graph"],{tool:"desmos",image:"points"});
 assert.equal(restored.completion.review.records["draft-D02"].location,"Page 3");
 assert.equal(restored.ui.adviceMode,"reduced");
 assert.deepEqual(restored.evidence.results,[]);
 assert.equal(JSON.stringify(v2).includes("Project backup restored."),false);
});

test("old v1 project retains notes, teacher flag and proposed work without fabricating results",()=>{
 const legacy={version:1,route:"home",
  project:{ideaStatus:"yes",aim:"Is my hypothesis reasonable?",course:"AA HL",
   precision:"0.1 cm",permissions:"pending"},
  ui:{planStep:6,planMax:6,studioSection:"math"},
  scratch:{introduction:"I chose this question for a personal reason."},
  entries:[{id:"old-step",status:"planned",title:"Potential calculation",result:""}],
  cueNotes:{"interpret-old-step":"Original student reflection"}};
 const fresh=normalizeProjectState(jsonClone(legacy));
 assert.equal(fresh.version,2);
 assert.equal(fresh.journey.answers.N01,legacy.project.aim);
 assert.equal(fresh.project.course,"AA HL");
 assert.equal(fresh.teacher.pendingApproval,true);
 assert.equal(fresh.scratch.introduction,legacy.scratch.introduction);
 assert.equal(fresh.entries[0].status,"planned");
 assert.equal(fresh.entries[0].result,"");
 assert.equal(fresh.cueNotes["interpret-old-step"],"Original student reflection");
 assert.deepEqual(fresh.evidence.results,[]);
 const again=normalizeProjectState(jsonClone(fresh));
 assert.equal(again.project.aim,legacy.project.aim);
 assert.equal(again.entries[0].status,"planned");
 assert.equal(again.scratch.introduction,legacy.scratch.introduction);
});

test("bad backup schemas are rejected before the replace confirmation",()=>{
 for(const v of [
  {version:99,project:{aim:"Danger"}},
  {version:2,project:null},
  {project:{aim:"Missing version"}},
  {version:1,project:[]},
  null
 ])assert.throws(()=>normalizeProjectState(v),/compatible Pathfinder project/);
 assert.equal(STORAGE_KEY,"ia-pathfinder-prototype-v1");
});

test("full conformance selectors target the public backup even when error recovery is in DOM",()=>{
 const resources=read("scripts/resources-browser.py");
 const essentials=read("scripts/essentials-browser.py");
 for(const contents of [resources,essentials]){
  assert(contents.includes('[data-backup-primary="true"]:visible'),"Must choose visible primary action.");
  assert(!contents.includes('p.locator(\'.drawer [data-action="export-json"]\').click()'),
   "Do not use ambiguous duplicate-action selector.");
 }
 assert(resources.includes('[data-backup-recovery="true"]'));
 const browser=read("scripts/release-backup-browser.py");
 for(const term of ["modern_roundtrip","legacy_roundtrip","invalid-project.json",
  "dialog.dismiss()","is_mobile=width<=390","figure-release-1","set_input_files",
  "v1-migrated.json","data-backup-primary"])assert(browser.includes(term),term);
 const workflow=read(".github/workflows/release-backup-browser.yml");
 for(const term of ["npm run build","scripts/release-backup-browser.py",
  "setup-ci-browser","actions/upload-artifact"])assert(workflow.includes(term),term);
});
