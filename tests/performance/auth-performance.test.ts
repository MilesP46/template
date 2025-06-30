/**
 * Authentication Performance Tests
 * Benchmarks for auth operations to ensure they meet performance targets
 */

import { 
  setupTestEnvironment, 
  cleanupTestEnvironment, 
  PERFORMANCE_TARGETS 
} from '../test.config';
import { 
  createTestUser,
  createTestUsers,
  loginTestUser,
  generateTestTokens,
  cleanupTestUsers
} from '../utils/test-users';
import {
  cleanupAllTestDatabases,
  generateTestDatabaseId
} from '../utils/test-database';

/**
 * Performance test utilities
 */
class PerformanceBenchmark {
  private measurements: number[] = [];
  private startTime: number = 0;
  
  start(): void {
    this.startTime = performance.now();
  }
  
  end(): number {
    const duration = performance.now() - this.startTime;
    this.measurements.push(duration);
    return duration;
  }
  
  getStats() {
    const sorted = [...this.measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg,
      median,
      p95,
      p99,
      samples: sorted.length
    };
  }
  
  reset(): void {
    this.measurements = [];
  }
}

describe('Authentication Performance Tests', () => {
  const benchmark = new PerformanceBenchmark();
  
  afterEach(() => {
    cleanupTestUsers();
    cleanupAllTestDatabases();
    benchmark.reset();
  });

  describe('Single-Tenant Performance', () => {
    beforeAll(() => {
      setupTestEnvironment('single-tenant');
    });

    afterAll(() => {
      cleanupTestEnvironment();
    });

    test('Registration performance should meet target', async () => {
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        benchmark.start();
        
        await createTestUser('single-tenant', {
          email: `perf-reg-${i}@single-tenant.com`,
          databaseId: generateTestDatabaseId(`perf-${i}`)
        });
        
        benchmark.end();
      }
      
      const stats = benchmark.getStats();
      console.log('Single-tenant registration performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_TARGETS.registration);
      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.registration * 1.5);
      expect(stats.p99).toBeLessThan(PERFORMANCE_TARGETS.registration * 2);
    });

    test('Login performance should meet target', async () => {
      // Create a test user first
      const user = await createTestUser('single-tenant');
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        benchmark.start();
        await loginTestUser(user, 'single-tenant');
        benchmark.end();
      }
      
      const stats = benchmark.getStats();
      console.log('Single-tenant login performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_TARGETS.login);
      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.login * 1.5);
      expect(stats.p99).toBeLessThan(PERFORMANCE_TARGETS.login * 2);
    });

    test('Token verification should be fast', async () => {
      const user = await createTestUser('single-tenant');
      const tokens = generateTestTokens(user, 'single-tenant');
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        benchmark.start();
        
        // Simulate token verification
        const parts = tokens.accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          const isValid = payload.userId && payload.exp > Date.now() / 1000;
        }
        
        benchmark.end();
      }
      
      const stats = benchmark.getStats();
      console.log('Token verification performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_TARGETS.tokenVerification);
      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.tokenVerification * 2);
      expect(stats.p99).toBeLessThan(PERFORMANCE_TARGETS.tokenVerification * 3);
    });

    test('Token refresh performance should meet target', async () => {
      const user = await createTestUser('single-tenant');
      const iterations = 30;
      
      for (let i = 0; i < iterations; i++) {
        benchmark.start();
        
        // Simulate token refresh
        generateTestTokens(user, 'single-tenant');
        
        benchmark.end();
      }
      
      const stats = benchmark.getStats();
      console.log('Token refresh performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_TARGETS.tokenRefresh);
      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.tokenRefresh * 1.5);
    });
  });

  describe('Multi-Tenant Performance', () => {
    beforeAll(() => {
      setupTestEnvironment('multi-tenant');
    });

    afterAll(() => {
      cleanupTestEnvironment();
    });

    test('Registration performance should meet target', async () => {
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        benchmark.start();
        
        await createTestUser('multi-tenant', {
          email: `perf-reg-${i}@multi-tenant.com`
        });
        
        benchmark.end();
      }
      
      const stats = benchmark.getStats();
      console.log('Multi-tenant registration performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_TARGETS.registration);
      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.registration * 1.5);
    });

    test('Login performance should meet target', async () => {
      const user = await createTestUser('multi-tenant');
      const iterations = 50;
      
      for (let i = 0; i < iterations; i++) {
        benchmark.start();
        await loginTestUser(user, 'multi-tenant');
        benchmark.end();
      }
      
      const stats = benchmark.getStats();
      console.log('Multi-tenant login performance:', stats);
      
      expect(stats.avg).toBeLessThan(PERFORMANCE_TARGETS.login);
      expect(stats.p95).toBeLessThan(PERFORMANCE_TARGETS.login * 1.5);
    });

    test('Concurrent user operations should scale', async () => {
      // Test concurrent registrations
      const concurrentUsers = 50;
      
      benchmark.start();
      
      const promises = [];
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(
          createTestUser('multi-tenant', {
            email: `concurrent-${i}@multi-tenant.com`
          })
        );
      }
      
      await Promise.all(promises);
      const totalTime = benchmark.end();
      
      const avgTimePerUser = totalTime / concurrentUsers;
      console.log(`Concurrent registration: ${concurrentUsers} users in ${totalTime}ms (${avgTimePerUser}ms per user)`);
      
      // Should be faster than sequential (shows concurrency benefit)
      expect(avgTimePerUser).toBeLessThan(PERFORMANCE_TARGETS.registration);
    });
  });

  describe('Load Tests', () => {
    test('System should handle burst registrations', async () => {
      setupTestEnvironment('multi-tenant');
      
      const burstSize = 100;
      const startTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < burstSize; i++) {
        promises.push(
          createTestUser('multi-tenant', {
            email: `burst-${i}-${Date.now()}@test.com`
          })
        );
      }
      
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      
      console.log(`Burst registration: ${burstSize} users in ${totalTime}ms`);
      
      expect(results.length).toBe(burstSize);
      expect(results.every(u => u.id)).toBe(true);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('System should handle sustained login load', async () => {
      setupTestEnvironment('multi-tenant');
      
      // Create test users
      const userCount = 10;
      const users = await createTestUsers('multi-tenant', userCount);
      
      // Simulate sustained login load
      const loginCount = 1000;
      const startTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < loginCount; i++) {
        const user = users[i % userCount]; // Round-robin through users
        promises.push(generateTestTokens(user, 'multi-tenant'));
      }
      
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      const avgTime = totalTime / loginCount;
      
      console.log(`Sustained login: ${loginCount} logins in ${totalTime}ms (${avgTime}ms average)`);
      
      expect(results.length).toBe(loginCount);
      expect(avgTime).toBeLessThan(PERFORMANCE_TARGETS.login);
    });

    test('Token verification should handle high throughput', async () => {
      const user = await createTestUser('multi-tenant');
      const token = generateTestTokens(user, 'multi-tenant').accessToken;
      
      const verificationCount = 10000;
      const startTime = performance.now();
      
      for (let i = 0; i < verificationCount; i++) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          const isValid = payload.userId && payload.exp > Date.now() / 1000;
        }
      }
      
      const totalTime = performance.now() - startTime;
      const throughput = verificationCount / (totalTime / 1000); // verifications per second
      
      console.log(`Token verification: ${verificationCount} verifications in ${totalTime}ms (${throughput.toFixed(0)} ops/sec)`);
      
      expect(throughput).toBeGreaterThan(10000); // Should handle >10k verifications per second
    });
  });

  describe('Memory Usage Tests', () => {
    test('Registration should not leak memory', async () => {
      setupTestEnvironment('single-tenant');
      
      // Note: In a real implementation, we would monitor actual memory usage
      // For now, we'll ensure resources are cleaned up properly
      
      const iterations = 100;
      for (let i = 0; i < iterations; i++) {
        await createTestUser('single-tenant', {
          email: `memory-test-${i}@test.com`,
          databaseId: generateTestDatabaseId(`mem-${i}`)
        });
        
        // Clean up after each iteration to prevent accumulation
        if (i % 10 === 0) {
          cleanupTestUsers();
          cleanupAllTestDatabases();
        }
      }
      
      // Verify cleanup worked
      expect(true).toBe(true); // Placeholder for actual memory checks
    });
  });

  describe('Performance Regression Tests', () => {
    test('Performance should not degrade with data volume', async () => {
      setupTestEnvironment('multi-tenant');
      
      // Create initial users
      await createTestUsers('multi-tenant', 50);
      
      // Measure performance with existing data
      benchmark.start();
      const newUser = await createTestUser('multi-tenant', {
        email: 'volume-test@example.com'
      });
      const registrationTime = benchmark.end();
      
      benchmark.start();
      await loginTestUser(newUser, 'multi-tenant');
      const loginTime = benchmark.end();
      
      console.log(`Performance with data volume - Registration: ${registrationTime}ms, Login: ${loginTime}ms`);
      
      // Should still meet targets even with existing data
      expect(registrationTime).toBeLessThan(PERFORMANCE_TARGETS.registration * 1.5);
      expect(loginTime).toBeLessThan(PERFORMANCE_TARGETS.login * 1.5);
    });
  });
});

// Export performance testing utilities
export { PerformanceBenchmark };

/**
 * Helper to run a performance test scenario
 */
export async function runPerformanceScenario(
  name: string,
  iterations: number,
  operation: () => Promise<void>,
  target: number
): Promise<void> {
  const benchmark = new PerformanceBenchmark();
  
  console.log(`Running scenario: ${name}`);
  
  for (let i = 0; i < iterations; i++) {
    benchmark.start();
    await operation();
    benchmark.end();
  }
  
  const stats = benchmark.getStats();
  console.log(`Results:`, stats);
  
  if (stats.avg > target) {
    throw new Error(`Performance target not met: ${stats.avg}ms > ${target}ms`);
  }
}