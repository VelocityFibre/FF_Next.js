import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Route Validation Tests', () => {
  test('All main routes should load successfully', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    
    const routes = [
      { path: '/app', name: 'Dashboard' },
      { path: '/app/projects', name: 'Projects' },
      { path: '/app/pole-tracker', name: 'Pole Tracker' },
      { path: '/app/staff', name: 'Staff' },
      { path: '/app/contractors', name: 'Contractors' },
      { path: '/app/analytics', name: 'Analytics' },
      { path: '/app/meetings', name: 'Meetings' },
      { path: '/app/field-app', name: 'Field App' },
      { path: '/app/installations', name: 'Installations' },
      { path: '/app/communications', name: 'Communications' },
    ];

    const results = [];
    
    for (const route of routes) {
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
        
        const content = await page.content();
        const hasError = content.includes('Could not resolve') || 
                        content.includes('@mui/material') ||
                        content.includes('Error: ');
        
        results.push({
          route: route.name,
          path: route.path,
          status: hasError ? 'FAIL' : 'PASS',
          error: hasError ? 'Material-UI or other error found' : null
        });
        
      } catch (error) {
        results.push({
          route: route.name,
          path: route.path,
          status: 'ERROR',
          error: error.message
        });
      }
    }
    
    // Log results
    console.log('\n=== ROUTE TEST RESULTS ===');
    results.forEach(r => {
      const emoji = r.status === 'PASS' ? '✅' : '❌';
      console.log(`${emoji} ${r.route}: ${r.status}`);
      if (r.error) {
        console.log(`   └─ Error: ${r.error}`);
      }
    });
    
    const passed = results.filter(r => r.status === 'PASS').length;
    console.log(`\n✅ Passed: ${passed}/${routes.length}`);
    
    // Assert no failures
    const failures = results.filter(r => r.status !== 'PASS');
    expect(failures).toHaveLength(0);
  });
});