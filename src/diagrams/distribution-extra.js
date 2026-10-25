/**
 * Probability Distribution Studio, Pass 4 — pure mathematical models.
 * Values are never inferred from data, silently normalised, or invented.
 */
const finite=value=>String(value??"").trim()!==""&&Number.isFinite(Number(value))?Number(value):null;
const compensatedSum=values=>{
 let sum=0,correction=0;
 for(const value of values){const y=value-correction,t=sum+y;correction=(t-sum)-y;sum=t;}
 return sum;
};
const logFactorial=k=>{
 if(k<=1)return 0;
 if(k<=200){let s=0;for(let i=2;i<=k;i++)s+=Math.log(i);return s;}
 // Stirling expansion; error below 1e-12 for k >= 200.
 const z=k;return (z+.5)*Math.log(z)-z+.5*Math.log(2*Math.PI)+1/(12*z)-1/(360*z**3);
};
export function poissonMass(lambda,k){
 if(!Number.isFinite(lambda)||lambda<0||!Number.isInteger(k)||k<0)return 0;
 if(lambda===0)return k===0?1:0;
 return Math.exp(-lambda+k*Math.log(lambda)-logFactorial(k));
}
const poissonBeyond=lambda=>Math.ceil(lambda+15*Math.sqrt(lambda+1)+45);
export function poissonCdf(lambda,k){
 if(!Number.isFinite(lambda)||lambda<0)return NaN;
 if(k<0)return 0;
 if(k>=poissonBeyond(lambda))return 1;
 const n=Math.floor(k);
 return Math.max(0,Math.min(1,compensatedSum(Array.from({length:n+1},(_,j)=>poissonMass(lambda,j)))));
}
export function poissonUpperTail(lambda,k){
 if(!Number.isFinite(lambda)||lambda<0)return NaN;
 if(k<0)return 1;
 if(k>=poissonBeyond(lambda))return 0;
 // Complement small lower tails; add right tails directly to avoid cancellation
 // when a tail probability is much smaller than the machine epsilon.
 if(k<lambda)return Math.max(0,1-poissonCdf(lambda,k));
 const start=Math.floor(k)+1,end=poissonBeyond(lambda);
 let sum=0,correction=0;
 for(let j=start;j<=end;j++){
  const term=poissonMass(lambda,j)-correction,next=sum+term;
  correction=(next-sum)-term;sum=next;
 }
 return Math.max(0,Math.min(1,sum));
}
const rowPattern=/^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*[,;\t]\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*$/i;
export function parseCustomDiscrete(raw){
 const lines=String(raw??"").split(/\r?\n/),points=[],issues=[];
 for(let i=0;i<lines.length;i++){
  const row=lines[i].trim().replace(/\u2212/g,"-");if(!row)continue;
  const match=rowPattern.exec(row);
  if(!match){issues.push("Row "+(i+1)+": enter value, probability (for example −2, 0.25).");continue;}
  const x=Number(match[1]),probability=Number(match[2]);
  if(!Number.isFinite(x)||Math.abs(x)>1e9){issues.push("Row "+(i+1)+": use a finite outcome between −1,000,000,000 and 1,000,000,000.");continue;}
  if(!Number.isFinite(probability)||probability<0||probability>1){issues.push("Row "+(i+1)+": probability must be between 0 and 1.");continue;}
  points.push({x,probability});
 }
 if(points.length<2||points.length>30)
  issues.push("Enter 2–30 distinct numerical outcomes (one value, probability pair per line).");
 points.sort((a,b)=>a.x-b.x);
 if(points.some((p,i)=>i>0&&p.x===points[i-1].x))
  issues.push("Each outcome value must be distinct; combine repeated outcomes rather than silently adding their probabilities.");
 const total=compensatedSum(points.map(p=>p.probability));
 if(points.length>0&&Math.abs(total-1)>5e-7)
  issues.push("Probabilities must total 1; the current total is "+Number(total.toPrecision(12))+". Values are never normalised automatically.");
 return {points,total,issues};
}
/** Model-specific numerical analysis. No event selection or UI markup. */
export function analyzeExtraModel(d){
 const issues=[],notes=[];let mean=null,variance=null,lambda=null,uniformA=null,uniformB=null,points=[],plotMax=null,total=null;
 if(d.kind==="poisson"){
  lambda=finite(d.lambda);
  if(lambda===null||lambda<0||lambda>100)
   issues.push("Poisson rate λ must be between 0 and 100 for this generator.");
  else{
   mean=lambda;variance=lambda;
   plotMax=Math.max(6,Math.min(250,Math.ceil(lambda+7*Math.sqrt(lambda+1)+8)));
   points=Array.from({length:plotMax+1},(_,x)=>({x,probability:poissonMass(lambda,x)}));
  }
  notes.push("The Poisson model counts events in a fixed interval with a constant average rate and independently occurring events. Its plotted count range is finite, but probability calculations include the complete distribution.");
 }else if(d.kind==="uniform"){
  uniformA=finite(d.a);uniformB=finite(d.b);
  if(uniformA===null||uniformB===null||Math.abs(uniformA)>1e12||Math.abs(uniformB)>1e12)
   issues.push("Enter finite lower and upper limits for the uniform distribution.");
  else if(uniformA>=uniformB||uniformB-uniformA<1e-12||uniformA+(uniformB-uniformA)===uniformA)
   issues.push("Uniform upper limit b must exceed lower limit a by a meaningful positive width.");
  else{
   mean=(uniformA+uniformB)/2;variance=(uniformB-uniformA)**2/12;
  }
  notes.push("A continuous uniform model assumes equal probability density throughout [a, b], and zero density outside. Probability is interval length divided by total width, not the density height.");
 }else if(d.kind==="custom"){
  const parsed=parseCustomDiscrete(d.customPoints);
  issues.push(...parsed.issues);points=parsed.points;total=parsed.total;
  if(!issues.length){
   mean=compensatedSum(points.map(p=>p.x*p.probability));
   variance=compensatedSum(points.map(p=>(p.x-mean)**2*p.probability));
  }
  if(Math.abs(total-1)>1e-10&&Math.abs(total-1)<=5e-7)
   notes.push("The entered probabilities sum to "+Number(total.toPrecision(12))+" because of rounding. No normalisation has been applied; check whether the rounding is justified.");
  notes.push("These bars show assigned model probabilities, not observed frequencies. State where each probability came from and why these outcomes cover the full sample space.");
 }
 return {issues,notes,mean,variance,lambda,uniformA,uniformB,points,plotMax,total};
}
const chosen=(mode,x,a,b)=>mode==="exact"?x===a:
 mode==="left"?x<=a:mode==="right"?x>=a:
 mode==="between"?x>=a&&x<=b:mode==="outside"?x<=a||x>=b:false;
const uniformCdf=(x,a,b)=>Math.min(1,Math.max(0,(x-a)/(b-a)));
export function extraEventProbability(d,model,lower,upper){
 const {kind,mode}=d;
 if(mode==="none")return null;
 if(kind==="uniform"){
  const c=x=>uniformCdf(x,model.uniformA,model.uniformB);
  return mode==="left"?c(lower):mode==="right"?1-c(lower):
   mode==="between"?Math.max(0,c(upper)-c(lower)):
   Math.max(0,1-c(upper)+c(lower));
 }
 if(kind==="poisson"){
  const l=model.lambda;
  if(mode==="exact")return poissonMass(l,lower);
  if(mode==="left")return poissonCdf(l,lower);
  if(mode==="right")return poissonUpperTail(l,lower-1);
  if(mode==="between")return Math.max(0,poissonCdf(l,upper)-poissonCdf(l,lower-1));
  return Math.max(0,Math.min(1,poissonCdf(l,lower)+poissonUpperTail(l,upper-1)));
 }
 return Math.max(0,Math.min(1,compensatedSum(model.points.filter(p=>chosen(mode,p.x,lower,upper)).map(p=>p.probability))));
}
