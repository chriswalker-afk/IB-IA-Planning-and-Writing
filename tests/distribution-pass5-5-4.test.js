/**
 * Pass 5.5.4: educational journey and release-safety regression.
 * Scenarios are illustrative workflows, NOT a judgement about syllabus
 * suitability, scores, observed data or a student's eventual IA.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {ENTRY_BASE} from "../src/completing/entry-record.js";
import {distributionAim,distributionGuidance,DISTRIBUTION_LEARNING,
 distributionComparisonRecoveryCards} from "../src/diagrams/distribution-guidance.js";
import {distributionWhatIfWritingContext} from "../src/diagrams/distribution-whatif-writing.js";
import {distributionWhatIfReflection} from "../src/diagrams/distribution-whatif-reflection.js";
import {distributionWhatIfSummaryHtml} from "../src/diagrams/distribution-whatif-view.js";
import {renderDistributionStudio} from "../src/diagrams/distribution-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {saveDistributionFigure} from "../src/diagrams/distribution-core.js";
import {setDistributionField,saveDistributionDraft} from "../src/diagrams/distribution-actions.js";
import {startDistributionWhatIf,setDistributionWhatIfField,setDistributionWhatIfOption} from "../src/diagrams/distribution-whatif-actions.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {activateRepresentationTool} from "../src/diagrams/representation-registry.js";
import {studioHelpFor} from "../src/help/studio-help.js";
import {lessonById} from "../src/workshop/catalog.js";
import {insightItems} from "../src/ui/insight-threads.js";
const e=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const kinds={
 normal:{fields:{mu:"70",sigma:"10"},key:"mu",alternative:"75"},
 binomial:{fields:{n:"10",p:"0.4"},key:"p",alternative:"0.6"},
 poisson:{fields:{lambda:"3"},key:"lambda",alternative:"5"},
 uniform:{fields:{a:"0",b:"10"},key:"b",alternative:"12"},
 custom:{fields:{customPoints:"0,0.2\n2,0.5\n3,0.3"},key:"customPoints",
  alternative:"0,0.1\n2,0.5\n3,0.4"}
};
const sourceContext={
 primary:"estimated from your own data",
 secondary:"published parameters",
 theoretical:"assumed model",
 unsure:"not yet confirmed"
};
function journey({course="AI SL",kind="binomial",source="primary",comparison="event",phase="first",status="completed"}={}){
 const s=createProjectState();
 s.route="completing";s.completion.current="C31";
 s.project.course=course;s.planning.fields.course=course;
 s.planning.fields.aim="How might my stated model affect the probability of an outcome?";
 s.planning.fields.motivation="I want to make a defensible decision about an uncertainty.";
 s.planning.fields.dataSource=source==="theoretical"?"":source;
 s.planning.fields.secondaryPublisher=source==="secondary"?"Named published source":"";
 s.planning.routeExplorer.selectedRoute="chance";
 s.scratch.introduction="My first-person introduction must remain mine.";
 s.scratch.conclusion="My conclusion still needs careful evaluation.";
 s.entries=[{...ENTRY_BASE,id:"real-maths",phase,status,title:"Checking a proposed model",
  result:status==="completed"?"I checked the original numerical result.":"",
  interpretation:"I explain only what my original model supports.",
  limitations:"The model conditions may not hold.",nextQuestion:"Is the result robust?"}];
 s.completion.activeEntryIndex=0;
 s.completion.editorReturnNode=phase==="first"?"C30":"C40";
 activateRepresentationTool(s,"distribution");
 const d=s.distributionStudio.draft;
 Object.assign(d,kinds[kind].fields,{kind,mode:comparison==="event"?"left":"none",
  lower:comparison==="event"?"2":"",title:"A student-defined model",
  symbol:"T",unit:"minutes",sourceKind:source,sourceCredit:source==="secondary"?"Named publication (2026)":"",
  note:"Student's original justification and assumptions"});
 startDistributionWhatIf(s.distributionStudio);
 if(comparison==="target")setDistributionWhatIfOption(s.distributionStudio,"comparison","target");
 const spec=kinds[kind];
 assert(setDistributionWhatIfField(s.distributionStudio,spec.key,spec.alternative));
 const q=compareDistributionWhatIf(s.distributionStudio);
 assert(q.ready,q.issues?.join("; "));
 assert(q.changed);
 if(comparison==="target")assert(q.target.ok,q.target.issues.join("; "));
 else assert(q.sensitivity.eventValid);
 return {s,q};
}
test("Planning aims and proposed sources survive into the creator as context, never verified findings",()=>{
 const {s}=journey({source:"primary"});
 const g=distributionGuidance(s,s.distributionStudio.draft);
 assert.equal(g.aim,s.planning.fields.aim);
 assert.equal(distributionAim(s),s.planning.fields.aim);
 assert(g.sparks.some(x=>x.kind==="planned"&&/source/i.test(x.title)));
 assert(!g.sparks.some(x=>x.kind==="confirmed"),"A planning choice is not an independently confirmed observation");
 assert.match(g.origin,/estimated from your own data/);
 assert.match(g.stage,/not linked/);
 const insight=insightItems(s);
 assert(insight.some(x=>x.id==="aim"));
 assert(!insight.some(x=>/whatif|sensitivity/i.test(x.id)));
 assert.equal(s.project.course,"AI SL");
});
test("course × model × event/target matrix keeps student-owned work, contextual workshop and I am stuck",()=>{
 const courses=["AI SL","AA SL","AA HL"];
 const models=["normal","binomial","poisson","uniform","custom"];
 const sources=["primary","secondary","theoretical","unsure"];
 for(const [i,course] of courses.entries())
 for(const [j,kind] of models.entries())
 for(const comparison of ["event","target"]){
  const source=sources[(i+j)%sources.length],phase=j%2?"substantial":"first";
  const {s,q}=journey({course,kind,source,comparison,phase});
  const before=JSON.stringify(s),d=s.distributionStudio.draft;
  const g=distributionGuidance(s,d),ctx=distributionWhatIfWritingContext(s);
  const reflection=distributionWhatIfReflection(q,d,distributionAim(s));
  const cards=distributionComparisonRecoveryCards(d,q,distributionAim(s));
  const help=studioHelpFor(s,"whatif");
  assert(reflection&&reflection.prompts.length===3,course+" "+kind+" "+comparison);
  assert.equal(ctx.aim,s.planning.fields.aim);
  assert.equal(ctx.lessonId,DISTRIBUTION_LEARNING[kind].lessonId);
  assert(lessonById(ctx.lessonId),"Missing registered Maths Workshop lesson");
  assert.equal(ctx.focusPath,"entries.0.interpretation");
  assert.equal(ctx.returnNode,phase==="first"?"C30":"C40");
  assert(ctx.notes.resultConfirmed&&ctx.hasCompletedInsight);
  assert.match(g.origin,new RegExp(sourceContext[source]));
  assert(g.definitions.length>0);
  assert.equal(cards.length,3);
  assert.deepEqual(cards.map(x=>x.id),["distribution-whatif-meaning",
   "distribution-whatif-assumptions","distribution-whatif-relevance"]);
  assert.deepEqual(help.choices.map(x=>x.id),cards.map(x=>x.id));
  if(comparison==="target"){
   assert.match(cards[0].action,/cut-offs and their achieved probabilities/);
   if(["binomial","poisson","custom"].includes(kind))assert.match(reflection.prompts[1].question,/ACHIEVED|cut-off/i);
   assert.match(g.event,/not applied|not shaded/i,"The target must not masquerade as a saved event");
  }else{
   assert.match(cards[0].action,/same event/);
   assert.match(g.event,/selected region/);
  }
  assert.match(reflection.caution,/hypothetical|not evidence/);
  assert.doesNotMatch(JSON.stringify({g,reflection,cards}),/guaranteed grade|award of marks|automatically completed your IA/i);
  const html=distributionWhatIfSummaryHtml(s.distributionStudio,e,g.aim,ctx);
  assert.match(html,/data-action="distribution-whatif-write"/);
  assert.match(html,new RegExp('data-workshop-id="'+ctx.lessonId+'"'));
  assert.match(html,/data-studio-stuck="C31:whatif"/);
  assert.doesNotMatch(renderDistributionSvg(d),/What does this tell me|Insight Threads|I am stuck|Your saved aim/);
  assert.equal(JSON.stringify(s),before,"Reading help or comparisons must not mutate a student project");
 }
});
test("source questions remain accurate with no claim that a hypothetical alternative is observed or published",()=>{
 for(const source of ["primary","secondary","theoretical","unsure"]){
  const {s,q}=journey({kind:"normal",source,comparison:"target"});
  const r=distributionWhatIfReflection(q,s.distributionStudio.draft,distributionAim(s));
  const evaluation=r.prompts.find(p=>p.id==="evaluation").question;
  assert.match(evaluation,source==="primary"?/hypothetical value is not another estimate/:
   source==="secondary"?/not a second published result/:
   source==="theoretical"?/Neither set of assumed parameters is an observation/:
   /establish whether the original parameters were assumed/);
  assert.equal(s.distributionStudio.draft.sourceKind,source);
  if(source==="secondary")assert.equal(s.distributionStudio.draft.sourceCredit,"Named publication (2026)");
 }
});
test("a cosmetic-only edit does not trigger a mathematical revision warning in guidance or invalidate writing",()=>{
 const {s}=journey({kind:"normal",source:"secondary",comparison:"event"});
 const studio=s.distributionStudio,entry=s.entries[0];
 // Stop exploration to keep only the ordinary model for the saved figure.
 studio.whatIf.active=false;
 const saved=saveDistributionFigure(studio,entry.id);
 assert(saved.ok);
 entry.distributionFigureId=saved.record.id;
 entry.figureRefs=["distribution:"+saved.record.id];
 assert.match(distributionGuidance(s,studio.draft).stage,/explicitly linked/);
 const oldText=JSON.stringify(s.entries),oldFigures=JSON.stringify(studio.figures);
 for(const [key,value] of [
  ["title","A clearer title"],["caption","Figure 3. Original model"],["figureNumber","3"],
  ["printStyle","mono"],["size","wide"],["showMean",true],["showParameters",true]
 ])assert(setDistributionField(studio,key,value));
 assert.match(distributionGuidance(s,studio.draft).stage,/explicitly linked/);
 assert.doesNotMatch(distributionGuidance(s,studio.draft).stage,/revisit any written probability/);
 assert.equal(JSON.stringify(studio.figures),oldFigures,"Editing the draft cannot change the saved figure");
 const cosmeticSave=saveDistributionDraft(s);
 assert(cosmeticSave.ok&&!cosmeticSave.reviewNeeded);
 assert.equal(JSON.stringify(s.entries),oldText,"Cosmetic save cannot edit interpretation");
 assert(setDistributionField(studio,"mu","75"));
 assert.match(distributionGuidance(s,studio.draft).stage,/revisit any written probability/);
 assert.equal(entry.interpretation,"I explain only what my original model supports.");
 const substantive=saveDistributionDraft(s);
 assert(substantive.ok&&substantive.reviewNeeded);
 assert.equal(entry.reviewNeeded,"yes");
 assert.equal(entry.interpretation,"I explain only what my original model supports.");
 assert.equal(s.scratch.conclusion,"My conclusion still needs careful evaluation.");
});
test("legacy-compatible backup and clean outputs retain original writing but exclude help and scenarios",()=>{
 const {s}=journey({course:"AA HL",kind:"poisson",source:"secondary",comparison:"target",phase:"substantial"});
 const before=JSON.stringify(s),svg=renderDistributionSvg(s.distributionStudio.draft);
 const html=renderDistributionStudio(s,()=>"",e);
 assert.match(html,/data-distribution-learning/);
 assert.match(html,/Earlier Sparks to reconsider/);
 assert.match(html,/What does this tell me/);
 assert(!svg.includes(s.planning.fields.aim));
 assert(!svg.includes("Named publication (2026)"));
 assert(!svg.includes("student's original justification"));
 assert(!svg.includes("targetProbability"));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.scratch.introduction,s.scratch.introduction);
 assert.equal(restored.scratch.conclusion,s.scratch.conclusion);
 assert.deepEqual(restored.entries,s.entries);
 assert.equal(restored.distributionStudio.whatIf.comparison,"target");
 assert.equal(restored.distributionStudio.draft.sourceKind,"secondary");
 assert.equal(renderDistributionSvg(restored.distributionStudio.draft),svg);
 assert.equal(JSON.stringify(s),before);
});
