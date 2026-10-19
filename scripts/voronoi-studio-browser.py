"""Desktop and phone acceptance for contextual representation choices and Voronoi Studio."""
import copy,json,os,struct,subprocess,traceback,zlib
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
SITES="Site\tx (km)\ty (km)\nSchool\t0\t0\nLibrary\t10\t0\nHospital\t5\t10"
def fake_image():
 width,height=500,300;raw=bytearray()
 for y in range(height):
  raw.append(0)
  for x in range(width):
   on=(x%100<3 or y%60<3)
   raw.extend((109,166,174) if on else (242,249,247))
 def chunk(name,value):
  return struct.pack("!I",len(value))+name+value+struct.pack("!I",zlib.crc32(name+value)&0xffffffff)
 return b"\x89PNG\r\n\x1a\n"+chunk(b"IHDR",struct.pack("!2I5B",width,height,8,2,0,0,0))+chunk(b"IDAT",zlib.compress(bytes(raw),7))+chunk(b"IEND",b"")
IMAGE=fake_image()
def state(p):
 return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def no_horizontal_scroll(p):
 widths=p.evaluate("({viewport:innerWidth,document:document.documentElement.scrollWidth})")
 assert widths["document"]<=widths["viewport"]+1,widths
def prepare(browser,width,height,route="voronoi"):
 s=copy.deepcopy(BASE);s["route"]="completing";s["completion"]["current"]="C31"
 s["planning"]["routeExplorer"]["selectedRoute"]=route
 s["planning"]["fields"].update({"aim":"Which facility is closest to different locations?",
  "course":"AI SL","kind":"modelling"})
 ctx=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
 p=ctx.new_page();p.set_default_timeout(15000)
 p.on("dialog",lambda dialog:dialog.accept())
 p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(s))+");")
 p.goto(URL,wait_until="networkidle")
 return ctx,p
def imported(p):
 p.locator('[data-voronoi-field="raw"]').fill(SITES)
 p.locator('[data-action="voronoi-parse"]').click()
 assert len(state(p)["voronoiStudio"]["draft"]["sites"])==3
 p.locator('[data-voronoi-field="title"]').fill("Nearest facilities within a study rectangle")
 p.locator('[data-voronoi-field="coordSystem"]').select_option("cartesian")
 p.locator('[data-voronoi-field="metricConfirmed"]').check()
 p.locator('[data-voronoi-field="sourceKind"]').select_option("primary")
 assert p.locator('[data-action="voronoi-use"]').is_enabled()
 assert "Required checks passed" in p.locator('[data-voronoi-quality]').inner_text()
 assert p.locator('[data-voronoi-preview] svg.voronoi-svg').count()==1
def test_hub(p,width):
 assert p.locator('[data-source-node="C31"]').count()==1
 assert p.locator('[data-representation-hub]').count()==1
 assert p.locator('.representation-card-featured').count()==2
 assert "Locations and Voronoi diagrams" in p.locator('[data-representation-hub]').inner_text()
 assert p.locator('[data-action="voronoi-open"]').count()==1
 assert p.locator('[data-action="trace-open"]').count()==1
 assert p.locator('[data-action="graph-open"]').count()==1
 assert p.locator('[data-action="stat-open"]').count()==1
 assert p.locator('[data-action="table-open"]').count()==1
 p.locator('[data-representation-filter="data"]').click()
 assert state(p)["ui"]["representationFilter"]=="data"
 assert p.locator('[data-action="stat-open"]').count()==1
 p.locator('[data-representation-filter="all"]').click()
 assert state(p)["ui"]["representationFilter"]=="all"
 no_horizontal_scroll(p)
 p.screenshot(path=str(OUT/f"representation-hub-{width}.png"),full_page=True,animations="disabled")
