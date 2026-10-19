"""Statistical Diagram Studio browser acceptance.
All input is fictional fixture data; no student data are transmitted.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
GROUPED="Lower (cm)\tUpper (cm)\tFrequency\n0\t5\t10\n5\t15\t10\n15\t25\t5"
BOX="Sample A (cm)\tSample B (cm)\n1\t4\n2\t5\n3\t6\n4\t7\n5\t8\n6\t9\n7\t10\n8\t11\n100\t12"
DOT="Recorded value (s)\n10\n10\n11\n11\n12\n12\n12\n13\n14\n14"
BAR="Choice\tYear 12\tYear 13\nWalk\t10\t25\nBus\t30\t25\nCar\t10\t50"

def snapshot(page):
 return page.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)
def no_overflow(page):
 s=page.evaluate("({width:innerWidth,scroll:document.documentElement.scrollWidth})")
 assert s["scroll"]<=s["width"]+1,s
def prepare(browser,width,height):
 s=copy.deepcopy(BASE)
 s["route"]="completing";s["completion"]["current"]="C31"
 s["planning"]["fields"].update({"aim":"How does the distribution differ between groups?",
   "kind":"statistics","course":"AI SL"})
 context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
 p=context.new_page();p.set_default_timeout(14000)
 p.on("dialog",lambda dialog:dialog.accept())
 p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(s))+");")
 p.goto(URL,wait_until="networkidle")
 return context,p
def read_sheet(p,table):
 p.locator('[data-stat-field="raw"]').fill(table)
 assert p.locator('[data-action="stat-png"]').is_disabled()
 p.locator('[data-action="stat-parse"]').click()
 assert snapshot(p)["statStudio"]["draft"]["pendingPaste"] is False
def source(p):
 p.locator('[data-stat-field="sourceKind"]').select_option("primary")
def title(p,text):
 p.locator('[data-stat-field="title"]').fill(text)
def use_kind(p,kind):
 p.locator('[data-action="stat-kind"][data-stat-value="'+kind+'"]').click()
 assert snapshot(p)["statStudio"]["draft"]["kind"]==kind
def fresh(p,kind):
 p.locator('[data-action="stat-new"]').click()
 use_kind(p,kind)
def histogram(p,width):
 assert p.locator('[data-source-node="C31"]').count()==1
 p.locator('[data-action="stat-open"]').click()
 assert p.locator("[data-stat-studio]").is_visible()
 assert p.locator('[data-action="stat-use"]').is_disabled()
 use_kind(p,"histogram") if snapshot(p)["statStudio"]["draft"]["kind"]!="histogram" else None
 p.locator('[data-stat-field="histogramInput"]').select_option("table")
 read_sheet(p,GROUPED)
 title(p,"Frequency-density histogram")
 p.locator('[data-stat-field="variable"]').fill("Measured height")
 p.locator('[data-stat-field="unitMode"]').select_option("unit")
 p.locator('[data-stat-field="unit"]').fill("cm")
 source(p)
 assert p.locator('[data-action="stat-use"]').is_enabled()
 assert "Required checks passed" in p.locator("[data-stat-quality]").inner_text()
 assert p.locator('[data-stat-preview] svg rect').count()>=4
 assert "Frequency density" in p.locator('[data-stat-preview]').inner_text() or "Frequency density" in p.locator('[data-stat-preview] svg').get_attribute("aria-label") or p.locator('[data-stat-preview] svg text').count()>8
 assert p.locator('[data-stat-summary]').inner_text().find("25")>=0
 no_overflow(p)
 p.screenshot(path=str(OUT/f"stat-histogram-{width}.png"),full_page=True,animations="disabled")
 for fmt in ["svg","png","csv"]:
  with p.expect_download() as download:
   p.locator('[data-action="stat-'+fmt+'"]').click()
  assert download.value.suggested_filename.endswith("."+fmt)
 p.locator('[data-action="stat-use"]').click()
 assert p.locator('[data-source-node="C32"]').count()==1
 state=snapshot(p)
 assert len(state["statStudio"]["figures"])==1
 assert state["entries"][0]["status"]=="planned"
 assert state["entries"][0]["result"]==""
 assert state["entries"][0]["statFigureId"]==state["statStudio"]["figures"][0]["id"]
 assert p.locator(".stat-entry-preview svg.stat-figure-svg").count()==1
 p.reload(wait_until="networkidle")
 assert len(snapshot(p)["statStudio"]["figures"])==1
 assert p.locator(".stat-entry-preview").is_visible()
 p.locator('.stat-entry-preview [data-action="stat-open"]').click()
 assert p.locator('[data-stat-studio]').is_visible()
 assert p.locator('[data-stat-field="raw"]').input_value()==GROUPED

def box(p,width):
 fresh(p,"box")
 read_sheet(p,BOX)
 title(p,"Comparing sample distributions")
 p.locator('[data-stat-field="variable"]').fill("Measured distance")
 source(p)
 assert p.locator('[data-action="stat-use"]').is_enabled()
 assert "Median" in p.locator('[data-stat-summary]').inner_text()
 p.locator('[data-stat-field="quartileRule"]').select_option("linear")
 assert snapshot(p)["statStudio"]["draft"]["quartileRule"]=="linear"
 assert p.locator('[data-action="stat-svg"]').is_enabled()
 no_overflow(p)
 p.screenshot(path=str(OUT/f"stat-box-plot-{width}.png"),full_page=True,animations="disabled")

def dot(p,width):
 fresh(p,"dot")
 read_sheet(p,DOT)
 title(p,"Repeated timed measurements")
 source(p)
 assert p.locator('[data-action="stat-svg"]').is_enabled()
 assert p.locator('[data-stat-preview] svg circle').count()==10
 no_overflow(p)
 p.screenshot(path=str(OUT/f"stat-dot-plot-{width}.png"),full_page=True,animations="disabled")

def bar(p,width):
 fresh(p,"bar")
 read_sheet(p,BAR)
 title(p,"Transport by school year")
 p.locator('[data-stat-field="variable"]').fill("Preferred transport")
 source(p)
 assert p.locator('[data-action="stat-use"]').is_enabled()
 assert "different sample sizes" in p.locator('[data-stat-quality]').inner_text()
 p.locator('[data-stat-field="barMode"]').select_option("percent")
 assert p.locator('[data-action="stat-png"]').is_enabled()
 assert "100" in p.locator('[data-stat-summary]').inner_text()
 no_overflow(p)
 p.screenshot(path=str(OUT/f"stat-categorical-bars-{width}.png"),full_page=True,animations="disabled")
 p.locator('[data-stat-field="min"]').fill("5")
 p.locator('[data-stat-field="max"]').fill("100")
 assert p.locator('[data-action="stat-png"]').is_disabled()
 assert "start" in p.locator('[data-stat-quality]').inner_text().lower()
 p.locator('[data-action="stat-reset-scale"]').click()
 assert p.locator('[data-action="stat-png"]').is_enabled()

results=[]
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1480,900),(390,844)]:
  ctx,p=prepare(browser,width,height)
  errors=[];p.on("pageerror",lambda err:errors.append(str(err)))
  try:
   histogram(p,width)
   box(p,width)
   dot(p,width)
   bar(p,width)
   assert not errors,errors
   results.append({"viewport":width,"status":"passed"})
  except Exception as exc:
   traceback.print_exc()
   results.append({"viewport":width,"status":"FAILED","error":str(exc),"pageErrors":errors})
   p.screenshot(path=str(OUT/f"stat-FAILED-{width}.png"),full_page=True,animations="disabled")
  finally:ctx.close()
 browser.close()
(OUT/"stat-studio-results.json").write_text(json.dumps(results,indent=2))
if any(x["status"]!="passed" for x in results):
 raise SystemExit("Statistical Studio browser acceptance failed: "+json.dumps(results))
print("Statistical Diagram Studio passed desktop and mobile tests:",results)
