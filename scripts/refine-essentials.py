from pathlib import Path

def replace(path, old, new):
    p=Path(path);s=p.read_text();assert s.count(old)==1,(path,old[:60]);p.write_text(s.replace(old,new))

replace('src/essentials/controller.js','  ensure();\n  if(!dialog.open){', '''  ensure();
  // Returning to an existing parent reference must not leave it behind a modal child.
  if(dialog.open && trigger?.closest?.('#exampleDialog'))document.querySelector('#exampleDialog[open] [data-example-close]')?.click();
  if(!dialog.open){''')
replace('src/examples/controller.js','  ensure();\n  const state=getState()', '''  ensure();
  if(dialog.open && trigger?.closest?.('#essentialsDialog'))document.querySelector('#essentialsDialog[open] [data-essentials-close]')?.click();
  const state=getState()''')
replace('data/essentials.css','#bed3cfc7','#bed3c6')

p=Path('scripts/essentials-browser.py');s=p.read_text();anchor=' browser.close()';assert s.count(anchor)==1
s=s.replace(anchor,''' def repeated_reference(p):
  before=stored(p);open_ess(p);tab(p,'rubric');p.locator('.ess-example-links [data-action="example-open"]').first.click()
  p.locator('#exampleDialog .ex-criteria [data-action="essentials-open"]').first.click()
  assert not p.locator('#exampleDialog').is_visible();assert p.locator('#essentialsDialog').evaluate('(n)=>n.contains(document.activeElement)')
  p.keyboard.press('Escape');assert not p.locator('#essentialsDialog').is_visible();assert stored(p)==before
 run('essentials-repeat-reference-without-hidden-dialog',fixture(),repeated_reference,390,844)
 def repeated_example(p):
  before=stored(p);p.locator('.criteria-actions [data-action="example-open"]').click();p.locator('#exampleDialog .ex-criteria [data-action="essentials-open"]').first.click()
  p.locator('.ess-example-links [data-action="example-open"]').first.click();assert not p.locator('#essentialsDialog').is_visible();assert p.locator('#exampleDialog').evaluate('(n)=>n.contains(document.activeElement)')
  p.keyboard.press('Escape');assert not p.locator('#exampleDialog').is_visible();assert stored(p)==before
 run('examples-repeat-reference-without-hidden-dialog',fixture(),repeated_example)
 browser.close()''');p.write_text(s)
replace('scripts/essentials-browser.py',"panel.locator('[data-action=\"essentials-open\"]').click()", "panel.locator('.criteria-actions [data-action=\"essentials-open\"]').click()")
replace('scripts/essentials-browser.py',"panel.locator('[data-action=\"example-open\"]').is_visible()", "panel.locator('.criteria-actions [data-action=\"example-open\"]').is_visible()")
# Old minimal fixtures are normalized on boot. Use the same normalized representation
# so preservation checks compare work, not the addition of empty schema defaults.
replace('scripts/essentials-browser.py','import copy,json,os,traceback','import copy,json,os,traceback,subprocess')
replace('scripts/essentials-browser.py',"BASE=json.loads((OUT/'examples-fixture.json').read_text());KEY='ia-pathfinder-prototype-v1'",'''normalize_js="import {normalizeProjectState} from './src/core/project-state.js';import fs from 'node:fs';console.log(JSON.stringify(normalizeProjectState(JSON.parse(fs.readFileSync(process.argv[1],'utf8')))));"
BASE=json.loads(subprocess.check_output(['node','--input-type=module','-e',normalize_js,str(OUT/'examples-fixture.json')],text=True));KEY='ia-pathfinder-prototype-v1' ''')
