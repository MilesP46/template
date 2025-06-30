import crypto from 'crypto';
import { testConfig, getApiEndpoint } from '../test.config';
import type { TestUserData, SingleTenantUser, MultiTenantUser } from './test-users';
import { createTestDatabase } from './test-database';

// Type definitions for axios
type AxiosInstance = any;
type AxiosResponse = any;

// Dynamic import axios to avoid compilation issues
const axios = require('axios');

// API client for tests
export class AuthTestClient {
  public client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || testConfig.api.baseUrl,
      timeout: testConfig.timeouts.integration,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on error status codes
    });
  }

  // Set authorization header
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Clear authorization header
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Single-tenant registration
  async registerSingleTenant(userData: {
    email: string;
    password: string;
    databaseId: string;
    masterKey: string;
  }): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('auth', 'register'), {
      ...userData,
      mode: 'single-tenant',
    });
  }

  // Multi-tenant registration
  async registerMultiTenant(userData: {
    email: string;
    password: string;
    tenantId: string;
    role?: string;
  }): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('auth', 'register'), {
      ...userData,
      mode: 'multi-tenant',
    });
  }

  // Single-tenant login
  async loginSingleTenant(credentials: {
    databaseId: string;
    masterKey: string;
    password?: string;
  }): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('auth', 'login'), {
      ...credentials,
      mode: 'single-tenant',
    });
  }

  // Multi-tenant login
  async loginMultiTenant(credentials: {
    email: string;
    password: string;
    tenantId: string;
  }): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('auth', 'login'), {
      ...credentials,
      mode: 'multi-tenant',
    });
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('auth', 'refresh'), {
      refreshToken,
    });
  }

  // Logout
  async logout(refreshToken?: string): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('auth', 'logout'), {
      refreshToken,
    });
  }

  // Verify token
  async verifyToken(): Promise<AxiosResponse> {
    return this.client.get(getApiEndpoint('auth', 'verify'));
  }

  // Database operations
  async createDatabase(data: {
    databaseId: string;
    masterKey: string;
  }): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('database', 'create'), data);
  }

  async authorizeDatabase(data: {
    databaseId: string;
    masterKey: string;
  }): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('database', 'authorize'), data);
  }

  async getDatabaseChallenge(databaseId: string): Promise<AxiosResponse> {
    return this.client.post(getApiEndpoint('database', 'challenge'), {
      databaseId,
    });
  }
}

// Global test client instance
export const authTestClient = new AuthTestClient();

// Helper functions for complete auth flows
export async function registerAndLoginSingleTenant(
  userData?: Partial<SingleTenantUser>
): Promise<{
  user: SingleTenantUser;
  tokens: { accessToken: string; refreshToken: string };
  dbInfo: { dbId: string; masterKey: string; dbPath: string };
}> {
  // Create test database
  const dbInfo = await createTestDatabase();

  // Create user data
  const user: SingleTenantUser = {
    email: userData?.email || `test-${Date.now()}@example.com`,
    password: userData?.password || 'TestPass123!@#',
    databaseId: dbInfo.dbId,
    masterKey: dbInfo.masterKey,
    id: userData?.id || crypto.randomUUID(),
  };

  // Register user
  const registerResponse = await authTestClient.registerSingleTenant(user);
  
  if (registerResponse.status !== 201) {
    throw new Error(`Registration failed: ${registerResponse.data.message || 'Unknown error'}`);
  }

  // Extract tokens
  const tokens = registerResponse.data.tokens;
  user.tokens = tokens;

  return {
    user,
    tokens,
    dbInfo,
  };
}

