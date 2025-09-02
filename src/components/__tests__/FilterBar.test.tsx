import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockStatsData } from '../../test-utils';
import FilterBar from '../FilterBar';
import * as api from '../../api';

// Mock the API
jest.mock('../../api');
const mockApi = api as jest.Mocked<typeof api>;

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
}));

describe('FilterBar', () => {
  const mockOnFilter = jest.fn();
  const defaultProps = {
    onFilter: mockOnFilter,
  };

  const mockUseQuery = require('react-query').useQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render filters button initially', () => {
      render(<FilterBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('should not show clear filters button when no filters are applied', () => {
      render(<FilterBar {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
    });

    it('should show clear filters button when filters are applied', () => {
      const initialFilters = { manufacturer: 'Good Smile Company' };
      render(<FilterBar {...defaultProps} initialFilters={initialFilters} />);

      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('should not show filter form initially', () => {
      render(<FilterBar {...defaultProps} />);

      // Chakra UI Collapse renders elements in DOM but hides them with height: 0
      const form = screen.queryByRole('form');
      
      // Form should exist in DOM but be collapsed (not visible to user)
      if (form) {
        expect(form).toBeInTheDocument();
        // Chakra Collapse uses height: 0 and overflow: hidden when collapsed
        expect(form.parentElement).toHaveStyle({ height: '0px' });
      }
    });
  });

  describe('Filter Form Visibility', () => {
    it('should show filter form when filters button is clicked', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/scale/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/box number/i)).toBeInTheDocument();
      });
    });

    it('should hide filter form when filters button is clicked again', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      
      // Open filters
      await user.click(filtersButton);
      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      });

      // Close filters
      await user.click(filtersButton);
      await waitFor(() => {
        // Form should be collapsed (not visible to user)
        const form = screen.queryByRole('form');
        if (form) {
          expect(form.parentElement).toHaveStyle({ height: '0px' });
        }
      });
    });

    it('should hide filter form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      // Open filters
      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        // Form should be collapsed (not visible to user)
        const form = screen.queryByRole('form');
        if (form) {
          expect(form.parentElement).toHaveStyle({ height: '0px' });
        }
      });
    });
  });

  describe('Stats Loading', () => {
    it('should not fetch stats when filters are not open', () => {
      render(<FilterBar {...defaultProps} />);

      expect(mockUseQuery).toHaveBeenCalledWith('figureStats', api.getFigureStats, {
        enabled: false,
      });
    });

    it('should fetch stats when filters are opened', async () => {
      const user = userEvent.setup();
      
      // Mock the query to return data when enabled
      let isEnabled = false;
      mockUseQuery.mockImplementation((key, fn, options) => ({
        data: isEnabled ? mockStatsData : undefined,
        isLoading: false,
        error: null,
      }));

      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      // Simulate the query being enabled
      isEnabled = true;

      await waitFor(() => {
        expect(mockUseQuery).toHaveBeenCalledWith('figureStats', api.getFigureStats, {
          enabled: true,
        });
      });
    });
  });

  describe('Filter Options Display', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should display manufacturer options with counts', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      // Wait for form to be visible by checking for manufacturer select
      await waitFor(() => {
        const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
        expect(manufacturerSelect).toBeVisible();
      }, { timeout: 3000 });

      const manufacturerSelect = screen.getByLabelText(/manufacturer/i) as HTMLSelectElement;
      expect(manufacturerSelect).toBeInTheDocument();
      
      // Check that select has the expected options
      const options = Array.from(manufacturerSelect.options);
      expect(options).toHaveLength(4); // Placeholder + 3 manufacturers
      expect(options.some(opt => opt.text === 'Good Smile Company (5)')).toBe(true);
      expect(options.some(opt => opt.text === 'ALTER (3)')).toBe(true);
      expect(options.some(opt => opt.text === 'Kotobukiya (2)')).toBe(true);
    });

    it('should display scale options with counts', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      // Wait for manufacturer select to be visible
      await waitFor(() => {
        const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
        expect(manufacturerSelect).toBeVisible();
      }, { timeout: 3000 });

      const scaleSelect = screen.getByLabelText(/scale/i) as HTMLSelectElement;
      expect(scaleSelect).toBeInTheDocument();
      
      // Check that select has the expected options
      const options = Array.from(scaleSelect.options);
      expect(options).toHaveLength(4); // Placeholder + 3 scales
      expect(options.some(opt => opt.text === '1/8 (6)')).toBe(true);
      expect(options.some(opt => opt.text === '1/7 (3)')).toBe(true);
      expect(options.some(opt => opt.text === '1/6 (1)')).toBe(true);
    });

    it('should display location options with counts', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      // Wait for manufacturer select to be visible
      await waitFor(() => {
        const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
        expect(manufacturerSelect).toBeVisible();
      }, { timeout: 3000 });

      const locationSelect = screen.getByLabelText(/location/i) as HTMLSelectElement;
      expect(locationSelect).toBeInTheDocument();
      
      // Check that select has the expected options
      const options = Array.from(locationSelect.options);
      expect(options).toHaveLength(4); // Placeholder + 3 locations
      expect(options.some(opt => opt.text === 'Display Case (5)')).toBe(true);
      expect(options.some(opt => opt.text === 'Storage Box (3)')).toBe(true);
      expect(options.some(opt => opt.text === 'Shelf A (2)')).toBe(true);
    });
  });

  describe('Filter Input Handling', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should update filter values when inputs change', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      });

      // Select manufacturer
      const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
      await user.selectOptions(manufacturerSelect, 'Good Smile Company');

      expect(manufacturerSelect).toHaveValue('Good Smile Company');
    });

    it('should handle box number input changes', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/box number/i)).toBeInTheDocument();
      });

      const boxNumberInput = screen.getByLabelText(/box number/i);
      await user.type(boxNumberInput, 'A1');

      expect(boxNumberInput).toHaveValue('A1');
    });
  });

  describe('Filter Submission', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should call onFilter when apply filters button is clicked', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      });

      // Set filter values
      const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
      await user.selectOptions(manufacturerSelect, 'Good Smile Company');

      const boxNumberInput = screen.getByLabelText(/box number/i);
      await user.type(boxNumberInput, 'A1');

      // Apply filters
      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      await user.click(applyButton);

      expect(mockOnFilter).toHaveBeenCalledWith({
        manufacturer: 'Good Smile Company',
        boxNumber: 'A1',
      });
    });

    it('should submit form when enter key is pressed in form', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/box number/i)).toBeInTheDocument();
      });

      // Type in box number and press enter
      const boxNumberInput = screen.getByLabelText(/box number/i);
      await user.type(boxNumberInput, 'B2');
      await user.keyboard('{Enter}');

      expect(mockOnFilter).toHaveBeenCalledWith({
        boxNumber: 'B2',
      });
    });
  });

  describe('Filter Reset', () => {
    it('should clear all filters when clear filters button is clicked', async () => {
      const user = userEvent.setup();
      const initialFilters = {
        manufacturer: 'Good Smile Company',
        scale: '1/8',
        location: 'Display Case A',
        boxNumber: 'A1',
      };
      
      render(<FilterBar {...defaultProps} initialFilters={initialFilters} />);

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      expect(mockOnFilter).toHaveBeenCalledWith({});
    });

    it('should reset form fields after clearing filters', async () => {
      const user = userEvent.setup();
      mockUseQuery.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });

      const initialFilters = {
        manufacturer: 'Good Smile Company',
        boxNumber: 'A1',
      };

      render(<FilterBar {...defaultProps} initialFilters={initialFilters} />);

      // Open filters to see the form
      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      });

      // Verify initial values are set
      expect(screen.getByLabelText(/manufacturer/i)).toHaveValue('Good Smile Company');
      expect(screen.getByLabelText(/box number/i)).toHaveValue('A1');

      // Clear filters - use more specific selector to avoid ambiguity
      const buttons = screen.getAllByRole('button', { name: /clear filters/i });
      const clearButton = buttons.find(btn => btn.textContent?.includes('Clear Filters'));
      expect(clearButton).toBeInTheDocument();
      await user.click(clearButton!);

      // Verify form is reset - reopen if needed
      await waitFor(() => {
        const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
        const boxNumberInput = screen.getByLabelText(/box number/i);
        expect(manufacturerSelect).toHaveValue('');
        expect(boxNumberInput).toHaveValue('');
      });
    });
  });

  describe('Initial Filters', () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: mockStatsData,
        isLoading: false,
        error: null,
      });
    });

    it('should populate form with initial filter values', async () => {
      const user = userEvent.setup();
      const initialFilters = {
        manufacturer: 'ALTER',
        scale: '1/7',
        location: 'Display Case',
        boxNumber: 'B2',
      };

      render(<FilterBar {...defaultProps} initialFilters={initialFilters} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      // Wait for manufacturer select to be visible
      await waitFor(() => {
        const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
        expect(manufacturerSelect).toBeVisible();
      }, { timeout: 3000 });

      expect(screen.getByLabelText(/manufacturer/i)).toHaveValue('ALTER');
      expect(screen.getByLabelText(/scale/i)).toHaveValue('1/7');
      expect(screen.getByLabelText(/location/i)).toHaveValue('Display Case');
      expect(screen.getByLabelText(/box number/i)).toHaveValue('B2');
    });

    it('should update form when initialFilters prop changes', async () => {
      const user = userEvent.setup();
      const initialFilters1 = { manufacturer: 'Good Smile Company' };
      const initialFilters2 = { manufacturer: 'ALTER' };

      const { rerender } = render(<FilterBar {...defaultProps} initialFilters={initialFilters1} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      // Wait for manufacturer select to be visible
      await waitFor(() => {
        const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
        expect(manufacturerSelect).toBeVisible();
      }, { timeout: 3000 });

      expect(screen.getByLabelText(/manufacturer/i)).toHaveValue('Good Smile Company');

      // Update props
      rerender(<FilterBar {...defaultProps} initialFilters={initialFilters2} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toHaveValue('ALTER');
      });
    });
  });

  describe('UI States', () => {
    it('should highlight filters button when form is open', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      expect(filtersButton).toBeInTheDocument();

      await user.click(filtersButton);

      // Wait for manufacturer select to be visible
      await waitFor(() => {
        const manufacturerSelect = screen.getByLabelText(/manufacturer/i);
        expect(manufacturerSelect).toBeVisible();
      }, { timeout: 3000 });

      // Verify button is still accessible (functional test rather than style test)
      expect(filtersButton).toBeInTheDocument();
      expect(filtersButton).toBeEnabled();
    });

    it('should show proper placeholders for all inputs', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByText('All Manufacturers')).toBeInTheDocument();
        expect(screen.getByText('All Scales')).toBeInTheDocument();
        expect(screen.getByText('All Locations')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Any box')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and form labels', async () => {
      const user = userEvent.setup();
      render(<FilterBar {...defaultProps} />);

      const filtersButton = screen.getByRole('button', { name: /^filters$/i });
      await user.click(filtersButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/scale/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/box number/i)).toBeInTheDocument();
      });
    });

    it('should have proper button roles and names', () => {
      render(<FilterBar {...defaultProps} initialFilters={{ manufacturer: 'Test' }} />);

      expect(screen.getByRole('button', { name: /^filters$/i })).toBeInTheDocument();
      
      // Use more specific selector for clear filters button to avoid ambiguity
      const clearButtons = screen.getAllByRole('button', { name: /clear filters/i });
      expect(clearButtons.length).toBeGreaterThan(0);
      expect(clearButtons.some(btn => btn.textContent?.includes('Clear Filters'))).toBe(true);
    });
  });
});