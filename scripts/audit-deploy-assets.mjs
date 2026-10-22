/** Fail the production build if an original workbook/archive or an unbundled
 * stylesheet accidentally leaks into GitHub Pages, or if a required static
 * asset disappears. This checks deployed bytes, not student-owned JSON.
 */
import assert from "node:assert/strict";
import {readFile,readdir,stat} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {stylePaths} from "./build-styles.mjs";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
async function filesUnder(dir,relative=""){
 const results=[];
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const name=relative?relative+"/"+entry.name:entry.name;
  const abs=path.join(dir,entry.name);
  if(entry.isDirectory())results.push(...await filesUnder(abs,name));
  else if(entry.isFile())results.push(name);
  else throw new Error("Unexpected symlink in published website: "+name);
 }
 return results;
}
const allowed=file=>
 ["index.html","site.css","app.js","pdf.worker.min.mjs",
  "data/flow/nodes.json","data/flow/routes.json"].includes(file)||
 /^chunks\/[a-zA-Z0-9_.-]+\.js$/.test(file)||
 /^licenses\/(?:pdf-lib|docx|jszip|pdfjs-dist)-LICENSE\.txt$/.test(file);

export async function auditPublishedAssets({root=ROOT,out=path.join(root,"dist")}={}){
 const listing=(await filesUnder(out)).sort();
 assert(listing.length>=10,"Published website is missing expected static files");
 const unexpected=listing.filter(x=>!allowed(x));
 assert.deepEqual(unexpected,[],"Only runtime assets and necessary third-party notices may be published");
 const expected=[
  "index.html","site.css","app.js","pdf.worker.min.mjs",
  "data/flow/nodes.json","data/flow/routes.json",
  ...["pdf-lib","docx","jszip","pdfjs-dist"].map(n=>"licenses/"+n+"-LICENSE.txt")
 ];
 for(const file of expected)assert(listing.includes(file),"Required deployed asset missing: "+file);
 assert(!listing.some(x=>x.startsWith("vendor/")||x.startsWith("data/catalog/")||
  x.startsWith("data/sheets/")),"Source archives or duplicate prebuilt libraries were published");
 const html=await readFile(path.join(out,"index.html"),"utf8");
 const sourceHtml=await readFile(path.join(root,"index.html"),"utf8");
 const sourceLinks=stylePaths(sourceHtml);
 assert(sourceLinks.length>=25,"All diagram, onboarding and guidance CSS sources must remain available");
 assert(sourceHtml.includes('<script type="importmap">'),
  "Source-hosted PDF/Word dependencies still need the pinned import map");
 const styles=[...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(styles,["./site.css"],"Built HTML must load exactly one ordered CSS bundle");
 assert(!html.includes('<script type="importmap">'),
  "Do not reference unpublished source-only vendor files from a bundled page");
 const css=await readFile(path.join(out,"site.css"),"utf8");
 assert(css.includes(":root")&&css.includes("@media"),"Base and responsive styles must be included");
 const original=await Promise.all(sourceLinks.map(f=>readFile(path.join(root,f),"utf8")));
 for(const selector of [".criterion-field-help-rail",".conclusion-workspace",
  ".graph-studio",".stat-studio",".table-studio"]){
  // Some studios use more specifically named descendant selectors. Preserve
  // the source CSS and catch accidental omission of their entire stylesheets.
  const declared=original.some(s=>s.includes(selector));
  if(declared)assert(css.includes(selector),"Dropped live component styling: "+selector);
 }
 const totalBytes=(await Promise.all(listing.map(async file=>
  (await stat(path.join(out,file))).size))).reduce((sum,n)=>sum+n,0);
 return {totalFiles:listing.length,totalBytes,sourceCssCount:sourceLinks.length};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await auditPublishedAssets();
 process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
