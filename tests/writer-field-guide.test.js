
import test from "node:test";
import assert from "node:assert/strict";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {createProjectState} from "../src/core/project-state.js";
import {STUDIO_WRITING_NODES} from "../src/completing/studio-writing-stages.js";
import {journeyOutcomeOptions} from "../src/completing/adaptive-journey.js";
import {writingGuideRecommendation,renderWriterGuideAccess} from "../src/completing/writer-guide-context.js";
import {
 FIELD_GUIDE_TIPS,FIELD_GUIDE_CONTEXT,contextualGuideTip,
 renderFieldGuideTeaser,renderWriterFieldGuide,renderContextualGuide,
 renderWriterGuideWelcome,shouldShowWriterGuideWelcome
} from "../src/completing/writer-field-guide.js";

test("Writer's Field Guide includes six essentials plus eight meaningful extra lessons",()=>{
 assert.equal(FIELD_GUIDE_TIPS.length,14);
 assert.equal(FIELD_GUIDE_TIPS.filter(x=>x.essential).length,6);
 assert.equal(FIELD_GUIDE_TIPS.filter(x=>!x.essential).length,8);
 assert.equal(new Set(FIELD_GUIDE_TIPS.map(x=>x.id)).size,14);
 assert.deepEqual(new Set(FIELD_GUIDE_TIPS.map(x=>x.family)),new Set(["voice","maths","reader"]));
 for(const tip of FIELD_GUIDE_TIPS){
  for(const field of ["title","hook","explanation","ordinary","stronger","why","moment"]){
   assert(tip[field].trim().length>8,tip.id+" missing "+field);
  }
  assert(tip.icon.trim().length>=3);
  assert.notEqual(tip.ordinary,tip.stronger);
  assert(!/you must include every/.test(tip.explanation.toLowerCase()));
 }
});

test("Field Guide entrance is a compact optional writing tile and does not replace IB criteria access",()=>{
 const teaser=renderFieldGuideTeaser(icon,escapeHtml);
 assert.match(teaser,/Key advice to read before you start writing/);
 assert.match(teaser,/Explore 14 writing tips/);
 assert.match(teaser,/data-action="writer-guide-open"/);
 assert.match(teaser,/data-action="essentials-open"/);
 assert.match(teaser,/THE WRITER’S FIELD GUIDE/);
 assert.doesNotMatch(teaser,/Write, check, revise/);
});

