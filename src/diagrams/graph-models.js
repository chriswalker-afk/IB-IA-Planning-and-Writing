import {fitAdvancedGraphModel} from "./graph-advanced-fits.js";
/**
 * Optional, student-chosen mathematical models for genuine paired data.
 * Deliberately no automatic model selection, fitting on page load or fabricated observations.
 * Least-squares fitting uses a centered/scaled x and re-orthogonalised QR basis
 * so normal-equation conditioning does not distort simple quadratic regression.
 */
export const MAX_GRAPH_MODELS=3;
export const GRAPH_MODEL_TYPES=Object.freeze({
 linear:{label:"Linear regression",color:"#2769b3",dash:"",degree:1,tier:"core"},
 quadratic:{label:"Quadratic regression",color:"#9858a8",dash:"",degree:2,tier:"core"},
 cubic:{label:"Cubic regression",color:"#7849ad",dash:"5 2",degree:3,tier:"advanced"},
 exponential:{label:"Exponential regression",color:"#bf6229",dash:"",degree:null,tier:"advanced"},
 logarithmic:{label:"Logarithmic regression",color:"#2b8474",dash:"5 2",degree:null,tier:"advanced"},
 power:{label:"Power regression",color:"#a17b23",dash:"",degree:null,tier:"advanced"},
 sinusoidal:{label:"Sinusoidal regression",color:"#bb4684",dash:"",degree:null,tier:"advanced"},
 custom:{label:"My own equation",color:"#c37825",dash:"7 5",degree:null,tier:"core"}
});
export function normalizeGraphModels(raw){
 const used=new Set(),types=new Set();
 if(!Array.isArray(raw))return [];
 return raw.slice(0,12).flatMap((entry,i)=>{
  if(!entry||typeof entry!=="object"||Array.isArray(entry)||!Object.hasOwn(GRAPH_MODEL_TYPES,entry.type)||types.has(entry.type))
   return [];
  types.add(entry.type);
  let id=typeof entry.id==="string"&&/^model-[a-z0-9-]{1,24}$/.test(entry.id)?entry.id:"model-"+(i+1);
  while(used.has(id))id="model-"+(i+1)+"-"+used.size;
  used.add(id);
  return [{id,type:entry.type,visible:entry.visible!==false,
   expression:entry.type==="custom"&&typeof entry.expression==="string"?entry.expression.slice(0,180):"",
   fitMethod:["exponential","power"].includes(entry.type)&&entry.fitMethod==="original"?"original":"transformed",
   period:entry.type==="sinusoidal"&&typeof entry.period==="string"?entry.period.slice(0,36):""}];
 }).slice(0,MAX_GRAPH_MODELS);
}
const fmt=n=>{
 if(!Number.isFinite(n))return "?";
 const v=Number(n.toPrecision(6));
 return Object.is(v,-0)?"0":String(v);
};
function polynomialEquation(coeffs,variable="x"){
 const magnitude=Math.max(0,...coeffs.map(Math.abs)),cutoff=magnitude*1e-12;
 const terms=[];
 for(let i=coeffs.length-1;i>=0;i--){
  const v=coeffs[i];
  if(Math.abs(v)<=cutoff)continue;
  const power=i===0?"":i===1?variable:i===2?variable+"²":variable+"³";
  const atom=fmt(Math.abs(v))+power;
  terms.push((terms.length?(v<0?" − ":" + "):(v<0?"−":""))+atom);
 }
 return "y ≈ "+(terms.join("")||"0");
}
const dot=(a,b)=>a.reduce((sum,value,i)=>sum+value*b[i],0);
/** Returns a predictor and a rounded display equation; never rounds values for evaluation. */
export function fitPolynomialLeastSquares(points,degree){
 const n=points.length,p=degree+1;
 if(n<p)return {ok:false,error:"At least "+p+" paired observations are needed for this regression."};
 if(new Set(points.map(pt=>pt.x)).size<p)
  return {ok:false,error:"This model needs at least "+p+" distinct x-values."};
 const anchor=points[0].x,mean=anchor+points.reduce((sum,pt)=>sum+(pt.x-anchor),0)/n;
 const scale=Math.max(...points.map(pt=>Math.abs(pt.x-mean)));
 if(!(scale>0)||!Number.isFinite(scale))return {ok:false,error:"The horizontal values do not provide enough variation to fit a model."};
 const t=points.map(pt=>(pt.x-mean)/scale);
 if(![1,2,3].includes(degree))return {ok:false,error:"Polynomial degree must be 1, 2 or 3."};
 const values=Array.from({length:p},(_,power)=>t.map(v=>v**power));
 const q=[],R=Array.from({length:p},()=>Array(p).fill(0)),baseline=points[0].y;
 const centred=points.map(pt=>pt.y-baseline);
 for(let j=0;j<p;j++){
  let v=values[j].slice();
  // Repeat orthogonalisation to control cancellation for clustered x-values.
  for(let repeat=0;repeat<2;repeat++)for(let i=0;i<j;i++){
   const component=dot(q[i],v);
   R[i][j]+=component;
   v=v.map((x,k)=>x-component*q[i][k]);
  }
  const length=Math.hypot(...v);
  if(!Number.isFinite(length)||length<1e-10*Math.sqrt(n))
   return {ok:false,error:"The chosen x-values cannot support a numerically reliable "+(degree===3?"cubic":degree===2?"quadratic":"linear")+" fit."};
  R[j][j]=length;
  q.push(v.map(value=>value/length));
 }
 const rhs=q.map(col=>dot(col,centred));
 const coeff=Array(p).fill(0);
 for(let i=p-1;i>=0;i--){
  const rest=coeff.slice(i+1).reduce((sum,value,k)=>sum+R[i][i+k+1]*value,0);
  coeff[i]=(rhs[i]-rest)/R[i][i];
 }
 coeff[0]+=baseline;
 const predict=x=>{
  const z=(x-mean)/scale;
  return coeff.reduceRight((acc,c)=>acc*z+c,0);
 };
 const centredDisplay=Math.abs(mean)>100*scale;
 // Expand the stable centred polynomial into powers of x when sensible.
 const choose=(j,k)=>j===k?1:j===3&&k===1?3:j===3&&k===2?3:j===2&&k===1?2:1;
 const coefficients=Array.from({length:p},(_,k)=>{
  let result=0;
  for(let j=k;j<p;j++)result+=coeff[j]*choose(j,k)*(-mean)**(j-k)/scale**j;
  return result;
 });
 if((!centredDisplay&&!coefficients.every(Number.isFinite))||
    !points.every(pt=>Number.isFinite(predict(pt.x))))
  return {ok:false,error:"The values exceed the reliable numeric range for this fit."};
 const equation=centredDisplay||!coefficients.every(Number.isFinite)?
  polynomialEquation(coeff,"t")+", where t = (x − "+fmt(mean)+") / "+fmt(scale):
  polynomialEquation(coefficients);
 return {ok:true,predict,equation,coefficients,n,method:"Ordinary least squares of y (original scale)",
  note:"Coefficients are rounded for display; plotted predictions use full precision.",
  caution:degree===3?
   "A cubic has four fitted parameters. Small datasets can be overfitted even when RMSE is low; inspect residuals and justify the extra curvature.":""};
}
/** Comparable, in-sample diagnostics for the SAME complete set of observed pairs.
 * No observations are quietly dropped for a model's domain. R² is deliberately
 * undefined for a constant response, and can be negative for authored models.
 * The residual convention is always observation minus predicted value.
 */
