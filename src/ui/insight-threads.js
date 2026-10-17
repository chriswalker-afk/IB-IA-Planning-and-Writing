/** Insight Threads: read-only views over existing student-owned evidence.
 * No inferred grade, performed calculation, document update or teacher approval.
 * Only explicit source/accuracy/step references count as established links.
 */
import {escapeHtml as e,icon} from './primitives.js';
import {linkedAccuracy,linkedSources} from '../completing/evidence-links.js';
import {routeById} from '../planning/investigative-routes.js';
import {samplingMethod,samplingSparkValue,plannedAccuracyText} from '../planning/data-decisions.js';

const has=v=>typeof v==='string'&&!!v.trim();
const short=(v,n=160)=>{const t=String(v??'').trim();return t.length>n?t.slice(0,n-1)+'…':t;};
export const INSIGHT_FAMILIES=Object.freeze({
 title:{label:'My working title',icon:'sparkles',verb:'A provisional direction to reconsider'},
 aim:{label:'My question',icon:'target',verb:'A question to return to'},
 motivation:{label:'My motivation',icon:'compass',verb:'Why answering this question matters'},
 pathway:{label:'My investigative route',icon:'route',verb:'An optional first step and possible directions'},
 evidence:{label:'My evidence',icon:'flask',verb:'A source or method to revisit'},
 sampling:{label:'My sampling decision',icon:'layers',verb:'A provisional sampling approach to confirm with actual observations'},
 accuracy:{label:'My accuracy choices',icon:'layers',verb:'A decision to apply when relevant'},
 discovery:{label:'My discoveries',icon:'chart',verb:'A mathematical finding to build upon'},
 reflection:{label:'My reflections',icon:'lightbulb',verb:'Something to consider later'},
 learning:{label:'My mathematical learning',icon:'book',verb:'Mathematics independently understood'}
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
 if(has(p.provisionalTitle))out.push(item('title','working-title','Provisional IA title',p.provisionalTitle,
  'Planning · Working title',{type:'planning',node:'N01'},
  {usage:'This title is provisional. Review whether it still describes the mathematical question you really explored.'}));
 if(has(aim))out.push(item('aim','aim','Investigation aim',aim,'Planning · Investigation aim',{type:'planning',node:'N01'},
  {usage:'Keeps mathematical interpretations connected to the original question.'}));
 const motivation=p.beneficiary||p.motivation||s?.project?.beneficiary||p.intendedUse;
 if(has(motivation))out.push(item('motivation','motivation','My motivation',motivation,
  'Planning · Motivation',{type:'planning',node:'N01V'},
  {usage:'Revisit why finding the answer matters. Your eventual conclusions and any advice must be supported by the actual mathematics.'}));
 const chosenJourney=routeById(s?.planning?.routeExplorer?.selectedRoute);
 if(chosenJourney)out.push(item('pathway','investigative-route','My provisional investigative route',
  chosenJourney.title+' · Start here: '+chosenJourney.first[0],
  'Planning · Mathematical routes',{type:'planning',node:'N02M'},
  {planned:true,usage:'This is a possible starting route, not mathematics already performed. Use actual findings to decide whether a branch is relevant.'}));
 if(has(p.prediction||s?.project?.prediction))out.push(item('aim','prediction','Prediction or conjecture',p.prediction||s.project.prediction,
  'Planning · Prediction',{type:'planning',node:'N01P'},{usage:'Compare this with genuine findings, including results that disagree.'}));
 const planned=p.kind==='theoretical'
  ?p.theoreticalCase||p.theoreticalQuestion||p.theoreticalObject
  :p.secondaryUrl||p.primaryWhat||p.dataSource;
 if(has(planned))out.push(item('evidence','planned-evidence','Planned starting material',planned,'Planning · Evidence',
  {type:'planning',node:p.kind==='theoretical'?'N02T':'N03'},
  {usage:'A plan is not yet evidence collected or a confirmed actual source.'}));
 const sampling=samplingMethod(p.primarySamplingMethod);
 if(sampling)out.push(item('sampling','sampling-plan','My planned sampling approach',
  samplingSparkValue(p),'Planning · Primary data sampling',{type:'planning',node:'N03P'},
  {planned:true,usage:'A proposed approach only. Check the real sample, sampling frame, participation and which population the data genuinely represent.'}));
 for(const plan of Array.isArray(s?.planning?.accuracyPlans)?s.planning.accuracyPlans:[]){
  if(!plan.quantity)continue;
  out.push(item('accuracy','planned-accuracy:'+plan.id,'Planned accuracy · '+plan.quantity,
   plannedAccuracyText(plan),'Planning · '+(plan.source==='secondary'?'Published data':'Primary measurements'),
   {type:'planning',node:plan.source==='secondary'?'N03S':'N03P'},
   {planned:true,plannedSource:plan.source,
    usage:'This is a planned recording or rounding rule, not verified measurement accuracy. Confirm the original instrument or published methodology before calculating or reporting results.'}));
 }
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
 for(let i=0;i<math.length;i++){
  const x=math[i];
  const learned=x.mathsInsight||x.understandingExample||x.knowledgeNotes;
  if(!has(learned)||!has(x.result)||x.status!=='completed'||!['outside','mixed'].includes(x.knowledge))continue;
  out.push(item('learning','learning:'+x.id,'Mathematics I learned: '+(x.title||'My technique'),learned,'IA Studio · Mathematical learning',{type:'entry',index:i},
   {usage:'You recorded this understanding while using a technique outside or partly outside your course. Explain genuine new mathematics in your own words.'}));
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
 const named=id=>all.find(x=>x.id===id);
 const compact=ids=>ids.map(named).filter(Boolean);
 if(node==='N01V')return compact(['aim','working-title']);
 if(/^N(?:02|03|04|05|06)/.test(node))return compact(['aim','motivation','working-title']).slice(0,2);
 const result=active?.fromEntryId?all.filter(x=>x.id==='result:'+active.fromEntryId):[];
 const related=kind=>all.filter(x=>x.id.startsWith(kind+':')&&active&&(
  kind==='accuracy'?linkedAccuracy(s,active).some(a=>'accuracy:'+a.id===x.id):
  linkedSources(s,active).some(a=>'source:'+a.id===x.id)));
 const latestResult=get('discovery').filter(x=>!x.planned&&!x.needsReview).at(-1);
 if(['C10','C10E','C02','C34B','C35','C60','C61','C62','C64'].includes(node)){
  const prep=['C10','C10E'].includes(node)?compact(['working-title','aim','motivation']):
   compact(['aim','motivation']);
  if(['C34B','C35','C60','C61','C62','C64'].includes(node)&&latestResult)prep.push(latestResult);
  if(/^C6/.test(node)){
   prep.push(...get('reflection').slice(-1));
   prep.push(...get('learning').slice(-1));
  }
  return [...new Map(prep.map(x=>[x.id,x])).values()].slice(0,3);
 }
 if(node==='C21S')return [...compact(['sampling-plan','planned-evidence','aim'])].slice(0,3);
 if(node==='C24'){
  const planned=all.filter(x=>x.id.startsWith('planned-accuracy:')).slice(0,2);
  return [...planned,...compact(['planned-evidence','aim'])].slice(0,3);
 }
 if(['C20','C21M','C21T','C22','C23','C25','C26','C30','C31'].includes(node)){
  const standard=all.filter(x=>x.id==='planned-evidence'||x.id==='planned-maths'||x.id==='aim').slice(0,2);
  if(['C20','C22','C26'].includes(node)&&named('motivation'))standard.push(named('motivation'));
  if(['C26','C30','C31'].includes(node)&&named('investigative-route'))standard.push(named('investigative-route'));
  return standard.slice(0,3);
 }
 if(['C32','C33','C34','C34A','C40','C50','C40T','C40L','C35H','C35B','C35P'].includes(node)){
  const contextual=[...result,...related('accuracy'),...related('source')];
  if(['C34','C34A','C40','C50'].includes(node)&&!related('accuracy').length&&contextual.length<2)
   contextual.push(...all.filter(x=>x.id.startsWith('planned-accuracy:')).slice(0,1));
  if(['C35H','C35B','C35P'].includes(node)&&latestResult)contextual.push(latestResult);
  if(['C34','C34A','C40','C50'].includes(node))contextual.push(...compact(['aim']));
  if(['C34','C34A'].includes(node))contextual.push(...compact(['motivation']));
  if(['C35H','C35B','C35P'].includes(node)&&named('investigative-route')&&contextual.length<3)
   contextual.push(named('investigative-route'));
  if(['C40','C50','C40T'].includes(node)&&active?.fromEntryId)
   contextual.push(...get('learning').filter(x=>x.id==='learning:'+active.fromEntryId));
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
 if(node==='N01'){ids=['working-title'];kind='Your provisional title';}
  else if(node==='N01A'){ids=['aim'];kind='Your investigation aim';}
  else if(node==='N01V'){ids=['motivation'];kind='Your motivation';}
 else if(node==='N01P'){ids=['prediction'];kind='Your conjecture';}
 else if(node==='N03P'){
  ids=['sampling-plan',...all.filter(x=>x.id.startsWith('planned-accuracy:')&&x.plannedSource==='primary').map(x=>x.id)];
  kind='Your planned sampling and accuracy';
 }
 else if(node==='N03S'){
  ids=all.filter(x=>x.id.startsWith('planned-accuracy:')&&x.plannedSource==='secondary').map(x=>x.id);
  kind='Your planned source precision';
 }
 else if(/^N03/.test(node)||node==='N02T'){ids=['planned-evidence'];kind='Your intended evidence';}
 else if(node==='N02M'||node==='N04R'||node==='N04S'){ids=['investigative-route'];kind='Your provisional investigative route';}
 else if(['N05V','N05'].includes(node)){ids=['planned-maths'];kind='Your first mathematical intention';}
 else if(['C20','C22','C23'].includes(node)){ids=all.filter(x=>x.id.startsWith('source:')||x.id==='source-current').map(x=>x.id);kind='Your source or method';}
 else if(node==='C24'){ids=all.filter(x=>x.type==='accuracy').map(x=>x.id);kind='Your accuracy choices';}
 else if(['C34','C40','C50','C40T'].includes(node)){
  const x=entries(s)[c.activeEntryIndex];if(x)ids=['result:'+x.id];kind='Your actual mathematical result';
 }
 if(['C35','C60','C61','C62','C64'].includes(node)){
  ids=all.filter(x=>x.type==='reflection'||x.type==='learning').slice(-1).map(x=>x.id);
  kind=ids.length?'Your mathematical reflections':'';
 }
 if(!kind)return'';
 const existing=all.filter(x=>ids.includes(x.id));
 const spark=existing.at(-1);
 const family=spark?.type||(node==='N01'?'title':/Accuracy|accuracy/.test(kind)?'accuracy':/source|evidence|method/.test(kind.toLowerCase())?'evidence':/mathematical|result/.test(kind.toLowerCase())?'discovery' :/reflection/.test(kind.toLowerCase())?'reflection':'aim');
 const meta=INSIGHT_FAMILIES[family];
 return '<aside class="insight-capture insight-'+family+' '+(spark?'is-captured':'is-pending')+
   '" data-insight-source="'+e(node)+'" aria-label="Remembered decision">'+
  '<span class="insight-capture-mark">'+icon(meta.icon)+'</span><div><strong>'+
  (spark?'Spark saved · '+e(kind):'A spark for later · '+e(kind))+'</strong><p>'+
  (spark?'Pathfinder can bring this back when it is relevant. '+e(short(spark.value,115)):
   'Your own decision can be carried forward as contextual advice when it becomes relevant.')+
  '</p></div>'+icon(spark?'check-circle':'sparkles')+'</aside>';
}
export function insightMeaning(s,node,x){
 const active=entries(s)[s?.completion?.activeEntryIndex];
 if(x.id==='sampling-plan')
  return 'You chose this sampling strategy earlier. Verify the real method and units used, including who was excluded or unavailable. Convenience can be useful, but it does not justify population-wide generalisations.';
 if(x.id.startsWith('planned-accuracy:'))
  return 'You saved this degree of accuracy while planning. Check the actual instrument resolution or source metadata; do not assume that rounded digits equal measurement accuracy. Record the confirmed quantity and uncertainty in IA Studio.';
 if(x.type==='accuracy'&&['C34','C34A','C40','C50','C40T','C40L'].includes(node)){
  return 'This is the precision policy you linked to the active mathematics. Use it when these measurements actually limit the accuracy of this result; retain guard digits during calculations.';
 }
 if(x.type==='evidence'&&['C32','C33','C34','C40','C50','C40T'].includes(node)&&x.id.startsWith('source:')){
  return 'You explicitly linked this source to your mathematics. Check the original values, units and method before relying on the finding.';
 }
 if(x.id==='working-title')return 'This is a provisional signpost, not a result. Adapt your title if the actual mathematics leads to a more precise question.';
 if(x.id==='investigative-route'){
  return 'This is only the starting route you explored. Decide your next mathematics from what your genuine results reveal; no branch is required, and there is no obligation to add more techniques.';
 }
 if(x.id==='motivation'){
  if(['C34','C34A','C34B','C35','C35H','C35B','C35P','C60','C61','C62','C64'].includes(node))
   return 'Why did you want this answer? Connect what your genuine mathematics established to that reason, including if the result is limited, unexpected or does not justify a practical recommendation.';
  return 'Keep your question and motivation together: does each choice help you learn, explain or decide what you originally set out to understand? Your findings may change your motivation.';
 }
  if(x.id==='aim'&&['C34','C34A','C35','C40','C50','C60','C61','C62','C64'].includes(node)){
  return 'Connect what your mathematics actually established to this precise investigation question. Does the result answer all of it, or only a narrower part?';
 }
 if(x.type==='discovery'&&['C35','C35H','C35B','C35P','C40','C50'].includes(node)){
  return 'Use this genuine earlier result to decide whether another mathematical question logically follows. An extra calculation is not necessary unless it develops your aim.';
 }
 if(x.type==='reflection'&&/^C6/.test(node)){
  return 'You confirmed this limitation earlier. State how its mathematical consequence restricts the answer to your aim, rather than adding an unrelated generic weakness.';
 }
 if(x.type==='learning'){
  return 'You recorded independently developed understanding of this mathematical method. If it lies outside your course, explain the mathematics accurately in your own words; familiar syllabus techniques normally just need clear use.';
 }
 if(x.id==='planned-evidence')return 'This was a proposed starting route. Check whether the material was actually obtained before presenting it as evidence.';
 return x.usage||INSIGHT_FAMILIES[x.type].verb;
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
   '<p>'+e(insightMeaning(s,node,x))+'</p>'+
   '<button type="button" class="insight-link"'+jumpAttrs(x)+'>'+icon('arrow-up-right')+
   ' Go to my original decision</button></div></details>').join('')+
  '</aside>';
}
export function insightToolkit(s,{compact=false}={}){
 const all=insightItems(s);
 const forHome=all.filter(x=>!x.planned||x.id==='investigative-route'||x.id==='sampling-plan'||x.id.startsWith('planned-accuracy:'));
 const pinned=forHome.filter(x=>x.id==='working-title'||x.id==='aim'||x.id==='investigative-route'||x.id==='sampling-plan'||
  (x.id.startsWith('planned-accuracy:')&&x.id===forHome.find(y=>y.id.startsWith('planned-accuracy:'))?.id)).slice(0,5);
 const visible=compact?[...pinned,...forHome.filter(x=>!['working-title','aim'].includes(x.id)).slice(-(5-pinned.length))]:all.slice(-10);
 const earlier=compact?[]:all.slice(0,-10);
 const card=x=>'<button type="button" class="insight-toolkit-card insight-'+e(x.type)+'"'+jumpAttrs(x)+'>'+
  insightToken(x,{compact:true})+'<strong>'+e(short(x.title,62))+'</strong>'+
  '<span class="insight-toolkit-value">'+e(short(x.value,105))+'</span>'+
  '<small>'+e(x.needsReview?'Needs review · '+x.where:x.planned?'Planned · not performed':x.where)+'</small>'+ (x.linked?.length?'<small class="insight-toolkit-used">Connected to '+x.linked.length+' mathematical '+(x.linked.length===1?'step':'steps')+'</small>':'')+
  '</button>';
 return '<section class="insight-toolkit" aria-label="My Toolkit">'+
  '<div class="insight-toolkit-top"><div><span class="section-eyebrow">'+icon('sparkles')+
  ' INSIGHT THREADS</span><h3>My Toolkit</h3><p>Your earlier decisions and real findings, ready when they matter again.</p></div>'+
  '<span class="insight-toolkit-count">'+all.length+' saved</span></div>'+
  (visible.length?'<div class="insight-toolkit-grid">'+visible.map(card).join('')+'</div>':
   '<div class="insight-toolkit-empty">'+icon('sparkles')+' Your toolkit grows from your own decisions. Start by recording a provisional title or question.</div>')+
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
   '<span class="insight-thread-destinations">'+x.linked.map(id=>{
    const i=entries(s).findIndex(v=>v.id===id);
    if(i<0)return '';
    const record=entries(s)[i];
    return '<button type="button" data-action="completion-edit-entry" data-index="'+i+'">'+
     e(short(record.title||'Mathematical step '+(i+1),55))+' '+icon('arrow-up-right')+'</button>';
   }).join('')+'</span></div>').join('')+'</div></section>';
}