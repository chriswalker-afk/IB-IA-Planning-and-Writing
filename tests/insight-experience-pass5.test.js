import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {escapeHtml as e,icon} from "../src/ui/primitives.js";
import {
 insightItems,insightForCurrent,featuredSparkItems,sparkMomentPrompt,
 renderSparkShelf,insightToolkit
} from "../src/ui/insight-threads.js";
import {renderStudioWritingStage} from "../src/completing/studio-writing-stages.js";

const sample=()=>{
 const s=createProjectState();
 Object.assign(s.planning.fields,{
  provisionalTitle:"How does a box's shape change capacity?",
  aim:"Which dimensions maximise the capacity of a box?",
  motivation:"I wanted to explore packaging efficiency",
  prediction:"I expect the widest box to hold more",
  predictionWhy:"A wide base has more area",
  firstAction:"Compare the volume of a few boxes",
  firstAccuracy:"Measure lengths to the nearest mm",
  kind:"modelling",course:"AA SL",dataSource:"primary",
  primaryWhat:"Measured boxes",primarySamplingMethod:"convenience"
 });
 s.completion.sourceRecords=[
  {id:"source1",fields:{actualSource:"Box dimensions",dataStatus:"ready"}},
  {id:"unrelated",fields:{actualSource:"Unrelated survey",dataStatus:"ready"}}
 ];
 s.completion.accuracyDecisions=[
  {id:"acc1",quantity:"Length",unit:"cm",resolution:"nearest 0.1 cm",
   policy:"Use 1 decimal place"},
  {id:"acc2",quantity:"Temperature",unit:"°C",resolution:"nearest 1°C",
   policy:"Whole numbers"}
 ];
 s.entries=[
  {id:"first",phase:"first",status:"completed",title:"Volume from dimensions",
   result:"V = lwh",methodId:"geometric-model",accuracyRefs:["acc1"],sourceRefs:["source1"],
   interpretation:"Volume depends on each dimension",
   localTakeaway:"The dimensions affect volume",
   limitations:"Lengths were rounded",nextQuestion:"What happens at the constraints?",
   nextWhy:"The formula does not yet identify a feasible maximum"},
  {id:"second",phase:"substantial",fromEntryId:"first",status:"planned",
   title:"Feasible optimum",methodId:"optimisation",
   purpose:"Check the feasible domain and boundary"}
 ];
 s.completion.activeEntryIndex=1;
 return s;
};
const view=(s,node,reduced=false)=>renderStudioWritingStage(s,node,{
 icon,e,reduced,taskHtml:'<textarea data-bind="completion.fields.testNote"></textarea>',
 taskIntro:"Write only what your own mathematics establishes"
});
test("featured Sparks give a specific use now, not a generic saved-data label",()=>{
 const s=sample(),entry=s.entries[0];
 assert.match(sparkMomentPrompt(s,"C35",{type:"discovery",...insightItems(s).find(x=>x.id==="result:first")}),/exact gap/);
 const atNewStage=featuredSparkItems(s,"C40").map(x=>x.id);
 assert.deepEqual(atNewStage,["result:first","method:second"]);
 const shelf=renderSparkShelf(s,"C40",{surface:"studio",hideHeading:true});
 assert.equal((shelf.match(/class="motivation-aim-spark planning-return-spark spark-shelf-featured/g)||[]).length,2);
 assert.equal((shelf.match(/data-spark-moment=/g)||[]).length,2);
 assert(shelf.includes("Use this earlier finding"));
 assert(shelf.includes("question"));
 assert(shelf.includes('data-spark-library'));
 assert(!shelf.includes('<details open'));
 entry.reviewNeeded="yes";
 const after=renderSparkShelf(s,"C40",{surface:"studio"});
 assert(after.includes("Check the original mathematics"));
 assert(after.includes("Review"));
});
test("proposals, expectations and unconfirmed source notes never become purported findings",()=>{
 const s=sample();
 const all=insightItems(s);
 for(const id of ["prediction","planned-maths","planned-evidence","planned-precision-policy"]){
  const x=all.find(item=>item.id===id);
  assert(x,id+" must remain available");
  const msg=sparkMomentPrompt(s,"C30",x);
  assert.match(msg,/expectation|not a result|obtained|Confirm/);
  assert(!msg.includes("this result establishes"));
 }
 const toolkit=insightToolkit(s);
 assert(toolkit.includes('data-toolkit-spark-id="planned-maths"'));
 assert(toolkit.includes("Provisional · not verified"));
});
test("conclusion recalls chosen, review-free mathematical evidence and does not replace a stale choice",()=>{
 const s=sample();
 s.entries[1].status="completed";s.entries[1].result="x=4 is a feasible candidate";
 let cards=featuredSparkItems(s,"C60");
 assert.deepEqual(cards.map(x=>x.id),["aim","result:second"]);
 s.completion.conclusionResultIds=["first"];
 assert.deepEqual(featuredSparkItems(s,"C60").map(x=>x.id),["aim","result:first"]);
 assert(insightForCurrent(s,"C60").some(x=>x.id==="result:first"));
 s.entries[0].reviewNeeded="yes";
 const cardsAfter=featuredSparkItems(s,"C60").map(x=>x.id);
 assert(!cardsAfter.includes("result:first"));
 assert(!cardsAfter.includes("result:second"),"Do not silently substitute another result when a chosen one needs review");
 assert(!insightForCurrent(s,"C60").some(x=>x.id.startsWith("result:")));
});
test("the complete Toolkit groups every original Spark once, regardless of age",()=>{
 const s=sample(),original=JSON.stringify(s);
 for(let i=0;i<18;i++)s.entries.push({
  id:"extra-"+i,phase:"substantial",status:"completed",title:"Maths stage "+i,
  methodId:i%2?"algebra":"proof",result:"A verified argument "+i,
  interpretation:"A finding "+i
 });
 const all=insightItems(s),html=insightToolkit(s);
 const ids=[...html.matchAll(/data-toolkit-spark-id="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,all.length,"Full Toolkit must not silently discard old cards");
 assert.equal(new Set(ids).size,all.length,"A single canonical Spark must appear once");
 assert(ids.includes("result:first")&&ids.includes("result:extra-17"));
 assert(html.includes('class="insight-toolkit-categories"'));
 for(const title of ["Your question and intentions","Data, sources and accuracy",
  "Mathematical discoveries and learning","Method reasoning and next questions",
  "Reflections and limitations"])assert(html.includes(title),title);
 assert(html.includes('data-action="insight-jump"'));
 assert(html.includes("Needs review")===false);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(insightItems(restored).length,all.length);
 assert.equal(JSON.stringify(s).includes("extra-17"),true);
 assert.notEqual(original,JSON.stringify(s));
});
test("compact Toolkit is bounded, does not repeat pinned cards and links to the full view",()=>{
 const s=sample();
 s.planning.accuracyPlans=[
  {id:"pa1",source:"primary",quantity:"Length",unit:"cm",resolution:"0.1 cm"}];
 const all=insightItems(s);
 const full=insightToolkit(s);
 const compact=insightToolkit(s,{compact:true});
 const ids=[...compact.matchAll(/data-toolkit-spark-id="([^"]+)"/g)].map(x=>x[1]);
 assert(ids.length<=5);
 assert(new Set(ids).size===ids.length);
 assert(ids.length<=all.length);
 assert(full.match(/data-toolkit-spark-id=/g)?.length===all.length);
 assert(compact.includes('data-nav="path"')||ids.length===all.length);
 assert(!compact.includes('class="insight-toolkit-categories"'));
});
test("guided writing now shows concise saved context then actual task; extra advice follows",()=>{
 const s=sample(),before=JSON.stringify(s);
 for(const node of ["C20","C30","C40","C50","C34A","C60"]){
  const html=view(s,node),parts=[...html.matchAll(/data-writing-stage-part="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(parts,node==="C60"?["task","advice","examples"]:
   ["sparks","task","advice","examples"],node);
  assert(html.includes("studio-stage-quick-help"),node);
  assert(html.includes('data-action="writer-guide-open"'),node);
  assert(html.includes('data-action="open-stuck"'),node);
  assert(html.includes('data-bind="completion.fields.testNote"'),node);
 }
 const first=view(s,"C20");
 assert(first.includes('data-first-maths-extra-context'));
 assert(first.includes('class="first-maths-start-grid"'));
 assert(first.indexOf('data-first-maths-extra-context')>first.indexOf('class="first-maths-start-grid"'));
 assert(first.includes("More from my Planning choices"));
 const show=view(s,"C30");
 assert(!show.includes("show-first-spark-grid"),"Remove four repeated aim/prediction/accuracy cards");
 assert(show.includes('data-spark-shelf="studio"'));
 assert(show.includes('data-spark-moment="'));
 assert.equal(JSON.stringify(s),before);
});
test("reduce advice remains lean and carries saved Sparks without extra controls",()=>{
 const s=sample(),before=JSON.stringify(s);
 const guided=view(s,"C40"),reduced=view(s,"C40",true);
 assert(reduced.length<guided.length);
 assert(reduced.includes('data-advice-mode="reduced"'));
 assert(!reduced.includes('studio-stage-quick-help'));
 assert(!reduced.includes('data-writing-stage-part="advice"'));
 assert(!reduced.includes('data-writing-stage-part="examples"'));
 assert(reduced.includes('data-reduced-saved-context'));
 assert(reduced.indexOf('data-writing-stage-part="task"')<reduced.indexOf('data-writing-stage-part="sparks"'));
 assert.equal(JSON.stringify(s),before);
});
test("Sparks escape student-provided text and the UI has no horizontal-scroll tricks",()=>{
 const s=sample();
 s.planning.fields.aim='<img src=x onerror=alert(1)>';
 const html=renderSparkShelf(s,"C30",{surface:"studio"});
 assert(html.includes("&lt;img"));
 assert(!html.includes("<img"));
 const styles=readFileSync(new URL("../data/spark-shelf.css",import.meta.url),"utf8");
 assert(styles.includes(".spark-context-purpose"));
 assert(styles.includes("max-height:min(66dvh,610px)"));
 assert(styles.includes("focus-visible"));
 const writing=readFileSync(new URL("../data/chapter-onboarding.css",import.meta.url),"utf8");
 assert(writing.includes(".first-maths-extra-context"));
 assert(writing.includes(".studio-stage-quick-help"));
 assert(writing.includes("@media(max-width:600px)"));
 const toolkit=readFileSync(new URL("../data/living-journey.css",import.meta.url),"utf8");
 assert(toolkit.includes(".insight-toolkit-categories"));
 assert(toolkit.includes(".insight-toolkit-group>summary:focus-visible"));
});
