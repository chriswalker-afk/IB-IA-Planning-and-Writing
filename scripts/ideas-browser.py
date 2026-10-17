"""Synthetic responsive acceptance checks for the branching Idea Lab.
No real student data; no external example-service calls.
"""
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
  s['scratch']['introduction']='My existing introduction';s['teacher']['pendingApproval']=True
 return s
def saved(p):return p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
def action(p,id,extra=''):p.locator('[data-action="idea-'+id+'"]'+extra).first.click()
def node(p,id):assert p.locator('[data-source-node="'+id+'"]').count()==1,(id,p.locator('#main').inner_text()[:150])
def protect(s):return json.dumps([s['project'],s['planning']['fields'],s['planning']['mathSelected'],s['entries'],s['teacher'],s['scratch']],sort_keys=True)
def choose_nature(p,sub='Leaves'):
 root=p.locator('[data-action="idea-map-root"][data-root="world"]')
 if root.get_attribute('aria-pressed')!='true':root.click()
 p.locator('[data-action="idea-map-topic"][data-topic="nature"]').click()
 p.locator('[data-action="idea-map-leaf"][data-subtopic="'+sub+'"]').click()
def draft(p,seed='leaf-outline',auto_fill=True):
 sub={'leaf-outline':'Leaves','branching-pattern':'Leaves','wildlife-observations':'Birds','plant-change':'Plants'}[seed]
 choose_nature(p,sub)
 p.locator('[data-action="idea-explore"][data-seed="'+seed+'"]').click()
 if auto_fill:
  questions={'leaf-outline':'How could I compare the area estimates of a leaf from my garden?',
             'branching-pattern':'How might branching change in a plant I can observe?',
             'wildlife-observations':'How could I compare sightings on two school walks?',
             'plant-change':'How does one measurement of my plant change over two weeks?'}
  p.locator('#idea-question').fill(questions[seed])
