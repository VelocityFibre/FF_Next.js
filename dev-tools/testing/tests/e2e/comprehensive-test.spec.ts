import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const LOGIN_EMAIL = 'demo@demo.com';
const LOGIN_PASSWORD = 'demo123';

// Test configuration
test.describe.configure({ mode: 'serial' });

test.describe('FibreFlow Comprehensive Test Suite', () => {
  // Login once at the beginning
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/**', { timeout: 10000 });
    await page.close();
  });

  test('All navigation routes should load without errors', async ({ page }) => {
    // Navigate to main dashboard
    await page.goto(`${BASE_URL}/app`);
    
    const routes = [
      { path: '/app', name: 'Dashboard', expectedText: 'Welcome' },
      { path: '/app/projects', name: 'Projects', expectedText: 'Projects' },
      { path: '/app/pole-tracker', name: 'Pole Tracker', expectedText: 'Pole' },
      { path: '/app/staff', name: 'Staff', expectedText: 'Staff' },
      { path: '/app/contractors', name: 'Contractors', expectedText: 'Contractor' },
      { path: '/app/stock', name: 'Stock', expectedText: 'Stock' },
      { path: '/app/boq', name: 'BOQ', expectedText: 'BOQ' },
      { path: '/app/daily-progress', name: 'Daily Progress', expectedText: 'Progress' },
      { path: '/app/analytics', name: 'Analytics', expectedText: 'Analytics' },
      { path: '/app/meetings', name: 'Meetings', expectedText: 'Meeting' },
      { path: '/app/tasks', name: 'Tasks', expectedText: 'Task' },
      { path: '/app/field-app', name: 'Field App', expectedText: 'Field' },
      { path: '/app/installations', name: 'Installations', expectedText: 'Installation' },
      { path: '/app/communications', name: 'Communications', expectedText: 'Communication' },
      { path: '/app/fiber-stringing', name: 'Fiber Stringing', expectedText: 'Fiber' },
      { path: '/app/settings', name: 'Settings', expectedText: 'Settings' }
    ];

    const results = [];
    
    for (const route of routes) {
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
        
        // Check for console errors
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Wait for content to load
        await page.waitForTimeout(1000);
        
        // Check if expected text is present
        const content = await page.content();
        const hasExpectedText = content.toLowerCase().includes(route.expectedText.toLowerCase());
        
        // Check for error messages
        const hasErrorMessage = content.includes('error') || 
                               content.includes('Error') || 
                               content.includes('failed') ||
                               content.includes('Could not resolve');
        
        results.push({
          route: route.path,
          name: route.name,
          status: hasExpectedText && !hasErrorMessage ? 'PASS' : 'FAIL',
          hasContent: hasExpectedText,
          hasErrors: hasErrorMessage || consoleErrors.length > 0,
          consoleErrors
        });
        
      } catch (error) {
        results.push({
          route: route.path,
          name: route.name,
          status: 'ERROR',
          error: error.message
        });
      }
    }
    
    // Log results
    console.log('\n=== ROUTE TEST RESULTS ===');
    results.forEach(r => {
      const emoji = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${emoji} ${r.name} (${r.route}): ${r.status}`);
      if (r.hasErrors) {
        console.log(`   └─ Has errors: ${r.consoleErrors?.join(', ') || 'UI errors detected'}`);
      }
    });
    
    // Summary
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const errors = results.filter(r => r.status === 'ERROR').length;
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ Passed: ${passed}/${routes.length}`);
    console.log(`❌ Failed: ${failed}/${routes.length}`);
    console.log(`⚠️ Errors: ${errors}/${routes.length}`);
    
    // Assert all routes passed
    expect(failed).toBe(0);
    expect(errors).toBe(0);
  });

  test('Key components should render correctly', async ({ page }) => {
    // Test Pole Tracker
    await page.goto(`${BASE_URL}/app/pole-tracker`);
    await expect(page.locator('text=Pole Tracker')).toBeVisible();
    
    // Test Analytics Dashboard
    await page.goto(`${BASE_URL}/app/analytics`);
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Poles')).toBeVisible();
    
    // Test Field App
    await page.goto(`${BASE_URL}/app/field-app`);
    await expect(page.locator('text=Field App Portal')).toBeVisible();
    await expect(page.locator('text=Device Status')).toBeVisible();
    
    // Test Meetings
    await page.goto(`${BASE_URL}/app/meetings`);
    await expect(page.locator('text=Meetings Management')).toBeVisible();
    
    // Test Communications
    await page.goto(`${BASE_URL}/app/communications`);
    await expect(page.locator('text=Communications Hub')).toBeVisible();
  });

  test('Interactive elements should work', async ({ page }) => {
    // Test navigation menu
    await page.goto(`${BASE_URL}/app`);
    
    // Click on Projects in sidebar
    await page.click('text=Projects');
    await expect(page).toHaveURL(/.*\/projects/);
    
    // Click on Analytics
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/.*\/analytics/);
    
    // Test filter dropdowns in Analytics
    const timeRangeSelect = page.locator('select').first();
    if (await timeRangeSelect.isVisible()) {
      await timeRangeSelect.selectOption('30d');
    }
  });

  test('No Material-UI errors should be present', async ({ page }) => {
    const routesToCheck = [
      '/app/contractors',
      '/app/field-app',
      '/app/analytics',
      '/app/installations',
      '/app/communications',
      '/app/meetings'
    ];
    
    for (const route of routesToCheck) {
      await page.goto(`${BASE_URL}${route}`);
      const content = await page.content();
      
      // Check for Material-UI import errors
      expect(content).not.toContain('@mui/material');
      expect(content).not.toContain('Could not resolve');
      expect(content).not.toContain('Material-UI');
    }
  });

  test('Data loading states should work', async ({ page }) => {
    // Test Analytics loading state
    await page.goto(`${BASE_URL}/app/analytics`);
    
    // Click refresh button if present
    const refreshButton = page.locator('button:has-text("Refresh")');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      // Should show loading indicator briefly
      await page.waitForTimeout(500);
    }
    
    // Data should eventually load
    await expect(page.locator('text=Daily Progress')).toBeVisible({ timeout: 5000 });
  });

  test('Mobile responsive design should work', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/app`);
    
    // Mobile menu should be present
    const mobileMenuButton = page.locator('button[aria-label="Open menu"]').or(page.locator('button:has(svg.lucide-menu)'));
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      // Menu should open
      await page.waitForTimeout(500);
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});