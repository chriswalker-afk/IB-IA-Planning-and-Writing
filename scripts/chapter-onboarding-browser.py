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
  assert "Write your introduction" in page.locator(".intro-writing-task").inner_text()
  assert "Turn your sparks into an opening" in page.locator('.intro-spark-brief').inner_text()
  assert page.locator('.writing-stage-flow [data-writing-stage-part]').count()==4
  parts=page.locator('.writing-stage-flow [data-writing-stage-part]')
  assert [parts.nth(i).get_attribute("data-writing-stage-part") for i in range(4)]==["advice","sparks","task","examples"]
  assert page.locator('.criterion-marked-writing-box .criterion-writing-bubbles .criterion-badge').count()==2
  assert page.locator('.intro-criteria-mini').count()==0
  assert page.locator('.spark-shelf-featured').count()==0
  assert page.locator('.spark-shelf-library-only .spark-library').count()==1
  assert page.locator('.intro-spark-needed[data-intro-spark-state="ready"]').count()==2
  assert page.locator('.intro-spark-needed[data-intro-spark="prediction"]').count()==1
  assert "Define specialist terms briefly" in page.locator('.intro-writing-guide').inner_text()
  assert page.locator('.intro-prediction-update[open]').count()==1
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
  page.locator('.intro-examples-panel > summary').click()
  assert page.locator('.intro-examples-panel[open]').count()==1
  page.locator('.intro-examples-panel [data-example-id="EX34"]').click()
  assert page.locator('#exampleDialog[open] [data-example-card="EX34"]').count()==1
  assert page.locator('#exampleDialog[open] .ex-introduction-feature').count()==3
  page.locator('#exampleDialog [data-example-close]').click()
  page.locator('[data-criterion-badge="completing:C10:aim"]').click()
  assert "Criterion A" in page.locator('#criterionBadgeDialog[open]').inner_text()
  assert "few focused paragraphs" in page.locator('#criterionBadgeDialog[open]').inner_text()
  page.locator('#criterionBadgeDialog [data-criterion-badge-close]').first.click()
  without_overflow(page)
  assert page.locator('.writer-guide-return').count()==0
  page.locator('.intro-advice-guide-action [data-action="writer-guide-open"]').click()
  assert page.locator('.writer-guide-drawer').is_visible()
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

