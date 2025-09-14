/**
 * Mock Utilities Index
 * Centralized exports for all mock utilities
 */

export * from './react-hook-form';
export * from './chakra-ui';
export * from './react-query';
export * from './axios';
export * from './auth';

// Global mock cleanup utility
export const clearAllMocks = () => {
  jest.clearAllMocks();
  
  // Import and call specific clear functions
  import('./react-hook-form').then(({ clearMockFormData }) => clearMockFormData());
  import('./react-query').then(({ clearMockQueryData }) => clearMockQueryData());
  import('./axios').then(({ clearMockAxiosResponses }) => clearMockAxiosResponses());
  import('./auth').then(({ resetMockAuthState }) => resetMockAuthState());
};