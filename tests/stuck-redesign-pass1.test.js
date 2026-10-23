import test from 'node:test';
import assert from 'node:assert/strict';
import {STUCK_TOPICS} from '../src/help/stuck-catalog.js';
import {INVESTIGATIVE_ROUTES} from '../src/planning/investigative-routes.js';
import {REPRESENTATION_TOOLS} from '../src/diagrams/representation-registry.js';
import {RESOURCES} from '../src/resources/catalog.js';
import {PLANNING_NODE_IDS} from '../src/planning/engine.js';
import {C_NODE_IDS} from '../src/completing/engine.js';
import {
 SUPPORT_FAMILIES,SUPPORT_FACTS,SUPPORT_LEGACY_AUDIT,SUPPORT_NEW_INTENTS,
 SUPPORT_PLACEMENTS,SUPPORT_JOURNEY_OVERLAYS,SUPPORT_SELECTION_POLICY
} from '../src/help/contextual-support-plan.js';

test('pass1 audits all durable help topic IDs with no change to existing saved IDs',()=>{
 assert.deepEqual([...SUPPORT_LEGACY_AUDIT.map(x=>x.id)].sort(),
                   [...STUCK_TOPICS.map(x=>x.id)].sort());
 assert.equal(SUPPORT_LEGACY_AUDIT.length,24);
 assert.equal(new Set(SUPPORT_LEGACY_AUDIT.map(x=>x.id)).size,24);
});
test('pass1 defines 16 route overlays against actual maintained mathematical routes',()=>{
 assert.deepEqual([...SUPPORT_JOURNEY_OVERLAYS.map(x=>x.routeId)].sort(),
                   [...INVESTIGATIVE_ROUTES.map(x=>x.id)].sort());
 for(const item of SUPPORT_JOURNEY_OVERLAYS){
   assert(item.focus&&item.question&&item.boundary);
   assert(item.toolIds.every(id=>REPRESENTATION_TOOLS.some(t=>t.id===id)));
 }
});
test('all pass1 help intents have a category and candidate placements resolve',()=>{
 const families=new Set(SUPPORT_FAMILIES.map(x=>x.id));
 const ids=new Set([...STUCK_TOPICS.map(x=>x.id),...SUPPORT_NEW_INTENTS.map(x=>x.id)]);
 assert.equal(SUPPORT_NEW_INTENTS.length,28);
 assert.equal(SUPPORT_PLACEMENTS.length,57);
 assert.equal(ids.size,52);
 for(const intent of SUPPORT_NEW_INTENTS){
   assert(families.has(intent.family));
   assert([2,3,4].includes(intent.pass));
   assert(intent.need);
 }
 const resources=new Set(RESOURCES.map(x=>x.id));
 const tools=new Set(REPRESENTATION_TOOLS.map(x=>x.id));
 const placements=new Set();
 for(const p of SUPPORT_PLACEMENTS){
   assert(!placements.has(p.id),p.id);placements.add(p.id);
   assert(families.has(p.family),p.id);
   assert(['planning','completing','checking','hub'].includes(p.route),p.id);
   assert(p.intents.length&&p.intents.every(id=>ids.has(id)),p.id);
   assert(p.facts.every(id=>Object.hasOwn(SUPPORT_FACTS,id)),p.id);
   assert(p.nodes.every(n=>p.route==='planning'?PLANNING_NODE_IDS.includes(n):C_NODE_IDS.includes(n)),p.id);
   assert(p.resourceIds.every(id=>resources.has(id)),p.id);
   assert(p.toolIds.every(id=>tools.has(id)),p.id);
   if(p.destination.kind==='stage')assert(
     p.destination.route==='planning'?PLANNING_NODE_IDS.includes(p.destination.node):
     p.destination.route==='completing'&&C_NODE_IDS.includes(p.destination.node),p.id);
   if(p.destination.kind==='resource')assert(resources.has(p.destination.id),p.id);
 }
});
test('pass1 remains offers-only and retains access when advice is reduced',()=>{
 assert.equal(SUPPORT_SELECTION_POLICY.maxBubblesPerAnchor,1);
 assert.equal(SUPPORT_SELECTION_POLICY.maxPopinProblems,3);
 assert.equal(SUPPORT_SELECTION_POLICY.automaticPopups,false);
 assert.equal(SUPPORT_SELECTION_POLICY.reducedAdviceKeepsAccess,true);
 assert.equal(SUPPORT_SELECTION_POLICY.readOnlyUntilExplicitAction,true);
});
