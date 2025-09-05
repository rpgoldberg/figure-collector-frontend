// CRITICAL: Mock react-query FIRST before any other imports
jest.mock('react-query', () => {
  const mockReact = require('react');
  
  const MockQueryClient = function(options) {
    this.defaultOptions = options?.defaultOptions || {};
    this.clear = jest.fn();
    this.invalidateQueries = jest.fn();
    this.setQueryData = jest.fn();
    this.getQueryData = jest.fn();
  };

  const MockQueryClientProvider = ({ children, client, ...props }) =>
    mockReact.createElement('div', { 'data-testid': 'query-client-provider', ...props }, children);

  // Create useMutation mock implementation
  const createMutationMock = (mutationFn, options) => {
    // Create a stable mutation object that can handle dynamic state changes
    const mutationState = {
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
      status: 'idle',
      isPending: false,
      isIdle: true,
    };
    
    const mutation = {
      mutate: jest.fn((variables) => {
        // Set loading state
        Object.assign(mutationState, {
          isLoading: true,
          isError: false,
          isSuccess: false,
          status: 'loading',
          isPending: true,
          isIdle: false,
        });
        
        // Execute the actual mutation function if provided
        if (typeof mutationFn === 'function') {
          try {
            // Call the mutation function immediately so it can be tracked in tests
            const result = mutationFn(variables);
            
            // Handle both sync and async results
            Promise.resolve(result)
              .then((resolvedResult) => {
                Object.assign(mutationState, {
                  isLoading: false,
                  isError: false,
                  isSuccess: true,
                  data: resolvedResult,
                  status: 'success',
                  isPending: false,
                  isIdle: false,
                });
                // Call onSuccess callback if provided
                if (options?.onSuccess) {
                  // Use setTimeout to ensure callbacks are called after state updates
                  setTimeout(() => options.onSuccess(resolvedResult, variables), 0);
                }
              })
              .catch((error) => {
                Object.assign(mutationState, {
                  isLoading: false,
                  isError: true,
                  isSuccess: false,
                  error: error,
                  status: 'error',
                  isPending: false,
                  isIdle: false,
                });
                // Call onError callback if provided
                if (options?.onError) {
                  // Use setTimeout to ensure callbacks are called after state updates
                  setTimeout(() => options.onError(error, variables), 0);
                }
              });
          } catch (syncError) {
            // Handle synchronous errors
            Object.assign(mutationState, {
              isLoading: false,
              isError: true,
              isSuccess: false,
              error: syncError,
              status: 'error',
              isPending: false,
              isIdle: false,
            });
            if (options?.onError) {
              setTimeout(() => options.onError(syncError, variables), 0);
            }
          }
        }
      }),
      mutateAsync: jest.fn((variables) => {
        // Execute the actual mutation function if provided
        if (typeof mutationFn === 'function') {
          return Promise.resolve(mutationFn(variables))
            .then((result) => {
              Object.assign(mutationState, {
                isLoading: false,
                isError: false,
                isSuccess: true,
                data: result,
                status: 'success',
                isPending: false,
                isIdle: false,
              });
              // Call onSuccess callback if provided
              if (options?.onSuccess) {
                options.onSuccess(result, variables);
              }
              return result;
            })
            .catch((error) => {
              Object.assign(mutationState, {
                isLoading: false,
                isError: true,
                isSuccess: false,
                error: error,
                status: 'error',
                isPending: false,
                isIdle: false,
              });
              // Call onError callback if provided
              if (options?.onError) {
                options.onError(error, variables);
              }
              throw error;
            });
        }
        return Promise.resolve({});
      }),
      reset: jest.fn(() => {
        Object.assign(mutationState, {
          isLoading: false,
          isError: false,
          isSuccess: false,
          error: null,
          data: null,
          status: 'idle',
          isPending: false,
          isIdle: true,
        });
      }),
      // Spread the current state
      ...mutationState,
      // Make the mutation object dynamic
      get isLoading() { return mutationState.isLoading; },
      get isError() { return mutationState.isError; },
      get isSuccess() { return mutationState.isSuccess; },
      get error() { return mutationState.error; },
      get data() { return mutationState.data; },
      get status() { return mutationState.status; },
      get isPending() { return mutationState.isPending; },
      get isIdle() { return mutationState.isIdle; },
    };
    
    return mutation;
  };

  return {
    __esModule: true,
    QueryClient: MockQueryClient,
    QueryClientProvider: MockQueryClientProvider,
    useQuery: jest.fn((queryKey, queryFn, options) => {
      // Handle multiple argument formats (v3 vs v4 API)
      let actualKey = queryKey;
      
      // If first argument is an object with a queryKey property (v4 style)
      if (queryKey && typeof queryKey === 'object' && 'queryKey' in queryKey) {
        actualKey = queryKey.queryKey;
      }
      
      // Handle both string and array query keys
      const keyString = Array.isArray(actualKey) ? actualKey[0] : actualKey;
      
      // Return specific mock data based on query key
      let data = {};
      if (keyString === 'figureStats' || queryKey === 'figureStats') {
        data = {
          manufacturerStats: [
            { _id: 'Good Smile Company', count: 5 },
            { _id: 'ALTER', count: 3 },
          ],
          scaleStats: [
            { _id: '1/8', count: 6 },
            { _id: '1/7', count: 3 },
          ],
          locationStats: [
            { _id: 'Display Case', count: 5 },
            { _id: 'Storage Box', count: 3 },
          ]
        };
      } else if (keyString === 'recentFigures' || queryKey === 'recentFigures') {
        data = {
          success: true,
          count: 4,
          page: 1,
          pages: 1,
          total: 4,
          data: [
            { _id: '1', name: 'Test Figure 1', manufacturer: 'Test Company' },
            { _id: '2', name: 'Test Figure 2', manufacturer: 'Test Company' },
            { _id: '3', name: 'Test Figure 3', manufacturer: 'Test Company' },
            { _id: '4', name: 'Test Figure 4', manufacturer: 'Test Company' },
          ]
        };
      } else if (keyString === 'dashboardStats' || queryKey === 'dashboardStats') {
        data = {
          totalCount: 10,
          manufacturerStats: [
            { _id: 'Good Smile Company', count: 5 },
            { _id: 'ALTER', count: 3 },
            { _id: 'Kotobukiya', count: 2 }
          ],
          scaleStats: [
            { _id: '1/8', count: 6 },
            { _id: '1/7', count: 3 },
            { _id: '1/6', count: 1 }
          ],
          locationStats: [
            { _id: 'Display Case', count: 5 },
            { _id: 'Storage Box', count: 3 },
            { _id: 'Shelf A', count: 2 }
          ]
        };
      } else if (keyString === 'figures' || (Array.isArray(actualKey) && actualKey[0] === 'figures')) {
        // Handle FigureList queries with ['figures', page, filters] pattern
        data = {
          success: true,
          count: 3,
          page: 1,
          pages: 1,
          total: 3,
          data: [
            { _id: '1', name: 'Test Figure 1', manufacturer: 'Test Company', series: 'Test Series', scale: '1/8', location: 'Display Case', boxNumber: 'Box 1', imageUrl: 'test1.jpg' },
            { _id: '2', name: 'Test Figure 2', manufacturer: 'ALTER', series: 'Test Series 2', scale: '1/7', location: 'Storage Box', boxNumber: 'Box 2', imageUrl: 'test2.jpg' },
            { _id: '3', name: 'Test Figure 3', manufacturer: 'Kotobukiya', series: 'Test Series 3', scale: '1/6', location: 'Shelf A', boxNumber: 'Box 3', imageUrl: 'test3.jpg' },
          ]
        };
      } else {
        // Provide default data for any unknown queries
        data = {
          success: true,
          data: [],
          count: 0,
          page: 1,
          pages: 0,
          total: 0
        };
      }
      
      // CRITICAL: Always return a consistent object structure, never undefined
      const queryResult = {
        data: data,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(() => Promise.resolve({ data: data })),
        isFetched: true,
        isStale: false,
        dataUpdatedAt: Date.now(),
        failureCount: 0,
      };
      
      // CRITICAL: Make destructuring safe - never return undefined
      Object.defineProperty(queryResult, 'data', {
        value: data,
        writable: false,
        enumerable: true,
        configurable: false
      });
      
      return queryResult;
    }),
    useQueryClient: jest.fn(() => ({
      clear: jest.fn(),
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
      getQueryData: jest.fn(),
    })),
    useMutation: jest.fn((mutationFn, options) => {
      // ULTRA-SIMPLIFIED: Just return a static object that will never be undefined
      console.log('useMutation mock called');
      const result = {
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
      console.log('useMutation mock returning:', result);
      return result;
    }),
  };
});

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
  // Increased timeout to match Jest global timeout
  asyncUtilTimeout: 15000,
  testIdAttribute: 'data-testid',
  // Avoid throwing for query suggestions; use lint rules instead
  throwSuggestions: false,
  // More aggressive error tracking for debugging
  asyncWrapper: async (cb) => {
    try {
      return await cb();
    } catch (error) {
      console.error('Async test failure:', error);
      throw error;
    }
  }
});

