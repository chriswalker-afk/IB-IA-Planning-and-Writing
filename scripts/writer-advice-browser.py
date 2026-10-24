"""Browser checks for preserved writing advice and optional mathematical-story guidance."""
import copy, json, os, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

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
# Reuse the existing stage visits; only C35 and C50 need additional light checks.
STORY_CASES={
 "C20":(1,0,"completion.fields.methodReason","completing:C20:methodIntroduction","relationships"),
 "C30":(1,1,"entries.0.interpretation","completing:C30:reflectD","relationships"),
 "C35":(0,1,"completion.fields.nextMethod","completing:C35:nextReason","relationships"),
 "C40":(1,1,"entries.1.bridge","completing:C40:bridgeA","fitted-models"),
 "C50":(1,1,"entries.2.bridge","completing:C50:bridgeA","fitted-models")
}

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
 s["planning"]["routeExplorer"]["selectedRoute"]="relationships"
 s["completion"]["fields"]["methodReason"]="My saved reason for investigating this association."
 s["completion"]["fields"]["nextMethod"]="Check prediction accuracy."
 s["scratch"]["introduction"]="These are my original, private notes."
 s["entries"]=[{"id":"first-observation","phase":"first","status":"completed",
                "methodId":"pmcc","title":"First association",
                "result":"The fictional sample has a coefficient of 0.91.",
                "localTakeaway":"The fictional sample has a positive linear association.",
                "interpretation":"Association alone does not establish prediction accuracy."}]
 s["completion"]["activeEntryIndex"]=0
 if node in ("C40","C50"):
  s["entries"].append({"id":"second-question","phase":"substantial",
                       "fromEntryId":"first-observation","status":"planned",
                       "methodId":"linear-regression","technique":"Straight-line regression",
                       "title":"Check prediction accuracy","bridge":"My saved reason for fitting this line.",
                       "purpose":"Compare predictions with the stated requirement."})
  s["completion"]["activeEntryIndex"]=1
 if node=="C50":
  s["entries"][1].update({"status":"completed","result":"The fitted errors vary across the domain."})
  s["entries"].append({"id":"third-question","phase":"substantial",
                       "fromEntryId":"second-question","status":"planned",
                       "methodId":"linear-regression","title":"Locate the prediction errors",
                       "bridge":"My saved reason for checking the errors."})
  s["completion"]["activeEntryIndex"]=2
 return s

def authored_content(page):
 return page.evaluate("""k=>{
  const s=JSON.parse(localStorage.getItem(k));
  return {entries:s.entries,fields:s.completion.fields,scratch:s.scratch};
 }""",KEY)

def check_story_guidance(page,node,width):
 choices,examples,path,spot,route=STORY_CASES[node]
 choice=page.locator("#main [data-story-choice]")
 example=page.locator("#main [data-story-synthesis]")
 assert choice.count()==choices,(width,node,"choice reminder duplicated or missing")
 assert example.count()==examples,(width,node,"synthesis example duplicated or missing")
 original=authored_content(page)
 if choices:
  expect(choice).to_have_attribute("data-story-route",route)
 if examples:
  expect(example).to_have_attribute("data-story-route",route)
  assert not example.evaluate("e=>e.open"),(width,node,"example should start closed")
  assert not example.locator(".math-story-passage").is_visible()
  example.locator("summary").click()
  assert example.evaluate("e=>e.open")
  assert example.locator(".math-story-notes > div").count()==3
  assert example.locator(".math-story-notes dt").all_inner_texts()==["Interpretation","Gap","Next mathematics"]
  expect(example.locator(".math-story-passage")).to_be_visible()
  assert example.locator(".math-story-passage").inner_text().strip()
  assert "Illustrative example" in example.locator(".math-story-example-label").inner_text()
 assert authored_content(page)==original,(width,node,"opening advice changed authored content")
 assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"),(width,node,"horizontal overflow")
 page.screenshot(path=str(OUT/f"{node}-{width}-story.png"),animations="disabled")

 # Edit a real author field, then exercise the actual UI toggle. The saved text,
 # field and both kinds of help must survive hiding and restoring the examples.
 field=page.locator('[data-bind="'+path+'"]')
 assert field.count()==1 and field.is_visible(),(width,node,"missing author field",path)
 edited=field.input_value()+" My own browser-check sentence."
 field.fill(edited);field.blur()
 page.wait_for_function("""([k,path,value])=>{
  const s=JSON.parse(localStorage.getItem(k));
  return path.split('.').reduce((v,key)=>v?.[key],s)===value;
 }""",arg=[KEY,path,edited])
 saved=authored_content(page)
 toggle=page.locator('#main [data-action="toggle-advice-mode"]')
 toggle.click()
 expect(toggle).to_have_attribute("aria-pressed","true")
 assert choice.count()==0 and example.count()==0,(width,node,"optional story advice survived Reduce advice")
 expect(field).to_be_visible();expect(field).to_have_value(edited)
 expect(page.locator('[data-criterion-badge="'+spot+'"]')).to_be_visible()
 bubble=page.locator('.writer-guide-field-bubble[data-guide-spot="'+spot+'"]')
 expect(bubble).to_be_visible()
 bubble.click()
 popin=page.locator("#writerGuidePopinLayer .writer-guide-popin")
 expect(popin).to_be_visible()
 popin.get_by_role("button",name="Close this writing tip",exact=True).click()
 assert authored_content(page)==saved,(width,node,"reduced advice or help changed saved work")
 toggle.click()
 expect(toggle).to_have_attribute("aria-pressed","false")
 assert choice.count()==choices and example.count()==examples,(width,node,"full advice was not restored")
 expect(field).to_be_visible();expect(field).to_have_value(edited)
 assert authored_content(page)==saved,(width,node,"restoring advice changed saved work")

