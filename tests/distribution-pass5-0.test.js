import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newDistributionDraft,saveDistributionFigure} from "../src/diagrams/distribution-core.js";
import {collectProjectFigures} from "../src/handover/figure-report.js";
import {WORKSHOP_LESSONS} from "../src/workshop/catalog.js";
import {readFileSync} from "node:fs";

const models=[
 ["normal",{mu:"73",sigma:"8",mode:"left",lower:"80"},["Mean (μ): 73","standard deviation (σ): 8"]],
 ["binomial",{n:"12",p:"0.25",mode:"exact",lower:"3"},["Number of trials (n): 12","success probability (p): 0.25"]],
 ["poisson",{lambda:"4",mode:"right",lower:"3"},["Mean event count per interval (λ): 4"]],
 ["uniform",{a:"-2",b:"8",mode:"between",lower:"0",upper:"5"},["Lower support limit (a): -2","upper support limit (b): 8"]],
 ["custom",{customPoints:"-2, 0.2\n0, 0.5\n3, 0.3",mode:"right",lower:"0"},["-2, 0.2","0, 0.5","3, 0.3"]]
];
const rowsByLabel=figure=>new Map(figure.rows.map(r=>[r.label,r.value]));
test("all five models export their actual parameters and preserve their event and provenance",()=>{
 for(const [kind,changes,expected] of models){
  const state=createProjectState();
  state.distributionStudio.draft={...newDistributionDraft(),kind,title:"Theoretical comparison",symbol:"T",
   sourceKind:"secondary",sourceCredit:"Illustrative source citation",note:"Assumed independence requires checking",...changes};
  const saved=saveDistributionFigure(state.distributionStudio);
  assert.equal(saved.ok,true,kind+": "+saved.error);
  const figures=collectProjectFigures(normalizeProjectState(JSON.parse(JSON.stringify(state))));
  const figure=figures.find(x=>x.id===saved.record.id);
  assert.ok(figure,kind);
  assert.equal(figure.error,"",kind);
  assert.match(figure.svg,/data-distribution-svg="true"/,kind);
  const rows=rowsByLabel(figure);
  assert.equal(rows.get("Random variable"),"T");
  assert.equal(rows.get("Source"),"Illustrative source citation");
  assert.equal(rows.get("Assumptions and limitations"),"Assumed independence requires checking");
  assert.ok(rows.get("Event probability")?.includes("P(T"),kind);
  const parameters=(rows.get("Parameters")||"")+"\n"+(rows.get("Entered outcome probabilities")||"");
  for(const item of expected)assert.ok(parameters.includes(item),kind+" missed "+item);
  if(!["binomial"].includes(kind))assert.doesNotMatch(parameters,/Number of trials \(n\)/,kind);
  assert.ok(!rows.has("Validation issues"),kind);
 }
});
test("invalid imported custom probabilities are reported rather than renormalised",()=>{
 const s=createProjectState();
 s.distributionStudio.draft={...newDistributionDraft(),kind:"custom",title:"Draft distribution",customPoints:"1, 0.3\n2, 0.3",edited:true};
 const figure=collectProjectFigures(s).find(x=>x.kind==="distribution");
 assert.ok(figure);
 const rows=rowsByLabel(figure);
 assert.equal(rows.get("Total assigned probability"),"0.6");
 assert.match(rows.get("Validation issues"),/must total 1/);
 assert.match(rows.get("Entered outcome probabilities"),/1, 0.3/);
});
test("resource browser checks use the current canonical Workshop catalogue",()=>{
 const source=readFileSync("scripts/resources-browser.py","utf8");
 assert.match(source,/WORKSHOP_LESSON_COUNT=int\(subprocess.check_output/);
 assert.doesNotMatch(source,/workshop-lesson-card'\)\.count\(\)==42/);
 assert.ok(WORKSHOP_LESSONS.length>42);
 assert.match(source,/\.drawer \.guidance-help-panel'\)\.evaluate/);
});
