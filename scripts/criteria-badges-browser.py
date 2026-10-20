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
  if node in ('C80D','C90F'):
   mode='draft' if node=='C80D' else 'final'
   s['completion']['review']['records'][mode+'-D02']['location']='My '+mode+' introduction'
   s['completion']['review']['records'][mode+'-D06']['location']='My '+mode+' mathematics'
   if node=='C80D':s['completion']['fields']['draftComplete']='not-yet'
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
   assert shell.locator('[data-criterion-badge]').count()==(7 if node in ('C40','C50') else 2 if node in ('C35','C61') else 1)
   assert shell.locator('.criteria-panel [data-action="criteria-toggle"]').count()==0
   assert shell.locator('.criteria-panel [data-action="essentials-open"]').count()==0 or (
    shell.locator('.criteria-panel [data-action="essentials-open"]').count()==1)
   # Older support panels are optional in the unified Writing Journey.
   # If present, they must not duplicate actions.
   assert p.locator('.criteria-panel .support-actions').count()<=1
   if node=='N01V':
    assert badge.locator('..').get_attribute('class')=='criterion-marked-field'
    # The saved-spark editor may mirror the answer elsewhere on the screen.
    # Ensure the marked response itself contains one editable textarea.
    assert badge.locator('..').locator('textarea[data-bind="planning.fields.beneficiary"]').count()==1
   elif spot.endswith(':title'):
    # Some formerly page-level badges now annotate a real writing field.
    parent=badge.locator('..')
    css=parent.get_attribute('class') or ''
    assert css.startswith('criterion-title-row') or css.startswith('criterion-marked-field')
    if css.startswith('criterion-marked-field'):
     assert parent.locator('textarea').count()==1
   else:
    assert badge.locator('..').get_attribute('class')=='criterion-marked-field'
    assert badge.locator('..').locator('textarea').count()==1
   box=badge.bounding_box()
   assert box and box['x']>=-0.5 and box['x']+box['width']<=width+0.5,box
   before=stored(p)
   badge.focus();p.keyboard.press('Enter')
   dialog=p.locator('#criterionBadgeDialog')
   assert dialog.is_visible()
   if letter=='A–E':
    assert 'Criteria A–E ·' in dialog.locator('h2').inner_text()
    assert dialog.locator('.criterion-popin-all-row').count()==5
    assert dialog.locator('[data-criterion-badge-review]').count()==1
    assert dialog.locator('[data-criterion-badge-rubric]').count()==5
    assert 'My '+('draft' if node=='C80D' else 'final')+' introduction' in dialog.inner_text()
   else:assert 'Criterion '+letter+' ·' in dialog.locator('h2').inner_text()
   for title in ['Why this matters here','What a strong response looks like','Avoid this']:
    assert title in dialog.inner_text()
   assert 'not evidence, a score or a predicted mark' in dialog.inner_text()
   if node in ('C34','C35','C35B','C35P','C40','C50','C40T','C40L','C61','C62','C63','C64','C70','C80D','C90F'):
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
   chosen='E' if letter=='A–E' else letter
   dialog.locator('[data-criterion-badge-rubric="'+chosen+'"]').click()
   assert not dialog.is_visible()
   full=p.locator('#essentialsDialog')
   assert full.is_visible()
   assert full.locator('[data-rubric-criterion="'+chosen+'"]').count()==1
   if chosen=='E':
    assert full.locator('#ess-level').input_value()=='SL'
   full.locator('[data-essentials-close]').click()
   if letter=='A–E':
    badge.click()
    dialog.locator('[data-criterion-badge-review]').click()
    assert not dialog.is_visible()
    assert full.is_visible()
    assert full.locator('[data-evidence-criterion]').count()==5
    mode='draft' if node=='C80D' else 'final'
    assert full.locator('.ess-review-modes button[data-essentials-mode="'+mode+'"]').get_attribute('aria-pressed')=='true'
    assert full.locator('[data-evidence-criterion="A"] textarea[data-ess-review="location"]').input_value()=='My '+mode+' introduction'
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

 # Redesigned C20 and C60 screens: exactly one criterion bubble on each focused writing task.
 for width,height in [(1440,960),(360,740)]:
  for node,part,spot,letter in [
   ('C20','[data-first-maths-writing-part="connection"]','completing:C20:firstBridge','A'),
   ('C60','[data-conclusion-part="meaning"]','completing:C60:meaningAndLimits','D')
  ]:
   sample=state_for('completing',node)
   ctx=browser.new_context(viewport={'width':width,'height':height})
   page=ctx.new_page()
   page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
   label='redesigned-'+node+'-'+str(width)
   try:
    page.goto(URL,wait_until='networkidle')
    target=page.locator(part)
    assert target.count()==1,label
    assert target.locator('[data-criterion-badge]').count()==1,label+' has only one bubble on this box'
    marker=target.locator('[data-criterion-badge="'+spot+'"]')
    assert marker.count()==1,label
    if node=='C20':
     assert page.locator('[data-criterion-badge="completing:C20:firstChoice"]').count()==0
    else:
     assert page.locator('[data-criterion-badge="completing:C62:benefit"]').count()==0
     assert page.locator('[data-criterion-badge="completing:C61:uncertainty"]').count()==0
    before=stored(page)
    marker.click()
    dialog=page.locator('#criterionBadgeDialog')
    assert dialog.is_visible()
    assert 'Criterion '+letter in dialog.locator('h2').inner_text()
    if node=='C60':
     assert 'The model approximates the observed trend' in dialog.inner_text()
     assert page.locator('[data-conclusion-part="answer"] [data-criterion-badge="completing:C61:mainConclusion"]').count()==1
     assert page.locator('[data-conclusion-part="next"] [data-criterion-badge="completing:C63:extension"]').count()==1
    page.keyboard.press('Escape')
    assert not dialog.is_visible()
    assert stored(page)==before
    result.append({'case':label,'status':'passed'})
   except Exception as err:
    result.append({'case':label,'status':'FAILED','reason':str(err)})
    traceback.print_exc()
    page.screenshot(path=str(OUT/(label+'-failure.png')),full_page=True)
   ctx.close()

 # C30 is the unified first-mathematics journey. Check every visible criterion
 # opportunity on its actual writing boxes, not obsolete C31/C32 subpages.
 for width,height in [(1440,960),(360,740)]:
  sample=state_for('completing','C30')
  ctx=browser.new_context(viewport={'width':width,'height':height})
  page=ctx.new_page()
  page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
  label='unified-first-maths-'+str(width)
  try:
   page.goto(URL,wait_until='networkidle')
   expected={
    'introduce':['completing:C30:introduceA','completing:C30:introduceB'],
    'reflect':['completing:C30:reflectD','completing:C30:reflectE'],
    'next':['completing:C30:nextC','completing:C30:nextD']
   }
   for part,keys in expected.items():
    box=page.locator('[data-show-first-part="'+part+'"]')
    assert box.count()==1,part
    assert box.locator('[data-criterion-badge]').count()==len(keys),part
    for key in keys:assert box.locator('[data-criterion-badge="'+key+'"]').count()==1,key
   before=stored(page)
   page.locator('[data-criterion-badge="completing:C30:reflectD"]').click()
   dialog=page.locator('#criterionBadgeDialog')
   assert dialog.is_visible()
   assert 'Criterion D' in dialog.locator('h2').inner_text()
   page.keyboard.press('Escape')
   assert stored(page)==before
   result.append({'case':label,'status':'passed'})
  except Exception as err:
   result.append({'case':label,'status':'FAILED','reason':str(err)})
   traceback.print_exc()
  ctx.close()
 # Later-stage E guidance belongs beside method suitability rather than the linking sentence.
 for node in ['C40','C50']:
  sample=state_for('completing',node)
  ctx=browser.new_context(viewport={'width':390,'height':844})
  page=ctx.new_page()
  page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
  try:
   page.goto(URL,wait_until='networkidle')
   badge=page.locator('[data-criterion-badge="completing:'+node+':title"]')
   assert badge.count()==1
   assert 'Why is the chosen approach appropriate here?' in badge.locator('..').inner_text()
   result.append({'case':'method-suitability-'+node,'status':'passed'})
  except Exception as err:
   result.append({'case':'method-suitability-'+node,'status':'FAILED','reason':str(err)})
   traceback.print_exc()
  ctx.close()

 # Repeatable mathematical stages use the same four-part assessment map.
 # Check both routes and phone layouts without requiring an extra stage.
 for node in ['C40','C50']:
  for width,height in [(1440,960),(360,740)]:
   sample=state_for('completing',node)
   ctx=browser.new_context(viewport={'width':width,'height':height})
   page=ctx.new_page()
   page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
   label='later-stage-criteria-'+node+'-'+str(width)
   try:
    page.goto(URL,wait_until='networkidle')
    stage=page.locator('[data-math-stage-page]')
    assert stage.count()==1
    expected={
     'introduce':['bridgeA','title'],
     'show':['resultB','resultE'],
     'reflect':['interpretD'],
     'next':['nextC','nextD']
    }
    for part,fields in expected.items():
     box=stage.locator('[data-show-first-part="'+part+'"]')
     assert box.count()==1,part
     assert box.locator('[data-criterion-badge]').count()==len(fields),part
     for field in fields:
      marker='completing:'+node+':'+field
      assert box.locator('[data-criterion-badge="'+marker+'"]').count()==1,marker
    before=stored(page)
    stage.locator('[data-criterion-badge="completing:'+node+':resultE"]').click()
    modal=page.locator('#criterionBadgeDialog')
    assert modal.is_visible()
    assert 'Criterion E' in modal.locator('h2').inner_text()
    assert 'Quadratic regression' in modal.inner_text()
    assert 'A fitted quadratic expression' in modal.inner_text()
    page.keyboard.press('Escape')
    assert not modal.is_visible()
    assert stored(page)==before
    result.append({'case':label,'status':'passed'})
   except Exception as err:
    result.append({'case':label,'status':'FAILED','reason':str(err)})
    traceback.print_exc()
    page.screenshot(path=str(OUT/(label+'-failure.png')),full_page=True)
   ctx.close()
 # Planned work must not gain a completed result by opening a marker.
 sample=state_for('completing','C40')
 sample['entries'][-1]['status']='planned'
 sample['entries'][-1]['result']=''
 ctx=browser.new_context(viewport={'width':390,'height':844})
 page=ctx.new_page()
 page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
 try:
  page.goto(URL,wait_until='networkidle')
  before=stored(page)
  page.locator('[data-criterion-badge="completing:C40:interpretD"]').click()
  guidance=page.locator('#criterionBadgeDialog').inner_text()
  assert 'Only reflect on mathematics that has actually been carried out and checked' in guidance
  assert 'A fitted quadratic expression' not in guidance
  page.keyboard.press('Escape')
  assert stored(page)==before
  result.append({'case':'later-stage-planned-honesty','status':'passed'})
 except Exception as err:
  result.append({'case':'later-stage-planned-honesty','status':'FAILED','reason':str(err)})
  traceback.print_exc()
 ctx.close()

 # An earlier unverified value may be displayed as a labelled note, but
 # must not become a confirmed predecessor in either the page or A pop-in.
 sample=state_for('completing','C40')
 sample['entries'][0]['status']='planned'
 sample['entries'][0]['result']='A merely suggested scatter shape'
 sample['entries'][0]['localTakeaway']='Unverified earlier observation'
 sample['entries'][1]['fromEntryId']='first'
 ctx=browser.new_context(viewport={'width':390,'height':844})
 page=ctx.new_page()
 page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
 try:
  page.goto(URL,wait_until='networkidle')
  assert 'Earlier mathematical context to verify' in page.locator('[data-show-first-part="introduce"]').inner_text()
  assert 'This is a note, not a currently confirmed result' in page.locator('[data-show-first-part="introduce"]').inner_text()
  before=stored(page)
  page.locator('[data-criterion-badge="completing:C40:bridgeA"]').click()
  text=page.locator('#criterionBadgeDialog').inner_text()
  assert 'earlier result is not currently confirmed' in text
  assert 'Unverified earlier observation' not in text
  page.keyboard.press('Escape')
  assert stored(page)==before
  result.append({'case':'later-stage-unverified-predecessor','status':'passed'})
 except Exception as err:
  result.append({'case':'later-stage-unverified-predecessor','status':'FAILED','reason':str(err)})
  traceback.print_exc()
 ctx.close()
 # Checking process requirements must not masquerade as scored criteria.
 for mode,ids in [('draft',['D09','D10','D12']),('final',['D15','D18'])]:
  sample=state_for('completing','C70')
  sample['route']='checking'
  sample['ui']['checkingMode']=mode
  ctx=browser.new_context(viewport={'width':390,'height':844})
  page=ctx.new_page()
  page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
  try:
   page.goto(URL,wait_until='networkidle')
   for check_id in ids:
    card=page.locator('[data-checking-item="'+check_id+'"]')
    assert card.count()==1,check_id
    assert card.locator('.checking-process-tag').count()==1,check_id
    assert card.locator('[data-action="checking-rubric"]').count()==0,check_id
   result.append({'case':'checking-process-'+mode,'status':'passed'})
  except Exception as err:
   result.append({'case':'checking-process-'+mode,'status':'FAILED','reason':str(err)})
   traceback.print_exc()
  ctx.close()
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
 # A planned conclusion cannot borrow an unperformed result from this project.
 for node,key in [('C61','completing:C61:mainConclusion'),('C60','completing:C60:meaningAndLimits')]:
  sample=state_for('completing',node)
  sample['entries'][0]['status']='planned'
  sample['entries'][0]['result']='Never performed result'
  ctx=browser.new_context(viewport={'width':360,'height':740})
  page=ctx.new_page()
  page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
  try:
   page.goto(URL,wait_until='networkidle')
   before=stored(page)
   page.locator('[data-criterion-badge="'+key+'"]').click()
   guidance=page.locator('#criterionBadgeDialog').inner_text()
   assert 'no mathematical results marked completed' in guidance
   assert 'Never performed result' not in guidance
   assert stored(page)==before
   result.append({'case':'planned-conclusion-'+node,'status':'passed'})
  except Exception as err:
   result.append({'case':'planned-conclusion-'+node,'status':'FAILED','reason':str(err)})
   traceback.print_exc()
  ctx.close()
 # A–E evidence belongs in the existing self-review, not a second textbox.
 for node,fieldname in [('C80D','draftCriteria'),('C90F','finalCriteria')]:
  sample=state_for('completing',node)
  ctx=browser.new_context(viewport={'width':390,'height':844})
  page=ctx.new_page()
  page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
  try:
   page.goto(URL,wait_until='networkidle')
   assert page.locator('[data-bind="completion.fields.'+fieldname+'"]').count()==0
   assert page.locator('.criterion-badge-multi').count()==1
   result.append({'case':'review-without-duplicate-'+node,'status':'passed'})
  except Exception as err:
   result.append({'case':'review-without-duplicate-'+node,'status':'FAILED','reason':str(err)})
   traceback.print_exc()
  ctx.close()
  sample['completion']['fields'][fieldname]='Previously saved student note'
  ctx=browser.new_context(viewport={'width':390,'height':844})
  page=ctx.new_page()
  page.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(sample))+');')
  try:
   page.goto(URL,wait_until='networkidle')
   previous=page.locator('[data-bind="completion.fields.'+fieldname+'"]')
   assert previous.count()==1
   assert previous.input_value()=='Previously saved student note'
   assert previous.locator('xpath=ancestor::details').count()==1
   result.append({'case':'legacy-review-notes-'+node,'status':'passed'})
  except Exception as err:
   result.append({'case':'legacy-review-notes-'+node,'status':'FAILED','reason':str(err)})
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
  # Quiet mode suppresses optional coaching, not the read-only criterion
  # markers attached to the actual next-question writing fields.
  assert page.locator('[data-criterion-badge="completing:C35:nextQuestion"]').count()==1
  assert page.locator('[data-criterion-badge="completing:C35:nextReason"]').count()==1
  assert page.locator('[data-bind="completion.fields.nextQuestion"]').count()==1
  result.append({'case':'reduced-advice-retains-contextual-criteria','status':'passed'})
 except Exception as e:
  result.append({'case':'reduced-advice-retains-contextual-criteria','status':'FAILED','reason':str(e)})
  traceback.print_exc()
 ctx.close()
 browser.close()
(OUT/'criterion-badges-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
assert all(x['status']=='passed' for x in result)
