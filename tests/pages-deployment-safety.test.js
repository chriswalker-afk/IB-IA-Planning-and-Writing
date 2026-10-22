import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 pendingLegacyPagesRun,publishingMode,waitForLegacyPagesBuild
} from "../scripts/wait-for-legacy-pages-build.mjs";

const SHA="0123456789abcdef";
const LEGACY={id:42,head_sha:SHA,name:"pages build and deployment",event:"dynamic",status:"completed",conclusion:"success",created_at:"2026-10-22T06:41:00Z"};
const response=data=>({ok:true,json:async()=>data});
const pagesLegacy={build_type:"legacy",source:{branch:"main",path:"/"}};
const pagesWorkflow={build_type:"workflow"};

test("Pages setting distinguishes the correct built workflow from branch hosting",()=>{
 assert.equal(publishingMode(pagesWorkflow),"workflow");
 assert.equal(publishingMode(pagesLegacy),"legacy");
 assert.equal(publishingMode({source:{branch:"main",path:"/"}}),"legacy");
 assert.throws(()=>publishingMode({}),/Cannot determine Pages publishing mode/);
});
test("only the Pages branch build for this exact revision can unblock deployment",()=>{
 const irrelevant=[
  {...LEGACY,id:11,head_sha:"another-sha"},
  {...LEGACY,id:12,event:"push"},
  {...LEGACY,id:13,name:"Deploy IA Pathfinder"}];
 assert.equal(pendingLegacyPagesRun({workflow_runs:irrelevant},SHA),null);
 assert.equal(pendingLegacyPagesRun({workflow_runs:[...irrelevant,{...LEGACY,id:14}]},SHA).id,14);
 assert.equal(pendingLegacyPagesRun({workflow_runs:[LEGACY,{...LEGACY,id:15,created_at:"2026-10-22T06:42:00Z"}]},SHA).id,15);
});
test("Actions-based publishing never waits for an unrelated workflow",async()=>{
 const paths=[];
 const request=async url=>{paths.push(url);return response(pagesWorkflow);};
 const done=await waitForLegacyPagesBuild({repository:"example/ia",sha:SHA,token:"fictional",request,sleep:()=>{throw Error("Should not sleep");}});
 assert.deepEqual(done,{mode:"workflow",waited:false});
 assert.equal(paths.length,1);
 assert.match(paths[0],/\/pages$/);
});
test("legacy Pages deployment must complete first even when built job is ready",async()=>{
 const paths=[],states=[
  {workflow_runs:[]},
  {workflow_runs:[{...LEGACY,status:"in_progress",conclusion:null}]},
  {workflow_runs:[LEGACY]}
 ];
 let steps=0;
 const request=async url=>{
  paths.push(url);
  return response(url.endsWith("/pages")?pagesLegacy:states[Math.min(steps++,states.length-1)]);
 };
 let sleeps=0;
 const done=await waitForLegacyPagesBuild({repository:"example/ia",sha:SHA,token:"fictional",
  request,sleep:async()=>{sleeps++;},attempts:5});
 assert.deepEqual(done,{mode:"legacy",waited:true,runId:42});
 assert.equal(sleeps,2);
 assert.equal(paths.length,4);
 assert(paths.every(path=>path.includes("api.github.com")));
 assert(paths[1].includes("head_sha="+SHA));
});
test("if competing deploy is still running, fail instead of risking unbundled site",async()=>{
 const request=async url=>response(url.endsWith("/pages")?pagesLegacy:
  {workflow_runs:[{...LEGACY,status:"in_progress",conclusion:null}]});
 await assert.rejects(()=>waitForLegacyPagesBuild({repository:"example/ia",sha:SHA,token:"fictional",
  request,sleep:async()=>{},attempts:2}),/did not finish/);
});
test("publishing gate runs after build and before deploy-pages and can query Actions",()=>{
 const wf=readFileSync(".github/workflows/deploy-pages.yml","utf8");
 assert(wf.includes("actions: read"));
 assert(wf.includes("pages: write"));
 const build=wf.indexOf("npm run build"),guard=wf.indexOf("node scripts/wait-for-legacy-pages-build.mjs"),deploy=wf.indexOf("uses: actions/deploy-pages@v4");
 assert(build>=0&&guard>build&&deploy>guard,"Build, race guard and deploy must run in that order");
 assert(wf.includes("actions/upload-pages-artifact@v3"));
});
