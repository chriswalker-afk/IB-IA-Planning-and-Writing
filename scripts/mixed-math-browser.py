"""Real-browser math notation and export acceptance. All data are fictional."""
import json
import subprocess
import threading
import zipfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from pypdf import PdfReader
from playwright.sync_api import sync_playwright

OUT=Path('qa-output/mixed-math')
OUT.mkdir(parents=True,exist_ok=True)
KEY='ia-pathfinder-prototype-v1'
PORT=8768
fixture=json.loads(subprocess.check_output(['node','--input-type=module','-e',r'''
import {createProjectState} from './src/core/project-state.js';
const s=createProjectState();
s.route='planning';s.ui.planningIntroSeen=true;s.ui.planningIntroOpen=false;
s.planning.current='N01';
s.planning.visited=['N00','N01'];
s.planning.fields.ideaStatus='yes';
s.planning.fields.aim='The observed model is  for these fictional cases.';
s.planning.fields.course='AA SL';
s.planning.fields.kind='theoretical';
s.scratch.introduction='This is student-authored explanatory prose.';
console.log(JSON.stringify(s));
'''],text=True))

class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',PORT),
 lambda *args,**kwargs:QuietHandler(*args,directory='dist',**kwargs))
threading.Thread(target=server.serve_forever,daemon=True).start()
results=[]
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  for width in [1440,390]:
   context=browser.new_context(accept_downloads=True,viewport={
    'width':width,'height':900 if width>500 else 840
   })
   # The init script runs again on reload. Seed a fresh test context only once:
   # unconditional setItem would overwrite the saved equation before testing it.
   context.add_init_script(
    'if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+
    json.dumps(KEY)+','+json.dumps(json.dumps(fixture))+');'
   )
   page=context.new_page()
   errors=[]
   page.on('pageerror',lambda err: errors.append(str(err)))
   page.goto('http://127.0.0.1:'+str(PORT)+'/',wait_until='networkidle',timeout=45000)
   target=page.locator('textarea[data-bind="planning.fields.aim"]:visible').first
   if not target.is_visible():
    print("Planning maths editor fixture context:",json.dumps({
     "route":page.locator("body").get_attribute("data-route"),
     "current":json.loads(page.evaluate('localStorage.getItem('+json.dumps(KEY)+')'))["planning"]["current"],
     "page":page.locator("[data-source-node]").first.get_attribute("data-source-node") if page.locator("[data-source-node]").count() else "none",
     "aimFields":page.locator('textarea[data-bind="planning.fields.aim"]').count(),
     "welcome":page.locator('[data-planning-intro="true"]').count(),
     "heading":page.locator("#main").inner_text()[:450]
    }),flush=True)
   assert target.is_visible(), 'The Planning answer field must remain editable.'
   original=target.input_value()
   idx=original.index(' for these')
   target.evaluate('(el,offset)=>{el.focus();el.setSelectionRange(offset,offset)}',idx)
   group=page.locator('[data-math-field="planning.fields.aim"]:visible').first
   group.locator('[data-action="math-open"]').click()
   formula=group.locator('[data-math-expression]')
   formula.fill(r'\frac{x^{2}}{2}')
   assert group.locator('[data-math-formula-preview] svg').count()>0, 'No live SVG typesetting'
   group.locator('[data-action="math-insert"]').click()
   page.wait_for_function("""tex => [...document.querySelectorAll('textarea[data-bind="planning.fields.aim"]')]
    .some(el=>el.offsetWidth>0 && el.value.includes(tex))""",arg=r'\(\frac{x^{2}}{2}\)')
   result=target.input_value()
   assert r'\(\frac{x^{2}}{2}\)' in result,(width,result)
   assert result.startswith('The observed model is ')
   assert result.endswith(' for these fictional cases.')
   assert group.locator('[data-math-preview-content] svg').count()==1
   group.locator('[data-action="math-edit-existing"]').first.click()
   formula=group.locator('[data-math-expression]')
   page.wait_for_function("""tex=>[...document.querySelectorAll('[data-math-field="planning.fields.aim"]')]
    .some(g=>g.offsetWidth>0 && g.querySelector('[data-math-expression]')?.value===tex)""",
    arg=r'\frac{x^{2}}{2}')
   assert formula.input_value()==r'\frac{x^{2}}{2}'
   formula.fill(r'x^{2}+1')
   group.locator('[data-action="math-insert"]').click()
   page.wait_for_function("""tex => [...document.querySelectorAll('textarea[data-bind="planning.fields.aim"]')]
    .some(el=>el.offsetWidth>0 && el.value.includes(tex))""",arg=r'\(x^{2}+1\)')
   assert r'\(x^{2}+1\)' in target.input_value()
   assert r'\frac{' not in target.input_value()
   # Verify persistence independently of the visible textarea, then reload.
   # The expected result must survive in the project state, not only in the DOM.
   saved_before_reload=json.loads(page.evaluate('localStorage.getItem('+json.dumps(KEY)+')'))
   assert saved_before_reload['planning']['fields']['aim']==target.input_value(),(
    'Edited equation was not saved to project storage',width)
   assert r'\(x^{2}+1\)' in saved_before_reload['planning']['fields']['aim']
   page.reload(wait_until='networkidle')
   target=page.locator('textarea[data-bind="planning.fields.aim"]:visible').first
   saved_after_reload=json.loads(page.evaluate('localStorage.getItem('+json.dumps(KEY)+')'))
   assert saved_after_reload['planning']['fields']['aim']==saved_before_reload['planning']['fields']['aim'],(
    'Project storage changed unexpectedly during reload',width)
   assert r'\(x^{2}+1\)' in target.input_value(),'Saved formula was not restored'
   assert page.locator('[data-math-preview-content] svg').first.is_visible()
   before=json.loads(page.evaluate('localStorage.getItem('+json.dumps(KEY)+')'))
   # Export controls live in the Save & export drawer. From Planning,
   # reach it via the Help panel (available on both desktop and phone).
   page.locator('[data-action="open-panel"][data-panel="help"]:visible').first.click()
   page.locator('.drawer [data-action="open-files"]').click()
   assert page.locator('#drawerTitle').inner_text()=='Save & export'
   for format in ('pdf','docx'):
    with page.expect_download(timeout=55000) as download_info:
     page.locator('[data-action="export-plan-'+format+'"]').first.click()
    target_file=OUT/('planning-'+str(width)+'.'+format)
    download_info.value.save_as(str(target_file))
    if format=='pdf':
     reader=PdfReader(str(target_file))
     assert sum(len(p.images) for p in reader.pages)>=1, 'Planning PDF dropped equation rendering'
     text=' '.join(page.extract_text() or '' for page in reader.pages)
     assert 'The observed model is' in text and 'for these fictional cases' in text
    else:
     with zipfile.ZipFile(target_file) as z:
      xml=z.read('word/document.xml').decode()
      assert 'The observed model is' in xml and 'for these fictional cases' in xml
      assert any(name.startswith('word/media/') for name in z.namelist()),'Word equation was not embedded'
    assert json.loads(page.evaluate('localStorage.getItem('+json.dumps(KEY)+')'))['planning']['fields']['aim']==result.replace(r'\frac{x^{2}}{2}',r'x^{2}+1')
   assert not errors,errors
   assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+3'),'Horizontal overflow after insertion'
   page.screenshot(path=str(OUT/('editor-'+str(width)+'.png')))
   results.append({'width':width,'formatting':'inline','formula':target.input_value(),'pdf':True,'word':True,'errors':errors})
   context.close()
  browser.close()
finally:
 server.shutdown()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2),flush=True)
assert len(results)==2
