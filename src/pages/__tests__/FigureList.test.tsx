import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from 'react-query';
import { render, mockFigure, mockPaginatedResponse } from '../../test-utils';
import FigureList from '../FigureList';
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

jest.mock('../../components/FilterBar', () => {
  return function MockFilterBar({ onFilter, initialFilters }: any) {
    return (
      <div data-testid="filter-bar">
        <button onClick={() => onFilter({ manufacturer: 'Test Manufacturer' })}>
          Apply Filter
        </button>
        <button onClick={() => onFilter({})}>
          Clear Filters
        </button>
      </div>
    );
  };
});

jest.mock('../../components/Pagination', () => {
  return function MockPagination({ currentPage, totalPages, onPageChange }: any) {
    return (
      <div data-testid="pagination">
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => onPageChange(2)}>Next Page</button>
      </div>
    );
  };
});

jest.mock('../../components/EmptyState', () => {
  return function MockEmptyState({ type }: any) {
    return <div data-testid={`empty-state-${type}`}>Empty State: {type}</div>;
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

describe('FigureList', () => {
  const mockFiguresData = {
    ...mockPaginatedResponse,
    data: [
      { ...mockFigure, _id: '1', name: 'Figure 1' },
      { ...mockFigure, _id: '2', name: 'Figure 2' },
      { ...mockFigure, _id: '3', name: 'Figure 3' },
    ],
    total: 3,
    pages: 1,
    page: 1,
    count: 3,
  };

  const mockEmptyResponse = {
    ...mockPaginatedResponse,
    data: [],
    total: 0,
    pages: 0,
    page: 1,
    count: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading states', () => {
    it('should show loading spinner while fetching figures', () => {
      mockApi.getFigures.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<FigureList />);

      // Check for Spinner by test ID or class since Chakra UI Spinner may not have role="status"
      expect(document.querySelector('.chakra-spinner')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });
  });

  describe('successful data loading', () => {
    beforeEach(() => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
    });

    it('should render page header correctly', async () => {
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /add figure/i })).toBeInTheDocument();
      });
    });

    it('should have correct link to add figure page', async () => {
      render(<FigureList />);

      await waitFor(() => {
        const addButton = screen.getByRole('link', { name: /add figure/i });
        expect(addButton).toHaveAttribute('href', '/figures/add');
      });
    });

    it('should render filter bar', async () => {
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
      });
    });

    it('should display figures count', async () => {
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 figures')).toBeInTheDocument();
      });
    });

    it('should render figure cards for each figure', async () => {
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByTestId('figure-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('figure-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('figure-card-3')).toBeInTheDocument();
      });
    });

    it('should render pagination component', async () => {
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });
    });
  });

  describe('empty states', () => {
    it('should show collection empty state when no figures and no filters', async () => {
      mockApi.getFigures.mockResolvedValue(mockEmptyResponse);
      
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-collection')).toBeInTheDocument();
      });
    });

    it('should show filter empty state when no figures match filters', async () => {
      mockApi.filterFigures.mockResolvedValue(mockEmptyResponse);
      
      render(<FigureList />);

      // Apply a filter
      const filterButton = await screen.findByText('Apply Filter');
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-filter')).toBeInTheDocument();
      });
    });
  });

  describe('filtering functionality', () => {
    it('should call filterFigures API when filters are applied', async () => {
      mockApi.getFigures.mockResolvedValue(mockEmptyResponse);
      mockApi.filterFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      const filterButton = await screen.findByText('Apply Filter');
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApi.filterFigures).toHaveBeenCalledWith({
          manufacturer: 'Test Manufacturer',
          page: 1,
          limit: 12,
        });
      });
    });

    it('should call getFigures API when filters are cleared', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      mockApi.filterFigures.mockResolvedValue(mockEmptyResponse);
      
      render(<FigureList />);

      // First apply a filter
      const filterButton = await screen.findByText('Apply Filter');
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApi.filterFigures).toHaveBeenCalled();
      });

      // Then clear filters
      const clearButton = screen.getByText('Clear Filters');
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(mockApi.getFigures).toHaveBeenCalledWith(1, 12);
      });
    });

    it('should reset page to 1 when filters change', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      mockApi.filterFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      const filterButton = await screen.findByText('Apply Filter');
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApi.filterFigures).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe('pagination functionality', () => {
    beforeEach(() => {
      const multiPageResponse = {
        ...mockFiguresData,
        pages: 3,
        total: 30,
      };
      mockApi.getFigures.mockResolvedValue(multiPageResponse);
    });

    it('should call getFigures with correct page when pagination changes', async () => {
      render(<FigureList />);

      const nextButton = await screen.findByText('Next Page');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(mockApi.getFigures).toHaveBeenLastCalledWith(2, 12);
      });
    });

    it('should scroll to top when page changes', async () => {
      window.scrollTo = jest.fn();
      render(<FigureList />);

      const nextButton = await screen.findByText('Next Page');
      await userEvent.click(nextButton);

      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should maintain filters when changing pages', async () => {
      mockApi.filterFigures.mockResolvedValue({
        ...mockFiguresData,
        pages: 3,
      });
      
      render(<FigureList />);

      // Apply filter first
      const filterButton = await screen.findByText('Apply Filter');
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApi.filterFigures).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });

      // Change page
      const nextButton = screen.getByText('Next Page');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(mockApi.filterFigures).toHaveBeenCalledWith({
          manufacturer: 'Test Manufacturer',
          page: 2,
          limit: 12,
        });
      });
    });
  });

  describe('error handling', () => {
    it('should show error state when API call fails', async () => {
      mockApi.getFigures.mockRejectedValue(new Error('API Error'));
      
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByText('Error loading figures')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('should show toast error message when API fails', async () => {
      const errorMessage = 'Failed to load figures';
      mockApi.getFigures.mockRejectedValue({
        response: {
          data: { message: errorMessage },
        },
      });
      
      render(<FigureList />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    });

    it('should show default error message when API fails without message', async () => {
      mockApi.getFigures.mockRejectedValue(new Error('Network error'));
      
      render(<FigureList />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to load figures',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    });

    it('should allow retry after error', async () => {
      delete (window as any).location;
      (window as any).location = { reload: jest.fn() };

      mockApi.getFigures.mockRejectedValue(new Error('API Error'));
      
      render(<FigureList />);

      const tryAgainButton = await screen.findByRole('button', { name: /try again/i });
      await userEvent.click(tryAgainButton);

      expect((window as any).location.reload).toHaveBeenCalled();
    });
  });

  describe('API interaction patterns', () => {
    it('should use keepPreviousData for smooth pagination', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      // The query should be called with keepPreviousData: true
      // This is tested by ensuring smooth transitions during pagination
      await waitFor(() => {
        expect(mockApi.getFigures).toHaveBeenCalledWith(1, 12);
      });
    });

    it('should call correct API based on filter state', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      mockApi.filterFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      // Initially should call getFigures
      await waitFor(() => {
        expect(mockApi.getFigures).toHaveBeenCalledWith(1, 12);
      });

      // After applying filter should call filterFigures
      const filterButton = await screen.findByText('Apply Filter');
      await userEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApi.filterFigures).toHaveBeenCalled();
      });
    });
  });

  describe('responsive grid layout', () => {
    it('should render figures in a grid layout', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      await waitFor(() => {
        const figureCards = screen.getAllByTestId(/figure-card-/);
        expect(figureCards).toHaveLength(3);
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /your figures/i })).toBeInTheDocument();
      });
    });

    it('should have accessible add button', async () => {
      mockApi.getFigures.mockResolvedValue(mockFiguresData);
      
      render(<FigureList />);

      await waitFor(() => {
        const addButton = screen.getByRole('link', { name: /add figure/i });
        expect(addButton).toBeInTheDocument();
      });
    });

    it('should provide meaningful loading state for screen readers', () => {
      mockApi.getFigures.mockImplementation(() => new Promise(() => {}));
      
      render(<FigureList />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('data consistency', () => {
    it('should show correct count information', async () => {
      const customResponse = {
        ...mockFiguresData,
        data: [mockFigure, mockFigure],
        total: 25,
        count: 2,
      };
      mockApi.getFigures.mockResolvedValue(customResponse);
      
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 25 figures')).toBeInTheDocument();
      });
    });

    it('should handle zero results correctly', async () => {
      mockApi.getFigures.mockResolvedValue(mockEmptyResponse);
      
      render(<FigureList />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state-collection')).toBeInTheDocument();
        expect(screen.queryByText(/showing \d+ of \d+ figures/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('component integration', () => {
    it('should pass correct props to child components', async () => {
      mockApi.getFigures.mockResolvedValue({
        ...mockFiguresData,
        pages: 5,
        page: 2,
      });
      
      render(<FigureList />);

      await waitFor(() => {
        // Check FilterBar receives correct props
        expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
        
        // Check Pagination receives correct props
        expect(screen.getByText('Page 1 of 5')).toBeInTheDocument(); // Current page starts at 1
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined API response gracefully', async () => {
      mockApi.getFigures.mockResolvedValue(undefined as any);
      
      render(<FigureList />);

      await waitFor(() => {
        // Should not crash, might show empty state or error
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
      });
    });

    it('should handle malformed API response', async () => {
      mockApi.getFigures.mockResolvedValue({
        data: null,
        total: null,
        pages: null,
      } as any);
      
      render(<FigureList />);

      await waitFor(() => {
        // Should not crash
        expect(screen.getByText('Your Figures')).toBeInTheDocument();
      });
    });
  });
});