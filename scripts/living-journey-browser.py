"""Acceptance for Living Journey and Insight Threads, using synthetic evidence only."""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
def fixture():
 s=copy.deepcopy(BASE)
 s["route"]="completing"
 s["ui"]["lastWorkRoute"]="completing"
 s["completion"]["current"]="C40"
 s["completion"]["activeEntryIndex"]=0
 s["planning"]["fields"].update(aim="How might distance change with time?",kind="modelling",dataSource="secondary",firstAction="Plot distance against time")
 s["project"]["aim"]=s["planning"]["fields"]["aim"]
 s["completion"]["sourceRecords"]=[{"id":"src-a","fields":{"actualSource":"Fictional classroom measurements","dataStatus":"ready","actualMethod":"Timed readings"}}]
 s["completion"]["accuracyDecisions"]=[{"id":"acc-a","quantity":"Distance","symbol":"d","unit":"cm","resolution":"1 cm","policy":"Nearest centimetre","reason":"Recorded resolution","sourceId":"src-a"}]
 s["entries"]=[
  {"id":"result-one","phase":"first","status":"completed","title":"First actual graph","result":"A genuine result was recorded by a fictional student","localTakeaway":"The graph is curved.","sourceRefs":["src-a"],"accuracyRefs":["acc-a"],"interpretation":"The curve helps answer the aim."},
  {"id":"result-two","phase":"substantial","status":"planned","title":"Possible next method","methodId":"pmcc","purpose":"Would a correlation coefficient help answer the aim?","fromEntryId":"result-one","sourceRefs":[],"accuracyRefs":[]}
 ]
 s["completion"]["stages"]["C30"]="complete"
 s["completion"]["stages"]["C40"]="working"
 s["completion"]["confirmedLimitations"]=[{"id":"lim-a","sourceId":"student","stage":"C40","entryId":"result-one","explanation":"Only a narrow range was measured","consequence":"Extrapolation outside this range is not justified"}]
 return s
def core(s):
 c=s["completion"]
 return json.dumps({
  "aim":s["planning"]["fields"]["aim"],
  "math":[(x.get("id"),x.get("result"),x.get("status"),x.get("fromEntryId") or "",x.get("sourceRefs") or [],x.get("accuracyRefs") or []) for x in s["entries"]],
  "source":[(x["id"],x["fields"].get("actualSource"),x["fields"].get("dataStatus")) for x in c["sourceRecords"]],
  "accuracy":[(x["id"],x["quantity"],x["policy"],x.get("sourceId")) for x in c["accuracyDecisions"]],
  "limit":[(x["id"],x["explanation"],x["consequence"]) for x in c["confirmedLimitations"]]
 },sort_keys=True)
