import { test, expect } from '@playwright/test';

test.describe('Foundation UI Components - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page where components are displayed
    await page.goto('/theme-test');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Button Component', () => {
    test('should match all button variants', async ({ page }) => {
      // Default button
      const defaultButton = page.locator('button:has-text("Default")').first();
      await expect(defaultButton).toHaveScreenshot('button-default.png');

      // Destructive button
      const destructiveButton = page.locator('button:has-text("Destructive")').first();
      await expect(destructiveButton).toHaveScreenshot('button-destructive.png');

      // Outline button
      const outlineButton = page.locator('button:has-text("Outline")').first();
      await expect(outlineButton).toHaveScreenshot('button-outline.png');

      // Secondary button
      const secondaryButton = page.locator('button:has-text("Secondary")').first();
      await expect(secondaryButton).toHaveScreenshot('button-secondary.png');

      // Ghost button
      const ghostButton = page.locator('button:has-text("Ghost")').first();
      await expect(ghostButton).toHaveScreenshot('button-ghost.png');

      // Link button
      const linkButton = page.locator('button:has-text("Link")').first();
      await expect(linkButton).toHaveScreenshot('button-link.png');
    });

    test('should match button hover states', async ({ page }) => {
      const button = page.locator('button:has-text("Default")').first();
      await button.hover();
      await expect(button).toHaveScreenshot('button-default-hover.png');
    });

    test('should match button disabled states', async ({ page }) => {
      const disabledButton = page.locator('button[disabled]').first();
      await expect(disabledButton).toHaveScreenshot('button-disabled.png');
    });

    test('should match button sizes', async ({ page }) => {
      // Small button
      const smallButton = page.locator('button.btn-sm').first();
      await expect(smallButton).toHaveScreenshot('button-small.png');

      // Default size
      const defaultSizeButton = page.locator('button:not(.btn-sm):not(.btn-lg)').first();
      await expect(defaultSizeButton).toHaveScreenshot('button-default-size.png');

      // Large button
      const largeButton = page.locator('button.btn-lg').first();
      await expect(largeButton).toHaveScreenshot('button-large.png');
    });
  });

  test.describe('Input Component', () => {
    test('should match input default state', async ({ page }) => {
      const input = page.locator('input[type="text"]').first();
      await expect(input).toHaveScreenshot('input-default.png');
    });

    test('should match input focus state', async ({ page }) => {
      const input = page.locator('input[type="text"]').first();
      await input.focus();
      await expect(input).toHaveScreenshot('input-focus.png');
    });

    test('should match input with value', async ({ page }) => {
      const input = page.locator('input[type="text"]').first();
      await input.fill('Test value');
      await expect(input).toHaveScreenshot('input-with-value.png');
    });

    test('should match input disabled state', async ({ page }) => {
      const disabledInput = page.locator('input[disabled]').first();
      await expect(disabledInput).toHaveScreenshot('input-disabled.png');
    });

    test('should match password input', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]').first();
      await expect(passwordInput).toHaveScreenshot('input-password.png');
    });

    test('should match email input', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toHaveScreenshot('input-email.png');
    });
  });

  test.describe('Label Component', () => {
    test('should match label default state', async ({ page }) => {
      const label = page.locator('label').first();
      await expect(label).toHaveScreenshot('label-default.png');
    });

    test('should match label with htmlFor', async ({ page }) => {
      const label = page.locator('label[for]').first();
      await expect(label).toHaveScreenshot('label-with-for.png');
    });
  });

  test.describe('Checkbox Component', () => {
    test('should match checkbox unchecked state', async ({ page }) => {
      const checkbox = page.locator('input[type="checkbox"]:not(:checked)').first();
      const checkboxContainer = checkbox.locator('..');
      await expect(checkboxContainer).toHaveScreenshot('checkbox-unchecked.png');
    });

    test('should match checkbox checked state', async ({ page }) => {
      const checkbox = page.locator('input[type="checkbox"]').first();
      await checkbox.check();
      const checkboxContainer = checkbox.locator('..');
      await expect(checkboxContainer).toHaveScreenshot('checkbox-checked.png');
    });

    test('should match checkbox disabled state', async ({ page }) => {
      const disabledCheckbox = page.locator('input[type="checkbox"][disabled]').first();
      const checkboxContainer = disabledCheckbox.locator('..');
      await expect(checkboxContainer).toHaveScreenshot('checkbox-disabled.png');
    });
  });

  test.describe('Card Component', () => {
    test('should match card default state', async ({ page }) => {
      const card = page.locator('.card').first();
      await expect(card).toHaveScreenshot('card-default.png');
    });

    test('should match card with header', async ({ page }) => {
      const cardWithHeader = page.locator('.card:has(.card-header)').first();
      await expect(cardWithHeader).toHaveScreenshot('card-with-header.png');
    });

    test('should match card with footer', async ({ page }) => {
      const cardWithFooter = page.locator('.card:has(.card-footer)').first();
      await expect(cardWithFooter).toHaveScreenshot('card-with-footer.png');
    });

    test('should match card with full content', async ({ page }) => {
      const fullCard = page.locator('.card:has(.card-header):has(.card-body):has(.card-footer)').first();
      await expect(fullCard).toHaveScreenshot('card-full.png');
    });
  });

  test.describe('Dark Theme - UI Components', () => {
    test.beforeEach(async ({ page }) => {
      // Toggle to dark theme
      await page.click('[data-theme-toggle]');
      await page.waitForTimeout(100); // Wait for theme transition
    });

    test('should match button in dark theme', async ({ page }) => {
      const button = page.locator('button:has-text("Default")').first();
      await expect(button).toHaveScreenshot('button-default-dark.png');
    });

    test('should match input in dark theme', async ({ page }) => {
      const input = page.locator('input[type="text"]').first();
      await expect(input).toHaveScreenshot('input-default-dark.png');
    });

    test('should match card in dark theme', async ({ page }) => {
      const card = page.locator('.card').first();
      await expect(card).toHaveScreenshot('card-default-dark.png');
    });
  });

  test.describe('Responsive Design - Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should match button on mobile', async ({ page }) => {
      const button = page.locator('button:has-text("Default")').first();
      await expect(button).toHaveScreenshot('button-default-mobile.png');
    });

    test('should match input on mobile', async ({ page }) => {
      const input = page.locator('input[type="text"]').first();
      await expect(input).toHaveScreenshot('input-default-mobile.png');
    });

    test('should match card on mobile', async ({ page }) => {
      const card = page.locator('.card').first();
      await expect(card).toHaveScreenshot('card-default-mobile.png');
    });
  });

  test.describe('Responsive Design - Tablet', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should match button on tablet', async ({ page }) => {
      const button = page.locator('button:has-text("Default")').first();
      await expect(button).toHaveScreenshot('button-default-tablet.png');
    });

    test('should match input on tablet', async ({ page }) => {
      const input = page.locator('input[type="text"]').first();
      await expect(input).toHaveScreenshot('input-default-tablet.png');
    });

    test('should match card on tablet', async ({ page }) => {
      const card = page.locator('.card').first();
      await expect(card).toHaveScreenshot('card-default-tablet.png');
    });
  });
});