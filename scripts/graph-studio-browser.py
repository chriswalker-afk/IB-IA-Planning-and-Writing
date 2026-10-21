"""Browser acceptance of the on-device first-mathematics Graph Studio.
Uses fictional test measurements; never uploads student data.
"""
import copy,json,os,struct,subprocess,traceback
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
 page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(state))+");")
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
 page.locator('details.native-import-details').evaluate("(el)=>el.open=true")
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
 # Student explicitly chooses each overlay; ordinary plots never gain an automatic fit.
 assert page.locator('[data-graph-section="models"]').is_visible()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==0
 page.locator('[data-action="graph-model-add"]').click()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==1
 assert "Linear regression" in page.locator('[data-graph-model]').first.inner_text()
 assert "y ≈" in page.locator('[data-graph-model-summary]').first.inner_text()
 page.locator('[data-graph-field="modelChoice"]').select_option("quadratic")
 page.locator('[data-action="graph-model-add"]').click()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==2
 page.locator('[data-graph-field="modelChoice"]').select_option("custom")
 page.locator('[data-action="graph-model-add"]').click()
 assert page.locator('[data-graph-model-expression]').count()==1
 page.locator('[data-graph-model-expression]').fill("0.7*x^2 + 1")
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 assert page.locator('[data-action="graph-model-add"]').is_disabled()
 assert page.locator('[data-graph-preview] svg text').filter(has_text="My own equation").count()==1
 # Model-equation presentation is independent of model visibility and of the legend.
 assert page.locator('[data-graph-field="equationPlacement"]').input_value()=="legend"
 page.locator('[data-graph-field="equationPlacement"]').select_option("annotation")
 assert page.locator('[data-graph-preview] .graph-model-equation-panel').count()==1
 assert page.locator('[data-graph-preview] .graph-model-equation-label').count()==3
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 with page.expect_download() as equation_svg:
  page.locator('[data-action="graph-svg"]').click()
 assert 'graph-model-equation-panel' in Path(equation_svg.value.path()).read_text(encoding="utf-8")
 page.locator('[data-graph-field="showLegend"]').uncheck()
 assert page.locator('[data-graph-preview] .graph-legend-text').count()==0
 assert page.locator('[data-graph-preview] .graph-model-equation').count()>=3
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 page.locator('[data-graph-field="equationPlacement"]').select_option("hidden")
 assert page.locator('[data-graph-preview] .graph-model-equation-panel').count()==0
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 page.locator('[data-graph-field="showLegend"]').check()
 page.locator('[data-graph-field="legendPosition"]').select_option("right")
 assert page.locator('[data-graph-preview] .graph-legend-text').count()>0
 page.locator('[data-graph-field="legendPosition"]').select_option("below")
 page.locator('[data-graph-field="equationPlacement"]').select_option("legend")
 assert 'Linear regression:' in page.locator('[data-graph-preview] .graph-legend-text').all_inner_texts()[1]
 assert saved(page)["graphStudio"]["draft"]["equationPlacement"]=="legend"
 # An incorrect expression is diagnosed; hiding it leaves original observations exportable.
 page.locator('[data-graph-model-expression]').fill("window.alert(1)")
 assert page.locator('[data-action="graph-png"]').is_disabled()
 manual=page.locator('[data-graph-model]').last
 manual.locator('[data-action="graph-model-toggle"]').click()
 assert page.locator('[data-action="graph-png"]').is_enabled()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==2
 manual=page.locator('[data-graph-model]').last
 manual.locator('[data-action="graph-model-toggle"]').click()
 page.locator('[data-graph-model-expression]').fill("0.7*x^2 + 1")
 assert page.locator('[data-action="graph-png"]').is_enabled()
 quadratic=page.locator('[data-graph-model]').nth(1)
 quadratic.locator('[data-action="graph-model-toggle"]').click()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==2
 quadratic=page.locator('[data-graph-model]').nth(1)
 quadratic.locator('[data-action="graph-model-toggle"]').click()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 assert len(saved(page)["graphStudio"]["draft"]["models"])==3
 no_overflow(page)
 page.screenshot(path=str(OUT/f"graph-studio-models-{width}.png"),full_page=True,animations="disabled")
 # Every model uses the same complete observations; no automatic ranking.
 comparison=page.locator('.graph-model-comparison')
 assert comparison.is_visible()
 assert comparison.locator('tbody tr:not(.graph-comparison-explainer)').count()==3
 assert "RMSE (m)" in comparison.inner_text()
 assert "R²" in comparison.inner_text()
 assert "not just the largest R²" in comparison.inner_text()
 # Residuals remain opt-in even when three fits have been added.
 assert page.locator('.graph-residual-panel').count()==0
 assert page.locator('.graph-residual-segment').count()==0
 page.locator('[data-graph-field="residualModelId"]').select_option("model-1")
 page.locator('[data-graph-field="showResidualSegments"]').check()
 assert page.locator('[data-graph-preview] .graph-residual-segment').count()==4
 assert page.locator('[data-graph-preview] svg text').filter(has_text="Residual distances").count()==1
 page.locator('[data-graph-field="showResidualPlot"]').check()
 assert page.locator('.graph-residual-panel').is_visible()
 assert page.locator('[data-graph-residual-plot] .graph-residual-zero').count()==1
 assert page.locator('[data-graph-residual-plot] .graph-residual-point').count()==4
 assert 'observed y' in page.locator('.graph-residual-panel').inner_text()
 page.locator('[data-graph-field="modelReflection"]').fill("The errors appear small but the sample is limited.")
 assert saved(page)["graphStudio"]["draft"]["modelReflection"]=="The errors appear small but the sample is limited."
 page.screenshot(path=str(OUT/f"graph-studio-residuals-{width}.png"),full_page=True,animations="disabled")
 with page.expect_download() as download:
  page.locator('[data-action="graph-residual-svg"]').click()
 residual_svg=Path(download.value.path()).read_text(encoding="utf-8")
 assert '<svg' in residual_svg and "graph-residual-zero" in residual_svg
 assert "Residual: observed" in residual_svg
 with page.expect_download() as download:
  page.locator('[data-action="graph-residual-png"]').click()
 residual_png=Path(download.value.path()).read_bytes()
 assert residual_png[:8]==b"\x89PNG\r\n\x1a\n"
 px,py=struct.unpack(">II",residual_png[16:24])
 assert (px,py)==(2820,1500),(px,py)
 # A hidden comparison model should not silently leave visible residuals.
 page.locator('[data-graph-field="residualModelId"]').select_option("model-2")
 quadratic=page.locator('[data-graph-model]').nth(1)
 quadratic.locator('[data-action="graph-model-toggle"]').click()
 assert page.locator('.graph-residual-segment').count()==0
 assert page.locator('[data-graph-residual-plot]').count()==0
 assert "hidden" in page.locator('.graph-residual-panel').inner_text().lower()
 quadratic=page.locator('[data-graph-model]').nth(1)
 quadratic.locator('[data-action="graph-model-toggle"]').click()
 assert page.locator('[data-graph-residual-plot] .graph-residual-point').count()==4
 assert page.locator('.graph-residual-segment').count()==4
 assert len(saved(page)["graphStudio"]["draft"]["models"])==3
 no_overflow(page)
 with page.expect_download() as download:
  page.locator('[data-action="graph-svg"]').click()
 assert download.value.suggested_filename.endswith(".svg")
 with page.expect_download() as download:
  page.locator('[data-action="graph-png"]').click()
 assert download.value.suggested_filename.endswith(".png")
 png=Path(download.value.path()).read_bytes()
 assert png[:8]==b"\x89PNG\r\n\x1a\n"
 width_px,height_px=struct.unpack(">II",png[16:24])
 assert (width_px,height_px)==(2820,2040),(width_px,height_px)
 page.locator('[data-action="graph-use"]').click()
 assert page.locator('[data-source-node="C30"]').count()==1
 snapshot=saved(page)
 assert len(snapshot["graphStudio"]["figures"])==1
 assert len(snapshot["entries"])==1
 assert snapshot["entries"][0]["status"]=="planned"
 assert snapshot["entries"][0]["result"]==""
 assert snapshot["entries"][0]["graphFigureId"]==snapshot["graphStudio"]["figures"][0]["id"]
 assert page.locator(".graph-entry-preview svg.graph-figure-svg").count()==1
 # The embedded tool catalogue also offers graph-open; reopen the saved figure itself.
 assert page.locator('.graph-entry-preview [data-action="graph-open"]').count()==1
 page.locator('.graph-entry-preview [data-action="graph-open"]').click()
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
 assert "Unexpected character" in page.locator('[data-graph-quality]').inner_text()
 # Choosing a function does not invent observations or overwrite earlier work.
 assert saved(page)["entries"][0]["status"]=="planned"

