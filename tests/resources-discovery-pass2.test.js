import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {RESOURCES} from '../src/resources/catalog.js';
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS} from '../src/workshop/catalog.js';
import {REPRESENTATION_TOOLS} from '../src/diagrams/representation-registry.js';
import {DISCOVERY_ITEMS,DISCOVERY_AREAS,DISCOVERY_TYPES,discoverResources} from '../src/resources/discovery.js';
import {resourceDrawer,resourceResults} from '../src/resources/views.js';
import {resourceAction,resourceFilter} from '../src/resources/actions.js';
import {newResourceSession} from '../src/resources/state.js';

const state=()=>{const s=createProjectState();s.route='planning';s.planning.current='N01';return s;};
const find=(q,more={})=>discoverResources({...newResourceSession(),query:q,...more});
const has=(items,id)=>items.some(item=>item.id===id);

test('unified discovery covers every current item exactly once and changes no source data',()=>{
 assert.equal(DISCOVERY_ITEMS.length,RESOURCES.length+WORKSHOP_DEFINITIONS.length+WORKSHOP_LESSONS.length+REPRESENTATION_TOOLS.length);
 assert.equal(RESOURCES.length,36);
 assert.equal(WORKSHOP_DEFINITIONS.length,230);
 assert.equal(WORKSHOP_LESSONS.length,42);
 assert.equal(REPRESENTATION_TOOLS.length,7);
 assert.equal(new Set(DISCOVERY_ITEMS.map(x=>x.type+':'+x.id)).size,DISCOVERY_ITEMS.length);
 assert(DISCOVERY_ITEMS.every(x=>Object.isFrozen(x)&&x.title&&x.description&&x.area));
 assert.equal(DISCOVERY_AREAS.length,8);
 assert.equal(DISCOVERY_TYPES.length,5);
});
test('PMCC links the actual mathematics, definitions and software guides without choosing a method',()=>{
 const result=find('PMCC');
 assert(has(result.grouped.lesson,'pearson'));
 assert(has(result.grouped.definition,'correlation'));
 assert(has(result.grouped.guide,'sheets-pmcc'));
 assert(has(result.grouped.guide,'desmos-pmcc'));
 assert.equal(result.counts.creator,0);
});
test('picture and histogram searches discover creators, tutorials and learning resources',()=>{
 const picture=find('picture');
 assert(has(picture.grouped.creator,'trace'));
 assert(has(picture.grouped.guide,'image-import'));
 const histogram=find('histogram');
 assert(has(histogram.grouped.creator,'stat'));
 assert(histogram.counts.definition>=1);
});
test('natural-language, exact title and alternate vocabulary searches stay local',()=>{
 assert(has(find('how do I cite my sources').grouped.guide,'mla-citations'));
 assert(has(find('MLA').grouped.guide,'mla-citations'));
 assert(has(find('sampling frame').grouped.definition,'sampling-frame'));
 assert(has(find('differentiate').grouped.guide,'derivatives'));
 assert(has(find('Voronoi').grouped.creator,'voronoi'));
});
test('topic browsing covers the figure studios and distinguishes tasks from source kinds',()=>{
 const geometry=find('',{discoveryArea:'geometry'});
 assert(geometry.active);
 assert(has(geometry.grouped.creator,'trace'));
 assert(has(geometry.grouped.creator,'voronoi'));
 const data=find('',{discoveryArea:'data'});
 assert(has(data.grouped.creator,'table'));
 const probability=find('',{discoveryArea:'probability'});
 assert(has(probability.grouped.creator,'probability'));
 assert.equal(find('',{discoveryArea:'invalid'}).active,false);
});
test('source type tabs and software-specific filters work without restricting mathematical definitions',()=>{
 const all=find('PMCC',{tool:'desmos'});
 assert(has(all.grouped.lesson,'pearson'));
 assert(has(all.grouped.definition,'correlation'));
 assert(!has(all.grouped.guide,'sheets-pmcc'));
 assert(has(all.grouped.guide,'desmos-pmcc'));
 const only=find('PMCC',{discoveryType:'definition'});
 assert.equal(only.type,'definition');
 assert(only.items.every(item=>item.type==='definition'));
 assert.equal(only.total,find('PMCC').total);
});
test('the first landing view remains the default guide catalogue, then search becomes unified',()=>{
 const s=state(),u=newResourceSession(),before=JSON.stringify(s);
 const initial=resourceDrawer(s,u);
 assert(initial.includes('36 matching guides'));
 assert.equal((initial.split('<div id="resource-results">')[1].match(/class="resource-row"/g)||[]).length,8);
 assert(initial.includes('Browse by task'));
 assert(initial.includes('Search tasks, methods and tools'));
 assert(resourceFilter(u,'query','PMCC'));
 const results=resourceResults(u);
 for(const type of ['lesson','definition','guide'])assert(results.includes('data-discovery-group="'+type+'"'),type);
 assert(results.includes('data-action="resource-workshop-lesson" data-workshop-id="pearson"'));
 assert(results.includes('data-action="resource-open" data-resource-id="sheets-pmcc"'));
 assert.equal(JSON.stringify(s),before);
});
test('typed results have a visible label, real actions and accessible selected state',()=>{
 const u=newResourceSession();u.query='picture';u.discoveryType='creator';
 const html=resourceResults(u);
 assert(html.includes('aria-pressed="true"'));
 assert(html.includes('data-action="resource-creator-open" data-resource-creator="trace"'));
 assert(!html.includes('<iframe'));
 assert(!html.includes('<script'));
 assert(!html.includes('target="_self"'));
});
test('search and task filters never evaluate or echo unsafe student input as markup',()=>{
 const u=newResourceSession();u.query='<img src=x onerror=alert(1)>';
 const s=state();const html=resourceDrawer(s,u);
 assert(html.includes('&lt;img src=x'));
 assert(!html.includes('<img src=x'));
 assert(!html.includes('eval('));
 assert.equal(JSON.stringify(s),JSON.stringify(state()));
});
test('direct results open valid lessons/definitions and preserve the return search',()=>{
 const s=state(),before=JSON.stringify(s),u=newResourceSession();
 resourceFilter(u,'query','PMCC');
 assert(resourceAction(s,u,'resource-workshop-lesson',{workshopId:'pearson'},'resources').ok);
 assert.equal(u.mode,'workshop');assert.equal(u.workshopId,'pearson');
 assert(resourceDrawer(s,u).includes('Show me'));
 assert(resourceAction(s,u,'resource-workshop-tools',{},'resources').ok);
 assert.equal(u.mode,'tools');assert.equal(u.query,'PMCC');
 assert(resourceAction(s,u,'resource-workshop-term',{workshopId:'correlation'},'resources').ok);
 assert.equal(u.workshopTerm,'correlation');
 assert(!resourceAction(s,u,'resource-workshop-term',{workshopId:'../../bad'},'resources').ok);
 assert.equal(JSON.stringify(s),before);
});
test('type/area selection and pagination are session-only and validate malicious IDs',()=>{
 const s=state(),before=JSON.stringify(s),u=newResourceSession();
 assert(resourceAction(s,u,'resource-discovery-area',{resourceArea:'geometry'}).list);
 assert.equal(u.discoveryArea,'geometry');
 assert(resourceAction(s,u,'resource-discovery-type',{resourceType:'lesson'}).list);
 assert.equal(u.discoveryType,'lesson');
 const first=u.discoveryLimit;
 assert(resourceAction(s,u,'resource-discovery-more').list);
 assert.equal(u.discoveryLimit,first+16);
 assert(!resourceAction(s,u,'resource-discovery-area',{resourceArea:'__proto__'}).ok);
 assert(!resourceAction(s,u,'resource-discovery-type',{resourceType:'bad'}).ok);
 assert(resourceAction(s,u,'resource-guides').list);
 assert.equal(u.discoveryType,'guide');
 assert(resourceAction(s,u,'resource-clear').ok);
 assert.equal(u.discoveryArea,'');assert.equal(u.discoveryType,'all');
 assert.equal(JSON.stringify(s),before);
});
test('no matching terms give an honest empty result and no remote request',()=>{
 const result=find('zzzx-no-such-mathematics-319187');
 assert.equal(result.total,0);
 const u=newResourceSession();u.query='zzzx-no-such-mathematics-319187';
 const html=resourceResults(u);
 assert(html.includes('No matching resources.'));
 assert(html.includes('0 matching resources'));
 assert(!/fetch\(|XMLHttpRequest|<iframe/.test(html));
});
