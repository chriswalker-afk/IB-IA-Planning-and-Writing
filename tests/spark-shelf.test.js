import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState} from '../src/core/project-state.js';
import {renderSparkShelf,featuredSparkItems,insightItems,insightEcho} from '../src/ui/insight-threads.js';
import {createPlanningViews} from '../src/ui/planning-views.js';

const sample=()=>{
 const s=createProjectState();
 s.route='planning';s.planning.current='N03P';
 Object.assign(s.planning.fields,{
  provisionalTitle:'Optimising a school box',
  aim:'Which design has the greatest usable volume?',
  beneficiary:'Help decide which box is efficient without claiming a practical optimum',
  prediction:'A larger box may use more material.',
  dataSource:'both',
  primaryWhat:'Measured volume and dimensions',
  primarySamplingMethod:'convenience',
  primaryPopulation:'Accessible school boxes',
  primarySamplingUnit:'One box',
  firstAction:'Calculate initial volume'
 });
 s.planning.accuracyPlans=[
  {id:'pa-primary-1',source:'primary',quantity:'Length',unit:'cm',resolution:'nearest 0.1 cm',basis:'analogue',uncertainty:''},
  {id:'pa-primary-2',source:'primary',quantity:'Width',unit:'cm',resolution:'nearest 0.1 cm',basis:'digital',uncertainty:''},
  {id:'pa-secondary-1',source:'secondary',quantity:'Published length',unit:'cm',resolution:'rounded to nearest cm',basis:'rounded',uncertainty:''}
 ];
 s.completion.sourceRecords=[{id:'source-actual',fields:{actualSource:'Recorded dimensions',dataStatus:'ready'}}];
 s.completion.accuracyDecisions=[{id:'acc-actual',quantity:'Length',unit:'cm',policy:'Display to one decimal place',resolution:'nearest 0.1 cm'}];
 s.entries=[{id:'math1',status:'completed',title:'Measured box',
  localTakeaway:'Observed a consistent relationship',result:'V = lwh',accuracyRefs:['acc-actual'],sourceRefs:['source-actual'],phase:'first'}];
 s.completion.activeEntryIndex=0;
 s.completion.confirmedLimitations=[{id:'limit-1',entryId:'math1',explanation:'Only one box was measured',
  consequence:'Cannot generalise to every box'}];
 return s;
};
test('an empty project has no artificial sparks or empty shelf',()=>{
 const s=createProjectState();
 assert.equal(insightItems(s).length,0);
 assert.equal(renderSparkShelf(s,'N00'),'');
 assert.equal(renderSparkShelf(s,'C10',{surface:'studio'}),'');
});
test('every recorded insight is represented exactly once in the expandable library',()=>{
 const s=sample(),all=insightItems(s),before=JSON.stringify(s);
 const html=renderSparkShelf(s,'N03P');
 assert.equal((html.match(/class="spark-library-entry insight-/g)||[]).length,all.length);
 for(const x of all){
  assert(html.includes('class="spark-library-entry insight-'+x.type+'" data-spark-id="'+x.id+'"'),x.id);
 }
 assert(html.includes('View all sparks'));
 assert(html.includes(all.length+' collected'));
 assert(html.includes('Your question and intentions'));
 assert(html.includes('Data, sources and accuracy'));
 assert(html.includes('Mathematical discoveries and learning'));
 assert(html.includes('Reflections and limitations'));
 assert.equal(JSON.stringify(s),before);
});
test('only two sparks are highlighted; all others remain available with no duplicate inline editors',()=>{
 const s=sample();
 const displayed=renderSparkShelf(s,'N03P');
 assert.equal((displayed.match(/class="motivation-aim-spark planning-return-spark spark-shelf-featured/g)||[]).length,2);
 assert.deepEqual(featuredSparkItems(s,'N03P').map(x=>x.id),['planned-accuracy:pa-primary-2','sampling-plan']);
 const secondary=featuredSparkItems(s,'N03S').map(x=>x.id);
 assert(secondary.includes('planned-accuracy:pa-secondary-1'));
 assert(!secondary.includes('planned-accuracy:pa-primary-1'));
 assert(featuredSparkItems(s,'C21S').some(x=>x.id==='sampling-plan'));
 assert(featuredSparkItems(s,'C24').some(x=>x.id==='accuracy:acc-actual'));
 const intro=featuredSparkItems(s,'C10').map(x=>x.id);
 assert.deepEqual(intro,['aim','motivation']);
 const finish=featuredSparkItems(s,'C60').map(x=>x.id);
 assert(finish.includes('aim')&&finish.includes('result:math1'));
 assert(displayed.includes('Only one box was measured'));
});
test('actual measurement links are not silently attached to a different mathematics record',()=>{
 const s=sample();
 let top=featuredSparkItems(s,'C40').map(x=>x.id);
 assert(top.includes('accuracy:acc-actual'));
 s.entries[0].accuracyRefs=[];
 s.entries[0].sourceRefs=[];
 top=featuredSparkItems(s,'C40').map(x=>x.id);
 assert(!top.includes('accuracy:acc-actual'));
 assert(!top.includes('source:source-actual'));
 assert(renderSparkShelf(s,'C40').includes('accuracy:acc-actual')); // all collection
});
test('older unrelated limitation remains findable without appearing as a relevant introduction card',()=>{
 const s=createProjectState();
 s.completion.confirmedLimitations=[{id:'limit-a',explanation:'Only a small range',consequence:'Cannot generalise'}];
 assert(featuredSparkItems(s,'C10').length===0);
 const echo=insightEcho(s,'C10');
 assert(echo.includes('Only a small range'));
 assert(echo.includes('View all sparks'));
 assert.equal((echo.match(/class="motivation-aim-spark planning-return-spark spark-shelf-featured/g)||[]).length,0);
});
test('planning + studio use the same shelf and allow inline edits of original title, aim, and motivation',()=>{
 const s=sample();
 for(const [node,id] of [['N01','working-title'],['N01V','aim'],['C10','aim'],['C60','aim']]){
  const html=renderSparkShelf(s,node,{surface:node.startsWith('C')?'studio':'planning'});
  assert(html.includes('data-spark-editor="'+id+'"'),node);
 }
 const ui=createPlanningViews({
  getState:()=>s,e:v=>String(v??''),icon:()=>'',button:()=>'',field:()=>'',choose:()=>'',numberPick:()=>'',note:()=>'',summary:()=>'',helpButton:()=>'',helpBox:()=>'',tabletNav:()=>''}).viewPlanning();
 assert(ui.includes('data-spark-shelf="planning"'));
 assert(ui.includes('data-spark-library'));
 assert(ui.includes('View all sparks'));
 const aim=renderSparkShelf(s,'N01V');
 assert.equal((aim.match(/data-spark-editor="aim"/g)||[]).length,1);
 assert(aim.includes('data-bind="planning.fields.aim"'));
 assert(aim.includes('data-bind="planning.fields.provisionalTitle"'));
 assert(aim.includes('Edit in the highlighted spark')===false);
 const other=renderSparkShelf(s,'N03P');
 assert(other.includes('data-action="spark-edit-accuracy"'));
 assert(other.includes('data-action="insight-jump"'));
});
test('student-entered text is escaped rather than injected into the shelf',()=>{
 const s=sample();
 s.planning.fields.aim='<img src=x onerror=alert(1)>';
 const html=renderSparkShelf(s,'N01V');
 assert(!html.includes('<img'));
 assert(html.includes('&lt;img'));
 assert(!html.includes('onerror=alert(1)>'));
});
test('all types of sparks remain accessible on Planning, data, mathematics and conclusion screens',()=>{
 const s=sample(),all=insightItems(s);
 for(const node of ['N00','N01V','N02M','N03P2','N03P','N03S','N05V','C10','C21S','C24','C40','C60']){
  const html=renderSparkShelf(s,node);
  assert.equal((html.match(/class="spark-library-entry insight-/g)||[]).length,all.length,node);
  assert(featuredSparkItems(s,node).length<=2,node);
 }
});
test('mobile styling, disclosure semantics and original edit navigation are wired up',()=>{
 const css=readFileSync(new URL('../data/spark-shelf.css',import.meta.url),'utf8');
 for(const key of ['.spark-shelf-featured','.spark-library[open]','.spark-library-entry[open]',
  '@media(max-width:600px)','prefers-reduced-motion:reduce'])
  assert(css.includes(key),key);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert(app.includes('case "spark-edit-accuracy"'));
 assert(app.includes('[data-spark-preview-path]'));
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert(index.includes('spark-shelf.css'));
});
