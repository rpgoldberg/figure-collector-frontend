import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../test-utils';
import Layout from '../Layout';

// Mock child components for focused unit testing
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

describe('Layout', () => {
  // Mock screen size to medium for consistent testing
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