def saved(p):return p.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",KEY)
def overflow(p):assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
results=[]
with sync_playwright() as pw:
 args={"headless":True,"args":["--no-sandbox"]}
 if os.environ.get("IA_CHROMIUM_EXECUTABLE"):args["executable_path"]=os.environ["IA_CHROMIUM_EXECUTABLE"]
 browser=pw.chromium.launch(**args)
 def run(name,fn,width,height,motion="no-preference"):
  ctx=browser.new_context(viewport={"width":width,"height":height},reduced_motion=motion,accept_downloads=True)
  ctx.route("https://fonts.googleapis.com/**",lambda r:r.abort())
  p=ctx.new_page();p.set_default_timeout(10000);errors=[];p.on("pageerror",lambda err:errors.append(str(err)))
  own=fixture();p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(own))+");")
  try:
   p.goto(URL,wait_until="networkidle")
   # A navigation persists the in-memory normalized fixture before comparing student content.
   p.locator('[data-nav="completing"]:visible').first.click()
   fn(p,own)
   overflow(p);assert not errors,errors
   results.append({"name":name,"status":"passed","viewport":str(width)+"x"+str(height)})
  except Exception as ex:
   traceback.print_exc()
   results.append({"name":name,"status":"FAILED","error":str(ex),"page_errors":errors})
   p.screenshot(path=str(OUT/("living-"+name+"-failure.png")),full_page=True,animations="disabled")
  ctx.close()
 def journey(p,original):
  baseline=core(saved(p))
  assert p.locator("#sideMilestones").count()==0,"The permanent navigation must not repeat the full chapter trail"
  assert p.locator(".living-trail").count()==0,"Focused writing screens show only a compact ribbon"
  assert p.locator(".living-ribbon .living-ribbon-part").count()==5
  assert p.locator(".living-ribbon .living-ribbon-part.checking").count()==1
  # The current studio exposes two relevant expandable sparks plus the full
  # library, not the retired insight-echo-item strip.
  shelf=p.locator('[data-spark-shelf="studio"]')
  assert shelf.count()==1 and shelf.is_visible()
  accuracy=shelf.locator('.spark-shelf-featured.insight-accuracy')
  assert accuracy.count()==1 and accuracy.is_visible()
  assert "Nearest centimetre" in accuracy.inner_text()
  accuracy.locator("summary").click()
  assert "Original resolution: 1 cm" in accuracy.inner_text()
  accuracy.locator('[data-action="insight-jump"]').click()
  assert p.locator('[data-source-node="C24"]').count()==1
  assert p.locator('[data-spark-shelf="studio"]').count()==1
  assert "Nearest centimetre" in p.locator('[data-spark-shelf="studio"]').inner_text()
  p.locator('[data-nav="path"]:visible').first.click()
  assert p.locator(".living-trail").is_visible()
  assert p.locator(".insight-toolkit").is_visible()
  trail=p.locator(".living-trail").first
  choices=trail.locator(".insight-trail-disclosure")
  assert choices.count()==1
  choices.locator("summary").first.click()
  chosen=choices.locator('[data-action="insight-focus"]').first
  chosen.click()
  assert chosen.get_attribute("aria-pressed")=="true"
  assert choices.locator(".insight-trail-detail:visible").count()==1
  assert trail.locator("svg .living-thread-line.is-active").count()==1
  chosen.click()
  assert chosen.get_attribute("aria-pressed")=="false"
  # Explore is a collapsible chapter, with actual and planned stars.
  p.locator('[data-journey-group="explore"] > summary').click()
  sky=p.locator(".math-constellation")
  assert sky.is_visible()
  assert sky.locator("svg .constellation-link").count()==1
  assert sky.locator('[data-action="completion-edit-entry"].constellation-star-hit').count()==2
  assert sky.locator('.math-journey-step-card').count()==2
  assert "Calculate Pearson's r (PMCC)" in sky.inner_text()
  assert sky.locator('.constellation-sky-wrap').evaluate("(el)=>el.getBoundingClientRect().height")<=112,"the constellation should be compact rather than stretching to desktop width"
  assert p.locator('.journey-record-heading').count()==0,"the old mathematical record list should not duplicate the journey"
  assert "1 actual result" in sky.inner_text()
  assert "Only a narrow range was measured" in p.locator(".insight-toolkit").inner_text()
  p.screenshot(path=str(OUT/("living-journey-"+str(p.viewport_size["width"])+".png")),full_page=True,animations="disabled")
  p.locator('.insight-toolkit-card[data-insight-type="planning"][data-node="N01"]').click()
  assert p.locator('[data-source-node="N01"]').count()==1
  assert p.locator(".planning-learning-trail").count()==1
  assert p.locator(".living-ribbon").count()==0
  assert p.locator(".living-trail").count()==0
  assert "How might distance change with time?" in p.locator("#main").inner_text()
  assert core(saved(p))==baseline,(baseline,core(saved(p)))
 for w,h in [(390,844),(1440,1000)]:
  run("thread-navigation-"+str(w),journey,w,h)
 # Layout test is separate because navigating back to an overview legitimately
 # changes the active stage and its relevant spark suggestions.
 def overview(p,original):
  baseline=core(saved(p))
  assert p.locator("#sideMilestones").count()==0
  assert p.locator(".living-ribbon").count()==1 and p.locator(".living-trail").count()==0
  p.locator('[data-action="completion-open"][data-node="C04"]').first.click()
  assert p.locator(".living-ribbon").count()==0,"Do not repeat the overview's illustrated trail"
  assert p.locator(".living-trail").count()==1,"Only one illustrated trail in the Studio overview"
  p.locator('.completion-stage-card[data-node="C10"]').first.click()
  assert p.locator(".living-ribbon").count()==1,"Focused writing pages still use the ribbon"
  assert p.locator(".living-trail").count()==0
  assert core(saved(p))==baseline,"Moving between chapters does not edit the student's mathematics"
 for w,h in [(390,844),(1440,1000)]:
  run("studio-overview-single-trail-"+str(w),overview,w,h)
 # Pass 2: one orientation map, a true current task, and genuine saved anchors.
 def planning_design(p,original):
  baseline=core(saved(p))
  p.locator('[data-nav="planning"]:visible').first.click()
  assert p.locator('.planning-learning-trail').count()==1
  assert p.locator('.living-trail').count()==0 and p.locator('.living-ribbon').count()==0
  assert p.locator('.planning-trail-overview-node').count()==10,"Desktop and phone share the same five-chapter template"
  if p.viewport_size["width"]>980:
   wrap=p.locator('.planning-trail-desktop')
   assert wrap.is_visible()
  else:
   disclosure=p.locator('.planning-trail-compact')
   assert disclosure.is_visible()
   assert 'anchors saved' in disclosure.locator('summary').first.inner_text()
   disclosure.locator('summary').first.click()
   wrap=disclosure.locator('.planning-trail-compact-body')
  assert wrap.locator('.planning-trail-overview-node:visible').count()==5
  assert 'Where are you starting?' in wrap.locator('.planning-trail-current-title').inner_text()
  assert 'Right now in Planning' in wrap.inner_text()
  assert 'planning anchors saved' in wrap.inner_text()
  assert 'Every screen counts' not in wrap.inner_text()
  assert 'screens completed' not in wrap.inner_text()
  chapter_detail=wrap.locator('.planning-trail-map-detail')
  assert not chapter_detail.get_attribute('open'),"Extra chapter descriptions start collapsed"
  chapter_detail.locator('summary').click()
  assert chapter_detail.locator('.planning-trail-chapter:visible').count()==5
  p.screenshot(path=str(OUT/("planning-discovery-pass-2-"+str(p.viewport_size["width"])+".png")),full_page=True,animations="disabled")
  wrap.locator('.planning-trail-overview-node.checking').click()
  assert p.locator('.checking-page').is_visible()
  assert core(saved(p))==baseline,"Trail navigation must preserve student work"
  # The exact current question heading must match the Trail (both widths).
  snapshot=saved(p)
  snapshot["route"]="planning";snapshot["planning"]["current"]="N01V"
  snapshot["ui"]["planningIntroSeen"]=True
  p.evaluate("(args)=>localStorage.setItem(args.key,JSON.stringify(args.value))",{"key":KEY,"value":snapshot})
  p.reload(wait_until="networkidle")
  assert p.locator('[data-source-node="N01V"]').count()==1
  assert "Have a clear motivation." in p.locator('[data-source-node="N01V"]').inner_text()
  if p.viewport_size["width"]>980:
   assert "Have a clear motivation." in p.locator('.planning-trail-desktop .planning-trail-current-title').inner_text()
  else:
   assert "Have a clear motivation." in p.locator('.planning-trail-compact > summary').inner_text()
  assert core(saved(p))==baseline
 for w,h in [(390,844),(1440,1000)]:
  run("planning-discovery-pass-2-"+str(w),planning_design,w,h)
 def reduced(p,original):
  baseline=core(saved(p))
  assert p.locator(".living-ribbon").is_visible()
  assert p.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches')
  assert p.evaluate('getComputedStyle(document.querySelector(".living-ribbon-part")).transitionDuration') in ("0s","0.0s")
  p.locator('[data-nav="home"]:visible').first.click()
  assert p.locator(".living-trail").is_visible()
  assert p.locator('.living-trail.is-compact .living-trail-step.current:visible').count()==1
  assert p.locator('.living-trail.is-compact .living-trail-step:not(.current):visible').count()==0
  assert p.locator('.living-trail-view-full').is_visible()
  assert "My Toolkit" in p.locator("#main").inner_text()
  assert core(saved(p))==baseline,(baseline,core(saved(p)))
 run("motion-preference",reduced,390,844,"reduce")
 browser.close()
(OUT/"living-journey-results.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
if any(x["status"]!="passed" for x in results):raise SystemExit(1)
