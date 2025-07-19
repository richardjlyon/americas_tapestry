/**
 * Refactor Safety Tests
 * 
 * These tests ensure the website fundamentally works after refactoring.
 * They check critical user journeys without being overly sensitive to styling.
 */

import { test, expect } from '@playwright/test';

test.describe('Refactor Safety - Critical Functionality', () => {
  
  test('Home page loads and displays core content', async ({ page }) => {
    await page.goto('/');
    
    // Page loads successfully (no 500 error)
    expect(page.url()).toContain('localhost:3000');
    
    // Essential structure exists
    await expect(page.locator('main, body').first()).toBeVisible();
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    
    // Page has substantial content (not blank)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(200);
    expect(bodyText).toContain('America');
    expect(bodyText).toContain('Tapestry');
    
    // Navigation is present
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('All main pages load successfully', async ({ page }) => {
    const pages = [
      { url: '/about', expectedText: 'Welcome' },
      { url: '/tapestries', expectedText: 'Tapestry' },
      { url: '/team', expectedText: 'Team' },
      { url: '/news', expectedText: 'News' },
      { url: '/sponsors', expectedText: 'Sponsors' },
      { url: '/resources', expectedText: 'Resources' },
      { url: '/contact', expectedText: 'Contact' }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      
      // Page loads without error (check for either main or body content)
      await expect(page.locator('main, body').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('h1, h2').first()).toBeVisible();
      
      // Has expected content
      const content = await page.locator('main, body').first().textContent();
      expect(content).toContain(pageInfo.expectedText);
      
      // Not a blank page
      expect(content?.length).toBeGreaterThan(50);
    }
  });

  test('Navigation between pages works', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to About page
    await page.click('a[href="/about"]');
    await expect(page.locator('h1')).toContainText('Welcome');
    
    // Navigate to Tapestries page
    await page.click('a[href="/tapestries"]');
    await expect(page.locator('h1')).toContainText('Tapestry');
    
    // Navigate to Team page
    await page.click('a[href="/team"]');
    await expect(page.locator('h1')).toContainText('Team');
    
    // Back to home
    await page.click('a[href="/"]');
    await expect(page.locator('main, body').first()).toBeVisible();
  });

  test('No critical JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Visit all main pages
    const urls = ['/', '/about', '/tapestries', '/team', '/news'];
    
    for (const url of urls) {
      await page.goto(url);
      await page.waitForTimeout(1000); // Allow time for any async errors
    }
    
    // Filter for critical errors only
    const criticalErrors = errors.filter(error => 
      error.includes('ReferenceError') || 
      error.includes('TypeError: Cannot read') ||
      error.includes('SyntaxError') ||
      error.includes('is not defined')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Data loading works (tapestries display)', async ({ page }) => {
    await page.goto('/tapestries');
    
    // Page loads
    await expect(page.locator('main, body').first()).toBeVisible();
    
    // Should have tapestry content (grids, cards, or lists)
    const hasContent = await page.locator('main').textContent();
    expect(hasContent).toContain('Tapestry');
    
    // Should not show error messages in visible content
    const visibleText = await page.locator('main, body').first().textContent();
    expect(visibleText).not.toContain('Error loading');
    expect(visibleText).not.toContain('Page not found');
    expect(visibleText).not.toContain('500 error');
  });

  test('News/blog data loading works', async ({ page }) => {
    await page.goto('/news');
    
    await expect(page.locator('main, body').first()).toBeVisible();
    
    // Should have news content
    const content = await page.locator('main').textContent();
    expect(content).toContain('News');
    
    // Should not be completely empty
    expect(content?.length).toBeGreaterThan(100);
  });

  test('Team data loading works', async ({ page }) => {
    await page.goto('/team');
    
    await expect(page.locator('main, body').first()).toBeVisible();
    
    // Should have team content
    const content = await page.locator('main').textContent();
    expect(content).toContain('Team');
    
    // Should mention team members or groups
    expect(content?.length).toBeGreaterThan(100);
  });

  test('Contact page loads and has content', async ({ page }) => {
    await page.goto('/contact');
    
    await expect(page.locator('main, body').first()).toBeVisible();
    
    // Should have contact content
    const content = await page.locator('main, body').first().textContent();
    expect(content).toContain('Contact');
    expect(content?.length).toBeGreaterThan(100);
  });

  test('Footer contains expected content', async ({ page }) => {
    await page.goto('/');
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Footer should have substantial content
    const footerText = await footer.textContent();
    expect(footerText?.length).toBeGreaterThan(50);
  });

  test('Header navigation is consistent across pages', async ({ page }) => {
    const pages = ['/', '/about', '/team', '/news'];
    
    for (const url of pages) {
      await page.goto(url);
      
      // Header should be present
      await expect(page.locator('header').first()).toBeVisible();
      
      // Should contain navigation links
      const headerText = await page.locator('header').textContent();
      expect(headerText).toContain('About');
      expect(headerText).toContain('Team');
    }
  });

  test('Pages have proper meta information', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/America's Tapestry/);
    
    await page.goto('/about');
    await expect(page).toHaveTitle(/America's Tapestry/);
  });

  test('Mobile responsive - basic functionality', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Should still load on mobile
    await expect(page.locator('main, body').first()).toBeVisible();
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    
    // Content should still be present
    const content = await page.locator('body').textContent();
    expect(content?.length).toBeGreaterThan(200);
  });
});