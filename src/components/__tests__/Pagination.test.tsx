import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import Pagination from '../Pagination';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when there is only one page', () => {
      const { container } = render(
        <Pagination {...defaultProps} totalPages={1} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when there are no pages', () => {
      const { container } = render(
        <Pagination {...defaultProps} totalPages={0} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render previous and next buttons', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    });

    it('should render page number buttons', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument(); // Last page always shown
    });
  });

  describe('Previous Button', () => {
    it('should be disabled on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).toBeDisabled();
    });

    it('should be enabled when not on first page', () => {
      render(<Pagination {...defaultProps} currentPage={2} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      expect(prevButton).not.toBeDisabled();
    });

    it('should call onPageChange with previous page number when clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={3} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should not call onPageChange when disabled and clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={1} />);

      const prevButton = screen.getByRole('button', { name: /previous page/i });
      await user.click(prevButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Next Button', () => {
    it('should be disabled on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      expect(nextButton).toBeDisabled();
    });

    it('should be enabled when not on last page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('should call onPageChange with next page number when clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={2} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should not call onPageChange when disabled and clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      await user.click(nextButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Page Number Buttons', () => {
    it('should highlight current page button', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const currentPageButton = screen.getByRole('button', { name: '3' });
      expect(currentPageButton).toHaveClass('chakra-button--solid');
    });

    it('should not highlight non-current page buttons', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const pageButton = screen.getByRole('button', { name: '2' });
      expect(pageButton).toHaveClass('chakra-button--outline');
    });

    it('should call onPageChange with correct page number when clicked', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={1} />);

      const pageButton = screen.getByRole('button', { name: '3' });
      await user.click(pageButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange for first page', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={3} />);

      const firstPageButton = screen.getByRole('button', { name: '1' });
      await user.click(firstPageButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange for last page', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={1} />);

      const lastPageButton = screen.getByRole('button', { name: '5' });
      await user.click(lastPageButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(5);
    });
  });

  describe('Page Display Logic', () => {
    it('should show first page button', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    });

    it('should show last page button when totalPages > 1', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('should show pages around current page', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />);

      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
    });

    it('should show ellipsis when there are gaps', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={6} />);

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('should show multiple ellipses when current page is in middle', () => {
      render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />);

      const ellipses = screen.getAllByText('...');
      expect(ellipses).toHaveLength(2);
    });

    it('should not show ellipsis when pages are consecutive', () => {
      render(<Pagination {...defaultProps} totalPages={5} currentPage={3} />);

      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle currentPage = 1 with 2 total pages', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={2} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.queryByText('...')).not.toBeInTheDocument();
    });

    it('should handle currentPage = 1 with 3 total pages', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={3} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('should handle currentPage = 2 with many pages', () => {
      render(<Pagination {...defaultProps} currentPage={2} totalPages={10} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('should handle currentPage at second-to-last position', () => {
      render(<Pagination {...defaultProps} currentPage={9} totalPages={10} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('should handle large page numbers', () => {
      render(<Pagination {...defaultProps} currentPage={50} totalPages={100} />);

      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '49' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '51' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '100' })).toBeInTheDocument();
    });
  });

  describe('Multiple Page Interactions', () => {
    it('should handle multiple clicks on different pages', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={1} totalPages={10} />);

      await user.click(screen.getByRole('button', { name: '1' }));
      expect(mockOnPageChange).toHaveBeenCalledWith(1);

      await user.click(screen.getByRole('button', { name: '10' }));
      expect(mockOnPageChange).toHaveBeenCalledWith(10);

      expect(mockOnPageChange).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid navigation', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      const prevButton = screen.getByRole('button', { name: /previous page/i });

      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledTimes(3);
      expect(mockOnPageChange).toHaveBeenNthCalledWith(1, 6);
      expect(mockOnPageChange).toHaveBeenNthCalledWith(2, 7);
      expect(mockOnPageChange).toHaveBeenNthCalledWith(3, 6);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={2} />);

      // Tab through elements
      await user.tab();
      expect(screen.getByRole('button', { name: /previous page/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: '1' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: '2' })).toHaveFocus();
    });

    it('should support Enter key activation on buttons', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={1} />);

      const pageButton = screen.getByRole('button', { name: '3' });
      pageButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should support Space key activation on buttons', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={1} />);

      const nextButton = screen.getByRole('button', { name: /next page/i });
      nextButton.focus();
      await user.keyboard(' ');

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Button States', () => {
    it('should show correct button variants for current vs non-current pages', () => {
      render(<Pagination {...defaultProps} currentPage={3} totalPages={5} />);

      const currentButton = screen.getByRole('button', { name: '3' });
      const otherButton = screen.getByRole('button', { name: '2' });

      expect(currentButton).toHaveClass('chakra-button--solid');
      expect(otherButton).toHaveClass('chakra-button--outline');
    });

    it('should apply correct color schemes', () => {
      render(<Pagination {...defaultProps} currentPage={2} totalPages={5} />);

      const currentButton = screen.getByRole('button', { name: '2' });
      expect(currentButton).toHaveAttribute('data-colorscheme', 'brand');
    });
  });

  describe('Performance Considerations', () => {
    it('should not re-render unnecessarily with same props', () => {
      const { rerender } = render(<Pagination {...defaultProps} />);
      
      // Re-render with identical props
      rerender(<Pagination {...defaultProps} />);
      
      // Component should still render correctly
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(<Pagination {...defaultProps} currentPage={1} />);

      expect(screen.getByRole('button', { name: '1' })).toHaveClass('chakra-button--solid');

      rerender(<Pagination {...defaultProps} currentPage={2} />);

      expect(screen.getByRole('button', { name: '2' })).toHaveClass('chakra-button--solid');
      expect(screen.getByRole('button', { name: '1' })).toHaveClass('chakra-button--outline');
    });
  });
});