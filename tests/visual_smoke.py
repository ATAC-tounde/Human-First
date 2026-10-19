"""Optional cross-platform browser smoke test (requires Python Playwright + Chromium).

Run after: pip install playwright && python -m playwright install chromium
Does not deploy anything; screenshots remain local and are excluded from Git.
"""
import os
import subprocess
import time
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'artifacts' / 'visual'
OUTPUT.mkdir(parents=True, exist_ok=True)
PORT = int(os.environ.get('VISUAL_TEST_PORT', '4187'))
URL = f'http://127.0.0.1:{PORT}'
proc = subprocess.Popen(
    ['node', 'server/index.mjs'], cwd=str(ROOT),
    env={**os.environ, 'PORT': str(PORT), 'HOST': '127.0.0.1'},
    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
)
try:
    for _ in range(80):
        if proc.poll() is not None:
            raise RuntimeError(f'Node server exited early, code {proc.returncode}')
        try:
            with urlopen(URL + '/api/health', timeout=1) as response:
                if response.status == 200:
                    break
        except OSError:
            time.sleep(.10)
    else:
        raise RuntimeError('Local server did not start in time')

    with sync_playwright() as playwright:
        # By default Playwright uses its bundled Chromium; override only if needed.
        chromium_path = os.environ.get('CHROMIUM_PATH')
        options = {'headless': True}
        if chromium_path:
            options['executable_path'] = chromium_path
        browser = playwright.chromium.launch(**options)
        try:
            fr = browser.new_page(locale='fr-FR', viewport={'width': 1440, 'height': 900})
            fr.goto(URL + '/?lang=fr', wait_until='domcontentloaded')
            fr.get_by_role('button', name='Commencer Cause ou coïncidence ?').wait_for()
            fr.screenshot(path=str(OUTPUT / 'desktop-accueil-fr.png'), full_page=True)
            fr.get_by_label('Je confirme avoir 18 ans ou plus.').check()
            fr.get_by_role('button', name='Commencer Cause ou coïncidence ?').click()
            fr.locator('#attempt').fill('Cela ne prouve pas la causalité.')
            fr.locator('#attempt-button').click()
            fr.locator('#hint-button').click()
            assert fr.locator('.hint-item').count() == 1
            fr.locator('#explanation-button').click()
            fr.locator('#transfer-button').click()
            fr.locator('#transfer-answer').fill('Il faut comparer d’autres villes.')
            fr.locator('#submit-transfer').click()
            assert fr.locator('#finished-view').is_visible()
            fr.screenshot(path=str(OUTPUT / 'desktop-bilan-fr.png'), full_page=True)

            en = browser.new_page(locale='en-US', viewport={'width': 375, 'height': 812})
            en.goto(URL + '/?lang=en', wait_until='domcontentloaded')
            en.get_by_role('button', name='Start Cause or coincidence?').wait_for()
            en.screenshot(path=str(OUTPUT / 'mobile-home-en.png'), full_page=True)
            assert en.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Horizontal overflow on mobile'
            print('PASS: FR exercise, final reflection, EN mobile, screenshots in', OUTPUT)
        finally:
            browser.close()
finally:
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()
