/**
 * Explicit, provisional sampling and measurement-precision choices.
 * Planning records are not verified sample designs or actual accuracy records.
 */
export const SAMPLING_METHODS=Object.freeze([
 {id:'census',label:'Census (every member of the defined population)',
  good:'No sampling variation for the population actually covered; can be simple when the group is small.',
  watch:'May take too long or miss members. A census of a narrow group does not represent everyone else.',
  use:'A small, accessible population you can genuinely observe in full.'},
 {id:'simple-random',label:'Simple random sample',
  good:'Each sampling unit has a known, equal chance if selected correctly; helps reduce selection bias.',
  watch:'Needs a suitable list (sampling frame); nonresponse and poor coverage still matter.',
  use:'A numbered list of accessible units and a defensible random-selection process.'},
 {id:'systematic',label:'Systematic sample (every kth unit)',
  good:'Quick to organise when a list exists; can spread selections through an ordered frame.',
  watch:'Patterns in the list can bias the result; randomise the start and check ordering.',
  use:'An accessible ordered list without a harmful repeating pattern.'},
 {id:'stratified',label:'Stratified sample',
  good:'Can represent important subgroups, especially when sizes differ or comparisons matter.',
  watch:'Needs subgroup definitions and counts; taking volunteers within strata is not random sampling.',
  use:'A defined frame containing known subgroups you need to represent.'},
 {id:'cluster',label:'Cluster sample',
  good:'Can be efficient when natural groups are easier to reach than scattered individuals.',
  watch:'Members in a cluster may resemble each other, giving less independent information.',
  use:'Access to a list of classes, teams, sites or comparable natural clusters.'},
 {id:'convenience',label:'Convenience / opportunity sample',
  good:'Fast, inexpensive and often easy to repeat or extend after an initial graph.',
  watch:'Usually not representative; people or objects easiest to reach may differ from those missed.',
  use:'An honest small pilot or investigation where the inference is limited to accessible units.'},
 {id:'voluntary',label:'Voluntary-response sample',
  good:'Very quick to invite responses and may be easy to follow up.',
  watch:'People who choose to respond can differ systematically; low response rates may worsen bias.',
  use:'An optional survey when participation is voluntary and selection limitations are acknowledged.'},
 {id:'not-applicable',label:'Not applicable — no sample of a wider population',
  good:'Appropriate for measuring a chosen object, modelling one process or using exact mathematical cases.',
  watch:'Explain what the results describe; repeated trials and measurement uncertainty may still matter.',
  use:'A specific object/process rather than a claim about a wider population.'},
 {id:'unsure',label:'Not sure yet — discuss or pilot first',
  good:'Lets you make a small permitted trial before deciding what is feasible.',
  watch:'Do not call a convenient sample random, or generalise beyond a defined population.',
  use:'You still need to establish accessible units and a workable first step.'}
]);
const samplingById=new Map(SAMPLING_METHODS.map(x=>[x.id,x]));
export const samplingMethod=id=>samplingById.get(id)||null;
export const ACCURACY_DRAFT_FIELDS=Object.freeze({
 primary:['primaryAccuracyQuantity','primaryAccuracyUnit','primaryAccuracyResolution','primaryAccuracyBasis','primaryAccuracyUncertainty'],
 secondary:['secondaryAccuracyQuantity','secondaryAccuracyUnit','secondaryAccuracyResolution','secondaryAccuracyBasis','secondaryAccuracyUncertainty']
});
export const ACCURACY_BASIS=Object.freeze({
 analogue:'Analogue scale',digital:'Digital display',estimated:'Estimate / observation',
 published:'Published measurement / documented resolution',rounded:'Inferred from rounding (not verified accuracy)',
 exact:'Exact count / category',unknown:'Not yet known'
});
const strip=(x,max=300)=>String(x??'').trim().slice(0,max);
const clean=(raw,index)=>{
 if(!raw||typeof raw!=='object'||!['primary','secondary'].includes(raw.source))return null;
 const quantity=strip(raw.quantity,130);
 if(!quantity)return null;
 const basis=Object.hasOwn(ACCURACY_BASIS,raw.basis)?raw.basis:'unknown';
 const id=/^pa-(primary|secondary)-\d{1,6}$/.test(raw.id||'')?raw.id:'pa-'+raw.source+'-'+(index+1);
 return {id,source:raw.source,quantity,unit:strip(raw.unit,70),resolution:strip(raw.resolution,160),
  basis,uncertainty:strip(raw.uncertainty,220)};
};
export function normalizePlanningAccuracy(raw){
 const list=Array.isArray(raw)?raw:[];
 const output=[],seen=new Set();
 for(const item of list.slice(0,60)){
  const rec=clean(item,output.length);if(!rec)continue;
  const identity=rec.source+'|'+rec.quantity.toLowerCase();
  if(seen.has(identity))continue;
  seen.add(identity);output.push(rec);
  if(output.length>=18)break;
 }
 // IDs must be unique even for imported/backwards-compatible documents.
 const ids=new Set();
 for(let i=0;i<output.length;i++){
  const x=output[i];
  if(ids.has(x.id))x.id='pa-'+x.source+'-'+(i+1);
  ids.add(x.id);
 }
 return output;
}
export function plannedAccuracyText(x){
 if(!x)return '';
 const increment=x.basis==='exact'?'exact count / category':
  x.resolution||'recording increment not yet confirmed';
 return x.quantity+(x.unit?' ('+x.unit+')':'')+' · '+increment+
  (x.uncertainty?' · uncertainty to check: '+x.uncertainty:'');
}
export const samplingSparkValue=fields=>{
 const method=samplingMethod(fields?.primarySamplingMethod);
 if(!method)return'';
 return method.label+
  (fields.primaryPopulation?' · population: '+fields.primaryPopulation:'')+
  (fields.primarySamplingUnit?' · unit: '+fields.primarySamplingUnit:'')+
  (fields.primarySamplingFrame?' · frame: '+fields.primarySamplingFrame:'')+
  (fields.primaryRepeatable?' · follow-up: '+fields.primaryRepeatable:'');
};
function invalidatePlan(state){
 if(state.planning.completed){
  state.planning.completed=false;
  state.planning.notices=['Your planned sampling or accuracy choices changed. Review them before carrying the plan forward.'];
 }
 if(state.handover?.confirmedAt){state.handover.confirmedAt='';state.handover.needsReview=true;}
 for(const stage of ['C20','C30','C40','C60'])
  if(state.completion?.stages?.[stage]==='complete')state.completion.stages[stage]='needs-review';
}
export function savePlannedAccuracy(state,source){
 if(!ACCURACY_DRAFT_FIELDS[source])return{ok:false,error:'Unknown data source.'};
 const [q,u,r,b,unc]=ACCURACY_DRAFT_FIELDS[source],fields=state.planning.fields;
 const quantity=strip(fields[q],130),unit=strip(fields[u],70);
 const resolution=strip(fields[r],160),basis=strip(fields[b],30),uncertainty=strip(fields[unc],220);
 if(!quantity)return{ok:false,error:'Name the quantity or category before saving its accuracy.'};
 if(!['exact','unknown'].includes(basis)&&!resolution)
  return{ok:false,error:'Record the instrument increment or table rounding (for example, nearest 0.1 cm), or choose Not yet known / Exact count.'};
 if(basis&&!Object.hasOwn(ACCURACY_BASIS,basis))return{ok:false,error:'Choose a supported type of measurement or source.'};
 const list=state.planning.accuracyPlans||[];
 const editId=state.planning.accuracyEditId||'';
 const byEdit=editId?list.findIndex(x=>x.id===editId&&x.source===source):-1;
 const byName=list.findIndex(x=>x.source===source&&x.quantity.toLowerCase()===quantity.toLowerCase());
 if(byEdit>=0&&byName>=0&&byName!==byEdit)
  return{ok:false,error:'You already saved an accuracy rule for that quantity. Edit that one instead.'};
 const found=byEdit>=0?byEdit:byName;
 if(found<0&&list.length>=18)return{ok:false,error:'This plan has room for 18 quantities. Remove an outdated decision before adding more.'};
 const current=found>=0?list[found]:null;
 const id=current?.id||'pa-'+source+'-'+(1+Math.max(0,...list.filter(x=>x.source===source)
  .map(x=>Number((x.id||'').match(/\d+$/)?.[0]||0))));
 const item=clean({id,source,quantity,unit,resolution:basis==='exact'?'':resolution,
  basis:basis||'unknown',uncertainty},list.length);
 if(current&&JSON.stringify(current)===JSON.stringify(item)){
  for(const key of ACCURACY_DRAFT_FIELDS[source])fields[key]='';
  state.planning.accuracyEditId='';
  return{ok:true,updated:true,record:current};
 }
 if(found>=0)list[found]=item;else list.push(item);
 state.planning.accuracyPlans=list;
 for(const k of ACCURACY_DRAFT_FIELDS[source])fields[k]='';
 state.planning.accuracyEditId='';
 invalidatePlan(state);
 return{ok:true,updated:found>=0,record:item};
}
export function removePlannedAccuracy(state,id){
 const list=state.planning?.accuracyPlans;
 if(!Array.isArray(list))return false;
 const pos=list.findIndex(x=>x.id===id);
 if(pos<0)return false;
 list.splice(pos,1);
 if(state.planning.accuracyEditId===id)state.planning.accuracyEditId='';
 invalidatePlan(state);
 return true;
}
export function editPlannedAccuracy(state,id){
 const rec=state.planning?.accuracyPlans?.find(x=>x.id===id);
 if(!rec)return false;
 const fields=ACCURACY_DRAFT_FIELDS[rec.source];
 for(const [i,key] of fields.entries())
  state.planning.fields[key]=[rec.quantity,rec.unit,rec.resolution,rec.basis,rec.uncertainty][i];
 state.planning.accuracyEditId=rec.id;
 return rec.source;
}
