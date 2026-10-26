"""Release gate: real JSON backup/restore, legacy v1 migration and failure safety.
Synthetic fixtures only; never reads or uploads a student's personal work.
"""
import copy
import json
import os
import subprocess
import traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/release-backup"))
OUT.mkdir(parents=True,exist_ok=True)
KEY="ia-pathfinder-prototype-v1"
BASE=json.loads(subprocess.check_output([
 "node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"
],text=True))
for key in ("writerGuideIntroSeen","writingIntroSeen","planningIntroSeen"):
 BASE["ui"][key]=True

def contemporary():
 state=copy.deepcopy(BASE)
 state["route"]="home"
 state["project"].update(aim="How might our measurements be compared?",course="AA SL",
                         precision="0.1 cm",prediction="Differences may not be linear.")
 state["planning"]["fields"]["course"]="AA SL"
 state["scratch"]["introduction"]="Student's actual motivation and first-person aim."
 state["scratch"]["conclusion"]="An unfinished reflection — do not mark complete."
 state["entries"]=[{"id":"step-first","title":"Compare the measurements","phase":"first",
                   "status":"planned","kind":"diagram","result":"",
                   "interpretation":"", "figureRefs":["graph:figure-release-1"],
                   "graphFigureId":"figure-release-1"}]
 state["graphStudio"]["figures"]=[{"id":"figure-release-1",
   "entryId":"step-first","savedAt":"2026-10-24T00:00:00Z",
   "draft":copy.deepcopy(state["graphStudio"]["draft"])}]
 state["graphStudio"]["activeId"]="figure-release-1"
 state["resources"]["preferences"]["entry:graph"]={"tool":"desmos","image":"points"}
 state["completion"]["review"]["records"]["draft-D02"]["location"]="Pages 2–3"
 state["completion"]["review"]["records"]["draft-D02"]["note"]="Check aim in my actual IA"
 state["ui"]["adviceMode"]="reduced"
 return state

def historic():
 return {
  "version":1,"route":"home",
  "project":{"aim":"Would the old investigation hold?","course":"AA HL",
             "precision":"nearest 0.1 cm","permissions":"pending",
             "ideaStatus":"yes","prediction":"It may increase"},
  "ui":{"planStep":6,"planMax":6,"mathIndex":0,"studioSection":"math",
        "writerGuideIntroSeen":True,"writingIntroSeen":True,"planningIntroSeen":True},
  "scratch":{"introduction":"Original v1 writing, keep word for word.",
             "dataNotes":"v1 notes are not results"},
  "entries":[{"id":"v1-first","status":"planned","phase":"first",
              "title":"A proposed method","result":""}],
  "cueNotes":{"interpret-v1-first":"The student's old reflection note"}
 }

def page(browser,width,record):
 context=browser.new_context(viewport={"width":width,"height":880},accept_downloads=True,
                             is_mobile=width<=390,has_touch=width<=390)
 context.route("https://fonts.googleapis.com/**",lambda route:route.abort())
 p=context.new_page()
 p.set_default_timeout(10000)
 errors=[]
 p.on("pageerror",lambda error:errors.append(str(error)))
 script="if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+json.dumps(KEY)+","+json.dumps(json.dumps(record))+");"
 p.add_init_script(script)
 p.goto(URL,wait_until="networkidle")
 return context,p,errors

def saved(p):
 return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)

def open_files(p,width):
 if width>=761 and p.locator('.topbar [data-action="open-panel"][data-panel="files"]').is_visible():
  p.locator('.topbar [data-action="open-panel"][data-panel="files"]').click()
 else:
  p.locator('.topbar [data-action="open-panel"][data-panel="help"]').click()
  p.locator('.drawer [data-action="open-files"]').click()
 drawer=p.locator('#drawerLayer:not([hidden]) .drawer')
 assert drawer.is_visible()
 primary=drawer.locator('[data-action="export-json"][data-backup-primary="true"]:visible')
 assert primary.count()==1 and primary.is_visible(),"Normal JSON backup not reachable"
 recovery=drawer.locator('[data-action="export-json"][data-backup-recovery="true"]')
 assert recovery.count()==1 and not recovery.is_visible(),"Recovery only after a failed export"
 assert drawer.locator('[data-action="import-json"]').count()==1
 return primary

def download(p,width,path):
 button=open_files(p,width)
 with p.expect_download() as dl: button.click()
 dl.value.save_as(str(path))
 output=json.loads(path.read_text())
 assert output["version"]==2
 assert output["route"]=="home"
 return output

