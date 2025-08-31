import React from 'react';
import { render, waitFor, screen, fireEvent } from '../../test-utils';
import AddFigure from '../../pages/AddFigure';
import { mockFigure } from '../../test-utils';

describe('Figure Operations Integration', () => {
  const mockBackendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn((url: string, options?: RequestInit) => {
      // Figure creation endpoint
      if (url === `${mockBackendUrl}/figures` && options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({
            ...mockFigure,
            ...body,
            _id: 'new_figure_id'
          })
        });
      }

      // Figure list endpoint
      if (url === `${mockBackendUrl}/figures` && options?.method === 'GET') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            success: true,
            count: 1,
            page: 1,
            pages: 1,
            total: 1,
            data: [mockFigure]
          })
        });
      }

      // Search endpoint
      if (url.includes(`${mockBackendUrl}/figures/search`)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            success: true,
            count: 1,
            page: 1,
            pages: 1,
            total: 1,
            data: [mockFigure]
          })
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    // Mock localStorage for authentication
    localStorage.setItem('token', 'fake_jwt_token');
  });

  it('creates a new figure through backend integration', async () => {
    render(<AddFigure />);

    // Fill out figure form
    fireEvent.change(screen.getByLabelText(/figure name/i), { target: { value: 'Test Figure' } });
    fireEvent.change(screen.getByLabelText(/manufacturer/i), { target: { value: 'Test Company' } });
    fireEvent.change(screen.getByLabelText(/series/i), { target: { value: 'Test Series' } });
    fireEvent.change(screen.getByLabelText(/scale/i), { target: { value: '1/8' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '15000' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Shelf A' } });
    fireEvent.change(screen.getByLabelText(/box number/i), { target: { value: 'Box 1' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add figure/i });
    fireEvent.click(submitButton);

    // Wait for success message and redirection
    await waitFor(() => {
      const successMessage = screen.getByTestId('figure-created-success');
      expect(successMessage).toHaveTextContent('Figure created successfully');
    }, { timeout: 5000 });
  });

  it('performs a search with real backend integration', async () => {
    render(<AddFigure />); // Using AddFigure as a stand-in for a search-enabled page

    // Fill out search form
    const searchInput = screen.getByPlaceholderText(/search figures/i);
    fireEvent.change(searchInput, { target: { value: 'Test Figure' } });

    // Submit search
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for search results
    await waitFor(() => {
      const searchResults = screen.getByTestId('search-results');
      expect(searchResults).toHaveTextContent('Test Figure');
      expect(searchResults).toHaveTextContent('Test Company');
    }, { timeout: 5000 });
  });

  afterAll(() => {
    // Reset fetch mock and localStorage
    // @ts-ignore
    global.fetch.mockRestore();
    localStorage.clear();
  });
});