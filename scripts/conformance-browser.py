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
 def pass3_consequence(p):
  assert_node(p,'C40')
  panel=p.locator('[data-math-validity="speed"] > details')
  assert panel.count()==1 and panel.get_attribute('open') is None,'Expected one closed validity disclosure'
  original=saved(p)
  summary=panel.locator('summary').first
  summary.focus();summary.press('Enter')
  assert panel.get_attribute('open') is not None,'Keyboard could not open consequence help'
  cue=panel.locator('[data-consequential-reflection="speed"]')
  assert cue.count()==1 and cue.is_visible(),'Method-specific reflection missing'
  assert 'one justified change' in cue.inner_text().lower()
  assert cue.locator('[data-action="completion-open"][data-node="C31"]').count()==1
  p.set_viewport_size({'width':320,'height':844})
  no_overflow(p)
  cue.locator('[data-action="completion-open"][data-node="C31"]').click()
  assert_node(p,'C31')
  after=saved(p)
  # Loading a legacy fixture may expand entry schema defaults on the next save.
  # Compare every previously authored value rather than demanding identical
  # internal object shapes before and after project normalisation.
  assert len(after['entries'])==len(original['entries']),'Opening tools changed the number of mathematical stages'
  authored=('id','title','purpose','technique','methodId','kind','status','result',
            'resultRef','observation','observationText','interpretation','localTakeaway',
            'limitations','nextQuestion','nextWhy','bridge','sourceRefs','accuracyRefs',
            'figureRefs','reviewNeeded','reviewReason')
  for index,(before_entry,after_entry) in enumerate(zip(original['entries'],after['entries'])):
   for field in authored:
    if field in before_entry:
     assert after_entry.get(field)==before_entry[field],(
      'Opening tools changed saved mathematical content',index,field,before_entry[field],after_entry.get(field))
  for key in ('provisionalTitle','aim','course','kind'):
   assert after['planning']['fields'].get(key)==original['planning']['fields'].get(key),(
    'Opening tools changed the saved question or course',key)
  p.screenshot(path=str(OUT/'pass3-reflection-tools-320.png'),full_page=True)
 run('pass3-consequence-tool-return',state('C40',2),pass3_consequence,True)

 def pass3_reduced_review(p):
  assert_node(p,'C40')
  aid=p.locator('[data-math-validity="speed"]')
  assert aid.count()==1
  assert aid.get_attribute('class').find('is-reduced')!=-1
  assert aid.locator('details').first.get_attribute('open') is None
  aid.locator('summary').first.click()
  assert aid.locator('[data-consequential-reflection="speed"]').count()==1
  assert 'Genuine' not in aid.locator('[data-consequential-reflection="speed"]').inner_text(),(
   'A cue must not claim to verify the student\'s result')
 s=state('C40',2);s['ui']['adviceMode']='reduced'
 run('pass3-reduced-reflection',s,pass3_reduced_review,True)

 def pass3_unreviewed(p):
  assert_node(p,'C40')
  panel=p.locator('[data-math-validity="speed"] > details')
  panel.locator('summary').first.click()
  assert panel.locator('[data-consequential-reflection]').count()==0
  assert 'flagged for review' in panel.inner_text()
 s=state('C40',2);s['entries'][2]['reviewNeeded']='yes'
 run('pass3-reviewed-result-gate',s,pass3_unreviewed)

 def pass3_conclusion(p):
  assert_node(p,'C60')
  details=p.locator('[data-conclusion-coherence]')
  assert details.count()==1 and details.get_attribute('open') is None
  original=saved(p)
  assert details.locator('textarea').count()==0,'A read-only comparison must not create a writing field'
  details.locator('summary').focus()
  details.locator('summary').press('Enter')
  assert details.get_attribute('open') is not None
  text=details.inner_text()
  for phrase in ['Working draft: Distance and time','How does measured distance relate to time?',
                 'The actual calculated rate changed within the observed interval',
                 'Only this interval has been checked']:
   assert phrase in text,(phrase,text[:450])
  assert p.locator('[data-bind="completion.fields.mainConclusion"]').input_value()==original['completion']['fields']['mainConclusion']
  p.set_viewport_size({'width':320,'height':844})
  no_overflow(p)
  assert saved(p)['completion']['fields']==original['completion']['fields']
  assert saved(p)['entries']==original['entries']
  p.screenshot(path=str(OUT/'pass3-conclusion-coherence-320.png'),full_page=True)
 s=state('C60',2)
 s['planning']['fields']['provisionalTitle']='Working draft: Distance and time'
 s['completion']['fields']['mainConclusion']='The actual calculated rate changed within the observed interval.'
 s['completion']['fields']['conclusionBenefit']='Only this interval has been checked.'
 s['completion']['conclusionResultIds']=['speed']
 run('pass3-conclusion-coherence',s,pass3_conclusion,True)

 def pass4_aa_hl_planning(p):
  assert_node(p,'N02M')
  guide=p.locator('[data-aa-hl-depth="planning"]')
  assert guide.count()==1 and guide.get_attribute('open') is None
  assert p.locator('[data-math-id^="AA"]').count()==0,'AA SL menu cannot be relabelled as AA HL'
  before=saved(p)
  guide.locator('summary').first.focus()
  guide.locator('summary').first.press('Enter')
  assert guide.get_attribute('open') is not None
  for phrase in ('including one taught at SL','not an official AA HL topic list',
                 'Check the values at a join'):
   assert phrase in guide.inner_text(),phrase
  p.set_viewport_size({'width':320,'height':844})
  no_overflow(p)
  assert saved(p)['planning']['fields']['course']==before['planning']['fields']['course']
  assert saved(p)['planning']['fields']['otherCourseMaths']==before['planning']['fields']['otherCourseMaths']
  p.screenshot(path=str(OUT/'pass4-aa-hl-planning-320.png'),full_page=True)
 s=copy.deepcopy(BASE);s['route']='planning';s['planning']['current']='N02M'
 s['planning']['fields'].update(course='AA HL',kind='modelling',
   otherCourseMaths='Original authored mathematical idea')
 s['planning']['routeExplorer']['mode']='all'
 run('pass4-aa-hl-course-planning',s,pass4_aa_hl_planning,True)

 def pass4_aa_hl_piecewise(p):
  assert_node(p,'C40')
  course=p.locator('[data-course-understanding="speed"]')
  validity=p.locator('[data-math-validity="speed"]')
  assert course.count()==1 and validity.count()==1
  assert course.locator('[data-aa-hl-depth="writing"]').count()==1
  assert course.locator('details').first.get_attribute('open') is None
  assert validity.locator('details').first.get_attribute('open') is None
  before=saved(p)
  course.locator('summary').first.focus();course.locator('summary').first.press('Enter')
  assert 'continuity or smoothness' in course.inner_text()
  validity.locator('summary').first.click()
  assert 'one-sided limits' in validity.inner_text()
  assert 'one-sided derivatives' in validity.inner_text()
  assert 'jump or corner may be appropriate' in validity.inner_text()
  assert validity.locator('[data-consequential-reflection="speed"]').count()==1
  p.set_viewport_size({'width':320,'height':844})
  no_overflow(p)
  after=saved(p)
  for field in ('methodId','result','interpretation','limitations','status'):
   assert after['entries'][2][field]==before['entries'][2][field],field
  assert after['planning']['fields']['course']=='AA HL'
  p.screenshot(path=str(OUT/'pass4-piecewise-aa-hl-320.png'),full_page=True)
 s=state('C40',2)
 s['planning']['fields']['course']='AA HL'
 s['entries'][2].update(methodId='piecewise-model',
   result='Actual one-sided limits calculated for the model join',
   interpretation='The observed threshold changes the meaning of the model',
   limitations='The chosen join reflects a documented physical threshold',
   knowledge='syllabus')
 run('pass4-aa-hl-piecewise-stage',s,pass4_aa_hl_piecewise,True)

 def pass4_cohort_welcome(p):
  assert_node(p,'N00')
  text=p.locator('#main').inner_text()
  assert 'updated four-criterion overview' in text
  assert 'Earlier A–E criterion bubbles and self-marks are hidden' in text
  assert 'complete current A–E criteria' not in text
  assert p.locator('.onboarding-criterion-letter').count()==0
  p.set_viewport_size({'width':320,'height':844})
  no_overflow(p)
 s=copy.deepcopy(BASE);s['route']='planning';s['planning']['current']='N00'
 s['planning']['fields']['assessmentFramework']='revised2029'
 run('pass4-2029-planning-welcome',s,pass4_cohort_welcome,True)

 def pass4_cohort_studio(p):
  assert_node(p,'C00')
  text=p.locator('#main').inner_text()
  assert 'updated four-criterion overview' in text
  assert 'old A–E criterion bubbles and self-marks are hidden' in text
  assert 'Green A–E criterion bubbles explain the current' not in text
 s=state('C00');s['planning']['fields']['assessmentFramework']='revised2029'
 run('pass4-2029-writing-welcome',s,pass4_cohort_studio,True)

 def pass4_cohort_final(p):
  assert_node(p,'C90F')
  text=p.locator('#main').inner_text()
  assert 'revised 2029 four-criterion overview' in text
  assert 'Earlier A–E notes are saved but are not 2029 marks' in text
  assert 'Locate genuine evidence for criteria A–E' not in text
  assert p.locator('[data-bind="completion.fields.finalCriteria"]').count()==1
  assert saved(p)['completion']['fields']['finalCriteria']=='Preserved notes from the older A-E draft'
  p.set_viewport_size({'width':320,'height':844})
  no_overflow(p)
 s=state('C90F');s['planning']['fields']['assessmentFramework']='revised2029'
 s['completion']['fields']['finalCriteria']='Preserved notes from the older A-E draft'
 run('pass4-2029-final-review',s,pass4_cohort_final,True)

 browser.close()
(OUT/'results.json').write_text(json.dumps({'results':results,'browser_errors':errors},indent=2));print(json.dumps(results,indent=2));assert all(x['status']=='passed' for x in results)
