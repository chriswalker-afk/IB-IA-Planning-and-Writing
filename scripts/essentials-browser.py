"""Synthetic browser acceptance for source-based essentials and criterion guidance."""
import copy,json,os,traceback,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True,parents=True)
normalize_js="import {normalizeProjectState} from './src/core/project-state.js';import fs from 'node:fs';console.log(JSON.stringify(normalizeProjectState(JSON.parse(fs.readFileSync(process.argv[1],'utf8')))));"
BASE=json.loads(subprocess.check_output(['node','--input-type=module','-e',normalize_js,str(OUT/'examples-fixture.json')],text=True));KEY='ia-pathfinder-prototype-v1' 
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/');results=[]
def fixture(node='C10',course='AA SL',kind='modelling'):
 s=copy.deepcopy(BASE);s['completion']['current']=node;s['planning']['fields']['course']=s['project']['course']=course;s['planning']['fields']['kind']=s['project']['kind']=kind
 return s
def stored(p):return p.evaluate('(k)=>localStorage.getItem(k)',KEY)
def saved(p):return json.loads(stored(p))
def open_ess(p):p.locator('.topbar [data-action="essentials-open"]').click();assert p.locator('#essentialsDialog').is_visible()
def close_ess(p):p.locator('#essentialsDialog [data-essentials-close]').click();assert not p.locator('#essentialsDialog').is_visible()
def tab(p,name):p.locator('#essentialsDialog .ess-tabs [data-essentials-tab="'+name+'"]').click()
def open_examples(p):
 examples=p.locator('[data-writing-examples]');assert examples.count()==1
 if examples.get_attribute('open') is None:examples.locator(':scope > summary').click()
 trigger=examples.locator('[data-action="example-open"]').first;assert trigger.is_visible();trigger.click()
 assert p.locator('#exampleDialog').is_visible()
 return trigger
def open_badge(p,spot):
 badge=p.locator('[data-criterion-badge="'+spot+'"]');assert badge.count()==1
 badge.focus();p.keyboard.press('Enter');assert p.locator('#criterionBadgeDialog').is_visible()
 return badge
def overflow(p):
 assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
 for id in ['ess-body','ex-body']:
  el=p.locator('#'+id)
  if el.count() and el.is_visible():assert el.evaluate('(n)=>n.scrollWidth<=n.clientWidth+1'),id