def writing_sections(browser,width):
 nodes=("C20","C21S","C21T","C24","C30","C33","C34B","C40","C50","C60","C61","C64")
 for node in nodes:
  state=copy.deepcopy(BASE)
  state["route"]="completing"
  state["completion"]["current"]=node
  state["planning"]["fields"].update({
   "aim":"How does a genuine variable relate to a result?",
   "motivation":"I noticed a mathematical relationship.",
   "prediction":"I expect the pattern may curve.","predictionWhy":"My early cases suggest that.",
   "kind":"theoretical" if node=="C21T" else "modelling"})
  state["entries"]=[{"id":"math-stage-test","phase":"substantial" if node in ("C40","C50") else "first",
   "status":"completed" if node in ("C34B","C60","C61","C64") else "planned",
   "title":"One mathematical step","kind":"model",
   "result":"The calculation gave 12.5" if node in ("C34B","C60","C61","C64") else "",
   "purpose":"To understand my aim","interpretation":"This narrows my prediction."}]
  state["completion"]["activeEntryIndex"]=0
  if node=="C20":
   state["planning"]["fields"].update({
    "kind":"statistics","dataSource":"both",
    "primaryWhat":"Measured heights in centimetres",
    "secondaryPublisher":"Official public height dataset","course":"AI SL"})
   state["planning"]["routeExplorer"]["selectedRoute"]="relationships"
   state["planning"]["mathSelected"]=["AI15","AI14"]
  ctx,page=open_fixture(browser,state,width)
  try:
   main=page.locator('[data-source-node="'+node+'"]')
   assert main.count()==1,node
   parts=main.locator('[data-writing-stage-part]')
   assert [parts.nth(i).get_attribute('data-writing-stage-part') for i in range(4)]==[
    'advice','sparks','task','examples'],node
   assert main.locator('.studio-stage-examples').count()==1,node
   assert main.locator('.studio-stage-sparks .spark-library').count()==1,node
   assert main.locator('.criteria-panel').count()==0,node
   assert "actual IA document" in main.locator('.studio-stage-writing-task').inner_text(),node
   if node in ("C20","C30","C40","C50","C60"):
    assert main.locator('.studio-stage-tip').count()==4,node
   else: assert main.locator('.studio-stage-more-advice').count()==1,node
   without_overflow(page)
   if node in ("C20","C40","C60"):
    main.locator('.studio-stage-examples>summary').click()
    main.locator('.studio-stage-example-actions [data-example-topic]').click()
    assert page.locator('#exampleDialog[open]').count()==1,node
    page.locator('#exampleDialog [data-example-close]').click()
    assert main.locator('.studio-stage-writing-task [data-criterion-badge]').count()>=1,node
    main.locator('.studio-stage-writing-task [data-criterion-badge]').first.click()
    assert page.locator('#criterionBadgeDialog[open]').count()==1,node
    page.locator('#criterionBadgeDialog [data-criterion-badge-close]').first.click()
    without_overflow(page)
    page.screenshot(path=str(OUT/f"studio-writing-{node}-{width}.png"),full_page=True,animations="disabled")
   if node=="C20":
    assert "Introducing your first mathematics" in main.inner_text()
    assert main.locator('[data-first-maths-context]').count()==1
    assert "Primary + secondary data" in main.inner_text()
    assert "Official public height dataset" in main.inner_text()
    assert "Relationships between two variables" in main.inner_text()
    assert "Plot paired measurements" in main.inner_text()
    assert main.locator('[data-first-maths-starting-guidance]').count()==1
    assert main.locator('[data-technique-start-guide="AI14"]').count()==1
    assert main.locator('[data-technique-start-guide="AI15"]').count()==1
    assert main.locator('[data-first-maths-other-guides]').count()==1
    assert main.locator('[data-first-maths-other-guides]').get_attribute("open") is None
    assert "Look for" in main.locator('[data-technique-start-guide="AI14"]').inner_text()
    assert "Then decide" in main.locator('[data-technique-start-guide="AI14"]').inner_text()
    main.locator('[data-first-maths-other-guides]>summary').click()
    main.locator('[data-other-technique="0"]>summary').click()
    assert "approximately linear" in main.locator('[data-technique-start-guide="AI15"]').inner_text()
    without_overflow(page)
    main.locator('[data-first-maths-other-guides]>summary').click()
    assert main.locator('[data-criterion-badge="completing:C20:firstBridge"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:firstChoice"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:firstPurpose"]').count()==1
    assert [p.get_attribute("data-first-maths-writing-part") for p in main.locator('[data-first-maths-writing-part]').all()]==["connection","method","evaluation"]
    assert main.locator('[data-journey-writing-part="method"][data-journey-writing-id="relationships"]').count()==1
    assert main.locator('[data-journey-writing-part="evaluation"][data-journey-writing-id="relationships"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:methodIntroduction"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:methodJustification"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:methodEvaluation"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:methodSuitability"]').count()==1
    assert "linear association" in main.locator('[data-journey-writing-part="evaluation"]').inner_text()
    assert "rank method" in main.locator('[data-journey-writing-part="evaluation"]').inner_text()
    assert main.locator('[data-first-maths-source-details]').count()==1
    assert not main.locator('[data-first-maths-source-details]').get_attribute('open')
    main.locator('[data-bind="completion.fields.dataAimLink"]').fill("The first plot lets me examine whether my aim has a meaningful relation.")
    main.locator('[data-bind="completion.fields.firstPurpose"]').fill("What mathematical pattern do the actual values support?")
    main.locator('[data-bind="completion.fields.methodReason"]').fill("I will use a scatter diagram first because the aim depends on the pattern.")
    main.locator('[data-bind="completion.fields.firstMethodEvaluation"]').fill("Pearson r may miss curvature; I will consider an alternative model if the shape warrants it.")
    assert stored(page)["completion"]["fields"]["firstPurpose"]=="What mathematical pattern do the actual values support?"
    assert stored(page)["completion"]["fields"]["methodReason"].startswith("I will use a scatter")
    assert "Pearson r may miss curvature" in stored(page)["completion"]["fields"]["firstMethodEvaluation"]
    main.locator('[data-criterion-badge="completing:C20:methodEvaluation"]').click()
    assert page.locator('#criterionBadgeDialog[open]').count()==1
    page.locator('#criterionBadgeDialog [data-criterion-badge-close]').first.click()
    main.locator('[data-first-maths-source-details]>summary').click()
    assert main.locator('[data-first-maths-source-details][open]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:source"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C20:method"]').count()==1
    main.locator('[data-bind="completion.fields.actualMethod"]').fill("I used the real measurements.")
    assert stored(page)["completion"]["fields"]["actualMethod"]=="I used the real measurements."
    main.locator('[data-first-maths-source-details]>summary').click()
    main.locator('[data-bind="completion.fields.firstMathsBridgePlacement"]').select_option("intro")
    assert "There is no need to repeat it" in main.inner_text()
    assert main.locator('[data-bind="completion.fields.dataAimLink"]').count()==1  # saved earlier note still accessible on request
    without_overflow(page)
    main.locator('[data-action="completion-open"][data-node="C30"]').click()
    assert page.locator('[data-source-node="C30"]').count()==1
    assert "What mathematical pattern do the actual values support?" in page.locator('[data-source-node="C30"]').inner_text()
    assert "You already explained why this follows from your aim" in page.locator('[data-source-node="C30"]').inner_text()
    assert "I will use a scatter diagram first" in page.locator('[data-source-node="C30"]').inner_text()
    assert "Pearson r may miss curvature" in page.locator('[data-source-node="C30"]').inner_text()
   if node=="C40":
    assert main.locator('[data-criterion-badge="completing:C40:title"]').count()==1
    page.locator('[data-bind="entries.0.purpose"]').fill("The prior result justified this step.")
    assert stored(page)["entries"][0]["purpose"]=="The prior result justified this step."
   if node=="C60":
    assert main.locator('[data-criterion-badge="completing:C61:mainConclusion"]').count()==1
    assert main.locator('[data-criterion-badge="completing:C61:uncertainty"]').count()==1
    page.locator('[data-bind="scratch.conclusion"]').fill("My real result supports a limited answer.")
    assert stored(page)["scratch"]["conclusion"]=="My real result supports a limited answer."
   if node=="C21T":
    assert main.locator('[data-bind="completion.fields.theoreticalObject"]').count()==1
    assert "no need to invent a dataset" in main.inner_text()
  finally:
   ctx.close()

