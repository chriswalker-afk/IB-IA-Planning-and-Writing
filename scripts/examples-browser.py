"""Read-only example journeys against the production build; synthetic student data only."""
import copy,json,os,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(os.environ.get('IA_QA_OUTPUT','qa-output'));OUT.mkdir(exist_ok=True)
BASE=json.loads((OUT/'examples-fixture.json').read_text());KEY='ia-pathfinder-prototype-v1'
URL=os.environ.get('IA_QA_URL','http://127.0.0.1:8765/');results=[]
def saved(p):return p.evaluate('(k)=>localStorage.getItem(k)',KEY)
def fixture(kind='modelling',node='C10'):
 s=copy.deepcopy(BASE);s['planning']['fields']['kind']=s['project']['kind']=kind;s['completion']['current']=node;return s
def button(p):return p.locator('#main .criteria-actions [data-action="example-open"], #main .ex-prompt [data-action="example-open"]').first
def open_example(p):button(p).click();assert p.locator('#exampleDialog').is_visible()
def close(p):p.locator('#exampleDialog [data-example-close]').click();assert not p.locator('#exampleDialog').is_visible()
def card(p,id):assert p.locator('#exampleDialog [data-example-card="'+id+'"]').count()==1,id
def overflow(p):
 assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
 assert p.locator('#ex-body').evaluate('(n)=>n.scrollWidth <= n.clientWidth+1')
