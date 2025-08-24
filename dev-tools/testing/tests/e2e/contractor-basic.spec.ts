/**
 * Basic Contractor Tests
 * Simple tests to verify contractor functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Contractor Module Basic Tests', () => {
  test('@smoke - Contractors page loads', async ({ page }) => {
    // Navigate directly to contractors (no auth required for read in dev)
    await page.goto('/contractors');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify contractors page elements
    await expect(page.locator('h1, h2').filter({ hasText: /contractor/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('@smoke - Can view contractor details', async ({ page }) => {
    // Navigate to specific contractor
    await page.goto('/contractors/gh625jC2KWzFzvuvRfXz');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify contractor name is displayed
    await expect(page.locator('text=Test Contractor Company')).toBeVisible({ timeout: 10000 });
  });

  test('@smoke - Teams tab exists on contractor page', async ({ page }) => {
    // Navigate to contractor
    await page.goto('/contractors/gh625jC2KWzFzvuvRfXz');
    
    // Wait for tabs to load
    await page.waitForSelector('[role="tablist"], .tabs, button:has-text("Teams")', { timeout: 10000 });
    
    // Look for Teams tab/button
    const teamsTab = page.locator('button, [role="tab"]').filter({ hasText: 'Teams' });
    await expect(teamsTab).toBeVisible();
  });
});