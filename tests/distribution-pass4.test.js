import test from "node:test";
import assert from "node:assert/strict";
import {newDistributionDraft,analyzeDistribution,saveDistributionFigure,
 normalizeDistributionStudio,normalizeDistributionDraft,DISTRIBUTION_KINDS} from "../src/diagrams/distribution-core.js";
import {poissonMass,poissonCdf,poissonUpperTail,parseCustomDiscrete} from "../src/diagrams/distribution-extra.js";
import {distributionLayout,distributionBoundaryForPixel,distributionBoundaryNudge} from "../src/diagrams/distribution-layout.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {renderDistributionStudio,distributionFeedbackHtml} from "../src/diagrams/distribution-view.js";
import {distributionGuidance,distributionRecoveryCards,DISTRIBUTION_LEARNING} from "../src/diagrams/distribution-guidance.js";
import {createProjectState} from "../src/core/project-state.js";
import {setDistributionField} from "../src/diagrams/distribution-actions.js";
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,lessonById,definitionById,PATHWAY_LEARNING,workshopLessonForEntry} from "../src/workshop/catalog.js";
import {relatedDefinitionSections} from "../src/workshop/definition-connections.js";
import {WORKSHOP_LESSON_FORMULAS} from "../src/workshop/math-notation.js";
import {contextualWorkshopHelp} from "../src/help/workshop-help.js";
import {studioHelpFor} from "../src/help/studio-help.js";
import {escapeHtml as e,icon} from "../src/ui/primitives.js";

