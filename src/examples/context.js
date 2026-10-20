/** Read-only selection. No example interaction changes student evidence or progress. */
import {EXAMPLES,exampleById} from './catalog.js';
import {routeById} from '../planning/investigative-routes.js';
export const CATEGORIES={introduction:'Introductions',methods:'Aims & methods',presentation:'Graphs, tables & diagrams',mathematics:'Mathematical presentation',reflection:'Interpretation & reflection',conclusion:'Conclusions',review:'Coherence & references'};
export const TOPICS={introduction:'introductions',title:'provisional titles',aim:'aims',motivation:'clear motivations',source:'sources and sampling',method:'method choices',assumptions:'assumptions',table:'tables',graph:'graphs',distribution:'data displays',diagram:'diagrams',calculation:'calculations',notation:'mathematical presentation',technology:'technology explanations',interpretation:'interpretations',next:'next mathematical steps',limitations:'limitation writing',precision:'accuracy decisions',understanding:'mathematical explanations',learning:'mathematical learning',proof:'proofs',engagement:'mathematical decisions',conclusion:'conclusions',coherence:'coherence',references:'attribution'};
const JOURNEY_CARDS={relationships:"EX35",groups:"EX36",categorical:"EX37",variation:"EX36","fitted-models":"EX11",growth:"EX47",cycles:"EX38",trajectories:"EX53",optimisation:"EX46",images:"EX42",triangulation:"EX54",voronoi:"EX39",finance:"EX47",chance:"EX40",proof:"EX20",iteration:"EX41"};
const PLANNING_TOPICS={N01:"title",N01V:"motivation",N02:"aim",N02M:"method",N02U:"method",N03:"source",N03P:"source",N03P2:"precision",N03S:"source",N03J:"method",N03B:"source",N04:"method",N04S:"method",N04R:"method",N04M:"method",N05:"first-method",N05V:"first-link",N01P:"introduction"};
const cueTopics={W01:'introduction',W02:'introduction',W03:'source',W04:'source',W05:'source',W06:'source',W07:'source',W08:'source',W09:'precision',W10:'assumptions',W11:'limitations',W12:'notation',W13:'source',W14:'method',W15:'graph',W16:'interpretation',W17:'precision',W18:'interpretation',W19:'next',W20:'next',W21:'method',W22:'technology',W23:'interpretation',W24:'model',W25:'precision',W26:'interpretation',W27:'engagement',W28:'proof',W29:'conclusion',W30:'coherence',W31:'coherence',W32:'coherence',W33:'source',W34:'calculation',W35:'assumptions',W36:'assumptions',W38:'interpretation',W39:'next',W40:'next',W41:'next',W42:'next',W43:'model',W44:'conclusion',W45:'engagement',W46:'precision',W47:'precision',W48:'interpretation',W49:'precision',W50:'next',W51:'precision',W52:'precision',W53:'precision',W54:'understanding',W55:'precision',W56:'precision',W57:'precision',W58:'learning',W59:'understanding',W60:'understanding',W61:'understanding',W62:'understanding',W63:'understanding',W64:'learning',W65:'understanding',W66:'learning'};
const helpTopics={aim:'aim',source:'source',sampling:'source','no-data':'source',partial:'source',permission:'source',precision:'precision',graph:'graph',table:'table',notation:'notation',maths:'calculation',understanding:'understanding',technology:'technology',interpret:'interpretation',next:'next',proof:'proof',limitations:'limitations',conclusion:'conclusion',feedback:'coherence',writing:''};
const nodeTopics={C10:'introduction',C10E:'introduction',C02:'aim',C20:'source',C21S:'source',C21M:'assumptions',C21T:'proof',C22:'method',C23:'limitations',C24:'precision',C25:'notation',C26:'method',C30:'graph',C31:'graph',C32:'method',C33:'graph',C34:'interpretation',C34A:'precision',C34B:'interpretation',C34U:'next',C35:'next',C35H:'next',C35B:'next',C35P:'next',C40:'calculation',C50:'calculation',C40T:'technology',C40D:'understanding',C40L:'understanding',C60:'conclusion',C61:'conclusion',C62:'conclusion',C63:'conclusion',C64:'conclusion',C70:'coherence',C70N:'notation',C80:'coherence',C80D:'coherence',C90:'coherence',C90F:'coherence'};
const str=v=>typeof v==='string'?v:'';
export function exampleContext(state,options={}){
 const c=state.completion||{},p=state.planning?.fields||{},entries=state.entries||[];
 let route=state.route,node=route==='planning'?state.planning?.current:c.current;
 let index=c.activeEntryIndex,nextId=c.nextFromEntryId;
 const support=c.support||{};
 const help=options.help===true||/^C95/.test(node||'');
 if(help&&support.origin){
  const o=support.origin;route=o.route;node=route==='planning'?o.planNode:o.node;
  index=entries.findIndex(e=>e.id===o.entryId);nextId=o.nextFromEntryId;
 }
 if(node==='C96'){
  const o=c.writingOrigin||{};node=o.node||c.returnTo||'C04';
  index=entries.findIndex(e=>e.id===o.entryId);nextId=o.nextFromEntryId;
 }
 const mathematicalTask=route==='completing'&&/^C(?:3[0-5][A-Z]?|40[TDL]?|50)$/.test(node||'');
 const entry=mathematicalTask?(/^C35/.test(node||'')?entries.find(e=>e.id===nextId):entries[index]):undefined;
 const real=entry?.status==='completed'&&!!str(entry.result).trim();
 const kind=p.kind||state.project?.kind||'unsure';
 const isTheory=kind==='theoretical'||entry?.kind==='theory';
 const method=str(entry?.methodId);
 const representation=str(c.fields?.firstType||p.figureType);
 const routeChoice=routeById(state.planning?.routeExplorer?.selectedRoute);
 const journey=routeChoice&&routeChoice.kinds.includes(kind)?routeChoice.id:'';
 let topic=nodeTopics[node]||'coherence';
 if(route==='planning')topic=PLANNING_TOPICS[node]||(/^N03/.test(node)?'source':/^N04/.test(node)?'method':'aim');
 if(['C30','C31','C33'].includes(node)||route==='planning'&&topic==='graph'){
  if(representation==='table')topic='table';
  else if(representation==='diagram')topic='diagram';
  else if(representation==='distribution')topic='distribution';
  else if(representation==='calculation')topic='calculation';
  else if(representation==='theory')topic='proof';
 }
 topic=options.topic||cueTopics[options.cue]||(help?helpTopics[support.selected]:null)||topic;
 if(isTheory&&topic==='source')topic='proof';
 if(isTheory&&topic==='calculation')topic='proof';
 const f=c.fields||{};
 // Never use a pattern selected for another mathematical record.
 const pattern=(real&&c.scatterDetailForEntryId===entry?.id?f.scatterDetail:'')||
  (real&&c.scatterPatternForEntryId===entry?.id?f.scatterPattern:'')||(real?entry?.observation:'')||'';
 const pmcc=(real&&c.pmccSignalForEntryId===entry?.id?f.pmccSignal:'')||'';
 const mode=route==='planning'?'Planning preview':real?'Example alongside your selected result':'Fictional learning preview';
 return {route,node,entry,real,kind:isTheory?'theoretical':kind,method,topic,pattern,pmcc,representation,journey,help,
  knowledge:str(entry?.knowledge),mode,label:route==='planning'?'Planning your investigation':str(entry?.title)||'Your current IA task',
  course:str(p.course||state.project?.course)};
}
export function selectExamples(state,options={}){
 const x=exampleContext(state,options);const ids=[];
 const add=(...v)=>ids.push(...v);
 const theory=x.kind==='theoretical',stats=x.kind==='statistics';
 const journeyCard=JOURNEY_CARDS[x.journey];
 switch(x.topic){
  case 'first-link':add('EX48',journeyCard||'EX05');break;
  case 'first-method':add(journeyCard||'EX49','EX49');break;
  case 'first-evaluation':add('EX50',journeyCard||'EX07');break;
  case 'conclusion-meaning':add('EX51');break;
  case 'conclusion-next':add(theory?'EX23':stats?'EX25':'EX52');break;
  case 'title':add('EX30','EX04');break;
  case 'motivation':add(theory?'EX33':stats?'EX32':'EX31',theory?'EX31':stats?'EX31':'EX32');break;
  case 'introduction':case 'aim':add(theory?'EX03':stats?'EX02':'EX01');if(x.topic==='introduction')add('EX34');if(x.topic==='aim'&&!stats&&!theory)add('EX04');break;
  case 'source':add(stats?'EX45':'EX43',stats?'EX06':'EX44');break;
  case 'method':add(journeyCard|| (theory?'EX20':stats?'EX06':'EX05'),theory?'EX20':stats?'EX06':'EX05');break;
  case 'assumptions':case 'limitations':add(theory?'EX26':stats?'EX06':x.topic==='assumptions'?'EX07':'EX17');break;
  case 'table':add(x.journey==='categorical'?'EX37':'EX08');if(!theory&&!stats)add('EX09');break;
  case 'distribution':add(x.journey==='groups'||x.journey==='variation'?'EX36':'EX37','EX29');break;
  case 'graph':add(journeyCard&&(x.journey!=='proof')?journeyCard:theory?'EX28':stats?'EX35':'EX10');break;
  case 'diagram':add(journeyCard||'EX12');break;
  case 'precision':add(x.route==='planning'?'EX43':'EX18','EX44');break;
  case 'technology':add('EX14','EX13');break;
  case 'calculation':add(journeyCard||'EX13','EX13');break;
  case 'notation':add('EX13','EX24');break;
  case 'interpretation':add(theory?'EX20':stats||x.method==='pmcc'?'EX27':'EX15',journeyCard||'EX15');break;
  case 'next':add(theory?'EX41':'EX16',journeyCard||'EX55','EX55');break;
  case 'model':add('EX11','EX07');break;
  case 'learning':case 'understanding':add('EX19');break;
  case 'proof':add('EX20','EX03');break;
  case 'engagement':add('EX21');break;
  case 'conclusion':add(theory?'EX23':stats?'EX25':'EX22');break;
  case 'references':case 'coherence':add('EX24','EX13');break;
  default:add('EX13','EX19');
 }
 // The library remains browsable; this list is a contextual suggestion, not a requirement.
 return [...new Set(ids)].map(exampleById).filter(Boolean);
}
export function defaultVariant(card,x){
 if(card.id==='EX19')return ['syllabus','mixed','outside'].includes(x.knowledge)?x.knowledge:x.topic==='learning'?'learning':'';
 if(card.id==='EX16'&&x.real){
  if(['near-perfect','rough-linear','linear'].includes(x.pattern))return 'linear';
  if(x.pattern==='turning')return 'turning';
  if(x.pattern==='monotonic')return 'monotonic';
  if(x.pattern==='unclear')return 'unclear';
 }
 return '';
}
export function filterExamples({query='',category='',kind=''}={}){
 const q=str(query).toLowerCase().trim().slice(0,160);
 return EXAMPLES.filter(e=>(!category||e.category===category)&&(!kind||e.kind===kind||e.kind==='all')&&
 (!q||[e.title,e.weak,e.strong,e.why,...e.topics].join(' ').toLowerCase().includes(q)));
}
