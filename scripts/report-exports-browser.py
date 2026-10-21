"""Real report downloads from the built, supported static site and (with --live)
GitHub Pages. Raw unbundled JavaScript cannot resolve bare package specifiers
for MathJax and document export and is not a supported export deployment.
Tests use fictional local fixtures only; no student project is transmitted.
"""
import argparse
import functools
import json
import subprocess
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
from pypdf import PdfReader

OUT = Path('qa-output/reports')
OUT.mkdir(parents=True, exist_ok=True)
KEY = 'ia-pathfinder-prototype-v1'
PREFIX = '/IB-IA-Planning-and-Writing/'
LIVE = 'https://chriswalker-afk.github.io' + PREFIX
parser = argparse.ArgumentParser()
parser.add_argument('--live', action='store_true', help='Require successful downloads on the published site')
args = parser.parse_args()
fixture = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', r'''
import {createProjectState} from './src/core/project-state.js';
import {applyPlanningField} from './src/planning/engine.js';
const state=createProjectState();
for(const [key,value] of Object.entries({
 aim:'Fictional export check: how does the radius affect an area?',
 motivation:'This is a browser test, not a student investigation.',
 beneficiary:'My mathematical curiosity',course:'AA SL',kind:'theoretical',
 theoreticalCase:'Compare circles with radii 1, 2 and 3.',
 prediction:String.raw`The relation is \(A=\pi r^{2}\), with \(r\geq 0\).`,
 firstAction:'Compare numerical cases before deriving a relationship.',
 firstAccuracy:'Keep exact values containing pi until the final numerical estimate.'
}))applyPlanningField(state,key,value);
state.scratch.introduction='Original introduction notes must remain unchanged.';
state.scratch.dataNotes=String.raw`First I use \(A=\pi r^{2}\) inside a normal sentence, then analyse it.`;
state.completion.fields.mainConclusion=String.raw`When \(r=2\), the area is \(A=4\pi\).`;
state.entries=[{id:'qa-real-work',status:'completed',result:'Existing work must not be overwritten.',interpretation:String.raw`My own explanation uses \(r^{2}\) for the relationship.`}];
console.log(JSON.stringify(state));
'''], text=True))

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
    def do_GET(self):
        if self.path.startswith(PREFIX):
            self.path = '/' + self.path[len(PREFIX):]
        super().do_GET()

servers = []
if args.live:
    sites = [('published', LIVE)]
else:
    sites = []
    for name, directory, port in [('built', 'dist', 8766)]:
        server = ThreadingHTTPServer(('127.0.0.1', port), functools.partial(QuietHandler, directory=directory))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        servers.append(server)
        sites.append((name, 'http://127.0.0.1:' + str(port) + PREFIX))

def project_content(value):
    if not value:
        return None
    value = json.loads(value)
    value.pop('updatedAt', None)
    value.get('handover', {}).pop('lastExportAt', None)
    return value

results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for name, url in sites:
        for scenario, viewport in [('empty', {'width': 1440, 'height': 960}), ('filled', {'width': 1440, 'height': 960}), ('phone', {'width': 390, 'height': 844})]:
            label = name + '-' + scenario
            context = browser.new_context(accept_downloads=True, viewport=viewport)
            if scenario != 'empty':
                context.add_init_script('localStorage.setItem(' + json.dumps(KEY) + ',' + json.dumps(json.dumps(fixture)) + ');')
            page = context.new_page()
            logs = []
            page.on('console', lambda msg: logs.append({'type': msg.type, 'text': msg.text}))
            page.on('pageerror', lambda err: logs.append({'type': 'pageerror', 'text': str(err)}))
            page.on('requestfailed', lambda req: logs.append({'type': 'requestfailed', 'url': req.url, 'error': req.failure}))
            try:
                page.goto(url, wait_until='networkidle', timeout=45000)
                page.locator('[data-action="open-files"]').first.click()
                before = project_content(page.evaluate('localStorage.getItem(' + json.dumps(KEY) + ')'))
                for fmt in ['pdf', 'docx', 'zip']:
                    item = {'site': label, 'format': 'full-' + fmt}
                    try:
                        with page.expect_download(timeout=45000) as event:
                            page.locator('[data-action="export-full-' + fmt + '"]').first.click()
                        download = event.value
                        target = OUT / (label + '-full-' + fmt + '.' + fmt)
                        download.save_as(str(target))
                        raw = target.read_bytes()
                        assert len(raw) > 2000 and raw.startswith(b'%PDF-' if fmt == 'pdf' else b'PK')
                        assert before == project_content(page.evaluate('localStorage.getItem(' + json.dumps(KEY) + ')'))
                        if scenario != 'empty' and fmt == 'pdf':
                            pdf = PdfReader(str(target))
                            assert sum(len(p.images) for p in pdf.pages) >= 2, 'Full PDF equations were not typeset as images'
                            readable = ' '.join(p.extract_text() or '' for p in pdf.pages)
                            assert 'First I use' in readable and 'then analyse it' in readable, 'Mixed prose disappeared around the equation'
                        if fmt in ['docx', 'zip']:
                            import io, zipfile
                            with zipfile.ZipFile(target) as archive:
                                if fmt == 'zip':
                                    assert 'ia-pathfinder-project.json' in archive.namelist()
                                    assert any(p.endswith('.docx') for p in archive.namelist())
                                    assert any(p.endswith('.pdf') for p in archive.namelist())
                                    restored = json.loads(archive.read('ia-pathfinder-project.json'))
                                    assert restored['route'] == 'home'
                                    if scenario != 'empty':
                                        assert restored['entries'][0]['result'] == 'Existing work must not be overwritten.'
                                    word_name = next(p for p in archive.namelist() if p.endswith('.docx'))
                                    with zipfile.ZipFile(io.BytesIO(archive.read(word_name))) as word:
                                        xml = word.read('word/document.xml').decode()
                                else:
                                    xml = archive.read('word/document.xml').decode()
                                if scenario != 'empty':
                                    with (zipfile.ZipFile(io.BytesIO(archive.read(word_name))) if fmt == 'zip' else zipfile.ZipFile(target)) as word_check:
                                        assert len([n for n in word_check.namelist() if n.startswith('word/media/')])>=2, 'Word equations not embedded'
                                if scenario != 'empty':
                                    assert 'Original introduction notes must remain unchanged.' in xml
                                    assert 'Existing work must not be overwritten.' in xml
                                    assert 'First I use' in xml and 'then analyse it' in xml, 'Word lost the prose next to inline math'
                        item.update(download=download.suggested_filename, bytes=len(raw), state_preserved=True)
                    except Exception as err:
                        item.update(error=str(err), toast=page.locator('#toast').inner_text())
                    results.append(item)
                page.locator('[data-action="go-report"]').first.click()
                before = project_content(page.evaluate('localStorage.getItem(' + json.dumps(KEY) + ')'))
                for fmt in ['pdf', 'docx']:
                    item = {'site': label, 'format': fmt}
                    try:
                        with page.expect_download(timeout=15000) as event:
                            page.locator('[data-action="export-plan-' + fmt + '"]').first.click()
                        download = event.value
                        target = OUT / (label + '-' + fmt + '.' + fmt)
                        download.save_as(str(target))
                        assert not download.failure(), download.failure()
                        raw = target.read_bytes()
                        assert raw.startswith(b'%PDF-' if fmt == 'pdf' else b'PK'), 'Invalid file signature'
                        assert len(raw) > 2000, 'Empty report'
                        after = project_content(page.evaluate('localStorage.getItem(' + json.dumps(KEY) + ')'))
                        assert before == after, 'Export changed student content'
                        if scenario != 'empty' and fmt == 'pdf':
                            pdf=PdfReader(str(target))
                            assert sum(len(p.images) for p in pdf.pages) >= 1, 'Planning PDF did not render its equation'
                        if scenario != 'empty' and fmt == 'docx':
                            import zipfile
                            with zipfile.ZipFile(target) as word:
                                assert any(name.startswith('word/media/') for name in word.namelist()), 'Planning Word equation missing'
                        restored = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', '''
