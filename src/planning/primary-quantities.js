/**
 * Small, optional collection plan for named quantities or categories.
 * Names and units are reused in the measurement-accuracy screen.
 * These are intentions, not observations or verified instrument readings.
 */
const trim=(x,max=130)=>String(x??'').trim().slice(0,max);
export function normalizePrimaryQuantities(value,oldAccuracyPlans=[]){
 const items=Array.isArray(value)?value:
  // Older plans may already have accuracy sparks. Surface these without
  // discarding the student's recorded work or inventing new quantities.
  (Array.isArray(oldAccuracyPlans)?oldAccuracyPlans.filter(x=>x?.source==='primary').map(x=>({
   name:x.quantity,unit:x.unit
  })):[]);
 const result=[],ids=new Set(),names=new Set();
 for(const raw of items.slice(0,36)){
  if(!raw||typeof raw!=='object')continue;
  const name=trim(raw.name),unit=trim(raw.unit,70);
  if(!name||names.has(name.toLowerCase()))continue;
  names.add(name.toLowerCase());
  const generated='pq-'+(result.length+1);
  let id=/^pq-\d{1,5}$/.test(raw.id||'')?raw.id:generated;
  if(ids.has(id))id=generated;
  ids.add(id);
  result.push({id,name,unit});
  if(result.length>=10)break;
 }
 return result;
}
function markReview(state){
 if(state.planning.completed){
  state.planning.completed=false;
  state.planning.notices=['You changed your planned quantities. Recheck your source and accuracy choices.'];
 }
 if(state.handover?.confirmedAt){state.handover.confirmedAt='';state.handover.needsReview=true;}
 for(const id of ['C20','C30','C40','C60'])
  if(state.completion?.stages?.[id]==='complete')state.completion.stages[id]='needs-review';
}
export function addPrimaryQuantity(state){
 const p=state?.planning,f=p?.fields;
 if(!p||!f)return {ok:false,error:'No primary-data plan available.'};
 const name=trim(f.primaryQuantityName),unit=trim(f.primaryQuantityUnit,70);
 if(!name)return {ok:false,error:'Enter a quantity or category to add.'};
 const list=p.primaryQuantities||[];
 if(list.some(x=>x.name.toLowerCase()===name.toLowerCase()))
  return {ok:false,error:'This quantity is already in your list. Edit the existing item or use a different name.'};
 if(list.length>=10)return {ok:false,error:'Use up to 10 main quantities; focus on those that answer your aim.'};
 const id='pq-'+(Math.max(0,...list.map(x=>Number(x.id.split('-').at(-1))||0))+1);
 const item={id,name,unit};list.push(item);p.primaryQuantities=list;
 f.primaryQuantityName='';f.primaryQuantityUnit='';
 p.primaryQuantityEditId='';
 markReview(state);
 return {ok:true,record:item};
}
export function editPrimaryQuantity(state,id){
 const p=state?.planning;
 const q=p?.primaryQuantities?.find(x=>x.id===id);
 if(!q)return false;
 p.primaryQuantityEditId=id;
 p.fields.primaryQuantityName=q.name;
 p.fields.primaryQuantityUnit=q.unit;
 return true;
}
export function updatePrimaryQuantity(state){
 const p=state?.planning,f=p?.fields,idx=p?.primaryQuantities?.findIndex(x=>x.id===p.primaryQuantityEditId);
 if(idx===undefined||idx<0)return addPrimaryQuantity(state);
 const name=trim(f.primaryQuantityName),unit=trim(f.primaryQuantityUnit,70);
 if(!name)return {ok:false,error:'Enter the revised quantity name.'};
 if(p.primaryQuantities.some((q,i)=>i!==idx&&q.name.toLowerCase()===name.toLowerCase()))
  return {ok:false,error:'Another quantity already uses that name.'};
 const old=p.primaryQuantities[idx];
 if(old.name!==name||old.unit!==unit){
  const linked=p.accuracyPlans.filter(x=>x.source==='primary'&&x.quantity.toLowerCase()===old.name.toLowerCase());
  // Preserve the student's original measurement-accuracy choices when the name
  // is refined, without changing a separately edited instrument rule.
  for(const rule of linked){rule.quantity=name;rule.unit=unit;}
  p.primaryQuantities[idx]={id:old.id,name,unit};
  markReview(state);
 }
 f.primaryQuantityName='';f.primaryQuantityUnit='';
 p.primaryQuantityEditId='';
 return {ok:true,record:p.primaryQuantities[idx],updated:true};
}
export function removePrimaryQuantity(state,id){
 const p=state?.planning,idx=p?.primaryQuantities?.findIndex(x=>x.id===id);
 if(idx===undefined||idx<0)return false;
 p.primaryQuantities.splice(idx,1);
 if(p.primaryQuantityEditId===id){
  p.primaryQuantityEditId='';
  p.fields.primaryQuantityName='';p.fields.primaryQuantityUnit='';
 }
 // Do not silently delete separately saved accuracy decisions; students may
 // have measured the same quantity even if removing it from the provisional list.
 markReview(state);return true;
}
export function reusePrimaryQuantity(state,id){
 const p=state?.planning,q=p?.primaryQuantities?.find(x=>x.id===id);
 if(!q)return false;
 const existing=p.accuracyPlans?.find(x=>x.source==='primary'&&x.quantity.toLowerCase()===q.name.toLowerCase());
 if(existing){
  const keys=['primaryAccuracyQuantity','primaryAccuracyUnit','primaryAccuracyResolution','primaryAccuracyBasis','primaryAccuracyUncertainty'];
  const values=[existing.quantity,existing.unit,existing.resolution,existing.basis,existing.uncertainty];
  keys.forEach((k,i)=>p.fields[k]=values[i]);
  p.accuracyEditId=existing.id;
 }else{
  p.fields.primaryAccuracyQuantity=q.name;
  p.fields.primaryAccuracyUnit=q.unit;
  p.fields.primaryAccuracyResolution='';
  p.fields.primaryAccuracyBasis='';
  p.fields.primaryAccuracyUncertainty='';
  p.accuracyEditId='';
 }
 return true;
}
