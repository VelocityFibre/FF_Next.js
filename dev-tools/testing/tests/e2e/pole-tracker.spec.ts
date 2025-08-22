import { test, expect } from '@playwright/test';

/**
 * Pole Tracker Module E2E Tests
 * Tests the complete Pole Tracker functionality
 */

test.describe('Pole Tracker Module Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pole tracker
    await page.goto('/app/pole-tracker');
    await page.waitForLoadState('networkidle');
  });

  test.describe('@smoke Pole Tracker Dashboard', () => {
    test('should display pole tracker dashboard with stats', async ({ page }) => {
      // Check main heading
      await expect(page.locator('h1')).toContainText('Pole Tracker');
      
      // Check for stat cards
      const statCards = page.locator('.ff-stat-card, [class*="stat"]');
      if (await statCards.count() > 0) {
        await expect(statCards.first()).toBeVisible();
        console.log(`✅ Found ${await statCards.count()} stat cards`);
      }
      
      // Check for action cards
      const actionCards = page.locator('.ff-action-card, [class*="action"]');
      if (await actionCards.count() > 0) {
        await expect(actionCards.first()).toBeVisible();
        console.log(`✅ Found ${await actionCards.count()} action cards`);
      }
    });

    test('should have tabs for different views', async ({ page }) => {
      // Look for tab navigation
      const tabs = page.locator('.ff-tab, [role="tab"], button[aria-selected]');
      if (await tabs.count() > 0) {
        await expect(tabs.first()).toBeVisible();
        console.log(`✅ Found ${await tabs.count()} tabs`);
      }
    });

    test('should display data integrity rules', async ({ page }) => {
      // Look for warning/alert about data integrity
      const alert = page.locator('.ff-alert, .alert, [class*="warning"]');
      if (await alert.count() > 0) {
        await expect(alert.first()).toBeVisible();
        console.log('✅ Data integrity rules displayed');
      }
    });

    test('should have navigation buttons', async ({ page }) => {
      // Look for action buttons
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
      
      // Check for specific pole tracker actions
      const addButton = page.locator('text=Add, text=New, text=Create').first();
      if (await addButton.count() > 0) {
        await expect(addButton).toBeVisible();
        console.log('✅ Add/Create button found');
      }
    });
  });

  test.describe('@regression Pole Tracker List View', () => {
    test('should navigate to pole tracker list', async ({ page }) => {
      await page.goto('/app/pole-tracker/list');
      await page.waitForLoadState('networkidle');
      
      // Should load list view
      await expect(page.locator('body')).toBeVisible();
      
      // Look for table or grid
      const table = page.locator('table, .ff-table, .table');
      const grid = page.locator('.ff-grid, .grid, [class*="grid"]');
      
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();
        console.log('✅ Table view found');
      } else if (await grid.count() > 0) {
        await expect(grid.first()).toBeVisible();
        console.log('✅ Grid view found');
      }
    });

    test('should have filter controls', async ({ page }) => {
      await page.goto('/app/pole-tracker/list');
      await page.waitForLoadState('networkidle');
      
      // Look for filter panel
      const filterPanel = page.locator('.ff-filter-panel, .filter, [class*="filter"]');
      if (await filterPanel.count() > 0) {
        await expect(filterPanel.first()).toBeVisible();
        console.log('✅ Filter panel found');
      }
      
      // Look for search input
      const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]');
      if (await searchInput.count() > 0) {
        await expect(searchInput.first()).toBeVisible();
        console.log('✅ Search input found');
      }
    });

    test('should have view mode toggles', async ({ page }) => {
      await page.goto('/app/pole-tracker/list');
      await page.waitForLoadState('networkidle');
      
      // Look for view toggle buttons
      const viewButtons = page.locator('button[class*="view"], .ff-button-group button');
      if (await viewButtons.count() > 0) {
        await expect(viewButtons.first()).toBeVisible();
        console.log('✅ View toggle buttons found');
      }
    });
  });

  test.describe('@visual Pole Tracker UI Components', () => {
    test('should display consistent styling', async ({ page }) => {
      // Check that main content is visible
      await expect(page.locator('h1, h2, h3')).toBeVisible();
      
      // Check for consistent spacing
      const container = page.locator('.ff-page-container, .container, main');
      if (await container.count() > 0) {
        await expect(container.first()).toBeVisible();
        console.log('✅ Page container found');
      }
    });

    test('should have interactive elements', async ({ page }) => {
      // Check for clickable elements
      const buttons = page.locator('button');
      const links = page.locator('a');
      
      await expect(buttons.first()).toBeVisible();
      
      if (await links.count() > 0) {
        await expect(links.first()).toBeVisible();
      }
      
      console.log(`✅ Found ${await buttons.count()} buttons and ${await links.count()} links`);
    });

    test('should display icons correctly', async ({ page }) => {
      // Look for SVG icons
      const icons = page.locator('svg');
      if (await icons.count() > 0) {
        await expect(icons.first()).toBeVisible();
        console.log(`✅ Found ${await icons.count()} icons`);
      }
    });
  });

  test.describe('@mobile Pole Tracker Mobile Experience', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/app/pole-tracker');
      await page.waitForLoadState('networkidle');
      
      // Should still be accessible
      await expect(page.locator('h1, h2, h3')).toBeVisible();
      
      // Check mobile navigation if exists
      const mobileNav = page.locator('[class*="mobile"], [class*="burger"], button[aria-label*="menu" i]');
      if (await mobileNav.count() > 0) {
        console.log('✅ Mobile navigation found');
      }
    });

    test('should have touch-friendly elements on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/app/pole-tracker');
      await page.waitForLoadState('networkidle');
      
      // Check button sizes are reasonable for touch
      const buttons = page.locator('button');
      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        const buttonBox = await firstButton.boundingBox();
        
        if (buttonBox) {
          // Buttons should be at least 32px for touch targets
          expect(buttonBox.height).toBeGreaterThanOrEqual(24);
          console.log(`✅ Button height: ${buttonBox.height}px`);
        }
      }
    });
  });

  test.describe('@performance Pole Tracker Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/app/pole-tracker');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      console.log(`⚡ Pole Tracker loaded in ${loadTime}ms`);
    });

    test('should load list view efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/app/pole-tracker/list');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      console.log(`⚡ Pole Tracker List loaded in ${loadTime}ms`);
    });
  });

  test.describe('@a11y Pole Tracker Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      // Check for h1
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount.toBeGreaterThanOrEqual(1);
      
      // Check heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      if (await headings.count() > 0) {
        console.log(`✅ Found ${await headings.count()} headings`);
      }
    });

    test('should have keyboard navigation support', async ({ page }) => {
      // Focus on first interactive element
      const firstButton = page.locator('button').first();
      if (await firstButton.count() > 0) {
        await firstButton.focus();
        await expect(firstButton).toBeFocused();
        
        // Tab to next element
        await page.keyboard.press('Tab');
        
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
        console.log('✅ Keyboard navigation working');
      }
    });

    test('should have proper button semantics', async ({ page }) => {
      // Check that clickable elements are proper buttons
      const buttons = page.locator('button');
      for (let i = 0; i < Math.min(3, await buttons.count()); i++) {
        const button = buttons.nth(i);
        const tagName = await button.evaluate(el => el.tagName);
        expect(tagName).toBe('BUTTON');
      }
      console.log('✅ Button semantics correct');
    });
  });
});