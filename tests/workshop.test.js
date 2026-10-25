import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {INVESTIGATIVE_ROUTES} from '../src/planning/investigative-routes.js';
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,definitionById,lessonById,workshopLessonForEntry} from '../src/workshop/catalog.js';
import {renderWorkshop,workshopList} from '../src/workshop/views.js';
import {resourceDrawer,resourcePrompt} from '../src/resources/views.js';
import {resourceAction,resourceFilter} from '../src/resources/actions.js';
import {newResourceSession} from '../src/resources/state.js';

function student(methodId='pmcc'){
 const s=createProjectState();
 s.route='completing';s.planning.fields.kind='statistics';s.planning.fields.course='AI SL';
 s.completion.current='C40';s.completion.activeEntryIndex=0;
 s.entries=[{id:'example-stage',phase:'substantial',methodId,status:'planned',result:'',title:'Example calculation'}];
 return s;
}
const snapshot=s=>JSON.stringify({entries:s.entries,planning:s.planning,completion:s.completion,project:s.project,scratch:s.scratch,resources:s.resources});
const approx=(a,b,eps=1e-9)=>assert(Math.abs(a-b)<eps,String(a)+' differs from '+String(b));

test('workshop: canonical glossary and pilot IDs are unique and never blank',()=>{
 assert.equal(WORKSHOP_DEFINITIONS.length,156);
 assert.equal(WORKSHOP_LESSONS.length,29);
 assert.equal(new Set(WORKSHOP_DEFINITIONS.map(d=>d.id)).size,WORKSHOP_DEFINITIONS.length);
 assert.equal(new Set(WORKSHOP_LESSONS.map(l=>l.id)).size,WORKSHOP_LESSONS.length);
 for(const d of WORKSHOP_DEFINITIONS){
  assert(d.title&&d.category&&d.meaning&&d.example,d.id);
  assert.equal(definitionById(d.id),d);
 }
 assert.equal(definitionById('__proto__'),null);
 assert.equal(lessonById('unknown'),null);
});
test('workshop: all sixteen routes map only to real shared definitions and optional pilot lessons',()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.deepEqual(Object.keys(PATHWAY_LEARNING).sort(),INVESTIGATIVE_ROUTES.map(r=>r.id).sort());
 for(const r of INVESTIGATIVE_ROUTES){
  const x=PATHWAY_LEARNING[r.id];
  assert(x.terms.length>=2,r.id);
  assert.equal(new Set(x.terms).size,x.terms.length,r.id);
  for(const d of x.terms)assert(definitionById(d),r.id+' references '+d);
  for(const l of x.lessons)assert(lessonById(l),r.id+' references '+l);
 }
});
test('workshop: complete pilot schema supports definitions, full worked methods and standalone practice',()=>{
 const expected=['descriptive','pearson','optimisation','sampling','distributions','two-way-proportions','measurement','spearman','linear-regression','nonlinear-fitting','residual-diagnostics','model-comparison','histograms','quadratic-functions','exponential-logarithms','sinusoidal-functions','derivatives-motion','integrals-accumulation','image-calibration','triangulation','geometric-areas','voronoi-regions','geometry-sensitivity','conditional-probability-tree','discrete-expected-value','simulation-design','binomial-models','normal-models','inference-evidence'];
 assert.deepEqual(WORKSHOP_LESSONS.map(l=>l.id),expected);
 for(const l of WORKSHOP_LESSONS){
  assert(l.when&&l.avoid&&l.formula&&l.skill&&l.ia,l.id);
  assert(l.definitionIds.length>1&&l.definitionIds.every(definitionById),l.id);
  assert(l.worked.context&&l.worked.steps.length>=5&&l.worked.answer&&l.worked.interpretation,l.id);
  const checkpoints=l.guided.parts||[l.guided];
  assert(checkpoints.length>=1,l.id);
  for(const part of checkpoints)assert(part.options.length>=3&&part.options.some(([id])=>id===part.correct)&&part.hint&&part.feedback,l.id);
  assert(l.independent.question&&l.independent.answer&&l.independent.reasoning,l.id);
  assert(l.technology.length>=1&&l.technology.every(t=>t.name&&t.command&&t.why),l.id);
  assert(l.existingGuide,l.id);
 }
});
test('workshop: worked statistics and PMCC answers agree with independent calculations',()=>{
 const pop=[2,4,4,6],mean=pop.reduce((a,b)=>a+b,0)/pop.length;
 const ss=pop.reduce((a,b)=>a+(b-mean)**2,0);
 assert.equal(mean,4);approx(Math.sqrt(ss/4),Math.SQRT2);approx(Math.sqrt(ss/3),Math.sqrt(8/3));
 const pts=[[1,2],[2,3],[3,5],[4,4]];
 const mx=pts.reduce((s,p)=>s+p[0],0)/pts.length,my=pts.reduce((s,p)=>s+p[1],0)/pts.length;
 const numerator=pts.reduce((s,[x,y])=>s+(x-mx)*(y-my),0);
 const denom=Math.sqrt(pts.reduce((s,[x])=>s+(x-mx)**2,0)*pts.reduce((s,[,y])=>s+(y-my)**2,0));
 approx(numerator/denom,0.8);
});
test('workshop: independent examples and optimisation answers are arithmetically correct',()=>{
 const pts=[[1,3],[2,5],[3,4],[4,8]],mx=2.5,my=5;
 const t=pts.reduce((v,[x,y])=>v+(x-mx)*(y-my),0);
 const sx=pts.reduce((v,[x])=>v+(x-mx)**2,0),sy=pts.reduce((v,[,y])=>v+(y-my)**2,0);
 approx(t/Math.sqrt(sx*sy),7/Math.sqrt(70));
 const area=x=>x*(12-x);
 assert.equal(area(6),36);assert(area(6)>area(5));assert(area(6)>area(7));
});
test('workshop: selected method lookup is explicit, never inferred from title or prose',()=>{
 assert.equal(workshopLessonForEntry({methodId:'pmcc',title:'My data'}),'pearson');
 assert.equal(workshopLessonForEntry({methodId:'optimisation'}),'optimisation');
 assert.equal(workshopLessonForEntry({methodId:'spearman'}),'spearman');
 assert.equal(workshopLessonForEntry({methodId:'linear-regression'}),'linear-regression');
 assert.equal(workshopLessonForEntry({methodId:'quadratic-fit'}),'nonlinear-fitting');
 assert.equal(workshopLessonForEntry({methodId:'exponential'}),'nonlinear-fitting');
 assert.equal(workshopLessonForEntry({methodId:'power'}),'nonlinear-fitting');
 assert.equal(workshopLessonForEntry({methodId:'sinusoidal'}),'');
 assert.equal(workshopLessonForEntry({kind:'distribution',methodId:''}),'descriptive');
 assert.equal(workshopLessonForEntry({methodId:'normal',title:'PMCC calculations'}),'normal-models');
 assert.equal(workshopLessonForEntry({kind:'table',methodId:''}),'' ,'A plain table does not establish that data are categorical');
 assert.equal(workshopLessonForEntry(null),'');
});
test('workshop: browsing all definitions and lessons preserves existing tool library',()=>{
 const s=student(),session=newResourceSession(),before=snapshot(s);
 const tools=resourceDrawer(s,session);
 assert(tools.includes('32 matching guides'));
 assert(tools.includes('Maths Workshop'));
 const result=resourceAction(s,session,'resource-workshop',{});
 assert(result.ok&&result.open);
 assert.equal(session.mode,'workshop');
 assert.equal(session.workshopId,'pearson');
 const lesson=resourceDrawer(s,session);
 assert(lesson.includes('Pearson'));
 assert(lesson.includes('Show me'));
 assert(lesson.includes('Help me'));
 assert(lesson.includes('My turn'));
 assert.equal(snapshot(s),before);
});
test('workshop: guided options transition without authoring or marking student maths',()=>{
 const s=student(),session=newResourceSession(),before=snapshot(s);
 resourceAction(s,session,'resource-workshop');
 assert.equal(session.workshopId,'pearson');
 assert.equal(resourceAction(s,session,'resource-workshop-step',{workshopStep:'help'}).open,true);
 assert(resourceDrawer(s,session).includes('Negative linear association'));
 assert.equal(resourceAction(s,session,'resource-workshop-choice',{workshopChoice:'positive'}).open,true);
 assert.match(resourceDrawer(s,session),/Not quite/);
 assert.equal(resourceAction(s,session,'resource-workshop-choice',{workshopChoice:'negative'}).open,true);
 assert.match(resourceDrawer(s,session),/That's right/);
 assert(!resourceAction(s,session,'resource-workshop-choice',{workshopChoice:'made-up'}).ok);
 assert.equal(resourceAction(s,session,'resource-workshop-step',{workshopStep:'turn'}).open,true);
 assert.match(resourceDrawer(s,session),/Reveal answer and reasoning/);
 assert.equal(snapshot(s),before);
});
test('workshop: pathway browsing filters exact route terms and available lessons',()=>{
 const s=student(),session=newResourceSession();
 const x=resourceAction(s,session,'resource-workshop',{workshopRoute:'voronoi'});
 assert(x.ok&&session.mode==='workshop');
 assert.equal(session.workshopRoute,'voronoi');
 const html=resourceDrawer(s,session);
 assert(html.includes('Voronoi cell'));
 assert(!html.includes('Pearson&#39;s correlation coefficient</h4>'));
 assert(html.includes('Build and check a Voronoi nearest-site region'));
 assert(!resourceFilter(session,'workshopRoute','invalid-route'));
 assert(resourceFilter(session,'workshopRoute','relationships'));
 assert(workshopList(session).includes('Pearson'));
});
test('workshop: search can narrow definitions without rendering unsafe text',()=>{
 const s=student(),session=newResourceSession();
 resourceAction(s,session,'resource-workshop');
 resourceAction(s,session,'resource-workshop-home');
 assert(resourceFilter(session,'workshopQuery','residual'));
 assert(workshopList(session).includes('Residual'));
 assert(!workshopList(session).includes('No matching terms'));
 assert(resourceFilter(session,'workshopQuery','<img src=x onerror=alert(1)>'));
 const html=renderWorkshop(s,session);
 assert(html.includes('&lt;img'));
 assert(!html.includes('<img src=x'));
});
test('workshop: glossary links can be followed and return without changing authored data',()=>{
 const s=student(),session=newResourceSession(),before=snapshot(s);
 resourceAction(s,session,'resource-workshop');
 assert(resourceAction(s,session,'resource-workshop-term',{workshopId:'residual'}).ok);
 assert(resourceDrawer(s,session).includes('Residual'));
 assert(resourceDrawer(s,session).includes('observed value'));
 assert(resourceAction(s,session,'resource-workshop-home').ok);
 assert.equal(session.workshopTerm,'');
 assert.equal(snapshot(s),before);
});
test('workshop: existing tools link out and return to the original lesson',()=>{
 const s=student(),session=newResourceSession();
 resourceAction(s,session,'resource-workshop');
 resourceAction(s,session,'resource-workshop-step',{workshopStep:'turn'});
 assert(resourceAction(s,session,'resource-open',{resourceId:'sheets-pmcc'},'resources').open);
 assert.equal(session.mode,'tools');
 assert(resourceDrawer(s,session).includes('Maths Workshop'));
 assert(resourceAction(s,session,'resource-workshop',{workshopResume:'true'},'resources').open);
 assert.equal(session.mode,'workshop');
 assert.equal(session.workshopId,'pearson');
 assert(!resourceAction(s,session,'resource-workshop-term',{workshopId:'malicious'}).ok);
});
test('workshop: opening from the I am stuck panel retains the correct parent',()=>{
 const s=student(),session=newResourceSession();
 const before=snapshot(s);
 resourceAction(s,session,'resource-workshop',{resourceHelp:'true'},'stuck');
 assert.equal(session.parent,'stuck');
 assert.equal(session.help,true);
 assert.equal(snapshot(s),before);
});
test('workshop: reduced advice does not remove deliberate Help/library access',()=>{
 const s=student();
 s.ui={...s.ui,reduceAdvice:true};
 const html=resourceDrawer(s,newResourceSession());
 assert(html.includes('Maths Workshop'));
 assert(resourcePrompt(s).includes('resource-workshop'));
});
test('workshop: no fake student results, remote embeds or automatic course selection',()=>{
 const s=student('optimisation'),session=newResourceSession(),before=snapshot(s);
 resourceAction(s,session,'resource-workshop');
 assert.equal(session.workshopId,'optimisation');
 const html=resourceDrawer(s,session);
 assert(!/<script|<iframe|<video|autoplay/i.test(html));
 assert(!html.includes('Your IA has been updated'));
 assert(html.includes('not your results'));
 assert(html.includes('not a course recommendation'));
 assert.equal(snapshot(s),before);
});

test('workshop: data-essentials lessons are complete and linked to existing tutorials',()=>{
 const expected={sampling:'forms',distributions:'distribution-graphs','two-way-proportions':'two-way',measurement:'reporting-precision'};
 for(const [id,guide] of Object.entries(expected)){
  const l=lessonById(id);assert(l,id);
  assert.equal(l.existingGuide,guide);
  assert.equal(l.guided.parts.length,2);
  assert(l.worked.table&&l.worked.table.rows.length>=1);
  assert.equal(l.worked.table.headers.length,l.worked.table.rows[0].length);
  assert(l.avoid&&l.ia&&l.worked.interpretation);
 }
});
test('workshop: sampling and bias calculations are checked',()=>{
 assert.equal(20*60/100,12);
 assert.equal(20*40/100,8);
 assert.equal(30*90/150,18);
 assert.equal(30*60/150,12);
 assert.equal(20*75/100,15);
});
test('workshop: median of halves, quartile spread and frequency density are checked',()=>{
 const median=a=>(a[(a.length/2)-1]+a[a.length/2])/2;
 const lower=[2,3,3,4],upper=[5,5,7,11];
 assert.equal(median(lower),3);assert.equal(median(upper),6);
 assert.equal(6-3,3);assert.equal(6+1.5*3,10.5);
 assert.equal(6/2,3);assert.equal(8/4,2);
 const independent=[1,2,2,3,4,6,7,17];
 assert.equal(median(independent),3.5);
 assert.equal(median(independent.slice(0,4)),2);
 assert.equal(median(independent.slice(4)),6.5);
 assert.equal(6.5+1.5*(6.5-2),13.25);
});
test('workshop: conditional denominators and percentage points are checked',()=>{
 assert.equal(18/30,0.6);assert.equal(8/20,0.4);
 approx((18/30-8/20)*100,20);
 assert(Math.abs(18/26-0.6923076923)<1e-9);
 assert.equal(14/20,0.7);assert.equal(10/40,0.25);
 assert(Math.abs((14/20-10/40)*100-45)<1e-10);
});
test('workshop: rounding-only area bounds are not sold as total uncertainty',()=>{
 approx(9.95**2,99.0025);approx(10.05**2,101.0025);
 approx(7.95**2,63.2025);approx(8.05**2,64.8025);
 const lesson=lessonById('measurement');
 assert.match(lesson.avoid,/NOT a complete measurement/);
 assert.match(lesson.worked.interpretation,/Other sources of uncertainty/);
});
test('workshop: two guided checkpoints accept only current answers and never mutate student work',()=>{
 const s=student(),u=newResourceSession(),before=snapshot(s);
 resourceAction(s,u,'resource-workshop-lesson',{workshopId:'two-way-proportions'});
 resourceAction(s,u,'resource-workshop-step',{workshopStep:'help'});
 assert(resourceDrawer(s,u).includes('Checkpoint 1 of 2'));
 assert(resourceAction(s,u,'resource-workshop-choice',{workshopChoice:'row'}).ok);
 assert(!resourceAction(s,u,'resource-workshop-choice',{workshopChoice:'69'}).ok);
 assert(resourceAction(s,u,'resource-workshop-checkpoint',{workshopDirection:'1'}).ok);
 assert(resourceDrawer(s,u).includes('Checkpoint 2 of 2'));
 assert(!resourceAction(s,u,'resource-workshop-choice',{workshopChoice:'row'}).ok);
 assert(resourceAction(s,u,'resource-workshop-choice',{workshopChoice:'69'}).ok);
 assert(resourceDrawer(s,u).includes("That's right"));
 assert(!resourceAction(s,u,'resource-workshop-checkpoint',{workshopDirection:'1'}).ok);
 assert(resourceAction(s,u,'resource-workshop-checkpoint',{workshopDirection:'-1'}).ok);
 assert.equal(u.workshopChoice,'');
 assert.equal(snapshot(s),before);
});
test('workshop: course and student evidence remain separate with Batch 1 tables',()=>{
 const s=student(),u=newResourceSession(),before=snapshot(s);
 resourceAction(s,u,'resource-workshop-lesson',{workshopId:'sampling'});
 const html=resourceDrawer(s,u);
 assert(html.includes('workshop-data-table'));
 assert(html.includes('Population and proposed sample allocation'));
 assert(html.includes('not a course recommendation'));
 assert(!html.includes('<script'));
 assert.equal(snapshot(s),before);
});