def modelling_math_start(browser,width):
 state=copy.deepcopy(BASE)
 state["route"]="completing"
 state["completion"]["current"]="C20"
 state["planning"]["fields"].update({
  "kind":"modelling","dataSource":"secondary","course":"AI SL",
  "aim":"Does a quadratic model explain a genuine relationship?",
  "secondaryPublisher":"Public mathematical dataset"})
 state["planning"]["mathSelected"]=["AI05"]
 ctx,page=open_fixture(browser,state,width)
 try:
  main=page.locator('[data-source-node="C20"]')
  assert main.count()==1
  card=main.locator('[data-technique-start-guide="AI05"]')
  assert card.count()==1
  assert "Quadratic or cubic models" in card.inner_text()
  assert "scatter plot" in card.inner_text()
  assert "turning point" in card.inner_text()
  assert "quadratic from a cubic" in card.inner_text()
  assert "simplest justified model" in card.inner_text()
  assert "published data" in card.inner_text()
  assert "Cite the source" in card.inner_text()
  assert main.locator('[data-first-maths-other-guides]').count()==0
  assert main.locator('[data-first-maths-writing-part]').count()==3
  assert main.locator('[data-journey-writing-part="method"][data-journey-writing-origin="technique"]').count()==1
  assert main.locator('[data-journey-writing-part="evaluation"][data-journey-writing-origin="technique"]').count()==1
  assert main.locator('[data-bind="completion.fields.methodReason"]').count()==1
  assert main.locator('[data-bind="completion.fields.firstMethodEvaluation"]').count()==1
  assert main.locator('[data-first-maths-source-details]').count()==1
  without_overflow(page)
  page.screenshot(path=str(OUT/f"first-maths-model-{width}.png"),full_page=True,animations="disabled")
  assert stored(page)["entries"]==state["entries"]
 finally:
  ctx.close()


