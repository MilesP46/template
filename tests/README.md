# Authentication Testing Framework

This directory contains the comprehensive testing framework for the authentication system supporting both single-tenant and multi-tenant modes.

## Current Status

⚠️ **BLOCKED**: Authentication implementation (Tasks T201-T207) must be completed before these tests can be executed.

## Directory Structure

```
tests/
├── e2e/                    # End-to-end tests
│   └── auth.test.ts       # Full user journey tests
├── integration/           # Integration tests  
│   └── auth-api.test.ts   # API endpoint tests
├── performance/           # Performance tests
│   └── auth-performance.test.ts # Load and benchmark tests
├── utils/                 # Test utilities
│   └── auth-test-helpers.ts # Shared test helpers
├── test.config.ts         # Test configurations
├── AUTH_TEST_CHECKLIST.md # Comprehensive test checklist
└── README.md             # This file
```

## Test Configurations

The framework supports testing both authentication modes:

### Single-Tenant Mode
- Encrypted database per user
- Master key required
- Individual user isolation
- Client-side encryption

### Multi-Tenant Mode  
- Shared database
- No master key required
- Tenant-based isolation
- Server-side data separation

## Running Tests (When Implementation is Ready)

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- e2e/auth.test.ts

# Run with coverage
npm test -- --coverage

# Run performance tests
npm test -- performance/
```

## Test Categories

### 1. Unit Tests (To be created)
- Auth service methods
- Token utilities
- Validation functions
- Encryption helpers

### 2. Integration Tests
- API endpoint testing
- Database operations
- Auth context behavior
- Middleware testing

### 3. E2E Tests
- Complete user registration flow
- Login/logout cycles
- Token refresh scenarios
- Protected route access

### 4. Performance Tests
- Registration benchmarks (< 500ms)
- Login benchmarks (< 300ms)
- Token verification (< 50ms)
- Load testing (1000+ concurrent users)

### 5. Security Tests
- SQL injection prevention
- XSS attack prevention
- Token tampering detection
- Cross-tenant isolation

## Test Data

Test users and configurations are defined in `test.config.ts`:
- Valid user credentials for both modes
- Invalid credentials for error testing
- Performance benchmark targets
- Security test payloads

## Contributing

When the authentication implementation is ready:

1. Convert test stubs to actual tests
2. Ensure all test cases from checklist are covered
3. Add new test cases as edge cases are discovered
4. Update performance benchmarks based on real data
5. Document any test-specific setup requirements

## Test Standards

- Use descriptive test names
- Group related tests with `describe` blocks
- Use `beforeAll`/`afterAll` for setup/cleanup
- Mock external dependencies
- Test both success and failure paths
- Include performance assertions
- Document complex test scenarios

## Next Steps

1. Wait for authentication implementation completion
2. Install test dependencies (Jest, Supertest, etc.)
3. Configure test runners in package.json
4. Set up CI/CD test automation
5. Begin converting stubs to real tests

## Related Documentation

- Main project spec: `/docs/project-specification.md`
- Auth architecture: `/docs/architecture/domains/auth.md`
- Test report: `/reports/phase2_cp1/T208_phase2_cp1_VALIDATE_report.md`

---

**Note**: All tests are currently `.skip`ped as they await the authentication implementation. Remove `.skip` as each test becomes implementable.