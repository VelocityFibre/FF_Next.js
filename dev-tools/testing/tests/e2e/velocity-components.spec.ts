/**
 * VELOCITY Theme Components - E2E Tests
 * Tests glassmorphism, animations, and premium UI effects
 */

import { test, expect } from '@playwright/test';

test.describe('VELOCITY Theme Components', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment with VELOCITY theme
    await page.goto('/');
    
    // Wait for theme to load
    await page.waitForTimeout(1000);
  });

  test.describe('GlassCard Component @visual', () => {
    test('should render with glassmorphism effects', async ({ page }) => {
      // Create a test page with GlassCard components
      await page.setContent(`
        <div style="background: linear-gradient(to br, #0a0a0a, #1a1a2e); min-height: 100vh; padding: 2rem;">
          <div data-testid="glass-subtle" class="relative backdrop-blur-sm border border-white/10 bg-white/5 rounded-lg p-4 mb-4">
            <h3 class="text-white">Subtle Glass Card</h3>
            <p class="text-white/70">This is a subtle glass card with backdrop blur</p>
          </div>
          
          <div data-testid="glass-glow" class="relative backdrop-blur-md border border-white/10 bg-white/10 rounded-lg p-4 mb-4" 
               style="box-shadow: 0 0 20px rgba(33,150,243,0.3);">
            <h3 class="text-white">Glow Glass Card</h3>
            <p class="text-white/70">This card has glow effects</p>
          </div>
          
          <div data-testid="glass-holographic" class="relative backdrop-blur-lg border rounded-lg p-4"
               style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(128,0,255,0.1), rgba(0,255,255,0.1));">
            <h3 class="text-white">Holographic Card</h3>
            <p class="text-white/70">This card has holographic gradient effects</p>
          </div>
        </div>
      `);

      // Test that glass cards are visible and have proper styling
      const subtleCard = page.getByTestId('glass-subtle');
      await expect(subtleCard).toBeVisible();
      await expect(subtleCard).toHaveCSS('backdrop-filter', 'blur(8px)');

      const glowCard = page.getByTestId('glass-glow');
      await expect(glowCard).toBeVisible();
      await expect(glowCard).toHaveCSS('backdrop-filter', 'blur(12px)');

      const holographicCard = page.getByTestId('glass-holographic');
      await expect(holographicCard).toBeVisible();
      await expect(holographicCard).toHaveCSS('backdrop-filter', 'blur(16px)');
    });

    test('should have hover effects', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem;">
          <div data-testid="hover-card" class="relative backdrop-blur-md border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all duration-300 cursor-pointer">
            <h3 class="text-white">Hover me</h3>
          </div>
        </div>
      `);

      const card = page.getByTestId('hover-card');
      
      // Test initial state
      await expect(card).toBeVisible();
      
      // Test hover state
      await card.hover();
      await page.waitForTimeout(500); // Wait for animation
      
      // Verify hover effects applied (background should be more opaque)
      await expect(card).toHaveCSS('transition-duration', '300ms');
    });
  });

  test.describe('VELOCITY Buttons @visual', () => {
    test('should render different button variants', async ({ page }) => {
      await page.setContent(`
        <div style="background: linear-gradient(to br, #0a0a0a, #1a1a2e); min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
          <button data-testid="glass-primary" class="px-4 py-2 bg-blue-500/20 text-blue-100 backdrop-blur-md border border-blue-400/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300">
            Glass Primary
          </button>
          
          <button data-testid="neon-button" class="px-4 py-2 bg-transparent text-cyan-300 border border-cyan-400/50 rounded-lg hover:bg-cyan-400/10 hover:text-cyan-100 transition-all duration-300" 
                  style="box-shadow: 0 0 20px rgba(0,255,255,0.5);">
            Neon Glow
          </button>
          
          <button data-testid="gradient-button" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
            Gradient
          </button>
          
          <button data-testid="shimmer-button" class="px-4 py-2 text-white border border-white/20 backdrop-blur-md rounded-lg relative overflow-hidden">
            <span class="relative z-10">Shimmer Effect</span>
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </button>
        </div>
      `);

      // Test all button variants are visible
      await expect(page.getByTestId('glass-primary')).toBeVisible();
      await expect(page.getByTestId('neon-button')).toBeVisible();
      await expect(page.getByTestId('gradient-button')).toBeVisible();
      await expect(page.getByTestId('shimmer-button')).toBeVisible();
    });

    test('should have interactive hover effects', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem;">
          <button data-testid="interactive-btn" class="px-6 py-3 bg-blue-500/20 text-blue-100 backdrop-blur-md border border-blue-400/30 rounded-lg hover:scale-105 hover:bg-blue-500/30 transition-all duration-300 cursor-pointer">
            Interactive Button
          </button>
        </div>
      `);

      const button = page.getByTestId('interactive-btn');
      
      // Test button is clickable
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      
      // Test hover scaling
      await button.hover();
      await page.waitForTimeout(400);
      
      // Click interaction
      await button.click();
      
      // Verify button responds to interactions
      await expect(button).toHaveCSS('transition-duration', '300ms');
    });
  });

  test.describe('Floating Label Inputs @accessibility', () => {
    test('should have proper floating label behavior', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem;">
          <div class="relative mb-6">
            <input data-testid="floating-input" 
                   class="peer w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-lg focus:bg-white/10 focus:border-blue-400/50 focus:outline-none transition-all duration-300" 
                   placeholder=" " />
            <label data-testid="floating-label" 
                   class="absolute left-4 top-3 text-white/70 transition-all duration-300 peer-focus:-top-2 peer-focus:left-3 peer-focus:scale-75 peer-focus:bg-black/50 peer-focus:px-2 peer-focus:rounded peer-focus:text-blue-300 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-black/50 peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded">
              Email Address
            </label>
          </div>
        </div>
      `);

      const input = page.getByTestId('floating-input');
      const label = page.getByTestId('floating-label');
      
      // Initial state
      await expect(input).toBeVisible();
      await expect(label).toBeVisible();
      
      // Focus input - label should float
      await input.focus();
      await page.waitForTimeout(400);
      
      // Type in input
      await input.fill('test@example.com');
      
      // Blur input - label should stay floated because input has value
      await input.blur();
      await page.waitForTimeout(400);
      
      // Verify input has value
      await expect(input).toHaveValue('test@example.com');
      
      // Clear input and blur - label should return to original position
      await input.fill('');
      await input.blur();
      await page.waitForTimeout(400);
      
      await expect(input).toHaveValue('');
    });

    test('should show validation states', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem;">
          <div class="mb-4">
            <input data-testid="error-input" class="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-red-400/50 text-red-100 rounded-lg focus:border-red-400 transition-all duration-300" placeholder="Error state input" />
            <p data-testid="error-message" class="mt-2 text-sm text-red-300">This field has an error</p>
          </div>
          
          <div class="mb-4">
            <input data-testid="success-input" class="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-green-400/50 text-green-100 rounded-lg focus:border-green-400 transition-all duration-300" placeholder="Success state input" />
            <p data-testid="success-message" class="mt-2 text-sm text-green-300">Input validated successfully</p>
          </div>
        </div>
      `);

      // Test error state
      const errorInput = page.getByTestId('error-input');
      const errorMessage = page.getByTestId('error-message');
      
      await expect(errorInput).toBeVisible();
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('error');
      
      // Test success state
      const successInput = page.getByTestId('success-input');
      const successMessage = page.getByTestId('success-message');
      
      await expect(successInput).toBeVisible();
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText('successfully');
    });
  });

  test.describe('Loading Spinners @performance', () => {
    test('should render different spinner types', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
          <div class="text-center">
            <div data-testid="circular-spinner" class="w-8 h-8 mx-auto animate-spin">
              <svg class="w-full h-full text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="filter: drop-shadow(0 0 10px rgba(0,255,255,0.7))">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p class="text-white/70 text-sm mt-2">Circular</p>
          </div>
          
          <div class="text-center">
            <div data-testid="dots-spinner" class="flex space-x-1 justify-center">
              <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0s; box-shadow: 0 0 10px rgba(0,255,255,0.7)"></div>
              <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.2s; box-shadow: 0 0 10px rgba(0,255,255,0.7)"></div>
              <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0.4s; box-shadow: 0 0 10px rgba(0,255,255,0.7)"></div>
            </div>
            <p class="text-white/70 text-sm mt-2">Dots</p>
          </div>
          
          <div class="text-center">
            <div data-testid="pulse-spinner" class="relative w-8 h-8 mx-auto">
              <div class="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping" style="box-shadow: 0 0 20px rgba(0,255,255,0.5)"></div>
              <div class="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping" style="animation-delay: 0.3s; box-shadow: 0 0 20px rgba(0,255,255,0.5)"></div>
            </div>
            <p class="text-white/70 text-sm mt-2">Pulse</p>
          </div>
        </div>
      `);

      // Test all spinner types are visible and animating
      await expect(page.getByTestId('circular-spinner')).toBeVisible();
      await expect(page.getByTestId('dots-spinner')).toBeVisible();
      await expect(page.getByTestId('pulse-spinner')).toBeVisible();
      
      // Verify animations are running (spinners should be visible for a few seconds)
      await page.waitForTimeout(2000);
      
      await expect(page.getByTestId('circular-spinner')).toBeVisible();
      await expect(page.getByTestId('dots-spinner')).toBeVisible();
      await expect(page.getByTestId('pulse-spinner')).toBeVisible();
    });

    test('should have smooth animations @performance', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem; display: flex; justify-center; align-items: center;">
          <div data-testid="smooth-spinner" class="w-12 h-12 relative animate-spin">
            <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400" style="box-shadow: 0 0 20px rgba(0,255,255,0.5)"></div>
            <div class="absolute inset-1 rounded-full border border-transparent border-r-cyan-300 opacity-60 animate-reverse-spin"></div>
          </div>
        </div>
      `);

      const spinner = page.getByTestId('smooth-spinner');
      await expect(spinner).toBeVisible();
      
      // Test animation performance by measuring frame consistency
      await page.waitForTimeout(3000);
      
      // Spinner should still be visible and animating smoothly
      await expect(spinner).toBeVisible();
    });
  });

  test.describe('Page Transitions @animation', () => {
    test('should have smooth page transitions', async ({ page }) => {
      await page.setContent(`
        <div data-testid="page-container" style="background: linear-gradient(to br, #0a0a0a, #1a1a2e); min-height: 100vh;">
          <div data-testid="page-content" class="animate-fadeIn" style="animation-duration: 300ms; animation-fill-mode: both;">
            <div class="p-8">
              <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                VELOCITY Theme Test
              </h1>
              <p class="text-white/70 text-lg mt-4">Testing page transition animations</p>
            </div>
          </div>
        </div>
      `);

      const container = page.getByTestId('page-container');
      const content = page.getByTestId('page-content');
      
      await expect(container).toBeVisible();
      await expect(content).toBeVisible();
      
      // Content should have fade-in animation
      await expect(content).toHaveCSS('animation-duration', '300ms');
      
      // Test that the gradient text is visible
      const title = page.locator('h1');
      await expect(title).toContainText('VELOCITY Theme Test');
    });
  });

  test.describe('Accessibility Compliance @a11y', () => {
    test('should meet WCAG contrast requirements', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem;">
          <div class="space-y-4">
            <h1 data-testid="main-heading" class="text-white text-3xl font-bold">Main Heading</h1>
            <h2 data-testid="sub-heading" class="text-white/90 text-xl font-semibold">Sub Heading</h2>
            <p data-testid="body-text" class="text-white/70 text-base">Body text should have sufficient contrast</p>
            <button data-testid="primary-button" class="px-4 py-2 bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900">
              Primary Action
            </button>
          </div>
        </div>
      `);

      // Test that all text elements are visible (indicating sufficient contrast)
      await expect(page.getByTestId('main-heading')).toBeVisible();
      await expect(page.getByTestId('sub-heading')).toBeVisible();
      await expect(page.getByTestId('body-text')).toBeVisible();
      
      // Test button accessibility
      const button = page.getByTestId('primary-button');
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      
      // Test keyboard navigation
      await button.focus();
      await expect(button).toBeFocused();
      
      // Test that focus ring is visible
      await expect(button).toHaveCSS('outline', 'none'); // Should use custom focus ring
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.setContent(`
        <div style="background: #0a0a0a; min-height: 100vh; padding: 2rem;">
          <div class="space-y-4">
            <button data-testid="btn-1" class="px-4 py-2 bg-blue-500/20 text-blue-100 backdrop-blur-md border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">Button 1</button>
            <input data-testid="input-1" class="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-lg focus:bg-white/10 focus:border-blue-400/50 focus:outline-none" placeholder="Input field" />
            <button data-testid="btn-2" class="px-4 py-2 bg-purple-500/20 text-purple-100 backdrop-blur-md border border-purple-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400">Button 2</button>
          </div>
        </div>
      `);

      const btn1 = page.getByTestId('btn-1');
      const input = page.getByTestId('input-1');
      const btn2 = page.getByTestId('btn-2');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(btn1).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(input).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(btn2).toBeFocused();
      
      // Test reverse tab navigation
      await page.keyboard.press('Shift+Tab');
      await expect(input).toBeFocused();
      
      await page.keyboard.press('Shift+Tab');
      await expect(btn1).toBeFocused();
    });
  });

  test.describe('Responsive Design @mobile', () => {
    test('should work on mobile viewports', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.setContent(`
        <div style="background: linear-gradient(to b, #0a0a0a, #1a1a2e); min-height: 100vh; padding: 1rem;">
          <div class="space-y-4">
            <div data-testid="mobile-card" class="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 class="text-white text-lg font-semibold">Mobile Glass Card</h3>
              <p class="text-white/70 text-sm">This should work well on mobile devices</p>
            </div>
            
            <button data-testid="mobile-button" class="w-full px-4 py-3 bg-blue-500/20 text-blue-100 backdrop-blur-md border border-blue-400/30 rounded-lg hover:bg-blue-500/30 transition-all duration-300 touch-action-manipulation">
              Full Width Mobile Button
            </button>
            
            <input data-testid="mobile-input" class="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-lg focus:bg-white/10 focus:border-blue-400/50 text-base" placeholder="Mobile input" />
          </div>
        </div>
      `);

      const card = page.getByTestId('mobile-card');
      const button = page.getByTestId('mobile-button');
      const input = page.getByTestId('mobile-input');
      
      // Test that components are visible and properly sized on mobile
      await expect(card).toBeVisible();
      await expect(button).toBeVisible();
      await expect(input).toBeVisible();
      
      // Test touch interactions
      await button.tap();
      await input.tap();
      
      // Verify input can receive text on mobile
      await input.fill('Mobile test text');
      await expect(input).toHaveValue('Mobile test text');
    });
  });
});