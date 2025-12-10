import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Receipt Tracker/i);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  // Add navigation tests here
});







