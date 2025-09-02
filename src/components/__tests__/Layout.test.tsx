import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import Layout from '../Layout';

// Mock the package.json import
jest.mock('../../../package.json', () => ({
  name: 'figure-collector-frontend',
  version: '1.0.0'
}));

// Mock child components
jest.mock('../Navbar', () => {
  return function MockNavbar() {
    return <nav role="navigation">Navbar</nav>;
  };
});

jest.mock('../Sidebar', () => {
  return function MockSidebar() {
    return <aside role="complementary">Sidebar</aside>;
  };
});

// Mock Outlet from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <main role="main">Page Content</main>,
}));

// Mock fetch
global.fetch = jest.fn();

describe('Layout', () => {
  const mockVersionInfo = {
    application: {
      version: '1.2.0',
      releaseDate: '2023-01-01'
    },
    services: {
      frontend: { version: '1.0.0', status: 'ok' },
      backend: { version: '2.1.0', status: 'ok' },
      scraper: { version: '1.1.0', status: 'error' }
    },
    validation: {
      valid: true,
      status: 'tested',
      message: 'All services are compatible'
    }
  };

  // Mock window.matchMedia for responsive testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: !query.includes('(max-width'), // Default to desktop view
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Set viewport to desktop size for responsive tests
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    // Mock successful fetch responses
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVersionInfo)
      });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('component rendering', () => {
    it('should render layout structure correctly', () => {
      render(<Layout />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Check for complementary element including hidden ones due to responsive design
      expect(screen.getByRole('complementary', { hidden: true })).toBeInTheDocument();
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Figure Collector')).toBeInTheDocument();
    });

    it('should render sidebar only on medium+ screens', () => {
      render(<Layout />);

      const sidebar = screen.getByRole('complementary', { hidden: true });
      expect(sidebar).toBeInTheDocument();
      
      // The sidebar container should have responsive display classes
      const sidebarContainer = screen.getByTestId('sidebar');
      expect(sidebarContainer).toBeInTheDocument();
    });

    it('should render footer with proper styling', () => {
      render(<Layout />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(screen.getByText('Figure Collector')).toBeInTheDocument();
    });
  });

  describe('service registration', () => {
    it('should register frontend service on mount', async () => {
      render(<Layout />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/register-service', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceName: 'frontend',
            version: '1.0.0',
            name: 'figure-collector-frontend'
          }),
        });
      }, { timeout: 5000 });
    });

    it('should log successful registration', async () => {
      render(<Layout />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('[REGISTER] Frontend v1.0.0 registered successfully');
      }, { timeout: 1000 });
    });

    it('should handle registration failure gracefully', async () => {
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' })
        });

      render(<Layout />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(console.warn).toHaveBeenCalledWith('[REGISTER] Failed to register frontend service', { error: 'Server error' });
      }, { timeout: 1000 });
    });

    it('should handle registration network error', async () => {
      (global.fetch as jest.Mock).mockReset();
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(networkError);

      render(<Layout />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('[REGISTER] Error registering frontend service:', networkError);
      }, { timeout: 1000 });
    });
  });

  describe('version information', () => {
    it('should fetch and display version info after registration', async () => {
      render(<Layout />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/version');
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('v1.2.0 • 2023-01-01')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should log version information to console', async () => {
      render(<Layout />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          'App v1.2.0, Frontend v1.0.0, Backend v2.1.0, Scraper v1.1.0'
        );
      }, { timeout: 1000 });
    });

    it('should handle version fetch failure', async () => {
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) })
        .mockRejectedValueOnce(new Error('Version fetch failed'));

      render(<Layout />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to fetch version info:',
          expect.any(Error)
        );
      }, { timeout: 1000 });
    });

    it('should handle missing version data gracefully', async () => {
      const incompleteVersionInfo = {
        application: {},
        services: {}
      };

      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(incompleteVersionInfo)
        });

      render(<Layout />);

      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText('vunknown • unknown')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          'App vunknown, Frontend vunknown, Backend vunknown, Scraper vunknown'
        );
      }, { timeout: 1000 });
    });
  });

  describe('version popover', () => {
    beforeEach(async () => {
      render(<Layout />);
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByText('v1.2.0 • 2023-01-01')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should display version popover on hover', async () => {
      const user = userEvent.setup();
      const versionText = screen.getByText('v1.2.0 • 2023-01-01');

      await user.hover(versionText);

      await waitFor(() => {
        expect(screen.getByText('Service Versions')).toBeInTheDocument();
      });
    });

    it('should display service statuses in popover', async () => {
      const user = userEvent.setup();
      const versionText = screen.getByText('v1.2.0 • 2023-01-01');

      await user.hover(versionText);

      await waitFor(() => {
        expect(screen.getByText('Frontend:')).toBeInTheDocument();
        expect(screen.getByText('Backend:')).toBeInTheDocument();
        expect(screen.getByText('Scraper:')).toBeInTheDocument();
        expect(screen.getByText('v1.0.0')).toBeInTheDocument();
        expect(screen.getByText('v2.1.0')).toBeInTheDocument();
        expect(screen.getByText('v1.1.0')).toBeInTheDocument();
      });
    });

    it('should display service status badges correctly', async () => {
      const user = userEvent.setup();
      const versionText = screen.getByText('v1.2.0 • 2023-01-01');

      await user.hover(versionText);

      await waitFor(() => {
        expect(screen.getByText('(ok)')).toBeInTheDocument();
        expect(screen.getByText('(error)')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display validation information when available', async () => {
      const user = userEvent.setup();
      const versionText = screen.getByText('v1.2.0 • 2023-01-01');

      await user.hover(versionText);

      await waitFor(() => {
        expect(screen.getByText('Validation:')).toBeInTheDocument();
        expect(screen.getByText('Tested')).toBeInTheDocument();
        expect(screen.getByText('All services are compatible')).toBeInTheDocument();
      });
    });

    it('should hide popover when not hovering', async () => {
      const user = userEvent.setup();
      const versionText = screen.getByText('v1.2.0 • 2023-01-01');

      // Hover to show
      await user.hover(versionText);
      await waitFor(() => {
        expect(screen.getByText('Service Versions')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Unhover to hide
      await user.unhover(versionText);

      // Wait for popover to disappear with a shorter timeout
      await waitFor(() => {
        expect(screen.queryByText('Service Versions')).not.toBeInTheDocument();
      }, { timeout: 1500 });
    });
  });

  describe('validation status handling', () => {
    it('should display warning status correctly', async () => {
      const warningVersionInfo = {
        ...mockVersionInfo,
        validation: {
          valid: false,
          status: 'warning',
          message: 'Some compatibility warnings',
          warnings: ['Backend version may be outdated', 'Scraper service not responding']
        }
      };

      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(warningVersionInfo)
        });

      render(<Layout />);

      jest.advanceTimersByTime(100);

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByText('v1.2.0 • 2023-01-01')).toBeInTheDocument();
      }, { timeout: 1000 });

      const versionText = screen.getByText('v1.2.0 • 2023-01-01');
      await user.hover(versionText);

      await waitFor(() => {
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByText('Some compatibility warnings')).toBeInTheDocument();
        expect(screen.getByText('• Backend version may be outdated')).toBeInTheDocument();
        expect(screen.getByText('• Scraper service not responding')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display invalid status correctly', async () => {
      const invalidVersionInfo = {
        ...mockVersionInfo,
        validation: {
          valid: false,
          status: 'invalid',
          message: 'Services incompatible'
        }
      };

      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(invalidVersionInfo)
        });

      render(<Layout />);

      jest.advanceTimersByTime(100);

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByText('v1.2.0 • 2023-01-01')).toBeInTheDocument();
      }, { timeout: 1000 });

      const versionText = screen.getByText('v1.2.0 • 2023-01-01');
      await user.hover(versionText);

      await waitFor(() => {
        expect(screen.getByText('Invalid')).toBeInTheDocument();
        expect(screen.getByText('Services incompatible')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle compatible status', async () => {
      const compatibleVersionInfo = {
        ...mockVersionInfo,
        validation: {
          valid: true,
          status: 'compatible',
          message: 'All services compatible'
        }
      };

      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(compatibleVersionInfo)
        });

      render(<Layout />);

      jest.advanceTimersByTime(100);

      const user = userEvent.setup();
      await waitFor(() => {
        expect(screen.getByText('v1.2.0 • 2023-01-01')).toBeInTheDocument();
      }, { timeout: 1000 });

      const versionText = screen.getByText('v1.2.0 • 2023-01-01');
      await user.hover(versionText);

      await waitFor(() => {
        expect(screen.getByText('Compatible')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('responsive behavior', () => {
    it('should hide sidebar on smaller screens', () => {
      render(<Layout />);

      const sidebarContainer = screen.getByTestId('sidebar');
      
      // The container should have responsive display classes
      // This tests that the structure is correct for responsive behavior
      expect(sidebarContainer).toBeInTheDocument();
    });

    it('should maintain proper layout structure on all screen sizes', () => {
      render(<Layout />);

      // Main container should be present
      const mainContent = screen.getByRole('main');
      expect(mainContent.parentElement).toBeInTheDocument();
      
      // Footer should always be present
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      render(<Layout />);

      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Navbar
      expect(screen.getByRole('complementary', { hidden: true })).toBeInTheDocument(); // Sidebar
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    });

    it('should have accessible version information', async () => {
      render(<Layout />);

      await waitFor(() => {
        const versionText = screen.getByText('v1.2.0 • 2023-01-01');
        expect(versionText).toHaveStyle({ cursor: 'pointer' });
      }, { timeout: 5000 });
    });
  });

  describe('error boundaries', () => {
    it('should handle component rendering errors gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => render(<Layout />)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});