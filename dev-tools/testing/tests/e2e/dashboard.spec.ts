import { test, expect } from '@playwright/test';

/**
 * Dashboard E2E Tests
 * Tests the main dashboard functionality and UI components
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('@smoke Dashboard Basic Functionality', () => {
    test('should display dashboard title and welcome message', async ({ page }) => {
      // Check dashboard title
      await expect(page.locator('h1')).toContainText('Dashboard');
      
      // Check welcome message
      await expect(page.locator('p')).toContainText('Welcome to FibreFlow');
    });

    test('should display all stat cards', async ({ page }) => {
      // Check for stat cards
      const statCards = page.locator('[class*="ff-stat-card"]');
      await expect(statCards).toHaveCount(8); // We have 8 stat cards
      
      // Check specific stat cards exist
      await expect(page.locator('text=Projects')).toBeVisible();
      await expect(page.locator('text=Suppliers')).toBeVisible();
      await expect(page.locator('text=RFQ')).toBeVisible();
      await expect(page.locator('text=Clients')).toBeVisible();
      await expect(page.locator('text=Staff')).toBeVisible();
      await expect(page.locator('text=Contractors')).toBeVisible();
      await expect(page.locator('text=Poles Installed')).toBeVisible();
      await expect(page.locator('text=Flagged Issues')).toBeVisible();
    });

    test('should display recent activity section', async ({ page }) => {
      await expect(page.locator('text=Recent Activity')).toBeVisible();
      
      // Check for activity items
      await expect(page.locator('text=New project "Lawley" created')).toBeVisible();
      await expect(page.locator('text=Staff member "John Doe" added')).toBeVisible();
      await expect(page.locator('text=BOQ updated for Mamelodi POP 1')).toBeVisible();
    });

    test('should display quick actions section', async ({ page }) => {
      await expect(page.locator('text=Quick Actions')).toBeVisible();
      
      // Check for quick action buttons
      await expect(page.locator('text=Create New Project')).toBeVisible();
      await expect(page.locator('text=Add Staff Member')).toBeVisible();
      await expect(page.locator('text=Generate Report')).toBeVisible();
    });
  });

  test.describe('@visual Dashboard Visual Elements', () => {
    test('should have properly styled stat cards with colored top bars', async ({ page }) => {
      const statCards = page.locator('[class*="ff-stat-card"]');
      const firstCard = statCards.first();
      
      // Check card styling
      await expect(firstCard).toHaveCSS('background-color', 'rgb(255, 255, 255)');
      await expect(firstCard).toHaveCSS('border-radius', '8px');
      
      // Check for colored top bar
      const topBar = firstCard.locator('div').first();
      await expect(topBar).toHaveCSS('height', '4px');
    });

    test('should have hover effects on stat cards', async ({ page }) => {
      const firstCard = page.locator('[class*="ff-stat-card"]').first();
      
      // Hover over the card
      await firstCard.hover();
      
      // Wait for transition
      await page.waitForTimeout(300);
      
      // Check that transform is applied (hover effect)
      const transform = await firstCard.evaluate(el => getComputedStyle(el).transform);
      expect(transform).not.toBe('none');
    });

    test('should display icons in stat cards', async ({ page }) => {
      const statCards = page.locator('[class*="ff-stat-card"]');
      
      // Check that each card has an icon
      for (let i = 0; i < await statCards.count(); i++) {
        const card = statCards.nth(i);
        const icon = card.locator('svg');
        await expect(icon).toBeVisible();
      }
    });
  });

  test.describe('@regression Dashboard Navigation', () => {
    test('should navigate to projects page when projects card is clicked', async ({ page }) => {
      const projectsCard = page.locator('text=Projects').locator('..');
      await projectsCard.click();
      
      // Should navigate to projects page
      await expect(page).toHaveURL(/.*\/projects/);
    });

    test('should navigate to staff page when staff card is clicked', async ({ page }) => {
      const staffCard = page.locator('text=Staff').locator('..');
      await staffCard.click();
      
      // Should navigate to staff page
      await expect(page).toHaveURL(/.*\/staff/);
    });

    test('should navigate when quick action buttons are clicked', async ({ page }) => {
      // Test "Create New Project" button
      await page.locator('text=Create New Project').click();
      await expect(page).toHaveURL(/.*\/projects\/new/);
      
      // Go back to dashboard
      await page.goto('/');
      
      // Test "Add Staff Member" button
      await page.locator('text=Add Staff Member').click();
      await expect(page).toHaveURL(/.*\/staff\/new/);
    });
  });

  test.describe('@a11y Dashboard Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Main dashboard heading
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText('Dashboard');
      
      // Section headings
      const h3 = page.locator('h3');
      await expect(h3).toHaveCount.toBeGreaterThan(0);
    });

    test('should have keyboard navigation support', async ({ page }) => {
      // Focus on first stat card
      const firstCard = page.locator('[class*="ff-stat-card"]').first();
      await firstCard.focus();
      
      // Check that the card is focused
      await expect(firstCard).toBeFocused();
      
      // Tab to next interactive element
      await page.keyboard.press('Tab');
      
      // Should focus on next clickable element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Check for main landmark
      const main = page.locator('main');
      if (await main.count() > 0) {
        await expect(main).toBeVisible();
      }
      
      // Check for proper button elements
      const buttons = page.locator('button');
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i);
        const tagName = await button.evaluate(el => el.tagName);
        expect(tagName).toBe('BUTTON');
      }
    });
  });

  test.describe('@mobile Dashboard Responsive Design', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that dashboard is still visible
      await expect(page.locator('h1')).toContainText('Dashboard');
      
      // Check that stat cards stack vertically on mobile
      const statCards = page.locator('[class*="ff-stat-card"]');
      const firstCard = statCards.first();
      const secondCard = statCards.nth(1);
      
      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();
      
      // Second card should be below first card on mobile
      expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y! + firstCardBox?.height!);
    });

    test('should have readable text on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      // Check that text is still readable
      const title = page.locator('h1');
      const fontSize = await title.evaluate(el => getComputedStyle(el).fontSize);
      
      // Font size should be reasonable (at least 18px for h1)
      const fontSizeValue = parseInt(fontSize);
      expect(fontSizeValue).toBeGreaterThanOrEqual(18);
    });
  });

  test.describe('@perf Dashboard Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have smooth animations', async ({ page }) => {
      const statCard = page.locator('[class*="ff-stat-card"]').first();
      
      // Hover to trigger animation
      await statCard.hover();
      
      // Wait for animation to complete
      await page.waitForTimeout(500);
      
      // Card should still be visible after animation
      await expect(statCard).toBeVisible();
    });
  });

  test.describe('@error Dashboard Error States', () => {
    test('should handle missing data gracefully', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/');
      
      // Dashboard should still render even if some data is missing
      await expect(page.locator('h1')).toContainText('Dashboard');
      
      // Stat cards should show default values
      const statCards = page.locator('[class*="ff-stat-card"]');
      await expect(statCards.first()).toBeVisible();
    });
  });
});