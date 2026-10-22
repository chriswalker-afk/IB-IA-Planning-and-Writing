"""Probability Tree Studio interactive acceptance: fictional probabilities only."""
import json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/probability"))
OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
def saved(page):return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def set_branch(page,parent,index,value,label=None):
 if parent:
  stage=page.locator(".probability-stage").nth(len(parent))
  stage.evaluate("(el)=>el.open=true")
 selector='[data-prob-branch-parent="'+parent+'"][data-prob-branch-index="'+str(index)+'"]'
 if label is not None:page.locator(selector+'[data-prob-branch-key="label"]').fill(label)
 page.locator(selector+'[data-prob-branch-key="probability"]').fill(value)
def exercise(browser,width,height,touch):
 state=json.loads(json.dumps(BASE))
 state["route"]="completing";state["completion"]["current"]="C31"
 state["ui"]["writingIntroSeen"]=True
 state["planning"]["fields"].update({"kind":"theoretical","course":"AA SL",
                                     "aim":"How do successive fictional outcomes affect conditional risk?"})
 state["entries"]=[{"id":"qa-tree-stage","phase":"first","status":"planned","kind":"diagram",
                    "title":"","technique":"","result":""}]
 state["completion"]["activeEntryIndex"]=0
 state["probabilityStudio"]["open"]=True
 ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=touch,
  has_touch=touch,accept_downloads=True)
 page=ctx.new_page();page.set_default_timeout(18000)
 errors=[];page.on("pageerror",lambda error:errors.append(str(error)))
 page.on("dialog",lambda d:d.accept())
 page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(state))+");")
 try:
  page.goto(URL,wait_until="networkidle")
  assert page.locator("[data-probability-studio]").is_visible()
  def preview_width():return page.locator("[data-prob-preview]").evaluate(
   "(el)=>({visible:el.clientWidth,full:el.scrollWidth,left:el.scrollLeft})")
  fitted=preview_width()
  assert fitted["full"]<=fitted["visible"]+2,fitted
  page.locator('[data-action="probability-preview-detail"]').click()
  enlarged=preview_width()
  assert enlarged["full"]>enlarged["visible"]+80,enlarged
  assert saved(page)["probabilityStudio"]["zoomed"] is True
  page.locator('[data-action="probability-preview-fit"]').click()
  fitted=preview_width()
  assert fitted["full"]<=fitted["visible"]+2 and fitted["left"]==0,fitted
  assert saved(page)["probabilityStudio"]["zoomed"] is False
  assert page.locator('[data-action="probability-save"]').is_disabled()
  assert "Check before saving" in page.locator("[data-prob-quality]").inner_text()
  # Conditional probabilities belong to different histories; no branch is filled automatically.
  set_branch(page,"",0,"3/5","Success")
  assert "Success" in page.locator(".probability-stage").nth(1).locator("fieldset legend").first.text_content()
  set_branch(page,"",1,"2/5","Failure")
  set_branch(page,"0",0,"80%","Continues")
  set_branch(page,"0",1,"0.2","Stops")
  set_branch(page,"1",0,"0.3","Continues")
  set_branch(page,"1",1,"7/10","Stops")
  assert page.locator('[data-action="probability-save"]').is_enabled()
  assert "total probability is 1" in page.locator("[data-prob-quality]").inner_text()
  page.locator('[data-prob-field="showProducts"]').check()
  assert "0.48" in page.locator("[data-prob-quality]").inner_text()
  page.locator('[data-prob-field="showEventCalculation"]').check()
  assert "Success" in page.locator('[data-prob-path-label="00"]').inner_text()
  page.locator('[data-prob-membership="eventLeaves"][data-prob-leaf="00"]').check()
  page.locator('[data-prob-membership="eventLeaves"][data-prob-leaf="10"]').check()
  page.locator('[data-prob-membership="conditionLeaves"][data-prob-leaf="00"]').check()
  page.locator('[data-prob-membership="conditionLeaves"][data-prob-leaf="01"]').check()
  assert "0.8" in page.locator("[data-prob-quality]").inner_text()
  stored=saved(page)
  assert stored["probabilityStudio"]["draft"]["branches"]["0"][0]["probability"]=="80%"
  assert stored["entries"][0]["status"]=="planned"
  q=page.evaluate("({width:innerWidth,scroll:document.documentElement.scrollWidth})")
  assert q["scroll"]<=q["width"]+2,q
  page.screenshot(path=str(OUT/f"probability-two-stage-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="probability-save"]').click()
  assert len(saved(page)["probabilityStudio"]["figures"])==1
  with page.expect_download(timeout=25000) as job:
   page.locator('[data-action="probability-svg"]').click()
  data=Path(job.value.path()).read_bytes()
  assert data.startswith(b"<svg") and b"conditional" in data.lower()
  # Edit, extend to three stages, and preserve the earlier branches.
  page.locator('[data-prob-field="stages"]').select_option("3")
  assert saved(page)["probabilityStudio"]["draft"]["branches"]["0"][0]["probability"]=="80%"
  assert page.locator('[data-action="probability-save"]').is_disabled()
  for parent in ["00","01","10","11"]:
   set_branch(page,parent,0,"1/4","Outcome 1")
   set_branch(page,parent,1,"3/4","Outcome 2")
  assert page.locator('[data-action="probability-save"]').is_enabled()
  assert "8 terminal paths" in page.locator("[data-prob-quality]").inner_text()
  page.screenshot(path=str(OUT/f"probability-three-stage-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="probability-use"]').click()
  stored=saved(page)
  assert stored["entries"][0]["probabilityFigureId"]
  assert stored["entries"][0]["status"]=="planned"
  assert stored["probabilityStudio"]["figures"][0]["draft"]["stages"]==3
  page.reload(wait_until="networkidle")
  assert saved(page)["entries"][0]["probabilityFigureId"]
  assert page.locator(".probability-entry svg").count()>=1 or page.locator(".show-first-probability-figure svg").count()>=1
  assert not errors,errors
  print("PASS probability tree",width,flush=True)
 finally:ctx.close()
if __name__=="__main__":
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width,height,touch in [(1440,900,False),(390,844,True)]:
   exercise(browser,width,height,touch)
  browser.close()
