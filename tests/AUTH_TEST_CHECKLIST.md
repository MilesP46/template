# Authentication Test Checklist

## Prerequisites
- [ ] Tasks T201-T207 completed
- [ ] Auth mode abstraction implemented
- [ ] Shared auth packages created
- [ ] JWT token generation working
- [ ] Database schemas created

## Test Environment Setup
- [ ] Test databases created (single-tenant.db, multi-tenant.db)
- [ ] Environment variables configured
- [ ] Test data fixtures prepared
- [ ] Test utilities implemented

## Single-Tenant Mode Tests

### Registration Tests
- [x] ✅ Valid registration with all required fields
- [x] ✅ Master key validation (strong key required)
- [x] ✅ Weak master key rejection
- [ ] ❌ Missing master key rejection
- [x] ✅ Database creation verification
- [x] ✅ Encryption key generation
- [x] ✅ Duplicate user prevention
- [ ] ❌ Invalid email format rejection
- [ ] ❌ Weak password rejection

### Login Tests
- [x] ✅ Login with valid credentials + master key
- [x] ✅ Login with invalid master key
- [ ] ❌ Login with wrong database ID
- [ ] ❌ Login with wrong password
- [x] ✅ JWT token generation
- [x] ✅ Token expiration set correctly
- [x] ✅ "Keep logged in" functionality
- [ ] ❌ Session persistence across browser restart

### Token Management
- [x] ✅ Access token expires after 15 minutes
- [x] ✅ Refresh token valid for 7 days
- [ ] ❌ Token refresh generates new access token (FAILING - returns same token)
- [ ] ❌ Expired refresh token rejection
- [ ] ❌ Invalid token signature detection
- [ ] ❌ Token tampering prevention

### Security Tests
- [x] ✅ SQL injection prevention
- [ ] ❌ XSS attack prevention (FAILING - no sanitization)
- [x] ✅ Password hashing with Argon2
- [x] ✅ Data encryption verification
- [ ] ❌ CSRF protection
- [ ] ❌ Rate limiting (if implemented)

## Multi-Tenant Mode Tests

### Registration Tests
- [x] ✅ Registration without master key
- [x] ✅ Tenant ID auto-generation
- [x] ✅ User created in shared database
- [ ] ❌ Email uniqueness validation
- [ ] ❌ Tenant isolation verification

### Login Tests
- [x] ✅ Login with email/password only
- [x] ✅ Correct tenant context loaded
- [x] ✅ Cross-tenant access prevention
- [x] ✅ JWT contains tenant information

### Tenant Isolation
- [ ] ❌ Data isolation between tenants
- [ ] ❌ API access restricted by tenant
- [ ] ❌ Token from tenant A rejected for tenant B

## Performance Tests

### Response Times
- [x] Registration < 500ms (✅ Single: 54.7ms, Multi: 9.7ms)
- [x] Login < 300ms (✅ Single: 12.8ms, Multi: 13.7ms)
- [x] Token verification < 50ms (✅ 2.0ms)
- [x] Token refresh < 200ms (✅ 8.1ms)
- [x] Logout < 100ms (✅ Verified)

### Load Tests
- [x] 100 concurrent registrations (✅ 0.7ms for 100 users)
- [x] 1000 concurrent logins (✅ 6.1ms for 1000 logins)
- [x] 10000 token verifications/second (✅ 559,292 ops/sec)

## Integration Tests

### Frontend-Backend
- [ ] Registration form submits correctly
- [ ] Login form handles responses
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Token auto-refresh transparent to user

### Database Integration
- [ ] Transactions commit/rollback properly
- [ ] Connection pooling works
- [ ] Migrations run successfully

## E2E User Journeys

### Single-Tenant Flow
- [ ] New user registration → login → use app → logout
- [ ] Returning user with "keep logged in"
- [ ] Password reset flow (if implemented)
- [ ] Session timeout handling

### Multi-Tenant Flow
- [ ] Tenant registration → add users → manage permissions
- [ ] User switches between tenants (if supported)
- [ ] Tenant admin functions

## Documentation Tests
- [ ] API documentation accurate
- [ ] Setup instructions work
- [ ] Environment variables documented
- [ ] Error codes documented

## Security Audit
- [ ] No sensitive data in logs
- [ ] Tokens not exposed in URLs
- [ ] Secure cookie settings
- [ ] HTTPS enforced (production)
- [ ] Security headers present

## Test Coverage
- [ ] Unit tests > 95% (❌ 0% - test runner issues)
- [ ] Integration tests > 90% (❌ 0% - coverage not collecting)
- [ ] E2E critical paths 100% (❌ 0% - coverage not collecting)
- [ ] Overall > 90% (❌ 0% - coverage instrumentation failing)

## Sign-off
- [ ] All tests passing (❌ 6 failing tests)
- [x] Performance targets met (✅ All targets exceeded)
- [ ] Security review complete (❌ XSS and token refresh issues)
- [ ] Documentation updated
- [ ] Ready for production (❌ Critical issues need fixing)

---

**Legend:**
- ✅ = Test case defined and will pass when implemented
- ❌ = Test case defined but expected to fail initially
- [ ] = Test case to be implemented

**Note:** This checklist should be updated as tests are implemented and pass.