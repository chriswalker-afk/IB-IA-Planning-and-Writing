"""Complete fictional IAs: reader, maths, native figures, exports and safe preview."""
import json, os, re, subprocess, time, traceback, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from pypdf import PdfReader
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get("IA_QA_OUTPUT","qa-output"));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get("IA_QA_URL","http://127.0.0.1:8765/")
KEY="ia-pathfinder-prototype-v1";PREVIEW="ia-pathfinder-sample-preview-v1"
CATALOGUE=json.loads(subprocess.check_output(["node","--input-type=module","-e",r"""
 import {createIllustrativeSample,SAMPLE_CHOICES} from './src/core/illustrative-samples.js';
 import {referenceSampleSpec} from './src/core/sample-library.js';
 import {illustrativeIAPagesModel} from './src/core/sample-ia-document.js';
 import {mixedMathTokens} from './src/math/mixed-math.js';
 import {REPRESENTATION_TOOLS} from './src/diagrams/representation-registry.js';
 const samples=SAMPLE_CHOICES.map(({id})=>{
  const spec=referenceSampleSpec(id),model=illustrativeIAPagesModel(createIllustrativeSample(id));
  const prose=[model.provenance,...model.sections.flatMap(section=>section.rows.map(row=>row.value))];
  return {id,stages:spec.stages.length,sections:model.sections.length,sectionTitles:model.sections.map(section=>section.title),
   maths:prose.reduce((n,text)=>n+mixedMathTokens(text).filter(token=>token.type==='math').length,0),
   figures:spec.figures.map(({id,tool,stage})=>({id,tool,stage})),dataSets:spec.dataSets.length};
 });
 console.log(JSON.stringify({samples,tools:REPRESENTATION_TOOLS}));
"""],text=True))
EXPECTED={sample["id"]:sample for sample in CATALOGUE["samples"]}
IDS=list(EXPECTED)
SELECTED_IDS=[value.strip() for value in os.environ.get("IA_QA_SAMPLES","").split(",") if value.strip()] or IDS
assert len(set(SELECTED_IDS))==len(SELECTED_IDS) and all(value in IDS for value in SELECTED_IDS),"Choose unique registered IA_QA_SAMPLES IDs"
TOOLS={tool["id"]:tool for tool in CATALOGUE["tools"]}
STUDIOS=[tool["studio"] for tool in TOOLS.values()]
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
def check_planning(page,sample,before):
 for node,keys in [("N01",["provisionalTitle","aim"]),("N01V",["beneficiary"]),("N03H",["timelineWeeks"])]:
  page.evaluate("""([key,node])=>{
   const s=JSON.parse(sessionStorage.getItem(key));
   s.preview.route='planning';s.preview.planning.current=node;
   sessionStorage.setItem(key,JSON.stringify(s));
  }""",[PREVIEW,node])
  page.reload(wait_until="networkidle")
  for key in keys:
   field=page.locator('[data-bind="planning.fields.'+key+'"]:visible')
   assert field.input_value()==sample["planning"]["fields"][key]
  if node=="N03H":
   value=sample["planning"]["fields"]["timelineEarly"]
   assert page.locator('[data-choice="planning.fields.timelineEarly"][data-value="'+value+'"]').get_attribute("aria-pressed")=="true"
  assert own(page)==before
def download(page,button,path):
 started=time.monotonic()
 try:
  with page.expect_download(timeout=120000) as pending:button.click()
  pending.value.save_as(str(path))
 except Exception as error:
  raise RuntimeError(path.name+": "+str(error)+"; save status: "+page.locator("#saveStatus").inner_text()+
   "; last notification: "+page.locator("#toast").inner_text()) from error
 assert path.stat().st_size>3000
 print(json.dumps({"download":path.name,"seconds":round(time.monotonic()-started,2),"bytes":path.stat().st_size}),flush=True)
