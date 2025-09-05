// Mock for react-query in __mocks__ directory
const React = require('react');

// Mock QueryClient
const MockQueryClient = function(options) {
  this.defaultOptions = options?.defaultOptions || {};
  this.clear = jest.fn();
  this.invalidateQueries = jest.fn();
  this.setQueryData = jest.fn();
  this.getQueryData = jest.fn();
};

// Mock QueryClientProvider
const MockQueryClientProvider = ({ children, client, ...props }) =>
  React.createElement('div', { 'data-testid': 'query-client-provider', ...props }, children);

// Mock hooks
const useQuery = jest.fn((queryKey, queryFn, options) => {
  // Return mock data based on query key
  let data = {};
  if (queryKey === 'recentFigures') {
    data = {
      success: true,
      count: 4,
      data: [{ _id: '1', name: 'Test Figure 1' }]
    };
  }
  return {
    data: data,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true
  };
});

const useMutation = jest.fn((mutationFn, options) => {
  console.log('__mocks__ useMutation called');
  return {
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,
    status: 'idle',
    isPending: false,
    isIdle: true,
    mutate: jest.fn(),
    mutateAsync: jest.fn(() => Promise.resolve({})),
    reset: jest.fn()
  };
});

const useQueryClient = jest.fn(() => ({
  clear: jest.fn(),
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
}));

module.exports = {
  QueryClient: MockQueryClient,
  QueryClientProvider: MockQueryClientProvider,
  useQuery,
  useQueryClient,
  useMutation
};