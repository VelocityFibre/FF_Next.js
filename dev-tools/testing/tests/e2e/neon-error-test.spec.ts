import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Neon Service Error Tests', () => {
  test('Pages should load without process.env errors', async ({ page }) => {
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
    
    // Test multiple pages that might use neonService
    const pagesToTest = [
      '/app/dashboard',
      '/app/projects',
      '/app/sow-management',
      '/app/procurement',
    ];
    
    for (const pagePath of pagesToTest) {
      console.log(`Testing ${pagePath}...`);
      
      // Clear previous errors
      consoleErrors.length = 0;
      
      // Navigate to page
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForTimeout(2000);
      
      // Check for process errors
      const processErrors = consoleErrors.filter(e => 
        e.includes('process is not defined') || 
        e.includes('ReferenceError: process')
      );
      
      // Check for error boundaries
      const hasErrorBoundary = await page.locator('text=/error|Error|Application Error/i').count();
      
      console.log(`  - Process errors: ${processErrors.length}`);
      console.log(`  - Error boundary triggered: ${hasErrorBoundary > 0}`);
      
      // Assertions
      expect(processErrors).toHaveLength(0);
      expect(hasErrorBoundary).toBe(0);
    }
    
    console.log('✅ All pages load without process.env errors');
  });
});