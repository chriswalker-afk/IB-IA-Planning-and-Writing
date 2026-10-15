/** Stable, explicit links between student mathematics and its actual inputs. */
const str=v=>typeof v==="string"?v.trim():"";
export const cleanRefs=v=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==="string"&&x.trim()).map(x=>x.slice(0,160)))].slice(0,80):[];
export const SOURCE_FIELDS=Object.freeze(["dataStatus","actualSource","actualSourceType","sourceCitation","actualMethod","actualDate","sourcePopulation","dataCount","collectionStatus","statisticalPopulation","sampleOrCensus","samplingMethod","samplingRationale","sampleSize","responseBias","pairing","groupFairness","dataCleaning","modelEvidence","modelInputs","modelAssumptions","modelDomain","modelValidation","modelAlternative","modelSensitivity","theoreticalObject","theoreticalCase","theoreticalAssumptions","theoreticalQuestion","alternativeMethod","chosenMethod","methodReason","methodLimitation","limitationConsequence","limitationMitigation","limitationAcceptable","dataAimLink","dataStatusSummary"]);
const sourceValues=f=>Object.fromEntries(SOURCE_FIELDS.map(k=>[k,str(f?.[k]).slice(0,20000)]));
export function normalizeSources(raw){
 const seen=new Set();
 return (Array.isArray(raw)?raw:[]).filter(x=>x&&str(x.id)&&!seen.has(x.id)&&seen.add(x.id)).slice(0,40)
  .map(x=>({id:str(x.id).slice(0,160),fields:sourceValues(x.fields),legacy:x.legacy===true}));
}
export function linkedAccuracy(state,entry){
 const all=state.completion.accuracyDecisions||[],refs=cleanRefs(entry?.accuracyRefs);
 if(refs.length)return all.filter(x=>refs.includes(x.id));
 const legacy=str(entry?.accuracyRef).toLowerCase();
 if(!legacy)return[];
 // Exact stable ID first, then an unambiguous legacy quantity/symbol. Never substring/empty matches.
 const exact=all.find(x=>str(x.id).toLowerCase()===legacy);
 if(exact)return[exact];
 const matches=all.filter(x=>[x.quantity,x.symbol].some(v=>str(v)&&str(v).toLowerCase()===legacy));
 return matches.length===1?matches:[];
}
export function linkedSources(state,entry){
 const ids=cleanRefs(entry?.sourceRefs);
 return (state.completion.sourceRecords||[]).filter(x=>ids.includes(x.id));
}
export function flagInputDependents(state,initial,reason){
 const ids=new Set(initial.map(x=>x.id).filter(Boolean)),affected=new Set(initial);
 let changed=true;
 while(changed){changed=false;for(const e of state.entries){
  if(e.fromEntryId&&ids.has(e.fromEntryId)&&!affected.has(e)){
   affected.add(e);if(e.id)ids.add(e.id);changed=true;
  }
 }}
 for(const e of affected){
  e.reviewNeeded="yes";e.reviewReason=reason;
  const stage=e.phase==="first"?"C30":"C40";
  if(state.completion.stages[stage]==="complete")state.completion.stages[stage]="needs-review";
 }
 if(affected.size&&state.completion.stages.C60==="complete")state.completion.stages.C60="needs-review";
 return [...affected];
}
export function migrateEvidenceLinks(state,legacy=false){
 const c=state.completion;
 c.sourceRecords=normalizeSources(c.sourceRecords);
 if(legacy&&!c.sourceRecords.length&&str(c.fields.actualSource||c.fields.actualMethod)){
  c.sourceRecords=[{id:"source-legacy",fields:sourceValues(c.fields),legacy:true}];
  c.activeSourceId="source-legacy";
  for(const e of state.entries)if(e.kind!=="theory"&&!cleanRefs(e.sourceRefs).length)e.sourceRefs=["source-legacy"];
 }
 for(const e of state.entries){
  e.accuracyRefs=linkedAccuracy(state,e).map(x=>x.id);
  e.sourceRefs=cleanRefs(e.sourceRefs);
 }
}
export function recordSource(state,{fresh=false}={}){
 const c=state.completion;
 const old=c.sourceRecords.find(x=>x.id===c.activeSourceId);
 if(old)old.fields=sourceValues(c.fields);
 if(!fresh&&old)return {ok:true,record:old};
 if(c.sourceRecords.length>=40)return{ok:false,error:"This project already has 40 sources. Revisit an existing source."};
 if(fresh)for(const key of SOURCE_FIELDS)c.fields[key]="";
 const record={id:"source-"+Date.now().toString(36)+"-"+c.sourceRecords.length,fields:sourceValues(c.fields),legacy:false};
 c.sourceRecords.push(record);c.activeSourceId=record.id;
 return{ok:true,record};
}
export function selectSource(state,id){
 const c=state.completion,next=c.sourceRecords.find(x=>x.id===id);
 if(!next)return{ok:false,error:"That source is not in this project."};
 const old=c.sourceRecords.find(x=>x.id===c.activeSourceId);
 if(old)old.fields=sourceValues(c.fields);
 c.activeSourceId=id;Object.assign(c.fields,sourceValues(next.fields));
 return{ok:true};
}
export function beforeSourceChange(state,key,previous,value){
 const c=state.completion;
 if(!SOURCE_FIELDS.includes(key)||previous===value)return;
 // Older projects had one shared source. Preserve that provenance rather than silently losing it.
 if(!c.sourceRecords.length&&state.entries.some(e=>e.status==="completed")&&str(c.fields.actualSource||c.fields.actualMethod))migrateEvidenceLinks(state,true);
 const source=c.sourceRecords.find(x=>x.id===c.activeSourceId);
 if(!source)return;
 source.fields[key]=str(value);
 const material=["actualSource","sourceCitation","actualSourceType","actualMethod","dataStatus","samplingMethod","modelInputs","modelAssumptions","modelDomain","dataCleaning","statisticalPopulation","sampleSize","pairing"];
 if(!str(previous)||!material.includes(key))return;
 const affected=state.entries.filter(e=>cleanRefs(e.sourceRefs).includes(source.id));
 flagInputDependents(state,affected,"A linked source, sampling method or model input changed. Recheck this mathematics and its interpretation; unrelated sources are unchanged.");
}
export function sourceContextFields(state,entry,node){
 const f=state.completion.fields;
 if(/^C2/.test(node)||!entry)return f;
 const sources=linkedSources(state,entry);
 // Legacy, single-source projects retain their existing context until explicitly linked.
 if(!sources.length&&!state.completion.sourceRecords.length)return f;
 const out={...f},confirmed=sources.filter(x=>["ready","partial","theoretical"].includes(x.fields.dataStatus));
 for(const key of SOURCE_FIELDS)out[key]=[...new Set(confirmed.map(s=>str(s.fields[key])).filter(Boolean))].join("; ");
 const statuses=sources.map(x=>x.fields.dataStatus);
 out.dataStatus=statuses.includes("ready")?"ready":statuses.includes("partial")?"partial":statuses[0]||"not-started";
 const types=new Set(sources.map(x=>x.fields.actualSourceType).filter(Boolean));
 out.actualSourceType=types.size>1?"both":[...types][0]||"";
 return out;
}
export function toggleInputLink(state,kind,id,index=state.completion.activeEntryIndex){
 const entry=state.entries[index];
 const options=kind==="accuracy"?state.completion.accuracyDecisions:state.completion.sourceRecords;
 if(!entry||!["accuracy","source"].includes(kind)||!options.some(x=>x.id===id))return{ok:false,error:"Choose an existing input for this mathematical record."};
 const key=kind==="accuracy"?"accuracyRefs":"sourceRefs";
 const refs=kind==="accuracy"?linkedAccuracy(state,entry).map(x=>x.id):cleanRefs(entry.sourceRefs);
 entry[key]=refs.includes(id)?refs.filter(x=>x!==id):[...refs,id];
 if(kind==="accuracy")entry.accuracyRef=""; // An explicitly empty selection must not revive a legacy link.
 if(entry.status==="completed"&&str(entry.result))flagInputDependents(state,[entry],"Input links changed. Check that this result and its interpretation use the intended source and precision decisions.");
 return{ok:true};
}
