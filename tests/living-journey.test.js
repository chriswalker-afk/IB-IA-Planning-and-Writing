import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {planningAnchors,chapterStats,chapterRibbon,discoveryTrail,planningProgress,planningLearningTrail,mathConstellation} from '../src/ui/living-journey.js';
import {insightItems,insightForCurrent,insightCapture,insightEcho,insightToolkit,insightThreadMap,featuredSparkItems} from '../src/ui/insight-threads.js';
import {JOURNEY_GROUPS} from '../src/ui/journey.js';
import {insightConnections,insightTrailLines,insightTrailControls} from '../src/ui/insight-network.js';
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
 assert(planningProgress(s).includes('3 of 5 planning anchors recorded'));
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
 const s=createProjectState();s.planning.fields.provisionalTitle='Can a growth curve describe the pattern?';s.planning.fields.aim='Can a function model growth?';
 s.planning.fields.firstAction='Investigate a graph';
 const all=insightItems(s);
 assert(all.some(x=>x.id==='working-title'&&x.value.includes('growth curve')));
 assert(all.some(x=>x.id==='aim'));
 assert(insightCapture(s,'N01A').includes('Spark saved'));
 assert(insightEcho(s,'C10').includes('growth curve'));
 assert(insightEcho(s,'N05V').includes('growth curve'));
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
 assert(insightThreadMap(s).includes('explicit links'));
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
 assert(insightEcho(s,'C10').includes('Only the measured range was tested')); // available in View all, not featured
 assert(!featuredSparkItems(s,'C10').some(x=>x.id==='limit:l1'));
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

test('thread overlays show only explicit source-to-mathematics relationships, without changing project state',()=>{
 const s=createProjectState();
 s.planning.fields.aim='Does this model work?';
 s.completion.sourceRecords=[{id:'source-one',fields:{actualSource:'Fictional data'}}];
 s.completion.accuracyDecisions=[{id:'acc-one',quantity:'Length',unit:'cm',policy:'Nearest cm'}];
 s.entries=[{id:'step-one',status:'completed',title:'First plot',result:'Curved pattern',sourceRefs:['source-one'],accuracyRefs:['acc-one']},
 {id:'step-two',status:'planned',title:'Next model',result:'',fromEntryId:'step-one'}];
 const before=JSON.stringify(s), links=insightConnections(s);
 assert(links.some(x=>x.id==='source:source-one'));
 assert(links.some(x=>x.id==='accuracy:acc-one'));
 assert(links.some(x=>x.id==='result:step-one'));
 assert(insightTrailLines(s).includes('data-thread-id="source:source-one"'));
 assert(insightTrailControls(s).includes('data-action="insight-focus"'));
 assert(discoveryTrail(s).includes('Follow your Insight Threads'));
 assert.equal(JSON.stringify(s),before);
 s.entries[0].sourceRefs=[];
 assert(!insightConnections(s).some(x=>x.id==='source:source-one'));
});
test('stars link directly to mathematical records, with distinct review and plan state',()=>{
 const s=createProjectState();
 s.entries=[{id:'one',title:'Graph',status:'completed',result:'A real observation'},
 {id:'two',title:'Possible extension',status:'planned',result:''}];
 const html=mathConstellation(s);
 assert.equal((html.match(/class="constellation-star-hit"/g)||[]).length,2);
 assert(html.includes('aria-label="Open Graph: Actual result"'));
 assert(html.includes('aria-label="Open Possible extension: Planned"'));
 assert(html.includes('data-action="completion-edit-entry"'));
});
test('mathematical learning is sparked only when a genuine completed result accompanies recorded understanding',()=>{
 const s=createProjectState();
 s.entries=[{id:'learn',title:'Transformations',status:'completed',result:'Derived an identity',
  knowledge:'outside',mathsInsight:'I independently understood this mathematical step.'},
 {id:'unearned',title:'Just a plan',status:'planned',result:'',knowledge:'outside',mathsInsight:'Not done'}];
 const x=insightItems(s);
 assert(x.some(t=>t.id==='learning:learn'));
 assert(!x.some(t=>t.id==='learning:unearned'));
 assert(insightToolkit(s).includes('My mathematical learning'));
 assert(insightEcho(s,'C60').includes('independently understood'));
});
test('interaction styles support focus, phone layouts and reduced motion',()=>{
 const css=readFileSync(new URL('../data/interaction-pass.css',import.meta.url),'utf8');
 assert(css.includes('.living-thread-line.is-active'));
 assert(css.includes('.constellation-star-hit:focus-visible'));
 assert(css.includes('@media(max-width:760px)'));
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
});

