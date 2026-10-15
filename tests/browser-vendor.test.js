import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";

const read=relative=>readFile(new URL("../"+relative,import.meta.url),"utf8");
test("static hosting resolves every document library before loading the app",async()=>{
 const html=await read("index.html");
 const tag=html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
 assert(tag,"A source-hosted browser needs an import map for npm dependencies");
 const map=JSON.parse(tag[1]).imports;
 assert(html.indexOf(tag[0])<html.indexOf('<script type="module"'));
 for(const name of ["pdf-lib","docx","jszip","pdfjs-dist/legacy/build/pdf.mjs"]){
  assert(map[name]?.startsWith("./vendor/"),name+" must be self-hosted, not a CDN");
  assert((await read(map[name].slice(2))).length>1000,name+" browser bundle is missing");
 }
});
test("committed browser libraries and PDF worker match the pinned dependency manifest",async()=>{
 const pkg=JSON.parse(await read("package.json"));
 const manifest=JSON.parse(await read("vendor/manifest.json"));
 for(const [name,version] of Object.entries(manifest.packages))assert.equal(version,pkg.dependencies[name]);
 for(const [file,hash] of Object.entries(manifest.sha256)){
  const bytes=await readFile(new URL("../"+file,import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"),hash,file+" must be regenerated with its manifest");
 }
 for(const name of Object.keys(manifest.packages))assert((await read("vendor/"+name+"-LICENSE.txt")).length>100);
});
