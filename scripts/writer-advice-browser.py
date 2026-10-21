"""Pass 2 real-browser checks: original advice remains visible on demand, never silently lost."""
import copy, json, os, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output")) / "writer-advice"
OUT.mkdir(parents=True,exist_ok=True)
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(
 ["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],
 text=True))

CASES=[("C10","introduction",6),("C20","first-mathematics",4),
       ("C30","showing-mathematics",4),("C40","further-mathematics",4),
       ("C60","conclusion",4)]

def fixture(node):
 s=copy.deepcopy(BASE)
 s["route"]="completing"
 s["ui"]["writerGuideIntroSeen"]=True
 s["completion"]["current"]=node
 s["planning"]["fields"]["aim"]="What does the fictional pattern reveal?"
 s["planning"]["fields"]["motivation"]="I wanted to understand a mathematical pattern."
 s["planning"]["fields"]["course"]="AA SL"
 s["planning"]["fields"]["kind"]="statistics"
 s["planning"]["fields"]["dataSource"]="secondary"
 s["scratch"]["introduction"]="These are my original, private notes."
 s["entries"]=[{"id":"first-observation","phase":"first","status":"completed",
                "title":"First chart","result":"The pattern appears curved.",
                "localTakeaway":"A curved pattern appeared in the fictional sample.",
                "interpretation":"A line may be inappropriate."}]
 s["completion"]["activeEntryIndex"]=0
 if node=="C40":
  s["entries"].append({"id":"second-question","phase":"substantial",
                       "status":"planned","title":"Check a second model"})
  s["completion"]["activeEntryIndex"]=1
 return s

def run_case(browser,node,group,count,width):
 context=browser.new_context(viewport={"width":width,"height":850})
 page=context.new_page()
 state=fixture(node)
 page.add_init_script("localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(state))+");")
 errors=[]
 page.on("pageerror",lambda err: errors.append(str(err)))
 try:
  page.goto(URL,wait_until="networkidle",timeout=60000)
  assert page.locator('[data-source-node="'+node+'"]').count()==1,(width,node,"missing writing stage",page.url)
  # Page retains its primary task; general advice has moved behind one clear invitation.
  prompt=page.locator("#main .writer-guide-inline-more").first
  assert prompt.is_visible(),(width,node,"missing advice entrance")
  assert page.locator("#main [data-intro-advice],#main [data-first-maths-tip],#main [data-show-first-tip],#main [data-studio-tip]").count()==0,(width,node)
  original=page.evaluate("(k)=>JSON.parse(localStorage.getItem(k)).scratch.introduction",KEY)
  prompt.click()
  popin=page.locator("#writerGuidePopinLayer .writer-guide-popin")
  assert popin.is_visible(),(width,node,"no focused guide")
  assert popin.locator('[data-writer-advice-group="'+group+'"]').count()==1,(width,node,group)
  assert popin.locator("[data-stage-tip-id]").count()==count,(width,node,"some stage tips lost")
  assert popin.locator('.writer-guide-popin-practical').is_visible()
  popin.locator('.writer-guide-supplement-group > summary').click()
  assert popin.locator('.writer-guide-supplement-tip[open]').count()==1
  featured=popin.locator('.writer-guide-supplement-tip[open]').first
  assert featured.locator('.writer-guide-supplement-comparison > div').count()==2
  page.screenshot(path=str(OUT/f"{node}-{width}-focused.png"),animations="disabled")
  if width<701:
   box=popin.bounding_box()
   assert box and box["x"]>=-1 and box["x"]+box["width"]<=width+1,box
  popin.locator('[data-action="writer-guide-popin-full"]').click()
  full=page.locator(".writer-guide-drawer")
  assert full.is_visible()
  assert full.locator("[data-guide-card]").count()==14
  assert full.locator("[data-writer-advice-group]").count()==6
  assert full.locator("[data-stage-tip-id]").count()==26
  page.screenshot(path=str(OUT/f"{node}-{width}-full.png"),animations="disabled")
  full.locator('.drawer-header [data-action="close-drawer"]').click()
  assert page.locator("#writerGuidePopinLayer .writer-guide-popin").count()==0
  assert page.evaluate("(k)=>JSON.parse(localStorage.getItem(k)).scratch.introduction",KEY)==original
  assert not errors,(width,node,errors)
 finally:
  context.close()

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for width in (1440,390):
  for node,group,count in CASES:
   run_case(browser,node,group,count,width)
 browser.close()
print("Pass 2 writer-advice browser checks passed across five writing stages and both viewports.")
