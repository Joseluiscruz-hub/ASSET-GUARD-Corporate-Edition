import { chromium } from 'playwright';

(async () => {
  const url = process.env.TEST_URL || 'https://joseluiscruz-hub.github.io/asset-guard-corporate-edition/';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log(`PAGE_CONSOLE [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log('PAGE_ERROR', err.stack || err.toString());
  });

  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      console.log(`RESPONSE ${resp.status()} ${resp.url()}`);
    }
  });

  try {
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle' });
    // Wait a bit to let async console errors surface
    await page.waitForTimeout(4000);
  } catch (e) {
    console.error('NAV_ERROR', e);
  } finally {
    await browser.close();
  }
})();
