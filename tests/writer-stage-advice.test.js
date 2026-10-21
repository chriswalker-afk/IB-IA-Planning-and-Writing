import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {escapeHtml as e,icon} from "../src/ui/primitives.js";
import {INTRODUCTION_TIPS,renderIntroductionWritingAdvice} from "../src/completing/intro-writing-advice.js";
import {firstMathsContext,firstMathsTips,renderFirstMathsAdvice} from "../src/completing/first-maths-bridge.js";
import {SHOWING_MATHS_TIPS,renderShowingMathsAdvice} from "../src/completing/showing-first-maths.js";
import {STUDIO_STAGE_TIPS,STUDIO_WRITING_NODES,renderStudioWritingStage} from "../src/completing/studio-writing-stages.js";
import {FIELD_GUIDE_TIPS,renderWriterFieldGuide,renderWriterGuidePopin} from "../src/completing/writer-field-guide.js";
import {writingGuideRecommendation} from "../src/completing/writer-guide-context.js";
import {allWriterStageAdviceBundles,writerStageAdviceBundle,writerAdviceGroupForNode} from "../src/completing/writer-stage-advice.js";

const state=()=>{const s=createProjectState();s.route="completing";return s;};
const fixtures=s=>[
 ["introduction",INTRODUCTION_TIPS.map(t=>[t.title,t.hook,t.body,t.weak,t.strong,t.learn])],
 ["first-mathematics",firstMathsTips(firstMathsContext(s)).map(t=>[t.name,t.brief,t.detail,t.bad,t.good,""])],
 ["data-methods",STUDIO_STAGE_TIPS.data.cards.map(t=>[...t,""])],
 ["showing-mathematics",SHOWING_MATHS_TIPS.map(t=>[...t,""])],
 ["further-mathematics",STUDIO_STAGE_TIPS.maths.cards.map(t=>[...t,""])],
 ["conclusion",STUDIO_STAGE_TIPS.conclusion.cards.map(t=>[...t,""])]
];

test("Pass 2 retains all 26 original stage tips and all their original words",()=>{
 const s=state(),groups=allWriterStageAdviceBundles(s);
 assert.equal(groups.length,6);
 assert.deepEqual(groups.map(g=>g.items.length),[6,4,4,4,4,4]);
 assert.equal(groups.reduce((n,g)=>n+g.items.length,0),26);
 for(const [name,originals] of fixtures(s)){
  const group=groups.find(g=>g.group===name);
  assert(group,": missing "+name);
  for(const [i,source] of originals.entries()){
   const tip=group.items[i];
   const rendered=[tip.title,tip.hook,tip.detail,tip.weak,tip.strong,tip.why];
   assert.deepEqual(rendered,source,name+" item "+i+" has been paraphrased or lost");
   for(const k of ["title","hook","detail","weak","strong"])assert(tip[k]?.length>8,name+":"+i+" "+k);
  }
 }
 assert.equal(FIELD_GUIDE_TIPS.length,14,"Pass 2 must not change the existing 14 core guide lessons");
});

