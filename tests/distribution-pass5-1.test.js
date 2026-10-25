import test from "node:test";
import assert from "node:assert/strict";
import {newDistributionDraft,analyzeDistribution,normalUpperTail,normalCdf} from "../src/diagrams/distribution-core.js";
import {poissonUpperTail,poissonCdf} from "../src/diagrams/distribution-extra.js";
import {inverseDistribution,normalStandardQuantile} from "../src/diagrams/distribution-inverse.js";

const draft=(kind,fields={})=>({...newDistributionDraft(),kind,...fields});
const ask=(d,mode,probability)=>inverseDistribution(d,{mode,probability});
const close=(actual,expected,tolerance=1e-9)=>assert.ok(Math.abs(actual-expected)<=tolerance,
 "Expected "+actual+" to be within "+tolerance+" of "+expected);
const reaches=(result,probability)=>{
 assert.equal(result.ok,true,result.issues.join("; "));
 assert.equal(result.comparison,"at least");
 assert.ok(result.achieved>=probability-5e-14,
  "Achieved "+result.achieved+" is less than requested "+probability);
 if(result.adjacentProbability!==null&&probability>0&&probability<1)
  assert.ok(result.adjacentProbability<probability+5e-14,
   "Adjacent outcome meets target: "+result.adjacentProbability+" >= "+probability);
};
test("normal inverse quantiles agree with independently known standard-normal values",()=>{
 for(const [p,z] of [[.001,-3.090232306], [.025,-1.959963985], [.5,0],
   [.975,1.959963985],[.999,3.090232306],[1e-12,-7.034483825],[1e-20,-9.26234009]]){
  close(normalStandardQuantile(p),z,1e-8);
  const x=ask(draft("normal"),"left",p);
  assert.equal(x.ok,true,x.issues.join("; "));
  close(x.lower,z,1e-8);
  const relative=Math.max(1e-28,p);
  assert.ok(Math.abs(x.achieved-p)/relative<2e-7,"Round trip "+p+" got "+x.achieved);
 }
 assert.equal(normalStandardQuantile(0),null);
 assert.equal(normalStandardQuantile(1),null);
 assert.equal(normalStandardQuantile(-0.3),null);
});
test("normal upper tail stays nonzero well beyond the plotted graph and matches known rare tails",()=>{
 close(normalUpperTail(7),1.279812543885835e-12,1e-23);
 close(normalUpperTail(12),1.776482112077679e-33,1e-43);
 close(normalUpperTail(30),4.90671392714818e-198,1e-207);
 close(normalCdf(-9),normalUpperTail(9),1e-30);
 assert.equal(normalUpperTail(40),0);
});
test("normal inverse upper and lower events use the same actual model",()=>{
 const d=draft("normal",{mu:"100",sigma:"15",mode:"outside",lower:"nonsense",
  symbol:"not a letter",title:"",sourceKind:"secondary",sourceCredit:""});
 const original=JSON.stringify(d);
 const lower=ask(d,"left",.95),right=ask(d,"right",.05);
 assert.equal(lower.ok,true,lower.issues.join("; "));
 assert.equal(right.ok,true,right.issues.join("; "));
 close(lower.lower,124.672804404,1e-7);
 close(right.lower,lower.lower,1e-11);
 close(lower.achieved,.95,1e-9);
 close(right.achieved,.05,1e-9);
 assert.deepEqual(lower.event,{mode:"left",lower:String(lower.lower)});
 assert.equal(JSON.stringify(d),original,"pure calculations must not mutate saved drafts");
 const applied=analyzeDistribution({...d,mode:right.event.mode,lower:right.event.lower,
  title:"Quantile result",symbol:"T",sourceKind:"theoretical"});
 assert.equal(applied.ready,true);
 close(applied.probability,right.achieved,1e-12);
});
test("normal equal-tailed central intervals have correct coverage",()=>{
 const d=draft("normal",{mu:"70",sigma:"10"});
 const x=ask(d,"central",.95);
 assert.equal(x.ok,true);
 close(x.lower,50.40036015,1e-7);
 close(x.upper,89.59963985,1e-7);
 close(x.achieved,.95,1e-9);
 assert.deepEqual(x.event,{mode:"between",lower:String(x.lower),upper:String(x.upper)});
 const zero=ask(d,"central",0);
 assert.equal(zero.ok,true);close(zero.lower,70);close(zero.upper,70);close(zero.achieved,0);
});
test("unbounded normal endpoints do not invent finite quantiles",()=>{
 for(const [mode,p] of [["left",0],["left",1],["right",0],["right",1],["central",1]]){
  const q=ask(draft("normal"),mode,p);
  assert.equal(q.ok,false);assert.match(q.issues.join(" "),/infinite|unbounded/i);
  assert.equal(q.event,null);
 }
});
test("uniform lower and upper quantiles support endpoints and nonzero origin",()=>{
 const d=draft("uniform",{a:"2",b:"10"});
 for(const [mode,p,expected] of [["left",0,2],["left",1,10],["left",.25,4],
  ["right",.25,8],["right",0,10],["right",1,2]]){
  const r=ask(d,mode,p);
  assert.equal(r.ok,true);close(r.lower,expected);
  close(r.achieved,p);
 }
 const central=ask(d,"central",.75);
 assert.equal(central.ok,true);
 close(central.lower,3);close(central.upper,9);close(central.achieved,.75);
 const complete=ask(d,"central",1);
 assert.equal(complete.ok,true);close(complete.lower,2);close(complete.upper,10);
 assert.equal(ask(draft("uniform",{a:"10",b:"2"}),"left",.5).ok,false);
});
test("binomial left and right integer quantiles guarantee minimum inclusive coverage",()=>{
 const d=draft("binomial",{n:"10",p:".5"});
 const l=ask(d,"left",.5),r=ask(d,"right",.5);
 assert.equal(l.lower,5);assert.equal(r.lower,5);
 close(l.achieved,638/1024);
 close(r.achieved,638/1024);
 close(l.adjacentProbability,386/1024);
 close(r.adjacentProbability,386/1024);
 reaches(l,.5);reaches(r,.5);
 assert.match(l.notes.join(" "),/may exceed/);
 for(const [mode,p,expected] of [["left",0,0],["left",1,10],["right",0,10],["right",1,0]])
  assert.equal(ask(d,mode,p).lower,expected);
});
test("degenerate binomial and Poisson distributions retain their one-point support",()=>{
 for(const [d,x] of [[draft("binomial",{n:"12",p:"0"}),0],
  [draft("binomial",{n:"12",p:"1"}),12],[draft("poisson",{lambda:"0"}),0]]){
  for(const mode of ["left","right"])for(const q of [0,.2,.8,1]){
   const r=ask(d,mode,q);
   reaches(r,q);
   assert.equal(r.lower,x);
   assert.equal(r.achieved,1);
  }
 }
});
test("Poisson inverse count boundaries use full tails, not graph cutoffs",()=>{
 const d=draft("poisson",{lambda:"3"});
 const left=ask(d,"left",.95),right=ask(d,"right",.05);
 reaches(left,.95);reaches(right,.05);
 assert.equal(left.lower,6);assert.equal(right.lower,6);
 close(left.achieved,poissonCdf(3,6),1e-12);
 close(right.achieved,poissonUpperTail(3,5),1e-12);
 const rate100=draft("poisson",{lambda:"100"});
 for(const p of [1e-9,1e-20,1e-80,1e-280]){
  const result=ask(rate100,"right",p);
  reaches(result,p);
  const directly=poissonUpperTail(100,result.lower-1);
  assert.ok(Math.abs(directly-result.achieved)<=Math.max(1e-320,p*2e-12));
 }
 const extremelyRare=ask(rate100,"right",1e-80);
 assert.ok(extremelyRare.lower>296,"Must search beyond the old finite plotting tail");
 assert.ok(poissonUpperTail(100,extremelyRare.lower-1)>0);
});
test("Poisson endpoint conventions distinguish finite and unbounded support",()=>{
 const d=draft("poisson",{lambda:"2.5"});
 assert.equal(ask(d,"left",0).lower,0);
 assert.equal(ask(d,"right",1).lower,0);
 for(const [mode,p] of [["left",1],["right",0]]){
  const r=ask(d,mode,p);
  assert.equal(r.ok,false);
  assert.match(r.issues.join(" "),/no finite|no greatest/i);
 }
});
test("custom discrete quantiles use numerical outcome values, not bar indices",()=>{
 const d=draft("custom",{customPoints:"-2, 0.2\n0, 0.5\n3, 0.3"});
 for(const [mode,p,boundary,achieved] of [
  ["left",.2,-2,.2],["left",.7,0,.7],["left",.8,3,1],
  ["right",.3,3,.3],["right",.31,0,.8],["right",.9,-2,1]
 ]){
  const x=ask(d,mode,p);
  reaches(x,p);assert.equal(x.lower,boundary);close(x.achieved,achieved,1e-14);
 }
 for(const [mode,p,expected] of [["left",0,-2],["left",1,3],["right",0,3],["right",1,-2]])
  assert.equal(ask(d,mode,p).lower,expected);
});
test("zero-probability custom outcomes do not change supported quantiles",()=>{
 const d=draft("custom",{customPoints:"-200, 0\n-2, 0.2\n0, 0.8\n900, 0"});
 assert.equal(ask(d,"left",0).lower,-2);
 assert.equal(ask(d,"right",0).lower,0);
 assert.equal(ask(d,"left",1).lower,0);
 assert.equal(ask(d,"right",1).lower,-2);
});
test("invalid, unsupported and imprecisely normalised models fail explicitly",()=>{
 for(const p of [null,undefined,"",NaN,Infinity,-.01,1.0000001,true,{}]){
  assert.equal(ask(draft("normal"),"left",p).ok,false,String(p));
 }
 assert.equal(ask(draft("normal"),"sideways",.5).ok,false);
 assert.equal(ask(draft("poisson"),"central",.8).ok,false);
 assert.equal(ask(draft("binomial",{n:"3.5"}),"left",.5).ok,false);
 assert.equal(ask(draft("poisson",{lambda:"-1"}),"right",.5).ok,false);
 assert.equal(ask(draft("uniform",{a:"1",b:"1"}),"central",.6).ok,false);
 assert.equal(ask(draft("custom",{customPoints:"1, 0.3333333\n2, 0.3333333\n3, 0.3333333"}),
   "left",.6).ok,false,"Do not silently renormalise nearly-one custom totals");
 assert.equal(ask(draft("custom",{customPoints:"1, 0.4\n1, 0.6"}),"left",.8).ok,false);
 assert.equal(inverseDistribution({kind:"gamma"},{mode:"left",probability:.5}).ok,false);
});
test("discrete upper and lower inverse boundaries satisfy adjacent coverage over many targets",()=>{
 const models=[
  draft("binomial",{n:"150",p:".37"}),
  draft("binomial",{n:"8",p:".8"}),
  draft("poisson",{lambda:"0.1"}),
  draft("poisson",{lambda:"35"}),
  draft("poisson",{lambda:"100"}),
  draft("custom",{customPoints:"-3, 0.11\n-0.2, 0.22\n5, 0.36\n30, 0.31"})
 ];
 const targets=[1e-12,1e-6,.01,.05,.1,.2,.4,.5,.6,.8,.9,.95,.99,1-1e-12];
 for(const d of models)for(const mode of ["left","right"])for(const p of targets){
  const r=ask(d,mode,p);
  reaches(r,p);
  assert.equal(r.upper,null);
  assert.equal(r.event.mode,mode);
  assert.equal(Number(r.event.lower),r.lower);
 }
});
