import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newDistributionDraft,newDistributionStudio,normalizeDistributionStudio,
 analyzeDistribution} from "../src/diagrams/distribution-core.js";
import {renderDistributionStudio} from "../src/diagrams/distribution-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {distributionInverseResultHtml,renderDistributionInverseHtml} from "../src/diagrams/distribution-inverse-view.js";
import {setDistributionInverseField,calculateDistributionInverse,applyDistributionInverse,
 currentDistributionInverse} from "../src/diagrams/distribution-inverse-actions.js";
import {setDistributionField,freshDistribution,loadDistribution,saveDistributionDraft} from "../src/diagrams/distribution-actions.js";
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const approx=(actual,want,tol=1e-9)=>assert.ok(Math.abs(actual-want)<=tol,"Expected "+actual+" ≈ "+want);
const prepare=(kind,fields={})=>{
 const studio=newDistributionStudio();studio.open=true;
 studio.draft={...newDistributionDraft(),title:"A theoretical probability model",symbol:"T",kind,...fields};
 return studio;
};
test("inverse calculator is visible as an optional editor tool but excluded from clean figures",()=>{
 const state=createProjectState();state.distributionStudio=prepare("normal");
 const html=renderDistributionStudio(state,()=>"",e);
 assert.match(html,/data-distribution-inverse-panel/);
 assert.match(html,/Find a boundary from a probability/);
 assert.match(html,/data-action="distribution-inverse-calculate"/);
 assert.match(html,/data-distribution-inverse-field="mode"/);
 assert.match(html,/value="central"/);
 const svg=renderDistributionSvg(state.distributionStudio.draft);
 assert.doesNotMatch(svg,/Find a boundary|Requested probability|Achieved probability|inverse/);
 assert.doesNotMatch(svg,/data-distribution-inverse/);
});
test("calculating never edits a figure; applying a continuous inverse interval does",()=>{
 const studio=prepare("normal",{mu:"70",sigma:"10"});
 const before=JSON.stringify(studio.draft);
 assert.equal(setDistributionInverseField(studio,"mode","central"),true);
 assert.equal(setDistributionInverseField(studio,"probability","0.95"),false,"default already 0.95");
 const result=calculateDistributionInverse(studio);
 assert.equal(result.ok,true);approx(result.achieved,.95,1e-9);
 assert.equal(JSON.stringify(studio.draft),before);
 const presentation=distributionInverseResultHtml(studio,e);
 assert.match(presentation,/Requested probability/);assert.match(presentation,/Achieved probability/);
 assert.match(presentation,/Apply boundary to figure/);
 assert.doesNotMatch(renderDistributionSvg(studio.draft),/data-distribution-shading/);
 const applied=applyDistributionInverse(studio);
 assert.equal(applied.ok,true);
 assert.equal(applied.changed,true);
 assert.equal(studio.draft.mode,"between");
 approx(Number(studio.draft.lower),50.40036015,1e-7);
 approx(Number(studio.draft.upper),89.59963985,1e-7);
 approx(analyzeDistribution(studio.draft).probability,.95,1e-9);
 assert.match(renderDistributionSvg(studio.draft),/data-distribution-shading="normal"/);
 assert.match(distributionInverseResultHtml(studio,e),/Applied to the figure/);
 assert.doesNotMatch(renderDistributionSvg(studio.draft),/Calculated boundary|Requested probability/);
});
test("calculated binomial quantile clearly distinguishes target from achieved coverage",()=>{
 const studio=prepare("binomial",{n:"10",p:"0.5"});
 setDistributionInverseField(studio,"probability","0.5");
 const calculated=calculateDistributionInverse(studio);
 assert.equal(calculated.ok,true);assert.equal(calculated.lower,5);
 approx(calculated.achieved,638/1024,1e-14);
 const html=distributionInverseResultHtml(studio,e);
 assert.match(html,/0\.5/);assert.match(html,/0\.623046875/);
 assert.match(html,/inclusive cut-off/);assert.match(html,/0\.376953125/);
 assert.equal(studio.draft.mode,"none");
 const applied=applyDistributionInverse(studio);
 assert.equal(applied.ok,true);assert.equal(studio.draft.lower,"5");
 assert.equal(studio.draft.mode,"left");
 assert.equal((renderDistributionSvg(studio.draft).match(/data-distribution-selected="true"/g)||[]).length,6);
});
test("all five models can apply an inverse and preserve the original model parameters",()=>{
 const cases=[
  ["normal",{mu:"4",sigma:"2"},"right","0.2","right"],
  ["binomial",{n:"12",p:"0.25"},"right","0.8","right"],
  ["poisson",{lambda:"3"},"left","0.8","left"],
  ["uniform",{a:"-2",b:"6"},"central","0.75","between"],
  ["custom",{customPoints:"-2, 0.2\n0, 0.5\n3, 0.3"},"right","0.31","right"]
 ];
 for(const [kind,fields,mode,target,eventMode] of cases){
  const studio=prepare(kind,fields);
  const source=JSON.stringify(fields);
  setDistributionInverseField(studio,"mode",mode);
  setDistributionInverseField(studio,"probability",target);
  const computed=calculateDistributionInverse(studio);
  assert.equal(computed.ok,true,kind+": "+computed.issues.join("; "));
  assert.equal(studio.draft.mode,"none");
  const applied=applyDistributionInverse(studio);
  assert.equal(applied.ok,true);
  assert.equal(studio.draft.mode,eventMode);
  assert.equal(currentDistributionInverse(studio).status,"applied");
  assert.equal(analyzeDistribution(studio.draft).ready,true);
  assert.equal(JSON.stringify(Object.fromEntries(Object.keys(fields).map(k=>[k,studio.draft[k]]))),source);
 }
});
test("a model change makes a previous inverse result stale and blocks silent apply",()=>{
 const studio=prepare("poisson",{lambda:"3"});
 calculateDistributionInverse(studio);
 assert.equal(setDistributionField(studio,"lambda","7"),true);
 assert.equal(currentDistributionInverse(studio).status,"stale");
 assert.match(distributionInverseResultHtml(studio,e),/parameters have changed/);
 assert.equal(applyDistributionInverse(studio).ok,false);
 assert.equal(studio.draft.mode,"none");
 const fresh=calculateDistributionInverse(studio);
 assert.equal(fresh.ok,true);
 assert.equal(currentDistributionInverse(studio).status,"calculated");
 assert.equal(applyDistributionInverse(studio).ok,true);
 assert.equal(studio.draft.mode,"left");
});
test("a changed target invalidates a calculated result without changing the shaded event",()=>{
 const studio=prepare("uniform",{a:"2",b:"10"});
 calculateDistributionInverse(studio);applyDistributionInverse(studio);
 const old=JSON.stringify(studio.draft);
 assert.equal(setDistributionInverseField(studio,"probability","0.25"),true);
 assert.equal(currentDistributionInverse(studio).status,"idle");
 assert.equal(applyDistributionInverse(studio).ok,false);
 assert.equal(JSON.stringify(studio.draft),old);
 assert.match(distributionInverseResultHtml(studio,e),/Enter a target/);
});
test("manual boundary changes after apply do not claim the old result remains applied",()=>{
 const studio=prepare("binomial",{n:"10",p:"0.5"});
 calculateDistributionInverse(studio);
 applyDistributionInverse(studio);
 assert.equal(currentDistributionInverse(studio).status,"applied");
 assert.equal(setDistributionField(studio,"lower","4"),true);
 assert.equal(currentDistributionInverse(studio).status,"calculated");
 assert.match(distributionInverseResultHtml(studio,e),/Apply boundary to figure/);
 assert.equal(studio.draft.lower,"4");
});
test("changing kind away from continuous resets unavailable central mode",()=>{
 const studio=prepare("normal");
 setDistributionInverseField(studio,"mode","central");
 calculateDistributionInverse(studio);
 setDistributionField(studio,"kind","binomial");
 assert.equal(studio.inverse.mode,"left");
 assert.equal(studio.inverse.status,"idle");
 assert.doesNotMatch(renderDistributionInverseHtml(studio,e),/value="central"/);
 assert.equal(setDistributionInverseField(studio,"mode","central"),false);
});
test("invalid targets show an error and never expose an apply action",()=>{
 const studio=prepare("poisson",{lambda:"3"});
 setDistributionInverseField(studio,"probability","1");
 const result=calculateDistributionInverse(studio);
 assert.equal(result.ok,false);
 assert.match(distributionInverseResultHtml(studio,e),/Check the inverse calculation/);
 assert.doesNotMatch(distributionInverseResultHtml(studio,e),/data-action="distribution-inverse-apply"/);
 assert.equal(applyDistributionInverse(studio).ok,false);
});
test("inverse query persists in backups separately from student figures",()=>{
 const state=createProjectState();state.distributionStudio=prepare("custom",{customPoints:"-2, 0.2\n0, 0.5\n3, 0.3"});
 setDistributionInverseField(state.distributionStudio,"probability","0.8");
 calculateDistributionInverse(state.distributionStudio);
 applyDistributionInverse(state.distributionStudio);
 const saved=saveDistributionDraft(state);
 assert.equal(saved.ok,true);
 assert.equal(saved.record.draft.lower,"3");
 assert.equal("inverse" in saved.record.draft,false);
 const backup=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(backup.distributionStudio.inverse.probability,"0.8");
 assert.equal(currentDistributionInverse(backup.distributionStudio).status,"applied");
 assert.equal(backup.distributionStudio.figures.length,1);
 const old=normalizeDistributionStudio({draft:newDistributionDraft()});
 assert.equal(old.inverse.status,"idle");
 assert.equal(old.inverse.probability,"0.95");
});
test("starting a new figure or loading a saved figure resets the previous inverse result",()=>{
 const state=createProjectState();state.distributionStudio=prepare("normal");
 calculateDistributionInverse(state.distributionStudio);
 assert.equal(saveDistributionDraft(state).ok,true);
 const id=state.distributionStudio.activeId;
 freshDistribution(state.distributionStudio);
 assert.equal(state.distributionStudio.inverse.status,"idle");
 assert.equal(loadDistribution(state.distributionStudio,id),true);
 assert.equal(state.distributionStudio.inverse.status,"idle");
});