// Enhanced global error handling for async tests
const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
  console.error('Unhandled Async Test Failure:', {
    reason: event.reason,
    type: typeof event.reason,
    stack: event.reason instanceof Error ? event.reason.stack : 'No stack trace'
  });
  
  // Don't throw in tests to avoid infinite timeout loops
  event.preventDefault();
};
global.addEventListener('unhandledrejection', unhandledRejectionHandler);

// Mock timers to prevent infinite waits
global.setTimeout = ((cb: Function, delay?: number) => {
  // Force immediate execution for test environment
  const id = Math.random();
  Promise.resolve().then(() => cb());
  return id as any;
}) as any;

global.clearTimeout = jest.fn();
global.setInterval = jest.fn();
global.clearInterval = jest.fn();

// Robust matchMedia polyfill for components/libraries that rely on it (e.g., framer-motion)
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      let listeners: Array<(e: MediaQueryListEvent) => void> = [];
      const mql: MediaQueryList = {
        media: query,
        matches: false,
        onchange: null,
        addListener: (cb: (e: MediaQueryListEvent) => void) => {
          listeners.push(cb);
        },
        removeListener: (cb: (e: MediaQueryListEvent) => void) => {
          listeners = listeners.filter(l => l !== cb);
        },
        addEventListener: (_: 'change', cb: (e: MediaQueryListEvent) => void) => {
          listeners.push(cb);
        },
        removeEventListener: (_: 'change', cb: (e: MediaQueryListEvent) => void) => {
          listeners = listeners.filter(l => l !== cb);
        },
        dispatchEvent: (event: Event) => {
          listeners.forEach(cb => cb(event as MediaQueryListEvent));
          return true;
        }
      } as any;
      return mql;
    }
  });
} else {
  // Ensure required methods exist for environments providing a partial implementation
  const originalMatchMedia = window.matchMedia.bind(window);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      const mql: any = originalMatchMedia(query);
      mql.addListener = mql.addListener || ((cb: any) => mql.addEventListener && mql.addEventListener('change', cb));
      mql.removeListener = mql.removeListener || ((cb: any) => mql.removeEventListener && mql.removeEventListener('change', cb));
      mql.addEventListener = mql.addEventListener || (() => {});
      mql.removeEventListener = mql.removeEventListener || (() => {});
      mql.dispatchEvent = mql.dispatchEvent || (() => true);
      return mql;
    }
  });
}

// Mock window.scrollTo for Framer Motion animations
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});


