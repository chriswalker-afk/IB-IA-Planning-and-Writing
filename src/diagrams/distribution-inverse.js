/**
 * Probability Distribution Studio — Pass 5.1 pure inverse calculations.
 *
 * inverseDistribution(draft,{mode:"left"|"right"|"central",probability})
 * - left: P(X <= k) >= target (smallest supported k for discrete models)
 * - right: P(X >= k) >= target (largest supported k for discrete models)
 * - central: equal-tailed continuous interval with target coverage
 *
 * Discrete targets are MINIMUM coverages, not promises of exact equality.
 * Numeric outputs retain full precision; the returned event uses editable
 * draft fields ready for the Pass 5.2 interface. Nothing is saved or mutated.
 */
import {analyzeDistribution,normalizeDistributionDraft,normalCdf,normalUpperTail,
 normalInterval,binomialMass,DISTRIBUTION_KINDS} from "./distribution-core.js";
import {poissonCdf,poissonUpperTail} from "./distribution-extra.js";

const MODES=Object.freeze(["left","right","central"]);
const sum=values=>{
 let s=0,c=0;
 for(const value of values){const y=value-c,t=s+y;c=(t-s)-y;s=t;}
 return s;
};
const readProbability=value=>{
 if(typeof value==="boolean"||value===null||value===undefined||String(value).trim()==="")return null;
 const p=Number(value);
 return Number.isFinite(p)&&p>=0&&p<=1?p:null;
};
const fail=(kind,mode,requested,issues)=>({
 ok:false,kind,mode,requested,issues,notes:[],lower:null,upper:null,event:null,
 achieved:null,adjacentProbability:null,comparison:null
});
const success=(kind,mode,requested,lower,upper,achieved,notes=[],adjacentProbability=null)=>({
 ok:true,kind,mode,requested,lower,upper,achieved,issues:[],notes,
 comparison:["normal","uniform"].includes(kind)?"approximately equal":"at least",
 adjacentProbability,
 event:{mode:mode==="central"?"between":mode,lower:String(lower),
  ...(mode==="central"?{upper:String(upper)}:{})}
});

/**
 * Invert the positive standard normal survival Q(z) without calculating 1-p
 * for a small input p. The shared survival uses stable high-tail evaluation.
 * Bisection guarantees a bracket and avoids loss of accuracy from density
 * division in extreme tails.
 */
function positiveNormalSurvivalQuantile(tail){
 if(tail===0.5)return 0;
 let lo=0,hi=40;
 for(let i=0;i<100;i++){
  const mid=(lo+hi)/2;
  if(normalUpperTail(mid)>tail)lo=mid;else hi=mid;
  if(hi-lo<=2e-14*Math.max(1,mid))break;
 }
 return (lo+hi)/2;
}
export function normalStandardQuantile(probability){
 const p=readProbability(probability);
 if(p===null||p===0||p===1)return null; // Normal endpoints require infinity.
 return p===0.5?0:p<0.5?
  -positiveNormalSurvivalQuantile(p):positiveNormalSurvivalQuantile(1-p);
}
const normalRightQuantile=p=>p===0.5?0:p<0.5?
 positiveNormalSurvivalQuantile(p):-positiveNormalSurvivalQuantile(1-p);

function boundedDiscrete(model,mode,target){
 const points=model.draft.kind==="binomial"?
  Array.from({length:model.n+1},(_,x)=>({x,probability:binomialMass(model.n,model.p,x)}))
   .filter(({x})=>model.p===0?x===0:model.p===1?x===model.n:true):
  model.points.filter(p=>p.probability>0);
 const left=i=>sum(points.slice(0,i+1).map(p=>p.probability));
 const right=i=>sum(points.slice(i).map(p=>p.probability));
 const n=points.length;
 // Complement comparisons avoid rounding a CDF to one prematurely.
 if(mode==="left"){
  let i=0;
  if(target===1)i=n-1;
  else if(target>0){
   for(;i<n-1;i++)
    if(target<=0.5?left(i)>=target:right(i+1)<=1-target)break;
  }
  const achieved=target>0.5?1-right(i+1):left(i);
  return {boundary:points[i].x,achieved,adjacent:i>0?left(i-1):null};
 }
 let i=n-1;
 if(target===1)i=0;
 else if(target>0){
  for(;i>0;i--)
   if(target<=0.5?right(i)>=target:left(i-1)<=1-target)break;
 }
 const achieved=target>0.5?1-left(i-1):right(i);
 return {boundary:points[i].x,achieved,adjacent:i<n-1?right(i+1):null};
}

