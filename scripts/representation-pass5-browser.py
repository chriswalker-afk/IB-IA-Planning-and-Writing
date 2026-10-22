"""Pass 5: actual route, stage, reduced-mode and seven-creator interactions.
No networked student data and no invented research findings.
"""
import copy,json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/representation-pass5"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
GROUPS={"data":{"graph","stat","table"},"geometry":{"trace","geometry","voronoi"}}
ALL={"graph","stat","table","trace","voronoi","geometry","probability"}
ROUTES={"relationships":"graph","groups":"stat","categorical":"table",
 "variation":"stat","fitted-models":"graph","growth":"graph","cycles":"graph",
 "trajectories":"trace","optimisation":"graph","images":"trace","triangulation":"geometry",
 "voronoi":"voronoi","finance":"table","chance":"probability","proof":"graph","iteration":"graph"}

def saved(p):return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def width_ok(p):
 q=p.evaluate("({viewport:innerWidth,document:document.documentElement.scrollWidth})")
 assert q["document"]<=q["viewport"]+2,q
def context(browser,width,state):
 c=browser.new_context(viewport={"width":width,"height":900},is_mobile=width<600,has_touch=width<600)
 p=c.new_page();p.set_default_timeout(16000)
 errors=[];p.on("pageerror",lambda error:errors.append(str(error)))
 p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(state))+");")
 p.goto(URL,wait_until="networkidle")
 return c,p,errors
def chooser(browser,width):
 st=copy.deepcopy(BASE);st["route"]="completing";st["completion"]["current"]="C31"
 st["ui"]["writingIntroSeen"]=True;st["planning"]["routeExplorer"]["selectedRoute"]="chance"
 c,p,errors=context(browser,width,st)
 try:
  hub=p.locator("[data-representation-hub]")
  assert hub.is_visible()
  assert "Saved provisional pathway" in hub.inner_text()
  def actions(q):
   return [x for x in q.locator("[data-action]").evaluate_all(
    "(nodes)=>nodes.map(n=>n.dataset.action).filter(x=>x.endsWith('-open'))")]
  assert set(actions(hub))=={"graph-open","stat-open","table-open","trace-open","voronoi-open","geometry-open","probability-open"}
  assert hub.locator("[data-representation-recommended] [data-action='probability-open']").count()==1
  for purpose in ("geometry","models","decisions","all"):
   hub.locator('[data-action="representation-filter"][data-representation-filter="'+purpose+'"]').click()
   hub=p.locator("[data-representation-hub]")
   picked=actions(hub)
   assert len(picked)==len(set(picked)),(purpose,picked)
   if purpose=="geometry":
    assert set(picked)=={"trace-open","geometry-open","voronoi-open"},picked
    assert "No tools in this category" not in hub.inner_text()
   if purpose=="all":assert len(picked)==7,picked
   width_ok(p)
  p.screenshot(path=str(OUT/f"all-generators-{width}.png"),full_page=True,animations="disabled")
  # Reduced advice removes optional prose without removing a tool or help.
  p.evaluate("""() => {
   const key='ia-pathfinder-prototype-v1',s=JSON.parse(localStorage.getItem(key));
   s.ui.adviceMode='reduced';localStorage.setItem(key,JSON.stringify(s));
  }""")
  p.reload(wait_until="networkidle")
  hub=p.locator("[data-representation-hub]")
  assert hub.get_attribute("data-representation-advice-mode")=="reduced"
  assert len(actions(hub))==7
  assert hub.locator(".representation-optional-context").count()==1
  hub.locator(".representation-optional-context summary").click()
  assert "No editable dataset" in hub.locator(".representation-optional-context").inner_text()
  assert p.locator('[data-action="probability-open"]').count()>=1
  p.locator('[data-action="probability-open"]').first.click()
  assert p.locator("[data-probability-studio]").is_visible()
  assert p.locator('[data-action="representation-return"]').count()==1
  assert p.locator("[data-prob-quality]").count()==1
  width_ok(p)
  p.screenshot(path=str(OUT/f"reduced-probability-{width}.png"),full_page=True,animations="disabled")
  p.locator('[data-action="representation-return"]').first.click()
  assert p.locator('[data-source-node="C30"]').count()==1
  assert saved(p)["completion"]["current"]=="C30"
  assert not errors,errors
  print("PASS chooser",width,flush=True)
 finally:c.close()

def later(browser,width,node,index):
 st=copy.deepcopy(BASE);st["route"]="completing";st["completion"]["current"]=node
 st["ui"]["writingIntroSeen"]=True;st["planning"]["routeExplorer"]["selectedRoute"]="images"
 st["entries"]=[{"id":"first","phase":"first","status":"completed","title":"Initial work",
                "result":"Actual earlier result","kind":"diagram","technique":"Geometric model"},
               {"id":"later-one","phase":"substantial","fromEntryId":"first","status":"planned","methodId":"probability",
                "title":"Conditional comparison","kind":"other","result":""},
               {"id":"later-two","phase":"substantial","fromEntryId":"later-one","status":"planned",
                "methodId":"probability","kind":"other","title":"Third stage","result":""}]
 st["completion"]["activeEntryIndex"]=index
 c,p,errors=context(browser,width,st)
 try:
  assert p.locator('[data-source-node="'+node+'"]').count()==1
  picker=p.locator(".show-first-tool-picker")
  assert picker.count()==1,node
  picker.locator("summary").first.click()
  hub=picker.locator("[data-representation-hub]")
  assert hub.locator("[data-representation-recommended] [data-action='probability-open']").count()==1
  assert hub.locator("[data-representation-recommended] [data-action='trace-open']").count()==0
  picker.locator('[data-action="probability-open"]').first.click()
  assert p.locator("[data-probability-studio]").is_visible()
  p.locator('[data-action="representation-return"]').first.click()
  assert p.locator('[data-source-node="'+node+'"]').count()==1
  assert saved(p)["completion"]["activeEntryIndex"]==index
  assert saved(p)["entries"][index]["status"]=="planned"
  width_ok(p)
  if width==390:p.screenshot(path=str(OUT/f"later-stage-{node}-{width}.png"),full_page=True,animations="disabled")
  assert not errors,errors
  print("PASS later",node,width,flush=True)
 finally:c.close()

def planning_to_creator(browser,width):
 st=copy.deepcopy(BASE);st["route"]="planning";st["scratch"]["introduction"]="Preserve this note"
 st["ui"]["planningIntroSeen"]=False
 c,p,errors=context(browser,width,st)
 try:
  p.locator(".chapter-onboarding-plan [data-action='resource-browse']").click()
  drawer=p.locator(".resource-drawer");assert drawer.is_visible()
  assert drawer.locator(".resource-creator-card").count()==7
  drawer.locator('[data-resource-creator="geometry"]').click()
  assert p.locator("[data-geometry-studio]").is_visible()
  assert saved(p)["scratch"]["introduction"]=="Preserve this note"
  p.locator('[data-action="resource-creator-return"]').first.click()
  assert saved(p)["route"]=="planning"
  assert saved(p)["scratch"]["introduction"]=="Preserve this note"
  assert not saved(p)["entries"]
  width_ok(p)
  assert not errors,errors
  print("PASS library return",width,flush=True)
 finally:c.close()

if __name__=="__main__":
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width in (1440,390):
   chooser(browser,width)
   for node,index in (("C40",1),("C50",2)):later(browser,width,node,index)
   planning_to_creator(browser,width)
  browser.close()
