"""Exercise the actual bundled PDF and Word download buttons in Chromium."""
import functools
import json
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path('qa-output/reports')
OUT.mkdir(parents=True, exist_ok=True)
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 8766), functools.partial(QuietHandler, directory='dist'))
threading.Thread(target=server.serve_forever, daemon=True).start()
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for name, url in [('built', 'http://127.0.0.1:8766/'), ('published', 'https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/')]:
        context = browser.new_context(accept_downloads=True)
        page = context.new_page()
        logs = []
        downloads = []
        page.on('console', lambda msg: logs.append({'type': msg.type, 'text': msg.text}))
        page.on('pageerror', lambda err: logs.append({'type': 'pageerror', 'text': str(err)}))
        page.on('requestfailed', lambda req: logs.append({'type': 'requestfailed', 'url': req.url, 'error': req.failure}))
        page.on('response', lambda res: logs.append({'type': 'http-error', 'url': res.url, 'status': res.status}) if res.status >= 400 else None)
        try:
            page.goto(url, wait_until='networkidle', timeout=45000)
            page.locator('[data-nav="report"]').first.click()
            page.screenshot(path=str(OUT / (name + '-before.png')))
            for fmt in ['pdf', 'docx']:
                item = {'site': name, 'format': fmt}
                try:
                    with page.expect_download(timeout=20000) as event:
                        page.locator('[data-action="export-plan-' + fmt + '"]').first.click()
                    download = event.value
                    download.save_as(str(OUT / (name + '-' + download.suggested_filename)))
                    item['download'] = download.suggested_filename
                    item['failure'] = download.failure()
                except Exception as err:
                    item['error'] = str(err)
                    item['toast'] = page.locator('#toast').inner_text()
                results.append(item)
            page.screenshot(path=str(OUT / (name + '-after.png')))
        except Exception as err:
            results.append({'site': name, 'error': str(err)})
        (OUT / (name + '-console.json')).write_text(json.dumps(logs, indent=2))
        context.close()
    browser.close()
server.shutdown()
(OUT / 'results.json').write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
assert all('error' not in row and not row.get('failure') for row in results if row['site'] == 'built'), 'Built report downloads failed'
