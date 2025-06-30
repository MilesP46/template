# Context References for T213_phase2.5_cp1

## Current Claude Working Context
- **Phase**: 2.5 - Environment & Build System Fix
- **Checkpoint**: Critical Path
- **Task**: T213 - Convert test stubs to executable tests
- **Type**: Implementation task - making tests work

## Prerequisites Completed
- T210: Build system fixed (Turbo installed)
- T211: Test runners configured (Jest/Vitest)
- T212: Test databases and environment ready

## Test Framework Status
From `/tests/` directory:
- E2E test stubs created
- Integration test stubs created
- Performance test stubs created
- All tests currently `.skip`ped
- Test configurations defined
- Test users and benchmarks specified

## Authentication Implementation
Already implemented in Phase 2:
1. **Auth Factory**: `/apps/doctor-dok/src/auth/auth-mode.factory.ts`
2. **Strategies**: Single-tenant and multi-tenant
3. **Shared Packages**: 
   - `@doctor-dok/shared-auth`
   - `@doctor-dok/shared-auth-react`
4. **API Endpoints**: Login, register, refresh, logout

## Test Requirements
From AUTH_TEST_CHECKLIST.md:
- Registration tests (with/without master key)
- Login tests (valid/invalid scenarios)
- Token management (refresh, expiry)
- Security tests (injection, XSS)
- Performance benchmarks
- Both auth modes equally tested

## Performance Targets
From test.config.ts:
- Registration: < 500ms
- Login: < 300ms
- Token verification: < 50ms
- Token refresh: < 200ms
- Logout: < 100ms

## Test Data Available
- Single-tenant valid user with master key
- Multi-tenant valid user without master key
- Invalid user scenarios
- Environment configurations for both modes

## Expected Test Coverage
- Unit tests: > 95%
- Integration tests: > 90%
- E2E critical paths: 100%
- Overall: > 90%

## Notes from Claude
Focus on making existing test stubs executable. Don't create new test files unless necessary. The test structure is already well-designed; your job is to implement the actual test logic using the existing auth implementation.

Priority: Get core flows working first (registration, login, token refresh) before edge cases.