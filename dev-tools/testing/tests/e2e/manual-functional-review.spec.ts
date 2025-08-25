import { test, expect } from '@playwright/test';

/**
 * MANUAL FUNCTIONAL REVIEW - Systematic module testing
 * Tests each module individually with detailed reporting
 */

interface ModuleTestResult {
  module: string;
  url: string;
  status: 'WORKING' | 'BROKEN' | 'PARTIAL';
  details: string[];
  consoleErrors: string[];
}

test.describe('FibreFlow Manual Functional Review', () => {
  let results: ModuleTestResult[] = [];

  async function testModule(page: any, module: string, url: string): Promise<ModuleTestResult> {
    const result: ModuleTestResult = {
      module,
      url,
      status: 'WORKING',
      details: [],
      consoleErrors: []
    };

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    try {
      console.log(`\n=== Testing ${module} ===`);
      console.log(`URL: ${url}`);
      
      // Navigate to module
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 8000 
      });
      
      // Wait for initial render
      await page.waitForTimeout(1500);
      
      // Take screenshot
      const screenshotPath = `dev-tools/testing/test-results/${module.toLowerCase().replace(/\s/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath });
      
      // Basic checks
      const title = await page.title();
      const bodyText = await page.textContent('body');
      const currentUrl = page.url();
      
      result.details.push(`Page title: ${title}`);
      result.details.push(`Current URL: ${currentUrl}`);
      result.details.push(`Content length: ${bodyText?.length || 0} characters`);
      
      // Check for error states
      if (bodyText?.includes('404') || bodyText?.includes('Not Found')) {
        result.status = 'BROKEN';
        result.details.push('❌ 404 or Not Found detected');
      }
      
      if (bodyText?.includes('Error') && !bodyText?.includes('Error Boundary')) {
        result.status = 'PARTIAL';
        result.details.push('⚠️ Error messages detected');
      }
      
      // Check for React error boundary
      const errorBoundary = await page.locator('[data-testid="error-boundary"]').count();
      if (errorBoundary > 0) {
        result.status = 'BROKEN';
        result.details.push('❌ React error boundary triggered');
      }
      
      // Check for loading states that don't resolve
      const loadingElements = await page.locator('[data-testid*="loading"], .loading, .spinner').count();
      if (loadingElements > 0) {
        await page.waitForTimeout(2000);
        const stillLoading = await page.locator('[data-testid*="loading"], .loading, .spinner').count();
        if (stillLoading > 0) {
          result.status = 'PARTIAL';
          result.details.push(`⚠️ Persistent loading states: ${stillLoading}`);
        }
      }
      
      // Module-specific checks
      if (module.includes('Dashboard')) {
        const cards = await page.locator('[class*="card"], [data-testid*="card"]').count();
        result.details.push(`Dashboard cards found: ${cards}`);
        if (cards === 0) {
          result.status = 'PARTIAL';
          result.details.push('⚠️ No dashboard cards detected');
        } else {
          result.details.push('✅ Dashboard cards present');
        }
      }
      
      if (module.includes('Projects') || module.includes('Clients') || module.includes('Staff')) {
        const tables = await page.locator('table').count();
        const lists = await page.locator('[role="table"], [data-testid*="table"], [data-testid*="list"]').count();
        result.details.push(`Tables found: ${tables}`);
        result.details.push(`List elements found: ${lists}`);
      }
      
      if (module.includes('Create') || module.includes('Form')) {
        const forms = await page.locator('form').count();
        const inputs = await page.locator('input, textarea, select').count();
        result.details.push(`Forms found: ${forms}`);
        result.details.push(`Input fields found: ${inputs}`);
        if (forms === 0) {
          result.status = 'BROKEN';
          result.details.push('❌ No forms found on create page');
        }
      }
      
      // Check for navigation elements
      const navElements = await page.locator('nav, [role="navigation"]').count();
      result.details.push(`Navigation elements: ${navElements}`);
      
      // Check for interactive elements
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      result.details.push(`Buttons: ${buttons}, Links: ${links}`);
      
      // Content quality check
      if ((bodyText?.length || 0) < 100) {
        result.status = 'BROKEN';
        result.details.push('❌ Page appears empty or has minimal content');
      }
      
      // Store console errors
      result.consoleErrors = consoleErrors;
      
      // Overall status determination
      if (result.status === 'WORKING' && consoleErrors.length > 0) {
        result.status = 'PARTIAL';
        result.details.push(`⚠️ Console errors detected: ${consoleErrors.length}`);
      }
      
      if (result.status === 'WORKING') {
        result.details.push('✅ Module appears to be working correctly');
      }
      
      console.log(`Status: ${result.status}`);
      console.log(`Details: ${result.details.length} items`);
      console.log(`Console errors: ${consoleErrors.length}`);
      
    } catch (error) {
      result.status = 'BROKEN';
      result.details.push(`❌ Navigation/Loading error: ${error}`);
      console.log(`❌ Test failed: ${error}`);
    }
    
    results.push(result);
    return result;
  }

  test('1. Authentication/Homepage', async ({ page }) => {
    await testModule(page, 'Authentication', 'http://localhost:5174/');
  });

  test('2. Main Dashboard', async ({ page }) => {
    await testModule(page, 'Main Dashboard', 'http://localhost:5174/app/dashboard');
  });

  test('3. Projects List', async ({ page }) => {
    await testModule(page, 'Projects List', 'http://localhost:5174/app/projects');
  });

  test('4. Projects Create', async ({ page }) => {
    await testModule(page, 'Projects Create', 'http://localhost:5174/app/projects/create');
  });

  test('5. Clients List', async ({ page }) => {
    await testModule(page, 'Clients List', 'http://localhost:5174/app/clients');
  });

  test('6. Clients Create', async ({ page }) => {
    await testModule(page, 'Clients Create', 'http://localhost:5174/app/clients/new');
  });

  test('7. Staff List', async ({ page }) => {
    await testModule(page, 'Staff List', 'http://localhost:5174/app/staff');
  });

  test('8. Staff Create', async ({ page }) => {
    await testModule(page, 'Staff Create', 'http://localhost:5174/app/staff/new');
  });

  test('9. Staff Import', async ({ page }) => {
    await testModule(page, 'Staff Import', 'http://localhost:5174/app/staff/import');
  });

  test('10. Contractors Dashboard', async ({ page }) => {
    await testModule(page, 'Contractors Dashboard', 'http://localhost:5174/app/contractors');
  });

  test('11. Procurement Dashboard', async ({ page }) => {
    await testModule(page, 'Procurement Dashboard', 'http://localhost:5174/app/procurement');
  });

  test('12. Analytics Dashboard', async ({ page }) => {
    await testModule(page, 'Analytics Dashboard', 'http://localhost:5174/app/analytics');
  });

  test('13. Reports Dashboard', async ({ page }) => {
    await testModule(page, 'Reports Dashboard', 'http://localhost:5174/app/reports');
  });

  test('14. KPI Dashboard', async ({ page }) => {
    await testModule(page, 'KPI Dashboard', 'http://localhost:5174/app/kpi-dashboard');
  });

  test('15. Field Operations - Pole Tracker', async ({ page }) => {
    await testModule(page, 'Pole Tracker', 'http://localhost:5174/app/pole-tracker');
  });

  // Generate final report
  test.afterAll(async () => {
    console.log('\n\n=== FIBREFLOW COMPREHENSIVE FUNCTIONAL REVIEW REPORT ===\n');
    
    const working = results.filter(r => r.status === 'WORKING');
    const partial = results.filter(r => r.status === 'PARTIAL'); 
    const broken = results.filter(r => r.status === 'BROKEN');
    
    console.log('EXECUTIVE SUMMARY:');
    console.log(`✅ WORKING: ${working.length}/${results.length} modules (${Math.round(working.length/results.length*100)}%)`);
    console.log(`⚠️  PARTIAL: ${partial.length}/${results.length} modules (${Math.round(partial.length/results.length*100)}%)`);
    console.log(`❌ BROKEN: ${broken.length}/${results.length} modules (${Math.round(broken.length/results.length*100)}%)`);
    
    console.log('\n=== DETAILED MODULE STATUS ===\n');
    
    results.forEach(result => {
      const statusIcon = result.status === 'WORKING' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${result.module}`);
      console.log(`   URL: ${result.url}`);
      
      if (result.details.length > 0) {
        result.details.forEach(detail => {
          console.log(`   ${detail}`);
        });
      }
      
      if (result.consoleErrors.length > 0) {
        console.log(`   Console Errors (${result.consoleErrors.length}):`);
        result.consoleErrors.slice(0, 3).forEach(error => {
          console.log(`   - ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`);
        });
      }
      
      console.log('');
    });
    
    if (broken.length > 0) {
      console.log('=== CRITICAL ISSUES (BROKEN MODULES) ===');
      broken.forEach(result => {
        console.log(`❌ ${result.module}`);
        console.log(`   URL: ${result.url}`);
        const criticalIssues = result.details.filter(d => d.includes('❌'));
        criticalIssues.forEach(issue => console.log(`   ${issue}`));
        console.log('');
      });
    }
    
    if (partial.length > 0) {
      console.log('=== PARTIAL FUNCTIONALITY (NEEDS ATTENTION) ===');
      partial.forEach(result => {
        console.log(`⚠️ ${result.module}`);
        console.log(`   URL: ${result.url}`);
        const warnings = result.details.filter(d => d.includes('⚠️'));
        warnings.forEach(warning => console.log(`   ${warning}`));
        console.log('');
      });
    }
    
    console.log('=== RECOMMENDATIONS ===');
    console.log('1. HIGH PRIORITY: Fix any BROKEN modules first');
    console.log('2. MEDIUM PRIORITY: Address PARTIAL modules with console errors');
    console.log('3. LOW PRIORITY: Optimize PARTIAL modules with missing UI elements');
    console.log('4. TESTING: Add unit tests for modules with console errors');
    console.log('5. MONITORING: Set up error tracking for production');
    
    console.log('\n=== TEST ARTIFACTS ===');
    console.log('Screenshots saved to: dev-tools/testing/test-results/');
    console.log('Test report: Available in console output above');
    
    console.log('\n=== END REPORT ===\n');
  });
});