/**
 * Comprehensive tests for Layout component
 * Targeting uncovered lines: 29, 36-45, 51, 81, 85, 95-138
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Layout from '../Layout';

// Mock child components
jest.mock('../Navbar', () => {
  return function Navbar() {
    return <div data-testid="mock-navbar">Navbar</div>;
  };
});

jest.mock('../Sidebar', () => {
  return function Sidebar() {
    return <div data-testid="mock-sidebar">Sidebar</div>;
  };
});

// Mock Outlet from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="mock-outlet">Page Content</div>,
}));

// Mock fetch
global.fetch = jest.fn();

const renderLayout = () => {
  return render(
    <ChakraProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic rendering', () => {
    it('should render basic layout structure', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true }) // register-service
        .mockResolvedValueOnce({ json: async () => ({}), ok: true }); // version

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Line 29: response.json() after registration', () => {
    it('should cover response.json() call in registerFrontend', async () => {
      const mockResponse = { success: true, message: 'Registered' };
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockResponse),
          ok: true
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({}),
          ok: true
        });

      renderLayout();

      await waitFor(() => {
        const firstCall = (global.fetch as jest.Mock).mock.calls[0];
        expect(firstCall[0]).toBe('/register-service');
        expect(firstCall[1].method).toBe('POST');
        expect(JSON.parse(firstCall[1].body)).toEqual({
          serviceName: 'frontend',
          version: '1.1.0',
          name: 'figure-collector-frontend'
        });
      });
    });

    it('should handle registration failure gracefully', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Registration failed'))
        .mockResolvedValueOnce({ json: async () => ({}), ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Lines 36-45: fetchVersionInfo function and error handling', () => {
    it('should cover fetchVersionInfo success path', async () => {
      const mockVersionData = {
        application: { version: '1.2.0', releaseDate: '2024-01-15' },
        services: {
          frontend: { version: '1.1.0', status: 'ok' },
          backend: { version: '2.0.0', status: 'ok' }
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({
          json: async () => mockVersionData,
          ok: true
        });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText(/v1.2.0 • 2024-01-15/)).toBeInTheDocument();
      });
    });

    it('should cover fetchVersionInfo HTTP error path (line 39-40)', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' })
        });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        // Should not show version info when fetch fails
        expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
      });
    });

    it('should cover fetchVersionInfo catch block (lines 43-45)', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockRejectedValueOnce(new Error('Network error'));

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        // Should not show version info when network fails
        expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Line 51: setTimeout callback', () => {
    it('should cover setTimeout callback execution', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => ({}), ok: true });

      renderLayout();

      // Fast forward the setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenNthCalledWith(2, '/version');
      });
    });
  });

  describe('Line 81: versionInfo conditional (1 of 2 conditions)', () => {
    it('should show version info when versionInfo exists', async () => {
      const mockVersionData = {
        application: { version: '1.0.0', releaseDate: '2024-01-01' }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText(/v1.0.0 • 2024-01-01/)).toBeInTheDocument();
      });
    });

    it('should not show version info when versionInfo is null', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockRejectedValueOnce(new Error('No version data'));

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.queryByText(/v\d+\.\d+\.\d+/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Line 85: application?.version and releaseDate fallbacks', () => {
    it('should use fallback values when application data is missing', async () => {
      const mockVersionData = {
        services: {
          frontend: { version: '1.0.0', status: 'ok' }
        }
        // No application field
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText(/vunknown • unknown/)).toBeInTheDocument();
      });
    });

    it('should use fallback when application.version is missing', async () => {
      const mockVersionData = {
        application: { releaseDate: '2024-01-01' }, // No version
        services: {}
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText(/vunknown • 2024-01-01/)).toBeInTheDocument();
      });
    });
  });

  describe('Lines 95-138: Popover content rendering', () => {
    it('should render service badges and status', async () => {
      const mockVersionData = {
        application: { version: '1.0.0', releaseDate: '2024-01-01' },
        services: {
          frontend: { version: '1.1.0', status: 'ok' },
          backend: { version: '2.0.0', status: 'error' },
          scraper: { version: '1.5.0', status: 'ok' }
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      // Wait for version info to load first
      await waitFor(() => {
        expect(screen.getByText(/v1.0.0 • 2024-01-01/)).toBeInTheDocument();
      });

      // Trigger popover by hovering over version text
      const versionText = screen.getByText(/v1.0.0 • 2024-01-01/);
      fireEvent.mouseEnter(versionText);

      await waitFor(() => {
        expect(screen.getByText('Service Versions')).toBeInTheDocument();
        expect(screen.getByText('Frontend:')).toBeInTheDocument();
        expect(screen.getByText('Backend:')).toBeInTheDocument();
        expect(screen.getByText('Scraper:')).toBeInTheDocument();
        expect(screen.getByText('v1.1.0')).toBeInTheDocument();
        expect(screen.getByText('v2.0.0')).toBeInTheDocument();
        expect(screen.getByText('v1.5.0')).toBeInTheDocument();
      });
    });

    it('should render validation status when present', async () => {
      const mockVersionData = {
        application: { version: '1.0.0', releaseDate: '2024-01-01' },
        services: {
          frontend: { version: '1.1.0', status: 'ok' }
        },
        validation: {
          valid: true,
          status: 'tested',
          message: 'All systems operational'
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      // Wait for version info to load first
      await waitFor(() => {
        expect(screen.getByText(/v1.0.0 • 2024-01-01/)).toBeInTheDocument();
      });

      // Trigger popover by hovering over version text
      const versionText = screen.getByText(/v1.0.0 • 2024-01-01/);
      fireEvent.mouseEnter(versionText);

      await waitFor(() => {
        expect(screen.getByText('Validation:')).toBeInTheDocument();
        expect(screen.getByText('Tested')).toBeInTheDocument();
        expect(screen.getByText('All systems operational')).toBeInTheDocument();
      });
    });

    it('should render validation warnings when present', async () => {
      const mockVersionData = {
        application: { version: '1.0.0', releaseDate: '2024-01-01' },
        services: {
          frontend: { version: '1.1.0', status: 'ok' }
        },
        validation: {
          valid: false,
          status: 'warning',
          message: 'Minor issues detected',
          warnings: ['Version mismatch', 'Performance degraded']
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      // Wait for version info to load first
      await waitFor(() => {
        expect(screen.getByText(/v1.0.0 • 2024-01-01/)).toBeInTheDocument();
      });

      // Trigger popover by hovering over version text
      const versionText = screen.getByText(/v1.0.0 • 2024-01-01/);
      fireEvent.mouseEnter(versionText);

      await waitFor(() => {
        expect(screen.getByText('Validation:')).toBeInTheDocument();
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByText('Minor issues detected')).toBeInTheDocument();
        expect(screen.getByText('• Version mismatch')).toBeInTheDocument();
        expect(screen.getByText('• Performance degraded')).toBeInTheDocument();
      });
    });

    it('should handle different validation statuses', async () => {
      const mockVersionData = {
        application: { version: '1.0.0', releaseDate: '2024-01-01' },
        services: {
          frontend: { version: '1.1.0', status: 'ok' }
        },
        validation: {
          valid: false,
          status: 'compatible'
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      // Wait for version info to load first
      await waitFor(() => {
        expect(screen.getByText(/v1.0.0 • 2024-01-01/)).toBeInTheDocument();
      });

      // Trigger popover by hovering over version text
      const versionText = screen.getByText(/v1.0.0 • 2024-01-01/);
      fireEvent.mouseEnter(versionText);

      await waitFor(() => {
        expect(screen.getByText('Compatible')).toBeInTheDocument();
      });
    });

    it('should handle missing service version and status', async () => {
      const mockVersionData = {
        application: { version: '1.0.0', releaseDate: '2024-01-01' },
        services: {
          frontend: {}, // No version or status
          backend: { version: '2.0.0' }, // No status
          scraper: { status: 'ok' } // No version
        }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => ({}), ok: true })
        .mockResolvedValueOnce({ json: async () => mockVersionData, ok: true });

      renderLayout();

      // Advance timers to trigger setTimeout
      jest.advanceTimersByTime(100);

      // Wait for version info to load first
      await waitFor(() => {
        expect(screen.getByText(/v1.0.0 • 2024-01-01/)).toBeInTheDocument();
      });

      // Trigger popover by hovering over version text
      const versionText = screen.getByText(/v1.0.0 • 2024-01-01/);
      fireEvent.mouseEnter(versionText);

      await waitFor(() => {
        // Should show 'unknown' for missing values
        expect(screen.getAllByText('vunknown')).toHaveLength(2); // frontend and scraper
        expect(screen.getAllByText('(unknown)')).toHaveLength(2); // frontend and backend status
      });
    });
  });
});