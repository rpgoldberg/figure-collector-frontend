import React from 'react';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { configure } from '@testing-library/react';

// Global Emotion runtime configuration for testing
global.__emotion_real = {
  cache: {
    name: 'css',
    styles: '',
    next: undefined,
    key: 'css',
    compat: undefined
  }
};

global.__EMOTION_RUNTIME_CONFIG__ = {
  cache: {
    name: 'css',
    styles: '',
    next: undefined,
    key: 'css',
    compat: undefined
  }
};

// Enhance Testing Library configuration for React 18
configure({
  // Adjust for React 18 and async operations
  asyncUtilTimeout: 10000, // Extended async timeout
  // Relaxed queries to be more inclusive
  testIdAttribute: 'data-testid',
  // Improved query configurations
  throwSuggestions: true,
});

// Global error handling for async tests
const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
  console.warn('Unhandled promise rejection:', event.reason);
  // Fail the test run to avoid masking errors
  throw event.reason instanceof Error ? event.reason : new Error(String(event.reason));
};
global.addEventListener('unhandledrejection', unhandledRejectionHandler);

// Mock window.scrollTo for Framer Motion animations
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Comprehensive axios mock to prevent ES module import issues
jest.mock('axios', () => {
  const makeInstance = () => {
    const instance: any = {
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      patch: jest.fn(() => Promise.resolve({ data: {} })),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      defaults: {
        headers: { common: {}, delete: {}, head: {}, patch: {}, post: {}, put: {} },
      },
    };
    return instance;
  };
  const defaultInstance = makeInstance();
  const mockAxios = {
    ...defaultInstance,
    create: jest.fn(() => makeInstance()),
  };
  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});