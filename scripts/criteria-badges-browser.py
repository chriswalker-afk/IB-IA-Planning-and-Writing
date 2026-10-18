"""Read-only criteria badges across Planning and a genuine mathematical journey."""
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
 ('motivation','planning','N01V','C','planning:N01V:benefit'),
 ('mathematics','planning','N02M','E','planning:N02M:title'),
 ('interpretation','completing','C34B','D','completing:C34B:title'),
 ('notation','completing','C70N','B','completing:C70N:title'),
 ('first-purpose','completing','C31','E','completing:C31:firstPurpose'),
 ('intro-purpose','completing','C32','A','completing:C32:purpose'),
 ('first-presentation','completing','C33','B','completing:C33:title'),
 ('real-observation','completing','C34','E','completing:C34:observation'),
 ('next-question','completing','C35','C','completing:C35:nextQuestion'),
 ('next-reason','completing','C35','D','completing:C35:nextReason'),
 ('scatter-pattern','completing','C35B','E','completing:C35B:title'),
 ('pmcc-followup','completing','C35P','E','completing:C35P:title'),
 ('substantial-first','completing','C40','E','completing:C40:title'),
 ('substantial-later','completing','C50','E','completing:C50:title'),
 ('technology','completing','C40T','E','completing:C40T:title'),
 ('unfamiliar-maths','completing','C40L','E','completing:C40L:title'),
 ('conclusion-answer','completing','C61','A','completing:C61:mainConclusion'),
 ('conclusion-limit','completing','C61','D','completing:C61:uncertainty'),
 ('meaning-for-purpose','completing','C62','D','completing:C62:benefit'),
 ('optional-extension','completing','C63','D','completing:C63:extension'),
 ('concise-ending','completing','C64','A','completing:C64:title'),
 ('presentation-coherence','completing','C70','A','completing:C70:title'),
 ('draft-evidence','completing','C80D','A–E','completing:C80D:title'),
 ('final-evidence','completing','C90F','A–E','completing:C90F:title')
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
  s['completion']['nextFromEntryId']='first'
  s['completion']['fields']['firstType']='calculation'
  s['entries']=[{'id':'first','phase':'first','title':'Observed trend',
    'kind':'model','status':'completed','purpose':'Check a real pattern',
    'technique':'Compare the model with observations',
    'result':'A small genuine difference between model and observations.',
    'localTakeaway':'The model approximates the observed trend.'}]
  if node=='C35B':
   s['entries'][0]['kind']='scatter'
   s['completion']['scatterPatternForEntryId']='first'
   s['completion']['fields']['scatterPattern']='curved'
  if node=='C35P':
   s['entries'][0]['methodId']='pmcc'
   s['entries'][0]['technique']='Pearson correlation'
   s['entries'][0]['result']='r = 0.42'
  if node in ('C40','C50','C40T','C40L'):
   s['entries'].append({'id':'later','phase':'substantial','title':'A later mathematical question',
    'kind':'model','status':'completed','knowledge':'syllabus',
    'technique':'Quadratic regression','methodId':'quadratic-fit',
    'purpose':'Check a model after the earlier actual result',
    'result':'A fitted quadratic expression for the recorded data.'})
   s['completion']['activeEntryIndex']=1
   if node=='C40L':
    s['entries'][1]['knowledge']='outside'
    s['entries'][1]['unfamiliarComponent']='Least squares'
    s['entries'][1]['researchSource']='Actual textbook chapter'
   if node=='C40T':
    s['completion']['fields']['technologyTool']='A spreadsheet'
    s['completion']['fields']['technologyForEntryId']='later'
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
   assert shell.locator('[data-criterion-badge]').count()==(2 if node=='C35' else 1)
   assert shell.locator('.criteria-panel [data-action="criteria-toggle"]').count()==0
   assert shell.locator('.criteria-panel [data-action="essentials-open"]').count()==0 or (
    shell.locator('.criteria-panel [data-action="essentials-open"]').count()==1)
   assert p.locator('.criteria-panel .support-actions').count()==1
   if node=='N01V':
    assert badge.locator('..').get_attribute('class')=='criterion-marked-field'
    # The saved-spark editor may mirror the answer elsewhere on the screen.
    # Ensure the marked response itself contains one editable textarea.
    assert badge.locator('..').locator('textarea[data-bind="planning.fields.beneficiary"]').count()==1
   elif spot.endswith(':title'):
    assert badge.locator('..').get_attribute('class').startswith('criterion-title-row')
   else:
    assert badge.locator('..').get_attribute('class')=='criterion-marked-field'
    assert badge.locator('..').locator('textarea').count()==1
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
   if node in ('C34','C35','C35B','C35P','C40','C50','C40T','C40L'):
    assert 'Using your work' in dialog.inner_text()
   if node=='C35B':
    assert 'nonlinear' in dialog.inner_text()
   if node=='C35P':
    assert 'r = 0.42' in dialog.inner_text()
   if node=='C40T':
    assert 'A spreadsheet' in dialog.inner_text()
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
 # Regression: an uncompleted mathematical record must never generate a supposed result.
 for node,key in [('C34','completing:C34:observation'),('C35','completing:C35:nextReason'),
                  ('C40','completing:C40:title')]:
  draft=state_for('completing',node)
  if node=='C40':
   draft['entries'][1]['status']='planned'
   draft['entries'][1]['result']=''
   draft['entries'][1]['technique']='Differentiation'
   draft['completion']['activeEntryIndex']=1
  else:draft['entries'][0]['status']='planned'
  ctx=browser.new_context(viewport={'width':360,'height':740})
  page=ctx.new_page()
  page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(draft))+');')
  try:
   page.goto(URL,wait_until='networkidle')
   before=stored(page)
   page.locator('[data-criterion-badge="'+key+'"]').click()
   guidance=page.locator('#criterionBadgeDialog').inner_text()
   if node=='C35':assert 'real mathematical observation' in guidance
   else:assert 'not an actual finding' in guidance or 'not a result' in guidance
   assert 'A small genuine difference between model' not in guidance
   assert stored(page)==before
   result.append({'case':'planned-guard-'+node,'status':'passed'})
  except Exception as e:
   result.append({'case':'planned-guard-'+node,'status':'FAILED','reason':str(e)})
   traceback.print_exc()
  ctx.close()
 # Reduced advice should suppress the new icons without changing the mathematical form.
 reduced=state_for('completing','C35')
 reduced['completion']['guidanceUi']['quietNode']='C35'
 reduced['completion']['guidanceUi']['quietId']=''
 ctx=browser.new_context(viewport={'width':390,'height':844})
 page=ctx.new_page()
 page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(reduced))+');')
 try:
  page.goto(URL,wait_until='networkidle')
  button=page.locator('[data-action="toggle-advice-mode"]')
  if button.get_attribute('aria-pressed')!='true':button.click()
  assert page.locator('[data-criterion-badge]').count()==0
  assert page.locator('[data-bind="completion.fields.nextQuestion"]').count()==1
  result.append({'case':'reduced-advice-no-extra-badges','status':'passed'})
 except Exception as e:
  result.append({'case':'reduced-advice-no-extra-badges','status':'FAILED','reason':str(e)})
  traceback.print_exc()
 ctx.close()
 browser.close()
(OUT/'criterion-badges-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
assert all(x['status']=='passed' for x in result)
