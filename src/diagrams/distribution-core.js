/**
 * Probability Distribution Studio — theoretical models, never inferred observations.
 * Pure functions: safe to use in project backups, reports, figure previews and tests.
 */
import {analyzeExtraModel,extraEventProbability} from "./distribution-extra.js";
export const MAX_DISTRIBUTION_FIGURES=12;
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const clean=(x,max=160)=>typeof x==="string"?x.slice(0,max):"";
const number=x=>String(x??"").trim()!==""&&Number.isFinite(Number(x))?Number(x):null;
export const DISTRIBUTION_KINDS=Object.freeze(["normal","binomial","poisson","uniform","custom"]);
const kinds=DISTRIBUTION_KINDS,modes=["none","left","right","between","outside","exact"];
export function newDistributionDraft(){
 return {kind:"normal",title:"",symbol:"X",unit:"",mu:"0",sigma:"1",n:"10",p:"0.5",lambda:"3",a:"0",b:"10",
  customPoints:"0, 0.25\n1, 0.50\n2, 0.25",
  mode:"none",lower:"",upper:"",size:"standard",printStyle:"colour",showProbability:true,
  showMean:false,showParameters:false,figureNumber:"",caption:"",sourceKind:"theoretical",
  sourceCredit:"",note:"",edited:false};
}
export function normalizeDistributionDraft(raw){
 const d=newDistributionDraft(),r=plain(raw)?raw:{};
 for(const key of ["title","symbol","unit","mu","sigma","n","p","lambda","a","b","customPoints","lower","upper",
   "figureNumber","caption","sourceCredit","note"]){
  if(typeof r[key]==="string")d[key]=clean(r[key],key==="customPoints"?3200:["note","sourceCredit"].includes(key)?800:180);
 }
 for(const key of ["kind","mode","size","printStyle","sourceKind"]){
  const options={kind:kinds,mode:modes,size:["compact","standard","wide"],
   printStyle:["colour","mono"],sourceKind:["theoretical","primary","secondary","unsure"]};
  if(options[key].includes(r[key]))d[key]=r[key];
 }
 for(const key of ["showProbability","showMean","showParameters","edited"])
  if(typeof r[key]==="boolean")d[key]=r[key];
 if(["normal","uniform"].includes(d.kind)&&d.mode==="exact")d.mode="none";
 return d;
}
/** Inverse controls belong to the editor, never to saved/printed figure drafts. */
export const newDistributionInverseQuery=()=>({mode:"left",probability:"0.95",status:"idle",signature:""});
function normalizeDistributionInverseQuery(raw){
 const r=plain(raw)?raw:{},query=newDistributionInverseQuery();
 if(["left","right","central"].includes(r.mode))query.mode=r.mode;
 if(typeof r.probability==="string")query.probability=clean(r.probability,64);
 if(["idle","calculated","applied"].includes(r.status))query.status=r.status;
 if(typeof r.signature==="string")query.signature=clean(r.signature,3600);
 return query;
}
/** What-if values are editor-only, not embedded in a saved or exported IA figure. */
const WHAT_IF_FIELDS=["mu","sigma","n","p","lambda","a","b","customPoints"];
export const newDistributionWhatIfState=()=>({
 active:false,status:"idle",kind:"",source:"",values:{},
 comparison:"event",targetMode:"left",targetProbability:"0.95"
});
function normalizeDistributionWhatIfState(raw){
 const r=plain(raw)?raw:{},w=newDistributionWhatIfState();
 w.active=r.active===true;
 if(kinds.includes(r.kind))w.kind=r.kind;
 if(["idle","exploring","applied"].includes(r.status))w.status=r.status;
 if(typeof r.source==="string")w.source=clean(r.source,3600);
 if(["event","target"].includes(r.comparison))w.comparison=r.comparison;
 if(["left","right","central"].includes(r.targetMode))w.targetMode=r.targetMode;
 if(typeof r.targetProbability==="string")w.targetProbability=clean(r.targetProbability,64);
 if(w.targetMode==="central"&&!["normal","uniform"].includes(w.kind))w.targetMode="left";
 if(plain(r.values))for(const key of WHAT_IF_FIELDS)
  if(typeof r.values[key]==="string")w.values[key]=clean(r.values[key],key==="customPoints"?3200:180);
 if(!w.active){w.kind="";w.source="";w.values={};}
 return w;
}
export const newDistributionStudio=()=>({open:false,zoomed:false,draft:newDistributionDraft(),
 inverse:newDistributionInverseQuery(),whatIf:newDistributionWhatIfState(),figures:[],activeId:""});
