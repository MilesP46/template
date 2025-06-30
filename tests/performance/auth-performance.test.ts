// Performance tests for Authentication System
// Measures response times and throughput for auth operations

import { testConfig, setupTestEnvironment, cleanupTestEnvironment } from '../test.config';
import { authTestClient } from '../utils/auth-test-helpers';
import { createTestDatabase, generateMasterKey } from '../utils/test-database';
import { generateRandomUserData, generateStrongPassword } from '../utils/test-users';

// Performance test results interface
interface PerformanceResult {
  operation: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  throughput: number; // operations per second
  passed: boolean;
}

// Performance test suite
export class AuthPerformanceTests {
  private results: PerformanceResult[] = [];

  async runAll() {
    console.log('🚀 Starting Authentication Performance Tests...\n');
    
    await setupTestEnvironment();
    
    try {
      await this.testRegistrationPerformance();
      await this.testLoginPerformance();
      await this.testTokenRefreshPerformance();
      await this.testTokenVerificationPerformance();
      await this.testEncryptionPerformance();
      await this.testConcurrentOperations();
      
      this.printResults();
      this.checkBenchmarks();
      
    } catch (error) {
      console.error('❌ Performance test failed:', error);
      throw error;
    } finally {
      await cleanupTestEnvironment();
    }
  }

