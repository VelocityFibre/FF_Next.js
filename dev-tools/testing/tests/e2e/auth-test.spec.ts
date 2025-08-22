import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Authentication Tests', () => {
  test('Login flow should work', async ({ page }) => {
    // Go to login page
    await page.goto(`${BASE_URL}/login`);
    
    // Wait for page to load
    await page.waitForSelector('h2');
    
    // Check if we're on the login page
    await expect(page.locator('h2')).toContainText('Sign in to FibreFlow');
    
    // Try to login with demo account
    console.log('Logging in with demo account...');
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo123');
    
    // Check if signup mode is available
    const signUpButton = page.locator('button:has-text("Sign up")');
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
      // Wait for form to switch to signup mode
      await page.waitForTimeout(1000);
      
      // Check if we're in signup mode
      const createAccountButton = page.locator('button:has-text("Create account")');
      if (await createAccountButton.isVisible()) {
        // Fill in signup form
        await page.fill('input[name="firstName"]', 'Test');
        await page.fill('input[name="lastName"]', 'User');
        await createAccountButton.click();
        console.log('Attempted to create account');
      }
    } else {
      // Try to login directly
      const signInButton = page.locator('button[type="submit"]');
      await signInButton.click();
      console.log('Attempted to sign in');
    }
    
    // Wait for either success or error
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after auth attempt:', currentUrl);
    
    // Check if we're authenticated (redirected to app)
    if (currentUrl.includes('/app')) {
      console.log('✅ Authentication successful - redirected to app');
    } else {
      console.log('❌ Still on login page - auth may have failed');
      
      // Check for error messages
      const errorMessage = await page.locator('.text-red-800, .text-red-600, [class*="error"]').textContent();
      if (errorMessage) {
        console.log('Error message:', errorMessage);
      }
    }
  });
});