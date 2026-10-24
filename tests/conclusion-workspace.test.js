import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {setCompletionNode} from "../src/completing/engine.js";
import {renderConclusionWorkspace,toggleConclusionResult,conclusionResults} from "../src/completing/conclusion-workspace.js";
import {escapeHtml as e,icon} from "../src/ui/primitives.js";
import {discoveryTrail,chapterRibbon,chapterStats} from "../src/ui/living-journey.js";
import {JOURNEY_GROUPS,chapterProgressCopy} from "../src/ui/journey.js";
import {journeyRail} from "../src/ui/journey-views.js";

const textField=(path,label,_placeholder,_opts)=>'<label>'+e(label)+'</label><textarea data-bind="'+
 e(path)+'"></textarea>';
const make=()=>{
 const s=createProjectState();
 s.route="completing";s.completion.current="C60";
 s.planning.fields.aim="Is a linear model defensible?";
 s.planning.fields.kind="modelling";
 s.planning.fields.prediction="I expected a positive relationship";
 s.entries=[
  {id:"scatter",phase:"first",title:"Scatter diagram",kind:"scatter",status:"completed",
   result:"Genuine plotted pairs",localTakeaway:"The relationship bends."},
  {id:"model",phase:"substantial",title:"Fit a linear regression",methodId:"linear-regression",status:"completed",
   result:"The regression line has patterned residuals",localTakeaway:"Systematic curvature remains."},
  {id:"future",phase:"substantial",title:"Check a possible quadratic",status:"planned",result:""}
 ];
 return s;
};
const render=s=>renderConclusionWorkspace({
 state:s,e,icon,field:textField,
 F:(key,label,placeholder,opts)=>textField("completion.fields."+key,label,placeholder,opts),
 criteriaField:html=>html,criterionMarkedWritingBox:html=>html,
 currentAim:()=>s.planning.fields.aim,plannedPrediction:()=>s.planning.fields.prediction,
 currentBenefit:()=>s.planning.fields.beneficiary,
 savedLimitations:()=>'<p>Only the measured input range was tested</p>'
});