export function diagnoseGraphModel(points,predict){
 const n=points.length;
 if(n<2)return {ok:false,n,reason:"At least two paired observations are needed."};
 const residuals=[];
 for(let i=0;i<n;i++){
  const {x,y}=points[i];let predicted;
  try{predicted=predict(x);}catch{predicted=NaN;}
  const residual=y-predicted;
  if(!Number.isFinite(predicted)||!Number.isFinite(residual)){
   return {ok:false,n,reason:"Predictions are not finite for every observed x-value. Model diagnostics cannot be compared on different subsets."};
  }
  residuals.push({x,y,predicted,residual,index:i});
 }
 // Center y relative to an actual observation to limit cancellation.
 const reference=points[0].y,average=reference+points.reduce((sum,p)=>sum+(p.y-reference),0)/n;
 let ssResidual=0,ssTotal=0;
 for(const r of residuals){
  ssResidual+=r.residual*r.residual;
  const dy=r.y-average;
  ssTotal+=dy*dy;
 }
 if(!Number.isFinite(ssResidual)||!Number.isFinite(ssTotal))
  return {ok:false,n,reason:"Values are too large for reliable error statistics on this scale."};
 const rmse=Math.sqrt(ssResidual/n);
 const r2=ssTotal===0?null:1-ssResidual/ssTotal;
 if(!Number.isFinite(rmse)||(r2!==null&&!Number.isFinite(r2)))
  return {ok:false,n,reason:"Error statistics could not be represented reliably."};
 return {ok:true,n,rmse,r2,ssResidual,ssTotal,residuals,
  r2Note:ssTotal===0?"R² is undefined when all observed y-values are identical.":""};
}

/** Evaluate only models that the student has explicitly added. */
export function assessGraphModels(rawModels,points,compile){
 const models=normalizeGraphModels(rawModels);
 return models.map(m=>{
  const type=GRAPH_MODEL_TYPES[m.type];
  let fit;
  if(m.type==="custom"){
   if(!m.expression.trim())fit={ok:false,error:"Enter your own function of x to plot this model."};
   else try{
    const predict=compile(m.expression),min=Math.min(...points.map(p=>p.x)),max=Math.max(...points.map(p=>p.x));
   if(!(max>min))throw new Error("At least two distinct x-values are required to plot a model over a meaningful domain.");
    const finite=points.length>1&&Array.from({length:61},(_,i)=>predict(min+(max-min)*i/60))
     .filter(y=>Number.isFinite(y)&&Math.abs(y)<1e12).length;
    fit=finite>=2?{ok:true,predict,equation:/^\s*(?:y|f\(x\))\s*=/i.test(m.expression)?
      m.expression.trim():"y = "+m.expression.trim(),
     method:"Student-entered equation",n:points.length,note:"Equation entered by the student; no regression has been calculated."}:
     {ok:false,error:"The equation has fewer than two valid plotted values over the observed x-range."};
   }catch(err){fit={ok:false,error:err.message};}
  }else if([1,2,3].includes(type.degree))fit=fitPolynomialLeastSquares(points,type.degree);
  else fit=fitAdvancedGraphModel(points,m);
  const diagnostics=fit.ok===true?diagnoseGraphModel(points,fit.predict):
   {ok:false,n:points.length,reason:fit.error||"The selected model is not available."};
  return {...m,...type,...fit,valid:fit.ok===true,diagnostics};
 });
}
/** A fit is displayed only across the measured range, not extrapolated into unexplored territory. */
export function sampleGraphModel(model,points,count=260){
 if(!model.visible||!model.valid||points.length<2)return [];
 const min=Math.min(...points.map(p=>p.x)),max=Math.max(...points.map(p=>p.x));
 if(!(max>min))return [];
 return Array.from({length:count+1},(_,i)=>{
  const x=min+(max-min)*i/count;
  let y;
  try{y=model.predict(x);}catch{y=NaN;}
  return {x,y:Number.isFinite(y)&&Math.abs(y)<1e12?y:null};
 });
}
