import { test, expect } from '@playwright/test';

test.describe('FibreFlow Application', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FibreFlow/);
  });

  test('should navigate to main sections', async ({ page }) => {
    await page.goto('/');
    
    // Check main navigation elements exist
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

test.describe('Authentication @smoke', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, h2').first()).toContainText(/Sign|Login/i);
  });
});