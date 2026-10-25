import test from "node:test";
import assert from "node:assert/strict";
import {newDistributionStudio,newDistributionDraft,analyzeDistribution} from "../src/diagrams/distribution-core.js";
import {parseCustomDiscrete} from "../src/diagrams/distribution-extra.js";
import {inverseDistribution} from "../src/diagrams/distribution-inverse.js";
import {startDistributionWhatIf,setDistributionWhatIfField,applyDistributionWhatIf} from "../src/diagrams/distribution-whatif-actions.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {formatSensitivityPoints,formatSensitivityProbability,distributionEventComplement} from "../src/diagrams/distribution-sensitivity.js";
import {distributionWhatIfSummaryHtml} from "../src/diagrams/distribution-whatif-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
const e=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const studio=(kind,over={})=>{const s=newDistributionStudio();s.draft={...newDistributionDraft(),title:"A theoretical model",kind,...over};return s};
const compare=(kind,over,key,alternative)=>{const s=studio(kind,over);startDistributionWhatIf(s);setDistributionWhatIfField(s,key,alternative);return {s,q:compareDistributionWhatIf(s)}};
test("single mean shift is expressed in original standard deviations, probability change in percentage points",()=>{
 const {s,q}=compare("normal",{mu:"70",sigma:"10",mode:"left",lower:"70",unit:"marks"},"mu","75");
 assert.equal(q.sensitivity.parameter.type,"single");
 assert.match(q.sensitivity.parameter.detail,/0.5 of the original standard deviation/);
 assert.ok(Math.abs(q.sensitivity.deltaPercentagePoints+19.14624613)<1e-6);
 assert.match(distributionWhatIfSummaryHtml(s,e),/percentage points/);
 assert.match(distributionWhatIfSummaryHtml(s,e),/Mean shift/);
 assert.doesNotMatch(renderDistributionSvg(s.draft),/sensitivity|whatif/i);
});
test("two changed parameters are a scenario, not one causal sensitivity",()=>{
 const s=studio("binomial",{n:"10",p:"0.5",mode:"left",lower:"5"});
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"n","12");setDistributionWhatIfField(s,"p","0.65");
 const q=compareDistributionWhatIf(s);
 assert.equal(q.ready,true);
 assert.deepEqual(q.sensitivity.changedKeys,["n","p"]);
 assert.equal(q.sensitivity.parameter.type,"scenario");
 assert.match(q.sensitivity.parameter.detail,/cannot be attributed to a single parameter/);
});
test("single parameter explanations adapt to count, success probability, rate, support and custom assignments",()=>{
 for(const [kind,params,key,value,expected] of [
  ["binomial",{n:"10",p:"0.5"},"n","12","same absolute count event"],
  ["binomial",{n:"10",p:"0.5"},"p","0.6","percentage points"],
  ["poisson",{lambda:"0"},"lambda","3","zero or tiny baseline"],
  ["uniform",{a:"0",b:"10",unit:"seconds"},"b","12","support width"],
  ["custom",{customPoints:"0,0.4\n1,0.6"},"customPoints","0,0.5\n1,0.5","probability assignment"]
 ]){
  const {q}=compare(kind,params,key,value);
  assert.equal(q.ready,true,kind);
  assert.match(q.sensitivity.parameter.detail,new RegExp(expected),kind);
 }
});
test("rare upper tails survive cancellation and never present a positive change as zero",()=>{
 const {q}=compare("normal",{mu:"0",sigma:"1",mode:"left",lower:"9"},"mu","0.5");
 assert.equal(q.ready,true);
 assert.equal(q.originalProbability,1);
 assert.equal(q.alternativeProbability,1);
 assert.ok(q.sensitivity.originalComplement>0);
 assert.ok(q.sensitivity.alternativeComplement>q.sensitivity.originalComplement);
 assert.ok(q.sensitivity.deltaProbability<0);
 assert.ok(q.sensitivity.tailPrecision);
 assert.notEqual(formatSensitivityPoints(q.sensitivity.deltaProbability),"0");
 assert.match(formatSensitivityProbability(1,q.sensitivity.originalComplement),/^1 − /);
 const r=compare("poisson",{lambda:"3",mode:"left",lower:"40"},"lambda","4").q;
 assert.equal(r.ready,true);
 assert.ok(r.sensitivity.deltaProbability<0);
 assert.ok(r.sensitivity.alternativeComplement>r.sensitivity.originalComplement);
});
test("direct complements are consistent with ordinary probabilities for five model types",()=>{
 const cases=[
  ["normal",{mu:"0",sigma:"1",mode:"between",lower:"-1",upper:"1"}],
  ["binomial",{n:"10",p:"0.5",mode:"left",lower:"4"}],
  ["poisson",{lambda:"3",mode:"right",lower:"4"}],
  ["uniform",{a:"0",b:"10",mode:"between",lower:"2",upper:"5"}],
  ["custom",{customPoints:"0,0.2\n1,0.5\n2,0.3",mode:"left",lower:"1"}]
 ];
 for(const [kind,p] of cases){
  const model=analyzeDistribution(studio(kind,p).draft);
  assert.ok(model.ready,kind);
  const c=distributionEventComplement(model);
  assert.ok(Math.abs(c+model.probability-1)<2e-11,kind+" "+String(c));
 }
});
test("custom discrete validation is identical in figure, inverse and what-if, without normalising",()=>{
 for(const total of ["0,0.25\n1,0.5\n2,0.2500001","0,0.2\n1,0.4\n2,0.3"]){
  const source=studio("custom",{customPoints:total});
  assert.equal(analyzeDistribution(source.draft).ready,false);
  assert.equal(inverseDistribution(source.draft,{mode:"left",probability:"0.5"}).ok,false);
  startDistributionWhatIf(source);
  assert.equal(compareDistributionWhatIf(source).ready,false);
 }
 const acceptable="0,0.2\n1,0.5\n2,0.3000000000005";
 assert.equal(parseCustomDiscrete(acceptable).issues.length,0);
 const s=studio("custom",{customPoints:acceptable});
 assert.equal(analyzeDistribution(s.draft).ready,true);
 assert.equal(inverseDistribution(s.draft,{mode:"left",probability:"0.5"}).ok,true);
 startDistributionWhatIf(s);
 assert.equal(compareDistributionWhatIf(s).ready,true);
 assert.ok(Math.abs(compareDistributionWhatIf(s).original.total-1)>0,"the total is not silently rewritten");
});
test("applying hypothetical alternatives from primary or secondary models requires explicit provenance acknowledgement",()=>{
 for(const sourceKind of ["primary","secondary"]){
  const s=studio("normal",{sourceKind,sourceCredit:"Original article",mu:"3"});
  const original=JSON.stringify(s.draft);
  startDistributionWhatIf(s);setDistributionWhatIfField(s,"mu","5");
  const before=applyDistributionWhatIf(s);
  assert.equal(before.ok,false);
  assert.equal(before.needsProvenance,true);
  assert.equal(JSON.stringify(s.draft),original);
  assert.match(distributionWhatIfSummaryHtml(s,e),/reclassify/);
  const result=applyDistributionWhatIf(s,true);
  assert.equal(result.ok,true);
  assert.equal(s.draft.mu,"5");
  assert.equal(s.draft.sourceKind,"theoretical");
  assert.equal(s.draft.sourceCredit,"");
 }
});
test("saved figures and project backups preserve original evidence after changing a working draft",()=>{
 const state=createProjectState(),s=studio("binomial",{sourceKind:"primary",p:"0.25"});
 state.distributionStudio=s;
 s.figures=[{id:"distribution-original",entryId:"",savedAt:"2026-10-26T00:00:00Z",draft:{...s.draft}}];
 const saved=JSON.stringify(s.figures);
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"p","0.4");
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.distributionStudio.whatIf.active,true);
 assert.equal(applyDistributionWhatIf(restored.distributionStudio,true).ok,true);
 assert.equal(JSON.stringify(restored.distributionStudio.figures),saved);
 assert.equal(restored.distributionStudio.draft.sourceKind,"theoretical");
});
