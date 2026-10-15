"""Regression: SL/HL is relevant only to Criterion E, never to A-D."""
import json, os, subprocess, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/')
KEY='ia-pathfinder-prototype-v1'
BASE=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
results=[]
with sync_playwright() as pw:
 opts={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):opts['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**opts)
 for width,height in [(1440,960),(390,844)]:
  for course in ['', 'AA SL', 'AA HL']:
   state=json.loads(json.dumps(BASE));state['project']['course']=course;state['planning']['fields']['course']=course
   name='criterion-level-'+str(width)+'-'+(course.replace(' ','-') or 'unknown')
   context=browser.new_context(viewport={'width':width,'height':height})
   context.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page=context.new_page();page.set_default_timeout(10000);errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(state))+');')
   try:
    page.goto(URL,wait_until='networkidle')
    before=page.evaluate('(k)=>localStorage.getItem(k)',KEY)
    page.locator('.topbar [data-action="essentials-open"]').click()
    dialog=page.locator('#essentialsDialog')
    assert dialog.locator('#ess-level').count()==0
    dialog.locator('.ess-tabs [data-essentials-tab="rubric"]').click()
    for criterion in ['A','B','C','D']:
     dialog.locator('.ess-criteria-nav [data-essentials-criterion="'+criterion+'"]').click()
     assert dialog.locator('[data-rubric-criterion="'+criterion+'"]').count()==1
     assert dialog.locator('[data-essentials-level]').count()==0
    dialog.locator('.ess-criteria-nav [data-essentials-criterion="A"]').click()
    page.screenshot(path=str(OUT/(name+'-A.png')))
    dialog.locator('.ess-criteria-nav [data-essentials-criterion="E"]').click()
    picker=dialog.locator('[data-rubric-criterion="E"] #ess-level')
    assert picker.count()==1 and picker.is_visible()
    assert picker.input_value()==('HL' if course=='AA HL' else 'SL' if course=='AA SL' else '')
    if not course:assert dialog.locator('.ess-rubric-table').count()==0
    picker.select_option('HL')
    assert 'sophistication and rigour' in dialog.locator('.ess-rubric-table').inner_text()
    for criterion in ['A','B','C','D']:
     dialog.locator('.ess-criteria-nav [data-essentials-criterion="'+criterion+'"]').click()
     assert dialog.locator('[data-essentials-level]').count()==0
    dialog.locator('.ess-criteria-nav [data-essentials-criterion="E"]').click()
    assert picker.input_value()=='HL'
    picker.select_option('SL')
    assert 'Criterion E — SL' in dialog.locator('.ess-rubric-table caption').inner_text()
    page.screenshot(path=str(OUT/(name+'-E.png')))
    dialog.locator('.ess-tabs [data-essentials-tab="format"]').click()
    assert dialog.locator('[data-essentials-level]').count()==0
    dialog.locator('.ess-tabs [data-essentials-tab="rubric"]').click()
    assert dialog.locator('#ess-level').input_value()=='SL'
    dialog.locator('.ess-tabs [data-essentials-tab="submission"]').click()
    for mode in ['draft','final']:
     dialog.locator('.ess-review-modes [data-essentials-mode="'+mode+'"]').click()
     assert dialog.locator('[data-essentials-level]').count()==1
     for criterion in ['A','B','C','D']:
      assert dialog.locator('[data-evidence-criterion="'+criterion+'"] [data-essentials-level]').count()==0
     evidence=dialog.locator('[data-evidence-criterion="E"]')
     assert evidence.locator('#ess-level').count()==1
     evidence.locator('#ess-level').select_option('HL')
     assert evidence.locator('#ess-'+mode+'-E-mark').is_enabled()
     assert page.evaluate('document.activeElement.id')=='ess-level'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
    assert dialog.locator('#ess-body').evaluate('(el)=>el.scrollWidth <= el.clientWidth+1')
    dialog.locator('[data-essentials-close]').click()
    assert page.evaluate('(k)=>localStorage.getItem(k)',KEY)==before
    assert not errors,errors
    results.append({'test':name,'status':'passed'})
   except Exception as err:
    traceback.print_exc();page.screenshot(path=str(OUT/(name+'-failure.png')),full_page=True)
    results.append({'test':name,'status':'FAILED','error':str(err),'page_errors':errors})
   context.close()
 browser.close()
(OUT/'criterion-level-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert all(item['status']=='passed' for item in results)
