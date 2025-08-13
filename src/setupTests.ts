// Extend Jest matchers and add accessibility testing
import React from 'react';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { configure } from '@testing-library/react';

// Enhance Testing Library configuration for React 18
configure({
  // Adjust for React 18 and async operations
  asyncUtilTimeout: 5000,
  // Relaxed queries to be more inclusive
  testIdAttribute: 'data-testid',
});

// Global mocks and test configuration
// Mock axios first to avoid ES module issues
const mockApiInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockApiInstance),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// Make mockApiInstance globally available
global.mockApiInstance = mockApiInstance;

// Simplified Chakra UI mock - only mock what's absolutely necessary
// Don't mock the entire package as it causes more issues than it solves

// Mock window.confirm for delete operations
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(() => true),
});

// Advanced window.matchMedia mock with better typing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Comprehensive IntersectionObserver mock
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [0],
}));

// ResizeObserver mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Clipboard API mock
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
    readText: jest.fn(() => Promise.resolve('')),
  },
  configurable: true,
});

// Error and warning suppression for known test scenarios
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = (...args) => {
    const suppressedErrors = [
      'Warning: ReactDOM.render is no longer supported',
      'Warning: An invalid form control',
      'Warning: You seem to have overlapping act() calls',
      'Warning: A state update was interrupted',
    ];

    const errorMessage = args[0];
    if (
      typeof errorMessage === 'string' &&
      suppressedErrors.some((suppressed) => errorMessage.includes(suppressed))
    ) {
      return;
    }

    originalError.call(console, ...args);
  };
});

afterAll(() => {
  // Reset all mocks after tests
  jest.resetAllMocks();
  jest.restoreAllMocks();
  console.error = originalError;
  console.warn = originalWarn;
});

// Add last resort error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});
