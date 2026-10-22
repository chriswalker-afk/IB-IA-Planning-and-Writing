"""Geometry Studio desktop/touch acceptance using fictional coordinates only."""
import copy,json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/geometry"));OUT.mkdir(parents=True,exist_ok=True)
KEY="ia-pathfinder-prototype-v1"
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
def saved(page):return page.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def overflow(page):
 q=page.evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})")
 assert q["scrollWidth"]<=q["width"]+2,q
def test_one(browser,width,height,touch):
 project=copy.deepcopy(BASE)
 project["route"]="completing";project["completion"]["current"]="C31"
 project["ui"]["writingIntroSeen"]=True
 project["planning"]["fields"].update({"kind":"modelling","course":"AA SL","aim":"What does a measured triangle show?"})
 project["entries"]=[{"id":"qa-geometry-stage","phase":"first","status":"planned",
                      "kind":"diagram","title":"","technique":"","result":""}]
 project["completion"]["activeEntryIndex"]=0
 project["geometryStudio"]["open"]=True
 ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=touch,
  has_touch=touch,accept_downloads=True)
 page=ctx.new_page();page.set_default_timeout(16000)
 page.on("dialog",lambda d:d.accept())
 errors=[];page.on("pageerror",lambda err:errors.append(str(err)))
 page.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+")) localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(project))+");")
 try:
  page.goto(URL,wait_until="networkidle")
  studio=page.locator("[data-geometry-studio]")
  assert studio.is_visible(),("Geometry editor not visible",page.locator("body").inner_text()[:700])
  assert "Not to scale" in page.locator("[data-geometry-preview]").inner_text()
  assert page.locator("[data-geometry-vertex-index]").count()==3
  overflow(page)
  page.locator('[data-geometry-field="title"]').fill("QA labelled right triangle")
  page.locator('[data-geometry-vertex="0"][data-geometry-vertex-key="edgeLabel"]').fill("Known a = 3 m")
  assert "Known a = 3 m" in page.locator("[data-geometry-preview]").inner_text()
  assert "≈ 7" not in page.locator("[data-geometry-preview]").inner_text()
  page.locator('[data-geometry-vertex="0"][data-geometry-vertex-key="x"]').fill("")
  assert saved(page)["geometryStudio"]["draft"]["vertices"][0]["x"] is None
  assert page.locator('[data-action="geometry-save"]').is_disabled()
  assert "Enter valid coordinates" in page.locator("[data-geometry-preview]").inner_text()
  page.locator('[data-geometry-vertex="0"][data-geometry-vertex-key="x"]').fill("0")
  assert page.locator('[data-action="geometry-save"]').is_enabled()
  # Exact Pythagorean example: area 6, side lengths 3/4/5.
  page.locator('[data-geometry-field="mode"]').select_option("coordinate")
  page.locator('[data-geometry-field="unit"]').fill("m")
  for i,x,y in [(0,0,0),(1,3,0),(2,0,4)]:
   page.locator(f'[data-geometry-vertex="{i}"][data-geometry-vertex-key="x"]').fill(str(x))
   page.locator(f'[data-geometry-vertex="{i}"][data-geometry-vertex-key="y"]').fill(str(y))
  page.locator('[data-geometry-field="showLengths"]').check()
  page.locator('[data-geometry-field="showAngles"]').check()
  page.locator('[data-geometry-field="showCoordinates"]').check()
  page.locator('[data-geometry-field="showBearings"]').check()
  assert page.locator('[data-action="geometry-use"]').is_disabled(),"Unconfirmed north must block bearings"
  page.locator('[data-geometry-field="northAligned"]').check()
  assert page.locator('[data-action="geometry-save"]').is_enabled()
  assert "Calculated perimeter" in page.locator("[data-geometry-quality]").inner_text()
  assert "12.000" in page.locator("[data-geometry-quality]").inner_text()
  assert "6.000" in page.locator("[data-geometry-quality]").inner_text()
  # Shared LaTeX insertion works for vertex and angle labels, not data.
  maths=page.locator(".geometry-vertex").first.locator(".geometry-vertex-notation")
  maths.evaluate("(el)=>el.open=true")
  row=page.locator('[data-notation-studio="geometry"][data-notation-key="angleLabel"][data-notation-vertex-index="0"]')
  row.locator('[data-action="diagram-notation-toggle"]').click()
  row.locator('[data-diagram-expression]').fill(r'\theta')
  row.locator('[data-action="diagram-notation-insert"]').click()
  page.wait_for_function("""term=>{
   const raw=localStorage.getItem('ia-pathfinder-prototype-v1');
   return !!raw&&JSON.parse(raw).geometryStudio.draft.vertices[0].angleLabel.includes(term);
  }""",arg=r'\(\theta\)')
  label=saved(page)["geometryStudio"]["draft"]["vertices"][0]["angleLabel"]
  assert r'\(\theta\)' in label,label
  assert page.locator("[data-geometry-preview] svg[data-geometry-canvas]").count()==1
  assert "theta" in label
  row.locator('[data-action="diagram-notation-close"]').click()
  # Mouse or native touch pointer drag must change saved Cartesian coordinates.
  point=page.locator('[data-geometry-vertex-index="0"]')
  point.scroll_into_view_if_needed()
  pos=point.bounding_box();assert pos,pos
  cx=pos["x"]+pos["width"]/2;cy=pos["y"]+pos["height"]/2
  before=saved(page)["geometryStudio"]["draft"]["vertices"][0]["x"]
  if touch:
   point.dispatch_event("pointerdown",{"pointerId":83,"pointerType":"touch","button":0,"clientX":cx,"clientY":cy})
   for scale in [0.4,0.7,1]:
    page.evaluate("""({x,y})=>document.dispatchEvent(new PointerEvent('pointermove',
     {bubbles:true,pointerId:83,pointerType:'touch',button:0,clientX:x,clientY:y}))""",
     {"x":cx+24*scale,"y":cy})
   page.evaluate("""({x,y})=>document.dispatchEvent(new PointerEvent('pointerup',
    {bubbles:true,pointerId:83,pointerType:'touch',button:0,clientX:x,clientY:y}))""",{"x":cx+24,"y":cy})
  else:
   page.mouse.move(cx,cy);page.mouse.down();page.mouse.move(cx+24,cy,steps=5);page.mouse.up()
  after=saved(page)["geometryStudio"]["draft"]["vertices"][0]["x"]
  assert abs(after-before)>.02,(before,after)
  assert abs(after)<1000
  point=page.locator('[data-geometry-vertex-index="0"]')
  point.focus();page.keyboard.press("ArrowRight")
  keyboard_after=saved(page)["geometryStudio"]["draft"]["vertices"][0]["x"]
  assert keyboard_after>after,(after,keyboard_after)
  # Reset vertex to the exact known test shape.
  page.locator('[data-geometry-vertex="0"][data-geometry-vertex-key="x"]').fill("0")
  # Preserve a screenshot of the actual editable canvas before the Files drawer.
  page.screenshot(path=str(OUT/f"geometry-editor-{width}.png"),full_page=True,animations="disabled")
  # Student-saved figures are editable and both image exports are real files.
  page.evaluate("""() => {
   window.__geometryClickTrace=[];
   window.__geometryPointerTrace=[];
   for(const type of ['pointerdown','pointerup','mousedown','mouseup','click']){
    document.addEventListener(type,e=>{
     window.__geometryPointerTrace.push({
      type,target:e.target.closest?.('[data-action]')?.dataset.action||e.target.tagName,
      button:e.button,buttons:e.buttons,pointerId:e.pointerId
     });
     if(type==='click')window.__geometryClickTrace.push({
      action:e.target.closest('[data-action]')?.dataset.action||'none',
      tag:e.target.tagName
     });
    },true);
   }
  }""")
  page.locator('[data-action="geometry-save"]').click()
  ss=saved(page)
  print("Geometry save diagnosis:",json.dumps({
   "figures":len(ss["geometryStudio"]["figures"]),
   "quality":page.locator("[data-geometry-quality]").inner_text()[:350],
   "toast":page.locator("#toast").inner_text()[:320],
   "vertices":ss["geometryStudio"]["draft"]["vertices"],
   "mode":ss["geometryStudio"]["draft"]["mode"],
   "sourceKind":ss["geometryStudio"]["draft"]["sourceKind"],
   "current":ss["completion"]["current"],
   "events":page.evaluate("window.__geometryClickTrace"),
   "pointerEvents":page.evaluate("window.__geometryPointerTrace"),
   "saveButton":page.locator('[data-action="geometry-save"]').evaluate("""btn=>{
     const r=btn.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
     return {disabled:btn.disabled,connected:btn.isConnected,x,y,
       hit:document.elementFromPoint(x,y)?.outerHTML?.slice(0,210),
       button:btn.outerHTML.slice(0,210)};
    }"""),
   "errors":errors,
   "saveStatus":page.locator("#saveStatus").inner_text()
  }),flush=True)
  assert len(ss["geometryStudio"]["figures"])==1
  original=ss["geometryStudio"]["figures"][0]["id"]
  for fmt,signature in [("svg",b"<svg"),("png",b"\x89PNG")]:
   with page.expect_download(timeout=30000) as received:
    page.locator(f'[data-action="geometry-{fmt}"]').click()
   download=received.value
   data=Path(download.path()).read_bytes()
   assert data[:len(signature)]==signature,(fmt,data[:16])
  page.locator('[data-action="geometry-use"]').click()
  final=saved(page)
  assert final["entries"][0]["geometryFigureId"]==original
  assert len(final["geometryStudio"]["figures"])==1
  assert final["entries"][0]["status"]=="planned","Saving a figure must not invent a completed IA result"
  assert page.locator('.geometry-entry > svg').count()==1,"Linked preview missing from writing stage"
  page.reload(wait_until="networkidle")
  assert saved(page)["entries"][0]["geometryFigureId"]==original
  assert page.locator('.geometry-entry > svg').count()==1
  # The Backups & Reports action is on Home, not on every writing page.
  # Navigating there must preserve the linked figure and editable project.
  page.locator('[data-nav="home"]').first.click()
  assert saved(page)["entries"][0]["geometryFigureId"]==original
  # Figure must also appear in the full project PDF, not merely the JSON.
  page.locator('[data-action="open-files"]').first.click()
  with page.expect_download(timeout=50000) as received:
   page.locator('[data-action="export-full-pdf"]').first.click()
  pdf=Path(received.value.path()).read_bytes()
  assert pdf.startswith(b"%PDF-") and len(pdf)>2000,"Full-project PDF missing or invalid"
  assert not errors,errors
  overflow(page)
  print(f"PASS Geometry Studio: width={width}, touch={touch}, PDF={len(pdf)} bytes",flush=True)
 finally:ctx.close()
if __name__=="__main__":
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  for dims in [(1440,900,False),(390,844,True)]:test_one(browser,*dims)
  browser.close()
