import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {IDEA_TOPICS,IDEA_SEEDS,IDEA_DIFFICULTIES} from '../src/ideas/catalog.js';
import {IDEA_DATA_PROMISE,IDEA_THEORY_CAUTION,ideaMapIdeas} from '../src/ideas/mindmap.js';
import {normalizeIdeaState,MAX_IDEAS} from '../src/ideas/state.js';
import {ideaAction,ideaInput,ideaDifficultyInput,chooseTopic,ideaChoices,beginIdea,saveIdea,requestIdeaUse,confirmIdeaUse} from '../src/ideas/engine.js';
import {ideaExplorerView,ideaComparisonView,ideaFooter} from '../src/ideas/views.js';
import {planAutoAdvance,setPlanCurrent} from '../src/planning/engine.js';
import {insightItems,insightCapture,insightEcho} from '../src/ui/insight-threads.js';
import {resourceById} from '../src/resources/catalog.js';
const make=(node='N00B')=>{const s=createProjectState();s.route='planning';setPlanCurrent(s,node);return s;};
const clone=s=>JSON.parse(JSON.stringify(s));
const work=s=>JSON.stringify([s.project,s.planning.fields,s.planning.mathSelected,s.entries,s.teacher,s.scratch,s.completion]);
function existing(){
 const s=make('N00C');
 s.planning.fields.idea=s.project.idea='My original topic';
 s.planning.fields.aim=s.project.aim='My existing aim';
 s.planning.fields.prediction='My prediction';
 s.entries=[{id:'actual-1',status:'completed',result:'My genuine result'}];
 s.teacher.pendingApproval=true;
 s.scratch.introduction='My existing introduction';
 s.completion.stages.C10='complete';s.completion.stages.C40='complete';s.completion.stages.C60='complete';
 return s;
}
function rated(s,clarity=3,quickStart=4){
 assert(ideaInput(s,'clarity',String(clarity)));
 assert(ideaInput(s,'quickStart',String(quickStart)));
 return s;
}
function add(s,seed='leaf-outline',question='How can I estimate the area of my chosen leaf?',scores=[3,4]){
 assert(beginIdea(s,seed,{fromMap:seed!=='own'}));
 assert(ideaInput(s,'question',question));
 rated(s,...scores);
 const result=ideaAction(s,'idea-save');
 assert(result.ok,result.error);
 return result.id;
}
test('All authored mind-map directions remain editorial prompts, not automatically approved IA titles',()=>{
 assert.equal(IDEA_TOPICS.length,12);
 assert.equal(IDEA_SEEDS.length,48);
 for(const group of IDEA_TOPICS){
  assert.equal(IDEA_SEEDS.filter(x=>x.topic===group.id).length,4);
  for(const topic of group.subtopics)assert(IDEA_SEEDS.some(x=>x.topic===group.id&&x.tags.includes(topic)));
 }
 for(const seed of IDEA_SEEDS){
  for(const key of ['title','question','material','first','narrow','maths','caution'])
   assert(seed[key].length>15,seed.id+' '+key);
  for(const id of seed.resources)assert(resourceById(id),id);
 }
});
test('The direct one-idea route stays separate from the optional evaluator',()=>{
 const s=make('N00');s.planning.fields.ideaStatus='yes';const before=clone(s.ideaExplorer);
 assert(planAutoAdvance(s).ok);assert.equal(s.planning.current,'N01');
 assert.deepEqual(s.ideaExplorer,before);
});
test('Starting a mind-map idea produces one blank question and a helpful, non-copyable prompt',()=>{
 const s=make();ideaAction(s,'idea-map-root',{root:'world'});
 ideaAction(s,'idea-map-topic',{topic:'nature'});ideaAction(s,'idea-map-leaf',{subtopic:'Leaves'});
 assert(ideaAction(s,'idea-explore',{seed:'leaf-outline',map:'true'}).ok);
 const html=ideaExplorerView(s);
 assert.equal((html.match(/data-idea-input="question"/g)||[]).length,1);
 assert(html.includes('Something to get you thinking'));
 assert(html.includes('Either using the thinking prompt or otherwise'));
 assert(html.includes('Your possible investigation aim'));
 assert(html.includes('How clear is my aim?'));
 assert(html.includes('How quickly could I get started?'));
 assert(html.includes('data-idea-difficulty="focus"'));
 assert(!html.includes('QUESTION STARTER · NOT A TITLE TO COPY'));
 assert(!html.includes('data-idea-input="detail"'));
 assert(!html.includes('data-idea-input="trialNote"'));
 assert.equal(s.ideaExplorer.drafts['leaf-outline'].question,'');
});
test('Manual entry from comparison opens the same evaluator, without the thinking prompt',()=>{
 const s=make('N00C');assert(ideaAction(s,'idea-own').ok);
 assert.equal(s.planning.current,'N00C');
 const html=ideaComparisonView(s);
 assert(html.includes('Add an idea of my own'));
 assert(html.includes('data-idea-input="question"'));
 assert(html.includes('data-action="idea-rate"'));
 assert(!html.includes('Something to get you thinking'));
 assert(ideaAction(s,'idea-browse').ok);
 assert.equal(s.planning.current,'N00C');assert.equal(s.ideaExplorer.active,'');
});
test('One possible aim and both ratings are required; difficulties remain optional',()=>{
 const s=make();beginIdea(s,'own');
 assert.equal(saveIdea(s).ok,false);
 ideaInput(s,'question','How are waiting times changing during lunch?');
 assert.equal(saveIdea(s).ok,false);
 ideaInput(s,'clarity','3');assert.equal(saveIdea(s).ok,false);
 ideaInput(s,'quickStart','5');assert(saveIdea(s).ok);
 assert.equal(s.ideaExplorer.shortlist[0].question,'How are waiting times changing during lunch?');
 assert.deepEqual(s.ideaExplorer.shortlist[0].difficulties,[]);
});
test('Rating scales are bounded and problem options use a known checked set',()=>{
 const s=make();beginIdea(s,'own');
 for(const n of ['-1','0','6','NaN','2.5'])assert.equal(ideaInput(s,'clarity',n),false);
 assert(ideaInput(s,'clarity','4'));
 assert(ideaInput(s,'quickStart','2'));
 assert.equal(s.ideaExplorer.drafts.own.clarity,4);
 assert(ideaDifficultyInput(s,'maths',true));
 assert(ideaDifficultyInput(s,'access',true));
 assert(ideaDifficultyInput(s,'maths',false));
 assert.deepEqual(s.ideaExplorer.drafts.own.difficulties,['access']);
 assert.equal(ideaDifficultyInput(s,'unrecognised',true),false);
 assert(IDEA_DIFFICULTIES.every(x=>typeof x.label==='string'));
});
test('Saving from a mind map moves to comparison with ratings but never changes the investigation',()=>{
 const s=existing();setPlanCurrent(s,'N00B');const before=work(s);
 beginIdea(s,'leaf-outline',{fromMap:true});ideaInput(s,'question','What mathematical model fits my leaf?');
 rated(s,4,2);ideaDifficultyInput(s,'access',true);
 const action=ideaAction(s,'idea-save');
 assert(action.ok&&action.render,action.error);
 assert.equal(s.planning.current,'N00C');assert.equal(s.ideaExplorer.active,'');
 assert.equal(s.ideaExplorer.shortlist[0].clarity,4);
 assert.equal(s.ideaExplorer.shortlist[0].quickStart,2);
 assert.deepEqual(s.ideaExplorer.shortlist[0].difficulties,['access']);
 assert.equal(work(s),before);
 assert(ideaComparisonView(s).includes('4 / 5'));
 assert(ideaComparisonView(s).includes('2 / 5'));
 assert(ideaComparisonView(s).includes('Reject idea'));
});
test('A student can add a manual idea, edit it and return to comparison',()=>{
 const s=make('N00C');assert(ideaAction(s,'idea-own').ok);
 ideaInput(s,'question','Could I measure how a queue changes during lunch?');
 rated(s,5,5);
 assert(ideaAction(s,'idea-save').ok);
 assert.equal(s.ideaExplorer.shortlist.length,1);
 const id=s.ideaExplorer.shortlist[0].id;
 assert(ideaAction(s,'idea-edit-saved',{id}).ok);
 assert.equal(s.planning.current,'N00C');
 assert(ideaComparisonView(s).includes('data-action="idea-rate"'));
 ideaInput(s,'question','How does waiting time change during lunch?');
 assert(ideaAction(s,'idea-rate',{field:'clarity',value:'4'}).ok);
 assert(ideaAction(s,'idea-save').ok);
 assert.equal(s.ideaExplorer.shortlist.length,1);
 assert.equal(s.ideaExplorer.shortlist[0].clarity,4);
 assert.equal(s.ideaExplorer.shortlist[0].question,'How does waiting time change during lunch?');
});
test('Comparison offers both entry routes and does not infer a composite score',()=>{
 const s=make('N00C');add(s,'own','How variable is the morning journey?',[4,3]);
 const html=ideaComparisonView(s);
 assert(html.includes('Add a possible idea from my mind map'));
 assert(html.includes('Add an idea manually'));
 assert(html.includes('Aim clarity'));
 assert(html.includes('Quick start'));
 assert(!html.includes('Overall score'));
 assert(ideaAction(s,'idea-map-open').ok);
 assert.equal(s.planning.current,'N00B');
 assert(ideaExplorerView(s).includes('data-idea-map-network'));
});
test('Up to three active ideas; rejected ideas are archived, and restored with the same ratings',()=>{
 const s=make('N00C');
 add(s,'leaf-outline','How can I measure a leaf?',[4,2]);
 add(s,'plant-change','How does a plant change?', [3,4]);
 add(s,'own','How fast is the school queue?', [5,5]);
 beginIdea(s,'game-chance',{fromMap:true});ideaInput(s,'question','How reliable is this game?');rated(s);
 assert.equal(saveIdea(s).ok,false);
 const reject=s.ideaExplorer.shortlist[1],keep=clone(reject);
 assert(ideaAction(s,'idea-remove',{id:reject.id}).ok);
 assert.equal(s.ideaExplorer.shortlist.length,2);
 assert.equal(s.ideaExplorer.rejected.length,1);
 assert.equal(s.ideaExplorer.rejected[0].id,reject.id);
 assert(ideaComparisonView(s).includes('Restore idea'));
 assert(ideaAction(s,'idea-restore',{id:reject.id}).ok);
 assert.equal(s.ideaExplorer.shortlist.length,3);
 assert.equal(s.ideaExplorer.rejected.length,0);
 assert.deepEqual(s.ideaExplorer.shortlist.at(-1).difficulties,keep.difficulties);
 assert.equal(s.ideaExplorer.shortlist.at(-1).quickStart,keep.quickStart);
});
test('Rejecting or restoring an idea does not edit current mathematics or project aim',()=>{
 const s=existing();const before=work(s);
 const id=add(s,'own','My optional alternative?',[2,5]);
 assert(ideaAction(s,'idea-remove',{id}).ok);
 assert(ideaAction(s,'idea-restore',{id}).ok);
 assert.equal(work(s),before);
});
test('A rated, selected idea becomes the same aim spark as the direct Planning route',()=>{
 const s=make('N00C');
 const id=add(s,'own','Does my school queue time change across the week?',[4,5]);
 const chosen=ideaAction(s,'idea-use',{id});
 assert(chosen.ok&&chosen.navigate,chosen.error);
 assert.equal(s.planning.current,'N01');
 assert.equal(s.project.aim,'Does my school queue time change across the week?');
 assert.equal(s.planning.fields.aim,s.project.aim);
 assert.equal(s.project.idea,s.project.aim);
 assert.equal(s.ideaExplorer.selectedId,id);
 assert(insightItems(s).some(x=>x.id==='aim'&&x.value===s.project.aim));
 assert(insightCapture(s,'N01A').includes('Spark saved'));
 assert(insightEcho(s,'N02').includes('school queue'));
 assert.equal(s.entries.length,0);
});
test('Existing aims are never replaced without confirmation; cancel leaves the entire project intact',()=>{
 const s=existing();const id=add(s,'own','Should I model my own measured ball path?', [4,3]);
 const before=work(s);
 assert(ideaAction(s,'idea-use',{id}).ok);
 assert(s.ideaExplorer.pending);
 assert(ideaComparisonView(s).includes('Your current aim'));
 assert(ideaComparisonView(s).includes('Confirm this aim'));
 assert(ideaAction(s,'idea-cancel').ok);
 assert.equal(work(s),before);assert.equal(s.ideaExplorer.pending,null);
 assert.equal(s.planning.current,'N00C');
});
test('Confirming aim change updates spark, records history and flags writing without erasing work',()=>{
 const s=existing();const previous=clone(s);
 const id=add(s,'leaf-outline','How well can I estimate leaf area?', [4,4]);
 assert(ideaAction(s,'idea-use',{id}).ok);
 assert(ideaAction(s,'idea-confirm').ok);
 assert.equal(s.planning.current,'N01');
 assert.equal(s.planning.fields.aim,'How well can I estimate leaf area?');
 assert.equal(s.project.aim,s.planning.fields.aim);
 assert.equal(s.ideaExplorer.history.at(-1).aimAtChoice,previous.project.aim);
 assert.deepEqual(s.entries,previous.entries);
 assert.deepEqual(s.scratch,previous.scratch);
 assert.deepEqual(s.teacher,previous.teacher);
 assert.equal(s.completion.stages.C10,'needs-review');
 assert.equal(s.completion.stages.C40,'needs-review');
 assert.equal(s.completion.stages.C60,'needs-review');
 assert(insightCapture(s,'N01A').includes('Spark saved'));
});
test('Confirmation guard rejects selections when the aim has changed since prompt',()=>{
 const s=existing();const id=add(s,'own','A revised aim?', [4,3]);
 ideaAction(s,'idea-use',{id});
 s.planning.fields.aim='Changed elsewhere';
 assert.equal(confirmIdeaUse(s).ok,false);
 assert.equal(s.project.aim,'My existing aim');
});
test('Old saved options remain visible but must be self-rated before selection',()=>{
 const s=make('N00C');
 s.ideaExplorer.shortlist=[{id:'idea-1',seedId:'own',question:'An old saved question',
  detail:'',focus:'',fromMap:false,trialNote:'',trialStatus:'',checks:{}}];
 s.ideaExplorer=normalizeIdeaState(s.ideaExplorer);
 assert(ideaComparisonView(s).includes('saved before ratings'));
 assert.equal(ideaAction(s,'idea-use',{id:'idea-1'}).ok,false);
 assert(ideaAction(s,'idea-edit-saved',{id:'idea-1'}).ok);
 rated(s,3,2);
 assert(ideaAction(s,'idea-save').ok);
 assert(ideaAction(s,'idea-use',{id:'idea-1'}).ok);
});
test('Earlier typed ideas open the evaluator without silently overwriting old aims',()=>{
 const s=existing();s.planning.fields.otherIdea1='An earlier idea';
 s.planning.fields.ideaAccess='An old data access note';
 const before=work(s);
 assert(ideaComparisonView(s).includes('An earlier idea'));
 assert(ideaAction(s,'idea-legacy',{key:'otherIdea1'}).ok);
 assert.equal(s.planning.current,'N00C');
 assert.equal(s.ideaExplorer.drafts.own.question,'An earlier idea');
 assert.equal(work(s),before);
 rated(s,4,3);
 assert(ideaAction(s,'idea-save').ok);
 assert.equal(work(s),before);
});
test('Saved evaluations, archived ratings and map selections survive a JSON round trip',()=>{
 const s=make('N00C');
 add(s,'own','My first question',[2,3]);
 add(s,'plant-change','My second question',[4,5]);
 const rejectedId=s.ideaExplorer.shortlist[0].id;
 ideaAction(s,'idea-remove',{id:rejectedId});
 ideaAction(s,'idea-map-open');ideaAction(s,'idea-map-root',{root:'world'});
 ideaAction(s,'idea-map-topic',{topic:'nature'});ideaAction(s,'idea-map-leaf',{subtopic:'Leaves'});
 const restored=normalizeProjectState(clone(s));
 assert.deepEqual(restored.ideaExplorer.rejected,s.ideaExplorer.rejected);
 assert.deepEqual(restored.ideaExplorer.shortlist,s.ideaExplorer.shortlist);
 assert.deepEqual(restored.ideaExplorer.map,s.ideaExplorer.map);
 assert.equal(restored.ideaExplorer.pending,null);
});
test('Existing data rejects invalid difficulty IDs, forged idea IDs and prototype keys',()=>{
 const input=JSON.parse('{"active":"__proto__","drafts":{"__proto__":{"question":"bad"},"own":{"question":"ok","clarity":8,"quickStart":3,"difficulties":["x","maths","maths"]}},"shortlist":[{"id":"__proto__","question":"bad"}]}');
 const s=normalizeIdeaState(input);
 assert.equal(s.active,'');assert.equal(s.shortlist.length,0);
 assert.equal(s.drafts.own.clarity,0);
 assert.equal(s.drafts.own.quickStart,3);
 assert.deepEqual(s.drafts.own.difficulties,['maths']);
 assert(!Object.hasOwn(s.drafts,'__proto__'));
});
test('Untrusted questions are escaped everywhere they are shown',()=>{
 const s=make('N00C');const question='<script>alert("no")</script>';
 add(s,'own',question);
 assert(!ideaComparisonView(s).includes(question));
 assert(ideaComparisonView(s).includes('&lt;script&gt;'));
 assert(!insightItems(s).some(x=>x.id==='aim'));
});
test('Idea navigation cannot modify state outside Planning; old data is not erased',()=>{
 const s=existing();setPlanCurrent(s,'N01');
 assert.equal(ideaAction(s,'idea-use',{id:'idea-1'}).ok,false);
 assert.equal(ideaAction(s,'unrelated'),null);
 const before=work(s);assert.equal(ideaAction(s,'idea-own').ok,false);
 assert.equal(work(s),before);
});
test('Mind map remains connected and does not offer theory-heavy patterns as easy IA starts',()=>{
 const s=make();const html=ideaExplorerView(s);
 for(const title of ['My hobbies &amp; interests','My daily life','My world','Start with data I can get'])
  assert(html.includes(title),title);
 assert(html.includes('data-idea-map-connectors'));
 assert(html.includes(IDEA_DATA_PROMISE));
 assert(html.includes(IDEA_THEORY_CAUTION));
 assert(!html.includes('id="idea-topic"'));
 assert(ideaAction(s,'idea-map-root',{root:'world'}).ok);
 assert(ideaAction(s,'idea-map-topic',{topic:'nature'}).ok);
 assert(ideaAction(s,'idea-map-leaf',{subtopic:'Leaves'}).ok);
 const connected=ideaExplorerView(s);
 for(const [child,parent] of [['topic-nature','root-world'],['leaf-nature-0','topic-nature'],['seed-leaf-outline','leaf-nature-0']])
  assert(connected.includes('data-idea-node="'+child+'" data-idea-parent="'+parent+'"'),child);
 assert(!ideaAction(s,'idea-map-topic',{topic:'patterns'}).ok);
});
test('Data-first mind map includes a genuine survey-permission warning',()=>{
 const s=make();ideaAction(s,'idea-map-mode',{mode:'data'});
 ideaAction(s,'idea-map-root',{root:'record'});ideaAction(s,'idea-map-access',{branch:'survey'});
 assert(ideaExplorerView(s).includes('school permission, consent and privacy'));
 ideaAction(s,'idea-map-root',{root:'find'});ideaAction(s,'idea-map-access',{branch:'image'});
 assert(ideaMapIdeas(s.ideaExplorer.map).some(x=>x.id==='sport-trajectory'));
});
test('Earlier dropdown selections migrate into a corresponding mind-map branch',()=>{
 const old={topic:'sport',subtopic:'Badminton',focus:'My unusual sport'};
 const converted=normalizeIdeaState(old);
 assert.equal(converted.map.root,'hobbies');
 assert.equal(converted.map.topic,'sport');
 assert.equal(converted.map.subtopic,'Badminton');
 assert.equal(normalizeIdeaState({...old,topic:'patterns'}).map.root,'');
});
test('UI adds responsive neutral rating and comparison styles with reduced motion',()=>{
 const css=readFileSync(new URL('../data/idea-map.css',import.meta.url),'utf8');
 assert(css.includes('.idea-evaluation-scale'));
 assert(css.includes('.idea-rating-point.selected'));
 assert(css.includes('.idea-compare-bar'));
 assert(css.includes('.idea-rejected'));
 assert(css.includes('@media(max-width:760px)'));
 assert(css.includes('prefers-reduced-motion:reduce'));
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert(app.includes('ideaDifficultyInput(state,target.dataset.ideaDifficulty,target.checked)'));
});
