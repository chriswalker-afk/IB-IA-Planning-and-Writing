"""Pass 3 Geometry Studio: construction guides, composite mathematics, trace handover.
All sample observations are fictional and all browser interactions use real controls.
"""
import json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/geometry"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
SMALL_PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YN7MKkAAAAASUVORK5CYII="
def saved(page):return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def prep(browser,width,height,touch):
 state=json.loads(json.dumps(BASE))
 state["route"]="completing"
 state["completion"]["current"]="C31"
 state["ui"]["writingIntroSeen"]=True
 state["geometryStudio"]["open"]=True
 state["planning"]["fields"].update({"kind":"modelling","course":"AA SL",
   "aim":"What area is enclosed by a geometric layout?"})
 state["entries"]=[{"id":"advanced-geometry-stage","phase":"first","status":"planned",
                    "title":"","technique":"","result":""}]
 state["completion"]["activeEntryIndex"]=0
 trace=state["imageTracer"]["draft"]
 trace.update({
  "imageSrc":"data:image/png;base64,"+SMALL_PNG,"width":200,"height":200,
  "imageName":"fictional-square.png","title":"Fictional calibrated tile",
  "sourceKind":"secondary","sourceCredit":"Synthetic image for acceptance testing",
  "knownLength":"10","unit":"cm","perspective":"front-on","precision":"2",
  "origin":{"x":20,"y":170},"direction":{"x":120,"y":170},
  "refA":{"x":20,"y":170},"refB":{"x":120,"y":170},
  "closeShape":True,"points":[{"x":20,"y":170},{"x":100,"y":170},
                              {"x":100,"y":120},{"x":20,"y":120}],
  "limitations":"Single planar surface, synthetic known scale."
 })
 context=browser.new_context(viewport={"width":width,"height":height},
   is_mobile=touch,has_touch=touch,accept_downloads=True)
 page=context.new_page();page.set_default_timeout(20000)
 errors=[]
 page.on("pageerror",lambda error: errors.append(str(error)))
 page.on("dialog",lambda dialog:dialog.accept())
 page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(state))+");")
 page.goto(URL,wait_until="networkidle")
 return context,page,errors

