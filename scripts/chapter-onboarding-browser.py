"""Planning/Set up introductions and IA-writing chapter trail: desktop/mobile browser acceptance."""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"))
OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))

def stored(page):
 return page.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)

def without_overflow(page):
 sizes=page.evaluate("({viewport:innerWidth,content:document.documentElement.scrollWidth})")
 assert sizes["content"]<=sizes["viewport"]+1,sizes

def open_fixture(browser,fixture,width,height=890):
 ctx=browser.new_context(viewport={"width":width,"height":height})
 page=ctx.new_page()
 page.add_init_script("localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(fixture))+");")
 page.goto(URL,wait_until="networkidle")
 return ctx,page

def first_time(browser,width):
 s=copy.deepcopy(BASE)
 s["route"]="planning"
 ctx,page=open_fixture(browser,s,width)
 try:
  assert page.locator('[data-planning-intro="true"]').count()==1
  welcome=page.locator(".chapter-onboarding-plan")
  for words in ("Sparks remember your ideas","View all sparks",
                "Criteria appear where they matter","Compare examples",
                "Tools & tutorials","Discovery Trail","CHAPTER 1"):
   assert words in welcome.inner_text(),words
  assert page.locator('[data-action="essentials-open"]').count()>=1
  assert page.locator('[data-action="planning-intro-continue"]').count()==1
  assert stored(page)["planning"]["completed"]==False
  without_overflow(page)
  page.screenshot(path=str(OUT/f"planning-welcome-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="planning-intro-continue"]').click()
  assert page.locator('[data-planning-intro="true"]').count()==0
  assert page.locator('[data-source-node="N00"]').count()==1
  assert "I have an idea" in page.locator('[data-source-node="N00"]').inner_text()
  assert stored(page)["ui"]["planningIntroSeen"]==True
  page.locator('[data-action="planning-intro-open"]').click()
  assert page.locator('[data-planning-intro="true"]').count()==1
  page.locator('[data-action="planning-intro-continue"]').click()
  assert stored(page)["planning"]["completed"]==False
  page.locator('[data-nav="completing"]:visible').first.click()
  assert page.locator('[data-source-node="C00"]').count()==1
  setup=page.locator(".chapter-onboarding-write")
  assert "WRITE IN YOUR IA" in setup.inner_text()
  assert "Write relevant Set up answers directly into your actual IA document" in setup.inner_text()
  assert "does not automatically insert text" in setup.inner_text()
  assert "Planning first is recommended" in setup.inner_text()
  assert "Complete Planning first" in setup.inner_text()
  assert "Set up your IA document" in setup.inner_text()
  assert "12–20 double-spaced pages" in setup.inner_text()
  setup.locator('[data-action="essentials-open"][data-essentials-tab="format"]').click()
  assert page.locator('#essentialsDialog[open] .ess-heading').inner_text()=="Format & length"
  assert "12–20" in page.locator('#essentialsDialog[open]').inner_text()
  page.locator('#essentialsDialog [data-essentials-close]').click()
  assert page.locator('.setup-quick-sparks').count()==1
  assert page.locator('.setup-quick-sparks[open]').count()==1
  assert page.locator('.living-ribbon-part.writing').count()==3
  assert page.locator('.living-ribbon-part.planning').count()==1
  assert page.locator('.living-ribbon .journey-mode-tag').count()==0
  # Check the main Discovery Trail: two zones and four stages, with
  # colour explaining the task type independently of progress status.
  page.locator('[data-nav="path"]:visible').first.click()
  trail=page.locator('.living-trail:not(.is-compact)').first
  assert trail.is_visible()
  assert trail.locator('.living-trail-zone-title.plan').count()==1
  assert trail.locator('.living-trail-zone-title.writing').count()==1
  assert trail.locator('.living-trail-step.planning').count()==1
  assert trail.locator('.living-trail-step.writing').count()==3
  assert trail.locator('.journey-mode-tag').count()==0
  assert trail.locator('.living-trail-step .chapter-journey-icon').count()==4
  assert trail.locator('.living-trail-zone-underlay').count()==1
  cols=page.evaluate("getComputedStyle(document.querySelector('.living-trail-steps')).gridTemplateColumns")
  assert len(cols.split())==(1 if width<541 else 4),(width,cols)
  colors=page.evaluate("""() => {
    const panels=document.querySelectorAll('.living-trail-zone-underlay span');
    return [...panels].map(p=>getComputedStyle(p).backgroundColor);
  }""")
  assert colors[0]!=colors[1],colors
  # Marker geometry must align with the four stage cards. The first is
  # INSIDE the mint panel, not merely labelled as Planning within purple.
  geometry=trail.evaluate("""root => {
    const rect=el=>{const r=el.getBoundingClientRect();return {
      left:r.left,right:r.right,top:r.top,bottom:r.bottom,
      x:(r.left+r.right)/2,y:(r.top+r.bottom)/2,width:r.width,height:r.height
    }};
    const panel=root.querySelector('.living-trail-zone-underlay');
    return {
      plan:rect(panel.querySelector('.plan')),
      writing:rect(panel.querySelector('.writing')),
      svg:rect(root.querySelector('.living-trail-svg')),
      markers:[...root.querySelectorAll('.living-trail-marker')].map(rect),
      cards:[...root.querySelectorAll('.living-trail-step')].map(rect),
      pathDisplay:getComputedStyle(root.querySelector('.living-trail-path')).display
    };
  }""")
  assert len(geometry['cards'])==4
  if width>540:
   assert geometry['pathDisplay']!='none',geometry
   assert len(geometry['markers'])==4,geometry
   first=geometry['markers'][0]
   assert geometry['plan']['left']+12<first['x']<geometry['plan']['right']-12,geometry
   assert first['x']<geometry['writing']['left'],geometry
   for marker in geometry['markers'][1:]:
    assert geometry['writing']['left']+8<marker['x']<geometry['writing']['right']-8,geometry
   for marker,card in zip(geometry['markers'],geometry['cards']):
    assert abs(marker['x']-card['x'])<5,geometry
    assert 27<marker['width']<45 and 27<marker['height']<45,geometry
   assert geometry['svg']['width']>geometry['writing']['width'],geometry
  else:
   assert geometry['pathDisplay']=='none',geometry
  without_overflow(page)
  page.screenshot(path=str(OUT/f"two-zone-discovery-trail-{width}.png"),full_page=True,animations="disabled")
  # Use the actual visible Writing chapter, including on phones where
  # the sidebar's duplicate navigation links are deliberately hidden.
  page.locator('.living-trail-step.writing').first.click()
  assert page.locator('[data-source-node="C00"]').count()==1
  without_overflow(page)
  page.screenshot(path=str(OUT/f"setup-quick-sparks-{width}.png"),full_page=True,animations="disabled")
  # Student can explore the full advice guide without losing their own work.
  before_guide=stored(page)
  page.locator('.writer-guide-open-button').click()
  guide=page.locator('.writer-guide-drawer')
  assert guide.is_visible()
  assert guide.locator('[data-guide-card]').count()==14
  assert guide.locator('[data-guide-example]').count()==14
  assert guide.locator('[data-guide-text="ordinary"]').first.is_visible()
  guide.locator('[data-guide-card="lab"] [data-guide-view="stronger"]').click()
  assert guide.locator('[data-guide-card="lab"] [data-guide-text="stronger"]').is_visible()
  assert guide.locator('[data-guide-card="lab"] .writer-guide-example-why').is_visible()
  guide.locator('[data-guide-filter="voice"]').click()
  assert guide.locator('[data-guide-card]:visible').count()==4
  guide.locator('[data-guide-filter="all"]').click()
  assert guide.locator('[data-guide-card]:visible').count()==14
  guide.locator('[data-story-step="3"]').click()
  assert guide.locator('[data-story-panel="3"]').is_visible()
  guide.locator('[data-guide-card="audience"] > summary').click()
  guide.locator('[data-guide-card="audience"] .writer-guide-challenge > summary').click()
  assert guide.locator('[data-guide-card="audience"] .writer-guide-challenge p').is_visible()
  without_overflow(page)
  guide.screenshot(path=str(OUT/f"writers-guide-{width}.png"),animations="disabled")
  guide.locator('.drawer-header [data-action="close-drawer"]').click()
  assert page.locator('.writer-guide-drawer').count()==0
  assert stored(page)==before_guide
  page.locator('.setup-quick-sparks [data-bind="planning.fields.aim"]').fill("Can a quadratic model an observed pattern?")
  page.locator('.setup-quick-sparks [data-bind="planning.fields.beneficiary"]').fill("I want to compare which model is useful.")
  assert stored(page)["planning"]["fields"]["aim"]=="Can a quadratic model an observed pattern?"
  assert stored(page)["planning"]["fields"]["beneficiary"]=="I want to compare which model is useful."
  assert stored(page)["planning"]["completed"]==False
  page.locator('[data-action="setup-start-writing"]').click()
  assert page.locator('[data-source-node="C10"]').count()==1
  assert page.locator('[data-bind="scratch.introduction"]').count()==1
  assert "WRITE IN YOUR IA" in page.locator(".studio-ia-writing-reminder").inner_text()
  assert "Bring these three ideas into your introduction" in page.locator('.intro-spark-brief').inner_text()
  assert page.locator('.intro-spark-needed[data-intro-spark-state="ready"]').count()==2
  assert page.locator('.intro-spark-needed[data-intro-spark="prediction"]').count()==1
  assert "non-mathematical specialist background brief" in page.locator('.intro-spark-brief').inner_text()
  assert "Define specialist terms briefly" in page.locator('.intro-writing-guide').inner_text()
  page.locator('[data-bind="planning.fields.prediction"]').fill("I suspect a curved relationship.")
  page.locator('[data-bind="planning.fields.predictionWhy"]').fill("A few small cases suggest the changes increase.")
  assert stored(page)["planning"]["fields"]["prediction"]=="I suspect a curved relationship."
  assert stored(page)["planning"]["fields"]["predictionWhy"]=="A few small cases suggest the changes increase."
  assert stored(page)["project"]["prediction"]=="I suspect a curved relationship."
  assert stored(page)["project"]["predictionWhy"]=="A few small cases suggest the changes increase."
  assert page.locator('.intro-advice-tip').count()==6
  assert page.locator('.intro-advice-tip[data-intro-advice="journey"]').count()==1
  assert page.locator('.intro-advice-extra-group').count()==1
  assert page.locator('.intro-writing-guide').is_visible()
  assert page.locator('.setup-document-guide').count()==0
  assert page.locator('[data-criterion-badge="completing:C10:aim"]').count()==1
  assert page.locator('[data-criterion-badge="completing:C10:motivation"]').count()==1
  page.locator('[data-intro-advice="journey"] > summary').click()
  assert page.locator('[data-intro-advice="journey"] .intro-advice-example').is_visible()
  assert page.locator('[data-intro-advice="context"] > summary').is_visible()
  page.locator('[data-intro-advice="context"] > summary').click()
  page.locator('.intro-advice-extra-group > summary').click()
  assert page.locator('[data-intro-advice="uncertain"] > summary').is_visible()
  page.locator('[data-intro-advice="context"] [data-example-id="EX34"]').click()
  assert page.locator('#exampleDialog[open] [data-example-card="EX34"]').count()==1
  assert page.locator('#exampleDialog[open] .ex-introduction-feature').count()==3
  page.locator('#exampleDialog [data-example-close]').click()
  page.locator('[data-criterion-badge="completing:C10:aim"]').click()
  assert "Criterion A" in page.locator('#criterionBadgeDialog[open]').inner_text()
  assert "few focused paragraphs" in page.locator('#criterionBadgeDialog[open]').inner_text()
  page.locator('#criterionBadgeDialog [data-criterion-badge-close]').first.click()
  without_overflow(page)
  assert page.locator('.writer-guide-return [data-guide-tip="voice"]').count()==1
  page.locator('.writer-guide-return [data-guide-tip="voice"]').click()
  assert page.locator('.writer-guide-drawer [data-guide-card="voice"][open]').count()==1
  page.locator('.writer-guide-drawer .drawer-header [data-action="close-drawer"]').click()
  assert page.locator('[data-source-node="C10"]').count()==1
  # The original fixture's page-init script resets storage on EVERY reload.
  # Open a fresh tab in the same browser context to test actual persisted data.
  page=ctx.new_page()
  page.goto(URL,wait_until="networkidle")
  assert page.locator('[data-source-node="C10"]').count()==1
  assert page.locator('[data-bind="planning.fields.prediction"]').input_value()=="I suspect a curved relationship."
  assert page.locator('[data-bind="planning.fields.predictionWhy"]').input_value()=="A few small cases suggest the changes increase."
  assert page.locator('[data-intro-spark="prediction"][data-intro-spark-state="ready"]').count()==1
  assert page.locator('[data-spark-id="prediction"]').count()>=1
  after=stored(page)
  assert after["planning"]["completed"]==False
  assert after["completion"]["current"]=="C10"
  assert after["completion"]["stages"]["C10"]=="working"
  assert after["planning"]["fields"]["aim"]=="Can a quadratic model an observed pattern?"
  without_overflow(page)
  page.screenshot(path=str(OUT/f"setup-to-introduction-{width}.png"),full_page=True,animations="disabled")
 finally:
  ctx.close()

def completed_plan(browser,width):
 s=copy.deepcopy(BASE)
 s["route"]="planning"
 s["planning"]["current"]="N07"
 s["planning"]["completed"]=True
 s["ui"]["planningIntroSeen"]=True
 s["planning"]["fields"].update({
  "aim":"How can a geometric pattern be generalised?",
  "beneficiary":"I want to understand a mathematical generalisation.",
  "provisionalTitle":"Exploring geometric structure",
  "kind":"theoretical","theoreticalCase":"Lattice patterns","course":"AA SL"})
 s["teacher"]["pendingApproval"]=True
 ctx,page=open_fixture(browser,s,width)
 try:
  assert page.locator('[data-source-node="N07"]').count()==1
  page.locator('[data-action="plan-finish-writing"]').click()
  assert page.locator('[data-source-node="C00"]').count()==1
  assert page.locator(".spark-shelf-featured").count()==2
  assert page.locator('.setup-spark-already').count()==1
  assert page.locator('.setup-quick-sparks').count()==0
  assert "Review my Planning" in page.locator(".chapter-onboarding-write").inner_text()
  assert stored(page)["teacher"]["pendingApproval"]==True
  without_overflow(page)
  page.screenshot(path=str(OUT/f"setup-after-planning-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="setup-start-writing"]').click()
  after=stored(page)
  assert after["route"]=="completing"
  assert after["completion"]["current"]=="C10"
  assert after["planning"]["current"]=="N07"
  assert after["planning"]["completed"]==True
  assert after["planning"]["fields"]["aim"]=="How can a geometric pattern be generalised?"
  assert after["teacher"]["pendingApproval"]==True
  assert page.locator('[data-source-node="C10"]').count()==1
 finally:
  ctx.close()

def main():
 results=[]
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  for width in (1360,390):
   for scenario,fn in (("new",first_time),("completed",completed_plan)):
    try:
     fn(browser,width)
     results.append({"scenario":scenario,"width":width,"status":"passed"})
    except Exception as err:
     traceback.print_exc()
     results.append({"scenario":scenario,"width":width,"status":"FAILED","reason":str(err)})
  browser.close()
 (OUT/"chapter-onboarding-results.json").write_text(json.dumps(results,indent=2))
 print(json.dumps(results,indent=2))
 if any(x["status"]!="passed" for x in results):
  raise SystemExit(1)

if __name__=="__main__":
 main()
