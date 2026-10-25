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
   circle=p.locator('[data-distribution-handle="lower"] circle').bounding_box()
   x=circle["x"]+circle["width"]/2;y=circle["y"]+circle["height"]/2
   p.mouse.move(x,y);p.mouse.down();p.mouse.move(x+45,y,steps=6);p.mouse.up()
   assert float(value(p,"lower"))>before,(value(p,"lower"),before)
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
if __name__=="__main__":
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width in (1440,390,320):normal(browser,width)
  binomial(browser)
  browser.close()
