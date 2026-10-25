/**
 * Pass 5.4.1 — pure, editor-only sensitivity descriptions.
 * A comparison is a theoretical scenario, not evidence of model fit.
 * Do not divide by an event probability or invent a universal sensitivity score.
 */
import {normalUpperTail,normalCdf,normalInterval} from "./distribution-core.js";
import {poissonMass,poissonCdf,poissonUpperTail} from "./distribution-extra.js";

const finite=n=>typeof n==="number"&&Number.isFinite(n);
const roundProbability=n=>Math.max(0,Math.min(1,n));
const numberText=(n,digits=9)=>!finite(n)?"—":n===0?"0":Number(n.toPrecision(digits)).toString();
const signed=n=>n===0?"0":(n>0?"+":"−")+numberText(Math.abs(n));
export const formatSensitivityNumber=numberText;
export const formatSensitivitySigned=signed;
/** Probabilities close to 1 can have tails smaller than machine epsilon. */
export function formatSensitivityProbability(probability,complement=null){
 if(!finite(probability))return "—";
 if(finite(complement)&&complement>0&&complement<1e-8&&probability>0.5)
  return "1 − "+numberText(complement,9);
 return numberText(probability,10);
}
/** A percentage POINT difference, not a relative percentage. Never round a
 * nonzero rare-event change to a displayed zero. */
export function formatSensitivityPoints(delta){
 if(!finite(delta))return "—";
 return signed(delta*100);
}
const sum=xs=>{
 let total=0,correction=0;
 for(const x of xs){const next=x-correction,t=total+next;correction=(t-total)-next;total=t;}
 return total;
};
const selected=(mode,x,a,b)=>mode==="exact"?x===a:
 mode==="left"?x<=a:mode==="right"?x>=a:
 mode==="between"?x>=a&&x<=b:mode==="outside"?x<=a||x>=b:false;
const clamp01=x=>Math.min(1,Math.max(0,x));
const normalComplement=q=>{
 const z=x=>(x-q.mu)/q.sigma,{mode}=q.draft,a=q.lower,b=q.upper;
 if(mode==="left")return normalUpperTail(z(a));
 if(mode==="right")return normalCdf(z(a));
 if(mode==="between")return normalCdf(z(a))+normalUpperTail(z(b));
 if(mode==="outside")return normalInterval(z(a),z(b));
 return null;
};
const poissonComplement=q=>{
 const {mode}=q.draft,a=q.lower,b=q.upper,l=q.lambda;
 if(mode==="exact")return a===0?-Math.expm1(-l):1-poissonMass(l,a);
 if(mode==="left")return poissonUpperTail(l,a);
 if(mode==="right")return poissonCdf(l,a-1);
 if(mode==="between")return poissonCdf(l,a-1)+poissonUpperTail(l,b);
 if(mode==="outside"){
  if(b-a<2000)return sum(Array.from({length:Math.max(0,Math.floor(b)-Math.max(0,Math.floor(a)+1))},
   (_,i)=>poissonMass(l,Math.max(0,Math.floor(a)+1)+i)));
  return Math.max(0,poissonCdf(l,b-1)-poissonCdf(l,a));
 }
 return null;
};
const uniformComplement=q=>{
 const {mode}=q.draft,a=q.lower,b=q.upper,lo=q.uniformA,hi=q.uniformB,span=hi-lo;
 const portion=(from,to)=>clamp01((Math.min(to,hi)-Math.max(from,lo))/span);
 if(mode==="left")return portion(a,hi);
 if(mode==="right")return portion(lo,a);
 if(mode==="between")return clamp01(portion(lo,a)+portion(b,hi));
 if(mode==="outside")return portion(a,b);
 return null;
};
/** Directly calculate the complementary event. In very rare upper tails,
 * subtracting two probabilities displayed as 1 would erase the difference. */
export function distributionEventComplement(q){
 if(!q?.ready||q.draft.mode==="none"||!finite(q.probability))return null;
 const {kind,mode}=q.draft;
 let complement=null;
 if(kind==="normal")complement=normalComplement(q);
 else if(kind==="uniform")complement=uniformComplement(q);
 else if(kind==="poisson")complement=poissonComplement(q);
 else{
  const points=kind==="binomial"?
   q.masses.map((probability,x)=>({x,probability})):q.points;
  complement=sum(points.filter(({x})=>!selected(mode,x,q.lower,q.upper)).map(p=>p.probability));
 }
 return finite(complement)?roundProbability(complement):null;
}
const names={mu:"mean",sigma:"standard deviation",n:"number of trials",p:"success probability",
 lambda:"expected event count",a:"lower support limit",b:"upper support limit",
 customPoints:"outcome probabilities"};
