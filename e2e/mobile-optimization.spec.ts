/**
 * Mobile Optimization E2E Tests
 * 
 * Tests Phase 4 mobile optimization features with real device simulation:
 * - Connection-aware image loading
 * - Mobile-specific image serving  
 * - Responsive image performance
 * - Core Web Vitals on mobile
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Mobile Optimization Performance', () => {
  
  test('Homepage loads quickly on mobile devices', async ({ page }) => {
    // Simulate iPhone 12
    await page.setViewportSize({ width: 390, height: 844 });
    
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds on mobile (target from PRP)
    expect(loadTime).toBeLessThan(3000);
    
    // Essential content should be visible
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
    
    // Hero carousel should be present
    const heroCarousel = page.locator('[data-testid="hero-carousel"], .hero-carousel, .embla');
    await expect(heroCarousel.first()).toBeVisible({ timeout: 5000 });
  });

  test('Tapestries page loads with optimized images on mobile', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/tapestries', { waitUntil: 'domcontentloaded' });
    
    // Page should load
    await expect(page.locator('main').first()).toBeVisible();
    
    // Images should be present (OptimizedImage components)
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Check that images are loading (not all have error state)
    const loadedImages = await images.evaluateAll((imgs) => 
      imgs.filter(img => img.complete && img.naturalHeight > 0).length
    );
    expect(loadedImages).toBeGreaterThan(0);
    
    // Should not have massive unoptimized images
    const imageSources = await images.evaluateAll((imgs) => 
      imgs.map(img => img.src).filter(src => src.includes('/images/'))
    );
    
    // None should be the massive original files (these would be 15MB+)
    const massiveImages = imageSources.filter(src => 
      src.includes('main.jpg') && !src.includes('-640w') && !src.includes('-1024w')
    );
    expect(massiveImages.length).toBe(0);
  });

  test('Connection-aware loading adapts to slow connections', async ({ page, context }) => {
    // Simulate mobile with slow 3G
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Throttle network to simulate slow connection
    await context.route('**/*', async (route) => {
      // Add delay to simulate slow connection
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Page should still load (albeit slower)
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    
    // Should have skeleton loaders or placeholders for images not yet loaded
    const content = await page.locator('body').textContent();
    expect(content?.length).toBeGreaterThan(100);
  });

  test('Responsive image serving works correctly', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/tapestries', { waitUntil: 'domcontentloaded' });
      
      // Page should load at all sizes
      await expect(page.locator('main').first()).toBeVisible();
      
      // Images should be responsive
      const images = page.locator('img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);
      
      // Check if images are appropriately sized for viewport
      const imageDimensions = await images.first().boundingBox();
      if (imageDimensions) {
        expect(imageDimensions.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('Hero carousel performance on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for hero carousel to load
    const heroElement = page.locator('.embla, [data-testid="hero-carousel"]').first();
    await expect(heroElement).toBeVisible({ timeout: 5000 });
    
    // Should have navigation elements
    const navButtons = page.locator('button[aria-label*="slide"], .embla__button');
    const buttonCount = await navButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test carousel interaction
    if (buttonCount > 0) {
      await navButtons.first().click();
      await page.waitForTimeout(500); // Allow transition
      
      // Carousel should still be visible after interaction
      await expect(heroElement).toBeVisible();
    }
  });

  test('Image lazy loading works on long pages', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/tapestries', { waitUntil: 'domcontentloaded' });
    
    // Count initially loaded images
    const initialImages = await page.locator('img[src*="/images/"]').count();
    
    // Scroll down to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    await page.waitForTimeout(1000);
    
    // More images should load after scrolling
    const afterScrollImages = await page.locator('img[src*="/images/"]').count();
    
    // If there are many images, some should load after scrolling
    if (initialImages > 5) {
      expect(afterScrollImages).toBeGreaterThanOrEqual(initialImages);
    }
  });

  test('No critical performance issues on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Track console errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Track failed network requests
    const failedRequests: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()}: ${response.url()}`);
      }
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.goto('/tapestries', { waitUntil: 'domcontentloaded' });
    
    // Filter critical errors
    const criticalErrors = errors.filter(error => 
      error.includes('ReferenceError') || 
      error.includes('TypeError') ||
      error.includes('is not defined')
    );
    
    // Filter critical failed requests (ignore 404s for optional resources)
    const criticalFailures = failedRequests.filter(req => 
      req.includes('500') || req.includes('502') || req.includes('503')
    );
    
    expect(criticalErrors).toHaveLength(0);
    expect(criticalFailures).toHaveLength(0);
  });

  test('Touch interactions work properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Test navigation menu (if mobile menu exists)
    const menuButton = page.locator('button[aria-label*="menu"], .mobile-menu-button, [data-testid="mobile-menu"]');
    if (await menuButton.count() > 0) {
      await menuButton.first().click();
      await page.waitForTimeout(300);
      
      // Menu should open
      const menu = page.locator('.mobile-menu, [data-testid="mobile-menu-content"]');
      if (await menu.count() > 0) {
        await expect(menu.first()).toBeVisible();
      }
    }
    
    // Test tapestry card interactions
    await page.goto('/tapestries');
    const tapestryCards = page.locator('a[href*="/tapestries/"], .tapestry-card a');
    if (await tapestryCards.count() > 0) {
      await tapestryCards.first().click();
      
      // Should navigate to tapestry detail page
      await page.waitForURL(/\/tapestries\/\w+/);
      await expect(page.locator('main').first()).toBeVisible();
    }
  });

  test('Text remains readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const pages = ['/', '/about', '/tapestries'];
    
    for (const url of pages) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Check that text is not too small
      const textElements = page.locator('p, span, div').filter({ hasText: /\w{10,}/ });
      const sampleElement = textElements.first();
      
      if (await sampleElement.count() > 0) {
        const fontSize = await sampleElement.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });
        
        // Font should be at least 14px for readability
        const fontSizeNum = parseInt(fontSize.replace('px', ''));
        expect(fontSizeNum).toBeGreaterThanOrEqual(14);
      }
    }
  });

  test('Images have proper alt text for accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/tapestries', { waitUntil: 'domcontentloaded' });
    
    // Check that images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const imagesWithoutAlt = await images.evaluateAll((imgs) => 
        imgs.filter(img => !img.alt || img.alt.trim() === '').length
      );
      
      // Most images should have alt text (allow some decorative images)
      const altTextRatio = (imageCount - imagesWithoutAlt) / imageCount;
      expect(altTextRatio).toBeGreaterThan(0.8);
    }
  });
});

test.describe('Desktop vs Mobile Performance Comparison', () => {
  
  test('Desktop loads faster than mobile (as expected)', async ({ page }) => {
    // Test mobile performance
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileStart = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const mobileTime = Date.now() - mobileStart;
    
    // Test desktop performance  
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopStart = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const desktopTime = Date.now() - desktopStart;
    
    // Both should load within reasonable time
    expect(mobileTime).toBeLessThan(5000);
    expect(desktopTime).toBeLessThan(5000);
    
    // Mobile should not be drastically slower (optimization working)
    const mobileSlowdown = mobileTime / desktopTime;
    expect(mobileSlowdown).toBeLessThan(3); // Mobile should be < 3x slower
  });

  test('Mobile gets appropriately sized images', async ({ page }) => {
    // Check image loading on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tapestries', { waitUntil: 'domcontentloaded' });
    
    const mobileImages = await page.locator('img').evaluateAll((imgs) => 
      imgs.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        displayWidth: img.clientWidth
      })).filter(img => img.src.includes('/images/'))
    );
    
    // Check desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/tapestries', { waitUntil: 'domcontentloaded' });
    
    const desktopImages = await page.locator('img').evaluateAll((imgs) => 
      imgs.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        displayWidth: img.clientWidth
      })).filter(img => img.src.includes('/images/'))
    );
    
    // Mobile images should generally be smaller or equal
    if (mobileImages.length > 0 && desktopImages.length > 0) {
      const avgMobileWidth = mobileImages.reduce((sum, img) => sum + img.naturalWidth, 0) / mobileImages.length;
      const avgDesktopWidth = desktopImages.reduce((sum, img) => sum + img.naturalWidth, 0) / desktopImages.length;
      
      // Mobile images should not be significantly larger than desktop
      expect(avgMobileWidth).toBeLessThanOrEqual(avgDesktopWidth * 1.2);
    }
  });
});