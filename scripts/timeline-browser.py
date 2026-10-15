"""IA timeline: two questions first, editable date suggestions, no fabricated deadlines."""
import copy,json,os,subprocess,traceback,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(exist_ok=True,parents=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output(["node","--input-type=module","-e", """
import {createProjectState} from "./src/core/project-state.js";
const s=createProjectState();
s.route="planning";
s.planning.current="N03H";
s.planning.fields.kind="statistics";
s.project.kind="statistics";
s.scratch.introduction="Existing introduction note: do not modify";
s.entries=[{id:"student-maths",status:"completed",result:"Original mathematical result must be preserved"}];
console.log(JSON.stringify(s));
"""],text=True))
results=[]
def saved(p):return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def tap(p,action):p.locator('[data-action="'+action+'"]:visible').first.click()
def goto_timeline(p):
 p.goto(URL,wait_until="networkidle")
 assert p.locator('[data-source-node="N03H"]').count()==1
def overflow(p):
 assert p.evaluate("document.documentElement.scrollWidth <= innerWidth+1")
def build(p,weeks,early):
 p.locator("#timeline-weeks").fill(str(weeks))
 p.locator('[data-choice="planning.fields.timelineEarly"][data-value="'+early+'"]').click()
 tap(p,"timeline-generate")
 assert p.locator(".timeline-milestones li").count()==8
def report_checks(p,name):
 tap(p,"open-files")
 with p.expect_download(timeout=45000) as d:
  tap(p,"export-plan-docx")
 file=OUT/(name+"-plan.docx")
 d.value.save_as(str(file))
 with zipfile.ZipFile(file) as z:
  xml=z.read("word/document.xml").decode()
  assert "TIME AVAILABLE FOR THE PROJECT" in xml
  assert "8 weeks" in xml
  assert "USABLE DATA / SOURCE MATERIAL" in xml
 with p.expect_download(timeout=45000) as d:
  tap(p,"export-full-zip")
 f=OUT/(name+"-project.zip");d.value.save_as(str(f))
 with zipfile.ZipFile(f) as z:
  backup=json.loads(z.read("ia-pathfinder-project.json"))
  assert backup["planning"]["fields"]["timelineWeeks"]=="8"
  assert backup["entries"][0]["result"]=="Original mathematical result must be preserved"
 tap(p,"close-drawer")
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 def run(name,scenario,w=1440,h=960,changes=None):
  fixture=copy.deepcopy(BASE)
  if changes:changes(fixture)
  context=b.new_context(viewport={"width":w,"height":h},accept_downloads=True)
  context.route("https://fonts.googleapis.com/**",lambda route:route.abort())
  p=context.new_page();p.set_default_timeout(9000);errors=[]
  p.on("pageerror",lambda e:errors.append(str(e)))
  p.add_init_script("localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(fixture))+");")
  try:
   goto_timeline(p);scenario(p);overflow(p);assert not errors,errors
   p.screenshot(path=str(OUT/("timeline-"+name+".png")),full_page=True)
   results.append({"test":name,"status":"passed","viewport":str(w)+"x"+str(h)})
  except Exception as exc:
   traceback.print_exc()
   p.screenshot(path=str(OUT/("timeline-"+name+"-failure.png")),full_page=True)
   results.append({"test":name,"status":"FAILED","error":str(exc),"pageErrors":errors})
  context.close()
 def simple(p):
  assert p.locator("#timeline-weeks").is_visible()
  assert p.locator(".timeline-advanced").get_attribute("open") is None
  assert not p.locator(".timeline-advanced-body").is_visible()
  assert p.locator(".timeline-milestones li").count()==0
  build(p,8,"yes")
  data=saved(p);f=data["planning"]["fields"]
  assert f["timelineWeeks"]=="8" and f["timelineEarly"]=="yes"
  assert len(f["timelineStart"])==10
  assert f["milestonePlan"]<=f["milestoneData"]<=f["milestoneFirstVisual"]<=f["milestoneVisualReview"]<=f["milestoneFirstMath"]<=f["milestoneFurtherMath"]<=f["milestoneDraft"]<=f["milestoneReview"]
  assert data["entries"][0]["result"]=="Original mathematical result must be preserved"
  assert p.locator(".timeline-buffer").is_visible()
  p.locator(".timeline-advanced summary").click()
  assert p.locator(".timeline-advanced-body").is_visible()
  p.locator('[data-bind="planning.fields.milestoneSchoolFinal"]').fill("2027-03-20")
  p.locator('[data-bind="planning.fields.milestoneDraft"]').fill("2026-12-03")
  assert "3 Dec 2026" in p.locator('[data-timeline-date="milestoneDraft"]').inner_text()
  p.locator("#timeline-weeks").fill("10")
  tap(p,"timeline-generate")
  changed=saved(p)["planning"]["fields"]
  assert changed["milestoneDraft"]=="2026-12-03"
  assert changed["milestoneSchoolFinal"]=="2027-03-20"
  assert changed["milestoneData"]!=f["milestoneData"]
  assert saved(p)["scratch"]["introduction"]=="Existing introduction note: do not modify"
 def import_export(p):
  build(p,8,"no")
  report_checks(p,"timeline-reports")
 def old(p):
  assert p.locator(".timeline-milestones li").count()==0
  assert p.locator(".timeline-advanced summary").is_visible()
  build(p,8,"yes")
  data=saved(p)["planning"]["fields"]
  assert data["milestoneDraft"]=="2026-12-11"
  assert data["milestoneSchoolFinal"]=="2027-02-08"
 def old_changes(s):
  s["planning"]["fields"]["milestoneDraft"]="2026-12-11"
  s["planning"]["fields"]["milestoneSchoolFinal"]="2027-02-08"
 def theory(p):
  build(p,3,"yes")
  assert "Choose definitions and useful starting examples" in p.locator(".timeline-milestones").inner_text()
 for w,h in [(1440,960),(390,844),(360,740)]:
  run("simple-edit-"+str(w),simple,w,h)
 run("exports",import_export)
 run("legacy-date-safety",old,390,844,old_changes)
 def theoryChange(s):
  s["planning"]["fields"]["kind"]="theoretical"
  s["project"]["kind"]="theoretical"
 run("theory-no-data",theory,390,844,theoryChange)
 b.close()
(OUT/"timeline-browser-results.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert all(x["status"]=="passed" for x in results)
