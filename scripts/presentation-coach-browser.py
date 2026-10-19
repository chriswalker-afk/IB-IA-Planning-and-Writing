"""Pass 4: browser acceptance for route/data guidance and truthful IA handovers.

All observations are fictional fixture data. Nothing is sent to a server.
"""
import copy,json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"))
OUT.mkdir(exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
def saved(page):
 return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def prepare(browser,width,height,mobile):
 s=copy.deepcopy(BASE)
 s["route"]="completing";s["completion"]["current"]="C31"
 s["planning"]["routeExplorer"]["selectedRoute"]="relationships"
 s["planning"]["fields"].update({
  "aim":"How does distance travelled change with elapsed time?",
  "kind":"statistics","course":"AI SL","dataSource":"primary",
  "primaryPopulation":"Students in one class",
  "primarySamplingMethod":"convenience",
  "primarySamplingUnit":"One student"})
 s["planning"]["accuracyPlans"]=[{
  "id":"pa-primary-1","source":"primary","quantity":"Time","unit":"s",
  "resolution":"Nearest 0.01 s","basis":"digital","uncertainty":"to confirm"}]
 s["completion"]["fields"]["firstPurpose"]="Inspect paired times and distances before attempting a model"
 context=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,
  has_touch=mobile,accept_downloads=True)
 page=context.new_page();page.set_default_timeout(15000)
 page.on("dialog",lambda dialog:dialog.accept())
 errors=[]
 page.on("pageerror",lambda err:errors.append(str(err)))
 page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
  json.dumps(KEY)+","+json.dumps(json.dumps(s))+");")
 page.add_init_script("""Object.defineProperty(navigator, 'clipboard',
  {configurable:true,value:{writeText:async text=>{window.__copiedCaption=text;}}})""")
 page.goto(URL,wait_until="networkidle")
 return context,page,errors

def no_overflow(page):
 dim=page.evaluate("({screen:innerWidth,document:document.documentElement.scrollWidth})")
 assert dim["document"]<=dim["screen"]+2,dim

