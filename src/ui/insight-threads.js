/** Insight Threads: read-only views over existing student-owned evidence.
 * No inferred grade, performed calculation, document update or teacher approval.
 * Only explicit source/accuracy/step references count as established links.
 */
import {escapeHtml as e,icon} from './primitives.js';
import {linkedAccuracy,linkedSources} from '../completing/evidence-links.js';
import {routeById} from '../planning/investigative-routes.js';
import {samplingMethod,samplingSparkValue,plannedAccuracyText} from '../planning/data-decisions.js';
import {resultInterpretationGuidance} from '../completing/result-interpretation.js';
import {renderDiscoveryValidityRecall} from '../completing/mathematical-validity.js';

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
 method:{label:'My mathematical choice',icon:'compass',verb:'Why I chose or considered an approach'},
 direction:{label:'My next question',icon:'git-branch',verb:'A possible direction grounded in earlier mathematics'},
 reflection:{label:'My reflections',icon:'lightbulb',verb:'Something to consider later'},
 learning:{label:'My mathematical learning',icon:'book',verb:'Mathematics independently understood'},
 figure:{label:'My linked mathematical figure',icon:'chart',verb:'A saved, editable model figure explicitly linked to a mathematical stage, not a confirmed result'}
});
const item=(type,id,title,value,where,go,extras={})=>({
 type,id,title,value:String(value).trim(),where,go,...extras
});
const done=x=>x?.status==='completed'&&has(x.result);
const entries=s=>Array.isArray(s?.entries)?s.entries:[];
const sources=s=>Array.isArray(s?.completion?.sourceRecords)?s.completion.sourceRecords:[];
const accuracies=s=>Array.isArray(s?.completion?.accuracyDecisions)?s.completion.accuracyDecisions:[];
const limitations=s=>Array.isArray(s?.completion?.confirmedLimitations)?s.completion.confirmedLimitations:[];
/** A display-only view of canonical student notes. Never store a second copy of the reasoning. */
const detailRows=(pairs,preview='')=>{
 const seen=new Set([String(preview||'').trim()]);
 return pairs.flatMap(([label,value])=>{
  const v=String(value??'').trim();
  if(!v||seen.has(v))return[];
  seen.add(v);return[{label,value:v}];
 });
};
const entryName=(x,i)=>x.title||'Mathematical step '+(i+1);
export function insightItems(s){
 const p=s?.planning?.fields||{},c=s?.completion||{},out=[],math=entries(s);
 const aim=p.aim||s?.project?.aim;
 if(has(p.provisionalTitle))out.push(item('title','working-title','Provisional IA title',p.provisionalTitle,
  'Planning · Working title',{type:'planning',node:'N01'},
  {usage:'This title is provisional. Review whether it still describes the mathematical question you really explored.'}));
 if(has(aim))out.push(item('aim','aim','Investigation aim',aim,'Planning · Investigation aim',{type:'planning',node:'N01'},
  {usage:'Keeps mathematical interpretations connected to the original question.'}));
 const motivation=p.motivation||p.beneficiary||p.intendedUse||s?.project?.beneficiary;
 if(has(motivation))out.push(item('motivation','motivation','My motivation',motivation,
  'Planning · Motivation',{type:'planning',node:'N01V'},
  {usage:'Revisit why finding the answer matters. Your eventual conclusions and any advice must be supported by the actual mathematics.'}));
 const chosenJourney=routeById(s?.planning?.routeExplorer?.selectedRoute);
 if(chosenJourney)out.push(item('pathway','investigative-route','My provisional investigative route',
  chosenJourney.title+' · Start here: '+chosenJourney.first[0],
  'Planning · Mathematical routes',{type:'planning',node:'N02M'},
  {planned:true,usage:'This is a possible starting route, not mathematics already performed. Use actual findings to decide whether a branch is relevant.'}));
 const initialPrediction=p.prediction||s?.project?.prediction;
 const predictionWhy=p.predictionWhy||s?.project?.predictionWhy;
 if(has(initialPrediction))out.push(item('aim','prediction','Prediction or conjecture',
  initialPrediction+(has(predictionWhy)?'\nWhy I thought or hoped this: '+predictionWhy:''),
  'Planning · Prediction',{type:'planning',node:'N01P'},
  {usage:'This is a provisional prediction or hope, not an actual result. Compare it honestly with genuine findings, including those that differ.'}));
 const planned=p.kind==='theoretical'
  ?p.theoreticalCase||p.theoreticalQuestion||p.theoreticalObject
  :p.secondaryUrl||p.primaryWhat||p.dataSource;
 if(has(planned))out.push(item('evidence','planned-evidence','Planned starting material',planned,'Planning · Evidence',
  {type:'planning',node:p.kind==='theoretical'?'N02T':'N03'},
  {usage:'A plan is not yet evidence collected or a confirmed actual source.'}));
 const sampling=samplingMethod(p.primarySamplingMethod);
 if(sampling)out.push(item('sampling','sampling-plan','My planned sampling approach',
  samplingSparkValue(p),'Planning · Primary data sampling',{type:'planning',node:'N03P2'},
  {planned:true,usage:'A proposed approach only. Check the real sample, sampling frame, participation and which population the data genuinely represent.'}));
 for(const plan of Array.isArray(s?.planning?.accuracyPlans)?s.planning.accuracyPlans:[]){
  if(!plan.quantity)continue;
  out.push(item('accuracy','planned-accuracy:'+plan.id,'Planned accuracy · '+plan.quantity,
   plannedAccuracyText(plan),'Planning · '+(plan.source==='secondary'?'Published data':'Primary measurements'),
   {type:'planning',node:plan.source==='secondary'?'N03S':'N03P'},
   {planned:true,plannedSource:plan.source,
    usage:'This is a planned recording or rounding rule, not verified measurement accuracy. Confirm the original instrument or published methodology before calculating or reporting results.'}));
 }
 if(has(p.firstAccuracy))out.push(item('accuracy','planned-precision-policy',
  'Planned accuracy convention',p.firstAccuracy,
  'Planning · First mathematical move',{type:'planning',node:'N05'},
  {planned:true,usage:'An intended policy for rounding or displaying values. Confirm actual measurement or source resolution before presenting numerical results.'}));
 const first=p.firstAction||p.figurePurpose;
 if(has(first))out.push(item('discovery','planned-maths','Planned first mathematics',first,'Planning · Mathematical direction',
  {type:'completion',node:'C31'}, {planned:true,usage:'A preserved earlier idea. Choose and create an actual representation in IA Studio; no calculation is implied completed.'}));
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
 // The mathematical stage is the source of truth for its finding, reason and next question.
 // A proposed choice or question does not imply that any mathematics has been performed.
 for(let i=0;i<math.length;i++){
  const x=math[i],real=done(x),go={type:'entry',index:i},label=entryName(x,i);
  if(real){
   const follow=math.filter(y=>y.fromEntryId&&y.fromEntryId===x.id);
   const takeaway=x.localTakeaway||x.interpretation||x.observationText||x.result;
   out.push(item('discovery','result:'+x.id,label,takeaway,
    'IA Studio · Mathematical exploration',go,
    {entryId:x.id,needsReview:x.reviewNeeded==='yes',
     details:detailRows([
      ['Mathematics I produced',x.result],
      ['My interpretation',x.interpretation],
      ['My mathematical takeaway',x.localTakeaway],
      ['Limitation or assumption I recorded',x.limitations],
      ['Question left open',x.nextQuestion],
      ['Why it may be worth investigating',x.nextWhy]
     ],takeaway),
     usage:follow.length?'Explicitly connects to '+follow.length+' later mathematical record'+(follow.length===1?'':'s')+'.':'Consider what the result actually establishes before choosing another method.',
     linked:follow.map(y=>y.id)}));
  }
  const reason=x.purpose||x.bridge||x.methodChangeReason;
  if(has(reason))out.push(item('method','method:'+x.id,'Reason for: '+label,reason,
   'IA Studio · Mathematical approach',go,
   {entryId:x.id,planned:!real,needsReview:x.reviewNeeded==='yes',
    details:detailRows([
     ['Why I chose this approach',x.purpose],
     ['Bridge from the previous mathematics',x.bridge],
     ['Why I changed method',x.methodChangeReason]
    ],reason),
    usage:real?'Your own recorded justification for this mathematics. Check that it still follows from the earlier finding and aim.':'This is a proposed approach and reason, not evidence that the mathematics was carried out.'}));
  if(has(x.limitations)&&!limitations(s).some(y=>y.entryId===x.id&&String(y.explanation||'').trim()===x.limitations.trim()))
   out.push(item('reflection','limitation-note:'+x.id,'Limitation noted in: '+label,x.limitations,
    'IA Studio · Interpreting mathematics',go,
    {entryId:x.id,planned:!real,needsReview:x.reviewNeeded==='yes',
     usage:'This is your own limitation note, not a verified conclusion. Explain the particular mathematical consequence if it changes what the result establishes.'}));
  const linkedStages=math.filter(y=>y.fromEntryId===x.id);
  if(real&&(has(x.nextQuestion)||has(x.nextWhy)||linkedStages.length)){
   const question=x.nextQuestion||linkedStages[0]?.title||"";
   const reason=x.nextWhy||"";
   const possible=question||reason||"A linked mathematical stage — review the original question";
   const linkedDescription=linkedStages.map(y=>(y.title||"Linked mathematical stage")+
    (y.reviewNeeded==="yes"?" (needs review)":done(y)?" (result recorded)":" (planned)")).join(" · ");
   out.push(item('direction','direction:'+x.id,'Question following: '+label,possible,
    'IA Studio · Deciding what follows',go,
    {entryId:x.id,planned:true,needsReview:x.reviewNeeded==='yes',
     linked:linkedStages.map(y=>y.id),
     details:detailRows([
      ['Mathematical question I considered',question],
      ['Why this question might help',reason],
      ['Mathematical stage linked to this finding',linkedDescription]
     ],possible),
     usage:linkedStages.length?
      'This question is linked to '+linkedStages.length+' subsequent mathematical stage'+(linkedStages.length===1?'':'s')+
       '. A recorded stage is not automatically proof it resolved the question; check the mathematical link.':
      'A proposed mathematical question, not proof that another calculation was done or required. Recheck the earlier result before using it.'}));
  }
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
 // Expose only figures explicitly linked to a mathematical stage.
 // Their source remains the original editable figure record; this read-only
 // Spark does not claim a completed calculation, verified model or IA grade.
 for(const figure of s?.distributionStudio?.figures||[]){
  const linked=math.find(x=>x.distributionFigureId===figure.id||
   x.figureRefs?.includes("distribution:"+figure.id));
  if(!linked)continue;
  const index=math.indexOf(linked),d=figure.draft||{};
  const kind=({normal:"Normal",binomial:"Binomial",poisson:"Poisson",uniform:"Continuous uniform",custom:"Custom discrete"})[d.kind]||"Probability";
  const title=short(d.title||kind+" probability model",110),variable=short(d.symbol||"X",8);
  const source=d.sourceKind==="secondary"?"Published parameters (check original citation)":
   d.sourceKind==="primary"?"Estimated from own data (verify sample and method)":
   d.sourceKind==="theoretical"?"Assumed theoretical parameters":"Parameter source unconfirmed";
  out.push(item('figure','figure:distribution:'+figure.id,
   'Linked '+kind.toLowerCase()+' model · '+title,variable+' · '+title,
   'IA Studio · Saved distribution figure',{type:'entry',index},{
    entryId:linked.id,linked:[linked.id],needsReview:linked.reviewNeeded==="yes",planned:!done(linked),
    details:detailRows([
     ['Random variable',variable],['Model',kind+' distribution'],
     ['Parameter origin',source],['Event mode',d.mode||'none']
    ]),
    usage:'An editable model figure is explicitly linked to this stage, but its assumptions, probability and relevance still require student interpretation.'
   }));
 }
 return out; // Every saved spark remains discoverable; visible highlights are capped separately.
}
export function insightForCurrent(s,node){
 const all=insightItems(s),active=entries(s)[s?.completion?.activeEntryIndex];
 const get=type=>all.filter(x=>x.type===type);
 const named=id=>all.find(x=>x.id===id);
 const compact=ids=>ids.map(named).filter(Boolean);
 if(node==='N01V')return compact(['aim','working-title']);
 if(/^N(?:02|03|04|05|06)/.test(node))return compact(['aim','motivation','working-title']).slice(0,2);
 const result=active?.fromEntryId?all.filter(x=>x.id==='result:'+active.fromEntryId):[];
 const linkedFigure=active?.distributionFigureId?all.filter(x=>x.id==='figure:distribution:'+active.distributionFigureId):[];
 if(node==='C31'&&linkedFigure.length)return [...linkedFigure,...compact(['aim'])].slice(0,3);
 const related=kind=>all.filter(x=>x.id.startsWith(kind+':')&&active&&(
  kind==='accuracy'?linkedAccuracy(s,active).some(a=>'accuracy:'+a.id===x.id):
  linkedSources(s,active).some(a=>'source:'+a.id===x.id)));
 const chosenConclusionIds=Array.isArray(s?.completion?.conclusionResultIds)?
  s.completion.conclusionResultIds:[];
 const selectedConclusionResult=chosenConclusionIds.map(id=>all.find(x=>x.id==='result:'+id&&!x.needsReview)).find(Boolean);
 const latestResult=/^C6/.test(node)&&chosenConclusionIds.length?
  selectedConclusionResult:get('discovery').filter(x=>!x.planned&&!x.needsReview).at(-1);
 const focus=entries(s).find(x=>x.id===s?.completion?.nextFromEntryId&&done(x))||
  (done(active)?active:entries(s).filter(done).at(-1));
 const focusId=focus?.id||'',activeId=active?.id||'';
 if(['C35','C35H','C35B','C35P'].includes(node))
  return compact(['result:'+focusId,'direction:'+focusId,'limitation-note:'+focusId,'aim']).slice(0,3);
 if(['C30','C32','C33','C34','C34A','C34B','C40','C50','C40T','C40L'].includes(node)){
  const prior=active?.fromEntryId?'result:'+active.fromEntryId:'';
  const refs=[...related('source'),...related('accuracy')];
  const choose=items=>[...new Map(items.filter(Boolean).map(x=>[x.id,x])).values()].slice(0,3);
  if(node==='C30')return choose(compact(['result:'+activeId,'method:'+activeId,'aim']));
  if(['C32','C33'].includes(node))
   return choose([...linkedFigure,...compact(['method:'+activeId,prior]),...refs,...compact(['aim'])]);
  if(node==='C34A')
   return choose([...compact(['result:'+activeId]),...linkedFigure,...refs,...compact(['limitation-note:'+activeId,'aim'])]);
  if(node==='C34B')return choose(compact(['result:'+activeId,'limitation-note:'+activeId,'aim']));
  if(['C40','C50','C40T','C40L'].includes(node))
   return choose([...compact([prior,'method:'+activeId]),...refs,...compact(['aim'])]);
  const planned=related('accuracy').length?[]:all.filter(x=>x.id.startsWith('planned-accuracy:')).slice(0,1);
  return choose([...compact(['result:'+activeId,'limitation-note:'+activeId,prior]),...refs,...planned,...compact(['aim'])]);
 }
 if(['C10','C10E','C02','C60','C61','C62','C64'].includes(node)){
  const prep=['C10','C10E'].includes(node)?compact(['aim','motivation','prediction']):
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
  const contextual=[...linkedFigure,...result,...related('accuracy'),...related('source')];
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
 else if(node==='N03P2'){
  ids=['sampling-plan'];kind='Your planned sampling method';
 }
 else if(node==='N03P'){
  ids=all.filter(x=>x.id.startsWith('planned-accuracy:')&&x.plannedSource==='primary').map(x=>x.id);
  kind='Your planned recording accuracy';
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
 if(node==='C35'){
  const from=entries(s).find(x=>x.id===c.nextFromEntryId)||
   (done(entries(s)[c.activeEntryIndex])?entries(s)[c.activeEntryIndex]:entries(s).filter(done).at(-1));
  ids=from?['direction:'+from.id]:[];
  kind='Your possible next mathematical question';
 }
 if(['C60','C61','C62','C64'].includes(node)){
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
 if(x.id==='prediction'){
  if(node==='C10')return 'If this expectation or hope is genuine and useful, write what you think or want to find out, and why, in the introduction of your actual IA. Edit the original Planning prediction spark below to revisit it as results emerge. It is not a finding or proof.';
  return 'This was your starting prediction or hope. Compare it with the mathematics you actually obtained: a result that contradicts it can be just as valuable as one that supports it.';
 }
 if(x.id==='motivation'){
  if(node==='C10')return 'Use this genuine reason in the opening of your actual IA. Explain what drew you to the question without inventing an anecdote; your independent mathematical decisions will develop personal engagement later.';
  if(['C34','C34A','C34B','C35','C35H','C35B','C35P','C60','C61','C62','C64'].includes(node))
   return 'Why did you want this answer? Connect what your genuine mathematics established to that reason, including if the result is limited, unexpected or does not justify a practical recommendation.';
  return 'Keep your question and motivation together: does each choice help you learn, explain or decide what you originally set out to understand? Your findings may change your motivation.';
 }
  if(x.id==='aim'&&node==='C10')return 'State this aim explicitly in your actual IA introduction. Does it pose a precise, answerable mathematical question rather than naming only a topic? You can edit the original spark below.';
  if(x.id==='aim'&&['C34','C34A','C35','C40','C50','C60','C61','C62','C64'].includes(node)){
  return 'Connect what your mathematics actually established to this precise investigation question. Does the result answer all of it, or only a narrower part?';
 }
 if(x.type==='discovery'&&['C35','C35H','C35B','C35P','C40','C50'].includes(node)){
  return 'Use this genuine earlier result to decide whether another mathematical question logically follows. An extra calculation is not necessary unless it develops your aim.';
 }
 if(x.type==='reflection'&&/^C6/.test(node)){
  return 'You confirmed this limitation earlier. State how its mathematical consequence restricts the answer to your aim, rather than adding an unrelated generic weakness.';
 }
 if(x.type==='method')return x.planned?
  'You recorded why you are considering this approach. It is still a plan, not performed mathematics.':
  'This is your recorded justification for a mathematical choice. Check it against the earlier finding and your aim.';
 if(x.type==='direction')return 'You recorded this possible question and its reason. It is not completed mathematics: develop it, revise it or conclude instead.';
 if(x.id.startsWith('limitation-note:'))return 'This is your own note about a limitation. Explain how it restricts the mathematical conclusion, rather than treating it as independently verified.';
 if(x.type==='figure'){
  return x.planned?
   'This editable model figure is explicitly linked to your selected stage, but no completed mathematical result is recorded. State the assumptions and justify the selected probability before interpreting it.':
   'This figure is linked to your recorded mathematics. Check that your IA explains the variable, probability event, parameter source, model conditions and limitations.';
 }
 if(x.type==='learning'){
  return 'You recorded independently developed understanding of this mathematical method. If it lies outside your course, explain the mathematics accurately in your own words; familiar syllabus techniques normally just need clear use.';
 }
 if(x.id==='planned-evidence')return 'This was a proposed starting route. Check whether the material was actually obtained before presenting it as evidence.';
 return x.usage||INSIGHT_FAMILIES[x.type].verb;
}
/** A short, moment-specific use for a recorded Spark, never a new mathematical
 * conclusion. Distinguish a plan, a linked input and a verified result. */
export function sparkMomentPrompt(s,node,x){
 if(!x)return "";
 if(x.needsReview)return "Check the original mathematics before relying on this note.";
 if(x.id==='prediction')return "Compare this earlier expectation honestly with the actual mathematical result.";
 if(x.id==='planned-maths')return "A possible first move, not a result: decide from the evidence whether it is worth doing.";
 if(x.id==='planned-evidence')return "Check that this proposed material was actually obtained before citing it as evidence.";
 if(x.id==='source-current')return "This is a current source note, not an independently verified or linked source.";
 const maths=/^C(?:30|3[2-5]|40|50|60)/.test(node);
 const following=["C35","C35H","C35B","C35P"].includes(node);
 const concluding=/^C6/.test(node);
 switch(x.type){
  case "aim":return maths?"Compare this exact question with what the mathematics actually establishes.":"Keep your investigation focused on an answerable mathematical question.";
  case "title":return "Check that your working title still fits the question you are investigating.";
  case "motivation":return concluding?"Explain why your actual answer matters without inventing an impact.":"Recall why this question matters when deciding what to investigate.";
  case "pathway":return "Treat this as an optional route, not a sequence you must complete.";
  case "sampling":return "Check the actual sample or population before generalising a result.";
  case "evidence":return x.planned?"Confirm this material was actually obtained before using it as evidence.":"Verify the original values, provenance and assumptions for this stage.";
  case "accuracy":return x.id.startsWith("planned-")?"Confirm the original resolution before adopting this planned precision.":"Check whether this quantity's actual precision changes the claim you can make.";
  case "discovery":return x.planned?
   "This is an intended calculation, not a finding to use as evidence.":
   following?"Identify the exact gap this finding leaves before choosing another method.":
   concluding?"Use this genuine result to support a qualified answer to the aim.":
   node==="C40"||node==="C50"?"Use this earlier finding to explain why the next method is needed.":
   "Explain what this result establishes in context and what it cannot establish.";
  case "method":return x.planned?"Say what question this proposed method could answer; it is not performed.":"Explain why this approach resolves a specific mathematical question.";
  case "direction":return "Use the unanswered question to choose a purposeful next calculation—or conclude.";
  case "reflection":return "State the mathematical consequence, not just the name of a limitation.";
  case "learning":return "Explain the unfamiliar mathematical idea at first use, not every time it recurs.";
  default:return "Revisit the original decision only if it helps your current work.";
 }
}

/**
 * A shared spark shelf for Planning and IA Studio.
 * Exactly two *recorded* sparks are featured; the full collection is one
 * disclosure away on every active screen. The library never silently erases
 * or promotes provisional choices to completed mathematics.
 */
export function featuredSparkItems(s,node){
 const all=insightItems(s),selected=[],used=new Set();
 const pick=predicate=>{
  for(const x of all){
   if(selected.length===2)break;
   if(!used.has(x.id)&&predicate(x)){selected.push(x);used.add(x.id);}
  }
 };
 const id=key=>pick(x=>x.id===key);
 const prefix=(start,source='')=>pick(x=>x.id.startsWith(start)&&(!source||x.plannedSource===source));
 const recent=predicate=>{
  const x=all.filter(predicate).at(-1);
  if(x&&!used.has(x.id)&&selected.length<2){selected.push(x);used.add(x.id);}
 };
 const linked=insightForCurrent(s,node);
 const active=entries(s)[s?.completion?.activeEntryIndex];
 const selectedConclusionIds=Array.isArray(s?.completion?.conclusionResultIds)?
  s.completion.conclusionResultIds:[];
 const chosenConclusionResult=selectedConclusionIds.map(id=>
  all.find(x=>x.id==='result:'+id&&!x.needsReview)).find(Boolean);
 const latestResult=selectedConclusionIds.length?chosenConclusionResult:
  all.filter(x=>x.id.startsWith('result:')&&!x.needsReview).at(-1);
 const accuracy=source=>{prefix('accuracy:');prefix('planned-accuracy:',source);};
 if(node==='N01'||node==='N01A'){id('working-title');id('aim');}
 else if(node==='N01V'){id('aim');id('working-title');}
 else if(node==='N01P'){id('aim');id('motivation');id('prediction');}
 else if(/^N00/.test(node)){id('working-title');id('aim');}
 else if(/^N02/.test(node)||/^N04/.test(node)){
  id('aim');id('investigative-route');id('motivation');
 }
 else if(node==='N03P2'){id('sampling-plan');id('aim');}
 else if(node==='N03P'){
  recent(x=>x.id.startsWith('planned-accuracy:')&&x.plannedSource==='primary');
  id('sampling-plan');id('aim');
 }
 else if(node==='N03S'){
  recent(x=>x.id.startsWith('planned-accuracy:')&&x.plannedSource==='secondary');
  id('planned-evidence');id('aim');
 }
 else if(node==='N03J'){id('sampling-plan');prefix('planned-accuracy:');id('aim');}
 else if(node==='N03D'||node==='N03E'||node==='N03H'){id('planned-evidence');id('sampling-plan');id('aim');}
 else if(/^N03/.test(node)){id('planned-evidence');id('aim');id('sampling-plan');}
 else if(/^N05/.test(node)){prefix('planned-accuracy:');id('planned-maths');id('aim');}
 else if(/^N06/.test(node)||node==='N07'){id('motivation');id('aim');id('investigative-route');}
 else if(['C10','C10E','C02'].includes(node)){id('aim');id('motivation');id('working-title');}
 else if(node==='C21S'){id('sampling-plan');recent(x=>x.id.startsWith('source:'));id('planned-evidence');}
 else if(node==='C24'){recent(x=>x.id.startsWith('accuracy:'));prefix('planned-accuracy:');id('planned-evidence');}
 else if(['C20','C21M','C21T','C22','C23','C25','C26'].includes(node)){
  recent(x=>x.id.startsWith('source:'));id('planned-evidence');id('sampling-plan');id('investigative-route');
 }
 else if(node==='C30'){
  if(active)id('result:'+active.id);
  id('aim');if(active)id('method:'+active.id);
  id('planned-maths');id('investigative-route');
 }
 else if(node==='C31'){if(active?.distributionFigureId)id('figure:distribution:'+active.distributionFigureId);id('planned-maths');id('investigative-route');id('aim');}
 else if(['C32','C33','C34','C34A','C34B','C35','C35H','C35B','C35P','C40','C50','C40T','C40L'].includes(node)){
  const focus=entries(s).find(x=>x.id===s?.completion?.nextFromEntryId&&done(x))||
   (done(active)?active:entries(s).filter(done).at(-1));
  if(['C35','C35H','C35B','C35P'].includes(node)){
   if(focus)id('result:'+focus.id);
   if(focus)id('direction:'+focus.id);
   id('aim');
  }else if(['C32','C33'].includes(node)){
   if(active)id('method:'+active.id);
   if(active?.fromEntryId)id('result:'+active.fromEntryId);
   for(const x of linked)if(x.id.startsWith('source:')||x.id.startsWith('accuracy:'))id(x.id);
   id('aim');
  }else if(['C40','C50','C40T','C40L'].includes(node)){
   if(active?.fromEntryId)id('result:'+active.fromEntryId);
   if(active)id('method:'+active.id);
   for(const x of linked)if(x.id.startsWith('accuracy:')||x.id.startsWith('source:'))id(x.id);
   id('aim');
  }else{
   if(active)id('result:'+active.id);
   if(node==='C34B'&&active)id('limitation-note:'+active.id);
   if(active)for(const x of linked)if(x.id.startsWith('accuracy:')||x.id.startsWith('source:'))id(x.id);
   id('aim');
  }
 }
 else if(/^C6/.test(node)){id('aim');if(latestResult)id(latestResult.id);id('motivation');}
 // Unknown screens still get relevant existing insights, then a useful fallback.
 for(const x of linked){if(selected.length===2)break;id(x.id);}
 id('aim');id('motivation');id('working-title');
 // Never elevate an unrelated later limitation or discovery merely because it
 // happens to be the only recorded spark. It remains available in View all.
 return selected.slice(0,2);
}
const sparkLibraryGroups=[
 {label:'Your question and intentions',test:x=>['title','aim','motivation','pathway'].includes(x.type)||x.id==='planned-maths'},
 {label:'Data, sources and accuracy',test:x=>['evidence','sampling','accuracy'].includes(x.type)},
 {label:'Mathematical discoveries and learning',test:x=>(x.type==='discovery'&&!x.planned)||x.type==='learning'},
 {label:'Method reasoning and next questions',test:x=>x.type==='method'||x.type==='direction'},
 {label:'Reflections and limitations',test:x=>x.type==='reflection'}
];
const inlineSparkKey=(s,x)=>{
 const f=s?.planning?.fields||{};
 if(x.id==='working-title')return 'provisionalTitle';
 if(x.id==='aim')return 'aim';
 if(x.id==='motivation')return has(f.motivation)?'motivation':has(f.beneficiary)?'beneficiary':
  has(f.intendedUse)?'intendedUse':'beneficiary';
 if(x.id==='prediction')return 'prediction';
 return '';
};
const sparkOriginalAction=(x,label='Review or edit original')=>{
 if(x.id.startsWith('planned-accuracy:'))
  return '<button type="button" class="spark-shelf-action" data-action="spark-edit-accuracy" data-accuracy-id="'+
   e(x.id.slice('planned-accuracy:'.length))+'">'+icon('pencil')+' Edit accuracy decision</button>';
 if(!x.go||!['entry','planning','completion'].includes(x.go.type))return'';
 return '<button type="button" class="spark-shelf-action"'+jumpAttrs(x)+'>'+icon('arrow-up-right')+' '+e(label)+'</button>';
};
const sparkEditor=(s,x,{preview=false}={})=>{
 const key=inlineSparkKey(s,x);
 if(!key)return sparkOriginalAction(x,'Open original to review or edit');
 // Avoid duplicate controls for the same canonical Planning field.
 if(preview)return '<p class="spark-library-featured-hint">This spark is highlighted above. Open that card to edit the same original decision.</p>';
 const id='spark-edit-'+x.id.replace(/[^a-z0-9-]/gi,'-');
 const value=s.planning?.fields?.[key]||x.value;
 const isTitle=key==='provisionalTitle';
 return '<div class="spark-inline-editor"><label for="'+e(id)+'">Edit '+e(x.title.toLowerCase())+'</label>'+
 (isTitle?'<input type="text" class="field"':'<textarea rows="2" class="field"')+
  ' id="'+e(id)+'" data-bind="planning.fields.'+e(key)+'" data-spark-editor="'+e(x.id)+'"'+
  (isTitle?' value="'+e(value)+'">':'>'+e(value)+'</textarea>')+
 '<small>Saved on this device. Changes update your original Planning decision, not a copy.</small></div>';
};
/** The same technique-specific mathematical reading remains available when
 * a student opens a saved Discovery Spark, with no new student-owned state. */
const discoveryInterpretation=(s,x)=>{
 if(x.type!=='discovery'||!x.entryId)return '';
 const entry=entries(s).find(v=>v.id===x.entryId);
 const guide=resultInterpretationGuidance(s,entry);
 if(!guide)return '';
 return '<div class="spark-math-interpretation" data-spark-reading="'+e(guide.key)+'">'+
  '<strong>Reading this mathematical finding · '+e(guide.title)+'</strong>'+
  '<p><b>Meaning to explain:</b> '+e(guide.meaning)+'</p>'+
  '<p><b>Claim to avoid:</b> '+e(guide.boundary)+'</p>'+
  (guide.needsReview?'<p class="spark-reading-review">Review the earlier mathematics before relying on this interpretation.</p>':'')+
  '<small>These are technique-specific questions, not a verification of the result above.</small></div>';
};
const sparkFullBody=(s,node,x,{featured=false}={})=>
 '<p class="spark-shelf-full-value">'+e(x.value)+'</p>'+
 (x.details?.length?'<dl class="spark-reasoning-details">'+x.details.map(d=>
  '<div><dt>'+e(d.label)+'</dt><dd>'+e(d.value)+'</dd></div>').join('')+'</dl>':'')+
 (x.type==='discovery'&&x.entryId?'<div class="spark-maths-reading" aria-label="Reading and checking this mathematical result">'+
  discoveryInterpretation(s,x)+
  renderDiscoveryValidityRecall(s,entries(s).find(v=>v.id===x.entryId),{e})+
  '</div>':'')+
 (x.type==='discovery'&&x.entryId?'':'<p class="spark-shelf-guidance">'+e(insightMeaning(s,node,x))+'</p>')+
 '<div class="spark-shelf-source">'+(x.planned?'Provisional · ':'')+
  e(x.needsReview?'Needs review · '+x.where:x.where)+'</div>'+
 (node==='C10'&&x.id==='prediction'?
  '<p class="spark-library-featured-hint">Edit the original prediction and your reason once in the Introduction prompt above, where they are saved for later reference.</p>'+
  '<button type="button" class="spark-shelf-action" data-action="intro-prediction-open">'+icon('arrow-up-right')+' Edit my prediction in the Introduction</button>':
  sparkEditor(s,x,{preview:!featured}));
const sparkFeaturedCard=(s,node,x)=>{
 const key=inlineSparkKey(s,x),path=key?' data-spark-preview-path="planning.fields.'+e(key)+'"':'';
 return '<details class="motivation-aim-spark planning-return-spark spark-shelf-featured insight-'+e(x.type)+
   '" data-planning-return-spark="'+e(x.id==='aim'?'aim':x.id==='motivation'?'beneficiary':x.id)+
   '" data-spark-id="'+e(x.id)+'">'+
  '<summary><span class="motivation-aim-symbol">'+icon(INSIGHT_FAMILIES[x.type].icon)+'</span>'+
  '<span class="motivation-aim-copy"><strong>'+e(INSIGHT_FAMILIES[x.type].label)+
   '</strong><small'+path+'>'+e(short(x.value,94))+'</small>'+
   '<span class="spark-context-purpose" data-spark-moment="'+e(x.id)+'">'+
   e(sparkMomentPrompt(s,node,x))+'</span></span>'+
  '<span class="motivation-aim-toggle">'+icon('chevron-down')+
   (x.needsReview?' Review':provisionalSpark(x)?' Planned':' View')+'</span></summary>'+
  '<div class="motivation-aim-details">'+sparkFullBody(s,node,x,{featured:true})+'</div></details>';
};
const provisionalSpark=x=>x?.planned||['prediction','planned-evidence','planned-maths','source-current','working-title'].includes(x?.id);
const sparkLibraryEntry=(s,node,x,featuredIds)=>{
 const isFeatured=featuredIds.has(x.id),key=inlineSparkKey(s,x);
 return '<details class="spark-library-entry insight-'+e(x.type)+'" data-spark-id="'+e(x.id)+'">'+
  '<summary>'+icon(INSIGHT_FAMILIES[x.type].icon)+
  '<span class="spark-library-entry-title"><strong>'+e(x.title)+'</strong>'+
  '<small'+(key?' data-spark-preview-path="planning.fields.'+e(key)+'"':'')+'>'+
   e(short(x.value,128))+'</small></span>'+
  '<span class="spark-library-entry-status">'+(x.needsReview?'Review':provisionalSpark(x)?'Planned':isFeatured?'On this screen':'Saved')+'</span>'+
  icon('chevron-down')+'</summary>'+
  '<div class="spark-library-entry-body">'+sparkFullBody(s,node,x,{featured:!isFeatured})+'</div></details>';
};
export function renderSparkShelf(s,node,{surface='planning',libraryOnly=false,hideHeading=false}={}){
 const all=insightItems(s);
 if(!all.length)return '';
 const featured=libraryOnly?[]:featuredSparkItems(s,node),featuredIds=new Set(featured.map(x=>x.id));
 const groups=sparkLibraryGroups.map(g=>({label:g.label,items:all.filter(g.test)})).filter(g=>g.items.length);
 const groupHtml=groups.map(g=>
  '<section class="spark-library-group"><h4>'+e(g.label)+' <span>'+g.items.length+'</span></h4>'+
  '<div class="spark-library-entries">'+g.items.map(x=>sparkLibraryEntry(s,node,x,featuredIds)).join('')+'</div></section>').join('');
 return '<section class="planning-compact-recall spark-shelf spark-shelf-'+e(surface)+(libraryOnly?' spark-shelf-library-only':'')+'" aria-label="Your saved sparks" data-spark-shelf="'+e(surface)+'">'+
  (libraryOnly||hideHeading?'':'<p class="planning-compact-recall-label">'+icon('sparkles')+' Your sparks are back'+
  ' <span>Two that matter now · '+all.length+' saved in total</span></p>')+
  '<div class="planning-compact-sparks">'+
  featured.map(x=>sparkFeaturedCard(s,node,x)).join('')+
  '<details class="spark-library" data-spark-library><summary>'+icon('layers')+
  '<span><strong>'+(libraryOnly?'Browse all saved sparks':'View all sparks')+'</strong><small>'+all.length+' collected</small></span>'+
  icon('chevron-down')+'</summary>'+
  '<div class="spark-library-panel"><p class="spark-library-intro">Every saved spark so far, including provisional choices and real mathematical findings. Open any one to revisit it or edit its original information.</p>'+
  '<div class="spark-library-groups">'+groupHtml+'</div>'+
  '<p class="spark-library-note">A planned idea or recording rule is not evidence of mathematical work being completed. You can change earlier choices at any stage.</p>'+
  '</div></details></div></section>';
}
/** Backwards-compatible IA Studio entry point, now using the same shelf. */
export function insightEcho(s,node){return renderSparkShelf(s,node,{surface:'studio'});}
/** Toolkit is the complete, grouped retrieval view. Compact dashboards keep a
 * short preview and link to the full collection; no Spark gets discarded. */
export function insightToolkit(s,{compact=false}={}){
 const all=insightItems(s);
 const forHome=all.filter(x=>!x.planned||x.type==='direction'||x.id==='investigative-route'||x.id==='sampling-plan'||x.id.startsWith('planned-accuracy:'));
 const pinned=forHome.filter(x=>x.id==='working-title'||x.id==='aim'||x.id==='investigative-route'||x.id==='sampling-plan'||
  (x.id.startsWith('planned-accuracy:')&&x.id===forHome.find(y=>y.id.startsWith('planned-accuracy:'))?.id)).slice(0,5);
 const preview=compact?[...pinned,...(pinned.length<5?
  forHome.filter(x=>!pinned.includes(x)).slice(-(5-pinned.length)):[])]:[];
 const uniquePreview=[...new Map(preview.map(x=>[x.id,x])).values()].slice(0,5);
 const card=x=>'<button type="button" class="insight-toolkit-card insight-'+e(x.type)+
  '" data-toolkit-spark-id="'+e(x.id)+'"'+jumpAttrs(x)+'>'+
  insightToken(x,{compact:true})+'<strong>'+e(short(x.title,62))+'</strong>'+
  '<span class="insight-toolkit-value">'+e(short(x.value,115))+'</span>'+
  '<span class="insight-toolkit-card-footer"><small>'+
   e(x.needsReview?'Needs review':provisionalSpark(x)?'Provisional · not verified':'Saved from your work')+
   '</small>'+(x.linked?.length?'<small class="insight-toolkit-used">'+x.linked.length+
    ' linked '+(x.linked.length===1?'step':'steps')+'</small>':'')+'</span>'+
  '<small class="insight-toolkit-origin">'+e(x.where)+'</small>'+
  '</button>';
 const groups=sparkLibraryGroups.map(g=>({label:g.label,items:all.filter(g.test)})).filter(g=>g.items.length);
 const full=groups.length?'<div class="insight-toolkit-categories">'+groups.map((group,i)=>
   '<details class="insight-toolkit-group" data-toolkit-group="'+i+'"'+(i===0?' open':'')+'>'+
   '<summary>'+icon('layers')+' <span><strong>'+e(group.label)+'</strong>'+
   '<small>'+group.items.length+' saved '+(group.items.length===1?'spark':'sparks')+'</small></span>'+
   icon('chevron-right')+'</summary>'+
   '<div class="insight-toolkit-grid">'+group.items.map(card).join('')+'</div></details>').join('')+'</div>':'';
 return '<section class="insight-toolkit" aria-label="My Toolkit">'+
  '<div class="insight-toolkit-top"><div><span class="section-eyebrow">'+icon('sparkles')+
  ' INSIGHT THREADS</span><h3>My Toolkit</h3><p>'+
  (compact?'Your earlier decisions and real findings, ready when they matter again.':
   'Choose what you need, then open the original decision or mathematical step to review it.')+
  '</p></div><span class="insight-toolkit-count">'+all.length+' saved</span></div>'+
  (compact?(uniquePreview.length?'<div class="insight-toolkit-grid">'+uniquePreview.map(card).join('')+'</div>':
   '<div class="insight-toolkit-empty">'+icon('sparkles')+
   ' Your toolkit grows from your own decisions. Start by recording a provisional title or question.</div>'):
   full||'<div class="insight-toolkit-empty">'+icon('sparkles')+
   ' Your toolkit grows from your own decisions. Begin in Planning to collect your first spark.</div>')+
  (compact&&all.length>uniquePreview.length?'<button type="button" class="insight-link" data-nav="path">Browse all '+all.length+' sparks on My Path '+icon('arrow-right')+'</button>':'')+
  '<p class="insight-toolkit-note">Planned choices are not performed mathematics. Sparks are student notes, not grades, verified findings or edits to your IA document.</p></section>';
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