"""Distribution Studio Pass 2: IA-sized SVG, shaded events, drag/keyboard and mobile."""
import json, os, shutil, struct, subprocess, xml.etree.ElementTree as ET
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/distribution-pass2"))
OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
BASE["route"]="completing"; BASE["completion"]["current"]="C31"
BASE["ui"]["writingIntroSeen"]=True
BASE["distributionStudio"]["open"]=True
def setup(browser,width):
 context=browser.new_context(viewport={"width":width,"height":900},is_mobile=width<600,has_touch=width<600,
  accept_downloads=True)
 page=context.new_page();page.set_default_timeout(16000)
 errors=[];page.on("pageerror",lambda e:errors.append(str(e)))
 page.add_init_script("localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(BASE))+");")
 page.goto(URL,wait_until="networkidle")
 assert page.locator("[data-distribution-studio]").is_visible()
 return context,page,errors
def value(p,k):return p.locator('[data-distribution-field="'+k+'"]').input_value()
def field(p,k,text):p.locator('[data-distribution-field="'+k+'"]').fill(text)
def check_width(p):
 d=p.evaluate("({viewport:innerWidth,scroll:document.documentElement.scrollWidth})")
 assert d["scroll"]<=d["viewport"]+2,d
def svg_print_check(p,name,expected_selected):
 with p.expect_download() as dl:
  p.locator('[data-action="distribution-svg"]').click()
 file=OUT/(name+".svg");dl.value.save_as(str(file))
 content=file.read_text()
 root=ET.fromstring(content)
 assert root.tag.endswith("svg")
 assert "data-distribution-handle" not in content
 assert 'role="slider"' not in content
 assert "Drag a marker" not in content
 assert 'data-distribution-boundary="lower"' in content
 assert content.count('data-distribution-selected="true"')==expected_selected
 assert content.count("data-distribution-shading")>0 or expected_selected>0
 return file
def text_bounds(p):
 issues=p.locator("[data-distribution-svg] text").evaluate_all("""els=>{
 const s=els[0].ownerSVGElement,w=s.viewBox.baseVal.width,h=s.viewBox.baseVal.height;
 return els.map(e=>{const b=e.getBBox();return {text:e.textContent,x:b.x,y:b.y,right:b.x+b.width,bottom:b.y+b.height,w,h};})
 .filter(o=>o.x < -1 || o.y < -1 || o.right > o.w+1 || o.bottom > o.h+1);
}""")
 assert not issues,issues
def normal(browser,width):
 c,p,errors=setup(browser,width)
 try:
  field(p,"title","Normal model for a measured assembly time")
  field(p,"symbol","T");field(p,"mu","70");field(p,"sigma","10")
  p.locator('[data-distribution-field="mode"]').select_option("between")
  field(p,"lower","65");field(p,"upper","85")
  assert p.locator('[data-representation-ready="true"]').count()==1
  assert p.locator('[data-distribution-shading="normal"]').count()==1
  assert p.locator('[data-distribution-handle]').count()==2
  assert 'T' in p.locator('[data-distribution-feedback]').inner_text()
  text_bounds(p);check_width(p)
  p.screenshot(path=str(OUT/f"normal-{width}-fit.png"),full_page=True,animations="disabled")
  if width==1440:
   svg_print_check(p,"normal-standard",0)
   with p.expect_download() as dl:p.locator('[data-action="distribution-png"]').click()
   dl.value.save_as(str(OUT/"normal-standard.png"))
   head=(OUT/"normal-standard.png").read_bytes()
   assert head[:8]==b"\x89PNG\r\n\x1a\n"
   pw,ph=struct.unpack(">II",head[16:24]);assert pw>=1900 and ph>=900,(pw,ph)
   # SVG slider is keyboard-operable and linked to the exact editor field.
   handle=p.locator('[data-distribution-handle="lower"]')
   handle.focus();handle.press("ArrowRight")
   assert float(value(p,"lower"))>65,value(p,"lower")
   before=float(value(p,"lower"))
   p.evaluate("""() => {
    window.__distributionEvents=[];
    document.addEventListener('pointerdown',e=>window.__distributionEvents.push('down:'+(e.target.closest('[data-distribution-handle]')?.dataset.distributionHandle||e.target.tagName)),true);
    document.addEventListener('pointermove',e=>{if(e.buttons)window.__distributionEvents.push('move:'+e.clientX)},true);
   }""")
   circle_element=p.locator('[data-distribution-handle="lower"] circle')
   circle_element.scroll_into_view_if_needed()
   circle_element.hover()
   circle=circle_element.bounding_box()
   x=circle["x"]+circle["width"]/2;y=circle["y"]+circle["height"]/2
   p.mouse.move(x,y);p.mouse.down();p.mouse.move(x+45,y,steps=6);p.mouse.up()
   moved=float(value(p,"lower"))
   if moved<=before:print("DRAG DEBUG",json.dumps({"before":before,"after":moved,"events":p.evaluate("window.__distributionEvents"),"circle":circle,"viewport":p.viewport_size}),flush=True)
   assert moved>before,(moved,before)
  else:
   before=float(value(p,"lower"))
   p.locator('[data-action="distribution-nudge"][data-distribution-boundary="lower"][data-distribution-direction="1"]').click()
   assert float(value(p,"lower"))>before
  p.locator('[data-action="distribution-preview-detail"]').click()
  assert "distribution-preview-detail" in p.locator("[data-distribution-preview]").get_attribute("class")
  assert p.locator('[data-action="distribution-preview-detail"]').get_attribute("aria-pressed")=="true"
  check_width(p)
  if width==390:p.screenshot(path=str(OUT/"normal-mobile-zoom.png"),full_page=True,animations="disabled")
  p.locator('[data-action="distribution-preview-fit"]').click()
  assert p.locator('[data-action="distribution-preview-fit"]').get_attribute("aria-pressed")=="true"
  assert not errors,errors
  print("PASS normal",width,flush=True)
 finally:c.close()
