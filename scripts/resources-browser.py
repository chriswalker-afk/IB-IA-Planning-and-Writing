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
 def contextual_mla(p):
  before=unchanged_fields(saved(p))
  note=p.locator('#main [data-citation-moment="first-maths"]')
  assert note.count()==1 and note.is_visible()
  assert note.locator('[data-resource-id="mla-citations"]').count()==1
  note.locator('[data-resource-id="mla-citations"]').click()
  assert overlay(p).is_visible()
  assert 'MLA (8th ed.)' in overlay(p).inner_text()
  close(p)
  assert unchanged_fields(saved(p))==before
 def secondary_first():
  s=state(node='C20')
  s['planning']['fields']['dataSource']='secondary'
  return s
 run('resources-contextual-mla-first-maths',secondary_first(),contextual_mla,390,844)
 def figure_mla(p):
  before=unchanged_fields(saved(p))
  note=p.locator('#main [data-citation-moment="figure"]')
  assert note.count()==1
  assert 'original source' in note.inner_text().lower()
  note.locator('[data-resource-id="mla-citations"]').click()
  assert overlay(p).is_visible()
  close(p)
  assert unchanged_fields(saved(p))==before
 def figure_source():
  s=state(node='C31')
  s['graphStudio']['open']=True
  s['graphStudio']['draft']['kind']='scatter'
  s['graphStudio']['draft']['sourceKind']='secondary'
  s['graphStudio']['draft']['sourceText']='Published source to verify'
  return s
 run('resources-contextual-mla-figure-source',figure_source(),figure_mla,390,844)
 def planning_mla(p):
  before=unchanged_fields(saved(p))
  note=p.locator('#main [data-citation-moment="planning-secondary"]')
  assert note.count()==1
  note.locator('[data-resource-id="mla-citations"]').click()
  assert overlay(p).is_visible()
  close(p)
  assert unchanged_fields(saved(p))==before
 def planned_secondary():
  s=state(route='planning')
  s['planning']['current']='N03S'
  s['planning']['fields']['dataSource']='secondary'
  return s
 run('resources-contextual-mla-planning',planned_secondary(),planning_mla,390,844)
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
 def ordering(p):
  before=unchanged_fields(saved(p));open_library(p)
  search=p.locator('#resource-search')
  assert search.is_visible()
  compact=p.locator('.resource-quick-tools .resource-creators-compact')
  assert compact.count()==1 and compact.get_attribute('open') is None
  assert search.bounding_box()['y']<p.locator('#resource-results').bounding_box()['y']
  compact.locator('summary').click()
  assert compact.locator('[data-resource-creator="graph"]').is_visible()
  assert unchanged_fields(saved(p))==before
 run('resources-order-desktop',state(),ordering,1440,1000)
 run('resources-order-phone',state(),ordering,390,844)
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
  backup_button=p.locator('.drawer [data-action="export-json"][data-backup-primary="true"]:visible')
  assert backup_button.count()==1 and backup_button.is_visible(), "Primary project backup is not reachable"
  assert not p.locator('.drawer [data-backup-recovery="true"]').is_visible(), "Recovery action must remain hidden when exports are healthy"
  with p.expect_download() as download:backup_button.click()
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
 def workshop_phone(p):
  before=unchanged_fields(saved(p))
  open_library(p)
  p.locator('.resource-workshop-entry [data-action="resource-workshop"]').click()
  assert p.locator('[data-workshop-home="true"]').count()==1
  assert p.locator('#workshop-route option').count()==17
  p.locator('#workshop-route').select_option('voronoi')
  assert 'Voronoi cell' in p.locator('#resource-results').inner_text()
  assert 'No guided lessons match this selection' in p.locator('#resource-results').inner_text()
  p.locator('#workshop-search').fill('distance')
  assert 'Euclidean distance' in p.locator('#resource-results').inner_text()
  assert p.locator('#workshop-search').input_value()=='distance'
  assert overlay(p).evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
  overlay(p).screenshot(path=str(OUT/'workshop-glossary-phone.png'),animations='disabled')
  p.locator('[data-action="resource-workshop-tools"]').first.click()
  assert p.locator('#resource-search').count()==1
  p.locator('[data-action="close-drawer"]').click()
  assert unchanged_fields(saved(p))==before
 run('workshop-route-glossary-phone',state(route='planning'),workshop_phone,360,740)
 def workshop_lesson(p):
  before=unchanged_fields(saved(p))
  open_library(p)
  p.locator('.resource-workshop-entry [data-action="resource-workshop"]').click()
  assert p.locator('[data-workshop-lesson="pearson"]').count()==1
  assert 'r = 0.8' in overlay(p).inner_text()
  p.locator('.workshop-lesson-tabs .workshop-tab[data-workshop-step="help"]').click()
  p.locator('[data-action="resource-workshop-choice"][data-workshop-choice="negative"]').click()
  assert "That's right" in p.locator('.workshop-feedback.correct').inner_text()
  p.locator('.workshop-lesson-tabs .workshop-tab[data-workshop-step="turn"]').click()
  assert 'Independent practice' in overlay(p).inner_text()
  p.locator('.workshop-reveal > summary').click()
  assert '0.837' in overlay(p).inner_text()
  p.locator('.workshop-technology [data-action="resource-open"]').click()
  assert p.locator('[data-resource-detail="sheets-pmcc"]').count()==1
  p.locator('[data-action="resource-workshop"][data-workshop-resume="true"]').click()
  assert p.locator('[data-workshop-lesson="pearson"]').count()==1
  overlay(p).screenshot(path=str(OUT/'workshop-guided-desktop.png'),animations='disabled')
  p.locator('[data-action="close-drawer"]').click()
  assert unchanged_fields(saved(p))==before
 run('workshop-guided-calculation-desktop',state(),workshop_lesson,1440,1000)
 def batch1_guided(p):
  before=unchanged_fields(saved(p))
  open_library(p)
  p.locator('.resource-workshop-entry [data-action="resource-workshop"]').click()
  p.locator('[data-action="resource-workshop-home"]').first.click() if not p.locator('[data-workshop-home="true"]').count() else None
  assert p.locator('#resource-results .workshop-lesson-card').count()==8
  p.locator('[data-action="resource-workshop-lesson"][data-workshop-id="two-way-proportions"]').first.click()
  assert p.locator('[data-workshop-lesson="two-way-proportions"]').count()==1
  assert p.locator('.workshop-data-table').count()==1
  assert '18' in p.locator('.workshop-data-table').inner_text()
  p.locator('.workshop-lesson-tabs [data-workshop-step="help"]').click()
  assert 'Checkpoint 1 of 2' in overlay(p).inner_text()
  p.locator('[data-action="resource-workshop-choice"][data-workshop-choice="row"]').click()
  assert "That's right" in overlay(p).inner_text()
  p.locator('[data-action="resource-workshop-checkpoint"][data-workshop-direction="1"]').click()
  assert 'Checkpoint 2 of 2' in overlay(p).inner_text()
  p.locator('[data-action="resource-workshop-choice"][data-workshop-choice="69"]').click()
  assert "That's right" in overlay(p).inner_text()
  p.locator('.workshop-lesson-tabs [data-workshop-step="turn"]').click()
  p.locator('.workshop-reveal > summary').click()
  assert '45 percentage points' in overlay(p).inner_text()
  assert overlay(p).evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
  overlay(p).screenshot(path=str(OUT/'workshop-batch1-guided-phone.png'),animations='disabled')
  p.locator('.workshop-technology [data-action="resource-open"]').click()
  assert p.locator('[data-resource-detail="two-way"]').count()==1
  p.locator('[data-action="resource-workshop"][data-workshop-resume="true"]').click()
  assert p.locator('[data-workshop-lesson="two-way-proportions"]').count()==1
  p.locator('[data-action="close-drawer"]').click()
  assert unchanged_fields(saved(p))==before
 run('workshop-batch1-guided-phone',state(),batch1_guided,360,740)
 def batch1_pathway(p):
  before=unchanged_fields(saved(p))
  open_library(p)
  p.locator('.resource-workshop-entry [data-action="resource-workshop"]').click()
  if not p.locator('[data-workshop-home="true"]').count():p.locator('[data-action="resource-workshop-home"]').first.click()
  p.locator('#workshop-route').select_option('categorical')
  assert 'Two-way tables and conditional percentages' in p.locator('#resource-results').inner_text()
  assert 'Conditional proportion' in p.locator('#resource-results').inner_text()
  p.locator('#workshop-route').select_option('variation')
  assert 'Measurement resolution and sensible uncertainty checks' in p.locator('#resource-results').inner_text()
  p.locator('[data-action="resource-workshop-lesson"][data-workshop-id="measurement"]').first.click()
  assert 'not a complete measurement-uncertainty estimate' in overlay(p).inner_text().lower()
  assert p.locator('.workshop-data-table').count()==1
  p.locator('[data-action="close-drawer"]').click()
  assert unchanged_fields(saved(p))==before
 run('workshop-batch1-pathway-desktop',state(route='planning'),batch1_pathway,1440,1000)
 browser.close()
(OUT/'resources-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));assert all(r['status']=='passed' for r in results)
