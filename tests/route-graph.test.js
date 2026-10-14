import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateFlow,routesFrom,routeGuard,resolveExplicitAnswer,reachableNodeIds,describeRoute} from "../src/core/route-graph.js";

const nodes=JSON.parse(readFileSync(new URL("../data/flow/nodes.json",import.meta.url),"utf8")).nodes;
const routes=JSON.parse(readFileSync(new URL("../data/flow/routes.json",import.meta.url),"utf8")).routes;
test("full source graph: every node unique and all route endpoints exist",()=>{
 const result=validateFlow(nodes,routes);
 assert.equal(result.valid,true,JSON.stringify(result.problems));
 assert.equal(result.nodeCount,84);assert.equal(result.routeCount,284);
 assert.equal(nodes.filter(x=>x.editorialStatus==="Agreed").length,41);
 assert.equal(nodes.filter(x=>x.editorialStatus==="Working draft").length,42);
 assert.equal(nodes.filter(x=>x.editorialStatus==="Needs discussion").length,1);
});
test("source row and editorial status are preserved per node and route",()=>{
 assert.equal(nodes.find(x=>x.id==="N00").source.row,5);
 assert.equal(routes.find(x=>x.from==="N00"&&x.condition==="Yes").to,"N01");
 assert.equal(describeRoute(routes[0]).semantics,"source-label-not-yet-an-automatic-predicate");
});
test("explicit Yes follows a real route; unmatched free text must not invent navigation",()=>{
 assert.equal(resolveExplicitAnswer(routes,"N00","Yes").route.to,"N01");
 assert.equal(resolveExplicitAnswer(routes,"N00","unexpected creative response").status,"unmatched");
});
test("Both data route cannot join until both branches are genuinely complete",()=>{
 const join=routesFrom(routes,"N03B").find(r=>r.to==="N03J");
 assert.equal(routeGuard(join,{primaryCompleted:true,secondaryCompleted:false}).allowed,false);
 assert.equal(resolveExplicitAnswer(routes,"N03B",join.condition,{primaryCompleted:true,secondaryCompleted:false}).status,"blocked");
 assert.equal(resolveExplicitAnswer(routes,"N03B",join.condition,{primaryCompleted:true,secondaryCompleted:true}).status,"matched");
 const primaryToJoin=routesFrom(routes,"N03P").find(r=>r.to==="N03J");
 assert.equal(routeGuard(primaryToJoin,{dataSource:"both",primaryCompleted:true,secondaryCompleted:false}).allowed,false);
 assert.equal(routeGuard(primaryToJoin,{dataSource:"primary"}).allowed,true);
});
test("post-PMCC route requires actual statistical evidence, not a planned technique",()=>{
 const toPmcc=routesFrom(routes,"C35").find(r=>r.to==="C35P");
 assert(toPmcc);
 assert.equal(routeGuard(toPmcc,{pearsonActuallyCalculated:false,pairedNumericalData:true,scatterObserved:true}).allowed,false);
 assert.equal(routeGuard(toPmcc,{pearsonActuallyCalculated:true,pairedNumericalData:true,scatterObserved:false}).allowed,false);
 assert.equal(routeGuard(toPmcc,{pearsonActuallyCalculated:true,pairedNumericalData:true,scatterObserved:true}).allowed,true);
});
test("diagnostic reachability includes legitimate return cycles without an infinite loop",()=>{
 const reach=reachableNodeIds(routes,"N00");
 assert(reach.includes("N01"));assert(reach.length<=84);
});
test("invalid orphan routes and repeated node IDs are detected",()=>{
 assert.equal(validateFlow([...nodes,nodes[0]],routes).valid,false);
 assert.equal(validateFlow(nodes,[...routes,{from:"N00",to:"MISSING",condition:"Yes"}]).valid,false);
});
