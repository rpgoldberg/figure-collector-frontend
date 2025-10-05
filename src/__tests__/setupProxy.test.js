/**
 * Tests for setupProxy middleware configuration
 *
 * This file tests the proxy configuration for:
 * - /api requests (with path rewrite)
 * - /register-frontend requests
 * - /version requests
 */

// Mock http-proxy-middleware BEFORE importing setupProxy
// Use factory function to ensure mock is properly hoisted
jest.mock('http-proxy-middleware', () => {
  const mockMiddleware = jest.fn();
  const mockCreateProxyMiddleware = jest.fn(() => mockMiddleware);

  return {
    createProxyMiddleware: mockCreateProxyMiddleware,
    __mockMiddleware: mockMiddleware,
    __mockCreateProxyMiddleware: mockCreateProxyMiddleware
  };
});

// Now import setupProxy after the mock is set up
const setupProxy = require('../setupProxy');
const { __mockMiddleware: mockMiddleware, __mockCreateProxyMiddleware: mockCreateProxyMiddleware } = require('http-proxy-middleware');

describe('setupProxy', () => {
  let mockApp;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock Express app
    mockApp = {
      use: jest.fn()
    };

    // Call setupProxy with the mock app
    setupProxy(mockApp);
  });

  describe('Proxy Configuration', () => {
    it('should configure /api proxy with path rewrite', () => {
      // Verify app.use was called with /api path
      const apiCall = mockApp.use.mock.calls.find(call => call[0] === '/api');
      expect(apiCall).toBeDefined();
      expect(apiCall[0]).toBe('/api');

      // Verify createProxyMiddleware was called with correct config for /api
      expect(mockCreateProxyMiddleware).toHaveBeenCalledWith({
        target: 'http://backend:5070',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      });
    });

    it('should configure /register-frontend proxy', () => {
      // Verify app.use was called with /register-frontend path
      const registerCall = mockApp.use.mock.calls.find(call => call[0] === '/register-frontend');
      expect(registerCall).toBeDefined();
      expect(registerCall[0]).toBe('/register-frontend');

      // Verify createProxyMiddleware was called with correct config
      expect(mockCreateProxyMiddleware).toHaveBeenCalledWith({
        target: 'http://backend:5070',
        changeOrigin: true
      });
    });

    it('should configure /version proxy', () => {
      // Verify app.use was called with /version path
      const versionCall = mockApp.use.mock.calls.find(call => call[0] === '/version');
      expect(versionCall).toBeDefined();
      expect(versionCall[0]).toBe('/version');

      // Verify createProxyMiddleware was called with correct config
      expect(mockCreateProxyMiddleware).toHaveBeenCalledWith({
        target: 'http://backend:5070',
        changeOrigin: true
      });
    });

    it('should call app.use exactly 3 times for all proxies', () => {
      expect(mockApp.use).toHaveBeenCalledTimes(3);
    });

    it('should call createProxyMiddleware exactly 3 times', () => {
      expect(mockCreateProxyMiddleware).toHaveBeenCalledTimes(3);
    });
  });

  describe('Proxy Paths', () => {
    it('should configure proxies in correct order: /api, /register-frontend, /version', () => {
      const calls = mockApp.use.mock.calls;
      expect(calls[0][0]).toBe('/api');
      expect(calls[1][0]).toBe('/register-frontend');
      expect(calls[2][0]).toBe('/version');
    });
  });

  describe('Target Configuration', () => {
    it('should use backend:5070 as target for all proxies', () => {
      const calls = mockCreateProxyMiddleware.mock.calls;

      expect(calls[0][0].target).toBe('http://backend:5070');
      expect(calls[1][0].target).toBe('http://backend:5070');
      expect(calls[2][0].target).toBe('http://backend:5070');
    });

    it('should enable changeOrigin for all proxies', () => {
      const calls = mockCreateProxyMiddleware.mock.calls;

      expect(calls[0][0].changeOrigin).toBe(true);
      expect(calls[1][0].changeOrigin).toBe(true);
      expect(calls[2][0].changeOrigin).toBe(true);
    });
  });

  describe('Path Rewrite Configuration', () => {
    it('should configure path rewrite only for /api proxy', () => {
      const calls = mockCreateProxyMiddleware.mock.calls;

      // /api should have pathRewrite
      expect(calls[0][0].pathRewrite).toEqual({
        '^/api': ''
      });

      // /register-frontend should not have pathRewrite
      expect(calls[1][0].pathRewrite).toBeUndefined();

      // /version should not have pathRewrite
      expect(calls[2][0].pathRewrite).toBeUndefined();
    });
  });
});
