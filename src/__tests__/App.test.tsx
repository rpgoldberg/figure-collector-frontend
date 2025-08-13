import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { render } from '../test-utils';
import App from '../App';
import { useAuthStore } from '../stores/authStore';
import { mockUser } from '../test-utils';
import theme from '../theme';

// Mock all page components
jest.mock('../pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-page">Dashboard</div>;
  };
});

jest.mock('../pages/FigureList', () => {
  return function MockFigureList() {
    return <div data-testid="figure-list-page">Figure List</div>;
  };
});

jest.mock('../pages/FigureDetail', () => {
  return function MockFigureDetail() {
    return <div data-testid="figure-detail-page">Figure Detail</div>;
  };
});

jest.mock('../pages/AddFigure', () => {
  return function MockAddFigure() {
    return <div data-testid="add-figure-page">Add Figure</div>;
  };
});

jest.mock('../pages/EditFigure', () => {
  return function MockEditFigure() {
    return <div data-testid="edit-figure-page">Edit Figure</div>;
  };
});

jest.mock('../pages/Search', () => {
  return function MockSearch() {
    return <div data-testid="search-page">Search</div>;
  };
});

jest.mock('../pages/Statistics', () => {
  return function MockStatistics() {
    return <div data-testid="statistics-page">Statistics</div>;
  };
});

jest.mock('../pages/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile-page">Profile</div>;
  };
});

jest.mock('../pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login</div>;
  };
});

jest.mock('../pages/Register', () => {
  return function MockRegister() {
    return <div data-testid="register-page">Register</div>;
  };
});

jest.mock('../pages/NotFound', () => {
  return function MockNotFound() {
    return <div data-testid="not-found-page">Not Found</div>;
  };
});

jest.mock('../components/Layout', () => {
  return function MockLayout() {
    const { Outlet } = require('react-router-dom');
    return (
      <div data-testid="layout">
        <div data-testid="layout-header">Layout Header</div>
        <Outlet />
      </div>
    );
  };
});

// Mock the auth store
jest.mock('../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Custom render function for routing tests
const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/'], ...options } = {}
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
    },
  });

  const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>
  );

  return render(ui, { wrapper: AllProviders, ...options });
};

