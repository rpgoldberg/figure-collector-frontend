/**
 * Tests for authentication token mapping
 * These tests ensure that the Backend's accessToken field is correctly
 * mapped to the Frontend's expected token field
 */

import { loginUser, registerUser } from '../index';

// Mock the axios module
jest.mock('axios');
import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Authentication Token Mapping', () => {
  let mockApiInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock axios instance
    mockApiInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn((success, error) => {
            // Store the interceptor functions for testing
            mockApiInstance.responseInterceptorSuccess = success;
            mockApiInstance.responseInterceptorError = error;
          }),
        },
      },
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create = jest.fn(() => mockApiInstance);

    // Re-import to trigger module initialization with mocked axios
    jest.resetModules();
    require('../index');
  });

  describe('loginUser', () => {
    it('should map Backend accessToken to Frontend token field', async () => {
      // Backend returns accessToken field
      const backendResponse = {
        data: {
          data: {
            _id: 'user123',
            username: 'testuser',
            email: 'test@example.com',
            isAdmin: false,
            accessToken: 'jwt-token-here',  // Backend field name
            refreshToken: 'refresh-token-here'
          }
        }
      };

      mockApiInstance.post.mockResolvedValueOnce(backendResponse);

      // Import the actual function after mocking
      const { loginUser: actualLoginUser } = require('../index');

      const result = await actualLoginUser('test@example.com', 'password');

      // Frontend should receive token field (not accessToken)
      expect(result).toEqual({
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        token: 'jwt-token-here'  // Frontend field name
      });

      // Should NOT have accessToken field
      expect(result).not.toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should handle missing accessToken gracefully', async () => {
      // Backend response without accessToken
      const backendResponse = {
        data: {
          data: {
            _id: 'user123',
            username: 'testuser',
            email: 'test@example.com',
            isAdmin: false
            // No accessToken field
          }
        }
      };

      mockApiInstance.post.mockResolvedValueOnce(backendResponse);

      const { loginUser: actualLoginUser } = require('../index');

      const result = await actualLoginUser('test@example.com', 'password');

      // Should still return user data with undefined token
      expect(result).toEqual({
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        token: undefined
      });
    });

    it('should handle completely missing response data', async () => {
      // Malformed backend response
      const backendResponse = {
        data: {
          // No data field
          success: true,
          message: 'Login successful'
        }
      };

      mockApiInstance.post.mockResolvedValueOnce(backendResponse);

      const { loginUser: actualLoginUser } = require('../index');

      const result = await actualLoginUser('test@example.com', 'password');

      // Should return undefined for missing data
      expect(result).toBeUndefined();
    });
  });

  describe('registerUser', () => {
    it('should map Backend accessToken to Frontend token field', async () => {
      // Backend returns accessToken field
      const backendResponse = {
        data: {
          data: {
            _id: 'newuser123',
            username: 'newuser',
            email: 'new@example.com',
            isAdmin: false,
            accessToken: 'new-jwt-token',  // Backend field name
            refreshToken: 'new-refresh-token'
          }
        }
      };

      mockApiInstance.post.mockResolvedValueOnce(backendResponse);

      const { registerUser: actualRegisterUser } = require('../index');

      const result = await actualRegisterUser('newuser', 'new@example.com', 'password');

      // Frontend should receive token field (not accessToken)
      expect(result).toEqual({
        _id: 'newuser123',
        username: 'newuser',
        email: 'new@example.com',
        isAdmin: false,
        token: 'new-jwt-token'  // Frontend field name
      });

      // Should NOT have accessToken or refreshToken fields
      expect(result).not.toHaveProperty('accessToken');
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('Token Field Consistency', () => {
    it('should ensure axios interceptor uses token field from user store', () => {
      // This test verifies the request interceptor uses the correct field
      const requestInterceptor = mockApiInstance.interceptors.request.use.mock.calls[0][0];

      // Mock the auth store
      const mockGetState = jest.fn().mockReturnValue({
        user: {
          _id: 'user123',
          username: 'testuser',
          email: 'test@example.com',
          isAdmin: false,
          token: 'stored-jwt-token'  // Frontend uses token field
        }
      });

      // Replace the actual getState with our mock
      jest.mock('../../stores/authStore', () => ({
        useAuthStore: {
          getState: mockGetState
        }
      }));

      const config = { headers: {} };
      requestInterceptor(config);

      // Verify the Authorization header is set correctly
      expect(config.headers.Authorization).toBe('Bearer stored-jwt-token');
    });
  });

  describe('Critical Bug Prevention', () => {
    it('should prevent authentication redirect loop by ensuring token is attached', async () => {
      // This test simulates the exact bug that was fixed

      // 1. User logs in successfully
      const loginResponse = {
        data: {
          data: {
            _id: 'user123',
            username: 'testuser',
            email: 'test@example.com',
            isAdmin: false,
            accessToken: 'valid-jwt-token'
          }
        }
      };

      mockApiInstance.post.mockResolvedValueOnce(loginResponse);

      const { loginUser: actualLoginUser } = require('../index');
      const user = await actualLoginUser('test@example.com', 'password');

      // 2. Verify user has token field (not accessToken)
      expect(user.token).toBe('valid-jwt-token');
      expect(user.accessToken).toBeUndefined();

      // 3. Simulate making an authenticated API call
      const mockAuthStore = {
        user: user,  // User from login with token field
        isAuthenticated: true
      };

      // Mock useAuthStore.getState
      const useAuthStore = {
        getState: () => mockAuthStore
      };

      // Get the request interceptor
      const requestInterceptor = mockApiInstance.interceptors.request.use.mock.calls[0][0];

      // Create a config object for an API request
      const config = {
        headers: {},
        url: '/api/figures',
        method: 'GET'
      };

      // Mock the getState to return our user
      jest.spyOn(require('../../stores/authStore').useAuthStore, 'getState')
        .mockReturnValue(mockAuthStore);

      // Apply the interceptor
      const modifiedConfig = requestInterceptor(config);

      // 4. Verify the Authorization header is set
      // This would have been undefined if using wrong field name
      expect(modifiedConfig.headers.Authorization).toBe('Bearer valid-jwt-token');
      expect(modifiedConfig.headers.Authorization).not.toBe('Bearer undefined');
    });
  });
});