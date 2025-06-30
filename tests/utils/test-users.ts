import crypto from 'crypto';
import { testConfig, getTestUser } from '../test.config';

// User data interfaces
export interface TestUserData {
  id?: string;
  email: string;
  password: string;
  databaseId?: string;
  masterKey?: string;
  tenantId?: string;
  role?: 'user' | 'admin';
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface SingleTenantUser extends TestUserData {
  databaseId: string;
  masterKey: string;
}

export interface MultiTenantUser extends TestUserData {
  tenantId: string;
  role: 'user' | 'admin';
}

// Test user factory
export class TestUserFactory {
  private users: Map<string, TestUserData> = new Map();

  // Create a single-tenant user
  createSingleTenantUser(overrides?: Partial<SingleTenantUser>): SingleTenantUser {
    const baseUser = getTestUser('singleTenant') as any;
    const user: SingleTenantUser = {
      id: crypto.randomUUID(),
      email: baseUser.email,
      password: baseUser.password,
      databaseId: baseUser.databaseId,
      masterKey: baseUser.masterKey,
      ...(overrides || {}),
    };
    this.users.set(user.email, user);
    return user;
  }

  // Create a multi-tenant user
  createMultiTenantUser(overrides?: Partial<MultiTenantUser>): MultiTenantUser {
    const baseUser = getTestUser('multiTenant') as any;
    const user: MultiTenantUser = {
      id: crypto.randomUUID(),
      email: baseUser.email,
      password: baseUser.password,
      tenantId: baseUser.tenantId,
      role: baseUser.role,
      ...(overrides || {}),
    };
    this.users.set(user.email, user);
    return user;
  }

  // Create an admin user
  createAdminUser(overrides?: Partial<MultiTenantUser>): MultiTenantUser {
    const baseUser = getTestUser('admin') as any;
    const user: MultiTenantUser = {
      id: crypto.randomUUID(),
      email: baseUser.email,
      password: baseUser.password,
      tenantId: baseUser.tenantId,
      role: baseUser.role,
      ...(overrides || {}),
    };
    this.users.set(user.email, user);
    return user;
  }

  // Get a user by email
  getUser(email: string): TestUserData | undefined {
    return this.users.get(email);
  }

  // Update user tokens
  updateUserTokens(email: string, tokens: { accessToken: string; refreshToken: string }): void {
    const user = this.users.get(email);
    if (user) {
      user.tokens = tokens;
    }
  }

  // Clear all users
  clearAll(): void {
    this.users.clear();
  }

  // List all users
  listUsers(): TestUserData[] {
    return Array.from(this.users.values());
  }
}

// Global test user factory
export const testUserFactory = new TestUserFactory();

// Helper functions
export function createTestUser(
  mode: 'single-tenant' | 'multi-tenant',
  overrides?: Partial<TestUserData>
): TestUserData {
  if (mode === 'single-tenant') {
    return testUserFactory.createSingleTenantUser(overrides as Partial<SingleTenantUser>);
  } else {
    return testUserFactory.createMultiTenantUser(overrides as Partial<MultiTenantUser>);
  }
}

export function createAdminUser(overrides?: Partial<MultiTenantUser>): MultiTenantUser {
  return testUserFactory.createAdminUser(overrides);
}

// Generate random user data
export function generateRandomUserData(mode: 'single-tenant' | 'multi-tenant'): TestUserData {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  
  const baseData = {
    email: `test-${timestamp}-${random}@example.com`,
    password: `Pass${timestamp}!@#`,
  };

  if (mode === 'single-tenant') {
    return {
      ...baseData,
      databaseId: `db-${timestamp}-${random}`,
      masterKey: generateStrongPassword(32),
    };
  } else {
    return {
      ...baseData,
      tenantId: `tenant-${timestamp}-${random}`,
      role: 'user' as const,
    };
  }
}

// Password generation and validation
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + specialChars;

  // Ensure at least one character from each category
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function isValidPassword(password: string): boolean {
  const config = testConfig.auth.password;
  
  if (password.length < config.minLength) {
    return false;
  }

  const checks = [
    { enabled: config.requireUppercase, pattern: /[A-Z]/ },
    { enabled: config.requireLowercase, pattern: /[a-z]/ },
    { enabled: config.requireNumbers, pattern: /[0-9]/ },
    { enabled: config.requireSpecialChars, pattern: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/ },
  ];

  return checks.every(check => !check.enabled || check.pattern.test(password));
}

// Mock JWT token generation (for testing)
export function generateMockTokens(userId: string, additionalClaims?: any): {
  accessToken: string;
  refreshToken: string;
} {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  const accessPayload = Buffer.from(JSON.stringify({
    userId,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
    ...additionalClaims,
  })).toString('base64url');
  
  const refreshPayload = Buffer.from(JSON.stringify({
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
  })).toString('base64url');

  // Mock signature
  const signature = crypto
    .createHmac('sha256', testConfig.auth.jwt.accessSecret)
    .update(`${header}.${accessPayload}`)
    .digest('base64url');

  return {
    accessToken: `${header}.${accessPayload}.${signature}`,
    refreshToken: `${header}.${refreshPayload}.${signature}`,
  };
}

// Clean up test users
export function cleanupTestUsers(): void {
  testUserFactory.clearAll();
}