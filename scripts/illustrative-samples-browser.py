"""Complete fictional IAs: reader, maths, native figures, exports and safe preview."""
import json, os, re, subprocess, traceback, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from pypdf import PdfReader
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1";PREVIEW="ia-pathfinder-sample-preview-v1"
IDS=["standing-reach","tray-optimisation"]
STUDIOS=["graphStudio","tableStudio","statStudio","geometryStudio","imageTracer","voronoiStudio","probabilityStudio"]
OWN=json.loads(subprocess.check_output(["node","--input-type=module","-e",
 "import {createProjectState} from './src/core/project-state.js';const s=createProjectState();s.route='home';s.project.aim='My private project';s.scratch.introduction='PERSONAL WORK - NEVER CHANGE';console.log(JSON.stringify(s))"],text=True))
results=[]
def action(page,key):page.locator('[data-action="'+key+'"]:visible').first.click()
def own(page):return page.evaluate('(k)=>localStorage.getItem(k)',KEY)
def preview(page):return page.evaluate('(k)=>JSON.parse(sessionStorage.getItem(k)).preview',PREVIEW)
def set_node(page,node,index=0):
 page.evaluate("""([key,node,index])=>{
  const s=JSON.parse(sessionStorage.getItem(key));
  s.preview.route='completing';s.preview.completion.current=node;
  s.preview.completion.activeEntryIndex=index;
  s.preview.ui.lastWorkRoute='completing';s.preview.ui.lastStudioNode=node;
  sessionStorage.setItem(key,JSON.stringify(s));
 }""",[PREVIEW,node,index])
 page.reload(wait_until="networkidle")
def download(page,button,path):
 with page.expect_download(timeout=120000) as pending:button.click()
 pending.value.save_as(str(path))
 assert path.stat().st_size>3000