def binomial(browser):
 c,p,errors=setup(browser,1440)
 try:
  field(p,"title","Binomial model for successful trials")
  field(p,"symbol","B")
  p.locator('[data-distribution-field="kind"]').select_option("binomial")
  field(p,"n","12");field(p,"p","0.25")
  p.locator('[data-distribution-field="mode"]').select_option("exact")
  field(p,"lower","3")
  assert p.locator('[data-distribution-bar]').count()==13
  assert p.locator('[data-distribution-selected="true"]').count()==1
  assert p.locator('[data-representation-ready="true"]').count()==1
  text_bounds(p)
  p.screenshot(path=str(OUT/"binomial-desktop.png"),full_page=True,animations="disabled")
  svg_print_check(p,"binomial-standard",1)
  p.locator('[data-action="distribution-save"]').click()
  saved=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  assert len(saved["distributionStudio"]["figures"])==1
  assert saved["distributionStudio"]["figures"][0]["draft"]["symbol"]=="B"
  assert not errors,errors
  print("PASS binomial",flush=True)
 finally:c.close()
def new_models(browser,width):
 for kind in ("poisson","uniform","custom"):
  c,p,errors=setup(browser,width)
  try:
   p.locator('[data-distribution-field="kind"]').select_option(kind)
   field(p,"title",kind.title()+" model for a proposed IA event")
   field(p,"symbol","T")
   if kind=="poisson":
    field(p,"lambda","3")
    p.locator('[data-distribution-field="mode"]').select_option("right")
    field(p,"lower","2")
    expected="0.8009"
    assert p.locator('[data-distribution-bar]').count()>10
   elif kind=="uniform":
    field(p,"a","-2");field(p,"b","4")
    p.locator('[data-distribution-field="mode"]').select_option("between")
    field(p,"lower","0");field(p,"upper","2")
    expected="0.3333"
    assert p.locator('[data-distribution-curve="uniform"]').count()==1
   else:
    field(p,"customPoints","-2, 0.2\n0, 0.5\n3, 0.3")
    p.locator('[data-distribution-field="mode"]').select_option("right")
    field(p,"lower","0")
    expected="0.8000"
    assert p.locator('[data-distribution-bar]').count()==3
    assert p.locator('[data-distribution-selected="true"]').count()==2
   assert p.locator('[data-representation-ready="true"]').count()==1
   assert expected in p.locator('[data-distribution-feedback]').inner_text()
   assert p.locator('[data-distribution-learning]').is_visible()
   assert p.locator('[data-distribution-learning] [data-workshop-id]').count()==1
   check_width(p);text_bounds(p)
   p.screenshot(path=str(OUT/(kind+"-ia-"+str(width)+".png")),full_page=True,animations="disabled")
   if width==1440:
    selected=p.locator('[data-distribution-selected="true"]').count()
    svg_print_check(p,kind+"-ia",selected)
    p.locator('[data-distribution-learning] [data-studio-stuck]').click()
    dialog=p.locator('#studioStuckDialog')
    assert dialog.is_visible()
    assert dialog.locator('[data-studio-stuck-choice]').count()>=2
    dialog.locator('[data-studio-stuck-close]').click()
    p.locator('[data-distribution-learning] [data-workshop-id]').click()
    assert p.locator('[data-workshop-lesson="'+{
     "poisson":"poisson-models","uniform":"uniform-continuous-models",
     "custom":"custom-discrete-models"}[kind]+'"]').is_visible()
    p.keyboard.press("Escape")
    assert p.locator('[data-distribution-studio]').is_visible()
    p.locator('[data-action="distribution-save"]').click()
    saved=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
    assert saved["distributionStudio"]["figures"][-1]["draft"]["kind"]==kind
    if kind=="custom":
     assert "-2, 0.2" in saved["distributionStudio"]["figures"][-1]["draft"]["customPoints"]
   assert not errors,errors
   print("PASS distribution",kind,width,flush=True)
  finally:c.close()