  private async measureOperation(
    name: string,
    operation: () => Promise<any>,
    iterations: number = 100
  ): Promise<PerformanceResult> {
    console.log(`📊 Testing ${name} performance (${iterations} iterations)...`);
    
    const times: number[] = [];
    let errors = 0;
    
    // Warmup
    for (let i = 0; i < 5; i++) {
      try {
        await operation();
      } catch (e) {
        // Ignore warmup errors
      }
    }
    
    // Actual measurements
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      
      try {
        await operation();
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
        times.push(duration);
      } catch (error) {
        errors++;
      }
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  ${i + 1}/${iterations}\r`);
      }
    }
    
    console.log(''); // New line after progress
    
    if (times.length === 0) {
      throw new Error(`All ${iterations} operations failed`);
    }
    
    // Calculate statistics
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = 1000 / avgTime; // ops per second
    
    const result: PerformanceResult = {
      operation: name,
      averageTime: avgTime,
      minTime,
      maxTime,
      throughput,
      passed: true, // Will be updated in checkBenchmarks
    };
    
    this.results.push(result);
    
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
    console.log(`  Throughput: ${throughput.toFixed(2)} ops/sec`);
    console.log(`  Success rate: ${((times.length / iterations) * 100).toFixed(1)}%\n`);
    
    return result;
  }

  private async testRegistrationPerformance() {
    console.log('🔐 Registration Performance\n');
    
    // Single-tenant registration
    await this.measureOperation(
      'Single-tenant Registration',
      async () => {
        const dbInfo = await createTestDatabase();
        const userData = generateRandomUserData('single-tenant');
        
        const response = await authTestClient.registerSingleTenant({
          email: userData.email,
          password: userData.password!,
          databaseId: userData.databaseId!,
          masterKey: userData.masterKey!,
        });
        
        if (response.status !== 201) {
          throw new Error(`Registration failed: ${response.status}`);
        }
      },
      50 // Fewer iterations as this creates databases
    );
    
    // Multi-tenant registration
    await this.measureOperation(
      'Multi-tenant Registration',
      async () => {
        const userData = generateRandomUserData('multi-tenant');
        
        const response = await authTestClient.registerMultiTenant({
          email: userData.email,
          password: userData.password!,
          tenantId: userData.tenantId!,
          role: userData.role || 'user',
        });
        
        if (response.status !== 201) {
          throw new Error(`Registration failed: ${response.status}`);
        }
      },
      100
    );
  }

  private async testLoginPerformance() {
    console.log('🔑 Login Performance\n');
    
    // Create test users for login tests
    const singleTenantDb = await createTestDatabase();
    const singleTenantUser = {
      email: 'perf-single@test.com',
      password: 'PerfTest123!@#',
      databaseId: singleTenantDb.dbId,
      masterKey: singleTenantDb.masterKey,
    };
    
    // Register the user once
    await authTestClient.registerSingleTenant(singleTenantUser);
    
    // Test single-tenant login
    await this.measureOperation(
      'Single-tenant Login',
      async () => {
        const response = await authTestClient.loginSingleTenant({
          databaseId: singleTenantUser.databaseId,
          masterKey: singleTenantUser.masterKey,
          password: singleTenantUser.password,
        });
        
        if (response.status !== 200) {
          throw new Error(`Login failed: ${response.status}`);
        }
      }
    );
    
    // Multi-tenant login test
    const multiTenantUser = {
      email: 'perf-multi@test.com',
      password: 'PerfTest123!@#',
      tenantId: 'perf-tenant-001',
      role: 'user' as const,
    };
    
    await authTestClient.registerMultiTenant(multiTenantUser);
    
    await this.measureOperation(
      'Multi-tenant Login',
      async () => {
        const response = await authTestClient.loginMultiTenant({
          email: multiTenantUser.email,
          password: multiTenantUser.password,
          tenantId: multiTenantUser.tenantId,
        });
        
        if (response.status !== 200) {
          throw new Error(`Login failed: ${response.status}`);
        }
      }
    );
  }

  private async testTokenRefreshPerformance() {
    console.log('🔄 Token Refresh Performance\n');
    
    // Get a valid refresh token
    const userData = generateRandomUserData('single-tenant');
    const dbInfo = await createTestDatabase();
    
    const registerResponse = await authTestClient.registerSingleTenant({
      email: userData.email,
      password: userData.password!,
      databaseId: dbInfo.dbId,
      masterKey: dbInfo.masterKey,
    });
    
    const { refreshToken } = registerResponse.data.tokens;
    
    await this.measureOperation(
      'Token Refresh',
      async () => {
        const response = await authTestClient.refreshToken(refreshToken);
        
        if (response.status !== 200) {
          throw new Error(`Token refresh failed: ${response.status}`);
        }
      }
    );
  }

  private async testTokenVerificationPerformance() {
    console.log('✅ Token Verification Performance\n');
    
    // Get a valid access token
    const userData = generateRandomUserData('single-tenant');
    const dbInfo = await createTestDatabase();
    
    const registerResponse = await authTestClient.registerSingleTenant({
      email: userData.email,
      password: userData.password!,
      databaseId: dbInfo.dbId,
      masterKey: dbInfo.masterKey,
    });
    
    const { accessToken } = registerResponse.data.tokens;
    authTestClient.setAuthToken(accessToken);
    
    await this.measureOperation(
      'Token Verification',
      async () => {
        const response = await authTestClient.verifyToken();
        
        if (response.status !== 200) {
          throw new Error(`Token verification failed: ${response.status}`);
        }
      }
    );
  }

  private async testEncryptionPerformance() {
    console.log('🔒 Encryption Performance\n');
    
    // Test key derivation performance
    await this.measureOperation(
      'Key Derivation',
      async () => {
        const password = generateStrongPassword(32);
        const salt = 'test-salt-' + Date.now();
        
        // Simulate key derivation (in real app, this would use Argon2)
        const crypto = require('crypto');
        const iterations = 100000;
        const keyLength = 32;
        
        await new Promise<Buffer>((resolve, reject) => {
          crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err: any, key: Buffer) => {
            if (err) reject(err);
            else resolve(key);
          });
        });
      }
    );
    
    // Test data encryption/decryption
    const testData = Buffer.alloc(1024, 'test data'); // 1KB of data
    
    await this.measureOperation(
      'Data Encryption (1KB)',
      async () => {
        const crypto = require('crypto');
        const algorithm = 'aes-256-gcm';
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([
          cipher.update(testData),
          cipher.final(),
        ]);
        
        const authTag = cipher.getAuthTag();
        return { encrypted, authTag };
      }
    );
  }

  private async testConcurrentOperations() {
    console.log('🔀 Concurrent Operations Performance\n');
    
    const concurrencyLevels = [10, 50, 100];
    
    for (const concurrency of concurrencyLevels) {
      console.log(`\nTesting with ${concurrency} concurrent requests...`);
      
      const start = process.hrtime.bigint();
      const promises: Promise<any>[] = [];
      
      // Create concurrent login requests
      for (let i = 0; i < concurrency; i++) {
        const userData = generateRandomUserData('multi-tenant');
        
        // First register the user
        promises.push(
          authTestClient.registerMultiTenant({
            email: userData.email,
            password: userData.password!,
            tenantId: userData.tenantId!,
            role: userData.role || 'user',
          }).then(() => {
            // Then try to login
            return authTestClient.loginMultiTenant({
              email: userData.email,
              password: userData.password!,
              tenantId: userData.tenantId!,
            });
          })
        );
      }
      
      const results = await Promise.allSettled(promises);
      const end = process.hrtime.bigint();
      
      const duration = Number(end - start) / 1_000_000; // ms
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average per request: ${(duration / concurrency).toFixed(2)}ms`);
      console.log(`  Successful: ${successful}, Failed: ${failed}`);
      console.log(`  Requests per second: ${((concurrency / duration) * 1000).toFixed(2)}`);
    }
  }

  private printResults() {
    console.log('\n📈 Performance Test Summary\n');
    console.log('Operation                    | Avg Time | Throughput | Benchmark | Status');
    console.log('----------------------------|----------|------------|-----------|-------');
    
    for (const result of this.results) {
      const benchmark = this.getBenchmark(result.operation);
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      
      console.log(
        `${result.operation.padEnd(27)} | ${result.averageTime.toFixed(1).padStart(7)}ms | ` +
        `${result.throughput.toFixed(1).padStart(9)}/s | ${benchmark.maxDuration.toString().padStart(8)}ms | ${status}`
      );
    }
  }

  private checkBenchmarks() {
    let allPassed = true;
    
    for (const result of this.results) {
      const benchmark = this.getBenchmark(result.operation);
      
      if (result.averageTime > benchmark.maxDuration) {
        result.passed = false;
        allPassed = false;
        console.log(`\n⚠️  ${result.operation} exceeded benchmark: ${result.averageTime.toFixed(1)}ms > ${benchmark.maxDuration}ms`);
      }
    }
    
    if (allPassed) {
      console.log('\n✅ All performance benchmarks passed!');
    } else {
      console.log('\n❌ Some performance benchmarks failed.');
    }
  }

  private getBenchmark(operation: string): { maxDuration: number } {
    // Map operation names to config benchmarks
    const benchmarkMap: Record<string, { maxDuration: number }> = {
      'Single-tenant Registration': testConfig.performance.auth.register,
      'Multi-tenant Registration': testConfig.performance.auth.register,
      'Single-tenant Login': testConfig.performance.auth.login,
      'Multi-tenant Login': testConfig.performance.auth.login,
      'Token Refresh': testConfig.performance.auth.refresh,
      'Token Verification': testConfig.performance.auth.verify,
      'Key Derivation': testConfig.performance.encryption.keyDerivation,
      'Data Encryption (1KB)': testConfig.performance.encryption.encrypt,
    };
    
    return benchmarkMap[operation] || { maxDuration: 1000 }; // Default 1s
  }
}

// Export runner function
export async function runAuthPerformanceTests() {
  const tests = new AuthPerformanceTests();
  await tests.runAll();
}

// Allow running directly
if (require.main === module) {
  runAuthPerformanceTests().catch(console.error);
}