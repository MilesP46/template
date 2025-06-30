# Visual Regression Testing

This directory contains comprehensive visual regression tests for all migrated UI components from Doctor-Dok (shadcn/ui + Tailwind) to Bootstrap 5 + React Bootstrap.

## Test Structure

```
visual/
├── ui-components.spec.ts      # Foundation UI component tests
├── auth-components.spec.ts    # Authentication component tests
├── layout-components.spec.ts  # Layout and navigation tests
├── run-visual-tests.ts        # Test runner and report generator
└── README.md                  # This file
```

## Components Tested

### Foundation UI (ui-components.spec.ts)
- **Button**: All variants (default, destructive, outline, secondary, ghost, link)
- **Input**: Text, password, email types with focus/disabled states
- **Label**: Default and htmlFor functionality
- **Checkbox**: Checked, unchecked, disabled states
- **Card**: Header, body, footer variations

### Auth Components (auth-components.spec.ts)
- **AuthorizationGuard**: Loading, authenticated, unauthenticated states
- **AuthorizeDatabaseForm**: Form validation, submission, error states
- **AuthorizePopup**: Modal functionality, tab switching

### Layout Components (layout-components.spec.ts)
- **TopNavigationBar**: Theme toggle, user menu, responsive behavior
- **AdminLayout**: Sidebar collapse, content scrolling
- **AuthLayout**: Centered authentication layout
- **Footer**: Responsive footer with links

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Execute Tests
```bash
# Run all visual regression tests
npm run test:visual

# Run specific test file
npx playwright test tests/visual/ui-components.spec.ts

# Run with UI mode for debugging
npx playwright test --ui

# Generate and view HTML report
npx playwright show-report
```

### Test Configuration
The tests are configured in `playwright.visual.config.ts` with:
- Screenshot comparison threshold: 0.2
- Max pixel difference: 100
- Animations disabled for consistency
- Multiple browser testing (Chrome, Firefox, Safari, Edge)
- Responsive viewport testing

## Test Scenarios

Each component is tested for:
1. **Visual Consistency**
   - Default rendering
   - All prop variations
   - Interactive states (hover, focus, active)
   - Disabled states

2. **Theme Support**
   - Light theme rendering
   - Dark theme rendering
   - Theme transition smoothness

3. **Responsive Design**
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1920x1080)

4. **Cross-browser Compatibility**
   - Chrome (Windows, Mac, Linux)
   - Firefox (Windows, Mac, Linux)
   - Safari (Mac, iOS)
   - Edge (Windows)

## Screenshot Management

Screenshots are stored in:
```
tests/visual/__screenshots__/
├── ui-components/
├── auth-components/
└── layout-components/
```

### Updating Baseline Screenshots
```bash
# Update all screenshots
npx playwright test --update-snapshots

# Update specific test screenshots
npx playwright test ui-components.spec.ts --update-snapshots
```

## Writing New Tests

### Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Name - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path-to-component');
    await page.waitForLoadState('networkidle');
  });

  test('should match default state', async ({ page }) => {
    const component = page.locator('[data-testid="component"]');
    await expect(component).toHaveScreenshot('component-default.png');
  });

  test('should match dark theme', async ({ page }) => {
    await page.click('[data-theme-toggle]');
    await page.waitForTimeout(100); // Wait for transition
    
    const component = page.locator('[data-testid="component"]');
    await expect(component).toHaveScreenshot('component-dark.png');
  });
});
```

## Best Practices

1. **Consistent Test IDs**: Use `data-testid` attributes for reliable element selection
2. **Wait for Stability**: Use `waitForLoadState('networkidle')` before screenshots
3. **Handle Animations**: Disable or wait for animations to complete
4. **Meaningful Names**: Use descriptive screenshot names that indicate state
5. **Isolated Tests**: Each test should be independent and not rely on others

## Troubleshooting

### Common Issues

1. **Flaky Screenshots**
   - Increase wait times for dynamic content
   - Disable animations in test environment
   - Use more specific locators

2. **Browser Differences**
   - Some pixel differences are expected between browsers
   - Adjust threshold if needed for specific browsers
   - Document known browser-specific variations

3. **Resolution Differences**
   - Ensure consistent viewport sizes
   - Use device emulation for mobile tests
   - Consider high-DPI display differences

## CI/CD Integration

The visual regression tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Visual Tests
  run: |
    npx playwright install --with-deps
    npm run test:visual
  
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Maintenance

### Regular Tasks
1. Review and update baseline screenshots quarterly
2. Add tests for new components immediately
3. Remove tests for deprecated components
4. Monitor test execution time and optimize

### Performance Targets
- Individual test: < 5 seconds
- Full suite: < 5 minutes
- Screenshot comparison: < 100ms per image

---

For more information, see the [Phase 3 Testing Strategy](/docs/architecture/phase3/TESTING_STRATEGY.md).