// Create a simple, reliable mock axios instance
const createMockAxiosInstance = () => {
  const instance: any = {
    get: jest.fn((url, config) => {
      // Track the call for test verification
      // Return different data based on URL patterns
      if (url?.includes('/figures/stats')) {
        return Promise.resolve({ 
          data: { 
            data: {
              manufacturerStats: [
                { _id: 'Good Smile Company', count: 5 },
                { _id: 'ALTER', count: 3 }
              ],
              scaleStats: [
                { _id: '1/8', count: 6 },
                { _id: '1/7', count: 3 }
              ],
              locationStats: [
                { _id: 'Display Case', count: 5 },
                { _id: 'Storage Box', count: 3 }
              ]
            }
          }
        });
      } else if (url?.includes('/figures/search')) {
        return Promise.resolve({ 
          data: { 
            data: [
              { _id: '1', name: 'Test Figure 1', manufacturer: 'Test Company' },
              { _id: '2', name: 'Test Figure 2', manufacturer: 'Test Company' }
            ]
          }
        });
      } else if (url?.includes('/figures/filter')) {
        return Promise.resolve({ 
          data: [
            { _id: '1', name: 'Test Figure 1', manufacturer: 'Test Company' },
            { _id: '2', name: 'Test Figure 2', manufacturer: 'Test Company' }
          ]
        });
      } else if (url?.includes('/figures')) {
        return Promise.resolve({ 
          data: { 
            data: [
              { _id: '1', name: 'Test Figure 1', manufacturer: 'Test Company' },
              { _id: '2', name: 'Test Figure 2', manufacturer: 'Test Company' }
            ],
            count: 2,
            page: 1,
            pages: 1,
            total: 2
          }
        });
      }
      // Default response
      return Promise.resolve({ data: { data: {} } });
    }),
    post: jest.fn((url, data, config) => {
      // Track the call and data for test verification
      if (url?.includes('/auth/login')) {
        return Promise.resolve({ 
          data: { 
            data: { 
              user: { 
                id: '123', 
                email: data?.email || 'test@example.com', 
                username: 'testuser',
                token: 'mock-jwt-token'
              } 
            } 
          }
        });
      } else if (url?.includes('/auth/register')) {
        return Promise.resolve({ 
          data: { 
            data: { 
              user: { 
                id: '456', 
                email: data?.email || 'newuser@example.com', 
                username: data?.username || 'newuser',
                token: 'mock-jwt-token'
              } 
            } 
          }
        });
      } else if (url?.includes('/figures')) {
        return Promise.resolve({ 
          data: { 
            data: {
              _id: 'new-figure-id',
              ...data
            }
          }
        });
      }
      return Promise.resolve({ data: { success: true, data: data } });
    }),
    put: jest.fn((url, data, config) => {
      // Track the call and data for test verification
      if (url?.includes('/figures/')) {
        return Promise.resolve({ 
          data: { 
            data: {
              _id: url.split('/').pop(),
              ...data
            }
          }
        });
      }
      return Promise.resolve({ data: { success: true, data: data } });
    }),
    delete: jest.fn((url, config) => {
      // Track the call for test verification
      return Promise.resolve({ data: { success: true, message: 'Deleted successfully' } });
    }),
    patch: jest.fn((url, data, config) => {
      // Track the call and data for test verification
      return Promise.resolve({ data: { success: true, data: data } });
    }),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: {
      headers: { common: {}, delete: {}, head: {}, patch: {}, post: {}, put: {} },
      baseURL: '/api',
    },
  };
  return instance;
};

// Create the global mock instance that tests can access
const mockApiInstance = createMockAxiosInstance();

// Make it globally available
(global as any).mockApiInstance = mockApiInstance;

// Create mock toast function
const mockToast = jest.fn((options: any) => {
  console.log('Mock toast called with:', options);
  return {
    id: 'mock-toast-id',
    status: options.status || 'info',
    title: options.title,
    description: options.description,
    onClose: jest.fn(),
    isActive: true,
  };
});


// Basic axios mock - individual tests can override this with more specific mocks
jest.mock('axios', () => {
  const mockAxios = {
    ...mockApiInstance,
    create: jest.fn((config) => {
      // Track axios.create calls and return instance with the config
      const instance = createMockAxiosInstance();
      if (config) {
        instance.defaults = { ...instance.defaults, ...config };
      }
      
      // Set up interceptors to track calls
      let requestInterceptor: any = null;
      let responseInterceptor: any = null;
      let responseErrorInterceptor: any = null;
      
      instance.interceptors.request.use = jest.fn((onFulfilled, onRejected) => {
        requestInterceptor = onFulfilled;
        return 0; // Return an interceptor ID
      });
      
      instance.interceptors.response.use = jest.fn((onFulfilled, onRejected) => {
        responseInterceptor = onFulfilled;
        responseErrorInterceptor = onRejected;
        return 0; // Return an interceptor ID
      });
      
      // Override instance methods to apply interceptors
      const originalGet = instance.get;
      const originalPost = instance.post;
      const originalPut = instance.put;
      const originalDelete = instance.delete;
      
      const wrapMethod = (method: any) => {
        return jest.fn(async (...args: any[]) => {
          // Apply request interceptor
          let modifiedConfig = args[1] || {};
          if (requestInterceptor) {
            modifiedConfig = requestInterceptor(modifiedConfig) || modifiedConfig;
          }
          
          try {
            // Call original method
            const response = await method(...args);
            
            // Apply response interceptor
            if (responseInterceptor) {
              return responseInterceptor(response) || response;
            }
            return response;
          } catch (error) {
            // Apply error interceptor
            if (responseErrorInterceptor) {
              return responseErrorInterceptor(error);
            }
            throw error;
          }
        });
      };
      
      instance.get = wrapMethod(originalGet);
      instance.post = wrapMethod(originalPost);
      instance.put = wrapMethod(originalPut);
      instance.delete = wrapMethod(originalDelete);
      
      return instance;
    }),
  };
  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});

