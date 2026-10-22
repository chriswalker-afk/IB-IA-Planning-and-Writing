"""Responsive, synthetic acceptance checks for the shared Idea Lab evaluator.
All examples use fake data and device-local state.
"""
import copy,json,os,subprocess,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'))
OUT.mkdir(parents=True,exist_ok=True)
KEY='ia-pathfinder-prototype-v1'
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/')
SCRIPT="import {createProjectState} from './src/core/project-state.js';console.log(JSON.stringify(createProjectState()));"
BASE=json.loads(subprocess.check_output(['node','--input-type=module','-e',SCRIPT]))
RESULTS=[]

def state(node='N00C',previous=False):
 s=copy.deepcopy(BASE)
 s['route']='planning'
 s['planning']['current']=node
 s['journey']['currentNodeId']=node
 if previous:
  s['planning']['fields'].update(idea='Previous investigation',aim='My earlier aim',prediction='My real earlier prediction')
  s['project'].update(idea='Previous investigation',aim='My earlier aim')
  s['scratch']['introduction']='Earlier writing'
  s['teacher']['pendingApproval']=True
 return s

def saved(p):
 return p.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)

def node(p,id):
 assert p.locator('[data-source-node="'+id+'"]').count()==1,('Expected node',id)

def do(p,action,attrs=''):
 p.locator('[data-action="idea-'+action+'"]'+attrs).first.click()

def evaluate(p,aim,clarity=3,quick=4,problems=()):
 p.locator('#idea-question').fill(aim)
 p.locator('#idea-clarity-'+str(clarity)).click()
 p.locator('#idea-quickStart-'+str(quick)).click()
 for name in problems:
  p.locator('[data-idea-difficulty="'+name+'"]').check()

def own(p,aim,clarity=3,quick=4,problems=()):
 do(p,'own')
 assert p.locator('.idea-evaluation').count()==1
 assert p.locator('.idea-map-starter').count()==0
 evaluate(p,aim,clarity,quick,problems)
 do(p,'save')
 node(p,'N00C')

def map_nature(p):
 do(p,'map-open')
 node(p,'N00B')
 p.locator('[data-action="idea-map-root"][data-root="world"]').click()
 p.locator('[data-action="idea-map-topic"][data-topic="nature"]').click()
 p.locator('[data-action="idea-map-leaf"][data-subtopic="Leaves"]').click()
 p.locator('[data-action="idea-explore"][data-seed="leaf-outline"]').click()

def read_error(p):
 return p.locator('#toast').inner_text() if p.locator('#toast').count() else p.locator('body').inner_text()[:100]

