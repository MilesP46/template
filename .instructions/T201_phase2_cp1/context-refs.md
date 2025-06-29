# Context References for T201_phase2_cp1

## Current Claude Working Context
- **Phase**: 2 - Authentication Integration
- **Checkpoint**: 2.1
- **Task**: T201 - Create auth mode abstraction layer
- **Priority**: Foundation task - blocks other auth tasks

## Key Requirements from Phase 1
1. **Authentication Modes** (from project spec):
   - Single-tenant: Each user gets encrypted SQLite database
   - Multi-tenant: Shared database with user isolation
   - Switching controlled by AUTH_MODE environment variable

2. **Security Requirements**:
   - JWT-based authentication (from Doctor-Dok)
   - Master key for encryption (single-tenant only)
   - Secure session management
   - Refresh token support

3. **Architecture Decisions** (from T101):
   - Clean separation between modes
   - Strategy pattern for mode implementation
   - Shared interfaces in packages/shared-types
   - Backend implementation in apps/backend

## Environment Configuration (from T106)
Key variables for auth abstraction:
- `AUTH_MODE`: 'single-tenant' or 'multi-tenant'
- `JWT_SECRET`: Required for both modes
- `REFRESH_SECRET`: Required for both modes
- `MASTER_KEY_REQUIRED`: true/false (single-tenant)
- `ENCRYPTION_ENABLED`: true/false (single-tenant)

## Integration Context
This abstraction layer will be used by:
- T202: Extract auth logic into shared services
- T203: Create unified auth context for React
- T204: Single-tenant implementation
- T205: Multi-tenant implementation
- T206-T207: Frontend components

## Expected Deliverables
1. Clean interface abstraction for auth operations
2. Factory pattern implementation
3. Configuration service
4. Base strategy class
5. Comprehensive tests
6. Documentation and usage examples

## Notes from Claude
This is a critical foundation task. Focus on:
- Making the abstraction truly mode-agnostic
- Ensuring type safety throughout
- Planning for extensibility
- Clear error messages for developers
- Performance considerations for mode selection