#!/usr/bin/env node
import playwright from 'playwright';

async function run() {
  let browser;
  const tryLaunch = async (name) => {
    try {
      console.log(`Attempting to launch ${name}...`);
      const b = await playwright[name].launch();
      console.log(`${name} launched successfully.`);
      return b;
    } catch (err) {
      console.error(`${name} launch failed:`, err && err.message ? err.message : err);
      return null;
    }
  };

  browser = await tryLaunch('chromium');
  if (!browser) browser = await tryLaunch('firefox');
  if (!browser) browser = await tryLaunch('webkit');
  if (!browser) throw new Error('All Playwright browser launches failed');
  const page = await browser.newPage();

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error('[CONSOLE ERROR]', text);
    } else {
      console.log('[CONSOLE]', type, text);
    }
  });

  page.on('pageerror', err => {
    console.error('[PAGE ERROR]', err && err.stack ? err.stack : String(err));
  });

  page.on('requestfailed', req => {
    console.error('[REQUEST FAILED]', req.url(), req.failure() && req.failure().errorText);
  });

  const url = process.env.DEV_SERVER_URL || 'http://127.0.0.1:3000/';
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait to capture lazy-loaded errors
  await page.waitForTimeout(4000);

  console.log('Finished capture — closing browser.');
  await browser.close();
}

run().catch(err => {
  console.error('Script error:', err && err.stack ? err.stack : err);
  process.exit(1);
});
