"""Desktop and phone checks for a complete but compact contextual spark shelf.
Fixtures use device-local synthetic data, never identifiable student work.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"))
OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
RESULTS=[]
def setup():
 s=copy.deepcopy(BASE)
 s["route"]="planning"
 s["planning"]["current"]="N03P3"
 s["journey"]["currentNodeId"]="N03P3"
 s["planning"]["fields"].update({
  "provisionalTitle":"Measuring a school box",
  "aim":"Which design gives the largest usable volume?",
  "beneficiary":"I want to compare two real designs with a clear mathematical purpose.",
  "kind":"statistics","course":"AI SL","dataSource":"primary",
  "primaryWhat":"Length and width in cm","primaryPopulation":"Small boxes in our classroom",
  "primarySamplingMethod":"convenience","primarySamplingUnit":"One box"
 })
 s["planning"]["accuracyPlans"]=[
  {"id":"pa-primary-1","source":"primary","quantity":"Length","unit":"cm",
   "resolution":"nearest 0.1 cm","basis":"analogue","uncertainty":""},
  {"id":"pa-primary-2","source":"primary","quantity":"Width","unit":"cm",
   "resolution":"nearest 0.1 cm","basis":"digital","uncertainty":""}]
 s["completion"]["accuracyDecisions"]=[
  {"id":"acc-studio-1","quantity":"Length","unit":"cm","policy":"Display lengths to 1 dp","resolution":"nearest 0.1 cm"}]
 s["entries"]=[{"id":"math-1","status":"completed","title":"Initial volume calculation",
  "result":"V=lwh for a measured box","localTakeaway":"Volume changes with dimensions",
  "sourceRefs":[],"accuracyRefs":["acc-studio-1"],"phase":"first"}]
 return s
def saved(page):
 return page.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)
def check_width(page):
 values=page.evaluate("({screen:innerWidth,doc:document.documentElement.scrollWidth})")
 assert values["doc"]<=values["screen"]+1,values
def check(page,width):
 shelf=page.locator('[data-spark-shelf="planning"]')
 assert shelf.count()==1
 assert shelf.locator(".spark-shelf-featured").count()==2
 assert shelf.locator(".spark-library").count()==1
 assert not shelf.locator(".spark-library").evaluate("(el)=>el.open")
 assert shelf.locator('.spark-shelf-featured[data-spark-id="planned-accuracy:pa-primary-2"]').count()==1
 assert shelf.locator('.spark-shelf-featured[data-spark-id="sampling-plan"]').count()==1
 assert shelf.locator('.spark-library-entry[data-spark-id="aim"]').count()==1
 assert shelf.locator('.spark-library-entry[data-spark-id="result:math-1"]').count()==1
 assert shelf.locator('.spark-library-entry[data-spark-id="accuracy:acc-studio-1"]').count()==1
 before=saved(page)
 shelf.locator(".spark-library>summary").click()
 assert shelf.locator(".spark-library").evaluate("(el)=>el.open")
 assert "View all sparks" in shelf.inner_text()
 assert "Data, sources and accuracy" in shelf.inner_text()
 shelf.locator('.spark-library-entry[data-spark-id="aim"]>summary').click()
 input=page.locator('[data-spark-editor="aim"]')
 assert input.count()==1
 input.fill("What volume results from each school box design?")
 assert saved(page)["planning"]["fields"]["aim"]=="What volume results from each school box design?"
 assert saved(page)["project"]["aim"]=="What volume results from each school box design?"
 assert "What volume results" in shelf.locator('.spark-library-entry[data-spark-id="aim"]>summary').inner_text()
 check_width(page)
 page.screenshot(path=str(OUT/f"spark-shelf-all-{width}.png"),full_page=True,animations="disabled")
 # Editing a planned accuracy card must load the original record, not a duplicate.
 shelf.locator('.spark-library-entry[data-spark-id="planned-accuracy:pa-primary-1"]>summary').click()
 shelf.locator('.spark-library-entry[data-spark-id="planned-accuracy:pa-primary-1"] [data-action="spark-edit-accuracy"]').click()
 assert saved(page)["planning"]["accuracyEditId"]=="pa-primary-1"
 assert page.locator('[data-bind="planning.fields.primaryAccuracyQuantity"]').input_value()=="Length"
 assert len(saved(page)["planning"]["accuracyPlans"])==2
 check_width(page)
 page.reload(wait_until="networkidle")
 assert page.locator('[data-spark-shelf="planning"]').count()==1
 assert saved(page)["planning"]["fields"]["aim"]=="What volume results from each school box design?"
 assert page.locator('.spark-shelf-featured').count()==2
 # Context change swaps the two highlights without hiding the underlying library.
 studio=saved(page)
 studio["route"]="completing"
 studio["completion"]["current"]="C24"
 page.evaluate("([k,s])=>localStorage.setItem(k,JSON.stringify(s))",[KEY,studio])
 page.reload(wait_until="networkidle")
 studio_shelf=page.locator('[data-spark-shelf="studio"]')
 assert studio_shelf.count()==1
 assert studio_shelf.locator('.spark-shelf-featured').count()==2
 assert studio_shelf.locator('.spark-shelf-featured[data-spark-id="accuracy:acc-studio-1"]').count()==1
 assert studio_shelf.locator('.spark-library-entry[data-spark-id="aim"]').count()==1
 assert studio_shelf.locator('.spark-library-entry[data-spark-id="result:math-1"]').count()==1
 check_width(page)
 studio_shelf.locator('.spark-library>summary').click()
 page.screenshot(path=str(OUT/f"spark-shelf-studio-{width}.png"),full_page=True,animations="disabled")
 assert not saved(page)["completion"]["accuracyDecisions"][0]["policy"]=="" # don't alter evidence

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1440,900),(390,844)]:
  ctx=browser.new_context(viewport={"width":width,"height":height})
  ctx.route("https://fonts.googleapis.com/**",lambda route:route.abort())
  page=ctx.new_page();page.set_default_timeout(14000)
  errors=[]
  page.on("pageerror",lambda err:errors.append(str(err)))
  project=setup()
  page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
   json.dumps(KEY)+","+json.dumps(json.dumps(project))+");")
  try:
   page.goto(URL,wait_until="networkidle",timeout=30000)
   check(page,width)
   assert not errors,errors
   RESULTS.append({"viewport":f"{width}x{height}","status":"passed"})
  except Exception as exc:
   traceback.print_exc()
   RESULTS.append({"viewport":f"{width}x{height}","status":"FAILED","reason":str(exc),"pageErrors":errors})
   page.screenshot(path=str(OUT/f"spark-shelf-failed-{width}.png"),full_page=True,animations="disabled")
  ctx.close()
 browser.close()
(OUT/"spark-shelf-results.json").write_text(json.dumps(RESULTS,indent=2))
print(json.dumps(RESULTS,indent=2))
assert all(result["status"]=="passed" for result in RESULTS)