const poissonAtLeast=(lambda,k)=>k<=0?1:poissonUpperTail(lambda,k-1);
function poissonDiscrete(lambda,mode,target){
 if(lambda===0)return {boundary:0,achieved:1,adjacent:0};
 if(mode==="left"){
  // The Poisson support has no maximum, even if a browser graph stops at k=250.
  let lo=-1,hi=Math.max(2,Math.ceil(lambda+4*Math.sqrt(lambda+1)+12));
  const meets=k=>target<=0.5?poissonCdf(lambda,k)>=target:
   poissonAtLeast(lambda,k+1)<=1-target;
  while(!meets(hi)&&hi<1000000)hi*=2;
  while(hi-lo>1){
   const mid=Math.floor((lo+hi)/2);
   if(meets(mid))hi=mid;else lo=mid;
  }
  return {boundary:hi,achieved:target>0.5?1-poissonAtLeast(lambda,hi+1):poissonCdf(lambda,hi),
   adjacent:hi>0?poissonCdf(lambda,hi-1):null};
 }
 let lo=0,hi=Math.max(2,Math.ceil(lambda+4*Math.sqrt(lambda+1)+12));
 const meets=k=>target<=0.5?poissonAtLeast(lambda,k)>=target:
  poissonCdf(lambda,k-1)<=1-target;
 while(meets(hi)&&hi<1000000)hi*=2;
 while(hi-lo>1){
  const mid=Math.floor((lo+hi)/2);
  if(meets(mid))lo=mid;else hi=mid;
 }
 return {boundary:lo,achieved:target>0.5?1-poissonCdf(lambda,lo-1):poissonAtLeast(lambda,lo),
  adjacent:poissonAtLeast(lambda,lo+1)};
}
const finite=x=>Number.isFinite(x)&&Math.abs(x)<1e308;
const quantileNotes=Object.freeze([
 "An inclusive discrete event may exceed the requested probability; use the achieved probability in your IA.",
 "For a left tail this is the smallest supported boundary meeting the target; for a right tail it is the largest."
]);
const continuousNotes=Object.freeze([
 "A continuous inverse boundary is numerical; confirm the result and state model assumptions in your IA."
]);

