import {RESOURCES,resourceById} from './catalog.js';
import {guidanceContext} from '../completing/guidance-context.js';
import {methodFamilies} from '../completing/method-identity.js';
import {sourceResultForNext,isPearsonResult,isScatterResult} from '../completing/engine.js';
import {writingOriginState} from '../completing/writing-origin.js';
import {stuckContext} from '../help/stuck.js';
import {isStuckNode} from '../help/stuck-state.js';
const done=e=>e?.status==='completed'&&!!e.result?.trim();
export function resourceContext(state,{help=false}={}){
 let view=writingOriginState(state),planning=view.route==='planning',node=planning?state.planning.current:view.completion.current;
 let x;
 if(help || (view.route==='completing'&&isStuckNode(node))){
  x=stuckContext(state);planning=x.planning;node=planning?x.planNode:x.node;
 }else{
  const isMath=!planning && /^C(?:3[2-5]|40|50)/.test(node);
  const entry=isMath?(/^C35/.test(node)?sourceResultForNext(view):view.entries[view.completion.activeEntryIndex]):null;
  const index=entry?view.entries.findIndex(e=>e.id===entry.id):-1;
  x=guidanceContext({...view,completion:{...view.completion,activeEntryIndex:index}},planning?'C04':node);
  x={...x,entry,real:done(entry)};
 }
 const entry=planning?null:x.entry;
 const scope=planning?'planning:'+node:entry?.id?'entry:'+entry.id:/^C2/.test(node)&&state.completion.activeSourceId?'source:'+state.completion.activeSourceId:'stage:'+node;
 const pref=state.resources?.preferences?.[scope]||{tool:'',image:''};
 const actualTool=x.f.technologyForEntryId===entry?.id?String(x.f.technologyTool||'').trim().toLowerCase():'';
 const tool=pref.tool || (['sheets','google sheets'].includes(actualTool)?'sheets':actualTool==='desmos'?'desmos':'');
 const methods=methodFamilies(entry,{allowPlanned:true}),theory=(state.planning.fields.kind||state.project.kind)==='theoretical';
 const fingerprint=[node,entry?.methodId,entry?.status,entry?.reviewNeeded,entry?.reviewReason,x.course,pref.tool,pref.image,x.sourceStatus,
  x.matchingAccuracy?.map(a=>[a.id,a.policy,a.unit,a.resolution].join(':')).join(';')].join('|');
 let hash=2166136261;for(const ch of fingerprint){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return {...x,planning,node,entry,real:done(entry),scope,pref,tool,methods,theory,help,
  hiddenKey:scope+'|'+(hash>>>0).toString(36),label:planning?'Planning: '+(state.planning.fields.aim||'your developing investigation'):entry?.title||'Your current stage'};
}
/** Only optional tool guidance, not a recommendation to choose new mathematics. */
export function resourceSuggestions(state,options={}){
 const x=resourceContext(state,options),{node,entry,methods,planning,theory}=x;
 let ids=[];const add=(...more)=>ids.push(...more);
 const graph=entry?.kind==='scatter'||(entry?.phase==='first'&&x.f.firstType==='scatter');
 const post=!planning&&x.real&&(/^C3[45]/.test(node));
 const sheets=x.tool!=='desmos';
 if(x.pref.image){
  if(entry?.reviewNeeded==='yes')add('image-scale');
  else if(post&&methods.has('fitted-model'))add('model-check');
  if(x.pref.image==='import')add('image-import','image-scale','image-route');
  if(x.pref.image==='visual')add('image-visual','image-scale','restrictions');
  if(x.pref.image==='points')add('image-points','image-scale','desmos-regression');
  
 }
 if(planning){
  if(!theory&&/^N03/.test(node))add(state.planning.fields.dataSource==='primary'?'forms':'secondary-data','organise');
  if(['N05V','N05'].includes(node))add(theory?'desmos-start':'chart-choice');
 }else if(/^C2/.test(node)){
  if(!theory)add(node==='C24'?'reporting-precision':x.hasActualSource?'organise':'secondary-data','chart-choice');
  if(theory)add('desmos-start');
 }else if(/^C(?:70|80|90)/.test(node)){
  if(state.entries.some(done))add('export-figure');
 }else if(/^C(?:3[0-5]|40|50)/.test(node)){
  if(methods.has('pmcc')){
   if(post&&isPearsonResult(entry))add('pmcc-meaning');
   else if(x.f.pairedDataType!=='categorical'&&x.f.pairedDataType!=='unpaired')add(sheets?'sheets-pmcc':'desmos-pmcc');
  }else if(methods.has('fitted-model')){
   if(post || entry?.reviewNeeded==='yes')add('model-check');
   else add(methods.has('linear-regression')&&sheets?'sheets-linear':'desmos-regression');
  }else if(graph){
   // A graph does not select PMCC/regression for the student.
   add(post?'chart-choice':sheets?'sheets-scatter':'desmos-table');
  }else if(methods.has('optimisation'))add('derivatives');
  else if(methods.has('normal'))add('normal');
  else if(methods.has('binomial'))add('binomial');
  else if(['two-sample-t','chi-independence','chi-fit'].some(m=>methods.has(m))){
   // A broad course label does not verify a test's syllabus status.
   if(['syllabus','outside','mixed'].includes(entry?.knowledge))add('inference');
  }else if(methods.has('numerical-integration')){
   // Numerical integration is not silently reclassified as symbolic integration.
   add('export-figure');
  }else if(entry?.phase==='first'&&x.f.firstType==='distribution')add(sheets?'summary-stats':'distribution-graphs');
  else if(theory||methods.has('algebra')||methods.has('proof'))add('desmos-start');
  else add('chart-choice');
 }
 // A help issue can narrow the task without altering the original stage or method.
 if(x.help){
  const issue=state.completion.support.selected;
  if(['source','no-data','partial'].includes(issue)&&!theory)ids=['secondary-data','organise'];
  if(issue==='precision')ids=x.pref.image?['image-scale','reporting-precision']:['reporting-precision'];
  if(issue==='interpret'&&isPearsonResult(entry))ids=['pmcc-meaning'];
  if(issue==='interpret'&&x.real&&methods.has('fitted-model'))ids=['model-check'];
  if(['writing','story'].includes(issue)&&x.real)ids=['export-figure',...ids];
 }
 // Do not suggest unavailable empirical activity to a theoretical route.
 ids=[...new Set(ids)].filter(id=>!theory||!['forms','organise','secondary-data','sheets-pmcc','desmos-pmcc','sheets-scatter','summary-stats','two-way'].includes(id));
 return ids.map(resourceById).filter(Boolean).slice(0,3);
}
export function filterResources({query='',tool='',category=''}={}){
 const q=String(query).trim().toLowerCase().slice(0,120);
 return RESOURCES.filter(r=>(!tool||r.tool===tool)&&(!category||r.category===category)&&
  (!q||[r.id,r.title,r.when,r.category,r.tool,...r.snippets.flat()].join(' ').toLowerCase().includes(q)));
}
