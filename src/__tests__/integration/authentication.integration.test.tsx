import React from 'react';
import { render, waitFor, screen, fireEvent } from '../../test-utils';
import Login from '../../pages/Login';

describe('Authentication Integration', () => {
  const mockBackendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn((url: string, options?: RequestInit) => {
      // Login endpoint simulation
      if (url === `${mockBackendUrl}/auth/login`) {
        const body = JSON.parse(options?.body as string);
        
        if (body.email === 'valid@example.com' && body.password === 'correctpassword') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              token: 'fake_jwt_token',
              user: {
                id: '1',
                email: 'valid@example.com',
                username: 'testuser'
              }
            })
          });
        }

        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Invalid credentials' })
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
  });

  it('successfully logs in with valid credentials', async () => {
    render(<Login />);

    // Find input fields and submit button
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill out login form
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });

    // Submit form
    fireEvent.click(submitButton);

    // Wait for login process
    await waitFor(() => {
      const dashboardTitle = screen.getByTestId('dashboard-title');
      expect(dashboardTitle).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify user context or localStorage token
    const storedToken = localStorage.getItem('token');
    expect(storedToken).toBe('fake_jwt_token');
  });

  it('handles login failure with invalid credentials', async () => {
    render(<Login />);

    // Find input fields and submit button
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    // Fill out login form with invalid credentials
    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit form
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      const errorMessage = screen.getByTestId('login-error-message');
      expect(errorMessage).toHaveTextContent('Invalid credentials');
    }, { timeout: 5000 });
  });

  afterAll(() => {
    // Reset fetch mock
    // @ts-ignore
    global.fetch.mockRestore();
  });
});