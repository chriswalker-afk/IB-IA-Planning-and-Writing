/** A tab-local sandbox. This module never writes to the student's project key. */
export const PREVIEW_KEY='ia-pathfinder-sample-preview-v1';
export function createSamplePreview(storage,normalize){
 let personal=null,current=null,position={scroll:0};
 const write=()=>{try{storage?.setItem(PREVIEW_KEY,JSON.stringify({version:1,personal,preview:current,position}));}catch{/* Memory-only preview is still safe. */}};
 return {
  get active(){return personal!==null;},
  get position(){return position;},
  resume(){
   try{const raw=storage?.getItem(PREVIEW_KEY);if(!raw)return null;const data=JSON.parse(raw);
    if(data.version!==1||!data.preview?.demo||!data.personal)return null;
    personal=normalize(data.personal);current=normalize(data.preview);position=data.position||{scroll:0};return current;
   }catch{return null;}
  },
  begin(own,sample,origin={scroll:0}){
   if(!personal){personal=structuredClone(own);position=origin;}
   current=sample;write();return sample;
  },
  save(sample){if(!personal)return false;current=sample;write();return true;},
  leave(latestPersonal=null){
   if(!personal)return null;
   let result=personal;
   // Another tab may have updated the real investigation while this one explored.
   try{if(latestPersonal)result=normalize(JSON.parse(latestPersonal));}catch{/* Retain the in-memory original. */}
   personal=null;current=null;try{storage?.removeItem(PREVIEW_KEY);}catch{}return result;
  }
 };
}
