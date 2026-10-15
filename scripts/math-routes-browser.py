"""Check six productive mathematical routes, decisions, visibility and mobile advice control."""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(parents=True,exist_ok=True)
KEY="ia-pathfinder-prototype-v1"
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e", """
import {createProjectState} from './src/core/project-state.js';
const s=createProjectState();s.route='completing';
s.planning.fields.aim='What does this mathematical relationship tell me?';
s.planning.fields.kind='statistics';s.planning.fields.course='AA SL';
console.log(JSON.stringify(s));
"""],text=True))
results=[]
def own(p):
 return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def fixture(family,mode="guided"):
 s=copy.deepcopy(BASE);s["ui"]["adviceMode"]=mode
 graph={"id":"scatter","phase":"first","kind":"scatter","title":"Observed scatter","status":"completed",
  "result":"I plotted paired numerical observations","observation":"linear",
  "localTakeaway":"An actual approximately straight pattern"}
 if family in ["pmcc","model"]:
  method="pmcc" if family=="pmcc" else "linear-regression"
  item={"id":"calculation","phase":"substantial","kind":"model","fromEntryId":"scatter","title":"Mathematical calculation",
   "status":"completed","methodId":method,"technique":method,"purpose":"Investigate the observed association",
   "result":"I computed the actual coefficient/model","resultSignal":""}
  s["entries"]=[graph,item];s["completion"]["activeEntryIndex"]=1
  s["completion"]["nextFromEntryId"]="calculation"
  s["completion"]["current"]="C40"
 elif family=="scatter":
  s["entries"]=[graph];s["completion"]["activeEntryIndex"]=0;s["completion"]["nextFromEntryId"]="scatter"
  s["completion"]["current"]="C34"
 elif family=="bivariate":
  graph["observation"]="linear"
  s["entries"]=[graph];s["completion"]["activeEntryIndex"]=0;s["completion"]["nextFromEntryId"]="scatter"
  s["completion"]["current"]="C35B"
 elif family=="optimisation":
  s["entries"]=[{"id":"opt","phase":"substantial","kind":"model","methodId":"optimisation","technique":"Optimisation by differentiation",
   "title":"Find optimum","purpose":"Determine the best feasible option",
   "status":"completed","result":"I calculated a stationary point","resultSignal":""}]
  s["completion"]["activeEntryIndex"]=0;s["completion"]["nextFromEntryId"]="opt"
  s["completion"]["current"]="C40"
 elif family=="proof":
  s["entries"]=[{"id":"cases","phase":"first","kind":"theory","methodId":"other","technique":"Numerical cases",
   "title":"Test cases","purpose":"Investigate a conjecture","status":"completed","result":"Values n=1,2,3,4 agree","resultSignal":""}]
  s["completion"]["activeEntryIndex"]=0;s["completion"]["nextFromEntryId"]="cases"
  s["completion"]["current"]="C34"
 else:
  raise Exception("Unknown fixture")
 return s

def choose(p,path,value):
 p.locator('[data-choice="'+path+'"][data-value="'+value+'"]').click()
def run_case(p,family,width):
 assert p.locator('[data-action="toggle-advice-mode"]').is_visible()
 state=own(p)
 if family=="scatter":
  assert p.locator('.route-coach').is_visible()
  choose(p,"entries.0.observation","curved")
  assert "A curved pattern" in p.locator('.route-coach').inner_text()
  assert own(p)["completion"]["fields"]["scatterPattern"]=="curved"
 elif family=="bivariate":
  choose(p,"completion.fields.pairedDataType","paired-numerical")
  assert p.locator('[data-bind="completion.fields.scatterDetail"]').is_visible()
  p.locator('[data-bind="completion.fields.scatterDetail"]').select_option("monotonic")
  saved=own(p);assert saved["completion"]["fields"]["scatterPattern"]=="curved"
  assert saved["entries"][0]["observation"]=="curved"
  assert "A curved pattern" in p.locator(".route-coach").inner_text()
  assert p.locator('[data-action="completion-route"][data-condition="Curved or distinctly non-linear"]').is_visible()
 elif family=="pmcc":
  assert "Interpret the sign" in p.locator(".route-coach").inner_text()
  choose(p,"entries.1.resultSignal","weak-linear")
  s=own(p)
  assert s["entries"][1]["resultSignal"]=="weak-linear"
  assert s["completion"]["fields"]["pmccSignal"]=="weak-linear"
  assert "nonlinear" in p.locator(".route-coach").inner_text().lower() or "weak linear" in p.locator(".route-coach").inner_text().lower()
  p.locator('[data-action="completion-open"][data-node="C04"]').first.click()
  assert own(p)["entries"][1]["result"].startswith("I computed")
 elif family=="model":
  assert "gradient" in p.locator(".route-coach").inner_text().lower()
  assert "intercept" in p.locator(".route-coach").inner_text().lower()
  choose(p,"entries.1.resultSignal","poor-fit")
  assert "inadequate" in p.locator(".route-coach").inner_text().lower()
  s=own(p)
  s["completion"]["current"]="C35"
  p.evaluate("([k,value])=>localStorage.setItem(k,JSON.stringify(value))",[KEY,s])
  p.reload(wait_until="networkidle")
  assert p.locator('[data-action="route-coach-next"]').count()==2
  p.locator('[data-action="route-coach-next"]').first.click()
  assert own(p)["completion"]["fields"]["nextQuestion"]
  assert own(p)["entries"][1]["result"]=="I computed the actual coefficient/model"
 elif family=="optimisation":
  assert "endpoints" in p.locator(".route-coach").inner_text().lower()
  choose(p,"entries.0.resultSignal","not-feasible")
  assert "not feasible" in p.locator(".route-coach").inner_text().lower()
  assert own(p)["entries"][0]["resultSignal"]=="not-feasible"
 elif family=="proof":
  assert "conjecture" in p.locator(".route-coach").inner_text().lower()
  choose(p,"entries.0.resultSignal","pattern-only")
  assert "not yet a proof" in p.locator(".route-coach").inner_text().lower()
  choose(p,"entries.0.resultSignal","counterexample")
  assert "counterexample" in p.locator(".route-coach").inner_text().lower()
  assert own(p)["entries"][0]["resultSignal"]=="counterexample"
 if family in ["model","optimisation","proof","scatter","bivariate"]:
  p.locator('[data-action="toggle-advice-mode"]').first.click()
  assert own(p)["ui"]["adviceMode"]=="reduced"
  assert p.locator(".advice-mode-toggle").get_attribute("aria-pressed")=="true"
  assert p.locator(".route-coach-compact").is_visible()
  assert p.locator(".guidance-optional").count()==0
  if family in ["optimisation","proof"]:
   assert p.locator('[data-bind$=".resultSignal"]').is_visible()
  p.reload(wait_until="networkidle")
  assert p.locator(".advice-mode-toggle").get_attribute("aria-pressed")=="true"
  assert p.locator(".route-coach-compact").is_visible()
  p.locator('[data-action="toggle-advice-mode"]').first.click()
  assert own(p)["ui"]["adviceMode"]=="guided"
 assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 p.screenshot(path=str(OUT/("math-route-"+family+"-"+str(width)+".png")),full_page=True)

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1440,960),(390,844)]:
  for family in ["scatter","bivariate","pmcc","model","optimisation","proof"]:
   label=family+"-"+str(width)
   context=browser.new_context(viewport={"width":width,"height":height})
   context.route("https://fonts.googleapis.com/**",lambda r:r.abort())
   p=context.new_page();p.set_default_timeout(9000);errors=[]
   p.on("pageerror",lambda err:errors.append(str(err)))
   raw=fixture(family)
   p.add_init_script("localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(raw))+");")
   try:
    p.goto(URL,wait_until="networkidle")
    run_case(p,family,width)
    assert not errors,errors
    results.append({"scenario":family,"viewport":width,"status":"passed"})
   except Exception as err:
    traceback.print_exc()
    results.append({"scenario":family,"viewport":width,"status":"FAILED","error":str(err),"pageErrors":errors})
    p.screenshot(path=str(OUT/("math-route-"+label+"-failure.png")),full_page=True)
   context.close()
 browser.close()
(OUT/"math-route-browser-results.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert all(x["status"]=="passed" for x in results)
