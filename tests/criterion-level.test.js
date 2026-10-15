import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {rubricView,submissionView,formatView} from '../src/essentials/views.js';

const make=course=>{
 const s=createProjectState();
 s.project.course=course;s.planning.fields.course=course;
 return s;
};
const pickerCount=html=>(html.match(/data-essentials-level/g)||[]).length;

test('A-D and the default rubric do not render an SL/HL control for any reference level',()=>{
 for(const course of ['', 'AA SL', 'AA HL'])for(const level of ['', 'SL', 'HL']){
  const s=make(course),before=JSON.stringify(s);
  for(const criterion of ['A','B','C','D','unknown']){
   const html=rubricView(s,{criterion,level});
   assert.equal(pickerCount(html),0,course+' / '+criterion+' / '+level);
   assert(!html.includes('Criterion E reference level'));
   assert(html.includes('SL and HL'));
  }
  assert.equal(JSON.stringify(s),before);
 }
 assert.equal(pickerCount(formatView()),0);
});

test('E places its one level selector inside the E section, retaining correct descriptors and unknown-level guidance',()=>{
 for(const [course,level,expected] of [['','',''],['AA SL','','SL'],['AA HL','','HL'],['AA SL','HL','HL'],['AA HL','SL','SL']]){
  const s=make(course),before=JSON.stringify(s),session={criterion:'E',level};
  const html=rubricView(s,session);
  assert.equal(pickerCount(html),1);
  assert(html.indexOf('data-rubric-criterion="E"')<html.indexOf('id="ess-level"'));
  if(expected){
   assert(html.includes('value="'+expected+'" selected'));
   assert(html.includes('Criterion E — '+expected));
  }else{
   assert(html.includes('Choose SL or HL'));
   assert(!html.includes('class="ess-rubric-table"'));
  }
  rubricView(s,{...session,criterion:'A'});
  assert.equal(rubricView(s,session),html);
  assert.equal(JSON.stringify(s),before);
 }
});

test('draft and final review place the level selector only in the E evidence card',()=>{
 for(const mode of ['draft','final'])for(const level of ['', 'SL','HL']){
  const s=make(''),before=JSON.stringify(s),html=submissionView(s,{mode,level});
  assert.equal(pickerCount(html),1);
  const cards=[...html.matchAll(/<section class="ess-evidence-card" data-evidence-criterion="([A-E])">([\s\S]*?)<\/section>/g)];
  assert.equal(cards.length,5);
  for(const [,id,body] of cards){
   assert.equal(pickerCount(body),id==='E'?1:0);
   if(id==='E'){
    assert(body.indexOf('id="ess-level"')<body.indexOf('id="ess-'+mode+'-E-mark"'));
    assert.equal(body.includes('data-ess-id="E" disabled'),level==='');
   }
  }
  assert.equal(JSON.stringify(s),before);
 }
});
