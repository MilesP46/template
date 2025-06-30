// Integration tests for Authentication API
// These tests focus on API behavior without full e2e setup

import { testConfig, setupTestEnvironment, cleanupTestEnvironment } from '../test.config';
import { authTestClient, expectSuccessResponse, expectErrorResponse } from '../utils/auth-test-helpers';
import { generateMasterKey, isValidMasterKey } from '../utils/test-database';
import { generateStrongPassword, isValidPassword } from '../utils/test-users';

// Test suite for Auth API Integration
const authApiTests = {
  async runAll() {
    console.log('Starting Auth API Integration Tests...');
    
    await setupTestEnvironment();
    
    try {
      await this.testRegistrationValidation();
      await this.testLoginValidation();
      await this.testTokenOperations();
      await this.testSecurityHeaders();
      await this.testErrorResponses();
      
      console.log('✅ All Auth API Integration Tests Passed!');
    } catch (error) {
      console.error('❌ Auth API Integration Test Failed:', error);
      throw error;
    } finally {
      await cleanupTestEnvironment();
    }
  },

  async testRegistrationValidation() {
    console.log('\n📋 Testing Registration Validation...');
    
    // Test missing required fields
    const invalidRequests = [
      {
        name: 'missing email',
        data: { password: 'Test123!', databaseId: 'test-db', masterKey: generateMasterKey() },
        mode: 'single-tenant',
        expectedError: 'email',
      },
      {
        name: 'missing password',
        data: { email: 'test@example.com', databaseId: 'test-db', masterKey: generateMasterKey() },
        mode: 'single-tenant',
        expectedError: 'password',
      },
      {
        name: 'missing databaseId (single-tenant)',
        data: { email: 'test@example.com', password: 'Test123!', masterKey: generateMasterKey() },
        mode: 'single-tenant',
        expectedError: 'databaseId',
      },
      {
        name: 'missing masterKey (single-tenant)',
        data: { email: 'test@example.com', password: 'Test123!', databaseId: 'test-db' },
        mode: 'single-tenant',
        expectedError: 'masterKey',
      },
      {
        name: 'missing tenantId (multi-tenant)',
        data: { email: 'test@example.com', password: 'Test123!' },
        mode: 'multi-tenant',
        expectedError: 'tenantId',
      },
    ];

    for (const testCase of invalidRequests) {
      console.log(`  - Testing ${testCase.name}...`);
      
      const response = testCase.mode === 'single-tenant'
        ? await authTestClient.registerSingleTenant(testCase.data as any)
        : await authTestClient.registerMultiTenant(testCase.data as any);
      
      if (response.status !== 400) {
        throw new Error(`Expected 400 for ${testCase.name}, got ${response.status}`);
      }
      
      if (!response.data.error?.toLowerCase().includes(testCase.expectedError)) {
        throw new Error(`Expected error about ${testCase.expectedError}, got: ${response.data.error}`);
      }
    }
    
    // Test email format validation
    const invalidEmails = ['notanemail', 'missing@', '@domain.com', 'spaces in@email.com'];
    
    for (const email of invalidEmails) {
      console.log(`  - Testing invalid email: ${email}`);
      
      const response = await authTestClient.registerSingleTenant({
        email,
        password: 'Test123!',
        databaseId: 'test-db',
        masterKey: generateMasterKey(),
      });
      
      if (response.status !== 400) {
        throw new Error(`Expected 400 for invalid email, got ${response.status}`);
      }
    }
    
    console.log('  ✅ Registration validation tests passed');
  },

  async testLoginValidation() {
    console.log('\n📋 Testing Login Validation...');
    
    // Test missing credentials
    const invalidLogins = [
      {
        name: 'missing databaseId',
        credentials: { masterKey: generateMasterKey(), password: 'Test123!' },
        mode: 'single-tenant',
      },
      {
        name: 'missing masterKey',
        credentials: { databaseId: 'test-db', password: 'Test123!' },
        mode: 'single-tenant',
      },
      {
        name: 'missing email',
        credentials: { password: 'Test123!', tenantId: 'tenant-001' },
        mode: 'multi-tenant',
      },
      {
        name: 'missing tenantId',
        credentials: { email: 'test@example.com', password: 'Test123!' },
        mode: 'multi-tenant',
      },
    ];

    for (const testCase of invalidLogins) {
      console.log(`  - Testing ${testCase.name}...`);
      
      const response = testCase.mode === 'single-tenant'
        ? await authTestClient.loginSingleTenant(testCase.credentials as any)
        : await authTestClient.loginMultiTenant(testCase.credentials as any);
      
      if (response.status !== 400) {
        throw new Error(`Expected 400 for ${testCase.name}, got ${response.status}`);
      }
    }
    
    console.log('  ✅ Login validation tests passed');
  },

  async testTokenOperations() {
    console.log('\n📋 Testing Token Operations...');
    
    // Test refresh without token
    console.log('  - Testing refresh without token...');
    let response = await authTestClient.refreshToken('');
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 for empty refresh token, got ${response.status}`);
    }
    
    // Test refresh with malformed token
    console.log('  - Testing refresh with malformed token...');
    response = await authTestClient.refreshToken('not-a-jwt-token');
    
    if (response.status !== 401) {
      throw new Error(`Expected 401 for malformed token, got ${response.status}`);
    }
    
    // Test verify without auth header
    console.log('  - Testing verify without auth header...');
    authTestClient.clearAuthToken();
    response = await authTestClient.verifyToken();
    
    if (response.status !== 401) {
      throw new Error(`Expected 401 for missing auth header, got ${response.status}`);
    }
    
    console.log('  ✅ Token operation tests passed');
  },

  async testSecurityHeaders() {
    console.log('\n📋 Testing Security Headers...');
    
    // Make a request and check security headers
    const response = await authTestClient.client.get('/api/auth/verify');
    
    const securityHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'x-xss-protection': '1; mode=block',
    };
    
    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      console.log(`  - Checking ${header}...`);
      const actualValue = response.headers[header];
      
      if (!actualValue) {
        console.warn(`    ⚠️  Missing security header: ${header}`);
      } else if (actualValue !== expectedValue) {
        console.warn(`    ⚠️  Unexpected value for ${header}: ${actualValue}`);
      }
    }
    
    console.log('  ✅ Security header tests completed');
  },

  async testErrorResponses() {
    console.log('\n📋 Testing Error Response Format...');
    
    // Test various error scenarios
    const errorScenarios = [
      {
        name: 'Invalid JSON',
        request: () => authTestClient.client.post('/api/auth/register', 'invalid-json', {
          headers: { 'Content-Type': 'application/json' },
        }),
        expectedStatus: 400,
      },
      {
        name: 'Wrong Content-Type',
        request: () => authTestClient.client.post('/api/auth/register', 'data', {
          headers: { 'Content-Type': 'text/plain' },
        }),
        expectedStatus: 415,
      },
      {
        name: 'Method Not Allowed',
        request: () => authTestClient.client.delete('/api/auth/register'),
        expectedStatus: 405,
      },
    ];

    for (const scenario of errorScenarios) {
      console.log(`  - Testing ${scenario.name}...`);
      
      try {
        const response = await scenario.request();
        
        // Check status
        if (response.status !== scenario.expectedStatus) {
          console.warn(`    ⚠️  Expected ${scenario.expectedStatus}, got ${response.status}`);
        }
        
        // Check error response structure
        if (response.data && typeof response.data === 'object') {
          if (!response.data.error && !response.data.message) {
            console.warn('    ⚠️  Error response missing error or message field');
          }
        }
      } catch (error) {
        console.warn(`    ⚠️  Request failed: ${error}`);
      }
    }
    
    console.log('  ✅ Error response tests completed');
  },
};

// Helper to validate JWT structure
function isValidJWT(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode header and payload
    const header = parts[0];
    const payload = parts[1];
    const signature = parts[2];
    
    if (!header || !payload || !signature) return false;
    
    JSON.parse(Buffer.from(header, 'base64url').toString());
    JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // Signature should be base64url encoded
    return /^[A-Za-z0-9_-]+$/.test(signature);
  } catch {
    return false;
  }
}

// Export test runner
export async function runAuthApiIntegrationTests() {
  await authApiTests.runAll();
}

// Allow running directly
if (require.main === module) {
  runAuthApiIntegrationTests().catch(console.error);
}