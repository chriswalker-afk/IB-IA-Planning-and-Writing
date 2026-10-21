/**
 * Advanced regression engines for student-selected IA modelling.
 * All fits use the student's actual pairs, never silently drop observations,
 * and report their objective function explicitly. No data leaves the browser.
 */
const fail=error=>({ok:false,error});
const label=n=>{
 if(!Number.isFinite(n))return "undefined";
 if(n===0)return "0";
 return String(Number(n.toPrecision(6)));
};
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);

/** Re-orthogonalised QR. First column MUST be the intercept (all ones). */
function leastSquares(columns,values){
 const n=values.length,k=columns.length,q=[],r=Array.from({length:k},()=>Array(k).fill(0));
 if(n<k)return null;
 for(let j=0;j<k;j++){
  let v=columns[j].slice();
  for(let repeat=0;repeat<2;repeat++)for(let i=0;i<j;i++){
   const value=dot(q[i],v);r[i][j]+=value;
   v=v.map((x,h)=>x-value*q[i][h]);
  }
  const norm=Math.hypot(...v);
  if(!Number.isFinite(norm)||norm<1e-10*Math.sqrt(n))return null;
  q.push(v.map(x=>x/norm));r[j][j]=norm;
 }
 const baseline=values[0],rhs=q.map(col=>dot(col,values.map(y=>y-baseline)));
 const coef=Array(k).fill(0);
 for(let j=k-1;j>=0;j--){
  let right=0;
  for(let i=j+1;i<k;i++)right+=r[j][i]*coef[i];
  coef[j]=(rhs[j]-right)/r[j][j];
 }
 coef[0]+=baseline;
 return coef.every(Number.isFinite)?coef:null;
}
const standardized=values=>{
 const first=values[0],mean=first+values.reduce((acc,v)=>acc+(v-first),0)/values.length;
 const scale=Math.max(...values.map(v=>Math.abs(v-mean)));
 if(!Number.isFinite(scale)||!(scale>0))return null;
 return {mean,scale,t:values.map(v=>(v-mean)/scale)};
};
const predictorOK=(points,predict)=>points.every(p=>{
 let y;try{y=predict(p.x);}catch{return false;}
 return Number.isFinite(y);
});

/** y = a + b ln(x), OLS of untransformed y against ln(x). */
export function fitLogarithmic(points){
 if(points.length<3)return fail("A logarithmic regression needs at least three paired observations.");
 if(points.some(p=>!(p.x>0)))return fail("Logarithmic fitting requires every observed x-value to be positive. No measurements have been discarded.");
 const data=standardized(points.map(p=>Math.log(p.x)));
 if(!data)return fail("The ln(x) values do not have sufficient variation to fit a logarithmic model.");
 const coef=leastSquares([points.map(()=>1),data.t],points.map(p=>p.y));
 if(!coef)return fail("The logarithmic relationship cannot be fitted reliably with these x-values.");
 const predict=x=>x>0?coef[0]+coef[1]*(Math.log(x)-data.mean)/data.scale:NaN;
 const slope=coef[1]/data.scale,intercept=coef[0]-slope*data.mean;
 const equation=Math.abs(data.mean)>100*data.scale || !Number.isFinite(intercept)?
  "y ≈ "+label(coef[0])+" + "+label(coef[1])+"t, t = (ln(x) − "+label(data.mean)+") / "+label(data.scale):
  "y ≈ "+label(intercept)+" + "+label(slope)+" ln(x)";
 if(!predictorOK(points,predict))return fail("The logarithmic predictions exceed the reliable numeric range.");
 return {ok:true,n:points.length,predict,equation,method:"Ordinary least squares of y against ln(x)",
  parameters:{lnMean:data.mean,lnScale:data.scale,centeredIntercept:coef[0],
   centeredSlope:coef[1],slope,intercept},
  note:"Requires x > 0. The fit minimises squared errors in the original y-units, not ln(y).",
  caution:"A logarithmic model is undefined for x ≤ 0. Interpret the model only on the observed positive x-range."};
}

/** Two transparent objectives for positive exponential and power families.
 * transformed: minimise sum (ln y - ln yhat)^2
 * original: minimise sum (y - yhat)^2 by variable projection and 1D search.
 */
