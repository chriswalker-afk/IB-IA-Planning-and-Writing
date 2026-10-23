"""Browser acceptance for the three-mode mathematical journey explorer.
Runs on the built GitHub Pages distribution, with synthetic device-local plans.
Nothing represents student work, an approved IA or collected evidence.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"))
OUT.mkdir(parents=True,exist_ok=True)
KEY="ia-pathfinder-prototype-v1"
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
RESULTS=[]

def plan():
 s=copy.deepcopy(BASE)
 s["route"]="planning"
 s["planning"]["current"]="N02M"
 s["journey"]["currentNodeId"]="N02M"
 s["planning"]["fields"].update({
  "kind":"modelling","course":"AI SL",
  "aim":"How could a scaled recording help model the trajectory of a football?",
  "beneficiary":"I want to understand how a model explains an observed flight path.",
  "provisionalTitle":"Investigating a measured football flight"
 })
 return s
def state(p):
 return p.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)
def action(p,name,**attrs):
 selector='[data-action="'+name+'"]'
 for k,v in attrs.items():
  key={"route_id":"route-id","math_id":"math-id","family":"family","mode":"mode"}.get(k,k.replace("_","-"))
  selector+='[data-'+key+'="'+str(v)+'"]'
 p.locator(selector).first.click()

def check(p,width):
 assert p.locator('.journey-mode-tab').count()==3
 assert p.locator('#journey-mode-panel').count()==1
 assert p.locator('[data-action="math-open-route"][data-route-id="trajectories"]').count()==1
 assert state(p)["planning"]["routeExplorer"]["selectedRoute"]==""
 assert state(p)["planning"]["mathSelected"]==[]
 action(p,"math-open-route",route_id="trajectories")
 assert p.locator('#journey-detail-title').inner_text()=='Movement and trajectories'
 assert p.locator(".journey-branch").count()==3
 assert "What does the measured path actually allow you to model?" in p.locator(".journey-flow-decision").inner_text()
 p.locator(".journey-branch").first.locator("summary").click()
 assert p.locator(".journey-branch").first.evaluate("(e)=>e.open")
 assert "Possible next move:" in p.locator(".journey-branch-body").first.inner_text()
 p.screenshot(path=str(OUT/f"journey-branch-{width}.png"),full_page=True,animations="disabled")
 action(p,"math-select-route",route_id="trajectories")
 saved=state(p)
 assert saved["planning"]["routeExplorer"]["selectedRoute"]=="trajectories"
 assert saved["planning"]["routeExplorer"]["firstStep"]=="Calibrate the movement"
 assert saved["planning"]["mathSelected"]==[]
 assert p.locator(".journey-route-spark").is_visible()
 assert p.locator(".journey-route-spark").inner_text().find("Calibrate the movement")>=0
 action(p,"plan-toggle-math",math_id="AI05")
 assert state(p)["planning"]["mathSelected"]==["AI05"]
 assert p.locator('[data-action="plan-toggle-math"][data-math-id="AI05"]').first.get_attribute("aria-pressed")=="true"
 action(p,"math-mode",mode="routes")
 assert p.locator('.journey-family-section').count()==4
 assert p.locator('.journey-card').count()==16
 assert p.locator('[role="tab"][data-mode="routes"]').get_attribute('aria-selected')=='true'
 action(p,"math-family",family="models")
 assert p.locator('.journey-card').count()==4
 assert p.locator('.journey-route-spark').is_visible()
 action(p,"math-mode",mode="all")
 assert p.locator(".journey-route-spark").is_visible()
 assert p.locator('.plan-math-option').count()>=20
 search=p.locator("#planMathSearch")
 search.fill("Voronoi")
 assert p.locator('.plan-math-option:visible').count()==1
 assert 'Voronoi' in p.locator('.plan-math-option:visible').first.inner_text()
 assert state(p)["planning"]["mathSelected"]==["AI05"]
 # Revisit from Complete list must return to the branching journey (not a dead action).
 p.locator('.journey-route-spark [data-revisit="true"]').click()
 assert p.locator('#journey-detail-title').inner_text()=='Movement and trajectories'
 assert state(p)["planning"]["routeExplorer"]["mode"]=='routes'
 assert p.locator("#journey-detail").is_visible()
 p.screenshot(path=str(OUT/f"journey-gallery-{width}.png"),full_page=True,animations="disabled")
 # A different course must not silently reinterpret previously selected mathematics.
 p.locator('[data-choice="planning.fields.course"][data-value="AA SL"]').click()
 assert state(p)["planning"]["mathSelected"]==["AI05"]
 assert state(p)["planning"]["routeExplorer"]["selectedRoute"]=="trajectories"
 assert 'AA SL' in p.locator('.journey-maths-current').inner_text()
 assert p.locator('.journey-course-switch-note').is_visible()
 assert 'preserved' in p.locator('.journey-course-switch-note').inner_text()
 assert p.locator('[data-action="plan-toggle-math"][data-math-id="AA06"]').count()>=1
 assert p.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),p.evaluate("({inner:innerWidth,doc:document.documentElement.scrollWidth})")
 assert not any('undefined' in h.lower() for h in p.locator('.journey-detail h3').all_inner_texts())
 # Explicitly removing the route does not delete a separately chosen mathematics technique.
 action(p,"math-remove-route")
 assert state(p)["planning"]["routeExplorer"]["selectedRoute"]==""
 assert state(p)["planning"]["mathSelected"]==["AI05"]


def handoff(p,width):
 # A rated Idea Lab possibility has been explicitly selected as the aim.
 # Its route must be a hint, not a saved mathematical decision.
 fresh=plan()
 fresh["ideaExplorer"]["shortlist"]=[{
  "id":"idea-1","savedId":"idea-1","seedId":"math-sport-trajectory",
  "question":fresh["planning"]["fields"]["aim"],
  "focus":"Sport & performance → Model movement",
  "fromMap":True,"clarity":4,"quickStart":3,"difficulties":[],
  "mapOrigin":{"mode":"interests","root":"hobbies","topic":"sport",
               "dataBranch":"","mathRoute":"trajectories"}
 }]
 fresh["ideaExplorer"]["selectedId"]="idea-1"
 p.evaluate("(payload)=>localStorage.setItem(payload.key,JSON.stringify(payload.state))",
  {"key":KEY,"state":fresh})
 p.reload(wait_until="networkidle")
 note=p.locator('[data-idea-lab-handoff="maths"]')
 assert note.is_visible()
 assert "Model movement" in note.inner_text()
 assert state(p)["planning"]["routeExplorer"]["selectedRoute"]==""
 assert state(p)["planning"]["mathSelected"]==[]
 assert p.locator('.idea-lab-handoff [data-action="plan-toggle-math"]').count()==0
 note.locator('[data-action="math-open-route"][data-route-id="trajectories"]').click()
 assert p.locator("#journey-detail-title").inner_text()=="Movement and trajectories"
 assert state(p)["planning"]["routeExplorer"]["selectedRoute"]==""
 action(p,"math-select-route",route_id="trajectories")
 assert state(p)["planning"]["routeExplorer"]["selectedRoute"]=="trajectories"
 assert state(p)["planning"]["mathSelected"]==[]
 assert "explicitly saved" in p.locator('[data-idea-lab-handoff="maths"]').inner_text()
 p.screenshot(path=str(OUT/f"idea-lab-to-planning-{width}.png"),full_page=True,animations="disabled")
 # Reduced advice hides optional detail without erasing saved work.
 value=state(p)
 value["ui"]["adviceMode"]="reduced"
 p.evaluate("(payload)=>localStorage.setItem(payload.key,JSON.stringify(payload.state))",
  {"key":KEY,"state":value})
 p.reload(wait_until="networkidle")
 assert p.locator('[data-idea-lab-handoff="maths"]').is_visible()
 assert "One first calculation" not in p.locator('[data-idea-lab-handoff="maths"]').inner_text()
 assert state(p)["planning"]["routeExplorer"]["selectedRoute"]=="trajectories"
 assert p.evaluate("document.documentElement.scrollWidth <= window.innerWidth+1")

with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1440,900),(390,844)]:
  ctx=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
  ctx.route("https://fonts.googleapis.com/**",lambda route:route.abort())
  p=ctx.new_page()
  p.set_default_timeout(14000)
  errors=[]
  p.on("pageerror",lambda error:errors.append(str(error)))
  fresh=plan()
  p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
   json.dumps(KEY)+","+json.dumps(json.dumps(fresh))+");")
  try:
   p.goto(URL,wait_until="networkidle",timeout=28000)
   check(p,width)
   handoff(p,width)
   assert not errors,errors
   RESULTS.append({"viewport":f"{width}x{height}","status":"passed"})
  except Exception as ex:
   traceback.print_exc()
   RESULTS.append({"viewport":f"{width}x{height}","status":"FAILED","error":str(ex),"pageErrors":errors})
   p.screenshot(path=str(OUT/f"journey-error-{width}.png"),full_page=True,animations="disabled")
  ctx.close()
 browser.close()
(OUT/"investigative-routes-results.json").write_text(json.dumps(RESULTS,indent=2))
print(json.dumps(RESULTS,indent=2))
assert all(result["status"]=="passed" for result in RESULTS)
