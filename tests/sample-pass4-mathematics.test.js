import test from 'node:test';
import assert from 'node:assert/strict';
import {LEAF_AREA_SPEC,LEAF_UPPER,LEAF_LOWER,leafUpper,leafLower} from '../src/core/samples/leaf-area.js';
import {INACCESSIBLE_HEIGHT_SPEC,sightHeight,HEIGHT_RESULT,heightAngleInterval} from '../src/core/samples/inaccessible-height.js';
import {WATER_STATIONS_SPEC,WATER_EXISTING,WATER_POINTS,WATER_CANDIDATES,WATER_DISTANCE_ROWS,WATER_WEIGHT_THRESHOLD,waterWeightedDifference} from '../src/core/samples/water-stations.js';
import {REPAYMENT_PLANS_SPEC,LOAN_A,LOAN_B,repaymentSettlement} from '../src/core/samples/repayment-plans.js';
import {createIllustrativeSample} from '../src/core/illustrative-samples.js';
import {normalizeProjectState} from '../src/core/project-state.js';
import {collectProjectFigures} from '../src/handover/figure-report.js';
import {analyseGraph} from '../src/diagrams/graph-core.js';
import {analyzeTable} from '../src/diagrams/table-studio-core.js';
import {imageTraceChecks,traceCoordinates,tracedMeasurements,traceCalibration} from '../src/diagrams/image-tracer-core.js';
import {geometryAnalysis} from '../src/diagrams/geometry-core.js';
import {analyzeVoronoi} from '../src/diagrams/voronoi-core.js';
const near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t,`${a} differs from ${b} by more than ${t}`);
const sum=a=>a.reduce((s,x)=>s+x,0);
const trap=a=>a.slice(1).reduce((s,v,i)=>s+(v+a[i])/2,0);
const rad=x=>x*Math.PI/180;
const independentHeight=(a,b,L,e)=>e+L/(1/Math.tan(rad(b))-1/Math.tan(rad(a)));
const specs=[LEAF_AREA_SPEC,INACCESSIBLE_HEIGHT_SPEC,WATER_STATIONS_SPEC,REPAYMENT_PLANS_SPEC];

