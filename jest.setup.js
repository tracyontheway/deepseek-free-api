// Jest setup file
// Increase timeout for integration tests
import { jest } from '@jest/globals';

jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress logger output during tests
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});