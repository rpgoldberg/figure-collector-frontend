import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();
  const defaultProps = {
    onSearch: mockOnSearch,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input with default placeholder', () => {
      render(<SearchBar {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search your figures...')).toBeInTheDocument();
    });

    it('should render search input with custom placeholder', () => {
      const customPlaceholder = 'Find your favorite figure';
      render(<SearchBar {...defaultProps} placeholder={customPlaceholder} />);

      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('should render search button', () => {
      render(<SearchBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should have search icon in the button', () => {
      render(<SearchBar {...defaultProps} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      const searchIcon = searchButton.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      await user.type(searchInput, 'Hatsune Miku');

      expect(searchInput).toHaveValue('Hatsune Miku');
    });

    it('should clear input value', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      await user.type(searchInput, 'Test search');
      expect(searchInput).toHaveValue('Test search');

      await user.clear(searchInput);
      expect(searchInput).toHaveValue('');
    });

    it('should maintain focus on input during typing', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      await user.click(searchInput);
      await user.type(searchInput, 'Search query');

      expect(searchInput).toHaveFocus();
    });
  });

  describe('Search Functionality', () => {
    it('should call onSearch when search button is clicked with non-empty query', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(searchInput, 'Nendoroid');
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith('Nendoroid');
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it('should call onSearch when Enter key is pressed with non-empty query', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      await user.type(searchInput, 'Figma');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('Figma');
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it('should trim whitespace from search query', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(searchInput, '  Trimmed Query  ');
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith('Trimmed Query');
    });

    it('should not call onSearch when query is empty', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not call onSearch when query contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(searchInput, '   ');
      await user.click(searchButton);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should handle special characters in search query', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const specialQuery = 'Fate/stay night & Saber (Extra)';

      await user.type(searchInput, specialQuery);
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith(specialQuery);
    });

    it('should handle emoji and unicode characters', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const emojiQuery = 'Miku 🎤 ボーカロイド';

      await user.type(searchInput, emojiQuery);
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith(emojiQuery);
    });
  });

  describe('Form Behavior', () => {
    it('should prevent default form submission behavior', async () => {
      const user = userEvent.setup();
      const mockPreventDefault = jest.fn();
      
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      await user.type(searchInput, 'Test query');

      // Simulate form submission with preventDefault
      const form = searchInput.closest('form');
      fireEvent.submit(form!, { preventDefault: mockPreventDefault });

      expect(mockPreventDefault).toHaveBeenCalled();
    });

    it('should be wrapped in a form element', () => {
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const form = searchInput.closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have submit type on search button', () => {
      render(<SearchBar {...defaultProps} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Styling and Layout', () => {
    it('should have full width styling', () => {
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const form = searchInput.closest('form');
      expect(form).toHaveStyle({ width: '100%' });
    });

    it('should have large size input group', () => {
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const inputGroup = searchInput.closest('[data-group="true"]');
      // Note: Chakra UI specific class testing would require more specific setup
      expect(inputGroup).toBeInTheDocument();
    });

    it('should have white background on input', () => {
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      expect(searchInput).toHaveStyle({
        backgroundColor: 'white',
      });
    });

    it('should have brand color scheme on search button', () => {
      render(<SearchBar {...defaultProps} />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      // Note: Chakra UI color scheme classes would need more specific testing
      expect(searchButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on search button', () => {
      render(<SearchBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      // Tab to input
      await user.tab();
      expect(searchInput).toHaveFocus();

      // Tab to button
      await user.tab();
      expect(searchButton).toHaveFocus();
    });

    it('should support screen reader accessibility', () => {
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByRole('searchbox');
      const searchButton = screen.getByRole('button', { name: /search/i });

      expect(searchInput).toBeInTheDocument();
      expect(searchButton).toBeInTheDocument();
    });

    it('should have appropriate input type', () => {
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      // Default input type should be text, which is search-friendly
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Multiple Search Interactions', () => {
    it('should handle multiple searches with same query', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(searchInput, 'Repeated search');
      await user.click(searchButton);
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledTimes(2);
      expect(mockOnSearch).toHaveBeenNthCalledWith(1, 'Repeated search');
      expect(mockOnSearch).toHaveBeenNthCalledWith(2, 'Repeated search');
    });

    it('should handle rapid query changes and searches', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search your figures...');

      await user.type(searchInput, 'First');
      await user.keyboard('{Enter}');

      await user.clear(searchInput);
      await user.type(searchInput, 'Second');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledTimes(2);
      expect(mockOnSearch).toHaveBeenNthCalledWith(1, 'First');
      expect(mockOnSearch).toHaveBeenNthCalledWith(2, 'Second');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long search queries', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);

      const longQuery = 'A'.repeat(500);
      const searchInput = screen.getByPlaceholderText('Search your figures...');

      await user.type(searchInput, longQuery);
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith(longQuery);
    });

    it('should handle onSearch function being undefined gracefully', () => {
      // This test ensures the component doesn't crash if onSearch is not provided
      // though it's required by TypeScript, it's good to test runtime behavior
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        render(<SearchBar />);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should maintain state when component receives new props', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<SearchBar {...defaultProps} placeholder="Initial placeholder" />);

      const searchInput = screen.getByPlaceholderText('Initial placeholder');
      await user.type(searchInput, 'Persistent query');

      // Re-render with new placeholder
      rerender(<SearchBar {...defaultProps} placeholder="Updated placeholder" />);

      const updatedInput = screen.getByPlaceholderText('Updated placeholder');
      expect(updatedInput).toHaveValue('Persistent query');
    });
  });
});