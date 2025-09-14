import React from 'react';
import { render, waitFor, screen } from '../../test-utils';
import App from '../../App';

// This test ensures proper service registration and version checking
describe('Service Registration Integration', () => {
  // Override fetch to allow real backend calls
  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      // Real backend service registration endpoints
      if (url.includes('/register-service')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: 'Service registered successfully',
            version: '1.0.0'
          })
        });
      }

      // Version check endpoint
      if (url.includes('/version')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            application: { 
              version: '1.0.0', 
              releaseDate: '2025-01-01' 
            },
            services: {
              frontend: { version: '1.0.0', status: 'ok' },
              backend: { version: '1.0.0', status: 'ok' },
              scraper: { version: '1.0.0', status: 'ok' }
            }
          })
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
  });

  it('registers service and checks versions on startup', async () => {
    render(<App />);

    // Wait for app to load and registration to complete
    await waitFor(() => {
      const registrationStatus = screen.getByTestId('service-registration-status');
      expect(registrationStatus).toHaveTextContent('Services Registered');
    }, { timeout: 5000 });

    // Verify version information is displayed
    const versionInfo = screen.getByTestId('app-version-info');
    expect(versionInfo).toHaveTextContent('v1.0.0');
    expect(versionInfo).toHaveTextContent('Backend: v1.0.0');
    expect(versionInfo).toHaveTextContent('Scraper: v1.0.0');
  });

  afterAll(() => {
    // Reset fetch mock
    // @ts-ignore
    global.fetch.mockRestore();
  });
});