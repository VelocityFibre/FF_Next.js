import { test, expect } from '@playwright/test';

test('Quick application test', async ({ page }) => {
  console.log('Starting quick test...');
  
  try {
    // Go to the homepage
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait a bit for the page to load
    await page.waitForTimeout(2000);
    
    // Check if page loaded
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check for any content
    const body = await page.textContent('body');
    const hasContent = body && body.trim().length > 0;
    
    console.log(`Body has content: ${hasContent}`);
    console.log(`Body length: ${body?.length || 0}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'dev-tools/testing/test-results/quick-test.png' });
    
    expect(hasContent).toBeTruthy();
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'dev-tools/testing/test-results/quick-test-error.png' });
    throw error;
  }
});