export function fitPositiveGrowth(points,type,method="transformed"){
 const power=type==="power";
 const family=power?"Power":"Exponential";
 if(points.length<3)return fail(family+" regression needs at least three paired observations.");
 if(power&&points.some(p=>!(p.x>0)))
  return fail("Power regression requires every observed x-value to be positive. No rows have been removed.");
 if(points.some(p=>!(p.y>0)))
  return fail(family+" regression uses a positive-amplitude model and needs all observed y-values > 0. Try a student-entered equation for negative or zero responses.");
 const u=points.map(p=>power?Math.log(p.x):p.x),std=standardized(u);
 if(!std)return fail("The x-values provide insufficient variation for "+family.toLowerCase()+" regression.");
 const logValues=points.map(p=>Math.log(p.y));
 const logCoeffs=leastSquares([u.map(()=>1),std.t],logValues);
 if(!logCoeffs)return fail("The transformed relationship is numerically ill-conditioned.");
 let logA=logCoeffs[0],rate=logCoeffs[1],atBound=false;
 if(method==="original"){
  const yScale=Math.max(...points.map(p=>p.y));
  const scaledY=points.map(p=>p.y/yScale);
  const objective=k=>{
   const phases=std.t.map(t=>k*t),peak=Math.max(...phases);
   const basis=phases.map(p=>Math.exp(p-peak));
   const den=dot(basis,basis);
   if(!(den>0))return {cost:Infinity};
   const amplitude=dot(scaledY,basis)/den;
   if(!(amplitude>0)||!Number.isFinite(amplitude))return {cost:Infinity};
   const cost=scaledY.reduce((sum,y,i)=>sum+(y-amplitude*basis[i])**2,0);
   return {cost,rate:k,logA:Math.log(yScale)+Math.log(amplitude)-peak};
  };
  // Broad bounded search first: nonlinear objectives need not be unimodal.
  const radius=Math.min(90,Math.max(12,Math.abs(rate)*1.7+6)),steps=120;
  let best={cost:Infinity},bestIndex=0;
  for(let i=0;i<=steps;i++){
   const candidate=objective(-radius+(2*radius*i)/steps);
   if(candidate.cost<best.cost){best=candidate;bestIndex=i;}
  }
  if(!Number.isFinite(best.cost))return fail("Original-scale least squares failed for this dataset.");
  const step=2*radius/steps;
  let lo=Math.max(-radius,best.rate-step),hi=Math.min(radius,best.rate+step);
  const golden=(Math.sqrt(5)-1)/2;
  let c=hi-golden*(hi-lo),d=lo+golden*(hi-lo),fc=objective(c),fd=objective(d);
  for(let i=0;i<46;i++){
   if(fc.cost<=fd.cost){hi=d;d=c;fd=fc;c=hi-golden*(hi-lo);fc=objective(c);}
   else{lo=c;c=d;fc=fd;d=lo+golden*(hi-lo);fd=objective(d);}
  }
  const refined=objective((lo+hi)/2);
  if(refined.cost<best.cost)best=refined;
  rate=best.rate;logA=best.logA;
  atBound=Math.abs(rate)>=radius-step*.3;
 }
 const transform=x=>{
  if(power&&!(x>0))return NaN;
  const uValue=power?Math.log(x):x;
  const expArg=logA+rate*(uValue-std.mean)/std.scale;
  return expArg>709?Infinity:Math.exp(expArg);
 };
 if(!predictorOK(points,transform))
  return fail("The chosen "+family.toLowerCase()+" model cannot generate finite predictions for every observed measurement.");
 const slope=rate/std.scale,rawLogAmplitude=logA-slope*std.mean;
 const rawAmplitude=Math.exp(rawLogAmplitude);
 let equation;
 if(Number.isFinite(rawAmplitude)&&rawAmplitude>0&&Math.abs(std.mean)<=100*std.scale){
  equation=power?"y ≈ "+label(rawAmplitude)+"x^("+label(slope)+")":
   "y ≈ "+label(rawAmplitude)+"e^("+label(slope)+"x)";
 }else if(power){
  const pivot=Math.exp(std.mean),amp=Math.exp(logA);
  equation="y ≈ "+label(amp)+"(x / "+label(pivot)+")^("+label(slope)+")";
 }else{
  equation="y ≈ "+label(Math.exp(logA))+"e^("+label(rate)+"t), t = (x − "+label(std.mean)+") / "+label(std.scale);
 }
 const transformed=method!=="original";
 const methodLabel=transformed?
  "Least squares on ln(y) (log-transformed)": "Nonlinear least squares of y (original-scale numerical search)";
 const caution=(transformed?
  "The parameters minimise squared log-errors, not squared errors in y; RMSE and R² shown below are still measured in the original y-units. ":
  "This numerical search minimises original-scale squared errors but can have local or boundary minima. ")+
  (atBound?"The fitted slope reaches the search limit: inspect the data and prefer an independently justified model. ":"")+
  (power?"Power regression requires x > 0 and y > 0.":"This exponential fitting option requires y > 0.");
 return {ok:true,n:points.length,predict:transform,equation,method:methodLabel,
  parameters:{logAmplitude:logA,centeredRate:rate,xMean:std.mean,xScale:std.scale,
   slope,rawAmplitude},note:
  "Predictions use full-precision parameters. The fitted objective is shown above; observed-scale residuals use every original pair.",
  caution};
}

/** A single frequency is checked by linear least squares of the harmonic
 * coefficients. Report the chosen period; never silently assume cyclicity.
 */
