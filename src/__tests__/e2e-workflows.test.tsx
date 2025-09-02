import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import App from '../App';
import theme from '../theme';
import { mockUser, mockFigure } from '../test-utils';

// Mock API responses
const mockApiResponses = {
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  getFigures: jest.fn(),
  getFigureById: jest.fn(),
  createFigure: jest.fn(),
  updateFigure: jest.fn(),
  deleteFigure: jest.fn(),
  searchFigures: jest.fn(),
  filterFigures: jest.fn(),
  getFigureStats: jest.fn(),
};

// Mock the API module
jest.mock('../api', () => mockApiResponses);

// Mock auth store
let mockAuthState = {
  user: null,
  isAuthenticated: false,
  setUser: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../stores/authStore', () => ({
  useAuthStore: () => mockAuthState,
}));

// Mock console methods to reduce noise
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
};

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

// Custom render function for E2E tests
const renderApp = (initialEntries: string[] = ['/']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false },
    },
  });

  return {
    user: userEvent.setup(),
    ...screen,
    ...require('@testing-library/react').render(
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>
    ),
  };
};

describe('End-to-End User Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth state
    mockAuthState = {
      user: null,
      isAuthenticated: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    };
    
    // Mock fetch for MFC scraping
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    });
  });

  describe('User Authentication Flow', () => {
    it('should complete full login workflow', async () => {
      const { user } = renderApp(['/']);

      // Should start on login page when not authenticated
      expect(screen.getByText('FigureCollector')).toBeInTheDocument();
      expect(screen.getByText('Sign in to manage your collection')).toBeInTheDocument();

      // Fill login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Mock successful login
      mockApiResponses.loginUser.mockResolvedValueOnce(mockUser);
      
      // Mock auth state update after login
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      await user.click(submitButton);

      // Should be called with correct credentials
      expect(mockApiResponses.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');

      // After login, should redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle login errors gracefully', async () => {
      const { user } = renderApp(['/']);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      // Mock login failure
      mockApiResponses.loginUser.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid credentials' },
        },
      });

      await user.click(submitButton);

      // Should stay on login page and show error
      expect(screen.getByText('FigureCollector')).toBeInTheDocument();
      // Error would be shown via toast (tested in component tests)
    });

    it('should complete registration workflow', async () => {
      const { user } = renderApp(['/register']);

      expect(screen.getByText('Create Account')).toBeInTheDocument();

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      mockApiResponses.registerUser.mockResolvedValueOnce(mockUser);

      await user.click(submitButton);

      expect(mockApiResponses.registerUser).toHaveBeenCalledWith(
        'newuser',
        'newuser@example.com',
        'password123'
      );
    });

    it('should handle logout workflow', async () => {
      // Start authenticated
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      const { user } = renderApp(['/']);

      // Should be on dashboard
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Click user menu and logout
      const userMenu = screen.getByRole('button', { name: /user menu/i });
      await user.click(userMenu);

      const logoutButton = screen.getByRole('menuitem', { name: /sign out/i });
      await user.click(logoutButton);

      expect(mockAuthState.logout).toHaveBeenCalled();

      // Should redirect to login
      mockAuthState.isAuthenticated = false;
      mockAuthState.user = null;

      await waitFor(() => {
        expect(screen.getByText('Sign in to manage your collection')).toBeInTheDocument();
      });
    });
  });

  describe('Figure Management Workflow', () => {
    beforeEach(() => {
      // Start authenticated
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      // Mock API responses
      mockApiResponses.getFigures.mockResolvedValue({
        success: true,
        data: [],
        total: 0,
        page: 1,
        pages: 0,
        count: 0,
      });

      mockApiResponses.getFigureStats.mockResolvedValue({
        totalCount: 0,
        manufacturerStats: [],
        scaleStats: [],
        locationStats: [],
      });
    });

    it('should complete add new figure workflow', async () => {
      const { user } = renderApp(['/']);

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Should show empty collection state
      expect(screen.getByText("You haven't added any figures yet.")).toBeInTheDocument();

      // Click add first figure button
      const addFirstFigureButton = screen.getByRole('link', { name: /add your first figure/i });
      await user.click(addFirstFigureButton);

      // Should navigate to add figure page
      await waitFor(() => {
        expect(screen.getByText('Add New Figure')).toBeInTheDocument();
      });

      // Fill out figure form
      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      const nameInput = screen.getByLabelText(/figure name/i);
      const scaleInput = screen.getByLabelText(/scale/i);
      const locationInput = screen.getByLabelText(/storage location/i);
      const addFigureButton = screen.getByRole('button', { name: /add figure/i });

      await user.type(manufacturerInput, 'Good Smile Company');
      await user.type(nameInput, 'Nendoroid Miku');
      await user.type(scaleInput, 'Nendoroid');
      await user.type(locationInput, 'Display Case A');

      // Mock successful creation
      const newFigure = {
        ...mockFigure,
        manufacturer: 'Good Smile Company',
        name: 'Nendoroid Miku',
        scale: 'Nendoroid',
        location: 'Display Case A',
      };

      mockApiResponses.createFigure.mockResolvedValueOnce(newFigure);

      await user.click(addFigureButton);

      expect(mockApiResponses.createFigure).toHaveBeenCalledWith({
        manufacturer: 'Good Smile Company',
        name: 'Nendoroid Miku',
        scale: 'Nendoroid',
        mfcLink: '',
        location: 'Display Case A',
        boxNumber: '',
        imageUrl: '',
      });

      // Should redirect back to figures list or show success
      // This would depend on the specific implementation
    });

    it('should complete figure editing workflow', async () => {
      // Mock figure data
      const existingFigure = {
        ...mockFigure,
        name: 'Original Figure Name',
        manufacturer: 'Original Manufacturer',
      };

      mockApiResponses.getFigureById.mockResolvedValueOnce(existingFigure);
      mockApiResponses.updateFigure.mockResolvedValueOnce({
        ...existingFigure,
        name: 'Updated Figure Name',
      });

      const { user } = renderApp([`/figures/edit/${mockFigure._id}`]);

      // Wait for form to load with existing data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Original Figure Name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Original Manufacturer')).toBeInTheDocument();
      });

      // Edit the figure name
      const nameInput = screen.getByLabelText(/figure name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Figure Name');

      const updateButton = screen.getByRole('button', { name: /update figure/i });
      await user.click(updateButton);

      expect(mockApiResponses.updateFigure).toHaveBeenCalledWith(
        mockFigure._id,
        expect.objectContaining({
          name: 'Updated Figure Name',
          manufacturer: 'Original Manufacturer',
        })
      );
    });

    it('should complete figure deletion workflow', async () => {
      // Mock figure data
      const figureToDelete = mockFigure;

      mockApiResponses.getFigures.mockResolvedValueOnce({
        success: true,
        data: [figureToDelete],
        total: 1,
        page: 1,
        pages: 1,
        count: 1,
      });

      const { user } = renderApp(['/figures']);

      // Wait for figures to load
      await waitFor(() => {
        expect(screen.getByText(figureToDelete.name)).toBeInTheDocument();
      });

      // Find delete button on figure card
      const deleteButton = screen.getByRole('button', { name: /delete figure/i });

      // Mock window.confirm to return true
      window.confirm = jest.fn().mockReturnValue(true);

      mockApiResponses.deleteFigure.mockResolvedValueOnce(undefined);

      await user.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith(
        `Are you sure you want to delete ${figureToDelete.name}?`
      );
      expect(mockApiResponses.deleteFigure).toHaveBeenCalledWith(figureToDelete._id);
    });
  });

  describe('Search and Filter Workflow', () => {
    beforeEach(() => {
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      const searchResults = [
        { ...mockFigure, _id: '1', name: 'Miku Figure' },
        { ...mockFigure, _id: '2', name: 'Luka Figure' },
      ];

      mockApiResponses.searchFigures.mockResolvedValue(searchResults);
      mockApiResponses.filterFigures.mockResolvedValue({
        success: true,
        data: searchResults,
        total: 2,
        page: 1,
        pages: 1,
        count: 2,
      });

      mockApiResponses.getFigures.mockResolvedValue({
        success: true,
        data: searchResults,
        total: 2,
        page: 1,
        pages: 1,
        count: 2,
      });

      mockApiResponses.getFigureStats.mockResolvedValue({
        totalCount: 2,
        manufacturerStats: [{ _id: 'Good Smile Company', count: 2 }],
        scaleStats: [{ _id: '1/8', count: 2 }],
        locationStats: [{ _id: 'Display Case A', count: 2 }],
      });
    });

    it('should complete search workflow from dashboard', async () => {
      const { user } = renderApp(['/']);

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Use search bar on dashboard
      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'Miku');

      // This would trigger navigation to search page with query
      // The actual implementation might vary based on search behavior
    });

    it('should complete search workflow from search page', async () => {
      const { user } = renderApp(['/search']);

      // Wait for search page to load
      await waitFor(() => {
        expect(screen.getByText('Search Figures')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('searchbox');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(searchInput, 'Miku');
      await user.click(searchButton);

      expect(mockApiResponses.searchFigures).toHaveBeenCalledWith('Miku');

      // Should show search results
      await waitFor(() => {
        expect(screen.getByText('Miku Figure')).toBeInTheDocument();
        expect(screen.getByText('Luka Figure')).toBeInTheDocument();
      });
    });

    it('should complete filter workflow', async () => {
      const { user } = renderApp(['/figures']);

      // Wait for figures page to load
      await waitFor(() => {
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
      });

      // Use filter controls
      const manufacturerFilter = screen.getByLabelText(/manufacturer/i);
      const scaleFilter = screen.getByLabelText(/scale/i);
      const applyFiltersButton = screen.getByRole('button', { name: /apply filters/i });

      await user.type(manufacturerFilter, 'Good Smile Company');
      await user.type(scaleFilter, '1/8');
      await user.click(applyFiltersButton);

      expect(mockApiResponses.filterFigures).toHaveBeenCalledWith(
        expect.objectContaining({
          manufacturer: 'Good Smile Company',
          scale: '1/8',
        })
      );

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 2 figures')).toBeInTheDocument();
      });
    });

    it('should clear filters workflow', async () => {
      const { user } = renderApp(['/figures']);

      // Apply filters first
      const manufacturerFilter = screen.getByLabelText(/manufacturer/i);
      const applyFiltersButton = screen.getByRole('button', { name: /apply filters/i });

      await user.type(manufacturerFilter, 'Test Manufacturer');
      await user.click(applyFiltersButton);

      // Clear filters
      const clearFiltersButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearFiltersButton);

      // Should reset to unfiltered view
      expect(mockApiResponses.getFigures).toHaveBeenCalled();
    });
  });

  describe('Pagination Workflow', () => {
    beforeEach(() => {
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      const multiPageResponse = {
        success: true,
        data: Array.from({ length: 12 }, (_, i) => ({
          ...mockFigure,
          _id: `figure-${i}`,
          name: `Figure ${i + 1}`,
        })),
        total: 50,
        page: 1,
        pages: 5,
        count: 12,
      };

      mockApiResponses.getFigures.mockResolvedValue(multiPageResponse);
      mockApiResponses.getFigureStats.mockResolvedValue({
        totalCount: 50,
        manufacturerStats: [{ _id: 'Good Smile Company', count: 50 }],
        scaleStats: [{ _id: '1/8', count: 50 }],
        locationStats: [{ _id: 'Display Case A', count: 50 }],
      });
    });

    it('should navigate between pages', async () => {
      const { user } = renderApp(['/figures']);

      // Wait for figures to load
      await waitFor(() => {
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
        expect(screen.getByText('Showing 12 of 50 figures')).toBeInTheDocument();
      });

      // Navigate to next page
      const nextPageButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextPageButton);

      expect(mockApiResponses.getFigures).toHaveBeenLastCalledWith(2, 12);

      // Navigate to specific page
      const page3Button = screen.getByRole('button', { name: '3' });
      await user.click(page3Button);

      expect(mockApiResponses.getFigures).toHaveBeenLastCalledWith(3, 12);
    });
  });

  describe('MFC Integration Workflow', () => {
    beforeEach(() => {
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      // Mock successful MFC scraping
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            manufacturer: 'Good Smile Company',
            name: 'Nendoroid Miku Hatsune',
            scale: 'Nendoroid',
            imageUrl: 'https://mfc.example.com/image.jpg',
          },
        }),
      });
    });

    it('should complete MFC auto-population workflow', async () => {
      const { user } = renderApp(['/figures/add']);

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText('Add New Figure')).toBeInTheDocument();
      });

      // Enter MFC link
      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123456');

      // Wait for auto-population (with debounce)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/figures/scrape-mfc',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mfcLink: 'https://myfigurecollection.net/item/123456',
            }),
          })
        );
      }, { timeout: 3000 });

      // Fields should be auto-populated
      await waitFor(() => {
        expect(screen.getByDisplayValue('Good Smile Company')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Nendoroid Miku Hatsune')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Nendoroid')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://mfc.example.com/image.jpg')).toBeInTheDocument();
      });
    });

    it('should handle MFC scraping failure gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const { user } = renderApp(['/figures/add']);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123456');

      // Should handle error gracefully (error would be shown via toast)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Form should still be usable
      expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/figure name/i)).toBeInTheDocument();
    });
  });

  describe('Statistics Workflow', () => {
    beforeEach(() => {
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      mockApiResponses.getFigureStats.mockResolvedValue({
        totalCount: 25,
        manufacturerStats: [
          { _id: 'Good Smile Company', count: 10 },
          { _id: 'ALTER', count: 8 },
          { _id: 'Kotobukiya', count: 7 },
        ],
        scaleStats: [
          { _id: '1/8', count: 15 },
          { _id: '1/7', count: 8 },
          { _id: 'Nendoroid', count: 2 },
        ],
        locationStats: [
          { _id: 'Display Case A', count: 12 },
          { _id: 'Display Case B', count: 8 },
          { _id: 'Storage', count: 5 },
        ],
      });
    });

    it('should display comprehensive statistics', async () => {
      const { user } = renderApp(['/statistics']);

      // Wait for statistics to load
      await waitFor(() => {
        expect(screen.getByText('Collection Statistics')).toBeInTheDocument();
      });

      // Check total count
      expect(screen.getByText('25')).toBeInTheDocument();

      // Check manufacturer breakdown
      expect(screen.getByText('Good Smile Company')).toBeInTheDocument();
      expect(screen.getByText('ALTER')).toBeInTheDocument();
      expect(screen.getByText('Kotobukiya')).toBeInTheDocument();

      // Check scale breakdown
      expect(screen.getByText('1/8')).toBeInTheDocument();
      expect(screen.getByText('1/7')).toBeInTheDocument();
      expect(screen.getByText('Nendoroid')).toBeInTheDocument();

      // Check location breakdown
      expect(screen.getByText('Display Case A')).toBeInTheDocument();
      expect(screen.getByText('Display Case B')).toBeInTheDocument();
      expect(screen.getByText('Storage')).toBeInTheDocument();
    });

    it('should navigate from dashboard stats to detailed statistics', async () => {
      const { user } = renderApp(['/']);

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Click view all statistics link
      const viewStatsLink = screen.getByRole('link', { name: /view all statistics/i });
      await user.click(viewStatsLink);

      // Should navigate to statistics page
      await waitFor(() => {
        expect(screen.getByText('Collection Statistics')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Workflow', () => {
    beforeEach(() => {
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      // Mock default responses
      mockApiResponses.getFigures.mockResolvedValue({
        success: true,
        data: [],
        total: 0,
        page: 1,
        pages: 0,
        count: 0,
      });

      mockApiResponses.getFigureStats.mockResolvedValue({
        totalCount: 0,
        manufacturerStats: [],
        scaleStats: [],
        locationStats: [],
      });
    });

    it('should navigate through all main sections', async () => {
      const { user } = renderApp(['/']);

      // Start on dashboard
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Navigate to figures
      const figuresLink = screen.getByRole('link', { name: /figures/i });
      await user.click(figuresLink);

      await waitFor(() => {
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
      });

      // Navigate to search
      const searchLink = screen.getByRole('link', { name: /search/i });
      await user.click(searchLink);

      await waitFor(() => {
        expect(screen.getByText('Search Figures')).toBeInTheDocument();
      });

      // Navigate to statistics
      const statisticsLink = screen.getByRole('link', { name: /statistics/i });
      await user.click(statisticsLink);

      await waitFor(() => {
        expect(screen.getByText('Collection Statistics')).toBeInTheDocument();
      });

      // Navigate back to dashboard
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      await user.click(dashboardLink);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    it('should handle direct URL navigation', async () => {
      // Navigate directly to figures page
      const { user } = renderApp(['/figures']);

      await waitFor(() => {
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
      });

      // Should have proper layout
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Navbar
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar
    });

    it('should handle 404 pages', async () => {
      const { user } = renderApp(['/non-existent-page']);

      await waitFor(() => {
        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Workflows', () => {
    beforeEach(() => {
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };
    });

    it('should handle API errors and allow retry', async () => {
      // Mock API failure
      mockApiResponses.getFigures.mockRejectedValueOnce(new Error('Network error'));

      const { user } = renderApp(['/figures']);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Error loading figures')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      // Mock successful retry
      mockApiResponses.getFigures.mockResolvedValueOnce({
        success: true,
        data: [mockFigure],
        total: 1,
        page: 1,
        pages: 1,
        count: 1,
      });

      // Click retry button
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Should recover from error
      await waitFor(() => {
        expect(screen.getByText(mockFigure.name)).toBeInTheDocument();
      });
    });

    it('should handle form validation errors', async () => {
      const { user } = renderApp(['/figures/add']);

      // Try to submit empty form
      const addFigureButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(addFigureButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/manufacturer is required/i)).toBeInTheDocument();
        expect(screen.getByText(/figure name is required/i)).toBeInTheDocument();
      });

      // Fix errors and submit again
      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      const nameInput = screen.getByLabelText(/figure name/i);

      await user.type(manufacturerInput, 'Test Manufacturer');
      await user.type(nameInput, 'Test Figure');

      mockApiResponses.createFigure.mockResolvedValueOnce(mockFigure);

      await user.click(addFigureButton);

      // Should successfully submit
      expect(mockApiResponses.createFigure).toHaveBeenCalled();
    });
  });

  describe('Mobile Responsive Workflows', () => {
    beforeEach(() => {
      mockAuthState = {
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: jest.fn(),
      };

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockApiResponses.getFigures.mockResolvedValue({
        success: true,
        data: [mockFigure],
        total: 1,
        page: 1,
        pages: 1,
        count: 1,
      });

      mockApiResponses.getFigureStats.mockResolvedValue({
        totalCount: 1,
        manufacturerStats: [{ _id: 'Test Manufacturer', count: 1 }],
        scaleStats: [{ _id: '1/8', count: 1 }],
        locationStats: [{ _id: 'Display Case A', count: 1 }],
      });
    });

    it('should work properly on mobile viewports', async () => {
      const { user } = renderApp(['/']);

      // Should render dashboard properly on mobile
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Navigation should work
      const figuresLink = screen.getByRole('link', { name: /figures/i });
      await user.click(figuresLink);

      await waitFor(() => {
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
      });

      // Figure cards should be displayed (even if stacked on mobile)
      expect(screen.getByText(mockFigure.name)).toBeInTheDocument();
    });
  });
});