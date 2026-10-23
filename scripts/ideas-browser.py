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
 p.locator('[data-action="idea-map-route"][data-route-id="images"]').click()
 p.locator('[data-action="idea-explore"][data-seed="math-nature-outline"]').click()

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

 # The mind map is a genuinely spatial canvas, not three tiers painted to
 # look organic. Verify its actual in-browser geometry and both starting modes.
 def check_bubbles(p):
  graph=p.locator('[data-idea-map-network]')
  p.wait_for_function("document.querySelector('[data-idea-map-network]')?.dataset.ideaMapReady === 'true'")
  results=p.evaluate("""() => {
   const graph=document.querySelector('[data-idea-map-network]'),r=graph.getBoundingClientRect();
   const nodes=[...graph.querySelectorAll('[data-idea-node]')].map(node=>{
    const b=node.getBoundingClientRect();
    return {id:node.dataset.ideaNode,left:b.left-r.left,top:b.top-r.top,
      right:b.right-r.left,bottom:b.bottom-r.top,cy:b.top+b.height/2};
   });
   return {width:r.width,height:r.height,nodes,
      lines:graph.querySelectorAll('[data-edge-to]').length};
  }""")
  assert results['lines']==len(results['nodes'])-1,results
  assert results['height']>=350,results
  for i,a in enumerate(results['nodes']):
   assert a['left']>=-8 and a['right']<=results['width']+8,('bubble clipped horizontally',a,results)
   assert a['top']>=-8 and a['bottom']<=results['height']+8,('bubble clipped vertically',a,results)
   for b in results['nodes'][i+1:]:
    if a['right']>b['left']+6 and b['right']>a['left']+6 and a['bottom']>b['top']+6 and b['bottom']>a['top']+6:
     raise AssertionError(('overlapping Idea Lab bubbles',a,b))
  return results

 def organic_desktop(p):
  initial=check_bubbles(p)
  roots=[x for x in initial['nodes'] if x['id'].startswith('root-')]
  assert max(x['cy'] for x in roots)-min(x['cy'] for x in roots)>100,'Roots still line up like a hierarchy'
  do(p,'map-root','[data-root="hobbies"]')
  after=check_bubbles(p)
  assert sum(x['id'].startswith('topic-') for x in after['nodes'])==5
  p.screenshot(path=str(OUT/'idea-organic-interests-desktop.png'),full_page=True,animations='disabled')
  do(p,'map-topic','[data-topic="sport"]')
  check_bubbles(p)
  assert p.locator('[data-action="idea-map-route"]').count()==5
  assert p.locator('[data-action="idea-map-leaf"]').count()==0
  do(p,'map-route','[data-route-id="optimisation"]')
  check_bubbles(p)
  assert p.locator('[data-idea-card]').count()>0
  assert 'Where should a player or object be positioned' in p.locator('[data-idea-card]').first.inner_text()
  p.screenshot(path=str(OUT/'idea-organic-expanded-desktop.png'),full_page=True,animations='disabled')
  do(p,'map-mode','[data-mode="data"]')
  assert p.locator('[data-idea-map-network]').get_attribute('data-idea-map-mode')=='data'
  do(p,'map-root','[data-root="record"]')
  do(p,'map-access','[data-branch="survey"]')
  check_bubbles(p)
  assert 'school permission' in p.locator('.idea-map-survey-warning').inner_text()
  assert p.locator('[data-action="idea-map-route"]').count()==3
  do(p,'map-route','[data-route-id="categorical"]')
  check_bubbles(p)
  assert p.locator('[data-seed="evidence-record-survey-categorical"]').count()==1
  assert p.locator('[data-idea-card]').count()>=1
  p.screenshot(path=str(OUT/'idea-organic-data-desktop.png'),full_page=True,animations='disabled')
 run('idea-organic-mindmap-desktop',state('N00B'),organic_desktop,1440,900)

 def organic_mobile(p):
  check_bubbles(p)
  do(p,'map-root','[data-root="hobbies"]')
  check_bubbles(p)
  do(p,'map-topic','[data-topic="sport"]')
  check_bubbles(p)
  do(p,'map-route','[data-route-id="optimisation"]')
  check_bubbles(p)
  p.screenshot(path=str(OUT/'idea-organic-expanded-phone.png'),full_page=True,animations='disabled')
  do(p,'map-mode','[data-mode="data"]')
  do(p,'map-root','[data-root="find"]')
  do(p,'map-access','[data-branch="image"]')
  check_bubbles(p)
  do(p,'map-route','[data-route-id="trajectories"]')
  check_bubbles(p)
  assert p.locator('[data-seed="evidence-find-image-trajectories"]').count()==1
  assert p.locator('.idea-map-root').first.evaluate("(node)=>getComputedStyle(node,'::before').animationName")=='ideaBubbleFloat'
  p.emulate_media(reduced_motion='reduce')
  assert p.locator('.idea-map-root').first.evaluate("(node)=>getComputedStyle(node,'::before').animationName")=='none'
 run('idea-organic-mindmap-mobile',state('N00B'),organic_mobile,390,844)


 def old_map_preserved(p):
  check_bubbles(p)
  assert saved(p)['ideaExplorer']['map']['subtopic']=='Football'
  assert p.locator('.idea-map-legacy-note').is_visible()
  do(p,'map-route','[data-route-id="optimisation"]')
  assert saved(p)['ideaExplorer']['map']['subtopic']=='Football'
  assert saved(p)['ideaExplorer']['map']['mathRoute']=='optimisation'
  do(p,'explore','[data-seed="math-sport-optimise"]')
  assert p.locator('[data-idea-input="question"]').input_value()==''
  assert 'Possible first mathematics' in p.locator('.idea-map-starter').inner_text()
  do(p,'browse')
  assert p.locator('.idea-map-legacy-note').is_visible()
  assert saved(p)['ideaExplorer']['drafts']['sport-trajectory']['question']=='Earlier recorded aim'
 old=state('N00B')
 old['ideaExplorer']['map'].update(mode='interests',root='hobbies',topic='sport',subtopic='Football')
 old['ideaExplorer']['drafts']['sport-trajectory']={'seedId':'sport-trajectory','question':'Earlier recorded aim','clarity':4,'quickStart':4}
 run('idea-legacy-map-selection-remains-unchanged',old,old_map_preserved,390,844)


 # Pass 3: selecting a rated possibility recalls a provisional route at the
 # later mathematics screen. Merely opening it must not select mathematics.
 def idea_to_planning(p):
  note=p.locator('[data-idea-lab-handoff="maths"]')
  assert note.is_visible()
  assert 'Model movement' in note.inner_text()
  assert saved(p)['planning']['routeExplorer']['selectedRoute']==''
  assert saved(p)['planning']['mathSelected']==[]
  assert note.locator('[data-action="plan-toggle-math"]').count()==0
  note.locator('[data-action="math-open-route"][data-route-id="trajectories"]').click()
  assert p.locator('#journey-detail-title').inner_text()=='Movement and trajectories'
  assert saved(p)['planning']['routeExplorer']['selectedRoute']==''
  p.locator('[data-action="math-select-route"][data-route-id="trajectories"]').click()
  assert saved(p)['planning']['routeExplorer']['selectedRoute']=='trajectories'
  assert saved(p)['planning']['mathSelected']==[]
  assert 'explicitly saved' in note.inner_text()
  p.screenshot(path=str(OUT/'idea-planning-handoff.png'),full_page=True,animations='disabled')
  p.locator('[data-action="toggle-advice-mode"]').first.click()
  assert saved(p)['ui']['adviceMode']=='reduced'
  assert note.is_visible()
  assert 'One first calculation' not in note.inner_text()
  assert saved(p)['planning']['routeExplorer']['selectedRoute']=='trajectories'

 handoff=state('N02M')
 handoff['planning']['fields'].update({
  'course':'AI SL','kind':'modelling',
  'aim':'How could I model a ball path using a scaled sporting recording?',
  'idea':'How could I model a ball path using a scaled sporting recording?'
 })
 handoff['ideaExplorer']['shortlist']=[{
  'id':'idea-1','seedId':'math-sport-trajectory',
  'question':handoff['planning']['fields']['aim'],
  'fromMap':True,'clarity':4,'quickStart':3,
  'mapOrigin':{'mode':'interests','root':'hobbies','topic':'sport',
   'dataBranch':'','mathRoute':'trajectories'}
 }]
 handoff['ideaExplorer']['selectedId']='idea-1'
 run('idea-lab-handoff-desktop',handoff,idea_to_planning,1440,900)
 run('idea-lab-handoff-phone',handoff,idea_to_planning,390,844)

 browser.close()

(OUT/'ideas-results.json').write_text(json.dumps(RESULTS,indent=2))
print(json.dumps(RESULTS,indent=2))
assert all(x['status']=='passed' for x in RESULTS)
