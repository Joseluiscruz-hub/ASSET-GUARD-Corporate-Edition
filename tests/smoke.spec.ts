import { test, expect } from '@playwright/test';

test('smoke: home loads and shows app-root', async ({ page, baseURL }) => {
  await page.goto('/');
  await expect(page.locator('app-root')).toBeVisible({ timeout: 15000 });
  // optional screenshot for review
  await page.screenshot({ path: 'tmp/smoke.png', fullPage: false });
});
