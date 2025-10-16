/**
 * Test Setup File
 *
 * This file runs before all tests to set up the testing environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for important messages
  error: console.error,
};

// Add any global test utilities here
