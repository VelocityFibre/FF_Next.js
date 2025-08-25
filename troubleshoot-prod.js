#!/usr/bin/env node

/**
 * Production App Troubleshooting Script
 * Takes screenshots and checks for errors
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function troubleshootProdApp() {
  console.log('🔍 Troubleshooting Production FibreFlow App...');
  console.log('================================================\n');

  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000     // Slow down for observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Collect console logs and errors
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`🔴 Failed Request: ${response.url()} - ${response.status()}`);
    }
  });

  try {
    console.log('🌐 Loading production app...');
    
    // Navigate to production app
    await page.goto('https://fibreflow-292c7.web.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for initial load
    await page.waitForTimeout(3000);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'prod-app-screenshot.png',
      fullPage: true 
    });
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page Title: "${title}"`);
    
    // Check for common elements
    console.log('\n🔍 Checking UI Elements:');
    
    // Check for loading indicators
    const loadingElements = await page.locator('[data-testid*="loading"], .loading, .spinner').count();
    console.log(`⏳ Loading indicators: ${loadingElements}`);
    
    // Check for error messages
    const errorElements = await page.locator('.error, [data-testid*="error"], .alert-error').count();
    console.log(`❌ Error elements: ${errorElements}`);
    
    // Check if main content is loaded
    const mainContent = await page.locator('main, #root, .app, [data-testid="main"]').count();
    console.log(`🏠 Main content areas: ${mainContent}`);
    
    // Check for navigation
    const navElements = await page.locator('nav, .navbar, .navigation, [role="navigation"]').count();
    console.log(`🧭 Navigation elements: ${navElements}`);
    
    // Try to find login/auth related elements
    const authElements = await page.locator('input[type="email"], input[type="password"], .login, .auth').count();
    console.log(`🔐 Auth elements: ${authElements}`);
    
    // Check for React error boundaries
    const reactErrors = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => 
        el.textContent?.includes('Something went wrong') ||
        el.textContent?.includes('Error boundary') ||
        el.textContent?.includes('React error')
      ).length;
    });
    console.log(`⚛️  React errors: ${reactErrors}`);
    
    // Check network requests
    console.log('\n🌐 Network Analysis:');
    
    // Try to navigate to different routes
    const routes = ['/app', '/app/dashboard', '/app/projects', '/app/staff'];
    
    for (const route of routes) {
      try {
        console.log(`🔍 Testing route: ${route}`);
        await page.goto(`https://fibreflow-292c7.web.app${route}`, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        console.log(`   ✅ ${route} -> ${currentUrl} (${pageTitle})`);
        
        // Take screenshot of each major route
        await page.screenshot({ 
          path: `prod-route-${route.replace(/\//g, '-')}.png` 
        });
        
      } catch (routeError) {
        console.log(`   ❌ ${route} -> Error: ${routeError.message}`);
      }
    }
    
    console.log('\n📊 TROUBLESHOOTING SUMMARY:');
    console.log('============================');
    console.log(`📄 Page Title: ${title}`);
    console.log(`🖥️  Console Messages: ${logs.length}`);
    console.log(`❌ JavaScript Errors: ${errors.length}`);
    console.log(`🔍 UI Elements Found: Main(${mainContent}), Nav(${navElements}), Auth(${authElements})`);
    
    if (errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS FOUND:');
      errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.message}`);
      });
    }
    
    if (logs.filter(log => log.type === 'error').length > 0) {
      console.log('\n🔴 CONSOLE ERRORS:');
      logs.filter(log => log.type === 'error').forEach((log, i) => {
        console.log(`   ${i + 1}. ${log.text}`);
      });
    }
    
    // Write detailed report
    const report = {
      timestamp: new Date().toISOString(),
      url: 'https://fibreflow-292c7.web.app',
      title,
      logs,
      errors,
      elementCounts: {
        loading: loadingElements,
        errors: errorElements,
        main: mainContent,
        navigation: navElements,
        auth: authElements,
        reactErrors
      }
    };
    
    fs.writeFileSync('prod-troubleshooting-report.json', JSON.stringify(report, null, 2));
    console.log('\n📝 Detailed report saved to: prod-troubleshooting-report.json');
    
    // Keep browser open for 30 seconds for manual inspection
    console.log('\n⏱️  Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('💥 Troubleshooting failed:', error);
  } finally {
    await browser.close();
  }
}

troubleshootProdApp().catch(console.error);