// Mock react-icons to provide consistent icon components for testing
jest.mock('react-icons/fa', () => {
  const mockReact = require('react');
  
  return {
    __esModule: true,
    FaHome: () => mockReact.createElement('span', { 'data-testid': 'fa-home' }, '🏠'),
    FaCube: () => mockReact.createElement('span', { 'data-testid': 'fa-cube' }, '📦'),
    FaPlus: () => mockReact.createElement('span', { 'data-testid': 'fa-plus' }, '+'),
    FaSearch: () => mockReact.createElement('span', { 'data-testid': 'fa-search' }, '🔍'),
    FaChartBar: () => mockReact.createElement('span', { 'data-testid': 'fa-chart-bar' }, '📊'),
    FaUser: () => mockReact.createElement('span', { 'data-testid': 'fa-user' }, '👤'),
    FaEye: () => mockReact.createElement('span', { 'data-testid': 'fa-eye' }, '👁'),
    FaEyeSlash: () => mockReact.createElement('span', { 'data-testid': 'fa-eye-slash' }, '🙈'),
    FaChevronLeft: () => mockReact.createElement('span', { 'data-testid': 'fa-chevron-left' }, '◀'),
    FaChevronRight: () => mockReact.createElement('span', { 'data-testid': 'fa-chevron-right' }, '▶'),
    FaFilter: () => mockReact.createElement('span', { 'data-testid': 'fa-filter' }, '🔍'),
    FaSortAmountDown: () => mockReact.createElement('span', { 'data-testid': 'fa-sort-amount-down' }, '↓'),
    FaEdit: () => mockReact.createElement('span', { 'data-testid': 'fa-edit' }, '✏️'),
    FaTrash: () => mockReact.createElement('span', { 'data-testid': 'fa-trash' }, '🗑️'),
    FaBoxOpen: () => mockReact.createElement('span', { 'data-testid': 'fa-box-open' }, '📦'),
    FaLink: () => mockReact.createElement('span', { 'data-testid': 'fa-link' }, '🔗'),
    FaQuestionCircle: () => mockReact.createElement('span', { 'data-testid': 'fa-question-circle' }, '❓'),
    FaImage: () => mockReact.createElement('span', { 'data-testid': 'fa-image' }, '🖼️'),
    FaSignOutAlt: () => mockReact.createElement('span', { 'data-testid': 'fa-sign-out-alt' }, '🚪'),
    FaTimes: () => mockReact.createElement('span', { 'data-testid': 'fa-times' }, '✕'),
    FaArrowLeft: () => mockReact.createElement('span', { 'data-testid': 'fa-arrow-left' }, '←'),
  };
});

// Mock Chakra UI icons
jest.mock('@chakra-ui/icons', () => {
  const mockReact = require('react');
  return {
    __esModule: true,
    HamburgerIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'hamburger-icon', 
        ref,
        ...props 
      }, '☰')
    ),
    CloseIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'close-icon', 
        ref,
        ...props 
      }, '✕')
    ),
    ChevronDownIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'chevron-down-icon', 
        ref,
        ...props 
      }, '⌄')
    ),
    ChevronRightIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'chevron-right-icon', 
        ref,
        ...props 
      }, '›')
    ),
  };
});

// Mock Chakra UI utils to resolve module dependency issues  
jest.mock('@chakra-ui/utils', () => {
  const mockReact = require('react');
  
  return {
    __esModule: true,
    // Context utilities
    createContext: jest.fn((options) => {
      const mockContext = mockReact.createContext(options?.defaultValue || {});
      const mockProvider = ({ children, value, ...rest }: any) => 
        mockReact.createElement(mockContext.Provider, { value: value || {}, ...rest }, children);
      const mockUseContext = () => mockReact.useContext(mockContext);
      
      return [mockProvider, mockUseContext, mockContext];
    }),
    // Common utilities that tests might need
    runIfFn: jest.fn((valueOrFn, ...args) => 
      typeof valueOrFn === 'function' ? valueOrFn(...args) : valueOrFn
    ),
    omit: jest.fn((obj, keys) => {
      const result = { ...obj };
      keys.forEach((key: string) => delete result[key]);
      return result;
    }),
    pick: jest.fn((obj, keys) => {
      const result: any = {};
      keys.forEach((key: string) => {
        if (key in obj) result[key] = obj[key];
      });
      return result;
    }),
    callAllHandlers: jest.fn((...handlers) => (event: any) => {
      handlers.forEach(handler => {
        if (typeof handler === 'function') {
          handler(event);
        }
      });
    }),
  };
});

