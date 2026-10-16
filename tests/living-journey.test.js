import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {planningAnchors,chapterStats,chapterRibbon,discoveryTrail,planningProgress,mathConstellation} from '../src/ui/living-journey.js';
import {insightItems,insightForCurrent,insightCapture,insightEcho,insightToolkit,insightThreadMap} from '../src/ui/insight-threads.js';
import {JOURNEY_GROUPS} from '../src/ui/journey.js';
import {journeyMap,journeyRail,groupedDashboard} from '../src/ui/journey-views.js';

test('a fresh project gets a journey, but no invented milestones or result stars',()=>{
 const s=createProjectState(),before=JSON.stringify(s);
 assert.equal(planningAnchors(s).filter(x=>x.recorded).length,0);
 assert.equal(chapterStats(s,JOURNEY_GROUPS[0]).ready,0);
 assert.equal(insightItems(s).length,0);
 assert(insightToolkit(s).includes('toolkit grows'));
 assert(!insightThreadMap(s));
 assert(discoveryTrail(s).includes('Not started'));
 assert(mathConstellation(s).includes('Start with a question'));
 assert(!mathConstellation(s).includes('data-index="0"'));
 assert.equal(JSON.stringify(s),before);
});
test('the four chapters are consistent in ribbon, rail, map and dashboard',()=>{
 const s=createProjectState();s.route='planning';s.planning.fields.aim='Investigate a relationship';
 s.planning.fields.dataSource='secondary';s.planning.fields.firstAction='Draw a scatter diagram';
 const strip=chapterRibbon(s),map=journeyMap(s),rail=journeyRail(s),board=groupedDashboard(s);
 for(const g of JOURNEY_GROUPS){
   assert(strip.includes(g.name.replace('&','&amp;')));
   assert(map.includes(g.name.replace('&','&amp;')));
   assert(rail.includes(g.name.replace('&','&amp;')));
   assert(board.includes(g.name.replace('&','&amp;')));
 }
 assert.equal(chapterStats(s,JOURNEY_GROUPS[0]).ready,3);
 assert(planningProgress(s).includes('3 of 4 planning anchors recorded'));
 assert(!strip.includes('100%'));
 assert(!map.includes('IA grade awarded'));
});
test('self-assessed stage progress never treats a visit as a completion',()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C40';
 s.completion.visited=['C10','C20','C30'];
 assert.equal(chapterStats(s,JOURNEY_GROUPS[1]).ready,0);
 s.completion.stages.C10='complete';
 assert.equal(chapterStats(s,JOURNEY_GROUPS[1]).ready,1);
 s.completion.stages.C20='needs-review';
 assert(discoveryTrail(s).includes('Needs review'));
 assert.equal(chapterStats(s,JOURNEY_GROUPS[1]).ready,1);
});
test('aim and planned mathematics are sparks, but do not become completed results',()=>{
 const s=createProjectState();s.planning.fields.aim='Can a function model growth?';
 s.planning.fields.firstAction='Investigate a graph';
 const all=insightItems(s);
 assert(all.some(x=>x.id==='aim'));
 assert(all.some(x=>x.id==='planned-maths'&&x.planned));
 assert(insightCapture(s,'N01').includes('Spark saved'));
 assert(insightEcho(s,'N05V').includes('Can a function model growth?'));
 assert.equal(mathConstellation(s).match(/constellation-point/g)?.length||0,0);
});
test('exact accuracy and source links create grounded echoes and shared threads',()=>{
 const s=createProjectState();s.planning.fields.aim='Does the graph fit?';
 s.completion.sourceRecords=[{id:'source-one',fields:{actualSource:'School measurements',dataStatus:'ready'}}];
 s.completion.accuracyDecisions=[{id:'acc-one',quantity:'Distance',unit:'cm',policy:'Nearest centimetre'}];
 s.entries=[
   {id:'r1',status:'completed',title:'First graph',result:'The plot is curved',
    localTakeaway:'It is not straight',sourceRefs:['source-one'],accuracyRefs:['acc-one'],phase:'first'},
   {id:'r2',status:'planned',title:'Explore a model',fromEntryId:'r1',result:'',sourceRefs:[],accuracyRefs:[]}
 ];
 s.completion.activeEntryIndex=0;
 const all=insightItems(s),inMath=insightForCurrent(s,'C40');
 assert(all.some(x=>x.id==='source:source-one'&&x.linked.length===1));
 assert(all.some(x=>x.id==='accuracy:acc-one'&&x.linked.length===1));
 assert(inMath.some(x=>x.id==='accuracy:acc-one'));
 assert(inMath.some(x=>x.id==='source:source-one'));
 assert(inMath.some(x=>x.id==='result:r1')===false); // current result is not an echo of itself
 assert(insightThreadMap(s).includes('Explicitly'));
 assert(insightEcho(s,'C40').includes('Nearest centimetre'));
 const sky=mathConstellation(s);
 assert(sky.includes('constellation-link'));
 assert(sky.includes('1 actual result'));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert(insightItems(restored).some(x=>x.id==='accuracy:acc-one'));
});
test('an unrelated source or accuracy choice must not masquerade as an input',()=>{
 const s=createProjectState();
 s.completion.sourceRecords=[{id:'source-other',fields:{actualSource:'Unrelated spreadsheet'}}];
 s.completion.accuracyDecisions=[{id:'acc-other',quantity:'Time',unit:'s',policy:'Nearest second'}];
 s.entries=[{id:'r1',status:'completed',result:'3',sourceRefs:[],accuracyRefs:[]}];
 s.completion.activeEntryIndex=0;
 const context=insightForCurrent(s,'C40');
 assert(!context.some(x=>x.type==='accuracy'||x.type==='evidence'));
 assert(!insightThreadMap(s));
});
test('confirmed limitations return in the conclusion but suggested limitations never appear as findings',()=>{
 const s=createProjectState();s.completion.confirmedLimitations=[
  {id:'l1',sourceId:'student',stage:'C40',explanation:'Only the measured range was tested',consequence:'No extrapolation is justified'}
 ];
 assert(insightEcho(s,'C60').includes('Only the measured range was tested'));
 assert(insightItems(s).some(x=>x.id==='limit:l1'));
 assert(!insightEcho(s,'C10').includes('Only the measured range was tested'));
});
test('constellation links only explicitly related student records, including review state',()=>{
 const s=createProjectState();
 s.entries=[
  {id:'a',status:'completed',result:'First result'},
  {id:'b',status:'completed',result:'Another independent result'},
  {id:'c',fromEntryId:'a',status:'planned',result:''}
 ];
 const withLink=mathConstellation(s);
 assert.equal((withLink.match(/class="constellation-link/g)||[]).length,1);
 s.entries[2].fromEntryId='missing';
 assert.equal((mathConstellation(s).match(/class="constellation-link/g)||[]).length,0);
 s.entries[1].reviewNeeded='yes';
 assert(mathConstellation(s).includes('Needs review'));
});
test('all user-authored values are escaped, navigable and read-only',()=>{
 const s=createProjectState();s.planning.fields.aim='<img src=x onerror=alert(1)>';
 const before=JSON.stringify(s);
 const html=insightToolkit(s)+insightEcho(s,'C10')+journeyMap(s);
 assert(!html.includes('<img src=x'));
 assert(html.includes('&lt;img'));
 assert(html.includes('data-action="insight-jump"'));
 assert.equal(JSON.stringify(s),before);
});
test('responsive styles respect reduced-motion preferences',()=>{
 const css=readFileSync(new URL('../data/living-journey.css',import.meta.url),'utf8');
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
 assert(css.includes('@media(max-width:760px)'));
 assert(css.includes('focus-visible'));
});