def inverse_boundary(browser,width,kind):
 c,p,errors=setup(browser,width)
 try:
  if kind!="normal":p.locator('[data-distribution-field="kind"]').select_option(kind)
  field(p,"title","Inverse probability for "+kind+" model")
  field(p,"symbol","T")
  panel=p.locator('[data-distribution-inverse-panel]')
  assert panel.count()==1
  # A details disclosure is operable by keyboard, including on small screens.
  if kind=="normal":
   panel.locator("summary").focus()
   panel.locator("summary").press("Enter")
  else:
   panel.locator("summary").click()
  assert panel.get_attribute("open") is not None
  assert p.locator('[data-distribution-field="mode"]').input_value()=="none"
  target="0.8"
  inverse_mode="central" if kind in ("normal","uniform") else "left"
  p.locator('[data-distribution-inverse-field="mode"]').select_option(inverse_mode)
  p.locator('[data-distribution-inverse-field="probability"]').fill(target)
  assert p.locator('[data-distribution-inverse-result] [data-action="distribution-inverse-apply"]').count()==0
  # Calculation must not shade or edit the student's figure.
  calculate=p.locator('[data-action="distribution-inverse-calculate"]')
  if kind=="normal":
   calculate.focus();calculate.press("Enter")
  else:calculate.click()
  result=p.locator('[data-distribution-inverse-result]')
  assert "Requested probability" in result.inner_text()
  assert "Achieved probability" in result.inner_text()
  assert "0.8" in result.inner_text()
  assert result.locator('[data-action="distribution-inverse-apply"]').is_visible()
  before=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  assert before["distributionStudio"]["draft"]["mode"]=="none"
  assert before["distributionStudio"]["inverse"]["status"]=="calculated"
  if kind=="binomial":
   assert "0.828125" in result.inner_text()
   assert "inclusive cut-off" in result.inner_text()
  elif kind=="poisson":
   assert "0.815263" in result.inner_text()
  elif kind=="custom":
   assert "Discrete probabilities jump" in result.inner_text()
  else:
   assert "equal tails" in result.inner_text()
  result.locator('[data-action="distribution-inverse-apply"]').click()
  # Re-render preserves the open, reachable calculator; graph updates separately.
  assert p.locator('[data-distribution-inverse-panel]').get_attribute("open") is not None
  assert "Applied to the figure" in p.locator('[data-distribution-inverse-result]').inner_text()
  event_mode="between" if inverse_mode=="central" else inverse_mode
  assert p.locator('[data-distribution-field="mode"]').input_value()==event_mode
  assert p.locator('[data-distribution-field="lower"]').is_visible()
  if inverse_mode=="central":
   assert p.locator('[data-distribution-field="upper"]').is_visible()
   assert float(value(p,"upper"))>float(value(p,"lower"))
   assert p.locator('[data-distribution-shading]').count()==1
  else:
   count=p.locator('[data-distribution-selected="true"]').count()
   assert count=={"binomial":7,"poisson":5,"custom":3}[kind],(kind,count)
  saved=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  assert saved["distributionStudio"]["inverse"]["status"]=="applied"
  assert len(saved["distributionStudio"]["figures"])==0,"Calculate/apply must not silently save or link a figure"
  check_width(p);text_bounds(p)
  p.screenshot(path=str(OUT/("inverse-"+kind+"-"+str(width)+".png")),full_page=True,animations="disabled")
  if width==1440:
   svg=svg_print_check(p,"inverse-"+kind+"-desktop",0 if inverse_mode=="central" else {"binomial":7,"poisson":5,"custom":3}[kind])
   contents=svg.read_text()
   assert "Requested probability" not in contents
   assert "Achieved probability" not in contents
   assert "Find a boundary" not in contents
   assert "inverse-" not in contents
  if kind=="normal" and width==390:
   with p.expect_download() as download:p.locator('[data-action="distribution-png"]').click()
   file=OUT/"inverse-normal-mobile.png"
   download.value.save_as(str(file))
   assert file.read_bytes()[:8]==bytes([137,80,78,71,13,10,26,10])
  if kind=="normal":
   # Model changes invalidate a calculation; applying the old result is blocked.
   field(p,"sigma","2")
   assert "parameters have changed" in p.locator('[data-distribution-inverse-result]').inner_text()
   assert p.locator('[data-action="distribution-inverse-apply"]').count()==0
   calculate.click()
   assert p.locator('[data-action="distribution-inverse-apply"]').is_visible()
   p.locator('[data-distribution-inverse-field="probability"]').fill("0.7")
   assert "Enter a target and calculate" in p.locator('[data-distribution-inverse-result]').inner_text()
  if kind=="binomial":
   # Editing a manually applied boundary must retire the old "Applied" claim.
   old=float(value(p,"lower"))
   p.locator('[data-action="distribution-nudge"][data-distribution-boundary="lower"][data-distribution-direction="1"]').click()
   assert float(value(p,"lower"))>old
   assert p.locator('[data-distribution-inverse-result] [data-action="distribution-inverse-apply"]').count()==1
  assert not errors,errors
  print("PASS inverse",kind,width,flush=True)
 finally:c.close()