def assert_preserved(p,snapshot):
 st=saved(p)
 for key in ("project","scratch","entries","resources","ideaExplorer","graphStudio",
             "completion","teacher","writingLedger","evidence","ui"):
  if key=="ui":
   assert st[key]["adviceMode"]==snapshot[key]["adviceMode"],key
  else:
   assert st[key]==snapshot[key],key
 assert all(entry["status"]=="planned" for entry in st["entries"])
 assert not st["evidence"]["results"],"Saving a diagram never creates evidence or a result"

def modern_roundtrip(browser,width):
 ctx,p,errors=page(browser,width,contemporary())
 try:
  # One canonical JSON backup is accessible on both mobile and desktop.
  source=OUT/("modern-"+str(width)+".json")
  backup=download(p,width,source)
  assert backup["project"]["aim"]=="How might our measurements be compared?"
  assert backup["completion"]["review"]["records"]["draft-D02"]["location"]=="Pages 2–3"
  assert backup["resources"]["preferences"]["entry:graph"]["tool"]=="desmos"
  assert backup["graphStudio"]["figures"][0]["id"]=="figure-release-1"
  assert backup["entries"][0]["status"]=="planned"
  before=saved(p)
  invalid=OUT/"invalid-project.json"
  invalid.write_text(json.dumps({"version":99,"project":{"aim":"Danger"}}))
  messages=[]
  p.once("dialog",lambda dialog:(messages.append(dialog.message),dialog.accept()))
  p.locator("#importFile").set_input_files(str(invalid))
  p.wait_for_function("() => document.querySelector('#importFile').value===''")
  assert any("not a compatible Pathfinder project" in m for m in messages),messages
  assert saved(p)==before,"Bad import replaced the real project"
  p.once("dialog",lambda dialog:dialog.dismiss())
  p.locator("#importFile").set_input_files(str(source))
  p.wait_for_function("() => document.querySelector('#importFile').value===''")
  assert saved(p)==before,"Cancelled restore changed the real project"
  # Simulate an altered local workspace; now restore the downloaded file via
  # the actual file picker and confirmation, not through a test-only setter.
  p.evaluate("""(key) => {
    const state=JSON.parse(localStorage.getItem(key));
    state.project.aim="Temporary different project";
    state.entries=[];state.graphStudio.figures=[];
    localStorage.setItem(key,JSON.stringify(state));
  }""",KEY)
  p.reload(wait_until="networkidle")
  assert saved(p)["project"]["aim"]=="Temporary different project"
  p.once("dialog",lambda dialog:dialog.accept())
  p.locator("#importFile").set_input_files(str(source))
  p.wait_for_function("(key)=>JSON.parse(localStorage.getItem(key)).project.aim==='How might our measurements be compared?'",arg=KEY)
  assert_preserved(p,backup)
  assert not errors,errors
  print("PASS full JSON roundtrip and rejected/cancelled restore",width,flush=True)
 finally:ctx.close()

def legacy_roundtrip(browser):
 ctx,p,errors=page(browser,390,historic())
 try:
  # Loading a legacy v1 localStorage value must never turn plans into results.
  assert p.locator("#main").is_visible()
  path=OUT/"v1-migrated.json"
  backup=download(p,390,path)
  assert backup["version"]==2
  assert backup["project"]["aim"]=="Would the old investigation hold?"
  assert backup["scratch"]["introduction"]=="Original v1 writing, keep word for word."
  assert backup["entries"][0]["status"]=="planned"
  assert backup["entries"][0]["result"]==""
  assert backup["teacher"]["pendingApproval"] is True
  assert backup["journey"]["answers"]["N01"]=="Would the old investigation hold?"
  assert backup["cueNotes"]["interpret-v1-first"]=="The student's old reflection note"
  assert not backup["evidence"]["results"]
  assert not errors,errors
  print("PASS legacy v1 loads and exports as compatible v2",flush=True)
 finally:ctx.close()
 # Re-import the migrated archive from a separate clean workspace.
 clean,p,errors=page(browser,390,BASE)
 try:
  original=saved(p)
  p.once("dialog",lambda dialog:dialog.accept())
  p.locator("#importFile").set_input_files(str(path))
  p.wait_for_function("(key)=>JSON.parse(localStorage.getItem(key)).project.aim==='Would the old investigation hold?'",arg=KEY)
  restored=saved(p)
  for field in ("project","scratch","entries","cueNotes","journey","teacher"):
   assert restored[field]==backup[field],field
  assert original["project"]["aim"]!=restored["project"]["aim"]
  assert not restored["evidence"]["results"]
  assert not errors,errors
  print("PASS legacy v1 backup reimports into a new v2 browser project",flush=True)
 finally:clean.close()