def advanced_graph(page,width):
 # A separate student-chosen modelling task with genuine, positive observations.
 source="x (s)\ty (m)\n1\t3.1\n2\t4.5\n3\t7.5\n4\t11.1\n5\t18.5\n6\t29.4\n7\t47.1\n8\t76.2"
 page.locator('[data-action="graph-new"]').click()
 page.locator('details.native-import-details').evaluate("(el)=>el.open=true")
 page.locator('[data-graph-field="raw"]').fill(source)
 page.locator('[data-action="graph-parse"]').click()
 page.locator('[data-graph-field="title"]').fill("Advanced regression verification")
 page.locator('[data-graph-field="sourceKind"]').select_option("primary")
 assert page.locator('[data-action="graph-png"]').is_enabled()
 # Students must add advanced models intentionally.
 assert page.locator('.graph-model-card').count()==0
 page.locator('[data-graph-field="modelChoice"]').select_option("exponential")
 page.locator('[data-action="graph-model-add"]').click()
 assert page.locator('.graph-model-card').count()==1
 assert "ln(y)" in page.locator('[data-graph-model-summary]').first.inner_text()
 assert "y > 0" in page.locator('.graph-model-caution').first.inner_text()
 page.locator('[data-graph-model-method]').select_option("original")
 assert saved(page)["graphStudio"]["draft"]["models"][0]["fitMethod"]=="original"
 assert "original-scale" in page.locator('[data-graph-model-summary]').first.inner_text()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==1
 page.locator('[data-graph-field="modelChoice"]').select_option("power")
 page.locator('[data-action="graph-model-add"]').click()
 assert page.locator('[data-graph-model-method]').count()==2
 page.locator('[data-graph-field="modelChoice"]').select_option("cubic")
 page.locator('[data-action="graph-model-add"]').click()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 assert "Cubic" in page.locator('.graph-model-card').last.inner_text()
 assert 'x³' in page.locator('.graph-model-card').last.inner_text()
 assert "RMSE" in page.locator('.graph-model-comparison').inner_text()
 assert page.locator('[data-action="graph-model-add"]').is_disabled()
 # Try a different advanced family without changing the input data.
 page.locator('.graph-model-card').last.locator('[data-action="graph-model-remove"]').click()
 page.locator('[data-graph-field="modelChoice"]').select_option("logarithmic")
 page.locator('[data-action="graph-model-add"]').click()
 assert "ln(x)" in page.locator('.graph-model-card').last.inner_text()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 page.locator('.graph-model-card').last.locator('[data-action="graph-model-remove"]').click()
 page.locator('[data-graph-field="modelChoice"]').select_option("sinusoidal")
 page.locator('[data-action="graph-model-add"]').click()
 assert page.locator('[data-graph-model-period]').count()==1
 assert 'exploratory' in page.locator('.graph-model-card').last.inner_text().lower()
 page.locator('[data-graph-model-period]').fill("4")
 assert saved(page)["graphStudio"]["draft"]["models"][2]["period"]=="4"
 assert 'Fixed-period' in page.locator('.graph-model-card').last.inner_text()
 assert page.locator('[data-graph-preview] .graph-model-overlay').count()==3
 page.locator('[data-graph-field="residualModelId"]').select_option("model-3")
 page.locator('[data-graph-field="showResidualPlot"]').check()
 assert page.locator('[data-graph-residual-plot] .graph-residual-point').count()==8
 assert page.locator('[data-action="graph-residual-svg"]').is_enabled()
 no_overflow(page)
 page.screenshot(path=str(OUT/f"graph-studio-advanced-models-{width}.png"),full_page=True,animations="disabled")
 # Preserve student settings through an ordinary reload and use the original pairs.
 page.reload(wait_until="networkidle")
 state=saved(page)
 assert state["graphStudio"]["draft"]["models"][0]["fitMethod"]=="original"
 assert state["graphStudio"]["draft"]["models"][2]["period"]=="4"
 assert len(state["graphStudio"]["draft"]["matrix"])==8
 assert page.locator('[data-graph-residual-plot] .graph-residual-point').count()==8
 no_overflow(page)

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
   advanced_graph(page,width)
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
