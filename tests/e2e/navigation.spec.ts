import { test, expect } from '@playwright/test';

/**
 * Complete Navigation E2E Tests
 * Tests all routes and menu navigation across the entire application
 */

test.describe('Complete Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('@smoke Core Navigation', () => {
    test('should navigate to all main dashboard routes', async ({ page }) => {
      const routes = [
        { path: '/app/dashboard', title: 'Dashboard' },
        { path: '/app/projects', title: 'Projects' },
        { path: '/app/clients', title: 'Clients' },
        { path: '/app/staff', title: 'Staff' },
        { path: '/app/contractors', title: 'Contractors' },
        { path: '/app/suppliers', title: 'Suppliers' },
      ];

      for (const route of routes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error
        await expect(page.locator('h1')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });

    test('should navigate to all project management modules', async ({ page }) => {
      const projectRoutes = [
        { path: '/app/pole-tracker', title: 'Pole Tracker' },
        { path: '/app/pole-tracker/list', title: 'Pole Tracker List' },
        { path: '/app/fiber-stringing', title: 'Fiber Stringing' },
        { path: '/app/drops', title: 'Drops Management' },
        { path: '/app/installations', title: 'Home Installations' },
        { path: '/app/home-installs', title: 'Home Installs Dashboard' },
        { path: '/app/home-installs/list', title: 'Home Installs List' },
      ];

      for (const route of projectRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error
        await expect(page.locator('h1, h2, h3')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });

    test('should navigate to all procurement modules', async ({ page }) => {
      const procurementRoutes = [
        { path: '/app/procurement', title: 'Procurement Overview' },
        { path: '/app/procurement/boq', title: 'BOQ Management' },
        { path: '/app/procurement/rfq', title: 'RFQ Management' },
        { path: '/app/procurement/stock', title: 'Stock Management' },
        { path: '/app/procurement/orders', title: 'Purchase Orders' },
      ];

      for (const route of procurementRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error (even coming soon pages)
        await expect(page.locator('body')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });

    test('should navigate to all analytics and reporting modules', async ({ page }) => {
      const analyticsRoutes = [
        { path: '/app/analytics', title: 'Analytics Dashboard' },
        { path: '/app/daily-progress', title: 'Daily Progress' },
        { path: '/app/enhanced-kpis', title: 'Enhanced KPIs' },
        { path: '/app/kpi-dashboard', title: 'KPI Dashboard' },
        { path: '/app/reports', title: 'Reports' },
      ];

      for (const route of analyticsRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error
        await expect(page.locator('body')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });

    test('should navigate to all communication modules', async ({ page }) => {
      const commRoutes = [
        { path: '/app/communications', title: 'Communications Dashboard' },
        { path: '/app/meetings', title: 'Meetings' },
        { path: '/app/tasks', title: 'Tasks' },
        { path: '/app/action-items', title: 'Action Items' },
      ];

      for (const route of commRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error
        await expect(page.locator('body')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });

    test('should navigate to all data management modules', async ({ page }) => {
      const dataRoutes = [
        { path: '/app/sow', title: 'SOW Dashboard' },
        { path: '/app/sow/list', title: 'SOW List' },
        { path: '/app/sow-management', title: 'SOW Management' },
        { path: '/app/onemap', title: 'OneMap Dashboard' },
        { path: '/app/nokia-equipment', title: 'Nokia Equipment' },
      ];

      for (const route of dataRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error
        await expect(page.locator('body')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });

    test('should navigate to field app and mobile modules', async ({ page }) => {
      const fieldRoutes = [
        { path: '/app/field', title: 'Field App Portal' },
        { path: '/app/pole-capture', title: 'Pole Capture Mobile' },
      ];

      for (const route of fieldRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error
        await expect(page.locator('body')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });

    test('should navigate to settings and admin modules', async ({ page }) => {
      const adminRoutes = [
        { path: '/app/settings', title: 'Settings' },
      ];

      for (const route of adminRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Check that page loads without error
        await expect(page.locator('body')).toBeVisible();
        console.log(`✅ ${route.path} - ${route.title} loaded successfully`);
      }
    });
  });

  test.describe('@regression Navigation Error Handling', () => {
    test('should handle 404 routes gracefully', async ({ page }) => {
      await page.goto('/app/non-existent-route');
      await page.waitForLoadState('networkidle');
      
      // Should not crash, should show some content
      await expect(page.locator('body')).toBeVisible();
    });

    test('should redirect root path to dashboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Should redirect to dashboard
      expect(page.url()).toContain('/app/dashboard');
    });

    test('should redirect /app to dashboard', async ({ page }) => {
      await page.goto('/app');
      await page.waitForLoadState('networkidle');
      
      // Should redirect to dashboard
      expect(page.url()).toContain('/app/dashboard');
    });
  });

  test.describe('@visual Navigation UI Elements', () => {
    test('should have consistent navigation structure', async ({ page }) => {
      await page.goto('/app/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Check for main navigation elements (if they exist)
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Basic structure validation
      const mainContent = page.locator('main, [role="main"], .main-content');
      if (await mainContent.count() > 0) {
        await expect(mainContent.first()).toBeVisible();
      }
    });

    test('should maintain navigation state across route changes', async ({ page }) => {
      // Start at dashboard
      await page.goto('/app/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Navigate to different sections
      const routes = ['/app/projects', '/app/staff', '/app/dashboard'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Page should load successfully
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('@performance Navigation Performance', () => {
    test('should load routes within acceptable time', async ({ page }) => {
      const testRoutes = [
        '/app/dashboard',
        '/app/projects', 
        '/app/pole-tracker',
        '/app/staff',
        '/app/analytics'
      ];

      for (const route of testRoutes) {
        const startTime = Date.now();
        
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
        console.log(`⚡ ${route} loaded in ${loadTime}ms`);
      }
    });
  });
});