test("Conclusion has three purposeful writing parts with a visible optional future direction",()=>{
 const s=make(),before=JSON.stringify(s),html=render(s);
 for(const word of ["What is your best-supported mathematical answer?","What does that answer mean",
  "Potential next steps","A worthwhile future mathematical question"])
  assert(html.includes(word),word);
 assert.deepEqual([...html.matchAll(/data-conclusion-part="([^"]+)"/g)].map(x=>x[1]),["answer","meaning","next"]);
 for(const path of ["completion.fields.mainConclusion","completion.fields.conclusionBenefit",
  "completion.fields.conclusionExtension"])
  assert(html.includes('data-bind="'+path+'"'),path);
 assert(html.includes("OPTIONAL"));
 assert(html.includes("The relationship bends."));
 assert(html.includes("Systematic curvature remains."));
 assert(html.includes("Only the measured input range was tested"));
 assert(!html.includes("Check a possible quadratic</strong><span>Systematic"));
 assert.equal(JSON.stringify(s),before,"rendering cannot change student notes or selected results");
});
test("Only genuine, review-free mathematical findings can be selected as conclusion evidence",()=>{
 const s=make();
 assert.equal(toggleConclusionResult(s,"future").ok,false,"A planned calculation is not evidence");
 assert.equal(toggleConclusionResult(s,"unknown").ok,false);
 assert.equal(toggleConclusionResult(s,"scatter").ok,true);
 assert.deepEqual(s.completion.conclusionResultIds,["scatter"]);
 assert(render(s).includes('aria-pressed="true"'));
 s.entries[1].reviewNeeded="yes";
 assert.equal(toggleConclusionResult(s,"model").ok,false);
 assert(render(s).includes("Mathematical work requiring review"));
 assert(render(s).includes("Review mathematics"));
 assert.equal(toggleConclusionResult(s,"scatter").ok,true);
 assert.deepEqual(s.completion.conclusionResultIds,[]);
});
test("Changing already selected mathematical evidence reopens a marked-ready conclusion",()=>{
 const s=make();
 s.completion.stages.C60="complete";
 toggleConclusionResult(s,"scatter");
 assert.equal(s.completion.stages.C60,"needs-review");
 assert.equal(conclusionResults(s).find(x=>x.entry.id==="scatter").selected,true);
 const reloaded=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(reloaded.completion.conclusionResultIds,["scatter"]);
});
test("Evidence chooser caps selected findings at three without losing other mathematics",()=>{
 const s=make();
 s.entries.push(...["r3","r4"].map(id=>({id,status:"completed",phase:"substantial",result:"Real working "+id,title:id})));
 for(const id of ["scatter","model","r3"])assert(toggleConclusionResult(s,id).ok);
 assert.equal(toggleConclusionResult(s,"r4").ok,false);
 assert.equal(s.entries.length,5);
 assert.equal(toggleConclusionResult(s,"model").ok,true);
 assert(toggleConclusionResult(s,"r4").ok);
});
test("Previously saved conclusion fields are preserved and editable, without becoming generated IA writing",()=>{
 const s=make();
 s.scratch.conclusion="My existing free-form conclusion notes";
 Object.assign(s.completion.fields,{
   mainConclusion:"My earlier strong answer",conclusionBenefit:"My earlier interpretation",
   conclusionExtension:"Can another assumption change the result?",
   conclusionEvidence:"The specific earlier equations",conclusionUncertainty:"Only the bounded domain",
   conclusionAdvice:"No unsupported recommendation",conclusionFocus:"Avoid a repeated table"
 });
 const html=render(s);
 for(const term of ["Earlier conclusion notes (5)",'data-bind="scratch.conclusion"',
  'data-bind="completion.fields.conclusionEvidence"',
  'data-bind="completion.fields.conclusionUncertainty"',
  'data-bind="completion.fields.conclusionAdvice"',
  'data-bind="completion.fields.conclusionFocus"'])
  assert(html.includes(term),term);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(restored.completion.fields,s.completion.fields);
 assert.equal(restored.scratch.conclusion,s.scratch.conclusion);
});
test("Old conclusion C61-C64 links and loaded stages now lead to C60 without deleting responses",()=>{
 for(const legacy of ["C61","C62","C63","C64"]){
  const s=make();
  s.completion.fields.conclusionExtension="Why might the model fail beyond this interval?";
  assert.equal(setCompletionNode(s,legacy).id,"C60");
  assert.equal(s.completion.current,"C60");
  const saved=createProjectState();
  saved.completion.current=legacy;
  saved.completion.fields.conclusionExtension=s.completion.fields.conclusionExtension;
  const loaded=normalizeProjectState(JSON.parse(JSON.stringify(saved)));
  assert.equal(loaded.completion.current,"C60");
  assert.equal(loaded.completion.fields.conclusionExtension,s.completion.fields.conclusionExtension);
 }
});
test("Sidebar and both Discovery Trail layouts show Conclusion and potential next steps in chapter 4",()=>{
 const s=make(),g=JOURNEY_GROUPS.find(x=>x.id==="finish"),before=JSON.stringify(s);
 assert.deepEqual(g.stages,["C60"],"Conclusion remains a separate writing task");
 const check=JOURNEY_GROUPS.find(x=>x.id==="check");
 assert.deepEqual(check.stages,["C70","C80","C90"],"Existing writing communication and review records remain available");
 const phrase="Conclusion &amp; next steps";
 for(const html of [discoveryTrail(s),discoveryTrail(s,{compact:true}),chapterRibbon(s),journeyRail(s)])
  assert(html.includes(phrase),phrase);
 assert(chapterProgressCopy(s,g).includes("Conclusion"));
 assert(chapterProgressCopy(s,check).includes("feedback"));
 assert.equal(chapterStats(s,g).total,1);
 assert.equal(chapterStats(s,check).total,3);
 assert.equal(JSON.stringify(s),before);
});
test("Untrusted student text is escaped in the consolidated conclusion",()=>{
 const s=make();
 s.planning.fields.aim='<img src=x onerror=alert(1)>';
 s.entries[0].localTakeaway='<script>alert(1)</script>';
 const html=render(s);
 assert(html.includes("&lt;img"));
 assert(html.includes("&lt;script&gt;"));
 assert(!html.includes('<script>alert(1)</script>'));
});

test("Conclusion gives method-specific caution and actual-result questions before asking for written decisions",()=>{
 const s=make();
 s.entries[1].nextQuestion="Would a quadratic model reduce the curved residuals?";
 s.entries[1].nextWhy="Patterned residuals mean the straight-line fit may be limited";
 const before=JSON.stringify(s),html=render(s);
 const meaning=html.split('data-conclusion-part="meaning"')[1].split('data-conclusion-part="next"')[0];
 const caution=meaning.indexOf('class="conclusion-specific-tip"');
 const interpretation=meaning.indexOf('data-bind="completion.fields.conclusionBenefit"');
 assert(caution>=0&&interpretation>caution,
  'The mathematical reminder should be read before the interpretation task');
 const next=html.split('data-conclusion-part="next"')[1];
 const help=next.indexOf('class="conclusion-next-help"');
 const extension=next.indexOf('data-bind="completion.fields.conclusionExtension"');
 assert(help>=0&&extension>help,
  'Optional questions grounded in the result should precede the extension box');
 assert(next.includes("Would a quadratic model reduce the curved residuals?"));
 assert(!html.includes("A planned calculation is evidence"));
 const reduced=structuredClone(s);reduced.ui.adviceMode="reduced";
 const compact=render(reduced);
 assert(compact.indexOf('class="conclusion-specific-tip"')<
        compact.indexOf('data-bind="completion.fields.conclusionBenefit"'));
 assert.equal(JSON.stringify(s),before,"Changing order must not create or alter student results");
});
