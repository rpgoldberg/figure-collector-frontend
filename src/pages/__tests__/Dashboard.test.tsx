import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockFigure, mockStatsData } from '../../test-utils';
import Dashboard from '../Dashboard';
import * as api from '../../api';

// Mock API
jest.mock('../../api');
const mockApi = api as jest.Mocked<typeof api>;

// Mock child components
jest.mock('../../components/FigureCard', () => {
  return function MockFigureCard({ figure }: any) {
    return <div data-testid={`figure-card-${figure._id}`}>{figure.name}</div>;
  };
});

jest.mock('../../components/SearchBar', () => {
  return function MockSearchBar({ onSearch, placeholder }: any) {
    return (
      <div data-testid="search-bar">
        <input 
          placeholder={placeholder}
          onChange={(e) => onSearch(e.target.value)}
          data-testid="search-input"
        />
      </div>
    );
  };
});

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

describe('Dashboard', () => {
  const mockFiguresData = {
    success: true,
    count: 4,
    page: 1,
    pages: 1,
    total: 4,
    data: [
      { ...mockFigure, _id: '1', name: 'Recent Figure 1' },
      { ...mockFigure, _id: '2', name: 'Recent Figure 2' },
      { ...mockFigure, _id: '3', name: 'Recent Figure 3' },
      { ...mockFigure, _id: '4', name: 'Recent Figure 4' },
    ],
  };

  const mockEmptyFiguresData = {
    success: true,
    count: 0,
    page: 1,
    pages: 0,
    total: 0,
    data: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getFigures.mockResolvedValue(mockFiguresData);
    mockApi.getFigureStats.mockResolvedValue(mockStatsData);
  });

  describe('component rendering', () => {
    it('should render dashboard header', async () => {
      render(<Dashboard />);

      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should render search bar with correct placeholder', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        const searchInput = screen.getByTestId('search-input');
        expect(searchInput).toHaveAttribute('placeholder', 'Search your entire collection...');
      });
    });

    it('should render statistics cards', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Total Figures')).toBeInTheDocument();
        expect(screen.getByText('Manufacturers')).toBeInTheDocument();
        expect(screen.getByText('Scales')).toBeInTheDocument();
        expect(screen.getByText('Locations')).toBeInTheDocument();
      });
    });

    it('should render recent figures section', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Recent Figures')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument();
      });
    });

    it('should render top manufacturers section', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Top Manufacturers')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /view all statistics/i })).toBeInTheDocument();
      });
    });
  });

  describe('statistics display', () => {
    it('should display correct statistics from API data', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // Total figures
        expect(screen.getByText('3')).toBeInTheDocument(); // Number of manufacturers
        expect(screen.getByText('3')).toBeInTheDocument(); // Number of scales
        expect(screen.getByText('3')).toBeInTheDocument(); // Number of locations
      });
    });

    it('should display statistics descriptions', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('In your collection')).toBeInTheDocument();
        expect(screen.getByText('Different brands')).toBeInTheDocument();
        expect(screen.getByText('Different sizes')).toBeInTheDocument();
        expect(screen.getByText('Storage areas')).toBeInTheDocument();
      });
    });

    it('should show zero statistics when no data available', async () => {
      mockApi.getFigureStats.mockResolvedValue(undefined as any);
      
      render(<Dashboard />);

      await waitFor(() => {
        const statsNumbers = screen.getAllByText('0');
        expect(statsNumbers.length).toBeGreaterThan(0);
      });
    });

    it('should display top manufacturers data', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Good Smile Company')).toBeInTheDocument();
        expect(screen.getByText('ALTER')).toBeInTheDocument();
        expect(screen.getByText('Kotobukiya')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument(); // GSC count
        expect(screen.getByText('2')).toBeInTheDocument(); // Kotobukiya count
      });
    });

    it('should limit manufacturer display to top 5', async () => {
      const extendedStatsData = {
        ...mockStatsData,
        manufacturerStats: [
          { _id: 'Manufacturer 1', count: 10 },
          { _id: 'Manufacturer 2', count: 9 },
          { _id: 'Manufacturer 3', count: 8 },
          { _id: 'Manufacturer 4', count: 7 },
          { _id: 'Manufacturer 5', count: 6 },
          { _id: 'Manufacturer 6', count: 5 },
          { _id: 'Manufacturer 7', count: 4 },
        ],
      };

      mockApi.getFigureStats.mockResolvedValue(extendedStatsData);
      
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Manufacturer 1')).toBeInTheDocument();
        expect(screen.getByText('Manufacturer 5')).toBeInTheDocument();
        expect(screen.queryByText('Manufacturer 6')).not.toBeInTheDocument();
        expect(screen.queryByText('Manufacturer 7')).not.toBeInTheDocument();
      });
    });

    it('should handle empty manufacturer stats', async () => {
      const emptyStatsData = {
        ...mockStatsData,
        manufacturerStats: [],
      };

      mockApi.getFigureStats.mockResolvedValue(emptyStatsData);
      
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('No manufacturer data available.')).toBeInTheDocument();
      });
    });
  });

  describe('recent figures display', () => {
    it('should render recent figures when data is available', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('figure-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('figure-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('figure-card-3')).toBeInTheDocument();
        expect(screen.getByTestId('figure-card-4')).toBeInTheDocument();
      });
    });

    it('should show empty state when no figures exist', async () => {
      mockApi.getFigures.mockResolvedValue(mockEmptyFiguresData);
      
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("You haven't added any figures yet.")).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /add your first figure/i })).toBeInTheDocument();
      });
    });

    it('should have correct link to view all figures', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        const viewAllLink = screen.getByRole('link', { name: /view all/i });
        expect(viewAllLink).toHaveAttribute('href', '/figures');
      });
    });

    it('should have correct link to add first figure', async () => {
      mockApi.getFigures.mockResolvedValue(mockEmptyFiguresData);
      
      render(<Dashboard />);

      await waitFor(() => {
        const addFirstFigureLink = screen.getByRole('link', { name: /add your first figure/i });
        expect(addFirstFigureLink).toHaveAttribute('href', '/figures/add');
      });
    });

    it('should have correct link to view statistics', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        const statsLink = screen.getByRole('link', { name: /view all statistics/i });
        expect(statsLink).toHaveAttribute('href', '/statistics');
      });
    });
  });

  describe('search functionality', () => {
    it('should handle search input and navigate to search page', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      const searchInput = await screen.findByTestId('search-input');
      await user.type(searchInput, 'test query');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search?q=test%20query');
      });
    });

    it('should encode search query properly', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      const searchInput = await screen.findByTestId('search-input');
      await user.type(searchInput, 'search with spaces & symbols');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/search?q=search%20with%20spaces%20%26%20symbols');
      });
    });

    it('should handle empty search query', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);

      const searchInput = await screen.findByTestId('search-input');
      await user.type(searchInput, '');

      // Should not navigate for empty query
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('API data loading', () => {
    it('should fetch figures data with correct parameters', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(mockApi.getFigures).toHaveBeenCalledWith(1, 4);
      });
    });

    it('should fetch stats data', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(mockApi.getFigureStats).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      mockApi.getFigures.mockRejectedValue(new Error('API Error'));
      mockApi.getFigureStats.mockRejectedValue(new Error('Stats Error'));
      
      render(<Dashboard />);

      // Component should render without crashing
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should display fallback values when API data is undefined', async () => {
      mockApi.getFigures.mockResolvedValue(undefined as any);
      mockApi.getFigureStats.mockResolvedValue(undefined as any);
      
      render(<Dashboard />);

      await waitFor(() => {
        // Should show zero values for stats
        const zeroValues = screen.getAllByText('0');
        expect(zeroValues.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('responsive layout', () => {
    it('should render statistics grid', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        // All stat cards should be present
        expect(screen.getByText('Total Figures')).toBeInTheDocument();
        expect(screen.getByText('Manufacturers')).toBeInTheDocument();
        expect(screen.getByText('Scales')).toBeInTheDocument();
        expect(screen.getByText('Locations')).toBeInTheDocument();
      });
    });

    it('should render two-column layout for main content', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Recent Figures')).toBeInTheDocument();
        expect(screen.getByText('Top Manufacturers')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      });
    });

    it('should have accessible statistics cards', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        // Statistics should be readable
        expect(screen.getByText('Total Figures')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('In your collection')).toBeInTheDocument();
      });
    });

    it('should have accessible navigation links', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /view all statistics/i })).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    it('should handle loading states gracefully', () => {
      mockApi.getFigures.mockImplementation(() => new Promise(() => {}));
      mockApi.getFigureStats.mockImplementation(() => new Promise(() => {}));
      
      render(<Dashboard />);

      // Component should render without data
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    });

    it('should show default values while loading stats', () => {
      mockApi.getFigureStats.mockImplementation(() => new Promise(() => {}));
      
      render(<Dashboard />);

      // Should show 0 for stats while loading
      expect(screen.getByText('Total Figures')).toBeInTheDocument();
    });
  });

  describe('data consistency', () => {
    it('should handle partial stats data', async () => {
      const partialStatsData = {
        totalCount: 5,
        manufacturerStats: [{ _id: 'Test Manufacturer', count: 5 }],
        scaleStats: [],
        locationStats: [],
      };

      mockApi.getFigureStats.mockResolvedValue(partialStatsData);
      
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument(); // Total count
        expect(screen.getByText('Test Manufacturer')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 for empty arrays
      });
    });

    it('should handle malformed stats data', async () => {
      const malformedStatsData = {
        totalCount: null,
        manufacturerStats: null,
        scaleStats: undefined,
        locationStats: [],
      };

      mockApi.getFigureStats.mockResolvedValue(malformedStatsData as any);
      
      render(<Dashboard />);

      // Should not crash
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers in statistics', async () => {
      const largeStatsData = {
        totalCount: 999999,
        manufacturerStats: [{ _id: 'Large Manufacturer', count: 999999 }],
        scaleStats: [{ _id: '1/8', count: 500000 }],
        locationStats: [{ _id: 'Large Storage', count: 100000 }],
      };

      mockApi.getFigureStats.mockResolvedValue(largeStatsData);
      
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('999999')).toBeInTheDocument();
      });
    });

    it('should handle manufacturers with special characters', async () => {
      const specialCharStatsData = {
        ...mockStatsData,
        manufacturerStats: [
          { _id: 'Manufacturer & Co.', count: 5 },
          { _id: 'Company "Test"', count: 3 },
          { _id: 'Brand <Special>', count: 2 },
        ],
      };

      mockApi.getFigureStats.mockResolvedValue(specialCharStatsData);
      
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Manufacturer & Co.')).toBeInTheDocument();
        expect(screen.getByText('Company "Test"')).toBeInTheDocument();
        expect(screen.getByText('Brand <Special>')).toBeInTheDocument();
      });
    });

    it('should handle extremely long manufacturer names', async () => {
      const longNameStatsData = {
        ...mockStatsData,
        manufacturerStats: [
          { _id: 'This is a very long manufacturer name that might cause layout issues if not handled properly', count: 1 },
        ],
      };

      mockApi.getFigureStats.mockResolvedValue(longNameStatsData);
      
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('This is a very long manufacturer name that might cause layout issues if not handled properly')).toBeInTheDocument();
      });
    });
  });
});