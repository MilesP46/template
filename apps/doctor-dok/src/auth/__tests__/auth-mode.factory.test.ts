import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthModeFactory } from '../auth-mode.factory';
import { IAuthMode } from '@doctor-dok/shared-types';
import { AuthMode } from '@doctor-dok/shared-types';

// Mock implementations
class SingleTenantAuthMode implements IAuthMode {
  async initialize(): Promise<void> {}
  async createUser(userData: any): Promise<any> { return userData; }
  async authenticateUser(credentials: any): Promise<any> { return { success: true }; }
  async refreshToken(refreshToken: string): Promise<any> { return { accessToken: 'new', refreshToken: 'new' }; }
  async logout(userId: string): Promise<void> {}
  async deleteUser(userId: string): Promise<void> {}
  requiresMasterKey(): boolean { return true; }
  supportsMultipleUsers(): boolean { return false; }
}

class MultiTenantAuthMode implements IAuthMode {
  async initialize(): Promise<void> {}
  async createUser(userData: any): Promise<any> { return userData; }
  async authenticateUser(credentials: any): Promise<any> { return { success: true }; }
  async refreshToken(refreshToken: string): Promise<any> { return { accessToken: 'new', refreshToken: 'new' }; }
  async logout(userId: string): Promise<void> {}
  async deleteUser(userId: string): Promise<void> {}
  requiresMasterKey(): boolean { return false; }
  supportsMultipleUsers(): boolean { return true; }
}

describe('AuthModeFactory', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear auth-related env vars
    delete process.env.AUTH_MODE;
    delete process.env.SINGLE_TENANT_KEY;
    delete process.env.MULTI_TENANT_DB_URL;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('createAuthMode', () => {
    it('should create single-tenant auth mode when AUTH_MODE is single-tenant', async () => {
      process.env.AUTH_MODE = 'single-tenant';
      process.env.SINGLE_TENANT_KEY = 'test-key';

      const factory = new AuthModeFactory();
      const authMode = await factory.createAuthMode();

      expect(authMode).toBeDefined();
      expect(authMode.requiresMasterKey()).toBe(true);
      expect(authMode.supportsMultipleUsers()).toBe(false);
    });

    it('should create multi-tenant auth mode when AUTH_MODE is multi-tenant', async () => {
      process.env.AUTH_MODE = 'multi-tenant';
      process.env.MULTI_TENANT_DB_URL = 'sqlite://test.db';

      const factory = new AuthModeFactory();
      const authMode = await factory.createAuthMode();

      expect(authMode).toBeDefined();
      expect(authMode.requiresMasterKey()).toBe(false);
      expect(authMode.supportsMultipleUsers()).toBe(true);
    });

    it('should throw error when AUTH_MODE is not set', async () => {
      const factory = new AuthModeFactory();
      
      await expect(factory.createAuthMode()).rejects.toThrow(
        'AUTH_MODE environment variable must be set to either "single-tenant" or "multi-tenant"'
      );
    });

    it('should throw error when AUTH_MODE is invalid', async () => {
      process.env.AUTH_MODE = 'invalid-mode';

      const factory = new AuthModeFactory();
      
      await expect(factory.createAuthMode()).rejects.toThrow(
        'Invalid AUTH_MODE: invalid-mode. Must be either "single-tenant" or "multi-tenant"'
      );
    });

    it('should throw error when single-tenant mode lacks required configuration', async () => {
      process.env.AUTH_MODE = 'single-tenant';
      // Missing SINGLE_TENANT_KEY

      const factory = new AuthModeFactory();
      
      await expect(factory.createAuthMode()).rejects.toThrow(
        'Single-tenant mode requires SINGLE_TENANT_KEY environment variable'
      );
    });

    it('should throw error when multi-tenant mode lacks required configuration', async () => {
      process.env.AUTH_MODE = 'multi-tenant';
      // Missing MULTI_TENANT_DB_URL

      const factory = new AuthModeFactory();
      
      await expect(factory.createAuthMode()).rejects.toThrow(
        'Multi-tenant mode requires MULTI_TENANT_DB_URL environment variable'
      );
    });
  });

  describe('getAuthMode', () => {
    it('should return cached auth mode on subsequent calls', async () => {
      process.env.AUTH_MODE = 'single-tenant';
      process.env.SINGLE_TENANT_KEY = 'test-key';

      const factory = new AuthModeFactory();
      const firstCall = await factory.getAuthMode();
      const secondCall = await factory.getAuthMode();

      expect(firstCall).toBe(secondCall); // Same instance
    });

    it('should initialize auth mode before returning', async () => {
      process.env.AUTH_MODE = 'single-tenant';
      process.env.SINGLE_TENANT_KEY = 'test-key';

      const factory = new AuthModeFactory();
      const initializeSpy = vi.spyOn(SingleTenantAuthMode.prototype, 'initialize');
      
      const authMode = await factory.getAuthMode();

      expect(initializeSpy).toHaveBeenCalledOnce();
    });
  });

  describe('validateConfiguration', () => {
    it('should validate single-tenant configuration', () => {
      process.env.AUTH_MODE = 'single-tenant';
      process.env.SINGLE_TENANT_KEY = 'test-key';

      const factory = new AuthModeFactory();
      
      expect(() => factory.validateConfiguration()).not.toThrow();
    });

    it('should validate multi-tenant configuration', () => {
      process.env.AUTH_MODE = 'multi-tenant';
      process.env.MULTI_TENANT_DB_URL = 'sqlite://test.db';

      const factory = new AuthModeFactory();
      
      expect(() => factory.validateConfiguration()).not.toThrow();
    });

    it('should provide helpful error messages for missing configuration', () => {
      process.env.AUTH_MODE = 'single-tenant';

      const factory = new AuthModeFactory();
      
      expect(() => factory.validateConfiguration()).toThrow(
        /Single-tenant mode requires SINGLE_TENANT_KEY environment variable/
      );
    });
  });

  describe('performance', () => {
    it('should select auth mode in less than 5ms', async () => {
      process.env.AUTH_MODE = 'single-tenant';
      process.env.SINGLE_TENANT_KEY = 'test-key';

      const factory = new AuthModeFactory();
      const start = performance.now();
      
      await factory.createAuthMode();
      
      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(5);
    });
  });
});