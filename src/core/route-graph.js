/**
 * Graph engine: source route conditions remain text until intentionally mapped
 * to tested predicates. Exact answers may be matched; unknown conditions cannot
 * be inferred, and joins are guarded.
 */
const clean=x=>String(x??"").trim().replace(/\s+/g," ").toLocaleLowerCase("en");
export function validateFlow(nodes,routes){
  const problems=[];
  const ids=new Set();
  for(const n of nodes) {
    if(!/^[NC]\d{2}[A-Z0-9]*$/.test(n.id)) problems.push("Invalid node ID: "+n.id);
    if(ids.has(n.id))problems.push("Duplicate node ID: "+n.id);
    ids.add(n.id);
  }
  for(const r of routes){
    if(!ids.has(r.from))problems.push("Missing origin "+r.from+" (row "+r.source?.row+")");
    if(!ids.has(r.to))problems.push("Missing destination "+r.to+" (row "+r.source?.row+")");
    if(!r.condition?.trim())problems.push("Empty condition from "+r.from);
  }
  return {valid:problems.length===0,problems,nodeCount:nodes.length,routeCount:routes.length};
}
export function routesFrom(routes,from){return routes.filter(r=>r.from===from);}
export function routeGuard(route,context={}){
  // An explicit selected answer is NOT evidence that two required branches were completed.
  if(route.from==="N03B" && route.to==="N03J" && !(context.primaryCompleted===true && context.secondaryCompleted===true))
    return {allowed:false,reason:"Both primary and secondary question sets must be confirmed complete."};
  if(["N03P","N03S"].includes(route.from)&&route.to==="N03J"&&context.dataSource==="both"&&!(context.primaryCompleted===true&&context.secondaryCompleted===true))
    return {allowed:false,reason:"Do not leave the Both route until both branches are complete."};
  if(route.from==="C35"&&route.to==="C35P" &&
    !(context.pearsonActuallyCalculated===true&&context.pairedNumericalData===true&&context.scatterObserved===true))
    return {allowed:false,reason:"PMCC advice needs an actual coefficient, paired data and an observed scatter."};
  return {allowed:true,reason:null};
}
/**
 * Matching here confirms only that the user's explicit choice maps to an
 * existing route, NOT that the full editorial condition has been adjudicated.
 */
export function resolveExplicitAnswer(routes,from,answer,context={}){
  const matches=routesFrom(routes,from).filter(r=>clean(r.condition)===clean(answer));
  if(!matches.length)return {status:"unmatched",candidates:routesFrom(routes,from)};
  if(matches.length!==1)return {status:"ambiguous",candidates:matches};
  const route=matches[0],guard=routeGuard(route,context);
  if(!guard.allowed)return {status:"blocked",route,reason:guard.reason};
  return {status:"matched",route};
}
/** Routes phrased as policy, student findings or editorial prose require dedicated predicates. */
export function describeRoute(route){
  return {from:route.from,to:route.to,choice:route.condition,
    sourceRow:route.source?.row??null,
    semantics:"source-label-not-yet-an-automatic-predicate"};
}
export function reachableNodeIds(routes,start,max=500){
  const visited=new Set([start]);const queue=[start];
  while(queue.length&&visited.size<max){
    const node=queue.shift();
    for(const r of routesFrom(routes,node)){
      if(!visited.has(r.to)){visited.add(r.to);queue.push(r.to)}
    }
  }
  return [...visited];
}
export async function loadFlowGraph(baseUrl=new URL("../../data/flow/",import.meta.url)){
  const [nodes,routes]=await Promise.all(["nodes.json","routes.json"].map(async file=>{
    const response=await fetch(new URL(file,baseUrl));
    if(!response.ok)throw new Error("Unable to load "+file+": "+response.status);
    return response.json();
  }));
  const validation=validateFlow(nodes.nodes,routes.routes);
  if(!validation.valid)throw new Error("Invalid flowchart: "+validation.problems.join("; "));
  return {nodes:nodes.nodes,routes:routes.routes,validation};
}
