"""Pass 2 browser acceptance: real mouse and touch workflows for Voronoi Studio."""
import copy
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"))
OUT.mkdir(exist_ok=True)
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js'; console.log(JSON.stringify(createProjectState()));"],text=True))
KEY="ia-pathfinder-prototype-v1"
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")

def state(page):
 return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)

def position(page,x,y):
 # The mathematical chart uses an isometric scale; the initial 0..10 square
 # occupies x=310..750 and y=110..550 in the 1000x690 SVG viewBox.
 return page.evaluate("""({x,y})=>{
   const svg=document.querySelector('[data-voronoi-canvas]');
   const point=svg.createSVGPoint();
   point.x=310+44*x;point.y=110+44*(10-y);
   const p=point.matrixTransform(svg.getScreenCTM());
   return {x:p.x,y:p.y};
 }""",{"x":x,"y":y})

def tap(page,x,y,touch=False):
 page.locator('[data-voronoi-canvas]').scroll_into_view_if_needed()
 p=position(page,x,y)
 if touch:page.touchscreen.tap(p["x"],p["y"])
 else:page.mouse.click(p["x"],p["y"])

def prepared(browser,width,height,touch=False):
 project=copy.deepcopy(BASE)
 project["route"]="completing";project["completion"]["current"]="C31"
 project["planning"]["fields"].update({"kind":"modelling","course":"AI SL",
  "aim":"Which of these defined locations is closest?"})
 ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=touch,
  has_touch=touch,accept_downloads=True)
 page=ctx.new_page()
 page.set_default_timeout(12000)
 page.on("dialog",lambda dialog:dialog.accept())
 errors=[]
 page.on("pageerror",lambda error:errors.append(str(error)))
 page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+")) localStorage.setItem("+
  json.dumps(KEY)+","+json.dumps(json.dumps(project))+");")
 page.goto(URL,wait_until="networkidle")
 page.locator('[data-action="voronoi-open"]').click()
 assert page.locator('[data-voronoi-studio]').is_visible()
 return ctx,page,errors

