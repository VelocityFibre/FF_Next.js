import { test, expect } from '@playwright/test';

/**
 * LIVE MANUAL TESTING - Document exactly what I see in the browser
 */

test.describe('Live Manual Browser Testing', () => {
  test('Document what I actually see when opening the application', async ({ page }) => {
    console.log('🌐 Opening browser and navigating to application...');
    
    // Navigate to the application
    await page.goto('/');
    await page.waitForTimeout(3000); // Wait to see what actually loads
    
    // Take a screenshot of what we actually see
    await page.screenshot({ path: 'live-test-homepage.png', fullPage: true });
    console.log('📸 Screenshot taken of homepage');
    
    // Document what we see on the page
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // Check what's actually visible
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`📝 Headings found: ${headings.join(', ')}`);
    
    // Check for navigation elements
    const navElements = await page.locator('nav, [role="navigation"], .nav, .sidebar, .menu').count();
    console.log(`🧭 Navigation elements found: ${navElements}`);
    
    // Check for any menu items
    const menuItems = await page.locator('a, button').allTextContents();
    console.log(`🔗 First 10 clickable elements: ${menuItems.slice(0, 10).join(', ')}`);
    
    // Wait for user to see what's happening
    await page.waitForTimeout(5000);
    
    // Try to find and document the main navigation
    console.log('🔍 Looking for main navigation menu...');
    
    // Common navigation selectors
    const possibleNavs = [
      'nav',
      '.navigation', 
      '.nav',
      '.sidebar',
      '.menu',
      '[role="navigation"]',
      'header nav',
      '.app-nav'
    ];
    
    for (const selector of possibleNavs) {
      const navCount = await page.locator(selector).count();
      if (navCount > 0) {
        console.log(`✅ Found navigation with selector: ${selector} (${navCount} elements)`);
        const navText = await page.locator(selector).first().textContent();
        console.log(`📋 Navigation content: ${navText?.substring(0, 200)}...`);
      }
    }
    
    // Document the current URL
    console.log(`🌍 Current URL: ${page.url()}`);
    
    // Take another screenshot after investigation
    await page.screenshot({ path: 'live-test-after-investigation.png', fullPage: true });
    
    console.log('🏁 Live manual test documentation complete');
  });

  test('Test actual navigation by clicking menu items', async ({ page }) => {
    console.log('🖱️ Testing actual navigation clicks...');
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'navigation-test-start.png', fullPage: true });
    
    // Find all clickable navigation elements
    const clickableElements = await page.locator('a, button').all();
    console.log(`🎯 Found ${clickableElements.length} clickable elements`);
    
    // Try clicking first few navigation items
    for (let i = 0; i < Math.min(5, clickableElements.length); i++) {
      try {
        const element = clickableElements[i];
        const text = await element.textContent();
        
        if (text && text.trim() && text.length < 50) {
          console.log(`🖱️ Attempting to click: "${text.trim()}"`);
          
          await element.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          console.log(`📍 After click, URL: ${newUrl}`);
          
          // Take screenshot of result
          await page.screenshot({ path: `navigation-click-${i}.png`, fullPage: true });
          
          // Check if page actually changed/loaded
          const newHeadings = await page.locator('h1, h2, h3').allTextContents();
          console.log(`📝 New page headings: ${newHeadings.slice(0, 3).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ Error clicking element ${i}: ${error}`);
      }
    }
    
    console.log('🏁 Navigation click testing complete');
  });
});