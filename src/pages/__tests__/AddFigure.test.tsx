import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import AddFigure from '../AddFigure';
import { useAuthStore } from '../../stores/authStore';

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
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null
  }),
}));

describe('AddFigure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: { _id: '1', username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true,
      setUser: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders add figure form', () => {
    render(<AddFigure />);
    expect(screen.getByRole('heading', { name: /add new figure/i })).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<AddFigure />);
    expect(screen.getAllByLabelText(/name/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/manufacturer/i)).toHaveLength(1);
  });
});