import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newDistributionStudio,newDistributionDraft,normalizeDistributionStudio,saveDistributionFigure} from "../src/diagrams/distribution-core.js";
import {startDistributionWhatIf,setDistributionWhatIfField,setDistributionWhatIfOption,
 setDistributionWhatIfReflectionOpen,resetDistributionWhatIf,discardDistributionWhatIf,
 applyDistributionWhatIf} from "../src/diagrams/distribution-whatif-actions.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {distributionWhatIfReflection} from "../src/diagrams/distribution-whatif-reflection.js";
import {distributionWhatIfReflectionHtml,distributionWhatIfSummaryHtml,
 renderDistributionWhatIfControls} from "../src/diagrams/distribution-whatif-view.js";
import {distributionGuidance,distributionAim} from "../src/diagrams/distribution-guidance.js";
import {renderDistributionStudio} from "../src/diagrams/distribution-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {renderDistributionWhatIfSvg} from "../src/diagrams/distribution-whatif-render.js";
import {setDistributionField} from "../src/diagrams/distribution-actions.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const studio=(kind,fields={})=>{
 const s=newDistributionStudio();s.open=true;
 s.draft={...newDistributionDraft(),kind,title:"Model chosen by student",symbol:"T",...fields};
 return s;
};
const explore=(kind,params,key,value,comparison="event")=>{
 const s=studio(kind,params);
 startDistributionWhatIf(s);
 if(comparison==="target")setDistributionWhatIfOption(s,"comparison","target");
 setDistributionWhatIfField(s,key,value);
 return {s,q:compareDistributionWhatIf(s)};
};
test("reflection is a disclosure only after a changed, valid fixed event",()=>{
 const s=studio("normal",{mode:"left",lower:"0"});
 assert.equal(distributionWhatIfReflection(compareDistributionWhatIf(s),s.draft),null);
 startDistributionWhatIf(s);
 assert.equal(distributionWhatIfReflection(compareDistributionWhatIf(s),s.draft),null);
 setDistributionWhatIfField(s,"mu","1");
 const q=compareDistributionWhatIf(s),r=distributionWhatIfReflection(q,s.draft);
 assert.ok(r);
 assert.equal(r.prompts.length,3);
 assert.deepEqual(r.prompts.map(p=>p.id),["why","meaning","evaluation"]);
 assert.match(r.prompts[0].question,/mean of T/);
 assert.match(r.prompts[1].question,/SAME event/);
 assert.match(r.caution,/not evidence of model fit/);
 const html=distributionWhatIfSummaryHtml(s,esc);
 assert.equal((html.match(/data-distribution-whatif-reflection/g)||[]).length,1);
 assert.match(html,/<summary>What does this tell me\?/);
 assert.match(html,/Optional reflection/);
 assert.match(html,/Justify the alternative/);
 assert.doesNotMatch(html,/data-distribution-whatif-reflection open/);
});
test("no prompts for invalid/stale models, missing events, unchanged comparisons or invalid targets",()=>{
 const missing=explore("normal",{mode:"none"},"mu","1");
 assert.equal(distributionWhatIfReflection(missing.q,missing.s.draft),null);
 assert.doesNotMatch(distributionWhatIfSummaryHtml(missing.s,esc),/What does this tell me/);
 const invalid=explore("normal",{mode:"left",lower:"0"},"sigma","0");
 assert.equal(invalid.q.ready,false);
 assert.equal(distributionWhatIfReflection(invalid.q,invalid.s.draft),null);
 const stale=explore("normal",{mode:"left",lower:"0"},"mu","1");
 setDistributionField(stale.s,"mu","2");
 assert.equal(compareDistributionWhatIf(stale.s).status,"stale");
 assert.equal(distributionWhatIfReflection(compareDistributionWhatIf(stale.s),stale.s.draft),null);
 const bad=explore("poisson",{lambda:"3"},"lambda","5","target");
 setDistributionWhatIfOption(bad.s,"targetMode","right");
 setDistributionWhatIfOption(bad.s,"targetProbability","0");
 const q=compareDistributionWhatIf(bad.s);
 assert.equal(q.target.ok,false);
 assert.equal(distributionWhatIfReflection(q,bad.s.draft),null);
 assert.doesNotMatch(distributionWhatIfSummaryHtml(bad.s,esc),/What does this tell me/);
});
test("all five distribution types receive relevant parameter assumptions without generic copyable prose",()=>{
 const cases=[
  ["normal",{mu:"70",sigma:"10",mode:"left",lower:"70"},"sigma","15",/variability|spread/],
  ["binomial",{n:"10",p:"0.4",mode:"left",lower:"3"},"n","15",/number of trials|proportion/],
  ["poisson",{lambda:"3",mode:"right",lower:"4"},"lambda","5",/observation intervals|clustering/],
  ["uniform",{a:"0",b:"10",mode:"between",lower:"2",upper:"6"},"a","-2",/lower end|equal density/],
  ["custom",{customPoints:"0,0.3\n1,0.7",mode:"left",lower:"0"},"customPoints","0,0.4\n1,0.6",/outcome values|assigned probabilities/]
 ];
 for(const [kind,fields,key,value,re] of cases){
  const {s,q}=explore(kind,fields,key,value);
  assert.equal(q.ready,true,kind);
  const r=distributionWhatIfReflection(q,s.draft);
  assert.ok(r,kind);
  assert.match(r.prompts[0].question,re,kind);
  assert.match(r.prompts[1].question,q.sensitivity.deltaProbability===0?/did not change numerically/:/SAME event/,kind);
  assert.match(r.prompts[2].question,/investigation|IA/,kind);
  assert.equal(r.prompts.length,3);
  assert.ok(r.prompts.every(p=>p.question.endsWith("?")||p.question.includes("?")),kind);
  assert.doesNotMatch(JSON.stringify(r),/the data show that|therefore the population|significant at|confidence interval of [0-9]/i,kind);
 }
});
test("binomial success probability and normal mean use separate mathematically relevant prompts",()=>{
 const binomial=explore("binomial",{n:"10",p:"0.4",mode:"left",lower:"4"},"p","0.6");
 assert.match(distributionWhatIfReflection(binomial.q,binomial.s.draft).prompts[0].question,/per-trial success probability/);
 const normal=explore("normal",{mu:"70",sigma:"10",mode:"left",lower:"70"},"mu","75");
 assert.match(distributionWhatIfReflection(normal.q,normal.s.draft).prompts[0].question,/leaving its standard deviation unchanged/);
});
test("multiple simultaneous parameter changes cannot be called isolated sensitivity",()=>{
 const s=studio("normal",{mu:"70",sigma:"10",mode:"left",lower:"70"});
 startDistributionWhatIf(s);
 setDistributionWhatIfField(s,"mu","75");
 setDistributionWhatIfField(s,"sigma","12");
 const q=compareDistributionWhatIf(s);
 assert.equal(q.sensitivity.parameter.type,"scenario");
 const r=distributionWhatIfReflection(q,s.draft);
 assert.match(r.prompts[0].question,/mean and standard deviation together/);
 assert.match(r.prompts[0].question,/one at a time/);
});
test("fixed-target prompts respond to central intervals, discrete steps and stationary cut-offs",()=>{
 const central=explore("normal",{mu:"70",sigma:"10",mode:"none"},"mu","75","target");
 setDistributionWhatIfOption(central.s,"targetMode","central");
 const r=distributionWhatIfReflection(compareDistributionWhatIf(central.s),central.s.draft);
 assert.match(r.prompts[1].question,/two endpoints/);
 assert.doesNotMatch(r.prompts[1].question,/SAME event/);
 const discrete=explore("binomial",{n:"10",p:"0.4"},"p","0.7","target");
 assert.match(distributionWhatIfReflection(discrete.q,discrete.s.draft).prompts[1].question,/ACHIEVED probability/);
 const custom=explore("custom",{customPoints:"0,0.2\n1,0.5\n2,0.3"},"customPoints","0,0.1\n1,0.5\n2,0.4","target");
 setDistributionWhatIfOption(custom.s,"targetProbability","0.75");
 const c=compareDistributionWhatIf(custom.s);
 assert.equal(c.target.sameBoundary,true);
 assert.match(distributionWhatIfReflection(c,custom.s.draft).prompts[1].question,/integer cut-off stayed the same/);
});
test("fixed-event zero difference never invents a significant effect",()=>{
 const s=studio("uniform",{a:"0",b:"10",mode:"left",lower:"-1"});
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"b","12");
 const q=compareDistributionWhatIf(s);
 assert.equal(q.sensitivity.deltaProbability,0);
 const r=distributionWhatIfReflection(q,s.draft);
 assert.match(r.prompts[1].question,/did not change numerically/);
 assert.doesNotMatch(r.prompts[1].question,/increased|decreased/);
});
test("provenance questions distinguish estimated, published, assumed and uncertain parameters",()=>{
 const expected={
  primary:/estimated from your data.*hypothetical value is not another estimate/,
  secondary:/published values.*not a second published result/,
  theoretical:/Neither set of assumed parameters is an observation/,
  unsure:/establish whether the original parameters were assumed, estimated or published/
 };
 for(const [kind,re] of Object.entries(expected)){
  const {s,q}=explore("normal",{sourceKind:kind,sourceCredit:"Example publication",
   mu:"0",sigma:"1",mode:"left",lower:"0"},"mu","1");
  const r=distributionWhatIfReflection(q,s.draft);
  assert.match(r.prompts[2].question,re,kind);
  assert.equal(s.draft.sourceKind,kind);
  assert.equal(s.draft.sourceCredit,"Example publication");
 }
});
test("existing saved aim is reused, escaped, limited and never treated as empirical evidence",()=>{
 const state=createProjectState();const s=studio("normal",{mu:"0",sigma:"1",mode:"left",lower:"0"});
 state.distributionStudio=s;state.planning.fields.aim='Determine whether <unsafe> & "x" measurements alter a decision';
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"mu","1");
 const existing=distributionGuidance(state,s.draft).aim,aim=distributionAim(state);
 assert.equal(existing,aim);
 const html=renderDistributionStudio(state,()=>"",esc);
 assert.match(html,/data-distribution-whatif-reflection/);
 assert.match(html,/Your saved aim/);
 assert.match(html,/&lt;unsafe&gt; &amp; &quot;x&quot;/);
 assert.doesNotMatch(html,/\<unsafe\>/);
 const r=distributionWhatIfReflection(compareDistributionWhatIf(s),s.draft,aim);
 assert.equal(r.aim,aim);
 assert.match(r.prompts[2].question,/saved aim/);
 state.planning.fields.aim="";
 const generic=distributionWhatIfReflection(compareDistributionWhatIf(s),s.draft,distributionAim(state));
 assert.equal(generic.aim,"");
 assert.match(generic.prompts[2].question,/specific question, claim or decision/);
 const long="Z".repeat(1000);
 assert.equal(distributionWhatIfReflection(compareDistributionWhatIf(s),s.draft,long).aim.length,260);
});
test("optional disclosure state survives live update, comparison switching, reset and backup without touching figures",()=>{
 const state=createProjectState(),s=studio("normal",{mu:"70",sigma:"10",mode:"left",lower:"70"});
 state.distributionStudio=s;
 const saved=saveDistributionFigure(s);
 assert.ok(saved.ok);
 const figureBefore=JSON.stringify(s.figures),draftBefore=JSON.stringify(s.draft);
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"mu","75");
 assert.equal(s.whatIf.reflectionOpen,false);
 assert.equal(setDistributionWhatIfReflectionOpen(s,true),true);
 assert.equal(setDistributionWhatIfReflectionOpen(s,true),false);
 assert.match(distributionWhatIfSummaryHtml(s,esc),/data-distribution-whatif-reflection open/);
 setDistributionWhatIfField(s,"mu","76");
 assert.match(distributionWhatIfSummaryHtml(s,esc),/data-distribution-whatif-reflection open/);
 setDistributionWhatIfOption(s,"comparison","target");
 assert.match(distributionWhatIfSummaryHtml(s,esc),/data-distribution-whatif-reflection open/);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.distributionStudio.whatIf.reflectionOpen,true);
 assert.equal(restored.distributionStudio.whatIf.comparison,"target");
 assert.equal(restored.distributionStudio.whatIf.values.mu,"76");
 assert.match(distributionWhatIfSummaryHtml(restored.distributionStudio,esc),/data-distribution-whatif-reflection open/);
 assert.equal(JSON.stringify(restored.distributionStudio.figures),figureBefore);
 assert.equal(JSON.stringify(restored.distributionStudio.draft),draftBefore);
 resetDistributionWhatIf(restored.distributionStudio);
 assert.equal(restored.distributionStudio.whatIf.reflectionOpen,true);
 assert.equal(setDistributionWhatIfReflectionOpen(restored.distributionStudio,false),true);
 discardDistributionWhatIf(restored.distributionStudio);
 assert.equal(restored.distributionStudio.whatIf.active,false);
 assert.equal(restored.distributionStudio.whatIf.reflectionOpen,false);
 assert.equal(normalizeDistributionStudio({whatIf:{active:true,kind:"normal"}}).whatIf.reflectionOpen,false);
});
test("invalid disclosure changes and cancelled apply do not create student data",()=>{
 const s=studio("normal",{sourceKind:"primary",mu:"70",sigma:"10",mode:"left",lower:"70"});
 assert.equal(setDistributionWhatIfReflectionOpen(s,true),false);
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"mu","75");
 const before=JSON.stringify(s.draft);
 assert.equal(setDistributionWhatIfReflectionOpen(s,"yes"),false);
 assert.equal(setDistributionWhatIfReflectionOpen(s,true),true);
 assert.equal(applyDistributionWhatIf(s).needsProvenance,true);
 assert.equal(JSON.stringify(s.draft),before);
 assert.equal(s.whatIf.reflectionOpen,true);
});
test("no reflection text enters the clean figure, shared comparison chart or IA writing fields",()=>{
 const state=createProjectState(),s=studio("normal",{mu:"70",sigma:"10",mode:"left",lower:"70"});
 state.distributionStudio=s;state.planning.fields.aim="Test effect on an aim";
 const original=JSON.stringify(state.entries),svg=renderDistributionSvg(s.draft);
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"mu","75");
 const q=compareDistributionWhatIf(s);
 assert.match(distributionWhatIfSummaryHtml(s,esc,"Test effect on an aim"),/What does this tell me/);
 assert.doesNotMatch(renderDistributionWhatIfSvg(q),/What does this tell me|Justify the alternative|hypothetical sensitivity/);
 assert.equal(renderDistributionSvg(s.draft),svg);
 assert.equal(JSON.stringify(state.entries),original);
 assert.doesNotMatch(JSON.stringify(s.figures),/What does this tell me/);
});