export async function registerAndLoginMultiTenant(
  userData?: Partial<MultiTenantUser>
): Promise<{
  user: MultiTenantUser;
  tokens: { accessToken: string; refreshToken: string };
}> {
  // Create user data
  const user: MultiTenantUser = {
    email: userData?.email || `test-${Date.now()}@example.com`,
    password: userData?.password || 'TestPass123!@#',
    tenantId: userData?.tenantId || 'test-tenant-001',
    role: userData?.role || 'user',
    id: userData?.id || crypto.randomUUID(),
  };

  // Register user
  const registerResponse = await authTestClient.registerMultiTenant(user);
  
  if (registerResponse.status !== 201) {
    throw new Error(`Registration failed: ${registerResponse.data.message || 'Unknown error'}`);
  }

  // Extract tokens
  const tokens = registerResponse.data.tokens;
  user.tokens = tokens;

  return {
    user,
    tokens,
  };
}

// Login helper
export async function loginTestUser(user: TestUserData): Promise<{
  tokens: { accessToken: string; refreshToken: string };
  response: AxiosResponse;
}> {
  let response: AxiosResponse;

  if ('databaseId' in user && 'masterKey' in user) {
    // Single-tenant login
    response = await authTestClient.loginSingleTenant({
      databaseId: user.databaseId,
      masterKey: user.masterKey,
      password: user.password,
    });
  } else if ('tenantId' in user) {
    // Multi-tenant login
    response = await authTestClient.loginMultiTenant({
      email: user.email,
      password: user.password,
      tenantId: user.tenantId,
    });
  } else {
    throw new Error('Invalid user data for login');
  }

  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.data.message || 'Unknown error'}`);
  }

  return {
    tokens: response.data.tokens,
    response,
  };
}

// Token validation helpers
export function parseJWT(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  const payload = parts[1];
  if (!payload) {
    throw new Error('Invalid JWT payload');
  }
  const decoded = Buffer.from(payload, 'base64url').toString();
  return JSON.parse(decoded);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJWT(token);
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

// Wait helper
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Response assertion helpers
export function expectSuccessResponse(response: AxiosResponse, expectedStatus: number = 200): void {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. ` +
      `Response: ${JSON.stringify(response.data, null, 2)}`
    );
  }
}

export function expectErrorResponse(
  response: AxiosResponse,
  expectedStatus: number,
  expectedError?: string
): void {
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. ` +
      `Response: ${JSON.stringify(response.data, null, 2)}`
    );
  }

  if (expectedError && !response.data.error?.includes(expectedError)) {
    throw new Error(
      `Expected error to contain "${expectedError}", ` +
      `got: ${response.data.error || response.data.message}`
    );
  }
}

// Security test helpers
export async function testSQLInjection(
  endpoint: string,
  payload: any,
  injectionPatterns: string[] = testConfig.security.sqlInjectionPatterns
): Promise<boolean> {
  for (const pattern of injectionPatterns) {
    const maliciousPayload = { ...payload };
    
    // Try injection in each string field
    for (const key in maliciousPayload) {
      if (typeof maliciousPayload[key] === 'string') {
        maliciousPayload[key] = pattern;
        
        const response = await authTestClient.client.post(endpoint, maliciousPayload);
        
        // If we get a SQL error or unexpected success, injection might be possible
        if (
          response.status === 200 ||
          response.data.error?.toLowerCase().includes('sql') ||
          response.data.error?.toLowerCase().includes('syntax')
        ) {
          return true; // Vulnerable to SQL injection
        }
      }
    }
  }
  
  return false; // Not vulnerable
}

export async function testXSS(
  endpoint: string,
  payload: any,
  xssPatterns: string[] = testConfig.security.xssPatterns
): Promise<boolean> {
  for (const pattern of xssPatterns) {
    const maliciousPayload = { ...payload };
    
    // Try XSS in each string field
    for (const key in maliciousPayload) {
      if (typeof maliciousPayload[key] === 'string') {
        maliciousPayload[key] = pattern;
        
        const response = await authTestClient.client.post(endpoint, maliciousPayload);
        
        // Check if the pattern is reflected without escaping
        const responseText = JSON.stringify(response.data);
        if (responseText.includes(pattern)) {
          return true; // Vulnerable to XSS
        }
      }
    }
  }
  
  return false; // Not vulnerable
}