export function normalizeDistributionStudio(raw){
 const r=plain(raw)?raw:{},figures=(Array.isArray(r.figures)?r.figures:[])
  .slice(0,MAX_DISTRIBUTION_FIGURES).filter(plain)
  .map(f=>({id:clean(f.id,72),entryId:clean(f.entryId,80),
   savedAt:clean(f.savedAt,42),draft:normalizeDistributionDraft(f.draft)}))
  .filter(f=>/^distribution-[a-z0-9-]+$/i.test(f.id));
 return {open:r.open===true,zoomed:r.zoomed===true,draft:normalizeDistributionDraft(r.draft),
  inverse:normalizeDistributionInverseQuery(r.inverse),whatIf:normalizeDistributionWhatIfState(r.whatIf),figures,
  activeId:figures.some(f=>f.id===r.activeId)?r.activeId:""};
}
const phi=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
/* Accurate, cancellation-resistant normal upper tail (no Math.erf dependency).
   Use adaptive quadrature near the centre; the convergent Mills-ratio
   continued fraction avoids an artificial zero beyond 12 standard deviations.
   Truncation at z=12 in the central quadrature costs less than 2e-33. */
function simpson(f,a,b,fa,fc,fb){return (b-a)*(fa+4*fc+fb)/6;}
function adaptive(f,a,b,fa,fc,fb,whole,tolerance,depth){
 const c=(a+b)/2,l=(a+c)/2,r=(c+b)/2,fl=f(l),fr=f(r);
 const left=simpson(f,a,c,fa,fl,fc),right=simpson(f,c,b,fc,fr,fb);
 const delta=left+right-whole;
 if(depth<=0||Math.abs(delta)<=15*tolerance)return left+right+delta/15;
 return adaptive(f,a,c,fa,fl,fc,left,tolerance/2,depth-1)+
        adaptive(f,c,b,fc,fr,fb,right,tolerance/2,depth-1);
}
export function normalUpperTail(z){
 if(!Number.isFinite(z))return z>0?0:1;
 if(z<0)return 1-normalUpperTail(-z);
 if(z>=5){
  // Q(z) = phi(z) / (z + 1/(z + 2/(z + 3/(...)))).
  // The stable backwards continued fraction retains tails far below 1e-33.
  let tail=0;
  for(let j=60;j>=1;j--)tail=j/(z+tail);
  return phi(z)/(z+tail);
 }
 const a=z,b=12,fa=phi(a),fb=phi(b),c=(a+b)/2,fc=phi(c);
 return Math.max(0,Math.min(.5,adaptive(phi,a,b,fa,fc,fb,
  simpson(phi,a,b,fa,fc,fb),1e-13,22)));
}
export const normalCdf=z=>z<0?normalUpperTail(-z):1-normalUpperTail(z);
export function normalInterval(a,b){
 if(a>=b)return 0;
 if(b<=0)return Math.max(0,normalUpperTail(-b)-normalUpperTail(-a));
 if(a>=0)return Math.max(0,normalUpperTail(a)-normalUpperTail(b));
 return Math.max(0,1-normalUpperTail(-a)-normalUpperTail(b));
}
export function binomialMass(n,p,k){
 if(!Number.isInteger(k)||k<0||k>n)return 0;
 if(p===0)return k===0?1:0;
 if(p===1)return k===n?1:0;
 let log=0;
 for(let j=1;j<=Math.min(k,n-k);j++)log+=Math.log(n-j+1)-Math.log(j);
 return Math.exp(log+k*Math.log(p)+(n-k)*Math.log1p(-p));
}
export function formatDistributionProbability(p){
 if(p===0||p===1)return String(p);
 if(p<0.00005)return Number(p.toPrecision(6)).toString();
 if(p>0.99995)return Number(p.toPrecision(15)).toString();
 return p.toFixed(4);
}
const selected=(mode,k,a,b)=>mode==="exact"?k===a:
 mode==="left"?k<=a:mode==="right"?k>=a:
 mode==="between"?k>=a&&k<=b:mode==="outside"?k<=a||k>=b:false;
