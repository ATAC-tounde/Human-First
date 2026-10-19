"""Optional browser-only smoke test for a local LEARN preview.

Requirements: Python Playwright + installed chromium:
    python -m pip install playwright
    python -m playwright install chromium
    python tests/learn_visual_smoke.py

No screenshots or personal text are uploaded anywhere.
"""
from pathlib import Path
import os
import socket
import subprocess
import time
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = ROOT / 'artifacts' / 'learn'
ARTIFACTS.mkdir(parents=True, exist_ok=True)
with socket.socket() as sock:
    sock.bind(('127.0.0.1', 0))
    PORT = sock.getsockname()[1]
SERVER = subprocess.Popen(['node', 'server/index.mjs'], cwd=str(ROOT),
                          env={**os.environ,'PORT':str(PORT), 'HOST':'127.0.0.1'})
try:
    for _ in range(70):
        try:
            with urlopen(f'http://127.0.0.1:{PORT}/api/health', timeout=1) as response:
                if response.status == 200: break
        except Exception:
            time.sleep(.1)
    else:
        raise RuntimeError('Local server is unavailable')
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        desktop = browser.new_page(viewport={'width':1366,'height':900})
        url=f'http://127.0.0.1:{PORT}/learn'
        desktop.goto(url, wait_until='networkidle')
        desktop.locator('.lesson-card').first.wait_for()
        assert desktop.locator('.lesson-card').count() == 6
        desktop.screenshot(path=str(ARTIFACTS / 'desktop.png'), full_page=True)
        desktop.locator('#adult-check').check()
        desktop.locator('.lesson-card .card-button').first.click()
        desktop.locator('#stage-study:not([hidden])').wait_for()
        desktop.locator('#study-next').click()
        desktop.locator('#recall-answer').fill('My own explanation remains in this browser.')
        desktop.locator('#recall-submit').click()
        desktop.locator('#stage-feedback:not([hidden])').wait_for()
        desktop.locator('#feedback-next').click()
        desktop.locator('#apply-answer').fill('I would check evidence, definitions and methods.')
        desktop.locator('#apply-submit').click()
        desktop.locator('#stage-finished:not([hidden])').wait_for()
        assert desktop.locator('#reference-text').inner_text()
        desktop.screenshot(path=str(ARTIFACTS / 'finished.png'), full_page=True)
        mobile=browser.new_page(viewport={'width':375,'height':812})
        mobile.goto(url+'?lang=en',wait_until='networkidle')
        mobile.locator('.lesson-card').first.wait_for()
        mobile.screenshot(path=str(ARTIFACTS / 'mobile.png'), full_page=True)
        assert mobile.evaluate('document.documentElement.scrollWidth') <= 375
        print('PASS: desktop learning journey + EN mobile viewport; images saved in artifacts/learn')
        browser.close()
finally:
    SERVER.terminate()
    try: SERVER.wait(timeout=5)
    except subprocess.TimeoutExpired: SERVER.kill()