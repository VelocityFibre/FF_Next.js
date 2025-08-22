import { test, expect } from '@playwright/test';

/**
 * REAL MANUAL TESTING - Using actual demo credentials
 */

test.describe('Real Manual Browser Testing with Login', () => {
  test('Login with demo credentials and document what I actually see', async ({ page }) => {
    console.log('🌐 Opening browser and navigating to application...');
    
    // Navigate to the application
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    console.log(`📍 Initial URL: ${page.url()}`);
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });
    console.log('📸 Screenshot: Login page');
    
    // Check if we're on login page
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`📝 Headings on login: ${headings.join(', ')}`);
    
    // Try to login with demo credentials
    console.log('🔐 Attempting to login with demo@demo.com / demo123...');
    
    // Look for email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('demo@demo.com');
      console.log('✅ Filled email field');
    } else {
      console.log('❌ Could not find email input field');
    }
    
    // Look for password input
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('demo123');
      console.log('✅ Filled password field');
    } else {
      console.log('❌ Could not find password input field');
    }
    
    // Take screenshot after filling credentials
    await page.screenshot({ path: 'test-results/02-credentials-filled.png', fullPage: true });
    console.log('📸 Screenshot: Credentials filled');
    
    // Try to click sign in button
    const signInButton = page.locator('button[type="submit"], button:has-text("Sign in")');
    if (await signInButton.count() > 0) {
      console.log('🖱️ Clicking sign in button...');
      await signInButton.click();
      
      // Wait for login to process
      await page.waitForTimeout(5000);
      
      console.log(`📍 URL after login attempt: ${page.url()}`);
      
      // Take screenshot after login attempt
      await page.screenshot({ path: 'test-results/03-after-login.png', fullPage: true });
      console.log('📸 Screenshot: After login attempt');
      
    } else {
      console.log('❌ Could not find sign in button');
    }
    
    console.log('🏁 Login attempt complete');
  });

  test('Document the actual dashboard and navigation after successful login', async ({ page }) => {
    console.log('📊 Testing dashboard and navigation...');
    
    // Navigate and login
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Login process
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');
    const signInButton = page.locator('button[type="submit"], button:has-text("Sign in")');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('demo@demo.com');
      await passwordInput.fill('demo123');
      
      if (await signInButton.count() > 0) {
        await signInButton.click();
        await page.waitForTimeout(5000);
        
        console.log(`📍 Post-login URL: ${page.url()}`);
        
        // If we successfully logged in, document what we see
        if (!page.url().includes('/login')) {
          console.log('✅ Successfully logged in!');
          
          // Take full dashboard screenshot
          await page.screenshot({ path: 'test-results/04-dashboard-full.png', fullPage: true });
          console.log('📸 Screenshot: Dashboard');
          
          // Document page structure
          const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
          console.log(`📝 All headings: ${allHeadings.join(' | ')}`);
          
          // Look for navigation menu
          const navElements = await page.locator('nav, .nav, .sidebar, .menu, [role="navigation"]').count();
          console.log(`🧭 Navigation elements found: ${navElements}`);
          
          // Document all clickable links/buttons
          const allLinks = await page.locator('a, button').allTextContents();
          console.log(`🔗 First 20 clickable elements: ${allLinks.slice(0, 20).join(' | ')}`);
          
          // Look for specific dashboard elements
          const statCards = await page.locator('.ff-stat-card, [class*="stat"], [class*="card"]').count();
          console.log(`📊 Stat cards found: ${statCards}`);
          
          // Try to find and click navigation items
          console.log('🧭 Testing navigation menu items...');
          
          const navigationItems = [
            'Projects', 'Staff', 'Clients', 'Pole Tracker', 'Analytics', 
            'Reports', 'Settings', 'Contractors', 'Suppliers'
          ];
          
          for (const item of navigationItems) {
            const navItem = page.locator(`a:has-text("${item}"), button:has-text("${item}")`);
            if (await navItem.count() > 0) {
              console.log(`✅ Found navigation item: ${item}`);
              
              try {
                await navItem.first().click();
                await page.waitForTimeout(3000);
                
                const newUrl = page.url();
                const newHeadings = await page.locator('h1, h2, h3').first().textContent();
                
                console.log(`📍 ${item} page URL: ${newUrl}`);
                console.log(`📝 ${item} page heading: ${newHeadings}`);
                
                await page.screenshot({ path: `test-results/05-${item.toLowerCase().replace(' ', '-')}-page.png`, fullPage: true });
                console.log(`📸 Screenshot: ${item} page`);
                
                // Go back to dashboard
                await page.goto('/app/dashboard');
                await page.waitForTimeout(2000);
                
              } catch (error) {
                console.log(`❌ Error navigating to ${item}: ${error}`);
              }
            } else {
              console.log(`❌ Navigation item not found: ${item}`);
            }
          }
          
        } else {
          console.log('❌ Login failed - still on login page');
        }
      }
    }
    
    console.log('🏁 Real navigation testing complete');
  });
});