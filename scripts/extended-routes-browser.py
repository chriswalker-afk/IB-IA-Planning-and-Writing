"""Exercise result-led finance, Voronoi, nonlinear and decision routes as a student sees them."""
import json,os,subprocess,traceback,copy
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 """import {createProjectState} from "./src/core/project-state.js";
const s=createProjectState();s.route="completing";s.planning.fields.course="AI SL";
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
# The current outcome picker stores a route-prefixed finding. Keep explicit
# expected families and mathematical consequences so a wrong branch cannot pass.
OUTCOMES={
 "finance-break-even":("finance-break-even","do not invent demand"),
 "finance-compound":("finance-compound","cannot be substituted interchangeably"),
 "finance-loan":("finance-loan","periodic repayment and total paid"),
 "finance-cashflow":("finance-cashflow","cash balance becomes negative"),
 "voronoi":("voronoi","NOT automatically equivalent to minimising"),
 "spearman":("nonlinear-association","conceal increasing-then-decreasing structure"),
 "quadratic-fit":("nonlinear-model","not only the largest R²"),
 "exponential":("nonlinear-model","Restrict predictions to a justified domain"),
 "chi-independence":("categorical-test","avoid claiming that categories or variables are certainly independent"),
 "expected-value":("expected-value","probabilities of extreme outcomes"),
 "triangulation":("measurement","near-degenerate triangle geometry")
}
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
def field(p,path):return p.locator('[data-bind="'+path+'"]')
def action(p,name,extra=""):
 control=p.locator('[data-action="'+name+'"]'+extra+':visible')
 assert control.count(),("No visible student action",name,extra)
 control.first.click()
def write(p,path,value):
 control=field(p,path);assert control.is_visible(),path
 control.fill(value);control.blur()
def record(s):
 keys=("id","status","result","observation","journeyOutcome","journeyDirection","fromEntryId",
       "journeySourceOutcome","journeySourceSignature","journeyRouteId","methodId",
       "nextQuestion","nextWhy","bridge","interpretation","reviewNeeded")
 return {"entries":[{key:row.get(key,"") for key in keys} for row in s["entries"]],
         "fields":{key:s["completion"]["fields"][key] for key in
                   ("nextQuestion","nextReason","scatterPattern","scatterDetail","pairedDataType")}}
def backup_roundtrip(p,label):
 before=record(saved(p))
 files=p.locator('[data-action="open-panel"][data-panel="files"]:visible')
 if files.count():files.first.click()
 else:
  action(p,"open-panel",'[data-panel="help"]');action(p,"open-files")
 with p.expect_download() as download:action(p,"export-json")
 path=OUT/("extended-route-"+label+"-backup.json");download.value.save_as(str(path))
 assert record(json.loads(path.read_text()))==before
 with p.expect_file_chooser() as chooser:action(p,"import-json")
 chooser.value.set_files(str(path))
 p.wait_for_function("key=>JSON.parse(localStorage.getItem(key)).route==='home'",arg=KEY)
 assert record(saved(p))==before,"Restoration changed the mathematical record"
def click_outcome(p,value,check):
 control=field(p,"entries.0.journeyOutcome");assert control.is_visible()
 control.select_option(value)
 assert saved(p)["entries"][0]["journeyOutcome"]==value
 assert check.lower() in p.locator(".journey-outcome-meaning").inner_text().lower()
 assert p.locator('[data-journey-next-state="ready"]').is_visible()
def choose_direction(p):
 before=saved(p);entry=before["entries"][0]
 question=p.locator('[data-journey-direction="follow"] strong').inner_text()
 action(p,"journey-use-direction",'[data-entry-id="method-1"][data-direction="follow"]')
 after=saved(p)
 assert len(after["entries"])==1,"Selecting advice must not create a mathematical stage"
 assert after["entries"][0]["result"]==entry["result"]
 assert after["entries"][0]["journeyDirection"]=="follow"
 assert after["entries"][0]["nextQuestion"]==question
 assert not after["entries"][0].get("nextWhy"),"The student must supply their own reason"
 write(p,"entries.0.nextWhy","I will test the stated assumption because it affects the decision supported by my result.")
 return question
def changed_result(p):
 parent=saved(p)["entries"][0]
 write(p,"entries.0.interpretation","The calculated result depends on the assumption identified in my next question.")
 action(p,"stage-add")
 child=saved(p)["entries"][1]
 assert child["status"]=="planned" and child["result"]==""
 assert child["fromEntryId"]==parent["id"] and child["journeySourceOutcome"]==parent["journeyOutcome"]
 assert child["journeySourceSignature"]
 assert child["title"]==parent["nextQuestion"] and child["bridge"]==parent["nextWhy"]
 result="My follow-up calculation and its explanation must survive a revised earlier result."
 write(p,"entries.1.result",result)
 action(p,"completion-edit-entry",'[data-index="0"]')
 write(p,"entries.0.result","Rechecked result: "+parent["result"])
 state=saved(p)
 assert state["entries"][0]["reviewNeeded"]=="yes"
 assert state["entries"][0]["journeyOutcome"]==parent["journeyOutcome"]
 assert p.locator('[data-journey-next-state="review"]').is_visible()
 assert not p.locator('[data-action="journey-use-direction"]').count()
 assert state["entries"][1]["reviewNeeded"]=="yes"
 assert state["entries"][1]["result"]==result and state["entries"][1]["bridge"]==parent["nextWhy"]
 action(p,"completion-edit-entry",'[data-index="1"]')
 assert p.locator('[data-journey-stage-link][data-link-state="review"]').is_visible()
 assert "Your existing writing has been preserved" in p.locator(".journey-stage-link").inner_text()
def scenario(p,method,signal,word,width):
 assert p.locator(".route-coach").is_visible()
 assert word.lower() in p.locator(".route-coach").inner_text().lower(),(method,word)
 assert p.locator(".route-depth-check").is_visible()
 family,check=OUTCOMES[method];value=family+":"+signal
 assert field(p,"entries.0.journeyOutcome").is_visible()
 assert p.locator('[data-journey-next-state="choose"]').is_visible()
 before=saved(p)["entries"][0]["result"]
 click_outcome(p,value,check)
 assert saved(p)["entries"][0]["result"]==before
 assert p.locator(".route-coach").is_visible()
 assert p.locator(".route-coach h3").inner_text()=="Your confirmed mathematical finding"
 question=choose_direction(p)
 snapshot=record(saved(p))
 p.locator('[data-action="toggle-advice-mode"]').first.click()
 assert saved(p)["ui"]["adviceMode"]=="reduced"
 assert p.locator(".route-coach-compact").is_visible()
 # Confirmed outcomes move the specific mathematical check into the outcome
 # meaning and next-question panels; reduced advice must retain those controls.
 assert check.lower() in p.locator(".journey-outcome-meaning").inner_text().lower()
 assert not p.locator(".route-coach-detail").count()
 assert field(p,"entries.0.journeyOutcome").is_visible()
 assert field(p,"entries.0.journeyOutcome").input_value()==value
 assert p.locator('[data-journey-next-state="ready"]').is_visible()
 p.reload(wait_until="networkidle")
 assert record(saved(p))==snapshot
 assert saved(p)["entries"][0]["nextQuestion"]==question
 assert p.locator(".route-coach-compact").is_visible()
 assert p.locator(".advice-mode-toggle").get_attribute("aria-pressed")=="true"
 p.locator('[data-action="toggle-advice-mode"]').first.click()
 assert saved(p)["ui"]["adviceMode"]=="guided"
 assert p.locator(".route-coach").is_visible()
 assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
 p.screenshot(path=str(OUT/("extended-route-"+method+"-"+str(width)+".png")),full_page=True)
 changed_result(p)
 assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
 backup_roundtrip(p,method+"-"+str(width))
def open_planning_check(p):
 disclosure=p.locator(".math-stage-optional-method")
 assert disclosure.count()==1
 if disclosure.get_attribute("open") is None:disclosure.locator("summary").first.click()
 assert p.locator(".route-preflight").is_visible()
def planned_scenario(p,method):
 assert p.locator(".route-preflight").count()==1
 assert not p.locator(".route-preflight").is_visible(),"Optional method review starts folded"
 open_planning_check(p)
 assert p.locator(".route-preflight").inner_text().strip()
 assert not p.locator(".route-coach").count()
 assert p.locator('[data-journey-outcome-waiting]').is_visible()
 assert not field(p,"entries.0.journeyOutcome").count()
 p.locator('[data-action="toggle-advice-mode"]').click()
 open_planning_check(p)
 assert saved(p)["ui"]["adviceMode"]=="reduced"
 assert p.locator(".route-preflight").inner_text().count("Before applying")>0
 # The essential check must appear when a real result is entered, not only on page reload.
 field(p,"entries.0.status").select_option("completed")
 assert not field(p,"entries.0.journeyOutcome").count(),"Confirmation without a result must not unlock outcomes"
 result=p.locator('[data-bind="entries.0.result"]')
 result.fill("Calculated a genuine compound balance using a documented effective periodic rate.")
 result.blur()
 assert p.locator(".route-coach-compact").is_visible()
 assert p.locator(".route-depth-check").is_visible()
 assert saved(p)["entries"][0]["status"]=="completed"
 assert "compound balance" in saved(p)["entries"][0]["result"]
 assert not p.locator(".route-preflight").count()
 click_outcome(p,"finance-compound:compound-value","Match the interest rate to the compounding period")
 choose_direction(p)
 before=record(saved(p));p.reload(wait_until="networkidle")
 assert record(saved(p))==before
 assert p.locator('[data-journey-next-state="ready"]').is_visible()
 assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
 backup_roundtrip(p,method+"-planning-"+str(p.viewport_size["width"]))
def periodic_scenario(p):
 assert p.locator('[data-bind="completion.fields.scatterDetail"]').is_visible()
 p.locator('[data-bind="completion.fields.scatterDetail"]').select_option("periodic")
 state=saved(p)
 assert state["completion"]["fields"]["scatterPattern"]=="curved"
 assert state["entries"][0]["observation"]=="curved"
 assert "repeating pattern" in p.locator(".route-coach").inner_text().lower()
 p.reload(wait_until="networkidle")
 assert saved(p)["completion"]["fields"]["scatterDetail"]=="periodic"
 assert "repeating pattern" in p.locator(".route-coach").inner_text().lower()
 assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
 backup_roundtrip(p,"periodic-"+str(p.viewport_size["width"]))

results=[]
with sync_playwright() as pw:
 options={"headless":True,"args":["--no-sandbox"]}
 if os.environ.get("IA_CHROMIUM_EXECUTABLE"):options["executable_path"]=os.environ["IA_CHROMIUM_EXECUTABLE"]
 browser=pw.chromium.launch(**options)
 for width,height in [(1440,960),(390,844)]:
  todo=[(method,signal,word,False) for method,signal,word in CASES]
  todo += [("finance-compound","","",True)]
  for method,signal,word,planned in todo:
   context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
   context.route("https://fonts.googleapis.com/**",lambda r:r.abort())
   p=context.new_page();p.set_default_timeout(9500);errors=[]
   p.on("pageerror",lambda ex:errors.append(str(ex)))
   p.on("dialog",lambda dialog:dialog.accept())
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
  context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
  context.route("https://fonts.googleapis.com/**",lambda route:route.abort())
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
  p=context.new_page();p.set_default_timeout(9500);errors=[]
  p.on("pageerror",lambda ex:errors.append(str(ex)))
  p.on("dialog",lambda dialog:dialog.accept())
  p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(plot))+");")
  try:
   p.goto(URL,wait_until="networkidle");periodic_scenario(p)
   assert not errors,errors
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
