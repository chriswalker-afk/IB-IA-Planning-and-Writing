import {newDistributionDraft,normalizeDistributionDraft,analyzeDistribution,DISTRIBUTION_KINDS,
 distributionSignature,saveDistributionFigure} from "./distribution-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";
import {linkRepresentationFigure} from "./figure-linking.js";
export function setDistributionField(studio,key,value){
 const d=studio.draft;
 if(!(key in d)||key==="edited")return false;
 if(["showMean","showProbability","showParameters"].includes(key)){if(typeof value!=="boolean")return false;d[key]=value;}
 else if(["kind","mode","size","printStyle","sourceKind"].includes(key)){
  const allowed={kind:DISTRIBUTION_KINDS,mode:["none","left","right","between","outside","exact"],
   size:["compact","standard","wide"],printStyle:["colour","mono"],
   sourceKind:["theoretical","primary","secondary","unsure"]};
  if(!allowed[key].includes(value))return false;
  d[key]=value;if(key==="kind"&&["normal","uniform"].includes(value)&&d.mode==="exact")d.mode="none";
 }else if(typeof value==="string")d[key]=value.slice(0,key==="customPoints"?3200:["note","sourceCredit"].includes(key)?800:180);
 else return false;
 d.edited=true;return true;
}
export function freshDistribution(studio){studio.activeId="";studio.draft=newDistributionDraft();studio.open=true;}
export function loadDistribution(studio,id){
 const fig=studio.figures.find(f=>f.id===id);if(!fig)return false;
 studio.activeId=id;studio.draft=normalizeDistributionDraft(fig.draft);studio.open=true;return true;
}
function flagReview(state,previous,record){
 if(!previous?.entryId||distributionSignature(previous.draft)===distributionSignature(record.draft))return false;
 const entry=state.entries.find(e=>e.id===previous.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";
 entry.reviewReason="A linked probability distribution changed. Check the model parameters, event boundaries, probability and IA interpretation.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";return true;
}
export function saveDistributionDraft(state){
 const studio=state.distributionStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 const saved=saveDistributionFigure(studio);
 return saved.ok?{...saved,reviewNeeded:flagReview(state,previous,saved.record)}:saved;
}
export function saveAndLinkDistribution(state){
 const studio=state.distributionStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 const q=analyzeDistribution(studio.draft);
 if(!q.ready)return {ok:false,error:q.issues[0]};
 const active=completeEntry(state);
 let index=previous?.entryId?state.entries.findIndex(e=>e.id===previous.entryId):-1;
 if(index<0&&["first","substantial"].includes(active?.phase))index=state.completion.activeEntryIndex;
 if(index<0){const created=startFirstRepresentation(state);if(!created.ok)return created;index=created.index??state.completion.activeEntryIndex;}
 const entry=state.entries[index],saved=saveDistributionFigure(studio,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=flagReview(state,previous,saved.record);
 linkRepresentationFigure(state,"distribution",saved.record,entry);
 if(!entry.title?.trim())entry.title=saved.record.draft.title;
 if(!entry.technique?.trim())entry.technique=({normal:"Normal probability model",binomial:"Binomial probability model",poisson:"Poisson count model",uniform:"Continuous uniform density model",custom:"Custom discrete probability model"})[saved.record.draft.kind];
 entry.kind="diagram";state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 if(entry.phase==="first")state.completion.fields.firstType="diagram";
 return {...saved,index,reviewNeeded};
}