with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 def run(name,s,fn,width=390,height=844):
  ctx=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
  ctx.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  p=ctx.new_page();p.set_default_timeout(10000);errors=[];p.on('pageerror',lambda err:errors.append(str(err)))
  p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle',timeout=22000);fn(p)
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),p.evaluate('({w:innerWidth,s:document.documentElement.scrollWidth})')
   assert not errors,errors;results.append({'test':name,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as err:
   results.append({'test':name,'status':'FAILED','error':str(err),'page_errors':errors,'traceback':traceback.format_exc()})
   traceback.print_exc();p.screenshot(path=str(OUT/(name+'-failure.png')),full_page=True,animations='disabled')
  ctx.close()
 def fast(p):
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="yes"]').click()
  p.locator('[data-action="plan-advance"]').click();node(p,'N01')
  assert p.locator('.idea-mindmap').count()==0
  p.locator('[data-bind="planning.fields.provisionalTitle"]').fill('How can I model my chosen activity?')
  assert saved(p)['planning']['fields']['provisionalTitle']=='How can I model my chosen activity?'
 run('ideas-one-idea-fast-route',state('N00'),fast)
 def enter(p):
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="no"]').click()
  p.locator('[data-action="plan-advance"]').click();node(p,'N00B')
  assert p.locator('.idea-mindmap').count()==1
  assert p.locator('[data-action="idea-map-root"]').count()==3
  assert p.locator('[data-action="idea-map-mode"]').count()==2
  assert p.locator('#idea-topic').count()==0
  assert p.locator('text=What makes a promising starting point?').count()==0
  assert p.locator('.idea-map-quickstart').is_visible()
  assert p.locator('.idea-map-connectors path').count()==3
  assert p.locator('[data-action="idea-map-mode"][data-mode="interests"]').get_attribute('aria-pressed')=='true'
 run('ideas-map-welcome',state('N00'),enter,360,740)
 def interest(p):
  before=protect(saved(p));choose_nature(p)
  assert p.locator('[data-idea-card]').count()==3
  assert p.locator('[data-idea-card]').first.get_attribute('data-idea-card')=='leaf-outline'
  assert 'Make it personal' in p.locator('.idea-map-direction-node').first.inner_text()
  assert p.locator('.idea-map-connectors path').count()>=10
  assert p.locator('[data-idea-node="topic-nature"][data-idea-parent="root-world"]').count()==1
  assert p.locator('[data-idea-node="leaf-nature-0"][data-idea-parent="topic-nature"]').count()==1
  assert p.locator('[data-idea-node="seed-leaf-outline"][data-idea-parent="leaf-nature-0"]').count()==1
  p.screenshot(path=str(OUT/'ideas-nature-desktop.png'),full_page=True,animations='disabled')
  p.locator('[data-action="idea-map-leaf"][data-subtopic="Birds"]').click()
  assert p.locator('[data-seed="wildlife-observations"]').count()==1
  assert protect(saved(p))==before
 run('ideas-interest-branch-growth-desktop',state(existing=True),interest,1440,1000)
 def data_map(p):
  before=protect(saved(p))
  p.locator('[data-action="idea-map-mode"][data-mode="data"]').click()
  p.locator('[data-action="idea-map-root"][data-root="record"]').click()
  p.locator('[data-action="idea-map-access"][data-branch="survey"]').click()
  assert 'permission' in p.locator('.idea-map-survey-warning').inner_text()
  assert p.locator('.idea-map-connectors path').count()==9
  p.locator('[data-action="idea-map-root"][data-root="find"]').click()
  p.locator('[data-action="idea-map-access"][data-branch="image"]').click()
  p.locator('[data-action="idea-explore"][data-seed="sport-trajectory"]').click()
  assert p.locator('#idea-question').input_value()==''
  p.locator('#idea-detail').fill('A short permitted video with a known court scale')
  p.locator('#idea-question').fill('How well can a function model one ball flight I recorded?')
  action(p,'save')
  assert saved(p)['ideaExplorer']['shortlist'][0]['fromMap']
  assert protect(saved(p))==before
 run('ideas-data-map-and-privacy-guidance',state(),data_map,390,844)
 def uncompleted(p):
  draft(p,auto_fill=False)
  assert p.locator('#idea-question').input_value()==''
  assert 'QUESTION STARTER' in p.locator('.idea-map-starter').inner_text()
  action(p,'use');assert 'Write a possible direction' in p.locator('#toast').inner_text()
  p.locator('#idea-detail').fill('My actual leaf, a ruler and a photograph')
  p.locator('#idea-question').fill('How can I compare two area estimates for my garden leaf?')
  action(p,'save');assert saved(p)['project']['idea']==''
  action(p,'use');node(p,'N01')
  assert 'garden leaf' in saved(p)['project']['idea']
 run('ideas-unfinished-directions-are-personalised',state(),uncompleted)
 def confirm(p):
  before=protect(saved(p));draft(p);action(p,'use')
  assert p.locator('#idea-confirm-heading').count()==1
  assert protect(saved(p))==before
  action(p,'cancel');assert protect(saved(p))==before
  action(p,'use');action(p,'confirm');node(p,'N01')
  s=saved(p);assert s['project']['aim']=='My existing aim'
  assert s['teacher']['pendingApproval']
  assert s['scratch']['introduction']=='My existing introduction'
  assert s['ideaExplorer']['history'][-1]['before']=='My existing topic'
 run('ideas-existing-plan-asks-before-replacement',state(existing=True),confirm)
 def compare(p):
  for id in ['leaf-outline','branching-pattern','wildlife-observations']:
   draft(p,id);action(p,'save');action(p,'browse')
  action(p,'compare');node(p,'N00C')
  assert p.locator('[data-idea-saved-card]').count()==3
  p.locator('.idea-checks>summary').first.click()
  p.locator('[data-idea-saved="idea-1"][data-idea-input="access"]').select_option('maybe')
  assert saved(p)['ideaExplorer']['shortlist'][0]['checks']['access']=='maybe'
  p.screenshot(path=str(OUT/'ideas-shortlist-phone.png'),full_page=True,animations='disabled')
  action(p,'use','[data-id="idea-1"]');node(p,'N01')
  assert saved(p)['project']['idea'].startswith('How could I compare')
 run('ideas-saved-options-still-work',state(),compare)
 def cap(p):
  for id in ['leaf-outline','branching-pattern','wildlife-observations']:
   draft(p,id);action(p,'save');action(p,'browse')
  draft(p,'plant-change');action(p,'save')
  assert len(saved(p)['ideaExplorer']['shortlist'])==3
  assert 'three ideas' in p.locator('#toast').inner_text()
  action(p,'compare');action(p,'remove','[data-id="idea-2"]')
  assert len(saved(p)['ideaExplorer']['shortlist'])==2
 run('ideas-shortlist-cap-and-removal',state(),cap)
 def trial(p):
  draft(p)
  p.locator('.idea-trial>summary').click()
  p.locator('#idea-trialNote').fill('I checked my photograph scale.')
  p.locator('#idea-trialStatus').select_option('adjust')
  p.locator('.idea-resource-links [data-resource-id="image-scale"]').click()
  assert p.locator('[data-resource-detail="image-scale"]').count()==1
  p.locator('.resource-library [data-action="resource-close"]').first.click()
  node(p,'N00B');assert p.locator('#idea-trialNote').input_value().startswith('I checked')
  assert saved(p)['entries']==[]
 run('ideas-quick-test-and-guide-return',state(),trial,360,740)
 def own(p):
  action(p,'own')
  p.locator('#idea-question').fill('My own initial question');action(p,'save')
  p.locator('#idea-question').fill('My different version');action(p,'save-copy')
  assert len(saved(p)['ideaExplorer']['shortlist'])==2
 run('ideas-own-idea-and-variations',state(),own)
 def own_comparison(p):
  action(p,'own');node(p,'N00B')
  p.locator('#idea-question').fill('A possibility entered from comparison')
  action(p,'save');action(p,'compare');node(p,'N00C')
  assert p.locator('[data-idea-saved-card]').count()==1
 run('ideas-own-idea-from-comparison',state('N00C'),own_comparison)
 def editing(p):
  draft(p);action(p,'save');action(p,'compare');action(p,'edit-saved','[data-id="idea-1"]')
  p.locator('#idea-question').fill('My edited leaf question');action(p,'save')
  assert saved(p)['ideaExplorer']['shortlist'][0]['question']=='My edited leaf question'
  action(p,'browse');draft(p,'branching-pattern');action(p,'browse')
  draft(p,'leaf-outline',auto_fill=False)
  assert p.locator('#idea-question').input_value()=='My edited leaf question'
 run('ideas-edit-and-resume-saved-draft',state(),editing)
 def legacy(p):
  assert 'Old alternative' in p.locator('#main').inner_text()
  action(p,'legacy','[data-key="otherIdea1"]');assert saved(p)['project']['idea']=='My existing topic'
  action(p,'confirm');node(p,'N01')
  assert saved(p)['planning']['fields']['ideaAccess']=='Old comparison note'
 s=state('N00C',True);s['planning']['fields'].update(otherIdea1='Old alternative',ideaAccess='Old comparison note')
 run('ideas-legacy-comparison-safe',s,legacy)
 def backup(p):
  draft(p);p.locator('#idea-detail').fill('My own narrowing note');action(p,'save')
  p.reload(wait_until='networkidle')
  assert saved(p)['ideaExplorer']['drafts']['leaf-outline']['detail']=='My own narrowing note'
  assert saved(p)['ideaExplorer']['map']['root']=='world'
  p.locator('[data-action="open-panel"][data-panel="files"]').click()
  with p.expect_download() as download:p.locator('[data-action="export-json"]').click()
  dest=OUT/'ideas-backup.json';download.value.save_as(dest)
  p.once('dialog',lambda d:d.accept());p.locator('#importFile').set_input_files(dest);p.wait_for_timeout(200)
  assert saved(p)['ideaExplorer']['shortlist'][0]['detail']=='My own narrowing note'
 run('ideas-backup-restores-map-and-draft',state(),backup,1440,1000)
 def focus(p):
  p.locator('[data-action="idea-map-root"][data-root="world"]').click()
  assert p.evaluate('document.activeElement.id')=='idea-map-root-world'
  draft(p,auto_fill=False)
  assert p.evaluate('document.activeElement.id')=='idea-detail-heading'
  p.locator('#idea-question').focus();p.keyboard.type('Edited: ')
  assert p.evaluate('document.activeElement.id')=='idea-question'
  action(p,'save');assert p.evaluate('document.activeElement.id')=='idea-save-status'
 run('ideas-keyboard-focus-mobile',state(),focus,360,740)
 def no_request(p):
  requests=[];p.on('request',lambda r:requests.append(r.url))
  draft(p);p.locator('#idea-detail').fill('<script>not executed</script>')
  action(p,'save');action(p,'compare')
  assert not requests,requests
  assert '<script>not executed</script>' in p.locator('#main').inner_text()
 run('ideas-no-script-injection-or-external-requests',state(),no_request)
 def kept(p):
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="unsure"]').click()
  p.locator('[data-action="plan-advance"]').click();node(p,'N00C')
  action(p,'keep');node(p,'N01')
  assert saved(p)['project']['idea']=='My existing topic'
 run('ideas-existing-comparison-keeps-topic',state('N00',True),kept)
 browser.close()
(OUT/'ideas-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert all(r['status']=='passed' for r in results)

