"""Table Studio browser acceptance for real imports, automatic layout, exports and IA linking.
Uses fictional sample data only. Run in Chromium at desktop and phone widths.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
SHORT="Trial\tLength (cm)\tTime (s)\nA\t14.0\t2.3\nB\t15.6\t2.5\nC\t17.2\t2.8"
LARGE="Group A (cm)\tGroup B (cm)\n1\t2\n3\t4\n5\t6\n7\t8\n9\t10\n11\t12\n13\t14\n15\t16\n17\t18"
FREQUENCY="Preference\nWalk\nBus\nBus\nWalk\nCar\nBus\nWalk\nCycle"
def saved(p):
 return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def no_overflow(p):
 obj=p.evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})")
 assert obj["scrollWidth"]<=obj["width"]+1,obj
def prepare(browser,width,height):
 s=copy.deepcopy(BASE)
 s["route"]="completing";s["completion"]["current"]="C31"
 s["planning"]["fields"].update({"aim":"How do the numerical distributions of measurements compare?",
    "kind":"statistics","course":"AI SL"})
 context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
 p=context.new_page();p.set_default_timeout(14000)
 p.on("dialog",lambda dialog:dialog.accept())
 p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(s))+");")
 p.goto(URL,wait_until="networkidle")
 return context,p
def enter(p,value):
 p.locator('details.native-import-details').evaluate("(el)=>el.open=true")
 p.locator('[data-table-field="raw"]').fill(value)
 assert saved(p)["tableStudio"]["draft"]["raw"]==value
 p.locator('[data-action="table-parse"]').click()
 assert saved(p)["tableStudio"]["draft"]["pendingPaste"] is False
def standard(p,title):
 p.locator('[data-table-field="title"]').fill(title)
 p.locator('[data-table-field="sourceKind"]').select_option("primary")
 p.locator('[data-table-field="purpose"]').fill("These numbers help explain how the result relates to the original aim.")
def new_mode(p,kind):
 p.locator('[data-action="table-new"]').click()
 p.locator('[data-action="table-mode"][data-table-mode="'+kind+'"]').click()
 assert saved(p)["tableStudio"]["draft"]["mode"]==kind
def compact(p,width):
 p.locator('[data-action="table-open"]').click()
 assert p.locator('[data-table-studio]').is_visible()
 assert p.locator('[data-action="table-use"]').is_disabled()
 enter(p,SHORT)
 standard(p,"Selected measured trials")
 assert p.locator('[data-action="table-use"]').is_enabled()
 assert "Required checks passed" in p.locator("[data-table-quality]").inner_text()
 assert p.locator('[data-table-preview] svg text').count()>5
 box=p.locator('[data-table-preview] svg').get_attribute("viewBox").split()
 assert box[:2]==["0","0"] and 0<int(box[2])<=825 and int(box[3])>200
 assert p.locator('[data-table-field="cellAlignment"]').input_value()=="center"
 assert p.locator('[data-table-field="showColumnLines"]').is_checked()
 assert p.locator('[data-table-preview] .ia-table-column-divider').count()==2
 assert p.locator('[data-table-preview] .ia-table-svg').evaluate("(svg)=>parseFloat(getComputedStyle(svg).width)")<=int(box[2])+1
 assert p.locator('[data-table-preview] svg').is_visible()
 no_overflow(p)
 p.locator('[data-table-field="showColumnLines"]').uncheck()
 assert p.locator('[data-table-preview] .ia-table-column-divider').count()==0
 p.locator('[data-table-field="showColumnLines"]').check()
 assert p.locator('[data-table-preview] .ia-table-column-divider').count()==2
 p.locator('[data-table-field="cellAlignment"]').select_option("numeric")
 assert p.locator('[data-table-preview] svg text[text-anchor="end"]').count()>0
 p.locator('[data-table-field="cellAlignment"]').select_option("center")
 assert p.locator('[data-table-preview] svg text[text-anchor="middle"]').count()>0
 assert saved(p)["tableStudio"]["draft"]["cellAlignment"]=="center"
 # Mathematical shortcut inserts into the chosen field at the caret, not into observations.
 heading=p.locator('input[data-table-col="1"][data-table-part="heading"]')
 palette=heading.locator("xpath=../following-sibling::details[contains(@class,'ia-table-math-palette')]")
 palette.evaluate("(el)=>el.open=true")
 heading.evaluate("(el)=>{el.focus();el.setSelectionRange(3,3);}")
 palette.locator('[data-action="table-symbol"][data-table-token="x_i"]').click()
 assert heading.input_value()=="Lenx_igth"
 assert "xᵢ" in p.locator('[data-table-preview] svg').inner_text()
 assert saved(p)["tableStudio"]["draft"]["matrix"][0][1]=="14.0"
 heading.fill("Length")
 assert saved(p)["tableStudio"]["draft"]["headings"][1]=="Length"
 # Per-column precision affects display only, including independent significant figures.
 precision=p.locator("details.ia-table-precision-options")
 precision.evaluate("(el)=>el.open=true")
 p.locator('[data-table-format-index="1"][data-table-format-part="mode"]').select_option("dp")
 p.locator('[data-table-format-index="1"][data-table-format-part="digits"]').select_option("0")
 assert saved(p)["tableStudio"]["draft"]["columnFormats"]["compact:1"]["digits"]=="0"
 assert "14.0" not in p.locator('[data-table-preview] svg').inner_text()
 assert saved(p)["tableStudio"]["draft"]["matrix"][0][1]=="14.0"
 p.locator('[data-table-format-index="2"][data-table-format-part="mode"]').select_option("sf")
 p.locator('[data-table-format-index="2"][data-table-format-part="digits"]').select_option("3")
 assert "2.30" in p.locator('[data-table-preview] svg').inner_text()
 p.locator('[data-table-format-index="1"][data-table-format-part="mode"]').select_option("default")
 p.locator('[data-table-format-index="2"][data-table-format-part="mode"]').select_option("default")
 # Live paper preview represents portrait A4 without replacing the main editing preview.
 paper=p.locator('[data-table-a4] details')
 paper.evaluate("(el)=>el.open=true")
 assert p.locator('[data-table-a4] .ia-table-paper-page').is_visible()
 assert "20 mm margins" in p.locator('[data-table-a4]').inner_text()
 assert p.locator('[data-table-a4] .ia-table-svg').count()==1
 p.locator('[data-table-field="note"]').fill("Results recorded using the original resolution.")
 assert p.locator('[data-table-a4] details').get_attribute("open") is not None
 no_overflow(p)
 paper.evaluate("(el)=>el.open=false")
 precision.evaluate("(el)=>el.open=false")
 p.screenshot(path=str(OUT/f"table-studio-compact-{width}.png"),full_page=True,animations="disabled")
 p.evaluate("""() => {
  window.__tableTrace = [];
  document.addEventListener("click", e=>window.__tableTrace.push("clicked:"+(e.target.closest("[data-action]")?.dataset.action||"other")),true);
  const make=URL.createObjectURL.bind(URL);
  URL.createObjectURL=blob=>{window.__tableTrace.push("blob:"+blob.type);return make(blob);};
 }""")
 downloads=[]
 p.on("download",lambda download:downloads.append(download))
 for fmt,ext in [("svg","svg"),("html","html"),("csv","csv"),("png","png")]:
  print("Checking table export:",fmt,flush=True)
  try:
   p.locator('[data-action="table-'+fmt+'"]').click(timeout=4000)
   p.wait_for_timeout(500)
   print("Table debug events:",p.evaluate("window.__tableTrace"),flush=True)
   print("Download events:",[x.suggested_filename for x in downloads],flush=True)
   if not downloads:
    print("Button click target diagnosis:",p.locator('[data-action="table-'+fmt+'"]').evaluate("""(btn)=>{
      const rect=btn.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
      return {x,y,buttonDisabled:btn.disabled,style:getComputedStyle(btn).pointerEvents,
       coveringElement:document.elementFromPoint(x,y)?.outerHTML?.slice(0,260),
       parent:btn.parentElement?.outerHTML?.slice(0,260)}
    }"""),flush=True)
    p.locator('[data-action="table-'+fmt+'"]').dispatch_event("click")
    p.wait_for_timeout(250)
    print("After synthetic click:",p.evaluate("window.__tableTrace"),flush=True)
    print("Download events after synthetic:",[x.suggested_filename for x in downloads],flush=True)
   assert downloads and downloads[-1].suggested_filename.endswith("."+ext)
  except Exception:
   print("Table export feedback:",p.locator("#toast").inner_text(),flush=True)
   print("Table debug events:",p.evaluate("window.__tableTrace"),flush=True)
   print("SVG button:",p.locator('[data-action="table-svg"]').evaluate("(e)=>e.outerHTML"),flush=True)
   raise
 # Verify that the downloads agree with the preview and keep the original observations.
 svg_file=next((item for item in downloads if item.suggested_filename.endswith(".svg")),None)
 html_file=next((item for item in downloads if item.suggested_filename.endswith(".html")),None)
 csv_file=next((item for item in downloads if item.suggested_filename.endswith(".csv")),None)
 assert svg_file and html_file and csv_file
 svg_text=Path(svg_file.path()).read_text(encoding="utf-8")
 html_text=Path(html_file.path()).read_text(encoding="utf-8")
 csv_text=Path(csv_file.path()).read_text(encoding="utf-8")
 assert 'ia-table-column-divider' in svg_text
 assert 'text-align:center' in html_text
 assert '"14.0"' in csv_text and '"2.3"' in csv_text
 assert "Results recorded using the original resolution." in svg_text
 p.locator('[data-action="table-use"]').click()
 assert p.locator('[data-source-node="C30"]').count()==1
 assert p.locator('.ia-table-entry svg.ia-table-svg').count()==1
 state=saved(p)
 assert len(state["tableStudio"]["figures"])==1
 assert len(state["entries"])==1
 assert state["entries"][0]["status"]=="planned"
 assert state["entries"][0]["result"]==""
 assert state["entries"][0]["tableFigureId"]==state["tableStudio"]["figures"][0]["id"]
 p.reload(wait_until="networkidle")
 assert len(saved(p)["tableStudio"]["figures"])==1
 assert p.locator('.ia-table-entry svg.ia-table-svg').count()==1
 p.locator('.ia-table-entry [data-action="table-open"]').click()
 assert p.locator('[data-table-field="raw"]').input_value()==SHORT
def enforce_long_rule(p,width):
 new_mode(p,"compact")
 many="Value (cm)\n"+ "\n".join(str(i) for i in range(1,21))
 enter(p,many)
 standard(p,"Unacceptable raw data table")
 assert p.locator('[data-action="table-use"]').is_disabled()
 assert p.locator('[data-action="table-svg"]').is_disabled()
 assert "long raw-data table" in p.locator('[data-table-quality]').inner_text().lower()
 assert "appendix" in p.locator('[data-table-quality]').inner_text().lower()
 no_overflow(p)
 p.screenshot(path=str(OUT/f"table-studio-blocked-long-{width}.png"),full_page=True,animations="disabled")
def numerical_summary(p,width):
 new_mode(p,"summary")
 enter(p,LARGE)
 standard(p,"Means and medians for two groups")
 assert p.locator('[data-action="table-use"]').is_enabled()
 assert "Variable / group" in p.locator('[data-table-preview]').inner_text() or p.locator('[data-table-preview] svg text').count()>12
 assert p.locator('[data-table-preview] svg').is_visible()
 p.locator('[data-table-measure="sd"]').check()
 assert p.locator('[data-action="table-use"]').is_enabled()
 assert len(saved(p)["tableStudio"]["draft"]["measures"])==3
 # A fourth selection is deliberately rejected once three measures are chosen.
 p.locator('[data-table-measure="iqr"]').click()
 assert len(saved(p)["tableStudio"]["draft"]["measures"])==3
 assert p.locator('[data-action="table-use"]').is_enabled()
 no_overflow(p)
 p.screenshot(path=str(OUT/f"table-studio-summary-{width}.png"),full_page=True,animations="disabled")
def category_frequency(p,width):
 new_mode(p,"frequency")
 p.locator('details.native-import-details').evaluate("(el)=>el.open=true")
 p.locator('[data-table-field="headers"]').select_option("yes")
 enter(p,FREQUENCY)
 standard(p,"Frequency of transport preferences")
 assert p.locator('[data-action="table-use"]').is_enabled()
 assert p.locator('[data-table-preview] svg').is_visible()
 assert "Frequency" in p.locator('[data-table-preview]').inner_text() or p.locator('[data-table-preview] svg text').count()>9
 p.locator('[data-table-field="showPercent"]').uncheck()
 assert p.locator('[data-action="table-use"]').is_enabled()
 p.locator('[data-table-field="showPercent"]').check()
 assert p.locator('[data-action="table-use"]').is_enabled()
 no_overflow(p)
 p.screenshot(path=str(OUT/f"table-studio-frequencies-{width}.png"),full_page=True,animations="disabled")
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1480,900),(390,844)]:
  ctx,p=prepare(browser,width,height)
  errors=[];p.on("pageerror",lambda err:errors.append(str(err)))
  try:
   compact(p,width)
   enforce_long_rule(p,width)
   numerical_summary(p,width)
   category_frequency(p,width)
   assert not errors,errors
   results.append({"viewport":width,"status":"passed"})
  except Exception as exc:
   traceback.print_exc()
   results.append({"viewport":width,"status":"FAILED","error":str(exc),"pageErrors":errors})
   p.screenshot(path=str(OUT/f"table-studio-FAILED-{width}.png"),full_page=True,animations="disabled")
  finally:ctx.close()
 browser.close()
(OUT/"table-studio-results.json").write_text(json.dumps(results,indent=2))
if any(x["status"]!="passed" for x in results):
 raise SystemExit("Table Studio browser acceptance failed: "+json.dumps(results))
print("Table Studio desktop and mobile checks passed",results)
