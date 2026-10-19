"""Image & Coordinate Studio browser acceptance: real upload, tap calibration, geometry and exports.
This uses a synthetic raster, never real pupil photographs.
"""
import copy,json,os,struct,subprocess,traceback,zlib
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
def png_fixture():
 w,h=500,300
 raw=bytearray()
 for y in range(h):
  raw.append(0)
  for x in range(w):
   black=abs(x-100)<3 or abs(y-240)<3
   gray=(x+y)%40<3
   raw.extend((43,67,84) if black else (210,229,230) if gray else (245,249,247))
 def chunk(tag,data):
  return struct.pack("!I",len(data))+tag+data+struct.pack("!I",zlib.crc32(tag+data)&0xffffffff)
 return b"\x89PNG\r\n\x1a\n"+chunk(b"IHDR",struct.pack("!2I5B",w,h,8,2,0,0,0))+chunk(b"IDAT",zlib.compress(bytes(raw),7))+chunk(b"IEND",b"")
IMAGE=png_fixture()
def saved(page):
 return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def no_overflow(page):
 a=page.evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})")
 assert a["scrollWidth"]<=a["width"]+1,a
def prepare(browser,width,height):
 s=copy.deepcopy(BASE)
 s["route"]="completing";s["completion"]["current"]="C31"
 s["planning"]["fields"].update({"aim":"What mathematical curve approximates the arch?",
  "kind":"geometry","course":"AA SL"})
 context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
 p=context.new_page();p.set_default_timeout(15000)
 p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(s))+");")
 p.goto(URL,wait_until="networkidle")
 return context,p
def tap(p,frac_x,frac_y):
 svg=p.locator('[data-trace-canvas="true"]')
 svg.scroll_into_view_if_needed()
 box=svg.bounding_box()
 assert box and box["width"]>0,box
 svg.locator("[data-trace-tap]").click(position={"x":box["width"]*frac_x,"y":box["height"]*frac_y})
def run(p,width):
 assert p.locator('[data-source-node="C31"]').count()==1
 assert p.locator('[data-action="trace-open"]').count()==1
 p.locator('[data-action="trace-open"]').click()
 assert p.locator("[data-image-tracer]").count()==1
 assert p.locator('[data-action="trace-use"]').is_disabled()
 no_overflow(p)
 p.locator('[data-action="trace-upload"]').click()
 p.locator("#imageTraceFile").set_input_files({"name":"synthetic-arch.png","mimeType":"image/png","buffer":IMAGE})
 p.locator('[data-trace-canvas="true"]').wait_for(state="visible",timeout=25000)
 d=saved(p)["imageTracer"]["draft"]
 assert d["imageSrc"].startswith("data:image/")
 assert d["width"]==500 and d["height"]==300
 assert not d["points"]
 assert len(d["imageSrc"])<245000
 assert p.locator('[data-trace-field="title"]').count()==1
 tap(p,.2,.567)
 assert saved(p)["imageTracer"]["draft"]["mode"]=="direction"
 tap(p,.7,.567)
 assert saved(p)["imageTracer"]["draft"]["mode"]=="refA"
 tap(p,.2,.8)
 assert saved(p)["imageTracer"]["draft"]["mode"]=="refB"
 tap(p,.6,.8)
 assert saved(p)["imageTracer"]["draft"]["mode"]=="trace"
 for x,y in [(.3,.45),(.52,.32),(.72,.47)]:
  tap(p,x,y)
 assert len(saved(p)["imageTracer"]["draft"]["points"])==3
 p.locator('[data-trace-field="knownLength"]').fill("10")
 p.locator('[data-trace-field="unit"]').fill("cm")
 p.locator('[data-trace-field="title"]').fill("Coordinates along a photographed arch")
 p.locator('[data-trace-field="sourceKind"]').select_option("primary")
 p.locator('[data-trace-field="perspective"]').select_option("front-on")
 p.locator('[data-trace-field="precision"]').select_option("2")
 assert p.locator('[data-action="trace-use"]').is_enabled()
 assert "Required checks passed" in p.locator("[data-trace-quality]").inner_text()
 assert p.locator('.trace-coordinates-table tbody tr').count()==3
 assert p.locator('[data-trace-canvas="true"] circle').count()>=4
 p.locator('[data-action="trace-view"][data-trace-value="math"]').click()
 assert p.locator('[data-trace-preview] .image-trace-svg').count()==1
 assert p.locator('[data-trace-preview] image').count()==0
 assert p.locator('[data-action="trace-use"]').is_enabled()
 no_overflow(p)
 p.screenshot(path=str(OUT/f"image-tracer-clean-plot-{width}.png"),full_page=True,animations="disabled")
 with p.expect_download() as download:
  p.locator('[data-action="trace-csv"]').click()
 assert download.value.suggested_filename.endswith(".csv")
 with p.expect_download() as download:
  p.locator('[data-action="trace-svg"]').click()
 assert download.value.suggested_filename.endswith(".svg")
 with p.expect_download() as download:
  p.locator('[data-action="trace-png"]').click()
 assert download.value.suggested_filename.endswith(".png")
 p.locator('[data-action="trace-view"][data-trace-value="photo"]').click()
 p.screenshot(path=str(OUT/f"image-tracer-photo-overlay-{width}.png"),full_page=True,animations="disabled")
 p.locator('[data-action="trace-use"]').click()
 assert p.locator('[data-source-node="C32"]').count()==1
 assert p.locator('.trace-entry-panel .image-trace-svg').count()==1
 result=saved(p)
 assert len(result["entries"])==1 and result["entries"][0]["status"]=="planned"
 assert result["entries"][0]["result"]==""
 assert result["entries"][0]["imageTraceId"]==result["imageTracer"]["figures"][0]["id"]
 p.reload(wait_until="networkidle")
 assert saved(p)["entries"][0]["imageTraceId"]==result["entries"][0]["imageTraceId"]
 assert len(saved(p)["imageTracer"]["figures"])==1
 assert p.locator(".trace-entry-panel .image-trace-svg").count()==1
 p.locator('.trace-entry-panel [data-action="trace-open"]').click()
 assert p.locator('[data-image-tracer]').count()==1
 assert len(saved(p)["imageTracer"]["draft"]["points"])==3
 # A modification invalidates prior completed interpretations only when saved.
 p.locator('[data-action="trace-undo"]').click()
 assert len(saved(p)["imageTracer"]["draft"]["points"])==2
 p.locator('[data-action="trace-save"]').click()
 assert len(saved(p)["imageTracer"]["figures"])==1
 no_overflow(p)

results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1480,900),(390,844)]:
  ctx,p=prepare(browser,width,height)
  errors=[];p.on("pageerror",lambda err:errors.append(str(err)))
  try:
   run(p,width)
   assert not errors,errors
   results.append({"viewport":width,"status":"passed"})
  except Exception as ex:
   traceback.print_exc()
   results.append({"viewport":width,"status":"FAILED","error":str(ex),"pageErrors":errors})
   p.screenshot(path=str(OUT/f"image-tracer-FAILED-{width}.png"),full_page=True,animations="disabled")
  finally:ctx.close()
 browser.close()
(OUT/"image-tracer-results.json").write_text(json.dumps(results,indent=2))
if any(x["status"]!="passed" for x in results):
 raise SystemExit("Image-tracer browser acceptance failed: "+json.dumps(results))
print("Image tracer desktop and mobile browser tests passed.")