def check_figure_editors(page,kind,before):
 # Exercise each kind of native editor used by this investigation, including a
 # later mathematical stage when that is where the tool first becomes useful.
 visited=set()
 for figure in EXPECTED[kind]["figures"]:
  tool_id=figure["tool"]
  if tool_id in visited:continue
  visited.add(tool_id);tool=TOOLS[tool_id];index=figure["stage"]
  node="C30" if index==0 else "C40" if index==1 else "C50"
  set_node(page,node,index)
  button=page.locator('[data-action="'+tool["action"]+'"]:visible')
  if not button.count():
   picker=page.locator(".show-first-tool-picker")
   if not picker.get_attribute("open"):picker.locator("summary").first.click()
   button=picker.locator('[data-action="'+tool["action"]+'"]:visible')
  button.first.click()
  studio=preview(page)[tool["studio"]]
  assert studio["open"] is True
  assert studio["activeId"]==figure["id"]
  assert page.locator('[data-'+tool["root"]+']').is_visible()
  # A saved figure must be editable, not just a rendered picture. Change its
  # title through the actual editor and save it back to the same owning stage.
  field_prefix={"trace":"trace","probability":"prob"}.get(tool_id,tool_id)
  title=page.locator('[data-'+field_prefix+'-field="title"]')
  edited=title.input_value()+" (preview edit)"
  title.fill(edited);title.blur()
  action(page,tool_id+"-use")
  current=preview(page)
  record=next(item for item in current[tool["studio"]]["figures"] if item["id"]==figure["id"])
  assert record["draft"]["title"]==edited
  assert current["completion"]["current"]==node
  assert current["completion"]["activeEntryIndex"]==index
  assert tool_id+":"+figure["id"] in current["entries"][index]["figureRefs"]
  assert own(page)==before
  page.reload(wait_until="networkidle")
  assert next(item for item in preview(page)[tool["studio"]]["figures"] if item["id"]==figure["id"])["draft"]["title"]==edited
 return sorted(visited)
def check_backup_restore(browser,path,expected):
 # Import in a separate disposable browser profile: the original personal
 # workspace must stay untouched even while a sample backup is tested.
 context=browser.new_context(viewport={"width":1440,"height":960},reduced_motion="reduce")
 page=context.new_page();page.set_default_timeout(15000);errors=[]
 page.on("pageerror",lambda error:errors.append(str(error)))
 page.on("dialog",lambda dialog:dialog.accept())
 page.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(OWN))+');')
 try:
  page.goto(URL,wait_until="networkidle")
  page.locator('[data-action="open-panel"][data-panel="files"]:visible').first.click()
  with page.expect_file_chooser() as chooser:action(page,"import-json")
  chooser.value.set_files(str(path))
  page.wait_for_function("([key,id])=>JSON.parse(localStorage.getItem(key)).demo===id",arg=[KEY,expected["demo"]])
  page.reload(wait_until="networkidle")
  restored=json.loads(own(page))
  for key in ["demo","planning","scratch","entries","dataShelf"]:
   assert restored[key]==expected[key],"Backup restoration changed "+key
  assert restored["completion"]["fields"]==expected["completion"]["fields"]
  assert restored["completion"]["sourceRecords"]==expected["completion"]["sourceRecords"]
  assert restored["completion"]["accuracyDecisions"]==expected["completion"]["accuracyDecisions"]
  for studio in STUDIOS:assert restored[studio]["figures"]==expected[studio]["figures"]
  assert not errors,errors
 finally:context.close()
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
 # The section heading must share its page with following content. The PDF
 # renderer normalizes typographic punctuation for its standard body font.
 def comparable(value):
  return " ".join(value.translate(str.maketrans({"–":"-","—":"-","−":"-","‘":"'","’":"'","“":'"',"”":'"',"…":"..."})).split())
 pages=[comparable(part.extract_text() or "") for part in pdf.pages]
 for title in EXPECTED[kind]["sectionTitles"]:
  needle=comparable(title)
  endings=[part.split(needle,1)[1].strip() for part in pages if needle in part]
  assert len(endings)==1,"missing or repeated PDF heading: "+title
  assert endings[0],"orphan PDF heading: "+title
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
 expected=EXPECTED[kind]
 assert len(sample["entries"])==expected["stages"]
 assert len(sample["dataShelf"])==expected["dataSets"]
 assert all(entry["status"]=="completed" for entry in sample["entries"])
 assert sample["teacher"]["feedbackStatus"]=="not-requested"
 assert sample["completion"]["review"]["records"]["final-D16"]["status"]=="unchecked"
 assert sample["scratch"]["conclusion"]==""
 figure_count=sum(len(sample[studio]["figures"]) for studio in STUDIOS)
 assert figure_count==len(expected["figures"])
 assert own(page)==before
 action(page,"sample-read-ia")
 reader=page.locator(".sample-reader");reader.wait_for()
 assert reader.locator(".sample-reader-section").count()==expected["sections"]
 assert reader.locator("[data-sample-figure]").count()==figure_count
 assert expected["maths"]>0
 assert reader.locator(".math-preview-equation").count()==expected["maths"]
 assert reader.locator(".math-preview-invalid").count()==0
 assert reader.locator(".sample-reader-error").count()==0
 assert reader.locator('[data-action="math-edit-existing"]').count()==0
 assert page.locator(".sample-reader-drawer").evaluate("(e)=>e.scrollWidth<=e.clientWidth+1")
 assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
 page.evaluate("document.fonts.ready")
 page.locator(".sample-reader-drawer").evaluate("e=>e.scrollTo({top:0,behavior:'instant'})")
 page.screenshot(path=str(OUT/(kind+"-reader-"+str(width)+".png")),animations="disabled")
 for figure in reader.locator("[data-sample-figure]").all():
  figure.scroll_into_view_if_needed()
  figure.screenshot(path=str(OUT/(figure.get_attribute("data-sample-figure")+"-"+str(width)+".png")),
   animations="disabled",
   style=".sample-reader-drawer .drawer-header, #toast { visibility: hidden !important; }")
 metrics=check_exports(page,kind,sample,figure_count) if width==1440 else {}
 action(page,"close-drawer")
 check_planning(page,sample,before)
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
 nodes=[("C20",0)]+[("C30" if i==0 else "C40" if i==1 else "C50",i) for i in range(len(sample["entries"]))]
 for node,index in nodes:
  set_node(page,node,index)
  assert page.locator(".sample-preview-banner").is_visible()
  assert page.locator("#main").inner_text().strip()
  assert own(page)==before
 metrics["nativeEditors"]=check_figure_editors(page,kind,before)
 set_node(page,"C80")
 assert page.locator('[data-choice="completion.fields.draftComplete"][data-value="ready"]').get_attribute("aria-pressed")=="true"
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
   backup_path=OUT/("complete-"+kind+"-backup.json")
   backup_path.write_text(json.dumps(saved))
  action(page,"close-drawer")
  check_backup_restore(page.context.browser,backup_path,saved)
  assert own(page)==before
  metrics["backupRestored"]=True
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
 return {"stages":expected["stages"],"figures":figure_count,"maths":expected["maths"],**metrics}