with sync_playwright() as pw:
 opts={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):opts['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**opts)
 def run(name,s,fn,width=1440,height=1000):
  c=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);c.route('https://fonts.googleapis.com/**',lambda r:r.abort());p=c.new_page();p.set_default_timeout(8000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle');fn(p);overflow(p);assert not errors,errors;results.append({'test':name,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as e:
   results.append({'test':name,'status':'FAILED','error':str(e),'page_errors':errors});traceback.print_exc();p.screenshot(path=str(OUT/(name+'-failure.png')),full_page=True)
  c.close()
 def readonly(p):
  before=stored(p);open_ess(p);assert '12–20' in p.locator('#ess-body').inner_text();tab(p,'rubric');p.locator('[data-essentials-criterion="E"]').click();assert p.locator('.ess-rubric-table tbody tr').count()==7
  p.locator('#ess-level').select_option('HL');assert 'sophistication and rigour' in p.locator('.ess-rubric-table').inner_text();tab(p,'submission');p.locator('[data-essentials-mode="final"]').click();close_ess(p);assert stored(p)==before
  assert p.evaluate('document.activeElement.dataset.action')=='essentials-open'
 run('essentials-reference-is-readonly',fixture(),readonly)
 def placement(p):
  task=p.locator('.intro-writing-task');assert task.locator('[data-criterion-badge]').count()==2
  assert p.locator('#main .criteria-panel').count()==0
  rail=task.locator('.criterion-field-help-rail');assert rail.count()==1
  assert rail.locator('[data-criterion-badge]').count()==2
  notes=task.locator('[data-bind="scratch.introduction"]');assert notes.is_visible()
  assert rail.bounding_box()['y']+rail.bounding_box()['height']<=notes.bounding_box()['y']
  before=stored(p)
  for spot,letter,name in [('completing:C10:aim','A','Presentation'),('completing:C10:motivation','C','Personal engagement')]:
   badge=open_badge(p,spot);dialog=p.locator('#criterionBadgeDialog')
   assert 'Criterion '+letter+' · '+name in dialog.locator('h2').inner_text()
   assert 'What a strong response looks like' in dialog.inner_text()
   assert 'not evidence, a score or a predicted mark' in dialog.inner_text()
   p.keyboard.press('Tab');assert dialog.evaluate('(el)=>el.contains(document.activeElement)')
   p.keyboard.press('Escape');assert not dialog.is_visible();assert badge.evaluate('(el)=>el===document.activeElement');assert stored(p)==before
  p.screenshot(path=str(OUT/'essentials-introduction-desktop.png'),full_page=True)
  badge=open_badge(p,'completing:C10:aim');p.locator('[data-criterion-badge-rubric="A"]').click()
  assert p.locator('#essentialsDialog [data-rubric-criterion="A"]').count()==1;close_ess(p);assert stored(p)==before
  guide=p.locator('.intro-writing-guide .writer-guide-inline-more');guide.click()
  popin=p.locator('.writer-guide-popin');assert popin.is_visible();assert popin.locator('[data-stage-tip-id]').count()==6
  p.keyboard.press('Escape');assert guide.evaluate('(el)=>el===document.activeElement');assert stored(p)==before
 run('criteria-visible-and-optional',fixture(),placement)
 def unknown(p):
  open_ess(p);tab(p,'rubric');p.locator('[data-essentials-criterion="E"]').click();assert 'Choose SL or HL' in p.locator('#ess-body').inner_text();assert p.locator('.ess-rubric-table').count()==0
  tab(p,'submission');assert p.locator('#ess-draft-E-mark').is_disabled();p.locator('#ess-level').select_option('SL');assert p.locator('#ess-draft-E-mark').is_enabled();close_ess(p)
 run('essentials-unknown-course-no-assumption',fixture(course='Other'),unknown,390,844)
 def hl(p):
  open_ess(p);tab(p,'rubric');p.locator('[data-essentials-criterion="E"]').click();assert p.locator('#ess-level').input_value()=='HL';assert 'sophistication and rigour' in p.locator('.ess-rubric-table').inner_text();overflow(p);p.screenshot(path=str(OUT/'essentials-hl-rubric-phone.png'),full_page=True);close_ess(p)
 run('essentials-hl-rubric-phone',fixture(course='AA HL'),hl,360,740)
 def nested(p):
  before=stored(p);open_ess(p);tab(p,'rubric');p.locator('.ess-example-links [data-action="example-open"]').first.click();assert p.locator('#exampleDialog').is_visible();p.keyboard.press('Shift+Tab');assert p.locator('#exampleDialog').evaluate('(n)=>n.contains(document.activeElement)');p.keyboard.press('Escape');assert not p.locator('#exampleDialog').is_visible();assert p.locator('#essentialsDialog').is_visible();p.keyboard.press('Escape');assert not p.locator('#essentialsDialog').is_visible();assert stored(p)==before
 run('essentials-to-examples-nested-return',fixture(),nested,390,844)
 def reverse(p):
  before=stored(p);trigger=open_examples(p);p.locator('#exampleDialog .ex-criteria [data-action="essentials-open"]').first.click();assert p.locator('#essentialsDialog').is_visible();p.keyboard.press('Shift+Tab');assert p.locator('#essentialsDialog').evaluate('(n)=>n.contains(document.activeElement)');p.keyboard.press('Escape');assert not p.locator('#essentialsDialog').is_visible();assert p.locator('#exampleDialog').is_visible();p.keyboard.press('Escape');assert not p.locator('#exampleDialog').is_visible();assert trigger.evaluate('(el)=>el===document.activeElement');assert stored(p)==before
 run('examples-to-rubric-nested-return',fixture(),reverse)
 def review(p):
  before=saved(p);p.locator('.ess-review-access [data-essentials-mode="draft"]').click()
  p.locator('#ess-draft-A-location').fill('Pages 2 and 4');p.locator('#ess-draft-A-note').fill('My aim connects to the conclusion');p.locator('#ess-draft-A-action').fill('Remove repeated working');p.locator('#ess-draft-A-mark').select_option('0');p.locator('#ess-draft-E-mark').select_option('5')
  assert saved(p)['completion']['review']['records']['draft-D02']['location']=='Pages 2 and 4';assert saved(p)['completion']['review']['records']['draft-D06']['markLevel']=='SL';p.screenshot(path=str(OUT/'essentials-self-review-desktop.png'),full_page=True)
  p.locator('[data-essentials-mode="final"]').click();assert p.locator('#ess-final-A-location').input_value()=='';p.locator('#ess-final-A-location').fill('Page 5 revised');close_ess(p)
  after=saved(p);assert after['entries']==before['entries'];assert after['scratch']==before['scratch'];assert after['completion']['stages']==before['completion']['stages']
  p.reload(wait_until='networkidle');p.locator('.ess-review-access [data-essentials-mode="draft"]').click();assert p.locator('#ess-draft-A-location').input_value()=='Pages 2 and 4';assert p.locator('#ess-draft-A-mark').input_value()=='0';close_ess(p)
  p.locator('[data-action="open-panel"][data-panel="files"]').first.click()
  backup_button=p.locator('.drawer [data-action="export-json"][data-backup-primary="true"]:visible')
   assert backup_button.count()==1 and backup_button.is_visible(), "Expected a single visible full-project backup action"
   with p.expect_download() as dl:backup_button.click()
  path=OUT/'essentials-full-backup.json';dl.value.save_as(str(path));backup=json.loads(path.read_text());assert backup['completion']['review']['records']['draft-D02']['selfMark']=='0';assert backup['completion']['review']['records']['final-D02']['location']=='Page 5 revised'
 run('essentials-shared-review-save-reload-backup',fixture('C80D'),review)
 def phones(p):
  open_ess(p);overflow(p);p.screenshot(path=str(OUT/'essentials-format-phone.png'),full_page=True);tab(p,'submission');overflow(p);assert p.locator('[data-evidence-criterion]').count()==5;close_ess(p)
 run('essentials-format-and-review-small-phone',fixture(),phones,360,740)
 def theory(p):
  before=stored(p);badge=open_badge(p,'completing:C20:methodSuitability')
  text=p.locator('#criterionBadgeDialog').inner_text().lower();assert 'domain' in text;assert 'sampling' not in text;assert 'human error' not in text
  p.keyboard.press('Escape');assert badge.evaluate('(el)=>el===document.activeElement');assert stored(p)==before
  # Unlike the general suitability badge, this source strip and its routes
  # are selected from the actual investigation kind.
  starting=p.locator('[data-first-maths-source="theoretical"]');assert starting.is_visible()
  assert 'Mathematical objects / theoretical cases' in starting.inner_text()
  assert 'without a dataset' in starting.inner_text()
  details=p.locator('[data-first-maths-source-details]');details.locator(':scope > summary').click()
  targeted=details.locator('.first-maths-route-help')
  definition=targeted.locator('[data-condition="Theoretical or no-data exploration"]')
  assert definition.is_visible();assert targeted.locator('[data-action="completion-route"]').count()==1
  assert targeted.locator('[data-condition="Statistics with sampled or secondary data"]').count()==0
  definition.focus();p.keyboard.press('Enter')
  assert p.locator('[data-source-node="C21T"]').count()==1
  assert 'does not need a pretend dataset or sampling discussion' in p.locator('#main').inner_text()
  original=json.loads(before)
  for key in ['theoreticalObject','theoreticalCase','theoreticalAssumptions']:
   field=p.locator('[data-bind="completion.fields.'+key+'"]');assert field.is_visible()
   assert field.input_value()==original['completion']['fields'][key]
  for key in ['statisticalPopulation','samplingMethod','sampleSize','responseBias']:
   assert p.locator('[data-bind="completion.fields.'+key+'"]').count()==0
  assert saved(p)['entries']==original['entries'];assert saved(p)['scratch']==original['scratch']
 run('criteria-theoretical-context',fixture('C20',kind='theoretical'),theory,390,844)
 def pending(p):
  before=stored(p);open_badge(p,'completing:C34B:title')
  text=p.locator('#criterionBadgeDialog').inner_text();assert 'A proposed calculation or prediction is not a result' in text;assert 'do not invent findings' in text
  p.keyboard.press('Escape');assert stored(p)==before;assert saved(p)['entries'][0]['status']=='planned'
 # An unperformed step has no result or interpretation to reuse from C30.
 # The current screen puts its criterion badge beside the actual response field.
 s=fixture('C34B');s['entries'][0].update(status='planned',result='',interpretation='',localTakeaway='')
 run('criteria-never-invents-results',s,pending)
 def writing(p):
  before=saved(p)
  p.locator('[data-action="open-panel"][data-panel="help"]:visible').first.click()
  p.locator('.drawer [data-action="open-stuck"]').click()
  topic=p.locator('.drawer [data-action="stuck-topic"][data-topic="writing"]')
  if not topic.is_visible():p.locator('.drawer .stuck-legacy-browse > summary').click()
  topic.click();p.locator('.drawer [data-action="stuck-work"]').click()
  assert p.locator('[data-source-node="C96"]').count()==1
  p.locator('[data-guidance-event="write-now"]').first.click();field=p.locator('[data-bind="completion.guidanceUi.noteDraft"]');assert field.is_visible()
  field.fill('My own meaningful thought');p.locator('[data-guidance-event="save-note"]').click()
  after=saved(p);notes=[x for x in after['writingLedger'].values() if x['note']=='My own meaningful thought']
  assert len(notes)==1;assert notes[0]['status']=='noted';assert notes[0]['claimedInIA'] is False
  assert after['scratch']==before['scratch'];assert after['entries']==before['entries']
  p.reload(wait_until='networkidle');assert any(x['note']=='My own meaningful thought' and x['claimedInIA'] is False for x in saved(p)['writingLedger'].values())
 # Writing help follows the selected mathematical result; introduction help
 # correctly returns to C10 instead of pretending a result is relevant there.
 run('criteria-retains-private-writing-tools',fixture('C34B'),writing)
 def planning(p):
  assert p.locator('#main .criteria-panel').count()==0
  assert p.locator('#main .ess-at-glance').count()==0
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="yes"]').click()
  p.locator('[data-action="plan-advance"]').click()
  assert p.locator('[data-source-node="N01"]').count()==1
  assert p.locator('#main .criteria-panel').count()==1
  assert p.locator('#main .planning-trail-support .criteria-panel').count()==1
  assert p.locator('.ess-at-glance').count()==0
  panel=p.locator('.planning-trail-support')
  assert panel.locator('[data-example-id="EX30"]').count()==1
  panel.locator('.planning-trail-help-toggle').click()
  assert panel.locator('.planning-trail-help-toggle').get_attribute('aria-expanded')=='true'
  panel.locator('[data-action="criteria-toggle"]').click()
  assert 'Planning guidance' in panel.inner_text()
  before=stored(p);open_ess(p);close_ess(p);assert stored(p)==before
 s=fixture();s['route']='planning';s['planning']['current']='N00'
 run('essentials-planning-after-kickoff',s,planning,390,844)
 def repeated_reference(p):
  before=stored(p);open_ess(p);tab(p,'rubric');p.locator('.ess-example-links [data-action="example-open"]').first.click()
  p.locator('#exampleDialog .ex-criteria [data-action="essentials-open"]').first.click()
  assert not p.locator('#exampleDialog').is_visible();assert p.locator('#essentialsDialog').evaluate('(n)=>n.contains(document.activeElement)')
  p.keyboard.press('Escape');assert not p.locator('#essentialsDialog').is_visible();assert stored(p)==before
 run('essentials-repeat-reference-without-hidden-dialog',fixture(),repeated_reference,390,844)
 def repeated_example(p):
  before=stored(p);trigger=open_examples(p);p.locator('#exampleDialog .ex-criteria [data-action="essentials-open"]').first.click()
  p.locator('.ess-example-links [data-action="example-open"]').first.click();assert not p.locator('#essentialsDialog').is_visible();assert p.locator('#exampleDialog').evaluate('(n)=>n.contains(document.activeElement)')
  p.keyboard.press('Escape');assert not p.locator('#exampleDialog').is_visible();assert stored(p)==before
 run('examples-repeat-reference-without-hidden-dialog',fixture(),repeated_example)
 browser.close()
(OUT/'essentials-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));assert all(r['status']=='passed' for r in results)
