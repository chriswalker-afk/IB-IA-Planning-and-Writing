"""Focus, progress and safe exploration. Synthetic work only; actual browser storage."""
import copy,json,os,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/');KEY='ia-pathfinder-prototype-v1';PREVIEW='ia-pathfinder-sample-preview-v1'
NEW=json.loads((OUT/'experience-new.json').read_text());OWN=json.loads((OUT/'experience-own.json').read_text());results=[]
def raw(p):return p.evaluate('(k)=>localStorage.getItem(k)',KEY)
def saved(p):return json.loads(raw(p))
def nav(p,to):p.locator('[data-nav="'+to+'"]:visible').first.click()
def action(p,name):p.locator('[data-action="'+name+'"]:visible').first.click()
def shot(p,name):p.wait_for_timeout(400);p.screenshot(path=str(OUT/('experience-'+name+'.png')),full_page=True)
def overflow(p):assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
with sync_playwright() as pw:
 opts={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):opts['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 b=pw.chromium.launch(**opts)
 def run(name,s,fn,width=1440,height=1000,reduced=False):
  c=b.new_context(viewport={'width':width,'height':height},accept_downloads=True,reduced_motion='reduce' if reduced else 'no-preference');c.route('https://fonts.googleapis.com/**',lambda r:r.abort());p=c.new_page();p.set_default_timeout(8000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  if s is not None:p.add_init_script('if(!localStorage.getItem('+json.dumps(KEY)+'))localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle');fn(p);overflow(p);assert not errors,errors;results.append({'test':name,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as e:
   results.append({'test':name,'status':'FAILED','error':str(e),'page_errors':errors});traceback.print_exc();shot(p,name+'-failure')
  c.close()
 def first_task(p):
  action(p,'start-planning')
  assert p.locator('[data-planning-intro="true"]').is_visible()
  assert p.locator('[data-choice="planning.fields.ideaStatus"]').count()==0
  action(p,'planning-intro-continue');assert saved(p)['ui']['planningIntroSeen'] is True
  p.wait_for_timeout(400);first=p.locator('[data-choice="planning.fields.ideaStatus"]').first.bounding_box();h=p.viewport_size['height'];assert first['y']+first['height'] < h-(75 if p.viewport_size['width']<761 else 0),first
  assert p.locator('.task-heading').count()==1
  assert p.locator('.planning-learning-trail').count()==1
  assert p.locator('[data-choice="planning.fields.ideaStatus"]').count()==3
  assert p.locator('.planning-kickoff [data-action="plan-advance"]').is_visible()
  assert p.locator('[data-bind="planning.fields.idea"]').count()==0
  assert p.locator('[data-bind="planning.fields.interest"]').count()==0
  assert p.locator('#main .criteria-panel').count()==0
  assert p.locator('#main .ess-at-glance').count()==0
  assert p.locator('#main .resource-prompt').count()==0
  shot(p,'first-choice-'+str(p.viewport_size['width']))
 for w,h in [(360,740),(390,844),(1440,1000)]:run('first-action-visible-'+str(w),None,first_task,w,h)
 def checkpoint(p):
  p.locator('[data-action="completion-mark"][data-status="complete"]').click();assert 'Introduction marked ready for now' in p.locator('#toast').inner_text();assert saved(p)['completion']['stages']['C10']=='complete'
  action(p,'completion-open');card=p.locator('.completion-stage-card[data-node="C10"]');assert 'Ready for now' in card.inner_text();shot(p,'stage-checkpoint')
  card.click();p.locator('[data-bind="scratch.introduction"]').fill('A useful change to my original notes.');assert saved(p)['completion']['stages']['C10']=='needs-review';assert p.locator('[data-status="needs-review"]').get_attribute('aria-pressed')=='true'
  nav(p,'home');assert 'ready to revisit' in p.locator('.recent-checkpoint').inner_text();action(p,'resume-work');assert p.locator('[data-source-node="C10"]').count()==1
 run('checkpoint-consistency-edit-and-resume',OWN,checkpoint)
 def compact_path(p):
  nav(p,'path');assert p.locator('.journey-chapter[open]').count()==1;assert p.locator('[data-journey-group="setup"]').get_attribute('open') is not None;before=raw(p)
  assert p.locator('.journey-chapter').count()==5
  action(p,'journey-toggle-all');assert p.locator('.journey-chapter[open]').count()==5
  checking=p.locator('[data-journey-group="check"] [data-action="go-checking"]');assert checking.is_visible();assert checking.is_enabled()
  action(p,'journey-toggle-all');assert p.locator('.journey-chapter[open]').count()==0;assert raw(p)==before
  p.locator('[data-journey-group="setup"]>summary').click();shot(p,'compact-path')
 run('unfolding-path-no-locked-stages',OWN,compact_path,390,844)
 def support(p):
  before=raw(p)
  p.locator('[data-writing-examples] > summary').click()
  example=p.locator('[data-writing-examples] [data-action="example-open"]').first
  example.focus();p.keyboard.press('Enter');assert p.locator('#exampleDialog').is_visible()
  p.keyboard.press('Escape');assert example.evaluate('(el)=>el===document.activeElement');assert raw(p)==before
  badge=p.locator('[data-criterion-badge="completing:C10:aim"]')
  badge.focus();p.keyboard.press('Enter');assert p.locator('#criterionBadgeDialog').is_visible()
  p.locator('[data-criterion-badge-rubric="A"]').click();assert p.locator('#essentialsDialog [data-rubric-criterion="A"]').is_visible()
  p.keyboard.press('Escape');assert badge.evaluate('(el)=>el===document.activeElement');assert raw(p)==before
  guide=p.locator('.intro-writing-guide .writer-guide-inline-more')
  guide.click();assert p.locator('.writer-guide-popin').is_visible();p.keyboard.press('Escape')
  assert guide.evaluate('(el)=>el===document.activeElement');assert raw(p)==before
  help_button=p.locator('[data-action="open-panel"][data-panel="help"]:visible').first
  help_button.click();action(p,'resource-browse');assert p.locator('.drawer').is_visible();p.keyboard.press('Escape')
  assert not p.locator('.drawer').count();assert help_button.evaluate('(el)=>el===document.activeElement');assert raw(p)==before
  help_button.click();action(p,'open-stuck');topic=p.locator('.drawer [data-action="stuck-topic"][data-topic="calculation"]');
  if not topic.is_visible():p.locator('.drawer .stuck-legacy-browse > summary').click()
  topic.click();p.locator('.drawer [data-action="resource-browse"]').first.click();p.keyboard.press('Escape');assert p.locator('.drawer').is_visible();assert 'My calculation or software' in p.locator('.drawer').inner_text();p.keyboard.press('Escape');assert not p.locator('.drawer').count();assert help_button.evaluate('(el)=>el===document.activeElement')
 run('consistent-support-return-and-nested-escape',OWN,support,390,844)
 def preview(p):
  nav(p,'home');before=raw(p);action(p,'open-demos');p.locator('[data-demo="standing-reach"]').click();assert p.locator('.sample-preview-banner').is_visible();assert raw(p)==before
  p.locator('[data-action="completion-open"][data-node="C04"]').click();p.locator('.completion-stage-card[data-node="C10"]').click();p.locator('[data-bind="scratch.introduction"]').fill('Changed sample only');p.locator('[data-action="completion-mark"][data-status="complete"]').click();assert raw(p)==before
  p.reload(wait_until='networkidle');assert p.locator('.sample-preview-banner').is_visible();assert p.locator('[data-bind="scratch.introduction"]').input_value()=='Changed sample only';assert raw(p)==before
  action(p,'open-demos');p.locator('[data-demo="tray-optimisation"]').click();assert raw(p)==before;shot(p,'safe-sample-'+str(p.viewport_size['width']));action(p,'leave-preview');assert raw(p)==before;assert p.evaluate('(k)=>sessionStorage.getItem(k)',PREVIEW) is None;action(p,'resume-work');assert p.locator('[data-bind="scratch.introduction"]').input_value()==OWN['scratch']['introduction']
 for w,h in [(390,844),(1440,1000)]:run('preview-edit-switch-reload-return-'+str(w),OWN,preview,w,h)
 def no_project(p):
  assert raw(p) is None;action(p,'open-demos');p.locator('[data-demo="standing-reach"]').click();assert raw(p) is None;action(p,'leave-preview');assert raw(p) is None;assert p.locator('[data-action="start-planning"]').is_visible()
 run('preview-without-creating-a-personal-project',None,no_project,360,740)
 def newer(p):
  nav(p,'home');action(p,'open-demos');p.locator('[data-demo="tray-optimisation"]').click();newer=copy.deepcopy(OWN);newer['project']['aim']=newer['planning']['fields']['aim']='Updated in my other tab';text=json.dumps(newer);p.evaluate('([k,v])=>localStorage.setItem(k,v)',[KEY,text]);action(p,'leave-preview');assert raw(p)==text;assert 'Updated in my other tab' in p.locator('#main').inner_text()
 run('preview-return-keeps-newer-personal-work',OWN,newer)
 def export_preview(p):
  nav(p,'home');before=raw(p);action(p,'open-demos');p.locator('[data-demo="standing-reach"]').click();p.locator('[data-action="open-panel"][data-panel="files"]').first.click();action(p,'import-json');assert 'Return to your investigation' in p.locator('#toast').inner_text()
  with p.expect_download() as download:action(p,'export-json')
  assert download.value.suggested_filename=='ia-pathfinder-sample.json';file=OUT/'sample-preview.json';download.value.save_as(str(file));assert json.loads(file.read_text())['demo']=='standing-reach';assert raw(p)==before;p.keyboard.press('Escape');action(p,'leave-preview');assert raw(p)==before
 run('preview-backup-label-and-import-guard',OWN,export_preview)
 def backup(p):
  p.locator('[data-action="completion-mark"][data-status="complete"]').click();p.locator('[data-action="open-panel"][data-panel="files"]').first.click()
  with p.expect_download() as d:action(p,'export-json')
  file=OUT/'experience-project.json';d.value.save_as(str(file));data=json.loads(file.read_text());assert data['ui']['latestTitle']=='Introduction marked ready for now';assert data['scratch']['introduction']==OWN['scratch']['introduction'];p.keyboard.press('Escape');p.reload(wait_until='networkidle');nav(p,'home');assert p.locator('.recent-checkpoint').is_visible();shot(p,'return-home')
 run('checkpoint-backup-and-return-home',OWN,backup)
 def motion(p):
  assert p.locator('.page').evaluate('(el)=>getComputedStyle(el).animationName')=='none';p.locator('[data-action="completion-mark"][data-status="complete"]').click();durations=p.locator('#toast').evaluate('(el)=>getComputedStyle(el).transitionDuration')
  def seconds(value):
   value=value.strip()
   return float(value[:-2])/1000 if value.endswith('ms') else float(value[:-1]) if value.endswith('s') else float('inf')
  assert durations and all(seconds(v)<0.001 for v in durations.split(',')),f'Reduced-motion toast transition lasted {durations}'
  shot(p,'reduced-motion-phone')
 run('reduced-motion-keeps-static-feedback',OWN,motion,360,740,True)
 b.close()
(OUT/'experience-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));assert all(r['status']=='passed' for r in results)