export function inverseDistribution(raw,request={}){
 const source=raw&&typeof raw==="object"&&raw.draft&&typeof raw.draft==="object"?raw.draft:raw;
 const d=normalizeDistributionDraft(source),kind=d.kind,mode=request?.mode;
 const requested=readProbability(request?.probability),issues=[];
 if(!source||!DISTRIBUTION_KINDS.includes(source.kind))
  issues.push("Select a recognised probability distribution.");
 if(!MODES.includes(mode))
  issues.push("Choose left, right or central (equal-tailed continuous interval).");
 if(requested===null)
  issues.push("Enter a finite target probability between 0 and 1.");
 if(issues.length)return fail(kind,mode,requested,issues);
 if(mode==="central"&&!["normal","uniform"].includes(kind))
  issues.push("Central equal-tailed inverse intervals are available for continuous models only.");
 // Validate parameters without requiring figure title, source or shaded-event UI.
 // The original draft is never modified.
 const model=analyzeDistribution({...d,title:"Inverse calculation",symbol:"X",
  sourceKind:"theoretical",mode:"none",lower:"",upper:""});
 issues.push(...model.issues);
 if(issues.length)return fail(kind,mode,requested,issues);

 if(kind==="normal"){
  if(mode!=="central"&&(requested===0||requested===1))
   return fail(kind,mode,requested,[
    "A normal distribution is unbounded: target 0 or 1 requires an infinite tail boundary."
   ]);
  if(mode==="central"&&requested===1)
   return fail(kind,mode,requested,[
    "A normal distribution is unbounded: a central probability of 1 requires infinite boundaries."
   ]);
  const {mu,sigma}=model;
  let lower,upper=null,achieved;
  if(mode==="central"){
   const z=requested===0?0:positiveNormalSurvivalQuantile((1-requested)/2);
   lower=mu-sigma*z;upper=mu+sigma*z;
   if(!finite(lower)||!finite(upper))
    return fail(kind,mode,requested,["The requested normal interval exceeds finite numerical bounds."]);
   achieved=normalInterval((lower-mu)/sigma,(upper-mu)/sigma);
  }else{
   const z=mode==="left"?normalStandardQuantile(requested):normalRightQuantile(requested);
   lower=mu+sigma*z;
   if(!finite(lower))
    return fail(kind,mode,requested,["The requested normal boundary exceeds finite numerical bounds."]);
   achieved=mode==="left"?normalCdf((lower-mu)/sigma):normalUpperTail((lower-mu)/sigma);
  }
  if(achieved===0&&requested>0||achieved===1&&requested<1&&requested<0.5)
   return fail(kind,mode,requested,["This extreme normal target cannot be represented reliably with the chosen parameters."]);
  const notes=[...continuousNotes];
  if(Math.abs(achieved-requested)>Math.max(1e-10,requested*1e-8))
   notes.push("Finite-precision arithmetic changes the achieved probability; report the achieved value rather than claiming an exact match.");
  return success(kind,mode,requested,lower,upper,achieved,notes);
 }

 if(kind==="uniform"){
  const a=model.uniformA,b=model.uniformB,span=b-a;
  const lower=mode==="left"?a+span*requested:
   mode==="right"?b-span*requested:
   a+span*((1-requested)/2);
  const upper=mode==="central"?b-span*((1-requested)/2):null;
  const c=x=>Math.max(0,Math.min(1,(x-a)/span));
  const achieved=mode==="left"?c(lower):mode==="right"?1-c(lower):Math.max(0,c(upper)-c(lower));
  const notes=[...continuousNotes];
  if(Math.abs(achieved-requested)>1e-10)
   notes.push("The parameter scale limits the representable boundary; the achieved probability differs from the target.");
  return success(kind,mode,requested,lower,upper,achieved,notes);
 }

 if(kind==="poisson"){
  if(model.lambda>0&&mode==="left"&&requested===1)
   return fail(kind,mode,requested,["A Poisson model with positive rate has no finite upper endpoint; P(X ≤ k) cannot equal 1 at a finite k."]);
  if(model.lambda>0&&mode==="right"&&requested===0)
   return fail(kind,mode,requested,["A Poisson model with positive rate has no greatest supported count; a right-tail target of 0 has no largest boundary."]);
 }
 const result=kind==="poisson"?poissonDiscrete(model.lambda,mode,requested):
  boundedDiscrete(model,mode,requested);
 if(!finite(result.boundary)||!Number.isFinite(result.achieved))
  return fail(kind,mode,requested,["A finite numerical inverse boundary could not be obtained."]);
 // Never round an achieved discrete probability to the requested target.
 const notes=[...quantileNotes];
 if(kind==="poisson")
  notes.push("Poisson inverse calculations use the full count distribution, including counts not displayed in the finite diagram.");
 if(result.achieved+Math.max(5e-15,requested*5e-14)<requested)
  return fail(kind,mode,requested,["The model cannot meet this probability target to numerical precision."]);
 return success(kind,mode,requested,result.boundary,null,result.achieved,
  notes,result.adjacent);
}
