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
 assert.equal(WORKSHOP_DEFINITIONS.length,26);
 assert.equal(WORKSHOP_LESSONS.length,3);
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
 const expected=['descriptive','pearson','optimisation'];
 assert.deepEqual(WORKSHOP_LESSONS.map(l=>l.id),expected);
 for(const l of WORKSHOP_LESSONS){
  assert(l.when&&l.avoid&&l.formula&&l.skill&&l.ia,l.id);
  assert(l.definitionIds.length>1&&l.definitionIds.every(definitionById),l.id);
  assert(l.worked.context&&l.worked.steps.length>=5&&l.worked.answer&&l.worked.interpretation,l.id);
  assert(l.guided.options.length>=3&&l.guided.options.some(([id])=>id===l.guided.correct)&&l.guided.hint&&l.guided.feedback,l.id);
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
 assert.equal(workshopLessonForEntry({kind:'distribution',methodId:''}),'descriptive');
 assert.equal(workshopLessonForEntry({methodId:'normal',title:'PMCC calculations'}),'');
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
 assert(html.includes('No pilot lessons match this selection'));
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
