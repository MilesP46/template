/**
 * Authentication Test Fixtures
 * Consistent test data for authentication tests
 */

export const AUTH_FIXTURES = {
  // Valid credentials
  VALID_SINGLE_TENANT: {
    email: 'test@single-tenant.com',
    password: 'TestPassword123!',
    databaseId: 'test-db-single-001',
    masterKey: 'MasterKey123!@#$%^&*()'
  },
  
  VALID_MULTI_TENANT: {
    email: 'test@multi-tenant.com',
    password: 'TestPassword123!',
    tenantId: 'tenant-001'
  },
  
  // Invalid credentials
  INVALID_PASSWORDS: [
    'short',                     // Too short
    'nouppercase123!',          // No uppercase
    'NOLOWERCASE123!',          // No lowercase
    'NoSpecialChar123',         // No special character
    'NoNumbers!@#',             // No numbers
    ''                          // Empty
  ],
  
  INVALID_MASTER_KEYS: [
    'weak',                     // Too short
    'NoSpecialChars123',        // No special characters
    'no spaces allowed',        // Contains spaces
    '12345678901',              // Only numbers
    ''                          // Empty
  ],
  
  INVALID_EMAILS: [
    'notanemail',
    '@example.com',
    'test@',
    'test..email@example.com',
    'test@example',
    ''
  ],
  
  // Security test payloads
  SQL_INJECTION_PAYLOADS: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "1; DELETE FROM users WHERE 1=1; --",
    "' UNION SELECT * FROM users --"
  ],
  
  XSS_PAYLOADS: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ],
  
  // Token test data
  EXPIRED_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxMDAwMDAwMDAwfQ.mock',
  INVALID_TOKEN: 'invalid.token.here',
  MALFORMED_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed',
  
  // Timing constants (ms)
  TOKEN_EXPIRY_BUFFER: 1000,   // 1 second buffer for token expiry tests
  REQUEST_TIMEOUT: 5000,        // 5 seconds max for API requests
  
  // Performance targets (ms)
  PERFORMANCE_TARGETS: {
    registration: 500,
    login: 300,
    tokenVerification: 50,
    tokenRefresh: 200,
    logout: 100
  }
};

// Test user factory
export function createTestUserData(
  mode: 'single-tenant' | 'multi-tenant',
  overrides?: any
) {
  const base = mode === 'single-tenant' 
    ? AUTH_FIXTURES.VALID_SINGLE_TENANT
    : AUTH_FIXTURES.VALID_MULTI_TENANT;
    
  return {
    ...base,
    ...overrides,
    email: overrides?.email || `test-${Date.now()}@${mode}.com`
  };
}

// Error message matchers
export const ERROR_MATCHERS = {
  INVALID_CREDENTIALS: /invalid credentials|authentication failed/i,
  TOKEN_EXPIRED: /token expired|jwt expired/i,
  TOKEN_INVALID: /invalid token|jwt malformed/i,
  MASTER_KEY_REQUIRED: /master key required/i,
  MASTER_KEY_INVALID: /invalid master key/i,
  USER_NOT_FOUND: /user not found/i,
  DATABASE_NOT_FOUND: /database not found/i,
  PERMISSION_DENIED: /permission denied|forbidden/i,
  WEAK_PASSWORD: /password.*weak|password.*requirements/i,
  INVALID_EMAIL: /invalid email|email.*format/i
};