import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {PLANNING_CATALOG} from '../src/planning/catalog.js';
import {earlyMathRecommendations} from '../src/planning/math-recommendations.js';
import {applyPlanningField,planAutoAdvance,planningBack,toggleMath,selectedMaths} from '../src/planning/engine.js';
import {createPlanningViews} from '../src/ui/planning-views.js';

const setup=(course='AI SL',kind='statistics',context='Paired numerical',aim='')=>{
 const s=createProjectState();
 s.route='planning';s.planning.current='N02M';s.planning.fields.course=course;
 s.planning.fields.kind=kind;s.planning.fields.statisticsContext=context;
 s.planning.fields.aim=aim;
 return s;
};
const ids=s=>earlyMathRecommendations(s).map(x=>x.id);
test('statistics recommendations reflect the actual data type, not a blanket regression plan',()=>{
 assert.deepEqual(ids(setup('AI SL')).slice(0,2),['AI14','AI15']);
 assert.deepEqual(ids(setup('AA SL')).slice(0,2),['AA15','AA16']);
 assert.deepEqual(ids(setup('AI SL','statistics','Two groups')).slice(0,2),['AI13','AI22']);
 assert.deepEqual(ids(setup('AA SL','statistics','Two groups')),['AA14']);
 assert(ids(setup('AI SL','statistics','Two categorical variables')).includes('AI20'));
 assert(!ids(setup('AA SL','statistics','Two categorical variables')).includes('AI20'));
 assert(ids(setup('AI SL','statistics','Repeated yes/no trials')).includes('AI17'));
 assert(ids(setup('AA SL','statistics','One numerical variable')).includes('AA18'));
});
test('a model direction changes with the student-authored aim',()=>{
 assert(ids(setup('AI SL','modelling','','Investigating a football trajectory')).includes('AI05'));
 assert(ids(setup('AA SL','modelling','','Investigating a football trajectory')).includes('AA11'));
 assert(ids(setup('AI SL','modelling','','Optimising the volume of a box')).includes('AI24'));
 assert(ids(setup('AA SL','modelling','','Optimising the volume of a box')).includes('AA22'));
 assert(ids(setup('AI SL','modelling','','Comparing loans and interest')).includes('AI03'));
 assert(ids(setup('AA SL','modelling','','Investigating seasonal variation')).includes('AA08'));
 assert(ids(setup('AI SL','modelling','','Nearest location to a school')).includes('AI12'));
 assert(ids(setup('AA SL','modelling','','Nearest location to a school')).includes('AA11'));
});
test('recommendations are safe, course-specific and never auto-selected',()=>{
 for(const course of ['AA SL','AI SL']){
  for(const kind of ['statistics','modelling','theoretical']){
   for(const context of ['Paired numerical','Two groups','Two categorical variables','One numerical variable','Repeated yes/no trials']){
    const s=setup(course,kind,context,'Could a model help answer my question?');
    const before=JSON.stringify(s);
    const routes=earlyMathRecommendations(s);
    assert.equal(JSON.stringify(s),before);
    assert.deepEqual(s.planning.mathSelected,[]);
    assert(routes.length<=4);
    for(const r of routes){
     assert.equal(r.course,course);
     assert(PLANNING_CATALOG.math.some(x=>x.id===r.id));
     assert(r.why.length>30&&r.first.length>25);
     assert(/Typical|From your|Possible|Conditional|Only if/.test(r.origin));
    }
   }
  }
 }
 for(const course of ['AA HL','AI HL','other',''])
  assert.deepEqual(earlyMathRecommendations(setup(course,'modelling','','ball trajectory')),[]);
 assert.deepEqual(earlyMathRecommendations(setup('AI SL','unsure')),[]);
});
test('course and mathematics choices are saved without implying completed calculations',()=>{
 const s=setup('AI SL','modelling','','Ball trajectory');
 assert(ids(s).includes('AI05'));
 assert(toggleMath(s,'AI05'));
 assert(selectedMaths(s).some(x=>x.id==='AI05'));
 assert.equal(s.entries.length,0);
 assert.equal(s.planning.completed,false);
 assert(planAutoAdvance(s).ok);
 assert.equal(s.planning.current,'N03');
 assert(planningBack(s).ok);assert.equal(s.planning.current,'N02M');
 assert(selectedMaths(s).some(x=>x.id==='AI05'));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(restored.planning.mathSelected,s.planning.mathSelected);
});
test('theoretical ideas reach teacher checkpoint only after early course/maths review',()=>{
 const s=setup('AA SL','theoretical');
 assert(ids(s).includes('AA04'));
 assert(planAutoAdvance(s).ok);assert.equal(s.planning.current,'N02T');
 assert(planAutoAdvance(s).ok);assert.equal(s.planning.current,'N08');
 assert.equal(s.evidence.results.length,0);
});
test('unsupported courses retain a free-text planning route without forged syllabus claims',()=>{
 const s=setup('AA HL','modelling','','Optimise a box');
 assert.deepEqual(ids(s),[]);
 assert(planAutoAdvance(s).ok);
 assert.equal(s.planning.current,'N03');
 assert(!s.planning.mathSelected.length);
 assert(s.planning.fields.course==='AA HL');
});
test('compact returning sparks render source-bound editors rather than large default expanded echoes',()=>{
 const s=setup('AI SL','modelling','','My chosen trajectory');
 s.planning.fields.beneficiary='I want a useful estimate for my own decision.';
 const ctx={
  getState:()=>s,icon:()=>'',e:v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'),
  button:()=>'',field:(path,label)=>'<label data-field="'+path+'">'+label+'</label>',
  choose:()=>'',numberPick:()=>'',note:()=>'',summary:()=>'',helpButton:()=>'',helpBox:()=>'',tabletNav:()=>''
 };
 const ui=createPlanningViews(ctx).viewPlanning();
 for(const term of ['data-planning-return-spark="aim"','data-planning-return-spark="beneficiary"',
  'data-spark-preview-path="planning.fields.aim"','data-spark-preview-path="planning.fields.beneficiary"',
  'data-spark-editor="aim"','data-spark-editor="motivation"','data-spark-library'])
  assert(ui.includes(term),term);
 assert(!ui.includes('class="insight-echo"'));
});
test('mobile-friendly styles and in-place state update hooks are present',()=>{
 const css=readFileSync(new URL('../data/motivation-pass.css',import.meta.url),'utf8');
 assert(css.includes('.planning-compact-recall'));
 assert(css.includes('.math-route-option'));
 assert(css.includes('.math-catalog-more'));
 assert(css.includes('@media(max-width:550px)'));
 assert(css.includes('prefers-reduced-motion:reduce'));
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert(app.includes('.plan-math-option, .math-route-option'));
 assert(app.includes('[data-spark-preview-path]'));
});