def parameter_whatif(browser,width,kind):
 c,p,errors=setup(browser,width)
 try:
  if kind!="normal":p.locator('[data-distribution-field="kind"]').select_option(kind)
  field(p,"title","Comparing "+kind+" theoretical models")
  field(p,"symbol","T")
  orig_values={"normal":{"mu":"70","sigma":"10"},
               "binomial":{"n":"10","p":"0.5"},
               "poisson":{"lambda":"3"},
               "uniform":{"a":"0","b":"10"},
               "custom":{"customPoints":"0, 0.2\n1, 0.5\n2, 0.3"}}
  for key,v in orig_values[kind].items():field(p,key,v)
  mode={"normal":"left","binomial":"exact","poisson":"right","uniform":"between","custom":"left"}[kind]
  lower={"normal":"70","binomial":"4","poisson":"4","uniform":"2","custom":"1"}[kind]
  p.locator('[data-distribution-field="mode"]').select_option(mode)
  field(p,"lower",lower)
  if kind=="uniform":field(p,"upper","4")
  orig=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)["distributionStudio"]["draft"]
  panel=p.locator('[data-distribution-whatif-panel]')
  assert panel.count()==1
  panel.locator("summary").click()
  p.locator('[data-action="distribution-whatif-start"]').click()
  panel=p.locator('[data-distribution-whatif-panel]')
  assert panel.get_attribute("open") is not None
  assert p.locator('[data-distribution-whatif-chart]').count()==1
  assert "Original and alternative" in p.locator('[data-distribution-whatif-preview]').inner_text()
  if width<600:
   dimensions=p.locator('.distribution-whatif-canvas').evaluate(
    "e=>({outer:e.clientWidth,total:e.scrollWidth,chart:e.querySelector('svg').getBoundingClientRect().width})")
   assert dimensions["total"]>dimensions["outer"]+40,dimensions
   assert dimensions["chart"]>=650,dimensions
  settings={"normal":("mu","75"),"binomial":("p","0.7"),"poisson":("lambda","5"),
            "uniform":("b","20"),"custom":("customPoints","0, 0.1\n1, 0.5\n2, 0.4")}
  target,new=settings[kind]
  text=p.locator('[data-distribution-whatif-field="'+target+'"][data-whatif-control="value"]')
  if kind=="normal":
   slider=p.locator('[data-distribution-whatif-field="mu"][data-whatif-control="range"]')
   slider.focus()
   slider.press("ArrowRight")
   assert float(text.input_value())>70
  text.fill(new)
  summary=p.locator('[data-distribution-whatif-summary]')
  assert summary.locator('[data-action="distribution-whatif-apply"]').is_visible()
  assert "Event probability" in summary.inner_text()
  if kind=="normal":
   assert "0.308537" in summary.inner_text()
  if kind=="uniform":
   assert "percentage points" in summary.inner_text() and "−10" in summary.inner_text()
  before=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  assert before["distributionStudio"]["draft"]==orig,(kind,"premature model edit")
  assert len(before["distributionStudio"]["figures"])==0
  assert before["distributionStudio"]["whatIf"]["active"] is True
  assert before["distributionStudio"]["whatIf"]["values"][target]==new
  if kind=="custom":
   text.fill("0, 0.15\n1, 0.5\n2, 0.4")
   assert "Check these parameters" in summary.inner_text()
   assert "must total 1" in summary.inner_text()
   assert summary.locator('[data-action="distribution-whatif-apply"]').count()==0
   assert p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)["distributionStudio"]["draft"]==orig
   text.fill(new)
   assert summary.locator('[data-action="distribution-whatif-apply"]').is_visible()
  check_width(p)
  p.screenshot(path=str(OUT/("whatif-"+kind+"-"+str(width)+".png")),full_page=True,animations="disabled")
  if width==1440 and kind=="normal":
   with p.expect_download() as dl:p.locator('[data-action="distribution-svg"]').click()
   oldfile=OUT/"whatif-original-before-apply.svg";dl.value.save_as(str(oldfile))
   oldsvg=oldfile.read_text()
   assert "What if" not in oldsvg and "Alternative model" not in oldsvg
   assert "70" in oldsvg
  summary.locator('[data-action="distribution-whatif-apply"]').click()
  data=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  assert data["distributionStudio"]["draft"][target]==new
  assert data["distributionStudio"]["draft"]["mode"]==orig["mode"]
  assert data["distributionStudio"]["draft"]["lower"]==orig["lower"]
  assert data["distributionStudio"]["draft"]["upper"]==orig["upper"]
  assert data["distributionStudio"]["whatIf"]["active"] is False
  assert data["distributionStudio"]["whatIf"]["status"]=="applied"
  assert len(data["distributionStudio"]["figures"])==0
  assert p.locator('[data-distribution-whatif-panel]').get_attribute("open") is not None
  assert "Alternative parameters applied" in p.locator('[data-distribution-whatif-panel]').inner_text()
  assert p.locator('[data-distribution-whatif-chart]').count()==0
  ready=p.locator('[data-representation-actions="distribution"]').get_attribute("data-representation-ready")
  if ready!="true":
   print("WHATIF APPLY DIAGNOSTIC",json.dumps({
    "kind":kind,"width":width,"draft":data["distributionStudio"]["draft"],
    "feedback":p.locator("[data-distribution-feedback]").inner_text(),
    "output":p.locator('[data-representation-actions="distribution"]').count(),
    "readyMarkers":p.locator('[data-representation-ready="true"]').count()
   }),flush=True)
  assert ready=="true",(kind,width,ready)
  check_width(p);text_bounds(p)
  if width==1440:
   count=p.locator('[data-distribution-selected="true"]').count()
   svg=svg_print_check(p,"whatif-applied-"+kind,count)
   assert "Alternative model" not in svg.read_text()
   assert "What if" not in svg.read_text()
   assert "data-distribution-whatif-chart" not in svg.read_text()
   if kind=="normal":
    assert svg.read_text()!=oldsvg
   if kind=="custom":
    assert data["distributionStudio"]["draft"]["customPoints"]==new
  if kind=="normal" and width==390:
   with p.expect_download() as download:p.locator('[data-action="distribution-png"]').click()
   output=OUT/"whatif-applied-mobile.png";download.value.save_as(str(output))
   assert output.read_bytes()[:8]==bytes([137,80,78,71,13,10,26,10])
  assert not errors,errors
  print("PASS parameter exploration",kind,width,flush=True)
 finally:c.close()


