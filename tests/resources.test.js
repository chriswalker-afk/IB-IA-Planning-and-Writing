import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {RESOURCES,TOOLS,resourceById,PRACTICE_PAIRS} from '../src/resources/catalog.js';
import {resourceContext,resourceSuggestions,filterResources} from '../src/resources/context.js';
import {resourceDrawer,resourcePrompt,safeResourceUrl} from '../src/resources/views.js';
import {resourceAction,resourceFilter,resourcePreference} from '../src/resources/actions.js';
import {newResourceSession,normalizeResourceState,setResourcePreference} from '../src/resources/state.js';
import {captureStuckOrigin} from '../src/help/stuck-state.js';
function fixture({node='C40',method='pmcc',status='planned',kind='statistics'}={}){
 const s=createProjectState();s.route='completing';s.planning.fields.kind=kind;s.planning.fields.course='AA SL';s.planning.fields.aim='My own question';
 s.entries=[{id:'active',methodId:method,phase:'substantial',title:'My selected calculation',status,result:status==='completed'?'My actual finding':'',knowledge:'syllabus',sourceRefs:[],accuracyRefs:[]}];
 s.completion.activeEntryIndex=0;s.completion.current=node;s.completion.nextFromEntryId='active';return s;
}
const ids=(s,o)=>resourceSuggestions(s,o).map(r=>r.id);
const educational=s=>JSON.stringify([s.entries,s.planning,s.project,s.teacher,s.completion,s.scratch]);
const view=(s,id)=>resourceDrawer(s,{...newResourceSession(),id});
test('resources: all task IDs are unique with written steps, checks, valid references and related tasks',()=>{
 assert.equal(RESOURCES.length,31);assert.equal(new Set(RESOURCES.map(r=>r.id)).size,31);
 for(const r of RESOURCES){assert(r.steps.length>=3&&r.check&&r.after&&r.when,r.id);assert(Object.hasOwn(TOOLS,r.tool));assert(r.sources.length);assert(r.related.length<=2);for(const id of r.related)assert(resourceById(id));for(const x of [...r.sources,...r.videos]){assert(safeResourceUrl(x.url),x.url);assert.equal(x.checkedAt,'2026-10-15');}}
});
test('resources: video listings do not claim teacher approval or full viewing',()=>{
 assert.equal(RESOURCES.filter(r=>r.videos.length).length,19);
 for(const v of RESOURCES.flatMap(r=>r.videos)){assert.equal(v.status,'publisher-listed');assert.equal(v.watchedInFull,false);assert(v.find&&v.publisher);assert.match(v.captions,/Not verified/);}
 assert.equal(resourceById('image-scale').videos.length,0);
});
test('resources: the practice table is six synthetic pairs, never student evidence',()=>{
 assert.equal(PRACTICE_PAIRS.split('\n').length,7);assert.match(PRACTICE_PAIRS,/practice units/);
 const s=fixture(),before=educational(s);view(s,'sheets-pmcc');resourceAction(s,newResourceSession(),'resource-copy');assert.equal(educational(s),before);
});
test('resources: default inline UI offers exactly one task and opt-in depth',()=>{
 const html=resourcePrompt(fixture());assert.equal((html.match(/data-resource-suggestion=/g)||[]).length,1);assert.match(html,/Optional/);assert(!html.includes('<iframe'));assert(!html.includes('<ol'));
});
test('resources: planned PMCC gives a how-to, not interpretation of an invented result',()=>{
 const s=fixture();assert.deepEqual(ids(s),['sheets-pmcc']);assert(!ids(s).includes('pmcc-meaning'));assert.match(view(s,'sheets-pmcc'),/=CORREL\(A2:A7,B2:B7\)/);
});
test('resources: Desmos PMCC uses corr, never substitutes a regression task',()=>{
 const s=fixture();setResourcePreference(s,'entry:active','tool','desmos');assert.deepEqual(ids(s),['desmos-pmcc']);assert.match(view(s,'desmos-pmcc'),/corr\(x_1,y_1\)/);
});
test('resources: actual PMCC at interpretation gives interpretation guidance',()=>{
 const s=fixture({node:'C34B',status:'completed'});assert.deepEqual(ids(s),['pmcc-meaning']);
 s.entries[0].result='';assert(!ids(s).includes('pmcc-meaning'));
});
test('resources: explicit normal method beats a rejected PMCC title or technique',()=>{
 const s=fixture({method:'normal',status:'completed'});s.entries[0].title='Normal rather than PMCC';s.entries[0].technique='PMCC';assert.deepEqual(ids(s),['normal']);
});
test('resources: actual scatter does not choose regression, rank correlation or Pearson',()=>{
 const s=fixture({node:'C35',status:'completed',method:''});Object.assign(s.entries[0],{phase:'first',kind:'scatter',observation:'curved'});
 assert.deepEqual(ids(s),['chart-choice']);assert(!ids(s).some(x=>/pmcc|regression|spearman/.test(x)));
});
test('resources: selected earlier result anchors C35 rather than the last completed entry',()=>{
 const s=fixture({node:'C35',status:'completed'});s.entries.push({...s.entries[0],id:'later',methodId:'normal'});s.completion.activeEntryIndex=1;assert.equal(resourceContext(s).entry.id,'active');assert.deepEqual(ids(s),['pmcc-meaning']);
});
test('resources: planning isolates an unrelated active actual result',()=>{
 const s=fixture({status:'completed'});s.route='planning';s.planning.current='N03S';assert.equal(resourceContext(s).entry,null);assert(!ids(s).includes('pmcc-meaning'));assert(ids(s).includes('secondary-data'));
});
test('resources: data stage does not borrow stale calculation identity',()=>{
 const s=fixture({node:'C20',status:'completed'});assert.equal(resourceContext(s).entry,null);assert(!ids(s).includes('sheets-pmcc'));
});
test('resources: C96 reuses the exact writing origin',()=>{
 const s=fixture({node:'C96',status:'completed'});s.completion.writingOrigin={node:'C34B',entryId:'active',nextFromEntryId:'active'};assert.equal(resourceContext(s).node,'C34B');assert.deepEqual(ids(s),['pmcc-meaning']);
});
test('resources: stuck helper and precision resources use the originating record',()=>{
 const s=fixture({status:'completed'});captureStuckOrigin(s);s.completion.support.selected='precision';s.completion.current='C95';assert.deepEqual(ids(s,{help:true}),['reporting-precision']);assert.equal(resourceContext(s,{help:true}).scope,'entry:active');
});
test('resources: first theoretical work does not invite surveys or sampled data',()=>{
 const s=fixture({method:'proof',kind:'theoretical'});assert.deepEqual(ids(s),['desmos-start']);s.route='planning';s.planning.current='N03';assert.equal(ids(s).length,0);
});
test('resources: a selected statistical test requires an explicit syllabus/understanding check',()=>{
 const s=fixture({method:'chi-fit'});s.entries[0].knowledge='unsure';assert(!ids(s).includes('inference'));s.entries[0].knowledge='outside';assert(ids(s).includes('inference'));assert.match(view(s,'inference'),/not syllabus approval/);
});
test('resources: numerical integration does not become an analytic integral',()=>{
 assert(!ids(fixture({method:'numerical-integration'})).includes('integrals'));
});
test('resources: a selected regression gets tool help then checks after a real result',()=>{
 const s=fixture({method:'linear-regression'});assert.deepEqual(ids(s),['sheets-linear']);s.entries[0].status='completed';s.entries[0].result='y = 2x + 1';s.completion.current='C34B';assert.deepEqual(ids(s),['model-check']);
});
test('resources: image import, visual fit and sampled coordinates remain distinct choices',()=>{
 const s=fixture({method:'other'}),before=educational(s);for(const [v,expected] of [['import','image-import'],['visual','image-visual'],['points','image-points']]){setResourcePreference(s,'entry:active','image',v);assert.equal(ids(s)[0],expected);assert.equal(educational(s),before);}
});
test('resources: image modelling reviews scale again when affected mathematics changes',()=>{
 const s=fixture({method:'quadratic-fit',status:'completed',node:'C35'});setResourcePreference(s,'entry:active','image','points');assert.equal(ids(s)[0],'model-check');s.entries[0].reviewNeeded='yes';assert.equal(ids(s)[0],'image-scale');
});
test('resources: image calibration includes squared scale for area and perspective caution',()=>{
 const r=resourceById('image-scale');assert.match(JSON.stringify(r),/25/);assert.match(JSON.stringify(r),/perspective/i);assert.match(JSON.stringify(resourceById('image-route')),/visual/i);
});
test('resources: another entry does not inherit a tool or picture preference',()=>{
 const s=fixture();setResourcePreference(s,'entry:active','image','visual');s.entries.push({...s.entries[0],id:'other'});s.completion.activeEntryIndex=1;assert.equal(resourceContext(s).pref.image,'');assert(!ids(s).includes('image-visual'));
});
test('resources: open, read, filter, copy, close and prefer never mutate authored work',()=>{
 const s=fixture(),session=newResourceSession(),before=educational(s);
 for(const r of RESOURCES){resourceAction(s,session,'resource-open',{resourceId:r.id});resourceDrawer(s,session);resourceAction(s,session,'resource-list',{},'resources');}
 resourceFilter(session,'query','PMCC');resourcePreference(s,session,'tool','desmos');resourceAction(s,session,'resource-hide');resourceAction(s,session,'resource-close');assert.equal(educational(s),before);
});
test('resources: dismissal stays quiet across reload but a changed method can offer relevant help',()=>{
 const s=fixture(),u=newResourceSession();resourceAction(s,u,'resource-hide');assert(!resourcePrompt(s).includes('data-resource-suggestion='));const n=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert(!resourcePrompt(n).includes('data-resource-suggestion='));n.entries[0].methodId='normal';assert(resourcePrompt(n).includes('data-resource-suggestion="normal"'));
});
test('resources: preferences survive a full backup without asserting progress',()=>{
 const s=fixture();setResourcePreference(s,'entry:active','tool','desmos');setResourcePreference(s,'entry:active','image','points');const n=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert.deepEqual(n.resources,s.resources);assert.equal(n.entries[0].status,'planned');
});
test('resources: old project imports default to empty optional resource state',()=>{
 const s=fixture();delete s.resources;const n=normalizeProjectState(s);assert.deepEqual(n.resources,{preferences:{},hidden:{}});
});
test('resources: malicious keys and oversized preference registries are not restored',()=>{
 const raw=JSON.parse('{"preferences":{"__proto__":{"tool":"sheets"},"constructor":{"tool":"sheets"},"valid":{"tool":"malicious","image":"invalid"}},"hidden":{"__proto__":true}}');const n=normalizeResourceState(raw);assert.deepEqual(Object.keys(n.preferences),['valid']);assert.deepEqual(n.preferences.valid,{tool:'',image:''});assert.equal(Object.keys(n.hidden).length,0);
 const many=normalizeResourceState({preferences:Object.fromEntries(Array.from({length:1000},(_,i)=>['entry:'+i,{tool:'desmos'}]))});assert.equal(Object.keys(many.preferences).length,240);
});
test('resources: URLs are fixed HTTPS destinations, with no project data or unsafe protocols',()=>{
 for(const u of ['javascript:alert(1)','https://support.google.com.evil.example/','https://user:pass@help.desmos.com/','http://www.desmos.com/','//www.desmos.com/'])assert.equal(safeResourceUrl(u),'');
 const s=fixture();s.planning.fields.aim='SECRET AIM <script>';const html=view(s,'sheets-pmcc');assert(!html.match(/href="[^"]*SECRET/));assert(!html.includes('<script'));assert.match(html,/rel="noopener noreferrer"/);assert.match(html,/referrerpolicy="no-referrer"/);
});
test('resources: no embedded external content or autoplay; every video has written fallback',()=>{
 for(const r of RESOURCES){const html=view(fixture(),r.id);assert(!/<iframe|<video|autoplay|<script/i.test(html));assert.match(html,/Read the steps/);if(r.videos.length)assert.match(html,/not been watched end to end/);}
});
test('resources: filters are case-insensitive, tool-aware and accept no unknown keys',()=>{
 assert(filterResources({query:'pMcC'}).some(r=>r.id==='sheets-pmcc'));assert(filterResources({tool:'desmos',query:'picture'}).every(r=>r.tool==='desmos'));assert.equal(filterResources({query:'xyz-not-found'}).length,0);
 const u=newResourceSession();assert(!resourceFilter(u,'__proto__','x'));assert(!resourceFilter(u,'tool','x'));assert(resourceFilter(u,'query','a'.repeat(200)));assert.equal(u.query.length,120);
});
test('resources: library navigation keeps filters and a help return destination without changing stage',()=>{
 const s=fixture(),u=newResourceSession();resourceAction(s,u,'resource-browse',{resourceHelp:'true'},'stuck');resourceFilter(u,'query','image');resourceAction(s,u,'resource-open',{resourceId:'image-scale'},'resources');assert.equal(u.parent,'stuck');assert.equal(u.help,true);resourceAction(s,u,'resource-list',{},'resources');assert.equal(u.query,'image');assert.equal(u.id,'');assert(!resourceAction(s,u,'resource-open',{resourceId:'made-up'}).ok);
});

