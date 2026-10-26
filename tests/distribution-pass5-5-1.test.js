import test from "node:test";
import assert from "node:assert/strict";
import {analyzeDistribution,newDistributionDraft,newDistributionStudio,
 formatDistributionProbability,normalUpperTail,normalizeDistributionStudio} from "../src/diagrams/distribution-core.js";
import {parseCustomDiscrete} from "../src/diagrams/distribution-extra.js";
import {inverseDistribution} from "../src/diagrams/distribution-inverse.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {startDistributionWhatIf,setDistributionWhatIfField,setDistributionWhatIfOption} from "../src/diagrams/distribution-whatif-actions.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {renderDistributionWhatIfSvg,normalComparisonCompression} from "../src/diagrams/distribution-whatif-render.js";
import {distributionWhatIfPreviewHtml} from "../src/diagrams/distribution-whatif-view.js";
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const model=(kind,overrides={})=>({...newDistributionDraft(),kind,title:"Mathematical distribution",symbol:"X",...overrides});
test("very high but non-certain probabilities never print an exact probability of one",()=>{
 assert.equal(formatDistributionProbability(1,1e-20),"1 − 1e-20");
 assert.equal(formatDistributionProbability(1-Number.EPSILON),"0.9999999999999998");
 assert.equal(formatDistributionProbability(0.9),"0.9000");
 assert.equal(formatDistributionProbability(1,0),"1");
 assert.equal(formatDistributionProbability(0),"0");
});
test("normal very rare omitted left-tail mass survives saturated cumulative probability",()=>{
 const d=model("normal",{mu:"0",sigma:"1",mode:"left",lower:"9"});
 const q=analyzeDistribution(d);
 assert(q.ready);
 assert(q.probability>0.999999999);
 assert(normalUpperTail(9)>0);
 assert.match(q.statement,/= 1 − /);
 assert.doesNotMatch(q.statement,/= 1$/);
 const svg=renderDistributionSvg(d);
 assert.match(svg,/1 − /);
 assert.match(svg,/P\(X ≤ 9\)/);
 assert.doesNotMatch(svg,/data-distribution-handle/);
});
test("normal central and outside probabilities keep truly nonzero omitted regions",()=>{
 for(const [mode,lower,upper] of [
  ["between","-9","9"],["outside","9","10"]
 ]){
  const q=analyzeDistribution(model("normal",{mode,lower,upper}));
  assert(q.ready);
  assert.match(q.statement,/= 1 − /,mode);
 }
});
test("binomial, Poisson and custom discrete export mathematically qualified near-certainty",()=>{
 const cases=[
  model("binomial",{n:"150",p:"0.5",mode:"left",lower:"149"}),
  model("poisson",{lambda:"3",mode:"left",lower:"30"}),
  model("poisson",{lambda:"3",mode:"outside",lower:"29",upper:"32"}),
  model("custom",{customPoints:"0, 0.9999999999999999\n1, 0.0000000000000001",mode:"left",lower:"0"})
 ];
 for(const d of cases){
  const q=analyzeDistribution(d);
  assert(q.ready,q.issues.join(" / "));
  assert.match(q.statement,/= 1 − /,d.kind+" "+d.mode+" "+q.statement);
  const svg=renderDistributionSvg(d);
  assert(svg.includes(q.statement),"export must match visible statement");
 }
});
test("continuous uniform high but non-unit coverage does not round to certainty",()=>{
 const d=model("uniform",{a:"0",b:"1",mode:"left",lower:"0.9999999999999999"});
 const q=analyzeDistribution(d);
 assert(q.ready);
 assert.match(q.statement,/0.9999999999999999/);
 assert.doesNotMatch(q.statement,/= 1$/);
});
test("count-event bounds outside exact integer representation are not treated as defensible",()=>{
 for(const kind of ["binomial","poisson"]){
  const d=model(kind,{mode:"left",lower:"100000000000000000000"});
  const q=analyzeDistribution(d);
  assert.equal(q.ready,false,kind);
  assert.match(q.issues.join(" "),/safely representable integers/);
  assert.doesNotMatch(q.statement,/= 1/);
 }
});
test("custom model probabilities retain the shared strict total without normalisation",()=>{
 const d=model("custom",{customPoints:"0, 0.4\n1, 0.6000000002",mode:"left",lower:"0"});
 const parsed=parseCustomDiscrete(d.customPoints);
 assert(parsed.issues.length>0);
 assert(!analyzeDistribution(d).ready);
 assert.equal(d.customPoints,"0, 0.4\n1, 0.6000000002");
});
const compare=(other,options={})=>{
 const studio=newDistributionStudio();
 studio.draft=model("normal",{mu:"0",sigma:"1",mode:"left",lower:"0",...options});
 assert(startDistributionWhatIf(studio));
 assert(setDistributionWhatIfField(studio,"mu",other));
 return {studio,q:compareDistributionWhatIf(studio)};
};
const densityPath=(svg,which)=>{
 const match=svg.match(new RegExp('<path d="([^"]+)" data-whatif-density="'+which+'"'));
 assert(match,"Missing "+which+" density");
 return match[1];
};
const heights=path=>[...path.matchAll(/[ML][-\d.]+ ([-\d.]+)/g)].map(m=>Number(m[1]));
test("distant normal models retain both density peaks rather than flatlining on a global grid",()=>{
 const {studio,q}=compare("1000000");
 assert(q.ready);
 assert(normalComparisonCompression(q));
 const originalDraft=JSON.stringify(studio.draft);
 const svg=renderDistributionWhatIfSvg(q);
 assert.match(svg,/data-whatif-compressed="true"/);
 assert.match(svg,/shared scale/);
 for(const which of ["original","alternative"]){
  const ys=heights(densityPath(svg,which));
  assert(ys.length>420,which+" should use centre and shoulder sampling");
  assert(Math.min(...ys)<155,which+" peak must remain visible");
  assert(Math.max(...ys)>270,which+" baseline must remain visible");
 }
 const view=distributionWhatIfPreviewHtml(studio,e);
 assert.match(view,/data-whatif-scale-warning/);
 assert.match(view,/do not judge spread or peak shape/);
 assert.equal(JSON.stringify(studio.draft),originalDraft);
 assert(!renderDistributionSvg(studio.draft).includes("data-whatif-compressed"));
});
test("normal comparison with resolved density widths needs no misleading compression warning",()=>{
 const {studio,q}=compare("2");
 assert(q.ready);
 assert.equal(normalComparisonCompression(q),false);
 assert.doesNotMatch(renderDistributionWhatIfSvg(q),/data-whatif-compressed/);
 assert.doesNotMatch(distributionWhatIfPreviewHtml(studio,e),/data-whatif-scale-warning/);
});
test("compressed normal shared axes still compare independent inverse targets correctly",()=>{
 const {studio,q}=compare("1000000");
 assert(setDistributionWhatIfOption(studio,"comparison","target"));
 assert(setDistributionWhatIfOption(studio,"targetProbability","0.9"));
 const t=compareDistributionWhatIf(studio);
 assert(t.ready&&t.target?.ok);
 assert(Math.abs(t.target.lowerChange-1000000)<1e-6);
 const svg=renderDistributionWhatIfSvg(t);
 assert.match(svg,/data-whatif-compressed="true"/);
 assert.equal((svg.match(/data-whatif-target-marker=/g)||[]).length,2);
 assert.doesNotMatch(svg,/fill="#e9f3ee"/);
 assert.match(distributionWhatIfPreviewHtml(studio,e),/data-whatif-scale-warning/);
});
test("existing inverse calculations, editor settings, figure exports and legacy normalization remain intact",()=>{
 const orig=inverseDistribution(model("normal",{mu:"70",sigma:"10"}),{mode:"left",probability:"0.9"});
 assert(orig.ok);
 assert(Math.abs(orig.lower-82.8155156554)<1e-7);
 const a=newDistributionStudio();
 a.draft=model("binomial",{n:"10",p:"0.3",mode:"exact",lower:"3",sourceKind:"secondary",sourceCredit:"Original model source"});
 const before=JSON.stringify(a.draft),figure=renderDistributionSvg(a.draft);
 const q=analyzeDistribution(a.draft);
 assert(q.ready);
 const restored=normalizeDistributionStudio(JSON.parse(JSON.stringify(a)));
 assert.equal(JSON.stringify(restored.draft),before);
 assert.equal(renderDistributionSvg(restored.draft),figure);
 assert.equal(restored.draft.sourceCredit,"Original model source");
});
