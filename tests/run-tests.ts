#!/usr/bin/env node

// Main test runner for authentication tests
// This script orchestrates running all test suites

import { runAuthApiIntegrationTests } from './integration/auth-api.test';
import { runAuthPerformanceTests } from './performance/auth-performance.test';
import { setupTestEnvironment, cleanupTestEnvironment } from './test.config';

interface TestSuite {
  name: string;
  runner: () => Promise<void>;
  enabled: boolean;
}

// Available test suites
const testSuites: TestSuite[] = [
  {
    name: 'Integration Tests',
    runner: runAuthApiIntegrationTests,
    enabled: true,
  },
  {
    name: 'Performance Tests', 
    runner: runAuthPerformanceTests,
    enabled: true,
  },
];

// Parse command line arguments
const args = process.argv.slice(2);
const runOnly = args.find(arg => arg.startsWith('--only='))?.split('=')[1];
const skipPerf = args.includes('--skip-performance');
const help = args.includes('--help') || args.includes('-h');

// Show help
if (help) {
  console.log(`
Authentication Test Runner

Usage: npm run test:all [options]

Options:
  --only=<suite>        Run only specified test suite (integration, performance)
  --skip-performance    Skip performance tests (faster)
  --help, -h           Show this help message

Examples:
  npm run test:all                    # Run all tests
  npm run test:all --only=integration # Run only integration tests
  npm run test:all --skip-performance # Skip performance tests
`);
  process.exit(0);
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Authentication Test Suite Runner\n');
  console.log('═══════════════════════════════════\n');

  let totalPassed = 0;
  let totalFailed = 0;

  // Setup test environment once
  try {
    await setupTestEnvironment();
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    process.exit(1);
  }

  // Run each test suite
  for (const suite of testSuites) {
    // Skip if disabled or filtered
    if (!suite.enabled) continue;
    if (skipPerf && suite.name.includes('Performance')) continue;
    if (runOnly && !suite.name.toLowerCase().includes(runOnly.toLowerCase())) continue;

    console.log(`\n🏃 Running ${suite.name}...`);
    console.log('─'.repeat(50));

    const startTime = Date.now();
    
    try {
      await suite.runner();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✅ ${suite.name} completed in ${duration}s`);
      totalPassed++;
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`\n❌ ${suite.name} failed after ${duration}s`);
      console.error(error);
      totalFailed++;
    }
  }

  // Cleanup
  try {
    await cleanupTestEnvironment();
  } catch (error) {
    console.warn('⚠️  Cleanup warning:', error);
  }

  // Summary
  console.log('\n═══════════════════════════════════');
  console.log('📊 Test Summary\n');
  console.log(`Total Suites: ${totalPassed + totalFailed}`);
  console.log(`Passed: ${totalPassed} ✅`);
  console.log(`Failed: ${totalFailed} ❌`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💔 Some tests failed.');
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('\n💥 Unhandled rejection:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n\n🛑 Test run interrupted. Cleaning up...');
  try {
    await cleanupTestEnvironment();
  } catch (error) {
    console.error('Cleanup error:', error);
  }
  process.exit(130);
});

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});