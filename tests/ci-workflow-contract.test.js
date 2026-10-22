import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {join} from "node:path";

const directory=".github/workflows";
const workflows=new Map(readdirSync(directory).filter(name=>name.endsWith(".yml"))
 .map(name=>[name,readFileSync(join(directory,name),"utf8")]));
const nodeAction=readFileSync(".github/actions/setup-ci-node/action.yml","utf8");
const browserAction=readFileSync(".github/actions/setup-ci-browser/action.yml","utf8");
const nonBrowser=new Set(["foundation-tests.yml","deploy-pages.yml"]);

test("one always-on validation job runs unit tests and build on PR and main",()=>{
 const text=workflows.get("foundation-tests.yml");
 assert.match(text,/pull_request:\n    branches: \[main\]/);
 assert.match(text,/push:\n    branches: \[main\]/);
 assert.doesNotMatch(text,/pull_request:\n    branches: \[main\]\n    paths:/);
 assert.match(text,/run: npm test/);
 assert.match(text,/run: npm run build/);
 assert.match(text,/uses: \.\/\.github\/actions\/setup-ci-node/);
});

test("production deployment retains its independent validation, permissions and cancellation",()=>{
 const text=workflows.get("deploy-pages.yml");
 assert.match(text,/npm test/);
 assert.match(text,/npm run build/);
 assert.match(text,/pages: write/);
 assert.match(text,/id-token: write/);
 assert.match(text,/group: ia-pathfinder-pages/);
 assert.match(text,/cancel-in-progress: true/);
 assert.match(text,/uses: \.\/\.github\/actions\/setup-ci-node/);
 assert.match(text,/actions\/deploy-pages@v4/);
});

test("all browser workflows share pinned cached setup without duplicating full unit tests",()=>{
 assert.equal(workflows.size,26,"Check the complete known workflow inventory");
 for(const [name,content] of workflows){
  if(nonBrowser.has(name))continue;
  assert.match(content,/uses: \.\/\.github\/actions\/setup-ci-node/,name);
  assert.match(content,/uses: \.\/\.github\/actions\/setup-ci-browser/,name);
  assert.doesNotMatch(content,/\bnpm test\b/,name);
  assert.doesNotMatch(content,/pip install playwright/,name);
  assert.match(content,/npm run build/,name);
  assert.match(content,/cancel-in-progress: true/,name);
  if(content.includes("pull_request:")){
   assert.match(content,/pull_request:\n    branches: \[main\]\n    paths:/,name);
  }
 }
 assert.match(nodeAction,/actions\/cache@v4/);
 assert.match(nodeAction,/hashFiles\('package\.json'\)/);
 assert.match(nodeAction,/npm install --no-audit --no-fund/);
 assert.match(browserAction,/actions\/cache@v4/);
 assert.match(browserAction,/playwright==1\.57\.0/);
 assert.match(browserAction,/pypdf==5\.9\.0/);
 assert.match(browserAction,/playwright install --with-deps chromium/);
});

test("superseded checks are cancelled within their own workflow, event and PR or branch",()=>{
 for(const [name,content] of workflows){
  if(name==="deploy-pages.yml")continue;
  assert.match(content,/group: \$\{\{ github\.workflow \}\}-\$\{\{ github\.event_name \}\}-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/,name);
  assert.match(content,/cancel-in-progress: true/,name);
 }
});

test("heavy browser PR checks are relevant-path gated and retain shared action change coverage",()=>{
 for(const name of ["conformance-browser","graph-studio-browser","image-tracer-browser",
  "native-data-browser","presentation-coach-browser","stat-studio-browser",
  "table-studio-browser","voronoi-interactive-browser","report-exports","cleanup-pass5-browser"]){
  const content=workflows.get(name+".yml");
  assert.match(content,/pull_request:\n    branches: \[main\]\n    paths:/,name);
  assert.match(content,/\.github\/actions\/setup-ci-node\/action\.yml/,name);
  assert.match(content,/\.github\/actions\/setup-ci-browser\/action\.yml/,name);
 }
 const graph=workflows.get("graph-studio-browser.yml");
 assert.doesNotMatch(graph,/src\/diagrams\/\*\*/, "Graph should not run on any diagram change");
 assert.match(graph,/src\/diagrams\/graph-\*\*/, "Graph suite should still watch its own family");
});

test("production packaging changes get parallel desktop/phone browser coverage",()=>{
 const built=workflows.get("pass3-build-browser.yml");
 assert.match(built,/scripts\/build-styles\.mjs/);
 assert.match(built,/scripts\/audit-deploy-assets\.mjs/);
 assert.match(built,/representation-pass5/);
 assert.match(built,/report-exports/);
 assert.match(built,/chapter-onboarding/);
 assert.match(built,/criteria-badges/);
 assert.match(built,/graph-studio/);
 assert.match(built,/stat-studio/);
 assert.match(built,/audit-deploy-assets\.mjs/);
 assert.match(built,/fail-fast: false/);
});

test("report checks retain live post-deployment verification",()=>{
 const report=workflows.get("report-exports.yml");
 assert.match(report,/workflow_run:/);
 assert.match(report,/workflow_run\.conclusion == 'success'/);
 assert.match(report,/workflow_run\.head_sha \|\| github\.sha/);
 assert.match(report,/scripts\/report-exports-browser\.py --live/);
});

test("final cleanup acceptance is split by capability and preserves real browser evidence",()=>{
 const content=workflows.get("cleanup-pass5-browser.yml");
 assert(content,"Pass 5 workflow required");
 assert.match(content,/group: \[journeys, data-diagrams, geometry-probability, cohorts, exports\]/);
 assert.match(content,/fail-fast: false/);
 assert.match(content,/upload-artifact@v4/);
 assert.match(content,/scripts\/cleanup-pass5-browser\.py/);
 assert.match(content,/scripts\/report-exports-browser\.py/);
 assert.match(content,/scripts\/criteria-badges-browser\.py/);
 assert.match(content,/scripts\/probability-tree-browser\.py/);
 assert.match(content,/scripts\/mixed-math-browser\.py/);
 assert.match(content,/status=0/);
 assert.match(content,/\|\| status=1/);
});