with sync_playwright() as pw:
 options={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('IA_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['IA_CHROMIUM_EXECUTABLE']
 browser=pw.chromium.launch(**options)
 def run(name,s,fn,width=1440,height=1000):
  c=browser.new_context(viewport={'width':width,'height':height});c.route('https://fonts.googleapis.com/**',lambda r:r.abort());p=c.new_page();p.set_default_timeout(10000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.add_init_script('localStorage.setItem('+json.dumps(KEY)+','+json.dumps(json.dumps(s))+');')
  try:
   p.goto(URL,wait_until='networkidle');fn(p);assert not errors,errors;results.append({'test':name,'status':'passed','viewport':f'{width}x{height}'})
  except Exception as e:
   results.append({'test':name,'status':'FAILED','error':str(e),'page_errors':errors});traceback.print_exc();p.screenshot(path=str(OUT/(name+'-failure.png')),full_page=True)
  c.close()
 def introduction(p):
  original=p.locator('[data-bind="scratch.introduction"]').input_value();button(p).scroll_into_view_if_needed();before=saved(p);y=p.evaluate('scrollY');open_example(p);card(p,'EX01');overflow(p)
  assert len(p.locator('.ex-pair').evaluate('(n)=>getComputedStyle(n).gridTemplateColumns').split())==2
  p.screenshot(path=str(OUT/'examples-introduction-desktop.png'));close(p)
  assert p.locator('[data-bind="scratch.introduction"]').input_value()==original;assert saved(p)==before;assert abs(p.evaluate('scrollY')-y)<2
  assert p.evaluate('document.activeElement.dataset.action')=='example-open'
 run('examples-introduction-preserves-work',fixture(),introduction)
 def intro_variant(id):
  def fn(p):
   before=saved(p);open_example(p);card(p,id);close(p);assert saved(p)==before
  return fn
 run('examples-statistical-intro',fixture('statistics'),intro_variant('EX02'),390,844)
 run('examples-theoretical-intro',fixture('theoretical'),intro_variant('EX03'),390,844)
 def graph(p):
  before=saved(p);open_example(p);card(p,'EX10');assert p.locator('#exampleDialog svg[role="img"]').count()==2;overflow(p)
  assert len(p.locator('.ex-pair').evaluate('(n)=>getComputedStyle(n).gridTemplateColumns').split())==1
  p.screenshot(path=str(OUT/'examples-graph-phone.png'));close(p);assert saved(p)==before
 run('examples-phone-graphs',fixture('modelling','C33'),graph,390,844)
 def browse(p):
  before=saved(p);open_example(p);p.locator('[data-example-library]').click();p.locator('[data-example-filter="query"]').fill('conclusion');p.locator('[data-example-filter="kind"]').select_option('theoretical');p.locator('[data-example-select="EX23"]').click();card(p,'EX23');p.locator('[data-example-library]').click();assert p.locator('[data-example-filter="query"]').input_value()=='conclusion';close(p);assert saved(p)==before
 run('examples-library-filter-readonly',fixture(),browse)
 def all_cards(p):
  open_example(p)
  for i in range(1,56):
   id=f'EX{i:02d}';p.locator('[data-example-library]').click();p.locator('[data-example-select="'+id+'"]').click();card(p,id);assert p.locator('.ex-less').inner_text();assert p.locator('.ex-more').inner_text();overflow(p)
   if id in ['EX10','EX12','EX13']:p.screenshot(path=str(OUT/(id+'-desktop.png')))
  close(p)
 run('examples-all-55-rendered',fixture(),all_cards)
 def next_step(p):
  before=saved(p);open_example(p);card(p,'EX16');assert p.locator('#ex-variant').input_value()=='turning';p.locator('#ex-variant').select_option('stop');assert 'make the investigation longer' in p.locator('.ex-more').inner_text();close(p);assert saved(p)==before
 s=fixture('statistics','C35');s['completion'].update(activeEntryIndex=1,scatterDetailForEntryId='earlier');s['completion']['fields']['scatterDetail']='turning'
 run('examples-respect-earlier-selected-result',s,next_step)
 def familiar(p):
  open_example(p);card(p,'EX19');assert p.locator('#ex-variant').input_value()=='syllabus';assert 'omit a textbook-style' in p.locator('.ex-more').inner_text();close(p)
 s=fixture('modelling','C40L');s['completion']['activeEntryIndex']=1
 run('examples-familiar-mathematics',s,familiar)
 def cue(p):
  tools=p.locator('.criteria-writing-tools')
  if tools.count() and not tools.evaluate('(n)=>n.open'):tools.locator('summary').first.click()
  before=saved(p);p.locator('.guidance-writing [data-action="example-open"]').first.click();card(p,'EX01');close(p);assert saved(p)==before
 run('examples-existing-writing-cue',fixture(),cue)
 def nested(p):
  p.locator('[data-action="open-stuck"]').first.click();before=saved(p)
  p.locator('.drawer [data-action="example-open"]').first.click();assert p.locator('#exampleDialog').is_visible();p.keyboard.press('Shift+Tab');assert p.locator('#exampleDialog').evaluate('(n)=>n.contains(document.activeElement)');p.keyboard.press('Escape');assert not p.locator('#exampleDialog').is_visible();assert p.locator('#drawerLayer').is_visible();assert saved(p)==before;p.keyboard.press('Escape');assert not p.locator('#drawerLayer').is_visible()
 run('examples-return-to-parent-help',fixture(),nested,390,844)
 def legacy(p):
  assert p.locator('#main [data-example-card]').count()==1;assert 'What changed?' in p.locator('#main').inner_text()
 run('examples-legacy-introduction-route',fixture('modelling','C10E'),legacy,390,844)
 def planning(p):
  p.locator('.planning-trail-help-toggle').click()
  before=saved(p);open_example(p);card(p,'EX30');assert 'Planning preview' in p.locator('#exampleDialog').inner_text()
  assert 'Provisional IA titles' in p.locator('#exampleDialog').inner_text()
  close(p);assert saved(p)==before
 s=fixture('statistics');s['route']='planning';s['planning']['current']='N01'
 run('examples-planning-is-preview',s,planning,390,844)
 def small(p):
  open_example(p);p.locator('[data-example-library]').click();p.locator('[data-example-select="EX12"]').click();overflow(p);p.screenshot(path=str(OUT/'examples-diagram-small-phone.png'));close(p)
 run('examples-small-phone-diagram',fixture(),small,360,740)
 browser.close()
(OUT/'examples-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));assert all(r['status']=='passed' for r in results)
