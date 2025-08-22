import { test, expect } from '@playwright/test';

/**
 * HONEST TESTING - Let me document exactly what I see step by step
 */

test('Honest manual test with proper login', async ({ page }) => {
  console.log('🎯 HONEST TEST: Starting with demo credentials...');
  
  // Navigate to the application
  await page.goto('/');
  await page.waitForTimeout(3000);
  
  console.log(`📍 URL: ${page.url()}`);
  console.log(`📄 Title: ${await page.title()}`);
  
  // Take initial screenshot
  await page.screenshot({ path: 'honest-test-01-start.png', fullPage: true });
  console.log('📸 Screenshot 1: Initial page');
  
  // Document what we see
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log(`📝 Headings: ${headings.join(' | ')}`);
  
  // Try specific login
  console.log('🔐 Attempting login...');
  
  // Fill email specifically
  const emailField = page.locator('input[type="email"]').first();
  await emailField.fill('demo@demo.com');
  console.log('✅ Email filled');
  
  // Fill password specifically  
  const passwordField = page.locator('input[type="password"]').first();
  await passwordField.fill('demo123');
  console.log('✅ Password filled');
  
  // Click the specific submit button (not Google)
  const submitButton = page.locator('button[type="submit"]').first();
  console.log('🖱️ Clicking submit button...');
  
  await submitButton.click();
  
  // Wait and see what happens
  await page.waitForTimeout(8000);
  
  console.log(`📍 After login URL: ${page.url()}`);
  
  // Take screenshot after login attempt
  await page.screenshot({ path: 'honest-test-02-after-login.png', fullPage: true });
  console.log('📸 Screenshot 2: After login attempt');
  
  // Check if we're logged in by looking for dashboard content
  if (page.url().includes('/app/dashboard') || page.url().includes('/dashboard')) {
    console.log('✅ LOGIN SUCCESS! Now documenting dashboard...');
    
    const dashboardHeadings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`📊 Dashboard headings: ${dashboardHeadings.join(' | ')}`);
    
    // Look for navigation
    const allLinks = await page.locator('a').allTextContents();
    console.log(`🔗 All links (first 15): ${allLinks.slice(0, 15).join(' | ')}`);
    
    const allButtons = await page.locator('button').allTextContents();
    console.log(`🔘 All buttons (first 15): ${allButtons.slice(0, 15).join(' | ')}`);
    
    // Try to find sidebar/navigation
    const sidebarText = await page.locator('nav, .sidebar, .nav').allTextContents();
    console.log(`🧭 Navigation content: ${sidebarText.join(' | ')}`);
    
    // Test specific navigation items by clicking them
    console.log('🧪 Testing navigation clicks...');
    
    const navItems = ['Projects', 'Staff', 'Clients', 'Pole', 'Analytics'];
    
    for (const item of navItems) {
      try {
        const navLink = page.locator(`a:has-text("${item}"), button:has-text("${item}")`).first();
        
        if (await navLink.count() > 0) {
          console.log(`🎯 Testing ${item}...`);
          
          await navLink.click();
          await page.waitForTimeout(3000);
          
          const newUrl = page.url();
          const newHeading = await page.locator('h1, h2, h3').first().textContent();
          
          console.log(`📍 ${item} URL: ${newUrl}`);
          console.log(`📝 ${item} heading: ${newHeading}`);
          
          await page.screenshot({ path: `honest-test-03-${item.toLowerCase()}.png`, fullPage: true });
          console.log(`📸 Screenshot: ${item} page`);
          
          // Go back to dashboard for next test
          await page.goto('/app/dashboard');
          await page.waitForTimeout(2000);
          
        } else {
          console.log(`❌ ${item} navigation not found`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${item}: ${error}`);
      }
    }
    
  } else {
    console.log('❌ LOGIN FAILED - documenting login page state...');
    
    const errorMessages = await page.locator('.error, .alert, [class*="error"]').allTextContents();
    console.log(`⚠️ Error messages: ${errorMessages.join(' | ')}`);
    
    const formState = await page.locator('form').innerHTML();
    console.log(`📋 Form HTML: ${formState.substring(0, 200)}...`);
  }
  
  console.log('🏁 HONEST TEST COMPLETE');
});