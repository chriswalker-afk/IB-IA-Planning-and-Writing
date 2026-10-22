import test from 'node:test';
import assert from 'node:assert/strict';
import {TRAY_OPTIMISATION_SPEC as sample} from '../src/core/samples/tray-optimisation.js';
import {analyseGraph,compileGraphFunction,normalizeGraphDraft} from '../src/diagrams/graph-core.js';
import {geometryAnalysis,normalizeGeometryDraft} from '../src/diagrams/geometry-core.js';
import {analyzeTable,normalizeTableDraft} from '../src/diagrams/table-studio-core.js';
import {PLANNING_FIELD_DEFAULTS} from '../src/planning/engine.js';
import {C_FIELD_DEFAULTS} from '../src/completing/engine.js';
import {mixedMathTokens,mathSvg} from '../src/math/mixed-math.js';

const near=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);
const values=Object.fromEntries(sample.dataSets.find(data=>data.name==='Tray checked mathematical results').rows.map(([name,value])=>[name,value]));
// Independent geometric evaluation for the content checks: side lengths are
// obtained directly from the original sheet, not the authored expanded cubic.
const capacity=cut=>{
 const remainingLength=30-cut-cut,remainingWidth=20-cut-cut;
 return remainingLength*remainingWidth*cut;
};

test('the tray benchmark matches independently checked geometry and the feasible stationary point',()=>{
 near(values['Ideal cut'],3.9237478148923493,1e-12);
 near(values['Ideal volume'],1056.30589546119,1e-9);
 near(capacity(1),504);
 near(capacity(3),1008);
 near(capacity(3.9),1056.276);
 near(capacity(4),1056);
 near(capacity(5),1000);
 near(capacity(values['Ideal cut']),values['Ideal volume']);
 assert(values['Ideal cut']>0&&values['Ideal cut']<10);
 const otherRoot=(25+5*Math.sqrt(7))/3;
 assert(otherRoot>10,'the larger stationary root is outside the geometric domain');
 // A symmetric difference independently checks that the claimed stationary
 // cut has negligible first-order change, while neighbouring cuts lose volume.
 const h=1e-4;
 near((capacity(values['Ideal cut']+h)-capacity(values['Ideal cut']-h))/(2*h),0,2e-6);
 assert(capacity(values['Ideal cut']-0.01)<values['Ideal volume']);
 assert(capacity(values['Ideal cut']+0.01)<values['Ideal volume']);
 assert.equal(Math.round(values['Ideal cut']*10)/10,3.9,'3.9 cm is the nearest available 0.1 cm mark');
 assert(capacity(3.9)>capacity(4),'the nearest permitted mark also beats the whole-centimetre trial without error');
 near(100*(values['Ideal volume']-capacity(4))/values['Ideal volume'],0.02895898456160676,1e-10);
});

test('every displayed setting comparison uses the complete common-error interval and its actual height limit',()=>{
 const rows=sample.dataSets.find(data=>data.name==='Tray setting comparison').rows;
 for(const [nominal,low,high,claimedMinimum,fits] of rows){
  near(nominal-low,0.1);near(high-nominal,0.1);
  assert.equal(fits,high<=4?'Yes':'No');
  let minimum=Infinity;
  for(let k=0;k<=2000;k++)minimum=Math.min(minimum,capacity(low+(high-low)*k/2000));
  near(minimum,claimedMinimum,1e-8);
 }
 near(values['Original best setting'],3.9);
 near(values['Original guaranteed volume'],1055.488);
 near(100*values['Original guaranteed volume']/values['Ideal volume'],99.92257020767332,1e-10);
 // Check all permitted nominal marks. The proof is in the sample; this check
 // guards the authored discrete decision and capacity against arithmetic drift.
 const candidates=Array.from({length:38},(_,i)=>(i+2)/10);
 const scored=candidates.map(n=>({n,w:Math.min(capacity(n-0.1),capacity(n+0.1))}));
 scored.sort((a,b)=>b.w-a.w);
 near(scored[0].n,3.9);
 near(scored[0].w,values['Original guaranteed volume']);
 assert(4+0.1>4,'the whole-centimetre trial of 4.0 cm breaches the height limit at its positive error endpoint');
});

