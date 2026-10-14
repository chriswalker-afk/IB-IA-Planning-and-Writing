import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState,loadProjectState,persistProjectState,registerNodeAnswer,STATE_VERSION,STORAGE_KEY} from "../src/core/project-state.js";
import {readRecordValue,updateRecordValue} from "../src/core/record-access.js";

test("new project schema has explicit source, evidence, teacher, and writing state",()=>{
 const p=createProjectState();
 assert.equal(p.version,STATE_VERSION);assert.equal(p.journey.currentNodeId,"N00");
 assert.deepEqual(p.evidence.methods,[]);assert.deepEqual(p.teacher.checkpoints,[]);
 assert.deepEqual(p.writingLedger,{});
});
test("version-one progress is migrated without losing earlier answers or pretending planned work was done",()=>{
 const legacy={version:1,route:"completing",project:{aim:"Does this pattern hold?",ideaStatus:"yes",precision:"nearest 0.1 cm",permissions:"pending",prediction:"Maybe"},ui:{planStep:6,planMax:6,studioSection:"math",mathPhase:"work",mathIndex:0},
 entries:[{id:"step1",status:"planned",title:"Find the association"}],cues:{"interpret-step1":"done"},cueNotes:{"interpret-step1":"old note"},scratch:{introduction:"Student-written text"}};
 const p=normalizeProjectState(legacy);
 assert.equal(p.version,2);assert.equal(p.project.aim,legacy.project.aim);
 assert.equal(p.project.precision,"nearest 0.1 cm");assert.equal(p.teacher.pendingApproval,true);
 assert.equal(p.journey.currentNodeId,"N04S");assert.equal(p.journey.answers.N01,legacy.project.aim);
 assert.equal(p.scratch.introduction,"Student-written text");
 assert.equal(p.entries[0].status,"planned");assert.equal(p.evidence.results.length,0);
 assert.equal(p.cues["interpret-step1"],"done");
});
test("v2 round trip keeps source-linked route history and pending teacher checks",()=>{
 const p=createProjectState();
 p.project.aim="Explore a conjecture";p.journey.currentNodeId="C35";
 p.journey.answers.N02="No data";p.journey.history=[{from:"N02",to:"N02T",answer:"No data"}];
 p.teacher.pendingApproval=true;
 const n=normalizeProjectState(JSON.parse(JSON.stringify(p)));
 assert.equal(n.journey.currentNodeId,"C35");assert.equal(n.journey.answers.N02,"No data");
 assert.equal(n.teacher.pendingApproval,true);assert.equal(n.journey.history[0].to,"N02T");
});
test("rejects unsupported backup versions and invalid document shapes",()=>{
 assert.throws(()=>normalizeProjectState({version:99,project:{}}),/compatible/);
 assert.throws(()=>normalizeProjectState({version:2,project:null}),/compatible/);
});
test("local browser store retains the original key name across upgrade",()=>{
 const memory=new Map();const storage={setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)??null};
 const p=createProjectState();p.project.aim="My own question";persistProjectState(p,storage);
 assert(memory.has(STORAGE_KEY));
 assert.equal(loadProjectState(storage).project.aim,"My own question");
});
test("restricted field binding supports old input paths but rejects prototype pollution",()=>{
 const p=createProjectState();p.entries.push({result:""});
 assert.equal(updateRecordValue(p,"project.aim","A question"),true);
 assert.equal(updateRecordValue(p,"entries.0.result","A real calculation"),true);
 assert.equal(updateRecordValue(p,"cueNotes.interpret-test","Own note"),true);
 assert.equal(readRecordValue(p,"cueNotes.interpret-test"),"Own note");
 assert.equal(updateRecordValue(p,"__proto__.polluted",true),false);
 assert.equal(updateRecordValue(p,"project.__proto__.polluted",true),false);
 assert.equal(updateRecordValue(p,"teacher.pendingApproval",false),false);
 assert.equal({}.polluted,undefined);
});
test("source node answers have explicit IDs and do not automatically imply results",()=>{
 const p=createProjectState();registerNodeAnswer(p,"N02","Statistics");
 assert.equal(p.journey.answers.N02,"Statistics");
 assert.equal(p.evidence.results.length,0);
 assert.throws(()=>registerNodeAnswer(p,"<invalid>","Yes"),/Invalid/);
});
