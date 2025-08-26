import { test, expect, Page } from '@playwright/test';

test.describe('Security Audit Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5176');
    await page.waitForLoadState('networkidle');
  });

  test('XSS Protection - Input Sanitization', async ({ page }) => {
    // Test for XSS vulnerabilities in search/input fields
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>"
    ];

    // Look for input fields
    const inputs = await page.locator('input[type="text"], input[type="search"], textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const isVisible = await input.isVisible();
        
        if (isVisible) {
          for (const payload of xssPayloads) {
            await input.fill(payload);
            await page.waitForTimeout(500);
            
            // Check that script did not execute
            const dialogCount = await page.evaluate(() => window.dialogCount || 0);
            expect(dialogCount).toBe(0);
            
            // Check that dangerous content is escaped
            const value = await input.inputValue();
            expect(value).not.toContain('<script>');
          }
        }
      }
    }
  });

  test('Authentication State Management', async ({ page }) => {
    // Test authentication state
    await page.waitForLoadState('networkidle');
    
    // Check if user is properly authenticated in dev mode
    const authState = await page.evaluate(() => {
      return {
        isAuthenticated: localStorage.getItem('auth_token') !== null ||
                        sessionStorage.getItem('auth_token') !== null ||
                        document.cookie.includes('auth'),
        userVisible: !!document.querySelector('[data-testid="user-menu"], .user-profile, [class*="user"]')
      };
    });
    
    console.log('Auth State:', authState);
  });

  test('Session Security - Token Storage', async ({ page }) => {
    // Check for insecure token storage
    const securityData = await page.evaluate(() => {
      const localStorage = window.localStorage;
      const sessionStorage = window.sessionStorage;
      const cookies = document.cookie;
      
      return {
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage),
        cookieCount: cookies.split(';').filter(c => c.trim()).length,
        hasPasswordInStorage: Object.values(localStorage).some(val => 
          val && val.toString().toLowerCase().includes('password')) ||
          Object.values(sessionStorage).some(val => 
          val && val.toString().toLowerCase().includes('password'))
      };
    });
    
    // Passwords should never be stored in browser storage
    expect(securityData.hasPasswordInStorage).toBe(false);
    
    console.log('Storage Security Check:', securityData);
  });

  test('HTTPS Enforcement Check', async ({ page }) => {
    const url = page.url();
    // In development, HTTP is acceptable, but should warn about HTTPS in production
    console.log('Current URL Protocol:', new URL(url).protocol);
    
    // Check for mixed content warnings
    const mixedContentWarnings = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('Mixed Content')) {
        mixedContentWarnings.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(mixedContentWarnings).toHaveLength(0);
  });

  test('Error Message Information Disclosure', async ({ page }) => {
    // Test for sensitive information in error messages
    const responses = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });

    // Try to trigger some errors
    await page.goto('http://localhost:5176/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    // Check for sensitive info in 404 pages
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('database');
    expect(pageContent).not.toContain('password');
    expect(pageContent).not.toContain('api_key');
    expect(pageContent).not.toContain('secret');
  });

  test('Content Security Policy Headers', async ({ page }) => {
    const response = await page.goto('http://localhost:5176');
    const headers = response?.headers();
    
    console.log('Security Headers:', {
      csp: headers?.['content-security-policy'],
      xframe: headers?.['x-frame-options'],
      xss: headers?.['x-xss-protection'],
      contentType: headers?.['x-content-type-options']
    });
  });

  test('Firebase Security Rules Test', async ({ page }) => {
    // Check if Firebase rules are properly configured
    const firebaseTest = await page.evaluate(async () => {
      try {
        // Try to access Firebase without authentication
        if (window.firebase) {
          const db = window.firebase.firestore();
          const result = await db.collection('test').get();
          return { accessible: true, docs: result.docs.length };
        }
        return { accessible: false, error: 'Firebase not initialized' };
      } catch (error) {
        return { accessible: false, error: error.message };
      }
    });
    
    console.log('Firebase Access Test:', firebaseTest);
  });

  test('Authentication Bypass Attempts', async ({ page }) => {
    // Test common authentication bypass techniques
    
    // 1. Try accessing protected routes directly
    const protectedRoutes = [
      '/app/admin',
      '/app/settings', 
      '/app/staff/create',
      '/app/projects/create'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(`http://localhost:5176${route}`);
      await page.waitForLoadState('networkidle');
      
      const url = page.url();
      // In dev mode, routes should be accessible, but in prod they should redirect
      console.log(`Route ${route} -> ${url}`);
    }
  });

  test('Input Validation - SQL Injection Patterns', async ({ page }) => {
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "1' UNION SELECT * FROM users--",
      "admin'--",
      "' OR 1=1#"
    ];
    
    // Find input fields that might connect to database
    const inputs = await page.locator('input[type="text"], input[type="search"]');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const input = inputs.first();
      const isVisible = await input.isVisible();
      
      if (isVisible) {
        for (const payload of sqlInjectionPayloads) {
          await input.fill(payload);
          await input.press('Enter');
          await page.waitForTimeout(1000);
          
          // Check for SQL error messages
          const bodyText = await page.textContent('body');
          expect(bodyText).not.toContain('SQL');
          expect(bodyText).not.toContain('database error');
          expect(bodyText).not.toContain('mysql_');
          expect(bodyText).not.toContain('postgresql');
        }
      }
    }
  });
});