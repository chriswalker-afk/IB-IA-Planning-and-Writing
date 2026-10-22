"""Check six mathematical routes through current, visible student outcome controls."""
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
   "result":"I calculated r = 0.08 beside a curved scatter." if family=="pmcc" else "I fitted a line; the residuals form a systematic curve.","resultSignal":""}
  if family=="pmcc":graph.update(observation="curved",localTakeaway="The paired plot bends")
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
   "status":"completed","result":"The stationary candidate has height 4.2 cm, above the permitted 4.0 cm.","resultSignal":""}]
  s["completion"]["activeEntryIndex"]=0;s["completion"]["nextFromEntryId"]="opt"
  s["completion"]["current"]="C40"
 elif family=="proof":
  s["planning"]["fields"]["kind"]="theoretical"
  s["planning"]["routeExplorer"]["selectedRoute"]="proof"
  s["entries"]=[{"id":"cases","phase":"first","kind":"theory","methodId":"proof","technique":"Numerical cases",
   "title":"Test a prime-number conjecture","purpose":"Does n squared plus n plus 41 always give a prime for nonnegative integers?",
   "status":"completed","result":"At n = 0, 1, 2, 3 I obtain the primes 41, 43, 47, 53.","resultSignal":""}]
  s["completion"]["activeEntryIndex"]=0;s["completion"]["nextFromEntryId"]="cases"
  s["completion"]["current"]="C30"
 else:
  raise Exception("Unknown fixture")
 return s

def choose(p,path,value):
 p.locator('[data-choice="'+path+'"][data-value="'+value+'"]').click()
def field(p,path):return p.locator('[data-bind="'+path+'"]')
def write(p,path,value):
 control=field(p,path);assert control.is_visible(),path
 control.fill(value);control.blur()
def action(p,name,extra=""):
 control=p.locator('[data-action="'+name+'"]'+extra+':visible')
 assert control.count(),("No visible student action",name,extra)
 control.first.click()
def record(s):
 keys=("id","status","result","observation","journeyOutcome","journeyDirection","fromEntryId",
       "journeySourceOutcome","journeySourceSignature","journeyRouteId","methodId",
       "nextQuestion","nextWhy","bridge","interpretation","reviewNeeded")
 return {"entries":[{key:row.get(key,"") for key in keys} for row in s["entries"]],
         "fields":{key:s["completion"]["fields"][key] for key in
                   ("nextQuestion","nextReason","scatterPattern","scatterDetail","pairedDataType")}}
def backup_roundtrip(p,label):
 before=record(own(p))
 files=p.locator('[data-action="open-panel"][data-panel="files"]:visible')
 if files.count():files.first.click()
 else:
  action(p,"open-panel",'[data-panel="help"]');action(p,"open-files")
 with p.expect_download() as download:action(p,"export-json")
 path=OUT/("math-route-"+label+"-backup.json");download.value.save_as(str(path))
 assert record(json.loads(path.read_text()))==before
 with p.expect_file_chooser() as chooser:action(p,"import-json")
 chooser.value.set_files(str(path))
 p.wait_for_function("key=>JSON.parse(localStorage.getItem(key)).route==='home'",arg=KEY)
 assert record(own(p))==before,"Restoration changed the mathematical record"
def outcome(p,index,value,check):
 control=field(p,f"entries.{index}.journeyOutcome");assert control.is_visible()
 control.select_option(value)
 assert own(p)["entries"][index]["journeyOutcome"]==value
 assert check.lower() in p.locator(".journey-outcome-meaning").inner_text().lower()
 assert p.locator('[data-journey-next-state="ready"]').is_visible()
