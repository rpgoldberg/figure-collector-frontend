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
  asyncUtilTimeout: 5000,
  // Relaxed queries to be more inclusive
  testIdAttribute: 'data-testid',
});

// Mock window.scrollTo for Framer Motion animations
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Comprehensive axios mock to prevent ES module import issues
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
        delete: {},
        head: {},
        patch: {},
        post: {},
        put: {},
      },
    },
  };
  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});