import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,lessonById,workshopLessonForEntry} from '../src/workshop/catalog.js';
import {BATCH2_DEFINITIONS,BATCH2_LESSONS} from '../src/workshop/batch-2.js';
import {RESOURCES} from '../src/resources/catalog.js';
import {resourceAction,resourceFilter} from '../src/resources/actions.js';
import {resourceDrawer} from '../src/resources/views.js';
import {newResourceSession} from '../src/resources/state.js';
const near=(a,b,eps=1e-9)=>assert(Math.abs(a-b)<eps,String(a)+' differs from '+String(b));
const snapshot=s=>JSON.stringify({entries:s.entries,planning:s.planning,completion:s.completion,project:s.project,scratch:s.scratch,resources:s.resources});
test('batch 2: new glossary, lessons and existing guides have complete schemas',()=>{
 assert.equal(BATCH2_DEFINITIONS.length,23);
 assert.equal(BATCH2_LESSONS.length,5);
 assert.equal(WORKSHOP_DEFINITIONS.length,230);
 assert.equal(WORKSHOP_LESSONS.length,42);
 assert.deepEqual(BATCH2_LESSONS.map(l=>l.id),['spearman','linear-regression','nonlinear-fitting','residual-diagnostics','model-comparison']);
 const resourceIds=new Set(RESOURCES.map(r=>r.id));
 for(const l of BATCH2_LESSONS){
  assert(l.worked.table?.rows.length>=4,l.id);
  assert(l.worked.table.rows.every(row=>row.length===l.worked.table.headers.length),l.id);
  assert(l.worked.steps.length>=5&&l.worked.answer&&l.worked.interpretation,l.id);
  assert.equal(l.guided.parts.length,2,l.id);
  for(const part of l.guided.parts)assert(part.options.length>=3&&part.options.some(o=>o[0]===part.correct)&&part.hint&&part.feedback,l.id);
  assert(resourceIds.has(l.existingGuide),l.id);
  assert(l.technology.length>=1&&l.technology.every(t=>t.name&&t.command&&t.why),l.id);
  assert(l.avoid&&l.ia&&l.formula,l.id);
  if(l.id==='linear-regression')assert(l.technology.some(t=>t.command==='y_1 ~ a + b x_1'), 'The Desmos equation must use the same intercept a and slope b as the lesson');
 }
});
test('batch 2: Spearman untied example, independent task and tied ranks are correct',()=>{
 const y=[1,3,2,5,4],ss=y.reduce((s,rank,i)=>s+(i+1-rank)**2,0);
 assert.equal(ss,4);near(1-6*ss/(5*24),0.8);
 const yy=[4,3,5,2,1],d2=yy.reduce((s,rank,i)=>s+(i+1-rank)**2,0);
 assert.equal(d2,34);near(1-6*d2/(5*24),-0.7);
 const xx=[1,2.5,2.5,4],rankY=[1,2,3,4],m=2.5;
 const sxx=xx.reduce((s,v)=>s+(v-m)**2,0),syy=rankY.reduce((s,v)=>s+(v-m)**2,0);
 const cross=xx.reduce((s,v,i)=>s+(v-m)*(rankY[i]-m),0);
 near(cross/Math.sqrt(sxx*syy),0.9486832980505138);
 assert.notEqual(cross/Math.sqrt(sxx*syy),0.95);
 assert.match(lessonById('spearman').avoid,/ties/i);
});
test('batch 2: least-squares calculation and residual sign are accurate',()=>{
 const x=[1,2,3,4],y=[2,3,5,4],mx=2.5,my=3.5;
 const sxx=x.reduce((s,v)=>s+(v-mx)**2,0),sxy=x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0);
 assert.equal(sxx,5);assert.equal(sxy,4);
 const b=sxy/sxx,a=my-b*mx;near(b,.8);near(a,1.5);
 const errors=x.map((v,i)=>y[i]-(a+b*v));
 [-.3,-.1,1.1,-.7].forEach((v,i)=>near(errors[i],v));
 near(errors.reduce((s,v)=>s+v,0),0);
 const v=[2,4,5,7],cross=x.reduce((s,xi,i)=>s+(xi-mx)*(v[i]-4.5),0);
 near(cross,8);near(cross/sxx,1.6);near(4.5-1.6*mx,.5);near(5-(.5+1.6*3),-.3);
});
test('batch 2: exact exponential example is explicitly not real-world regression',()=>{
 [2,6,18,54].forEach((value,x)=>assert.equal(2*3**x,value));
 near(3*2**1.5,8.48528137423857);
 assert.match(lessonById('nonlinear-fitting').avoid,/NOT a least-squares regression/);
 assert.match(lessonById('nonlinear-fitting').worked.steps[4],/scale/);
});
test('batch 2: curved residuals have zero sum but substantial error',()=>{
 const residual=[4,1,0,1,4].map(v=>v-2);
 assert.deepEqual(residual,[2,-1,-2,-1,2]);
 assert.equal(residual.reduce((a,b)=>a+b,0),0);
 const sse=residual.reduce((a,b)=>a+b*b,0);
 assert.equal(sse,14);near(Math.sqrt(sse/5),Math.sqrt(2.8));
 assert.deepEqual([1,2,2,5].map((v,i)=>v-(1+i)),[0,0,-1,1]);
});
test('batch 2: train metrics and held-out reversal are independently checked',()=>{
 const x=[0,1,2,3],y=[1,3,5,8];
 const A=x.map(v=>1+2*v),B=x.map(v=>1+2*v+.1*v*v);
 const sse=pred=>pred.reduce((s,v,i)=>s+(y[i]-v)**2,0);
 near(sse(A),1);near(sse(B),.18);
 near(Math.sqrt(sse(A)/4),.5);near(Math.sqrt(sse(B)/4),Math.sqrt(.045));
 const mean=4.25,sst=y.reduce((s,v)=>s+(v-mean)**2,0);
 near(sst,26.75);
 near(1-sse(A)/sst,.9626168224299065);
 near(1-sse(B)/sst,.9932710280373832);
 near(9-(1+2*4),0);near(9-(1+2*4+.1*4**2),-1.6);
 const xx=[0,1,2,3],yy=[1,2,5,9],SSE=fn=>xx.reduce((s,v,i)=>s+(yy[i]-fn(v))**2,0);
 near(SSE(v=>1+2*v),5);near(SSE(v=>1+v*v),1);
});
test('batch 2: matching pathway resources never silently choose a method from prose',()=>{
 for(const [route,ids] of Object.entries({
  relationships:['spearman','linear-regression','residual-diagnostics','model-comparison'],
  'fitted-models':['linear-regression','nonlinear-fitting','residual-diagnostics','model-comparison'],
  growth:['nonlinear-fitting','residual-diagnostics','model-comparison'],
  cycles:['residual-diagnostics','model-comparison']
 }))for(const id of ids)assert(PATHWAY_LEARNING[route].lessons.includes(id),route+' '+id);
 for(const method of ['quadratic-fit','exponential','power'])assert.equal(workshopLessonForEntry({methodId:method}),'nonlinear-fitting');
 assert.equal(workshopLessonForEntry({methodId:'sinusoidal'}),'');
 assert.equal(workshopLessonForEntry({methodId:'other',title:'Spearman regression'}),'');
});
test('batch 2: guided practice remains read-only and works for both checkpoints',()=>{
 const s=createProjectState();
 s.entries=[{id:'stage',methodId:'spearman',result:'Real student conclusion',title:'My IA mathematics'}];
 const before=snapshot(s),session=newResourceSession();
 assert(resourceAction(s,session,'resource-workshop-lesson',{workshopId:'spearman'}).ok);
 assert(resourceDrawer(s,session).includes('data-workshop-lesson="spearman"'));
 assert(resourceAction(s,session,'resource-workshop-step',{workshopStep:'help'}).ok);
 assert(resourceAction(s,session,'resource-workshop-choice',{workshopChoice:'2.5'}).ok);
 assert(resourceDrawer(s,session).includes("That's right"));
 assert(resourceAction(s,session,'resource-workshop-checkpoint',{workshopDirection:1}).ok);
 assert(!resourceAction(s,session,'resource-workshop-choice',{workshopChoice:'2.5'}).ok);
 assert(resourceAction(s,session,'resource-workshop-choice',{workshopChoice:'correl'}).ok);
 assert(resourceAction(s,session,'resource-workshop-step',{workshopStep:'turn'}).ok);
 assert(resourceDrawer(s,session).includes('Reveal answer and reasoning'));
 assert(resourceAction(s,session,'resource-workshop-home').ok);
 assert(resourceFilter(session,'workshopRoute','fitted-models'));
 assert(resourceDrawer(s,session).includes('Fit and interpret a straight-line regression'));
 assert.equal(snapshot(s),before);
});
test('batch 2: method pages are fictional, course-neutral and do not modify saved work',()=>{
 for(const lesson of BATCH2_LESSONS){
  const state=createProjectState(),session=newResourceSession(),before=JSON.stringify(state);
  assert(resourceAction(state,session,'resource-workshop-lesson',{workshopId:lesson.id}).ok);
  const html=resourceDrawer(state,session);
  assert(html.includes('not a course recommendation'));
  assert(html.includes('fictional worked calculations'));
  assert(!/<script\b|<iframe\b|onerror=/i.test(html));
  assert.equal(JSON.stringify(state),before);
 }
});
