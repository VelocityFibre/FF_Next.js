import { test, expect } from '@playwright/test';

/**
 * FIELD OPERATIONS MODULE TESTING
 * Test remaining field operations modules
 */

test.describe('Field Operations Testing', () => {
  const fieldModules = [
    { name: 'Fiber Stringing', url: 'http://localhost:5174/app/fiber-stringing' },
    { name: 'Drops Management', url: 'http://localhost:5174/app/drops' },
    { name: 'Home Installations', url: 'http://localhost:5174/app/installations' },
    { name: 'Pole Capture', url: 'http://localhost:5174/app/pole-capture' },
    { name: 'Communications', url: 'http://localhost:5174/app/communications' },
    { name: 'Meetings', url: 'http://localhost:5174/app/meetings' },
    { name: 'Tasks', url: 'http://localhost:5174/app/tasks' },
    { name: 'Settings', url: 'http://localhost:5174/app/settings' },
  ];

  fieldModules.forEach((module, index) => {
    test(`${index + 1}. ${module.name}`, async ({ page }) => {
      console.log(`\n=== Testing ${module.name} ===`);
      console.log(`URL: ${module.url}`);
      
      try {
        // Navigate to module
        await page.goto(module.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 8000 
        });
        
        // Wait for render
        await page.waitForTimeout(1500);
        
        // Take screenshot
        const screenshotPath = `dev-tools/testing/test-results/${module.name.toLowerCase().replace(/\s/g, '-')}.png`;
        await page.screenshot({ path: screenshotPath });
        
        // Basic checks
        const title = await page.title();
        const bodyText = await page.textContent('body');
        const currentUrl = page.url();
        
        console.log(`Page title: ${title}`);
        console.log(`Current URL: ${currentUrl}`);
        console.log(`Content length: ${bodyText?.length || 0} characters`);
        
        // Check for basic functionality
        const hasError = bodyText?.includes('404') || bodyText?.includes('Not Found') || bodyText?.includes('Error');
        const hasContent = (bodyText?.length || 0) > 100;
        
        console.log(`Has error: ${hasError}`);
        console.log(`Has content: ${hasContent}`);
        
        // Count interactive elements
        const buttons = await page.locator('button').count();
        const links = await page.locator('a').count();
        const forms = await page.locator('form').count();
        
        console.log(`Interactive elements - Buttons: ${buttons}, Links: ${links}, Forms: ${forms}`);
        
        // Determine status
        let status = 'WORKING';
        if (hasError || !hasContent) {
          status = 'BROKEN';
        } else if ((bodyText?.length || 0) < 500 || buttons + links < 10) {
          status = 'PARTIAL';
        }
        
        console.log(`Status: ${status}`);
        
        // Basic assertion that page loads
        expect(title).toContain('FibreFlow');
        expect(bodyText?.length || 0).toBeGreaterThan(0);
        
      } catch (error) {
        console.error(`❌ Error testing ${module.name}: ${error}`);
        await page.screenshot({ path: `dev-tools/testing/test-results/error-${module.name.toLowerCase().replace(/\s/g, '-')}.png` });
        throw error;
      }
    });
  });

  test.afterAll(async () => {
    console.log('\n=== FIELD OPERATIONS TESTING COMPLETE ===');
    console.log('All screenshots saved to: dev-tools/testing/test-results/');
    console.log('Check individual test logs above for detailed status of each module.');
  });
});