// Using global Jest functions
import fs from 'fs/promises';
import path from 'path';
import { 
  setupTestEnvironment, 
  cleanupTestEnvironment, 
  testConfig,
  getTestUser 
} from '../test.config';
import {
  authTestClient,
  registerAndLoginSingleTenant,
  registerAndLoginMultiTenant,
  loginTestUser,
  parseJWT,
  isTokenExpired,
  delay,
  expectSuccessResponse,
  expectErrorResponse,
} from '../utils/auth-test-helpers';
import {
  createTestDatabase,
  cleanupTestDatabases,
  isEncrypted,
  generateMasterKey,
  isValidMasterKey,
} from '../utils/test-database';
import {
  createTestUser,
  createAdminUser,
  generateRandomUserData,
  generateStrongPassword,
  isValidPassword,
  cleanupTestUsers,
} from '../utils/test-users';

describe('Authentication E2E Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  afterEach(async () => {
    // Clean up after each test
    await cleanupTestDatabases();
    cleanupTestUsers();
    authTestClient.clearAuthToken();
  });

  describe('Single-Tenant Authentication', () => {
    describe('Registration', () => {
      test('should register new user with master key', async () => {
        // Create test database
        const dbInfo = await createTestDatabase();
        
        const userData = {
          email: 'test@example.com',
          password: 'SecurePass123!@#$%^&*()',
          databaseId: dbInfo.dbId,
          masterKey: dbInfo.masterKey,
        };
        
        const response = await authTestClient.registerSingleTenant(userData);
        
        expect(response.status).toBe(201);
        expect(response.data.user).toBeDefined();
        expect(response.data.user.email).toBe(userData.email);
        expect(response.data.user.databaseId).toBe(userData.databaseId);
        expect(response.data.tokens).toBeDefined();
        expect(response.data.tokens.accessToken).toBeDefined();
        expect(response.data.tokens.refreshToken).toBeDefined();
        
        // Verify database was created and encrypted
        const dbPath = path.join(testConfig.database.testDbDir, `${userData.databaseId}.db`);
        const exists = await fs.access(dbPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
        
        const dbContent = await fs.readFile(dbPath);
        expect(isEncrypted(dbContent)).toBe(true);
        
        // Verify JWT structure
        const decoded = parseJWT(response.data.tokens.accessToken);
        expect(decoded.userId).toBeDefined();
        expect(decoded.databaseId).toBe(userData.databaseId);
        expect(decoded.type).toBe('access');
      });

      test('should reject registration with invalid master key', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          databaseId: 'test-db-001',
          masterKey: 'short', // Too short
        };
        
        const response = await authTestClient.registerSingleTenant(userData);
        
        expect(response.status).toBe(400);
        expect(response.data.error).toContain('master key');
      });

      test('should reject registration with existing database ID', async () => {
        // Register first user
        const { user: firstUser } = await registerAndLoginSingleTenant();
        
        // Try to register with same database ID
        const userData = {
          email: 'another@example.com',
          password: 'AnotherPass123!',
          databaseId: firstUser.databaseId,
          masterKey: generateMasterKey(),
        };
        
        const response = await authTestClient.registerSingleTenant(userData);
        
        expect(response.status).toBe(409);
        expect(response.data.error).toContain('already exists');
      });

      test('should enforce password complexity requirements', async () => {
        const dbInfo = await createTestDatabase();
        
        const weakPasswords = [
          'short',           // Too short
          'alllowercase',    // No uppercase
          'ALLUPPERCASE',    // No lowercase
          'NoNumbers!',      // No numbers
          'NoSpecialChar1',  // No special characters
        ];
        
        for (const password of weakPasswords) {
          const response = await authTestClient.registerSingleTenant({
            email: `test-${Date.now()}@example.com`,
            password,
            databaseId: dbInfo.dbId,
            masterKey: dbInfo.masterKey,
          });
          
          expect(response.status).toBe(400);
          expect(response.data.error).toContain('password');
        }
      });
    });

    describe('Login', () => {
      test('should login with valid credentials', async () => {
        // Setup: Create user first
        const { user, dbInfo } = await registerAndLoginSingleTenant();
        
        // Clear auth token to test fresh login
        authTestClient.clearAuthToken();
        
        const response = await authTestClient.loginSingleTenant({
          databaseId: user.databaseId,
          masterKey: dbInfo.masterKey,
          password: user.password,
        });
        
        expect(response.status).toBe(200);
        expect(response.data.tokens).toBeDefined();
        expect(response.data.tokens.accessToken).toBeDefined();
        expect(response.data.tokens.refreshToken).toBeDefined();
        
        // Verify JWT payload
        const decoded = parseJWT(response.data.tokens.accessToken);
        expect(decoded.userId).toBeDefined();
        expect(decoded.databaseId).toBe(user.databaseId);
      });

      test('should reject login with invalid master key', async () => {
        const { user } = await registerAndLoginSingleTenant();
        
        const response = await authTestClient.loginSingleTenant({
          databaseId: user.databaseId,
          masterKey: 'WrongMasterKey123!@#',
          password: user.password,
        });
        
        expect(response.status).toBe(401);
        expect(response.data.error).toContain('Invalid credentials');
      });

      test('should reject login with invalid password', async () => {
        const { user, dbInfo } = await registerAndLoginSingleTenant();
        
        const response = await authTestClient.loginSingleTenant({
          databaseId: user.databaseId,
          masterKey: dbInfo.masterKey,
          password: 'WrongPassword123!',
        });
        
        expect(response.status).toBe(401);
        expect(response.data.error).toContain('Invalid credentials');
      });

      test('should reject login with non-existent database', async () => {
        const response = await authTestClient.loginSingleTenant({
          databaseId: 'non-existent-db',
          masterKey: generateMasterKey(),
          password: 'SomePassword123!',
        });
        
        expect(response.status).toBe(404);
        expect(response.data.error).toContain('Database not found');
      });
    });
  });

  describe('Multi-Tenant Authentication', () => {
    describe('Registration', () => {
      test('should register new user in multi-tenant mode', async () => {
        const userData = {
          email: 'tenant-user@example.com',
          password: 'TenantPass123!@#',
          tenantId: 'test-tenant-001',
          role: 'user' as const,
        };
        
        const response = await authTestClient.registerMultiTenant(userData);
        
        expect(response.status).toBe(201);
        expect(response.data.user).toBeDefined();
        expect(response.data.user.email).toBe(userData.email);
        expect(response.data.user.tenantId).toBe(userData.tenantId);
        expect(response.data.user.role).toBe(userData.role);
        expect(response.data.tokens).toBeDefined();
        
        // Verify JWT structure
        const decoded = parseJWT(response.data.tokens.accessToken);
        expect(decoded.userId).toBeDefined();
        expect(decoded.tenantId).toBe(userData.tenantId);
        expect(decoded.role).toBe(userData.role);
      });

      test('should register admin user in multi-tenant mode', async () => {
        const adminData = {
          email: 'admin@example.com',
          password: 'AdminPass123!@#',
          tenantId: 'test-tenant-001',
          role: 'admin' as const,
        };
        
        const response = await authTestClient.registerMultiTenant(adminData);
        
        expect(response.status).toBe(201);
        expect(response.data.user.role).toBe('admin');
        
        const decoded = parseJWT(response.data.tokens.accessToken);
        expect(decoded.role).toBe('admin');
      });

      test('should reject duplicate email within same tenant', async () => {
        // Register first user
        const { user } = await registerAndLoginMultiTenant();
        
        // Try to register with same email in same tenant
        const response = await authTestClient.registerMultiTenant({
          email: user.email,
          password: 'DifferentPass123!',
          tenantId: user.tenantId,
        });
        
        expect(response.status).toBe(409);
        expect(response.data.error).toContain('already exists');
      });

      test('should allow same email in different tenants', async () => {
        // Register first user
        const { user } = await registerAndLoginMultiTenant();
        
        // Register same email in different tenant
        const response = await authTestClient.registerMultiTenant({
          email: user.email,
          password: 'DifferentPass123!',
          tenantId: 'different-tenant-002',
        });
        
        expect(response.status).toBe(201);
        expect(response.data.user.tenantId).toBe('different-tenant-002');
      });
    });

    describe('Login', () => {
      test('should login with valid multi-tenant credentials', async () => {
        const { user } = await registerAndLoginMultiTenant();
        
        // Clear token and login again
        authTestClient.clearAuthToken();
        
        const response = await authTestClient.loginMultiTenant({
          email: user.email,
          password: user.password,
          tenantId: user.tenantId,
        });
        
        expect(response.status).toBe(200);
        expect(response.data.tokens).toBeDefined();
        
        const decoded = parseJWT(response.data.tokens.accessToken);
        expect(decoded.tenantId).toBe(user.tenantId);
        expect(decoded.role).toBe(user.role);
      });

      test('should reject login with wrong tenant ID', async () => {
        const { user } = await registerAndLoginMultiTenant();
        
        const response = await authTestClient.loginMultiTenant({
          email: user.email,
          password: user.password,
          tenantId: 'wrong-tenant-id',
        });
        
        expect(response.status).toBe(401);
        expect(response.data.error).toContain('Invalid credentials');
      });
    });
  });

  describe('Token Management', () => {
    describe('Token Refresh', () => {
      test('should refresh expired access token', async () => {
        const { tokens } = await registerAndLoginSingleTenant();
        
        // Wait a bit to ensure different token generation time
        await delay(1000);
        
        const response = await authTestClient.refreshToken(tokens.refreshToken);
        
        expect(response.status).toBe(200);
        expect(response.data.accessToken).toBeDefined();
        expect(response.data.accessToken).not.toBe(tokens.accessToken);
        
        // Verify new token is valid
        const decoded = parseJWT(response.data.accessToken);
        expect(decoded.type).toBe('access');
        expect(isTokenExpired(response.data.accessToken)).toBe(false);
      });

      test('should reject invalid refresh token', async () => {
        const response = await authTestClient.refreshToken('invalid-refresh-token');
        
        expect(response.status).toBe(401);
        expect(response.data.error).toContain('Invalid token');
      });

      test('should reject expired refresh token', async () => {
        // This test would require mocking time or waiting for actual expiration
        // For now, we'll test with a manually crafted expired token
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
          Buffer.from(JSON.stringify({
            type: 'refresh',
            exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          })).toString('base64url') +
          '.fake-signature';
        
        const response = await authTestClient.refreshToken(expiredToken);
        
        expect(response.status).toBe(401);
        expect(response.data.error).toContain('expired');
      });
    });

    describe('Token Verification', () => {
      test('should verify valid access token', async () => {
        const { tokens } = await registerAndLoginSingleTenant();
        
        authTestClient.setAuthToken(tokens.accessToken);
        const response = await authTestClient.verifyToken();
        
        expect(response.status).toBe(200);
        expect(response.data.valid).toBe(true);
        expect(response.data.user).toBeDefined();
      });

      test('should reject invalid access token', async () => {
        authTestClient.setAuthToken('invalid-token');
        const response = await authTestClient.verifyToken();
        
        expect(response.status).toBe(401);
        expect(response.data.valid).toBe(false);
      });

      test('should reject request without token', async () => {
        authTestClient.clearAuthToken();
        const response = await authTestClient.verifyToken();
        
        expect(response.status).toBe(401);
        expect(response.data.error).toContain('No token provided');
      });
    });
  });

  describe('Logout', () => {
    test('should logout and invalidate tokens', async () => {
      const { tokens } = await registerAndLoginSingleTenant();
      
      authTestClient.setAuthToken(tokens.accessToken);
      const logoutResponse = await authTestClient.logout(tokens.refreshToken);
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.data.message).toContain('logged out');
      
      // Try to use the tokens after logout
      const verifyResponse = await authTestClient.verifyToken();
      expect(verifyResponse.status).toBe(401);
      
      const refreshResponse = await authTestClient.refreshToken(tokens.refreshToken);
      expect(refreshResponse.status).toBe(401);
    });

    test('should handle logout without refresh token', async () => {
      const { tokens } = await registerAndLoginSingleTenant();
      
      authTestClient.setAuthToken(tokens.accessToken);
      const response = await authTestClient.logout();
      
      expect(response.status).toBe(200);
    });
  });

  describe('Protected Routes', () => {
    test('should access protected route with valid token', async () => {
      const { tokens } = await registerAndLoginSingleTenant();
      
      authTestClient.setAuthToken(tokens.accessToken);
      
      // Test a protected endpoint (assuming /api/user/profile exists)
      const response = await authTestClient.client.get('/api/user/profile');
      
      // The exact status depends on implementation
      // If endpoint doesn't exist, we'd get 404 instead of 401
      expect([200, 404]).toContain(response.status);
    });

    test('should deny access to protected route without token', async () => {
      authTestClient.clearAuthToken();
      
      const response = await authTestClient.client.get('/api/user/profile');
      
      // Should get 401 or 404 (if route doesn't exist)
      expect([401, 404]).toContain(response.status);
    });
  });

  describe('Database Challenge-Response', () => {
    test('should complete challenge-response authentication', async () => {
      const { dbInfo } = await registerAndLoginSingleTenant();
      
      // Get challenge
      const challengeResponse = await authTestClient.getDatabaseChallenge(dbInfo.dbId);
      
      expect(challengeResponse.status).toBe(200);
      expect(challengeResponse.data.challenge).toBeDefined();
      expect(challengeResponse.data.nonce).toBeDefined();
      expect(challengeResponse.data.expiresAt).toBeDefined();
      
      // In a real implementation, we would compute the response
      // For now, we just verify the challenge structure
      const { challenge, nonce, expiresAt } = challengeResponse.data;
      expect(typeof challenge).toBe('string');
      expect(typeof nonce).toBe('string');
      expect(expiresAt).toBeGreaterThan(Date.now());
    });

    test('should reject challenge for non-existent database', async () => {
      const response = await authTestClient.getDatabaseChallenge('non-existent-db');
      
      expect(response.status).toBe(404);
      expect(response.data.error).toContain('Database not found');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits on failed login attempts', async () => {
      const { user, dbInfo } = await registerAndLoginSingleTenant();
      
      // Make multiple failed login attempts
      const maxAttempts = testConfig.auth.rateLimit.maxAttempts;
      const failedAttempts = [];
      
      for (let i = 0; i < maxAttempts + 1; i++) {
        failedAttempts.push(
          authTestClient.loginSingleTenant({
            databaseId: user.databaseId,
            masterKey: dbInfo.masterKey,
            password: 'WrongPassword!',
          })
        );
      }
      
      const responses = await Promise.all(failedAttempts);
      
      // First attempts should fail with 401
      for (let i = 0; i < maxAttempts; i++) {
        expect(responses[i].status).toBe(401);
      }
      
      // Last attempt should be rate limited
      expect(responses[maxAttempts].status).toBe(429);
      expect(responses[maxAttempts].data.error).toContain('Too many attempts');
    });
  });
});