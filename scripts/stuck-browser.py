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
def action(p,a,extra=''):
 # Do not click a matching but hidden control inside optional advice.
 locator=p.locator('[data-action="'+a+'"]'+extra+':visible')
 assert locator.count()>0,('Student action is not visibly available',a,extra)
 locator.first.click()
def open_help(p):
 # The current IA UI exposes "I am stuck" from the Help menu on both
 # desktop and phone, while other copies sit in collapsed writing examples.
 if p.locator('[data-action="open-stuck"]:visible').count():
  action(p,'open-stuck')
 else:
  action(p,'open-panel','[data-panel="help"]')
  action(p,'open-stuck')
 assert p.get_by_role('dialog').is_visible()
def topic(p,t):
 # Original 24 topics remain in the legacy browse section, distinct from
 # contextual suggestions that can intentionally use the same topic ID.
 group=p.locator('.drawer .stuck-legacy-browse')
 el=group.locator('[data-action="stuck-topic"][data-topic="'+t+'"]').first
 if el.count():
  if group.get_attribute('open') is None:group.locator('summary').first.click()
  el.click()
  return
 browse=p.locator('.drawer .stuck-browse')
 if browse.get_attribute('open') is None:browse.locator('summary').first.click()
 el=browse.locator('[data-action="stuck-topic"][data-topic="'+t+'"]').first
 category=el.locator('xpath=ancestor::*[@data-stuck-group-section][1]')
 if category.count() and category.get_attribute('open') is None:
  category.locator('summary').first.click()
 assert el.is_visible(),t
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
  # N01 now captures the provisional idea/title; the earlier saved aim is
  # represented in project state and must not be changed by asking for help.
  before=saved(p)['planning']['fields']['aim'];open_help(p);node(p,'N01')
  assert p.locator('.drawer .stuck-topics').first.locator('button').count()<=4
  assert p.locator('.drawer .stuck-topics').first.locator('button').first.get_attribute('data-topic').startswith('fix:planning:')
  p.screenshot(animations='disabled',path=str(OUT/'stuck-planning-phone.png'))
  topic(p,'aim');assert not p.locator('.stuck-example p').first.is_visible();assert p.locator('.drawer .btn-primary').count()==1
  p.locator('.stuck-example > summary').click();assert p.locator('.stuck-example p').first.is_visible()
  action(p,'stuck-return');node(p,'N01');assert saved(p)['planning']['fields']['aim']==before
 run('help-stays-in-planning',project(),planning)
 def help_menu(p):
  action(p,'open-panel','[data-panel="help"]')
  choices=p.locator('.drawer .guidance-choice')
  assert choices.count()==3,'Help should offer exactly three distinct guidance purposes'
  assert choices.locator('.guidance-choice-copy strong').all_inner_texts()==['I am stuck',"Writer's Field Guide",'IB criteria']
  assert [b.get_attribute('data-action') for b in choices.all()]==['open-stuck','writer-guide-open','essentials-open']
  assert all(b.is_visible() for b in choices.all())
  assert 'without predicting a mark' in choices.nth(2).inner_text()
  choices.nth(2).click()
  criterion_dialog=p.locator('#essentialsDialog[open]')
  assert criterion_dialog.is_visible()
  assert criterion_dialog.locator('[data-essentials-tab="rubric"]').get_attribute('aria-current')=='page'
  criterion_dialog.locator('[data-essentials-close]').click()
  assert p.locator('.drawer .guidance-choice').count()==3
  p.locator('.drawer [data-action="open-stuck"]').click()
  node(p,'N01');assert p.locator('.drawer .stuck-topic').count()>5
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
 def checking_bubble(p):
  badge=p.locator('[data-checking-item="D09"] [data-checking-stuck="D09:check:D09"]')
  assert badge.count()==1
  before=saved(p)
  badge.click()
  modal=p.locator('#studioStuckDialog[open]')
  assert modal.is_visible()
  assert modal.get_attribute('data-guidance-kind')=='recovery'
  assert modal.locator('.guidance-surface-close').count()==1
  assert 'Which part of checking your IA' in modal.locator('#studioStuckIntro').inner_text()
  assert 'I AM STUCK · CHECKING' in modal.inner_text()
  assert 'Works Cited' in modal.inner_text()
  assert 'not read it' in modal.inner_text()
  assert saved(p)==before
  modal.locator('[data-studio-stuck-go]').click()
  assert p.locator('#checking-review-draft-D09[open]').count()==1
  assert saved(p)['completion']['review']['records'].get('draft-D09',{}).get('status','unchecked')=='unchecked'
  p.screenshot(animations='disabled',path=str(OUT/'stuck-checking-mla-phone.png'))
 run('pass4-checking-mla-bubble',project('checking','D09'),checking_bubble)
 def checking_search(p):
  open_help(p)
  p.locator('.drawer .stuck-browse > summary').click()
  p.locator('[data-stuck-search]').fill('Works Cited')
  assert 'matching problem' in p.locator('[data-stuck-search-count]').inner_text()
  chosen=p.locator('.drawer .stuck-browse [data-topic="fix:checking:mla-match"]').first
  assert chosen.is_visible(), 'Specific MLA two-way troubleshooting should be searchable'
  chosen.click()
  assert 'How to check whether it helped' in p.locator('.stuck-recovery').inner_text()
  action(p,'stuck-work')
  assert p.locator('#checking-review-draft-D09[open]').count()==1
  assert p.locator('.stuck-return-banner').count()==1
  action(p,'stuck-return')
  assert p.locator('.checking-page').count()==1
  assert saved(p)['ui']['checkingMode']=='draft'
  assert not saved(p)['completion']['support']['returnPending']
 run('pass4-contextual-search-and-checking-return',project('checking','D09'),checking_search,1440,900)
 def feedback_bubble(p):
  badge=p.locator('[data-checking-stuck="feedback:feedback"]')
  assert badge.count()==1 and badge.is_visible()
  before=saved(p)
  badge.click();modal=p.locator('#studioStuckDialog[open]')
  assert 'I have not received permitted written feedback' in modal.inner_text()
  assert saved(p)==before
  p.keyboard.press('Escape')
  assert not modal.is_visible()
  assert p.evaluate("document.activeElement.getAttribute('data-checking-stuck')")=="feedback:feedback"
 run('pass4-feedback-no-fabrication',dict(project('checking','D13'),ui={
  **project('checking','D13')['ui'],'checkingMode':'feedback'}),feedback_bubble)
 def search_all(p):
  open_help(p)
  p.locator('.drawer .stuck-browse > summary').click()
  p.locator('[data-stuck-group-filter="maths"]').click()
  assert p.locator('[data-stuck-group-filter="maths"]').get_attribute('aria-pressed')=='true'
  p.locator('[data-stuck-search]').fill('optimum')
  assert p.locator('[data-stuck-search-count]').is_visible()
  p.locator('[data-stuck-search]').fill('unlikely_unmatched_querystuff')
  assert p.locator('[data-stuck-no-results]').is_visible()
  p.locator('[data-stuck-group-filter="all"]').click()
  assert p.locator('.drawer [data-topic="aim"]').count()==1
  assert saved(p)['completion']['support']['task'] is None
  p.screenshot(animations='disabled',path=str(OUT/'stuck-browse-search-desktop.png'))
 run('pass4-search-filter-mobile-safe',project('completing','C30'),search_all,1440,920)
 def pass5_search_resume(p):
  open_help(p)
  browse=p.locator('.drawer .stuck-browse');browse.locator('summary').first.click()
  p.locator('[data-stuck-group-filter="checking"]').click()
  p.locator('[data-stuck-search]').fill('Works Cited')
  assert p.locator('.drawer .stuck-browse [data-topic="fix:checking:mla-match"]:visible').count()==1
  p.locator('.drawer .stuck-browse [data-topic="fix:checking:mla-match"]').click()
  assert 'How to check whether it helped' in p.locator('.stuck-recovery').inner_text()
  action(p,'stuck-menu')
  # Students should not lose a carefully chosen browse/search when they
  # inspect a problem and then return to the hub.
  assert p.locator('.drawer .stuck-browse[open]').count()==1
  assert p.locator('[data-stuck-search]').input_value()=='Works Cited'
  assert p.locator('[data-stuck-group-filter="checking"]').get_attribute('aria-pressed')=='true'
  assert p.locator('.drawer .stuck-browse [data-topic="fix:checking:mla-match"]:visible').count()==1
  assert p.locator('[data-stuck-search-count]').is_visible()
  assert saved(p)['completion']['review']['records']['draft-D09']['status']=='unchecked'
  overflow(p)
  p.screenshot(path=str(OUT/'stuck-pass5-search-resume-320.png'),animations='disabled')
 run('pass5-search-retains-query-and-filter-small-phone',project('checking','D09'),pass5_search_resume,320,690)
 def pass5_revised_cohort(p):
  assert p.locator('.checking-revised-overview').count()==1
  assert p.locator('[data-checking-item="D02"]').count()==0
  assert p.locator('[data-checking-item="D09"]').count()==1
  badge=p.locator('[data-checking-stuck="D09:check:D09"]')
  assert badge.is_visible()
  before=saved(p)
  badge.click()
  dialog=p.locator('#studioStuckDialog[open]')
  assert dialog.is_visible()
  assert 'Works Cited' in dialog.inner_text()
  p.keyboard.press('Escape')
  assert not dialog.is_visible()
  assert p.evaluate('document.activeElement.getAttribute("data-checking-stuck")')=='D09:check:D09'
  badge.click()
  dialog.locator('[data-studio-stuck-hub]').click()
  browse=p.locator('.drawer .stuck-browse');browse.locator('summary').first.click()
  assert p.locator('[data-topic="fix:checking:personal-choice"]').count()==0
  # This is checking support, not a second copy of an obsolete 2026 criterion.
  assert 'A–E' not in p.locator('.drawer .stuck-suggested').inner_text()
  assert saved(p)['completion']['review']==before['completion']['review']
  overflow(p)
  p.screenshot(path=str(OUT/'stuck-pass5-2029-checking-390.png'),animations='disabled')
 s=project('checking','D09');s['planning']['fields']['assessmentFramework']='revised2029'
 run('pass5-revised-2029-checking-popin-and-hub',s,pass5_revised_cohort)
 def pass5_sampling_origin(p):
  node(p,'N03P2')
  open_help(p)
  original=saved(p)
  assert original['completion']['support']['origin']['planNode']=='N03P2'
  suggestion=p.locator('.drawer [data-topic="fix:planning:population-frame"]:visible')
  assert suggestion.count()>0
  suggestion.first.click()
  action(p,'stuck-work')
  node(p,'N03P2')
  assert p.locator('.stuck-return-banner').count()==1
  action(p,'stuck-return')
  node(p,'N03P2')
  assert not saved(p)['completion']['support']['returnPending']
  overflow(p)
 run('pass5-sampling-return-preserves-original-n03p2',project('planning','N03P2'),pass5_sampling_origin)
 def pass5_no_phantom_result(p):
  open_help(p)
  assert p.locator('.drawer [data-topic="fix:studio:not-yet-result"]').count()>0
  browse=p.locator('.drawer .stuck-browse');browse.locator('summary').first.click()
  assert p.locator('.drawer [data-topic="fix:studio:meaning-units"]').count()==0
  assert p.locator('.drawer [data-topic="fix:studio:next-gap"]').count()==0
  assert p.locator('.drawer [data-topic="fix:studio:selected-outcome-help"]').count()==0
  assert saved(p)['entries'][0]['status']=='planned'
  overflow(p)
 s=project('completing','C30');s['entries'][0].update(status='planned',result='',journeyOutcome='')
 run('pass5-planned-result-does-not-unblock-interpretation',s,pass5_no_phantom_result)
 def contextual_planning_sampling(p):
  badge=p.locator('[data-stuck-help="N03P2:page"]')
  assert badge.count()==1 and badge.is_visible()
  before=saved(p);badge.click()
  modal=p.locator('.stuck-context-dialog[open]')
  assert modal.is_visible()
  assert modal.locator('[data-workshop-help-focus="sampling"]').count()==1
  assert modal.locator('[data-workshop-term="sampling"]').count()==1
  assert modal.locator('[data-workshop-id="sampling"]').count()==1
  modal.locator('[data-workshop-term="sampling"]').click()
  assert not modal.is_visible()
  assert p.locator('.drawer [data-workshop-definition="sampling"]').count()==1
  assert p.locator('.drawer [data-related-def-id="sampling-frame"]').count()==1
  assert p.locator('.drawer [data-related-def-id="stratified-sample"]').count()==1
  assert saved(p)==before
  p.locator('.drawer [data-action="close-drawer"]').click()
  node(p,'N03P2');overflow(p)
  p.screenshot(path=str(OUT/'stuck-workshop-context-sampling-phone.png'),animations='disabled')
 run('workshop-context-planning-bubble-sampling-phone',project('planning','N03P2'),contextual_planning_sampling,360,740)
 def contextual_hub_sampling(p):
  open_help(p)
  assert p.locator('.drawer .stuck-hub [data-workshop-term="sampling"]').count()==1
  p.locator('.drawer [data-topic="fix:planning:population-frame"]:visible').first.click()
  assert p.locator('.drawer .stuck-focused [data-workshop-term="sampling"]').count()==1
  before=saved(p)
  p.locator('.drawer .stuck-focused [data-workshop-id="sampling"]').click()
  assert p.locator('.drawer [data-workshop-lesson="sampling"]').count()==1
  p.locator('.drawer [data-action="close-drawer"]').click()
  assert p.locator('.drawer .stuck-focused').count()==1
  assert saved(p)==before
 run('workshop-context-stuck-hub-sampling-return',project('planning','N03P2'),contextual_hub_sampling,390,844)
 def contextual_studio_method(p):
  badge=p.locator('[data-studio-stuck="C30:part:show"]')
  assert badge.count()==1 and badge.is_visible()
  before=saved(p);badge.click()
  modal=p.locator('#studioStuckDialog[open]')
  assert modal.is_visible()
  assert modal.locator('[data-workshop-help-focus="calculate"]').count()==1
  assert modal.locator('[data-workshop-id="pearson"]').count()==1
  assert modal.locator('[data-workshop-term="correlation"]').count()==1
  modal.locator('[data-workshop-id="pearson"]').click()
  assert not modal.is_visible()
  assert p.locator('.drawer [data-workshop-lesson="pearson"]').count()==1
  assert saved(p)==before
  p.locator('.drawer [data-action="close-drawer"]').click()
  node(p,'C30')
 s=project('completing','C30');s['entries'][0].update(methodId='pmcc',status='planned',result='')
 s['planning'].setdefault('routeExplorer',{})['selectedRoute']='finance'
 run('workshop-context-studio-method-overrides-route',s,contextual_studio_method,1440,950)
 def contextual_top_right(p):
  before=saved(p)
  action(p,'open-panel','[data-panel="help"]')
  card=p.locator('.drawer .guidance-help-panel .workshop-contextual-help')
  assert card.count()==1
  assert card.locator('[data-workshop-route="fitted-models"]').count()>=1
  assert card.locator('[data-workshop-term="model"]').count()==1
  card.locator('[data-workshop-term="model"]').click()
  assert p.locator('.drawer [data-workshop-definition="model"]').count()==1
  assert saved(p)==before
  p.locator('.drawer [data-action="close-drawer"]').click()
  node(p,'N04S')
 s=project('planning','N04S');s['planning'].setdefault('routeExplorer',{})['selectedRoute']='fitted-models'
 run('workshop-context-top-right-selected-route',s,contextual_top_right,1440,950)
 def contextual_checking_no_maths(p):
  action(p,'open-panel','[data-panel="help"]')
  assert p.locator('.drawer .guidance-help-panel .workshop-contextual-help').count()==0
  assert p.locator('.drawer [data-action="resource-workshop"]').count()>=1
  p.locator('.drawer [data-action="close-drawer"]').click()
  badge=p.locator('[data-checking-stuck="D09:check:D09"]')
  assert badge.count()==1
  badge.click()
  assert p.locator('#studioStuckDialog[open] .workshop-contextual-help').count()==0
 run('workshop-context-no-maths-in-checking',project('checking','D09'),contextual_checking_no_maths)
 browser.close()
(OUT/'stuck-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
assert all(r['status']=='passed' for r in results)
