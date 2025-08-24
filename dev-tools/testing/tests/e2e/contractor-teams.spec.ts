/**
 * Contractor Teams E2E Tests
 * Tests the complete contractor teams functionality
 */

import { test, expect } from '@playwright/test';

// Test credentials
const TEST_EMAIL = 'test@fibreflow.com';
const TEST_PASSWORD = 'Test123!@#';
const TEST_CONTRACTOR_ID = 'gh625jC2KWzFzvuvRfXz';

test.describe('Contractor Teams Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    
    // Navigate to contractor details
    await page.goto(`/contractors/${TEST_CONTRACTOR_ID}`);
    await page.waitForSelector('text=Test Contractor Company');
  });

  test('@smoke - Can view contractor teams', async ({ page }) => {
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Verify teams section loads
    await expect(page.locator('text=Team Management')).toBeVisible();
    
    // Verify existing team is displayed
    await expect(page.locator('text=Alpha Team')).toBeVisible();
    await expect(page.locator('text=installation')).toBeVisible();
    
    // Verify team capacity is shown
    await expect(page.locator('text=5/10')).toBeVisible();
  });

  test('@smoke - Can view team members', async ({ page }) => {
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Click on Alpha Team to select it
    await page.click('text=Alpha Team');
    
    // Verify team details are shown
    await expect(page.locator('h3:has-text("Alpha Team")')).toBeVisible();
    
    // Verify team members are displayed
    await expect(page.locator('text=Mike Johnson')).toBeVisible();
    await expect(page.locator('text=Sarah Williams')).toBeVisible();
    await expect(page.locator('text=Tom Brown')).toBeVisible();
    
    // Verify team lead indicator
    await expect(page.locator('text=LEAD')).toBeVisible();
  });

  test('@regression - Can create a new team', async ({ page }) => {
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Click Add Team button
    await page.click('button:has-text("Add Team")');
    
    // Fill in team form
    await page.fill('input[name="teamName"]', 'Beta Team');
    await page.selectOption('select[name="teamType"]', 'maintenance');
    await page.fill('input[name="specialization"]', 'Network Maintenance');
    await page.fill('input[name="maxCapacity"]', '8');
    await page.fill('input[name="baseLocation"]', 'Johannesburg');
    await page.fill('input[name="operatingRadius"]', '30');
    
    // Submit form
    await page.click('button:has-text("Create Team")');
    
    // Verify success message
    await expect(page.locator('text=Team created successfully')).toBeVisible();
    
    // Verify new team appears in list
    await expect(page.locator('text=Beta Team')).toBeVisible();
  });

  test('@regression - Can add team member', async ({ page }) => {
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Select Alpha Team
    await page.click('text=Alpha Team');
    
    // Click Add Member button
    await page.click('button:has-text("Add Member")');
    
    // Fill in member form
    await page.fill('input[name="firstName"]', 'David');
    await page.fill('input[name="lastName"]', 'Jones');
    await page.fill('input[name="idNumber"]', 'TEST-ID-004');
    await page.fill('input[name="role"]', 'Junior Technician');
    await page.selectOption('select[name="skillLevel"]', 'junior');
    await page.fill('input[name="phoneNumber"]', '+27 44 444 4444');
    await page.fill('input[name="email"]', 'david@testcontractor.com');
    
    // Submit form
    await page.click('button:has-text("Add Member")');
    
    // Verify success message
    await expect(page.locator('text=Team member added successfully')).toBeVisible();
    
    // Verify new member appears in list
    await expect(page.locator('text=David Jones')).toBeVisible();
  });

  test('@regression - Can edit team details', async ({ page }) => {
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Click edit button for Alpha Team
    await page.click('[aria-label="Edit Alpha Team"]');
    
    // Update team details
    await page.fill('input[name="maxCapacity"]', '12');
    await page.selectOption('select[name="availability"]', 'busy');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Team updated successfully')).toBeVisible();
    
    // Verify updated capacity
    await expect(page.locator('text=5/12')).toBeVisible();
  });

  test('@visual - Teams UI displays correctly', async ({ page }) => {
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Wait for teams to load
    await page.waitForSelector('text=Alpha Team');
    
    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot('contractor-teams.png');
  });

  test('@a11y - Teams section is accessible', async ({ page }) => {
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Check for ARIA labels on buttons
    const addTeamButton = page.locator('button:has-text("Add Team")');
    await expect(addTeamButton).toHaveAttribute('aria-label', /add.*team/i);
  });

  test('@mobile - Teams work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Verify teams list is visible
    await expect(page.locator('text=Alpha Team')).toBeVisible();
    
    // Verify responsive layout
    const teamsContainer = page.locator('[data-testid="teams-container"]');
    await expect(teamsContainer).toHaveCSS('display', 'block');
  });

  test('@perf - Teams load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // Click on Teams tab
    await page.click('text=Teams');
    
    // Wait for teams to load
    await page.waitForSelector('text=Alpha Team');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});

test.describe('Contractor Teams Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('@regression - Handles team creation errors gracefully', async ({ page }) => {
    await page.goto(`/contractors/${TEST_CONTRACTOR_ID}`);
    await page.click('text=Teams');
    await page.click('button:has-text("Add Team")');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Team")');
    
    // Verify validation messages
    await expect(page.locator('text=Team name is required')).toBeVisible();
  });

  test('@regression - Handles network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/contractor_teams/**', route => route.abort());
    
    await page.goto(`/contractors/${TEST_CONTRACTOR_ID}`);
    await page.click('text=Teams');
    
    // Verify error message
    await expect(page.locator('text=Failed to load teams')).toBeVisible();
  });
});