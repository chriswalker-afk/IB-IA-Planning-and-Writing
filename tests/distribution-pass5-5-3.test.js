import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState,loadProjectState,STATE_VERSION} from "../src/core/project-state.js";
import {newDistributionDraft,newDistributionStudio,analyzeDistribution,normalizeDistributionStudio,
 distributionInterpretationSignature,formatDistributionProbability,normalUpperTail,binomialMass} from "../src/diagrams/distribution-core.js";
import {poissonMass,poissonCdf,poissonUpperTail} from "../src/diagrams/distribution-extra.js";
import {inverseDistribution} from "../src/diagrams/distribution-inverse.js";
import {setDistributionInverseField,calculateDistributionInverse,applyDistributionInverse} from "../src/diagrams/distribution-inverse-actions.js";
import {startDistributionWhatIf,setDistributionWhatIfField,setDistributionWhatIfOption,
 applyDistributionWhatIf} from "../src/diagrams/distribution-whatif-actions.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {distributionInverseResultHtml} from "../src/diagrams/distribution-inverse-view.js";
import {distributionWhatIfSummaryHtml} from "../src/diagrams/distribution-whatif-view.js";
import {distributionWhatIfAnnouncement,distributionInverseAnnouncement} from "../src/diagrams/distribution-accessibility.js";
import {distributionFeedbackHtml} from "../src/diagrams/distribution-view.js";
import {saveDistributionDraft,setDistributionField,loadDistribution} from "../src/diagrams/distribution-actions.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {ENTRY_BASE} from "../src/completing/entry-record.js";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const model=(kind,fields={})=>({...newDistributionDraft(),kind,title:"A reasoned model",symbol:"T",
 ...(kind==="normal"?{mu:"0",sigma:"1"}:
 kind==="binomial"?{n:"10",p:"0.4"}:
 kind==="poisson"?{lambda:"3"}:
 kind==="uniform"?{a:"0",b:"1"}:
 {customPoints:"-2,0.2\n0,0.5\n3,0.3"}),...fields});
const inverse=(kind,mode,p,fields={})=>
 inverseDistribution(model(kind,fields),{mode,probability:String(p)});
