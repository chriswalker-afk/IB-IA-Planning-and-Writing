import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newDistributionDraft,saveDistributionFigure} from "../src/diagrams/distribution-core.js";
import {distributionGuidance,distributionRecoveryCards,renderDistributionGuidance,DISTRIBUTION_LEARNING} from "../src/diagrams/distribution-guidance.js";
import {renderDistributionStudio} from "../src/diagrams/distribution-view.js";
import {contextualWorkshopHelp} from "../src/help/workshop-help.js";
import {contextualLearningChoices} from "../src/resources/contextual-learning.js";
import {studioHelpFor} from "../src/help/studio-help.js";
import {lessonById,definitionById} from "../src/workshop/catalog.js";
import {resourceAction} from "../src/resources/actions.js";
import {newResourceSession} from "../src/resources/state.js";
import {figureCaption,handoverQuestions} from "../src/diagrams/presentation-coach-core.js";
import {renderFigureHandover} from "../src/diagrams/presentation-coach-view.js";
import {insightItems,insightForCurrent,featuredSparkItems} from "../src/ui/insight-threads.js";
import {insightConnections} from "../src/ui/insight-network.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";

const make=(changes={})=>({...newDistributionDraft(),title:"Model of observed reaction time",
 symbol:"T",unit:"seconds",mu:"70",sigma:"10",mode:"between",lower:"65",upper:"85",...changes});
