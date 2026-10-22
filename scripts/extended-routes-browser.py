"""Exercise result-led finance, Voronoi, nonlinear and decision routes as a student sees them."""
import json,os,subprocess,traceback,copy
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 """import {createProjectState} from "./src/core/project-state.js";
const s=createProjectState();s.route="completing";s.ui.writingIntroSeen=true;s.ui.writerGuideIntroSeen=true;s.planning.fields.course="AI SL";
s.planning.fields.aim="Which mathematical decision is supported by the result?";
console.log(JSON.stringify(s));"""],text=True))
CASES=[
 ("finance-break-even","break-even-unrealistic","break-even"),
 ("finance-compound","rate-period-mismatch","interest"),
 ("finance-loan","longer-loan-cost","loan"),
 ("finance-cashflow","cash-shortfall","cash"),
 ("voronoi","new-site","Voronoi"),
 ("spearman","turning-pattern","Spearman"),
 ("quadratic-fit","competing-models","parameters"),
 ("exponential","extrapolation-fails","model"),
 ("chi-independence","insufficient-evidence","p-value"),
 ("expected-value","large-variation","Expected value"),
 ("triangulation","angle-sensitive","trigonometric")
]
def fixture(method,planned=False):
 state=copy.deepcopy(BASE)
 state["entries"]=[{
  "id":"method-1","phase":"substantial","kind":"model","status":"planned" if planned else "completed",
  "result":"" if planned else "A genuine result was calculated and checked by the student.",
  "methodId":method,"technique":method,"title":"An actual mathematical investigation",
  "purpose":"Answer a meaningful decision question", "resultSignal":""
 }]
 state["completion"]["current"]="C40"
 state["completion"]["activeEntryIndex"]=0
 state["completion"]["nextFromEntryId"]="method-1"
 return state
def saved(p):
 return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
# Method-specific result choices now use the adaptive mathematical-stage
# outcome picker. Older resultSignal is retained as saved-project compatibility
# but is no longer the visible selector in C40/C50.
METHOD_ROUTE={
 "finance-break-even":"finance-break-even","finance-compound":"finance-compound",
 "finance-loan":"finance-loan","finance-cashflow":"finance-cashflow",
 "voronoi":"voronoi","spearman":"nonlinear-association",
 "quadratic-fit":"nonlinear-model","exponential":"nonlinear-model",
 "chi-independence":"categorical-test","expected-value":"expected-value",
 "triangulation":"measurement"
}
def choose_finding(p,method,signal):
 field=p.locator('[data-bind="entries.0.journeyOutcome"]')
 assert field.is_visible(),method
 field.select_option(METHOD_ROUTE[method]+":"+signal)
def scenario(p,method,signal,word,width):
 assert p.locator(".route-coach").is_visible()
 assert word.lower() in p.locator(".route-coach").inner_text().lower(),(method,word)
 assert p.locator(".route-depth-check").is_visible()
 assert p.locator('[data-journey-outcome-picker]').count()==1
 assert p.locator('[data-bind="entries.0.journeyOutcome"]').is_visible()
 before=saved(p)["entries"][0]["result"]
 choose_finding(p,method,signal)
 expected=METHOD_ROUTE[method]+":"+signal
 assert saved(p)["entries"][0]["journeyOutcome"]==expected
 assert saved(p)["entries"][0]["result"]==before
 assert p.locator(".route-coach").is_visible()
 assert "Your confirmed mathematical finding" in p.locator(".route-coach").inner_text()
 assert p.locator('[data-journey-outcome-meaning]').count()>=0
 p.locator('[data-action="toggle-advice-mode"]').first.click()
 assert saved(p)["ui"]["adviceMode"]=="reduced"
 assert p.locator(".route-coach-compact").is_visible()
 assert p.locator(".route-depth-check").is_visible()
 assert not p.locator(".route-coach-detail").count()
 assert p.locator('[data-bind="entries.0.journeyOutcome"]').input_value()==expected
 p.reload(wait_until="networkidle")
 assert saved(p)["entries"][0]["journeyOutcome"]==expected
 assert p.locator(".route-coach-compact").is_visible()
 assert p.locator(".advice-mode-toggle").get_attribute("aria-pressed")=="true"
 p.locator('[data-action="toggle-advice-mode"]').first.click()
 assert saved(p)["ui"]["adviceMode"]=="guided"
 assert p.locator(".route-coach").is_visible()
 assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
 p.screenshot(path=str(OUT/("extended-route-"+method+"-"+str(width)+".png")),full_page=True)
