/**
 * Read-only Pass 1 inventory. Does not alter student data or assume that an
 * implemented case is reachable from every journey branch.
 *
 * Usage:
 *   node scripts/audit-screen-inventory.mjs
 *   node scripts/audit-screen-inventory.mjs --json
 *   node scripts/audit-screen-inventory.mjs --write
 */
import {readFileSync,readdirSync,statSync,writeFileSync,mkdirSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {PLANNING_NODE_IDS,LEGACY_DESTINATION} from "../src/planning/engine.js";
import {PLANNING_ROUTES} from "../src/planning/route-table.js";
import {C_NODES,C_ROUTES} from "../src/completing/catalog.js";
import {isStuckNode} from "../src/help/stuck-state.js";
import {REPRESENTATION_TOOLS} from "../src/diagrams/representation-registry.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const normal=pathName=>pathName.split(path.sep).join("/");
const read=filename=>readFileSync(path.join(ROOT,filename),"utf8");
const walk=dirname=>{
 const base=path.join(ROOT,dirname);
 const visit=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>{
  const f=path.join(folder,e.name);
  return e.isDirectory()?visit(f):e.isFile()?[normal(path.relative(ROOT,f))]:[];
 });
 return visit(base).sort();
};
const codeFiles=[...walk("src").filter(x=>x.endsWith(".js")),"app.js"];
const source=new Map(codeFiles.map(filename=>[filename,read(filename)]));
const quotedIdCases=(filename,prefix)=>[...new Set(
 [...read(filename).matchAll(new RegExp('\\bcase\\s+["\\x27]('+prefix+'\\d{2}[A-Z0-9]*)["\\x27]\\s*:','g'))].map(m=>m[1])
)];
const planningCases=new Set(quotedIdCases("src/ui/planning-views.js","N"));
const completingCases=new Set(quotedIdCases("src/completing/views.js","C"));
const normalizedTarget=node=>LEGACY_DESTINATION[node]||node;
function possibleRouteGraph(){
 const queue=["N00"],visited=new Set();
 while(queue.length){
  const node=queue.shift();
  if(visited.has(node))continue;
  visited.add(node);
  for(const edge of PLANNING_ROUTES.filter(r=>r.from===node&&r.to.startsWith("N"))){
   const destination=normalizedTarget(edge.to);
   if(!visited.has(destination))queue.push(destination);
  }
 }
 return visited;
}
const routeGraph=possibleRouteGraph();
// N03P3 is an old import alias without a surviving source-route row.
 // Include every supported legacy identifier, not only route-table nodes.