def check_story_method_switch(page,width):
 method=page.locator('[data-bind="entries.1.methodId"]')
 choice=page.locator("#main [data-story-choice]")
 example=page.locator("#main [data-story-synthesis]")
 bridge=page.locator('[data-bind="entries.1.bridge"]')
 saved_bridge=bridge.input_value()
 def visible_passage():
  # Both advice-mode and method changes rebuild the closed disclosure.
  # Read what the student sees after expanding it, not a hidden innerText.
  if not example.evaluate("e=>e.open"):
   example.locator("summary").click()
  passage=example.locator(".math-story-passage")
  expect(passage).to_be_visible()
  return passage.inner_text()
 original_example=visible_passage()
 original_choice=choice.inner_text()
 expect(method).to_have_value("linear-regression")
 method.select_option("finance-break-even")
 expect(choice).to_have_attribute("data-story-route","finance")
 expect(example).to_have_attribute("data-story-route","finance")
 assert choice.inner_text()!=original_choice
 finance_example=visible_passage()
 assert finance_example!=original_example
 assert "profit" in finance_example.lower()
 expect(bridge).to_have_value(saved_bridge)
 # Explicit Other must beat both the old planned journey and legacy technique.
 method.select_option("other")
 expect(choice).to_have_attribute("data-story-route","general")
 expect(example).to_have_attribute("data-story-route","general")
 assert "sequence" in visible_passage().lower()
 expect(bridge).to_have_value(saved_bridge)
 assert page.evaluate("k=>JSON.parse(localStorage.getItem(k)).planning.routeExplorer.selectedRoute",KEY)=="relationships"
 assert page.evaluate("k=>JSON.parse(localStorage.getItem(k)).entries[1].technique",KEY)=="Straight-line regression"

def check_inline_notice_layout(page,node,width):
 # An icon plus ungrouped prose/emphasis would form separate flex columns.
 split=page.evaluate("""() => [...document.querySelectorAll('#main p, #main span')]
  .filter(el => ['flex','inline-flex'].includes(getComputedStyle(el).display)
   && [...el.children].some(child => child.matches('.icon,svg'))
   && [...el.children].some(child => child.matches('strong,b,em,a'))
   && [...el.childNodes].some(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim()))
  .map(el => ({tag:el.tagName, cls:el.className?.baseVal||el.className, text:el.textContent.slice(0,140)}))""")
 assert not split,(width,node,"icon notes split styled words into separate flex columns",split)
 selector={"C10":".intro-prediction-note","C60":".conclusion-specific-tip"}.get(node)
 if not selector:return
 note=page.locator("#main "+selector).first
 assert note.count()==1,(width,node,"expected a single contextual note")
 if not note.is_visible():
  note.evaluate("(el)=>{const panel=el.closest('details');if(panel)panel.open=true;}")
 assert note.is_visible(),(width,node,"note was not accessible")
 measures=note.evaluate("""el=>{
  const copy=el.querySelector(':scope > .inline-notice-copy');
  const icon=el.querySelector(':scope > .icon');
  const emphasis=el.querySelector('strong');
  const box=el.getBoundingClientRect(),text=copy?.getBoundingClientRect();
  return {hasCopy:!!copy,hasIcon:!!icon,emphasisInCopy:!!copy?.contains(emphasis),
   display:getComputedStyle(el).display,copyFlex:copy&&getComputedStyle(copy).flexGrow,
   width:box.width,textWidth:text?.width,
   overflow:el.scrollWidth>el.clientWidth+1};
 }""")
 assert measures["hasCopy"] and measures["hasIcon"] and measures["emphasisInCopy"],(width,node,measures)
 assert measures["display"]=="flex" and measures["copyFlex"]!="0",(width,node,measures)
 assert measures["textWidth"]>=0.68*measures["width"],(width,node,"copy was squeezed into a narrow column",measures)
 assert not measures["overflow"],(width,node,"notice overflowed its card",measures)
 note.screenshot(path=str(OUT/f"notice-{node}-{width}.png"),animations="disabled")

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
  check_inline_notice_layout(page,node,width)
  if node in STORY_CASES:
   check_story_guidance(page,node,width)
  if group is None:
   assert not errors,(width,node,errors)
   return
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
  if node=="C40":
   check_story_method_switch(page,width)
  assert not errors,(width,node,errors)
 finally:
  context.close()

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for width in (1440,390):
  for node,group,count in CASES:
   run_case(browser,node,group,count,width)
  for node in ("C35","C50"):
   run_case(browser,node,None,0,width)
 browser.close()
print("Writer-advice and mathematical-story browser checks passed across seven stages and both viewports.")
