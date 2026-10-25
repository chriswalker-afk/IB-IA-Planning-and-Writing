import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {resourceDrawer,resourceList} from '../src/resources/views.js';
import {resourceAction} from '../src/resources/actions.js';
import {newResourceSession} from '../src/resources/state.js';

test('Pass 1 resource hub: four consistent destinations with non-duplicated MLA and no empty stage placeholder',()=>{
 const s=createProjectState();s.route='planning';s.planning.current='N01';
 const before=JSON.stringify(s),u=newResourceSession(),html=resourceDrawer(s,u);
 assert.equal((html.match(/class="resource-destination-card"/g)||[]).length,3);
 for(const name of ['Learn the maths','Use software','Create a figure','Reference my sources'])assert(html.includes(name),name);
 assert(html.includes('data-resource-creators-featured="true"'));
 assert(html.includes('data-action="resource-open" data-resource-id="mla-citations"'));
 assert.equal((html.match(/Open MLA referencing guide/g)||[]).length,1);
 assert(!html.includes('Your current stage'));
 assert(html.indexOf('resource-home-navigation')<html.indexOf('resource-home-guides'));
 assert.equal(JSON.stringify(s),before);
});
test('Pass 1 resource hub: software destination does not change student state and retains filters',()=>{
 const s=createProjectState(),u=newResourceSession(),before=JSON.stringify(s);
 assert.deepEqual(resourceAction(s,u,'resource-guides'),{ok:true,guides:true});
 assert.equal(u.mode,'tools');
 assert(resourceDrawer(s,u).includes('resource-advanced-filters'));
 assert.equal(JSON.stringify(s),before);
});
test('Pass 1 resource hub: group guide rows by task, preserve total, filtering and pagination',()=>{
 const s=createProjectState(),u=newResourceSession();
 const html=resourceDrawer(s,u);
 assert(html.includes('36 matching guides'));
 assert.equal((html.split('<div id="resource-results">')[1].match(/class="resource-row"/g)||[]).length,8);
 assert(html.includes('Browse tutorial guides'));
 u.limit=36;const all=resourceList(u);
 for(const title of ['Collect and organise data','Explore relationships and models'])assert(all.includes(title),title);
 u.query='PMCC';assert(resourceList(u).includes('PMCC'));
 u.category='Correlation and models';assert(resourceList(u).includes('Explore relationships and models'));
});
test('Pass 1 resource hub: contextual resources remain optional and the complete creators stay reachable',()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C40';
 s.entries=[{id:'a',methodId:'pmcc',phase:'substantial',status:'planned',result:'',knowledge:'syllabus',sourceRefs:[],accuracyRefs:[]}];s.completion.activeEntryIndex=0;
 const html=resourceDrawer(s,newResourceSession());
 assert(html.includes('resource-home-relevant'));
 assert(html.includes('data-resource-id="sheets-pmcc"'));
 for(const id of ['graph','stat','table','trace','voronoi','geometry','probability'])assert(html.includes('data-resource-creator="'+id+'"'),id);
});
