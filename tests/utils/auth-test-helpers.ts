/**
 * Authentication Test Helper Utilities
 * 
 * These utilities will be used across all authentication tests
 * once the implementation is complete.
 */

import { TEST_CONFIGS, TEST_USERS } from '../test.config';

// Mock implementations until real auth services are available
export interface AuthService {
  register(userData: any): Promise<any>;
  login(credentials: any): Promise<any>;
  refresh(refreshToken: string): Promise<any>;
  logout(accessToken: string): Promise<void>;
}

export interface MockDatabase {
  users: Map<string, any>;
  sessions: Map<string, any>;
  tenants: Map<string, any>;
}

// Test database setup
export function createTestDatabase(mode: 'single-tenant' | 'multi-tenant'): MockDatabase {
  return {
    users: new Map(),
    sessions: new Map(),
    tenants: new Map()
  };
}

// Token generation helpers
export function generateMockToken(payload: any, expiresIn: string): string {
  // TODO: Replace with real JWT generation when available
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = calculateExpiry(expiresIn);
  const tokenPayload = { ...payload, exp };
  
  return btoa(JSON.stringify(header)) + '.' + 
         btoa(JSON.stringify(tokenPayload)) + '.' +
         'mock-signature';
}

export function calculateExpiry(duration: string): number {
  const now = Date.now() / 1000;
  const match = duration.match(/(\d+)([mhd])/);
  if (!match) return now + 900; // Default 15 minutes
  
  const [, amount, unit] = match;
  const multipliers = { m: 60, h: 3600, d: 86400 };
  return now + (parseInt(amount) * (multipliers[unit as keyof typeof multipliers] || 900));
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validateMasterKey(masterKey: string): boolean {
  // Master key should be at least 12 characters with complexity
  return masterKey.length >= 12 && /[A-Z]/.test(masterKey) && 
         /[a-z]/.test(masterKey) && /[0-9]/.test(masterKey) && 
         /[^A-Za-z0-9]/.test(masterKey);
}

// Encryption helpers (mocked until real implementation)
export async function mockEncrypt(data: string, key: string): Promise<string> {
  // TODO: Replace with real encryption when available
  return btoa(data + ':encrypted:' + key);
}

export async function mockDecrypt(encryptedData: string, key: string): Promise<string> {
  // TODO: Replace with real decryption when available
  const decoded = atob(encryptedData);
  return decoded.split(':encrypted:')[0] || '';
}

// API call helpers
export async function makeAuthRequest(
  endpoint: string, 
  method: string, 
  body?: any, 
  token?: string
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // TODO: Replace with actual API call when backend is ready
  return Promise.resolve(new Response(JSON.stringify({ 
    message: 'Mock response',
    status: 200 
  })));
}

// Performance measurement
export class PerformanceTracker {
  private startTimes: Map<string, number> = new Map();
  
  start(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }
  
  end(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) throw new Error(`No start time for operation: ${operation}`);
    
    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);
    return duration;
  }
  
  async measure<T>(operation: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    this.start(operation);
    const result = await fn();
    const duration = this.end(operation);
    return { result, duration };
  }
}

// Test data generators
export function generateTestUser(mode: 'single-tenant' | 'multi-tenant', index: number) {
  const baseUser = TEST_USERS[mode].validUser;
  return {
    ...baseUser,
    email: `test-${index}@${mode}.com`,
    databaseId: mode === 'single-tenant' ? `test-db-${index}` : undefined
  };
}

// Security test payloads
export const SECURITY_TEST_PAYLOADS = {
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "1; DELETE FROM users WHERE 1=1; --"
  ],
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>'
  ],
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
  ]
};

// Assertion helpers
export function assertTokenStructure(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT structure');
  }
  
  try {
    const header = JSON.parse(atob(parts[0] || ''));
    const payload = JSON.parse(atob(parts[1] || ''));
    
    if (!header.alg || !header.typ) {
      throw new Error('Invalid JWT header');
    }
    
    if (!payload.exp || !payload.iat) {
      throw new Error('Invalid JWT payload');
    }
  } catch (e) {
    throw new Error('Invalid JWT encoding');
  }
}

// Cleanup helpers
export async function cleanupTestData(db: MockDatabase) {
  db.users.clear();
  db.sessions.clear();
  db.tenants.clear();
}

// Export all helpers
export default {
  createTestDatabase,
  generateMockToken,
  validateEmail,
  validatePassword,
  validateMasterKey,
  mockEncrypt,
  mockDecrypt,
  makeAuthRequest,
  PerformanceTracker,
  generateTestUser,
  SECURITY_TEST_PAYLOADS,
  assertTokenStructure,
  cleanupTestData
};