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
  {"id":"result-two","phase":"substantial","status":"planned","title":"Possible next method","purpose":"Would a curved model be useful?","fromEntryId":"result-one","sourceRefs":[],"accuracyRefs":[]}
 ]
 s["completion"]["stages"]["C30"]="complete"
 s["completion"]["stages"]["C40"]="working"
 s["completion"]["confirmedLimitations"]=[{"id":"lim-a","sourceId":"student","stage":"C40","entryId":"result-one","explanation":"Only a narrow range was measured","consequence":"Extrapolation outside this range is not justified"}]
 return s
def core(s):return json.dumps([s["planning"]["fields"],s["entries"],s["completion"]["sourceRecords"],s["completion"]["accuracyDecisions"],s["completion"]["confirmedLimitations"]],sort_keys=True)
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
   p.goto(URL,wait_until="networkidle");fn(p,own)
   overflow(p);assert not errors,errors
   results.append({"name":name,"status":"passed","viewport":str(width)+"x"+str(height)})
  except Exception as ex:
   traceback.print_exc()
   results.append({"name":name,"status":"FAILED","error":str(ex),"page_errors":errors})
   p.screenshot(path=str(OUT/("living-"+name+"-failure.png")),full_page=True,animations="disabled")
  ctx.close()
 def journey(p,original):
  assert p.locator(".living-ribbon .living-ribbon-part").count()==4
  echo=p.locator(".insight-echo-item.insight-accuracy")
  assert echo.count()==1 and echo.is_visible()
  assert "Nearest centimetre" in echo.inner_text()
  echo.locator('[data-action="insight-jump"]').click()
  assert p.locator('[data-source-node="C24"]').count()==1
  assert p.locator(".insight-capture.is-captured.insight-accuracy").count()==1
  p.locator('[data-nav="path"]:visible').first.click()
  assert p.locator(".living-trail").is_visible()
  assert p.locator(".insight-toolkit").is_visible()
  # Explore is a collapsible chapter, with actual and planned stars.
  p.locator('[data-journey-group="explore"] > summary').click()
  sky=p.locator(".math-constellation")
  assert sky.is_visible()
  assert sky.locator("svg .constellation-link").count()==1
  assert "1 actual result" in sky.inner_text()
  assert "Only a narrow range was measured" in p.locator(".insight-toolkit").inner_text()
  p.screenshot(path=str(OUT/("living-journey-"+str(p.viewport_size["width"])+".png")),full_page=True,animations="disabled")
  p.locator('.insight-toolkit-card[data-insight-type="planning"][data-node="N01"]').click()
  assert p.locator('[data-source-node="N01"]').count()==1
  assert "Spark saved" in p.locator(".insight-capture").inner_text()
  assert core(saved(p))==core(original)
 for w,h in [(390,844),(1440,1000)]:
  run("thread-navigation-"+str(w),journey,w,h)
 def reduced(p,original):
  assert p.locator(".living-ribbon").is_visible()
  assert p.evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches')
  assert p.evaluate('getComputedStyle(document.querySelector(".living-ribbon-part")).transitionDuration') in ("0s","0.0s")
  p.locator('[data-nav="home"]:visible').first.click()
  assert p.locator(".living-trail").is_visible()
  assert "My Toolkit" in p.locator("#main").inner_text()
  assert core(saved(p))==core(original)
 run("motion-preference",reduced,390,844,"reduce")
 browser.close()
(OUT/"living-journey-results.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
if any(x["status"]!="passed" for x in results):raise SystemExit(1)