def distribution_restoration(browser,width):
 record=contemporary()
 d=record["distributionStudio"]["draft"]
 d.update({"kind":"poisson","title":"My referenced Poisson model",
           "symbol":"T","lambda":"3","mode":"left","lower":"4",
           "sourceKind":"secondary","sourceCredit":"Original published source",
           "caption":"IA caption retained separately","note":"My model assumptions stay",
           "edited":True})
 record["distributionStudio"]["figures"]=[{
  "id":"distribution-restored","entryId":"stage-restored",
  "savedAt":"2026-10-26T00:00:00Z","draft":copy.deepcopy(d)}]
 record["distributionStudio"]["activeId"]="distribution-restored"
 record["distributionStudio"]["inverse"]={"mode":"left","probability":"0.95","status":"idle","signature":""}
 record["entries"].append({"id":"stage-restored","phase":"first","status":"completed",
  "title":"A numerical interpretation","result":"The original numerical result",
  "interpretation":"My own explanation of the probability","limitations":"A sourcing limitation",
  "distributionFigureId":"distribution-restored",
  "figureRefs":["distribution:distribution-restored"]})
 record["scratch"]["conclusion"]="My private conclusion before backup"
 ctx,p,errors=page(browser,width,record)
 try:
  file=OUT/("distribution-archive-"+str(width)+".json")
  backed=download(p,width,file)
  assert backed["distributionStudio"]["figures"][0]["draft"]["sourceCredit"]=="Original published source"
  assert backed["distributionStudio"]["figures"][0]["draft"]["caption"]=="IA caption retained separately"
  baseline=saved(p)
  # A truncated JSON backup is rejected before the confirmation and cannot
  # replace current local work (even if the upload dialog is dismissed).
  broken=OUT/"distribution-truncated.json"
  broken.write_text('{"version":2,"project":')
  notices=[]
  p.once("dialog",lambda dialog:(notices.append(dialog.message),dialog.accept()))
  p.locator("#importFile").set_input_files(str(broken))
  p.wait_for_function("()=>document.querySelector('#importFile').value===''")
  assert any("could not be imported" in m.lower() for m in notices),notices
  assert saved(p)==baseline
  wrong=OUT/"distribution-wrong-version.json"
  wrong.write_text(json.dumps({"version":99,"project":{"aim":"Replace student work"},"distributionStudio":{"figures":[]}}))
  p.once("dialog",lambda dialog:dialog.accept())
  p.locator("#importFile").set_input_files(str(wrong))
  p.wait_for_function("()=>document.querySelector('#importFile').value===''")
  assert saved(p)==baseline
  # Deliberately simulate a lost current editor. Restore the complete file and
  # confirm not just a model but authored text and linked figure identities.
  p.evaluate("""key=>{
   const s=JSON.parse(localStorage.getItem(key));
   s.distributionStudio.figures=[];
   s.distributionStudio.draft.title="Temporary overwritten title";
   s.entries=[];s.scratch.conclusion="Temporary note";
   localStorage.setItem(key,JSON.stringify(s));
  }""",KEY)
  p.reload(wait_until="networkidle")
  p.once("dialog",lambda dialog:dialog.accept())
  p.locator("#importFile").set_input_files(str(file))
  p.wait_for_function("(key)=>JSON.parse(localStorage.getItem(key)).distributionStudio.figures.length===1",arg=KEY)
  restored=saved(p)
  assert restored["distributionStudio"]["figures"]==backed["distributionStudio"]["figures"]
  assert restored["distributionStudio"]["draft"]["title"]=="My referenced Poisson model"
  assert restored["distributionStudio"]["activeId"]=="distribution-restored"
  assert restored["entries"]==backed["entries"]
  assert restored["scratch"]==backed["scratch"]
  assert restored["project"]["aim"]==backed["project"]["aim"]
  assert restored["entries"][-1]["status"]=="completed"
  assert restored["entries"][-1]["reviewNeeded"]==backed["entries"][-1]["reviewNeeded"]
  assert not errors,errors
  print("PASS 5.5.3 corrupt backup rejected and entire distribution project restored",width,flush=True)
 finally:ctx.close()

if __name__=="__main__":
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True)
  try:
   modern_roundtrip(browser,1440)
   modern_roundtrip(browser,390)
   legacy_roundtrip(browser)
   for width in (1440,390):distribution_restoration(browser,width)
  finally:browser.close()