test('leaf reference embeds its original image and reproduces every coordinate and exact polygon area',()=>{
 const trace=LEAF_AREA_SPEC.figures.find(x=>x.id==='trace-leaf-reference').draft;
 assert(imageTraceChecks(trace).ready);assert(trace.imageSrc.startsWith('data:image/png;base64,'));
 near(traceCalibration(trace).unitsPerPixel,1/60);
 const coords=traceCoordinates(trace).map(p=>p.coordinate);
 assert.equal(coords.length,16);
 for(let i=0;i<9;i++){near(coords[i].x,i);near(coords[i].y,LEAF_UPPER[i]);}
 for(let i=9;i<16;i++){const x=16-i;near(coords[i].x,x);near(coords[i].y,LEAF_LOWER[x]);}
 near(tracedMeasurements(trace).area,19.8);
 near(trap(LEAF_UPPER.map((v,i)=>v-LEAF_LOWER[i])),19.8);
});
test('leaf pieces join with common first derivative and enclose the stated integral',()=>{
 near(leafUpper(0),0);near(leafUpper(8),0);near(leafUpper(3),2.1);
 near((leafUpper(3)-leafUpper(3-1e-5))/1e-5,0,3e-6);
 near((leafUpper(3+1e-5)-leafUpper(3))/1e-5,0,3e-6);
 for(let i=0;i<=800;i++)assert(leafUpper(i/100)>=leafLower(i/100)-1e-12);
 const integralLeft=2.1*3-(7/30)*(27/3),integralRight=2.1*5-(21/250)*(125/3);
 const lower=512/30-2*64/5;near(integralLeft+integralRight-lower,296/15);
 const graph=LEAF_AREA_SPEC.figures.find(x=>x.tool==='graph'),a=analyseGraph(graph.draft);
 assert(a.ready);for(let x=0;x<=8;x+=.125){near(a.models[0].predict(x),leafLower(x),1e-8);near(a.models[1].predict(x),leafUpper(x),1e-8);}
});
test('leaf near agreement decomposes into boundary and quadrature effects, not independent confirmation',()=>{
 const w=Array.from({length:9},(_,i)=>leafUpper(i)-leafLower(i)),T=trap(w),A=296/15;
 near(T,19.4133333333333);near(A-T,.32);near(19.8-T,.3866666666667);
 near(3/18+5*23/750,.32);near((19.8-A)/19.8*100,.3367003367,1e-8);
});
test('leaf scale and vertical-input extrema are attained and combined consistently in pixel units',()=>{
 const S=71280,change=7*60*6;
 near(S/3600,19.8);near(change/3600,.7);
 near((S-change)*(2/122)**2,18.478903520559,1e-10);
 near((S+change)*(2/118)**2,21.2008043665613,1e-10);
 for(const direction of [-1,1]){
  const widths=LEAF_UPPER.map((u,x)=>u-LEAF_LOWER[x]+(x>0&&x<8?direction*.1:0));
  near(trap(widths),19.8+direction*.7);
 }
});
test('height derivation satisfies both triangles and adds the instrument height only once',()=>{
 const q=HEIGHT_RESULT;
 near(q.x,19.55308334614831);near(q.H,19.10567532336468);near(q.z,q.H-1.5);
 near(q.z/q.x,Math.tan(rad(42)));near(q.z/(q.x+15),Math.tan(rad(27)));
 near(independentHeight(42,27,15,1.5),q.H);
 near(Math.atan(q.z/(q.x+25))/Math.PI*180,21.562037298424908);
 assert.throws(()=>sightHeight(27,42));assert.throws(()=>sightHeight(42,42));
});
test('height simultaneous bounds contain every endpoint combination and a dense internal grid',()=>{
 const low=independentHeight(42.5,26.5,14.9,1.48),high=independentHeight(41.5,27.5,15.1,1.52);
 near(low,17.77517304472337);near(high,20.61729874951881);
 for(const a of [41.5,42,42.5])for(const b of [26.5,27,27.5])for(const L of [14.9,15,15.1])for(const e of [1.48,1.5,1.52]){
  const value=independentHeight(a,b,L,e);assert(value>=low-1e-10&&value<=high+1e-10);
 }
 near(independentHeight(42.5,26.5,15,1.5),17.904536622204724);
 near(independentHeight(41.5,27.5,15,1.5),20.47082657236968);
});
test('height baseline comparison keeps the original mast fixed and updates the far angle',()=>{
 const expected=[[2,39.24373052312361,14.407805085510406,29.146237524415707],[15,27,17.904536622204724,20.47082657236968],[25,21.562037298424908,18.107175189058154,20.197218025333193],[35,17.88621762596383,18.14774077730738,20.134540013188854]];
 for(const [b,beta,lo,hi] of expected){const r=heightAngleInterval(b);near(r.beta,beta);near(r.low,lo);near(r.high,hi);near(independentHeight(42,beta,b,1.5),HEIGHT_RESULT.H);}
 const a=heightAngleInterval(15),b=heightAngleInterval(25);near((1-(b.high-b.low)/(a.high-a.low))*100,18.56,.02);
});
test('water candidate distance arrays are independent nearest-site calculations on the same six points',()=>{
 const sets=[WATER_EXISTING,...WATER_CANDIDATES.map(c=>[...WATER_EXISTING,c])];
 assert.equal(WATER_POINTS.length,6);
 for(let k=0;k<sets.length;k++)for(let i=0;i<6;i++){
  const [x,y]=WATER_POINTS[i];const expected=Math.sqrt(Math.min(...sets[k].map(([a,b])=>(x-a)**2+(y-b)**2)));
  near(WATER_DISTANCE_ROWS[k][i],expected);
 }
 near(Math.max(...WATER_DISTANCE_ROWS[0]),Math.sqrt(4100));
 near(Math.max(...WATER_DISTANCE_ROWS[2]),Math.sqrt(1700));
 for(const k of [1,3])near(Math.max(...WATER_DISTANCE_ROWS[k]),Math.sqrt(2600));
});
test('water Voronoi cells are clipped to the intended rectangle and sum to the correct area',()=>{
 const figures=WATER_STATIONS_SPEC.figures.filter(f=>f.tool==='voronoi');
 assert.equal(figures.length,2);
 for(const figure of figures){const a=analyzeVoronoi(figure.draft);assert(a.ready);assert.equal(figure.draft.regionMode,'manual');assert.equal(figure.draft.sites.length,figure.id.endsWith('before')?2:3);}
 // The after-addition central triangle has base 120 and height 60.
 near(.5*120*60,3600);near(3600+3000+3000,120*80);
 for(const [x,y] of [[0,80],[60,20]])near((x-20)**2+(y-20)**2,(x-60)**2+(y-60)**2);
 for(const [x,y] of [[60,20],[120,80]])near((x-100)**2+(y-20)**2,(x-60)**2+(y-60)**2);
});
test('water weighted threshold changes the mean choice without changing the original minimax result',()=>{
 const ds=WATER_DISTANCE_ROWS.slice(1),mean=(d,w)=>(w*(d[0]+d[1])+sum(d.slice(2)))/(2*w+4);
 near(WATER_WEIGHT_THRESHOLD,1.2185899815616108);
 near(mean(ds[0],WATER_WEIGHT_THRESHOLD),mean(ds[1],WATER_WEIGHT_THRESHOLD));
 near(mean(ds[0],4),23.756257020830404);near(mean(ds[1],4),33.6890970241085);near(mean(ds[2],4),39.311569868856516);
 assert(waterWeightedDifference(1)>0);assert(waterWeightedDifference(4)<0);
 for(let w=1;w<=10;w+=.125)assert(mean(ds[2],w)>=Math.min(mean(ds[0],w),mean(ds[1],w))-1e-9);
});
function independentLedger(rateNumerator,rateDenominator){
 let balance=1200000n,interestTotal=0n;const rows=[];
 while(balance>0n){const interest=(balance*BigInt(rateNumerator)+BigInt(rateDenominator)/2n)/BigInt(rateDenominator);
  const due=balance+interest,paid=due<30000n?due:30000n;balance=due-paid;interestTotal+=interest;rows.push([Number(interest),Number(paid),Number(balance)]);}
 return {rows,interest:Number(interestTotal)};
}
test('repayment ledgers match an independent BigInt half-up implementation cent for cent',()=>{
 for(const [ledger,n,d] of [[LOAN_A,6,1000],[LOAN_B,9,2000]]){
  const independent=independentLedger(n,d);assert.equal(ledger.months,independent.rows.length);
  assert.deepEqual(ledger.rows.map(r=>[r.interest,r.paid,r.balance]),independent.rows);
  assert.equal(ledger.interest,independent.interest);assert.equal(ledger.payments-ledger.interest,1200000);
  assert(ledger.rows.every(r=>r.paid<=30000&&r.balance>=0));assert.equal(ledger.rows.at(-1).balance,0);
 }
 assert.equal(LOAN_A.months,46);assert.equal(LOAN_B.months,45);
 assert.equal(LOAN_A.rows.at(-1).paid,26306);assert.equal(LOAN_B.rows.at(-1).paid,5991);
});
test('repayment full totals count the separate fee once and reproduce the exact fee threshold',()=>{
 assert.equal(LOAN_A.total,1376306);assert.equal(LOAN_B.total,1365991);
 assert.equal(LOAN_A.total-LOAN_B.total,10315);assert.equal(LOAN_A.payments-LOAN_B.payments,50315);
 assert.equal(LOAN_B.rows[0].opening,1200000,'the fee must not be financed');
 for(const [i,n] of [[.006,46],[.0045,45]])assert.equal(Math.ceil(Math.log(300/(300-12000*i))/Math.log(1+i)),n);
});
test('repayment early settlement uses payments to date plus the capped balance and crosses first at month 29',()=>{
 assert.equal(repaymentSettlement(LOAN_A,12),1277188);assert.equal(repaymentSettlement(LOAN_B,12),1297382);
 const differences=Array.from({length:46},(_,i)=>repaymentSettlement(LOAN_B,i+1)-repaymentSettlement(LOAN_A,i+1));
 assert.equal(differences.findIndex(d=>d<0)+1,29);
 assert(differences.slice(0,28).every(d=>d>0));assert(differences.slice(28).every(d=>d<0));
 assert.equal(repaymentSettlement(LOAN_B,46),LOAN_B.total);assert.equal(differences.at(-1),-10315);
 for(let i=1;i<differences.length;i++)assert(differences[i]<=differences[i-1]);
});
test('all new native figures validate and their complete data and ownership survive JSON restoration',()=>{
 const checks={graph:analyseGraph,table:analyzeTable,geometry:geometryAnalysis,voronoi:analyzeVoronoi,trace:imageTraceChecks};
 for(const spec of specs){
  for(const figure of spec.figures){const result=checks[figure.tool](figure.draft);assert(result.ready,figure.id+JSON.stringify(result.problems||result.errors||result.issues));}
  const state=createIllustrativeSample(spec.id),restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.entries.length,spec.stages.length);assert.equal(collectProjectFigures(restored).length,spec.figures.length);
  assert.deepEqual(restored.dataShelf.map(d=>d.matrix),state.dataShelf.map(d=>d.matrix));
  assert.equal(restored.completion.fields.mainConclusion,spec.conclusion.mainConclusion);
  assert.equal(restored.teacher.feedbackStatus,'not-requested');assert.equal(restored.completion.review.records['final-D16'].status,'unchecked');
  for(const figure of spec.figures)assert.equal(restored.entries.filter(entry=>entry.figureRefs.includes(figure.tool+':'+figure.id)).length,1);
 }
});

test('every published sample is assigned exactly once in both browser matrices',async()=>{
 const {readFileSync}=await import('node:fs');
 const {SAMPLE_CHOICES}=await import('../src/core/illustrative-samples.js');
 const expected=SAMPLE_CHOICES.map(s=>s.id).sort();
 for(const file of ['illustrative-samples-browser.yml','conformance-browser.yml']){
  const yaml=readFileSync(new URL('../.github/workflows/'+file,import.meta.url),'utf8');
  const ids=[...yaml.matchAll(/^\s+samples:\s*([a-z0-9,-]+)\s*$/gm)].flatMap(m=>m[1].split(','));
  assert.equal(new Set(ids).size,ids.length,file+' duplicated sample');
  assert.deepEqual(ids.sort(),expected,file+' omitted sample');
 }
});