def check_exports(page,kind,sample,figure_count):
 pdf_path=OUT/("complete-"+kind+".pdf")
 download(page,page.locator('.sample-reader [data-action="export-sample-ia-pdf"]'),pdf_path)
 pdf=PdfReader(str(pdf_path))
 text="\n".join(part.extract_text() or "" for part in pdf.pages)
 assert "FICTIONAL" in text
 assert "Starting material and mathematical approach" in text
 assert "Conclusion" in text
 assert "My method and why I chose it" not in text,"field labels leaked into the IA"
 assert sum(len(part.images) for part in pdf.pages)>=figure_count
 # Check the full conclusion, without padding the narrative to a page quota.
 prose=re.split(r'\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]',sample["completion"]["fields"]["mainConclusion"])
 concluding_words=max(prose,key=len).strip()[:70]
 assert " ".join(concluding_words.split()) in " ".join(text.split())
 assert all((part.extract_text() or "").strip() for part in pdf.pages),"empty PDF page"
 word_path=OUT/("complete-"+kind+".docx")
 download(page,page.locator('.sample-reader [data-action="export-sample-ia-docx"]'),word_path)
 with zipfile.ZipFile(word_path) as archive:
  root=ET.fromstring(archive.read("word/document.xml"))
  namespace={"w":"http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
  text="\n".join("".join(node.itertext()) for node in root.findall(".//w:t",namespace))
  assert sample["planning"]["fields"]["provisionalTitle"] in text
  assert "Starting material and mathematical approach" in text
  assert "About this fictional example" in text
  assert "About this full working record" not in text
  assert " ".join(concluding_words.split()) in " ".join(text.split())
  assert len([name for name in archive.namelist() if name.startswith("word/media/")])>=figure_count
  assert "customXml/iaPathfinderPlan.xml" in archive.namelist()
 return {"pdfPages":len(pdf.pages),"pdfBytes":pdf_path.stat().st_size,"wordBytes":word_path.stat().st_size}
def check(page,kind,width):
 before=own(page)
 action(page,"open-demos")
 chooser=page.locator(".drawer")
 assert chooser.locator('[data-action="load-demo"]').count()==len(IDS)
 assert "field by field" in chooser.inner_text()
 chooser.locator('[data-demo="'+kind+'"]').click()
 assert page.locator(".sample-preview-banner").is_visible()
 sample=preview(page)
 assert sample["demo"]==kind
 assert len(sample["entries"])==5
 assert all(entry["status"]=="completed" for entry in sample["entries"])
 assert sample["teacher"]["feedbackStatus"]=="not-requested"
 assert sample["completion"]["review"]["records"]["final-D16"]["status"]=="unchecked"
 assert sample["scratch"]["conclusion"]==""
 figure_count=sum(len(sample[studio]["figures"]) for studio in STUDIOS)
 assert figure_count==6
 assert own(page)==before
 action(page,"sample-read-ia")
 reader=page.locator(".sample-reader");reader.wait_for()
 assert reader.locator(".sample-reader-section").count()==len(sample["entries"])+4
 assert reader.locator("[data-sample-figure]").count()==figure_count
 assert reader.locator(".math-preview-equation").count()>30
 assert reader.locator(".math-preview-invalid").count()==0
 assert reader.locator(".sample-reader-error").count()==0
 assert reader.locator('[data-action="math-edit-existing"]').count()==0
 assert page.locator(".sample-reader-drawer").evaluate("(e)=>e.scrollWidth<=e.clientWidth+1")
 assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
 page.screenshot(path=str(OUT/(kind+"-reader-"+str(width)+".png")),animations="disabled")
 figure=reader.locator("[data-sample-figure]").first
 figure.scroll_into_view_if_needed()
 figure.screenshot(path=str(OUT/(kind+"-figure-"+str(width)+".png")))
 metrics=check_exports(page,kind,sample,figure_count) if width==1440 else {}
 action(page,"close-drawer")
 set_node(page,"C10")
 field=page.locator('[data-bind="scratch.introduction"]')
 assert field.is_visible()
 marker=" I checked this sample in the reader."
 field.fill(field.input_value()+marker);field.blur()
 page.wait_for_function("([k,m])=>JSON.parse(sessionStorage.getItem(k)).preview.scratch.introduction.includes(m)",arg=[PREVIEW,marker])
 page.reload(wait_until="networkidle")
 action(page,"sample-read-ia")
 assert marker.strip() in page.locator(".sample-reader").inner_text()
 action(page,"close-drawer")
 assert own(page)==before
 for node,index in [("C20",0),("C30",0),("C40",1),("C50",2)]:
  set_node(page,node,index)
  assert page.locator(".sample-preview-banner").is_visible()
  assert page.locator("#main").inner_text().strip()
  assert own(page)==before
 set_node(page,"C30")
 tool="geometry" if kind=="tray-optimisation" else "graph"
 action(page,tool+"-open")
 assert preview(page)[tool+"Studio"]["open"] is True
 assert preview(page)[tool+"Studio"]["activeId"]==sample["entries"][0][tool+"FigureId"]
 action(page,"representation-return")
 set_node(page,"C60")
 assert page.locator("[data-conclusion-workspace]").count()==1
 assert page.locator('[data-bind="completion.fields.mainConclusion"]').input_value()==sample["completion"]["fields"]["mainConclusion"]
 assert page.locator("[data-conclusion-legacy]").count()==0
 action(page,"go-checking")
 assert page.locator(".checking-page").is_visible()
 assert page.locator(".checking-progress").is_visible()
 if width==1440:
  page.locator('[data-action="open-panel"][data-panel="files"]:visible').first.click()
  bundle=OUT/("complete-"+kind+".zip")
  download(page,page.locator('.drawer [data-action="export-full-zip"]'),bundle)
  with zipfile.ZipFile(bundle) as archive:
   saved=json.loads(archive.read("ia-pathfinder-project.json"))
   assert saved["demo"]==kind
   assert saved["scratch"]["introduction"].endswith(marker)
   assert saved["entries"]==preview(page)["entries"]
   assert sum(len(saved[studio]["figures"]) for studio in STUDIOS)==figure_count
   assert saved["dataShelf"]==sample["dataShelf"]
  action(page,"close-drawer")
 action(page,"sample-journey")
 assert "journey" in page.locator("#main").inner_text().lower()
 action(page,"open-demos")
 other=next(value for value in IDS if value!=kind)
 page.locator('[data-demo="'+other+'"]').click()
 assert preview(page)["demo"]==other
 page.reload(wait_until="networkidle")
 assert preview(page)["demo"]==other
 action(page,"leave-preview")
 assert own(page)==before
 assert page.evaluate("(k)=>sessionStorage.getItem(k)",PREVIEW) is None
 assert page.evaluate("(k)=>JSON.parse(localStorage.getItem(k)).scratch.introduction",KEY)=="PERSONAL WORK - NEVER CHANGE"
 return metrics
with sync_playwright() as playwright:
 options={"headless":True,"args":["--no-sandbox"]}
 if os.environ.get("IA_QA_CHROMIUM"):options["executable_path"]=os.environ["IA_QA_CHROMIUM"]
 browser=playwright.chromium.launch(**options)
 for width,height in [(1440,960),(390,844)]:
  for kind in IDS:
   context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True)
   context.route("https://fonts.googleapis.com/**",lambda route:route.abort())
   page=context.new_page();page.set_default_timeout(15000);errors=[]
   page.on("pageerror",lambda error:errors.append(str(error)))
   page.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(OWN))+');')
   try:
    page.goto(URL,wait_until="networkidle")
    metrics=check(page,kind,width)
    assert not errors,errors
    results.append({"scenario":kind,"viewport":width,"status":"passed",**metrics})
   except Exception as error:
    traceback.print_exc()
    results.append({"scenario":kind,"viewport":width,"status":"FAILED","error":str(error),"pageErrors":errors})
    page.screenshot(path=str(OUT/(kind+"-"+str(width)+"-failure.png")),full_page=True)
   print(json.dumps(results[-1]),flush=True)
   context.close()
 browser.close()
(OUT/"illustrative-samples-results.json").write_text(json.dumps(results,indent=2))
assert all(result["status"]=="passed" for result in results)
