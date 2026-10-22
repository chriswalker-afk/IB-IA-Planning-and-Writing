import test from 'node:test';
import assert from 'node:assert/strict';
import {STOPPING_CASES,STOPPING_DISTANCE_SPEC} from '../src/core/samples/stopping-distance.js';
import {COOLING_CASES,DRINK_COOLING_SPEC} from '../src/core/samples/drink-cooling.js';
import {TIDE_CASES,TIDE_CYCLES_SPEC} from '../src/core/samples/tide-cycles.js';
import {BALL_CASES,BALL_CLEARANCE_SPEC} from '../src/core/samples/ball-clearance.js';
import {createIllustrativeSample} from '../src/core/illustrative-samples.js';
import {normalizeProjectState} from '../src/core/project-state.js';
import {analyseGraph} from '../src/diagrams/graph-core.js';
import {analyzeTable} from '../src/diagrams/table-studio-core.js';

const near=(actual,expected,tol=0.0001)=>
 assert(Math.abs(actual-expected)<=tol,'expected '+actual+' to equal '+expected+' within '+tol);
const rmse=values=>Math.sqrt(values.reduce((sum,n)=>sum+n*n,0)/values.length);
function solve(A,b){
 const m=A.map((row,i)=>[...row,b[i]]),n=b.length;
 for(let col=0;col<n;col++){
  let pivot=col;for(let j=col+1;j<n;j++)if(Math.abs(m[j][col])>Math.abs(m[pivot][col]))pivot=j;
  assert(Math.abs(m[pivot][col])>1e-15,'singular normal matrix');
  [m[pivot],m[col]]=[m[col],m[pivot]];
  const v=m[col][col];for(let j=col;j<=n;j++)m[col][j]/=v;
  for(let i=0;i<n;i++)if(i!==col){
   const k=m[i][col];for(let j=col;j<=n;j++)m[i][j]-=k*m[col][j];
  }
 }
 return m.map(row=>row[n]);
}
function leastSquares(rows,features){
 const dim=features(rows[0][0]).length;
 const A=Array.from({length:dim},()=>Array(dim).fill(0)),b=Array(dim).fill(0);
 for(const [x,y] of rows){
  const f=features(x);for(let i=0;i<dim;i++){
   b[i]+=f[i]*y;for(let j=0;j<dim;j++)A[i][j]+=f[i]*f[j];
  }
 }
 return solve(A,b);
}
const rowToNumber=row=>row.map(Number);
const line=(v,c)=>c[0]+c[1]*v;
const model=(v,c)=>c[0]*v+c[1]*v*v;

