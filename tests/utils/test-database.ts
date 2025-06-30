/**
 * Test Database Utilities
 * Manages test database creation, cleanup, and data seeding
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { TEST_CONFIGS } from '../test.config';

const TEST_DB_DIR = path.join(process.cwd(), 'test-databases');

/**
 * Ensure test database directory exists
 */
export function ensureTestDbDirectory(): void {
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
}

/**
 * Create a test database file for single-tenant mode
 */
export function createSingleTenantDatabase(databaseId: string): string {
  ensureTestDbDirectory();
  const dbPath = path.join(TEST_DB_DIR, `${databaseId}.db`);
  
  // Create empty database file
  fs.writeFileSync(dbPath, '');
  
  // In real implementation, this would be encrypted
  // For now, we'll simulate encryption
  const encryptedContent = Buffer.from(JSON.stringify({
    encrypted: true,
    databaseId,
    createdAt: new Date().toISOString()
  })).toString('base64');
  
  fs.writeFileSync(dbPath, encryptedContent);
  
  return dbPath;
}

/**
 * Clean up a specific test database
 */
export function cleanupDatabase(databaseId: string): void {
  const dbPath = path.join(TEST_DB_DIR, `${databaseId}.db`);
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}

/**
 * Clean up all test databases
 */
export function cleanupAllTestDatabases(): void {
  if (fs.existsSync(TEST_DB_DIR)) {
    const files = fs.readdirSync(TEST_DB_DIR);
    files.forEach(file => {
      if (file.endsWith('.db')) {
        fs.unlinkSync(path.join(TEST_DB_DIR, file));
      }
    });
  }
}

/**
 * Check if a database exists
 */
export function databaseExists(databaseId: string): boolean {
  const dbPath = path.join(TEST_DB_DIR, `${databaseId}.db`);
  return fs.existsSync(dbPath);
}

/**
 * Check if database content is encrypted
 */
export function isDatabaseEncrypted(databaseId: string): boolean {
  const dbPath = path.join(TEST_DB_DIR, `${databaseId}.db`);
  if (!fs.existsSync(dbPath)) {
    return false;
  }
  
  try {
    const content = fs.readFileSync(dbPath, 'utf8');
    // Try to parse as base64 encoded JSON
    const decoded = Buffer.from(content, 'base64').toString();
    const parsed = JSON.parse(decoded);
    return parsed.encrypted === true;
  } catch {
    return false;
  }
}

/**
 * Generate a unique database ID for testing
 */
export function generateTestDatabaseId(prefix: string = 'test'): string {
  return `${prefix}-db-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Mock database user storage (for multi-tenant mode)
 */
export class MockUserStorage {
  private users: Map<string, any> = new Map();
  private sessions: Map<string, any> = new Map();
  
  addUser(user: any): void {
    this.users.set(user.id, user);
  }
  
  getUserById(id: string): any | undefined {
    return this.users.get(id);
  }
  
  getUserByEmail(email: string): any | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  
  createSession(userId: string, tokens: any): string {
    const sessionId = crypto.randomBytes(16).toString('hex');
    this.sessions.set(sessionId, { userId, tokens, createdAt: new Date() });
    return sessionId;
  }
  
  getSession(sessionId: string): any | undefined {
    return this.sessions.get(sessionId);
  }
  
  clear(): void {
    this.users.clear();
    this.sessions.clear();
  }
}

// Global mock storage for tests
export const mockUserStorage = new MockUserStorage();