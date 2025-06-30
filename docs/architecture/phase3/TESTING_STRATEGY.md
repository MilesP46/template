# Phase 3 Testing Strategy

## Overview

This document outlines the comprehensive testing approach for validating migrated components during Phase 3.

## Testing Levels

### 1. Unit Testing

#### Objective
Verify individual components work correctly in isolation.

#### Tools
- Jest + React Testing Library
- Vitest (if preferred)
- Bootstrap testing utilities

#### Test Structure
```typescript
// Example: Button component tests
describe('Button (Migrated)', () => {
  // Props and Rendering
  it('renders with default props', () => {})
  it('applies correct Bootstrap variant classes', () => {})
  it('handles all size variations', () => {})
  it('forwards ref correctly', () => {})
  
  // Events
  it('calls onClick when clicked', () => {})
  it('respects disabled state', () => {})
  
  // Styling
  it('applies custom className', () => {})
  it('maintains style compatibility', () => {})
  
  // Accessibility
  it('has proper ARIA attributes', () => {})
  it('supports keyboard navigation', () => {})
})
```

#### Coverage Requirements
- Minimum 80% code coverage
- 100% coverage for critical paths
- All props tested
- All event handlers tested

### 2. Visual Regression Testing

#### Objective
Ensure visual consistency during migration.

#### Tools
- Storybook + Chromatic
- Percy (alternative)
- Jest screenshots

#### Implementation
```typescript
// Button.stories.tsx
export default {
  title: 'Migrated/UI/Button',
  component: Button,
  parameters: {
    chromatic: { viewports: [320, 768, 1200] }
  }
}

export const AllVariants = () => (
  <div className="d-flex flex-column gap-3">
    <Button>Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="danger">Danger (was destructive)</Button>
    <Button variant="outline-primary">Outline</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button disabled>Disabled</Button>
  </div>
)

export const ComparisonWithLegacy = () => (
  <div className="d-flex gap-4">
    <div>
      <h3>Legacy (Doctor-Dok)</h3>
      <LegacyButton variant="destructive">Delete</LegacyButton>
    </div>
    <div>
      <h3>Migrated (Bootstrap)</h3>
      <Button variant="danger">Delete</Button>
    </div>
  </div>
)
```

### 3. Integration Testing

#### Objective
Verify components work correctly together.

#### Key Test Scenarios

##### Form Integration
```typescript
describe('AuthorizeDatabaseForm Integration', () => {
  it('submits form with all fields', async () => {
    const onSubmit = jest.fn()
    render(<AuthorizeDatabaseForm onSubmit={onSubmit} />)
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Database ID'), 'test123')
    await userEvent.type(screen.getByLabelText('Key'), 'password123')
    await userEvent.click(screen.getByLabelText('Keep me logged in'))
    
    // Submit
    await userEvent.click(screen.getByText('Open database'))
    
    // Verify
    expect(onSubmit).toHaveBeenCalledWith({
      databaseId: 'test123',
      key: 'password123',
      keepLoggedIn: true
    })
  })
  
  it('shows validation errors', async () => {})
  it('integrates with react-hook-form', () => {})
})
```

##### Navigation Integration
```typescript
describe('TopHeader Integration', () => {
  it('renders all navigation elements', () => {})
  it('handles theme switching', () => {})
  it('shows user menu on click', () => {})
  it('integrates with auth context', () => {})
})
```

### 4. End-to-End Testing

#### Objective
Validate complete user flows work correctly.

#### Tools
- Playwright
- Cypress (alternative)

#### Critical User Flows

##### Auth Flow E2E
```typescript
test('Complete authentication flow', async ({ page }) => {
  // Navigate to login
  await page.goto('/login')
  
  // Fill login form
  await page.fill('[data-testid="database-id"]', 'testdb')
  await page.fill('[data-testid="password"]', 'testpass123')
  await page.check('[data-testid="keep-logged-in"]')
  
  // Submit
  await page.click('[data-testid="submit-auth"]')
  
  // Verify redirect
  await expect(page).toHaveURL('/dashboard')
  
  // Verify auth state
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
})
```

##### Data Management Flow
```typescript
test('Create and view record', async ({ page }) => {
  // Authenticate first
  await authenticate(page)
  
  // Create record
  await page.click('[data-testid="create-record"]')
  await page.fill('[data-testid="record-title"]', 'Test Record')
  await page.fill('[data-testid="record-content"]', 'Test content')
  await page.click('[data-testid="save-record"]')
  
  // Verify creation
  await expect(page.locator('text=Record created')).toBeVisible()
  
  // View record
  await page.click('text=Test Record')
  await expect(page.locator('[data-testid="record-detail"]')).toContainText('Test content')
})
```