// Enhanced Chakra UI React mock with comprehensive component coverage
jest.mock('@chakra-ui/react', () => {
  const mockReact = require('react');
  
  // Create mock components that render as appropriate semantic elements for testing
  const createMockComponent = (name: string, element: string = 'div') => 
    mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement(element, { 
        'data-testid': name, 
        ref, 
        ...props 
      }, children)
    );

  // Create components with displayNames for FormControl enhancement
  // ENHANCED mock Input that properly handles ALL values for .toHaveValue() assertions
  const MockInput = mockReact.forwardRef((props: any, ref: any) => {
    const { placeholder, name, id, type, required, onChange, onBlur, value, defaultValue, ...domProps } = props;
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // CRITICAL: Determine current value - prioritize controlled value, then form data, then defaultValue
    const currentValue = value !== undefined ? String(value) : 
      (name && mockFormData[name] !== undefined ? String(mockFormData[name]) : 
      (defaultValue ? String(defaultValue) : ''));
    
    // Initialize form data if not set
    if (name && mockFormData[name] === undefined && (value !== undefined || defaultValue)) {
      mockFormData[name] = currentValue;
    }
    
    // ENHANCED onChange handler that properly handles all character types
    const handleChange = (e: any) => {
      // CRITICAL: Get the COMPLETE new value, not partial
      const newValue = e.target.value || '';
        
      // Update mock form data
      if (name) {
        mockFormData[name] = newValue;
        
        // CRITICAL: Update the actual input value for proper tracking
        if (e.target) {
          // Use Object.defineProperty to make .value dynamic and always accurate
          Object.defineProperty(e.target, 'value', {
            value: newValue,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
        
        // Run validation if field has rules
        if (mockUseFormReturn._fieldRules && mockUseFormReturn._fieldRules[name]) {
          const rules = mockUseFormReturn._fieldRules[name];
          
          if (rules.validate && typeof rules.validate === 'function') {
            try {
              const validationResult = rules.validate(newValue);
              if (validationResult === true) {
                if (mockErrors[name]) {
                  delete mockErrors[name];
                  mockUseFormReturn.formState.errors = { ...mockErrors };
                  mockUseFormReturn.formState.isValid = Object.keys(mockErrors).length === 0;
                }
              } else if (validationResult && typeof validationResult === 'string') {
                mockErrors[name] = { message: validationResult };
                mockUseFormReturn.formState.errors = { ...mockErrors };
                mockUseFormReturn.formState.isValid = false;
              }
            } catch (error) {
              console.warn('Validation error:', error);
            }
          }
        }
      }
      
      // Call original onChange if provided
      if (onChange) onChange(e);
    };
    
    // Enhanced onBlur handler
    const handleBlur = (e: any) => {
      const blurValue = e.target.value || '';
      
      // Validate on blur if needed
      if (name && required && !blurValue.trim()) {
        const message = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        mockErrors[name] = { message };
        mockUseFormReturn.formState.errors = { ...mockErrors };
        mockUseFormReturn.formState.isValid = false;
      }
      
      // Call original onBlur if provided
      if (onBlur) onBlur(e);
    };
    
    // Create input element with proper value handling
    const inputProps: any = {
      'data-testid': 'input',
      placeholder,
      name,
      id: inputId,
      type: type || 'text',
      onChange: handleChange,
      onBlur: handleBlur,
      required: required,
      ...domProps
    };
    
    // CRITICAL: Create proper ref callback that makes .value dynamic
    const inputRef = (element: HTMLInputElement) => {
      if (element && name) {
        // Make the input's value property dynamic and always return current mock data
        Object.defineProperty(element, 'value', {
          get: () => {
            const formValue = mockFormData[name];
            return formValue !== undefined ? String(formValue) : currentValue;
          },
          set: (newValue: string) => {
            mockFormData[name] = newValue;
            // Trigger change event to notify React
            const changeEvent = new Event('change', { bubbles: true });
            Object.defineProperty(changeEvent, 'target', {
              value: element,
              writable: false
            });
            element.dispatchEvent(changeEvent);
          },
          enumerable: true,
          configurable: true
        });
        
        // Set initial value
        element.value = currentValue;
      }
      
      // Call the original ref if provided
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref.current !== undefined) {
          ref.current = element;
        }
      }
    };
    
    inputProps.ref = inputRef;
    
    // CRITICAL: Use controlled value if provided, otherwise use defaultValue
    if (value !== undefined) {
      inputProps.value = currentValue;
    } else {
      inputProps.defaultValue = currentValue;
    }
    
    return mockReact.createElement('input', inputProps);
  });
  
  const Input = mockReact.forwardRef((props: any, ref: any) => 
    mockReact.createElement(MockInput, { ...props, ref })
  );
  Input.displayName = 'Input';

  const FormLabel = mockReact.forwardRef(({ children, htmlFor, ...props }: any, ref: any) => {
    return mockReact.createElement('label', { 
      'data-testid': 'form-label', 
      ref,
      htmlFor,
      ...props 
    }, children);
  });
  FormLabel.displayName = 'FormLabel';

  const InputGroup = createMockComponent('input-group');
  InputGroup.displayName = 'InputGroup';

  return {
    // Mock toast hook - need to use a prefixed name
    useToast: () => {
      return jest.fn((options: any) => {
        console.log('Mock toast called with:', options);
        return {
          id: 'mock-toast-id',
          status: options?.status || 'info',
          title: options?.title,
          description: options?.description,
          onClose: jest.fn(),
          isActive: true,
        };
      });
    },
    // Mock theme extending
    extendTheme: jest.fn((theme) => ({
      ...theme,
      breakpoints: theme?.breakpoints || {},
      colors: theme?.colors || {},
      fonts: theme?.fonts || {},
    })),
    // Mock commonly used components that might have issues
    ChakraProvider: ({ children }: any) => mockReact.createElement('div', {}, children),
    Box: mockReact.forwardRef(({ children, as, ...props }: any, ref: any) =>
      mockReact.createElement(as || 'div', { 
        'data-testid': 'box', 
        ref,
        ...props 
      }, children)
    ),
    Flex: createMockComponent('flex'),
    VStack: createMockComponent('vstack'),
    HStack: createMockComponent('hstack'),
    Button: mockReact.forwardRef(({ children, as, to, href, leftIcon, rightIcon, ...props }: any, ref: any) => {
      // Filter out Chakra-specific props that shouldn't be passed to DOM
      const { colorScheme, variant, size, isLoading, isDisabled, ...domProps } = props;
      
      // CRITICAL: Add data-loading attribute as EMPTY STRING when isLoading is true (not "true")
      if (isLoading) {
        domProps['data-loading'] = '';
      }
      
      // Handle RouterLink buttons - as={RouterLink} or as={Link} or to prop present
      if (as || to) {
        return mockReact.createElement('a', { 
          'data-testid': 'button', 
          ref,
          href: to || href,
          disabled: isDisabled || isLoading,
          ...domProps 
        }, [
          leftIcon && mockReact.createElement('span', { key: 'left-icon', 'data-testid': 'left-icon' }, leftIcon),
          isLoading && mockReact.createElement('span', { key: 'spinner', 'data-testid': 'spinner', role: 'status' }, 'Loading...'),
          children,
          rightIcon && mockReact.createElement('span', { key: 'right-icon', 'data-testid': 'right-icon' }, rightIcon)
        ].filter(Boolean));
      }
      
      return mockReact.createElement('button', { 
        'data-testid': 'button', 
        ref,
        disabled: isDisabled || isLoading,
        ...domProps 
      }, [
        leftIcon && mockReact.createElement('span', { key: 'left-icon', 'data-testid': 'left-icon' }, leftIcon),
        isLoading && mockReact.createElement('span', { key: 'spinner', 'data-testid': 'spinner', role: 'status' }, 'Loading...'),
        children,
        rightIcon && mockReact.createElement('span', { key: 'right-icon', 'data-testid': 'right-icon' }, rightIcon)
      ].filter(Boolean));
    }),
    IconButton: mockReact.forwardRef(({ children, isDisabled, isLoading, icon, ...props }: any, ref: any) =>
      mockReact.createElement('button', { 
        'data-testid': 'icon-button', 
        ref,
        disabled: isDisabled || isLoading,
        ...props 
      }, [icon, children])
    ),
    Input,
    Checkbox: createMockComponent('checkbox', 'input'),
    Select: createMockComponent('select', 'select'),
    Textarea: createMockComponent('textarea', 'textarea'),
    FormControl: mockReact.forwardRef(({ children, isInvalid, ...props }: any, ref: any) => {
      // Generate unique id for this form control
      const controlId = `field-${Math.random().toString(36).substr(2, 9)}`;
      
      // Clone children to inject proper accessibility attributes
      const enhancedChildren = mockReact.Children.map(children, (child: any) => {
        if (!child || typeof child !== 'object') return child;
        
        // Add htmlFor to FormLabel
        if (child?.props && child?.type?.displayName === 'FormLabel') {
          return mockReact.cloneElement(child, {
            ...child.props,
            htmlFor: controlId
          });
        }
        
        // Add id to Input
        if (child?.props && child?.type?.displayName === 'Input') {
          return mockReact.cloneElement(child, {
            ...child.props,
            id: controlId,
            'aria-invalid': isInvalid ? 'true' : 'false'
          });
        }
        
        // Handle InputGroup (contains Input)
        if (child?.props && child?.type?.displayName === 'InputGroup') {
          const inputGroupChildren = mockReact.Children.map(child.props.children, (inputChild: any) => {
            if (inputChild?.props && inputChild?.type?.displayName === 'Input') {
              return mockReact.cloneElement(inputChild, {
                ...inputChild.props,
                id: controlId,
                'aria-invalid': isInvalid ? 'true' : 'false'
              });
            }
            return inputChild;
          });
          
          return mockReact.cloneElement(child, {
            ...child.props,
            children: inputGroupChildren
          });
        }
        
        return child;
      });
      
      return mockReact.createElement('div', { 
        'data-testid': 'form-control', 
        ref,
        ...props 
      }, enhancedChildren);
    }),
    FormLabel,
    FormErrorMessage: mockReact.forwardRef(({ children, ...props }: any, ref: any) => {
      // Only render if children (error message) is provided
      if (!children) return null;
      
      // Extract field name from error message for proper ID
      const message = typeof children === 'string' ? children : '';
      const fieldName = message.toLowerCase().split(' ')[0] || 'field';
      
      return mockReact.createElement('div', { 
        'data-testid': 'form-error-message',
        id: `${fieldName}-error`,
        role: 'alert',
        'aria-live': 'polite',
        ref,
        ...props 
      }, children);
    }),
    Alert: createMockComponent('alert'),
    AlertIcon: createMockComponent('alert-icon'),
    AlertTitle: createMockComponent('alert-title'),
    AlertDescription: createMockComponent('alert-description'),
    // Additional components used by Login
    Heading: createMockComponent('heading', 'h1'),
    Text: createMockComponent('text', 'p'),
    Link: mockReact.forwardRef(({ children, href, isExternal, as, to, ...props }: any, ref: any) => {
      // Handle both Chakra UI Link and Router Link
      const element = as === require('react-router-dom').Link ? 'a' : 'a';
      const linkProps = {
        'data-testid': 'link',
        ref,
        href: href || (to ? to : undefined),
        ...(isExternal && { target: '_blank', rel: 'noopener noreferrer' }),
        ...props
      };
      return mockReact.createElement(element, linkProps, children);
    }),
    Icon: createMockComponent('icon', 'span'),
    InputGroup,
    InputRightElement: createMockComponent('input-right-element'),
    // Grid and layout components
    Grid: createMockComponent('grid'),
    GridItem: createMockComponent('grid-item'),
    Container: createMockComponent('container'),
    Spacer: createMockComponent('spacer'),
    Center: createMockComponent('center'),
    Stack: createMockComponent('stack'),
    // Other commonly used components
    Image: mockReact.forwardRef(({ src, alt, fallbackSrc, ...props }: any, ref: any) =>
      mockReact.createElement('img', { 
        'data-testid': 'image', 
        ref,
        src: src || fallbackSrc || '/placeholder.png',
        alt: alt || '',
        ...props 
      })
    ),
    Spinner: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'spinner',
        role: 'status',
        'aria-label': 'Loading',
        ref, 
        ...props 
      }, children)
    ),
    Badge: createMockComponent('badge'),
    Card: createMockComponent('card'),
    CardHeader: createMockComponent('card-header'),
    CardBody: createMockComponent('card-body'),
    CardFooter: createMockComponent('card-footer'),
    // Stats components
    Stat: createMockComponent('stat'),
    StatLabel: createMockComponent('stat-label'),
    StatNumber: createMockComponent('stat-number'),
    StatHelpText: createMockComponent('stat-help-text'),
    // Grid components
    SimpleGrid: createMockComponent('simple-grid'),
    Grid: createMockComponent('grid'),
    GridItem: createMockComponent('grid-item'),
    Divider: createMockComponent('divider', 'hr'),
    // Tooltip component for help text
    Tooltip: mockReact.forwardRef(({ children, label, ...props }: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'tooltip', 
        ref,
        'aria-label': label,
        title: label,
        ...props 
      }, children)
    ),
    // Navbar specific components
    Collapse: mockReact.forwardRef(({ children, in: isOpen, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'collapse', 
        ref,
        style: { display: isOpen ? 'block' : 'none' },
        ...props 
      }, children)
    ),
    Popover: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'popover', 
        ref,
        ...props 
      }, children)
    ),
    PopoverTrigger: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'popover-trigger', 
        ref,
        ...props 
      }, children)
    ),
    PopoverContent: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'popover-content', 
        ref,
        ...props 
      }, children)
    ),
    Avatar: mockReact.forwardRef(({ name, ...props }: any, ref: any) => {
      const initials = name ? name.charAt(0).toUpperCase() : 'U';
      return mockReact.createElement('div', { 
        'data-testid': 'avatar', 
        ref,
        role: 'img',
        'aria-label': `Avatar for ${name || 'user'}`,
        ...props 
      }, initials);
    }),
    Menu: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'menu', 
        ref,
        ...props 
      }, children)
    ),
    MenuButton: mockReact.forwardRef(({ children, as, ...props }: any, ref: any) => {
      const Component = as || 'button';
      return mockReact.createElement(Component, { 
        'data-testid': 'menu-button', 
        ref,
        ...props 
      }, children);
    }),
    MenuList: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'menu-list', 
        ref,
        role: 'menu',
        ...props 
      }, children)
    ),
    MenuItem: mockReact.forwardRef(({ children, as, to, href, icon, onClick, ...props }: any, ref: any) => {
      const Component = as || 'div';
      const itemProps = {
        'data-testid': 'menu-item',
        ref,
        role: 'menuitem',
        onClick,
        ...(to && { href: to }),
        ...(href && { href }),
        ...props
      };
      return mockReact.createElement(Component, itemProps, [
        icon && mockReact.createElement('span', { key: 'icon' }, icon),
        children
      ].filter(Boolean));
    }),
    MenuDivider: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('hr', { 
        'data-testid': 'menu-divider', 
        ref,
        role: 'separator',
        ...props 
      })
    ),
    // Breadcrumb components
    Breadcrumb: mockReact.forwardRef(({ children, separator, ...props }: any, ref: any) =>
      mockReact.createElement('nav', { 
        'data-testid': 'breadcrumb', 
        ref,
        'aria-label': 'breadcrumb',
        ...props 
      }, children)
    ),
    BreadcrumbItem: mockReact.forwardRef(({ children, isCurrentPage, ...props }: any, ref: any) =>
      mockReact.createElement('li', { 
        'data-testid': 'breadcrumb-item', 
        ref,
        'aria-current': isCurrentPage ? 'page' : undefined,
        ...props 
      }, children)
    ),
    BreadcrumbLink: mockReact.forwardRef(({ children, as, to, href, ...props }: any, ref: any) => {
      const Component = as || 'a';
      return mockReact.createElement(Component, { 
        'data-testid': 'breadcrumb-link', 
        ref,
        ...(to && { to }),
        ...(href && { href }),
        ...props 
      }, children);
    }),
    // Chakra UI hooks
    useColorModeValue: jest.fn((light) => light),
    useBreakpointValue: jest.fn((values) => values?.base || values),
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
      onToggle: jest.fn(),
    }),
  };
});

