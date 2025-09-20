import React from 'react';
import { screen } from '@testing-library/react';
import { render, mockFigure } from '../../test-utils';
import FigureList from '../FigureList';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from 'react-query';

// Mock useAuthStore
jest.mock('../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null
  }),
}));

describe('FigureList', () => {
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: { _id: '1', username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      setUser: jest.fn(),
      logout: jest.fn(),
    });

    // Mock different queries based on query key
    mockUseQuery.mockImplementation((queryKey: any) => {
      if (queryKey === 'figureStats') {
        return {
          data: {
            manufacturerStats: [],
            scaleStats: [],
            locationStats: [],
          },
          isLoading: false,
          error: null
        } as any;
      } else {
        // This is the figures query
        return {
          data: {
            data: [mockFigure],
            total: 1,
            pages: 1
          },
          isLoading: false,
          error: null
        } as any;
      }
    });
  });

  it('renders figure list page', () => {
    render(<FigureList />);
    expect(screen.getByRole('heading', { name: /your figures/i })).toBeInTheDocument();
  });

  it('renders figures when data is loaded', () => {
    render(<FigureList />);
    expect(screen.getByText(mockFigure.name)).toBeInTheDocument();
  });
});