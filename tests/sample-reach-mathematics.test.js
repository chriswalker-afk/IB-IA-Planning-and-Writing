import test from "node:test";
import assert from "node:assert/strict";
import {STANDING_REACH_SPEC as sample,REACH_CASES,REACH_VALIDATION_IDS} from "../src/core/samples/standing-reach.js";
import {analyseGraph} from "../src/diagrams/graph-core.js";
import {analyzeTable} from "../src/diagrams/table-studio-core.js";
import {mixedMathTokens,mathSvg} from "../src/math/mixed-math.js";

const close=(actual,expected,tolerance=1e-9)=>assert(Math.abs(actual-expected)<tolerance,
 actual+" is not within "+tolerance+" of "+expected);
const reservedIds=new Set(REACH_VALIDATION_IDS);
const training=REACH_CASES.filter(row=>!reservedIds.has(row[0]));
const validation=REACH_CASES.filter(row=>reservedIds.has(row[0]));
// Independent raw-sum formula, rather than the centred-sum implementation that
// creates the author's figures. Fixed expected values protect the written maths.
function independentFit(rows){
 const n=rows.length,sh=rows.reduce((s,x)=>s+x[1],0),sr=rows.reduce((s,x)=>s+x[2],0);
 const shh=rows.reduce((s,x)=>s+x[1]*x[1],0),shr=rows.reduce((s,x)=>s+x[1]*x[2],0);
 const srr=rows.reduce((s,x)=>s+x[2]*x[2],0);
 const b=(n*shr-sh*sr)/(n*shh-sh*sh),a=(sr-b*sh)/n;
 const r=(n*shr-sh*sr)/Math.sqrt((n*shh-sh*sh)*(n*srr-sr*sr));
 return {a,b,r,n,predict:h=>a+b*h};
}
const fit=independentFit(training);
const figure=id=>sample.figures.find(x=>x.id===id);
const numericRows=id=>figure(id).draft.matrix.map(row=>row.map(Number));

test("reach study fixes a disjoint 18/6 allocation and fits no reserved reach",()=>{
 assert.equal(REACH_CASES.length,24);
 assert.deepEqual(REACH_CASES.map(row=>row[0]),Array.from({length:24},(_,i)=>i+1));
 assert.deepEqual(REACH_VALIDATION_IDS,[4,8,12,16,20,24]);
 assert.equal(training.length,18);
 assert.equal(validation.length,6);
 const expected=training.map(([,h,r])=>[h,r]);
 assert.deepEqual(numericRows("figure-reach-development"),expected);
 assert.deepEqual(numericRows("figure-reach-fit"),expected);
 assert.equal(sample.dataSets[0].rows.length,24);
 for(const [id,h,r,role] of sample.dataSets[0].rows){
  assert.deepEqual(REACH_CASES.find(row=>row[0]===Number(id)).slice(1),[Number(h),Number(r)]);
  assert.equal(role,reservedIds.has(Number(id))?"Reserved validation":"Development");
 }
 assert.match(sample.dataNotes,/Before fitting any model/);
 assert.match(sample.provenance,/constructed teaching data, not observations of real people/);
});

test("reach equation and correlation agree with independent arithmetic and the editable graph",()=>{
 close(fit.b,52581/41801);
 close(fit.a,9.7832348508409);
 close(fit.r,0.986142190570626);
 close(fit.predict(175),229.9137341211933);
 const shown=analyseGraph(figure("figure-reach-fit").draft);
 assert.equal(shown.ready,true);
 assert.equal(shown.models.length,1);
 const model=shown.models[0];
 assert.equal(model.n,18);
 close(model.coefficients[0],fit.a);
 close(model.coefficients[1],fit.b);
 close(model.diagnostics.rmse,2.403675968889);
 assert.match(model.equation,/R.*H/);
 assert.match(sample.stages[1].result,/1\.25788857H/);
 assert.match(sample.stages[1].result,/0\.986142/);
});

test("all development residuals are retained and use given minus predicted reach",()=>{
 const rows=numericRows("figure-reach-residuals");
 assert.equal(rows.length,18);
 let squares=0;
 rows.forEach(([h,e],i)=>{
  assert.equal(h,training[i][1]);
  close(e,training[i][2]-fit.predict(h));
  squares+=e*e;
 });
 close(squares,103.9978469414607);
 close(Math.sqrt(squares/18),2.403675968889);
 assert(rows.every(([,e])=>Math.abs(e)<=5));
 close(Math.min(...rows.map(row=>row[1])),-4.5611827468242);
 close(Math.max(...rows.map(row=>row[1])),3.8283773115476);
});

