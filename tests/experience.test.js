import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState,STORAGE_KEY} from '../src/core/project-state.js';
import {JOURNEY_GROUPS,stageStatus,groupStatus,currentGroup,resumeRoute,rememberCheckpoint,latestCheckpoint,STATUS_LABELS} from '../src/ui/journey.js';
import {journeyMap,groupedDashboard,journeyRail} from '../src/ui/journey-views.js';
import {createSamplePreview,PREVIEW_KEY} from '../src/core/sample-preview.js';
const storage=()=>{const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
const sample=()=>({...createProjectState(),demo:'curved',route:'completing'});
test('four shared chapters describe the same stages in rail, map and dashboard',()=>{
 const s=createProjectState(),html=journeyRail(s)+journeyMap(s)+groupedDashboard(s);
 for(const g of JOURNEY_GROUPS)assert(html.includes(g.name.replace('&','&amp;')));
 assert.equal(JOURNEY_GROUPS.flatMap(g=>g.stages).length,9);
});
test('visiting a later stage never earns earlier completion ticks',()=>{
 const s=createProjectState();s.route='planning';s.planning.current='N05V';s.planning.visited=['N05V'];
 assert.equal(stageStatus(s,'plan'),'working');assert.equal(groupStatus(s,JOURNEY_GROUPS[1]),'not-started');
 assert(!journeyRail(s).includes('journey-milestone done'));
});
test('group readiness requires all its stages, while needs-review takes precedence',()=>{
 const s=createProjectState();s.completion.stages.C10='complete';assert.equal(groupStatus(s,JOURNEY_GROUPS[1]),'working');
 s.completion.stages.C20='complete';assert.equal(groupStatus(s,JOURNEY_GROUPS[1]),'complete');
 s.completion.stages.C10='needs-review';assert.equal(groupStatus(s,JOURNEY_GROUPS[1]),'needs-review');
});
test('readiness vocabulary is shared, not confused with storage or grades',()=>{
 assert.deepEqual(Object.values(STATUS_LABELS),['Not started','Working on it','Ready for now','Needs review']);
 const s=createProjectState();s.completion.stages.C10='complete';assert(groupedDashboard(s).includes('Ready for now'));assert(!groupedDashboard(s).includes('Student-marked complete'));
});
test('home resumes Studio even when only introduction notes exist',()=>{
 const s=createProjectState();s.scratch.introduction='My actual notes';s.completion.current='C10';assert.equal(resumeRoute(s),'completing');
 s.ui.lastWorkRoute='planning';assert.equal(resumeRoute(s),'planning');
});
test('overview retains the chapter of the earlier working stage',()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C04';s.ui.lastStudioNode='C90';assert.equal(currentGroup(s).id,'finish');
});
test('maps collapse inactive chapters without locking or removing their routes',()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C40';s.planning.completed=true;
 const before=JSON.stringify(s),html=journeyMap(s);assert(html.includes('data-journey-group="explore" open'));assert(html.includes('data-journey-group="plan"><summary>'));assert(html.includes('data-node="C90"'));assert.equal(JSON.stringify(s),before);
});
test('checkpoints survive normalization and full JSON backups',()=>{
 const s=createProjectState();rememberCheckpoint(s,'Introduction marked ready for now','Your notes are saved.','C10');
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert.equal(restored.ui.latestTitle,s.ui.latestTitle);assert.equal(restored.ui.latestAt,s.ui.latestAt);
});
test('an earlier checkpoint does not claim an edited stage is still ready',()=>{
 const s=createProjectState();rememberCheckpoint(s,'Introduction marked ready for now','Saved','C10');s.completion.stages.C10='needs-review';assert(latestCheckpoint(s).title.includes('revisit'));
});
test('progress components only read state and never author student mathematics',()=>{
 const s=createProjectState(),before=JSON.stringify(s);journeyRail(s);journeyMap(s);groupedDashboard(s);assert.equal(JSON.stringify(s),before);
});
test('sample creation, editing and switching never overwrite the project key',()=>{
 const store=storage(),s=createProjectState();s.scratch.introduction='Keep my original';store.setItem(STORAGE_KEY,JSON.stringify(s));const before=store.getItem(STORAGE_KEY),preview=createSamplePreview(store,normalizeProjectState);
 const first=preview.begin(s,sample());first.scratch.introduction='Sample changes';preview.save(first);preview.begin(first,{...sample(),demo:'theory'});assert.equal(store.getItem(STORAGE_KEY),before);
 const restored=preview.leave();assert.equal(restored.scratch.introduction,'Keep my original');assert.equal(store.getItem(STORAGE_KEY),before);assert.equal(store.getItem(PREVIEW_KEY),null);
});
test('sample previews survive a tab reload while keeping the original workspace',()=>{
 const store=storage(),s=createProjectState();s.project.aim='My aim';const p=createSamplePreview(store,normalizeProjectState);p.begin(s,sample(),{scroll:240});
 const restored=createSamplePreview(store,normalizeProjectState);assert.equal(restored.resume().demo,'curved');assert.equal(restored.position.scroll,240);assert.equal(restored.leave().project.aim,'My aim');
});
test('returning from a preview respects newer personal work saved by another tab',()=>{
 const p=createSamplePreview(storage(),normalizeProjectState),s=createProjectState();s.project.aim='Earlier';p.begin(s,sample());s.project.aim='Newer';assert.equal(p.leave(JSON.stringify(s)).project.aim,'Newer');
});
test('preview remains safe with storage denied and creates no phantom personal project',()=>{
 const bad={getItem(){throw Error('denied')},setItem(){throw Error('denied')},removeItem(){throw Error('denied')}};
 const p=createSamplePreview(bad,normalizeProjectState),s=createProjectState();assert.equal(p.resume(),null);p.begin(s,sample());assert(p.active);assert.deepEqual(p.leave(),s);
 const empty=storage();const other=createSamplePreview(empty,normalizeProjectState);other.begin(s,sample());other.leave();assert.equal(empty.getItem(STORAGE_KEY),null);
});
test('no-choice old projects remain loadable with optional experience metadata',()=>{
 const s=normalizeProjectState({version:1,project:{aim:'Old aim'},scratch:{introduction:'Old text'}});assert.equal(s.ui.latestTitle,'');assert.equal(s.scratch.introduction,'Old text');
});
test('experience stylesheet honours reduced motion and touch-sized support',()=>{
 const css=readFileSync(new URL('../data/experience.css',import.meta.url),'utf8');assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('min-height:44px'));
});

test('fresh Studio overview starts in Set up and rejects unknown last-stage metadata',()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C04';assert.equal(currentGroup(s).id,'setup');
 s.ui.lastStudioNode='not-a-stage';assert.equal(currentGroup(s).id,'setup');
 s.completion.history=['C10','C90','C04'];assert.equal(currentGroup(s).id,'finish');
});