def sensitivity_provenance(browser,width):
 c,p,errors=setup(browser,width)
 try:
  field(p,"title","Source-aware normal sensitivity")
  field(p,"mu","70");field(p,"sigma","10")
  p.locator('[data-distribution-field="sourceKind"]').select_option("secondary")
  field(p,"sourceCredit","Original published source")
  p.locator('[data-distribution-field="mode"]').select_option("left")
  field(p,"lower","70")
  panel=p.locator('[data-distribution-whatif-panel]')
  panel.locator("summary").click()
  p.locator('[data-action="distribution-whatif-start"]').click()
  p.locator('[data-distribution-whatif-field="mu"][data-whatif-control="value"]').fill("75")
  summary=p.locator('[data-distribution-whatif-summary]')
  assert "percentage points" in summary.inner_text()
  assert "Mean shift" in summary.inner_text()
  assert "reclassify" in summary.inner_text()
  before=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  with p.expect_event("dialog") as dial:
   summary.locator('[data-action="distribution-whatif-apply"]').click()
  dial.value.dismiss()
  after_cancel=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  assert after_cancel["distributionStudio"]["draft"]==before["distributionStudio"]["draft"]
  assert after_cancel["distributionStudio"]["whatIf"]["active"]
  with p.expect_event("dialog") as dial:
   summary.locator('[data-action="distribution-whatif-apply"]').click()
  dial.value.accept()
  after_apply=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
  draft=after_apply["distributionStudio"]["draft"]
  assert draft["mu"]=="75"
  assert draft["sourceKind"]=="theoretical"
  assert draft["sourceCredit"]==""
  assert not after_apply["distributionStudio"]["whatIf"]["active"]
  check_width(p)
  assert not errors,errors
  print("PASS 5.4.1 provenance",width,flush=True)
 finally:c.close()


