import {LIMITATION_GUIDANCE} from "./guidance-catalog.js";
import {guidanceContext,isDone,familyOf} from "./guidance-context.js";
const str=v=>typeof v==="string"?v.trim():"";
const matches=(v,re)=>re.test(String(v??"").toLowerCase());
const includes=(families,key)=>families.has(key);
const sampleHas=(ctx,re)=>ctx.hasActualSample&&matches(ctx.sample,re);
const measurementHas=(ctx,re)=>ctx.hasActualSource&&matches(ctx.f.actualMethod+" "+ctx.f.actualSource,re);
const substantive=(ctx)=>ctx.real&&ctx.entry?.phase!=="first";
const limitationRelevant=(id,x)=>{
 const {f,p,statistical,modelling,theoretical,method,real,hasActualSource,hasActualSample,entry,
  accuracy,sourceType}=x;
 const empirical=hasActualSource&&!theoretical;
 const prior=String(f.dataCleaning||"")+" "+String(f.responseBias||"")+" "+String(f.sampleSize||"");
 const tech=String(entry?.technique||"")+" "+String(entry?.title||"");
 switch(id){
  case "L01":return statistical&&sampleHas(x,/volunt|convenien|opportun|self.select/)&&!!str(f.statisticalPopulation);
  case "L02":return statistical&&sampleHas(x,/simple.random|random.sample/)&&matches(prior+" "+f.samplingRationale,/frame|cover|exclude|incomplete|list/);
  case "L03":return statistical&&sampleHas(x,/stratified/)&&matches(prior+" "+f.samplingRationale,/unequal|disproportion|weight|unbalanced/);
  case "L04":return statistical&&sampleHas(x,/systematic/)&&matches(f.samplingRationale+" "+f.actualMethod,/order|period|interval|repeat|cycle/);
  case "L05":return statistical&&sampleHas(x,/census/)&&!!str(f.statisticalPopulation);
  case "L06":return statistical&&hasActualSample&&matches(f.groupFairness+" "+prior,/group|unequal|size|unbalanced|few|small/);
  case "L07":return statistical&&measurementHas(x,/survey|questionnaire|rating.scale|subjective/);
  case "L08":return statistical&&hasActualSource&&matches(f.pairing+" "+f.groupFairness,/different.condit|matched|paired|group/);
  case "L09":return empirical&&matches(f.dataCleaning,/exclud|remov|filter|missing|imput|omit/);
  case "L10":return empirical&&["secondary","both"].includes(sourceType)&&
   matches(f.actualSource+" "+f.sourceCitation+" "+f.secondaryScope,/merged|combined|multiple.year|different.year|different.source|period/);
  case "L11":return real&&includes(method,"pmcc")&&matches(f.modelEvidence+" "+tech,/aggregate|group.mean|group.average/);
  case "L12":return real&&includes(method,"pmcc");
  case "L13":return real&&includes(method,"linear-regression");
  case "L14":return real&&(includes(method,"pmcc")||includes(method,"fitted-model"))&&
   matches(f.conclusionAdvice+" "+p.intendedUse+" "+entry?.interpretation,/recommend|cause|effect|advice|decision|impact/);
  case "L15":return real&&includes(method,"spearman");
  case "L16":return real&&includes(method,"normal");
  case "L17":return real&&includes(method,"two-sample-t");
  case "L18":return real&&includes(method,"chi-independence");
  case "L19":return real&&includes(method,"chi-fit");
  case "L20":return real&&includes(method,"binomial");
  case "L21":return real&&includes(method,"probability");
  case "L22":return measurementHas(x,/stopwatch|manual.timing|hand.tim/);
  case "L23":return measurementHas(x,/video|frame.rate|frames.per.second|camera/);
  case "L24":return real&&includes(method,"geometric-model")&&accuracy.length>0&&!theoretical;
  case "L25":return real&&includes(method,"exponential");
  case "L26":return real&&includes(method,"quadratic-fit")&&empirical;
  case "L27":return real&&includes(method,"sinusoidal");
  case "L28":return real&&includes(method,"optimisation");
  case "L29":return real&&includes(method,"power");
  case "L30":return real&&includes(method,"voronoi");
  case "L31":return real&&includes(method,"rates-from-data")&&empirical;
  case "L32":return real&&includes(method,"numerical-integration");
  case "L33":return real&&includes(method,"fitted-model")&&!!str(f.modelValidation||f.modelEvidence);
  case "L34":return real&&(includes(method,"fitted-model")||includes(method,"optimisation"))&&!!str(f.modelAssumptions);
  case "L35":return real&&(includes(method,"proof")||theoretical)&&matches(entry?.result+" "+entry?.interpretation,/examples?|case|conjectur|general|pattern/);
  case "L36":return real&&includes(method,"algebra")&&matches(entry?.purpose+" "+entry?.technique+" "+entry?.interpretation,/domain|inverse|divid|root|restriction|exclu/);
  case "L37":return real&&(includes(method,"statistic")||includes(method,"fitted-model"))&&
   matches(f.actualMethod+" "+f.sourcePopulation+" "+f.actualSource,/time.series|repeated|longitudinal|same.person|each.day/);
  case "L38":return empirical&&x.accuracy.length>0&&
   matches(f.accuracyResolution+" "+f.actualMethod+" "+x.accuracy.map(a=>a.resolution).join(" "),/round|nearest|resolution|capp|censor|limited|threshold|digit/);
  default:return false;
 }
};
const ordering=["L01","L05","L09","L10","L22","L23","L38","L12","L13","L14","L15","L24","L25","L26","L28","L33","L34","L35","L36"];
export function relevantLimitations(state,node=state.completion.current){
 const ctx=guidanceContext(state,node);
 const dataStage=/^C2(?:0|1[SMT]?|2|3|4|5|6)$/.test(node),
   mathsStage=["C40","C50","C40D","C40T","C40L"].includes(node);
 if(!dataStage&&!mathsStage)return[];
 const matches=LIMITATION_GUIDANCE.filter(x=>
  (dataStage&&x.stage==="C20-C26"||mathsStage&&x.stage==="C40-C50")&&
  limitationRelevant(x.id,ctx)
 );
 const recorded=new Set(ctx.confirmedLimitations.map(x=>x.sourceId+"@"+x.entryId));
 return matches.map(x=>({
  ...x,stageContext:dataStage?"data":"math",
  entryId:mathsStage?ctx.entry?.id||"":"",
  previouslyRecorded:recorded.has(x.id+"@"+(mathsStage?ctx.entry?.id||"":""))
 })).sort((a,b)=>{
  const p=id=>ordering.indexOf(id)<0?100+Number(id.slice(1)):ordering.indexOf(id);
  return p(a.id)-p(b.id);
 });
}
export function selectLimitation(state,id){
 const eligible=relevantLimitations(state);
 const match=eligible.find(x=>x.id===id);
 if(id!=="custom"&&!match)return{ok:false,error:"That example is not relevant to this stage or actual mathematics."};
 const c=state.completion,ctx=guidanceContext(state);
 c.limitationDraft={id,entryId:ctx.inMath?ctx.entry?.id||"":"",
  explanation:"",consequence:"",mitigation:"",location:""};
 c.guidanceUi.limitDraftVisible=true;
 return{ok:true};
}
export function recordLimitation(state){
 const c=state.completion,d=c.limitationDraft;
 if(!d||!d.id)return{ok:false,error:"Choose an applicable example or enter your own limitation."};
 if(!str(d.explanation)||!str(d.consequence))
  return{ok:false,error:"Explain WHAT genuinely applies and HOW it changes the mathematical inference before saving. A suggested question is not evidence."};
 if(d.id!=="custom"&&!relevantLimitations(state).some(x=>x.id===d.id&&x.entryId===d.entryId))
  return{ok:false,error:"The mathematical context changed; review this example again."};
 const record={id:"lim-"+Date.now().toString(36)+"-"+c.confirmedLimitations.length,
   sourceId:d.id==="custom"?"student":d.id,stage:c.current,entryId:d.entryId,
   explanation:str(d.explanation).slice(0,5000),consequence:str(d.consequence).slice(0,5000),
   mitigation:str(d.mitigation).slice(0,3000),location:str(d.location).slice(0,500),
   at:new Date().toISOString()};
 c.confirmedLimitations=c.confirmedLimitations.filter(x=>!(x.sourceId===record.sourceId&&x.entryId===record.entryId))
  .concat(record).slice(-100);
 c.limitationDraft={id:"",entryId:"",explanation:"",consequence:"",mitigation:"",location:""};
 c.guidanceUi.limitDraftVisible=false;
 return{ok:true,record};
}
export function confirmedLimitationsForConclusion(state){
 return state.completion.confirmedLimitations.filter(x=>str(x.explanation)&&str(x.consequence));
}
export const limitationIds=()=>LIMITATION_GUIDANCE.map(x=>x.id);
