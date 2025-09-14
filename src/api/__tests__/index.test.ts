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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('API Module', () => {
  let mockAxiosInstance: any;
  let requestInterceptor: any;
  let responseInterceptor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
    localStorageMock.clear();
    localStorageMock.removeItem.mockClear();

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
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth-storage');
      expect(window.location.href).toBe('/login');
    });
  });

  describe('API Functions Coverage - Lines 69-93', () => {
    beforeEach(() => {
      // Setup for API function tests
      mockAxiosInstance.post.mockResolvedValue({ data: { data: {} } });
      mockAxiosInstance.get.mockResolvedValue({ data: { data: {} } });
      mockAxiosInstance.put.mockResolvedValue({ data: { data: {} } });
    });

    it('should cover refreshToken lines 69-70', async () => {
      const mockToken = { token: 'new-refresh-token-123' };
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: mockToken }
      });

      const result = await api.refreshToken();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockToken);
    });

    it('should cover logoutUser line 74', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true }
      });

      await api.logoutUser();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should cover logoutAllSessions line 78', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true }
      });

      await api.logoutAllSessions();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout-all');
    });

    it('should cover getUserSessions lines 82-83', async () => {
      const mockSessions = [
        { id: 'session1', device: 'Chrome', lastActive: '2024-01-01' },
        { id: 'session2', device: 'Firefox', lastActive: '2024-01-02' }
      ];
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: mockSessions }
      });

      const result = await api.getUserSessions();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/sessions');
      expect(result).toEqual(mockSessions);
    });

    it('should cover getUserProfile lines 87-88', async () => {
      const mockProfile = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        createdAt: '2024-01-01T00:00:00Z'
      };
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: mockProfile }
      });

      const result = await api.getUserProfile();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockProfile);
    });

    it('should cover updateUserProfile lines 92-93', async () => {
      const updateData = { username: 'newusername' };
      const updatedProfile = {
        id: 'user123',
        email: 'test@example.com',
        username: 'newusername',
        updatedAt: '2024-01-02T00:00:00Z'
      };
      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { data: updatedProfile }
      });

      const result = await api.updateUserProfile(updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/profile', updateData);
      expect(result).toEqual(updatedProfile);
    });
  });
});