def test_editor(page,width,touch):
 assert len(state(page)["voronoiStudio"]["draft"]["sites"])==0
 assert page.locator('[data-voronoi-plane]').count()==1
 assert page.locator('[data-voronoi-tool="existing"]').get_attribute("aria-pressed")=="true"
 tap(page,2,5,touch)
 assert len(state(page)["voronoiStudio"]["draft"]["sites"])==1
 assert state(page)["voronoiStudio"]["draft"]["regionMode"]=="interactive"
 tap(page,8,5,touch)
 d=state(page)["voronoiStudio"]["draft"]
 assert len(d["sites"])==2
 assert d["raw"]==""
 assert abs(d["sites"][0]["x"]-2)<0.01
 assert abs(d["sites"][1]["x"]-8)<0.01
 assert page.locator('[data-voronoi-cell-index]').count()==2
 assert "Working coordinate window" in page.locator('[data-voronoi-summary]').inner_text()
 page.locator('[data-voronoi-tool="select"]').click()
 a=position(page,2,5);b=position(page,3,5)
 if touch:
  # Simulate the same native touch PointerEvents on mobile.
  page.locator('[data-voronoi-site-index="0"]').dispatch_event("pointerdown",
   {"pointerId":41,"pointerType":"touch","button":0,"clientX":a["x"],"clientY":a["y"]})
  for frac in [0.4,0.7,1.0]:
   page.evaluate("""({x,y})=>document.dispatchEvent(new PointerEvent('pointermove',
    {bubbles:true,pointerId:41,pointerType:'touch',button:0,clientX:x,clientY:y}))""",
    {"x":a["x"]+(b["x"]-a["x"])*frac,"y":a["y"]+(b["y"]-a["y"])*frac})
  page.evaluate("""({x,y})=>document.dispatchEvent(new PointerEvent('pointerup',
   {bubbles:true,pointerId:41,pointerType:'touch',button:0,clientX:x,clientY:y}))""",b)
 else:
  page.mouse.move(a["x"],a["y"]);page.mouse.down()
  page.mouse.move(b["x"],b["y"],steps=6);page.mouse.up()
 assert abs(state(page)["voronoiStudio"]["draft"]["sites"][0]["x"]-3)<0.05
 assert abs(float(page.locator('[data-voronoi-site="0"][data-voronoi-site-key="x"]').input_value())-3)<0.05
 page.locator('[data-action="voronoi-undo"]').click()
 assert abs(state(page)["voronoiStudio"]["draft"]["sites"][0]["x"]-2)<0.05
 page.locator('[data-action="voronoi-redo"]').click()
 assert abs(state(page)["voronoiStudio"]["draft"]["sites"][0]["x"]-3)<0.05
 page.locator('[data-voronoi-tool="inspect"]').click()
 tap(page,1,7,touch)
 assert "Clipped region area" in page.locator('[data-voronoi-inspection]').inner_text()
 assert page.locator('[data-action="voronoi-bisector-selected"]').count()==1
 page.locator('[data-action="voronoi-bisector-selected"]').click()
 assert state(page)["voronoiStudio"]["draft"]["showBisector"] is True
 page.locator('[data-voronoi-tool="test"]').click()
 tap(page,7,5,touch)
 d=state(page)["voronoiStudio"]["draft"]
 assert float(d["probeX"])>6
 assert "nearest" in page.locator('[data-voronoi-summary]').inner_text().lower()
 # A keyboard-focused coordinate plane has arrow navigation and Enter action.
 page.locator('[data-voronoi-plane]').focus()
 page.keyboard.press("ArrowLeft")
 assert state(page)["voronoiStudio"]["cursorVisible"] is True
 page.keyboard.press("Enter")
 assert page.locator('[data-voronoi-plane]').is_visible()
 assert state(page)["voronoiStudio"]["draft"]["probeX"]
 page.locator('[data-action="voronoi-scenario-start"]').click()
 before=copy.deepcopy(state(page)["voronoiStudio"]["draft"]["sites"])
 assert state(page)["voronoiStudio"]["scenario"]["active"]
 page.locator('[data-voronoi-tool="candidate"]').click()
 tap(page,5,8,touch)
 d=state(page)["voronoiStudio"]["draft"]
 assert len(d["sites"])==3
 assert d["sites"][-1]["kind"]=="candidate"
 assert d["sites"][:2]==before
 assert "Before / after" in page.locator('[data-voronoi-comparison]').inner_text()
 page.locator('[data-action="voronoi-scenario-view"]').click()
 assert page.locator('[data-voronoi-interactive]').count()==0
 assert len(state(page)["voronoiStudio"]["draft"]["sites"])==3
 page.locator('[data-action="voronoi-scenario-view"]').click()
 assert page.locator('[data-voronoi-interactive]').count()==1
 page.locator('[data-action="voronoi-scenario-restore"]').click()
 assert len(state(page)["voronoiStudio"]["draft"]["sites"])==2
 assert state(page)["voronoiStudio"]["draft"]["sites"]==before
 page.locator('[data-action="voronoi-scenario-start"]').click()
 tap(page,5,8,touch)
 page.locator('[data-action="voronoi-scenario-keep"]').click()
 assert len(state(page)["voronoiStudio"]["draft"]["sites"])==3
 assert state(page)["voronoiStudio"]["draft"]["sites"][-1]["kind"]=="candidate"
 assert state(page)["voronoiStudio"]["scenario"]["active"] is False
 # Keep all presentation checks: working draft may exist while export is disabled.
 assert page.locator('[data-action="voronoi-use"]').is_disabled()
 page.locator('[data-voronoi-field="title"]').fill("Nearest-site model with proposed location")
 page.locator('[data-voronoi-field="unitMode"]').select_option("dimensionless")
 page.locator('[data-voronoi-field="coordSystem"]').select_option("cartesian")
 page.locator('[data-voronoi-field="sourceKind"]').select_option("primary")
 page.locator('[data-voronoi-field="metricConfirmed"]').check()
 assert page.locator('[data-action="voronoi-use"]').is_enabled()
 page.screenshot(path=str(OUT/f"voronoi-interactive-{width}.png"),full_page=True,animations="disabled")
 size=page.evaluate("({viewport:innerWidth,pageWidth:document.documentElement.scrollWidth})")
 assert size["pageWidth"]<=size["viewport"]+2,size
 # Maths can be entered beside an individual site and a caption without
 # modifying the coordinates or the Euclidean distance model.
 prior=[(x["x"],x["y"]) for x in state(page)["voronoiStudio"]["draft"]["sites"]]
 editor=page.locator('[data-notation-site-index="0"]')
 editor.locator('[data-action="diagram-notation-toggle"]').click()
 editor.locator('[data-diagram-expression]').fill(r'\theta')
 editor.locator('[data-action="diagram-notation-insert"]').click()
 page.wait_for_function("(term)=> (document.querySelector('[data-voronoi-site-key=name][data-voronoi-site=\"0\"]')?.value||'').includes(term)",arg=r'\(\theta\)')
 assert r'\(\theta\)' in state(page)["voronoiStudio"]["draft"]["sites"][0]["name"]
 editor.locator('[data-action="diagram-notation-close"]').click()
 caption=page.locator('[data-notation-studio="voronoi"][data-notation-key="note"]')
 caption.locator('[data-action="diagram-notation-toggle"]').click()
 caption.locator('[data-diagram-expression]').fill(r'\sqrt{x}')
 caption.locator('[data-action="diagram-notation-insert"]').click()
 page.wait_for_function("(term)=> (document.querySelector('[data-voronoi-field=note]')?.value||'').includes(term)",arg=r'\(\sqrt{x}\)')
 assert r'\(\sqrt{x}\)' in state(page)["voronoiStudio"]["draft"]["note"]
 caption.locator('[data-action="diagram-notation-close"]').click()
 assert page.locator('[data-voronoi-canvas] .diagram-math-typeset').count()>=1
 assert [(x["x"],x["y"]) for x in state(page)["voronoiStudio"]["draft"]["sites"]]==prior
 assert page.locator('[data-action="voronoi-use"]').is_enabled()

if __name__=="__main__":
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width,height,touch in [(1440,900,False),(390,844,True)]:
   context,page,errors=prepared(browser,width,height,touch)
   try:
    test_editor(page,width,touch)
    assert not errors,errors
    print(f"PASS Voronoi direct interaction: {width}x{height}, touch={touch}",flush=True)
   finally:
    context.close()
  browser.close()
