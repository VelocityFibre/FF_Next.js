import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5173';
const LOGIN_EMAIL = 'demo@demo.com';
const LOGIN_PASSWORD = 'demo123';

// All navigation routes to test
const routes = [
  // MAIN Section
  { path: '/app/dashboard', label: 'Dashboard', section: 'MAIN' },
  { path: '/app/meetings', label: 'Meetings', section: 'MAIN' },
  { path: '/app/action-items', label: 'Action Items', section: 'MAIN' },
  
  // PROJECT MANAGEMENT Section
  { path: '/app/projects', label: 'Projects', section: 'PROJECT MANAGEMENT' },
  { path: '/app/pole-capture', label: 'Pole Capture', section: 'PROJECT MANAGEMENT' },
  { path: '/app/fiber-stringing', label: 'Fiber Stringing', section: 'PROJECT MANAGEMENT' },
  { path: '/app/drops', label: 'Drops Management', section: 'PROJECT MANAGEMENT' },
  { path: '/app/sow-management', label: 'SOW Management', section: 'PROJECT MANAGEMENT' },
  { path: '/app/installations', label: 'Home Installations', section: 'PROJECT MANAGEMENT' },
  { path: '/app/tasks', label: 'Task Management', section: 'PROJECT MANAGEMENT' },
  { path: '/app/daily-progress', label: 'Daily Progress', section: 'PROJECT MANAGEMENT' },
  
  // PEOPLE & MANAGEMENT Section
  { path: '/app/clients', label: 'Clients', section: 'PEOPLE & MANAGEMENT' },
  { path: '/app/staff', label: 'Staff', section: 'PEOPLE & MANAGEMENT' },
  
  // CONTRACTORS & SUPPLIERS Section
  { path: '/app/contractors', label: 'Contractors Portal', section: 'CONTRACTORS & SUPPLIERS' },
  { path: '/app/suppliers', label: 'Suppliers', section: 'CONTRACTORS & SUPPLIERS' },
  
  // ANALYTICS Section
  { path: '/app/analytics', label: 'Analytics Dashboard', section: 'ANALYTICS' },
  { path: '/app/enhanced-kpis', label: 'Enhanced KPIs', section: 'ANALYTICS' },
  { path: '/app/kpi-dashboard', label: 'KPI Dashboard', section: 'ANALYTICS' },
  { path: '/app/reports', label: 'Reports', section: 'ANALYTICS' },
  
  // COMMUNICATIONS Section
  { path: '/app/communications', label: 'Communications Portal', section: 'COMMUNICATIONS' },
  
  // FIELD OPERATIONS Section
  { path: '/app/field', label: 'Field App Portal', section: 'FIELD OPERATIONS' },
  { path: '/app/onemap', label: 'OneMap Data Grid', section: 'FIELD OPERATIONS' },
  { path: '/app/nokia-equipment', label: 'Nokia Equipment', section: 'FIELD OPERATIONS' },
  
  // SYSTEM Section
  { path: '/app/settings', label: 'Settings', section: 'SYSTEM' },
];

test.describe('FibreFlow Navigation Tests', () => {
  test('Test all navigation routes', async ({ page }) => {
    // First, login
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/login`);
    
    // Wait for login form to be ready
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    // Perform login
    await page.fill('input[type="email"]', LOGIN_EMAIL);
    await page.fill('input[type="password"]', LOGIN_PASSWORD);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    try {
      await page.waitForURL('**/app/dashboard', { timeout: 10000 });
      console.log('✅ Login successful');
    } catch (e) {
      console.log('❌ Login failed');
      // Take screenshot of login failure
      await page.screenshot({ path: 'screenshots/login-failure.png' });
      throw new Error('Failed to login');
    }
    
    const results = [];
    
    // Test each route
    for (const route of routes) {
      console.log(`\nTesting: ${route.label} (${route.path})`);
      
      let status = 'UNKNOWN';
      let error = null;
      
      try {
        // Navigate to the route
        await page.goto(BASE_URL + route.path, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        // Wait a bit for React to render
        await page.waitForTimeout(1000);
        
        // Check for error indicators
        const pageContent = await page.content();
        
        if (pageContent.includes('Unexpected Application Error')) {
          status = 'ERROR';
          
          // Get specific error message
          if (pageContent.includes('Could not resolve "@mui/material')) {
            error = 'Material-UI import error';
            console.log('  ❌ Material-UI import error');
          } else if (pageContent.includes('Cannot read properties')) {
            error = 'Runtime error - undefined property';
            console.log('  ❌ Runtime error');
          } else {
            error = 'Unknown application error';
            console.log('  ❌ Unknown error');
          }
          
          // Take screenshot of error
          await page.screenshot({ 
            path: `screenshots/error-${route.path.replace(/\//g, '-')}.png`,
            fullPage: false 
          });
        } else if (pageContent.includes('404') || pageContent.includes('Page not found')) {
          status = 'NOT_FOUND';
          error = 'Route not found';
          console.log('  ⚠️ 404 - Route not found');
        } else {
          // Check if page has meaningful content
          const hasContent = await page.locator('main, [class*="container"], [class*="dashboard"], [class*="page"]').count() > 0;
          
          if (hasContent) {
            const mainContent = await page.locator('main, [class*="container"], [class*="dashboard"], [class*="page"]').first();
            const contentText = await mainContent.textContent();
            
            if (contentText && contentText.trim().length > 20) {
              status = 'SUCCESS';
              console.log('  ✅ Page loaded successfully');
            } else {
              status = 'EMPTY';
              console.log('  ⚠️ Page loaded but appears empty');
            }
          } else {
            status = 'NO_CONTENT';
            console.log('  ⚠️ No main content found');
          }
        }
        
      } catch (err: any) {
        status = 'CRASH';
        error = err.message;
        console.log(`  💥 Crash: ${err.message}`);
      }
      
      results.push({
        ...route,
        status,
        error
      });
    }
    
    // Generate summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50) + '\n');
    
    // Group by section
    const bySection: { [key: string]: any[] } = {};
    results.forEach(result => {
      if (!bySection[result.section]) {
        bySection[result.section] = [];
      }
      bySection[result.section].push(result);
    });
    
    // Print results by section
    Object.keys(bySection).forEach(section => {
      console.log(`${section}:`);
      bySection[section].forEach(result => {
        const icon = result.status === 'SUCCESS' ? '✅' : 
                     result.status === 'ERROR' ? '❌' :
                     result.status === 'EMPTY' ? '⚠️' :
                     result.status === 'NOT_FOUND' ? '🔍' :
                     result.status === 'CRASH' ? '💥' :
                     '❓';
        console.log(`  ${icon} ${result.label}: ${result.status} ${result.error ? `(${result.error})` : ''}`);
      });
      console.log('');
    });
    
    // Calculate statistics
    const total = results.length;
    const success = results.filter(r => r.status === 'SUCCESS').length;
    const errors = results.filter(r => r.status === 'ERROR').length;
    const empty = results.filter(r => r.status === 'EMPTY').length;
    const notFound = results.filter(r => r.status === 'NOT_FOUND').length;
    
    console.log('='.repeat(50));
    console.log('STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total Routes: ${total}`);
    console.log(`✅ Working: ${success}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`⚠️ Empty: ${empty}`);
    console.log(`🔍 Not Found: ${notFound}`);
    console.log(`Success Rate: ${((success / total) * 100).toFixed(1)}%`);
    
    // Fail test if too many errors
    if (errors > 5) {
      throw new Error(`Too many errors: ${errors} routes have Material-UI or runtime errors`);
    }
  });
});