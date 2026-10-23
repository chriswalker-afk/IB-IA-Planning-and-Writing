import test from 'node:test';
import assert from 'node:assert/strict';
import {COOLING_CASES} from '../src/core/samples/drink-cooling.js';
import {TIDE_CASES,TIDE_CYCLES_SPEC} from '../src/core/samples/tide-cycles.js';
import {fitPolynomialLeastSquares} from '../src/diagrams/graph-models.js';
import {fitSinusoidal} from '../src/diagrams/graph-advanced-fits.js';

const sum=values=>values.reduce((total,value)=>total+value,0);
const near=(actual,expected,tolerance=1e-8)=>
 assert(Math.abs(actual-expected)<=tolerance,
  `expected ${actual} to equal ${expected} within ${tolerance}`);
const fitting=rows=>rows.filter(row=>row[2]==='fit').map(([x,y])=>({x:Number(x),y:Number(y)}));
const coolingFit=fitting(COOLING_CASES),tideFit=fitting(TIDE_CASES);

function coolingModel(){
 const points=coolingFit.map(({x,y})=>({x,y:Math.log(y-26)}));
 // The graph fitter uses QR, independently of the printed completed-square argument.
 const fit=fitPolynomialLeastSquares(points,1);
 assert(fit.ok);
 const [c,slope]=fit.coefficients,B=Math.exp(c),k=-slope;
 return {points,c,slope,B,k,predict:t=>26+B*Math.exp(-k*t)};
}

function tideModel(){
 const fit=fitSinusoidal(tideFit,'12');
 assert(fit.ok);
 const c=fit.parameters.offset,a=fit.predict(0)-c,b=fit.predict(3)-c;
 return {fit,c,a,b,amplitude:Math.hypot(a,b),phase:Math.atan2(b,a),omega:Math.PI/6};
}

test('the cooling log-error identity explains its least-squares minimum and relative-error meaning',()=>{
 const {points,c,slope}=coolingModel();
 const meanTime=sum(points.map(point=>point.x))/points.length;
 const meanLog=sum(points.map(point=>point.y))/points.length;
 const centredTimeSquares=sum(points.map(point=>(point.x-meanTime)**2));
 near(meanTime,10);near(centredTimeSquares,440);
 near(sum(points.map(point=>(point.x-meanTime)*point.y)),-17.591888762246434);
 const minimum=sum(points.map(({x,y})=>(y-c-slope*x)**2));
 near(minimum,0.00015270256527389483,1e-12);

 for(const [intercept,gradient] of [[c,slope],[c+0.3,slope],
  [c,slope+0.02],[c-0.4,slope+0.035]]){
  const direct=sum(points.map(({x,y})=>(y-intercept-gradient*x)**2));
  const completed=minimum+points.length*(intercept+gradient*meanTime-meanLog)**2+
   centredTimeSquares*(gradient-slope)**2;
  near(direct,completed,1e-10);
  assert(direct>=minimum-1e-12);
  for(const {x,y:temperature} of coolingFit){
   const excess=temperature-26,predictedExcess=Math.exp(intercept+gradient*x);
   near(Math.log(excess)-Math.log(predictedExcess),Math.log(excess/predictedExcess),1e-12);
  }
 }
});

test('cooling target shifts invert the fixed exponential exactly without becoming an uncertainty bound',()=>{
 const {B,k,predict}=coolingModel();
 const reserved=COOLING_CASES.filter(row=>row[2]==='reserve');
 const largestResidual=Math.max(...reserved.map(([t,temperature])=>Math.abs(temperature-predict(t))));
 near(largestResidual,0.23167863159645208);
 assert.equal(reserved.find(([t,temperature])=>Math.abs(temperature-predict(t))===largestResidual)[0],28);
 const crossing=target=>Math.log(B/(target-26))/k,nominal=crossing(50);
 for(const change of [-largestResidual,largestResidual,-2,2]){
  const changedTarget=50+change,changedTime=crossing(changedTarget);
  near(predict(changedTime),changedTarget,1e-10);
  near(changedTime-nominal,-Math.log1p(change/24)/k,1e-12);
 }
 near(crossing(50-largestResidual)-nominal,0.24261609409032303);
 near(crossing(50+largestResidual)-nominal,-0.24028526774961634);
 // Exact inversion is asymmetric; dividing by a local rate would only approximate these changes.
 assert(Math.abs(crossing(50-largestResidual)-nominal)>
  Math.abs(crossing(50+largestResidual)-nominal));
});

