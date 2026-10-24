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
def action(p,name,extra=''):
 # A stale duplicate action can exist inside collapsed help; use the actual
 # interactive control and fail explicitly if the student cannot reach it.
 button=p.locator('[data-action="'+name+'"]'+extra+':visible')
 assert button.count()>0,('No visible action',name,extra)
 button.first.click()
def open_stuck(p):
 # The Help menu is the reliable entry on both desktop and phones.
 # Do not click the first hidden "I am stuck" inside optional tips.
 direct=p.locator('[data-action="open-stuck"]:visible')
 if direct.count():
  direct.first.click()
 else:
  action(p,'open-panel','[data-panel="help"]')
  action(p,'open-stuck')
 assert p.locator('.drawer [data-action="stuck-topic"]').count()>0,'Problem-first help drawer did not open'
def writing_help(p):
 open_stuck(p)
 topic=p.locator('.drawer [data-action="stuck-topic"][data-topic="writing"]').first
 if not topic.is_visible():
  browse=p.locator('.drawer .stuck-legacy-browse')
  assert browse.count(),'Writing help topic is unavailable'
  if browse.first.get_attribute('open') is None:browse.first.locator('summary').first.click()
 topic.click()
 action(p,'stuck-work')
def route(p,origin,target):
 # Four-part writing pages now have their own branch buttons. C96 is reached
 # using the student-facing Help -> Writing route, not the old route footer.
 if origin in ('C40','C50') and target=='C96':
  writing_help(p);return
 cond=next(x['condition'] for x in ROUTES if x['from']==origin and x['to']==target)
 button=p.locator('[data-action="completion-route"][data-condition='+json.dumps(cond)+']').first
 assert button.count(),('The intended navigation is no longer rendered',origin,target,cond)
 if not button.is_visible():
  for details in reversed(button.locator('xpath=ancestor::details[not(@open)]').all()):
   details.locator('summary').first.click()
 assert button.is_visible(),('Route remains hidden',origin,target)
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
  # Source manager is now intentionally inside the optional source/accuracy
  # panel on the first-mathematics introduction screen.
  outer=p.locator('[data-first-maths-source-details]')
  assert outer.count()==1,'Optional source details are missing'
  outer.locator('summary').first.click()
  p.locator('#source-manager > summary').click()
  a=BASE['completion']['sourceRecords'][0]['id']
  action(p,'conformance-source-select','[data-id="'+a+'"]')
  # Selecting a different source refreshes the page and intentionally closes
  # optional disclosure panels. Reopen the relevant section before editing.
  outer=p.locator('[data-first-maths-source-details]')
  if outer.get_attribute('open') is None:outer.locator('summary').first.click()
  assert p.locator('[data-bind="completion.fields.actualMethod"]').is_visible()
  fill(p,'completion.fields.actualMethod','Corrected measured distance definition')
  s=saved(p);assert s['entries'][0]['reviewNeeded']=='yes';assert s['entries'][2]['reviewNeeded']=='yes';assert s['entries'][1].get('reviewNeeded')!='yes';assert s['entries'][3].get('reviewNeeded')!='yes'
  assert s['entries'][0]['interpretation']=='The changing rate matters to the aim'
 run('source-specific-review',state('C20'),source_edit)
 def helper(p):
  writing_help(p);assert_node(p,'C96');assert p.locator('[data-writing-cue]').count()==1
  action(p,'guidance-writing-action','[data-guidance-event="write-now"]');fill(p,'completion.guidanceUi.noteDraft','My own observation explains why this result matters.')
  action(p,'guidance-writing-action','[data-guidance-event="save-note"]')
  route(p,'C96','C34B') if any(x['from']=='C96' and x['to']=='C34B' for x in ROUTES) else action(p,'completion-route','[data-condition="Return to my original stage (with cue status)"]')
  assert_node(p,'C34B');assert p.locator('[data-writing-cue]').count()==0
  ledger=saved(p)['writingLedger'];assert any(x['status']=='noted' and not x['claimedInIA'] for x in ledger.values())
 run('origin-aware-helper',state('C34B',0),helper)
 def waiting(p):
  writing_help(p);assert_node(p,'C96');assert p.locator('[data-writing-cue="W13"]').count()==1
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
  # The first-stage interpretation is already present and is intentionally
  # shown as read-only here; edit its local takeaway instead of a hidden field.
  assert 'The changing rate matters to the aim' in p.locator('#main').inner_text()
  fill(p,'entries.0.localTakeaway','The changing rate helps answer my aim but not establish causation.')
  assert saved(p)['entries'][0]['localTakeaway'].startswith('The changing rate helps')
  assert saved(p)['entries'][0]['interpretation']=='The changing rate matters to the aim'
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
 def citation_draft(p):
  assert p.locator('[data-checking-mla-spotlight]').count()==1
  assert p.locator('[data-checking-mla-spotlight] [data-resource-id="mla-citations"]').count()==1
  p.locator('[data-checking-mla-spotlight] a[href="#checking-audit-draft"]').click()
  card=p.locator('#checking-audit-draft')
  assert card.count()==1 and card.is_visible()
  card.locator('#checking-review-draft-D09 > summary').click()
  audit=card.locator('[data-checking-mla-audit]')
  assert audit.is_visible()
  assert 'Text → Works Cited' in audit.inner_text()
  assert 'Works Cited → text' in audit.inner_text()
  # Merely knowing a page number does not claim a successful source-by-source audit.
  fill(p,'completion.review.records.draft-D09.location','Body pages 3-10 and Works Cited')
  action(p,'conformance-review-status','[data-mode="draft"][data-id="D09"][data-status="checked"]')
  assert saved(p)['completion']['review']['records']['draft-D09']['status']=='unchecked'
  fill(p,'completion.review.records.draft-D09.note','I traced all used external data and methods in both directions, checked their original details and removed one unused saved source.')
  action(p,'conformance-review-status','[data-mode="draft"][data-id="D09"][data-status="checked"]')
  assert saved(p)['completion']['review']['records']['draft-D09']['status']=='checked'
  action(p,'resource-open','[data-resource-id="mla-citations"]')
  assert p.locator('[data-resource-detail="mla-citations"]').count()==1
  assert 'Works Cited' in p.locator('[data-resource-detail="mla-citations"]').inner_text()
  action(p,'close-drawer')
  assert saved(p)['completion']['review']['records']['draft-D09']['status']=='checked'
  assert p.locator('#checking-audit-draft').count()==1
 s=state('C80D');s['route']='checking';s['ui']['checkingMode']='draft'
 for id in ('D09','D12'):
  s['completion']['review']['records']['draft-'+id].update(status='unchecked',location='',note='')
 run('checking-mla-draft-source-audit',s,citation_draft,True)
 def citation_final(p):
  assert p.locator('[data-checking-mla-spotlight]').count()==1
  assert p.locator('#checking-audit-final').count()==1
  assert p.locator('[data-checking-item="D12"]').count()==1
  auth=p.locator('[data-checking-item="D12"]')
  assert auth.locator('[data-status="not-applicable"]').count()==0
  auth.locator('#checking-review-final-D12 > summary').click()
  assert auth.locator('[data-checking-authenticity-audit]').is_visible()
  assert 'AI-generated material' in auth.inner_text()
  action(p,'conformance-review-status','[data-mode="final"][data-id="D12"][data-status="checked"]')
  assert saved(p)['completion']['review']['records']['final-D12']['status']=='unchecked'
  fill(p,'completion.review.records.final-D12.note','I read my completed mathematical analysis and checked all acknowledged assistance and consent-related material in the final document.')
  action(p,'conformance-review-status','[data-mode="final"][data-id="D12"][data-status="checked"]')
  assert saved(p)['completion']['review']['records']['final-D12']['status']=='checked'
  assert saved(p)['completion']['review']['records']['draft-D12']['status']=='unchecked'
  p.reload(wait_until='networkidle')
  assert saved(p)['completion']['review']['records']['final-D12']['status']=='checked'
 s=state('C90F');s['route']='checking';s['ui']['checkingMode']='final';s['ui']['adviceMode']='reduced'
 for mode in ('draft','final'):
  for id in ('D09','D12'):
   s['completion']['review']['records'][mode+'-'+id].update(status='unchecked',location='',note='')
 run('checking-mla-final-authorship',s,citation_final,False)
 def check_order(p):
  first=p.locator('[data-checking-item]').first
  detail=first.locator('.checking-item-details')
  assert not first.locator('.checking-item-actions').is_visible()
  detail.locator('summary').click()
  assert first.locator('.checking-item-actions').is_visible()
  assert first.evaluate("""e=>{
   let p=['.checking-look-for','.checking-evidence-reminder','.field-group','.checking-item-actions'].map(x=>e.querySelector(x));
   return p.every(Boolean)&&p.every((x,i)=>i===0||p[i-1].compareDocumentPosition(x)&Node.DOCUMENT_POSITION_FOLLOWING);
  }""")
  if saved(p)['ui']['checkingMode']=='feedback':
   ys=[p.locator(x).first.bounding_box()['y'] for x in ('.checking-feedback-form','.checking-document-section','.checking-feedback-revisions')]
   assert ys==sorted(ys)
 for mode,mobile in [('draft',True),('feedback',False),('final',True)]:
  s=state('C80D');s['route']='checking';s['ui']['checkingMode']=mode
  run('checking-order-'+mode,s,check_order,mobile)
 def dashboard_order(p):
  assert p.locator('.completion-stage-grid').first.bounding_box()['y']<p.locator('.writer-guide-overview-card').bounding_box()['y']
 for mobile in (True,False):
  s=state('C04')
  run('dashboard-order-'+('phone' if mobile else 'desktop'),s,dashboard_order,mobile)
 browser.close()
(OUT/'results.json').write_text(json.dumps({'results':results,'browser_errors':errors},indent=2));print(json.dumps(results,indent=2));assert all(x['status']=='passed' for x in results)
