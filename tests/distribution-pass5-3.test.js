import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newDistributionStudio,newDistributionDraft,normalizeDistributionStudio,analyzeDistribution} from "../src/diagrams/distribution-core.js";
import {startDistributionWhatIf,setDistributionWhatIfField,resetDistributionWhatIf,
 discardDistributionWhatIf,applyDistributionWhatIf} from "../src/diagrams/distribution-whatif-actions.js";
import {compareDistributionWhatIf,distributionWhatIfSignature} from "../src/diagrams/distribution-whatif-core.js";
import {renderDistributionWhatIfSvg} from "../src/diagrams/distribution-whatif-render.js";
import {renderDistributionWhatIfControls,distributionWhatIfPreviewHtml,
 distributionWhatIfSummaryHtml} from "../src/diagrams/distribution-whatif-view.js";
import {renderDistributionStudio} from "../src/diagrams/distribution-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {setDistributionField,saveDistributionDraft,freshDistribution,loadDistribution} from "../src/diagrams/distribution-actions.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const approx=(x,y,t=1e-9)=>assert.ok(Math.abs(x-y)<t,"Expected "+x+" approximately "+y);
const create=(kind,more={})=>{
 const studio=newDistributionStudio();studio.open=true;
 studio.draft={...newDistributionDraft(),kind,title:"Proposed model for IA investigation",symbol:"T",...more};
 return studio;
};
test("what-if comparison is optional, accessible and excluded from exported figure content",()=>{
 const state=createProjectState();state.distributionStudio=create("normal",{mode:"left",lower:"0"});
 const html=renderDistributionStudio(state,()=>"",esc);
 assert.match(html,/data-distribution-whatif-panel/);
 assert.match(html,/data-action="distribution-whatif-start"/);
 assert.doesNotMatch(renderDistributionSvg(state.distributionStudio.draft),/whatif|Alternative|What if|comparison/);
 startDistributionWhatIf(state.distributionStudio);
 const active=renderDistributionStudio(state,()=>"",esc);
 assert.match(active,/data-distribution-whatif-field="mu"/);
 assert.match(active,/data-distribution-whatif-field="sigma"/);
 assert.match(active,/data-distribution-whatif-preview/);
 assert.match(active,/data-distribution-whatif-chart/);
 assert.match(active,/type="range"/);
 assert.doesNotMatch(renderDistributionSvg(state.distributionStudio.draft),/Original model|Alternative model|data-whatif/);
});
test("normal what-if compares same event without touching original parameters or event",()=>{
 const studio=create("normal",{mu:"70",sigma:"10",mode:"left",lower:"70",sourceKind:"secondary",sourceCredit:"A citation"});
 const original=JSON.stringify(studio.draft);
 assert.equal(startDistributionWhatIf(studio),true);
 const same=compareDistributionWhatIf(studio);
 assert.equal(same.ready,true);assert.equal(same.changed,false);
 approx(same.originalProbability,.5);approx(same.alternativeProbability,.5);
 assert.equal(setDistributionWhatIfField(studio,"mu","75"),true);
 const candidate=compareDistributionWhatIf(studio);
 assert.equal(candidate.ready,true);assert.equal(candidate.changed,true);
 approx(candidate.originalProbability,.5);
 approx(candidate.alternativeProbability,.3085375387,2e-9);
 assert.ok(candidate.deltaProbability<0);
 approx(candidate.original.mean,70);approx(candidate.alternative.mean,75);
 assert.equal(JSON.stringify(studio.draft),original,"live edits may not edit original figure");
 assert.match(distributionWhatIfSummaryHtml(studio,esc),/Event probability/);
 assert.match(distributionWhatIfSummaryHtml(studio,esc),/Apply alternative to figure/);
 const chart=renderDistributionWhatIfSvg(candidate);
 assert.match(chart,/Shared-axis comparison|shared/);
 assert.match(chart,/Original model/);assert.match(chart,/Alternative model/);
 assert.match(chart,/stroke-dasharray="9 5"/);
 assert.match(chart,/fill="#e9f3ee"/);
 assert.doesNotMatch(renderDistributionSvg(studio.draft),/Alternative model|whatif/i);
 const needsAcknowledgement=applyDistributionWhatIf(studio);
 assert.equal(needsAcknowledgement.ok,false);
 assert.equal(needsAcknowledgement.needsProvenance,true);
 const applied=applyDistributionWhatIf(studio,true);
 assert.equal(applied.ok,true);
 assert.equal(studio.draft.mu,"75");
 assert.equal(studio.draft.sigma,"10");
 assert.equal(studio.draft.mode,"left");
 assert.equal(studio.draft.lower,"70");
 assert.equal(studio.draft.sourceKind,"theoretical");
 assert.equal(studio.draft.sourceCredit,"");
 assert.equal(studio.draft.edited,true);
 approx(analyzeDistribution(studio.draft).probability,candidate.alternativeProbability,1e-11);
 assert.equal(studio.whatIf.active,false);
 assert.equal(studio.whatIf.status,"applied");
});
test("all five models keep a fixed selected event and evaluate alternative probabilities",()=>{
 const cases=[
 ["normal",{mu:"0",sigma:"1",mode:"between",lower:"-1",upper:"1"},"sigma","2"],
 ["binomial",{n:"10",p:"0.5",mode:"exact",lower:"4"},"p","0.6"],
 ["poisson",{lambda:"3",mode:"right",lower:"4"},"lambda","5"],
 ["uniform",{a:"0",b:"10",mode:"between",lower:"2",upper:"4"},"b","20"],
 ["custom",{customPoints:"0, 0.2\n1, 0.5\n2, 0.3",mode:"left",lower:"1"},
  "customPoints","0, 0.1\n1, 0.5\n2, 0.4"]
 ];
 for(const [kind,params,key,value] of cases){
  const studio=create(kind,params),original=JSON.stringify(studio.draft);
  startDistributionWhatIf(studio);
  assert.equal(setDistributionWhatIfField(studio,key,value),true);
  const q=compareDistributionWhatIf(studio);
  assert.equal(q.ready,true,kind+": "+q.issues.join("; "));
  assert.equal(q.changed,true,kind);
  assert.notEqual(q.originalProbability,q.alternativeProbability,kind);
  assert.equal(JSON.stringify(studio.draft),original,kind);
  assert.equal(q.original.draft.mode,"none","plot should not mutate event");
  assert.match(renderDistributionWhatIfSvg(q),/<svg/);
  const applied=applyDistributionWhatIf(studio);
  assert.equal(applied.ok,true,kind);
  assert.equal(studio.draft[key],value,kind);
  assert.equal(studio.draft.mode,params.mode,kind);
  assert.equal(studio.draft.lower,params.lower,kind);
  assert.equal(studio.draft.upper,params.upper??"",kind);
  approx(analyzeDistribution(studio.draft).probability,q.alternativeProbability,1e-9);
 }
});
test("discrete comparison keeps a shared count axis, not two separately scaled graphs",()=>{
 const studio=create("binomial",{n:"8",p:"0.25",mode:"left",lower:"2"});
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"n","14");
 const q=compareDistributionWhatIf(studio),svg=renderDistributionWhatIfSvg(q);
 assert.equal(q.ready,true);
 assert.equal((svg.match(/data-whatif-bar="original"/g)||[]).length,9);
 assert.equal((svg.match(/data-whatif-bar="alternative"/g)||[]).length,15);
 assert.match(svg,/stroke-dasharray="4 4"/);
 assert.match(svg,/x="80.00"/);
});
test("no selected event compares means and spread without inventing a probability",()=>{
 const studio=create("uniform",{a:"-2",b:"6",mode:"none"});
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"a","-4");
 const q=compareDistributionWhatIf(studio);
 assert.equal(q.ready,true);
 assert.equal(q.originalProbability,null);
 assert.equal(q.alternativeProbability,null);
 assert.match(distributionWhatIfSummaryHtml(studio,esc),/Choose an event/);
 assert.match(distributionWhatIfPreviewHtml(studio,esc),/Select an event/);
 assert.equal(applyDistributionWhatIf(studio).ok,true);
});
test("invalid rate, n, sigma and uniform bounds never apply or alter original",()=>{
 const cases=[
 ["normal",{mu:"2",sigma:"1"},"sigma","0"],
 ["binomial",{n:"10",p:"0.3"},"n","200"],
 ["poisson",{lambda:"4"},"lambda","-1"],
 ["uniform",{a:"2",b:"10"},"b","1"]
 ];
 for(const [kind,fields,key,value] of cases){
  const studio=create(kind,fields),old=JSON.stringify(studio.draft);
  startDistributionWhatIf(studio);setDistributionWhatIfField(studio,key,value);
  const q=compareDistributionWhatIf(studio);
  assert.equal(q.ready,false,kind);
  assert.equal(q.status,"invalid",kind);
  assert.ok(q.issues.length,kind);
  assert.match(distributionWhatIfSummaryHtml(studio,esc),/Check these parameters/);
  assert.doesNotMatch(distributionWhatIfSummaryHtml(studio,esc),/data-action="distribution-whatif-apply"/);
  assert.equal(applyDistributionWhatIf(studio).ok,false);
  assert.equal(JSON.stringify(studio.draft),old,kind);
 }
});
test("custom outcomes must total one; invalid alternative is never silently normalised",()=>{
 const studio=create("custom",{customPoints:"0, 0.2\n1, 0.5\n2, 0.3"});
 startDistributionWhatIf(studio);
 const candidate="0, 0.25\n1, 0.5\n2, 0.2500001";
 setDistributionWhatIfField(studio,"customPoints",candidate);
 let q=compareDistributionWhatIf(studio);
 assert.equal(q.ready,false);
 assert.match(q.issues.join(" "),/must total 1|Probabilities must total 1/);
 assert.equal(studio.whatIf.values.customPoints,candidate);
 assert.equal(applyDistributionWhatIf(studio).ok,false);
 assert.equal(studio.draft.customPoints,"0, 0.2\n1, 0.5\n2, 0.3");
 setDistributionWhatIfField(studio,"customPoints","0, 0.25\n1, 0.5\n2, 0.25");
 q=compareDistributionWhatIf(studio);
 assert.equal(q.ready,true);
 assert.equal(q.alternative.total,1);
 assert.equal(applyDistributionWhatIf(studio).ok,true);
 assert.equal(studio.draft.customPoints,"0, 0.25\n1, 0.5\n2, 0.25");
});
test("model changed during exploration makes its proposed values stale; explicit reset rebases",()=>{
 const studio=create("poisson",{lambda:"3",mode:"left",lower:"2"});
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"lambda","5");
 const source=distributionWhatIfSignature(studio.draft);
 assert.equal(setDistributionField(studio,"lambda","6"),true);
 assert.notEqual(distributionWhatIfSignature(studio.draft),source);
 assert.equal(compareDistributionWhatIf(studio).status,"stale");
 assert.match(distributionWhatIfSummaryHtml(studio,esc),/Restart the comparison/);
 assert.equal(applyDistributionWhatIf(studio).ok,false);
 assert.equal(studio.draft.lambda,"6");
 resetDistributionWhatIf(studio);
 assert.equal(compareDistributionWhatIf(studio).status,"ready");
 assert.equal(studio.whatIf.values.lambda,"6");
});
test("editing current event while exploring updates the SAME event on both models",()=>{
 const studio=create("uniform",{a:"0",b:"10",mode:"between",lower:"1",upper:"4"});
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"b","20");
 const initial=compareDistributionWhatIf(studio);
 approx(initial.originalProbability,.3);approx(initial.alternativeProbability,.15);
 setDistributionField(studio,"upper","8");
 const changed=compareDistributionWhatIf(studio);
 assert.equal(changed.status,"ready");
 approx(changed.originalProbability,.7);approx(changed.alternativeProbability,.35);
 assert.equal(changed.alternativeDraft.upper,"8");
});
test("a malformed selected event is called out and cannot be silently carried into an applied figure",()=>{
 const studio=create("normal",{mu:"70",sigma:"10",mode:"between",lower:"bad",upper:"80"});
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"mu","75");
 const q=compareDistributionWhatIf(studio);
 assert.equal(q.ready,true,"The distributions themselves are valid");
 assert.ok(q.eventIssues.length);
 assert.match(distributionWhatIfSummaryHtml(studio,esc),/event needs correction/);
 assert.equal(applyDistributionWhatIf(studio).ok,false);
});
test("backup persistence keeps alternative separate and never treats it as a saved figure",()=>{
 const state=createProjectState(),studio=create("binomial",{n:"10",p:"0.4"});
 state.distributionStudio=studio;
 const saved=saveDistributionDraft(state);assert.equal(saved.ok,true);
 const savedBefore=JSON.stringify(studio.figures);
 const originalDraft=JSON.stringify(studio.draft);
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"p","0.8");
 const round=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(round.distributionStudio.whatIf.active,true);
 assert.equal(round.distributionStudio.whatIf.values.p,"0.8");
 assert.equal(round.distributionStudio.whatIf.source,studio.whatIf.source);
 assert.equal(JSON.stringify(studio.figures),savedBefore);
 assert.equal(JSON.stringify(studio.draft),originalDraft);
 assert.equal(round.distributionStudio.figures[0].draft.p,"0.4");
 const restored=compareDistributionWhatIf(round.distributionStudio);
 assert.equal(restored.ready,true);
 assert.equal(applyDistributionWhatIf(round.distributionStudio).ok,true);
 assert.equal(round.distributionStudio.figures[0].draft.p,"0.4","old linked figure unchanged");
 assert.equal(round.distributionStudio.draft.p,"0.8");
});
test("new/load/discard reset alternative without discarding existing saved student work",()=>{
 const state=createProjectState(),studio=create("poisson",{lambda:"4"});
 state.distributionStudio=studio;
 assert.equal(saveDistributionDraft(state).ok,true);
 const id=studio.activeId;
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"lambda","9");
 discardDistributionWhatIf(studio);
 assert.equal(studio.whatIf.active,false);
 assert.equal(studio.draft.lambda,"4");
 startDistributionWhatIf(studio);setDistributionWhatIfField(studio,"lambda","9");
 freshDistribution(studio);
 assert.equal(studio.whatIf.active,false);
 assert.equal(loadDistribution(studio,id),true);
 assert.equal(studio.whatIf.active,false);
 assert.equal(studio.draft.lambda,"4");
 const legacy=normalizeDistributionStudio({draft:newDistributionDraft()});
 assert.equal(legacy.whatIf.active,false);
 assert.equal(legacy.whatIf.status,"idle");
});
test("what-if inputs accept only model parameters and bound stored values",()=>{
 const studio=create("normal");
 startDistributionWhatIf(studio);
 assert.equal(setDistributionWhatIfField(studio,"p","0.6"),false);
 assert.equal(setDistributionWhatIfField(studio,"title","Bad"),false);
 assert.equal(setDistributionWhatIfField(studio,"mu",123),false);
 assert.equal(setDistributionWhatIfField(studio,"mu","1".repeat(400)),true);
 assert.equal(studio.whatIf.values.mu.length,180);
 assert.equal(studio.draft.mu,"0");
});
