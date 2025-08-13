import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from 'react-query';
import { render, mockUser } from '../../test-utils';
import Login from '../Login';
import * as api from '../../api';
import { useAuthStore } from '../../stores/authStore';

// Mock API
jest.mock('../../api');
const mockApi = api as jest.Mocked<typeof api>;

// Mock useAuthStore
jest.mock('../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock toast - use the global mock
const mockToast = jest.fn();
global.mockToast = mockToast;

describe('Login', () => {
  const mockSetUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      setUser: mockSetUser,
      logout: jest.fn(),
    });
  });

  describe('component rendering', () => {
    it('should render login form correctly', () => {
      render(<Login />);

      expect(screen.getByText('FigureCollector')).toBeInTheDocument();
      expect(screen.getByText('Sign in to manage your collection')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText('Don\'t have an account?')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should render register link correctly', () => {
      render(<Login />);

      const registerLink = screen.getByRole('link', { name: /register/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should render app logo and title', () => {
      render(<Login />);

      expect(screen.getByText('FigureCollector')).toBeInTheDocument();
      expect(screen.getByText('Sign in to manage your collection')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should show email required error when email is empty', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show password required error when password is empty', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show invalid email error for malformed email', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should not submit form when validation fails', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(mockApi.loginUser).not.toHaveBeenCalled();
    });

    it('should validate email format correctly for various inputs', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Test valid email formats
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com'
      ];

      for (const email of validEmails) {
        await user.clear(emailInput);
        await user.type(emailInput, email);
        await user.click(submitButton);

        // Should not show email validation error
        await waitFor(() => {
          expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
        });
      }

      // Test invalid email formats
      const invalidEmails = ['test', 'test@', '@example.com', 'test..test@example.com'];

      for (const email of invalidEmails) {
        await user.clear(emailInput);
        await user.type(emailInput, email);
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        });
      }
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should show correct eye icon based on password visibility', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const toggleButton = screen.getByRole('button', { name: '' });

      // Initially should show "eye" icon (password hidden)
      await user.click(toggleButton);
      // Now should show "eye-slash" icon (password visible)
      
      await user.click(toggleButton);
      // Back to "eye" icon (password hidden)
    });
  });

  describe('form submission', () => {
    it('should call loginUser API with correct data on form submission', async () => {
      const user = userEvent.setup();
      mockApi.loginUser.mockResolvedValue(mockUser);
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during form submission', async () => {
      const user = userEvent.setup();
      mockApi.loginUser.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });
  });

  describe('successful login', () => {
    it('should handle successful login correctly', async () => {
      const user = userEvent.setup();
      mockApi.loginUser.mockResolvedValue(mockUser);
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith(mockUser);
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Success',
          description: 'You are now logged in!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      });
    });
  });

  describe('login error handling', () => {
    it('should handle API error with custom message', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      mockApi.loginUser.mockRejectedValue({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    });

    it('should handle API error with default message', async () => {
      const user = userEvent.setup();
      mockApi.loginUser.mockRejectedValue(new Error('Network error'));
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    });

    it('should not navigate on login failure', async () => {
      const user = userEvent.setup();
      mockApi.loginUser.mockRejectedValue(new Error('Login failed'));
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
          status: 'error'
        }));
      });

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels and associations', () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have proper autocomplete attributes', () => {
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    it('should have proper form structure for screen readers', () => {
      render(<Login />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should show error messages with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const emailError = screen.getByText('Email is required');
        expect(emailError).toBeInTheDocument();
        
        // Check that form control is marked as invalid
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput.closest('[role="group"]')).toHaveAttribute('data-invalid');
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should allow form submission with Enter key', async () => {
      const user = userEvent.setup();
      mockApi.loginUser.mockResolvedValue(mockUser);
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(passwordInput, '{enter}');

      await waitFor(() => {
        expect(mockApi.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should allow tabbing through form elements', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: '' });
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.click(emailInput);
      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(toggleButton).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });

  describe('edge cases', () => {
    it('should handle very long email addresses', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const longEmail = 'a'.repeat(100) + '@example.com';
      const emailInput = screen.getByLabelText(/email/i);
      
      await user.type(emailInput, longEmail);
      expect(emailInput).toHaveValue(longEmail);
    });

    it('should handle very long passwords', async () => {
      const user = userEvent.setup();
      render(<Login />);

      const longPassword = 'a'.repeat(1000);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(passwordInput, longPassword);
      expect(passwordInput).toHaveValue(longPassword);
    });

    it('should handle special characters in form inputs', async () => {
      const user = userEvent.setup();
      mockApi.loginUser.mockResolvedValue(mockUser);
      
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      const specialEmail = 'test+special@example-domain.co.uk';
      const specialPassword = 'P@ssw0rd!#$%';

      await user.type(emailInput, specialEmail);
      await user.type(passwordInput, specialPassword);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.loginUser).toHaveBeenCalledWith(specialEmail, specialPassword);
      });
    });

    it('should not show validation errors on initial render', () => {
      render(<Login />);

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
    });
  });
});