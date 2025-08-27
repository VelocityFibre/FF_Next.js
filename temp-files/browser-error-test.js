import { chromium } from 'playwright';

async function testFibreFlowWebsite() {
  console.log('🚀 Starting browser test for FibreFlow website...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for visibility
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    const message = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleMessages.push(message);
    console.log(message);
    
    if (msg.type() === 'error') {
      errors.push(message);
    }
  });
  
  // Capture uncaught exceptions
  page.on('pageerror', error => {
    const errorMsg = `[UNCAUGHT EXCEPTION] ${error.message}`;
    errors.push(errorMsg);
    console.log(errorMsg);
  });
  
  try {
    console.log('📍 Step 1: Navigating to main page...');
    await page.goto('https://fibreflow-292c7.web.app/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(5000);
    
    // Take screenshot of main page
    await page.screenshot({ path: 'main-page.png', fullPage: true });
    console.log('📸 Screenshot saved: main-page.png');
    
    console.log('\n📍 Step 2: Navigating to procurement reports page...');
    await page.goto('https://fibreflow-292c7.web.app/app/procurement/reports', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for charts to load...');
    await page.waitForTimeout(10000);
    
    // Take screenshot of reports page
    await page.screenshot({ path: 'reports-page.png', fullPage: true });
    console.log('📸 Screenshot saved: reports-page.png');
    
    console.log('\n📍 Step 3: Testing analytics page...');
    await page.goto('https://fibreflow-292c7.web.app/app/analytics', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'analytics-page.png', fullPage: true });
    console.log('📸 Screenshot saved: analytics-page.png');
    
    console.log('\n📍 Step 4: Testing dashboard page...');
    await page.goto('https://fibreflow-292c7.web.app/app/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'dashboard-page.png', fullPage: true });
    console.log('📸 Screenshot saved: dashboard-page.png');
    
    console.log('\n📍 Step 5: Testing KPI dashboard...');
    await page.goto('https://fibreflow-292c7.web.app/app/kpi-dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'kpi-dashboard-page.png', fullPage: true });
    console.log('📸 Screenshot saved: kpi-dashboard-page.png');
    
  } catch (error) {
    console.error('❌ Navigation error:', error.message);
    errors.push(`[NAVIGATION ERROR] ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 BROWSER TEST RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n📝 Total Console Messages: ${consoleMessages.length}`);
  console.log(`❌ Total Errors: ${errors.length}\n`);
  
  if (errors.length > 0) {
    console.log('🔍 ERROR DETAILS:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('✅ No JavaScript errors detected!');
  }
  
  console.log('\n📋 ALL CONSOLE MESSAGES:');
  consoleMessages.forEach((msg, index) => {
    console.log(`${index + 1}. ${msg}`);
  });
  
  await browser.close();
  
  // Return summary
  return {
    totalMessages: consoleMessages.length,
    totalErrors: errors.length,
    errors: errors,
    allMessages: consoleMessages
  };
}

// Run the test
testFibreFlowWebsite()
  .then(results => {
    console.log('\n🏁 Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });