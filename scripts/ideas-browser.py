"""Synthetic acceptance for the optional Idea Explorer. Does not use real student data."""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));OUT.mkdir(parents=True,exist_ok=True)
KEY='ia-pathfinder-prototype-v1';URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/')
code="import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"
BASE=json.loads(subprocess.check_output(['node','--input-type=module','-e',code]))
results=[]
def state(node='N00B',existing=False):
 s=copy.deepcopy(BASE);s['route']='planning';s['planning']['current']=node;s['journey']['currentNodeId']=node
 if existing:
  s['project'].update(idea='My existing topic',aim='My existing aim',prediction='My first prediction')
  s['planning']['fields'].update(idea='My existing topic',aim='My existing aim',originalIdea='My oldest topic',prediction='My first prediction')
  s['scratch']['introduction']='My existing introduction'
  s['teacher']['pendingApproval']=True
 return s
def saved(p):return p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
def action(p,id,extra=''):p.locator('[data-action="idea-'+id+'"]'+extra).first.click()
def node(p,id):assert p.locator('[data-source-node="'+id+'"]').count()==1,(id,p.locator('#main').inner_text()[:150])
def protect(s):return json.dumps([s['project'],s['planning']['fields'],s['planning']['mathSelected'],s['entries'],s['teacher'],s['scratch']],sort_keys=True)
def draft(p):p.locator('[data-action="idea-explore"][data-seed="leaf-outline"]').click()
with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 def run(name,s,fn,width=390,height=844):
  ctx=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
  ctx.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  p=ctx.new_page();p.set_default_timeout(6000);errors=[];p.on('pageerror',lambda err:errors.append(str(err)))
  p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle',timeout=20000);fn(p)
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),p.evaluate('({w:innerWidth,s:document.documentElement.scrollWidth})')
   assert not errors,errors;results.append({'test':name,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as err:
   results.append({'test':name,'status':'FAILED','error':str(err),'page_errors':errors,'traceback':traceback.format_exc()});traceback.print_exc()
   p.screenshot(path=str(OUT/(name+'-failure.png')),full_page=True,animations='disabled')
  ctx.close()
 def fast(p):
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="yes"]').click()
  assert p.locator('[data-bind="planning.fields.idea"]').count()==0
  p.locator('[data-action="plan-advance"]').click();node(p,'N01')
  p.locator('[data-bind="planning.fields.provisionalTitle"]').fill('How might a simple model explain my topic?')
  assert saved(p)['planning']['fields']['provisionalTitle']=='How might a simple model explain my topic?'
  assert p.locator('.idea-explorer').count()==0;assert saved(p)['ideaExplorer']['shortlist']==[]
 run('ideas-clear-idea-fast-route',state('N00'),fast)
 def enter(p):
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="no"]').click();p.locator('[data-action="plan-advance"]').click();node(p,'N00B')
  assert p.locator('#idea-topic option').count()==14;assert p.locator('[data-idea-card]').count()==3
 run('ideas-optional-entry',state('N00'),enter)
 def browse(p):
  before=protect(saved(p));p.locator('#idea-topic').select_option('nature');p.locator('[data-subtopic="Leaves"]').click();assert p.locator('[data-idea-card]').count()==3
  assert p.locator('[data-idea-card]').first.get_attribute('data-idea-card')=='leaf-outline'
  p.screenshot(path=str(OUT/'ideas-nature-desktop.png'),full_page=True,animations='disabled')
  action(p,'more');assert p.locator('[data-idea-card]').count()==3;assert protect(saved(p))==before
 run('ideas-topic-subtopic-and-more',state(existing=True),browse,1440,1000)
 def detail(p):
  p.locator('#idea-topic').select_option('nature');draft(p)
  p.locator('#idea-question').fill('How could I estimate the area of one leaf from my garden?')
  p.locator('.idea-narrow>summary').click();p.locator('#idea-detail').fill('Compare two estimates for the same scaled photograph.')
  action(p,'save');assert len(saved(p)['ideaExplorer']['shortlist'])==1;assert saved(p)['project']['idea']==''
  action(p,'use');node(p,'N01');assert saved(p)['project']['idea'].startswith('How could I estimate');assert saved(p)['project']['aim']==''
 run('ideas-save-and-first-adoption',state(),detail)
 def confirm(p):
  before=protect(saved(p));p.locator('#idea-topic').select_option('nature');draft(p);action(p,'use');assert p.locator('#idea-confirm-heading').count()==1;assert protect(saved(p))==before
  action(p,'cancel');assert protect(saved(p))==before;action(p,'use');action(p,'confirm');node(p,'N01')
  s=saved(p);assert s['project']['aim']=='My existing aim';assert s['teacher']['pendingApproval'];assert s['scratch']['introduction']=='My existing introduction'
  assert s['ideaExplorer']['history'][-1]['before']=='My existing topic'
 run('ideas-cancel-and-confirm-existing-plan',state(existing=True),confirm)
 def compare(p):
  p.locator('#idea-topic').select_option('nature')
  for id in ['leaf-outline','branching-pattern','wildlife-observations']:
   p.locator('[data-seed="'+id+'"]').click();action(p,'save');action(p,'browse')
  action(p,'compare');node(p,'N00C');assert p.locator('[data-idea-saved-card]').count()==3
  p.locator('.idea-checks>summary').first.click();p.locator('[data-idea-saved="idea-1"][data-idea-input="access"]').select_option('maybe')
  p.locator('[data-idea-saved="idea-1"][data-idea-input="interest"]').select_option('yes');assert saved(p)['ideaExplorer']['shortlist'][0]['checks']['access']=='maybe'
  p.screenshot(path=str(OUT/'ideas-shortlist-phone.png'),full_page=True,animations='disabled')
  action(p,'use','[data-id="idea-1"]');node(p,'N01');assert saved(p)['planning']['fields']['idea'].startswith('How could I compare')
 run('ideas-three-way-comparison',state(),compare)
 def cap(p):
  p.locator('#idea-topic').select_option('nature')
  for id in ['leaf-outline','branching-pattern','wildlife-observations']:
   p.locator('[data-seed="'+id+'"]').click();action(p,'save');action(p,'browse')
  action(p,'more');p.locator('[data-seed="plant-change"]').click();action(p,'save')
  assert len(saved(p)['ideaExplorer']['shortlist'])==3;assert 'three ideas' in p.locator('#toast').inner_text()
  action(p,'compare');action(p,'remove','[data-id="idea-2"]');assert len(saved(p)['ideaExplorer']['shortlist'])==2
 run('ideas-shortlist-limit-no-silent-replacement',state(),cap)
 def trial(p):
  p.locator('#idea-topic').select_option('nature');draft(p);p.locator('.idea-trial>summary').click()
  p.locator('#idea-trialNote').fill('I checked a scale on my sample image.');p.locator('#idea-trialStatus').select_option('adjust')
  p.locator('.idea-resource-links [data-resource-id="image-scale"]').click();assert p.locator('[data-resource-detail="image-scale"]').count()==1
  p.locator('.resource-library [data-action="resource-close"]').first.click();node(p,'N00B');assert p.locator('#idea-trialNote').input_value().startswith('I checked')
  assert saved(p)['entries']==[];p.screenshot(path=str(OUT/'ideas-leaf-detail-phone.png'),full_page=True,animations='disabled')
 run('ideas-first-step-and-tutorial-return',state(),trial,360,740)
 def own(p):
  p.locator('#idea-topic').select_option('other');p.locator('#idea-focus').fill('Something I noticed on my route');action(p,'own');p.locator('#idea-question').fill('My own initial question');action(p,'save')
  p.locator('#idea-question').fill('My different version');p.locator('.idea-narrow>summary').click();action(p,'save-copy');assert len(saved(p)['ideaExplorer']['shortlist'])==2
 run('ideas-own-topic-and-variations',state(),own)
 def own_comparison(p):
  action(p,'own');node(p,'N00B');p.locator('#idea-question').fill('A possibility entered from comparison');action(p,'save');action(p,'compare');node(p,'N00C');assert p.locator('[data-idea-saved-card]').count()==1
 run('ideas-own-entry-from-comparison',state('N00C'),own_comparison)
 def editing(p):
  p.locator('#idea-topic').select_option('nature');draft(p);action(p,'save');action(p,'compare');action(p,'edit-saved','[data-id="idea-1"]')
  p.locator('#idea-question').fill('My edited leaf question');action(p,'save');assert saved(p)['ideaExplorer']['shortlist'][0]['question']=='My edited leaf question';assert len(saved(p)['ideaExplorer']['shortlist'])==1
  action(p,'angle');action(p,'browse');p.locator('#idea-topic').select_option('nature');draft(p);assert p.locator('#idea-question').input_value()=='My edited leaf question'
 run('ideas-edit-save-and-switch-preserves-draft',state(),editing)
 def legacy(p):
  assert 'Old alternative' in p.locator('#main').inner_text();assert 'Old comparison note' in p.locator('#main').inner_text()
  action(p,'legacy','[data-key="otherIdea1"]');assert saved(p)['project']['idea']=='My existing topic';action(p,'confirm');node(p,'N01');assert saved(p)['project']['idea']=='Old alternative'
  assert saved(p)['planning']['fields']['ideaAccess']=='Old comparison note'
 s=state('N00C',True);s['planning']['fields'].update(otherIdea1='Old alternative',ideaAccess='Old comparison note')
 run('ideas-legacy-notes-safe-selection',s,legacy)
 def backup(p):
  p.locator('#idea-topic').select_option('nature');draft(p);p.locator('.idea-narrow>summary').click();p.locator('#idea-detail').fill('My narrowing note');action(p,'save')
  p.reload(wait_until='networkidle');assert saved(p)['ideaExplorer']['drafts']['leaf-outline']['detail']=='My narrowing note'
  p.locator('[data-action="open-panel"][data-panel="files"]').click()
  with p.expect_download() as download:p.locator('[data-action="export-json"]').click()
  dest=OUT/'ideas-backup.json';download.value.save_as(dest)
  p.once('dialog',lambda d:d.accept());p.locator('#importFile').set_input_files(dest);p.wait_for_timeout(200)
  assert saved(p)['ideaExplorer']['shortlist'][0]['detail']=='My narrowing note'
 run('ideas-full-json-backup-and-restore',state(),backup,1440,1000)
 def focus(p):
  p.locator('#idea-topic').select_option('nature');assert p.evaluate('document.activeElement.id')=='idea-topic'
  p.locator('#idea-focus').focus();p.keyboard.type('My own focus');assert p.evaluate('document.activeElement.id')=='idea-focus'
  draft(p);assert p.evaluate('document.activeElement.id')=='idea-detail-heading';p.locator('#idea-question').focus();p.keyboard.type('Edited: ')
  assert p.evaluate('document.activeElement.id')=='idea-question';action(p,'save');assert p.evaluate('document.activeElement.id')=='idea-save-status'
 run('ideas-keyboard-focus-retention',state(),focus,360,740)
 def no_request(p):
  requests=[];p.on('request',lambda r:requests.append(r.url));p.locator('#idea-topic').select_option('nature');draft(p);p.locator('.idea-narrow>summary').click();p.locator('#idea-detail').fill('<script>not executed</script>');action(p,'save');action(p,'compare');assert not requests,requests
  assert '<script>not executed</script>' in p.locator('#main').inner_text()
 run('ideas-no-external-requests-or-html-injection',state(),no_request)
 def ready_compare(p):
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="unsure"]').click();p.locator('[data-action="plan-advance"]').click();node(p,'N00C');action(p,'keep');node(p,'N01');assert saved(p)['project']['idea']=='My existing topic'
 run('ideas-keep-current-from-comparison',state('N00',True),ready_compare)
 browser.close()
(OUT/'ideas-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));assert all(r['status']=='passed' for r in results)