const planning=[...new Set([...PLANNING_NODE_IDS,...Object.keys(LEGACY_DESTINATION)])].sort().map(id=>({
 id,status:Object.hasOwn(LEGACY_DESTINATION,id)?"redirected-legacy":
  planningCases.has(id)?"implemented-screen":"review-no-direct-case",
 destination:LEGACY_DESTINATION[id]||null,
 inDeclaredRouteGraph:routeGraph.has(id),
 hasRenderer:planningCases.has(id),
 outgoingRoutes:PLANNING_ROUTES.filter(x=>x.from===id).length
}));
const conclusionRedirects=Object.freeze({C61:"C60",C62:"C60",C63:"C60",C64:"C60"});
const completing=C_NODES.map(node=>{
 const id=node.id;
 return {
  id,label:node.label||"",
  status:Object.hasOwn(conclusionRedirects,id)?"redirected-legacy":
   id==="C10E"?"legacy-example-intercept":
   isStuckNode(id)?"support-route":
   completingCases.has(id)?"implemented-screen":"review-no-direct-case",
  destination:conclusionRedirects[id]||null,
  hasRenderer:completingCases.has(id),
  outgoingRoutes:C_ROUTES.filter(x=>x.from===id).length
 };
});
const specifiers=text=>{
 const result=new Set();
 const matcher=/\b(?:from|import)\s*\(?\s*["'](\.[^"']+)["']/g;
 for(const match of text.matchAll(matcher))result.add(match[1]);
 return [...result];
};
const resolveImport=(sourceFile,reference)=>{
 let filename=normal(path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile),reference)));
 if(!path.posix.extname(filename))filename+=".js";
 return filename;
};
const edges=Object.fromEntries([...source].map(([filename,code])=>[
 filename,specifiers(code).map(x=>resolveImport(filename,x))
]));
const missingRelativeImports=Object.entries(edges).flatMap(([from,to])=>
 to.filter(target=>!source.has(target)).map(target=>({from,target}))
);
const reachable=new Set(),pending=["app.js"];
while(pending.length){
 const filename=pending.pop();
 if(reachable.has(filename))continue;
 reachable.add(filename);
 for(const dependency of edges[filename]||[])if(source.has(dependency))pending.push(dependency);
}
const tests=[...walk("tests"),...walk("scripts")].filter(x=>/\.(?:js|mjs)$/.test(x));
const testReferences=new Set(tests.flatMap(filename=>
 specifiers(read(filename)).map(ref=>resolveImport(filename,ref))
));
const candidates=codeFiles.filter(x=>x.startsWith("src/")&&!reachable.has(x)).map(filename=>({
 path:filename,bytes:statSync(path.join(ROOT,filename)).size,
 classification:testReferences.has(filename)?"test-or-script-only-import":"no-static-runtime-import"
})).sort((a,b)=>b.bytes-a.bytes);
const allFiles=[...walk("data"),"styles.css"];
const css=allFiles.filter(f=>f.endsWith(".css"));
const datasets=allFiles.filter(f=>/^data\/(?:catalog|sheets|flow)\/.+\.json$/.test(f));
const bytes=files=>files.reduce((sum,f)=>sum+statSync(path.join(ROOT,f)).size,0);
const assessment=read("src/essentials/assessment-cohorts.js");
const cohort={mode:"revised2029",status:"protected-current-feature",
 verifiedBySource:assessment.includes("REVISED_2029_CRITERIA")&&
  assessment.includes("assessmentFramework")&&read("src/checking/views.js").includes("isRevisedAssessment"),
 location:"Same live Planning/Studio/Checking routes; not a separate disposable page",
 currentDefault:"legacy",preserveStudentReviewRecords:true
};
export function screenInventory(){
 return {
  snapshot:"live-code",generator:"scripts/audit-screen-inventory.mjs",
  entryPoints:["index.html","app.js"],
  navigation:["home","planning","completing","checking","path","report"],
  planning,
  completing,
  diagramGenerators:REPRESENTATION_TOOLS.map(x=>({id:x.id,title:x.title,studio:x.studio,action:x.action})),
  futureCriteria:cohort,
  implementation:{sourceModules:codeFiles.length-1,staticAppModulesReachable:reachable.size-1,
   candidateModulesNotStaticallyReached:candidates,missingRelativeImports},
  assets:{cssFiles:css.length,cssBytes:bytes(css),
   sourceWorkbookSnapshots:datasets.length,sourceWorkbookBytes:bytes(datasets)},
  safeguards:[
   "A static import graph does not prove that a module is dead: examine dynamic and test-only uses.",
   "An implemented renderer does not prove that a student can navigate to it; test individual paths before retirement.",
   "Retired screen IDs need to remain recognized in old JSON, bookmarks and support links.",
   "Assessment cohort revised2029 is live functionality, not a legacy IA page.",
   "All original workbook source snapshots are protected provenance until a separate deployment audit."
  ]
 };
}
const counts=(items,key)=>Object.fromEntries([...new Set(items.map(x=>x[key]))].sort()
 .map(status=>[status,items.filter(x=>x[key]===status).length]));
