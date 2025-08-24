// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test configuration
global.testTimeout = 30000;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to disable logs during testing
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
};