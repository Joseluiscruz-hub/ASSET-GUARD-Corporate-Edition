import { chromium } from 'playwright';

(async () => {
  // Replace hardcoded URL with environment variable fallback
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
    // Wait for the body to be visible instead of using a fixed timeout
    await page.waitForSelector('body', { state: 'visible' });
  } catch (e) {
    console.error('NAV_ERROR', e);
  } finally {
    await browser.close();
  }
})();