test("The complete guide retains 14 core lessons plus all six supplementary advice groups",()=>{
 const s=state(),html=renderWriterFieldGuide(icon,e,null,s);
 assert.equal((html.match(/data-guide-card="/g)||[]).length,14);
 assert.equal((html.match(/data-stage-tip-id="/g)||[]).length,26);
 assert.equal((html.match(/data-writer-advice-group="/g)||[]).length,6);
 for(const group of allWriterStageAdviceBundles(s)){
  assert(html.includes('data-writer-advice-group="'+group.group+'"'));
  for(const t of group.items){
   assert(html.includes(e(t.title)),t.title);
   assert(html.includes(e(t.detail)),t.title+" missing detailed explanation");
   assert(html.includes(e(t.weak)),t.title+" missing weaker example");
   assert(html.includes(e(t.strong)),t.title+" missing stronger example");
   if(t.why)assert(html.includes(e(t.why)),t.title+" missing rationale");
  }
 }
});

test("Focused pop-ins select the relevant writing tip but retain the whole original group",()=>{
 const s=state();
 const probes=[
  ["C10","completing:C10:aim","introduction",0,6],
  ["C20","completing:C20:methodEvaluation","first-mathematics",3,4],
  ["C21S","completing:C21S:responseBias","data-methods",3,4],
  ["C30","completing:C30:reflectD","showing-mathematics",2,4],
  ["C40","completing:C40:nextD","further-mathematics",3,4],
  ["C50","completing:C50:resultB","further-mathematics",1,4],
  ["C60","completing:C60:meaningAndLimits","conclusion",2,4],
  ["C63","completing:C63:extension","conclusion",3,4]
 ];
 for(const [node,spot,group,index,total] of probes){
  const rec=writingGuideRecommendation(s,node,"",spot);
  assert.equal(rec.stageAdvice.group,group);
  assert.equal(rec.stageAdvice.selectedIndex,index);
  const html=renderWriterGuidePopin(icon,e,rec);
  assert(html.includes('data-writer-advice-group="'+group+'"'));
  assert.equal((html.match(/data-stage-tip-id="/g)||[]).length,total);
  const chosen=rec.stageAdvice.items[index];
  assert(html.includes(e(chosen.detail)),spot+" must expose complete focused advice");
  assert(html.includes(e(chosen.weak)),spot+" must preserve weaker example");
  assert(html.includes(e(chosen.strong)),spot+" must preserve stronger example");
 }
});

test("No General Before you write cards remain on pages; contextual mathematics and cautions stay",()=>{
 const s=state(),intro=renderIntroductionWritingAdvice(icon,e,{state:s});
 assert.equal((intro.match(/data-intro-advice="/g)||[]).length,0);
 assert.match(intro,/precise mathematical aim/);
 assert.match(intro,/All six introduction writing tips/);
 const method=renderFirstMathsAdvice(s,icon,e);
 assert(!method.includes("data-first-maths-tip="));
 assert.match(method,/Aim first. Then one useful mathematical step/);
 const showing=renderShowingMathsAdvice(s,icon,e);
 assert(!showing.includes("data-show-first-tip="));
 assert.match(showing,/Long tables are not IA content/);
 for(const node of ["C21S","C40","C50","C60"]){
  const html=renderStudioWritingStage(s,node,{icon,e,taskHtml:"<p>Test writing box</p>",taskIntro:"What to write"});
  assert(!html.includes("data-studio-tip="));
  assert(html.includes('data-advice-moved-to-guide='));
  assert(html.includes('data-guide-scope="stage"')||node==="C40");
 }
});

test("Reduced mode does not suppress any original advice or claim a plan is an actual finding",()=>{
 const s=state();s.planning.routeExplorer.selectedRoute="relationships";
 for(const node of ["C10","C20","C21S","C30","C40","C50","C60"]){
  const bundle=writerStageAdviceBundle(s,node);
  assert(bundle&&bundle.items.length>=4,node);
  const advice=writingGuideRecommendation(s,node);
  assert.equal(advice.stageAdvice.items.length,bundle.items.length);
  const html=renderWriterGuidePopin(icon,e,advice);
  assert.equal((html.match(/data-stage-tip-id="/g)||[]).length,bundle.items.length);
 }
 s.entries=[{phase:"first",status:"planned",result:"<script>unconfirmed graph</script>"}];
 s.completion.activeEntryIndex=0;
 const rec=writingGuideRecommendation(s,"C34");
 assert(!rec.note.includes("unconfirmed"));
 const html=renderWriterGuidePopin(icon,e,rec);
 assert(!html.includes("<script>"));
 assert(!html.includes("unconfirmed graph"));
});

test("Every included writing stage finds its original group, but Checking remains separate",()=>{
 for(const node of ["C10",...STUDIO_WRITING_NODES]){
  assert(writerAdviceGroupForNode(node),node+" lacks supplementary advice");
 }
 for(const node of ["C00","C70","C80","C90"])assert.equal(writerAdviceGroupForNode(node),"");
});
