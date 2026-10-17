"""Mobile and desktop sampling + accuracy-spark checks against built Pathfinder.
All fixtures are synthetic and remain in browser-local test storage.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"))
OUT.mkdir(parents=True,exist_ok=True)
KEY="ia-pathfinder-prototype-v1"
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
RESULTS=[]
def fixture(source):
 s=copy.deepcopy(BASE)
 s["route"]="planning";s["planning"]["current"]="N03P" if source=="primary" else "N03S"
 s["journey"]["currentNodeId"]=s["planning"]["current"]
 s["planning"]["fields"].update({"kind":"statistics","course":"AI SL","dataSource":source,
  "aim":"Do two measured variables show any useful relationship?",
  "beneficiary":"I want a mathematically justified comparison."})
 return s
def saved(p):
 return p.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)
def field(p,k):
 return p.locator('[data-bind="planning.fields.'+k+'"]')
def no_overflow(p):
 sizes=p.evaluate("({screen:innerWidth,width:document.documentElement.scrollWidth})")
 assert sizes["width"]<=sizes["screen"]+1,sizes

def run_primary(p,width):
 assert "What data will I collect?" in p.locator(".task-heading").inner_text()
 assert "Step 1 of 3" in p.locator(".primary-mini-progress").inner_text()
 assert p.locator(".sampling-recap").count()==0
 assert p.locator(".accuracy-recap").count()==0
 field(p,"primaryWhat").fill("Standing jump height and elapsed time")
 field(p,"primaryPopulation").fill("Pupils in one Year 12 class")
 field(p,"primarySamplingUnit").fill("One pupil")
 for quantity,unit in [("Jump height","cm"),("Elapsed time","s")]:
  field(p,"primaryQuantityName").fill(quantity)
  field(p,"primaryQuantityUnit").fill(unit)
  p.locator('[data-action="plan-save-quantity"]').click()
 assert len(saved(p)["planning"]["primaryQuantities"])==2
 assert saved(p)["planning"]["accuracyPlans"]==[]
 assert p.locator(".primary-quantity").count()==2
 assert p.locator(".primary-mini-progress-track>.current").count()==1
 no_overflow(p)
 p.screenshot(path=str(OUT/f"primary-data-step1-{width}.png"),full_page=True,animations="disabled")
 p.locator('[data-action="plan-advance"]').first.click()
 assert p.locator('[data-source-node="N03P2"]').count()==1
 assert "Step 2 of 3" in p.locator(".primary-mini-progress").inner_text()
 assert p.locator(".sampling-recap").count()==1
 assert p.locator(".accuracy-recap").count()==0
 assert p.locator(".data-accuracy-save").count()==0
 field(p,"primarySamplingMethod").select_option("convenience")
 assert "Convenience / opportunity" in p.locator(".primary-sampling-feedback").inner_text() or "Sampling spark saved" in p.locator(".primary-sampling-feedback").inner_text()
 assert saved(p)["planning"]["fields"]["primarySamplingMethod"]=="convenience"
 field(p,"primarySamplingFrame").select_option("no")
 field(p,"primaryRepeatable").select_option("yes")
 p.locator(".sampling-recap summary").click()
 assert p.locator(".sampling-recap").evaluate("(node)=>node.open")
 assert "Census" in p.locator(".sampling-recap-body").inner_text()
 assert "Simple random sample" in p.locator(".sampling-recap-body").inner_text()
 assert "Watch out" in p.locator(".sampling-recap-body").inner_text()
 no_overflow(p)
 p.screenshot(path=str(OUT/f"primary-data-step2-{width}.png"),full_page=True,animations="disabled")
 p.locator('[data-action="plan-advance"]').first.click()
 assert p.locator('[data-source-node="N03P3"]').count()==1
 assert p.locator(".sampling-recap").count()==0
 assert p.locator(".accuracy-recap").count()==1
 assert "Step 3 of 3" in p.locator(".primary-mini-progress").inner_text()
 assert p.locator(".primary-precision-item").count()==2
 field(p,"primaryHow").fill("Use a measuring tape and calibrated stopwatch for every attempt.")
 field(p,"primaryEquipment").fill("1 mm tape measure and digital timer")
 # Each saved quantity from step one can prefill its name and unit.
 p.locator('[data-action="plan-use-quantity"][data-quantity-id="pq-1"]').click()
 assert field(p,"primaryAccuracyQuantity").input_value()=="Jump height"
 assert field(p,"primaryAccuracyUnit").input_value()=="cm"
 field(p,"primaryAccuracyBasis").select_option("analogue")
 assert "smallest marked division" in p.locator(".data-quality-basis-note").inner_text()
 field(p,"primaryAccuracyResolution").fill("to nearest 0.1 cm")
 p.locator('[data-action="plan-save-accuracy"][data-source="primary"]').click()
 assert len(saved(p)["planning"]["accuracyPlans"])==1
 assert saved(p)["planning"]["accuracyPlans"][0]["quantity"]=="Jump height"
 assert saved(p)["completion"]["accuracyDecisions"]==[]
 assert p.locator(".primary-saved-row").count()==1
 p.locator('[data-action="plan-use-quantity"][data-quantity-id="pq-2"]').click()
 assert field(p,"primaryAccuracyQuantity").input_value()=="Elapsed time"
 assert field(p,"primaryAccuracyUnit").input_value()=="s"
 field(p,"primaryAccuracyBasis").select_option("digital")
 field(p,"primaryAccuracyResolution").fill("to nearest 0.01 s")
 p.locator('[data-action="plan-save-accuracy"][data-source="primary"]').click()
 assert len(saved(p)["planning"]["accuracyPlans"])==2
 assert p.locator(".primary-saved-row").count()==2
 field(p,"primaryStatus").select_option("ready")
 no_overflow(p)
 p.screenshot(path=str(OUT/f"primary-data-step3-{width}.png"),full_page=True,animations="disabled")
 p.locator('[data-action="plan-advance"]').first.click()
 assert p.locator('[data-source-node="N03J"]').count()==1
 assert p.locator('[data-planning-return-spark="sampling"]').count()==1
 assert p.locator('[data-planning-return-spark="accuracy"]').count()==1
 assert len(saved(p)["planning"]["completedNodes"])>=3
 assert all(v in saved(p)["planning"]["completedNodes"] for v in ["N03P","N03P2","N03P3"])
 no_overflow(p)
 # The sampling and accuracy sparks reappear with actual evidence in IA Studio.
 test_state=saved(p)
 test_state["route"]="completing";test_state["completion"]["current"]="C21S"
 p.evaluate("([k,s])=>localStorage.setItem(k,JSON.stringify(s))",[KEY,test_state])
 p.reload(wait_until="networkidle")
 assert "My planned sampling approach" in p.locator(".insight-echo").inner_text()
 test_state=saved(p);test_state["completion"]["current"]="C24"
 p.evaluate("([k,s])=>localStorage.setItem(k,JSON.stringify(s))",[KEY,test_state])
 p.reload(wait_until="networkidle")
 assert "Planned accuracy" in p.locator(".insight-echo").inner_text()
 no_overflow(p)
def run_secondary(p,width):
 assert "Plan your secondary data" in p.locator(".task-heading").inner_text()
 assert p.locator(".accuracy-recap").count()==1
 field(p,"secondaryPublisher").fill("Fictional statistics office")
 field(p,"secondaryVariables").fill("Reported reaction times (s) and an exact count of observations")
 field(p,"secondarySamplingOrigin").fill("Methods documentation not yet found")
 field(p,"secondaryAccuracyQuantity").fill("Reaction time")
 field(p,"secondaryAccuracyUnit").fill("s")
 field(p,"secondaryAccuracyBasis").select_option("rounded")
 assert "not proof of measurement accuracy" in p.locator(".data-quality-basis-note").inner_text()
 field(p,"secondaryAccuracyResolution").fill("shown to nearest 0.01 s")
 p.locator('[data-action="plan-save-accuracy"][data-source="secondary"]').click()
 assert saved(p)["planning"]["accuracyPlans"][0]["source"]=="secondary"
 assert "Reaction time" in p.locator(".data-accuracy-spark").inner_text()
 field(p,"secondaryAccuracyQuantity").fill("Observation count")
 field(p,"secondaryAccuracyBasis").select_option("exact")
 p.locator('[data-action="plan-save-accuracy"][data-source="secondary"]').click()
 assert len(saved(p)["planning"]["accuracyPlans"])==2
 assert saved(p)["planning"]["accuracyPlans"][1]["basis"]=="exact"
 p.screenshot(path=str(OUT/f"secondary-precision-{width}.png"),full_page=True,animations="disabled")
 no_overflow(p)

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1440,900),(390,844)]:
  for source in ["primary","secondary"]:
   ctx=browser.new_context(viewport={"width":width,"height":height})
   ctx.route("https://fonts.googleapis.com/**",lambda r:r.abort())
   page=ctx.new_page();page.set_default_timeout(11000)
   errors=[];page.on("pageerror",lambda err:errors.append(str(err)))
   raw=fixture(source)
   page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
    json.dumps(KEY)+","+json.dumps(json.dumps(raw))+");")
   try:
    page.goto(URL,wait_until="networkidle",timeout=30000)
    if source=="primary":run_primary(page,width)
    else:run_secondary(page,width)
    assert not errors,errors
    RESULTS.append({"viewport":f"{width}x{height}","source":source,"status":"passed"})
   except Exception as ex:
    traceback.print_exc()
    RESULTS.append({"viewport":f"{width}x{height}","source":source,
     "status":"FAILED","error":str(ex),"pageErrors":errors})
    page.screenshot(path=str(OUT/f"data-decisions-FAILED-{source}-{width}.png"),full_page=True,animations="disabled")
   ctx.close()
 browser.close()
(OUT/"data-decisions-results.json").write_text(json.dumps(RESULTS,indent=2))
print(json.dumps(RESULTS,indent=2))
assert all(x["status"]=="passed" for x in RESULTS)
