"""Synthetic acceptance for optional resource links; no student data or external uploads.
Uses the production build. External tutorials are inspected as links, not marked watched.
"""
import copy,json,os,traceback,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True,parents=True)
BASE=json.loads((OUT/'project.json').read_text());KEY='ia-pathfinder-prototype-v1'
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/');results=[]
def state(node='C40',method='pmcc',status='planned',route='completing'):
 s=copy.deepcopy(BASE);s['route']=route;s['completion']['current']=node;s['completion']['activeEntryIndex']=0;s['completion']['nextFromEntryId']='graph';s['planning']['current']='N01'
 s['entries'][0].update(methodId=method,status=status,result='r = 0.4' if status=='completed' else '',kind='calculation',phase='substantial',knowledge='syllabus')
 # Compare against a normalized project, not the deliberately sparse legacy
 # fixtures: adding missing default fields on first save is not a tutorial edit.
 code="import {normalizeProjectState} from './src/core/project-state.js';let s='';for await(const c of process.stdin)s+=c;console.log(JSON.stringify(normalizeProjectState(JSON.parse(s))));"
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],input=json.dumps(s).encode()))
def saved(p):return p.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
def unchanged_fields(s):return json.dumps([s['entries'],s['planning'],s['project'],s['teacher'],s['completion']['stages'],s['scratch']],sort_keys=True)
def action(p,name,extra=''):
 buttons=p.locator('[data-action="'+name+'"]'+extra+':visible')
 assert buttons.count()>0,('No visible action',name,extra)
 buttons.first.click()
def reveal_details(control):
 # Reach optional advice through its displayed disclosure summaries. Never
 # force a click into the collapsed examples/more-help panels.
 assert control.count()==1,'Expected one contextual help control'
 while not control.is_visible():
  summaries=[panel.locator(':scope > summary') for panel in control.locator('xpath=ancestor::details[not(@open)]').all()]
  visible=next((summary for summary in summaries if summary.is_visible()),None)
  assert visible is not None,'Contextual help is not reachable through a visible disclosure'
  visible.click()
def open_library(p):
 if not p.locator('[data-action="resource-browse"]:visible').count():
  action(p,'open-panel','[data-panel="help"]')
 action(p,'resource-browse')
 assert overlay(p).is_visible(),'Resource library did not open'
def open_suggestion(p,id):
 control=p.locator('#main [data-resource-suggestion="'+id+'"] [data-action="resource-open"][data-resource-id="'+id+'"]')
 reveal_details(control);control.click();assert overlay(p).is_visible()
def open_stuck(p):
 if not p.locator('[data-action="open-stuck"]:visible').count():
  action(p,'open-panel','[data-panel="help"]')
 action(p,'open-stuck')
 assert p.locator('.drawer [data-action="stuck-topic"]').count()>0,'Problem-first help did not open'
def stuck_topic(p,id):
 control=p.locator('.drawer [data-action="stuck-topic"][data-topic="'+id+'"]')
 reveal_details(control);control.click()
def detail(p,id):p.locator('.resource-library [data-action="resource-open"][data-resource-id="'+id+'"]:visible').first.click()
def choice(p,key,value):
 p.locator('.resource-preferences > summary').click() if p.locator('.resource-preferences').get_attribute('open') is None else None
 p.locator('[data-resource-pref="'+key+'"]').select_option(value)
