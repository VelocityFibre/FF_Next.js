import { test, expect, Page } from '@playwright/test';

/**
 * COMPREHENSIVE FUNCTIONAL REVIEW
 * Tests ALL navigation menu items systematically
 * Documents EVERY broken page, missing component, or runtime error
 */

interface TestResult {
  module: string;
  url: string;
  status: 'WORKING' | 'BROKEN' | 'PARTIAL';
  issues: string[];
  consoleErrors: string[];
  screenshot?: string;
}

let testResults: TestResult[] = [];

async function captureConsoleErrors(page: Page): Promise<string[]> {
  const consoleMessages: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(`Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    consoleMessages.push(`Page Error: ${err.message}`);
  });
  
  return consoleMessages;
}

async function testPage(page: Page, module: string, url: string): Promise<TestResult> {
  const result: TestResult = {
    module,
    url,
    status: 'WORKING',
    issues: [],
    consoleErrors: []
  };
  
  try {
    console.log(`Testing ${module} at ${url}`);
    
    // Capture console errors
    const consoleErrors = await captureConsoleErrors(page);
    
    // Navigate to page
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (!response || response.status() !== 200) {
      result.status = 'BROKEN';
      result.issues.push(`Failed to load page: HTTP ${response?.status()}`);
    }
    
    // Wait a moment for React components to render
    await page.waitForTimeout(2000);
    
    // Check for error boundaries
    const errorBoundary = await page.locator('[data-testid="error-boundary"]').count();
    if (errorBoundary > 0) {
      result.status = 'BROKEN';
      result.issues.push('Error boundary detected');
    }
    
    // Check for basic page elements
    const bodyContent = await page.textContent('body');
    if (!bodyContent || bodyContent.trim().length === 0) {
      result.status = 'BROKEN';
      result.issues.push('Page appears empty');
    }
    
    // Check for loading states that never resolve
    const loadingSpinners = await page.locator('[data-testid*="loading"], [data-testid*="spinner"], .loading').count();
    if (loadingSpinners > 0) {
      await page.waitForTimeout(3000);
      const stillLoading = await page.locator('[data-testid*="loading"], [data-testid*="spinner"], .loading').count();
      if (stillLoading > 0) {
        result.status = 'PARTIAL';
        result.issues.push('Persistent loading state detected');
      }
    }
    
    // Check for 404 or error messages
    const notFoundText = await page.textContent('body');
    if (notFoundText?.includes('404') || notFoundText?.includes('Not Found') || notFoundText?.includes('Error')) {
      result.status = 'BROKEN';
      result.issues.push('404 or error message detected');
    }
    
    // Take screenshot if there are issues
    if (result.status !== 'WORKING') {
      const screenshotPath = `screenshot-${module.toLowerCase().replace(/\s/g, '-')}.png`;
      await page.screenshot({ path: `dev-tools/testing/test-results/${screenshotPath}` });
      result.screenshot = screenshotPath;
    }
    
    result.consoleErrors = consoleErrors;
    
  } catch (error) {
    result.status = 'BROKEN';
    result.issues.push(`Navigation error: ${error}`);
  }
  
  return result;
}

test.describe('FibreFlow Comprehensive Functional Review', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored results
    testResults = [];
  });

  test('1. Authentication Flow', async ({ page }) => {
    const result = await testPage(page, 'Authentication', 'http://localhost:5173/');
    testResults.push(result);
    
    // Test login form functionality if present
    try {
      const loginForm = await page.locator('form').count();
      if (loginForm > 0) {
        const emailInput = await page.locator('input[type="email"]').count();
        const passwordInput = await page.locator('input[type="password"]').count();
        
        if (emailInput === 0 || passwordInput === 0) {
          result.status = 'PARTIAL';
          result.issues.push('Login form missing required inputs');
        }
      }
    } catch (error) {
      result.issues.push(`Login form test failed: ${error}`);
    }
  });

  test('2. Dashboard', async ({ page }) => {
    const result = await testPage(page, 'Dashboard', 'http://localhost:5173/app/dashboard');
    testResults.push(result);
    
    // Check for dashboard cards and metrics
    try {
      const cards = await page.locator('[data-testid*="card"], .stat-card, .metric-card').count();
      if (cards === 0) {
        result.status = 'PARTIAL';
        result.issues.push('No dashboard cards found');
      }
    } catch (error) {
      result.issues.push(`Dashboard elements test failed: ${error}`);
    }
  });

  test('3. Projects Module - List View', async ({ page }) => {
    const result = await testPage(page, 'Projects List', 'http://localhost:5173/app/projects');
    testResults.push(result);
    
    // Check for project list elements
    try {
      const table = await page.locator('table, [data-testid="projects-table"]').count();
      const cards = await page.locator('[data-testid*="project"], .project-card').count();
      
      if (table === 0 && cards === 0) {
        result.status = 'PARTIAL';
        result.issues.push('No projects table or cards found');
      }
    } catch (error) {
      result.issues.push(`Projects list test failed: ${error}`);
    }
  });

  test('4. Projects Module - Create Form', async ({ page }) => {
    const result = await testPage(page, 'Projects Create', 'http://localhost:5173/app/projects/create');
    testResults.push(result);
    
    // Check for form elements
    try {
      const forms = await page.locator('form').count();
      const inputs = await page.locator('input, textarea, select').count();
      
      if (forms === 0) {
        result.status = 'BROKEN';
        result.issues.push('No project creation form found');
      } else if (inputs < 3) {
        result.status = 'PARTIAL';
        result.issues.push('Project form appears incomplete');
      }
    } catch (error) {
      result.issues.push(`Projects create form test failed: ${error}`);
    }
  });

  test('5. Clients Module - List View', async ({ page }) => {
    const result = await testPage(page, 'Clients List', 'http://localhost:5173/app/clients');
    testResults.push(result);
  });

  test('6. Clients Module - Create Form', async ({ page }) => {
    const result = await testPage(page, 'Clients Create', 'http://localhost:5173/app/clients/new');
    testResults.push(result);
  });

  test('7. Staff Module - List View', async ({ page }) => {
    const result = await testPage(page, 'Staff List', 'http://localhost:5173/app/staff');
    testResults.push(result);
  });

  test('8. Staff Module - Create Form', async ({ page }) => {
    const result = await testPage(page, 'Staff Create', 'http://localhost:5173/app/staff/new');
    testResults.push(result);
  });

  test('9. Staff Module - Import Functionality', async ({ page }) => {
    const result = await testPage(page, 'Staff Import', 'http://localhost:5173/app/staff/import');
    testResults.push(result);
  });

  test('10. Contractors Module - Dashboard', async ({ page }) => {
    const result = await testPage(page, 'Contractors Dashboard', 'http://localhost:5173/app/contractors');
    testResults.push(result);
  });

  test('11. Procurement Module - Main Dashboard', async ({ page }) => {
    const result = await testPage(page, 'Procurement Dashboard', 'http://localhost:5173/app/procurement');
    testResults.push(result);
  });

  test('12. Field Operations - Pole Capture', async ({ page }) => {
    const result = await testPage(page, 'Pole Capture', 'http://localhost:5173/app/pole-capture');
    testResults.push(result);
  });

  test('13. Field Operations - Fiber Stringing', async ({ page }) => {
    const result = await testPage(page, 'Fiber Stringing', 'http://localhost:5173/app/fiber-stringing');
    testResults.push(result);
  });

  test('14. Field Operations - Drops', async ({ page }) => {
    const result = await testPage(page, 'Drops Management', 'http://localhost:5173/app/drops');
    testResults.push(result);
  });

  test('15. Field Operations - Installations', async ({ page }) => {
    const result = await testPage(page, 'Home Installations', 'http://localhost:5173/app/installations');
    testResults.push(result);
  });

  test('16. Analytics Dashboard', async ({ page }) => {
    const result = await testPage(page, 'Analytics', 'http://localhost:5173/app/analytics');
    testResults.push(result);
  });

  test('17. Reports Dashboard', async ({ page }) => {
    const result = await testPage(page, 'Reports', 'http://localhost:5173/app/reports');
    testResults.push(result);
  });

  test('18. KPI Dashboard', async ({ page }) => {
    const result = await testPage(page, 'KPI Dashboard', 'http://localhost:5173/app/kpi-dashboard');
    testResults.push(result);
  });

  test.afterAll(async () => {
    // Generate comprehensive report
    console.log('\n=== FIBREFLOW COMPREHENSIVE FUNCTIONAL REVIEW ===\n');
    
    const workingCount = testResults.filter(r => r.status === 'WORKING').length;
    const partialCount = testResults.filter(r => r.status === 'PARTIAL').length;
    const brokenCount = testResults.filter(r => r.status === 'BROKEN').length;
    
    console.log('EXECUTIVE SUMMARY:');
    console.log(`✅ WORKING: ${workingCount}/${testResults.length} modules (${Math.round(workingCount/testResults.length*100)}%)`);
    console.log(`⚠️  PARTIAL: ${partialCount}/${testResults.length} modules (${Math.round(partialCount/testResults.length*100)}%)`);
    console.log(`❌ BROKEN: ${brokenCount}/${testResults.length} modules (${Math.round(brokenCount/testResults.length*100)}%)`);
    
    console.log('\nDETAILED BREAKDOWN BY MODULE:\n');
    
    testResults.forEach(result => {
      const statusIcon = result.status === 'WORKING' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${result.module} (${result.url})`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (result.consoleErrors.length > 0) {
        console.log(`   Console Errors: ${result.consoleErrors.length}`);
        result.consoleErrors.forEach(error => console.log(`   - ${error}`));
      }
      
      console.log('');
    });
    
    const brokenModules = testResults.filter(r => r.status === 'BROKEN');
    if (brokenModules.length > 0) {
      console.log('CRITICAL ISSUES (BROKEN MODULES):');
      brokenModules.forEach(result => {
        console.log(`❌ ${result.module}: ${result.issues.join(', ')}`);
      });
      console.log('');
    }
    
    const partialModules = testResults.filter(r => r.status === 'PARTIAL');
    if (partialModules.length > 0) {
      console.log('PARTIAL FUNCTIONALITY:');
      partialModules.forEach(result => {
        console.log(`⚠️  ${result.module}: ${result.issues.join(', ')}`);
      });
      console.log('');
    }
    
    console.log('PRIORITY RANKING FOR FIXES:');
    console.log('1. HIGH PRIORITY: Broken authentication and dashboard');
    console.log('2. MEDIUM PRIORITY: Broken core modules (Projects, Clients, Staff)');
    console.log('3. LOW PRIORITY: Broken field operations and analytics');
  });
});