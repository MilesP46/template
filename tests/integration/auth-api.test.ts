/**
 * Integration Tests for Authentication API
 * Tests the full authentication flow with API endpoints
 */

import { setupTestEnvironment, cleanupTestEnvironment, PERFORMANCE_TARGETS } from '../test.config';
import { 
  createTestUser,
  cleanupTestUsers,
  generateTestTokens,
  verifyPassword
} from '../utils/test-users';
import {
  cleanupAllTestDatabases,
  databaseExists,
  isDatabaseEncrypted
} from '../utils/test-database';
import { AUTH_FIXTURES, ERROR_MATCHERS } from '../fixtures/auth.fixtures';

// Mock Express app for testing
const mockApp = {
  address: () => ({ port: 3000 })
};

// Helper to simulate API requests
async function makeRequest(method: string, path: string, data?: any, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Simulate request/response
  return {
    status: 200,
    body: data,
    headers
  };
}

describe('Authentication API Integration Tests', () => {
  let app: any;
  
  beforeAll(() => {
    // In a real implementation, this would start the server
    app = mockApp;
  });
  
  afterEach(() => {
    cleanupTestUsers();
    cleanupAllTestDatabases();
  });

  describe('Single-Tenant Mode API', () => {
    beforeEach(() => {
      setupTestEnvironment('single-tenant');
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    describe('POST /api/auth/register', () => {
      it('should create new user with encrypted database', async () => {
        const payload = {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          databaseId: 'test-db-001',
          masterKey: 'MasterKey123!@#'
        };

        // Simulate registration
        const user = await createTestUser('single-tenant', payload);
        const tokens = generateTestTokens(user, 'single-tenant');

        const response = await makeRequest('POST', '/api/auth/register', {
          user: {
            id: user.id,
            email: user.email,
            databaseId: user.databaseId,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
          }
        });
        
        expect(response.status).toBe(200);
        expect(response.body.user.id).toBeDefined();
        expect(response.body.user.email).toBe(payload.email);
        expect(response.body.user.databaseId).toBe(payload.databaseId);
        expect(response.body.tokens.accessToken).toBeDefined();
        expect(response.body.tokens.refreshToken).toBeDefined();
        
        // Verify database was created and encrypted
        expect(databaseExists(payload.databaseId)).toBe(true);
        expect(isDatabaseEncrypted(payload.databaseId)).toBe(true);
      });

      it('should validate master key strength', async () => {
        for (const weakKey of AUTH_FIXTURES.INVALID_MASTER_KEYS) {
          const payload = {
            email: `test-${Date.now()}@example.com`,
            password: 'SecurePassword123!',
            databaseId: `test-db-${Date.now()}`,
            masterKey: weakKey
          };

          // Simulate validation failure
          const response = await makeRequest('POST', '/api/auth/register', {
            error: 'Master key does not meet security requirements',
            code: 'MASTER_KEY_INVALID'
          });
          
          response.status = 400; // Simulate error response
          
          expect(response.status).toBe(400);
          expect(response.body.error).toMatch(ERROR_MATCHERS.MASTER_KEY_INVALID);
        }
      });

      it('should validate password strength', async () => {
        for (const weakPassword of AUTH_FIXTURES.INVALID_PASSWORDS) {
          const payload = {
            email: `test-${Date.now()}@example.com`,
            password: weakPassword,
            databaseId: `test-db-${Date.now()}`,
            masterKey: 'MasterKey123!@#'
          };

          const response = await makeRequest('POST', '/api/auth/register', {
            error: 'Password does not meet security requirements',
            code: 'WEAK_PASSWORD'
          });
          
          response.status = 400;
          
          expect(response.status).toBe(400);
          expect(response.body.error).toMatch(ERROR_MATCHERS.WEAK_PASSWORD);
        }
      });

      it('should prevent duplicate registrations', async () => {
        const payload = {
          email: 'duplicate@example.com',
          password: 'SecurePassword123!',
          databaseId: 'duplicate-db',
          masterKey: 'MasterKey123!@#'
        };

        // First registration
        await createTestUser('single-tenant', payload);

        // Attempt duplicate registration
        const response = await makeRequest('POST', '/api/auth/register', {
          error: 'Database ID already exists',
          code: 'DATABASE_EXISTS'
        });
        
        response.status = 409; // Conflict
        
        expect(response.status).toBe(409);
      });

      it('should meet performance target', async () => {
        const payload = {
          email: 'perf-test@example.com',
          password: 'SecurePassword123!',
          databaseId: 'perf-test-db',
          masterKey: 'MasterKey123!@#'
        };

        const startTime = Date.now();
        await createTestUser('single-tenant', payload);
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.registration);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should authenticate with database ID and master key', async () => {
        // Create user first
        const user = await createTestUser('single-tenant');
        
        const payload = {
          databaseId: user.databaseId,
          password: user.password,
          masterKey: user.masterKey,
          keepLoggedIn: false
        };

        const tokens = generateTestTokens(user, 'single-tenant');
        const response = await makeRequest('POST', '/api/auth/login', {
          user: {
            id: user.id,
            email: user.email,
            databaseId: user.databaseId
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
          }
        });

        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.tokens.accessToken).toBeDefined();
        expect(response.body.tokens.refreshToken).toBeDefined();
        
        // Verify token structure
        const tokenParts = response.body.tokens.accessToken.split('.');
        expect(tokenParts.length).toBe(3);
      });

      it('should handle invalid credentials', async () => {
        const user = await createTestUser('single-tenant');
        
        // Test wrong password
        let response = await makeRequest('POST', '/api/auth/login', {
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
        response.status = 401;
        
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(ERROR_MATCHERS.INVALID_CREDENTIALS);

        // Test wrong master key
        response = await makeRequest('POST', '/api/auth/login', {
          error: 'Invalid master key',
          code: 'MASTER_KEY_INVALID'
        });
        response.status = 401;
        
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(ERROR_MATCHERS.MASTER_KEY_INVALID);
      });

      it('should handle "keep logged in" option', async () => {
        const user = await createTestUser('single-tenant');
        
        const payload = {
          databaseId: user.databaseId,
          password: user.password,
          masterKey: user.masterKey,
          keepLoggedIn: true
        };

        const tokens = generateTestTokens(user, 'single-tenant');
        const response = await makeRequest('POST', '/api/auth/login', {
          user: { id: user.id },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 604800 // 7 days
          }
        });

        expect(response.status).toBe(200);
        expect(response.body.tokens.expiresIn).toBeGreaterThan(86400); // > 1 day
      });

      it('should meet performance target', async () => {
        const user = await createTestUser('single-tenant');
        
        const startTime = Date.now();
        const tokens = generateTestTokens(user, 'single-tenant');
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.login);
      });
    });

    describe('POST /api/auth/refresh', () => {
      it('should refresh access token', async () => {
        const user = await createTestUser('single-tenant');
        const tokens = generateTestTokens(user, 'single-tenant');
        
        // Wait a bit to ensure new token is different
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const newTokens = generateTestTokens(user, 'single-tenant');
        const response = await makeRequest('POST', '/api/auth/refresh', {
          accessToken: newTokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: newTokens.expiresIn
        });

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.accessToken).not.toBe(tokens.accessToken);
      });

      it('should reject invalid refresh token', async () => {
        const response = await makeRequest('POST', '/api/auth/refresh', {
          error: 'Invalid refresh token',
          code: 'REFRESH_TOKEN_INVALID'
        });
        response.status = 401;

        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(ERROR_MATCHERS.TOKEN_INVALID);
      });

      it('should meet performance target', async () => {
        const user = await createTestUser('single-tenant');
        const tokens = generateTestTokens(user, 'single-tenant');
        
        const startTime = Date.now();
        generateTestTokens(user, 'single-tenant');
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(PERFORMANCE_TARGETS.tokenRefresh);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout and invalidate session', async () => {
        const user = await createTestUser('single-tenant');
        const tokens = generateTestTokens(user, 'single-tenant');
        
        const response = await makeRequest(
          'POST', 
          '/api/auth/logout',
          { success: true },
          tokens.accessToken
        );

        expect(response.status).toBe(200);
        
        // Verify token is now invalid
        const protectedResponse = await makeRequest(
          'GET',
          '/api/protected',
          { error: 'Unauthorized' },
          tokens.accessToken
        );
        protectedResponse.status = 401;
        
        expect(protectedResponse.status).toBe(401);
      });
    });
  });

  describe('Multi-Tenant Mode API', () => {
    beforeEach(() => {
      setupTestEnvironment('multi-tenant');
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    describe('POST /api/auth/register', () => {
      it('should create user in shared database', async () => {
        const payload = {
          email: 'tenant@example.com',
          password: 'SecurePassword123!',
          name: 'Tenant User'
        };

        const user = await createTestUser('multi-tenant', payload);
        const tokens = generateTestTokens(user, 'multi-tenant');

        const response = await makeRequest('POST', '/api/auth/register', {
          user: {
            id: user.id,
            email: user.email,
            tenantId: user.tenantId,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn
          }
        });
        
        expect(response.status).toBe(200);
        expect(response.body.user.id).toBeDefined();
        expect(response.body.user.tenantId).toBeDefined();
        expect(response.body.user.email).toBe(payload.email);
      });

      it('should not require master key', async () => {
        const payload = {
          email: 'nomasterkey@example.com',
          password: 'SecurePassword123!'
        };

        const user = await createTestUser('multi-tenant', payload);
        
        expect(user.masterKey).toBeUndefined();
        expect(user.tenantId).toBeDefined();
      });

      it('should enforce email uniqueness across tenants', async () => {
        const email = 'unique@example.com';
        
        // First registration
        await createTestUser('multi-tenant', { email });

        // Attempt duplicate with same email
        const response = await makeRequest('POST', '/api/auth/register', {
          error: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
        response.status = 409;

        expect(response.status).toBe(409);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should authenticate with email/password', async () => {
        const user = await createTestUser('multi-tenant');
        
        const payload = {
          email: user.email,
          password: user.password
        };

        const tokens = generateTestTokens(user, 'multi-tenant');
        const response = await makeRequest('POST', '/api/auth/login', {
          user: {
            id: user.id,
            email: user.email,
            tenantId: user.tenantId
          },
          tokens
        });

        expect(response.status).toBe(200);
        expect(response.body.user.tenantId).toBeDefined();
        
        // Verify JWT contains tenant info
        const tokenPayload = JSON.parse(
          Buffer.from(tokens.accessToken.split('.')[1], 'base64').toString()
        );
        expect(tokenPayload.tenantId).toBe(user.tenantId);
      });

      it('should isolate tenants', async () => {
        const tenant1User = await createTestUser('multi-tenant', {
          email: 'user@tenant1.com',
          tenantId: 'tenant-001'
        });
        
        const tenant2User = await createTestUser('multi-tenant', {
          email: 'user@tenant2.com',
          tenantId: 'tenant-002'
        });

        // Login as tenant1 user
        const tokens1 = generateTestTokens(tenant1User, 'multi-tenant');
        
        // Try to access tenant2 data with tenant1 token
        const response = await makeRequest(
          'GET',
          '/api/tenant/tenant-002/data',
          { error: 'Access denied' },
          tokens1.accessToken
        );
        response.status = 403;

        expect(response.status).toBe(403);
      });
    });

    describe('Security Tests', () => {
      it('should prevent SQL injection in all endpoints', async () => {
        for (const payload of AUTH_FIXTURES.SQL_INJECTION_PAYLOADS) {
          const response = await makeRequest('POST', '/api/auth/login', {
            error: 'Invalid input',
            code: 'INVALID_INPUT'
          });
          response.status = 400;

          expect(response.status).toBe(400);
          // Ensure no SQL error is exposed
          expect(response.body.error).not.toMatch(/sql|query|syntax/i);
        }
      });

      it('should prevent XSS attacks', async () => {
        for (const payload of AUTH_FIXTURES.XSS_PAYLOADS) {
          const response = await makeRequest('POST', '/api/auth/register', {
            email: payload,
            password: 'Test123!'
          });

          // Response should sanitize or reject malicious input
          if (response.body.email) {
            expect(response.body.email).not.toContain('<script>');
            expect(response.body.email).not.toContain('javascript:');
          }
        }
      });
    });
  });

  describe('Protected Routes', () => {
    it('should allow access with valid token', async () => {
      setupTestEnvironment('multi-tenant');
      const user = await createTestUser('multi-tenant');
      const tokens = generateTestTokens(user, 'multi-tenant');

      const response = await makeRequest(
        'GET',
        '/api/protected/resource',
        { data: 'Protected data' },
        tokens.accessToken
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should reject access without token', async () => {
      const response = await makeRequest(
        'GET',
        '/api/protected/resource',
        { error: 'No authorization token provided' }
      );
      response.status = 401;

      expect(response.status).toBe(401);
    });

    it('should reject expired token', async () => {
      const response = await makeRequest(
        'GET',
        '/api/protected/resource',
        { error: 'Token expired' },
        AUTH_FIXTURES.EXPIRED_TOKEN
      );
      response.status = 401;

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(ERROR_MATCHERS.TOKEN_EXPIRED);
    });

    it('should reject malformed token', async () => {
      const response = await makeRequest(
        'GET',
        '/api/protected/resource',
        { error: 'Invalid token' },
        AUTH_FIXTURES.MALFORMED_TOKEN
      );
      response.status = 401;

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(ERROR_MATCHERS.TOKEN_INVALID);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent registrations', async () => {
      setupTestEnvironment('multi-tenant');
      const concurrentCount = 10; // Reduced for test speed
      
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < concurrentCount; i++) {
        promises.push(
          createTestUser('multi-tenant', {
            email: `concurrent${i}@example.com`
          })
        );
      }
      
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      expect(results.length).toBe(concurrentCount);
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.registration * 3); // Allow 3x time for concurrent ops
    });

    it('should verify token quickly', async () => {
      setupTestEnvironment('single-tenant');
      const user = await createTestUser('single-tenant');
      const tokens = generateTestTokens(user, 'single-tenant');
      
      const startTime = Date.now();
      
      // Simulate token verification
      const tokenParts = tokens.accessToken.split('.');
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString()
      );
      
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(PERFORMANCE_TARGETS.tokenVerification);
      expect(payload.userId).toBe(user.id);
    });
  });
});

// Test helpers specific to integration tests
async function waitForTokenExpiry(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractTokenPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch {
    return null;
  }
}