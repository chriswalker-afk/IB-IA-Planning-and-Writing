import {CRITERIA,REVIEW_IDS} from './catalog.js';
import {reviewEditChanged} from '../completing/review.js';
const fields=new Set(['location','note','action','selfMark']);
/** Only an explicit student edit writes these existing self-review records. */
export function editCriterionReview(state,{mode,id,field,value,level=''}){
 if(!['draft','final'].includes(mode)||!Object.hasOwn(REVIEW_IDS,id)||!fields.has(field)||typeof value!=='string')return false;
 const key=mode+'-'+REVIEW_IDS[id],r=state.completion?.review?.records?.[key];if(!r)return false;
 if(field==='selfMark'){
  if(value!==''&&(!/^\d$/.test(value)||+value>CRITERIA[id].max))return false;
  if(id==='E'&&value!==''&&!['SL','HL'].includes(level))return false;
 }
 const before=r[field]||'',beforeLevel=r.markLevel||'';r[field]=value.slice(0,5000);
 if(field==='selfMark'&&id==='E')r.markLevel=value===''?'':level;
 reviewEditChanged(state,'completion.review.records.'+key+'.'+field,before,r[field]);
 return before!==r[field]||beforeLevel!==(r.markLevel||'');
}
