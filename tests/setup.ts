import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { cleanupTestEnvironment } from './test.config';

// Global test setup
beforeAll(async () => {
  // Set NODE_ENV to test
  process.env.NODE_ENV = 'test';
  
  // Disable console logs during tests
  if (process.env.SILENT_TESTS === 'true') {
    global.console.log = jest.fn();
    global.console.info = jest.fn();
    global.console.warn = jest.fn();
  }
});

// Clean up after each test
beforeEach(async () => {
  // Clear any test data between tests
  jest.clearAllMocks();
});

// Global test teardown
afterAll(async () => {
  // Clean up test environment
  cleanupTestEnvironment();
  
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Add custom matchers if needed
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
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}