test('stopping-distance line and constrained quadratic use only eleven fitting cases',()=>{
 const rows=STOPPING_CASES.map(row=>[Number(row[0]),Number(row[1]),row[2]]);
 assert.equal(rows.length,14);assert.equal(rows.filter(row=>row[2]==='reserve').length,3);
 const fit=rows.filter(row=>row[2]==='fit'),check=rows.filter(row=>row[2]==='reserve');
 const lineCoefficients=leastSquares(fit,v=>[1,v]);
 const quadratic=leastSquares(fit,v=>[v,v*v]);
 near(lineCoefficients[0],-10.590909090909,1e-8);
 near(lineCoefficients[1],1.0390909090909,1e-8);
 near(quadratic[0],0.50189311,1e-7);
 near(quadratic[1],0.0059702429,1e-8);
 near(rmse(fit.map(([v,s])=>s-line(v,lineCoefficients))),1.3674492149,1e-8);
 near(rmse(fit.map(([v,s])=>s-model(v,quadratic))),0.343043135,1e-8);
 near(rmse(check.map(([v,s])=>s-line(v,lineCoefficients))),6.23241548,1e-8);
 near(rmse(check.map(([v,s])=>s-model(v,quadratic))),0.3907457077,1e-8);
 near(60/3.6*0.25,4.16666667,1e-7);
 assert(STOPPING_DISTANCE_SPEC.stages[3].result.includes('6.2324'));
});
test('cooling transformation, reserved checks and ambient refits reproduce the student estimates',()=>{
 const rows=COOLING_CASES.map(row=>[Number(row[0]),Number(row[1]),row[2]]);
 assert.equal(rows.length,16);
 const fit=rows.filter(row=>row[2]==='fit'),held=rows.filter(row=>row[2]==='reserve');
 assert.equal(fit.length,11);assert.equal(held.length,5);
 const coeff=leastSquares(fit.map(([t,T])=>[t,Math.log(T-26)]),t=>[1,t]);
 const B=Math.exp(coeff[0]),k=-coeff[1],P=t=>26+B*Math.exp(-k*t);
 near(B,57.9928929298,1e-8);near(k,.03998156537,1e-10);
 near(Math.log(2)/k,17.33666939,1e-8);
 near(rmse(fit.map(([t,T])=>T-P(t))),.1427072415,1e-9);
 near(rmse(held.map(([t,T])=>T-P(t))),.1658179521,1e-9);
 near(Math.log(B/(50-26))/k,22.0668357745,1e-9);
 near(22+2*(50.2-50)/(50.2-48.1),22.19047619,1e-7);
 for(const [A,expected] of [[25,22.00702578],[27,22.13088264]]){
  const [intercept,slope]=leastSquares(fit.map(([t,T])=>[t,Math.log(T-A)]),t=>[1,t]);
  near(Math.log(Math.exp(intercept)/(50-A))/-slope,expected,1e-7);
 }
});
test('tide fit, fourth-cycle residuals, and conservative crossing windows are independently checked',()=>{
 const rows=TIDE_CASES.map(row=>[Number(row[0]),Number(row[1]),row[2]]);
 assert.equal(rows.length,49);const fit=rows.filter(row=>row[2]==='fit'),held=rows.filter(row=>row[2]==='reserve');
 assert.equal(fit.length,36);assert.equal(held.length,13);
 const freq=Math.PI/6,f=t=>[1,Math.cos(freq*t),Math.sin(freq*t)];
 const c=leastSquares(fit,f),P=t=>c[0]+c[1]*Math.cos(freq*t)+c[2]*Math.sin(freq*t);
 near(c[0],2.505,1e-10);near(c[1],.50999267,1e-7);near(c[2],.91607295,1e-7);
 near(rmse(fit.map(([t,h])=>h-P(t))),.1219850726,1e-9);
 near(rmse(held.map(([t,h])=>h-P(t))),.1601151571,1e-9);
 const centre=36+Math.atan2(c[2],c[1])/freq,amp=Math.hypot(c[1],c[2]);
 const crossing=(verticalError=0)=>{const span=Math.acos((3.2-verticalError-c[0])/amp)/freq;return [centre-span,centre+span];};
 const nominal=crossing(),guarantee=crossing(-.24),possible=crossing(.24);
 near(nominal[0],36.413798,1e-6);near(nominal[1],39.645842,1e-6);
 near(guarantee[0],37.133073,1e-6);near(guarantee[1],38.926567,1e-6);
 near(possible[0],35.887140,1e-6);near(possible[1],40.172501,1e-6);
 const omitted=Math.hypot(.5-c[1],Math.sqrt(3)/2-c[2]);
 assert(.18+omitted+Math.abs(c[0]-2.5)+.0005<.24);
 assert(TIDE_CYCLES_SPEC.conclusion.conclusionExtension.includes('No navigational conclusion'));
});
test('ball clearance and explicit adverse counterexample use the identical quadratic',()=>{
 const cases=BALL_CASES.map(row=>rowToNumber(row));
 const c=leastSquares(cases,x=>[1,x,x*x]),P=x=>c[0]+c[1]*x+c[2]*x*x;
 near(c[0],120.214285714,1e-7);near(c[1],1.199285714,1e-8);near(c[2],-.002,1e-10);
 near(rmse(cases.map(([x,y])=>y-P(x))),1.9219462924,1e-9);
 near(P(450)-248,6.892857142857,1e-9);
 near(P(460)-3-250,-4.3142857142857,1e-9);
 near(P(440)+3-246,17.7,1e-9);
 near(-c[1]/(2*c[2]),299.8214285714,1e-8);
 near((P(450)-248)/100,.0689285714,1e-9);
 assert(BALL_CLEARANCE_SPEC.stages[2].result.includes('ball.s radius')===false);
});
test('every new investigation uses valid native diagrams and survives a full JSON project backup',()=>{
 const specs=[STOPPING_DISTANCE_SPEC,DRINK_COOLING_SPEC,TIDE_CYCLES_SPEC,BALL_CLEARANCE_SPEC];
 const expectedFigures=[4,5,5,5],expectedSources=[2,3,3,3];
 for(const [i,spec] of specs.entries()){
  assert.equal(spec.figures.length,expectedFigures[i]);assert.equal(spec.dataSets.length,expectedSources[i]);
  assert.equal(spec.stages.length,4);
  for(const item of spec.figures){
   assert(item.stage>=0&&item.stage<4);
   const result=item.tool==='graph'?analyseGraph(item.draft):analyzeTable(item.draft);
   assert(result.ready,spec.id+' '+item.id+' invalid '+JSON.stringify(result.problems||result.errors));
  }
  const state=createIllustrativeSample(spec.id);
  const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.entries.length,4);assert.equal(restored.dataShelf.length,spec.dataSets.length);
  assert(restored.entries.every(entry=>entry.status==='completed'&&entry.result));
  assert.equal(restored.completion.fields.draftComplete,'ready');
  assert.equal(restored.completion.fields.mainConclusion,spec.conclusion.mainConclusion);
  assert.equal(restored.teacher.feedbackStatus,'not-requested');
  assert(restored.entries.every(entry=>entry.figureRefs.length>0));
 }
});
