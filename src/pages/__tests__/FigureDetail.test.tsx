import React from 'react';
import { screen } from '@testing-library/react';
import { render, mockFigure } from '../../test-utils';
import FigureDetail from '../FigureDetail';
import { useAuthStore } from '../../stores/authStore';

// Mock useAuthStore
jest.mock('../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '123' }),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: () => ({
    data: mockFigure,
    isLoading: false,
    error: null
  }),
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null
  }),
}));

describe('FigureDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: { _id: '1', username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      setUser: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders figure details', () => {
    render(<FigureDetail />);
    expect(screen.getByRole('heading', { name: mockFigure.name })).toBeInTheDocument();
  });

  it('renders figure information', () => {
    render(<FigureDetail />);
    expect(screen.getByText(mockFigure.manufacturer)).toBeInTheDocument();
  });
});