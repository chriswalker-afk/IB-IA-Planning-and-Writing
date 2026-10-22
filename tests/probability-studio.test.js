import test from "node:test";
import assert from "node:assert/strict";
import {newProbabilityDraft,newProbabilityStudio,normalizeProbabilityDraft,probabilityValue,
 probabilityAnalysis,saveProbabilityFigure,leafKeys} from "../src/diagrams/probability-core.js";
import {setProbabilityBranch,setProbabilityField,setProbabilityStage,toggleProbabilityLeaf,
 saveProbabilityDraft,saveAndLinkProbability,loadProbability} from "../src/diagrams/probability-actions.js";
import {renderProbabilitySvg} from "../src/diagrams/probability-render.js";
import {renderProbabilityStudio,probabilityOutputHtml} from "../src/diagrams/probability-view.js";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";
import {firstSavedFigures} from "../src/completing/first-figure-gallery.js";
import {representationAdvice,renderRepresentationHub} from "../src/diagrams/representation-hub.js";
const e=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const icon=()=>'<svg aria-hidden="true"></svg>';
function validDraft(stages=2){
 const d=newProbabilityDraft();d.stages=stages;
 const pairs={"":["3/5","2/5"],"0":["80%","0.2"],"1":["0.3","7/10"],
  "00":["0.7","0.3"],"01":["0.4","0.6"],"10":["0.2","0.8"],"11":["0","1"]};
 for(const [id,values] of Object.entries(pairs))
  d.branches[id].forEach((b,i)=>b.probability=values[i]);
 d.edited=true;return d;
}
test("accept decimal, fraction and percent probability inputs but reject malformed, negative and impossible values",()=>{
 assert.equal(probabilityValue("3/5"),.6);
 assert.equal(probabilityValue("75%"),.75);
 assert.equal(probabilityValue(".125"),.125);
 assert.equal(probabilityValue("0"),0);
 for(const x of ["","50%%","1/0","1/2/3","-0.1","1.01","150%","NaN","1e2","\\frac{1}{2}"])
  assert.equal(probabilityValue(x),null,x);
});
test("two-stage conditional tree calculates four joint outcomes and all event operations",()=>{
 const d=validDraft();d.showProducts=true;d.showEventCalculation=true;
 d.eventLeaves=["00","10"];d.conditionLeaves=["00","01"];
 const a=probabilityAnalysis(d);
 assert(a.ready,a.issues.join("; "));
 assert(Math.abs(a.total-1)<1e-12);
 assert.deepEqual(a.paths.map(p=>Number(p.probability.toFixed(6))),[.48,.12,.12,.28]);
 assert(Math.abs(a.event-.6)<1e-12);
 assert(Math.abs(a.condition-.6)<1e-12);
 assert(Math.abs(a.intersection-.48)<1e-12);
 assert(Math.abs(a.conditional-.8)<1e-12);
 const svg=renderProbabilitySvg(d);
 assert.doesNotMatch(svg,/Every split gives probabilities conditional/);
 assert.match(svg,/P\(path\)/);
 assert.match(svg,/P\(Event E \| Condition C\)/);
});
test("all splits are validated separately; missing and wrong values block saving rather than being normalised",()=>{
 const d=newProbabilityDraft();assert.equal(probabilityAnalysis(d).ready,false);
 const wrong=validDraft();wrong.branches["1"][0].probability=".35";
 assert(probabilityAnalysis(wrong).issues.some(x=>/sum to 1/.test(x)));
 const s=newProbabilityStudio();s.draft=wrong;
 assert.equal(saveProbabilityFigure(s).ok,false);
 assert.equal(s.figures.length,0);
 wrong.branches["1"][0].probability="0.3";
 assert.equal(probabilityAnalysis(wrong).ready,true);
});
test("three-stage dependent probabilities, invalid inactive branches and zero-probability conditional events",()=>{
 const d=validDraft(3);d.showEventCalculation=true;
 assert.equal(leafKeys(3).length,8);
 const q=probabilityAnalysis(d);assert(q.ready,q.issues.join(", "));
 assert.equal(q.paths.length,8);
 assert(Math.abs(q.total-1)<1e-12);
 d.conditionLeaves=["110"];d.eventLeaves=["000"];
 const z=probabilityAnalysis(d);
 assert.equal(z.condition,0);
 assert.equal(z.conditional,null);
 assert(z.notes.some(x=>/undefined/.test(x)));
 d.stages=2;
 d.eventLeaves=["00","010","11"];d.conditionLeaves=["110"];
 const clean=normalizeProbabilityDraft(d);
 assert.deepEqual(clean.eventLeaves,["00","11"]);
 assert.deepEqual(clean.conditionLeaves,[]);
 assert.equal(probabilityAnalysis(clean).ready,true);
});
test("source credit is required for secondary probability estimates, not for theoretical models",()=>{
 const d=validDraft();d.sourceKind="secondary";
 assert(probabilityAnalysis(d).issues.some(x=>/Cite/.test(x)));
 d.sourceCredit="School-provided dataset, October 2026";
 assert.equal(probabilityAnalysis(d).ready,true);
});
test("all branch labels are preserved, formulas escaped in SVG and the studio offers an accessible editor",()=>{
 const state=createProjectState();state.probabilityStudio.draft=validDraft();
 assert.match(renderProbabilityStudio(state,icon,e),/data-probability-studio/);
 const html=renderProbabilityStudio(state,icon,e);
 for(const action of ["probability-save","probability-use","probability-svg","probability-png"])
  assert(html.includes('data-action="'+action+'"'),action);
 const d=validDraft();d.branches["0"][0].label="<script>alert(1)</script>";
 const svg=renderProbabilitySvg(d);assert(!svg.includes("<script>"));
 assert(svg.includes("&lt;script&gt;")||svg.includes("script"));
 assert.equal(probabilityAnalysis(d).ready,true);
});
test("changing selected event paths never changes the branch probabilities",()=>{
 const studio=newProbabilityStudio();studio.draft=validDraft(3);
 const before=JSON.stringify(studio.draft.branches);
 assert(toggleProbabilityLeaf(studio,"eventLeaves","010",true));
 assert(toggleProbabilityLeaf(studio,"conditionLeaves","010",true));
 assert(toggleProbabilityLeaf(studio,"eventLeaves","010",false));
 assert.equal(JSON.stringify(studio.draft.branches),before);
 assert(setProbabilityStage(studio,2,"Third independent? Not established"));
 assert(setProbabilityBranch(studio,"10",1,"probability","4/5"));
 assert(setProbabilityField(studio,"stages","2"));
 assert.equal(studio.draft.stages,2);
 assert.deepEqual(studio.draft.conditionLeaves,[]);
});
test("probability trees survive backups, stage linking, first-figure gallery and project figure exports",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C31";
 s.probabilityStudio.draft=validDraft();
 s.entries=[{id:"stage-one",phase:"first",status:"planned",title:"",technique:""}];
 s.completion.activeEntryIndex=0;
 const linked=saveAndLinkProbability(s);
 assert(linked.ok,linked.error);
 assert.equal(s.entries[0].probabilityFigureId,linked.record.id);
 assert.equal(s.entries[0].status,"planned");
 assert(firstSavedFigures(s).some(x=>x.kind==="probability"));
 const figs=collectProjectFigures(s);
 const fig=figs.find(x=>x.kind==="probability"&&x.entryId==="stage-one");
 assert(fig&&fig.svg.includes("<svg"),"Export should contain mathematical SVG");
 assert(fig.rows.some(x=>x.label==="Entered outcomes and branch probabilities"));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.entries[0].probabilityFigureId,linked.record.id);
 assert.equal(restored.probabilityStudio.figures.length,1);
 assert(loadProbability(restored.probabilityStudio,linked.record.id));
 assert.equal(saveProbabilityDraft(restored).ok,true);
});
test("when a linked completed mathematical stage changes, the writer is prompted to review it",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C31";
 s.entries=[{id:"test-one",phase:"first",status:"completed",title:"",result:"P(A)=0.6",technique:""}];
 s.completion.activeEntryIndex=0;s.probabilityStudio.draft=validDraft();
 assert(saveAndLinkProbability(s).ok);
 s.probabilityStudio.draft.branches["0"][0].probability="0.7";
 s.probabilityStudio.draft.branches["0"][1].probability="0.3";
 const result=saveProbabilityDraft(s);
 assert(result.ok);assert(result.reviewNeeded);
 assert.equal(s.entries[0].reviewNeeded,"yes");
});
test("advice suggests trees for chosen conditional probability without changing other investigation methods",()=>{
 const s=createProjectState();s.planning.routeExplorer.selectedRoute="chance";
 assert.deepEqual(representationAdvice(s).ids,["probability","stat"]);
 assert(renderRepresentationHub(s,icon,e).includes('data-action="probability-open"'));
 s.route="completing";s.completion.current="C30";
 s.entries=[{id:"x",phase:"first",status:"planned",methodId:"probability"}];
 s.completion.activeEntryIndex=0;
 assert.equal(representationAdvice(s).ids[0],"probability");
});
test("unsaved edits are retained as an in-progress project draft but not an established result",()=>{
 const s=createProjectState();
 s.probabilityStudio.draft.title="Partly completed";
 s.probabilityStudio.draft.edited=true;
 const figures=collectProjectFigures(s).filter(x=>x.kind==="probability");
 assert.equal(figures.length,1);
 assert.match(figures[0].status,/not yet saved/);
 assert.equal(probabilityOutputHtml(s.probabilityStudio,icon).includes('data-action="probability-save" disabled'),true);
});

test("IA tree presentation settings hide editor guidance but preserve source evidence",()=>{
 const d=validDraft(2);
 d.sourceKind="secondary";d.sourceCredit="Published study";
 d.caption="Estimated conditional probabilities";d.figureNumber="7";
 d.showCaption=true;d.showTitle=false;d.showStageLabels=false;
 const svg=renderProbabilitySvg(d);
 assert.match(svg,/Figure 7\. Estimated conditional probabilities/);
 assert.doesNotMatch(svg,/Successive and conditional outcomes|Every split gives probabilities|Published study|First event/);
 assert.match(svg,/probability-branch-annotation/);
 assert.match(svg,/data-prob-segment="00"/);
 const store=newProbabilityStudio();store.draft=d;
 assert.equal(saveProbabilityFigure(store).ok,true);
 const normalized=normalizeProbabilityDraft(store.figures[0].draft);
 assert.equal(normalized.caption,"Estimated conditional probabilities");
 assert.equal(normalized.showTitle,false);
 assert.equal(normalized.showStageLabels,false);
});
