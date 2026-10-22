import test from "node:test";
import assert from "node:assert/strict";
import {mathPng} from "../src/math/math-image.js";
import {mathSvg} from "../src/math/mixed-math.js";

const PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==";
function browser(t,encode=()=>"data:image/png;base64,"+PNG){
 const originals=new Map(["document","Image"].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const canvases=[],revoked=[];
 t.after(()=>{for(const [key,descriptor] of originals){
  if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
 }});
 globalThis.Image=class {set src(value){this.url=value;queueMicrotask(()=>this.onload());}};
 globalThis.document={createElement(tag){
  assert.equal(tag,"canvas");
  const canvas={width:0,height:0,
   getContext:()=>({clearRect(){},drawImage(){}}),
   // Deliberately never invoke the callback: the reproduced browser failure
   // must not make equation export depend on an idle toBlob callback.
   toBlob(){},
   toDataURL(type){assert.equal(type,"image/png");return encode();}};
  canvases.push(canvas);return canvas;
 }};
 t.mock.method(URL,"createObjectURL",()=>"blob:equation-test");
 t.mock.method(URL,"revokeObjectURL",value=>revoked.push(value));
 return {canvases,revoked};
}

test("equation PNG export completes without idle canvas callbacks and preserves bytes and dimensions",{timeout:2000},async t=>{
 const {canvases,revoked}=browser(t),tex="\\frac{17}{23}";
 const actual=await mathPng(tex),svg=mathSvg(tex);
 assert.deepEqual(actual.bytes,new Uint8Array(Buffer.from(PNG,"base64")));
 assert.equal(actual.pixelWidth,Math.ceil(svg.widthEx*28));
 assert.equal(actual.pixelHeight,Math.ceil(svg.heightEx*28));
 assert.equal(actual.tex,tex);
 assert.equal(canvases.length,1);
 assert.deepEqual(revoked,["blob:equation-test"]);
 assert.equal(await mathPng(tex),actual,"a completed image should be cached");
 assert.equal(canvases.length,1);
});

test("an unavailable canvas encoding fails clearly, releases its URL and can be retried",async t=>{
 let data="data:,";
 const {canvases,revoked}=browser(t,()=>data);
 const tex="\\sqrt{173}";
 await assert.rejects(mathPng(tex),/Could not save the mathematical rendering/);
 assert.deepEqual(revoked,["blob:equation-test"]);
 data="data:image/png;base64,";
 await assert.rejects(mathPng(tex),/Could not save the mathematical rendering/);
 data="data:image/png;base64,"+PNG;
 const retried=await mathPng(tex);
 assert.deepEqual(retried.bytes,new Uint8Array(Buffer.from(PNG,"base64")));
 assert.equal(canvases.length,3,"a failed encoding must not enter the image cache");
 assert.equal(revoked.length,3);
});

test("uncached equation images require an actual browser export environment",async()=>{
 await assert.rejects(mathPng("x_{98765}"),/must be exported from a browser/);
});