const stateFor=(draft=make())=>{
 const state=createProjectState();
 state.route="completing";state.completion.current="C31";
 state.planning.fields.aim="Can an assumed distribution help me compare reaction times?";
 state.distributionStudio.open=true;state.distributionStudio.draft=draft;
 return state;
};
const linkedState=(draft=make())=>{
 const state=stateFor(draft);
 const result=saveDistributionFigure(state.distributionStudio);
 assert.equal(result.ok,true);
 state.entries=[{id:"math-model",phase:"first",status:"planned",result:"",
  distributionFigureId:result.record.id,figureRefs:["distribution:"+result.record.id],
  title:"Compare modelled reaction-time probabilities",methodId:draft.kind}];
 result.record.entryId="math-model";
 state.completion.activeEntryIndex=0;
 return state;
};
test("Workshop lessons and definitions connect directly to both native models",()=>{
 for(const kind of ["normal","binomial"]){
  const profile=DISTRIBUTION_LEARNING[kind],lesson=lessonById(profile.lessonId);
  assert(lesson,kind);assert.equal(lesson.creator,"distribution");
  assert(profile.definitions.every(id=>definitionById(id)));
  const state=stateFor(make({kind,mode:"none"}));
  const h=contextualWorkshopHelp(state,{spot:"page"});
  assert.equal(h.lessonId,profile.lessonId);
  const choices=contextualLearningChoices(state,{spot:"page"});
  assert.equal(choices?.lessonId,profile.lessonId);
  assert.equal(choices?.creatorId,"distribution");
  const session=newResourceSession();
  const opened=resourceAction(state,session,"resource-workshop",{workshopId:profile.lessonId,resourceHelp:"true"});
  assert.equal(opened.ok,true);assert.equal(session.workshopId,profile.lessonId);
 }
});
test("model-specific event, assumptions and source prompts track actual editable inputs",()=>{
 const s=stateFor();
 const normal=distributionGuidance(s,s.distributionStudio.draft);
 assert.equal(normal.kind,"normal");
 assert.match(normal.event,/P\(65 ≤ T ≤ 85\)/);
 assert.match(normal.event,/0\.6247/);
 assert.match(normal.variable,/T/);assert.match(normal.variable,/seconds/);
 assert.match(normal.aim,/reaction times/);
 assert.match(normal.origin,/assumed/i);assert.match(normal.limit,/normal/i);
 s.distributionStudio.draft=make({kind:"binomial",symbol:"B",unit:"",n:"10",p:".3",mode:"exact",lower:"2",sourceKind:"primary"});
 const binomial=distributionGuidance(s,s.distributionStudio.draft);
 assert.match(binomial.event,/P\(B = 2\)/);
 assert.match(binomial.particular,/Exactly one integer/);
 assert.match(binomial.origin,/estimated/i);
 assert.match(binomial.condition,/independence/i);
 s.distributionStudio.draft.sourceKind="secondary";
 assert.match(distributionGuidance(s,s.distributionStudio.draft).origin,/original publisher/i);
 s.distributionStudio.draft.sourceKind="unsure";
 assert.match(distributionGuidance(s,s.distributionStudio.draft).origin,/not yet confirmed/i);
});
test("I am stuck diagnoses different mathematical obstacles and stages without inventing findings",()=>{
 const normal=distributionRecoveryCards(make(),"part:reflect");
 assert.equal(normal[0].id,"distribution-event");
 assert.match(normal[0].action,/area/i);
 const binomial=distributionRecoveryCards(make({kind:"binomial",symbol:"B",mode:"exact",lower:"2"}),"part:introduce");
 assert.equal(binomial[0].id,"distribution-why");
 assert.match(binomial[0].action,/independence/i);
 assert.match(binomial[1].boundary,/observed data/i);
 const s=stateFor();
 const c31=studioHelpFor(s,"page");
 assert(c31.choices.some(x=>x.id==="distribution-event"));
 assert(c31.choices.some(x=>x.id==="distribution-assumptions"));
 assert.equal(c31.source,"No mathematical result selected");
 const linked=linkedState();
 linked.completion.current="C30";
 const c30=studioHelpFor(linked,"part:reflect");
 assert.equal(c30.choices[0].id,"not-yet-result","Unperformed maths remains protected");
 assert(c30.choices.some(x=>x.id==="distribution-event"));
});
test("lesson and writing guidance is in the editor, never in printed SVG",()=>{
 const s=stateFor();
 const html=renderDistributionStudio(s,icon,escapeHtml);
 assert.match(html,/data-distribution-learning/);
 assert.match(html,/data-studio-stuck="C31:page"/);
 assert.match(html,/data-workshop-id="normal-models"/);
 assert.match(html,/data-workshop-term="probability-density"/);
 assert.match(html,/Your saved aim:/);
 assert.match(html,/These are questions to guide your own explanation/);
 assert.doesNotMatch(html.match(/<svg[\s\S]*?<\/svg>/)?.[0]||"",/Show me|Help me|I am stuck|model assumption/i);
 const b=stateFor(make({kind:"binomial",n:"10",p:".2",symbol:"B",mode:"right",lower:"4"}));
 const different=renderDistributionGuidance(b,icon,escapeHtml);
 assert.match(different,/binomial-models/);
 assert.match(different,/inclusive integer endpoints/i);
});
test("linked distribution figures are surfaced as editable, read-only Insight Threads",()=>{
 const s=linkedState();
 const saved=s.distributionStudio.figures[0];
 let figure=insightItems(s).find(x=>x.id==="figure:distribution:"+saved.id);
 assert(figure);
 assert.equal(figure.type,"figure");assert.equal(figure.planned,true);
 assert.deepEqual(figure.linked,["math-model"]);
 assert(figure.details.some(x=>x.value.includes("Assumed")));
 assert(insightForCurrent(s,"C32").some(x=>x.id===figure.id));
 assert(featuredSparkItems(s,"C31").some(x=>x.id===figure.id));
 const thread=insightConnections(s).find(x=>x.id===figure.id);
 assert(thread);assert.match(thread.label,/figure explicitly linked/);
 assert.equal(thread.used[0].status,"Planned step");
 s.entries[0].status="completed";s.entries[0].result="A calculation I actually made";
 figure=insightItems(s).find(x=>x.id==="figure:distribution:"+saved.id);
 assert.equal(figure.planned,false);
 assert.equal(figure.needsReview,false);
 s.entries[0].reviewNeeded="yes";
 assert(insightItems(s).find(x=>x.id===figure.id).needsReview);
 const backup=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert(insightItems(backup).some(x=>x.id===figure.id));
});
test("unlinked distributions never fabricate discovery Sparks or stage evidence",()=>{
 const s=stateFor();
 assert.equal(saveDistributionFigure(s.distributionStudio).ok,true);
 assert(!insightItems(s).some(x=>x.type==="figure"));
 assert(!insightConnections(s).some(x=>x.type==="figure"));
 assert(!insightItems(s).some(x=>x.type==="discovery"&&x.id.startsWith("figure:")));
});
test("figure handover is specific to normal/binomial mathematics and preserves student authorship",()=>{
 const s=linkedState(),d=s.distributionStudio.figures[0].draft;
 d.figureNumber="4";d.caption="Modelled interval for theoretical reaction times";
 const label=figureCaption(s,"distribution",d);
 assert.match(label,/Figure 4/);assert.match(label,/Modelled interval/);
 const q=handoverQuestions(s,"distribution",d);
 assert.match(q.before,/normal probability-density/i);
 assert.match(q.after,/P\(65 ≤ T ≤ 85\)/);
 assert.match(q.after,/not present/i);
 assert.match(q.limitation,/normality/i);
 const html=renderFigureHandover(s,"distribution",d,icon,escapeHtml,{id:s.distributionStudio.figures[0].id,linked:true});
 assert.match(html,/data-figure-handover="distribution"/);
 assert.match(html,/model probability/i);
 const b=handoverQuestions(s,"distribution",make({kind:"binomial",symbol:"B",n:"10",p:"0.3",mode:"exact",lower:"2"}));
 assert.match(b.before,/binomial model/i);assert.match(b.limitation,/independent/i);
});
test("source, aim and arbitrary student text cannot inject markup into guidance",()=>{
 const s=stateFor(make({title:"<img src=x onerror=alert(1)>",note:"<script>bad()</script>"}));
 s.planning.fields.aim="<img src=x onerror=bad()>";
 const html=renderDistributionGuidance(s,icon,escapeHtml);
 assert.doesNotMatch(html,/<img|<script>/);
 assert.match(html,/&lt;img/);
});