def run(page,width):
 assert page.locator('[data-representation-hub]').count()==1
 assert page.locator('[data-hub-dataset-evidence]').count()==1
 assert 'provisional' in page.locator('[data-representation-context],.representation-context').inner_text().lower()
 page.locator('[data-action="graph-open"]').first.click()
 assert page.locator('[data-presentation-coach="graph"]').is_visible()
 assert page.locator('[data-figure-handover="graph"]').is_visible()
 page.locator('[data-native-grid="graph"] [data-native-heading][data-native-col="0"]').fill("Time (s)")
 page.locator('[data-native-grid="graph"] [data-native-heading][data-native-col="1"]').fill("Distance (m)")
 for i,(x,y) in enumerate([("0.00","0.10"),("1.00","2.10"),("2.00","4.30"),("3.00","6.20")]):
  page.locator(f'[data-native-grid="graph"] [data-native-cell][data-native-row="{i}"][data-native-col="0"]').fill(x)
  page.locator(f'[data-native-grid="graph"] [data-native-cell][data-native-row="{i}"][data-native-col="1"]').fill(y)
 html=page.locator('[data-presentation-coach="graph"]').inner_text()
 assert "Make this mathematics communicate" in html
 assert "Matching measurement-accuracy spark" in html
 assert "Sampling and population context" in html
 assert "Planned" in html and "not a grade" in html
 assert "Scatter diagram" in html
 page.locator('[data-graph-field="title"]').fill("Distance travelled over time")
 page.locator('[data-graph-field="figureNumber"]').fill("7")
 page.locator('[data-graph-field="caption"]').fill("Observed pairs prior to modelling")
 page.locator('[data-graph-field="sourceKind"]').select_option("primary")
 assert "Required checks passed" in page.locator('[data-graph-quality]').inner_text()
 assert page.locator('[data-action="graph-use"]').is_enabled()
 label=page.locator('[data-figure-handover="graph"] .ia-handover-caption-text').inner_text()
 assert "Figure 7. Distance travelled over time" in label,label
 assert "Observed pairs prior to modelling" in label
 assert "own collected" in label
 assert "strong correlation" not in label
 page.locator('[data-action="presentation-copy-caption"][data-presentation-type="graph"]').click()
 page.wait_for_function("window.__copiedCaption?.includes('Figure 7. Distance travelled over time')")
 assert "strong correlation" not in page.evaluate("window.__copiedCaption")
 no_overflow(page)
 page.screenshot(path=str(OUT/f"pass4-graph-coach-{width}.png"),full_page=True,animations="disabled")
 page.locator('[data-action="graph-use"]').click()
 snap=saved(page)
 assert len(snap["graphStudio"]["figures"])==1
 assert snap["graphStudio"]["figures"][0]["draft"]["figureNumber"]=="7"
 assert snap["graphStudio"]["figures"][0]["draft"]["caption"]=="Observed pairs prior to modelling"
 assert snap["entries"][0]["result"]==""
 assert snap["entries"][0]["status"]=="planned"
 # Bring the saved figure back to the student-authored first-maths writing screen.
 page.evaluate("""key=>{
  const saved=JSON.parse(localStorage.getItem(key));
  saved.completion.current="C30";
  saved.graphStudio.open=false;
  localStorage.setItem(key,JSON.stringify(saved));
 }""",KEY)
 page.reload(wait_until="networkidle")
 disclosure=page.locator('[data-figure-handover="graph"].ia-handover-linked')
 assert disclosure.count()==1
 assert not disclosure.get_attribute("open")
 disclosure.locator("summary").click()
 assert "Figure 7. Distance travelled over time" in disclosure.inner_text()
 assert "feature actually visible" in disclosure.inner_text()
 assert page.locator('[data-show-first-writing-box="reflect"]').count()==1
 disclosure.locator('[data-action="presentation-copy-caption"]').click()
 page.wait_for_function("window.__copiedCaption?.includes('Figure 7. Distance travelled over time')")
 no_overflow(page)
 page.screenshot(path=str(OUT/f"pass4-linked-figure-{width}.png"),full_page=True,animations="disabled")
 # Start a separate histogram studio to verify that the displayed suggestion is actionable.
 page.evaluate("""key=>{
  const s=JSON.parse(localStorage.getItem(key));
  s.completion.current="C31";
  s.graphStudio.open=false;
  s.statStudio.open=true;
  s.statStudio.draft.columns=["Mass (kg)"];
  s.statStudio.draft.matrix=[["1.1"],["2.2"],["3.3"],["4.4"],["5.5"]];
  s.statStudio.draft.selected=[0];
  s.statStudio.draft.variable="Mass";s.statStudio.draft.unit="kg";
  s.statStudio.draft.unitMode="unit";
  localStorage.setItem(key,JSON.stringify(s));
 }""",KEY)
 page.reload(wait_until="networkidle")
 assert page.locator('[data-presentation-coach="stat"]').is_visible()
 assert page.locator('[data-presentation-coach="stat"] [data-action="stat-kind"][data-stat-value="dot"]').count()==1
 page.locator('[data-presentation-coach="stat"] [data-action="stat-kind"][data-stat-value="dot"]').click()
 assert saved(page)["statStudio"]["draft"]["kind"]=="dot"
 assert page.locator('[data-figure-handover="stat"]').is_visible()
 no_overflow(page)
 # Other generators receive the same tools without needing fake inputs.
 for tool,flag in [("table","tableStudio"),("trace","imageTracer"),("voronoi","voronoiStudio")]:
  page.evaluate("""([key,flag])=>{
   const s=JSON.parse(localStorage.getItem(key));
   s.completion.current="C31";
   for(const studio of ["graphStudio","statStudio","tableStudio","imageTracer","voronoiStudio"])
    s[studio].open=(studio===flag);
   localStorage.setItem(key,JSON.stringify(s));
  }""",[KEY,flag])
  page.reload(wait_until="networkidle")
  assert page.locator(f'[data-presentation-coach="{tool}"]').count()==1,tool
  assert page.locator(f'[data-figure-handover="{tool}"] [data-action="presentation-copy-caption"]').count()==1,tool
  no_overflow(page)

if __name__=="__main__":
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  for width,height,mobile in [(1440,900,False),(390,844,True)]:
   context,page,errors=prepare(browser,width,height,mobile)
   try:
    run(page,width)
    assert not errors,errors
    print(f"PASS IB-aware figure coach + writing journey: {width} px",flush=True)
   finally:
    context.close()
  browser.close()
