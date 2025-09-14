import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import Statistics from '../Statistics';
import { useAuthStore } from '../../stores/authStore';

// Mock useAuthStore
jest.mock('../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: () => ({
    data: {
      totalFigures: 10,
      totalValue: 1000,
      averageValue: 100,
      manufacturerStats: [],
      scaleStats: [],
      locationStats: [],
    },
    isLoading: false,
    error: null
  }),
}));

describe('Statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: { _id: '1', username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      setUser: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders statistics page', () => {
    render(<Statistics />);
    expect(screen.getByRole('heading', { name: /statistics/i })).toBeInTheDocument();
  });

  it('renders total figures count', () => {
    render(<Statistics />);
    expect(screen.getByText('Total Figures')).toBeInTheDocument();
  });
});