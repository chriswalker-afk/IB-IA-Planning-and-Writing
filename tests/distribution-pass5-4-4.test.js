import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {ENTRY_BASE} from "../src/completing/entry-record.js";
import {insightItems} from "../src/ui/insight-threads.js";
import {DISTRIBUTION_LEARNING,distributionAim} from "../src/diagrams/distribution-guidance.js";
import {distributionWhatIfWritingContext} from "../src/diagrams/distribution-whatif-writing.js";
import {distributionWhatIfSummaryHtml} from "../src/diagrams/distribution-whatif-view.js";
import {renderDistributionStudio} from "../src/diagrams/distribution-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {startDistributionWhatIf,setDistributionWhatIfField,setDistributionWhatIfOption,discardDistributionWhatIf} from "../src/diagrams/distribution-whatif-actions.js";
import {activateRepresentationTool} from "../src/diagrams/representation-registry.js";
import {studioHelpFor} from "../src/help/studio-help.js";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const setup=(kind="normal",event="event")=>{
 const s=createProjectState();s.route="completing";s.completion.current="C31";
 activateRepresentationTool(s,"distribution");
 const d=s.distributionStudio.draft;
 d.kind=kind;d.title="A mathematical probability model";d.mode="left";d.lower="2";d.symbol="T";
 if(kind==="normal"){d.mu="1";d.sigma="2";}
 if(kind==="binomial"){d.n="10";d.p="0.4";}
 if(kind==="poisson"){d.lambda="3";}
 if(kind==="uniform"){d.a="0";d.b="10";}
 if(kind==="custom"){d.customPoints="0,0.2\n2,0.5\n3,0.3";}
 startDistributionWhatIf(s.distributionStudio);
 if(event==="target")setDistributionWhatIfOption(s.distributionStudio,"comparison","target");
 const [key,value]=kind==="normal"?["mu","2"]:kind==="binomial"?["p","0.6"]:
  kind==="poisson"?["lambda","5"]:kind==="uniform"?["b","12"]:
  ["customPoints","0,0.1\n2,0.5\n3,0.4"];
 setDistributionWhatIfField(s.distributionStudio,key,value);
 return s;
};
test("bridge points to existing IA Studio field, not a new note record",()=>{
 const s=setup();
 const before=JSON.stringify(s);
 const ctx=distributionWhatIfWritingContext(s);
 assert.equal(ctx.entryIndex,-1);
 assert.equal(ctx.focusPath,"completion.fields.firstInterpretation");
 assert.equal(ctx.returnNode,"C30");
 assert.equal(ctx.lessonId,"normal-models");
 assert.equal(ctx.hasInsight,false);
 assert.equal(ctx.needsRealResult,true);
 assert.equal(JSON.stringify(s),before);
 const html=renderDistributionStudio(s,()=>"",esc);
 assert.match(html,/data-distribution-writing-bridge/);
 assert.match(html,/data-action="distribution-whatif-write"/);
 assert.match(html,/data-workshop-id="normal-models"/);
 assert.match(html,/data-studio-stuck="C31:whatif"/);
 assert.equal((html.match(/data-action="distribution-whatif-write"/g)||[]).length,1);
});
test("recorded notes and Insight Threads stay tied to canonical mathematical entry",()=>{
 const s=setup(),original=JSON.stringify(s.distributionStudio);
 s.entries=[{...ENTRY_BASE,id:"distribution-stage",phase:"first",title:"The model",
  status:"completed",result:"Student verified the original probability from their working.",
  interpretation:"This probability is conditional on a stated model.",
  limitations:"The trial independence assumption may not hold."}];
 s.completion.activeEntryIndex=0;s.completion.editorReturnNode="C30";
 const ctx=distributionWhatIfWritingContext(s);
 assert.equal(ctx.focusPath,"entries.0.interpretation");
 assert.equal(ctx.returnNode,"C30");
 assert.equal(ctx.notes.interpretation,true);
 assert.equal(ctx.notes.limitation,true);
 assert.equal(ctx.notes.resultConfirmed,true);
 assert.equal(ctx.hasCompletedInsight,true);
 assert.ok(ctx.insightCount>=2);
 const ids=insightItems(s).map(i=>i.id);
 assert.ok(ids.includes("result:distribution-stage"));
 assert.ok(ids.includes("limitation-note:distribution-stage"));
 assert.ok(!ids.some(x=>/whatif|sensitivity|comparison:/.test(x)));
 assert.match(distributionWhatIfSummaryHtml(s.distributionStudio,esc,"",ctx),/existing Insight Threads already reflect notes/);
 assert.equal(JSON.stringify(s.distributionStudio),original);
});
test("planned or provisional notes never become completed results through the bridge",()=>{
 const s=setup("binomial","target");
 s.entries=[{...ENTRY_BASE,id:"provisional-model",phase:"first",status:"planned",
  interpretation:"I might compare two assumptions."}];
 s.completion.activeEntryIndex=0;
 const ctx=distributionWhatIfWritingContext(s);
 assert.equal(ctx.needsRealResult,true);
 assert.equal(ctx.hasCompletedInsight,false);
 assert.equal(ctx.notes.interpretation,true);
 assert.equal(s.entries[0].status,"planned");
 assert.ok(!insightItems(s).some(x=>x.id==="result:provisional-model"));
 const html=distributionWhatIfSummaryHtml(s.distributionStudio,esc,"",ctx);
 assert.match(html,/does not count as completed mathematical work/);
 assert.match(html,/Continue in IA Studio/);
});
test("different model kinds route through their EXISTING workshop lesson IDs",()=>{
 for(const kind of ["normal","binomial","poisson","uniform","custom"]){
  const s=setup(kind),ctx=distributionWhatIfWritingContext(s);
  const lessonId=DISTRIBUTION_LEARNING[kind].lessonId;
  assert.equal(ctx.lessonId,lessonId,kind);
  const html=distributionWhatIfSummaryHtml(s.distributionStudio,esc,"",ctx);
  assert.match(html,new RegExp('data-workshop-id="'+lessonId+'"'),kind);
  assert.match(html,/data-studio-stuck="C31:whatif"/,kind);
  assert.doesNotMatch(renderDistributionSvg(s.distributionStudio.draft),/Related Maths Workshop|What does this tell me|distribution-whatif-write/);
 }
});
test("comparison-aware I am stuck supports both fixed events and fixed target probability",()=>{
 for(const comparison of ["event","target"]){
  const s=setup("binomial",comparison),help=studioHelpFor(s,"whatif");
  assert.ok(help);
  assert.equal(help.node,"C31");
  assert.equal(help.spot,"whatif");
  assert.deepEqual(help.choices.map(x=>x.id),[
   "distribution-whatif-meaning","distribution-whatif-assumptions","distribution-whatif-relevance"]);
  assert.match(help.choices[0].action,comparison==="target"?/cut-offs and their achieved probabilities/:/same event/);
  assert.match(help.choices[1].action,/independent|success|trials/);
  assert.match(help.choices[2].action,/existing IA Studio mathematical stage/);
  assert.match(help.choices[0].boundary,/hypothetical sensitivity comparison/);
 }
});
test("no comparison-specific help or writing CTA when comparison is invalid, stale or inactive",()=>{
 const s=setup("normal");
 setDistributionWhatIfField(s.distributionStudio,"sigma","0");
 assert.equal(compareDistributionWhatIf(s.distributionStudio).ready,false);
 assert.equal(studioHelpFor(s,"whatif"),null);
 const ctx=distributionWhatIfWritingContext(s);
 assert.doesNotMatch(distributionWhatIfSummaryHtml(s.distributionStudio,esc,"",ctx),/data-action="distribution-whatif-write"/);
 discardDistributionWhatIf(s.distributionStudio);
 assert.equal(studioHelpFor(s,"whatif"),null);
 assert.doesNotMatch(distributionWhatIfSummaryHtml(s.distributionStudio,esc,"",ctx),/Continue in IA Studio/);
 activateRepresentationTool(s,"graph");
 assert.equal(studioHelpFor(s,"whatif"),null);
});
test("later mathematical stage returns to itself and reuses its existing interpretation",()=>{
 const s=setup("poisson","target");
 s.entries=[{...ENTRY_BASE,id:"later-distribution",phase:"substantial",title:"Rate model",
  interpretation:"Already drafted a cautious interpretation.",limitations:"One assumption to check."}];
 s.completion.activeEntryIndex=0;s.completion.editorReturnNode="C40";
 const ctx=distributionWhatIfWritingContext(s);
 assert.equal(ctx.returnNode,"C40");
 assert.equal(ctx.focusPath,"entries.0.interpretation");
 assert.equal(ctx.notes.interpretation,true);
 assert.equal(s.entries[0].interpretation,"Already drafted a cautious interpretation.");
 assert.match(distributionWhatIfSummaryHtml(s.distributionStudio,esc,"",ctx),/Continue in IA Studio/);
});
test("legacy backups restore and comparisons never contaminate existing writing or print exports",()=>{
 const s=setup("normal");
 s.entries=[{...ENTRY_BASE,id:"student-existing",phase:"first",interpretation:"My own writing."}];
 s.completion.activeEntryIndex=0;
 s.planning.fields.aim="How does my own variable change?";
 const before=JSON.stringify(s.entries),beforeExport=renderDistributionSvg(s.distributionStudio.draft);
 const backup=JSON.parse(JSON.stringify(s));
 const restored=normalizeProjectState(backup);
 const ctx=distributionWhatIfWritingContext(restored);
 assert.equal(ctx.aim,distributionAim(restored));
 assert.equal(JSON.stringify(restored.entries),before);
 assert.equal(renderDistributionSvg(restored.distributionStudio.draft),beforeExport);
 assert.match(distributionWhatIfSummaryHtml(restored.distributionStudio,esc,ctx.aim,ctx),/Insight Threads reuse your own IA Studio writing/);
 assert.equal(restored.entries[0].interpretation,"My own writing.");
 assert.ok(!JSON.stringify(restored.entries).includes("parameter scenario"));
});