test("Each tip has an accessible expandable card with optional authentic advice and fictional comparisons",()=>{
 const html=renderWriterFieldGuide(icon,escapeHtml);
 assert.equal((html.match(/data-guide-card="/g)||[]).length,14);
 assert.equal((html.match(/data-guide-example="/g)||[]).length,14);
 assert.equal((html.match(/data-guide-text="stronger" hidden/g)||[]).length,14);
 assert.equal((html.match(/data-guide-text="ordinary"/g)||[]).length,14);
 assert.equal((html.match(/writer-guide-example-why" hidden/g)||[]).length,14);
 assert.equal((html.match(/data-action="writer-guide-story"/g)||[]).length,5);
 assert.equal((html.match(/data-action="writer-guide-filter"/g)||[]).length,4);
 assert.equal((html.match(/class="writer-guide-challenge"/g)||[]).length,3);
 assert.match(html,/fictional teaching examples/);
 assert.match(html,/not a compulsory five-step template/i);
 assert.match(html,/The six essentials/);
 assert.match(html,/Eight more ideas when you need them/);
 assert.match(html,/IB criteria/);
 assert.match(html,/data-action="close-drawer"/);
});

test("Contextual guidance is linked to the correct stage without becoming a student spark",()=>{
 for(const [stage,tipId] of Object.entries(FIELD_GUIDE_CONTEXT)){
  assert(FIELD_GUIDE_TIPS.some(x=>x.id===tipId),"Missing tip for "+stage);
  assert.equal(contextualGuideTip(stage).id,tipId);
  const html=renderContextualGuide(icon,escapeHtml,stage);
  assert(html.includes('data-guide-tip="'+tipId+'"'));
  assert(html.includes("A tip from your Field Guide"));
  assert(!html.includes("spark-edit"));
 }
 assert.equal(contextualGuideTip("C00"),null);
 assert.equal(renderContextualGuide(icon,escapeHtml,"C00"),"");
 assert.equal(contextualGuideTip("not-a-stage"),null);
});

test("Writing Guide first-visit welcome is substantial but does not change the current criteria",()=>{
 const html=renderWriterGuideWelcome(icon,escapeHtml);
 assert.match(html,/BEFORE YOU WRITE/);
 assert.match(html,/Six ideas to take into your IA/);
 assert.equal((html.match(/writer-guide-welcome-essential writer-family-/g)||[]).length,6);
 assert.match(html,/writer-guide-welcome-dismiss/);
 assert.match(html,/writer-guide-welcome-full/);
 assert.match(html,/IA essentials/);
 assert.doesNotMatch(html,/2029|predicted mark/);
 const s={route:"completing",completion:{current:"C00"},ui:{writerGuideIntroSeen:false}};
 assert.equal(shouldShowWriterGuideWelcome(s),true);
 assert.equal(shouldShowWriterGuideWelcome(s,true),false);
 s.ui.writerGuideIntroSeen=true;
 assert.equal(shouldShowWriterGuideWelcome(s),false);
 s.ui.writerGuideIntroSeen=false;s.completion.current="C10";
 assert.equal(shouldShowWriterGuideWelcome(s),false);
 s.completion.current="C00";s.route="planning";
 assert.equal(shouldShowWriterGuideWelcome(s),false);
});

test("Every writing node has one relevant, deep-linked Field Guide entrance",()=>{
 const s=createProjectState();s.route="completing";
 for(const node of ["C10",...STUDIO_WRITING_NODES,"C70","C70N","C80","C80D","C90"]){
  s.completion.current=node;
  const rec=writingGuideRecommendation(s,node);
  assert(rec?.tip?.id,"missing recommended tip at "+node);
  const html=renderWriterGuideAccess(s,node,icon,escapeHtml);
  assert.equal((html.match(/data-action="writer-guide-open"/g)||[]).length,1,node);
  assert(html.includes('data-guide-tip="'+rec.tip.id+'"'),node);
 }
 for(const node of ["C00","C04","C10E"]){
  assert.equal(renderWriterGuideAccess(s,node,icon,escapeHtml),"");
 }
});
test("Planned approaches do not masquerade as evidence; guidance adapts to actual mathematics",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C20";
 s.planning.fields.kind="theoretical";s.planning.fields.dataSource="theoretical";
 assert.equal(writingGuideRecommendation(s,"C20").tip.id,"purpose");
 s.planning.fields.kind="statistics";s.planning.fields.dataSource="primary";
 assert.equal(writingGuideRecommendation(s,"C20").tip.id,"sources");
 s.completion.fields.firstType="calculation";
 assert.equal(writingGuideRecommendation(s,"C30").tip.id,"thinking");
 s.completion.fields.firstType="diagram";
 assert.equal(writingGuideRecommendation(s,"C30").tip.id,"graphs");
 s.entries=[{id:"original",phase:"first",status:"planned",result:"Expected positive linear association"}];
 s.completion.activeEntryIndex=0;
 assert.equal(writingGuideRecommendation(s,"C34").note,"","a planned result must not become an actual finding");
 s.entries[0].status="completed";s.entries[0].result="<script>real recorded result</script>";
 const rec=writingGuideRecommendation(s,"C34");
 assert.match(rec.note,/recorded result/i);
 const html=renderWriterFieldGuide(icon,escapeHtml,rec);
 assert(html.includes('data-guide-stage-focus="C34"'));
 assert(!html.includes("<script>real recorded result</script>"),"student text must be escaped in the guide");
 assert(html.includes("&lt;script&gt;real recorded result&lt;/script&gt;"));
 assert.equal((html.match(/data-guide-card="react"/g)||[]).length,1);
 assert(html.includes('data-guide-view="stronger" aria-pressed="true"'));
});
test("Further mathematics uses selected, verified previous outcomes without inventing conclusions",()=>{
 const s=createProjectState();s.route="completing";
 s.planning.routeExplorer.selectedRoute="relationships";
 const prior={id:"previous",phase:"first",status:"completed",result:"A curved pattern was observed",localTakeaway:"A curved shape actually occurred"};
 const next={id:"current",phase:"substantial",title:"Test an alternative",status:"planned",result:"",fromEntryId:"previous",methodId:"follow-journey"};
 s.entries=[prior,next];s.completion.activeEntryIndex=1;
 let guide=writingGuideRecommendation(s,"C40");
 assert.equal(guide.tip.id,"thinking");
 assert.match(guide.note,/needs review/i);
 const options=journeyOutcomeOptions(s,prior);
 prior.journeyOutcome=options[0].value;
 guide=writingGuideRecommendation(s,"C40");
 assert.equal(guide.tip.id,"why-now");
 assert.match(guide.question,/selected follow-up/i);
 prior.status="planned";guide=writingGuideRecommendation(s,"C40");
 assert(!guide.question.includes("selected follow-up"));
 assert(!guide.note.includes("curved shape"));
});
