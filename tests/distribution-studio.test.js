import test from "node:test";
import assert from "node:assert/strict";
import {newDistributionDraft,analyzeDistribution,normalCdf,normalUpperTail,binomialMass,
 saveDistributionFigure,newDistributionStudio,normalizeDistributionStudio} from "../src/diagrams/distribution-core.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
const make=(overrides={})=>({...newDistributionDraft(),title:"IA model of delivery times",...overrides});
test("normal cumulative values, symmetry, and stable tails",()=>{
 assert.ok(Math.abs(normalCdf(0)-.5)<1e-10);
 assert.ok(Math.abs(normalCdf(1)-.841344746)<1e-7);
 assert.ok(Math.abs(normalUpperTail(3)-.001349898)<1e-7);
 assert.ok(Math.abs(normalUpperTail(7)-1.27981254e-12)<1e-13);
});
test("normal between, outside and no selected area",()=>{
 const between=analyzeDistribution(make({mu:"70",sigma:"10",symbol:"T",mode:"between",lower:"65",upper:"85"}));
 assert.equal(between.ready,true);assert.ok(Math.abs(between.probability-.624655)<.00001);
 assert.match(between.statement,/T/);
 const outside=analyzeDistribution(make({mode:"outside",lower:"-1",upper:"1"}));
 assert.ok(Math.abs(outside.probability-.3173105)<.000001);
 const none=analyzeDistribution(make());
 assert.equal(none.probability,null);
});
test("binomial exact and cumulative probabilities",()=>{
 const d=make({kind:"binomial",symbol:"B",n:"10",p:".5",mode:"exact",lower:"3"});
 const a=analyzeDistribution(d);
 assert.equal(a.ready,true);assert.ok(Math.abs(a.probability-120/1024)<1e-12);
 assert.match(a.statement,/B = 3/);
 const other=analyzeDistribution({...d,mode:"right",lower:"5"});
 assert.ok(Math.abs(other.probability-.623046875)<1e-12);
 const tails=analyzeDistribution({...d,mode:"outside",lower:"2",upper:"8"});
 assert.ok(Math.abs(tails.probability-2*56/1024)<1e-12);
 assert.equal(binomialMass(10,0,0),1);assert.equal(binomialMass(10,1,10),1);
});
test("invalid symbolic and distribution inputs cannot be exported",()=>{
 for(const raw of [
  make({symbol:"X+Y"}),make({title:""}),make({sigma:"0"}),
  make({kind:"binomial",n:"4.5"}),make({kind:"binomial",p:"1.1"}),
  make({kind:"binomial",mode:"between",lower:"2.5",upper:"5"}),
  make({mode:"between",lower:"4",upper:"3"})
 ]) assert.equal(analyzeDistribution(raw).ready,false);
});
test("clean figure contains student title and custom symbol, not studio instructions",()=>{
 const d=make({kind:"binomial",symbol:"H",n:"8",p:"0.4",mode:"left",lower:"3",size:"compact"});
 const svg=renderDistributionSvg(d);
 assert.match(svg,/IA model of delivery times/);assert.match(svg,/P\(H/);
 assert.doesNotMatch(svg,/Save|Source reference|Model assumptions and interpretation/);
 assert.match(svg,/width="640"/);
});
test("saved distribution remains editable in imported backup",()=>{
 const studio=newDistributionStudio();studio.draft=make({symbol:"Y"});
 const saved=saveDistributionFigure(studio);
 assert.equal(saved.ok,true);
 const restored=normalizeDistributionStudio(JSON.parse(JSON.stringify(studio)));
 assert.equal(restored.figures.length,1);
 assert.equal(restored.figures[0].draft.symbol,"Y");
});
