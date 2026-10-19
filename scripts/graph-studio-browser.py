"""Browser acceptance of the on-device first-mathematics Graph Studio.
Uses fictional test measurements; never uploads student data.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
SAMPLE="Time (s)\tDistance (m)\tObservation\n0\t0\tA\n1\t2.1\tB\n2\t4.5\tC\n3\t7.2\tD"

def saved(page):
 return page.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)
def no_overflow(page):
 widths=page.evaluate("({window:innerWidth,page:document.documentElement.scrollWidth})")
 assert widths["page"]<=widths["window"]+1,widths
def prepare(browser,width,height):
 state=copy.deepcopy(BASE)
 state["route"]="completing";state["completion"]["current"]="C31"
 state["planning"]["fields"].update({"aim":"How does distance change with elapsed time?",
  "firstAction":"Plot paired measurements","dataSource":"primary","course":"AI SL",
  "kind":"statistics"})
 context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
 page=context.new_page();page.set_default_timeout(12000)
 page.add_init_script("localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(state))+");")
 page.goto(URL,wait_until="networkidle")
 return context,page

def data_graph(page,width):
 assert page.locator('[data-source-node="C31"]').count()==1
 assert page.locator('[data-action="graph-open"]').count()==1
 page.locator('[data-action="graph-open"]').click()
 assert page.locator('[data-graph-studio]').is_visible()
 assert page.locator('[data-graph-section="data"]').is_visible()
 assert page.locator('[data-graph-quality]').is_visible()
 assert page.locator('[data-action="graph-png"]').is_disabled()
 no_overflow(page)
 page.locator('[data-graph-field="raw"]').fill(SAMPLE)
 assert saved(page)["graphStudio"]["draft"]["pendingPaste"] is True
 page.locator('[data-action="graph-parse"]').click()
 assert len(saved(page)["graphStudio"]["draft"]["matrix"])==4
 assert saved(page)["graphStudio"]["draft"]["xLabel"]=="Time"
 assert saved(page)["graphStudio"]["draft"]["yUnit"]=="m"
 assert '4 paired observations plotted' in page.locator('[data-graph-preview-meta]').inner_text()
 assert page.locator('[data-action="graph-png"]').is_disabled()
 page.locator('[data-graph-field="title"]').fill("Measured distance against time")
 page.locator('[data-graph-field="sourceKind"]').select_option("primary")
 assert page.locator('[data-action="graph-png"]').is_enabled()
 assert "Required checks passed" in page.locator('[data-graph-quality]').inner_text()
 assert page.locator('[data-graph-preview] circle').count()==4
 assert page.locator('[data-graph-preview] path[stroke="#137d75"]').count()==0
 assert page.locator('[data-graph-preview] svg text').count()>5
 with page.expect_download() as download:
  page.locator('[data-action="graph-svg"]').click()
 assert download.value.suggested_filename.endswith(".svg")
 with page.expect_download() as download:
  page.locator('[data-action="graph-png"]').click()
 assert download.value.suggested_filename.endswith(".png")
 no_overflow(page)
 page.screenshot(path=str(OUT/f"graph-studio-scatter-{width}.png"),full_page=True,animations="disabled")
 page.locator('[data-action="graph-use"]').click()
 assert page.locator('[data-source-node="C32"]').count()==1
 snapshot=saved(page)
 assert len(snapshot["graphStudio"]["figures"])==1
 assert len(snapshot["entries"])==1
 assert snapshot["entries"][0]["status"]=="planned"
 assert snapshot["entries"][0]["result"]==""
 assert snapshot["entries"][0]["graphFigureId"]==snapshot["graphStudio"]["figures"][0]["id"]
 assert page.locator(".graph-entry-preview svg").count()==1
 assert page.locator('[data-action="graph-open"]').count()==1
 page.locator('[data-action="graph-open"]').click()
 assert page.locator('[data-graph-studio]').is_visible()
 assert page.locator('[data-graph-field="raw"]').input_value()==SAMPLE
 page.reload(wait_until="networkidle")
 assert len(saved(page)["graphStudio"]["figures"])==1
 no_overflow(page)

def function_graph(page,width):
 page.locator('[data-action="graph-new"]').click()
 page.locator('[data-action="graph-type"][data-graph-value="function"]').click()
 assert page.locator('[data-graph-section="function"]').is_visible()
 assert page.locator('[data-graph-field="raw"]').count()==0
 page.locator('[data-graph-field="title"]').fill("Quadratic model over a restricted domain")
 page.locator('[data-graph-field="expression"]').fill("x^2 - 3*x + 2")
 page.locator('[data-graph-field="xMin"]').fill("-1")
 page.locator('[data-graph-field="xMax"]').fill("5")
 assert page.locator('[data-action="graph-png"]').is_enabled()
 assert page.locator('[data-graph-preview] path[stroke="#4b6eb9"]').count()==1
 no_overflow(page)
 page.screenshot(path=str(OUT/f"graph-studio-function-{width}.png"),full_page=True,animations="disabled")
 page.locator('[data-graph-field="expression"]').fill("window.alert(1)")
 assert page.locator('[data-action="graph-png"]').is_disabled()
 assert "Unknown function or variable" in page.locator('[data-graph-quality]').inner_text()
 # Choosing a function does not invent observations or overwrite earlier work.
 assert saved(page)["entries"][0]["status"]=="planned"

results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1480,900),(390,844)]:
  context,page=prepare(browser,width,height)
  errors=[]
  page.on("pageerror",lambda err:errors.append(str(err)))
  try:
   data_graph(page,width)
   function_graph(page,width)
   assert not errors,errors
   results.append({"viewport":width,"status":"passed"})
  except Exception as exc:
   traceback.print_exc()
   results.append({"viewport":width,"status":"FAILED","error":str(exc),"pageErrors":errors})
   page.screenshot(path=str(OUT/f"graph-studio-FAILED-{width}.png"),full_page=True,animations="disabled")
  finally:
   context.close()
 browser.close()
(OUT/"graph-studio-results.json").write_text(json.dumps(results,indent=2))
if any(x["status"]!="passed" for x in results):
 raise SystemExit("Graph Studio browser acceptance failed: "+json.dumps(results))
print("Graph Studio desktop and phone browser acceptance passed:",results)
