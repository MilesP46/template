import { test, expect } from '@playwright/test';

test.describe('Auth Components - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
  });

  test.describe('AuthorizationGuard Component', () => {
    test('should match loading state', async ({ page }) => {
      // Force loading state by intercepting the auth check
      await page.route('**/api/auth/verify', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({ status: 200, body: JSON.stringify({ authenticated: false }) });
      });

      const loadingState = page.locator('[data-testid="auth-loading"]');
      await expect(loadingState).toBeVisible();
      await expect(loadingState).toHaveScreenshot('authorization-guard-loading.png');
    });

    test('should match unauthenticated state', async ({ page }) => {
      const unauthView = page.locator('[data-testid="auth-unauthorized"]');
      await expect(unauthView).toBeVisible();
      await expect(unauthView).toHaveScreenshot('authorization-guard-unauthorized.png');
    });

    test('should match authenticated state', async ({ page }) => {
      // Mock authenticated response
      await page.route('**/api/auth/verify', async route => {
        await route.fulfill({ 
          status: 200, 
          body: JSON.stringify({ authenticated: true, user: { email: 'test@example.com' } }) 
        });
      });

      await page.reload();
      const authView = page.locator('[data-testid="auth-authorized"]');
      await expect(authView).toBeVisible();
      await expect(authView).toHaveScreenshot('authorization-guard-authorized.png');
    });
  });

  test.describe('AuthorizePopup Component', () => {
    test.beforeEach(async ({ page }) => {
      // Open the authorize popup
      await page.click('[data-testid="open-auth-modal"]');
      await page.waitForSelector('.modal.show');
    });

    test('should match modal default state', async ({ page }) => {
      const modal = page.locator('.modal.show');
      await expect(modal).toHaveScreenshot('authorize-popup-default.png');
    });

    test('should match login tab', async ({ page }) => {
      await page.click('[data-testid="login-tab"]');
      const loginForm = page.locator('[data-testid="login-form"]');
      await expect(loginForm).toHaveScreenshot('authorize-popup-login.png');
    });

    test('should match register tab', async ({ page }) => {
      await page.click('[data-testid="register-tab"]');
      const registerForm = page.locator('[data-testid="register-form"]');
      await expect(registerForm).toHaveScreenshot('authorize-popup-register.png');
    });

    test('should match form validation errors', async ({ page }) => {
      // Submit empty form to trigger validation
      await page.click('[data-testid="login-submit"]');
      await page.waitForTimeout(100); // Wait for validation messages
      
      const formWithErrors = page.locator('[data-testid="login-form"]');
      await expect(formWithErrors).toHaveScreenshot('authorize-popup-validation-errors.png');
    });

    test('should match modal on mobile', async ({ page, viewport }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const modal = page.locator('.modal.show');
      await expect(modal).toHaveScreenshot('authorize-popup-mobile.png');
    });
  });

  test.describe('AuthorizeDatabaseForm Component', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a page with the database form
      await page.goto('/auth/database');
      await page.waitForLoadState('networkidle');
    });

    test('should match form default state', async ({ page }) => {
      const form = page.locator('[data-testid="database-auth-form"]');
      await expect(form).toHaveScreenshot('authorize-database-form-default.png');
    });

    test('should match form with filled values', async ({ page }) => {
      await page.fill('[name="databaseId"]', 'test-database-123');
      await page.fill('[name="email"]', 'user@example.com');
      await page.fill('[name="password"]', 'SecurePassword123!');
      await page.fill('[name="masterKey"]', 'MasterKey123!@#');
      
      const form = page.locator('[data-testid="database-auth-form"]');
      await expect(form).toHaveScreenshot('authorize-database-form-filled.png');
    });

    test('should match form with validation errors', async ({ page }) => {
      // Submit empty form
      await page.click('[type="submit"]');
      await page.waitForTimeout(100);
      
      const form = page.locator('[data-testid="database-auth-form"]');
      await expect(form).toHaveScreenshot('authorize-database-form-errors.png');
    });

    test('should match keep logged in option', async ({ page }) => {
      const keepLoggedIn = page.locator('[data-testid="keep-logged-in"]');
      await keepLoggedIn.click();
      
      const checkboxArea = keepLoggedIn.locator('..');
      await expect(checkboxArea).toHaveScreenshot('authorize-database-keep-logged-in.png');
    });

    test('should match loading state', async ({ page }) => {
      // Fill form and submit
      await page.fill('[name="databaseId"]', 'test-database-123');
      await page.fill('[name="email"]', 'user@example.com');
      await page.fill('[name="password"]', 'SecurePassword123!');
      await page.fill('[name="masterKey"]', 'MasterKey123!@#');
      
      // Intercept submit to keep loading state
      await page.route('**/api/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      });
      
      await page.click('[type="submit"]');
      
      const form = page.locator('[data-testid="database-auth-form"]');
      await expect(form).toHaveScreenshot('authorize-database-form-loading.png');
    });
  });

  test.describe('Dark Theme - Auth Components', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth');
      // Toggle to dark theme
      await page.click('[data-theme-toggle]');
      await page.waitForTimeout(100);
    });

    test('should match authorization guard in dark theme', async ({ page }) => {
      const authGuard = page.locator('[data-testid="auth-unauthorized"]');
      await expect(authGuard).toHaveScreenshot('authorization-guard-dark.png');
    });

    test('should match authorize popup in dark theme', async ({ page }) => {
      await page.click('[data-testid="open-auth-modal"]');
      await page.waitForSelector('.modal.show');
      
      const modal = page.locator('.modal.show');
      await expect(modal).toHaveScreenshot('authorize-popup-dark.png');
    });

    test('should match database form in dark theme', async ({ page }) => {
      await page.goto('/auth/database');
      await page.click('[data-theme-toggle]');
      await page.waitForTimeout(100);
      
      const form = page.locator('[data-testid="database-auth-form"]');
      await expect(form).toHaveScreenshot('authorize-database-form-dark.png');
    });
  });

  test.describe('Responsive Design - Auth Components', () => {
    test.describe('Mobile View', () => {
      test.use({ viewport: { width: 375, height: 667 } });

      test('should match authorization guard on mobile', async ({ page }) => {
        const authGuard = page.locator('[data-testid="auth-unauthorized"]');
        await expect(authGuard).toHaveScreenshot('authorization-guard-mobile.png');
      });

      test('should match database form on mobile', async ({ page }) => {
        await page.goto('/auth/database');
        const form = page.locator('[data-testid="database-auth-form"]');
        await expect(form).toHaveScreenshot('authorize-database-form-mobile.png');
      });
    });

    test.describe('Tablet View', () => {
      test.use({ viewport: { width: 768, height: 1024 } });

      test('should match authorization guard on tablet', async ({ page }) => {
        const authGuard = page.locator('[data-testid="auth-unauthorized"]');
        await expect(authGuard).toHaveScreenshot('authorization-guard-tablet.png');
      });

      test('should match database form on tablet', async ({ page }) => {
        await page.goto('/auth/database');
        const form = page.locator('[data-testid="database-auth-form"]');
        await expect(form).toHaveScreenshot('authorize-database-form-tablet.png');
      });
    });
  });
});