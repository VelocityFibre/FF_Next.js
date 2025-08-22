import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Projects Page Tests', () => {
  test('Projects page should load without errors', async ({ page }) => {
    // Setup console error listener
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    // Navigate to projects page
    await page.goto(`${BASE_URL}/app/projects`);
    await page.waitForTimeout(2000);
    
    // Check if page loaded
    const currentUrl = page.url();
    const hasErrorBoundary = await page.locator('text=/error|Error|Application Error/i').count();
    
    console.log('Current URL:', currentUrl);
    console.log('Error boundary triggered:', hasErrorBoundary > 0);
    console.log('Console errors:', consoleErrors);
    
    // Assertions
    expect(hasErrorBoundary).toBe(0); // No error boundary should be triggered
    expect(consoleErrors.filter(e => e.includes('charAt'))).toHaveLength(0); // No charAt errors
    
    // Check if projects content is visible
    const hasProjectsContent = await page.locator('text=/Projects|project/i').count();
    expect(hasProjectsContent).toBeGreaterThan(0);
  });
});