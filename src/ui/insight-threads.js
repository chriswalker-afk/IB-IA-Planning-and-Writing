/** Insight Threads: read-only views over existing student-owned evidence.
 * No inferred grade, performed calculation, document update or teacher approval.
 * Only explicit source/accuracy/step references count as established links.
 */
import {escapeHtml as e,icon} from './primitives.js';
import {linkedAccuracy,linkedSources} from '../completing/evidence-links.js';

const has=v=>typeof v==='string'&&!!v.trim();
const short=(v,n=160)=>{const t=String(v??'').trim();return t.length>n?t.slice(0,n-1)+'…':t;};
export const INSIGHT_FAMILIES=Object.freeze({
 aim:{label:'My question',icon:'target',verb:'A purpose to return to'},
 evidence:{label:'My evidence',icon:'flask',verb:'A source or method to revisit'},
 accuracy:{label:'My accuracy choices',icon:'layers',verb:'A decision to apply when relevant'},
 discovery:{label:'My discoveries',icon:'chart',verb:'A mathematical finding to build upon'},
 reflection:{label:'My reflections',icon:'lightbulb',verb:'Something to consider later'}
});
const item=(type,id,title,value,where,go,extras={})=>({
 type,id,title,value:String(value).trim(),where,go,...extras
});
const done=x=>x?.status==='completed'&&has(x.result);
const entries=s=>Array.isArray(s?.entries)?s.entries:[];
const sources=s=>Array.isArray(s?.completion?.sourceRecords)?s.completion.sourceRecords:[];
const accuracies=s=>Array.isArray(s?.completion?.accuracyDecisions)?s.completion.accuracyDecisions:[];
const limitations=s=>Array.isArray(s?.completion?.confirmedLimitations)?s.completion.confirmedLimitations:[];
export function insightItems(s){
 const p=s?.planning?.fields||{},c=s?.completion||{},out=[],math=entries(s);
 const aim=p.aim||s?.project?.aim;
 if(has(aim))out.push(item('aim','aim','Investigation aim',aim,'Planning · Investigation aim',{type:'planning',node:'N01'},
  {usage:'Keeps mathematical interpretations connected to the original question.'}));
 if(has(p.prediction||s?.project?.prediction))out.push(item('aim','prediction','Prediction or conjecture',p.prediction||s.project.prediction,
  'Planning · Prediction',{type:'planning',node:'N01P'},{usage:'Compare this with genuine findings, including results that disagree.'}));
 const planned=p.kind==='theoretical'
  ?p.theoreticalCase||p.theoreticalQuestion||p.theoreticalObject
  :p.secondaryUrl||p.primaryWhat||p.dataSource;
 if(has(planned))out.push(item('evidence','planned-evidence','Planned starting material',planned,'Planning · Evidence',
  {type:'planning',node:p.kind==='theoretical'?'N02T':'N03'},
  {usage:'A plan is not yet evidence collected or a confirmed actual source.'}));
 const first=p.firstAction||p.figurePurpose;
 if(has(first))out.push(item('discovery','planned-maths','Planned first mathematics',first,'Planning · Mathematical direction',
  {type:'planning',node:'N05V'}, {planned:true,usage:'A proposed action, not a performed calculation.'}));
 for(const source of sources(s)){
  const f=source.fields||{},v=f.actualSource||f.theoreticalObject||f.theoreticalCase||f.actualMethod;
  if(!has(v))continue;
  const connected=math.filter(x=>linkedSources(s,x).some(y=>y.id===source.id));
  out.push(item('evidence','source:'+source.id,'Recorded source or method',v,
   'IA Studio · Sources & methods',{type:'completion',node:'C20'},
   {usage:connected.length?'Explicitly linked to '+connected.length+' mathematical record'+(connected.length===1?'':'s')+'.':'Available to link to applicable mathematical work.',linked:connected.map(x=>x.id)}));
 }
 // Legacy or in-progress fields are not a saved source record.
 if(!sources(s).length&&has(c.fields?.actualSource||c.fields?.theoreticalObject)){
  out.push(item('evidence','source-current','Current source note',c.fields.actualSource||c.fields.theoreticalObject,
   'IA Studio · Sources & methods',{type:'completion',node:'C20'},
   {usage:'A current student note, not a verified source.'}));
 }
 for(const a of accuracies(s)){
  if(!has(a.quantity)||!has(a.policy))continue;
  const connected=math.filter(x=>linkedAccuracy(s,x).some(y=>y.id===a.id));
  out.push(item('accuracy','accuracy:'+a.id,a.quantity+(has(a.unit)?' ('+a.unit+')':''),
   a.policy+(has(a.resolution)?' · Original resolution: '+a.resolution:''),
   'IA Studio · Accuracy decision',{type:'completion',node:'C24'},
   {usage:connected.length?'Explicitly linked to '+connected.length+' mathematical record'+(connected.length===1?'':'s')+'.':'Use only when that quantity limits the calculation or display.',linked:connected.map(x=>x.id)}));
 }
 // Only real, explicitly recorded results get a discovery spark.
 for(let i=0;i<math.length;i++){
  const x=math[i];if(!done(x))continue;
  const follow=math.filter(y=>y.fromEntryId&&y.fromEntryId===x.id);
  out.push(item('discovery','result:'+x.id,x.title||'Mathematical result '+(i+1),
   x.localTakeaway||x.interpretation||x.observationText||x.result,
   'IA Studio · Mathematical exploration',{type:'entry',index:i},
   {entryId:x.id,needsReview:x.reviewNeeded==='yes',
    usage:follow.length?'Explicitly connects to '+follow.length+' later mathematical record'+(follow.length===1?'':'s')+'.':'Consider what the result actually establishes before choosing another method.',
    linked:follow.map(y=>y.id)}));
 }
 for(const x of limitations(s)){
  if(!has(x.explanation)||!has(x.consequence))continue;
  const index=math.findIndex(v=>v.id===x.entryId);
  out.push(item('reflection','limit:'+x.id,'Confirmed limitation',x.explanation,
   'IA Studio · Limitation and consequence',index>=0?{type:'entry',index}:{type:'completion',node:x.stage||'C20'},
   {usage:'Mathematical consequence: '+short(x.consequence,250),entryId:x.entryId||'',consequence:x.consequence}));
 }
 return out.slice(0,230);
}
export function insightForCurrent(s,node){
 const all=insightItems(s),active=entries(s)[s?.completion?.activeEntryIndex];
 const get=type=>all.filter(x=>x.type===type);
 if(/^N(?:03|04|05|06)/.test(node))return all.filter(x=>x.id==='aim'||(node==='N06'&&x.id==='planned-evidence')).slice(0,2);
 const result=active?.fromEntryId?all.filter(x=>x.id==='result:'+active.fromEntryId):[];
 const related=kind=>all.filter(x=>x.id.startsWith(kind+':')&&active&&(
   kind==='accuracy'?linkedAccuracy(s,active).some(a=>'accuracy:'+a.id===x.id):
   linkedSources(s,active).some(a=>'source:'+a.id===x.id)));
 if(['C10','C10E','C34B','C35','C60','C61','C62','C64'].includes(node)){
  const out=[...get('aim')];
  if(['C35','C60','C61','C64'].includes(node)){
   const real=get('discovery').filter(x=>!x.planned&&!x.needsReview);
   out.push(...real.slice(-1));
  }
  if(/^C6/.test(node))out.push(...get('reflection').slice(-2));
  return [...new Map(out.map(x=>[x.id,x])).values()].slice(0,3);
 }
 if(['C20','C21S','C21M','C21T','C22','C23','C24','C25','C26','C30','C31'].includes(node)){
  return all.filter(x=>x.id==='planned-evidence'||x.id==='planned-maths'||x.id==='aim').slice(0,2);
 }
 if(['C32','C33','C34','C34A','C40','C50','C40T','C40L','C35H','C35B','C35P'].includes(node)){
  const contextual=[...result,...related('accuracy'),...related('source')];
  // An unlinked accuracy/source decision is never presented as an input to this calculation.
  if(['C35H','C35B','C35P'].includes(node)){
   const real=get('discovery').filter(x=>!x.planned);
   contextual.push(...real.slice(-1));
  }
  if(['C34','C34A','C40','C50'].includes(node))contextual.push(...get('aim').slice(0,1));
  return [...new Map(contextual.map(x=>[x.id,x])).values()].slice(0,3);
 }
 return [];
}
const jumpAttrs=x=>' data-action="insight-jump" data-insight-type="'+e(x.go.type)+'"'+
 (x.go.node?' data-node="'+e(x.go.node)+'"':'')+
 (Number.isInteger(x.go.index)?' data-index="'+x.go.index+'"':'');
