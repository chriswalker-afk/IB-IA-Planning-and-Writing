import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createIllustrativeSample} from "../src/core/illustrative-samples.js";
import {illustrativeIAPagesModel,renderIllustrativeIAReading} from "../src/core/sample-ia-document.js";
import {sampleDocumentRecovery,sampleToolsReloadUrl} from "../src/core/sample-document-recovery.js";
import {createSamplePreview,PREVIEW_KEY} from "../src/core/sample-preview.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";

test("sample reading is independent of lazy PDF/Word modules",async()=>{
 const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
 const module=await readFile(new URL("../src/core/sample-ia-document.js",import.meta.url),"utf8");
 assert(app.includes('from "./src/core/sample-ia-document.js"'));
 assert(!app.includes('await import("./src/core/sample-ia-document.js")'));
 assert(!module.includes("import {createPdfPlanningReport} from"));
 assert(module.includes("await import('../handover/formats/pdf.js')"));
 for(const id of ["standing-reach","leaf-area","repayment-plans"]){
  const model=illustrativeIAPagesModel(createIllustrativeSample(id));
  const html=renderIllustrativeIAReading(model);
  assert(html.includes("Complete fictional investigation"),id);
  assert(html.includes('class="sample-reader-section"'),id);
  assert(html.includes('data-sample-figure='),id);
 }
});

test("missing JavaScript chunks give a specific, actionable reload message, not a generic failure",()=>{
 for(const e of [
  new TypeError("Failed to fetch dynamically imported module: https://site/chunks/pdf.js"),
  new TypeError("error loading dynamically imported module"),
  Object.assign(new Error("Loading chunk 17 failed"),{name:"ChunkLoadError"})
 ]){
  const recovery=sampleDocumentRecovery(e,"export");
  assert.equal(recovery.kind,"module");
  assert.equal(recovery.canReload,true);
  assert.match(recovery.title,/latest reading tools/);
  assert.match(recovery.message,/Reload the sample tools/);
  assert.match(recovery.message,/own investigation/);
 }
 const reader=sampleDocumentRecovery(new TypeError("Failed to fetch dynamically imported module"),"reader");
 assert.equal(reader.kind,"module");
});

test("sample errors are classified accurately; an invalid figure is not mistaken for a stale browser",()=>{
 const figure=sampleDocumentRecovery(new Error("Cannot render saved graph figure: Plot A"),"export");
 assert.equal(figure.kind,"figure");
 assert.equal(figure.canReload,false);
 assert.match(figure.message,/figure|diagram/i);
 for(const operation of ["reader","export"]){
  const error=sampleDocumentRecovery(new Error("Unexpected mathematical model error"),operation);
  assert.equal(error.kind,"other");
  assert.equal(error.canReload,true);
  assert.match(error.message,/unchanged/);
 }
});

test("cache-busted reload URL preserves existing route parameters and hash",()=>{
 const old="https://example.github.io/IB-IA-Planning-and-Writing/?mode=demo#start";
 const next=sampleToolsReloadUrl(old,123456);
 const u=new URL(next);
 assert.equal(u.pathname,"/IB-IA-Planning-and-Writing/");
 assert.equal(u.searchParams.get("mode"),"demo");
 assert.equal(u.searchParams.get("ia-tools-refresh"),"123456");
 assert.equal(u.hash,"#start");
 assert(!next.includes("PERSONAL"));
});

test("fictional preview persists through an explicit reload, separately from the personal investigation",()=>{
 const map=new Map(),storage={
  getItem:key=>map.get(key)||null,
  setItem:(key,value)=>map.set(key,value),
  removeItem:key=>map.delete(key)
 };
 const preview=createSamplePreview(storage,normalizeProjectState);
 const own=createProjectState();own.scratch.introduction="MY PRIVATE IA TEXT";
 const sample=createIllustrativeSample("standing-reach");
 preview.begin(own,sample,{scroll:0});
 sample.scratch.introduction+=" NOTE ADDED IN FICTIONAL SAMPLE";
 preview.save(sample);
 const snapshot=JSON.parse(storage.getItem(PREVIEW_KEY));
 assert.equal(snapshot.personal.scratch.introduction,"MY PRIVATE IA TEXT");
 assert(snapshot.preview.scratch.introduction.endsWith("NOTE ADDED IN FICTIONAL SAMPLE"));
 const resumed=createSamplePreview(storage,normalizeProjectState);
 const restored=resumed.resume();
 assert.equal(restored.demo,"standing-reach");
 assert(restored.scratch.introduction.endsWith("NOTE ADDED IN FICTIONAL SAMPLE"));
 assert.equal(resumed.leave().scratch.introduction,"MY PRIVATE IA TEXT");
});
