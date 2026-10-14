/** Canonical single mathematical-step shape, including pre-Phase-4 records. */
export const ENTRY_BASE=Object.freeze({
 id:"",phase:"legacy",fromEntryId:"",previousTakeaway:"",
 title:"",purpose:"",technique:"",knowledge:"unsure",knowledgeNotes:"",
 kind:"",status:"planned",result:"",resultRef:"",observation:"",observationText:"",
 interpretation:"",localTakeaway:"",limitations:"",nextQuestion:"",nextWhy:"",
 bridge:"",accuracyRef:"",createdAt:""
});
export function normalizeEntry(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return {...ENTRY_BASE};
 const out={...ENTRY_BASE};
 for(const key of Object.keys(out)){
  if(typeof raw[key]==="string")out[key]=raw[key].slice(0,20000);
 }
 for(const key of ["status","knowledge","phase"]){
  const choices=key==="status"?["planned","completed"]:
   key==="knowledge"?["syllabus","outside","unsure"]:
   ["first","substantial","legacy"];
  if(!choices.includes(out[key]))out[key]=ENTRY_BASE[key];
 }
 return out;
}
