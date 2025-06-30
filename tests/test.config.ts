// Test configuration for authentication testing
export const TEST_CONFIGS = {
  'single-tenant': {
    AUTH_MODE: 'single-tenant',
    JWT_ACCESS_SECRET: 'test-access-secret-single-tenant-mode',
    JWT_REFRESH_SECRET: 'test-refresh-secret-single-tenant-mode',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
    DATABASE_URL: 'file:./test/single-tenant.db',
    ENCRYPTION_ENABLED: true,
    MASTER_KEY_REQUIRED: true,
    DATABASE_ID_HASH_SALT: 'test-database-id-salt-single',
    KEY_LOCATOR_HASH_SALT: 'test-key-locator-salt-single',
    TOKEN_SECRET: 'test-token-secret-single',
    REFRESH_TOKEN_SECRET: 'test-refresh-token-secret-single'
  },
  'multi-tenant': {
    AUTH_MODE: 'multi-tenant',
    JWT_ACCESS_SECRET: 'test-access-secret-multi-tenant-mode',
    JWT_REFRESH_SECRET: 'test-refresh-secret-multi-tenant-mode',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
    DATABASE_URL: 'file:./test/multi-tenant.db',
    ENCRYPTION_ENABLED: false,
    MASTER_KEY_REQUIRED: false,
    DATABASE_ID_HASH_SALT: 'test-database-id-salt-multi',
    KEY_LOCATOR_HASH_SALT: 'test-key-locator-salt-multi',
    TOKEN_SECRET: 'test-token-secret-multi',
    REFRESH_TOKEN_SECRET: 'test-refresh-token-secret-multi'
  }
};

// Test user data
export const TEST_USERS = {
  'single-tenant': {
    validUser: {
      email: 'test@single-tenant.com',
      password: 'TestPassword123!',
      databaseId: 'test-db-single-001',
      masterKey: 'MasterKey123!@#$%^&*()',
      name: 'Test User Single'
    },
    invalidUser: {
      email: 'invalid@single-tenant.com',
      password: 'WrongPassword',
      databaseId: 'invalid-db',
      masterKey: 'WrongKey'
    }
  },
  'multi-tenant': {
    validUser: {
      email: 'test@multi-tenant.com',
      password: 'TestPassword123!',
      name: 'Test User Multi',
      tenantId: 'tenant-001'
    },
    invalidUser: {
      email: 'invalid@multi-tenant.com',
      password: 'WrongPassword'
    }
  }
};

// Test utilities
export const setupTestEnvironment = (mode: 'single-tenant' | 'multi-tenant') => {
  const config = TEST_CONFIGS[mode];
  // Set environment variables
  Object.entries(config).forEach(([key, value]) => {
    process.env[key] = String(value);
  });
  return config;
};

export const cleanupTestEnvironment = () => {
  // Clear test environment variables
  Object.keys(TEST_CONFIGS['single-tenant']).forEach(key => {
    delete process.env[key];
  });
};

// Performance benchmarks
export const PERFORMANCE_TARGETS = {
  registration: 500, // ms
  login: 300, // ms
  tokenVerification: 50, // ms
  tokenRefresh: 200, // ms
  logout: 100 // ms
};