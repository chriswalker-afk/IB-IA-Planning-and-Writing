"""Cleanup Pass 5: live student-data continuity, 16 pathways, all seven creators and cohort toggle.
Fictional fixture data only; tests the built Pages site at desktop and phone widths.
No simulated click is forced through a hidden UI element.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output/pass5-final"))
OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1"
MODEL=json.loads(subprocess.check_output(["node","--input-type=module","-e",r'''
import {createProjectState} from './src/core/project-state.js';
import {INVESTIGATIVE_ROUTES} from './src/planning/investigative-routes.js';
import {REPRESENTATION_TOOLS} from './src/diagrams/representation-registry.js';
const s=createProjectState();
s.route="completing";s.ui.writingIntroSeen=true;s.ui.planningIntroSeen=true;
s.completion.current="C31";s.completion.activeEntryIndex=0;
s.planning.fields.course="AA SL";s.planning.fields.kind="modelling";
s.planning.fields.aim="Can actual recorded distances support a restricted model?";
s.planning.fields.assessmentFramework="legacy";
s.entries=[{id:"actual-first",phase:"first",status:"completed",title:"Measured first result",
  result:"The measured model works only within its observed domain",
  interpretation:"This restricts possible predictions."}];
s.completion.review.records["draft-D02"].location="p. 3 older A-E note";
s.scratch.introduction="My original, student-written introduction";
s.completion.fields.mainConclusion="A carefully limited original conclusion";
for(const t of REPRESENTATION_TOOLS){
 const id=(t.id==="graph"?"figure":t.id)+"-pass5-"+t.id,draft=JSON.parse(JSON.stringify(s[t.studio].draft));
 if(t.id==="trace"){
  draft.imageSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/b0gAAAAASUVORK5CYII=";
  draft.width=32;draft.height=32;
 }
 s[t.studio].figures=[{id,entryId:"actual-first",savedAt:"2026-10-22T00:00:00.000Z",draft}];
 s.entries[0][t.entryKey]=id;
}
console.log(JSON.stringify({project:s,tools:REPRESENTATION_TOOLS.map(x=>({id:x.id,studio:x.studio,key:x.entryKey})),routes:INVESTIGATIVE_ROUTES.map(x=>x.id)}));
'''],text=True))
FULL=MODEL["project"]
TOOLS=MODEL["tools"]
ROUTES=MODEL["routes"]
RESTORE=OUT/"fictional-full-project.json"
RESTORE.write_text(json.dumps(FULL),encoding="utf8")
OLD={"version":1,"route":"completing",
 "project":{"aim":"Older mathematical question","permissions":"pending"},
 "completion":{"current":"C63","fields":{"mainConclusion":"Earlier conclusion still belongs to student"}},
 "entries":[{"id":"old-idea","phase":"legacy","status":"planned","result":""}],
 "scratch":{"introduction":"Older student-authored introduction"},
 "ui":{"writingIntroSeen":True,"planningIntroSeen":True}}
RESULTS=[]

def saved(p):
 return p.evaluate("(key)=>JSON.parse(localStorage.getItem(key))",KEY)
def width_ok(p):
 w=p.evaluate("({screen:innerWidth,content:document.documentElement.scrollWidth})")
 assert w["content"]<=w["screen"]+2,w
def restored_data(p):
 st=saved(p)
 assert st["planning"]["fields"]["aim"]==FULL["planning"]["fields"]["aim"]
 assert st["entries"][0]["result"]==FULL["entries"][0]["result"]
 assert st["scratch"]["introduction"]==FULL["scratch"]["introduction"]
 assert st["completion"]["fields"]["mainConclusion"]==FULL["completion"]["fields"]["mainConclusion"]
 assert st["completion"]["review"]["records"]["draft-D02"]["location"]=="p. 3 older A-E note"
 for tool in TOOLS:
  assert st["entries"][0][tool["key"]]==("figure" if tool["id"]=="graph" else tool["id"])+"-pass5-"+tool["id"],tool
  assert st[tool["studio"]]["figures"][0]["id"]==("figure" if tool["id"]=="graph" else tool["id"])+"-pass5-"+tool["id"],tool
  assert st[tool["studio"]]["figures"][0]["entryId"]=="actual-first",tool
 return st
def move_to(p,route,node,mode=None):
 # Direct fixture positioning is deliberately outside user actions.
 # Actual switching, choosing creators and importer interactions use real UI.
 p.evaluate("""({route,node,mode})=>{
   const key='ia-pathfinder-prototype-v1',s=JSON.parse(localStorage.getItem(key));
   s.route=route;
   if(route==='planning'){s.planning.current=node;s.journey.currentNodeId=node;}
   if(route==='completing')s.completion.current=node;
   if(mode)s.ui.adviceMode=mode;
   localStorage.setItem(key,JSON.stringify(s));
 }""",{"route":route,"node":node,"mode":mode})
 p.reload(wait_until="networkidle")
def run(browser,width):
 c=browser.new_context(viewport={"width":width,"height":844},is_mobile=width<600,
    has_touch=width<600,accept_downloads=True)
 p=c.new_page()
 p.set_default_timeout(16000)
 errors=[]
 p.on("pageerror",lambda e:errors.append(str(e)))
 p.add_init_script("if(!localStorage.getItem("+json.dumps(KEY)+"))localStorage.setItem("+
    json.dumps(KEY)+","+json.dumps(json.dumps(OLD))+");")
 try:
  p.goto(URL,wait_until="networkidle")
  assert p.locator('[data-source-node="C60"]').count()==1,"Old C63 conclusion did not reopen C60"
  assert p.locator("#main").get_attribute("data-assessment-framework")=="legacy"
  # Old conclusion paragraphs now live in a deliberately optional archived
  # notes disclosure. Open it, then verify the original editable student text.
  legacy=p.locator('[data-conclusion-legacy]')
  assert legacy.count()==1,'A former C63 conclusion must be recoverable in C60'
  legacy.locator('summary').click()
  assert 'Earlier conclusion' in p.locator('[data-bind="completion.fields.mainConclusion"]').input_value()
  # A real full-project file import must preserve student work, not just its
  # JSON shape. Normalization and redraw happen in the application.
  p.on("dialog",lambda dialog:dialog.accept())
  p.locator("#importFile").set_input_files(str(RESTORE))
  p.wait_for_function("""expected=>{
    try{
      const s=JSON.parse(localStorage.getItem('ia-pathfinder-prototype-v1'));
      return s?.planning?.fields?.aim===expected&&s?.entries?.[0]?.id==='actual-first';
    }catch{return false;}
  }""",FULL["planning"]["fields"]["aim"])
  restored_data(p)
  assert p.locator("#main").get_attribute("data-assessment-framework")=="legacy"
  width_ok(p)
  print("PASS old C63 -> C60 and seven-figure file import",width,flush=True)
  move_to(p,"planning","N02M")
  assert p.locator('[data-source-node="N02M"]').count()==1
  picker=p.locator('[data-bind="planning.fields.assessmentFramework"]')
  assert picker.is_visible()
  picker.select_option("revised2029")
  assert p.locator("#main").get_attribute("data-assessment-framework")=="revised2029"
  assert p.locator('[data-assessment-notice]').count()==1
  assert p.locator('[data-criterion-badge]:visible').count()==0
  restored_data(p)
  picker=p.locator('[data-bind="planning.fields.assessmentFramework"]')
  picker.select_option("legacy")
  assert p.locator("#main").get_attribute("data-assessment-framework")=="legacy"
  restored_data(p)
  p.locator('[data-action="math-mode"][data-mode="routes"]').click()
  buttons=p.locator('[data-action="math-open-route"][data-route-id]')
  assert buttons.count()==len(ROUTES)==16
  observed=set(buttons.evaluate_all("(nodes)=>nodes.map(n=>n.dataset.routeId)"))
  assert observed==set(ROUTES),(observed,set(ROUTES))
  assert p.locator(".journey-card").count()==16
  width_ok(p)
  print("PASS 16 browser pathways and two explicit assessment modes",width,flush=True)
  move_to(p,"completing","C31","reduced")
  hub=p.locator("[data-representation-hub]")
  assert hub.is_visible()
  assert hub.get_attribute("data-representation-advice-mode")=="reduced"
  for tool in TOOLS:
   assert hub.locator('[data-action="'+tool["id"]+'-open"]').count()==1,tool
  p.locator('[data-action="probability-open"]').first.click()
  assert p.locator("[data-probability-studio]").is_visible()
  buttons=p.locator('[data-representation-switcher] [data-action="representation-switch"]')
  assert set(buttons.evaluate_all("(els)=>els.map(e=>e.dataset.representationTool)"))==set(x["id"] for x in TOOLS)
  assert p.locator('[data-representation-switcher] [aria-current="page"]').count()==1
  p.locator('[data-action="representation-return"]').first.click()
  restored_data(p)
  width_ok(p)
  assert not errors,errors
  p.screenshot(path=str(OUT/("final-restoration-"+str(width)+".png")),
    full_page=True,animations="disabled")
  print("PASS seven usable editors, reduced advice and return safety",width,flush=True)
  return {"width":width,"status":"passed","routes":len(ROUTES),"generators":len(TOOLS)}
 finally:c.close()

if __name__=="__main__":
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,args=["--no-sandbox"])
  for width in (1440,390):
   try:RESULTS.append(run(b,width))
   except Exception as exc:
    traceback.print_exc()
    RESULTS.append({"width":width,"status":"failed","error":str(exc)})
  b.close()
 (OUT/"final-results.json").write_text(json.dumps(RESULTS,indent=2))
 print(json.dumps(RESULTS,indent=2),flush=True)
 assert all(x["status"]=="passed" for x in RESULTS)
