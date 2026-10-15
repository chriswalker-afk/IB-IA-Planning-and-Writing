import json,copy,traceback,os
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));BASE=json.loads((OUT/'project.json').read_text());ROUTES=json.loads((OUT/'routes.json').read_text());KEY='ia-pathfinder-prototype-v1';URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/')
results=[];errors=[]

def state(node,index=2):
 s=copy.deepcopy(BASE);s['completion']['current']=node;s['completion']['activeEntryIndex']=index;s['completion']['nextFromEntryId']=s['entries'][index]['id'];return s

def saved(p):return p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
def fill(p,path,value):p.locator('[data-bind="'+path+'"]').fill(value)
def choose(p,path,value):p.locator('[data-choice="'+path+'"][data-value="'+value+'"]').click()
def action(p,name,extra=''):p.locator('[data-action="'+name+'"]'+extra).first.click()
def route(p,origin,target):
 cond=next(x['condition'] for x in ROUTES if x['from']==origin and x['to']==target)
 button=p.locator('[data-action="completion-route"][data-condition='+json.dumps(cond)+']').first
 if not button.is_visible():p.locator('.completion-options > summary').click()
 button.click()
def assert_node(p,node):assert p.locator('[data-source-node="'+node+'"]').count()==1,(node,p.locator('#main').inner_text()[:300])
def no_overflow(p):assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),p.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 def run(name,s,fn,mobile=False):
  context=browser.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 1000},accept_downloads=True)
  context.route('https://fonts.googleapis.com/**',lambda r:r.abort())
  p=context.new_page();p.set_default_timeout(8000);local=[];p.on('pageerror',lambda e:local.append(str(e)))
  p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+')) localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle',timeout=20000);fn(p);no_overflow(p);assert not local,local
   results.append({'test':name,'status':'passed','viewport':'phone' if mobile else 'desktop'})
  except Exception as e:
   results.append({'test':name,'status':'FAILED','error':str(e)});traceback.print_exc();p.screenshot(path=str(OUT/(name+'-failure.png')),full_page=True)
  errors.extend(local);context.close()

 def normal(p):
  assert_node(p,'C35');assert p.get_by_role('button',name='After actual PMCC',exact=True).count()==0
 run('method-identity',state('C35',1),normal)
 def curved(p):
  choose(p,'completion.fields.pairedDataType','paired-numerical')
  assert 'Does this curve keep increasing/decreasing' in p.locator('#main').inner_text()
  assert 'Spearman' not in p.locator('#main').inner_text()
  p.locator('[data-bind="completion.fields.scatterDetail"]').select_option('monotonic');assert 'Spearman' in p.locator('#main').inner_text()
  p.locator('[data-bind="completion.fields.scatterDetail"]').select_option('turning');assert 'Spearman' not in p.locator('#main').inner_text()
  p.screenshot(path=str(OUT/'curved-guidance-phone.png'),full_page=True)
 run('curved-confirmation',state('C35B',0),curved,True)
 def inputs(p):
  p.locator('#input-links-accuracy > summary').click()
  assert p.locator('#input-links-accuracy [aria-checked="true"]').count()==2
  action(p,'conformance-input-link','[data-kind="accuracy"][data-id="time"]')
  assert p.locator('#input-links-accuracy').get_attribute('open') is not None
  assert p.evaluate('document.activeElement.dataset.id')=='time'
  assert saved(p)['entries'][2]['accuracyRefs']==['length']
  action(p,'conformance-input-link','[data-kind="accuracy"][data-id="time"]')
  assert set(saved(p)['entries'][2]['accuracyRefs'])=={'length','time'}
  assert 'UNRELATED temperature precision' not in p.locator('#main').inner_text()
  p.reload(wait_until='networkidle');assert set(saved(p)['entries'][2]['accuracyRefs'])=={'length','time'}
  p.screenshot(path=str(OUT/'mathematics-phone.png'),full_page=True)
 run('multi-input-links',state('C40'),inputs,True)
 def source_edit(p):
  p.locator('#source-manager > summary').click();a=BASE['completion']['sourceRecords'][0]['id'];action(p,'conformance-source-select','[data-id="'+a+'"]')
  fill(p,'completion.fields.actualMethod','Corrected measured distance definition')
  s=saved(p);assert s['entries'][0]['reviewNeeded']=='yes';assert s['entries'][2]['reviewNeeded']=='yes';assert s['entries'][1].get('reviewNeeded')!='yes';assert s['entries'][3].get('reviewNeeded')!='yes'
  assert s['entries'][0]['interpretation']=='The changing rate matters to the aim'
 run('source-specific-review',state('C20'),source_edit)
 def helper(p):
  action(p,'completion-open','[data-node="C96"]');assert_node(p,'C96');assert p.locator('[data-writing-cue]').count()==1
  action(p,'guidance-writing-action','[data-guidance-event="write-now"]');fill(p,'completion.guidanceUi.noteDraft','My own observation explains why this result matters.')
  action(p,'guidance-writing-action','[data-guidance-event="save-note"]')
  route(p,'C96','C34B') if any(x['from']=='C96' and x['to']=='C34B' for x in ROUTES) else action(p,'completion-route','[data-condition="Return to my original stage (with cue status)"]')
  assert_node(p,'C34B');assert p.locator('[data-writing-cue]').count()==0
  ledger=saved(p)['writingLedger'];assert any(x['status']=='noted' and not x['claimedInIA'] for x in ledger.values())
 run('origin-aware-helper',state('C34B',0),helper)
 def waiting(p):
  action(p,'completion-open','[data-node="C96"]');assert_node(p,'C96');assert p.locator('[data-writing-cue="W13"]').count()==1
  assert 'PLANS, not results' in p.locator('#main').inner_text()
 s=state('C95D');s['completion']['fields']['dataStatus']='not-started';s['completion']['activeEntryIndex']=-1;s['entries']=[];s['completion']['sourceRecords']=[]
 run('waiting-helper',s,waiting)
 def unfamiliar(p):
  assert p.locator('[data-writing-cue="W60"]').count()==1
  assert p.locator('[data-writing-cue="W26"]').count()==0
  route(p,'C40','C96');assert p.locator('[data-writing-cue="W60"]').count()==1
 s=state('C40');s['entries'][2].update(status='planned',result='',knowledge='outside',methodId='other',technique='An independently researched method')
 run('before-first-unfamiliar-use',s,unfamiliar)
 def review(p):
  assert p.locator('#review-checklist-draft').get_attribute('open') is None
  p.locator('#review-checklist-draft > summary').click();p.locator('#review-draft-D05 > summary').click()
  fill(p,'completion.review.records.draft-D05.location','After Figure 1');fill(p,'completion.review.records.draft-D05.note','Explain the meaning of the curved result.')
  p.locator('[data-bind="completion.review.records.draft-D05.entryId"]').select_option('graph')
  action(p,'conformance-review-status','[data-mode="draft"][data-id="D05"][data-status="needs-work"]')
  action(p,'conformance-review-repair','[data-id="D05"]');assert_node(p,'C34B')
  assert saved(p)['completion']['activeEntryIndex']==0
  fill(p,'entries.0.interpretation','The changing rate helps answer my aim but not establish causation.')
  action(p,'conformance-review-return');assert_node(p,'C80D')
  p.locator('#review-checklist-draft > summary').click();p.locator('#review-draft-D05 > summary').click()
  action(p,'conformance-review-status','[data-mode="draft"][data-id="D05"][data-status="checked"]')
  assert saved(p)['completion']['review']['records']['draft-D05']['status']=='checked'
  p.locator('#review-draft-D05').scroll_into_view_if_needed();p.screenshot(path=str(OUT/'draft-review-phone.png'))
 run('targeted-review-repair',state('C80D'),review,True)
 def feedback(p):
  p.locator('#review-feedback > summary').click();fill(p,'completion.review.feedbackNote','Clarify the stated domain.');fill(p,'completion.review.feedbackAction','Revise the domain beside the equation.');action(p,'conformance-feedback-add')
  assert saved(p)['completion']['review']['feedbackItems'][0]['status']=='recorded'
  action(p,'conformance-feedback-progress','[data-status="implemented"]')
  fill(p,'completion.review.feedbackItems.0.verification','I checked both endpoints and the interpretation against the original data.')
  action(p,'conformance-feedback-progress','[data-status="verified"]')
  assert saved(p)['completion']['review']['feedbackItems'][0]['status']=='verified'
  with p.expect_download() as download:action(p,'export-json')
  file=OUT/'browser-full-backup.json';download.value.save_as(str(file));raw=json.loads(file.read_text());assert raw['completion']['review']['feedbackItems'][0]['status']=='verified'
  p.on('dialog',lambda d:d.accept());p.locator('#importFile').set_input_files(str(file));p.wait_for_timeout(150)
  assert saved(p)['completion']['review']['feedbackItems'][0]['status']=='verified';assert set(saved(p)['entries'][2]['accuracyRefs'])=={'length','time'}
 run('feedback-and-full-backup',state('C80D'),feedback)
 def report(p):
  assert 'My draft and final self-review' in p.locator('#main').inner_text()
  assert 'linked precision inputs' in p.locator('#main').inner_text().lower()
 s=state('C90F');s['route']='report';s['completion']['review']['records']['final-D05']['location']='After the final calculation'
 run('readable-working-report',s,report)
 browser.close()
(OUT/'results.json').write_text(json.dumps({'results':results,'browser_errors':errors},indent=2));print(json.dumps(results,indent=2));assert all(x['status']=='passed' for x in results)