test("validation exposes the accuracy limitation without refitting or discarding cases",()=>{
 const errors=validation.map(([,h,r])=>r-fit.predict(h));
 assert.deepEqual(errors.map(x=>Number(x.toFixed(2))),[2.47,-5.33,6.86,-3.95,6.25,-6.52]);
 close(Math.sqrt(errors.reduce((s,e)=>s+e*e,0)/6),5.4590642993566);
 close(errors.reduce((s,e)=>s+Math.abs(e),0)/6,5.2306842739009);
 close(errors.reduce((s,e)=>s+e,0)/6,-0.0374193599834);
 assert.equal(errors.filter(e=>Math.abs(e)<=5).length,2);
 const displayed=numericRows("table-reach-validation");
 assert.equal(displayed.length,6);
 displayed.forEach(([id,h,r,p,e],i)=>{
  assert.deepEqual([id,h,r],validation[i]);
  close(p,Number(fit.predict(h).toFixed(2)));
  close(e,Number((r-fit.predict(h)).toFixed(2)));
 });
 assert.match(sample.stages[3].interpretation,/four reserved cases/);
 assert.match(sample.conclusion.mainConclusion,/2\/6/);
 assert.match(sample.conclusion.mainConclusion,/5\.46/);
});

test("all 18 diagnostic omissions are checked against the full-domain endpoint bound",()=>{
 const records=sample.dataSets[1].rows;
 assert.equal(records.length,18);
 let largest=0;
 const gradients=[];
 for(const row of records){
  const [omitted,a,b,lo,hi]=row.map(Number);
  const reduced=independentFit(training.filter(p=>p[0]!==omitted));
  close(a,reduced.a);close(b,reduced.b);
  close(lo,reduced.predict(155));close(hi,reduced.predict(190));
  largest=Math.max(largest,Math.abs(lo-fit.predict(155)),Math.abs(hi-fit.predict(190)));
  gradients.push(b);
 }
 close(largest,0.76471087183614);
 close(Math.min(...gradients),1.23216020727626);
 close(Math.max(...gradients),1.28581543544961);
 const summary=figure("table-reach-sensitivity").draft.matrix;
 assert.deepEqual(summary.map(row=>row[0]),["All 18","Omit 13","Omit 9"]);
 assert.equal(figure("figure-reach-fit").draft.matrix.length,18);
 assert.match(sample.stages[2].interpretation,/retained all 18 pairs/);
});

test("target rounding may improve or worsen errors and does not rescue the height-only rule",()=>{
 const rows=numericRows("table-reach-targets");
 const errors=[];
 rows.forEach(([id,target,ideal,error,extra],i)=>{
  const [expectedId,h,r]=validation[i];
  assert.equal(id,expectedId);
  assert.equal(target,5*Math.round((fit.predict(h)+25)/5));
  assert.equal(ideal,r+25);
  assert.equal(error,target-ideal);
  assert.equal(extra,target-r);
  const q=target-(fit.predict(h)+25),e=r-fit.predict(h);
  assert(Math.abs(q)<=2.5);
  close(error,-e+q);
  errors.push(error);
 });
 assert.deepEqual(errors,[-1,3,-8,4,-5,9]);
 assert.equal(errors.filter(e=>Math.abs(e)<=5).length,4);
 assert.equal(rows[2][4],17);
 assert.equal(rows[5][4],34);
 close(fit.b*0.5,0.628944283629578);
 assert.match(sample.stages[4].result,/improvement.*incidental/);
 assert.match(sample.stages[4].result,/can still jump/);
 assert.match(sample.conclusion.mainConclusion,/direct standing-reach measurement/);
});

test("the sample's authored mathematical expressions and six editable figures render",()=>{
 function visit(value){
  if(typeof value==="string"){
   for(const token of mixedMathTokens(value))if(token.type==="math")
    assert(mathSvg(token.value,{display:token.display}).svg.startsWith("<svg"));
  }else if(Array.isArray(value))value.forEach(visit);
  else if(value&&typeof value==="object")Object.values(value).forEach(visit);
 }
 visit(sample);
 assert.equal(sample.stages.length,5);
 assert.equal(sample.figures.length,6);
 for(const f of sample.figures){
  assert(sample.stages[f.stage]);
  const checked=f.tool==="graph"?analyseGraph(f.draft):analyzeTable(f.draft);
  assert.equal(checked.ready,true,f.id+": "+JSON.stringify(checked.problems));
 }
});