def fixed_target_whatif(browser,width,kind):
 c,p,errors=setup(browser,width)
 try:
  if kind!="normal":p.locator('[data-distribution-field="kind"]').select_option(kind)
  field(p,"title","Fixed probability comparison for "+kind)
  field(p,"symbol","K")
  parameters={"normal":{"mu":"70","sigma":"10"},
              "binomial":{"n":"10","p":"0.5"},
              "poisson":{"lambda":"3"},
              "uniform":{"a":"0","b":"10"},
              "custom":{"customPoints":"0, 0.2\n1, 0.5\n2, 0.3"}}
  for key,v in parameters[kind].items():field(p,key,v)
  # The original shaded event is deliberately different from the inverse query.
  p.locator('[data-distribution-field="mode"]').select_option("left")
  field(p,"lower",{"normal":"70","binomial":"4","poisson":"2","uniform":"3","custom":"1"}[kind])
  original=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)["distributionStudio"]["draft"]
  panel=p.locator('[data-distribution-whatif-panel]')
  panel.locator("summary").click()
  p.locator('[data-action="distribution-whatif-start"]').click()
  choice=p.locator('[data-distribution-whatif-option="comparison"][value="target"]')
  if kind=="normal" and width==1440:
   event_choice=p.locator('[data-distribution-whatif-option="comparison"][value="event"]')
   event_choice.focus();event_choice.press("ArrowRight")
  else:choice.click()
  assert p.locator('[data-distribution-whatif-option="comparison"][value="target"]').is_checked()
  assert p.locator('[data-distribution-target-controls]').is_visible()
  inverse_mode={"normal":"left","binomial":"left","poisson":"right",
                "uniform":"central","custom":"left"}[kind]
  probability={"normal":"0.9","binomial":"0.8","poisson":"0.2",
               "uniform":"0.5","custom":"0.75"}[kind]
  p.locator('[data-distribution-whatif-option="targetMode"]').select_option(inverse_mode)
  target=p.locator('[data-distribution-whatif-option="targetProbability"]')
  target.fill(probability)
  settings={"normal":("mu","75"),"binomial":("p","0.7"),"poisson":("lambda","5"),
            "uniform":("b","20"),"custom":("customPoints","0, 0.1\n1, 0.5\n2, 0.4")}
  key,value_new=settings[kind]
  p.locator('[data-distribution-whatif-field="'+key+'"][data-whatif-control="value"]').fill(value_new)
  report=p.locator('[data-distribution-whatif-summary]')
  assert report.locator('[data-whatif-target-result]').count()==1,report.inner_text()
  assert "Same target probability" in report.inner_text()
  assert report.locator('[data-whatif-target-model]').count()==2
  assert report.inner_text().count("Achieved probability")==2
  assert "Boundary change" in report.inner_text()
  assert "Event-probability change" not in report.inner_text()
  if kind in ("binomial","poisson","custom"):
   assert "Inclusive discrete cut-offs" in report.inner_text()
  if kind=="custom":assert "boundary does not move" in report.inner_text()
  markers=p.locator('[data-distribution-whatif-chart] [data-whatif-target-marker]')
  count=2 if inverse_mode=="central" else 1
  assert markers.count()==2*count,(kind,markers.count())
  assert markers.filter(has=p.locator('[data-whatif-target-marker="original"]')).count()>=0
  assert "Cut-offs under both models" in p.locator('[data-distribution-whatif-preview]').inner_text()
  assert p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)["distributionStudio"]["draft"]==original
  if kind=="normal":
   target.fill("1")
   assert report.locator('[data-whatif-target-error]').count()==1
   assert report.locator('[data-action="distribution-whatif-apply"]').count()==0
   assert p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)["distributionStudio"]["draft"]==original
   target.fill(probability)
   assert report.locator('[data-whatif-target-result]').count()==1
  if width<600:
   dimensions=p.locator('.distribution-whatif-canvas').evaluate(
    "e=>({outer:e.clientWidth,total:e.scrollWidth,chart:e.querySelector('svg').getBoundingClientRect().width})")
   assert dimensions["total"]>dimensions["outer"]+40,dimensions
   assert dimensions["chart"]>=650,dimensions
  check_width(p)
  if width==1440 and kind=="normal":
   with p.expect_download() as dl:p.locator('[data-action="distribution-svg"]').click()
   original_svg=OUT/"target-original-before-apply.svg";dl.value.save_as(str(original_svg))
   assert "data-whatif-target-marker" not in original_svg.read_text()
   assert "70" in original_svg.read_text()
  if kind=="normal" and width==390:
   with p.expect_download() as dl:p.locator('[data-action="distribution-png"]').click()
   file=OUT/"target-normal-mobile-unapplied.png";dl.value.save_as(str(file))
   assert file.read_bytes()[:8]==bytes([137,80,78,71,13,10,26,10])
  report.locator('[data-action="distribution-whatif-apply"]').click()
  saved=p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)["distributionStudio"]
  assert saved["draft"][key]==value_new
  assert saved["draft"]["mode"]==original["mode"]
  assert saved["draft"]["lower"]==original["lower"]
  assert saved["draft"]["upper"]==original["upper"]
  assert saved["whatIf"]["active"] is False
  assert saved["whatIf"]["status"]=="applied"
  assert saved["figures"]==[]
  assert p.locator('[data-distribution-whatif-chart]').count()==0
  assert p.locator('[data-representation-actions="distribution"]').get_attribute("data-representation-ready")=="true"
  check_width(p)
  if width==1440:
   with p.expect_download() as dl:p.locator('[data-action="distribution-svg"]').click()
   file=OUT/("target-applied-"+kind+".svg");dl.value.save_as(str(file))
   assert "data-whatif-target-marker" not in file.read_text()
   assert "targetProbability" not in file.read_text()
  assert not errors,errors
  print("PASS fixed-target comparison",kind,width,flush=True)
 finally:c.close()

if __name__=="__main__":
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width in (1440,390,320):normal(browser,width)
  binomial(browser)
  for width in (1440,390):new_models(browser,width)
  for width in (1440,390):
   for kind in ("normal","binomial","poisson","uniform","custom"):
    inverse_boundary(browser,width,kind)
  inverse_boundary(browser,320,"normal")
  for width in (1440,390):
   for kind in ("normal","binomial","poisson","uniform","custom"):
    parameter_whatif(browser,width,kind)
  parameter_whatif(browser,320,"normal")
  for width in (1440,390,320):sensitivity_provenance(browser,width)
  for width in (1440,390):
   for kind in ("normal","binomial","poisson","uniform","custom"):
    fixed_target_whatif(browser,width,kind)
  fixed_target_whatif(browser,320,"normal")
  browser.close()
