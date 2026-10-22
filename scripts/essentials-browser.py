"""Synthetic browser acceptance for source-based essentials and criterion guidance."""
import copy,json,os,traceback,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True,parents=True)
normalize_js="import {normalizeProjectState} from './src/core/project-state.js';import fs from 'node:fs';console.log(JSON.stringify(normalizeProjectState(JSON.parse(fs.readFileSync(process.argv[1],'utf8')))));"
BASE=json.loads(subprocess.check_output(['node','--input-type=module','-e',normalize_js,str(OUT/'examples-fixture.json')],text=True));KEY='ia-pathfinder-prototype-v1' 
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/');results=[]
def fixture(node='C10',course='AA SL',kind='modelling'):
 s=copy.deepcopy(BASE);s['ui']['writingIntroSeen']=True;s['ui']['writerGuideIntroSeen']=True;s['ui']['planningIntroSeen']=True;s['completion']['current']=node;s['planning']['fields']['course']=s['project']['course']=course;s['planning']['fields']['kind']=s['project']['kind']=kind
 return s
def stored(p):return p.evaluate('(k)=>localStorage.getItem(k)',KEY)
def saved(p):return json.loads(stored(p))
def open_ess(p):p.locator('.topbar [data-action="essentials-open"]').click();assert p.locator('#essentialsDialog').is_visible()
def close_ess(p):p.locator('#essentialsDialog [data-essentials-close]').click();assert not p.locator('#essentialsDialog').is_visible()
def tab(p,name):p.locator('#essentialsDialog .ess-tabs [data-essentials-tab="'+name+'"]').click()
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
  # The current IA introduces the A/C criteria as contextual bubbles beside
  # student writing fields, rather than the retired global two-row panel.
  assert p.locator('[data-source-node="C10"]').count()==1
  assert p.locator('[data-criterion-badge="completing:C10:aim"]').is_visible()
  assert p.locator('[data-criterion-badge="completing:C10:motivation"]').is_visible()
  assert p.locator('[data-bind="scratch.introduction"]').is_visible()
  before=stored(p)
  badge=p.locator('[data-criterion-badge="completing:C10:aim"]')
  assert badge.bounding_box()['y']<p.locator('[data-bind="scratch.introduction"]').bounding_box()['y']
  badge.click()
  dialog=p.locator('#criterionBadgeDialog')
  assert dialog.is_visible()
  assert 'Criterion A' in dialog.inner_text()
  assert 'mathematical aim' in dialog.inner_text().lower()
  p.screenshot(path=str(OUT/'essentials-introduction-desktop.png'),full_page=True)
  dialog.locator('[data-criterion-badge-rubric="A"]').click()
  assert p.locator('#essentialsDialog [data-rubric-criterion="A"]').count()==1
  close_ess(p)
  assert stored(p)==before
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
 def open_planning_example(p):
  # N01's contextual example link moved into the optional trail-help area.
  # Open the real disclosure, not a legacy hidden support-action button.
  option=p.locator('#main [data-action="example-open"]:visible')
  if not option.count():
   toggle=p.locator('.planning-trail-help-toggle:visible')
   assert toggle.count(),'Planning must offer accessible contextual help'
   toggle.first.click()
   option=p.locator('#main [data-action="example-open"]:visible')
  assert option.count(),'No visible contextual example on the title step'
  option.first.click()
  assert p.locator('#exampleDialog').is_visible()
 def planning_title_fixture():
  x=fixture()
  x['route']='planning';x['planning']['current']='N01'
  x['journey']['currentNodeId']='N01'
  return x
 def reverse(p):
  before=stored(p)
  open_planning_example(p)
  p.locator('#exampleDialog .ex-criteria [data-action="essentials-open"]').first.click()
  assert p.locator('#essentialsDialog').is_visible()
  p.keyboard.press('Shift+Tab')
  assert p.locator('#essentialsDialog').evaluate('(n)=>n.contains(document.activeElement)')
  p.keyboard.press('Escape')
  assert not p.locator('#essentialsDialog').is_visible()
  assert p.locator('#exampleDialog').is_visible()
  p.keyboard.press('Escape')
  assert not p.locator('#exampleDialog').is_visible()
  assert stored(p)==before
 run('examples-to-rubric-nested-return',planning_title_fixture(),reverse)
 def review(p):
  before=saved(p);p.locator('.ess-review-access [data-essentials-mode="draft"]').click()
  p.locator('#ess-draft-A-location').fill('Pages 2 and 4');p.locator('#ess-draft-A-note').fill('My aim connects to the conclusion');p.locator('#ess-draft-A-action').fill('Remove repeated working');p.locator('#ess-draft-A-mark').select_option('0');p.locator('#ess-draft-E-mark').select_option('5')
  assert saved(p)['completion']['review']['records']['draft-D02']['location']=='Pages 2 and 4';assert saved(p)['completion']['review']['records']['draft-D06']['markLevel']=='SL';p.screenshot(path=str(OUT/'essentials-self-review-desktop.png'),full_page=True)
  p.locator('[data-essentials-mode="final"]').click();assert p.locator('#ess-final-A-location').input_value()=='';p.locator('#ess-final-A-location').fill('Page 5 revised');close_ess(p)
  after=saved(p);assert after['entries']==before['entries'];assert after['scratch']==before['scratch'];assert after['completion']['stages']==before['completion']['stages']
  p.reload(wait_until='networkidle');p.locator('.ess-review-access [data-essentials-mode="draft"]').click();assert p.locator('#ess-draft-A-location').input_value()=='Pages 2 and 4';assert p.locator('#ess-draft-A-mark').input_value()=='0';close_ess(p)
  p.locator('[data-action="open-panel"][data-panel="files"]').first.click()
  with p.expect_download() as dl:p.locator('.drawer [data-action="export-json"]').click()
  path=OUT/'essentials-full-backup.json';dl.value.save_as(str(path));backup=json.loads(path.read_text());assert backup['completion']['review']['records']['draft-D02']['selfMark']=='0';assert backup['completion']['review']['records']['final-D02']['location']=='Page 5 revised'
 run('essentials-shared-review-save-reload-backup',fixture('C80D'),review)
 def phones(p):
  open_ess(p);overflow(p);p.screenshot(path=str(OUT/'essentials-format-phone.png'),full_page=True);tab(p,'submission');overflow(p);assert p.locator('[data-evidence-criterion]').count()==5;close_ess(p)
 run('essentials-format-and-review-small-phone',fixture(),phones,360,740)
 def theory(p):
  badge=p.locator('[data-criterion-badge="completing:C20:methodSuitability"]')
  assert badge.is_visible()
  before=stored(p)
  badge.click()
  guidance=p.locator('#criterionBadgeDialog').inner_text().lower()
  assert 'assumptions' in guidance or 'domain' in guidance
  assert 'sampling errors' not in guidance
  p.locator('#criterionBadgeDialog [data-criterion-badge-close]').first.click()
  assert stored(p)==before
 run('criteria-theoretical-context',fixture('C20',kind='theoretical'),theory,390,844)
 def pending(p):
  # Current four-part First Mathematics writing separates a proposed step from
  # genuine completed calculations. C34B's retired standalone title view is
  # intentionally not a visible navigation target.
  assert p.locator('[data-source-node="C30"]').count()==1
  assert p.locator('.show-first-draft-note').count()>=1
  assert p.locator('.show-first-result-anchor').count()==0
  body=p.locator('#main').inner_text().lower()
  assert 'actual' in body or 'real' in body
  assert 'not automatically treated as established findings' in body or 'not a finding' in body
  assert saved(p)['entries'][0]['result']==""
  assert saved(p)['entries'][0]['status']=="planned"
 s=fixture('C30')
 s['entries']=[{'id':'fictional-first','phase':'first','status':'planned','result':'','title':'A proposed graph'}]
 s['completion']['activeEntryIndex']=0
 run('criteria-never-invents-results',s,pending)
 def writing(p):
  # Writing advice is in the live Writer's Field Guide and the student's
  # own introduction field, not the retired criteria-writing-tools disclosure.
  guide=p.locator('.writer-guide-header-button')
  assert guide.is_visible()
  guide.click()
  assert p.locator('.writer-guide-drawer [data-guide-card]').count()==14
  p.locator('.writer-guide-drawer [data-action="close-drawer"]').first.click()
  before=saved(p)
  p.locator('[data-bind="scratch.introduction"]').fill('My own meaningful thought')
  assert saved(p)['scratch']['introduction']=='My own meaningful thought'
  assert saved(p)['entries']==before['entries']
 run('criteria-retains-private-writing-tools',fixture(),writing)
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
  before=stored(p)
  open_planning_example(p)
  p.locator('#exampleDialog .ex-criteria [data-action="essentials-open"]').first.click()
  assert p.locator('#essentialsDialog').is_visible()
  p.locator('.ess-example-links [data-action="example-open"]').first.click()
  assert not p.locator('#essentialsDialog').is_visible()
  assert p.locator('#exampleDialog').evaluate('(n)=>n.contains(document.activeElement)')
  p.keyboard.press('Escape')
  assert not p.locator('#exampleDialog').is_visible()
  assert stored(p)==before
 run('examples-repeat-reference-without-hidden-dialog',planning_title_fixture(),repeated_example)
 browser.close()
(OUT/'essentials-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));assert all(r['status']=='passed' for r in results)
