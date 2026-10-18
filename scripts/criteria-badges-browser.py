"""Four contextual criteria badges: focus, content, rubric return and mobile positioning."""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'))
OUT.mkdir(exist_ok=True,parents=True)
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/')
KEY='ia-pathfinder-prototype-v1'
BASE=json.loads(subprocess.check_output(['node','--input-type=module','-e',
 "import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"],text=True))
CASES=[
 ('motivation', 'planning','N01V','C','planning:N01V:benefit'),
 ('mathematics', 'planning','N02M','E','planning:N02M:title'),
 ('interpretation','completing','C34B','D','completing:C34B:title'),
 ('notation','completing','C70N','B','completing:C70N:title')
]
result=[]
def stored(page):
 return page.evaluate('(k)=>localStorage.getItem(k)',KEY)
def state_for(route,node):
 s=copy.deepcopy(BASE);s['route']=route
 s['planning']['fields'].update({'course':'AA SL','kind':'modelling',
  'aim':'How closely does a trial follow a simple mathematical model?',
  'beneficiary':'I want to understand which model is more useful.'})
 if route=='planning':s['planning']['current']=node
 else:
  s['completion']['current']=node
  s['completion']['activeEntryIndex']=0
  s['entries']=[{'id':'first','phase':'first','title':'Observed trend',
    'kind':'model','status':'completed','purpose':'Check a real pattern',
    'technique':'Compare the model with observations',
    'result':'A small genuine difference between model and observations.',
    'localTakeaway':'The model approximates the observed trend.'}]
 return s

with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):
  options['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 def run_case(name,route,node,letter,spot,width,height):
  state=state_for(route,node)
  case=f'{name}-{width}'
  ctx=browser.new_context(viewport={'width':width,'height':height})
  ctx.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  p=ctx.new_page();p.set_default_timeout(11000)
  errors=[];p.on('pageerror',lambda error:errors.append(str(error)))
  p.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(state))+');')
  try:
   p.goto(URL,wait_until='networkidle')
   shell=p.locator('#main .task-shell')
   assert shell.get_attribute('data-source-node')==node
   badge=shell.locator('[data-criterion-badge="'+spot+'"]')
   assert badge.count()==1
   assert shell.locator('[data-criterion-badge]').count()==1
   assert shell.locator('.criteria-panel [data-action="criteria-toggle"]').count()==0
   assert shell.locator('.criteria-panel [data-action="essentials-open"]').count()==0 or (
    shell.locator('.criteria-panel [data-action="essentials-open"]').count()==1)
   assert p.locator('.criteria-panel .support-actions').count()==1
   if node=='N01V':
    assert badge.locator('..').get_attribute('class')=='criterion-marked-field'
    assert shell.locator('[data-bind="planning.fields.beneficiary"]').count()==1
   else:
    assert badge.locator('..').get_attribute('class').startswith('criterion-title-row')
   box=badge.bounding_box()
   assert box and box['x']>=-0.5 and box['x']+box['width']<=width+0.5,box
   before=stored(p)
   badge.focus();p.keyboard.press('Enter')
   dialog=p.locator('#criterionBadgeDialog')
   assert dialog.is_visible()
   assert 'Criterion '+letter+' ·' in dialog.locator('h2').inner_text()
   for title in ['Why this matters here','What a strong response looks like','Avoid this']:
    assert title in dialog.inner_text()
   assert 'not evidence, a score or a predicted mark' in dialog.inner_text()
   assert p.evaluate("document.activeElement.closest('#criterionBadgeDialog')!==null")
   p.keyboard.press('Tab')
   assert p.evaluate("document.activeElement.closest('#criterionBadgeDialog')!==null")
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   p.screenshot(path=str(OUT/(case+'-popin.png')),full_page=False,animations='disabled')
   p.keyboard.press('Escape')
   assert not dialog.is_visible()
   assert p.evaluate('document.activeElement?.dataset?.criterionBadge')==spot
   assert stored(p)==before
   badge.click()
   dialog.locator('[data-criterion-badge-rubric]').click()
   assert not dialog.is_visible()
   full=p.locator('#essentialsDialog')
   assert full.is_visible()
   assert full.locator('[data-rubric-criterion="'+letter+'"]').count()==1
   if letter=='E':
    assert full.locator('#ess-level').input_value()=='SL'
   full.locator('[data-essentials-close]').click()
   assert stored(p)==before
   assert badge.is_visible()
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   assert not errors,errors
   result.append({'case':case,'status':'passed'})
  except Exception as e:
   result.append({'case':case,'status':'FAILED','reason':str(e),'errors':errors})
   traceback.print_exc()
   p.screenshot(path=str(OUT/(case+'-failure.png')),full_page=True)
  ctx.close()
 for size in [(1440,960),(360,740)]:
  for name,route,node,letter,spot in CASES:run_case(name,route,node,letter,spot,*size)
 # A planned result must not be mistaken for an actual reflection.
 planned=state_for('completing','C34B')
 planned['entries'][0]['status']='planned'
 context=browser.new_context(viewport={'width':390,'height':844})
 p=context.new_page()
 p.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(planned))+');')
 try:
  p.goto(URL,wait_until='networkidle')
  before=stored(p)
  p.locator('[data-criterion-badge="completing:C34B:title"]').click()
  text=p.locator('#criterionBadgeDialog').inner_text()
  assert 'a proposed calculation or prediction is not a result' in text.lower()
  assert 'First complete and check a genuine' in text
  assert stored(p)==before
  result.append({'case':'planned-reflection-guard','status':'passed'})
 except Exception as e:
  result.append({'case':'planned-reflection-guard','status':'FAILED','reason':str(e)})
  traceback.print_exc()
 context.close()
 browser.close()
(OUT/'criterion-badges-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
assert all(x['status']=='passed' for x in result)
