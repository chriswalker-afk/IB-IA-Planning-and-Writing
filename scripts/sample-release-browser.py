"""Check the published chooser and reader against the checked-out release registry.
Disposable browser context only: no real student profile or project is touched.
"""
import json, os, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get('IA_RELEASE_URL', 'https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/')
OUT = Path('qa-output/reports'); OUT.mkdir(parents=True, exist_ok=True)
EXPECTED = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', """
import {SAMPLE_CHOICES,createIllustrativeSample} from './src/core/illustrative-samples.js';
import {illustrativeIAPagesModel} from './src/core/sample-ia-document.js';
console.log(JSON.stringify(SAMPLE_CHOICES.map(s=>({id:s.id,title:s.title,
  figures:illustrativeIAPagesModel(createIllustrativeSample(s.id)).sections.reduce((n,s)=>n+s.figures.length,0)}))));
"""], text=True))
results = []
with sync_playwright() as p:
    options = {'headless': True, 'args': ['--no-sandbox']}
    if os.environ.get('IA_QA_CHROMIUM'):
        options['executable_path'] = os.environ['IA_QA_CHROMIUM']
    browser = p.chromium.launch(**options)
    for width, height in [(1440, 960), (390, 844)]:
        context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
        context.route('https://fonts.googleapis.com/**', lambda r: r.abort())
        page = context.new_page(); page.set_default_timeout(20000)
        errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(URL, wait_until='networkidle')
        page.locator('[data-action="open-demos"]:visible').first.click()
        actual = page.locator('[data-action="load-demo"]').evaluate_all('(els)=>els.map(e=>e.dataset.demo)')
        assert actual == [s['id'] for s in EXPECTED], {'expected': [s['id'] for s in EXPECTED], 'published': actual}
        page.screenshot(path=str(OUT / ('published-sample-chooser-' + str(width) + '.png')))
        for sample in EXPECTED:
            page.locator('[data-demo="' + sample['id'] + '"]').click()
            page.locator('[data-action="sample-read-ia"]:visible').first.click()
            reader = page.locator('.sample-reader'); reader.wait_for()
            assert sample['title'] in reader.inner_text(), sample['id']
            assert reader.locator('[data-sample-figure]').count() == sample['figures'], sample['id']
            assert not reader.locator('.math-preview-invalid,.sample-reader-error').count(), sample['id']
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), sample['id']
            page.locator('[data-action="close-drawer"]:visible').first.click()
            page.locator('[data-action="open-demos"]:visible').first.click()
            results.append({'sample': sample['id'], 'width': width, 'figures': sample['figures'], 'status': 'passed'})
        assert not errors, errors
        context.close()
    browser.close()
(OUT / 'published-samples.json').write_text(json.dumps({'url': URL, 'count': len(EXPECTED), 'results': results}, indent=2))
print(json.dumps({'publishedSamples': len(EXPECTED), 'readerChecks': len(results), 'status': 'passed'}))
