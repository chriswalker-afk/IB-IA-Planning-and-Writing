"""Synthetic browser acceptance for optional problem-first support.
Run against a local production build. No real student data is used.
"""
import copy,json,os,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True,parents=True)
BASE=json.loads((OUT/'project.json').read_text())
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/')
KEY='ia-pathfinder-prototype-v1';results=[]
def project(route='planning',node='N01'):
 s=copy.deepcopy(BASE);s['route']=route;s['planning']['current']=node if route=='planning' else 'N01'
 s['completion']['current']=node if route=='completing' else 'C04';s['completion']['activeEntryIndex']=0;s['completion']['nextFromEntryId']=s['entries'][0]['id']
 s['completion']['fields']['permissionStatus']='not-needed';s['planning']['fields']['permissionNeed']='no';s['teacher']['pendingApproval']=False
 s['planning']['fields']['aim']='How does the shape affect the model?';return s
def saved(p):return p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
def action(p,a,extra=''):p.locator('[data-action="'+a+'"]'+extra).first.click()
def open_help(p):action(p,'open-stuck');assert p.get_by_role('dialog').is_visible()
def topic(p,t):
 el=p.locator('.drawer [data-action="stuck-topic"][data-topic="'+t+'"]')
 if not el.is_visible():p.locator('.drawer .stuck-browse > summary').click()
 el.click()
def node(p,n):assert p.locator('[data-source-node="'+n+'"]').count()==1,n
def overflow(p):assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 def run(name,s,fn,width=390,height=844):
  c=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);c.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  p=c.new_page();p.set_default_timeout(6000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle');fn(p);overflow(p);assert not errors,errors
   results.append({'test':name,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as e:
   results.append({'test':name,'status':'FAILED','error':str(e),'page_errors':errors});traceback.print_exc();p.screenshot(animations='disabled',path=str(OUT/(name+'-failure.png')),full_page=True)
  c.close()
 def planning(p):
  before=p.locator('[data-bind="planning.fields.aim"]').input_value();open_help(p);node(p,'N01')
  assert p.locator('.drawer .stuck-topics').first.locator('button').count()<=5
  assert p.locator('.drawer .stuck-topics').first.locator('button').first.get_attribute('data-topic')=='aim'
  p.screenshot(animations='disabled',path=str(OUT/'stuck-planning-phone.png'))
  topic(p,'aim');assert not p.locator('.stuck-example p').first.is_visible();assert p.locator('.drawer .btn-primary').count()==1
  p.locator('.stuck-example > summary').click();assert p.locator('.stuck-example p').first.is_visible()
  action(p,'stuck-return');node(p,'N01');assert p.locator('[data-bind="planning.fields.aim"]').input_value()==before
 run('help-stays-in-planning',project(),planning)
 def help_menu(p):
  action(p,'open-panel','[data-panel="help"]');p.locator('.drawer [data-action="open-stuck"]').click();node(p,'N01');assert p.locator('.drawer .stuck-topic').count()>5
  p.keyboard.press('Escape');assert not p.locator('#drawerLayer').is_visible();node(p,'N01')
 run('existing-help-menu',project(),help_menu,922,544)
 def returns(p):
  open_help(p);topic(p,'aim');action(p,'stuck-work');node(p,'N01');assert p.locator('.stuck-return-banner').count()==1
  action(p,'stuck-return');node(p,'N04S');assert not saved(p)['completion']['support']['returnPending']
 run('help-target-return-to-plan',project(node='N04S'),returns,1440,1000)
 def current_result(p):
  open_help(p);topic(p,'next');assert 'does not establish monotonicity' in p.locator('.stuck-example').text_content()
  action(p,'stuck-work');node(p,'C35');assert saved(p)['completion']['nextFromEntryId']==BASE['entries'][0]['id']
  action(p,'stuck-return');node(p,'C34B');assert saved(p)['completion']['activeEntryIndex']==0
 run('help-keeps-current-result',project('completing','C34B'),current_result)
 def planned(p):
  open_help(p);topic(p,'interpret');assert 'No completed result is selected' in p.locator('.drawer').inner_text()
  assert 'calculated Pearson coefficient' not in p.locator('.drawer').inner_text()
 s=project('completing','C40');s['entries'][0].update(status='planned',result='',phase='substantial',methodId='pmcc')
 run('help-does-not-invent-results',s,planned)
 def theory(p):
  open_help(p);assert p.locator('.drawer [data-topic="no-data"]').count()==0;assert p.locator('.drawer [data-topic="partial"]').count()==0
  topic(p,'proof');assert 'conjecture precisely' in p.locator('.drawer').inner_text();p.screenshot(animations='disabled',path=str(OUT/'stuck-proof-phone.png'))
 s=project('completing','C40');s['planning']['fields']['kind']='theoretical';s['project']['kind']='theoretical';s['entries'][0].update(kind='theory',methodId='proof',phase='substantial')
 run('help-theoretical-route',s,theory)
 def permission(p):
  open_help(p);assert p.locator('.drawer .stuck-topics').first.locator('button').first.get_attribute('data-topic')=='permission'
  topic(p,'no-data');assert 'on hold' in p.locator('.drawer').inner_text();action(p,'stuck-work');node(p,'C03');assert saved(p)['teacher']['pendingApproval']
 s=project('completing','C20');s['teacher']['pendingApproval']=True
 run('help-permission-safety',s,permission)
 def save_note(p):
  open_help(p);topic(p,'aim');p.locator('.stuck-save > summary').click()
  p.locator('[data-bind="completion.support.drafts.aim.action"]').fill('Check the units and define one quantity')
  p.locator('[data-bind="completion.support.drafts.aim.note"]').fill('My own unresolved question')
  action(p,'stuck-save');assert saved(p)['completion']['support']['task']['status']=='pending'
  with p.expect_download() as d:action(p,'stuck-backup')
  path=OUT/'stuck-full-backup.json';d.value.save_as(str(path));raw=json.loads(path.read_text());assert raw['completion']['support']['task']['note']=='My own unresolved question'
  action(p,'stuck-return');p.on('dialog',lambda d:d.accept());p.locator('#importFile').set_input_files(str(path));p.wait_for_timeout(250)
  assert saved(p)['completion']['support']['task']['status']=='pending';assert saved(p)['completion']['support']['drafts']['aim']['action']=='Check the units and define one quantity'
 run('help-note-backup-restore',project(),save_note,1440,1000)
 def writing(p):
  open_help(p);topic(p,'writing');action(p,'stuck-work');node(p,'C96');assert p.locator('[data-writing-cue]').count()==1
  action(p,'stuck-return');node(p,'C34B')
 run('help-connects-writing-cue',project('completing','C34B'),writing)
 def keyboard(p):
  open_help(p);p.keyboard.press('Shift+Tab');assert p.evaluate('document.activeElement.dataset.action')=='stuck-backup'
  p.keyboard.press('Tab');assert p.evaluate('document.activeElement.dataset.action')=='close-drawer'
  topic(p,'aim');p.locator('.drawer [data-action="stuck-backup"]').focus();p.keyboard.press('Tab');assert p.evaluate('document.activeElement.dataset.action')=='close-drawer'
  p.keyboard.press('Escape');assert not p.locator('#drawerLayer').is_visible()
 run('help-keyboard-focus',project(),keyboard)
 def ready(p):
  open_help(p);assert p.locator('.drawer .stuck-topics').first.locator('[data-topic="no-data"]').count()==0
  topic(p,'source');p.screenshot(animations='disabled',path=str(OUT/'stuck-source-desktop.png'));action(p,'stuck-return');node(p,'C20')
 s=project('completing','C20');s['completion']['fields']['dataStatus']='ready'
 run('help-source-stage-ready',s,ready,1440,1000)
 def feedback(p):
  open_help(p);topic(p,'feedback');action(p,'stuck-work');node(p,'C80D');assert p.locator('#review-feedback').count()==1
  action(p,'stuck-return');node(p,'C90F')
 run('help-links-feedback-workflow',project('completing','C90F'),feedback)
 def conclusion_writing(p):
  open_help(p);topic(p,'writing');assert 'strongest answer' in p.locator('.drawer .stuck-next').inner_text()
  action(p,'stuck-work');node(p,'C96');assert p.locator('[data-writing-cue]').count()==1
  action(p,'stuck-return');node(p,'C60')
 run('help-writing-in-current-section',project('completing','C60'),conclusion_writing)

 def legacy(p):
  assert 'What is getting in your way?' in p.locator('#main').inner_text();action(p,'stuck-topic','[data-topic="unsure"]');assert 'Try this now' in p.locator('#main').inner_text();action(p,'stuck-return');node(p,'C04')
 s=project('completing','C95');s['completion'].pop('support',None)
 run('legacy-stuck-entry',s,legacy)
 def small(p):
  open_help(p);topic(p,'aim');p.locator('.stuck-example > summary').click();p.locator('#stuck-alternatives > summary').click();overflow(p)
  assert p.locator('#stuck-alternatives [data-action="stuck-topic"]').count()<=2
  p.screenshot(animations='disabled',path=str(OUT/'stuck-advice-small-phone.png'),full_page=True)
 run('help-small-phone-expanded',project(),small,360,740)
 browser.close()
(OUT/'stuck-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
assert all(r['status']=='passed' for r in results)
