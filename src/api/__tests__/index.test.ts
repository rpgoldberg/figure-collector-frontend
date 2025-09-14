/**
 * Tests for API functions and interceptors
 */
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import * as api from '../index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock auth store
jest.mock('../../stores/authStore');
const mockedUseAuthStore = useAuthStore as unknown as jest.MockedFunction<typeof useAuthStore>;

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('API Module', () => {
  let mockAxiosInstance: any;
  let requestInterceptor: any;
  let responseInterceptor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
    localStorage.clear();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn((handler) => {
            requestInterceptor = handler;
            return 0;
          }),
        },
        response: {
          use: jest.fn((successHandler, errorHandler) => {
            responseInterceptor = { successHandler, errorHandler };
            return 0;
          }),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Default auth store state
    mockedUseAuthStore.getState = jest.fn().mockReturnValue({
      user: null,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    // Re-import to trigger module initialization
    jest.isolateModules(() => {
      require('../index');
    });
  });

  describe('Request Interceptor', () => {
    it('should add auth token to requests when user is logged in', () => {
      mockedUseAuthStore.getState.mockReturnValue({
        user: { token: 'test-token', email: 'test@test.com' },
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      const config = { headers: {} as any };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add auth token when user is not logged in', () => {
      mockedUseAuthStore.getState.mockReturnValue({
        user: null,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      const config = { headers: {} as any };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should update token when x-new-token header is present', () => {
      const setUser = jest.fn();
      mockedUseAuthStore.getState.mockReturnValue({
        user: { token: 'old-token', email: 'test@test.com', id: '1' },
        setUser,
        logout: jest.fn(),
      });

      const response = {
        headers: { 'x-new-token': 'Bearer new-token' },
        data: { success: true },
      };

      const result = responseInterceptor.successHandler(response);

      expect(setUser).toHaveBeenCalledWith({
        token: 'new-token',
        email: 'test@test.com',
        id: '1',
      });
      expect(result).toBe(response);
    });

    it('should handle 401 errors by logging out and redirecting', async () => {
      const logout = jest.fn();
      mockedUseAuthStore.getState.mockReturnValue({
        user: { token: 'test-token', email: 'test@test.com' },
        setUser: jest.fn(),
        logout,
      });

      const error = {
        response: { status: 401 },
      };

      await expect(responseInterceptor.errorHandler(error)).rejects.toEqual(error);

      expect(logout).toHaveBeenCalled();
      expect(localStorage.getItem('auth-storage')).toBeNull();
      expect(window.location.href).toBe('/login');
    });
  });
});
