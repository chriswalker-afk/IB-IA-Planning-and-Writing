import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {planningAnchors,chapterStats,chapterRibbon,discoveryTrail,discoveryMathStages,planningProgress,planningLearningTrail,mathConstellation} from '../src/ui/living-journey.js';
import {insightItems,insightForCurrent,insightCapture,insightEcho,insightToolkit,insightThreadMap,featuredSparkItems} from '../src/ui/insight-threads.js';
import {JOURNEY_GROUPS,groupStatus,groupTarget,mathematicalPages,chapterProgressCopy} from '../src/ui/journey.js';
import {insightConnections,insightTrailLines,insightTrailControls,CHAPTER_TRAIL_POINTS,threadGeometry} from '../src/ui/insight-network.js';
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
 s.planning.fields.dataSource='secondary';s.planning.fields.course='AI SL';s.planning.fields.kind='statistics';
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
 assert.equal((html.match(/class="constellation-star-hit\b/g)||[]).length,2);
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
 s.planning.current='N01P';
 s.planning.completedNodes=['N00','N01'];
 s.planning.fields.aim='How does this pattern change?';
 s.planning.fields.course='AI SL';s.planning.fields.kind='statistics';
 const later=planningLearningTrail(s);
 assert(later.includes('Phase 3 of 4'));
 assert(later.includes('2 of 5 decisions saved'));
 assert(later.includes('Prepare to explore'));
 assert(later.includes('2 completed'));
 assert(later.includes('Chose a starting route'));
 assert(later.includes('Worked on the title and question'));
 s.planning.visited=['N00','N01','N01P'];s.planning.completedNodes=[];
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


test('Discovery Trail has mint planning, purple writing, then blue Checking in five steps',()=>{
 const s=createProjectState();
 s.route='completing';s.completion.current='C10';
 const before=JSON.stringify(s);
 const trail=discoveryTrail(s),small=discoveryTrail(s,{compact:true});
 for(const html of [trail,small]){
  assert(html.includes('living-trail-route'));
  assert(html.includes('living-trail-zone-underlay'));
  assert(html.includes('living-trail-zone-title plan'));
  assert(html.includes('living-trail-zone-title writing'));
   assert(html.includes('living-trail-zone-title checking'));
   assert(html.includes('Check your IA'));
  assert(html.includes('Write your IA'));
  assert(html.includes('Plan'));
  assert.equal((html.match(/class="living-trail-step /g)||[]).length,5);
  assert.equal((html.match(/class="living-trail-step [^"]* writing"/g)||[]).length,3);
  assert.equal((html.match(/class="chapter-journey-icon"/g)||[]).length,5);
  assert(!html.includes('journey-mode-tag'));
  assert(!html.includes('PLAN ONLY')&&!html.includes('WRITE IN IA'));
  assert(html.includes('aria-label="Chapter 2: Start writing. Write in your IA.'));
  for(const label of ['Planning','Start writing','Explore &amp; explain','Conclude &amp; next steps','Check your IA'])
   assert(html.includes(label),label);
 }
 assert.equal(JSON.stringify(s),JSON.stringify(JSON.parse(before)));
});
test('Discovery Trail path starts inside Planning and every visible milestone centres over its own chapter card',()=>{
 const s=createProjectState();
 const trail=discoveryTrail(s);
 assert(trail.includes('viewBox="0 0 1000 155" preserveAspectRatio="none"'));
 assert(trail.includes('class="living-trail-path"'));
 assert.equal((trail.match(/class="living-trail-node living-trail-marker /g)||[]).length,5);
 assert.deepEqual(JOURNEY_GROUPS.map(g=>CHAPTER_TRAIL_POINTS[g.id].x),[100,300,500,700,900]);
 assert(CHAPTER_TRAIL_POINTS.plan.x<250);
 for(const g of JOURNEY_GROUPS.slice(1))assert(CHAPTER_TRAIL_POINTS[g.id].x>250);
 const positions=[
  ['plan',10,118,'planning'],['setup',30,58,'writing'],
  ['explore',50,112,'writing'],['finish',70,58,'writing'],['check',90,118,'checking']
 ];
 for(const [id,left,top,mode] of positions){
  const n=JOURNEY_GROUPS.findIndex(g=>g.id===id);
  assert(trail.includes('style="left:'+left+'%;top:'+top+'px"'),id);
   assert(trail.includes(' '+mode+' '),id);
  assert(trail.includes('<span class="living-trail-circle">'+(n+1)+'</span>'),id);
 }
 assert(trail.includes('M100 118 C200 118 200 58 300 58'));
  assert(trail.includes('writing-to-checking'));
 assert.equal(threadGeometry({from:'plan',to:'explore'},0).startsWith('M100 118'),true);
 const css=readFileSync(new URL('../data/living-journey.css',import.meta.url),'utf8');
 assert(css.includes('.living-trail-route .living-trail-path .living-trail-svg'));
 assert(css.includes('vector-effect:non-scaling-stroke'));
 assert(css.includes('.living-trail-route .living-trail-marker .living-trail-circle'));
 assert(css.includes('.living-trail-route .living-trail-path{display:none}'));
});
test('chapter progress and writing identity remain independent after completing Planning',()=>{
 const s=createProjectState();
 s.planning.completed=true;
 s.route='completing';s.completion.current='C10';
 let html=discoveryTrail(s),rail=journeyRail(s),strip=chapterRibbon(s);
 assert(html.includes('living-trail-node living-trail-marker complete planning'));
 assert(html.includes('living-trail-node living-trail-marker not-started writing'));
 assert(rail.includes('journey-rail-zone planning'));
 assert(rail.includes('journey-rail-zone writing'));
 assert(rail.includes('journey-rail-zone-label'));
 assert.equal((rail.match(/class="journey-milestone-text"/g)||[]).length,5);
  assert(rail.includes('journey-rail-zone checking'));
 assert.equal((rail.match(/journey-mode-tag/g)||[]).length,0);
 assert.equal((strip.match(/living-ribbon-part [^"]+ writing/g)||[]).length,3);
 s.completion.stages.C10='needs-review';
 html=discoveryTrail(s);
 assert(html.includes('living-trail-node living-trail-marker needs-review writing'));
 s.completion.stages.C10='complete';s.completion.stages.C20='complete';
 html=discoveryTrail(s);
 assert(html.includes('living-trail-node living-trail-marker complete writing'));
 // A completed writing section still has the writing colour identity.
 assert(html.includes('living-trail-zone-underlay'));
});
test('the compact Planning roadmap uses one writing-zone cue, not a badge on each chapter',()=>{
 const s=createProjectState();s.route='planning';
 const html=planningLearningTrail(s);
 assert(html.includes('planning-trail-zone-underlay'));
 assert.equal((html.match(/planning-trail-phase-label plan/g)||[]).length,2); // desktop and compact copy
 assert.equal((html.match(/planning-trail-phase-label writing/g)||[]).length,2);
 assert(!html.includes('journey-mode-tag'));
 assert.equal((html.match(/planning-trail-chapter /g)||[]).length,10);
  assert.equal((html.match(/planning-trail-phase-label checking/g)||[]).length,2);
 assert(html.includes('aria-label="Chapter 2: Start writing, WRITE IN IA, Not started"'));
});
test('three-zone styles use distinct mint/lavender/blue colours and a single-column mobile journey',()=>{
 const css=readFileSync(new URL('../data/living-journey.css',import.meta.url),'utf8');
 assert(css.includes('.living-trail-zone-underlay>.plan'));
 assert(css.includes('.living-trail-zone-underlay>.writing'));
  assert(css.includes('.living-trail-zone-underlay>.checking'));
  assert(css.includes('.journey-rail-zone.checking'));
 assert(css.includes('.journey-rail-zone.writing'));
 assert(css.includes('.planning-trail-zone-underlay'));
 assert(css.includes('@media(max-width:540px)'));
 assert(css.includes('grid-template-columns:1fr'));
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
 assert(css.includes(':focus-visible'));
});

test('a brand-new Discovery Trail shows no mandatory extra mathematical stage',()=>{
 const s=createProjectState(),g=JOURNEY_GROUPS[2],stats=chapterStats(s,g),html=discoveryTrail(s);
 assert.equal(stats.total,1,"one starting placeholder, not a compulsory second technique");
 assert.equal(stats.ready,0);
 assert.equal(stats.statuses[0],'not-started');
 assert.equal(groupStatus(s,g),'not-started');
 assert(html.includes('First mathematics, then further stages if useful'));
 assert(!html.includes('data-trail-math-stages'));
 assert.equal(discoveryMathStages(s),'');
});
test('three mathematical pages are real repeatable trail links with two verified results',()=>{
 const s=createProjectState();
 s.entries=[
  {id:'first',phase:'first',title:'Initial graph',status:'completed',result:'A measured curve'},
  {id:'second',phase:'substantial',fromEntryId:'first',title:'Quadratic model',status:'completed',result:'Lower residuals'},
  {id:'third',phase:'substantial',fromEntryId:'second',title:'Find the optimum',status:'planned',result:''}
 ];
 s.completion.activeEntryIndex=2;s.completion.current='C50';s.route='completing';
 const pages=mathematicalPages(s),group=JOURNEY_GROUPS[2],stats=chapterStats(s,group);
 assert.equal(pages.length,3);assert.deepEqual(pages.map(x=>x.stage),[1,2,3]);
 assert.deepEqual(stats.statuses,['complete','complete','working']);
 assert.equal(stats.total,3);assert.equal(stats.ready,2);
 const summary='3 mathematical stages · 2 actual results';
 const trail=discoveryTrail(s),strip=discoveryMathStages(s);
 assert(trail.includes(summary));
 for(const [i,label] of ['First mathematics','Mathematical stage 2','Mathematical stage 3'].entries()){
  assert(strip.includes(label));
  assert(strip.includes('data-index="'+i+'"'));
 }
 assert(strip.includes('2 actual results · 1 in progress'));
 assert(strip.includes('data-action="completion-edit-entry"'));
 assert(chapterRibbon(s).includes('Follow')===false,"Ribbon stays compact");
 assert(journeyRail(s).includes(summary),'Sidebar has the same dynamic summary');
 assert.equal(groupTarget(s,group),'C50','Current third stage remains active');
 s.route='path';s.completion.current='C04';
 assert.equal(groupTarget(s,group),'C50','Returning from the trail restores current stage');
});
test('the discovery progress never treats saved figures or draft text as actual mathematical results',()=>{
 const s=createProjectState(),g=JOURNEY_GROUPS[2];
 s.completion.stages.C30='complete';s.completion.stages.C40='complete';
 assert.notEqual(groupStatus(s,g),'complete','Manual stage flags alone cannot invent mathematics');
 s.entries=[{id:'first',phase:'first',status:'planned',result:'A draft diagram note',
  graphFigureId:'graph1'}];
 assert.equal(chapterStats(s,g).ready,0);
 assert.notEqual(groupStatus(s,g),'complete');
 assert(discoveryTrail(s).includes('0 actual results'));
 s.entries[0].status='completed';s.entries[0].result='Actual calculations verified';
 assert.equal(groupStatus(s,g),'complete','Explicitly ready plus verified results is a checkpoint');
 s.entries.push({id:'second',phase:'substantial',fromEntryId:'first',status:'planned',result:''});
 assert.equal(groupStatus(s,g),'working','An unfinished added stage reopens the mathematical work');
});
test('dependency review is visible in the trail and persists through a saved project',()=>{
 const s=createProjectState(),g=JOURNEY_GROUPS[2];
 s.entries=[{id:'first',phase:'first',status:'completed',result:'An observed graph'},
  {id:'second',phase:'substantial',status:'completed',result:'Calculated result',
   fromEntryId:'first',reviewNeeded:'yes'}];
 assert.equal(groupStatus(s,g),'needs-review');
 assert.deepEqual(chapterStats(s,g).statuses,['complete','needs-review']);
 assert(discoveryMathStages(s).includes('Connection needs checking'));
 const restored=normalizeProjectState(s);
 assert.equal(groupStatus(restored,g),'needs-review');
 assert(discoveryTrail(restored).includes('1 to review'));
});
test('very long explorations use a bounded mini progress and expandable page navigation',()=>{
 const s=createProjectState(),g=JOURNEY_GROUPS[2];
 s.entries=[{id:'first',phase:'first',status:'completed',result:'A result'}];
 for(let n=2;n<=24;n++)s.entries.push({id:'stage-'+n,phase:'substantial',fromEntryId:n===2?'first':'stage-'+(n-1),
  status:n<=20?'completed':'planned',result:n<=20?'Actual step '+n:''});
 const mini=chapterMiniFor(g,s);
 assert.equal((mini.match(/journey-mini-cell /g)||[]).length,6,'cap displayed markers');
 assert(mini.includes('+18'),'count hidden earlier stages');
 const strip=discoveryMathStages(s);
 assert(strip.includes('Mathematical stage 24'));
 assert(strip.includes('Mathematical stage 2'),'earlier stages remain inside disclosure');
 assert(strip.includes('data-action="completion-edit-entry"'));
 assert.equal(chapterStats(s,g).total,24);
});
function chapterMiniFor(g,s){
 const html=journeyRail(s),start=html.indexOf('journey-mini',html.indexOf('journey-rail-name'));
 // Isolate only the Explore stage mini, not all sidebar mini bars.
 const explore=html.indexOf('Explore &amp; explain');
 return html.slice(explore,html.indexOf('</button>',explore));
}
test('chapter summaries describe all four current writing tasks and escape student text',()=>{
 const s=createProjectState();s.entries=[{id:'first',phase:'first',title:'<img onerror=alert(1)>',
  status:'completed',result:'Real finding'}];
 assert(chapterProgressCopy(s,JOURNEY_GROUPS[1]).includes('Introduction'));
 assert(chapterProgressCopy(s,JOURNEY_GROUPS[3]).includes('Conclusion'));
  assert(chapterProgressCopy(s,JOURNEY_GROUPS[4]).includes('feedback'));
 const html=discoveryTrail(s);
 assert(!html.includes('<img onerror=alert(1)>'));
 assert(html.includes('&lt;img'));
 assert(!html.includes('12–20 pages'),'Discovery Trail does not claim to measure actual IA length');
});

test('several first-stage generated figures remain one writing stage, without inventing completed results',()=>{
 const s=createProjectState(),group=JOURNEY_GROUPS[2];
 s.route='path';s.completion.current='C04';s.completion.activeEntryIndex=0;
 s.entries=[
  {id:'graph-a',phase:'first',status:'completed',result:'Real scatter result',graphFigureId:'graph1'},
  {id:'graph-b',phase:'first',status:'planned',result:'',graphFigureId:'graph2'}
 ];
 let summary=mathematicalPages(s),stats=chapterStats(s,group);
 assert.equal(summary.length,1);
 assert.equal(stats.total,1);
 assert.equal(stats.ready,0);
 assert(discoveryTrail(s).includes('1 mathematical stage · 1 actual result'));
 assert(discoveryTrail(s).includes('1 in progress'));
 assert.equal(groupTarget(s,group),'C30');
 s.entries[1].result='A second actual graph';s.entries[1].status='completed';
 stats=chapterStats(s,group);
 assert.equal(stats.ready,1);
 assert(discoveryTrail(s).includes('1 mathematical stage · 2 actual results'));
 assert.equal(discoveryMathStages(s).match(/living-trail-math-page /g).length,1);
});

test('the optional trail explanation reflects sampling, precision, writing, tools and conclusion review',()=>{
 const html=discoveryTrail(createProjectState());
 assert(html.includes('data-trail-chapter-guide'));
 for(const term of ['sampling','precision','sparks','introduction','diagrams and tables','mathematical stages','feedback','potential mathematical questions'])
  assert(html.includes(term),term);
 assert(html.includes('A saved figure is not proof'));
});


test('mathematical journey names the actual methods and connects student-owned findings',()=>{
 const s=createProjectState();
 s.planning.fields.firstAction='Plot a scatter diagram';
 s.entries=[
  {id:'scatter',phase:'first',title:'First purposeful representation',kind:'scatter',
   status:'completed',result:'Actual recorded paired points',localTakeaway:'The plot looks approximately straight.'},
  {id:'pmcc',phase:'substantial',methodId:'pmcc',title:'Does Pearson correlation answer the aim?',
   fromEntryId:'scatter',bridge:'The scatter looks linear, so I want to measure linear association.',
   status:'completed',result:'r = 0.83',localTakeaway:'Strong positive linear association.'},
  {id:'reg',phase:'substantial',methodId:'linear-regression',title:'Can a line make predictions?',
   fromEntryId:'pmcc',bridge:'Pearson r alone does not give a predictive rule.',
   status:'planned',result:''}
 ];
 const before=JSON.stringify(s),html=mathConstellation(s);
 assert(html.includes('Plot a scatter diagram'));
 assert(html.includes('Calculate Pearson&#39;s r (PMCC)'));
 assert(html.includes('Fit a linear regression model'));
 assert(html.includes('Strong positive linear association.'));
 assert(html.includes('Pearson r alone does not give a predictive rule.'));
 assert.equal((html.match(/class="constellation-link/g)||[]).length,2);
 assert.equal((html.match(/class="math-journey-step-card"/g)||[]).length,3);
 assert(html.includes('data-index="2"'));
 assert.equal(JSON.stringify(s),before,'a visual progress widget must never change student data');
});
test('mathematical journey does not invent a method or treat a proposal as a result',()=>{
 const s=createProjectState();
 s.entries=[
  {id:'one',phase:'first',title:'First mathematical step',status:'completed',
   result:'A genuine result was obtained.'},
  {id:'two',phase:'substantial',title:'Mathematical stage 2',status:'planned',
   fromEntryId:'one',result:''}
 ];
 const html=mathConstellation(s);
 assert(html.includes('Choose the mathematics for this stage'));
 assert(html.includes('Awaiting a genuinely completed mathematical result'));
 assert(html.includes('1 actual result'));
 assert(html.includes('1 planned'));
 assert(!html.includes('Calculate Pearson'));
 assert(html.includes('data-math-linked-from="one"'));
});
test('a question naming a technique is shown as a provisional suggestion',()=>{
 const s=createProjectState();
 s.entries=[{id:'first',phase:'substantial',title:'Would calculating PMCC add useful evidence?',
  status:'planned',result:''}];
 const html=mathConstellation(s);
 assert(html.includes('Calculate Pearson&#39;s r (PMCC)'));
 assert(html.includes('Suggested by your question'));
 assert(!html.includes('What I found'));
});
test('journey keeps 8 recent visible stages and makes older entries accessible',()=>{
 const s=createProjectState();
 s.entries=Array.from({length:12},(_,i)=>({id:'math-'+i,phase:i?'substantial':'first',
  title:'Derive relation '+i,methodId:i%2?'proof':'algebra',status:'completed',
  result:'Valid mathematical observation '+i,fromEntryId:i?'math-'+(i-1):''}));
 const html=mathConstellation(s),mini=mathConstellation(s,{compact:true});
 assert(html.includes('Show 4 earlier mathematical records'));
 assert.equal((html.match(/class="math-journey-step-card"/g)||[]).length,12);
 assert.equal((html.match(/class="constellation-star-hit /g)||[]).length,8);
 assert.equal((mini.match(/class="constellation-star-hit /g)||[]).length,4);
 assert(mini.includes('Open My Path to see the full mathematical journey'));
});
test('constellation redesign is height-bounded and mobile-friendly',()=>{
 const css=readFileSync(new URL('../data/math-journey-v2.css',import.meta.url),'utf8');
 assert(css.includes('aspect-ratio:auto'));
 assert(css.includes('height:102px'));
 assert(css.includes('@media(max-width:760px)'));
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
 const s=createProjectState();
 s.entries=[{id:'m',phase:'first',status:'completed',result:'A genuine result'}];
 assert(journeyMap(s).includes('math-journey-step-card'));
 assert(!journeyMap(s).includes('journey-record-heading'),'do not repeat a second generic record list beneath the journey');
});
