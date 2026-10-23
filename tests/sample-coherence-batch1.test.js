import test from 'node:test';
import assert from 'node:assert/strict';
import {BALL_CASES} from '../src/core/samples/ball-clearance.js';
import {STOPPING_CASES} from '../src/core/samples/stopping-distance.js';
import {fitPolynomialLeastSquares} from '../src/diagrams/graph-models.js';

const sum=values=>values.reduce((total,value)=>total+value,0);
const near=(actual,expected,tolerance=1e-8)=>
 assert(Math.abs(actual-expected)<=tolerance,
  `expected ${actual} to equal ${expected} within ${tolerance}`);
const ball=BALL_CASES.map(([x,y])=>({x:Number(x),y:Number(y)}));
const stoppingFit=STOPPING_CASES.filter(row=>row[2]==='fit')
 .map(([v,s])=>({v:Number(v),s:Number(s)}));

test('the ball completed-square identity agrees with direct errors away from its minimum',()=>{
 const rows=ball.map(({x,y})=>({u:(x-300)/100,y}))
  .map(row=>({...row,q:row.u**2-4}));
 near(sum(rows.map(row=>row.u)),0);
 near(sum(rows.map(row=>row.q)),0);
 near(sum(rows.map(row=>row.u*row.q)),0);
 near(sum(rows.map(row=>row.u**2)),28);
 near(sum(rows.map(row=>row.q**2)),84);
 near(sum(rows.map(row=>row.y)),1540);
 near(sum(rows.map(row=>row.u*row.y)),-2);
 near(sum(rows.map(row=>row.q*row.y)),-1680);

 // Evaluate raw residuals, not a rearranged normal-equation implementation.
 for(const [alpha,beta,gamma] of [[220,-1/14,-20],[225,-1/14,-20],
  [220,0.3,-20],[220,-1/14,-19],[217,0.2,-21]]){
  const direct=sum(rows.map(({u,q,y})=>(y-alpha-beta*u-gamma*q)**2));
  const completed=181/7+7*(alpha-220)**2+28*(beta+1/14)**2+84*(gamma+20)**2;
  near(direct,completed);
  assert(direct>=181/7-1e-10);
 }
});

test('coherent ball-height shifts refit only the intercept and common calibration preserves the gap sign',()=>{
 const fitted=fitPolynomialLeastSquares(ball,2);
 assert(fitted.ok);
 for(const shift of [-3,3]){
  const changed=fitPolynomialLeastSquares(ball.map(point=>({...point,y:point.y+shift})),2);
  assert(changed.ok);
  near(changed.coefficients[0]-fitted.coefficients[0],shift);
  near(changed.coefficients[1],fitted.coefficients[1]);
  near(changed.coefficients[2],fitted.coefficients[2]);
  for(const x of [0,300,440,450,460,600])near(changed.predict(x),fitted.predict(x)+shift);
 }
 const nominal=fitted.predict(450)-248;
 for(const scale of [98,100,102]){
  const metres=fitPolynomialLeastSquares(ball.map(({x,y})=>({x:x/scale,y:y/scale})),2);
  assert(metres.ok);
  const metreGap=metres.predict(450/scale)-248/scale;
  near(metreGap,nominal/scale,1e-12);
  assert(metreGap>0);
 }
 // A horizontal change alone is insufficient here; the combined scenario reverses the decision.
 const horizontalOnly=fitted.predict(460)-248;
 near(horizontalOnly,24/35);
 assert(horizontalOnly>0);
 assert(fitted.predict(460)-3-250<0);
 const [,linear,quadratic]=fitted.coefficients;
 const slopeAtBarrier=linear+2*quadratic*450;
 for(const [dx,dy,db] of [[10,-3,2],[-10,3,-2],[4,1,-1],[0,-3,2]]){
  const changedGap=fitted.predict(450+dx)+dy-(248+db);
  near(changedGap-nominal,slopeAtBarrier*dx+quadratic*dx*dx+dy-db);
 }
});

test('eliminating the stopping linear coefficient gives the stated global least-squares minimum',()=>{
 const A=sum(stoppingFit.map(({v})=>v**2));
 const B=sum(stoppingFit.map(({v})=>v**3));
 const C=sum(stoppingFit.map(({v})=>v**4));
 const D=sum(stoppingFit.map(({v,s})=>v*s));
 const E=sum(stoppingFit.map(({v,s})=>v*v*s));
 const S=sum(stoppingFit.map(({s})=>s*s));
 near(A,25025);near(B,1373625);near(C,79743125);
 near(D,20760.75);near(E,1165498.75);near(S,17379.2825);
 const K=C-B*B/A,L=E-B*D/A;
 assert(A>0&&K>0);
 near(K,395367500/91,1e-7);near(L,2360440/91);
 const bestB=L/K,bestA=(D-B*bestB)/A,minimum=S-D*D/A-L*L/K;
 near(minimum,5117892/3953675);

 // The identity must hold for arbitrary candidates, not just the fitted coefficients.
 for(const [a,b] of [[bestA,bestB],[0,0],[0.4,0.007],[0.8,0],[-0.3,0.012]]){
  const direct=sum(stoppingFit.map(({v,s})=>(s-a*v-b*v*v)**2));
  const completed=A*(a-(D-B*b)/A)**2+K*(b-bestB)**2+minimum;
  near(direct,completed,1e-7);
  assert(direct>=minimum-1e-8);
 }
});

test('the stopping parameter interpretation and reaction scenario use consistent distance and time units',()=>{
 // Solve the two coefficient equations by a determinant, independently of the printed square completion.
 const A=sum(stoppingFit.map(({v})=>v**2)),B=sum(stoppingFit.map(({v})=>v**3));
 const C=sum(stoppingFit.map(({v})=>v**4));
 const D=sum(stoppingFit.map(({v,s})=>v*s)),E=sum(stoppingFit.map(({v,s})=>v*v*s));
 const determinant=A*C-B*B,a=(D*C-B*E)/determinant,b=(A*E-B*D)/determinant;
 const tau=3.6*a,deceleration=1/(2*b*3.6**2);
 near(tau,1.8068152035764193);near(deceleration,6.462090022031883);
 for(const speedKmh of [0,20,60,85]){
  const speedMps=speedKmh*1000/3600;
  const brakingTime=speedMps/deceleration;
  const brakingDistance=(speedMps/2)*brakingTime;
  const modelDistance=a*speedKmh+b*speedKmh**2;
  near(speedMps*tau+brakingDistance,modelDistance);
  for(const changeSeconds of [-0.25,0.25])
   near(speedMps*(tau+changeSeconds)+brakingDistance-modelDistance,speedMps*changeSeconds);
 }
 const at60=a*60+b*60**2,change=60/3.6*0.25;
 near(at60-change,47.43979441068542);
 near(at60+change,55.77312774401876);
});
