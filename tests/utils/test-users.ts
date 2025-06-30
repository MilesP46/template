/**
 * Test User Creation Utilities
 * Helpers for creating and managing test users
 */

import crypto from 'crypto';
import { TEST_CONFIGS, TEST_USERS } from '../test.config';
import { 
  generateTestDatabaseId,
  createSingleTenantDatabase,
  mockUserStorage 
} from './test-database';

// Use simplified password hashing for tests (not production-ready)
const simpleHash = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Use simplified JWT generation for tests
const generateToken = (payload: any, secret: string, expiresIn: number): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const tokenPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };
  
  return Buffer.from(JSON.stringify(header)).toString('base64') + '.' + 
         Buffer.from(JSON.stringify(tokenPayload)).toString('base64') + '.' +
         'mock-signature';
};

export interface TestUser {
  id: string;
  email: string;
  password: string; // Plain text for test purposes
  hashedPassword: string; // Hashed version
  databaseId?: string;
  masterKey?: string;
  tenantId?: string;
  role?: string;
  createdAt: Date;
}

export interface TestTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate a unique test user ID
 */
export function generateUserId(): string {
  return `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Hash a password using simple hash for tests
 */
export async function hashPassword(password: string): Promise<string> {
  return simpleHash(password);
}

/**
 * Create a test user for single-tenant mode
 */
export async function createSingleTenantTestUser(
  overrides?: Partial<TestUser>
): Promise<TestUser> {
  const baseUser = TEST_USERS['single-tenant'].validUser;
  const databaseId = overrides?.databaseId || generateTestDatabaseId('single');
  
  // Create the database file
  createSingleTenantDatabase(databaseId);
  
  const user: TestUser = {
    id: generateUserId(),
    email: overrides?.email || baseUser.email,
    password: overrides?.password || baseUser.password,
    hashedPassword: await hashPassword(overrides?.password || baseUser.password),
    databaseId,
    masterKey: overrides?.masterKey || baseUser.masterKey,
    role: 'user',
    createdAt: new Date()
  };
  
  // Store in mock storage
  mockUserStorage.addUser(user);
  
  return user;
}

/**
 * Create a test user for multi-tenant mode
 */
export async function createMultiTenantTestUser(
  overrides?: Partial<TestUser>
): Promise<TestUser> {
  const baseUser = TEST_USERS['multi-tenant'].validUser;
  
  const user: TestUser = {
    id: generateUserId(),
    email: overrides?.email || baseUser.email,
    password: overrides?.password || baseUser.password,
    hashedPassword: await hashPassword(overrides?.password || baseUser.password),
    tenantId: overrides?.tenantId || baseUser.tenantId,
    role: 'user',
    createdAt: new Date()
  };
  
  // Store in mock storage
  mockUserStorage.addUser(user);
  
  return user;
}

/**
 * Create a test user based on auth mode
 */
export async function createTestUser(
  mode: 'single-tenant' | 'multi-tenant',
  overrides?: Partial<TestUser>
): Promise<TestUser> {
  return mode === 'single-tenant' 
    ? createSingleTenantTestUser(overrides)
    : createMultiTenantTestUser(overrides);
}

/**
 * Generate JWT tokens for a test user
 */
export function generateTestTokens(
  user: TestUser,
  mode: 'single-tenant' | 'multi-tenant'
): TestTokens {
  const config = TEST_CONFIGS[mode];
  const accessTokenExpiry = config.JWT_ACCESS_EXPIRY;
  const refreshTokenExpiry = config.JWT_REFRESH_EXPIRY;
  
  // Parse expiry time
  const accessExpiresIn = parseExpiryToSeconds(accessTokenExpiry);
  const refreshExpiresIn = parseExpiryToSeconds(refreshTokenExpiry);
  
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    ...(mode === 'single-tenant' && { databaseId: user.databaseId }),
    ...(mode === 'multi-tenant' && { tenantId: user.tenantId }),
    role: user.role
  };
  
  const accessToken = generateToken(
    tokenPayload,
    config.JWT_ACCESS_SECRET as string,
    accessExpiresIn
  );
  
  const refreshToken = generateToken(
    { userId: user.id },
    config.JWT_REFRESH_SECRET as string,
    refreshExpiresIn
  );
  
  return {
    accessToken,
    refreshToken,
    expiresIn: accessExpiresIn
  };
}

/**
 * Parse JWT expiry string to seconds
 */
function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes
  
  const [, amount, unit] = match;
  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400
  };
  
  return parseInt(amount) * (multipliers[unit as keyof typeof multipliers] || 60);
}

/**
 * Create multiple test users
 */
export async function createTestUsers(
  mode: 'single-tenant' | 'multi-tenant',
  count: number
): Promise<TestUser[]> {
  const users: TestUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createTestUser(mode, {
      email: `test${i}@${mode}.com`
    });
    users.push(user);
  }
  
  return users;
}

/**
 * Login a test user and get tokens
 */
export async function loginTestUser(
  user: TestUser,
  mode: 'single-tenant' | 'multi-tenant'
): Promise<{ user: TestUser; tokens: TestTokens }> {
  const tokens = generateTestTokens(user, mode);
  const sessionId = mockUserStorage.createSession(user.id, tokens);
  
  return {
    user,
    tokens
  };
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return simpleHash(password) === hashedPassword;
}

/**
 * Clean up test users
 */
export function cleanupTestUsers(): void {
  mockUserStorage.clear();
}