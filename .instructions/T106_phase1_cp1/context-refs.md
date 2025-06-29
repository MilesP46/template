# Context References for T106_phase1_cp1

## Current Claude Working Context
- **Phase**: 1 - Architecture & Discovery
- **Checkpoint**: 1.1
- **Task**: T106 - Generate .env.example with all required variables
- **Parallel Tasks**: T101 (BG-DESIGN), T102 (BG-SCAFFOLD) may be in progress
- **Completed**: T103-T105 (package.json, TypeScript, ESLint/Prettier)

## Key Environment Variable Requirements
1. **Authentication Modes**:
   - Single-tenant: Each user gets encrypted SQLite database
   - Multi-tenant: Shared database with user isolation
   - Mode switching via AUTH_MODE variable

2. **Security Requirements**:
   - JWT tokens for authentication
   - Master key for database encryption (single-tenant)
   - Secure session management
   - CORS configuration

3. **AI Integration** (Optional):
   - OpenAI API support
   - Google AI API support
   - Ollama local AI support
   - Feature toggles for AI functionality

4. **Database Configuration**:
   - SQLite for development
   - Drizzle ORM configuration
   - Migration settings

## Integration Considerations
- Frontend (Vite) needs API URL configuration
- Backend (Next.js) needs database and service configs
- Both need to share authentication setup
- Development should work with minimal configuration

## Expected Deliverable
A comprehensive .env.example that:
- Works immediately for local development
- Clearly documents all options
- Supports both authentication modes
- Includes optional AI configuration
- Follows security best practices

## Notes from Claude
This environment configuration is critical for developer experience. Focus on:
- Clear documentation for each variable
- Sensible defaults where possible
- Security warnings for sensitive values
- Easy mode switching for testing both auth types
- Making optional features truly optional