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
- [ ] ✅ Valid registration with all required fields
- [ ] ✅ Master key validation (strong key required)
- [ ] ❌ Weak master key rejection
- [ ] ❌ Missing master key rejection
- [ ] ✅ Database creation verification
- [ ] ✅ Encryption key generation
- [ ] ❌ Duplicate user prevention
- [ ] ❌ Invalid email format rejection
- [ ] ❌ Weak password rejection

### Login Tests
- [ ] ✅ Login with valid credentials + master key
- [ ] ❌ Login with invalid master key
- [ ] ❌ Login with wrong database ID
- [ ] ❌ Login with wrong password
- [ ] ✅ JWT token generation
- [ ] ✅ Token expiration set correctly
- [ ] ✅ "Keep logged in" functionality
- [ ] ✅ Session persistence across browser restart

### Token Management
- [ ] ✅ Access token expires after 15 minutes
- [ ] ✅ Refresh token valid for 7 days
- [ ] ✅ Token refresh generates new access token
- [ ] ❌ Expired refresh token rejection
- [ ] ❌ Invalid token signature detection
- [ ] ❌ Token tampering prevention

### Security Tests
- [ ] ❌ SQL injection prevention
- [ ] ❌ XSS attack prevention
- [ ] ✅ Password hashing with Argon2
- [ ] ✅ Data encryption verification
- [ ] ❌ CSRF protection
- [ ] ❌ Rate limiting (if implemented)

## Multi-Tenant Mode Tests

### Registration Tests
- [ ] ✅ Registration without master key
- [ ] ✅ Tenant ID auto-generation
- [ ] ✅ User created in shared database
- [ ] ❌ Email uniqueness validation
- [ ] ❌ Tenant isolation verification

### Login Tests
- [ ] ✅ Login with email/password only
- [ ] ✅ Correct tenant context loaded
- [ ] ❌ Cross-tenant access prevention
- [ ] ✅ JWT contains tenant information

### Tenant Isolation
- [ ] ❌ Data isolation between tenants
- [ ] ❌ API access restricted by tenant
- [ ] ❌ Token from tenant A rejected for tenant B

## Performance Tests

### Response Times
- [ ] Registration < 500ms
- [ ] Login < 300ms
- [ ] Token verification < 50ms
- [ ] Token refresh < 200ms
- [ ] Logout < 100ms

### Load Tests
- [ ] 100 concurrent registrations
- [ ] 1000 concurrent logins
- [ ] 10000 token verifications/second

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
- [ ] Unit tests > 95%
- [ ] Integration tests > 90%
- [ ] E2E critical paths 100%
- [ ] Overall > 90%

## Sign-off
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Security review complete
- [ ] Documentation updated
- [ ] Ready for production

---

**Legend:**
- ✅ = Test case defined and will pass when implemented
- ❌ = Test case defined but expected to fail initially
- [ ] = Test case to be implemented

**Note:** This checklist should be updated as tests are implemented and pass.