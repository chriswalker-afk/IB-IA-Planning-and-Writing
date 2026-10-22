import test from "node:test";
import assert from "node:assert/strict";
import {readFile,mkdtemp,rm,stat} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {buildSiteStyles,stylePaths} from "../scripts/build-styles.mjs";

const root=fileURLToPath(new URL("../",import.meta.url));
const read=relative=>readFile(path.join(root,relative),"utf8");

test("Pass 3 compiles every original stylesheet in DOM order into one minified file",async()=>{
 const original=await read("index.html");
 const paths=stylePaths(original);
 assert.equal(paths[0],"styles.css");
 assert.equal(paths.at(-1),"data/math-writing.css");
 assert.equal(paths.length,29);
 const scratch=await mkdtemp(path.join(tmpdir(),"ia-pass3-css-"));
 try{
  const compiled=await buildSiteStyles({root,out:scratch,html:original});
  const output=await readFile(path.join(scratch,"site.css"),"utf8");
  assert.deepEqual(compiled.files,paths);
  assert(compiled.publishedBytes<compiled.originalBytes,"CSS minification should reduce transfer bytes");
  assert.equal((compiled.html.match(/rel="stylesheet"/g)||[]).length,1);
  assert(compiled.html.includes('href="./site.css"'));
  assert(!compiled.html.includes('href="./data/'));
  assert(output.includes("fonts.googleapis.com"),"Keep source font loading and typography");
  for(const css of ["data/graph-studio.css","data/stat-studio.css",
   "data/table-studio.css","data/geometry-studio.css","data/probability-studio.css",
   "data/image-tracer.css","data/representation-voronoi.css"]){
   const source=await read(css);
   const selector=source.match(/\.([a-zA-Z][a-zA-Z0-9-]+)/);
   assert(selector,"Expected named selector in "+css);
   // Minification may combine selectors but cannot rename normal classes.
   assert(output.includes("."+selector[1]),"Missing CSS for "+css+": "+selector[1]);
  }
  assert((await stat(path.join(root,"data/catalog/records.json"))).size>100000,
   "Original source data must remain intact in GitHub");
  assert((await stat(path.join(root,"data/sheets/nodes.json")).size>0,
   "Original source worksheets must remain intact in GitHub");
 }finally{await rm(scratch,{recursive:true,force:true});}
});

test("source index keeps standalone styles and pinned import map for direct hosting",async()=>{
 const html=await read("index.html"),build=await read("scripts/build.mjs");
 assert(stylePaths(html).length>=25);
 assert(html.includes('<script type="importmap">'));
 assert(build.includes("buildSiteStyles"),"Production build must bundle styles");
 assert(build.includes("auditPublishedAssets"),"Production build must verify deployed assets");
 assert(build.includes('"data/flow"'),"Original route data must remain available for source references");
 assert(!build.includes('cp(path.join(cwd,"data"),path.join(out,"data")'),
  "Do not publish all source-workbook JSON by copying the data directory");
 assert(!build.includes('cp(path.join(cwd,"vendor"),path.join(out,"vendor")'),
  "The bundled website must not publish duplicate npm libraries");
 assert((await read("src/essentials/assessment-cohorts.js")).includes("revised2029"),
  "Preparation for revised IA criteria is protected");
});
