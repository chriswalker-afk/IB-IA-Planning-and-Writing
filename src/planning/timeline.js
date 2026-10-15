/** Friendly, optional IA schedule. No school deadlines are inferred. */
export const TIMELINE_STAGES=Object.freeze([
 {key:"milestonePlan",label:"Shape the question and outline the introduction",share:.10},
 {key:"milestoneData",label:"Get usable data or starting material",share:.23},
 {key:"milestoneFirstVisual",label:"Create the first graph, diagram or example",share:.34},
 {key:"milestoneVisualReview",label:"Interpret the first result in context",share:.43},
 {key:"milestoneFirstMath",label:"Complete the first substantial mathematics",share:.56},
 {key:"milestoneFurtherMath",label:"Develop further mathematics and draft the conclusion",share:.76},
 {key:"milestoneDraft",label:"Complete the full written first draft",share:.89},
 {key:"milestoneReview",label:"Revise, check and polish the final work",share:1}
]);
export const TIMELINE_KEYS=Object.freeze(TIMELINE_STAGES.map(s=>s.key));
export function milestoneLabel(key,kind=""){
 const item=TIMELINE_STAGES.find(x=>x.key===key);
 if(!item)return "";
 if(kind==="theoretical"&&key==="milestoneData")return "Choose definitions and useful starting examples";
 if(kind==="theoretical"&&key==="milestoneFirstVisual")return "Try the first diagram or simplified mathematical case";
 return item.label;
}
const pad=v=>String(v).padStart(2,"0");
export function localToday(now=new Date()){
 return now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate());
}
export function validDate(iso){
 if(typeof iso!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(iso))return false;
 const [y,m,d]=iso.split("-").map(Number);
 const parsed=new Date(Date.UTC(y,m-1,d));
 return parsed.getUTCFullYear()===y&&parsed.getUTCMonth()===m-1&&parsed.getUTCDate()===d;
}
const ms=iso=>Date.parse(iso+"T00:00:00.000Z");
export function addDays(iso,days){
 if(!validDate(iso)||!Number.isInteger(days))throw new Error("A valid start date and whole days are required.");
 return new Date(ms(iso)+days*86400000).toISOString().slice(0,10);
}
export function timelineWeek(start,date){
 if(!validDate(start)||!validDate(date))return null;
 return Math.max(1,Math.ceil((ms(date)-ms(start))/(7*86400000)));
}
/** Returns eight ordered dates in an available period of 1–52 weeks. */
export function suggestTimeline({weeks,finishEarly,startDate}){
 const weeksText=String(weeks??"").trim(),count=Number(weeksText);
 if(!/^\d{1,2}$/.test(weeksText)||!Number.isInteger(count)||count<1||count>52)
  return {ok:false,error:"Choose between 1 and 52 whole weeks."};
 if(!["yes","no"].includes(finishEarly))
  return {ok:false,error:"Choose whether you would like to finish early."};
 if(!validDate(startDate))
  return {ok:false,error:"Choose a valid date for the beginning of your plan."};
 const days=count*7;
 // A modest breathing space, never longer than three weeks or the whole period.
 const bufferDays=finishEarly==="yes"?Math.min(21,Math.max(1,Math.round(days*.15))):0;
 const workDays=days-bufferDays;
 const dates=Object.fromEntries(TIMELINE_STAGES.map(stage=>[
  stage.key,addDays(startDate,Math.round(workDays*stage.share))
 ]));
 return {
  ok:true,weeks:count,startDate,bufferDays,
  finalDay:addDays(startDate,days),
  workingFinish:addDays(startDate,workDays),
  dates
 };
}
/** Non-destructive regeneration: dates manually changed by students stay changed. */
export function generateSuggestedTimeline(state,{today=localToday(),force=false}={}){
 const f=state.planning.fields,previous=state.planning.timelineAuto||{};
 const startDate=f.timelineStart||today;
 const suggestion=suggestTimeline({weeks:f.timelineWeeks,finishEarly:f.timelineEarly,startDate});
 if(!suggestion.ok)return suggestion;
 // Use the normal Planning mutation path so exported and saved work stay aligned.
 // Imported and existing dates count as student-owned, even if generated elsewhere.
 const saved=[],preserved=[],lastAuto={...previous};
 for(const [key,date] of Object.entries(suggestion.dates)){
  if(force||!f[key]||f[key]===previous[key]){
   // applyPlanningField is passed in by the caller; the helper otherwise has no UI dependencies.
   saved.push([key,date]);lastAuto[key]=date;
  }else preserved.push(key);
 }
 lastAuto.weeks=f.timelineWeeks;
 lastAuto.early=f.timelineEarly;
 lastAuto.start=startDate;
 return {...suggestion,saved,preserved,lastAuto,needsStart:!f.timelineStart};
}
/** Apply generated dates through Planning's usual edit checks and persistence rules. */
export function applySuggestedTimeline(state,applyField,opts={}){
 const result=generateSuggestedTimeline(state,opts);
 if(!result.ok)return result;
 if(result.needsStart)applyField(state,"timelineStart",result.startDate);
 for(const [key,date] of result.saved)applyField(state,key,date);
 state.planning.timelineAuto=result.lastAuto;
 return result;
}
