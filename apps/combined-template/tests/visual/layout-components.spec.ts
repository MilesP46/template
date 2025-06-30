import { test, expect } from '@playwright/test';

test.describe('Layout Components - Visual Regression', () => {
  test.describe('TopNavigationBar Component', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('should match navigation bar default state', async ({ page }) => {
      const navbar = page.locator('[data-testid="top-navigation-bar"]');
      await expect(navbar).toHaveScreenshot('navigation-bar-default.png');
    });

    test('should match navigation bar with user menu open', async ({ page }) => {
      await page.click('[data-testid="user-menu-toggle"]');
      await page.waitForSelector('.dropdown-menu.show');
      
      const navbar = page.locator('[data-testid="top-navigation-bar"]');
      await expect(navbar).toHaveScreenshot('navigation-bar-user-menu.png');
    });

    test('should match navigation bar with notifications', async ({ page }) => {
      await page.click('[data-testid="notifications-toggle"]');
      await page.waitForSelector('.dropdown-menu.show');
      
      const navbar = page.locator('[data-testid="top-navigation-bar"]');
      await expect(navbar).toHaveScreenshot('navigation-bar-notifications.png');
    });

    test('should match theme toggle button', async ({ page }) => {
      const themeToggle = page.locator('[data-theme-toggle]');
      await expect(themeToggle).toHaveScreenshot('theme-toggle-light.png');
      
      // Toggle to dark theme
      await themeToggle.click();
      await page.waitForTimeout(100);
      await expect(themeToggle).toHaveScreenshot('theme-toggle-dark.png');
    });

    test('should match mobile navigation', async ({ page, viewport }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const navbar = page.locator('[data-testid="top-navigation-bar"]');
      await expect(navbar).toHaveScreenshot('navigation-bar-mobile-closed.png');
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-toggle"]');
      await page.waitForTimeout(300); // Wait for animation
      await expect(navbar).toHaveScreenshot('navigation-bar-mobile-open.png');
    });
  });

  test.describe('AdminLayout Component', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('should match admin layout default state', async ({ page }) => {
      const layout = page.locator('[data-testid="admin-layout"]');
      await expect(layout).toHaveScreenshot('admin-layout-default.png');
    });

    test('should match admin layout with sidebar collapsed', async ({ page }) => {
      await page.click('[data-testid="sidebar-toggle"]');
      await page.waitForTimeout(300); // Wait for animation
      
      const layout = page.locator('[data-testid="admin-layout"]');
      await expect(layout).toHaveScreenshot('admin-layout-sidebar-collapsed.png');
    });

    test('should match admin layout with content scrolled', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);
      
      const layout = page.locator('[data-testid="admin-layout"]');
      await expect(layout).toHaveScreenshot('admin-layout-scrolled.png');
    });

    test('should match admin layout on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const layout = page.locator('[data-testid="admin-layout"]');
      await expect(layout).toHaveScreenshot('admin-layout-tablet.png');
    });

    test('should match admin layout on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const layout = page.locator('[data-testid="admin-layout"]');
      await expect(layout).toHaveScreenshot('admin-layout-mobile.png');
    });
  });

  test.describe('AuthLayout Component', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
    });

    test('should match auth layout default state', async ({ page }) => {
      const layout = page.locator('[data-testid="auth-layout"]');
      await expect(layout).toHaveScreenshot('auth-layout-default.png');
    });

    test('should match auth layout with form', async ({ page }) => {
      // Ensure form is visible
      await page.waitForSelector('[data-testid="auth-form"]');
      
      const layout = page.locator('[data-testid="auth-layout"]');
      await expect(layout).toHaveScreenshot('auth-layout-with-form.png');
    });

    test('should match auth layout on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const layout = page.locator('[data-testid="auth-layout"]');
      await expect(layout).toHaveScreenshot('auth-layout-mobile.png');
    });

    test('should match auth layout on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const layout = page.locator('[data-testid="auth-layout"]');
      await expect(layout).toHaveScreenshot('auth-layout-tablet.png');
    });
  });

  test.describe('Footer Component', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
    });

    test('should match footer default state', async ({ page }) => {
      const footer = page.locator('[data-testid="footer"]');
      await expect(footer).toHaveScreenshot('footer-default.png');
    });

    test('should match footer with links', async ({ page }) => {
      const footerLinks = page.locator('[data-testid="footer-links"]');
      await expect(footerLinks).toHaveScreenshot('footer-links.png');
    });

    test('should match footer on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
      
      const footer = page.locator('[data-testid="footer"]');
      await expect(footer).toHaveScreenshot('footer-mobile.png');
    });

    test('should match footer on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
      
      const footer = page.locator('[data-testid="footer"]');
      await expect(footer).toHaveScreenshot('footer-tablet.png');
    });
  });

  test.describe('Dark Theme - Layout Components', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.click('[data-theme-toggle]');
      await page.waitForTimeout(100);
    });

    test('should match navigation bar in dark theme', async ({ page }) => {
      const navbar = page.locator('[data-testid="top-navigation-bar"]');
      await expect(navbar).toHaveScreenshot('navigation-bar-dark.png');
    });

    test('should match admin layout in dark theme', async ({ page }) => {
      const layout = page.locator('[data-testid="admin-layout"]');
      await expect(layout).toHaveScreenshot('admin-layout-dark.png');
    });

    test('should match auth layout in dark theme', async ({ page }) => {
      await page.goto('/auth');
      await page.click('[data-theme-toggle]');
      await page.waitForTimeout(100);
      
      const layout = page.locator('[data-testid="auth-layout"]');
      await expect(layout).toHaveScreenshot('auth-layout-dark.png');
    });

    test('should match footer in dark theme', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
      
      const footer = page.locator('[data-testid="footer"]');
      await expect(footer).toHaveScreenshot('footer-dark.png');
    });
  });

  test.describe('Complete Page Layouts', () => {
    test('should match full admin page layout', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('full-admin-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match full auth page layout', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('full-auth-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match full admin page in dark theme', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-theme-toggle]');
      await page.waitForTimeout(100);
      
      await expect(page).toHaveScreenshot('full-admin-page-dark.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
});