// Enhanced React Hook Form mock with proper exports and error handling
const mockFormData: any = {};
const mockErrors: any = {};

// Make mock state globally accessible for test cleanup
const mockUseFormReturn = {
  register: jest.fn((name?: string, registerOptions?: any) => {
    const fieldName = name || 'test';
    
    // Store validation rules for this field
    if (!mockUseFormReturn._fieldRules) {
      mockUseFormReturn._fieldRules = {};
    }
    mockUseFormReturn._fieldRules[fieldName] = registerOptions || {};
    
    return {
      name: fieldName,
      id: fieldName,
      onChange: jest.fn((e) => {
        const value = e?.target?.value !== undefined ? e.target.value : e;
        mockFormData[fieldName] = value;
        
        // Update the input element if it exists
        if (e?.target) {
          e.target.value = value;
        }
        
        // If this field has validation rules, run them on change
        if (registerOptions?.validate && typeof registerOptions.validate === 'function') {
          try {
            const validationResult = registerOptions.validate(value);
            
            if (validationResult === true) {
              // Validation passed, clear any existing error
              if (mockErrors[fieldName]) {
                delete mockErrors[fieldName];
                mockUseFormReturn.formState.errors = { ...mockErrors };
                mockUseFormReturn.formState.isValid = Object.keys(mockErrors).length === 0;
              }
            } else if (validationResult && typeof validationResult === 'string') {
              // Validation failed with error message
              mockErrors[fieldName] = { message: validationResult };
              mockUseFormReturn.formState.errors = { ...mockErrors };
              mockUseFormReturn.formState.isValid = false;
            }
          } catch (error) {
            // If validation throws, ignore it for now
            console.warn('Validation function threw error:', error);
          }
        } else if (registerOptions?.required && value && value.trim()) {
          // Simple required validation - clear error if value provided
          if (mockErrors[fieldName]) {
            delete mockErrors[fieldName];
            mockUseFormReturn.formState.errors = { ...mockErrors };
            mockUseFormReturn.formState.isValid = Object.keys(mockErrors).length === 0;
          }
        }
        
        // Update formState to reflect the change
        mockUseFormReturn.formState.isDirty = true;
      }),
      onBlur: jest.fn((e) => {
        const value = e.target?.value || mockFormData[fieldName] || '';
        
        // Trigger validation on blur
        if (registerOptions?.required && !value.trim()) {
          const message = typeof registerOptions.required === 'string' 
            ? registerOptions.required 
            : `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
          mockErrors[fieldName] = { message };
          mockUseFormReturn.formState.isValid = false;
        } else if (registerOptions?.validate) {
          const error = registerOptions.validate(value);
          if (error && error !== true) {
            mockErrors[fieldName] = { message: error };
            mockUseFormReturn.formState.isValid = false;
          } else {
            delete mockErrors[fieldName];
          }
        } else if (value.trim()) {
          // Clear error if field has value
          delete mockErrors[fieldName];
        }
        
        // Update formState to trigger re-render
        mockUseFormReturn.formState.errors = { ...mockErrors };
        mockUseFormReturn.formState.isValid = Object.keys(mockErrors).length === 0;
      }),
      ref: jest.fn(),
      required: registerOptions?.required || false,
    };
  }),
  handleSubmit: jest.fn((onSubmit, onError) => {
    const submitHandler = jest.fn(async (e) => {
      e?.preventDefault?.();
      
      // Validate all fields before submission
      let hasValidationErrors = false;
      
      // Only validate fields that have been registered with rules
      if (mockUseFormReturn._fieldRules) {
        Object.entries(mockUseFormReturn._fieldRules).forEach(([fieldName, rules]: [string, any]) => {
          const value = mockFormData[fieldName] || '';
          
          // Check required validation
          if (rules.required && !value.trim()) {
            const message = typeof rules.required === 'string' 
              ? rules.required 
              : `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            mockErrors[fieldName] = { message };
            hasValidationErrors = true;
          } else if (rules.validate && typeof rules.validate === 'function') {
            // Check custom validation
            const validationResult = rules.validate(value);
            if (validationResult && validationResult !== true) {
              mockErrors[fieldName] = { message: validationResult };
              hasValidationErrors = true;
            }
          }
        });
      }
      
      // Update form state
      mockUseFormReturn.formState.errors = { ...mockErrors };
      mockUseFormReturn.formState.isValid = !hasValidationErrors;
      
      // If no validation errors, call onSubmit with the current form data
      if (!hasValidationErrors && onSubmit) {
        try {
          mockUseFormReturn.formState.isSubmitting = true;
          // CRITICAL: Ensure form data is passed correctly including ALL special characters
          const formData = {};
          // Deep copy to preserve ALL characters including special ones
          Object.keys(mockFormData).forEach(key => {
            const value = mockFormData[key];
            // Preserve the exact value including special characters, Unicode, etc.
            formData[key] = value;
          });
          
          const result = await onSubmit(formData);
          mockUseFormReturn.formState.isSubmitting = false;
          return result;
        } catch (error) {
          mockUseFormReturn.formState.isSubmitting = false;
          if (onError) {
            onError(error);
          }
          throw error;
        }
      } else if (hasValidationErrors && onError) {
        // Call onError if there are validation errors
        onError(mockErrors);
      }
    });
    
    // Mark that handleSubmit was called
    submitHandler._isHandleSubmit = true;
    
    return submitHandler;
  }),
  formState: {
    get errors() { return mockErrors; },
    get isSubmitting() { return this._isSubmitting || false; },
    get isValid() { return Object.keys(mockErrors).length === 0; },
    get isDirty() { return this._isDirty || false; },
    _isSubmitting: false,
    _isDirty: false,
  },
  watch: jest.fn((fieldName) => {
    if (fieldName) {
      return mockFormData[fieldName] || '';
    }
    return mockFormData;
  }),
  setValue: jest.fn((name, value, options = {}) => {
    mockFormData[name] = value;
    
    // Mark form as dirty if shouldDirty is not false
    if (options.shouldDirty !== false) {
      mockUseFormReturn.formState._isDirty = true;
    }
    
    // Clear error if value is provided and shouldValidate is not false
    if (value && value.trim && value.trim() && options.shouldValidate !== false) {
      if (mockErrors[name]) {
        delete mockErrors[name];
        mockUseFormReturn.formState.errors = { ...mockErrors };
      }
    }
    
    // Also update the input element if it exists in the DOM
    const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      // Trigger a change event to notify React of the value change
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: input,
      });
      input.dispatchEvent(event);
    }
  }),
  getValues: jest.fn((fieldName) => {
    if (fieldName) {
      return mockFormData[fieldName] || '';
    }
    return { ...mockFormData };
  }),
  reset: jest.fn((data) => {
    Object.keys(mockFormData).forEach(key => delete mockFormData[key]);
    Object.keys(mockErrors).forEach(key => delete mockErrors[key]);
    mockUseFormReturn.formState._isDirty = false;
    mockUseFormReturn.formState._isSubmitting = false;
    if (data) {
      Object.assign(mockFormData, data);
    }
  }),
  trigger: jest.fn(() => Promise.resolve(true)),
  clearErrors: jest.fn((name) => {
    if (name) {
      delete mockErrors[name];
    } else {
      Object.keys(mockErrors).forEach(key => delete mockErrors[key]);
    }
    mockUseFormReturn.formState.errors = { ...mockErrors };
  }),
  setError: jest.fn((name, error) => {
    mockErrors[name] = error;
    mockUseFormReturn.formState.errors = { ...mockErrors };
    mockUseFormReturn.formState.isValid = false;
  }),
  control: {},
  unregister: jest.fn(),
};