const close=(actual,expected,eps=1e-10)=>assert(Math.abs(actual-expected)<eps,actual+" differs from "+expected);
const make=(kind,extra={})=>({...newDistributionDraft(),kind,title:"Modelled outcome probabilities",symbol:"Y",...extra});
const stateFor=(kind)=>{
 const s=createProjectState();
 s.route="completing";s.completion.current="C31";s.distributionStudio.open=true;
 s.distributionStudio.draft=make(kind);
 return s;
};
test("all five distribution types have a stable editor and are retained in backups",()=>{
 assert.deepEqual([...DISTRIBUTION_KINDS],["normal","binomial","poisson","uniform","custom"]);
 const s=stateFor("poisson");
 for(const kind of DISTRIBUTION_KINDS){
  assert(setDistributionField(s.distributionStudio,"kind",kind));
  if(kind==="custom")assert(setDistributionField(s.distributionStudio,"customPoints","-2, 0.2\n0, 0.5\n3, 0.3"));
  assert.equal(s.distributionStudio.draft.kind,kind);
  assert.equal(analyzeDistribution(s.distributionStudio.draft).ready,true,kind);
  const saved=saveDistributionFigure(s.distributionStudio);
  assert(saved.ok,kind);
  const recovered=normalizeDistributionStudio(JSON.parse(JSON.stringify(s.distributionStudio)));
  assert.equal(recovered.figures.find(fig=>fig.id===saved.record.id)?.draft.kind,kind);
  s.distributionStudio.activeId="";
 }
 assert.equal(s.distributionStudio.figures.length,5);
 assert.equal(normalizeDistributionDraft({kind:"uniform",mode:"exact"}).mode,"none");
 assert.equal(normalizeDistributionDraft({kind:"custom",customPoints:"0, 0.3\n1, 0.7"}).customPoints,"0, 0.3\n1, 0.7");
});
test("Poisson probabilities include the infinite tail even when only finite bars are drawn",()=>{
 const d=make("poisson",{lambda:"2",mode:"exact",lower:"0"});
 const a=analyzeDistribution(d);
 assert(a.ready);close(a.probability,Math.exp(-2));
 close(poissonMass(2,1),2*Math.exp(-2));
 close(poissonCdf(2,1),3*Math.exp(-2));
 close(poissonUpperTail(2,0),1-Math.exp(-2));
 close(analyzeDistribution({...d,mode:"right",lower:"1"}).probability,1-Math.exp(-2));
 close(analyzeDistribution({...d,mode:"between",lower:"0",upper:"1"}).probability,3*Math.exp(-2));
 close(analyzeDistribution({...d,mode:"outside",lower:"0",upper:"2"}).probability,
  Math.exp(-2)+1-3*Math.exp(-2));
 assert(a.plotMax>=8);assert(a.plotMax<250);
 assert(a.points.length===a.plotMax+1);
 assert.match(a.notes.join(" "),/complete distribution/);
 assert.match(renderDistributionSvg(d),/data-distribution-bar="0"/);
 const zero=analyzeDistribution({...d,lambda:"0"});
 assert.equal(zero.probability,1);
 close(analyzeDistribution({...d,lambda:"0",mode:"right",lower:"1"}).probability,0);
});
test("Poisson upper-tail calculation is stable for large rates and tiny tails",()=>{
 const lambda=100;
 const k=140;
 const tail=poissonUpperTail(lambda,k);
 assert(tail>0&&tail<.001,tail);
 close(poissonCdf(lambda,k)+tail,1,1e-12);
 assert.equal(poissonMass(3,-1),0);
 const svg=renderDistributionSvg(make("poisson",{lambda:"100",mode:"right",lower:"130"}));
 assert(svg.includes("data-distribution-selected"));
 assert(!svg.includes("data-distribution-handle"));
 assert(!svg.includes("Infinity")&&!svg.includes("NaN"));
});
test("continuous uniform calculation is length/width and clips intervals to support",()=>{
 const d=make("uniform",{a:"2",b:"10",symbol:"U",mode:"between",lower:"4",upper:"7"});
 const a=analyzeDistribution(d);assert(a.ready);close(a.probability,3/8);close(a.mean,6);close(a.variance,64/12);
 close(analyzeDistribution({...d,mode:"right",lower:"6"}).probability,.5);
 close(analyzeDistribution({...d,mode:"between",lower:"0",upper:"100"}).probability,1);
 close(analyzeDistribution({...d,mode:"between",lower:"-10",upper:"1"}).probability,0);
 close(analyzeDistribution({...d,mode:"outside",lower:"4",upper:"7"}).probability,5/8);
 assert.equal(normalizeDistributionDraft({...d,mode:"exact"}).mode,"none");
 const svg=renderDistributionSvg(d);
 assert.match(svg,/data-distribution-curve="uniform"/);
 assert.match(svg,/data-distribution-shading="uniform"/);
 assert.match(svg,/Probability density/);
 assert.match(svg,/P\(4 ≤ U ≤ 7\)/);
 assert.equal([...svg.matchAll(/role="slider"/g)].length,0);
 assert.equal([...renderDistributionSvg(d,{interactive:true}).matchAll(/role="slider"/g)].length,2);
});
test("custom discrete outcomes accept negative and fractional numeric values on a true axis",()=>{
 const d=make("custom",{symbol:"S",customPoints:"-2, 0.20\n0, 0.50\n3, 0.30",mode:"right",lower:"0"});
 const a=analyzeDistribution(d);assert(a.ready,a.issues.join("; "));
 close(a.probability,.8);close(a.mean,.5);close(a.variance,3.25);
 assert.deepEqual(a.points.map(p=>p.x),[-2,0,3]);
 const l=distributionLayout(d);
 close((l.x(0)-l.x(-2))/(l.x(3)-l.x(0)),2/3);
 assert.equal(distributionBoundaryForPixel(d,"lower",l.x(3)),3);
 assert.equal(distributionBoundaryNudge(d,"lower",-1),-2);
 assert.equal(distributionBoundaryNudge(d,"lower",1),3);
 const svg=renderDistributionSvg(d);
 assert.equal([...svg.matchAll(/data-distribution-bar=/g)].length,3);
 assert.equal([...svg.matchAll(/data-distribution-selected="true"/g)].length,2);
 assert.match(svg,/data-distribution-bar="-2"/);
 const f=make("custom",{customPoints:"-1.5, 0.25\n0.5, 0.25\n2.5, 0.5",
  mode:"exact",lower:"0.5"});
 close(analyzeDistribution(f).probability,.25);
 assert.equal(analyzeDistribution({...f,lower:"0"}).probability,0);
});
test("custom distribution rejects ambiguous, invalid, duplicated or unnormalised rows",()=>{
 const invalid=[
  "0, 0.7\n1, 0.5",
  "0, 0.5\n0, 0.5",
  "a, 0.5\n1, 0.5",
  "0, -0.1\n1, 1.1",
  "0, 1",
  Array.from({length:31},(_,i)=>i+", "+(1/31)).join("\n")
 ];
 for(const customPoints of invalid){
  const q=analyzeDistribution(make("custom",{customPoints}));
  assert(!q.ready,customPoints.slice(0,60));
  assert(q.issues.length>0);
 }
 const points=parseCustomDiscrete("3, 0.3\n-2, 0.2\n0, 0.5");
 assert.deepEqual(points.points.map(p=>p.x),[-2,0,3]);
 assert.equal(points.issues.length,0);
 assert.match(analyzeDistribution(make("custom",{customPoints:"1,0.4\n2,0.4"})).issues.join(" "),/never normalised/);
});
test("invalid parameters and noninteger count bounds cannot be saved or exported",()=>{
 const invalid=[
  make("poisson",{lambda:"-1"}),make("poisson",{lambda:"101"}),
  make("poisson",{mode:"left",lower:"2.5"}),
  make("uniform",{a:"4",b:"4"}),make("uniform",{a:"5",b:"-2"}),
  make("custom",{customPoints:"1, 0.2\n2, 0.2"}),
  make("custom",{mode:"between",lower:"4",upper:"2"})
 ];
 for(const draft of invalid){
  const q=analyzeDistribution(draft);
  assert(!q.ready,JSON.stringify(draft));
  assert.throws(()=>{if(!q.ready)throw new Error(q.issues[0])});
 }
});
test("all new diagrams have clean IA titles, custom symbols, selected areas and monochrome support",()=>{
 for(const kind of ["poisson","uniform","custom"]){
  const d=make(kind,{title:"Modelling <an event> & its probability",symbol:"K",printStyle:"mono",
   size:"compact",mode:"between",lower:kind==="uniform"?"2":"0",upper:kind==="uniform"?"5":"2"});
  const svg=renderDistributionSvg(d);
  assert.match(svg,/Modelling &lt;an event&gt; &amp; its probability/);
  assert.match(svg,/K/);assert.match(svg,/width="640"/);
  assert(!svg.includes("<an event>"));
  assert(!svg.includes('role="slider"'));
  assert(!svg.includes("Show me")&&!svg.includes("I am stuck"));
  assert(svg.includes('data-distribution-selected="true"')||svg.includes('data-distribution-shading='));
  assert(!svg.includes("NaN")&&!svg.includes("Infinity"));
 }
});
test("Pass 4 Workshop lessons, definitions and contextual I am stuck align with chosen distribution",()=>{
 assert.equal(WORKSHOP_DEFINITIONS.length,243);
 assert.equal(WORKSHOP_LESSONS.length,45);
 for(const kind of ["poisson","uniform","custom"]){
  const p=DISTRIBUTION_LEARNING[kind],lesson=lessonById(p.lessonId);
  assert(lesson,kind);
  assert.equal(lesson.creator,"distribution");
  assert(p.definitions.every(x=>definitionById(x)));
  assert(PATHWAY_LEARNING.chance.lessons.includes(p.lessonId));
  assert.equal(workshopLessonForEntry({methodId:kind}),p.lessonId);
  assert(WORKSHOP_LESSON_FORMULAS[p.lessonId]?.length>=2);
  const s=stateFor(kind);
  const workshop=contextualWorkshopHelp(s,{spot:"page"});
  assert.equal(workshop?.lessonId,p.lessonId,kind);
  const g=distributionGuidance(s,s.distributionStudio.draft);
  assert.equal(g.lessonId,p.lessonId);
  assert(g.reasoning.length>50&&g.condition.length>40);
  const cards=distributionRecoveryCards(s.distributionStudio.draft,"part:introduce");
  assert.equal(cards[0].id,"distribution-why");
  assert(cards[1].action.length>50);
  const studio=studioHelpFor(s,"page");
  assert(studio.choices.some(x=>x.id==="distribution-assumptions"));
  assert(renderDistributionStudio(s,icon,e).includes('data-workshop-id="'+p.lessonId+'"'));
 }
 assert(relatedDefinitionSections("poisson-distribution").some(x=>x.definitions.length>0));
});
