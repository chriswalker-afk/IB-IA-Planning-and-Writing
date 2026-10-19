"""Pass 3 acceptance: create actual data natively, plot it, reuse it, and restore snapshots."""
import copy,json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))

def state(page):
 return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def no_overflow(page):
 dims=page.evaluate("({width:innerWidth,actual:document.documentElement.scrollWidth})")
 assert dims["actual"]<=dims["width"]+2,dims
def setup(browser,width,height,mobile):
 seed=copy.deepcopy(BASE)
 seed["route"]="completing";seed["completion"]["current"]="C31"
 seed["planning"]["fields"].update({"aim":"How does travelled distance change with time?",
   "kind":"statistics","course":"AI SL"})
 context=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,accept_downloads=True)
 page=context.new_page();page.set_default_timeout(15000)
 page.on("dialog",lambda d:d.accept())
 errors=[];page.on("pageerror",lambda err:errors.append(str(err)))
 page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
  json.dumps(KEY)+","+json.dumps(json.dumps(seed))+");")
 page.goto(URL,wait_until="networkidle")
 return context,page,errors

def heading(page,type,col,text):
 page.locator(f'[data-native-grid="{type}"] [data-native-heading][data-native-col="{col}"]').fill(text)

def cell(page,type,row,col,value):
 page.locator(f'[data-native-grid="{type}"] [data-native-cell][data-native-row="{row}"][data-native-col="{col}"]').fill(value)

def run_journey(page,width):
 assert page.locator('[data-action="graph-open"]').count()==1
 page.locator('[data-action="graph-open"]').click()
 assert page.locator('[data-native-grid="graph"]').is_visible()
 assert page.locator('[data-native-grid="graph"] [data-native-cell]').count()>=8
 assert not state(page)["graphStudio"]["draft"]["matrix"]
 assert page.locator('[data-action="graph-use"]').is_disabled()
 heading(page,"graph",0,"Time (s)");heading(page,"graph",1,"Distance (m)")
 for i in range(4):
  cell(page,"graph",i,0,["0.00","1.20","2.40","3.60"][i])
  cell(page,"graph",i,1,["0.00","2.50","5.10","7.40"][i])
 g=state(page)["graphStudio"]["draft"]
 assert g["matrix"][1][0]=="1.20"
 assert g["xLabel"]=="Time" and g["xUnit"]=="s"
 assert g["yLabel"]=="Distance" and g["yUnit"]=="m"
 assert g["raw"]==""
 assert "4 paired observations plotted" in page.locator('[data-graph-preview-meta]').inner_text()
 assert page.locator('[data-native-choices="graph"] select').count()==2
 page.locator('[data-graph-field="title"]').fill("Distance travelled over time")
 page.locator('[data-graph-field="sourceKind"]').select_option("primary")
 assert page.locator('[data-action="graph-use"]').is_enabled()
 no_overflow(page)
 # Enter moves down one working row without dropping the active value.
 first=page.locator('[data-native-grid="graph"] [data-native-cell][data-native-row="0"][data-native-col="0"]')
 first.focus();page.keyboard.press("Enter")
 assert page.evaluate("document.activeElement.dataset.nativeRow")=="1"
 # Save source dataset as a reusable, independent original copy.
 page.locator('[data-native-name="graph"]').fill("Walking trial measurements")
 page.locator('[data-action="native-save-dataset"][data-native-type="graph"]').click()
 saved=state(page)
 assert len(saved["dataShelf"])==1
 assert saved["dataShelf"][0]["matrix"][1][0]=="1.20"
 assert saved["dataShelf"][0]["columns"]==["Time (s)","Distance (m)"]
 # Move to statistics without going through spreadsheet paste.
 page.locator('[data-action="native-send"][data-native-to="stat"]').click()
 assert page.locator('[data-stat-studio]').is_visible()
 stat=state(page)["statStudio"]["draft"]
 assert stat["columns"]==saved["dataShelf"][0]["columns"]
 assert stat["matrix"][1][0]=="1.20"
 assert stat["sourceKind"]=="primary"
 page.locator('[data-action="stat-kind"][data-stat-value="box"]').click()
 page.locator('[data-stat-field="title"]').fill("Measured times: four readings")
 assert "Time (s)" in page.locator('[data-native-grid="stat"]').inner_text()
 assert page.locator('[data-native-choices="stat"] input[type=checkbox]').count()>=2
 no_overflow(page)
 # Move same values to Table Studio, whose formatting already sizes columns.
 page.locator('[data-action="native-send"][data-native-to="table"]').click()
 assert page.locator('[data-table-studio]').is_visible()
 t=state(page)["tableStudio"]["draft"]
 assert t["matrix"][1][0]=="1.20"
 assert t["unitDecisions"][0]["unit"]=="s"
 assert t["unitDecisions"][1]["unit"]=="m"
 page.locator('[data-table-field="title"]').fill("Four sample times and distances")
 assert page.locator('[data-action="table-use"]').is_enabled()
 assert page.locator('[data-table-preview] svg').is_visible()
 cell(page,"table",0,0,"99.99")
 assert state(page)["dataShelf"][0]["matrix"][0][0]=="0.00"
 assert state(page)["graphStudio"]["draft"]["matrix"][0][0]=="0.00"
 # Explicitly reload the original saved copy; the edit is reversible.
 page.locator('details.native-shelf-list').evaluate("(d)=>d.open=true")
 page.locator('[data-action="native-load"][data-native-type="table"]').first.click()
 assert state(page)["tableStudio"]["draft"]["matrix"][0][0]=="0.00"
 # Grid is still native input after importing: add a column, then remove it.
 page.locator('[data-action="native-add-column"][data-native-type="table"]').click()
 assert len(state(page)["tableStudio"]["draft"]["columns"])==3
 page.locator('[data-action="native-remove-column"][data-native-type="table"]').click()
 assert len(state(page)["tableStudio"]["draft"]["columns"])==2
 # A clipboard block can be pasted directly into the editing grid, not the old import form.
 block="5.00\t10.00\n6.00\t12.00"
 page.locator('[data-native-grid="table"] [data-native-cell][data-native-row="0"][data-native-col="0"]').focus()
 page.evaluate("""(contents)=>{
  const d=new DataTransfer();d.setData('text/plain',contents);
  document.activeElement.dispatchEvent(new ClipboardEvent('paste',
   {bubbles:true,cancelable:true,clipboardData:d}));
 }""",block)
 t=state(page)["tableStudio"]["draft"]
 assert t["matrix"][0]==["5.00","10.00"]
 assert t["matrix"][1]==["6.00","12.00"]
 assert t["raw"]==""
 assert page.locator('[data-table-preview] svg').is_visible()
 assert len(state(page)["dataShelf"])==1
 # Project JSON contains the original reusable data, not just the graph and table previews.
 page.reload(wait_until="networkidle")
 assert len(state(page)["dataShelf"])==1
 assert state(page)["tableStudio"]["draft"]["matrix"][0][0]=="5.00"
 no_overflow(page)
 page.screenshot(path=str(OUT/f"native-data-pass3-{width}.png"),full_page=True,animations="disabled")

if __name__=="__main__":
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width,height,mobile in [(1440,900,False),(390,844,True)]:
   context,page,errors=setup(browser,width,height,mobile)
   try:
    run_journey(page,width)
    assert not errors,errors
    print(f"PASS native data cross-generator journey: {width}x{height}, mobile={mobile}",flush=True)
   finally:
    context.close()
  browser.close()