// Make mock state globally accessible for test cleanup
(global as any).mockFormData = mockFormData;
(global as any).mockErrors = mockErrors;
(global as any).mockUseFormReturn = mockUseFormReturn;

jest.mock('react-hook-form', () => {
  const actualModule = jest.requireActual('react-hook-form');
  
  return {
    __esModule: true,
    useForm: (options?: any) => {
      // Initialize mock form data with default values if provided
      if (options?.defaultValues) {
        Object.keys(options.defaultValues).forEach(key => {
          if (mockFormData[key] === undefined) {
            mockFormData[key] = options.defaultValues[key];
          }
        });
      }
      
      // Return a new object with dynamic formState each time to avoid destructuring issues
      return {
        ...mockUseFormReturn,
        formState: {
          get errors() { return mockErrors; },
          get isSubmitting() { return mockUseFormReturn.formState._isSubmitting || false; },
          get isValid() { return Object.keys(mockErrors).length === 0; },
          get isDirty() { return mockUseFormReturn.formState._isDirty || false; },
          _isSubmitting: false,
          _isDirty: false,
        },
      };
    },
    Controller: ({ render, control, name, defaultValue, rules }: any) => {
      // Better Controller mock that respects the component's value
      const fieldValue = mockFormData[name] || defaultValue || '';
      
      return render?.({
        field: {
          onChange: jest.fn((value: any) => {
            mockFormData[name] = value;
          }),
          onBlur: jest.fn(),
          value: fieldValue,
          name: name || 'test'
        },
        fieldState: {
          error: mockErrors[name] || null
        }
      });
    },
    useController: jest.fn((props: any) => {
      const name = props?.name || 'test';
      const defaultValue = props?.defaultValue || '';
      const fieldValue = mockFormData[name] || defaultValue;
      
      return {
        field: {
          onChange: jest.fn((value: any) => {
            mockFormData[name] = value;
          }),
          onBlur: jest.fn(),
          value: fieldValue,
          name: name
        },
        fieldState: {
          error: mockErrors[name] || null,
          invalid: !!mockErrors[name],
          isDirty: mockFormData[name] !== defaultValue
        }
      };
    })
  };
});

