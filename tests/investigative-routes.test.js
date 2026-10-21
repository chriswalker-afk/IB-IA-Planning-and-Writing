import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {PLANNING_CATALOG} from '../src/planning/catalog.js';
import {
 INVESTIGATIVE_ROUTES,ROUTE_FAMILIES,matchingInvestigativeRoutes,routeById,routeCourseMath,
 createRouteExplorer,normalizeRouteExplorer
} from '../src/planning/investigative-routes.js';
import {
 exploreMathRoute,chooseMathRoute,toggleMath,selectedMaths,planAutoAdvance
} from '../src/planning/engine.js';
import {renderInvestigativeRoutes} from '../src/ui/investigative-routes-view.js';
import {createPlanningViews} from '../src/ui/planning-views.js';
import {insightItems,insightCapture,insightForCurrent,insightMeaning} from '../src/ui/insight-threads.js';

const setup=(kind='modelling',aim='Investigating a football trajectory',course='AI SL',context='')=>{
 const s=createProjectState();s.route='planning';s.planning.current='N02M';
 Object.assign(s.planning.fields,{kind,aim,course,statisticsContext:context});
 return s;
};
const ids=state=>matchingInvestigativeRoutes(state).map(x=>x.id);
const e=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const html=s=>renderInvestigativeRoutes(s,{e,icon:()=>'<svg class="icon"></svg>',catalogue:()=>'<div data-test-course-list>Full course list</div>'});
test('the full route library contains exactly 16 unique journeys in 4 families with genuine result-dependent branches',()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.equal(ROUTE_FAMILIES.length,4);
 assert.equal(new Set(INVESTIGATIVE_ROUTES.map(r=>r.id)).size,16);
 assert.deepEqual(ROUTE_FAMILIES.map(f=>INVESTIGATIVE_ROUTES.filter(r=>r.family===f.id).length),[4,4,5,3]);
 for(const r of INVESTIGATIVE_ROUTES){
  assert(r.title&&r.why.length>25,r.id);
  assert(r.first[0].length>8&&r.first[1].length>30,r.id);
  assert(r.question.endsWith('?'),r.id);
  assert(r.branches.length>=3,r.id);
  assert(new Set(r.branches.map(b=>b.id)).size===r.branches.length,r.id);
  for(const b of r.branches){
   assert(b.signal.length>8&&b.next.length>30&&b.check.length>25,r.id+':'+b.id);
  }
  assert(r.finish.length>35,r.id);
  for(const course of ['AI SL','AA SL']){
   for(const x of routeCourseMath(r,course))assert(PLANNING_CATALOG.math.some(m=>m.id===x.id&&m.course===course),r.id+'/'+x.id);
  }
 }
 assert(routeById('proof').teacher&&routeById('iteration').teacher);
 assert(routeById('proof').caution.includes('EE'));
});
test('aim matching prioritizes meaningful relevant routes, avoids unrelated prescriptions',()=>{
 assert.deepEqual(ids(setup('statistics','The link between two paired numerical variables','AI SL','Paired numerical')).slice(0,1),['relationships']);
 assert(ids(setup('statistics','Are waiting times different across two groups?','AI SL','Two groups')).includes('groups'));
 assert(ids(setup('statistics','Does a survey choice vary across categories?','AI SL','Two categorical variables')).includes('categorical'));
 assert(ids(setup('statistics','How variable are my repeated measurements?','AI SL','One numerical variable')).includes('variation'));
 assert(ids(setup('modelling','Investigating the trajectory of a football')).includes('trajectories'));
 assert(ids(setup('modelling','Which box design has maximum volume?')).includes('optimisation'));
 assert(ids(setup('modelling','Can I estimate a leaf area from a photograph?')).includes('images'));
 assert(ids(setup('modelling','Which school is the nearest by location?')).includes('voronoi'));
 assert(ids(setup('modelling','How can I compare interest on a loan?')).includes('finance'));
 assert(ids(setup('theoretical','Can I prove an identity?')).includes('proof'));
 const box=ids(setup('modelling','Which box maximises volume?'));
 assert(!box.includes('trajectories'));
 assert(!box.includes('cycles'));
 assert(!box.includes('relationships'));
 assert(ids(setup('statistics','Comparing two groups','AI SL','Two groups')).length<=4);
 assert.deepEqual(ids(setup('unsure','No idea yet')),[]);
});
test('recommendation matches and course lists are observational, never invented evidence or selected techniques',()=>{
 const s=setup();const before=JSON.stringify(s);
 const rec=matchingInvestigativeRoutes(s);
 assert.equal(JSON.stringify(s),before);
 assert(rec.length>0&&rec.length<=4);
 assert.deepEqual(s.planning.mathSelected,[]);
 for(const course of ['AA HL','AI HL','other','']){
  assert.deepEqual(routeCourseMath(routeById('trajectories'),course),[]);
 }
});
test('three accessible mode tabs show one independent shared plan with no duplicate free-form maths records',()=>{
 const s=setup();
 let v=html(s);
 for(const [id,label] of [['aim','Based on my aim'],['routes','Typical investigative routes'],['all','Complete list']]){
  assert(v.includes('data-action="math-mode" data-mode="'+id+'"'));
  assert(v.includes(label));
 }
 assert.equal((v.match(/role="tabpanel"/g)||[]).length,1);
 assert(v.includes('Movement and trajectories'));
 assert(!v.includes('data-test-course-list'));
 assert(exploreMathRoute(s,{mode:'routes'}));
 v=html(s);
 for(const family of ROUTE_FAMILIES)assert(v.includes('data-family="'+family.id+'"'));
 assert.equal((v.match(/data-action="math-open-route" data-route-id="/g)||[]).length,16);
 assert.equal((v.match(/class="journey-family-section"/g)||[]).length,4);
 assert(exploreMathRoute(s,{mode:'all'}));
 v=html(s);assert(v.includes('Full course list'));
 assert(!v.includes('journey-flow-branches'));
 assert.deepEqual(s.planning.mathSelected,[]);
});
test('expanding journeys reveals a genuine conditional fork, safely escaped wording and student decision',()=>{
 const s=setup();
 assert(exploreMathRoute(s,{openRoute:'trajectories'}));
 let v=html(s);
 assert(v.includes('What does the measured path actually allow you to model?'));
 assert(v.includes('journey-flow-first'));
 assert(v.includes('journey-flow-fork'));
 assert(v.includes('journey-flow-reflect'));
 assert.equal((v.match(/class="journey-branch"/g)||[]).length,3);
 assert(v.includes('Path resembles a parabola'));
 assert(v.includes('Scale or perspective is unreliable'));
 assert(v.includes('Save this as my provisional route'));
 assert(v.includes('data-math-id="AI05"'));
 assert(v.includes('data-math-id="AI10"'));
 assert(!v.includes('In my mathematics plan'));
 const altered=setup('modelling','<script>alert("bad")</script> trajectory');
 v=html(altered);
 assert(!v.includes('<script>'));
 assert(v.includes('Movement and trajectories'));
});
test('saving a route spark is reversible, never silently chooses a course technique or alters actual work',()=>{
 const s=setup();
 s.entries=[{id:'existing',status:'completed',result:'Recorded measurements'}];
 s.completion.stages={C20:'complete',C40:'complete',C60:'complete'};
 const original=JSON.stringify(s.entries);
 assert(exploreMathRoute(s,{mode:'routes',family:'models',openRoute:'trajectories'}));
 assert.equal(s.planning.routeExplorer.selectedRoute,'');
 assert.deepEqual(s.planning.mathSelected,[]);
 assert(chooseMathRoute(s,'trajectories'));
 assert.deepEqual(s.planning.mathSelected,[]);
 assert.equal(s.planning.routeExplorer.firstStep,routeById('trajectories').first[0]);
 assert.equal(s.planning.routeExplorer.status,'provisional');
 assert.equal(s.completion.stages.C20,'needs-review');
 assert.equal(JSON.stringify(s.entries),original);
 assert(html(s).includes('Route spark saved'));
 assert(insightItems(s).some(x=>x.id==='investigative-route'&&x.planned));
 assert(insightCapture(s,'N02M').includes('Spark saved'));
 assert(insightForCurrent(s,'C31').some(x=>x.id==='investigative-route'));
 assert(insightMeaning(s,'C31',insightItems(s).find(x=>x.id==='investigative-route')).includes('no branch is required'));
 assert(toggleMath(s,'AI05'));
 assert.deepEqual(s.planning.mathSelected,['AI05']);
 assert(chooseMathRoute(s,''));
 assert.deepEqual(s.planning.mathSelected,['AI05']);
 assert(!insightItems(s).some(x=>x.id==='investigative-route'));
});
test('a saved route spark travels into later Planning and remains editable by navigation',()=>{
 const s=setup();s.planning.fields.beneficiary='To understand a measured flight';
 assert(chooseMathRoute(s,'trajectories'));
 s.planning.current='N03';
 const ctx={
  getState:()=>s,e,icon:()=>'',button:()=>'',field:(path,label)=>'<label>'+e(label)+'</label>',
  choose:()=>'',numberPick:()=>'',note:()=>'',summary:()=>'',helpButton:()=>'',helpBox:()=>'',tabletNav:()=>''
 };
 const v=createPlanningViews(ctx).viewPlanning();
 assert(v.includes('data-spark-id="investigative-route"'));
 assert(v.includes('My provisional investigative route'));
 assert(v.includes('data-node="N02M"'));
 assert(v.includes('data-planning-return-spark="aim"'));
 assert(v.includes('data-spark-id="motivation"'));
 assert(v.includes('data-spark-library'));
});
test('old backups are normalised without mutating earlier decisions; invalid or forged route IDs are rejected',()=>{
 const older=setup();delete older.planning.routeExplorer;
 let restored=normalizeProjectState(JSON.parse(JSON.stringify(older)));
 assert.deepEqual(restored.planning.routeExplorer,createRouteExplorer());
 const s=setup();
 assert(chooseMathRoute(s,'trajectories'));
 assert(exploreMathRoute(s,{mode:'routes',family:'models',openRoute:'images'}));
 restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(restored.planning.routeExplorer,s.planning.routeExplorer);
 assert.equal(restored.planning.fields.aim,s.planning.fields.aim);
 assert(!chooseMathRoute(s,'__proto__'));
 assert(!exploreMathRoute(s,{mode:'bogus'}));
 assert(!exploreMathRoute(s,{openRoute:'nonsense'}));
 assert.equal(normalizeRouteExplorer({mode:'bad',selectedRoute:'__proto__',family:'bogus'}).selectedRoute,'');
 assert.equal(normalizeRouteExplorer({selectedRoute:'proof',firstStep:'Faked completed work'}).firstStep,routeById('proof').first[0]);
});
test('provisional route is not a prerequisite for progression or syllabus approval',()=>{
 const s=setup('statistics','A relationship','AA SL','Paired numerical');
 assert.equal(s.planning.routeExplorer.selectedRoute,'');
 assert(planAutoAdvance(s).ok);
 assert.equal(s.planning.current,'N03');
 assert.equal(s.teacher.pendingApproval,false);
 const hl=setup('modelling','Flight path','AA HL');
 assert(!html(hl).includes('data-math-id="AA06"'));
 assert(html(hl).includes('detailed topic catalogue for AI SL and AA SL'));
});
test('mobile and reduced-motion styling supports route gallery, conditional branches and save controls',()=>{
 const css=readFileSync(new URL('../data/investigative-routes.css',import.meta.url),'utf8');
 for(const rule of ['.journey-mode-tab.active','.journey-family-section','.journey-flow-fork',
  '.journey-flow-branches','.journey-branch[open]','.journey-route-spark','.journey-technique.selected',
  '@media(max-width:780px)','@media(max-width:530px)','prefers-reduced-motion:reduce'])
  assert(css.includes(rule),rule);
 const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const action of ['math-mode','math-family','math-open-route','math-select-route','math-remove-route'])
  assert(source.includes('case "'+action+'"'),action);
});


test('relevant planning pathways offer Geometry Studio without inventing a required mathematical method',()=>{
 for(const id of ['triangulation','images','optimisation']){
  const s=setup('modelling','A geometric design','AA SL');
  s.planning.routeExplorer.mode='routes';
  s.planning.routeExplorer.openRoute=id;
  const view=html(s);
  assert(view.includes('data-action="resource-creator-open" data-resource-creator="geometry"'),id);
  assert(view.includes('Optional diagram creator'),id);
  assert.equal(s.planning.routeExplorer.selectedRoute,'',"Opening a route must not select it");
 }
 const s=setup('statistics','Comparing distributions','AI SL');
 s.planning.routeExplorer.mode='routes';s.planning.routeExplorer.openRoute='groups';
 assert(!html(s).includes('data-resource-creator="geometry"'));
});