test('the 99 percent root is bracketed and continuous and ruler-grid tolerance bounds remain distinct',()=>{
 const target=0.99*values['Ideal volume'];
 near(values['99% target'],1045.742836506578,1e-9);
 assert(capacity(3.4841)<target);
 assert(capacity(3.4842)>target);
 near(capacity(values['Lower 99% cut']),target,1e-8);
 const continuous=values['Continuous maximum error'];
 const continuousSetting=values['Continuous threshold setting'];
 near(continuous,0.2579007023133175,1e-12);
 near(continuousSetting,3.7420992976866825,1e-12);
 near(continuousSetting+continuous,4,1e-12);
 near(capacity(continuousSetting-continuous),target,1e-8);
 assert(Math.abs(continuousSetting*10-Math.round(continuousSetting*10))>0.1);

 // Independently search tolerance feasibility over every nominal ruler mark,
 // using geometry and bisection rather than the author's closed-form limit.
 const perMark=Array.from({length:39},(_,i)=>(i+1)/10).map(n=>{
  let low=0,high=Math.min(n,4-n);
  if(capacity(n)<target)return {n,delta:-1};
  for(let i=0;i<60;i++){
   const mid=(low+high)/2;
   const acceptable=capacity(n-mid)>=target&&capacity(n+mid)>=target&&n+mid<=4;
   if(acceptable)low=mid;else high=mid;
  }
  return {n,delta:low};
 }).sort((a,b)=>b.delta-a.delta);
 near(perMark[0].n,3.7);
 near(perMark[0].delta,values['Grid maximum error'],1e-10);
 near(values['Grid maximum error'],0.215801404626635,1e-12);
 assert(values['Grid maximum error']<continuous);
 // Rounding this maximum upwards to 2.2 mm would contradict the guarantee.
 assert(capacity(3.7-0.21)>=target);
 assert(capacity(3.7-0.22)<target);
 near(values['Grid threshold setting'],3.7);
});

test('the authored native figures survive normalisation with valid data, dimensions and mathematical meaning',()=>{
 for(const figure of sample.figures){
  assert(figure.stage>=0&&figure.stage<sample.stages.length);
  const d=figure.tool==='geometry'?normalizeGeometryDraft(figure.draft):figure.tool==='graph'?normalizeGraphDraft(figure.draft):normalizeTableDraft(figure.draft);
  const result=figure.tool==='geometry'?geometryAnalysis(d):figure.tool==='graph'?analyseGraph(d):analyzeTable(d);
  assert.equal(result.ready,true,figure.id+': '+JSON.stringify(result.issues||result.problems));
 }
 const geometry=geometryAnalysis(sample.figures.find(f=>f.tool==='geometry').draft);
 near(geometry.area,600);
 assert.deepEqual(geometry.lengths,[30,20,30,20]);
 assert.equal(geometry.draft.guides.length,4);
 const full=sample.figures.find(f=>f.id==='figure-tray-full-volume').draft;
 const fullFunction=compileGraphFunction(full.expression);
 for(const cut of [0,1,3,3.9,4,5,10])near(fullFunction(cut),capacity(cut));
 assert.equal(full.xSymbol,'c');assert.equal(full.ySymbol,'V');
 const robust=sample.figures.find(f=>f.id==='figure-tray-guaranteed').draft;
 const robustFunction=compileGraphFunction(robust.expression);
 near(robustFunction(3.7),1050.624);
 near(robustFunction(3.8),1053.612);
 near(robustFunction(3.9),1055.488);
 assert.equal(robust.xSymbol,'n');assert.equal(robust.ySymbol,'W');
 const comparison=sample.figures.find(f=>f.id==='table-tray-settings').draft;
 const data=sample.dataSets.find(x=>x.name==='Tray setting comparison').rows;
 for(const [i,row] of comparison.matrix.entries()){
  near(Number(row[0]),data[i][0]);near(Number(row[2]),data[i][3]);near(Number(row[3]),data[i][2]);
  assert.equal(row[4],data[i][4]);
 }
});

test('the tray uses canonical fields and every authored TeX expression typesets without falling back to source',()=>{
 for(const key of Object.keys(sample.planning))assert(Object.hasOwn(PLANNING_FIELD_DEFAULTS,key),key);
 for(const key of Object.keys(sample.completion))assert(Object.hasOwn(C_FIELD_DEFAULTS,key),key);
 const strings=[sample.introduction,sample.dataNotes,...Object.values(sample.planning),...Object.values(sample.completion),
  ...sample.stages.flatMap(stage=>Object.values(stage)),...Object.values(sample.conclusion)];
 const seen=new Set();
 for(const answer of strings){
  if(typeof answer!=='string')continue;
  const tokens=mixedMathTokens(answer);
  assert.equal(tokens.map(token=>token.type==='math'?token.source:token.value).join(''),answer);
  for(const token of tokens){
   if(token.type!=='math'||seen.has(token.value))continue;
   seen.add(token.value);
   assert.doesNotThrow(()=>mathSvg(token.value,{display:token.display}),token.value);
  }
 }
 assert(seen.size>30,'the work should contain genuine authored mathematical expressions');
 assert.equal(sample.sources[0].fields.actualSourceType,'theoretical');
 assert.equal(sample.sources[0].fields.sourceCitation,'');
 assert.match(sample.completion.modelAssumptions,/same error changes every cut equally/);
 assert.match(sample.stages.at(-1).limitations,/not assigned probabilities/);
 assert.equal(sample.reviews.find(review=>review.id==='D07').status,'checked');
});