with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):
  options['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 def run(label,data,callback,width=390,height=844):
  ctx=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
  ctx.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  p=ctx.new_page()
  p.set_default_timeout(10000)
  errors=[]
  p.on('pageerror',lambda err:errors.append(str(err)))
  p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(data))+');')
  try:
   p.goto(URL,wait_until='networkidle',timeout=22000)
   callback(p)
   assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),p.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
   assert not errors,errors
   RESULTS.append({'test':label,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as ex:
   RESULTS.append({'test':label,'status':'FAILED','error':str(ex),'page_errors':errors,'traceback':traceback.format_exc()})
   traceback.print_exc()
   p.screenshot(path=str(OUT/(label+'-failure.png')),full_page=True,animations='disabled')
  ctx.close()
 
 def direct(p):
  assert p.locator('[data-planning-intro="true"]').is_visible()
  p.locator('[data-action="planning-intro-continue"]').click()
  assert saved(p)['ui']['planningIntroSeen'] is True
  p.locator('[data-choice="planning.fields.ideaStatus"][data-value="yes"]').click()
  p.locator('[data-action="plan-advance"]').click()
  node(p,'N01')
  assert p.locator('.idea-evaluation').count()==0
 run('idea-direct-route-unaffected',state('N00'),direct)

 def map_eval(p):
  map_nature(p)
  node(p,'N00B')
  assert p.locator('text=Something to get you thinking').count()>0
  assert p.locator('[data-idea-input="question"]').count()==1
  assert p.locator('[data-idea-input="detail"]').count()==0
  assert p.locator('.idea-trial').count()==0
  assert p.locator('.idea-maths').count()==0
  assert p.locator('[data-action="idea-rate"]').count()==10
  assert p.locator('[data-idea-difficulty]').count()==5
  assert p.locator('#idea-question').input_value()==''
  do(p,'save')
  assert 'rating' in read_error(p).lower() or 'aim' in read_error(p).lower()
  evaluate(p,'How could I estimate the area of a leaf from a scaled photo?',4,2,['access','maths'])
  p.screenshot(path=str(OUT/'idea-evaluation-desktop.png'),full_page=True,animations='disabled')
  do(p,'save')
  node(p,'N00C')
  entry=saved(p)['ideaExplorer']['shortlist'][0]
  assert entry['clarity']==4 and entry['quickStart']==2
  assert sorted(entry['difficulties'])==['access','maths']
  assert saved(p)['planning']['fields']['aim']==''
 run('idea-map-to-rated-comparison-desktop',state(),map_eval,1440,900)

 def manual(p):
  own(p,'Does waiting time in the school queue vary by day?',3,5,['focus'])
  assert p.locator('[data-idea-saved-card]').count()==1
  assert '3 / 5' in p.locator('[data-idea-saved-card]').inner_text()
  assert '5 / 5' in p.locator('[data-idea-saved-card]').inner_text()
  assert 'too broad' in p.locator('[data-idea-saved-card]').inner_text()
  p.screenshot(path=str(OUT/'idea-comparison-mobile.png'),full_page=True,animations='disabled')
  item=saved(p)['ideaExplorer']['shortlist'][0]
  assert item['fromMap']==False
  do(p,'edit-saved','[data-id="'+item['id']+'"]')
  assert p.locator('.idea-evaluation').count()==1
  p.locator('#idea-clarity-4').click()
  do(p,'save')
  assert saved(p)['ideaExplorer']['shortlist'][0]['clarity']==4
 run('idea-manual-evaluate-and-edit-mobile',state(),manual)

 def reject(p):
  own(p,'What happens to my first measurement?',2,5)
  item=saved(p)['ideaExplorer']['shortlist'][0]
  do(p,'remove','[data-id="'+item['id']+'"]')
  assert len(saved(p)['ideaExplorer']['shortlist'])==0
  assert len(saved(p)['ideaExplorer']['rejected'])==1
  rejected=p.locator('.idea-rejected');assert rejected.get_attribute('open') is None
  rejected.locator('summary').click()
  assert 'Restore idea' in p.locator('.idea-rejected').inner_text()
  do(p,'restore','[data-id="'+item['id']+'"]')
  assert saved(p)['ideaExplorer']['shortlist'][0]['quickStart']==5
  assert saved(p)['ideaExplorer']['shortlist'][0]['question']==item['question']
  assert saved(p)['ideaExplorer']['rejected']==[]
 run('idea-reject-and-restore',state(),reject)

 def choose(p):
  own(p,'What is the relationship between my chosen measurements?',4,4)
  item=saved(p)['ideaExplorer']['shortlist'][0]
  do(p,'use','[data-id="'+item['id']+'"]')
  node(p,'N01')
  rec=saved(p)
  assert rec['planning']['fields']['aim']==item['question']
  assert rec['project']['aim']==item['question']
  assert 'Spark saved' in p.locator('[data-insight-source="N01A"]').inner_text()
 run('idea-selection-creates-original-aim-spark',state(),choose)

 def confirmation(p):
  own(p,'Could a new model answer a different question?',4,2)
  item=saved(p)['ideaExplorer']['shortlist'][0]
  do(p,'use','[data-id="'+item['id']+'"]')
  assert p.locator('#idea-confirm-heading').count()==1
  assert 'My earlier aim' in p.locator('.idea-compare-change').inner_text()
  do(p,'cancel')
  assert saved(p)['planning']['fields']['aim']=='My earlier aim'
  do(p,'use','[data-id="'+item['id']+'"]')
  do(p,'confirm')
  node(p,'N01')
  rec=saved(p)
  assert rec['planning']['fields']['aim']==item['question']
  assert rec['planning']['fields']['prediction']=='My real earlier prediction'
  assert rec['scratch']['introduction']=='Earlier writing'
  assert rec['teacher']['pendingApproval']
 run('idea-previous-aim-confirmation-preserves-work',state(previous=True),confirmation)

 def three(p):
  for i in range(3):
   own(p,'Possible question '+str(i+1)+' about my chosen measurements?',2+i,4)
  assert p.locator('[data-idea-saved-card]').count()==3
  do(p,'own')
  evaluate(p,'A fourth question after my three?',4,4)
  do(p,'save')
  assert len(saved(p)['ideaExplorer']['shortlist'])==3
  assert 'three active ideas' in read_error(p).lower()
 run('idea-three-active-limit-and-draft-safety',state(),three,1280,900)
 browser.close()

(OUT/'ideas-results.json').write_text(json.dumps(RESULTS,indent=2))
print(json.dumps(RESULTS,indent=2))
assert all(x['status']=='passed' for x in RESULTS)
