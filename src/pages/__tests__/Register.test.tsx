import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import Register from '../Register';
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

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      setUser: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders registration form', () => {
    render(<Register />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<Register />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    render(<Register />);
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });
});