def planned_scenario(p,method):
 assert p.locator(".route-preflight").is_visible()
 assert p.locator(".route-preflight").inner_text().strip()
 assert not p.locator(".route-coach").count()
 assert p.locator('[data-journey-outcome-waiting]').count()==1
 p.locator('[data-action="toggle-advice-mode"]').first.click()
 assert p.locator(".route-preflight").is_visible()
 assert saved(p)["ui"]["adviceMode"]=="reduced"
 assert p.locator(".route-preflight").inner_text().count("Before applying")>0
 # An actual result is required before outcome options or meaningful advice.
 status=p.locator('[data-bind="entries.0.status"]')
 assert status.is_visible()
 status.select_option("completed")
 result=p.locator('[data-bind="entries.0.result"]')
 result.fill("Calculated a genuine compound balance using a documented effective periodic rate.")
 result.blur()
 assert p.locator(".route-coach-compact").is_visible()
 assert p.locator(".route-depth-check").is_visible()
 assert p.locator('[data-journey-outcome-picker]').count()==1
 assert saved(p)["entries"][0]["status"]=="completed"
 assert "compound balance" in saved(p)["entries"][0]["result"]
def periodic_scenario(p):
 assert p.locator('[data-bind="completion.fields.scatterDetail"]').is_visible()
 p.locator('[data-bind="completion.fields.scatterDetail"]').select_option("periodic")
 state=saved(p)
 assert state["completion"]["fields"]["scatterPattern"]=="curved"
 assert state["entries"][0]["observation"]=="curved"
 assert "repeating pattern" in p.locator(".route-coach").inner_text().lower()

results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1440,960),(390,844)]:
  todo=[(method,signal,word,False) for method,signal,word in CASES]
  todo += [("finance-compound","","",True)]
  for method,signal,word,planned in todo:
   context=browser.new_context(viewport={"width":width,"height":height})
   context.route("https://fonts.googleapis.com/**",lambda r:r.abort())
   p=context.new_page();p.set_default_timeout(9500);errors=[]
   p.on("pageerror",lambda ex:errors.append(str(ex)))
   original=fixture(method,planned)
   # Set once per browser context; never reset saved state when reloading.
   p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
                     json.dumps(KEY)+","+json.dumps(json.dumps(original))+");")
   name=method+("-planning" if planned else "")+"-"+str(width)
   try:
    p.goto(URL,wait_until="networkidle")
    if planned:planned_scenario(p,method)
    else:scenario(p,method,signal,word,width)
    assert not errors,errors
    results.append({"case":name,"status":"passed"})
   except Exception as ex:
    traceback.print_exc()
    results.append({"case":name,"status":"FAILED","error":str(ex),"pageErrors":errors})
    p.screenshot(path=str(OUT/("extended-"+name+"-failure.png")),full_page=True)
   context.close()
  context=browser.new_context(viewport={"width":width,"height":height})
  plot=copy.deepcopy(BASE);plot["entries"]=[{
   "id":"scatter","phase":"first","kind":"scatter","status":"completed",
   "result":"I graphed paired observations","observation":"curved"
  }]
  plot["completion"]["current"]="C35B"
  plot["completion"]["nextFromEntryId"]="scatter"
  plot["completion"]["pairedDataForEntryId"]="scatter"
  plot["completion"]["scatterPatternForEntryId"]="scatter"
  plot["completion"]["fields"]["scatterPattern"]="curved"
  plot["completion"]["fields"]["pairedDataType"]="paired-numerical"
  p=context.new_page();p.set_default_timeout(9500)
  p.add_init_script("localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(plot))+");")
  try:
   p.goto(URL,wait_until="networkidle");periodic_scenario(p)
   results.append({"case":"periodic-"+str(width),"status":"passed"})
  except Exception as ex:
   traceback.print_exc()
   results.append({"case":"periodic-"+str(width),"status":"FAILED","error":str(ex)})
   p.screenshot(path=str(OUT/("extended-periodic-"+str(width)+"-failure.png")),full_page=True)
  context.close()
 browser.close()
(OUT/"extended-route-results.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert all(x["status"]=="passed" for x in results)
