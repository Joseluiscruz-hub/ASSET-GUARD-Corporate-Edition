import { test, expect } from '@playwright/test';

test('smoke: home loads and shows app-root', async ({ page, baseURL }) => {
  const localFailures: string[] = [];
  const expectedOrigin = baseURL ? new URL(baseURL).origin : null;

  page.on('response', response => {
    const url = response.url();
    if (expectedOrigin && url.startsWith(expectedOrigin) && response.status() >= 400) {
      localFailures.push(`${response.status()} ${url}`);
    }
  });

  await page.goto(baseURL ?? '/');
  await expect(page.locator('app-root')).toBeVisible({ timeout: 15000 });
  expect(localFailures).toEqual([]);
  // optional screenshot for review
  await page.screenshot({ path: 'tmp/smoke.png', fullPage: false });
});