with sync_playwright() as playwright:
 options={"headless":True,"args":["--no-sandbox"]}
 if os.environ.get("IA_QA_CHROMIUM"):options["executable_path"]=os.environ["IA_QA_CHROMIUM"]
 browser=playwright.chromium.launch(**options)
 for width,height in [(1440,960),(390,844)]:
  for kind in SELECTED_IDS:
   # Use the app's reduced-motion mode so native smooth scrolling and drawer
   # transitions cannot move a figure crop or an export button during capture.
   context=browser.new_context(viewport={"width":width,"height":height},accept_downloads=True,reduced_motion="reduce")
   context.route("https://fonts.googleapis.com/**",lambda route:route.abort())
   page=context.new_page();page.set_default_timeout(15000);errors=[];console_errors=[]
   page.on("pageerror",lambda error:errors.append(str(error)))
   page.on("console",lambda message:console_errors.append(message.text) if message.type=="error" else None)
   page.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(OWN))+');')
   try:
    page.goto(URL,wait_until="networkidle")
    metrics=check(page,kind,width)
    assert not errors,errors
    results.append({"scenario":kind,"viewport":width,"status":"passed",**metrics})
   except Exception as error:
    traceback.print_exc()
    results.append({"scenario":kind,"viewport":width,"status":"FAILED","error":str(error),"pageErrors":errors,"consoleErrors":console_errors})
    page.screenshot(path=str(OUT/(kind+"-"+str(width)+"-failure.png")),full_page=True)
   print(json.dumps(results[-1]),flush=True)
   context.close()
 browser.close()
(OUT/"illustrative-samples-results.json").write_text(json.dumps(results,indent=2))
assert all(result["status"]=="passed" for result in results)
