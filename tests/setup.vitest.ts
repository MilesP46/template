/**
 * Vitest Test Setup
 * T220_phase2.6_cp1: Fix test coverage instrumentation
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanupTestEnvironment } from './test.config';

// Global test setup
beforeAll(async () => {
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  
  // Disable console logs during tests
  if (process.env.SILENT_TESTS === 'true') {
    global.console.log = vi.fn();
    global.console.info = vi.fn();
    global.console.warn = vi.fn();
  }
});

// Clean up after each test
beforeEach(async () => {
  // Clear any test data between tests
  vi.clearAllMocks();
});

// Global test teardown
afterAll(async () => {
  // Clean up test environment
  cleanupTestEnvironment();
  
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Add custom matchers for Vitest
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Extend global types for custom matchers
declare global {
  interface CustomMatchers<R = unknown> {
    toBeWithinRange(floor: number, ceiling: number): R;
  }
}