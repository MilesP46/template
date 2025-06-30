import path from 'path';

// Try to load dotenv if available, but don't fail if not
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '.env.test') });
} catch (e) {
  // dotenv not available, use defaults
}

export const testConfig = {
  // Test database configuration
  database: {
    testDbDir: path.join(__dirname, '../test-databases'),
    cleanupAfterTests: true,
    useInMemory: process.env['TEST_DB_IN_MEMORY'] === 'true',
  },

  // Auth configuration
  auth: {
    // JWT settings
    jwt: {
      accessSecret: process.env['JWT_ACCESS_SECRET'] || 'test-access-secret-key',
      refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'test-refresh-secret-key',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    },

    // Password requirements
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },

    // Master key settings
    masterKey: {
      minLength: 20,
      saltRounds: 10,
    },

    // Rate limiting
    rateLimit: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
  },

  // Test timeouts
  timeouts: {
    unit: 5000,
    integration: 10000,
    e2e: 30000,
    performance: 60000,
  },

  // Test user templates
  testUsers: {
    singleTenant: {
      email: 'test-single@example.com',
      password: 'TestPass123!@#',
      databaseId: 'test-single-db',
      masterKey: 'TestMasterKey123!@#$%^&*()',
    },
    multiTenant: {
      email: 'test-multi@example.com',
      password: 'TestPass123!@#',
      tenantId: 'test-tenant-001',
      role: 'user',
    },
    admin: {
      email: 'test-admin@example.com',
      password: 'AdminPass123!@#',
      tenantId: 'test-tenant-001',
      role: 'admin',
    },
  },

  // API endpoints
  api: {
    baseUrl: process.env['TEST_API_URL'] || 'http://localhost:3000',
    endpoints: {
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        verify: '/api/auth/verify',
      },
      database: {
        create: '/api/db/create',
        authorize: '/api/db/authorize',
        challenge: '/api/db/challenge',
      },
    },
  },

  // Performance benchmarks
  performance: {
    auth: {
      login: { maxDuration: 500 }, // ms
      register: { maxDuration: 1000 },
      refresh: { maxDuration: 200 },
      verify: { maxDuration: 100 },
    },
    encryption: {
      keyDerivation: { maxDuration: 2000 },
      encrypt: { maxDuration: 50 },
      decrypt: { maxDuration: 50 },
    },
  },

  // Security test settings
  security: {
    // SQL injection test patterns
    sqlInjectionPatterns: [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--",
    ],
    // XSS test patterns
    xssPatterns: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
    ],
  },
};

// Test environment setup function
export async function setupTestEnvironment() {
  // Ensure test database directory exists
  const fs = await import('fs/promises');
  await fs.mkdir(testConfig.database.testDbDir, { recursive: true });

  // Set NODE_ENV to test
  if (!process.env['NODE_ENV']) {
    (process.env as any)['NODE_ENV'] = 'test';
  }
}

// Test environment cleanup function
export async function cleanupTestEnvironment() {
  if (testConfig.database.cleanupAfterTests) {
    const fs = await import('fs/promises');
    try {
      await fs.rm(testConfig.database.testDbDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test databases:', error);
    }
  }
}

// Helper to get test user by type
export function getTestUser(type: 'singleTenant' | 'multiTenant' | 'admin') {
  return { ...testConfig.testUsers[type] };
}

// Helper to get API endpoint
export function getApiEndpoint(category: 'auth' | 'database', endpoint: string) {
  const endpoints = testConfig.api.endpoints[category];
  const path = (endpoints as any)[endpoint];
  if (!path) {
    throw new Error(`Unknown endpoint: ${category}/${endpoint}`);
  }
  return `${testConfig.api.baseUrl}${path}`;
}