def exercise(page,width,errors):
 assert page.locator("[data-geometry-studio]").is_visible()
 # Phone view starts fitted, then can be enlarged for accurate touch editing.
 if width<=560:
  def metrics():return page.locator("[data-geometry-preview]").evaluate(
   "(el)=>({frame:el.clientWidth,content:el.scrollWidth,svg:el.querySelector('svg').getBoundingClientRect().width,left:el.scrollLeft})")
  fitted=metrics()
  assert fitted["content"]<=fitted["frame"]+2 and fitted["svg"]<=fitted["frame"]+2,fitted
  page.locator('[data-action="geometry-preview-detail"]').click()
  enlarged=metrics()
  assert enlarged["content"]>enlarged["frame"]+100 and enlarged["left"]>0,enlarged
  assert saved(page)["geometryStudio"]["zoomed"] is True
  page.locator('[data-action="geometry-preview-fit"]').click()
  fitted=metrics()
  assert fitted["content"]<=fitted["frame"]+2 and fitted["left"]==0,fitted
  assert saved(page)["geometryStudio"]["zoomed"] is False
 page.locator('[data-action="geometry-template"][data-geometry-template="l-shape"]').click()
 assert len(saved(page)["geometryStudio"]["draft"]["vertices"])==6
 page.locator('[data-geometry-field="mode"]').select_option("coordinate")
 page.locator('[data-geometry-field="showDecomposition"]').check()
 quality=page.locator("[data-geometry-quality]")
 assert "Rectangular decomposition" in quality.inner_text()
 assert "36.000" in quality.inner_text()
 assert page.locator('[data-geometry-preview] svg rect[stroke-dasharray]').count()>=2
 # A deliberately broken construction is flagged; the student can repair it.
 advanced=page.locator(".geometry-vertex").first.locator("details.geometry-vertex-constraints")
 advanced.evaluate("(el)=>el.open=true")
 advanced.locator('[data-geometry-vertex-key="edgeConstraint"]').select_option("horizontal")
 page.locator('[data-geometry-vertex="1"][data-geometry-vertex-key="y"]').fill("1")
 assert "marked horizontal" in quality.inner_text()
 assert page.locator('[data-action="geometry-save"]').is_disabled()
 advanced.locator('[data-action="geometry-align-edge"]').click()
 assert page.locator('[data-action="geometry-save"]').is_enabled()
 advanced=page.locator(".geometry-vertex").first.locator("details.geometry-vertex-constraints")
 advanced.evaluate("(el)=>el.open=true")
 advanced.locator('[data-geometry-vertex-key="rightAngle"]').check()
 assert "rightAngle" in str(saved(page)["geometryStudio"]["draft"]["vertices"][0])
 assert page.locator('[data-action="geometry-save"]').is_enabled()
 # Lock a vertex; typed edits must not change its coordinates.
 advanced.locator('[data-geometry-vertex-key="locked"]').check()
 assert page.locator('[data-geometry-vertex="0"][data-geometry-vertex-key="x"]').is_disabled()
 advanced.locator('[data-geometry-vertex-key="locked"]').uncheck()
 page.locator('[data-geometry-field="showSensitivity"]').check()
 page.locator('[data-geometry-field="sensitivityStep"]').fill("0.10")
 assert "Local coordinate sensitivity" in quality.inner_text()
 assert "one x or y coordinate at a time" in quality.inner_text().lower()
 assert page.locator('[data-geometry-preview] svg[data-geometry-canvas]').count()==1
 page.screenshot(path=str(OUT/f"geometry-advanced-l-{width}.png"),full_page=True,animations="disabled")
 # Import creates a new independent draft and keeps original tracer records.
 prior=json.dumps(saved(page)["imageTracer"],sort_keys=True)
 importer=page.locator("[data-geometry-import]")
 importer.evaluate("(el)=>el.open=true")
 importer.locator('[data-action="geometry-import-trace"]').first.click()
 transferred=saved(page)
 assert transferred["geometryStudio"]["activeId"]==""
 draft=transferred["geometryStudio"]["draft"]
 assert draft["mode"]=="coordinate" and len(draft["vertices"])==4
 assert draft["provenance"]["kind"]=="image-tracer"
 assert draft["provenance"]["referencePixels"]==100
 assert draft["provenance"]["pixelPoints"][0]=={"x":20,"y":170}
 assert draft["sourceCredit"]=="Synthetic image for acceptance testing"
 assert "data:image/" not in json.dumps(draft)
 assert json.dumps(transferred["imageTracer"],sort_keys=True)==prior
 assert "Image Tracer source" in page.locator("[data-geometry-quality]").inner_text()
 page.screenshot(path=str(OUT/f"geometry-advanced-import-{width}.png"),full_page=True,animations="disabled")
 page.locator('[data-geometry-field="showSensitivity"]').check()
 page.locator('[data-geometry-field="sensitivityStep"]').fill("0.1")
 page.locator('[data-action="geometry-save"]').click()
 saved_after=saved(page)
 assert len(saved_after["geometryStudio"]["figures"])==1
 with page.expect_download(timeout=25000) as download:
  page.locator('[data-action="geometry-svg"]').click()
 data=Path(download.value.path()).read_bytes()
 assert data.startswith(b"<svg") and b"Image Tracer snapshot" in data
 page.locator('[data-action="geometry-use"]').click()
 linked=saved(page)
 assert linked["entries"][0]["geometryFigureId"]
 assert linked["entries"][0]["status"]=="planned"
 assert page.locator('.geometry-entry > svg').count()==1
 page.reload(wait_until="networkidle")
 assert saved(page)["geometryStudio"]["figures"][0]["draft"]["provenance"]["imageName"]=="fictional-square.png"
 assert saved(page)["entries"][0]["geometryFigureId"]
 assert not errors,errors
 size=page.evaluate("({width:innerWidth,scroll:document.documentElement.scrollWidth})")
 assert size["scroll"]<=size["width"]+2,size
 print("PASS advanced geometry",width,flush=True)

if __name__=="__main__":
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width,height,touch in [(1440,900,False),(390,844,True)]:
   context,page,errors=prep(browser,width,height,touch)
   try:exercise(page,width,errors)
   finally:context.close()
  browser.close()
