# Authentication Tests Documentation

## Overview

This directory contains comprehensive tests for the authentication system, covering both single-tenant and multi-tenant modes. The tests are organized into three main categories:

- **E2E Tests**: Complete user journey tests
- **Integration Tests**: API endpoint tests  
- **Performance Tests**: Benchmarks and load tests

## Test Structure

```
tests/
├── e2e/                    # End-to-end user journey tests
│   └── auth.test.ts        # Complete authentication flows
├── integration/            # API integration tests
│   └── auth-api.test.ts    # API endpoint testing
├── performance/            # Performance benchmarks
│   └── auth-performance.test.ts  # Load and performance tests
├── utils/                  # Test utilities
│   ├── auth-test-helpers.ts      # Legacy test helpers
│   ├── test-database.ts          # Database management utilities
│   └── test-users.ts             # User creation utilities
├── fixtures/               # Test data
│   └── auth.fixtures.ts    # Consistent test data
├── test.config.ts          # Test configuration
├── setup.test.ts           # Test environment setup
└── README.md               # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
# E2E tests only
npm test -- e2e/auth.test.ts

# Integration tests only
npm test -- integration/auth-api.test.ts

# Performance tests only
npm test -- performance/auth-performance.test.ts
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Generate coverage report
```bash
npm test -- --coverage
```

## Test Coverage

The tests aim for >90% coverage across all authentication components:

- **Unit Tests**: Individual function testing (in component directories)
- **Integration Tests**: API endpoint and database integration
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Load testing and benchmarks

## Test Categories

### 1. E2E Authentication Tests (`e2e/auth.test.ts`)

Complete user journey tests for both authentication modes.

#### Single-Tenant Mode Tests:
- **Registration Flow**
  - ✅ Register with master key
  - ✅ Validate master key strength
  - ✅ Prevent duplicate registrations
  
- **Login Flow**
  - ✅ Login with credentials and master key
  - ✅ Handle invalid credentials
  - ✅ Support "keep logged in" option
  
- **Token Management**
  - ✅ Refresh expired tokens
  - ✅ Logout and session cleanup
  
- **Security Tests**
  - ✅ SQL injection prevention
  - ✅ XSS attack prevention
  - ✅ Data encryption verification

#### Multi-Tenant Mode Tests:
- **Registration Flow**
  - ✅ Register without master key
  - ✅ Automatic tenant ID assignment
  
- **Login Flow**
  - ✅ Email/password authentication
  - ✅ Tenant isolation
  
- **Concurrent Operations**
  - ✅ Handle 100 concurrent registrations
  - ✅ Handle 1000 concurrent logins

### 2. Integration Tests (`integration/auth-api.test.ts`)

API endpoint testing with request/response validation.

#### Endpoints Tested:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Session termination
- Protected routes with auth middleware

#### Test Scenarios:
- ✅ Valid request handling
- ✅ Error response validation
- ✅ Input validation
- ✅ Security headers
- ✅ Rate limiting (if implemented)

### 3. Performance Tests (`performance/auth-performance.test.ts`)

Comprehensive performance benchmarks ensuring operations meet targets.

#### Performance Targets:
- Registration: < 500ms
- Login: < 300ms  
- Token verification: < 50ms
- Token refresh: < 200ms
- Logout: < 100ms

#### Load Tests:
- ✅ Burst registration handling (100 users)
- ✅ Sustained login load (1000 logins)
- ✅ Token verification throughput (>10k/sec)
- ✅ Memory leak prevention
- ✅ Performance regression tests

## Test Utilities

### Database Utilities (`utils/test-database.ts`)
- `createSingleTenantDatabase()` - Create encrypted test database
- `cleanupAllTestDatabases()` - Clean up test data
- `isDatabaseEncrypted()` - Verify encryption
- `MockUserStorage` - In-memory user storage for tests

### User Creation Utilities (`utils/test-users.ts`)
- `createTestUser()` - Create test users for either mode
- `loginTestUser()` - Simulate user login
- `generateTestTokens()` - Generate JWT tokens
- `cleanupTestUsers()` - Clean up test data

### Test Fixtures (`fixtures/auth.fixtures.ts`)
- Valid/invalid credentials
- Security test payloads (SQL injection, XSS)
- Error message matchers
- Performance targets

## Common Test Patterns

### Creating a test user
```typescript
const user = await createTestUser('single-tenant', {
  email: 'test@example.com',
  password: 'SecurePass123!',
  databaseId: 'test-db-001',
  masterKey: 'MasterKey123!@#'
});
```

### Simulating login
```typescript
const { tokens } = await loginTestUser(user, 'single-tenant');
expect(tokens.accessToken).toBeDefined();
```

### Performance testing
```typescript
const benchmark = new PerformanceBenchmark();
benchmark.start();
// ... operation ...
const duration = benchmark.end();
expect(duration).toBeLessThan(PERFORMANCE_TARGETS.login);
```

## Debugging Test Failures

### Common Issues:

1. **Environment Variables**: Ensure test config is loaded
   ```typescript
   setupTestEnvironment('single-tenant');
   ```

2. **Cleanup**: Always clean up test data
   ```typescript
   afterEach(() => {
     cleanupTestUsers();
     cleanupAllTestDatabases();
   });
   ```

3. **Async Operations**: Use proper async/await
   ```typescript
   await createTestUser(...);
   ```

4. **Token Validation**: Check token structure
   ```typescript
   const parts = token.split('.');
   expect(parts.length).toBe(3);
   ```

## Security Testing

The tests include comprehensive security validation:

- **Input Validation**: Tests malformed inputs
- **SQL Injection**: Tests common injection patterns
- **XSS Prevention**: Tests script injection attempts
- **Token Security**: Validates JWT structure and expiry
- **Encryption**: Verifies data encryption in single-tenant mode

## Performance Benchmarking

Performance tests track multiple metrics:

- **Average (avg)**: Mean response time
- **Median**: Middle value
- **95th percentile (p95)**: 95% of requests faster than this
- **99th percentile (p99)**: 99% of requests faster than this
- **Min/Max**: Best and worst case

Example output:
```
Single-tenant login performance: {
  min: 12.5,
  max: 45.2,
  avg: 23.7,
  median: 22.1,
  p95: 38.4,
  p99: 43.2,
  samples: 50
}
```

## Continuous Integration

The tests are designed to run in CI/CD pipelines:

1. **Fast execution**: Most tests complete in <10 seconds
2. **Isolated**: No external dependencies required
3. **Deterministic**: Consistent results across runs
4. **Comprehensive**: Full coverage of auth flows

## Contributing

When adding new tests:

1. Follow the existing structure
2. Use the provided utilities
3. Clean up test data
4. Document new patterns
5. Ensure tests are deterministic
6. Add performance benchmarks for new features

## Future Enhancements

Planned improvements:

- [ ] Real database integration tests
- [ ] WebSocket authentication tests
- [ ] OAuth provider tests
- [ ] Multi-factor authentication tests
- [ ] Session management tests
- [ ] Rate limiting tests