def repeatable_mathematics(browser,width):
 s=copy.deepcopy(BASE)
 s["route"]="completing"
 s["completion"]["current"]="C30"
 s["planning"]["fields"]["aim"]="Which mathematical model describes the measured pattern?"
 s["entries"]=[{"id":"real-first","phase":"first","title":"First observed scatter",
    "status":"completed","result":"The plotted data curve rather than form a straight line",
    "localTakeaway":"A linear model misses the curvature","interpretation":"A curved model may be more suitable"}]
 s["completion"]["activeEntryIndex"]=0
 s["completion"]["fields"]["nextQuestion"]="Could a quadratic model better represent the shape?"
 s["completion"]["fields"]["nextReason"]="The first plot shows curvature."
 ctx,page=open_fixture(browser,s,width)
 try:
  assert page.locator('[data-source-node="C30"]').count()==1
  assert page.locator('[data-action="stage-add"]').count()==1
  assert page.locator('[data-action="stage-conclude"]').count()==1
  page.locator('[data-action="stage-add"]').click()
  assert page.locator('[data-source-node="C40"]').count()==1
  assert page.locator('[data-math-stage-page="2"]').count()==1
  for part in ("introduce","show","reflect","next"):
   assert page.locator('[data-show-first-part="'+part+'"]').count()==1,part
  assert "A linear model misses the curvature" in page.locator('[data-show-first-part="introduce"]').inner_text()
  data=stored(page)
  assert len(data["entries"])==2
  assert data["entries"][1]["fromEntryId"]=="real-first"
  assert data["entries"][1]["title"]=="Could a quadratic model better represent the shape?"
  assert data["entries"][1]["status"]=="planned"
  assert page.locator('[data-action="stage-add"]').count()==1
  assert page.locator('[data-action="stage-conclude"]').count()==1
  without_overflow(page)
  page.screenshot(path=str(OUT/f"math-stage-2-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="stage-add"]').click()
  assert len(stored(page)["entries"])==2,"An unconfirmed calculation must not generate a third stage"
  page.locator('[data-bind="entries.1.result"]').fill("A quadratic model reduces the residuals")
  page.locator('[data-bind="entries.1.status"]').select_option("completed")
  page.locator('[data-bind="entries.1.localTakeaway"]').fill("The quadratic fit is better")
  page.locator('[data-bind="entries.1.nextQuestion"]').fill("Can the model be optimised?")
  page.locator('[data-bind="entries.1.nextWhy"]').fill("The turning point could answer the aim")
  page.locator('[data-action="stage-add"]').click()
  assert page.locator('[data-source-node="C50"]').count()==1
  assert page.locator('[data-math-stage-page="3"]').count()==1
  assert "The quadratic fit is better" in page.locator('[data-show-first-part="introduce"]').inner_text()
  stage=stored(page)["entries"]
  assert len(stage)==3
  assert stage[2]["fromEntryId"]==stage[1]["id"]
  assert stage[2]["title"]=="Can the model be optimised?"
  assert stage[2]["status"]=="planned"
  assert stage[2]["result"]==""
  assert stage[1]["result"]=="A quadratic model reduces the residuals"
  without_overflow(page)
  page.screenshot(path=str(OUT/f"math-stage-3-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="stage-conclude"]').click()
  assert page.locator('[data-source-node="C50"]').count()==1
  warning=page.locator('[data-conclusion-gate]')
  assert warning.count()==1
  assert "12–20 pages" in warning.inner_text()
  assert "not a compulsory page count" in warning.inner_text()
  page.screenshot(path=str(OUT/f"math-conclusion-warning-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="conclusion-cancel"]').click()
  assert page.locator('[data-conclusion-gate]').count()==0
  assert page.locator('[data-source-node="C50"]').count()==1
  page.locator('[data-action="stage-conclude"]').click()
  page.locator('[data-action="conclusion-confirm"]').click()
  assert page.locator('[data-source-node="C60"]').count()==1
  without_overflow(page)
 finally:
  ctx.close()


def growing_discovery_trail(browser,width):
 s=copy.deepcopy(BASE)
 s["route"]="path";s["completion"]["current"]="C04"
 s["completion"]["activeEntryIndex"]=2
 s["planning"]["fields"].update({"aim":"Can a curve describe these data?",
  "kind":"statistics","course":"AI SL","dataSource":"primary"})
 s["entries"]=[
  {"id":"first","phase":"first","status":"completed",
   "title":"Initial scatter","result":"The observed values have curvature",
   "localTakeaway":"A straight line is inadequate"},
  {"id":"second","phase":"substantial","status":"completed",
   "title":"Quadratic model","fromEntryId":"first",
   "result":"The quadratic has smaller residuals","localTakeaway":"Quadratic fits better"},
  {"id":"third","phase":"substantial","status":"planned",
   "title":"Further optimisation","fromEntryId":"second","result":""}
 ]
 ctx,page=open_fixture(browser,s,width)
 try:
  trail=page.locator('.living-trail:not(.is-compact)').first
  assert trail.count()==1
  assert trail.locator('.living-trail-step').count()==4
  assert trail.locator('.living-trail-math-loop').count()==1
  assert "3 mathematical stages" in trail.inner_text()
  assert trail.locator('[data-trail-chapter-guide]').count()==1
  trail.locator('[data-trail-chapter-guide] summary').click()
  assert "sampling" in trail.locator('[data-trail-chapter-guide]').inner_text()
  assert "diagram generators" in trail.locator('[data-trail-chapter-guide]').inner_text()
  assert "2 actual results" in trail.inner_text()
  assert "1 in progress" in trail.inner_text()
  pages=trail.locator('.living-trail-math-page')
  assert pages.count()==3
  assert pages.nth(0).get_attribute("data-index")=="0"
  assert pages.nth(1).get_attribute("data-index")=="1"
  assert pages.nth(2).get_attribute("data-index")=="2"
  assert page.locator('.journey-rail-context').count()==4
  assert "3 mathematical stages" in page.locator('.journey-rail-context').nth(2).inner_text()
  without_overflow(page)
  page.screenshot(path=str(OUT/f"discovery-accurate-{width}.png"),full_page=True,animations="disabled")
  # Chapter 3 must restore the third mathematical page, not a generic earlier step.
  trail.locator('.living-trail-step[data-target="C50"]').click()
  assert page.locator('[data-source-node="C50"]').count()==1
  assert page.locator('[data-math-stage-page="3"]').count()==1
  assert stored(page)["completion"]["activeEntryIndex"]==2
  # Every mathematical chip is a revisitable student writing page.
  page.locator('[data-nav="path"]:visible').first.click()
  page.locator('.living-trail:not(.is-compact) .living-trail-math-page[data-index="1"]').click()
  assert page.locator('[data-source-node="C40"]').count()==1
  assert stored(page)["completion"]["activeEntryIndex"]==1
  assert page.locator('[data-math-stage-page="2"]').count()==1
  page.locator('[data-nav="path"]:visible').first.click()
  page.locator('.living-trail:not(.is-compact) .living-trail-step[data-target="C60"]').click()
  assert page.locator('[data-conclusion-gate]').count()==1
  assert page.locator('[data-source-node="C40"]').count()==1
  page.locator('[data-action="conclusion-cancel"]').click()
  assert page.locator('[data-conclusion-gate]').count()==0
  page.locator('[data-nav="path"]:visible').first.click()
  page.locator('.living-trail:not(.is-compact) .living-trail-step[data-target="C60"]').click()
  page.locator('[data-action="conclusion-confirm"]').click()
  assert page.locator('[data-source-node="C60"]').count()==1
  without_overflow(page)
 finally:
  ctx.close()


def adaptive_mathematical_journey(browser,width):
 s=copy.deepcopy(BASE)
 s["route"]="completing"
 s["completion"]["current"]="C30"
 s["completion"]["activeEntryIndex"]=0
 s["planning"]["fields"]["course"]="AI SL"
 s["planning"]["fields"]["aim"]="Which model describes this relationship?"
 s["planning"]["routeExplorer"]["selectedRoute"]="fitted-models"
 s["entries"]=[{
  "id":"real-scatter","phase":"first","title":"My first observed scatter",
  "status":"completed","result":"The points increase then begin to level off",
  "localTakeaway":"The shape does not resemble a simple parabola"
 }]
 ctx,page=open_fixture(browser,s,width)
 try:
  assert page.locator('[data-journey-outcome-picker]').count()==1
  assert page.locator('[data-journey-next-state="choose"]').count()==1
  assert page.locator('[data-action="journey-use-direction"]').count()==0
  page.locator('[data-bind="entries.0.journeyOutcome"]').select_option("fitted-models:not-quadratic")
  assert page.locator('[data-journey-next-state="ready"]').count()==1
  assert "alternative function structure" in page.locator('[data-journey-next-panel], [data-journey-next-state="ready"]').first.inner_text()
  page.locator('[data-action="journey-use-direction"][data-direction="follow"]').click()
  before=stored(page)
  assert "alternative function structure" in before["completion"]["fields"]["nextQuestion"]
  assert before["entries"][0]["result"]=="The points increase then begin to level off"
  page.locator('[data-action="stage-add"]').click()
  assert page.locator('[data-math-stage-page="2"]').count()==1
  assert page.locator('[data-journey-stage-link]').count()==1
  assert "alternative function structure" in page.locator('[data-show-first-part="introduce"]').inner_text()
  data=stored(page)
  assert data["entries"][1]["journeySourceOutcome"]=="fitted-models:not-quadratic"
  assert data["entries"][1]["journeySourceSignature"]
  assert data["entries"][1]["result"]==""
  page.screenshot(path=str(OUT/f"adaptive-math-stage2-{width}.png"),full_page=True,animations="disabled")
  # The journey began with looking at a scatter graph. Once a genuine
  # exponential fit is used, outcomes must become fit-and-residual questions.
  page.locator('details.math-stage-optional-method summary').click()
  page.locator('[data-bind="entries.1.methodId"]').select_option("exponential")
  page.locator('[data-bind="entries.1.result"]').fill("The revised model gives a systematic residual pattern")
  page.locator('[data-bind="entries.1.status"]').select_option("completed")
  assert "Nonlinear models, fits and residuals" in page.locator('[data-journey-outcome-picker]').inner_text()
  page.locator('[data-bind="entries.1.journeyOutcome"]').select_option("nonlinear-model:residual-structure")
  assert "patterned residuals" in page.locator('[data-journey-next-state="ready"]').inner_text()
  page.locator('[data-action="journey-use-direction"][data-direction="follow"]').click()
  page.locator('[data-action="stage-add"]').click()
  assert page.locator('[data-math-stage-page="3"]').count()==1
  assert "systematic residual" in page.locator('[data-show-first-part="introduce"]').inner_text()
  pages=stored(page)["entries"]
  assert len(pages)==3
  assert pages[2]["journeySourceOutcome"]=="nonlinear-model:residual-structure"
  assert pages[2]["result"]==""
  page.screenshot(path=str(OUT/f"adaptive-math-stage3-{width}.png"),full_page=True,animations="disabled")
  page.locator('[data-action="completion-edit-entry"][data-index="0"]').first.click()
  assert page.locator('[data-source-node="C30"]').count()==1
  page.locator('[data-bind="entries.0.journeyOutcome"]').select_option("fitted-models:quadratic-plausible")
  updated=stored(page)["entries"]
  assert updated[1]["reviewNeeded"]=="yes"
  assert updated[2]["reviewNeeded"]=="yes"
  assert updated[1]["result"]=="The revised model gives a systematic residual pattern"
  page.locator('[data-action="completion-edit-entry"][data-index="1"]').first.click()
  assert page.locator('[data-journey-stage-link][data-link-state="review"]').count()==1
  assert "existing writing has been preserved" in page.locator('[data-journey-stage-link]').inner_text()
  without_overflow(page)
  page.screenshot(path=str(OUT/f"adaptive-math-review-{width}.png"),full_page=True,animations="disabled")
 finally:
  ctx.close()

def main():
 results=[]
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  for width in (1360,390):
   for scenario,fn in (("new",first_time),("completed",completed_plan),("writing-stages",writing_sections),("maths-model-start",modelling_math_start),("repeatable-mathematics",repeatable_mathematics),("growing-discovery-trail",growing_discovery_trail),("adaptive-mathematical-journey",adaptive_mathematical_journey)):
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
