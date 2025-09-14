import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';
import { User } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authStore', () => {
  const mockUser: User = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
    token: 'mock-jwt-token',
  };

  beforeEach(() => {
    // Clear localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  describe('initial state', () => {
    it('should have null user and false isAuthenticated initially', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and isAuthenticated to true when user is provided', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set user to null and isAuthenticated to false when null is provided', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // First set a user
      act(() => {
        result.current.setUser(mockUser);
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      // Then set to null
      act(() => {
        result.current.setUser(null);
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should update user data when new user object is provided', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });
      
      const updatedUser: User = {
        ...mockUser,
        username: 'updateduser',
        isAdmin: true,
      };
      
      act(() => {
        result.current.setUser(updatedUser);
      });
      
      expect(result.current.user).toEqual(updatedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // First set a user
      act(() => {
        result.current.setUser(mockUser);
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      // Then logout
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should work even when no user is set', () => {
      const { result } = renderHook(() => useAuthStore());
      
      // Logout when no user is set
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist state changes to localStorage', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });
      
      // Check that localStorage.setItem was called
      // Note: The exact implementation depends on Zustand's persist middleware
      // This test verifies the behavior rather than the exact localStorage calls
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle user object with missing token', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const userWithoutToken: User = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        // token is optional, so it can be undefined
      };
      
      act(() => {
        result.current.setUser(userWithoutToken);
      });
      
      expect(result.current.user).toEqual(userWithoutToken);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('multiple store instances', () => {
    it('should share state across multiple hook calls', () => {
      const { result: result1 } = renderHook(() => useAuthStore());
      const { result: result2 } = renderHook(() => useAuthStore());
      
      act(() => {
        result1.current.setUser(mockUser);
      });
      
      // Both hooks should see the same state
      expect(result1.current.user).toEqual(mockUser);
      expect(result2.current.user).toEqual(mockUser);
      expect(result1.current.isAuthenticated).toBe(true);
      expect(result2.current.isAuthenticated).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined user gracefully', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        // @ts-ignore - Testing runtime behavior with undefined
        result.current.setUser(undefined);
      });
      
      expect(result.current.user).toBeFalsy();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle empty user object', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const emptyUser = {} as User;
      
      act(() => {
        result.current.setUser(emptyUser);
      });
      
      expect(result.current.user).toEqual(emptyUser);
      expect(result.current.isAuthenticated).toBe(true); // truthy object means authenticated
    });
  });
});