### 5. Performance Testing

#### Metrics to Track
- Component render time
- Bundle size impact
- Memory usage
- Time to interactive

#### Implementation
```typescript
// Performance benchmark
describe('Performance Benchmarks', () => {
  it('Button renders under 16ms', () => {
    const start = performance.now()
    render(<Button>Test</Button>)
    const end = performance.now()
    expect(end - start).toBeLessThan(16)
  })
  
  it('Form with 10 fields renders under 50ms', () => {})
  it('List with 100 items renders under 100ms', () => {})
})
```

#### Bundle Size Monitoring
```bash
# Before migration
npm run build && npm run analyze
# Record: main.js = 250KB

# After component migration
npm run build && npm run analyze
# Target: main.js < 275KB (< 10% increase)
```

### 6. Accessibility Testing

#### Tools
- axe-core / jest-axe
- WAVE
- Manual screen reader testing

#### Test Cases
```typescript
describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<AuthorizeDatabaseForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('supports keyboard navigation', () => {})
  it('has proper ARIA labels', () => {})
  it('maintains focus management', () => {})
})
```

## Testing Checklist per Component

```markdown
### Component: [ComponentName]

#### Unit Tests
- [ ] All props tested
- [ ] All events tested
- [ ] Error states tested
- [ ] Loading states tested
- [ ] Edge cases covered

#### Visual Tests
- [ ] Desktop viewport
- [ ] Tablet viewport
- [ ] Mobile viewport
- [ ] Dark theme (if applicable)
- [ ] High contrast mode

#### Integration Tests
- [ ] Parent component integration
- [ ] Child component integration
- [ ] Context/state integration
- [ ] Router integration (if applicable)

#### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader tested
- [ ] ARIA compliance
- [ ] Color contrast

#### Performance Tests
- [ ] Render performance
- [ ] Re-render optimization
- [ ] Bundle size impact
- [ ] Memory leaks

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Chrome Android
```

## Test Data Management

### Fixtures
```typescript
// test/fixtures/auth.fixtures.ts
export const mockAuthForm = {
  valid: {
    databaseId: 'testdb123',
    key: 'ValidPass123!',
    keepLoggedIn: true
  },
  invalid: {
    databaseId: 'bad',
    key: 'weak',
    keepLoggedIn: false
  }
}

// test/fixtures/records.fixtures.ts
export const mockRecords = [
  { id: 1, title: 'Test Record 1', content: 'Content 1' },
  { id: 2, title: 'Test Record 2', content: 'Content 2' }
]
```

### Test Utilities
```typescript
// test/utils/render.tsx
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {ui}
        </Router>
      </AuthProvider>
    </ThemeProvider>,
    options
  )
}
```

## Continuous Integration

### CI Pipeline
```yaml
# .github/workflows/migration-tests.yml
name: Migration Tests

on:
  pull_request:
    paths:
      - 'apps/combined-template/**'
      - 'packages/shared-auth/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Unit tests
        run: npm run test:unit -- --coverage
        
      - name: Visual tests
        run: npm run test:visual
        
      - name: Build
        run: npm run build
        
      - name: Bundle size check
        run: npm run bundlesize
        
      - name: E2E tests
        run: npm run test:e2e
```

### Quality Gates
- All tests must pass
- Code coverage > 80%
- No visual regressions
- Bundle size increase < 10%
- No accessibility violations
- Performance benchmarks met

## Rollback Testing

### Smoke Tests for Rollback
```typescript
describe('Rollback Smoke Tests', () => {
  it('Legacy components still work', () => {})
  it('Can switch between old and new components', () => {})
  it('No data loss during switch', () => {})
  it('Authentication remains functional', () => {})
})
```

## Test Reporting

### Metrics to Track
- Test coverage percentage
- Number of visual differences
- Performance benchmark results
- Accessibility violation count
- Bundle size delta
- Test execution time

### Dashboard Example
```
Phase 3 Migration Testing Dashboard
===================================
Component: Button
- Unit Test Coverage: 95% ✅
- Visual Regression: 0 differences ✅
- Performance: 12ms render ✅
- Accessibility: 0 violations ✅
- Bundle Impact: +0.5KB ✅

Component: AuthorizeDatabaseForm
- Unit Test Coverage: 87% ✅
- Visual Regression: 2 minor differences ⚠️
- Performance: 45ms render ✅
- Accessibility: 0 violations ✅
- Bundle Impact: +2.1KB ✅
```

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Storybook Testing](https://storybook.js.org/docs/react/writing-tests/introduction)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Bootstrap Testing Guide](https://getbootstrap.com/docs/5.0/getting-started/javascript/#testing)