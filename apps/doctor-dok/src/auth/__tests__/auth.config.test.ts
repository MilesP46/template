import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthConfigService } from '../auth.config';
import { AuthMode } from '@doctor-dok/shared-types';

describe('AuthConfigService', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let configService: AuthConfigService;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear all environment variables
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('AUTH_') || key.startsWith('SINGLE_') || key.startsWith('MULTI_') || 
          key.includes('TOKEN') || key.includes('SESSION') || key.includes('ENCRYPTION')) {
        delete process.env[key];
      }
    });
    // Create new instance for each test
    configService = new AuthConfigService();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should return default configuration when no env vars are set', () => {
      const config = configService.getConfig();

      expect(config.mode).toBe(AuthMode.SINGLE_TENANT);
      expect(config.tokenExpiration.access).toBe('15m');
      expect(config.tokenExpiration.refresh).toBe('7d');
      expect(config.encryption.algorithm).toBe('aes-256-gcm');
      expect(config.encryption.keyLength).toBe(256);
      expect(config.encryption.saltRounds).toBe(10);
    });

    it('should parse single-tenant configuration', () => {
      process.env.AUTH_MODE = 'single-tenant';
      process.env.SINGLE_TENANT_KEY = 'test-master-key';
      process.env.SINGLE_TENANT_DB_PATH = '/path/to/db';
      process.env.SINGLE_TENANT_ENCRYPTION_KEY = 'encryption-key';
      process.env.SINGLE_TENANT_ALLOW_MULTIPLE = 'true';

      const config = configService.getConfig();

      expect(config.mode).toBe(AuthMode.SINGLE_TENANT);
      expect(config.singleTenant).toEqual({
        masterKey: 'test-master-key',
        databasePath: '/path/to/db',
        encryptionKey: 'encryption-key',
        allowMultipleInstances: true
      });
    });

    it('should parse multi-tenant configuration', () => {
      process.env.AUTH_MODE = 'multi-tenant';
      process.env.MULTI_TENANT_DB_URL = 'postgresql://localhost/db';
      process.env.MAX_USERS_PER_TENANT = '100';
      process.env.TENANT_ISOLATION_LEVEL = 'strict';
      process.env.TENANT_ID_STRATEGY = 'subdomain';

      const config = configService.getConfig();

      expect(config.mode).toBe(AuthMode.MULTI_TENANT);
      expect(config.multiTenant).toEqual({
        databaseUrl: 'postgresql://localhost/db',
        maxUsersPerTenant: 100,
        isolationLevel: 'strict',
        tenantIdStrategy: 'subdomain'
      });
    });

    it('should parse custom token expiration settings', () => {
      process.env.ACCESS_TOKEN_EXPIRATION = '30m';
      process.env.REFRESH_TOKEN_EXPIRATION = '14d';

      const config = configService.getConfig();

      expect(config.tokenExpiration.access).toBe('30m');
      expect(config.tokenExpiration.refresh).toBe('14d');
    });

    it('should parse session configuration when available', () => {
      process.env.SESSION_SECRET = 'secret-key';
      process.env.SESSION_SECURE = 'true';
      process.env.SESSION_SAME_SITE = 'lax';

      const config = configService.getConfig();

      expect(config.session).toEqual({
        secret: 'secret-key',
        secure: true,
        sameSite: 'lax'
      });
    });

    it('should cache configuration on first call', () => {
      process.env.AUTH_MODE = 'single-tenant';
      
      const config1 = configService.getConfig();
      
      // Change environment after first call
      process.env.AUTH_MODE = 'multi-tenant';
      
      const config2 = configService.getConfig();

      // Should return cached value
      expect(config1).toBe(config2);
      expect(config2.mode).toBe(AuthMode.SINGLE_TENANT);
    });
  });

  describe('reload', () => {
    it('should clear cache and reload configuration', () => {
      process.env.AUTH_MODE = 'single-tenant';
      
      const config1 = configService.getConfig();
      expect(config1.mode).toBe(AuthMode.SINGLE_TENANT);

      // Change environment and reload
      process.env.AUTH_MODE = 'multi-tenant';
      configService.reload();
      
      const config2 = configService.getConfig();
      expect(config2.mode).toBe(AuthMode.MULTI_TENANT);
    });
  });

  describe('get', () => {
    it('should retrieve nested configuration values', () => {
      process.env.AUTH_MODE = 'multi-tenant';
      process.env.MULTI_TENANT_DB_URL = 'test-url';

      expect(configService.get('mode')).toBe(AuthMode.MULTI_TENANT);
      expect(configService.get('multiTenant.databaseUrl')).toBe('test-url');
      expect(configService.get('tokenExpiration.access')).toBe('15m');
    });

    it('should return undefined for non-existent paths', () => {
      expect(configService.get('nonExistent')).toBeUndefined();
      expect(configService.get('multiTenant.nonExistent')).toBeUndefined();
    });
  });

  describe('isSingleTenant / isMultiTenant', () => {
    it('should correctly identify single-tenant mode', () => {
      process.env.AUTH_MODE = 'single-tenant';
      
      expect(configService.isSingleTenant()).toBe(true);
      expect(configService.isMultiTenant()).toBe(false);
    });

    it('should correctly identify multi-tenant mode', () => {
      process.env.AUTH_MODE = 'multi-tenant';
      
      expect(configService.isSingleTenant()).toBe(false);
      expect(configService.isMultiTenant()).toBe(true);
    });
  });

  describe('getTokenExpirationSeconds', () => {
    it('should parse seconds correctly', () => {
      process.env.ACCESS_TOKEN_EXPIRATION = '30s';
      
      expect(configService.getTokenExpirationSeconds('access')).toBe(30);
    });

    it('should parse minutes correctly', () => {
      process.env.ACCESS_TOKEN_EXPIRATION = '15m';
      
      expect(configService.getTokenExpirationSeconds('access')).toBe(900);
    });

    it('should parse hours correctly', () => {
      process.env.REFRESH_TOKEN_EXPIRATION = '2h';
      
      expect(configService.getTokenExpirationSeconds('refresh')).toBe(7200);
    });

    it('should parse days correctly', () => {
      process.env.REFRESH_TOKEN_EXPIRATION = '7d';
      
      expect(configService.getTokenExpirationSeconds('refresh')).toBe(604800);
    });

    it('should handle numeric values', () => {
      process.env.ACCESS_TOKEN_EXPIRATION = '3600';
      configService.reload();

      const config = configService.getConfig();
      config.tokenExpiration.access = 3600;
      
      expect(configService.getTokenExpirationSeconds('access')).toBe(3600);
    });

    it('should throw error for invalid format', () => {
      process.env.ACCESS_TOKEN_EXPIRATION = 'invalid';
      
      expect(() => configService.getTokenExpirationSeconds('access'))
        .toThrow('Invalid token expiration format: invalid');
    });
  });
});