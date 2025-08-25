import { test, expect } from '@playwright/test';

/**
 * SIMPLE BROWSER TEST - Basic application access check
 */
test.describe('FibreFlow Simple Browser Test', () => {
  test('Open app homepage and check basic functionality', async ({ page }) => {
    console.log('Testing basic application access...');
    
    try {
      // Navigate to the homepage
      console.log('Navigating to http://localhost:5174/');
      await page.goto('http://localhost:5174/', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      // Take a screenshot of the homepage
      await page.screenshot({ path: 'dev-tools/testing/test-results/homepage-screenshot.png' });
      
      // Check if the page loaded
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      // Check for basic React app indicators
      const reactRoot = await page.locator('#root').count();
      console.log(`React root found: ${reactRoot > 0}`);
      
      // Get page content
      const bodyText = await page.textContent('body');
      console.log(`Page has content: ${(bodyText?.length || 0) > 0}`);
      
      // Check if it's a login page or dashboard
      const hasLoginForm = await page.locator('form').count();
      const hasNavigation = await page.locator('nav').count();
      
      console.log(`Login forms found: ${hasLoginForm}`);
      console.log(`Navigation elements found: ${hasNavigation}`);
      
      // Wait a bit for any async content to load
      await page.waitForTimeout(3000);
      
      // Take another screenshot after waiting
      await page.screenshot({ path: 'dev-tools/testing/test-results/homepage-after-load.png' });
      
      // Check for error messages
      const hasErrors = bodyText?.includes('Error') || bodyText?.includes('404');
      console.log(`Page has error messages: ${hasErrors}`);
      
      // Basic assertion that page loaded
      expect(reactRoot).toBeGreaterThan(0);
      
    } catch (error) {
      console.error(`Error during basic test: ${error}`);
      
      // Take screenshot of error state
      await page.screenshot({ path: 'dev-tools/testing/test-results/error-screenshot.png' });
      
      throw error;
    }
  });

  test('Test navigation to dashboard', async ({ page }) => {
    console.log('Testing dashboard access...');
    
    try {
      // Navigate directly to dashboard
      console.log('Navigating to http://localhost:5174/app/dashboard');
      await page.goto('http://localhost:5174/app/dashboard', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      // Wait for content to potentially load
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({ path: 'dev-tools/testing/test-results/dashboard-screenshot.png' });
      
      // Get basic info
      const title = await page.title();
      const bodyText = await page.textContent('body');
      
      console.log(`Dashboard page title: ${title}`);
      console.log(`Dashboard has content: ${(bodyText?.length || 0) > 0}`);
      
      // Check if we're redirected to login or if dashboard loads
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      const isLoginPage = currentUrl.includes('login') || bodyText?.includes('Login');
      const isDashboard = bodyText?.includes('Dashboard') || bodyText?.includes('dashboard');
      
      console.log(`Is login page: ${isLoginPage}`);
      console.log(`Is dashboard: ${isDashboard}`);
      
    } catch (error) {
      console.error(`Error during dashboard test: ${error}`);
      await page.screenshot({ path: 'dev-tools/testing/test-results/dashboard-error.png' });
      throw error;
    }
  });

  test('Test projects page access', async ({ page }) => {
    console.log('Testing projects page access...');
    
    try {
      // Navigate to projects
      console.log('Navigating to http://localhost:5174/app/projects');
      await page.goto('http://localhost:5174/app/projects', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      // Wait and screenshot
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'dev-tools/testing/test-results/projects-screenshot.png' });
      
      // Get basic info
      const bodyText = await page.textContent('body');
      const currentUrl = page.url();
      
      console.log(`Projects URL: ${currentUrl}`);
      console.log(`Projects has content: ${(bodyText?.length || 0) > 0}`);
      
      const hasProjectContent = bodyText?.includes('Project') || bodyText?.includes('project');
      console.log(`Has project-related content: ${hasProjectContent}`);
      
    } catch (error) {
      console.error(`Error during projects test: ${error}`);
      await page.screenshot({ path: 'dev-tools/testing/test-results/projects-error.png' });
      throw error;
    }
  });
});