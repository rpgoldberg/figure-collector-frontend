/**
 * Debug utility for authentication issues
 * This helps identify where JWT tokens are being lost or not attached
 */

import { useAuthStore } from '../stores/authStore';

export const debugAuth = {
  // Log current auth state
  logAuthState: () => {
    const state = useAuthStore.getState();
    console.log('[AUTH DEBUG] Current state:', {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      hasToken: !!state.user?.token,
      token: state.user?.token ? `${state.user.token.substring(0, 10)}...` : 'none',
      username: state.user?.username || 'none'
    });

    // Check localStorage
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('[AUTH DEBUG] LocalStorage:', {
          hasState: !!parsed.state,
          hasUser: !!parsed.state?.user,
          hasToken: !!parsed.state?.user?.token,
        });
      } catch (e) {
        console.log('[AUTH DEBUG] LocalStorage parse error:', e);
      }
    } else {
      console.log('[AUTH DEBUG] No auth-storage in localStorage');
    }
  },

  // Log axios interceptor activity
  setupInterceptorLogging: () => {
    console.log('[AUTH DEBUG] Setting up interceptor logging');

    // We'll log from the existing interceptor
    const originalLog = console.log;
    console.log = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Bearer')) {
        originalLog('[AUTH DEBUG] Authorization header detected:', args);
      }
      originalLog.apply(console, args);
    };
  },

  // Test API call with auth
  testAuthenticatedCall: async () => {
    console.log('[AUTH DEBUG] Testing authenticated API call');
    debugAuth.logAuthState();

    try {
      const response = await fetch('/api/figures', {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().user?.token || 'NO_TOKEN'}`
        }
      });

      console.log('[AUTH DEBUG] Test call response:', {
        status: response.status,
        statusText: response.statusText,
        headers: {
          contentType: response.headers.get('content-type'),
        }
      });

      if (response.status === 401) {
        console.log('[AUTH DEBUG] Got 401 - token likely invalid or missing');
        const text = await response.text();
        console.log('[AUTH DEBUG] Error response:', text);
      }
    } catch (error) {
      console.log('[AUTH DEBUG] Test call error:', error);
    }
  },

  // Monitor auth state changes
  subscribeToAuthChanges: () => {
    console.log('[AUTH DEBUG] Subscribing to auth state changes');

    return useAuthStore.subscribe((state) => {
      console.log('[AUTH DEBUG] Auth state changed:', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user,
        hasToken: !!state.user?.token,
        timestamp: new Date().toISOString()
      });
    });
  }
};

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  // Make debugAuth globally available
  (window as any).debugAuth = debugAuth;
  console.log('[AUTH DEBUG] Debug utilities available at window.debugAuth');
}