test('resources: unchanged blur/change filters preserve clickable results and pagination',()=>{
 const u=newResourceSession();assert(resourceFilter(u,'query','PMCC'));u.limit=16;
 assert.equal(resourceFilter(u,'query','PMCC'),false);assert.equal(u.limit,16);
 assert(filterResources({query:'inference'}).some(r=>r.id==='inference'));
});

test('resources: native diagram creators are available without hiding or replacing the existing tutorial guides',()=>{
 const s=fixture(),before=educational(s),session=newResourceSession();
 const html=resourceDrawer(s,session);
 for(const name of ['Graph plotter','Statistical diagrams','Table Studio','Image & coordinate tracer','Voronoi Studio'])
  assert(html.includes(name.replace(/&/g,'&amp;')),name);
 for(const id of ['graph','stat','table','trace','voronoi']){
  assert(html.includes('data-action="resource-creator-open" data-resource-creator="'+id+'"'),id);
  assert.deepEqual(resourceAction(s,session,'resource-creator-open',{resourceCreator:id}),{ok:true,creator:id});
 }
 assert.deepEqual(resourceAction(s,session,'resource-creator-return'),{ok:true,creatorReturn:true});
 assert.equal(resourceAction(s,session,'resource-creator-open',{resourceCreator:'../../evil'}).ok,false);
 assert.equal(educational(s),before);
 assert.equal((html.match(/class="resource-row"/g)||[]).length,8);
 assert(html.includes('31 matching guides'));
 assert(!html.includes('target="_self"'));
 const guide=resourceDrawer(s,{...session,id:'sheets-scatter'});
 assert(guide.includes('Use a Pathfinder diagram creator'));
 assert(guide.includes('data-resource-creator="graph"'));
 assert(guide.includes('Read the steps'));
});