def decision_and_revision(p,index):
 state=own(p);entry=state["entries"][index];first=entry["phase"]=="first"
 question_path="completion.fields.nextQuestion" if first else f"entries.{index}.nextQuestion"
 reason_path="completion.fields.nextReason" if first else f"entries.{index}.nextWhy"
 question=p.locator('[data-journey-direction="follow"] strong').inner_text()
 action(p,"journey-use-direction",'[data-entry-id="'+entry["id"]+'"][data-direction="follow"]')
 selected=own(p)
 assert len(selected["entries"])==len(state["entries"])
 assert selected["entries"][index]["result"]==entry["result"]
 assert selected["entries"][index]["journeyDirection"]=="follow"
 assert field(p,question_path).input_value()==question
 assert field(p,reason_path).input_value()=="","Advice must not write a student justification"
 reason="I will check the relevant assumption because it controls what this result establishes."
 write(p,reason_path,reason)
 write(p,f"entries.{index}.interpretation","This finding restricts the claim I can make about my aim.")
 action(p,"stage-add")
 stage=own(p)["entries"][-1];child_index=len(state["entries"])
 assert stage["status"]=="planned" and stage["result"]==""
 assert stage["fromEntryId"]==entry["id"] and stage["journeySourceOutcome"]==entry["journeyOutcome"]
 assert stage["journeySourceSignature"]
 assert stage["title"]==question and stage["bridge"]==reason
 child_text="My independent follow-up calculation remains here while I review its connection."
 write(p,f"entries.{child_index}.result",child_text)
 action(p,"completion-edit-entry",f'[data-index="{index}"]')
 write(p,f"entries.{index}.result","Rechecked result: "+entry["result"])
 changed=own(p)
 assert changed["entries"][index]["reviewNeeded"]=="yes"
 assert changed["entries"][index]["journeyOutcome"]==entry["journeyOutcome"]
 assert p.locator('[data-journey-next-state="review"]').is_visible()
 assert not p.locator('[data-action="journey-use-direction"]').count()
 assert changed["entries"][child_index]["reviewNeeded"]=="yes"
 assert changed["entries"][child_index]["result"]==child_text
 assert changed["entries"][child_index]["bridge"]==reason
 action(p,"completion-edit-entry",f'[data-index="{child_index}"]')
 assert p.locator('[data-journey-stage-link][data-link-state="review"]').is_visible()
 assert "Your existing writing has been preserved" in p.locator(".journey-stage-link").inner_text()
def run_case(p,family,width):
 assert p.locator('[data-action="toggle-advice-mode"]').is_visible()
 state=own(p);index=state["completion"]["activeEntryIndex"];expected=None
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
  expected="relationships:curve"
  outcome(p,index,expected,"A small r does not mean no relationship")
  assert own(p)["entries"][index]["result"]==state["entries"][index]["result"]
 elif family=="model":
  assert "gradient" in p.locator(".route-coach").inner_text().lower()
  assert "intercept" in p.locator(".route-coach").inner_text().lower()
  expected="fitted-models:systematic"
  outcome(p,index,expected,"different mathematical structure")
  assert "patterned residuals" in p.locator('[data-journey-direction="follow"]').inner_text()
 elif family=="optimisation":
  assert "endpoints" in p.locator(".route-coach").inner_text().lower()
  expected="optimisation:real-world"
  outcome(p,index,expected,"may not be a practical optimum")
 elif family=="proof":
  outcome(p,index,"proof:pattern","does not prove a universal claim")
  write(p,"entries.0.result","At n = 40, n squared plus n plus 41 equals 1681 = 41 squared, which is not prime.")
  expected="proof:counter"
  outcome(p,index,expected,"counterexample refutes a universal statement")
 before=record(own(p))
 if family in ["pmcc","model","optimisation","proof","scatter","bivariate"]:
  p.locator('[data-action="toggle-advice-mode"]').first.click()
  assert own(p)["ui"]["adviceMode"]=="reduced"
  assert p.locator(".advice-mode-toggle").get_attribute("aria-pressed")=="true"
  if family!="proof":assert p.locator(".route-coach-compact").is_visible()
  assert p.locator(".guidance-optional").count()==0
  if expected:
   assert field(p,f"entries.{index}.journeyOutcome").is_visible()
   assert field(p,f"entries.{index}.journeyOutcome").input_value()==expected
   assert p.locator(".journey-outcome-meaning").is_visible()
   assert p.locator('[data-journey-next-state="ready"]').is_visible()
  p.reload(wait_until="networkidle")
  assert p.locator(".advice-mode-toggle").get_attribute("aria-pressed")=="true"
  assert record(own(p))==before
  if family!="proof":assert p.locator(".route-coach-compact").is_visible()
  p.locator('[data-action="toggle-advice-mode"]').first.click()
  assert own(p)["ui"]["adviceMode"]=="guided"
 assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 p.screenshot(path=str(OUT/("math-route-"+family+"-"+str(width)+".png")),full_page=True)
 if expected:
  decision_and_revision(p,index)
  assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 backup_roundtrip(p,family+"-"+str(width))

with sync_playwright() as pw:
 options={"headless":True,"args":["--no-sandbox"]}
 if os.environ.get("IA_CHROMIUM_EXECUTABLE"):options["executable_path"]=os.environ["IA_CHROMIUM_EXECUTABLE"]
 browser=pw.chromium.launch(**options)
 for width,height in [(1440,960),(390,844)]:
  for family in ["scatter","bivariate","pmcc","model","optimisation","proof"]:
   label=family+"-"+str(width)
   context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
   context.route("https://fonts.googleapis.com/**",lambda r:r.abort())
   p=context.new_page();p.set_default_timeout(9000);errors=[]
   p.on("pageerror",lambda err:errors.append(str(err)))
   p.on("dialog",lambda dialog:dialog.accept())
   raw=fixture(family)
   p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(raw))+");")
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
