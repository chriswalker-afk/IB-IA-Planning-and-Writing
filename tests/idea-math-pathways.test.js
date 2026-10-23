import test from 'node:test';
import assert from 'node:assert/strict';
import {IDEA_TOPICS,IDEA_SEEDS} from '../src/ideas/catalog.js';
import {IDEA_MAP_ROOTS,DATA_BRANCHES} from '../src/ideas/mindmap.js';
import {INVESTIGATIVE_ROUTES,routeCourseMath} from '../src/planning/investigative-routes.js';
import {IDEA_MATH_DIRECTION_CARDS} from '../src/ideas/math-direction-cards.js';
import {
 IDEA_MATH_LENSES,IDEA_MATH_LENS_BY_ROUTE,IDEA_DATA_MATH_ENTRYPOINTS,
 IDEA_MATH_COURSE_NOTE,ideaMathLens,ideaMathRoute,ideaMathCardById,
 ideaMathDirectionsForTopic,ideaMathEvidenceEntry,ideaMathDirectionsForEvidence,
 ideaMathCoursePreview
} from '../src/ideas/math-pathways.js';

test('Pass 1 offers five distinct mathematical investigations for each broad Idea Lab context',()=>{
 assert.equal(IDEA_TOPICS.length,12);
 assert.equal(IDEA_MATH_DIRECTION_CARDS.length,60);
 const uniqueIds=new Set();
 for(const topic of IDEA_TOPICS){
  const cards=ideaMathDirectionsForTopic(topic.id);
  assert.equal(cards.length,5,topic.id);
  assert(new Set(cards.map(x=>x.routeId)).size>=3,
   topic.id+' must expose different mathematical directions, not five reworded contexts');
  for(const card of cards){
   assert.equal(card.topicId,topic.id);
   assert(!uniqueIds.has(card.id),'Duplicate invitation '+card.id);
   uniqueIds.add(card.id);
   assert(card.lens?.routeId===card.routeId,card.id);
   assert(card.route?.id===card.routeId,card.id);
   for(const field of ['title','question','first','maths','evidence','personalise','caution']){
    assert(card[field]?.length>(field==='title'?11:20),card.id+'/'+field+' needs specific guidance');
   }
   assert(card.question.endsWith('?'),card.id);
   assert(card.contexts.length>=3,card.id+' needs more than one narrow example');
   assert(card.contexts.every(x=>x.length>=4),card.id);
   assert(['standard','specialist','theoretical'].includes(card.review),card.id);
   assert(Object.isFrozen(ideaMathCardById(card.id)),card.id);
  }
 }
 assert.equal(ideaMathDirectionsForTopic('unknown').length,0);
 assert.equal(ideaMathCardById('__proto__'),null);
});

test('All 48 existing starting prompts have one equivalent mathematical direction, without deleting old state',()=>{
 assert.equal(IDEA_SEEDS.length,48);
 const covered=new Map(IDEA_SEEDS.map(s=>[s.id,0]));
 for(const card of IDEA_MATH_DIRECTION_CARDS){
  if(!card.legacySeedId)continue;
  const seed=IDEA_SEEDS.find(s=>s.id===card.legacySeedId);
  assert(seed,'Broken legacy seed reference '+card.id);
  assert.equal(seed.topic,card.topicId,'Cross-topic mismatch '+card.id);
  covered.set(seed.id,covered.get(seed.id)+1);
 }
 for(const [id,count] of covered)assert.equal(count,1,'Legacy idea should remain recoverable: '+id);
 const sport=ideaMathDirectionsForTopic('sport');
 assert(sport.some(c=>c.routeId==='optimisation'&&c.contexts.includes('Badminton court coverage')));
 assert(sport.some(c=>c.routeId==='trajectories'&&c.contexts.includes('Football kick')));
 assert(sport.some(c=>c.routeId==='variation'));
 assert(sport.some(c=>c.routeId==='chance'));
});