const unit=(d)=>d.unit.trim()?" "+d.unit.trim():" units";
const describeParameter=(q,keys)=>{
 const old=q.original,now=q.alternative,d=q.originalDraft,kind=d.kind;
 if(!keys.length)return {type:"unchanged",title:"Original and alternative are the same",detail:"Change an alternative parameter to investigate a genuine comparison."};
 if(kind==="custom"){
  const before=new Map(old.points.map(p=>[p.x,p.probability]));
  const after=new Map(now.points.map(p=>[p.x,p.probability]));
  const outcomes=new Set([...before.keys(),...after.keys()]);
  const changed=[...outcomes].filter(x=>(before.get(x)??0)!==(after.get(x)??0));
  return {type:"scenario",title:"Custom discrete probability scenario",
   detail:changed.length+" outcome probability assignment"+(changed.length===1?"":"s")+
    " changed. This compares assignments or possible outcomes, not the sensitivity to one numerical parameter."};
 }
 if(keys.length>1){
  const list=keys.map(k=>names[k]||k);
  const phrase=list.length===2?list.join(" and "):list.slice(0,-1).join(", ")+" and "+list.at(-1);
  return {type:"scenario",title:"Combined parameter scenario",
   detail:"Changed "+phrase+" together. The event-probability difference cannot be attributed to a single parameter."};
 }
 const k=keys[0],before=Number(d[k]),after=Number(q.alternativeDraft[k]);
 const difference=after-before;
 if(k==="mu")return {type:"single",title:"Mean shift",
  detail:"Mean changed by "+signed(difference)+unit(d)+
   " ("+signed(difference/old.sigma)+" of the original standard deviation)."};
 if(k==="sigma")return {type:"single",title:"Change in model spread",
  detail:"Standard deviation changed by "+signed(difference)+unit(d)+
   "; alternative spread is "+numberText(after/before)+" times the original."};
 if(k==="p")return {type:"single",title:"Change in success probability",
  detail:"Success probability changed by "+formatSensitivityPoints(difference)+
   " percentage points. This is not a relative percentage increase."};
 if(k==="n")return {type:"single",title:"Change in trial count",
  detail:"Number of trials changed by "+signed(difference)+
   ". The same absolute count event is held fixed; decide whether a count or a proportion better serves your aim."};
 if(k==="lambda")return {type:"single",title:"Change in mean event count",
  detail:"Expected count per stated interval changed by "+signed(difference)+
   (before>=1e-6?"; alternative rate is "+numberText(after/before)+" times the original.":
    ". A relative percentage or rate multiplier is not meaningful from a zero or tiny baseline.")};
 if(k==="a"||k==="b")return {type:"single",title:"Change in uniform support",
  detail:(k==="a"?"Lower":"Upper")+" bound changed by "+signed(difference)+unit(d)+
   "; the support width changed from "+numberText(old.uniformB-old.uniformA)+
   " to "+numberText(now.uniformB-now.uniformA)+unit(d)+"."};
 return {type:"scenario",title:"Parameter scenario",detail:"Compare the model assumptions before interpreting the changed probability."};
};
export function distributionSensitivity(q,changedKeys=[]){
 if(!q?.ready)return null;
 const parameter=describeParameter(q,changedKeys);
 const originalProbability=q.originalProbability,alternativeProbability=q.alternativeProbability;
 const eventValid=finite(originalProbability)&&finite(alternativeProbability);
 const originalComplement=eventValid?distributionEventComplement(q.originalEvent):null;
 const alternativeComplement=eventValid?distributionEventComplement(q.alternativeEvent):null;
 // Tail subtraction is used only when the selected event is common to both
 // models and has probability above one half. For custom near-normalised inputs,
 // use the direct event probabilities rather than a slightly imperfect total.
 const accurateTotals=q.original.draft.kind!=="custom"||
  (Math.abs(q.original.total-1)<1e-14&&Math.abs(q.alternative.total-1)<1e-14);
 const useComplements=eventValid&&accurateTotals&&originalProbability>=0.5&&alternativeProbability>=0.5&&
  finite(originalComplement)&&finite(alternativeComplement);
 const deltaProbability=!eventValid?null:useComplements?
  originalComplement-alternativeComplement:alternativeProbability-originalProbability;
 const tailPrecision=!!(useComplements&&(originalProbability===1&&originalComplement>0||
   alternativeProbability===1&&alternativeComplement>0));
 return {parameter,changedKeys:[...changedKeys],eventValid,originalComplement,alternativeComplement,
  deltaProbability,deltaPercentagePoints:deltaProbability===null?null:100*deltaProbability,
  usedComplement:!!useComplements,tailPrecision};
}