def close(p):p.locator('.resource-library [data-action="resource-close"]').first.click()
def overlay(p):return p.locator('.resource-drawer')
with sync_playwright() as pw:
 opt={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):opt['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**opt)
 def run(name,s,fn,width=390,height=844):
  c=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);c.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  p=c.new_page();p.set_default_timeout(6500);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle');fn(p)
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   if overlay(p).count():assert overlay(p).evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
   assert not errors,errors
   results.append({'test':name,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as ex:
   results.append({'test':name,'status':'FAILED','error':str(ex),'traceback':traceback.format_exc(),'page_errors':errors});traceback.print_exc()
   try:p.screenshot(path=str(OUT/(name+'-failure.png')),animations='disabled')
   except Exception:pass
  c.close()
 def planning(p):
  before=unchanged_fields(saved(p));open_library(p);assert p.locator('[data-source-node="N01"]').count()==1
  p.locator('#resource-search').fill('PMCC');detail(p,'sheets-pmcc');assert 'Library preview' in overlay(p).inner_text();assert '=CORREL(A2:A7,B2:B7)' in overlay(p).inner_text();close(p)
  assert p.locator('[data-source-node="N01"]').count()==1;assert unchanged_fields(saved(p))==before
 run('resources-planning-preservation',state(route='planning'),planning)
 def pmcc(p):
  assert p.locator('[data-resource-suggestion="sheets-pmcc"]').count()==1;before=unchanged_fields(saved(p));open_library(p);choice(p,'tool','desmos');close(p)
  assert p.locator('[data-resource-suggestion="desmos-pmcc"]').count()==1;open_suggestion(p,'desmos-pmcc');assert 'corr(x_1,y_1)' in overlay(p).inner_text();assert unchanged_fields(saved(p))==before
  overlay(p).screenshot(path=str(OUT/'resources-pmcc-phone.png'),animations='disabled')
 run('resources-selected-tool-pmcc',state(),pmcc)
 def interpret(p):
  assert p.locator('[data-resource-suggestion="pmcc-meaning"]').count()==1;open_suggestion(p,'pmcc-meaning');assert 'Understand and check' in overlay(p).inner_text()
  assert 'does not establish' in overlay(p).inner_text();assert p.locator('[data-source-node="C35"]').count()==1
 run('resources-real-result-interpretation',state(node='C35',status='completed'),interpret)
 def filtering(p):
  open_library(p);assert p.locator('#resource-results .resource-row').count()==8
  p.locator('[data-action="resource-more"]').click();assert p.locator('#resource-results .resource-row').count()==16
  p.locator('#resource-search').fill('picture');p.locator('#resource-filter-tool').select_option('desmos');assert p.locator('#resource-results .resource-row').count()>0
  detail(p,'image-import');p.locator('[data-action="resource-list"]').click();assert p.locator('#resource-search').input_value()=='picture'
  p.locator('#resource-search').fill('zz-nothing-matches');assert 'No matching guide' in overlay(p).inner_text();p.locator('[data-action="resource-clear"]').click();assert p.locator('#resource-search').input_value()==''
  overlay(p).screenshot(path=str(OUT/'resources-library-desktop.png'),animations='disabled')
 run('resources-filter-pagination-and-back',state(),filtering,1440,1000)
 def image(p):
  before=unchanged_fields(saved(p));open_library(p);choice(p,'image','import');close(p);assert p.locator('[data-resource-suggestion="image-import"]').count()==1
  open_suggestion(p,'image-import');p.locator('.resource-related > summary').click();detail(p,'image-scale');assert '25' in overlay(p).inner_text()
  p.locator('.resource-related > summary').click();detail(p,'image-route');p.locator('.resource-related > summary').click();detail(p,'image-visual');assert 'visual' in overlay(p).inner_text().lower()
  choice(p,'image','points');close(p);assert p.locator('[data-resource-suggestion="image-points"]').count()==1;assert unchanged_fields(saved(p))==before
 run('resources-image-paths-do-not-change-method',state(method='other'),image)
 def review(p):
  open_library(p);choice(p,'image','points');close(p);assert p.locator('[data-resource-suggestion="model-check"]').count()==1
  data=saved(p);data['entries'][0]['reviewNeeded']='yes';data['entries'][0]['reviewReason']='Image scale changed'
  p.evaluate('([k,s])=>localStorage.setItem(k,JSON.stringify(s))',[KEY,data]);p.reload(wait_until='networkidle');assert p.locator('[data-resource-suggestion="image-scale"]').count()==1
 run('resources-scale-recheck-after-change',state(node='C35',method='quadratic-fit',status='completed'),review)
 def stuck(p):
  open_stuck(p);stuck_topic(p,'calculation')
  action(p,'resource-browse');p.locator('#resource-search').fill('PMCC');detail(p,'sheets-pmcc')
  p.locator('.resource-videos > summary').click();assert 'not been watched end to end' in overlay(p).inner_text();close(p)
  assert p.locator('.drawer .stuck-heading').inner_text()=='My calculation or software is not working'
 run('resources-return-to-stuck-topic',state(),stuck)
 def writer(p):
  open_stuck(p);stuck_topic(p,'writing');action(p,'stuck-work');assert p.locator('[data-resource-suggestion="pmcc-meaning"]').count()==1
  open_suggestion(p,'pmcc-meaning');close(p);assert p.locator('[data-source-node="C96"]').count()==1
 run('resources-writing-helper-origin',state(node='C34B',status='completed'),writer)
 def hide(p):
  hide_button=p.locator('#main [data-resource-suggestion] [data-action="resource-hide"]');reveal_details(hide_button);hide_button.click();assert p.locator('[data-resource-suggestion]').count()==0;p.reload(wait_until='networkidle');assert p.locator('[data-resource-suggestion]').count()==0
  open_library(p);p.locator('#resource-search').fill('PMCC');detail(p,'sheets-pmcc');assert 'Read the steps' in overlay(p).inner_text()
 run('resources-dismissal-and-manual-access',state(),hide)
 def no_network(p):
  before=[];p.on('request',lambda r:before.append(r.url));open_library(p);p.locator('#resource-search').fill('PMCC');detail(p,'sheets-pmcc');p.locator('.resource-videos > summary').click();p.wait_for_timeout(200)
  assert not before,before;assert not p.locator('.resource-drawer iframe, .resource-drawer video').count()
  links=p.locator('.resource-drawer a');assert links.count()>0
  for a in links.all():assert a.get_attribute('target')=='_blank' and a.get_attribute('rel')=='noopener noreferrer' and a.get_attribute('referrerpolicy')=='no-referrer'
  overlay(p).screenshot(path=str(OUT/'resources-video-fallback-phone.png'),animations='disabled')
 run('resources-no-automatic-external-request',state(),no_network)
 def practice(p):
  before=unchanged_fields(saved(p));open_suggestion(p,'sheets-pmcc');p.locator('.resource-practice > summary').click();p.locator('[data-action="resource-copy"]').click()
  p.wait_for_function('document.querySelector("#resource-copy-status").textContent.length>0');assert 'practice' in p.locator('#resource-practice-data').input_value();assert unchanged_fields(saved(p))==before
 run('resources-practice-never-becomes-evidence',state(),practice)
 def backup(p):
  open_library(p);choice(p,'tool','desmos');choice(p,'image','points');close(p);p.reload(wait_until='networkidle');assert saved(p)['resources']['preferences']['entry:graph']=={'tool':'desmos','image':'points'}
  p.locator('[data-action="open-panel"][data-panel="files"]').click()
  with p.expect_download() as download:p.locator('[data-action="export-json"]').first.click()
  file=OUT/'resources-backup.json';download.value.save_as(file);j=json.loads(file.read_text());assert j['resources']['preferences']['entry:graph']['image']=='points'
  p.once('dialog',lambda dialog:dialog.accept());p.locator('#importFile').set_input_files(file);p.wait_for_timeout(300);assert saved(p)['resources']==j['resources']
 run('resources-preferences-backup-restore',state(),backup,1440,1000)
 def keyboard(p):
  open_library(p);p.locator('#resource-search').focus();p.keyboard.type('picture');assert p.evaluate('document.activeElement.id')=='resource-search';p.keyboard.press('Enter');assert overlay(p).count()==1
  detail(p,'image-scale');p.locator('.resource-footer [data-action="resource-close"]').focus();p.keyboard.press('Tab');assert p.evaluate('document.activeElement.dataset.action')=='close-drawer'
  overlay(p).screenshot(path=str(OUT/'resources-image-scale-small-phone.png'),animations='disabled');p.keyboard.press('Escape');assert p.locator('#drawerLayer').is_hidden()
 run('resources-keyboard-small-phone',state(),keyboard,360,740)
 def preview(p):
  open_library(p);p.locator('#resource-search').fill('inference');detail(p,'inference');assert 'Library preview' in overlay(p).inner_text();assert 'not syllabus approval' in overlay(p).inner_text();assert saved(p)['entries'][0]['methodId']=='pmcc'
 run('resources-library-does-not-select-test',state(),preview)
 browser.close()
(OUT/'resources-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));assert all(r['status']=='passed' for r in results)