test('Mathematical lenses reuse exactly the 16 maintained routes, avoiding a second unaligned curriculum',()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.equal(IDEA_MATH_LENSES.length,16);
 assert.deepEqual(new Set(IDEA_MATH_LENSES.map(x=>x.routeId)),
  new Set(INVESTIGATIVE_ROUTES.map(x=>x.id)));
 for(const route of INVESTIGATIVE_ROUTES){
  const lens=ideaMathLens(route.id);
  assert(lens?.label.length>6);
  assert(lens.mathsName.length>8&&lens.invitation.length>50&&lens.invitation.includes('?'));
  assert.equal(ideaMathRoute(route.id)?.id,route.id);
  assert(IDEA_MATH_DIRECTION_CARDS.some(c=>c.routeId===route.id),'Unrepresented route '+route.id);
  assert(IDEA_MATH_LENS_BY_ROUTE[route.id]);
 }
 assert.equal(ideaMathRoute('not-a-route'),null);
 assert.equal(ideaMathLens('not-a-route'),null);
});

test('The nine data-first routes lead to the same mathematical vocabulary as interests',()=>{
 const expected=Object.entries(DATA_BRANCHES).flatMap(([root,branches])=>
  branches.map(({id})=>root+'.'+id));
 assert.equal(expected.length,9);
 assert.deepEqual(new Set(IDEA_DATA_MATH_ENTRYPOINTS.map(x=>x.id)),new Set(expected));
 for(const id of expected){
  const [root,branch]=id.split('.');
  const entry=ideaMathEvidenceEntry(root,branch);
  assert(entry?.question.endsWith('?'),id);
  assert(entry?.firstCheck.length>50,id);
  assert(entry?.caution.length>35,id);
  assert(entry?.routeIds.length>=3,id);
  assert(new Set(entry.routeIds).size===entry.routeIds.length);
  const suggestions=ideaMathDirectionsForEvidence(root,branch);
  assert.deepEqual(suggestions.map(s=>s.routeId),entry.routeIds);
  assert(suggestions.every(s=>s.lens?.routeId===s.routeId&&s.route?.id===s.routeId));
  const contextual=ideaMathDirectionsForEvidence(root,branch,'sport');
  assert(contextual.every(s=>s.contextualCards.every(c=>
   c.topicId==='sport'&&c.routeId===s.routeId)));
 }
 assert.equal(IDEA_MAP_ROOTS.data.length,3);
 assert.equal(ideaMathEvidenceEntry('bad','root'),null);
 assert.deepEqual(ideaMathDirectionsForEvidence('bad','root'),[]);
});

test('Teacher cautions and course examples remain explicitly provisional',()=>{
 assert(IDEA_MATH_COURSE_NOTE.includes('AI SL'));
 assert(IDEA_MATH_COURSE_NOTE.includes('AA HL'));
 for(const card of IDEA_MATH_DIRECTION_CARDS){
  for(const course of ['AI SL','AA SL','AA HL','unsupported']){
   const preview=ideaMathCoursePreview(card.id,course);
   assert.equal(preview.status,'provisional');
   assert(preview.note.length>45);
   assert(Object.isFrozen(preview.techniqueExamples));
   assert(!/will receive|guaranteed|automatically suitable/i.test(preview.note));
   if(course==='AA HL'){
    assert.equal(preview.techniqueExamples.length,0,'Never silently infer AA HL from an SL list');
    assert(preview.note.includes('AA HL mathematical scope'));
   }
   if(course==='unsupported')assert(preview.teacherReview);
   if(card.review!=='standard')assert(preview.teacherReview,card.id);
   const allowed=routeCourseMath(ideaMathRoute(card.routeId),course);
   if(['AI SL','AA SL'].includes(course)){
    assert.equal(preview.techniqueExamples.length,allowed.length,card.id+'/'+course);
   }
  }
 }
 for(const card of ideaMathDirectionsForTopic('patterns')){
  assert.equal(card.review,'theoretical');
  assert(ideaMathCoursePreview(card.id,'AI SL').note.includes('Extended Essay'));
 }
 for(const id of ['design-nearest','travel-nearest','school-nearest']){
  assert(ideaMathCoursePreview(id,'AA SL').teacherReview);
 }
 assert.equal(ideaMathCoursePreview('invalid','AI SL'),null);
});

test('The proposed content has not altered the currently live map or student saved ideas',()=>{
 assert(IDEA_MATH_DIRECTION_CARDS.length>IDEA_SEEDS.length);
 // The current controls/IDs remain authoritative until the Pass 2 migration.
 assert(IDEA_TOPICS.find(t=>t.id==='sport').subtopics.includes('Football'));
 assert(!IDEA_TOPICS.find(t=>t.id==='sport').subtopics.includes('Optimisation'));
});
