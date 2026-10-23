import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {icon,escapeHtml} from "../src/ui/primitives.js";
import {GUIDANCE_CHOICES,guidanceChoices} from "../src/ui/guidance-interface.js";
import {FIELD_GUIDE_TIPS,renderWriterGuidePopin} from "../src/completing/writer-field-guide.js";
import {stylePaths} from "../scripts/build-styles.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Help offers three independent jobs with real existing destinations",()=>{
 assert.deepEqual(GUIDANCE_CHOICES.map(x=>x.title),["I am stuck","Writer's Field Guide","IB criteria"]);
 assert.deepEqual(GUIDANCE_CHOICES.map(x=>x.action),["open-stuck","writer-guide-open","essentials-open"]);
 assert.equal(new Set(GUIDANCE_CHOICES.map(x=>x.id)).size,3);
 const html=guidanceChoices(icon,escapeHtml);
 assert.equal((html.match(/class="panel-link guidance-choice /g)||[]).length,3);
 assert.equal((html.match(/data-action="/g)||[]).length,3);
 assert.match(html,/data-action="open-stuck"/);
 assert.match(html,/data-action="writer-guide-open"/);
 assert.match(html,/data-action="essentials-open"/);
 assert.match(html,/data-action="essentials-open" data-essentials-tab="rubric"/);
 assert.match(html,/cannot move forward/i);
 assert.match(html,/explaining my mathematical thinking/i);
 assert.match(html,/without predicting a mark/i);
 assert(!html.includes("data-bind="),"Choosing help never edits a saved student field");
});

test("all context pop-ins have matching landmarks and preserved guidance identities",()=>{
 const planning=read("src/help/planning-help.js");
 const maths=read("src/help/studio-help-popin.js");
 const criteria=read("src/essentials/criteria-badges.js");
 for(const [source,name] of [[planning,"Planning"],[maths,"IA Studio"]]){
  assert(source.includes('dialog.dataset.guidanceKind="recovery"'),name);
  for(const part of ["guidance-surface-header","guidance-surface-eyebrow","guidance-surface-title",
   "guidance-surface-close","guidance-surface-body","guidance-surface-actions"]){
   assert(source.includes(part),name+" missing "+part);
  }
  assert(source.includes("dialog.showModal()"),name+" remains a native modal");
  assert(source.includes("prev.focus")||source.includes("old.focus"),name+" returns focus");
 }
 assert(criteria.includes("dialog.dataset.guidanceKind='criteria'"));
 assert(criteria.includes("dialog.showModal()"));
 assert(criteria.includes("guidance-surface-close"));
 assert(criteria.includes("criterionBadgeSummary"),"Criteria remain tied to actual assessment context");
 assert(criteria.includes("revised2029")||criteria.includes("isRevisedAssessment"),"Cohort safety remains");
 assert(maths.includes('source==="checking"?"Which part of checking your IA'),
  "Checking recovery uses document-check wording rather than an unrelated maths prompt");
});

test("Writer Field Guide pop-in has consistent close/return controls and a labelled description",()=>{
 const tip=FIELD_GUIDE_TIPS[0];
 const html=renderWriterGuidePopin(icon,escapeHtml,{tip,stage:"Explaining mathematics",cue:"Why this method?"});
 assert.match(html,/data-guidance-kind="writing"/);
 assert.match(html,/role="dialog" aria-modal="false"/);
 assert.match(html,/aria-describedby="writer-guide-popin-focus"/);
 assert.match(html,/id="writer-guide-popin-focus"/);
 for(const cls of ["guidance-surface","guidance-surface-header","guidance-surface-title",
  "guidance-surface-close","guidance-surface-body","guidance-surface-actions"])
  assert(html.includes(cls),cls);
 assert.match(html,/data-action="writer-guide-popin-full"/);
 assert.match(html,/data-action="writer-guide-popin-close"/);
 assert.match(html,/fictional teaching examples/);
});

test("whole-project exports are accurately distinguished from Planning-only document reimport",()=>{
 const completing=read("src/completing/views.js"),app=read("app.js"),intro=read("src/ui/planning-views.js");
 const c91=completing.slice(completing.indexOf('case "C91":'),completing.indexOf('case "C96":'));
 assert(!c91.includes("PDF/Word are Planning-only"),"Outdated claim must not return");
 assert.match(c91,/Download complete project backup/);
 assert.match(c91,/See full-project PDF, Word and ZIP exports/);
 assert.match(c91,/restores Planning fields only/);
 assert.match(c91,/open-files/);
 assert.match(app,/export-full-pdf/);
 assert.match(app,/export-full-docx/);
 assert.match(app,/export-full-zip/);
 assert(intro.includes("Download my planning PDF"),"Planning-specific export remains distinct");
});

test("Help drawer labels distinguish recovery, writing craft and criteria without replacing route help",()=>{
 const app=read("app.js");
 const help=app.slice(app.indexOf('}else if(panel==="help")'),app.indexOf('}else if(panel==="import-preview")'));
 assert.match(help,/guidanceChoices\(icon,e\)/);
 for(const action of ["resource-browse","go-path","open-files","open-demos"])
  assert(help.includes('data-action="'+action+'"'),"Additional help route missing: "+action);
 assert(help.includes("Writer\\'s Field Guide")||help.includes("Writer's Field Guide"));
 assert(!help.includes("the writing helper for where an explanation belongs"),
  "Vague copy must not undermine the distinct Field Guide");
});

test("final contextual guidance stylesheet keeps responsive, keyboard and accessibility provisions",()=>{
 const html=read("index.html");
 const paths=stylePaths(html);
 assert.equal(paths.length,36);
 assert(paths.includes("data/release-guidance.css"));
 assert.equal(paths.at(-1),"data/release-representation.css");
 assert(paths.includes("data/stuck-contextual.css"));
 assert(paths.includes("data/criteria-badges.css"));
 assert(paths.includes("data/writer-guide-popin.css"));
 const css=read("data/release-guidance.css");
 for(const kind of ["recovery","writing","criteria"])assert(css.includes('[data-guidance-kind="'+kind+'"]'));
 for(const item of ["focus-visible","@media(max-width:700px)","prefers-reduced-motion:reduce",
   "guidance-choice-copy","guidance-surface-close","44px"])
  assert(css.includes(item),item);
 assert(!css.includes(".criterion-badge{"),"Do not overwrite contextual bubble placement");
});
