// Navigation Test Script - Systematic Testing of All Routes
// Run this in browser console after logging in with demo@demo.com/demo123

const testResults = [];
const baseUrl = 'http://localhost:5173';

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

async function testRoute(route) {
  return new Promise((resolve) => {
    window.location.href = baseUrl + route.path;
    
    setTimeout(() => {
      const result = {
        section: route.section,
        label: route.label,
        path: route.path,
        url: window.location.href,
        status: 'unknown',
        error: null,
        hasContent: false,
        contentSample: ''
      };
      
      // Check for error messages
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
      const hasError = Array.from(errorElements).some(el => 
        el.textContent.includes('Error') || 
        el.textContent.includes('error') ||
        el.textContent.includes('failed')
      );
      
      // Check for loading state
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="Loading"], [class*="spinner"]');
      const isLoading = loadingElements.length > 0;
      
      // Check for main content
      const mainContent = document.querySelector('main, [role="main"], .ff-page-container, [class*="dashboard"], [class*="page"]');
      const hasContent = mainContent && mainContent.textContent.trim().length > 50;
      
      // Get content sample
      if (mainContent) {
        result.contentSample = mainContent.textContent.trim().substring(0, 200);
      }
      
      // Determine status
      if (hasError) {
        result.status = 'ERROR';
        const errorText = Array.from(errorElements).map(el => el.textContent).join(' ');
        result.error = errorText.substring(0, 200);
      } else if (isLoading && !hasContent) {
        result.status = 'LOADING';
      } else if (hasContent) {
        result.status = 'SUCCESS';
        result.hasContent = true;
      } else {
        result.status = 'EMPTY';
      }
      
      // Check for specific error patterns
      if (document.body.textContent.includes('Cannot read properties of undefined')) {
        result.status = 'CRASH';
        result.error = 'Runtime error - undefined property access';
      }
      if (document.body.textContent.includes('404')) {
        result.status = 'NOT_FOUND';
        result.error = 'Route not found';
      }
      
      resolve(result);
    }, 3000); // Wait 3 seconds for page to load
  });
}

const log = (...args) => {
  if (typeof window !== 'undefined' && window.console) {
    window.console.log(...args);
  }
};

async function runTests() {
  log('Starting navigation tests...');
  log('Total routes to test:', routes.length);
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    log(`Testing ${i + 1}/${routes.length}: ${route.label} (${route.path})`);
    
    const result = await testRoute(route);
    testResults.push(result);
    
    log(`Result: ${result.status}`);
    if (result.error) {
      log(`Error: ${result.error}`);
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate report
  log('\n=== TEST RESULTS SUMMARY ===\n');
  
  const bySection = {};
  testResults.forEach(result => {
    if (!bySection[result.section]) {
      bySection[result.section] = [];
    }
    bySection[result.section].push(result);
  });
  
  Object.keys(bySection).forEach(section => {
    log(`\n${section}:`);
    bySection[section].forEach(result => {
      const status = result.status === 'SUCCESS' ? '✅' : 
                     result.status === 'ERROR' ? '❌' :
                     result.status === 'CRASH' ? '💥' :
                     result.status === 'EMPTY' ? '⚠️' :
                     result.status === 'NOT_FOUND' ? '🔍' :
                     '❓';
      log(`  ${status} ${result.label}: ${result.status}`);
      if (result.error) {
        log(`     Error: ${result.error}`);
      }
    });
  });
  
  // Summary stats
  const successCount = testResults.filter(r => r.status === 'SUCCESS').length;
  const errorCount = testResults.filter(r => r.status === 'ERROR' || r.status === 'CRASH').length;
  const emptyCount = testResults.filter(r => r.status === 'EMPTY').length;
  
  log('\n=== STATISTICS ===');
  log(`Total Routes: ${routes.length}`);
  log(`✅ Success: ${successCount}`);
  log(`❌ Errors: ${errorCount}`);
  log(`⚠️ Empty: ${emptyCount}`);
  log(`Success Rate: ${((successCount / routes.length) * 100).toFixed(1)}%`);
  
  return testResults;
}

// Instructions
log('Navigation Test Script Loaded');
log('To run tests: runTests()');
log('Make sure you are logged in first!');

// Export for use
if (typeof window !== 'undefined') {
  window.runNavigationTests = runTests;
}