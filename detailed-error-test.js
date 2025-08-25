import { chromium } from 'playwright';

async function detailedErrorTest() {
  console.log('🔍 Starting detailed forwardRef error investigation...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture more detailed console information
  const errorDetails = [];
  const allLogs = [];
  
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    };
    
    allLogs.push(logEntry);
    
    if (msg.type() === 'error') {
      errorDetails.push({
        ...logEntry,
        args: msg.args().map(arg => arg.toString())
      });
    }
    
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    if (msg.location().url) {
      console.log(`  └─ Location: ${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`);
    }
  });
  
  // Capture page errors with stack traces
  page.on('pageerror', error => {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    errorDetails.push(errorInfo);
    
    console.log(`\n❌ PAGE ERROR: ${error.name}: ${error.message}`);
    if (error.stack) {
      console.log(`Stack trace:\n${error.stack}`);
    }
  });
  
  // Capture network failures
  page.on('requestfailed', request => {
    console.log(`🌐 NETWORK FAILURE: ${request.method()} ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    console.log('\n📍 Navigating to main page and analyzing errors...');
    
    // Navigate with more detailed error handling
    const response = await page.goto('https://fibreflow-292c7.web.app/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log(`Response status: ${response.status()}`);
    
    // Wait for any async JavaScript to execute
    await page.waitForTimeout(3000);
    
    // Try to evaluate JavaScript in the page context to get more info
    const reactInfo = await page.evaluate(() => {
      try {
        // Check if React is available
        const hasReact = typeof window.React !== 'undefined';
        const hasReactDOM = typeof window.ReactDOM !== 'undefined';
        
        // Check for common React error patterns
        const scripts = Array.from(document.scripts).map(script => ({
          src: script.src,
          hasContent: script.innerHTML.length > 0
        }));
        
        return {
          hasReact,
          hasReactDOM,
          scriptsCount: scripts.length,
          scripts: scripts.filter(s => s.src).slice(0, 5), // First 5 external scripts
          title: document.title,
          bodyContent: document.body ? document.body.innerText.slice(0, 200) : 'No body'
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('\n📊 Page Analysis:');
    console.log(JSON.stringify(reactInfo, null, 2));
    
    // Wait longer and check for more errors
    console.log('\n⏳ Waiting for additional errors to surface...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Navigation error:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 DETAILED ERROR ANALYSIS');
  console.log('='.repeat(80));
  
  console.log(`\n📝 Total logs captured: ${allLogs.length}`);
  console.log(`❌ Total errors: ${errorDetails.length}`);
  
  if (errorDetails.length > 0) {
    console.log('\n🔍 ERROR DETAILS:');
    errorDetails.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.name || 'Error'}: ${error.message || error.text}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack}`);
      }
      if (error.location && error.location.url) {
        console.log(`   Location: ${error.location.url}:${error.location.lineNumber}:${error.location.columnNumber}`);
      }
      if (error.args && error.args.length > 0) {
        console.log(`   Args: ${error.args.join(', ')}`);
      }
    });
  }
  
  console.log('\n📋 ALL CONSOLE LOGS:');
  allLogs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.type.toUpperCase()}] ${log.text}`);
    if (log.location && log.location.url) {
      console.log(`   └─ ${log.location.url}:${log.location.lineNumber}:${log.location.columnNumber}`);
    }
  });
  
  await browser.close();
  
  return {
    totalLogs: allLogs.length,
    totalErrors: errorDetails.length,
    errorDetails,
    allLogs
  };
}

// Run the detailed test
detailedErrorTest()
  .then(results => {
    console.log('\n🏁 Detailed analysis completed!');
    console.log(`Results: ${results.totalErrors} errors found out of ${results.totalLogs} total logs`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });