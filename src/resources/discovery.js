/** Local, read-only index for the Tools & tutorials hub.
 * Do not search student writing or infer a recommended mathematical method.
 * All hits link to existing supported library actions.
 */
import {RESOURCES,TOOLS} from './catalog.js';
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,definitionById} from '../workshop/catalog.js';
import {REPRESENTATION_TOOLS} from '../diagrams/representation-registry.js';

export const DISCOVERY_AREAS=Object.freeze([
 {id:'data',label:'Collect & describe data'},
 {id:'models',label:'Explore relationships'},
 {id:'geometry',label:'Measure & model shapes'},
 {id:'calculus',label:'Investigate change'},
 {id:'probability',label:'Analyse chance'},
 {id:'finance',label:'Financial models'},
 {id:'reasoning',label:'Proof & iteration'},
 {id:'writing',label:'Present & reference'}
]);
export const DISCOVERY_TYPES=Object.freeze([
 {id:'all',label:'All help'},
 {id:'lesson',label:'Guided lessons'},
 {id:'definition',label:'Definitions'},
 {id:'guide',label:'Software & task guides'},
 {id:'creator',label:'Figure creators'}
]);

const validArea=id=>DISCOVERY_AREAS.some(a=>a.id===id);
const normalize=value=>String(value??'').normalize('NFKD').toLowerCase()
 .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const commonWords=new Set(['a','an','and','do','find','for','from','help','how','i','in','is','my','of','on','the','to','use','using','what','with']);
const aliasesFor=(id,title,type)=>{
 const text=normalize(id+' '+title);
 const a=[];
 if(/\bpearson\b|\bpmcc\b|\bcorrelation\b/.test(text))a.push('pmcc pearson product moment correlation coefficient');
 if(/\bspearman\b|\brank\b/.test(text))a.push('rank correlation spearman rho');
 if(/\bscatter\b|\bgraph\b|\bchart\b|\bplot\b/.test(text))a.push('plot graph chart visualise visualize diagram');
 if(/\bimage\b|\bpicture\b|\btrace\b|\bphoto\b|\bcalibrat\b|\bcurve\b/.test(text))a.push('photo picture image coordinate trace photograph');
 if(/\bderivativ\b|\bdifferenti\b/.test(text))a.push('differentiate differentiation gradient rate of change');
 if(/\bintegral\b|\bintegrat\b/.test(text))a.push('integrate integration area under curve accumulation');
 if(/\breferenc\b|\bmla\b|\bcit\b/.test(text))a.push('cite citation bibliography works cited referencing mla');
 if(/\bsampl\b/.test(text))a.push('sampling sample selection survey');
 if(/\bregress\b/.test(text))a.push('line of best fit regression fitted model');
 if(/\bprobab\b|\bchance\b/.test(text))a.push('probability chance likelihood');
 if(/\bvoronoi\b/.test(text))a.push('nearest site partition distance');
 if(type==='creator')a.push('create make draw export figure diagram graph');
 return a.join(' ');
};
const fromCategory=(category,id,type)=>{
 const c=normalize(category),key=normalize(id);
 if(type==='creator'){
  if(id==='probability')return 'probability';
  if(['trace','voronoi','geometry'].includes(id))return 'geometry';
  return 'data';
 }
 if(type==='guide'){
  if(/writ|access/.test(c))return 'writing';
  if(/financ/.test(c))return 'finance';
  if(/proof|iteration/.test(c))return 'reasoning';
  if(/picture|curve/.test(c))return 'geometry';
  if(/calculus|probability/.test(c))return /normal|binomial|inference/.test(key)?'probability':'calculus';
  if(/correlation|model/.test(c))return 'models';
  return 'data';
 }
 if(/financ/.test(c))return 'finance';
 if(/proof|reason|iteration/.test(c))return 'reasoning';
 if(/geomet|voronoi|measurement/.test(c))return 'geometry';
 if(/calculus|optimis|optimiz|derivativ|integrat/.test(c))return 'calculus';
 if(/probab|inference|decision/.test(c))return 'probability';
 if(/model|relationship|regress/.test(c))return 'models';
 return 'data';
};
const make=(type,id,title,description,category,extra='',tool='')=>{
 const area=fromCategory(category,id,type);
 const aliases=aliasesFor(id,title,type);
 const fields={
  title:normalize(title),alias:normalize(aliases),
  detail:normalize(description+' '+extra),
  category:normalize(category+' '+(DISCOVERY_AREAS.find(x=>x.id===area)?.label||'')),
  tool:normalize(tool)
 };
 return Object.freeze({type,id,title,description,area,tool,fields});
};
/** Catalogues remain the sole source of truth: the index never duplicates lesson contents. */
export const DISCOVERY_ITEMS=Object.freeze([
 ...WORKSHOP_LESSONS.map(x=>make('lesson',x.id,x.title,x.when,x.category,
  [x.skill,...x.definitionIds.map(id=>definitionById(id)?.title||'')].join(' '))),
 ...WORKSHOP_DEFINITIONS.map(x=>make('definition',x.id,x.title,x.meaning,x.category,
  x.example+' '+x.notation)),
 ...RESOURCES.map(x=>make('guide',x.id,x.title,x.when,x.category,
  [x.id,...x.snippets.flat(),...x.steps].join(' '),TOOLS[x.tool].name)),
 ...REPRESENTATION_TOOLS.map(x=>make('creator',x.id,x.title,x.detail,x.groups.join(' '),
  x.navLabel+' '+x.figureTitle))
]);

const matchScore=(item,full,tokens)=>{
 if(!tokens.length)return 0;
 const f=item.fields,hay=[f.title,f.alias,f.detail,f.category,f.tool].join(' ');
 if(!tokens.every(token=>hay.includes(token)))return -1;
 let score=0;
 if(f.title===full)score+=160;
 else if(f.title.startsWith(full))score+=100;
 else if(f.title.includes(full))score+=70;
 if(f.alias.includes(full))score+=55;
 if(f.detail.includes(full))score+=14;
 for(const token of tokens){
  if(f.title.split(' ').includes(token))score+=34;
  else if(f.title.includes(token))score+=23;
  if(f.alias.includes(token))score+=18;
  if(f.detail.includes(token))score+=6;
  if(f.tool.includes(token))score+=8;
  if(f.category.includes(token))score+=3;
 }
 return score;
};
const TYPES=['lesson','definition','guide','creator'];
/**
 * A unified search with an optional task area and result type. Original
 * software and category filters still apply, but only to tutorial hits.
 */
export function discoverResources(session={}){
 const full=normalize(String(session.query||'').slice(0,120));
 const tokens=full.split(' ').filter(v=>v.length>1&&!commonWords.has(v)).slice(0,12);
 const area=validArea(session.discoveryArea)?session.discoveryArea:'';
 const type=TYPES.includes(session.discoveryType)?session.discoveryType:'all';
 const active=!!(full||area||type!=='all');
 const found=DISCOVERY_ITEMS.filter(item=>{
  if(area&&item.area!==area)return false;
  if(item.type==='guide'&&((session.tool&&item.tool!==TOOLS[session.tool]?.name)||
   (session.category&&!RESOURCES.some(r=>r.id===item.id&&r.category===session.category))))return false;
  return !full||tokens.length>0&&matchScore(item,full,tokens)>=0;
 }).map(item=>({item,score:full?matchScore(item,full,tokens):0}));
 const grouped=Object.fromEntries(TYPES.map(k=>[k,found.filter(x=>x.item.type===k)
  .sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title)).map(x=>x.item)]));
 const counts=Object.fromEntries(TYPES.map(k=>[k,grouped[k].length]));
 const total=Object.values(counts).reduce((a,b)=>a+b,0);
 return {active,area,type,query:full,total,counts,grouped,
  items:type==='all'?found.map(x=>x.item):grouped[type]};
}
