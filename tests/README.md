# Authentication Tests

This directory contains comprehensive tests for the authentication system, covering both single-tenant and multi-tenant authentication modes.

## 📁 Directory Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── auth.test.ts       # Full auth flow tests
├── integration/           # API integration tests
│   └── auth-api.test.ts   # API behavior tests
├── performance/           # Performance benchmarks
│   └── auth-performance.test.ts
├── utils/                 # Test utilities
│   ├── auth-test-helpers.ts
│   ├── test-database.ts
│   └── test-users.ts
├── fixtures/              # Test data fixtures
├── test.config.ts         # Test configuration
├── .env.test             # Test environment variables
├── run-tests.ts          # Main test runner
├── AUTH_TEST_CHECKLIST.md # Test coverage checklist
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Local development environment

### Installation
```bash
# From project root
npm install

# Install test-specific dependencies
npm install --save-dev jest @types/jest axios
```

### Running Tests

#### All Tests
```bash
npm test                  # Run all tests
npm run test:all          # Run all test suites
```

#### Specific Test Suites
```bash
npm run test:e2e          # End-to-end tests only
npm run test:integration  # Integration tests only
npm run test:performance  # Performance tests only
npm run test:security     # Security tests only
```

#### With Options
```bash
# Skip performance tests (faster)
npm run test:all -- --skip-performance

# Run only specific suite
npm run test:all -- --only=integration

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🔧 Configuration

### Environment Variables
Create `tests/.env.test`:
```env
NODE_ENV=test
TEST_API_URL=http://localhost:3000
JWT_ACCESS_SECRET=test-jwt-access-secret
JWT_REFRESH_SECRET=test-jwt-refresh-secret
TEST_DB_IN_MEMORY=false
TEST_DB_DIR=../test-databases
RATE_LIMIT_ENABLED=false
LOG_LEVEL=error
```

### Test Configuration
Edit `tests/test.config.ts` to modify:
- Database settings
- JWT configuration
- Performance benchmarks
- Test user templates
- API endpoints

## 📝 Writing Tests

### Test Patterns

#### E2E Test Example
```typescript
import { registerAndLoginSingleTenant } from '../utils/auth-test-helpers';

test('should complete full authentication flow', async () => {
  // Register and login
  const { user, tokens, dbInfo } = await registerAndLoginSingleTenant();
  
  // Verify tokens
  expect(tokens.accessToken).toBeDefined();
  expect(tokens.refreshToken).toBeDefined();
  
  // Use token for protected route
  authTestClient.setAuthToken(tokens.accessToken);
  const response = await authTestClient.verifyToken();
  expect(response.status).toBe(200);
});
```

#### Integration Test Example
```typescript
test('should validate registration input', async () => {
  const invalidData = {
    email: 'not-an-email',
    password: 'weak',
  };
  
  const response = await authTestClient.registerSingleTenant(invalidData);
  expect(response.status).toBe(400);
  expect(response.data.error).toContain('validation');
});
```

#### Performance Test Example
```typescript
const result = await measureOperation(
  'Login Performance',
  async () => {
    await authTestClient.loginSingleTenant(credentials);
  },
  100 // iterations
);

expect(result.averageTime).toBeLessThan(500); // ms
```

### Using Test Utilities

#### Database Helpers
```typescript
import { createTestDatabase, cleanupTestDatabases } from './utils/test-database';

// Create a test database
const dbInfo = await createTestDatabase();
console.log(dbInfo.dbId, dbInfo.masterKey, dbInfo.dbPath);

// Cleanup after tests
await cleanupTestDatabases();
```

#### User Helpers
```typescript
import { createTestUser, generateRandomUserData } from './utils/test-users';

// Create predefined test user
const user = createTestUser('single-tenant');

// Generate random user data
const randomUser = generateRandomUserData('multi-tenant');
```

#### Auth Helpers
```typescript
import { authTestClient, parseJWT, delay } from './utils/auth-test-helpers';

// Make API requests
const response = await authTestClient.registerSingleTenant(userData);

// Parse JWT tokens
const payload = parseJWT(token);

// Wait for async operations
await delay(1000); // ms
```

## 🐛 Debugging

### Debug Single Test
```bash
# Run specific test file
npm test -- tests/e2e/auth.test.ts

# Run tests matching pattern
npm test -- -t "should register"

# Run with verbose output
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

#### Test Database Cleanup
```bash
# Remove all test databases
rm -rf test-databases/
```

#### Token Expiration Issues
- Check system time is synchronized
- Increase token expiration in test config
- Use `delay()` helper between operations

## 📊 Test Coverage

### View Coverage Report
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

### Coverage Requirements
- Overall: > 90%
- Critical paths: 100%
- New code: > 95%

### Exclude from Coverage
Add to test files:
```typescript
/* istanbul ignore next */
function helperOnlyForTests() { }
```

## 🔄 CI/CD Integration

### GitHub Actions
The tests run automatically on:
- Pull requests
- Pushes to main branch
- Nightly builds

### Pre-commit Hooks
```bash
# Install hooks
npm run install-hooks

# Hooks will run:
# - Linting
# - Unit tests
# - Coverage check
```

## 📚 Additional Resources

- [AUTH_TEST_CHECKLIST.md](./AUTH_TEST_CHECKLIST.md) - Complete test checklist
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns
2. Update test checklist
3. Ensure coverage targets are met
4. Document any new utilities
5. Add examples to this README

## 📞 Support

For test-related issues:
1. Check this README
2. Review error messages carefully
3. Check GitHub Issues
4. Ask in #testing Slack channel