import React from 'react';
import { screen } from '@testing-library/react';
import { render, mockUser } from '../../test-utils';
import Profile from '../Profile';
import { useAuthStore } from '../../stores/authStore';

// Mock useAuthStore
jest.mock('../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: () => ({
    data: mockUser,
    isLoading: false,
    error: null
  }),
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null
  }),
}));

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      setUser: jest.fn(),
      logout: jest.fn(),
    });
  });

  it('renders profile page', () => {
    render(<Profile />);
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
  });

  it('renders form elements', () => {
    render(<Profile />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});