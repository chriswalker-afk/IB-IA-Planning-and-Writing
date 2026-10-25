
import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newDistributionStudio,newDistributionDraft,normalizeDistributionStudio,analyzeDistribution,saveDistributionFigure} from "../src/diagrams/distribution-core.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {startDistributionWhatIf,setDistributionWhatIfField,setDistributionWhatIfOption,resetDistributionWhatIf,
 discardDistributionWhatIf,applyDistributionWhatIf} from "../src/diagrams/distribution-whatif-actions.js";
import {renderDistributionWhatIfSvg} from "../src/diagrams/distribution-whatif-render.js";
import {renderDistributionWhatIfControls,distributionWhatIfSummaryHtml,distributionWhatIfPreviewHtml} from "../src/diagrams/distribution-whatif-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {inverseDistribution} from "../src/diagrams/distribution-inverse.js";
import {setDistributionField} from "../src/diagrams/distribution-actions.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const close=(actual,expected,tolerance=1e-10)=>assert.ok(Math.abs(actual-expected)<=tolerance,
 "Expected "+actual+" to equal "+expected+" within "+tolerance);
const create=(kind,fields={})=>{
 const s=newDistributionStudio();s.open=true;
 s.draft={...newDistributionDraft(),kind,title:"Student-selected theoretical model",symbol:"T",...fields};
 return s;
};
const startTarget=(s,{mode="left",probability="0.8"}={})=>{
 assert.ok(startDistributionWhatIf(s));
 assert.ok(setDistributionWhatIfOption(s,"comparison","target"));
 if(mode!=="left")assert.ok(setDistributionWhatIfOption(s,"targetMode",mode));
 assert.ok(setDistributionWhatIfOption(s,"targetProbability",probability));
};
test("Pass 5.4.2 keeps the existing fixed-event comparison by default",()=>{
 const s=create("normal",{mu:"70",sigma:"10",mode:"left",lower:"70"});
 startDistributionWhatIf(s);setDistributionWhatIfField(s,"mu","75");
 const q=compareDistributionWhatIf(s);
 assert.equal(q.comparison,"event");
 close(q.originalProbability,.5);
 assert.ok(q.alternativeProbability<.5);
 assert.equal(q.target,null);
 assert.match(renderDistributionWhatIfSvg(q),/fill="#e9f3ee"/);
 assert.match(renderDistributionWhatIfControls(s,esc),/data-distribution-whatif-option="comparison"/);
 assert.match(distributionWhatIfSummaryHtml(s,esc),/Event-probability change/);
});
test("normal quantile compares fixed target and moves mean cut-offs without changing selected event",()=>{
 const s=create("normal",{mu:"70",sigma:"10",mode:"left",lower:"70",unit:"marks"});
 const original=JSON.stringify(s.draft);
 startTarget(s,{probability:"0.9"});
 setDistributionWhatIfField(s,"mu","75");
 const q=compareDistributionWhatIf(s);
 assert.equal(q.ready,true);
 assert.equal(q.comparison,"target");
 assert.equal(q.originalProbability,null,"do not mix fixed event into target comparison");
 assert.equal(q.eventIssues.length,0);
 assert.equal(q.target.ok,true);
 close(q.target.requested,.9);
 close(q.target.original.lower,82.8155156554,2e-8);
 close(q.target.alternative.lower,87.8155156554,2e-8);
 close(q.target.lowerChange,5);
 close(q.target.original.achieved,.9,1e-10);
 close(q.target.alternative.achieved,.9,1e-10);
 assert.equal(q.original.draft.mode,"none");
 assert.equal(JSON.stringify(s.draft),original);
 const view=distributionWhatIfSummaryHtml(s,esc);
 assert.match(view,/Same target probability: 0.9/);
 assert.match(view,/T ≤ 82.8155/);
 assert.match(view,/T ≤ 87.8155/);
 assert.match(view,/Boundary change/);
 assert.match(view,/Achieved probability/);
 assert.doesNotMatch(view,/Event-probability change/);
 const svg=renderDistributionWhatIfSvg(q);
 assert.equal((svg.match(/data-whatif-target-marker="original"/g)||[]).length,1);
 assert.equal((svg.match(/data-whatif-target-marker="alternative"/g)||[]).length,1);
 assert.doesNotMatch(svg,/fill="#e9f3ee"/,"there is no single common shaded event");
 assert.equal(JSON.stringify(s.draft),original);
});
test("all five models reuse the Pass 5.1 inverse engine, with exact requested/achieved conventions",()=>{
 const cases=[
  ["normal",{mu:"70",sigma:"10",mode:"none"},"mu","75","left","0.9"],
  ["binomial",{n:"10",p:"0.5",mode:"exact",lower:"4"},"p","0.7","left","0.8"],
  ["poisson",{lambda:"3",mode:"right",lower:"4"},"lambda","5","right","0.2"],
  ["uniform",{a:"0",b:"10",mode:"between",lower:"2",upper:"5"},"b","20","left","0.25"],
  ["custom",{customPoints:"0, 0.2\n1, 0.5\n2, 0.3",mode:"none"},
   "customPoints","0, 0.1\n1, 0.5\n2, 0.4","left","0.75"]
 ];
 for(const [kind,params,key,value,mode,probability] of cases){
  const s=create(kind,params),before=JSON.stringify(s.draft);
  startTarget(s,{mode,probability});setDistributionWhatIfField(s,key,value);
  const q=compareDistributionWhatIf(s),t=q.target;
  assert.ok(q.ready&&t?.ok,kind+" "+JSON.stringify(t?.issues||q.issues));
  const request={mode,probability};
  const independentlyOriginal=inverseDistribution(s.draft,request);
  const independentlyAlternative=inverseDistribution({...s.draft,[key]:value},request);
  close(t.original.lower,independentlyOriginal.lower,1e-9);
  close(t.alternative.lower,independentlyAlternative.lower,1e-9);
  close(t.original.achieved,independentlyOriginal.achieved,1e-12);
  close(t.alternative.achieved,independentlyAlternative.achieved,1e-12);
  close(t.lowerChange,t.alternative.lower-t.original.lower,1e-9);
  assert.equal(t.discrete,["binomial","poisson","custom"].includes(kind));
  assert.ok(t.original.achieved+1e-12>=Number(probability),kind);
  assert.ok(t.alternative.achieved+1e-12>=Number(probability),kind);
  assert.equal(JSON.stringify(s.draft),before,kind);
  const html=distributionWhatIfSummaryHtml(s,esc);
  assert.match(html,/Same target probability/);
  assert.match(html,/Achieved probability/);
  assert.match(renderDistributionWhatIfSvg(q),/data-whatif-target-marker/);
  if(t.discrete)assert.match(html,/Inclusive discrete cut-offs/);
 }
});
test("discrete cut-off stays on support and may not move although the model changes",()=>{
 const s=create("custom",{customPoints:"0, 0.2\n1, 0.5\n2, 0.3"});
 startTarget(s,{probability:"0.75"});
 setDistributionWhatIfField(s,"customPoints","0, 0.1\n1, 0.5\n2, 0.4");
 const t=compareDistributionWhatIf(s).target;
 assert.ok(t.ok);
 assert.equal(t.original.lower,2);
 assert.equal(t.alternative.lower,2);
 assert.equal(t.sameBoundary,true);
 assert.equal(t.original.achieved,1);
 assert.equal(t.alternative.achieved,1);
 assert.match(distributionWhatIfSummaryHtml(s,esc),/boundary does not move/);
});
test("discrete left-tail minimum and right-tail maximum coverage remain distinct",()=>{
 for(const kind of ["binomial","poisson","custom"]){
  const d=kind==="binomial"?{n:"10",p:"0.5"}:
   kind==="poisson"?{lambda:"3"}:{customPoints:"0,0.2\n1,0.5\n3,0.3"};
  const key=kind==="binomial"?"p":kind==="poisson"?"lambda":"customPoints";
  const value=kind==="binomial"?"0.6":kind==="poisson"?"4":"0,0.1\n1,0.5\n3,0.4";
  for(const mode of ["left","right"]){
   const s=create(kind,d);startTarget(s,{mode,probability:"0.6"});
   setDistributionWhatIfField(s,key,value);
   const {target:t}=compareDistributionWhatIf(s);
   assert.equal(t.ok,true,kind+mode);
   for(const r of [t.original,t.alternative]){
    assert.ok(r.achieved>=.6-1e-12,kind+mode);
    if(r.adjacentProbability!==null)assert.ok(r.adjacentProbability<.6+1e-12,
     "adjacent cut-off must fail target for "+kind+mode);
   }
  }
 }
});
test("continuous central intervals calculate two independently moving endpoints",()=>{
 const cases=[
  ["normal",{mu:"70",sigma:"10"},"mu","75","0.8"],
  ["uniform",{a:"2",b:"10"},"b","14","0.5"]
 ];
 for(const [kind,p,key,value,target] of cases){
  const s=create(kind,p);startTarget(s,{mode:"central",probability:target});
  setDistributionWhatIfField(s,key,value);
  const q=compareDistributionWhatIf(s),t=q.target;
  assert.ok(t.ok,kind);
  assert.ok(t.original.lower<t.original.upper);
  assert.ok(t.alternative.lower<t.alternative.upper);
  close(t.original.achieved,Number(target),1e-8);
  close(t.alternative.achieved,Number(target),1e-8);
  const svg=renderDistributionWhatIfSvg(q);
  assert.equal((svg.match(/data-whatif-target-marker="original"/g)||[]).length,2);
  assert.equal((svg.match(/data-whatif-target-marker="alternative"/g)||[]).length,2);
  assert.match(distributionWhatIfSummaryHtml(s,esc),/Lower cut-off/);
  assert.match(distributionWhatIfSummaryHtml(s,esc),/upper cut-off/);
 }
});
test("invalid target requests do not apply alternatives or adjust the current figure",()=>{
 for(const [kind,request] of [
  ["normal",{mode:"left",probability:"1"}],
  ["normal",{mode:"central",probability:"1"}],
  ["poisson",{mode:"left",probability:"1"}],
  ["poisson",{mode:"right",probability:"0"}],
  ["normal",{mode:"right",probability:"-0.01"}],
  ["uniform",{mode:"left",probability:"1.01"}],
  ["binomial",{mode:"right",probability:"nan"}],
  ["custom",{mode:"left",probability:""}]
 ]){
  const params=kind==="normal"?{mu:"0",sigma:"1"}:kind==="poisson"?{lambda:"3"}:
   kind==="uniform"?{a:"0",b:"10"}:kind==="custom"?
   {customPoints:"0,0.4\n1,0.6"}:{n:"10",p:"0.4"};
  const s=create(kind,params),before=JSON.stringify(s.draft);
  startTarget(s,request);
  const change=kind==="normal"?"mu":kind==="poisson"?"lambda":
   kind==="uniform"?"b":kind==="custom"?"customPoints":"p";
  const to=kind==="normal"?"2":kind==="poisson"?"5":kind==="uniform"?"12":
   kind==="custom"?"0,0.5\n1,0.5":"0.5";
  setDistributionWhatIfField(s,change,to);
  const q=compareDistributionWhatIf(s);
  assert.equal(q.ready,true);
  assert.equal(q.target.ok,false,kind);
  assert.match(distributionWhatIfSummaryHtml(s,esc),/Check the target probability/);
  assert.doesNotMatch(distributionWhatIfSummaryHtml(s,esc),/data-action="distribution-whatif-apply"/);
  assert.equal(applyDistributionWhatIf(s).ok,false);
  assert.equal(JSON.stringify(s.draft),before);
 }
});
test("comparison selector validates choices and prevents discrete central modes",()=>{
 const s=create("poisson",{lambda:"4"});startDistributionWhatIf(s);
 assert.equal(setDistributionWhatIfOption(s,"comparison","target"),true);
 assert.equal(setDistributionWhatIfOption(s,"targetMode","central"),false);
 assert.equal(setDistributionWhatIfOption(s,"targetMode","right"),true);
 assert.equal(setDistributionWhatIfOption(s,"targetProbability","0.9"),true);
 assert.equal(setDistributionWhatIfOption(s,"comparison","bad"),false);
 assert.equal(setDistributionWhatIfOption(s,"unrecognised","x"),false);
 assert.match(renderDistributionWhatIfControls(s,esc),/data-distribution-whatif-option="targetMode"/);
 assert.doesNotMatch(renderDistributionWhatIfControls(s,esc),/Central interval/);
 // Reset only alternatives, not the student's chosen mathematical question.
 setDistributionWhatIfField(s,"lambda","6");
 assert.equal(resetDistributionWhatIf(s),true);
 assert.equal(s.whatIf.values.lambda,"4");
 assert.equal(s.whatIf.comparison,"target");
 assert.equal(s.whatIf.targetMode,"right");
 assert.equal(s.whatIf.targetProbability,"0.9");
 assert.equal(discardDistributionWhatIf(s),true);
 assert.equal(s.whatIf.active,false);
});
test("legacy backups default to fixed event; active target comparisons survive backup/restore",()=>{
 const old=create("binomial");
 old.whatIf={active:true,status:"exploring",kind:"binomial",
  source:JSON.stringify(["binomial","10","0.5"]),values:{n:"10",p:"0.6"}};
 assert.equal(normalizeDistributionStudio(old).whatIf.comparison,"event");
 const s=create("normal",{mode:"none",mu:"70",sigma:"10"});
 startTarget(s,{mode:"central",probability:"0.95"});
 setDistributionWhatIfField(s,"mu","72");
 const state=createProjectState();state.distributionStudio=s;
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 const q=compareDistributionWhatIf(restored.distributionStudio);
 assert.equal(q.comparison,"target");
 assert.equal(q.target.ok,true);
 assert.equal(q.target.mode,"central");
 assert.equal(q.target.requested,.95);
 assert.equal(restored.distributionStudio.draft.mu,"70");
 assert.equal(restored.distributionStudio.draft.mode,"none");
 close(q.target.lowerChange,2);
});
test("stale original, invalid alternative, and custom probability totals retain safeguards",()=>{
 const s=create("normal",{mu:"2",sigma:"1"});
 startTarget(s,{probability:"0.95"});setDistributionWhatIfField(s,"mu","3");
 setDistributionField(s,"mu","4");
 assert.equal(compareDistributionWhatIf(s).status,"stale");
 assert.equal(applyDistributionWhatIf(s).ok,false);
 resetDistributionWhatIf(s);
 assert.equal(s.whatIf.comparison,"target");
 assert.equal(s.whatIf.values.mu,"4");
 setDistributionWhatIfField(s,"sigma","0");
 assert.equal(compareDistributionWhatIf(s).ready,false);
 assert.equal(applyDistributionWhatIf(s).ok,false);
 const custom=create("custom",{customPoints:"0,0.4\n1,0.6"});
 startTarget(custom,{probability:"0.8"});
 setDistributionWhatIfField(custom,"customPoints","0,0.4\n1,0.6000001");
 assert.equal(compareDistributionWhatIf(custom).ready,false);
 assert.equal(applyDistributionWhatIf(custom).ok,false);
});
test("target calculation never applies cut-offs, alters saved figures or adds editor notes to SVG export",()=>{
 const state=createProjectState(),s=create("normal",{
  mu:"70",sigma:"10",mode:"between",lower:"65",upper:"75",
  sourceKind:"secondary",sourceCredit:"Original published rate"
 });
 state.distributionStudio=s;
 const saved=saveDistributionFigure(s);
 assert.equal(saved.ok,true);
 const savedBefore=JSON.stringify(s.figures),draftBefore=JSON.stringify(s.draft);
 const svgBefore=renderDistributionSvg(s.draft);
 startTarget(s,{probability:"0.9"});
 setDistributionWhatIfField(s,"mu","75");
 const q=compareDistributionWhatIf(s);
 assert.equal(q.target.ok,true);
 assert.equal(JSON.stringify(s.draft),draftBefore);
 assert.equal(JSON.stringify(s.figures),savedBefore);
 assert.equal(renderDistributionSvg(s.draft),svgBefore);
 assert.doesNotMatch(svgBefore,/data-whatif-target-marker|fixed-target|targetProbability/);
 assert.equal(applyDistributionWhatIf(s).needsProvenance,true);
 assert.equal(JSON.stringify(s.draft),draftBefore);
 const applied=applyDistributionWhatIf(s,true);
 assert.equal(applied.ok,true);
 assert.equal(s.draft.mu,"75");
 assert.equal(s.draft.lower,"65");
 assert.equal(s.draft.upper,"75");
 assert.equal(s.draft.mode,"between");
 assert.equal(s.draft.sourceKind,"theoretical");
 assert.equal(s.draft.sourceCredit,"");
 assert.equal(JSON.stringify(s.figures),savedBefore);
 assert.doesNotMatch(renderDistributionSvg(s.draft),/data-whatif-target-marker|fixed-target|targetProbability/);
});
test("extreme valid target outside graph range is reported, not placed at a fabricated end-point",()=>{
 const s=create("normal",{mu:"0",sigma:"1",mode:"none"});
 startTarget(s,{mode:"right",probability:"1e-18"});
 setDistributionWhatIfField(s,"mu","0.5");
 const q=compareDistributionWhatIf(s);
 assert.equal(q.target.ok,true);
 assert.ok(q.target.original.lower>8);
 assert.match(distributionWhatIfPreviewHtml(s,esc),/outside the displayed model window/);
 assert.equal(q.original.draft.mode,"none");
});