function harmonicCandidate(points,t,cycles){
 const angle=t.map(v=>2*Math.PI*cycles*v);
 const columns=[t.map(()=>1),angle.map(Math.sin),angle.map(Math.cos)];
 const coeff=leastSquares(columns,points.map(p=>p.y));
 if(!coeff)return null;
 const [offset,sine,cosine]=coeff,amplitude=Math.hypot(sine,cosine);
 let rss=0;
 for(let i=0;i<points.length;i++){
  const predicted=offset+sine*Math.sin(angle[i])+cosine*Math.cos(angle[i]);
  const error=points[i].y-predicted;
  rss+=error*error;
 }
 return Number.isFinite(rss)?{rss,cycles,offset,sine,cosine,amplitude,phase:Math.atan2(cosine,sine)}:null;
}
export function fitSinusoidal(points,periodInput=""){
 if(points.length<6)return fail("A sinusoidal fit needs at least six observed pairs. A short series cannot establish periodic behaviour.");
 const xs=points.map(p=>p.x),min=Math.min(...xs),max=Math.max(...xs),span=max-min;
 if(!(span>0)||!Number.isFinite(span)||new Set(xs).size<6)
  return fail("Six distinct measured x-values over a finite interval are required for sinusoidal fitting.");
 const t=xs.map(x=>(x-min)/span);
 const requested=String(periodInput||"").trim();
 let best;
 if(requested){
  const period=Number(requested);
  if(!Number.isFinite(period)||!(period>0))
   return fail("Enter a positive, finite period in horizontal-axis units, or leave the period blank for exploratory estimation.");
  const cycles=span/period;
  if(!Number.isFinite(cycles)||!(cycles>0)||cycles>20)
   return fail("That period is too small or large compared with the observed x-range for reliable fitting.");
  best=harmonicCandidate(points,t,cycles);
  if(!best)return fail("The specified period makes the sine/cosine fit ill-conditioned. Try a period supported by the observations.");
 }else{
  const minCycles=.45,maxCycles=Math.min(4,Math.max(1.6,points.length/3)),steps=144;
  let selected=-1;
  for(let i=0;i<=steps;i++){
   const cycles=minCycles+(maxCycles-minCycles)*i/steps;
   const candidate=harmonicCandidate(points,t,cycles);
   if(candidate&&(!best||candidate.rss<best.rss)){best=candidate;selected=i;}
  }
  if(!best)return fail("Could not find a reliable sinusoidal fit. Check for sufficient variation and repeated x-values.");
  if(selected>0&&selected<steps){
   const inc=(maxCycles-minCycles)/steps;
   let a=best.cycles-inc,b=best.cycles+inc;
   const ratio=(Math.sqrt(5)-1)/2;
   let c=b-ratio*(b-a),d=a+ratio*(b-a);
   let fc=harmonicCandidate(points,t,c),fd=harmonicCandidate(points,t,d);
   for(let j=0;j<32;j++){
    if((fc?.rss??Infinity)<=(fd?.rss??Infinity)){
     b=d;d=c;fd=fc;c=b-ratio*(b-a);fc=harmonicCandidate(points,t,c);
    }else{
     a=c;c=d;fc=fd;d=a+ratio*(b-a);fd=harmonicCandidate(points,t,d);
    }
   }
   const refined=harmonicCandidate(points,t,(a+b)/2);
   if(refined&&refined.rss<best.rss)best=refined;
  }
 }
 const period=span/best.cycles;
 const predict=x=>best.offset+best.amplitude*Math.sin(2*Math.PI*(x-min)/period+best.phase);
 if(!predictorOK(points,predict))return fail("Sinusoidal predictions were not finite for all measured values.");
 const equation="y ≈ "+label(best.offset)+" + "+label(best.amplitude)+
  " sin(2π(x − "+label(min)+") / "+label(period)+" + "+label(best.phase)+")";
 const domain=best.cycles<1?"Fewer than one full cycle is visible, so period estimates are especially uncertain. ":
  best.cycles>points.length/2.5?"There may be too few observations per cycle to distinguish competing periods. ":"";
 const caution=domain+(requested?
  "The period was supplied by the student; amplitude, phase and offset were then fitted by least squares. ":
  "The period was estimated by an exploratory frequency search; several different periods can match the same observations. ")+
  "Confirm periodic behaviour and the meaning of the period before using this model for predictions.";
 return {ok:true,n:points.length,predict,equation,
  parameters:{offset:best.offset,amplitude:best.amplitude,phase:best.phase,
   period,xOrigin:min,cycles:best.cycles},
  method:requested?
  "Fixed-period sine/cosine least squares":"Exploratory period search + sine/cosine least squares",
  note:"Amplitude, angular frequency and phase are measured in radians where appropriate. A mathematical fit alone does not prove periodic behaviour.",
  caution,period,cycles:best.cycles};
}

export function fitAdvancedGraphModel(points,model){
 if(model.type==="logarithmic")return fitLogarithmic(points);
 if(model.type==="exponential"||model.type==="power")
  return fitPositiveGrowth(points,model.type,model.fitMethod||"transformed");
 if(model.type==="sinusoidal")return fitSinusoidal(points,model.period);
 return fail("This advanced model is not supported.");
}
