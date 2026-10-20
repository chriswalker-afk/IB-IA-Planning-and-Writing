
import test from "node:test";
import assert from "node:assert/strict";
import {icon,escapeHtml} from "../src/ui/primitives.js";
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