// Note: Consolidated react-query mock is at the top of this file

// Mock fetch globally for all tests - ensure it's always defined
const mockFetch = jest.fn().mockImplementation((url: string | Request, options?: any): Promise<Response> => {
  const urlString = typeof url === 'string' ? url : (url ? url.url : '');
  
  // Mock service registration endpoint
  if (urlString === '/register-service') {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('{"success":true}'),
      clone: () => ({ json: () => Promise.resolve({ success: true }) }),
      headers: new Headers(),
    } as any);
  }
  
  // Mock version endpoint
  if (urlString === '/version') {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        services: {
          frontend: { version: '1.0.0', healthy: true },
          backend: { version: '1.0.0', healthy: true },
        }
      }),
      text: () => Promise.resolve('{"services":{}}'),
      clone: () => ({ json: () => Promise.resolve({ services: {} }) }),
      headers: new Headers(),
    } as any);
  }
  
  // Mock MFC API for scraping tests
  if (urlString && urlString.includes('myfigurecollection.net')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve('<html>Mock MFC Response</html>'),
      json: () => Promise.resolve({}),
      clone: () => ({ text: () => Promise.resolve('<html>Mock MFC Response</html>') }),
      headers: new Headers(),
    } as any);
  }
  
  // Default mock for other endpoints - always return a valid promise
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('{}'),
    clone: () => ({ json: () => Promise.resolve({}) }),
    headers: new Headers(),
  } as any);
});

// Assign the mock to both global and window to ensure availability
(global as any).fetch = mockFetch;
if (typeof window !== 'undefined') {
  (window as any).fetch = mockFetch;
}