test('Planning trail has all chapters, a live planning step and honest provisional anchors',()=>{
 const s=createProjectState();s.route='planning';
 const fresh=planningLearningTrail(s);
 assert(fresh.includes('planning-learning-trail'));
 assert(fresh.includes('planning-trail-desktop'));
 assert(fresh.includes('planning-trail-compact'));
 assert(fresh.includes('Phase 1 of 4'));
 assert(fresh.includes('0 of 5 decisions saved'));
 assert(fresh.includes('aria-label="Your learning trail"'));
 for(const g of JOURNEY_GROUPS)assert(fresh.includes(g.name.replace('&','&amp;')));
 assert(fresh.includes('data-action="journey-open"'));
 s.planning.current='N05';
 s.planning.completedNodes=['N00','N01'];
 s.planning.fields.aim='How does this pattern change?';
 s.planning.fields.firstAction='Plot the first graph';
 const later=planningLearningTrail(s);
 assert(later.includes('Phase 3 of 4'));
 assert(later.includes('2 of 5 decisions saved'));
 assert(later.includes('Plan your mathematics'));
 assert(later.includes('2 completed'));
 assert(later.includes('Chose a starting route'));
 assert(later.includes('Worked on the title and question'));
 s.planning.visited=['N00','N01','N05'];s.planning.completedNodes=[];
 assert(planningLearningTrail(s).includes('0 completed'));
 assert(!later.includes('100%'));
});
test('Planning trail includes responsive column and compact disclosure styles',()=>{
 const css=readFileSync(new URL('../data/living-journey.css',import.meta.url),'utf8');
 assert(css.includes('grid-template-areas:"task trail"'));
 assert(css.includes('.planning-learning-trail{position:sticky'));
 assert(css.includes('.planning-trail-help-toggle'));
 assert(css.includes('.planning-trail-screen-progress'));
 assert(css.includes('planning-trail-support.is-open'));
 const html=planningLearningTrail(createProjectState(),{support:'<button type="button">Support</button>'});
 assert(html.includes('planning-trail-support-body'));
 assert(html.includes('Support'));
 assert(css.includes('@media(max-width:980px)'));
 assert(css.includes('.planning-trail-compact{display:block'));
});

test('working title survives export normalization, remains escaped and does not create a mathematical result',()=>{
 const s=createProjectState();s.route='planning';
 s.planning.fields.provisionalTitle='<example> My working title';
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.planning.fields.provisionalTitle,s.planning.fields.provisionalTitle);
 const items=insightItems(restored);
 assert(items.some(x=>x.id==='working-title'));
 assert(!items.some(x=>x.id.startsWith('result:')));
 assert(insightCapture(restored,'N01').includes('Spark saved'));
 assert(!insightCapture(restored,'N01').includes('<example>'));
 assert(insightEcho(restored,'N03').includes('&lt;example&gt;'));
});

test('motivation is a separate student-owned spark echoed where findings need a purpose',()=>{
 const s=createProjectState();
 s.planning.fields.aim='Can I model my observed measurements?';
 s.planning.fields.beneficiary='I want to know whether this model is useful for estimating a new measurement.';
 let items=insightItems(s);
 assert(items.some(x=>x.id==='aim'));
 assert(items.some(x=>x.id==='motivation'&&x.value.includes('useful')));
 assert(insightCapture(s,'N01V').includes('Spark saved · Your motivation'));
 assert(insightEcho(s,'N02').includes('My motivation'));
 assert(insightEcho(s,'C10').includes('My motivation'));
 assert(insightEcho(s,'C35').includes('My motivation'));
 assert(insightEcho(s,'C60').includes('My motivation'));
 assert(insightEcho(s,'C60').includes('genuine mathematics'));
 const after=JSON.parse(JSON.stringify(s));
 after.planning.fields.beneficiary='';
 after.project.beneficiary='';
 assert(!insightItems(after).some(x=>x.id==='motivation'));
});
