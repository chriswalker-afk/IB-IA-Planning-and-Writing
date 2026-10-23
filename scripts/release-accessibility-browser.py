"""Release Pass 5 — keyboard, small-screen, landmark and reduced-motion acceptance.
No page-content grading or changes to students' mathematical/IA project data.
Run against the built dist with Chromium, just like existing browser QA.
"""
import copy
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/release-accessibility"))
OUT.mkdir(parents=True,exist_ok=True)
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
BASE["ui"]["writerGuideIntroSeen"]=True
BASE["ui"]["writingIntroSeen"]=True
BASE["ui"]["planningIntroSeen"]=True

def new_page(browser,width,reduced=False):
 ctx=browser.new_context(viewport={"width":width,"height":900},
  reduced_motion="reduce" if reduced else "no-preference",
  is_mobile=width<=390,has_touch=width<=390)
 p=ctx.new_page()
 p.set_default_timeout(15000)
 errors=[]
 p.on("pageerror",lambda exc:errors.append(str(exc)))
 state=copy.deepcopy(BASE)
 p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
                   json.dumps(KEY)+","+json.dumps(json.dumps(state))+");")
 p.goto(URL,wait_until="networkidle")
 return ctx,p,errors

def assert_reflow(p,where):
 size=p.evaluate("""() => ({
   viewport:document.documentElement.clientWidth,
   outer:document.documentElement.scrollWidth,
   body:document.body.scrollWidth
 })""")
 assert size["outer"]<=size["viewport"]+2,(where,size)
 assert size["body"]<=size["viewport"]+2,(where,size)

def nav_root(width):
 return ".mobile-nav" if width<=760 else ".tablet-nav" if width<=1100 else ".sidebar"

def check_navigation(browser,width):
 ctx,p,errors=new_page(browser,width)
 try:
  assert p.locator(".skip-link").count()==1
  assert p.locator("#main[tabindex='-1'][aria-label]").count()==1
  assert p.locator("#screenAnnouncement[role='status'][aria-live='polite']").count()==1
  assert_reflow(p,"home "+str(width))
  # The first keyboard Tab goes past repeated header/sidebar navigation.
  p.keyboard.press("Tab")
  assert p.evaluate("document.activeElement.classList.contains('skip-link')"),"Skip link is not first"
  box=p.locator(".skip-link").bounding_box()
  assert box and box["y"]>=-1 and box["y"]<90,(width,box)
  p.keyboard.press("Enter")
  assert p.evaluate("document.activeElement.id==='main'"),"Skip link must focus the main landmark"
  assert_reflow(p,"skip "+str(width))
  root=nav_root(width)
  for route in ("planning","completing","checking","home"):
   button=p.locator(root+' [data-nav="'+route+'"]')
   assert button.count()==1 and button.is_visible(),(width,route)
   button.click()
   assert p.evaluate("document.activeElement.id==='main'"),"Navigation focus must reach main"
   live=p.locator("#screenAnnouncement").inner_text().strip()
   assert live and len(live)>9,(width,route,live)
   current=p.locator(root+' [aria-current="page"]')
   assert current.count()==1,(width,route,current.count())
   assert current.get_attribute("data-nav")==route,(width,route)
   assert_reflow(p,route+" "+str(width))
  help_button=p.locator('.topbar [data-panel="help"]')
  help_button.click()
  drawer=p.locator('#drawerLayer:not([hidden]) .drawer[role="dialog"][aria-modal="true"]')
  assert drawer.is_visible()
  assert p.locator(".app-grid").evaluate("(el)=>el.inert") is True
  assert p.locator(".topbar").evaluate("(el)=>el.inert") is True
  assert drawer.locator('.drawer-header [data-action="close-drawer"]').count()==1
  # Shift+Tab from the dialog frame must cycle to the last operable element.
  p.keyboard.press("Shift+Tab")
  assert p.evaluate("document.querySelector('.drawer').contains(document.activeElement)")
  p.keyboard.press("Tab")
  assert p.evaluate("document.querySelector('.drawer').contains(document.activeElement)")
  p.keyboard.press("Escape")
  assert p.locator("#drawerLayer").is_hidden()
  assert p.evaluate("document.activeElement?.dataset?.panel==='help'"),"Drawer return focus lost"
  assert p.locator(".app-grid").evaluate("(el)=>el.inert") is False
  if width<=760:
   assert p.locator(".mobile-nav").is_visible()
   for loc in (".mobile-nav-link",".topbar .icon-button"):
    sizes=p.locator(loc).evaluate_all("""nodes => nodes.filter(n=>n.getClientRects().length).map(n=>({
       w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height}))""")
    assert sizes and all(x["h"]>=43 for x in sizes),(width,loc,sizes)
  assert_reflow(p,"drawer close "+str(width))
  if width in (320,390,768,1440):
   p.screenshot(path=str(OUT/f"navigation-{width}.png"),full_page=True,animations="disabled")
  assert not errors,errors
  print("PASS keyboard and reflow",width,flush=True)
 finally:
  ctx.close()

def check_reduced_motion(browser):
 ctx,p,errors=new_page(browser,390,reduced=True)
 try:
  assert p.evaluate("window.matchMedia('(prefers-reduced-motion: reduce)').matches")
  assert p.evaluate("getComputedStyle(document.documentElement).scrollBehavior==='auto'")
  # Navigate with keyboard and read the same screen; reduced motion changes
  # animation only, never the underlying IA route or advice content.
  p.keyboard.press("Tab")
  p.keyboard.press("Enter")
  p.locator('.mobile-nav [data-nav="planning"]').click()
  assert "planning" in p.locator("#screenAnnouncement").inner_text().lower()
  assert_reflow(p,"reduced motion planning")
  assert not errors,errors
  print("PASS reduced motion",flush=True)
 finally:
  ctx.close()

if __name__=="__main__":
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  for width in (320,390,768,1024,1440):
   check_navigation(browser,width)
  check_reduced_motion(browser)
  browser.close()