const escape=x=>String(x??"").replace(/\|/g,"\\|").replace(/[\r\n]+/g," ");
const line=cols=>"| "+cols.map(escape).join(" | ")+" |";
export function inventoryMarkdown(data=screenInventory()){
 const p=data.planning,c=data.completing,imp=data.implementation,assets=data.assets;
 const out=[
 "# IA Pathfinder — Pass 1 screen and dependency inventory",
 "",
 "Generated from the live source tables and rendering code. This is a conservative static audit: it is not a substitute for browser journey tests.",
 "",
 "## Top-level navigation and generator studios",
 "",
 "Routes: "+data.navigation.join(", ")+". The one physical HTML page mounts the application; individual screens are JavaScript-rendered.",
 "",
 line(["Generator","Live tool ID","Project-state key"]),
 line(["---","---","---"]),
 ...data.diagramGenerators.map(t=>line([t.title,t.id,t.studio])),
 "",
 "## Planning source nodes",
 "",
 "Categories: "+JSON.stringify(counts(p,"status"))+". The 'route graph' column is a coarse static reachability indicator; it does not execute conditional student choices.",
 "",
 line(["Node","Classification","Redirect","Has render case","In stored route graph"]),
 line(["---","---","---","---","---"]),
 ...p.map(n=>line([n.id,n.status,n.destination||"—",n.hasRenderer?"yes":"no",n.inDeclaredRouteGraph?"yes":"no"])),
 "",
 "## IA Studio / Completing source nodes",
 "",
 "Categories: "+JSON.stringify(counts(c,"status"))+". C10E is intercepted by the shared Examples viewer. C95* nodes are the contextual help route. C61–C64 redirect to the unified C60 conclusion.",
 "",
 line(["Node","Source label","Classification","Redirect","Has render case"]),
 line(["---","---","---","---","---"]),
 ...c.map(n=>line([n.id,n.label,n.status,n.destination||"—",n.hasRenderer?"yes":"no"])),
 "",
 "## Assessment cohort protection",
 "",
 "The live revised2029 mode is selected in the Planning course screen and switches assessment guidance in place. Keep the A–E default, the 2029 A–D overview, saved historical criterion decisions, and cohort-switch tests. This is not a separate old page.",
 "",
 "## Runtime source dependencies (conservative)",
 "",
 "Entry: app.js. Statically reachable source modules: "+imp.staticAppModulesReachable+" of "+imp.sourceModules+". Candidates with no static import from the app: "+imp.candidateModulesNotStaticallyReached.length+".",
 "",
 line(["File","Bytes","Classification"]),
 line(["---","---","---"]),
 ...imp.candidateModulesNotStaticallyReached.map(x=>line([x.path,x.bytes,x.classification])),
 "",
 "Missing locally resolved relative JS imports: "+imp.missingRelativeImports.length+".",
 ...imp.missingRelativeImports.map(x=>"- "+x.from+" → "+x.target),
 "",
 "## Deployment-relevant assets (nothing removed in Pass 1)",
 "",
 "- CSS: "+assets.cssFiles+" files, "+assets.cssBytes+" bytes, loaded via index.html.",
 "- Original source workbook snapshots: "+assets.sourceWorkbookSnapshots+" JSON files, "+assets.sourceWorkbookBytes+" bytes, preserved for provenance and tests. The build currently copies data/ as a whole.",
 "",
 "## Safety notes",
 "",
 ...data.safeguards.map(x=>"- "+x),
 "",
 "No deletion is authorised by this report. Pass 2 must resolve each candidate's imports, entry points, tests, saved-project references and 2029 assessment use before changing it.",
 ""
 ];
 return out.join("\n");
}
const called=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(called){
 const report=screenInventory();
 if(process.argv.includes("--write")){
  const directory=path.join(ROOT,"docs","generated");
  mkdirSync(directory,{recursive:true});
  writeFileSync(path.join(directory,"pass1-screen-inventory.md"),inventoryMarkdown(report));
  writeFileSync(path.join(directory,"pass1-screen-inventory.json"),JSON.stringify(report,null,2)+"\n");
  process.stdout.write("Wrote generated Pass 1 inventory files in docs/generated/\n");
 }else if(process.argv.includes("--json")){
  process.stdout.write(JSON.stringify(report,null,2)+"\n");
 }else process.stdout.write(inventoryMarkdown(report));
 if(report.implementation.missingRelativeImports.length)process.exitCode=1;
}