import {readFile} from 'node:fs/promises';
const [fmt,file]=process.argv.slice(1);
const mod=await import('./src/handover/formats/'+fmt+'.js');
const read=fmt==='pdf'?mod.importEmbeddedPdfReport:mod.importEmbeddedDocxReport;
console.log(JSON.stringify(await read(await readFile(file))));
''', fmt, str(target)], text=True))
                        assert restored['planning']['fields']['aim'] == before['planning']['fields']['aim']
                        if scenario != 'empty':
                            assert restored['planning']['fields']['prediction'] == before['planning']['fields']['prediction'], 'Raw editable TeX was not preserved in planning attachment'
                        assert 'Existing work must not be overwritten' not in json.dumps(restored), 'Report must remain planning-only'
                        item.update(download=download.suggested_filename, bytes=len(raw), state_preserved=True, reimport_verified=True)
                    except Exception as err:
                        item.update(error=str(err), toast=page.locator('#toast').inner_text())
                    results.append(item)
                page.screenshot(path=str(OUT / (label + '.png')))
            except Exception as err:
                results.append({'site': label, 'error': str(err)})
            (OUT / (label + '-console.json')).write_text(json.dumps(logs, indent=2))
            print(label, json.dumps(logs, indent=2), flush=True)
            context.close()
    browser.close()
for server in servers:
    server.shutdown()
(OUT / ('live-results.json' if args.live else 'results.json')).write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
assert len(results) == len(sites) * 15
assert all('error' not in row for row in results), 'Report downloads failed'
