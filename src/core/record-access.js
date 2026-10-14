/** Minimal, restricted record access for the existing prototype input bindings. */
const allowed=new Set(["project","scratch","entries","ui","cueNotes","cueLocations"]);
export function readRecordValue(state,path){
  if(typeof path!=="string")return undefined;
  return path.split(".").reduce((o,key)=>o==null?undefined:o[key],state);
}
export function updateRecordValue(state,path,value){
  if(typeof path!=="string")return false;
  const segments=path.split(".");
  if(segments.length<2||segments.length>5||!allowed.has(segments[0])||
    segments.some(x=>["__proto__","constructor","prototype"].includes(x)))return false;
  let target=state;
  for(const key of segments.slice(0,-1)){
    if(target===null||typeof target!=="object"||!Object.prototype.hasOwnProperty.call(target,key))return false;
    target=target[key];
  }
  if(target===null||typeof target!=="object")return false;
  const last=segments[segments.length-1];
  if(!Object.prototype.hasOwnProperty.call(target,last) &&
     !["cueNotes","cueLocations"].includes(segments[0]))return false;
  target[last]=value;
  return true;
}