const checkDiscrete=(r,target)=>{
 assert(r.ok,r.issues.join("; "));
 assert(Number.isSafeInteger(r.lower)||Number.isFinite(r.lower));
 assert(r.achieved+Math.min(5e-15,target*1e-12)>=target,"Coverage must be achieved, not assumed");
 if(target>0&&r.adjacentProbability!==null)
  assert(r.adjacentProbability<=target+Math.min(5e-15,target*1e-12),
   "The neighbouring tighter boundary must not exceed the target");
};
test("inverse extremes preserve positive omitted tails instead of claiming absolute certainty",()=>{
 for(const [kind,fields,p] of [
  ["normal",{mu:"0",sigma:"1"},0.9999999999999999],
  ["binomial",{n:"150",p:"0.5"},0.9999999999999999],
  ["poisson",{lambda:"3"},0.9999999999999999],
  ["custom",{customPoints:"0, 0.9999999999999999\n1, 0.0000000000000001"},0.9999999999999999]
 ]){
  const r=inverse(kind,"left",p,fields);
  assert(r.ok,kind+" "+r.issues.join(" / "));
  assert(Number.isFinite(r.achievedComplement)&&r.achievedComplement>=0,kind);
  if(r.achievedComplement>0&&r.achieved>=1-1e-8)
   assert.match(formatDistributionProbability(r.achieved,r.achievedComplement),/^1 − /,kind);
  const s=newDistributionStudio();
  s.draft=model(kind,fields);
  setDistributionInverseField(s,"mode","left");
  setDistributionInverseField(s,"probability",String(p));
  calculateDistributionInverse(s);
  const html=distributionInverseResultHtml(s,esc);
  assert.match(html,/Requested probability/);
  assert.match(html,/Achieved probability/);
  assert.doesNotMatch(html,/NaN|Infinity|undefined/);
  assert.deepEqual(s.draft,model(kind,fields),"Calculation must not change original fields");
 }
});
test("normal quantiles have stable independently known rare probabilities and complementary coverage",()=>{
 const d=model("normal");
 for(const [target,z] of [
  [1e-12,-7.034483825301],
  [1e-20,-9.262340089798],
  [0.5,0],
  [0.999,3.090232306168]
 ]){
  const r=inverseDistribution(d,{mode:"left",probability:target});
  assert(r.ok,r.issues.join("; "));
  assert(Math.abs(r.lower-z)<2e-8);
  assert(Math.abs(r.achieved-target)<Math.max(1e-22,target*1e-8));
  assert(Math.abs(r.achievedComplement-normalUpperTail(z))<Math.max(1e-18,normalUpperTail(z)*1e-6));
 }
 const extreme=inverse("normal","right",1e-20);
 assert(extreme.ok);
 assert(extreme.achieved>0&&extreme.achievedComplement>0);
 for(const [mode,p] of [["left",1],["left",0],["right",1],["right",0],["central",1]])
  assert(!inverse("normal",mode,p).ok);
});
test("continuous uniform bounds reject sub-resolution inverse targets but preserve genuine endpoints",()=>{
 const tiny=inverse("uniform","left",1e-14,{a:"1000000000000",b:"1000000000001"});
 assert(!tiny.ok);
 assert.match(tiny.issues.join(" "),/endpoint|represent|scale|precision/i);
 const right=inverse("uniform","right",1e-14,{a:"1000000000000",b:"1000000000001"});
 assert(!right.ok);
 const wide=inverse("uniform","left",0.0001,{a:"1000000000000",b:"1000000000001"});
 assert(wide.ok,wide.issues.join("; "));
 assert(Math.abs(wide.achieved-0.0001)<1e-7);
 for(const [mode,p] of [["left",0],["left",1],["right",0],["right",1],["central",0],["central",1]]){
  const q=inverse("uniform",mode,p);
  assert(q.ok,q.issues.join("; "));
  assert(Math.abs(q.achieved-p)<1e-12);
 }
});
test("all finite discrete inverses meet coverage over a numerical target grid with valid adjacent cut-offs",()=>{
 const cases=[
  ["binomial",{n:"150",p:"0.37"}],
  ["binomial",{n:"10",p:"0"}],
  ["binomial",{n:"10",p:"1"}],
  ["poisson",{lambda:"0.1"}],
  ["poisson",{lambda:"100"}],
  ["custom",{customPoints:"-2,0.2\n0,0.5\n3,0.3"}],
  ["custom",{customPoints:"0, 0.9999999999999999\n1, 0.0000000000000001"}]
 ];
 const ps=[1e-16,1e-12,1e-8,0.01,0.1,0.5,0.9,0.99,0.99999999,1-Number.EPSILON];
 for(const [kind,fields] of cases)
  for(const mode of ["left","right"])
   for(const target of ps){
    const r=inverse(kind,mode,target,fields);
    if(!r.ok){
     assert(kind==="poisson"&&r.issues.some(s=>/numerical|finite/.test(s)),
      kind+" "+mode+" "+target+" "+r.issues.join("; "));
     continue;
    }
    checkDiscrete(r,target);
    if(r.achievedComplement>0&&r.achieved===1)
     assert.match(formatDistributionProbability(r.achieved,r.achievedComplement),/^1 − /);
   }
});
test("tiny finite Poisson tails are measured or rejected, never accepted with zero achieved coverage",()=>{
 for(const p of [1e-25,1e-100,1e-250,1e-300]){
  const r=inverse("poisson","right",p,{lambda:"3"});
  if(r.ok){
   assert(r.achieved>0&&r.achieved>=p,"Tiny coverage must not be 0: "+p);
   assert(poissonUpperTail(3,r.lower-1)>0);
   assert(r.adjacentProbability<p,"Boundary beyond the selected count fails target");
  }else assert.match(r.issues.join(" "),/numerical|finite|represent/);
 }
 const degenerate=inverse("poisson","left",1,{lambda:"0"});
 assert(degenerate.ok&&degenerate.achieved===1);
 assert(!inverse("poisson","left",1,{lambda:"3"}).ok);
 assert(!inverse("poisson","right",0,{lambda:"3"}).ok);
});
test("Poisson tails and binomial masses match independent finite reference values",()=>{
 assert(Math.abs(poissonCdf(3,2)-Math.exp(-3)*(1+3+9/2))<1e-12);
 assert(Math.abs(poissonUpperTail(3,2)-(1-poissonCdf(3,2)))<1e-12);
 assert(Math.abs(poissonMass(0,0)-1)<1e-15);
 assert(Math.abs(binomialMass(10,0.5,5)-252/1024)<1e-13);
 assert(Math.abs(binomialMass(10,0.5,0)-1/1024)<1e-13);
});
test("representational underflow uses an approximation sign only when true support remains",()=>{
 for(const d of [
  model("normal",{mode:"left",lower:"-50"}),
  model("normal",{mode:"left",lower:"50"}),
  model("poisson",{lambda:"100",mode:"right",lower:"2000"}),
  model("binomial",{n:"150",p:"1e-300",mode:"exact",lower:"149"})
 ]){
  const q=analyzeDistribution(d);
  assert(q.ready,q.issues.join("; "));
  assert(q.precisionLimited);
  assert.match(q.statement,/≈ [01]$/);
  assert.match(renderDistributionSvg(d),/≈ [01]/);
  assert.match(distributionFeedbackHtml({draft:d},esc),/data-distribution-precision-note/);
 }
 for(const d of [
  model("normal",{mode:"between",lower:"0",upper:"0"}),
  model("binomial",{n:"10",p:"0",mode:"exact",lower:"2"}),
  model("poisson",{lambda:"0",mode:"left",lower:"3"}),
  model("custom",{mode:"left",lower:"-2"})
 ]){
  const q=analyzeDistribution(d);
  assert(q.ready,q.issues.join("; "));
  assert(!q.precisionLimited);
  assert(!q.statement.includes("≈"));
 }
});
test("all four provenance types stay accurate after confirmed and unconfirmed what-if changes",()=>{
 for(const sourceKind of ["theoretical","primary","secondary","unsure"]){
  const s=newDistributionStudio();s.draft=model("normal",{
   sourceKind,sourceCredit:sourceKind==="secondary"?"Article, 2026":"Field note",
   note:"Original context and rationale",mode:"left",lower:"1",caption:"Do not delete student caption"
  });
  const before=JSON.stringify(s.draft);
  assert(startDistributionWhatIf(s));
  assert(setDistributionWhatIfField(s,"mu","0.5"));
  const oldSourceKind=s.draft.sourceKind;
  const initial=applyDistributionWhatIf(s);
  if(["primary","secondary"].includes(sourceKind)){
   assert(!initial.ok&&initial.needsProvenance);
   assert.equal(JSON.stringify(s.draft),before);
   assert(applyDistributionWhatIf(s,true).ok);
   assert.equal(s.draft.sourceKind,"theoretical");
   assert.equal(s.draft.sourceCredit,"");
  }else{
   assert(initial.ok);
   assert.equal(s.draft.sourceKind,oldSourceKind);
  }
  assert.equal(s.draft.note,"Original context and rationale");
  assert.equal(s.draft.caption,"Do not delete student caption");
 }
});
test("cosmetic changes do not mark completed mathematical conclusions as needing a numerical review",()=>{
 const s=createProjectState();
 s.entries=[{...ENTRY_BASE,id:"stage-a",phase:"first",status:"completed",
  title:"The numerical conclusion",result:"P(T ≤ 2) was computed",interpretation:"My conclusion in my words",limitations:"Independence assumed"}];
 s.completion.stages.C30="complete";
 s.scratch.introduction="My personal writing must stay";
 s.distributionStudio.draft=model("normal",{mu:"70",sigma:"10",mode:"left",lower:"70",note:"Normality assumed"});
 const original={...s.distributionStudio.draft,edited:true};
 s.distributionStudio.figures=[{id:"distribution-stage-a",entryId:"stage-a",
  savedAt:"2026-10-26T00:00:00Z",draft:original}];
 s.distributionStudio.activeId="distribution-stage-a";
 const base=distributionInterpretationSignature(original);
 for(const [field,value] of [["title","Renamed curve"],["caption","A new IA caption"],["figureNumber","8"],
  ["size","wide"],["printStyle","mono"],["showProbability",false],["showMean",true]]){
  assert(setDistributionField(s.distributionStudio,field,value));
  assert.equal(distributionInterpretationSignature(s.distributionStudio.draft),base,field);
 }
 const changed=saveDistributionDraft(s);
 assert(changed.ok&&!changed.reviewNeeded);
 assert.equal(s.entries[0].reviewNeeded,"");
 assert.equal(s.entries[0].interpretation,"My conclusion in my words");
 assert.equal(s.scratch.introduction,"My personal writing must stay");
 assert.equal(s.completion.stages.C30,"complete");
 assert.equal(s.distributionStudio.figures[0].draft.caption,"A new IA caption");
 assert.equal(s.distributionStudio.figures[0].entryId,"stage-a");
 const before=JSON.stringify(s.entries[0]);
 assert(setDistributionField(s.distributionStudio,"mu","75"));
 const flagged=saveDistributionDraft(s);
 assert(flagged.ok&&flagged.reviewNeeded);
 assert.equal(s.entries[0].reviewNeeded,"yes");
 assert.match(s.entries[0].reviewReason,/model parameters|event boundaries/);
 assert.equal(s.entries[0].result,JSON.parse(before).result);
 assert.equal(s.entries[0].interpretation,JSON.parse(before).interpretation);
 assert.equal(s.completion.stages.C30,"needs-review");
});
test("a change of model provenance, event, unit or active parameter requires review; latent fields do not",()=>{
 const src=model("poisson",{lambda:"3",mode:"left",lower:"2",sourceKind:"secondary",sourceCredit:"Source"});
 assert.equal(distributionInterpretationSignature(src),
  distributionInterpretationSignature({...src,mu:"19",p:"0.9",sigma:"50",figureNumber:"99",edited:true}));
 for(const edit of [{lambda:"4"},{mode:"right"},{lower:"3"},{sourceKind:"theoretical"},
  {sourceCredit:"Different source"},{unit:"per month"},{note:"Independence is challenged"}]){
  assert.notEqual(distributionInterpretationSignature(src),
   distributionInterpretationSignature({...src,...edit}),JSON.stringify(edit));
 }
});
test("modern JSON backup and legacy restore keep notes, saved figures, relationships and editor-only queries",()=>{
 const s=createProjectState();
 s.project.aim="Why would this probability change?";
 s.scratch.introduction="My first-person motivation survives";
 s.scratch.conclusion="My conclusion needs further checking";
 s.entries=[{...ENTRY_BASE,id:"stage-old",phase:"first",status:"completed",
  result:"Calculated a probability",interpretation:"Explained why the model matters",
  limitations:"I question the assumptions",distributionFigureId:"distribution-old",
  figureRefs:["distribution:distribution-old"]}];
 s.distributionStudio.draft=model("poisson",{lambda:"3",mode:"left",lower:"4",
  sourceKind:"secondary",sourceCredit:"Cited source",caption:"My saved caption"});
 s.distributionStudio.figures=[{id:"distribution-old",entryId:"stage-old",
  savedAt:"2026-10-26T00:00:00Z",draft:{...s.distributionStudio.draft}}];
 s.distributionStudio.activeId="distribution-old";
 assert(startDistributionWhatIf(s.distributionStudio));
 assert(setDistributionWhatIfField(s.distributionStudio,"lambda","6"));
 assert(setDistributionWhatIfOption(s.distributionStudio,"comparison","target"));
 const raw=JSON.parse(JSON.stringify(s));
 const restored=normalizeProjectState(raw);
 assert.equal(restored.version,STATE_VERSION);
 assert.equal(restored.scratch.introduction,s.scratch.introduction);
 assert.equal(restored.entries[0].interpretation,s.entries[0].interpretation);
 assert.equal(restored.entries[0].distributionFigureId,"distribution-old");
 assert.equal(restored.distributionStudio.figures[0].entryId,"stage-old");
 assert.equal(restored.distributionStudio.figures[0].draft.sourceCredit,"Cited source");
 assert.equal(restored.distributionStudio.whatIf.values.lambda,"6");
 assert(compareDistributionWhatIf(restored.distributionStudio).ready);
 const snapshot=JSON.stringify(restored.distributionStudio.figures);
 assert(applyDistributionWhatIf(restored.distributionStudio,true).ok);
 assert.equal(JSON.stringify(restored.distributionStudio.figures),snapshot);
 assert.equal(restored.distributionStudio.draft.sourceKind,"theoretical");
 assert.equal(restored.scratch.conclusion,s.scratch.conclusion);
 assert.equal(restored.entries[0].result,s.entries[0].result);
 assert(loadDistribution(restored.distributionStudio,"distribution-old"));
 assert.equal(restored.distributionStudio.draft.sourceKind,"secondary");
 assert.equal(restored.distributionStudio.draft.lambda,"3");
 const legacy={version:1,project:{aim:"My earlier question",course:"AA SL"},
  scratch:{introduction:"Do not erase my legacy introduction"},
  entries:[{id:"legacy-step",phase:"first",status:"planned",interpretation:"My old notes"}]};
 const old=normalizeProjectState(legacy);
 assert.equal(old.scratch.introduction,"Do not erase my legacy introduction");
 assert.equal(old.entries[0].interpretation,"My old notes");
 assert.equal(old.entries[0].status,"planned");
 assert.equal(old.distributionStudio.figures.length,0);
});
test("corrupt/unsupported backups are rejected without changing prior state; malformed editor state stays safe",()=>{
 const initial=createProjectState();
 initial.scratch.introduction="My own IA work";
 const before=JSON.stringify(initial);
 for(const value of [null,[],{},{"version":99,project:{}},{version:2,project:null}]){
  assert.throws(()=>normalizeProjectState(value),/compatible Pathfinder project file/);
 }
 assert.throws(()=>JSON.parse('{"version":2,"project":'),SyntaxError);
 assert.equal(JSON.stringify(initial),before);
 const storage={getItem:()=> '{"version":2,"project":',setItem:()=>{throw Error("Never overwrite");}};
 assert.throws(()=>loadProjectState(storage),SyntaxError);
 const damaged=JSON.parse(before);
 damaged.distributionStudio.inverse={mode:"central",probability:"0.8",status:"applied",signature:"old"};
 damaged.distributionStudio.draft=model("poisson");
 damaged.distributionStudio.whatIf={active:true,kind:"normal",source:"old",values:{mu:"80"}};
 damaged.distributionStudio.figures=[{id:"distribution-safe",entryId:"",savedAt:"",
  draft:model("normal",{title:"A real model that must survive",caption:"Saved caption"})}];
 const restored=normalizeProjectState(damaged);
 assert.equal(restored.distributionStudio.inverse.mode,"left");
 assert.equal(restored.distributionStudio.inverse.status,"idle");
 assert.equal(restored.distributionStudio.draft.kind,"poisson");
 assert.equal(restored.distributionStudio.figures[0].draft.caption,"Saved caption");
 assert.equal(compareDistributionWhatIf(restored.distributionStudio).status,"stale");
 assert(!applyDistributionWhatIf(restored.distributionStudio,true).ok);
 assert.equal(restored.scratch.introduction,"My own IA work");
});
test("clean distribution SVG output and backup records exclude inverse/what-if notes for every model",()=>{
 for(const kind of ["normal","binomial","poisson","uniform","custom"]){
  const state=createProjectState(),studio=state.distributionStudio;
  studio.draft=model(kind,{mode:"left",lower:kind==="custom"?"0":"2",caption:"IA caption only",
   sourceCredit:"Theoretical note",note:"Never print this student-authored note"});
  startDistributionWhatIf(studio);
  const key={normal:"mu",binomial:"p",poisson:"lambda",uniform:"b",custom:"customPoints"}[kind];
  const value={normal:"1",binomial:"0.7",poisson:"5",uniform:"2",custom:"-2,0.1\n0,0.5\n3,0.4"}[kind];
  setDistributionWhatIfField(studio,key,value);
  setDistributionWhatIfOption(studio,"comparison","target");
  assert(compareDistributionWhatIf(studio).ready);
  const before=JSON.stringify(studio.draft),svg=renderDistributionSvg(studio.draft);
  assert.match(svg,/<svg/);
  for(const forbidden of ["Never print this student-authored note","IA caption only",
   "Theoretical note","What if?","fixed probability","targetProbability","achievedComplement"])
   assert(!svg.includes(forbidden),kind+" should not export "+forbidden);
  assert.equal(JSON.stringify(studio.draft),before);
  const backup=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(backup.distributionStudio.draft.note,"Never print this student-authored note");
  assert.equal(backup.distributionStudio.draft.caption,"IA caption only");
  assert.equal(backup.distributionStudio.whatIf.values[key],value);
 }
});
