# Context References for T208_phase2_cp1

## Current Claude Working Context
- **Phase**: 2 - Authentication Integration
- **Checkpoint**: 2.1
- **Task**: T208 - Test both authentication modes end-to-end
- **Type**: Validation task - ensuring quality of implementation

## What Has Been Implemented
1. **Auth Mode Abstraction** (T201)
   - Factory pattern for mode selection
   - Single-tenant and multi-tenant strategies
   - Located in `apps/doctor-dok/src/auth/`

2. **Shared Auth Services** (T202)
   - `@doctor-dok/shared-auth` package
   - JWT service, encryption utils, middleware
   - Base authentication service

3. **React Auth Integration** (T203)
   - `@doctor-dok/shared-auth-react` package
   - AuthContext, hooks, components
   - API client with automatic token refresh

4. **Frontend Components** (T206-T207)
   - Updated login/signup forms
   - Master key input component
   - User profile dropdown
   - Auth guard for protected routes

## Testing Requirements
### Functional Testing
1. **Registration Flow**
   - Single-tenant with master key
   - Multi-tenant without master key
   - Form validation
   - Error handling

2. **Login Flow**
   - Valid credentials
   - Invalid credentials
   - Session persistence options
   - Auto-redirect after login

3. **Token Management**
   - 15-minute access token expiry
   - 8-hour refresh token expiry
   - Automatic refresh before expiry
   - Handling of expired tokens

4. **Security Testing**
   - Password strength requirements
   - Master key security (single-tenant)
   - XSS prevention
   - SQL injection prevention
   - CSRF protection

### Performance Requirements
From project specification:
- API Response Time: < 500ms for basic operations
- Page Load Time: < 3 seconds
- Token verification overhead: minimal

## Environment Configurations

### Single-Tenant Mode
- Each user gets encrypted SQLite database
- Master key required for encryption
- Full database isolation
- AES-GCM encryption

### Multi-Tenant Mode
- Shared database with row-level security
- No master key required
- User isolation by tenant ID
- More efficient resource usage

## Known Integration Points
1. **Frontend**: `apps/rasket/src/providers/AuthProvider.tsx`
2. **Backend**: `apps/doctor-dok/src/auth/auth-mode.factory.ts`
3. **Middleware**: Applied to all `/api/*` routes except auth endpoints
4. **Database**: SQLite with Drizzle ORM

## Expected Test Deliverables
1. Comprehensive test suite covering both modes
2. Performance benchmark results
3. Security vulnerability assessment
4. Test coverage report (target > 90%)
5. Issue log with severity ratings
6. Recommendations for improvements

## Notes from Claude
This validation is critical for Phase 2 completion. Focus on:
- Real-world usage scenarios
- Edge cases and error conditions
- Security implications
- Performance under load
- User experience consistency

The test results will determine if we're ready to proceed to Phase 3 (UI Component Migration) or if fixes are needed first.