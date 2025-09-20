/**
 * Auth Context Mock Utilities
 * Basic auth state mocking
 */

interface MockUser {
  id: string;
  email: string;
  username: string;
  token: string;
}

const mockUser: MockUser = {
  id: '123',
  email: 'test@example.com',
  username: 'testuser',
  token: 'mock-jwt-token',
};

export const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: jest.fn(() => Promise.resolve(mockUser)),
  logout: jest.fn(),
  register: jest.fn(() => Promise.resolve(mockUser)),
};

export const mockUnauthenticatedContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
};

export const setMockAuthState = (state: Partial<typeof mockAuthContext>) => {
  Object.assign(mockAuthContext, state);
};

export const resetMockAuthState = () => {
  mockAuthContext.user = mockUser;
  mockAuthContext.isAuthenticated = true;
  mockAuthContext.isLoading = false;
  mockAuthContext.error = null;
};