const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * COMPREHENSIVE MANUAL TESTING SCRIPT
 * Tests all major modules in FibreFlow application
 * Documents findings and generates a detailed report
 */

const BASE_URL = 'http://localhost:5173';
const RESULTS_DIR = './dev-tools/testing/test-results/';

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Test results storage
let testResults = [];

// Helper function to wait for element
async function waitForSelector(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

// Helper function to test a page
async function testPage(page, moduleName, url, additionalChecks = null) {
  console.log(`\n🔍 Testing ${moduleName}...`);
  
  const result = {
    module: moduleName,
    url: url,
    status: 'WORKING',
    issues: [],
    elements: [],
    screenshots: []
  };
  
  try {
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    if (!response || response.status() !== 200) {
      result.status = 'BROKEN';
      result.issues.push(`HTTP ${response?.status()} error`);
      return result;
    }
    
    // Wait for page to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for React error boundaries
    const errorBoundary = await page.$('.error-boundary, [data-testid="error-boundary"]');
    if (errorBoundary) {
      result.status = 'BROKEN';
      result.issues.push('React error boundary detected');
    }
    
    // Check for basic page structure
    const hasContent = await page.evaluate(() => {
      const body = document.body;
      return body && body.textContent.trim().length > 0;
    });
    
    if (!hasContent) {
      result.status = 'BROKEN';
      result.issues.push('Page appears empty');
    }
    
    // Check for loading states that never resolve
    const loadingElements = await page.$$('.loading, [data-testid*="loading"], .spinner');
    if (loadingElements.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const stillLoading = await page.$$('.loading, [data-testid*="loading"], .spinner');
      if (stillLoading.length > 0) {
        result.status = 'PARTIAL';
        result.issues.push('Persistent loading state');
      }
    }
    
    // Check for common UI elements
    const elements = {
      forms: await page.$$('form'),
      buttons: await page.$$('button'),
      inputs: await page.$$('input'),
      tables: await page.$$('table'),
      cards: await page.$$('.card, [data-testid*="card"]'),
      navigation: await page.$$('nav, .navigation')
    };
    
    Object.entries(elements).forEach(([type, els]) => {
      if (els.length > 0) {
        result.elements.push(`${els.length} ${type}`);
      }
    });
    
    // Run additional module-specific checks
    if (additionalChecks) {
      await additionalChecks(page, result);
    }
    
    // Take screenshot
    const screenshotPath = `${RESULTS_DIR}${moduleName.toLowerCase().replace(/\s/g, '-')}-screenshot.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    result.screenshots.push(screenshotPath);
    
    console.log(`   ${result.status === 'WORKING' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌'} ${result.status}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
  } catch (error) {
    result.status = 'BROKEN';
    result.issues.push(`Navigation error: ${error.message}`);
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  testResults.push(result);
  return result;
}

// Module-specific test functions
async function testDashboard(page, result) {
  // Look for dashboard-specific elements
  const statsCards = await page.$$('.stat-card, .metric-card, [data-testid*="metric"]');
  const charts = await page.$$('.chart, canvas, svg');
  
  if (statsCards.length === 0) {
    result.issues.push('No dashboard metric cards found');
    result.status = result.status === 'WORKING' ? 'PARTIAL' : result.status;
  }
  
  if (charts.length === 0) {
    result.issues.push('No charts or visualizations found');
    result.status = result.status === 'WORKING' ? 'PARTIAL' : result.status;
  }
}

async function testProjectsModule(page, result) {
  // Look for project-specific elements
  const projectTable = await page.$('table, [data-testid*="projects"]');
  const createButton = await page.$('button:contains("Create"), button:contains("Add"), [data-testid*="create"]');
  
  if (!projectTable) {
    result.issues.push('No projects table or list found');
    result.status = result.status === 'WORKING' ? 'PARTIAL' : result.status;
  }
}

async function testStaffModule(page, result) {
  // Look for staff-specific elements
  const staffTable = await page.$('table, [data-testid*="staff"]');
  const importButton = await page.$('button:contains("Import"), [data-testid*="import"]');
  
  if (!staffTable) {
    result.issues.push('No staff table or list found');
    result.status = result.status === 'WORKING' ? 'PARTIAL' : result.status;
  }
}

async function testProcurementModule(page, result) {
  // Look for procurement-specific elements
  const boqSection = await page.$('[data-testid*="boq"], .boq');
  const rfqSection = await page.$('[data-testid*="rfq"], .rfq');
  const supplierSection = await page.$('[data-testid*="supplier"], .supplier');
  
  if (!boqSection && !rfqSection && !supplierSection) {
    result.issues.push('No procurement sections found');
    result.status = result.status === 'WORKING' ? 'PARTIAL' : result.status;
  }
}

// Main test runner
async function runComprehensiveTests() {
  console.log('🚀 Starting FibreFlow Comprehensive Functional Testing');
  console.log(`📍 Testing application at: ${BASE_URL}`);
  console.log(`📁 Results will be saved to: ${RESULTS_DIR}`);
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Test modules one by one
    await testPage(page, 'Homepage & Authentication', `${BASE_URL}/`);
    await testPage(page, 'Dashboard & Analytics', `${BASE_URL}/app/dashboard`, testDashboard);
    await testPage(page, 'Projects List', `${BASE_URL}/app/projects`, testProjectsModule);
    await testPage(page, 'Projects Create', `${BASE_URL}/app/projects/create`);
    await testPage(page, 'Staff List', `${BASE_URL}/app/staff`, testStaffModule);
    await testPage(page, 'Staff Create', `${BASE_URL}/app/staff/new`);
    await testPage(page, 'Staff Import', `${BASE_URL}/app/staff/import`);
    await testPage(page, 'Client Management', `${BASE_URL}/app/clients`);
    await testPage(page, 'Contractor Management', `${BASE_URL}/app/contractors`);
    await testPage(page, 'Procurement Dashboard', `${BASE_URL}/app/procurement`, testProcurementModule);
    await testPage(page, 'BOQ Management', `${BASE_URL}/app/procurement/boq`);
    await testPage(page, 'RFQ Management', `${BASE_URL}/app/procurement/rfq`);
    await testPage(page, 'Supplier Management', `${BASE_URL}/app/procurement/suppliers`);
    await testPage(page, 'Stock Management', `${BASE_URL}/app/procurement/stock`);
    await testPage(page, 'SOW Management', `${BASE_URL}/app/sow`);
    await testPage(page, 'Field Operations Portal', `${BASE_URL}/app/field-app`);
    await testPage(page, 'Pole Tracker', `${BASE_URL}/app/pole-tracker`);
    await testPage(page, 'Analytics', `${BASE_URL}/app/analytics`);
    await testPage(page, 'Reports', `${BASE_URL}/app/reports`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
  
  await browser.close();
  
  // Generate report
  generateReport();
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FIBREFLOW COMPREHENSIVE FUNCTIONAL TEST REPORT');
  console.log('='.repeat(60));
  
  const workingCount = testResults.filter(r => r.status === 'WORKING').length;
  const partialCount = testResults.filter(r => r.status === 'PARTIAL').length;
  const brokenCount = testResults.filter(r => r.status === 'BROKEN').length;
  const total = testResults.length;
  
  console.log(`\n📈 EXECUTIVE SUMMARY:`);
  console.log(`   ✅ WORKING: ${workingCount}/${total} (${Math.round(workingCount/total*100)}%)`);
  console.log(`   ⚠️  PARTIAL: ${partialCount}/${total} (${Math.round(partialCount/total*100)}%)`);
  console.log(`   ❌ BROKEN:  ${brokenCount}/${total} (${Math.round(brokenCount/total*100)}%)`);
  
  console.log(`\n📝 DETAILED MODULE BREAKDOWN:`);
  testResults.forEach(result => {
    const icon = result.status === 'WORKING' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`\n${icon} ${result.module} - ${result.status}`);
    console.log(`   URL: ${result.url}`);
    
    if (result.elements.length > 0) {
      console.log(`   Elements: ${result.elements.join(', ')}`);
    }
    
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   Issue: ${issue}`));
    }
  });
  
  // Priority recommendations
  console.log(`\n🎯 PRIORITY RECOMMENDATIONS:`);
  const brokenModules = testResults.filter(r => r.status === 'BROKEN');
  const partialModules = testResults.filter(r => r.status === 'PARTIAL');
  
  if (brokenModules.length > 0) {
    console.log(`\n🔥 HIGH PRIORITY (Broken Modules):`);
    brokenModules.forEach(m => console.log(`   • Fix ${m.module}: ${m.issues.join(', ')}`));
  }
  
  if (partialModules.length > 0) {
    console.log(`\n⚡ MEDIUM PRIORITY (Partial Functionality):`);
    partialModules.forEach(m => console.log(`   • Enhance ${m.module}: ${m.issues.join(', ')}`));
  }
  
  // Save JSON report
  const reportPath = `${RESULTS_DIR}comprehensive-test-report.json`;
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total, working: workingCount, partial: partialCount, broken: brokenCount },
    results: testResults
  }, null, 2));
  
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  console.log('🏁 Testing completed successfully!');
}

// Run the tests
runComprehensiveTests().catch(console.error);