def test_voronoi(p,width):
 p.locator('[data-action="voronoi-open"]').click()
 assert p.locator('[data-voronoi-studio]').is_visible()
 assert p.locator('[data-action="voronoi-use"]').is_disabled()
 assert p.locator('[data-representation-switcher]').is_visible()
 imported(p)
 no_horizontal_scroll(p)
 # Check a real mathematical bisector and the nearest site to a test point.
 p.locator('[data-voronoi-field="showBisector"]').check()
 p.locator('[data-voronoi-field="probeX"]').fill("5")
 p.locator('[data-voronoi-field="probeY"]').fill("8")
 assert "Hospital" in p.locator('[data-voronoi-summary]').inner_text()
 assert p.locator('[data-action="voronoi-use"]').is_enabled()
 # Tap the real plotted domain to add an explicitly proposed site.
 p.locator('[data-voronoi-tool="candidate"]').click()
 p.locator('[data-voronoi-canvas]').scroll_into_view_if_needed()
 point=p.evaluate("""()=>{
   const svg=document.querySelector('[data-voronoi-canvas]');
   const p=svg.createSVGPoint();p.x=530;p.y=330;
   const q=p.matrixTransform(svg.getScreenCTM());
   return {x:q.x,y:q.y};
 }""")
 p.mouse.click(point["x"],point["y"])
 assert len(state(p)["voronoiStudio"]["draft"]["sites"])==4
 assert state(p)["voronoiStudio"]["draft"]["sites"][-1]["kind"]=="candidate"
 assert "proposed" in p.locator('[data-voronoi-summary]').inner_text().lower()
 assert p.locator('[data-action="voronoi-use"]').is_enabled()
 no_horizontal_scroll(p)
 p.screenshot(path=str(OUT/f"voronoi-cells-{width}.png"),full_page=True,animations="disabled")
 for fmt in ["svg","csv","png"]:
  with p.expect_download(timeout=15000) as download:
   p.locator('[data-action="voronoi-'+fmt+'"]').click()
  assert download.value.suggested_filename.endswith("."+fmt)
 p.locator('[data-action="voronoi-use"]').click()
 assert p.locator('[data-source-node="C32"]').count()==1
 assert p.locator('.voronoi-entry svg.voronoi-svg').count()==1
 data=state(p)
 assert len(data["voronoiStudio"]["figures"])==1
 assert data["entries"][0]["status"]=="planned"
 assert data["entries"][0]["result"]==""
 assert data["entries"][0]["voronoiFigureId"]==data["voronoiStudio"]["figures"][0]["id"]
 p.reload(wait_until="networkidle")
 assert p.locator('.voronoi-entry svg.voronoi-svg').count()==1
 p.locator('.voronoi-entry [data-action="voronoi-open"]').click()
 assert p.locator('[data-voronoi-studio]').is_visible()
 assert state(p)["voronoiStudio"]["draft"]["sites"][-1]["kind"]=="candidate"
 assert p.locator('[data-voronoi-field="probeX"]').input_value()=="5"
 no_horizontal_scroll(p)
 p.screenshot(path=str(OUT/f"voronoi-reopened-{width}.png"),full_page=True,animations="disabled")
def test_map(p,width):
 # Existing linked geometry. Use a synthetic coordinate grid as the background.
 p.locator('#voronoiMapFile').set_input_files({
  "name":"synthetic-calibrated-grid.png","mimeType":"image/png","buffer":IMAGE})
 p.locator('[data-voronoi-field="mapCredit"]').fill("Student-created axis-aligned map")
 p.locator('[data-voronoi-field="xMin"]').fill("0")
 p.locator('[data-voronoi-field="xMax"]').fill("20")
 p.locator('[data-voronoi-field="yMin"]').fill("0")
 p.locator('[data-voronoi-field="yMax"]').fill("12")
 p.locator('[data-voronoi-field="mapConfirmed"]').check()
 assert p.locator('[data-action="voronoi-png"]').is_enabled()
 assert p.locator('[data-voronoi-preview] svg image').count()==1
 with p.expect_download(timeout=15000) as download:
  p.locator('[data-action="voronoi-svg"]').click()
 assert download.value.suggested_filename.endswith(".svg")
 no_horizontal_scroll(p)
 p.screenshot(path=str(OUT/f"voronoi-map-overlay-{width}.png"),full_page=True,animations="disabled")
 # Deliberately miscalibrate aspect: export must become unavailable.
 p.locator('[data-voronoi-field="xMax"]').fill("14")
 assert p.locator('[data-action="voronoi-use"]').is_disabled()
 assert "aspect ratios" in p.locator('[data-voronoi-quality]').inner_text()
 # Switch tools via a single return path. Existing draft must survive.
 p.locator('[data-action="representation-back"]').click()
 assert p.locator('[data-representation-hub]').count()==1
 assert state(p)["voronoiStudio"]["draft"]["mapSrc"].startswith("data:image/")
 p.locator('[data-action="voronoi-open"]').click()
 assert p.locator('[data-voronoi-studio]').is_visible()
 assert p.locator('[data-action="voronoi-use"]').is_disabled()
def test_fallback(browser):
 ctx,p=prepare(browser,960,800,route="")
 try:
  assert p.locator('[data-representation-hub]').count()==1
  assert p.locator('[data-action="graph-open"]').count()==1
  assert p.locator('[data-action="stat-open"]').count()==1
  assert p.locator('[data-action="voronoi-open"]').count()==1
  assert "provisional" in p.locator('[data-representation-hub]').inner_text().lower()
 finally:ctx.close()
results=[]
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(headless=True,args=["--no-sandbox"])
 test_fallback(browser)
 for width,height in [(1480,900),(390,844)]:
  ctx,p=prepare(browser,width,height)
  errors=[];p.on("pageerror",lambda err:errors.append(str(err)))
  try:
   test_hub(p,width)
   test_voronoi(p,width)
   test_map(p,width)
   assert not errors,errors
   results.append({"viewport":width,"status":"passed"})
  except Exception as exc:
   traceback.print_exc()
   results.append({"viewport":width,"status":"FAILED","error":str(exc),"pageErrors":errors})
   p.screenshot(path=str(OUT/f"voronoi-FAILED-{width}.png"),full_page=True,animations="disabled")
  finally:ctx.close()
 browser.close()
(OUT/"voronoi-studio-results.json").write_text(json.dumps(results,indent=2))
if any(x["status"]!="passed" for x in results):
 raise SystemExit("Voronoi browser acceptance failed: "+json.dumps(results))
print("Contextual chooser and Voronoi Studio passed real desktop and phone tests.")
