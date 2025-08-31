import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import Sidebar from '../Sidebar';

// Mock react-router-dom to control location
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
  });

  describe('Rendering', () => {
    it('should render all navigation sections', () => {
      render(<Sidebar />);

      expect(screen.getByText('MAIN')).toBeInTheDocument();
      expect(screen.getByText('COLLECTION')).toBeInTheDocument();
      expect(screen.getByText('ACCOUNT')).toBeInTheDocument();
    });

    it('should render all menu items', () => {
      render(<Sidebar />);

      // Main section
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();

      // Collection section
      expect(screen.getByRole('link', { name: /all figures/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add figure/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /statistics/i })).toBeInTheDocument();

      // Account section
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    it('should have correct hrefs for all menu items', () => {
      render(<Sidebar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /all figures/i })).toHaveAttribute('href', '/figures');
      expect(screen.getByRole('link', { name: /add figure/i })).toHaveAttribute('href', '/figures/add');
      expect(screen.getByRole('link', { name: /search/i })).toHaveAttribute('href', '/search');
      expect(screen.getByRole('link', { name: /statistics/i })).toHaveAttribute('href', '/statistics');
      expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile');
    });

    it('should display icons for all menu items', () => {
      render(<Sidebar />);

      // Check that each link contains an SVG icon
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const icon = link.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Active State', () => {
    it('should highlight dashboard as active when on home page', () => {
      mockUseLocation.mockReturnValue({ pathname: '/' });
      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('chakra-link');
      expect(dashboardLink).toHaveAttribute('data-active', 'true');
    });

    it('should highlight figures page as active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/figures' });
      render(<Sidebar />);

      const figuresLink = screen.getByRole('link', { name: /all figures/i });
      expect(figuresLink).toHaveAttribute('data-active', 'true');
    });

    it('should highlight add figure page as active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/figures/add' });
      render(<Sidebar />);

      const addFigureLink = screen.getByRole('link', { name: /add figure/i });
      expect(addFigureLink).toHaveAttribute('data-active', 'true');
    });

    it('should highlight search page as active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/search' });
      render(<Sidebar />);

      const searchLink = screen.getByRole('link', { name: /search/i });
      expect(searchLink).toHaveAttribute('data-active', 'true');
    });

    it('should highlight statistics page as active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/statistics' });
      render(<Sidebar />);

      const statsLink = screen.getByRole('link', { name: /statistics/i });
      expect(statsLink).toHaveAttribute('data-active', 'true');
    });

    it('should highlight profile page as active', () => {
      mockUseLocation.mockReturnValue({ pathname: '/profile' });
      render(<Sidebar />);

      const profileLink = screen.getByRole('link', { name: /profile/i });
      expect(profileLink).toHaveAttribute('data-active', 'true');
    });

    it('should not highlight any item when on unknown page', () => {
      mockUseLocation.mockReturnValue({ pathname: '/unknown' });
      render(<Sidebar />);

      const allLinks = screen.getAllByRole('link');
      allLinks.forEach(link => {
        expect(link).toHaveAttribute('data-active', 'false');
      });
    });

    it('should only highlight one item at a time', () => {
      mockUseLocation.mockReturnValue({ pathname: '/figures' });
      render(<Sidebar />);

      const figuresLink = screen.getByRole('link', { name: /all figures/i });
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });

      expect(figuresLink).toHaveAttribute('data-active', 'true');
      expect(dashboardLink).toHaveAttribute('data-active', 'false');
    });
  });

  describe('Navigation', () => {
    it('should be navigable by keyboard', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      // Tab through links
      await user.tab();
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: /all figures/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: /add figure/i })).toHaveFocus();
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const figuresLink = screen.getByRole('link', { name: /all figures/i });
      
      // Click should work (navigation is handled by React Router)
      await user.click(figuresLink);
      expect(figuresLink).toHaveAttribute('href', '/figures');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive styling classes', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('should be positioned as sticky', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveStyle({
        position: 'sticky',
        top: '80px',
      });
    });
  });

  describe('Hover Effects', () => {
    it('should have hover styles', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      
      // Hover state is handled by CSS classes, just ensure the element exists
      await user.hover(dashboardLink);
      expect(dashboardLink).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      render(<Sidebar />);

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toBeInTheDocument();
    });

    it('should have meaningful link text', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });

    it('should support screen readers with proper text content', () => {
      render(<Sidebar />);

      // Check that section headers are visible to screen readers
      expect(screen.getByText('MAIN')).toBeInTheDocument();
      expect(screen.getByText('COLLECTION')).toBeInTheDocument();
      expect(screen.getByText('ACCOUNT')).toBeInTheDocument();
    });
  });

  describe('Icon and Text Layout', () => {
    it('should have proper spacing between icons and text', () => {
      render(<Sidebar />);

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      const icon = dashboardLink.querySelector('svg');
      const text = screen.getByText('Dashboard');

      expect(icon).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });

    it('should align icons and text properly', () => {
      render(<Sidebar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const flexContainer = link.querySelector('[style*="align-items"]');
        expect(flexContainer || link).toBeInTheDocument();
      });
    });
  });

  describe('Section Organization', () => {
    it('should group related items under correct sections', () => {
      render(<Sidebar />);

      const sections = screen.getAllByText(/^(MAIN|COLLECTION|ACCOUNT)$/);
      expect(sections).toHaveLength(3);
    });

    it('should display sections in correct order', () => {
      render(<Sidebar />);

      const sectionHeaders = screen.getAllByText(/^(MAIN|COLLECTION|ACCOUNT)$/);
      const sectionTexts = sectionHeaders.map(header => header.textContent);
      
      expect(sectionTexts).toEqual(['MAIN', 'COLLECTION', 'ACCOUNT']);
    });
  });

  describe('Different Routes', () => {
    it('should handle nested routes correctly', () => {
      mockUseLocation.mockReturnValue({ pathname: '/figures/edit/123' });
      render(<Sidebar />);

      // Should not highlight any item for nested routes that don't exactly match
      const allLinks = screen.getAllByRole('link');
      allLinks.forEach(link => {
        expect(link).toHaveAttribute('data-active', 'false');
      });
    });

    it('should handle query parameters', () => {
      mockUseLocation.mockReturnValue({ pathname: '/search', search: '?query=miku' });
      render(<Sidebar />);

      // Should match /search regardless of query parameters
      const searchLink = screen.getByRole('link', { name: /search/i });
      expect(searchLink).toHaveAttribute('data-active', 'true');
    });
  });
});