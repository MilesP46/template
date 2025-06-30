import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { testConfig } from '../test.config';

// Database file utilities
export class TestDatabase {
  private dbPath: string;
  private dbId: string;
  private masterKey: string;

  constructor(dbId?: string, masterKey?: string) {
    this.dbId = dbId || `test-db-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.masterKey = masterKey || crypto.randomBytes(32).toString('hex');
    this.dbPath = path.join(testConfig.database.testDbDir, `${this.dbId}.db`);
  }

  // Create a test database
  async create(): Promise<{ dbId: string; masterKey: string; dbPath: string }> {
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });

    // Create encrypted database file (mock implementation)
    const mockDbContent = JSON.stringify({
      version: '1.0.0',
      created: new Date().toISOString(),
      encrypted: true,
      testData: {
        tables: {},
        metadata: {
          dbId: this.dbId,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Simulate encryption (in real implementation, this would use proper encryption)
    const encryptedContent = Buffer.from(mockDbContent).toString('base64');
    await fs.writeFile(this.dbPath, encryptedContent);

    return {
      dbId: this.dbId,
      masterKey: this.masterKey,
      dbPath: this.dbPath,
    };
  }

  // Delete the test database
  async delete(): Promise<void> {
    try {
      await fs.unlink(this.dbPath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  // Check if database exists
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.dbPath);
      return true;
    } catch {
      return false;
    }
  }

  // Read database content (for testing)
  async read(): Promise<any> {
    const encryptedContent = await fs.readFile(this.dbPath, 'utf-8');
    const decryptedContent = Buffer.from(encryptedContent, 'base64').toString();
    return JSON.parse(decryptedContent);
  }

  // Update database content (for testing)
  async update(data: any): Promise<void> {
    const content = JSON.stringify(data);
    const encryptedContent = Buffer.from(content).toString('base64');
    await fs.writeFile(this.dbPath, encryptedContent);
  }

  // Get database info
  getInfo() {
    return {
      dbId: this.dbId,
      masterKey: this.masterKey,
      dbPath: this.dbPath,
    };
  }
}

// Database collection manager for tests
export class TestDatabaseManager {
  private databases: Map<string, TestDatabase> = new Map();

  // Create a new test database
  async createDatabase(dbId?: string, masterKey?: string): Promise<TestDatabase> {
    const db = new TestDatabase(dbId, masterKey);
    await db.create();
    this.databases.set(db.getInfo().dbId, db);
    return db;
  }

  // Get an existing test database
  getDatabase(dbId: string): TestDatabase | undefined {
    return this.databases.get(dbId);
  }

  // Delete a specific database
  async deleteDatabase(dbId: string): Promise<void> {
    const db = this.databases.get(dbId);
    if (db) {
      await db.delete();
      this.databases.delete(dbId);
    }
  }

  // Clean up all test databases
  async cleanupAll(): Promise<void> {
    const deletePromises = Array.from(this.databases.values()).map((db) =>
      db.delete()
    );
    await Promise.all(deletePromises);
    this.databases.clear();
  }

  // List all test databases
  listDatabases(): string[] {
    return Array.from(this.databases.keys());
  }
}

// Global test database manager instance
export const testDbManager = new TestDatabaseManager();

// Helper functions
export async function createTestDatabase(
  dbId?: string,
  masterKey?: string
): Promise<{ dbId: string; masterKey: string; dbPath: string }> {
  const db = await testDbManager.createDatabase(dbId, masterKey);
  return db.getInfo();
}

export async function cleanupTestDatabases(): Promise<void> {
  await testDbManager.cleanupAll();
}

// Check if a database is encrypted (mock implementation)
export function isEncrypted(content: Buffer | string): boolean {
  // In a real implementation, this would check for encryption headers/patterns
  try {
    const str = content.toString();
    // Check if it's base64 encoded (our mock encryption)
    const decoded = Buffer.from(str, 'base64').toString();
    JSON.parse(decoded);
    return true;
  } catch {
    return false;
  }
}

// Generate a valid master key
export function generateMasterKey(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Validate master key format
export function isValidMasterKey(key: string): boolean {
  if (key.length < testConfig.auth.masterKey.minLength) {
    return false;
  }
  // Check for complexity requirements
  const hasUppercase = /[A-Z]/.test(key);
  const hasLowercase = /[a-z]/.test(key);
  const hasNumbers = /[0-9]/.test(key);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(key);

  return hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
}