describe('App Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      });
    });

    it('should render login page for unauthenticated users at root path', () => {
      renderWithRouter(<App />);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render login page at /login path', () => {
      renderWithRouter(<App />, { initialEntries: ['/login'] });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render register page at /register path', () => {
      renderWithRouter(<App />, { initialEntries: ['/register'] });

      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    it('should redirect unauthenticated users from protected routes to login', () => {
      renderWithRouter(<App />, { initialEntries: ['/figures'] });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('figure-list-page')).not.toBeInTheDocument();
    });

    it('should redirect from dashboard to login when not authenticated', () => {
      renderWithRouter(<App />, { initialEntries: ['/'] });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });
    });

    it('should render dashboard page at root path for authenticated users', () => {
      renderWithRouter(<App />);

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should render figures list page at /figures', () => {
      renderWithRouter(<App />, { initialEntries: ['/figures'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('figure-list-page')).toBeInTheDocument();
    });

    it('should render figure detail page at /figures/:id', () => {
      renderWithRouter(<App />, { initialEntries: ['/figures/123'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('figure-detail-page')).toBeInTheDocument();
    });

    it('should render add figure page at /figures/add', () => {
      renderWithRouter(<App />, { initialEntries: ['/figures/add'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('add-figure-page')).toBeInTheDocument();
    });

    it('should render edit figure page at /figures/edit/:id', () => {
      renderWithRouter(<App />, { initialEntries: ['/figures/edit/123'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('edit-figure-page')).toBeInTheDocument();
    });

    it('should render search page at /search', () => {
      renderWithRouter(<App />, { initialEntries: ['/search'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('search-page')).toBeInTheDocument();
    });

    it('should render statistics page at /statistics', () => {
      renderWithRouter(<App />, { initialEntries: ['/statistics'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('statistics-page')).toBeInTheDocument();
    });

    it('should render profile page at /profile', () => {
      renderWithRouter(<App />, { initialEntries: ['/profile'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('should render not found page for invalid routes', () => {
      renderWithRouter(<App />, { initialEntries: ['/invalid-route'] });

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute Component', () => {
    it('should render children when user is authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      renderWithRouter(<App />);

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      renderWithRouter(<App />, { initialEntries: ['/figures'] });

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('layout')).not.toBeInTheDocument();
    });

    it('should check authentication state on every render', () => {
      const mockStore = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      mockUseAuthStore.mockReturnValue(mockStore);

      renderWithRouter(<App />, { initialEntries: ['/figures'] });

      expect(mockUseAuthStore).toHaveBeenCalled();
      expect(screen.getByTestId('figure-list-page')).toBeInTheDocument();
    });
  });

  describe('Route Parameters', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });
    });

    it('should handle dynamic route parameters for figure detail', () => {
      const figureId = '507f1f77bcf86cd799439012';
      renderWithRouter(<App />, { initialEntries: [`/figures/${figureId}`] });

      expect(screen.getByTestId('figure-detail-page')).toBeInTheDocument();
    });

    it('should handle dynamic route parameters for edit figure', () => {
      const figureId = '507f1f77bcf86cd799439012';
      renderWithRouter(<App />, { initialEntries: [`/figures/edit/${figureId}`] });

      expect(screen.getByTestId('edit-figure-page')).toBeInTheDocument();
    });

    it('should handle special characters in route parameters', () => {
      const specialId = 'figure-with-dashes_and_underscores';
      renderWithRouter(<App />, { initialEntries: [`/figures/${specialId}`] });

      expect(screen.getByTestId('figure-detail-page')).toBeInTheDocument();
    });
  });

  describe('Nested Routes', () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });
    });

    it('should render layout wrapper for all protected routes', () => {
      const protectedRoutes = [
        '/',
        '/figures',
        '/figures/123',
        '/figures/add',
        '/figures/edit/123',
        '/search',
        '/statistics',
        '/profile',
      ];

      protectedRoutes.forEach(route => {
        renderWithRouter(<App />, { initialEntries: [route] });
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('layout-header')).toBeInTheDocument();
      });
    });

    it('should not render layout wrapper for public routes', () => {
      const publicRoutes = ['/login', '/register'];

      publicRoutes.forEach(route => {
        renderWithRouter(<App />, { initialEntries: [route] });
        expect(screen.queryByTestId('layout')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Changes', () => {
    it('should handle authentication state changes dynamically', async () => {
      let authState = {
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      mockUseAuthStore.mockReturnValue(authState);

      const { rerender } = renderWithRouter(<App />, { initialEntries: ['/figures'] });

      // Initially should show login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();

      // Update auth state
      authState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      mockUseAuthStore.mockReturnValue(authState);

      // Rerender with updated auth state
      rerender(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
        expect(screen.getByTestId('figure-list-page')).toBeInTheDocument();
      });
    });

    it('should redirect to login when user logs out', async () => {
      let authState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      mockUseAuthStore.mockReturnValue(authState);

      const { rerender } = renderWithRouter(<App />, { initialEntries: ['/figures'] });

      // Initially should show figures
      expect(screen.getByTestId('figure-list-page')).toBeInTheDocument();

      // Update auth state to logged out
      authState = {
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      mockUseAuthStore.mockReturnValue(authState);

      // Rerender with logged out state
      rerender(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('figure-list-page')).not.toBeInTheDocument();
      });
    });
  });

  describe('Route Guards', () => {
    it('should prevent access to authenticated-only routes when not logged in', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      const protectedRoutes = [
        '/',
        '/figures',
        '/figures/123',
        '/figures/add',
        '/figures/edit/123',
        '/search',
        '/statistics',
        '/profile',
      ];

      protectedRoutes.forEach(route => {
        renderWithRouter(<App />, { initialEntries: [route] });
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(screen.queryByTestId('layout')).not.toBeInTheDocument();
      });
    });

    it('should allow access to public routes regardless of authentication', () => {
      // Test when not authenticated
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      renderWithRouter(<App />, { initialEntries: ['/login'] });
      expect(screen.getByTestId('login-page')).toBeInTheDocument();

      renderWithRouter(<App />, { initialEntries: ['/register'] });
      expect(screen.getByTestId('register-page')).toBeInTheDocument();

      // Test when authenticated
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      renderWithRouter(<App />, { initialEntries: ['/login'] });
      expect(screen.getByTestId('login-page')).toBeInTheDocument();

      renderWithRouter(<App />, { initialEntries: ['/register'] });
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries and Edge Cases', () => {
    it('should handle invalid authentication state gracefully', () => {
      // Test with undefined auth state
      mockUseAuthStore.mockReturnValue({
        user: undefined as any,
        isAuthenticated: undefined as any,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      expect(() => {
        renderWithRouter(<App />);
      }).not.toThrow();
    });

    it('should handle malformed user object', () => {
      mockUseAuthStore.mockReturnValue({
        user: {} as any,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      expect(() => {
        renderWithRouter(<App />);
      }).not.toThrow();
    });

    it('should handle route navigation with special characters', () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      const specialRoutes = [
        '/figures/123-abc',
        '/figures/edit/test_figure',
        '/search?query=test%20search',
      ];

      specialRoutes.forEach(route => {
        expect(() => {
          renderWithRouter(<App />, { initialEntries: [route] });
        }).not.toThrow();
      });
    });

    it('should handle deeply nested invalid routes', () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      renderWithRouter(<App />, { initialEntries: ['/invalid/deeply/nested/route'] });
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause excessive re-renders on auth state checks', () => {
      const mockStore = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      mockUseAuthStore.mockReturnValue(mockStore);

      renderWithRouter(<App />);

      // Auth store should only be called a reasonable number of times
      expect(mockUseAuthStore).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid route changes', () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      });

      const routes = ['/', '/figures', '/search', '/statistics', '/profile'];

      routes.forEach(route => {
        expect(() => {
          renderWithRouter(<App />, { initialEntries: [route] });
        }).not.toThrow();
      });
    });
  });
});