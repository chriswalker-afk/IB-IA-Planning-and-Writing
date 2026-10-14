import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const manifest=read("../data/catalog/index.json");
const index=read("../data/catalog/records.json");
const parts=[1,2,3].map(n=>read("../data/catalog/audit-part-"+n+".json"));
test("source manifest covers every original worksheet exactly once",()=>{
 assert.equal(manifest.capturedTabs,24);
 assert.equal(manifest.tabs.length,24);
 assert.equal(new Set(manifest.tabs.map(t=>t.name)).size,24);
 assert(manifest.tabs.some(t=>t.name==="Writing Moments"));
 assert(manifest.tabs.some(t=>t.name==="Next Mathematical Step"));
});
test("every preserved worksheet is available with source row references",()=>{
 for(const tab of manifest.tabs){
   const source=read("../"+tab.sourcePath);
   assert.equal(source.sourceSheet,tab.name);
   assert.equal(source.rowCount,tab.capturedRows);
   assert(source.rows.every(r=>Number.isInteger(r.row)&&r.row>0&&Array.isArray(r.cells)));
   assert.equal(source.rows.at(-1)?.row,tab.lastPopulatedRow);
 }
});
test("normalised flow and compact registry agree with indexed entries",()=>{
 const records=parts.flatMap(x=>x.items.flatMap(y=>y.records));
 assert.equal(index.count,1430);assert.equal(records.length,1430);
 assert.equal(new Set(index.records.map(x=>x.id)).size,index.count);
 assert(index.records.some(x=>x.id==="Nodes:N00"));
 assert(index.records.some(x=>x.id==="Writing Moments:W01@9"));
 assert(index.records.some(x=>x.id==="Next Mathematical Step:L01@9"));
 assert.equal(records.filter(r=>r.type==="flow-route").length,284);
 assert.equal(records.filter(r=>r.type==="flow-node").length,84);
});
test("source's draft-vs-agreed distinction is not lost in the capture",()=>{
 const nodes=read("../data/flow/nodes.json").nodes;
 assert.equal(nodes.filter(x=>x.editorialStatus==="Agreed").length,41);
 assert.equal(nodes.filter(x=>x.editorialStatus==="Working draft").length,42);
 assert.equal(nodes.filter(x=>x.editorialStatus==="Needs discussion").length,1);
});
test("coverage register never labels raw source data as fully implemented",()=>{
 const csv=readFileSync(new URL("../docs/coverage.csv",import.meta.url),"utf8");
 assert(csv.includes("prototype-partial"));
 assert(csv.includes("not-implemented"));
 assert(!csv.includes('"implemented"'));
 const rows=csv.trimEnd().split("\n");
 assert.equal(rows.length,1431);
});
