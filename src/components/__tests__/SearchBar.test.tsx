import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByPlaceholderText('Search your figures...')).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted by Enter key', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search your figures...');
    await userEvent.type(input, 'test search');
    await userEvent.keyboard('{Enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('test search');
  });

  it('calls onSearch when search button clicked', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search your figures...');
    const button = screen.getByRole('button', { name: /search/i });
    
    await userEvent.type(input, 'test search');
    await userEvent.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test search');
  });

  it('supports custom placeholder', () => {
    render(<SearchBar onSearch={mockOnSearch} placeholder="Find figures" />);
    expect(screen.getByPlaceholderText('Find figures')).toBeInTheDocument();
  });

  it('updates input value when typing', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search your figures...');
    await userEvent.type(input, 'test value');
    
    expect(input).toHaveValue('test value');
  });
});