test('the tide fixed-frequency square identity and amplitude-phase expression reproduce the fitted curve',()=>{
 const {fit,c,a,b,amplitude,phase,omega}=tideModel();
 const rows=tideFit.map(({x,y})=>({h:y,C:Math.cos(omega*x),S:Math.sin(omega*x)}));
 near(sum(rows.map(row=>row.C)),0);
 near(sum(rows.map(row=>row.S)),0);
 near(sum(rows.map(row=>row.C*row.S)),0);
 near(sum(rows.map(row=>row.C**2)),18);
 near(sum(rows.map(row=>row.S**2)),18);
 near(sum(rows.map(row=>row.h)),90.18);
 const minimum=sum(tideFit.map(({x,y})=>(y-fit.predict(x))**2));
 near(minimum,0.5356928860648235);
 for(const [offset,cosine,sine] of [[c,a,b],[c+0.3,a,b],
  [c,a-0.2,b],[c,a,b+0.1],[c-0.4,a+0.2,b-0.3]]){
  const direct=sum(rows.map(({h,C,S})=>(h-offset-cosine*C-sine*S)**2));
  near(direct,minimum+36*(offset-c)**2+18*(cosine-a)**2+18*(sine-b)**2);
  assert(direct>=minimum-1e-10);
 }
 assert(a>0&&b>0);
 near(phase,Math.atan(b/a));
 const timeShift=phase/omega;
 for(const t of [0,0.37,2,14.2,26.8,35.9,38.1,48])
  near(c+amplitude*Math.cos(omega*(t-timeShift)),fit.predict(t),1e-12);
});

test('the tide continuous bound yields periodic windows with durations rounded after subtraction',()=>{
 const {fit,c,a,b,amplitude,phase,omega}=tideModel();
 const source=t=>2.5+Math.cos(Math.PI*(t-2)/6)+0.18*Math.cos(Math.PI*t/12);
 const cosineDifference=0.5-a,sineDifference=Math.sqrt(3)/2-b;
 const mismatchAmplitude=Math.hypot(cosineDifference,sineDifference);
 const continuousBound=Math.abs(2.5-c)+mismatchAmplitude+0.18;
 near(continuousBound,0.2360353842850373);
 assert(continuousBound+0.0005<0.24);
 // The all-time bound comes from the component amplitudes and triangle inequality,
 // not from treating sampled residuals as a continuous error maximum.
 for(const t of [0,1.25,13.36,22.7,35.99,38.4,47.95,48]){
  const decomposed=2.5-c+cosineDifference*Math.cos(omega*t)+
   sineDifference*Math.sin(omega*t)+0.18*Math.cos(Math.PI*t/12);
  near(source(t)-fit.predict(t),decomposed,1e-12);
 }
 for(const [t,h] of TIDE_CASES){
  assert(Math.abs(h-source(t))<=0.0005+1e-12);
  assert(Math.abs(h-fit.predict(t))<=continuousBound+0.0005);
 }

 const crest=phase/omega+36;
 const window=level=>{
  const halfWidth=Math.acos((level-c)/amplitude)/omega;
  return [crest-halfWidth,crest+halfWidth];
 };
 const nominal=window(3.2),guaranteed=window(3.2+0.24),possible=window(3.2-0.24);
 for(const [index,times] of [nominal,guaranteed,possible].entries()){
  const table=TIDE_CYCLES_SPEC.figures.find(figure=>figure.id==='table-p3-tide-windows');
  assert(table);
  const displayed=table.draft.matrix[index].slice(1).map(Number);
  const exact=[...times,times[1]-times[0]];
  assert.deepEqual(displayed,exact.map(value=>Number(value.toFixed(3))));
 }
 near(guaranteed[1]-guaranteed[0],1.79349362785857);
 near(possible[1]-possible[0],4.28536087148217);

 // Every repetition matters when interpreting the bound over the entire reserved domain.
 const possibleInReserved=[-12,0,12].map(shift=>[
  Math.max(36,possible[0]+shift),Math.min(48,possible[1]+shift)
 ]).filter(([start,end])=>start<=end);
 assert.equal(possibleInReserved.length,2);
 near(possibleInReserved[0][0],36);near(possibleInReserved[0][1],40.17250057631933);
 near(possibleInReserved[1][0],47.88713970483716);near(possibleInReserved[1][1],48);
 assert(fit.predict(48)<3.2&&fit.predict(48)+0.24>3.2);
});
