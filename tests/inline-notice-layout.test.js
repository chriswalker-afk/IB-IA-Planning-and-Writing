import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState} from "../src/core/project-state.js";
import {escapeHtml as e,icon} from "../src/ui/primitives.js";
import {renderIntroductionSparkPrompt} from "../src/completing/intro-writing-advice.js";
import {renderConclusionWorkspace} from "../src/completing/conclusion-workspace.js";

const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const NOTICE_TEMPLATES=Object.freeze([
 ["src/completing/intro-writing-advice.js","p","intro-prediction-note",1],
 ["src/completing/conclusion-workspace.js","p","conclusion-specific-tip",1],
 ["src/completing/views.js","p","math-stage-branch-note",4],
 ["src/ui/primary-data-steps.js","p","data-quality-warning",1],
 ["src/ui/primary-data-steps.js","p","data-quality-basis-note",1],
 ["src/ui/data-decisions-view.js","p","data-quality-warning",1],
 ["src/ui/data-decisions-view.js","p","data-quality-basis-note",1],
 ["src/ui/investigative-routes-view.js","p","journey-course-note",1],
 ["src/ui/investigative-routes-view.js","p","journey-route-warning",2],
 ["src/ui/investigative-routes-view.js","p","journey-course-switch-note",1],
 ["src/ui/planning-views.js","span","math-route-caution",1],
 ["src/ui/planning-views.js","p","math-review-note",1],
 ["src/diagrams/representation-hub.js","p","representation-workspace-guidance",1],
 ["src/diagrams/representation-hub.js","p","representation-writing-reminder",1]
]);

test("every icon-led flex note keeps its complete message in one text child",()=>{
 for(const [file,tag,cls,count] of NOTICE_TEMPLATES){
  const code=source(file),start='<'+tag+' class="'+cls+'">';
  const positions=[...code.matchAll(new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))].map(m=>m.index);
  assert.equal(positions.length,count,file+" "+cls+" variants were added or removed without review");
  for(const at of positions){
   const stop=code.indexOf("</"+tag+">",at);
   assert(stop>at&&stop-at<1200,file+" "+cls+" has an unrecognised template");
   const html=code.slice(at,stop);
   assert(html.includes('<span class="inline-notice-copy">'),file+" "+cls+" lacks the message wrapper");
   // The highlighted text must never become a sibling flex item.
   const strong=html.indexOf("<strong>");
   if(strong>=0)assert(strong>html.indexOf('<span class="inline-notice-copy">'),file+" "+cls+" bold phrase outside message");
  }
 }
 const tracer=source("src/diagrams/image-tracer-view.js");
 const from=tracer.indexOf('<p class="trace-scale-status">');
 const preview=tracer.slice(from,tracer.indexOf("</p>",from));
 assert.equal(preview.match(/<span class="inline-notice-copy">/g)?.length,2,
  "Both calibrated and uncalibrated trace notices must wrap their full message");
});

test("shared icon-note copy retains a flexible full-width prose column",()=>{
 const css=source("styles.css");
 assert.match(css,/\.inline-notice-copy\s*\{[^}]*display:block/);
 assert.match(css,/\.inline-notice-copy\s*\{[^}]*flex:1 1 auto/);
 assert.match(css,/\.inline-notice-copy\s*\{[^}]*min-width:0/);
 assert.match(css,/\.inline-notice-copy\s*\{[^}]*overflow-wrap:anywhere/);
 for(const [file,selector] of [
  ["data/chapter-onboarding.css","intro-prediction-note"],
  ["data/conclusion-workspace.css","conclusion-specific-tip"],
  ["data/data-decisions.css","data-quality-warning"],
  ["data/investigative-routes.css","journey-route-warning"]
 ]){
  assert.match(source(file),new RegExp("\\."+selector+"[^{}]*\\{[^}]*display:flex"),
   file+" should retain its intended icon + one text column layout");
 }
});

test("real Introduction and Conclusion HTML keep bold text inside flowing prose",()=>{
 const s=createProjectState();
 s.planning.fields.aim="Can a sample justify the model?";
 s.planning.fields.prediction="I think the data will have a trend.";
 s.entries=[{id:"sample",phase:"first",status:"completed",methodId:"pmcc",
  title:"Pearson coefficient",result:"r = 0.4",interpretation:"Only weak evidence of association"}];
 const before=JSON.stringify(s);
 const intro=renderIntroductionSparkPrompt(s,icon,e);
 const introNote=intro.match(/<p class="intro-prediction-note">([\s\S]*?)<\/p>/)?.[1]||"";
 assert.match(introNote,/<span class="inline-notice-copy">These edits save[\s\S]*?<strong>not a mathematical result<\/strong>[\s\S]*?<\/span>/);
 const conclusion=renderConclusionWorkspace({
  state:s,e,icon,
  field:()=>'<textarea></textarea>',F:()=>'<textarea></textarea>',
  criteriaField:x=>x,criterionMarkedWritingBox:x=>x,
  currentAim:()=>s.planning.fields.aim,
  plannedPrediction:()=>s.planning.fields.prediction,
  currentBenefit:()=>"",savedLimitations:()=>""
 });
 const reminder=conclusion.match(/<p class="conclusion-specific-tip">([\s\S]*?)<\/p>/)?.[1]||"";
 assert.match(reminder,/<span class="inline-notice-copy"><strong>Mathematical reminder:<\/strong>[^]*?<\/span>/);
 assert(reminder.includes("association"));
 assert.equal(JSON.stringify(s),before,"notice rendering must not mutate student writing");
});
