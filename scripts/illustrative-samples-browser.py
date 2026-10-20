"""Full fictional sample audit: presentation, navigation, cross-stage content and safe preview."""
import json,os,subprocess,traceback,zipfile
from pypdf import PdfReader
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1";PREVIEW="ia-pathfinder-sample-preview-v1"
OWN=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';const x=createProjectState();x.route='home';x.project.aim='My private project';x.scratch.introduction='PERSONAL WORK - NEVER CHANGE';console.log(JSON.stringify(x))"],text=True))
results=[]
def action(p,key):
 p.locator('[data-action="'+key+'"]:visible').first.click()
def own(p):return p.evaluate('(k)=>localStorage.getItem(k)',KEY)
def preview(p):return p.evaluate('(k)=>JSON.parse(sessionStorage.getItem(k))',PREVIEW)
def set_preview_node(p,node):
 p.evaluate("""([k,node])=>{
  const x=JSON.parse(sessionStorage.getItem(k));
  x.preview.route='completing';x.preview.completion.current=node;
  x.preview.ui.lastWorkRoute='completing';x.preview.ui.lastStudioNode=node;
  sessionStorage.setItem(k,JSON.stringify(x));
 }""",[PREVIEW,node])
 p.reload(wait_until="networkidle")
def check(kind,p):
 before=own(p)
 action(p,"open-demos")
 chooser=p.locator('.drawer')
 assert chooser.locator('[data-action="load-demo"]').count()==5
 assert "Planning" in chooser.inner_text()
 chooser.locator('[data-demo="'+kind+'"]').click()
 assert p.locator(".sample-preview-banner").is_visible()
 assert p.locator('[data-action="sample-journey"]').is_visible()
 assert own(p)==before
 data=preview(p)
 sample=data["preview"]
 assert sample["demo"]==kind
 assert len(sample["entries"])==3
 assert all(x["status"]=="completed" for x in sample["entries"])
 assert all(x["result"] and x["interpretation"] and x["nextQuestion"] for x in sample["entries"])
 assert sample["planning"]["fields"]["aim"]
 assert sample["completion"]["fields"]["mainConclusion"]
 assert sample["scratch"]["conclusion"]=="", "old conclusion scratch must not appear as current work"
 assert sample["completion"]["fields"]["conclusionBenefit"]
 assert sample["completion"]["fields"]["conclusionExtension"]
 assert sample["completion"]["review"]["records"]["draft-D06"]["note"]
 assert sample["completion"]["review"]["records"]["final-D16"]["status"]=="unchecked"
 assert sum(len(sample[part]["figures"]) for part in ("graphStudio","tableStudio"))==3
 assert all(any(e.get(key)==f["id"] for e in sample["entries"] for key in ("graphFigureId","tableFigureId"))
   for part in ("graphStudio","tableStudio") for f in sample[part]["figures"])
 assert sample["teacher"]["feedbackStatus"]=="not-requested"
 assert sample["planning"]["fields"]["milestoneSchoolFinal"]==""
 assert sample["project"]["documentUrl"]==""
 assert p.locator('.sample-preview-banner [data-action="export-sample-ia-pdf"]').count()==1
 assert p.locator('.sample-preview-metrics').count()==1
 if p.viewport_size["width"]==1440:
  with p.expect_download(timeout=65000) as ia_download:
   p.locator('.sample-preview-banner [data-action="export-sample-ia-pdf"]').click()
  sample_pdf=OUT/("ia-reading-"+kind+".pdf")
  ia_download.value.save_as(str(sample_pdf))
  pdf=PdfReader(str(sample_pdf))
  count=len(pdf.pages)
  assert 12<=count<=20,(kind,"IA-style PDF should be 12–20 pages, not the longer working record",count)
  image_count=sum(len(page.images) for page in pdf.pages)
  assert image_count>=3,(kind,"generated figures missing from the PDF",image_count)
  words=' '.join(page.extract_text() or '' for page in pdf.pages)
  assert "FICTIONAL" in words.upper()
  assert "Mathematical" in words or "MATHEMATICAL" in words
  assert own(p)==before
 if kind=="theory":
  assert sample["completion"]["fields"]["dataStatus"]=="theoretical"
  assert sample["completion"]["sourceRecords"]==[]
  assert "225−9=216" in sample["entries"][2]["result"]
 else:
  assert len(sample["completion"]["sourceRecords"])==1
  assert len(sample["completion"]["accuracyDecisions"])==1
  assert sample["completion"]["sourceRecords"][0]["id"] in sample["entries"][0]["sourceRefs"]
 action(p,"sample-journey")
 assert p.locator(".sample-preview-banner").is_visible()
 assert "journey" in p.locator("#main").inner_text().lower() or "explore" in p.locator("#main").inner_text().lower()
 assert own(p)==before
 set_preview_node(p,"C10")
 assert p.locator('[data-bind="scratch.introduction"]').is_visible()
 assert "FICTIONAL" in p.locator('[data-bind="scratch.introduction"]').input_value()
 set_preview_node(p,"C20")
 assert "actual" in p.locator("#main").inner_text().lower()
 set_preview_node(p,"C60")
 assert p.locator('[data-conclusion-workspace]').count()==1
 assert p.locator('[data-conclusion-part="next"]').count()==1
 assert p.locator('[data-conclusion-legacy]').count()==0
 assert p.locator('[data-bind="completion.fields.mainConclusion"]').count()==1
 assert p.locator('[data-bind="completion.fields.conclusionBenefit"]').count()==1
 assert p.locator('[data-bind="completion.fields.conclusionExtension"]').count()==1
 assert "FICTIONAL" in p.locator('[data-bind="completion.fields.mainConclusion"]').input_value()
 p.locator('[data-action="go-checking"]').click()
 assert p.locator('.checking-page').is_visible()
 assert p.locator('[data-criterion-badge="checking:A"]').count()>=1
 assert p.locator('.checking-progress').is_visible()
 assert own(p)==before
 set_preview_node(p,"C80")
 assert p.locator(".sample-preview-banner").is_visible()
 assert "sample" in p.locator("#main").inner_text().lower()
 if kind in ["curved","theory"]:
  # Export is a desktop topbar button; on small screens it lives in Here to help.
  files=p.locator('[data-action="open-panel"][data-panel="files"]:visible')
  if files.count():
   files.first.click()
  else:
   p.locator('.topbar [data-action="open-panel"][data-panel="help"]:visible').first.click()
   p.locator('.drawer [data-action="open-files"]').click()
  with p.expect_download(timeout=45000) as dl:
   p.locator('.drawer [data-action="export-full-zip"]').click()
  f=OUT/("illustrative-"+kind+".zip");dl.value.save_as(str(f))
  with zipfile.ZipFile(f) as z:
   saved=json.loads(z.read("ia-pathfinder-project.json"))
   assert saved["demo"]==kind
   assert len(saved["entries"])==3
   assert saved["entries"][2]["result"]==sample["entries"][2]["result"]
   assert saved["completion"]["fields"]["mainConclusion"]==sample["completion"]["fields"]["mainConclusion"]
   assert len(saved["graphStudio"]["figures"])+len(saved["tableStudio"]["figures"])==3
  p.keyboard.press("Escape")
 assert own(p)==before
 # When opening another scenario, the tab-local preview changes but own data must not.
 action(p,"open-demos")
 other="theory" if kind!="theory" else "linear"
 p.locator('[data-demo="'+other+'"]').click()
 assert preview(p)["preview"]["demo"]==other
 assert own(p)==before
 p.reload(wait_until="networkidle")
 assert preview(p)["preview"]["demo"]==other
 action(p,"leave-preview")
 assert own(p)==before
 assert p.evaluate('(k)=>sessionStorage.getItem(k)',PREVIEW) is None
 assert p.evaluate('(k)=>JSON.parse(localStorage.getItem(k)).scratch.introduction',KEY)=="PERSONAL WORK - NEVER CHANGE"
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(1440,960),(390,844)]:
  for kind in ["linear","curved","unclear","unexpected","theory"]:
   name="illustrative-"+kind+"-"+str(width)
   context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
   context.route("https://fonts.googleapis.com/**",lambda r:r.abort())
   p=context.new_page();p.set_default_timeout(10000);errors=[]
   p.on("pageerror",lambda err:errors.append(str(err)))
   p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(OWN))+');')
   try:
    p.goto(URL,wait_until="networkidle");check(kind,p)
    assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
    assert not errors,errors
    results.append({"scenario":kind,"viewport":width,"status":"passed"})
    p.screenshot(path=str(OUT/(name+".png")),full_page=True)
   except Exception as e:
    traceback.print_exc()
    results.append({"scenario":kind,"viewport":width,"status":"FAILED","error":str(e),"pageErrors":errors})
    p.screenshot(path=str(OUT/(name+"-failure.png")),full_page=True)
   context.close()
 browser.close()
(OUT/"illustrative-samples-results.json").write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert all(r["status"]=="passed" for r in results)