export function analyzeDistribution(raw){
 const d=normalizeDistributionDraft(raw),issues=[],notes=[];
 if(!d.title.trim())issues.push("Enter a descriptive figure title before saving or exporting.");
 if(!/^[A-Z\u0391-\u03A9]$/u.test(d.symbol.trim()))
  issues.push("Choose a single capital letter (Latin or Greek) for the random variable.");
 if(d.sourceKind==="secondary"&&!d.sourceCredit.trim())
  issues.push("Give the original source of your published model parameters.");
 if(d.sourceKind==="unsure")notes.push("Identify whether your parameters are assumed, estimated or published.");
 let mu=null,sigma=null,n=null,p=null,mean=null,variance=null,masses=[],extra=null;
 if(d.kind==="normal"){
  mu=number(d.mu);sigma=number(d.sigma);
  if(mu===null||Math.abs(mu)>1e12)issues.push("Enter a finite mean of sensible magnitude.");
  if(mu!==null&&sigma!==null&&sigma>0&&mu+sigma===mu)issues.push("The standard deviation is too small relative to the mean for reliable axis labels.");
  if(sigma===null||sigma<=0||sigma>1e12||sigma<1e-12)
   issues.push("Standard deviation must be positive and of sensible magnitude.");
  mean=mu;variance=sigma===null?null:sigma*sigma;
 }else if(d.kind==="binomial"){
  n=number(d.n);p=number(d.p);
  if(!Number.isInteger(n)||n<1||n>150)issues.push("Number of trials must be an integer from 1 to 150.");
  if(p===null||p<0||p>1)issues.push("Success probability must be between 0 and 1.");
  if(Number.isInteger(n)&&n>=1&&n<=150&&p!==null&&p>=0&&p<=1){
   masses=Array.from({length:n+1},(_,k)=>binomialMass(n,p,k));
   mean=n*p;variance=n*p*(1-p);
  }
 }else{
  extra=analyzeExtraModel(d);
  issues.push(...extra.issues);notes.push(...extra.notes);
  mean=extra.mean;variance=extra.variance;
 }
 const a=d.mode==="none"?null:number(d.lower);
 const b=["between","outside"].includes(d.mode)?number(d.upper):null;
 if(d.mode!=="none"){
  if(a===null)issues.push("Enter the boundary value for your selected event.");
  else if(["binomial","poisson"].includes(d.kind)&&!Number.isInteger(a))
   issues.push("Count-distribution event bounds must be integers; inequalities are inclusive.");
  if(["between","outside"].includes(d.mode)){
   if(b===null)issues.push("Enter the upper boundary value.");
   else if(["binomial","poisson"].includes(d.kind)&&!Number.isInteger(b))
    issues.push("Count-distribution event bounds must be integers.");
   if(a!==null&&b!==null&&(d.mode==="outside"?a>=b:a>b))
    issues.push("The lower boundary must not exceed the upper boundary.");
  }
 }
 let probability=null,statement="";
 if(!issues.length&&d.mode!=="none"){
  const variable=d.symbol.trim();
  const expr=d.mode==="exact"?variable+" = "+a:
   d.mode==="left"?variable+" \u2264 "+a:
   d.mode==="right"?variable+" \u2265 "+a:
   d.mode==="between"?a+" \u2264 "+variable+" \u2264 "+b:
   variable+" \u2264 "+a+" or "+variable+" \u2265 "+b;
  if(d.kind==="binomial"){
   let sum=0,compensation=0;
   for(let k=0;k<=n;k++)if(selected(d.mode,k,a,b)){
    const y=masses[k]-compensation,t=sum+y;
    compensation=(t-sum)-y;sum=t;
   }
   probability=Math.max(0,Math.min(1,sum));
  }else if(d.kind==="normal"){
   const z=x=>(x-mu)/sigma;
   probability=d.mode==="left"?normalCdf(z(a)):
    d.mode==="right"?normalUpperTail(z(a)):
    d.mode==="between"?normalInterval(z(a),z(b)):
    1-normalInterval(z(a),z(b));
  }else probability=extraEventProbability(d,extra,a,b);
  statement="P("+expr+") = "+formatDistributionProbability(probability);
 }
 if(d.kind==="normal")notes.push("A density curve represents a proposed continuous model; the probability is an area, not the curve height.");
 if(d.kind==="binomial")notes.push("A binomial model assumes fixed trials, two outcomes, independence and constant success probability.");
 notes.push("A theoretical distribution does not by itself show that observed data fit the chosen model.");
 return {ready:issues.length===0,issues,notes,draft:d,probability,statement,
  mean,variance,mu,sigma,n,p,masses,lower:a,upper:b,
  lambda:extra?.lambda??null,uniformA:extra?.uniformA??null,uniformB:extra?.uniformB??null,
  points:extra?.points||(masses.length?masses.map((probability,x)=>({x,probability})):[]),
  plotMax:extra?.plotMax??null,total:extra?.total??null};
}
export const distributionSignature=d=>JSON.stringify(normalizeDistributionDraft(d));
export function saveDistributionFigure(studio,entryId=""){
 const analysis=analyzeDistribution(studio?.draft);
 if(!analysis.ready)return {ok:false,error:analysis.issues[0],checks:analysis};
 const existing=studio.figures.find(f=>f.id===studio.activeId);
 if(!existing&&studio.figures.length>=MAX_DISTRIBUTION_FIGURES)
  return {ok:false,error:"Twelve distribution figures are already saved. Edit a saved figure instead."};
 const id=existing?.id||"distribution-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*10000).toString(36);
 const record={id,entryId:entryId||existing?.entryId||"",savedAt:new Date().toISOString(),
  draft:{...analysis.draft,edited:true}};
 const i=studio.figures.findIndex(f=>f.id===id);
 if(i<0)studio.figures.push(record);else studio.figures[i]=record;
 studio.activeId=id;studio.draft=normalizeDistributionDraft(record.draft);
 return {ok:true,record};
}