export function insightToken(x,{compact=false}={}){
 const meta=INSIGHT_FAMILIES[x.type];
 return '<span class="insight-token insight-'+e(x.type)+(compact?' compact':'')+'">'+icon(meta.icon)+
  '<span>'+e(meta.label)+'</span></span>';
}
export function insightCapture(s,node){
 const p=s?.planning?.fields||{},c=s?.completion||{},all=insightItems(s);
 let ids=[],kind='';
 if(['N01','N01V'].includes(node)){ids=['aim'];kind='Your investigation aim';}
 else if(node==='N01P'){ids=['prediction'];kind='Your conjecture';}
 else if(/^N03/.test(node)||node==='N02T'){ids=['planned-evidence'];kind='Your intended evidence';}
 else if(['N05V','N05'].includes(node)){ids=['planned-maths'];kind='Your first mathematical intention';}
 else if(['C20','C22','C23'].includes(node)){ids=all.filter(x=>x.id.startsWith('source:')||x.id==='source-current').map(x=>x.id);kind='Your source or method';}
 else if(node==='C24'){ids=all.filter(x=>x.type==='accuracy').map(x=>x.id);kind='Your accuracy choices';}
 else if(['C34','C40','C50','C40T'].includes(node)){
  const x=entries(s)[c.activeEntryIndex];if(x)ids=['result:'+x.id];kind='Your actual mathematical result';
 }
 if(!kind)return'';
 const existing=all.filter(x=>ids.includes(x.id));
 const spark=existing.at(-1);
 const family=spark?.type||(/Accuracy|accuracy/.test(kind)?'accuracy':/source|evidence|method/.test(kind.toLowerCase())?'evidence':/mathematical|result/.test(kind.toLowerCase())?'discovery':'aim');
 const meta=INSIGHT_FAMILIES[family];
 return '<aside class="insight-capture insight-'+family+' '+(spark?'is-captured':'is-pending')+'" aria-label="Remembered decision">'+
  '<span class="insight-capture-mark">'+icon(meta.icon)+'</span><div><strong>'+
  (spark?'Spark saved · '+e(kind):'A spark for later · '+e(kind))+'</strong><p>'+
  (spark?'Pathfinder can bring this back when it is relevant. '+e(short(spark.value,115)):
   'Your own decision can be carried forward as contextual advice when it becomes relevant.')+
  '</p></div>'+icon(spark?'check-circle':'sparkles')+'</aside>';
}
export function insightEcho(s,node){
 const items=insightForCurrent(s,node);
 if(!items.length)return'';
 return '<aside class="insight-echo" aria-label="Earlier information that may help now">'+
  '<div class="insight-echo-head">'+icon('route')+' <strong>Your ideas are back</strong>'+
  '<span>From earlier in your investigation</span></div>'+
  items.map((x,i)=>'<details class="insight-echo-item insight-'+e(x.type)+'"'+(i===0?' open':'')+'>'+
   '<summary>'+insightToken(x,{compact:true})+'<span class="insight-echo-title">'+e(short(x.title,54))+
   '</span>'+icon('chevron-right')+'</summary><div class="insight-echo-body">'+
   '<p class="insight-original">'+e(short(x.value,280))+'</p>'+
   '<p>'+e(x.usage||INSIGHT_FAMILIES[x.type].verb)+'</p>'+
   '<button type="button" class="insight-link"'+jumpAttrs(x)+'>'+icon('arrow-up-right')+
   ' Go to my original decision</button></div></details>').join('')+
  '</aside>';
}
export function insightToolkit(s,{compact=false}={}){
 const all=insightItems(s);
 const forHome=all.filter(x=>!x.planned),pinned=forHome.find(x=>x.id==='aim');
 const visible=compact?(pinned?[pinned,...forHome.filter(x=>x.id!=='aim').slice(-4)]:forHome.slice(-5)):all.slice(-10);
 const earlier=compact?[]:all.slice(0,-10);
 const card=x=>'<button type="button" class="insight-toolkit-card insight-'+e(x.type)+'"'+jumpAttrs(x)+'>'+
  insightToken(x,{compact:true})+'<strong>'+e(short(x.title,62))+'</strong>'+
  '<span class="insight-toolkit-value">'+e(short(x.value,105))+'</span>'+
  '<small>'+e(x.needsReview?'Needs review · '+x.where:x.planned?'Planned · not performed':x.where)+'</small>'+
  '</button>';
 return '<section class="insight-toolkit" aria-label="My Toolkit">'+
  '<div class="insight-toolkit-top"><div><span class="section-eyebrow">'+icon('sparkles')+
  ' INSIGHT THREADS</span><h3>My Toolkit</h3><p>Your earlier decisions and real findings, ready when they matter again.</p></div>'+
  '<span class="insight-toolkit-count">'+all.length+' saved</span></div>'+
  (visible.length?'<div class="insight-toolkit-grid">'+visible.map(card).join('')+'</div>':
   '<div class="insight-toolkit-empty">'+icon('sparkles')+' Your toolkit grows from your own decisions. Start by recording an investigation aim.</div>')+
  (earlier.length?'<details class="insight-toolkit-more"><summary>Explore '+earlier.length+' earlier sparks</summary><div class="insight-toolkit-grid">'+earlier.map(card).join('')+'</div></details>':'')+
  (compact&&all.length>visible.length?'<button type="button" class="insight-link" data-nav="path">See all '+all.length+' sparks on My Path '+icon('arrow-right')+'</button>':'')+
  '<p class="insight-toolkit-note">Saved notes and decisions are not grades, verified results or edits to your own IA document.</p></section>';
}
export function insightThreadMap(s){
 const all=insightItems(s);
 const connected=all.filter(x=>Array.isArray(x.linked)&&x.linked.length);
 if(!connected.length)return '';
 return '<section class="insight-thread-map"><div class="section-eyebrow">'+icon('route')+
  ' CONNECTIONS YOU HAVE MADE</div><h3>Threads through your investigation</h3>'+
  '<p>These connections come from explicit links in your work, not from a guessed pathway.</p>'+
  '<div class="insight-thread-links">'+connected.slice(-8).map(x=>
   '<div class="insight-thread-row insight-'+e(x.type)+'"><span class="insight-thread-origin">'+insightToken(x,{compact:true})+
   '<strong>'+e(short(x.title,70))+'</strong></span>'+
   '<span class="insight-thread-flow" aria-hidden="true"><svg viewBox="0 0 104 34" focusable="false"><path d="M3 17 C32 1 70 33 100 17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 5"/><path d="m93 12 7 5 -7 5" stroke="currentColor" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'+
   '<span>'+x.linked.length+' linked mathematical '+(x.linked.length===1?'record':'records')+'</span></div>').join('')+'</div></section>';
}