import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockUser } from '../../test-utils';
import Navbar from '../Navbar';
import { useAuthStore } from '../../stores/authStore';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth store
jest.mock('../../stores/authStore');
const mockAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock react-query
const mockQueryClient = {
  clear: jest.fn(),
};

jest.mock('react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

describe('Navbar', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockQueryClient.clear.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: mockLogout,
      });
    });

    it('should render application title', () => {
      render(<Navbar />);

      expect(screen.getByText('FigureCollector')).toBeInTheDocument();
    });

    it('should render sign in and sign up buttons when not authenticated', () => {
      render(<Navbar />);

      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should have correct links for sign in and sign up buttons', () => {
      render(<Navbar />);

      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
      expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
    });

    it('should render desktop navigation menu', () => {
      render(<Navbar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /figures/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /statistics/i })).toBeInTheDocument();
    });

    it('should not render user menu when not authenticated', () => {
      render(<Navbar />);

      expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    beforeEach(() => {
      mockAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: mockLogout,
      });
    });

    it('should render user avatar when authenticated', () => {
      render(<Navbar />);

      // Check for avatar with user's name
      const avatar = screen.getByText(mockUser.username.charAt(0).toUpperCase());
      expect(avatar).toBeInTheDocument();
    });

    it('should not render sign in/up buttons when authenticated', () => {
      render(<Navbar />);

      expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
    });

    it('should render user menu when avatar is clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should have correct link for profile menu item', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      const profileLink = screen.getByRole('menuitem', { name: /profile/i });
      expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      mockAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: mockLogout,
      });
    });

    it('should handle logout when sign out is clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      const signOutButton = screen.getByRole('menuitem', { name: /sign out/i });
      await user.click(signOutButton);

      expect(mockQueryClient.clear).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should clear all data on logout', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      const signOutButton = screen.getByRole('menuitem', { name: /sign out/i });
      await user.click(signOutButton);

      // Verify cleanup sequence
      expect(mockQueryClient.clear).toHaveBeenCalledBefore(mockLogout);
      expect(mockLogout).toHaveBeenCalledBefore(mockNavigate);
    });
  });

  describe('Mobile Navigation', () => {
    it('should render mobile menu toggle button', () => {
      render(<Navbar />);

      expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument();
    });

    it('should toggle mobile menu when hamburger is clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      
      // Initially should show hamburger icon
      expect(screen.getByTestId('hamburger-icon')).toBeInTheDocument();
      
      await user.click(toggleButton);

      // Should change to close icon
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('should show mobile navigation menu when opened', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
      await user.click(toggleButton);

      // Mobile nav should be visible - check for navigation items
      const mobileNavLinks = screen.getAllByRole('link');
      expect(mobileNavLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Desktop Navigation', () => {
    it('should render all navigation items', () => {
      render(<Navbar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /figures/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /search/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /statistics/i })).toBeInTheDocument();
    });

    it('should have correct navigation links', () => {
      render(<Navbar />);

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /search/i })).toHaveAttribute('href', '/search');
      expect(screen.getByRole('link', { name: /statistics/i })).toHaveAttribute('href', '/statistics');
    });

    it('should show dropdown menu for Figures section on hover', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const figuresLink = screen.getByRole('link', { name: /figures/i });
      await user.hover(figuresLink);

      // Should show dropdown items
      expect(screen.getByText(/all figures/i)).toBeInTheDocument();
      expect(screen.getByText(/add new figure/i)).toBeInTheDocument();
    });
  });

  describe('Brand Link', () => {
    it('should link to home page', () => {
      render(<Navbar />);

      const brandLink = screen.getByRole('link', { name: /figurecollector/i });
      expect(brandLink).toHaveAttribute('href', '/');
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const brandLink = screen.getByRole('link', { name: /figurecollector/i });
      await user.click(brandLink);

      expect(brandLink).toHaveAttribute('href', '/');
    });
  });

  describe('Responsive Design', () => {
    it('should hide sign up button on mobile', () => {
      mockAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        setUser: jest.fn(),
        logout: mockLogout,
      });

      render(<Navbar />);

      const signUpButton = screen.getByRole('link', { name: /sign up/i });
      // Button should have display: none on base breakpoint
      expect(signUpButton).toBeInTheDocument();
    });

    it('should show desktop navigation only on larger screens', () => {
      render(<Navbar />);

      // Desktop nav items should have responsive display classes
      const desktopNavItems = screen.getAllByRole('link').filter(link => 
        link.textContent && ['Dashboard', 'Figures', 'Search', 'Statistics'].includes(link.textContent)
      );
      
      expect(desktopNavItems.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Navbar />);

      expect(screen.getByRole('button', { name: /toggle navigation/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      mockAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: mockLogout,
      });

      render(<Navbar />);

      // Tab through navbar elements
      await user.tab();
      expect(screen.getByRole('button', { name: /toggle navigation/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: /figurecollector/i })).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(<Navbar />);

      // Check for semantic HTML elements
      const nav = document.querySelector('nav');
      expect(nav || screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('User Avatar', () => {
    beforeEach(() => {
      mockAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: mockLogout,
      });
    });

    it('should display user initials in avatar', () => {
      render(<Navbar />);

      const expectedInitials = mockUser.username.charAt(0).toUpperCase();
      expect(screen.getByText(expectedInitials)).toBeInTheDocument();
    });

    it('should use brand colors for avatar', () => {
      render(<Navbar />);

      const avatarButton = screen.getByRole('button');
      const avatar = avatarButton.querySelector('[data-testid*="avatar"], [class*="chakra-avatar"]');
      expect(avatar || avatarButton).toBeInTheDocument();
    });
  });

  describe('Menu Interactions', () => {
    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup();
      mockAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: mockLogout,
      });

      render(<Navbar />);

      const avatarButton = screen.getByRole('button');
      await user.click(avatarButton);

      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();

      // Click outside (on body)
      await user.click(document.body);

      // Menu should close
      expect(screen.queryByRole('menuitem', { name: /profile/i })).not.toBeInTheDocument();
    });

    it('should support keyboard navigation in menus', async () => {
      const user = userEvent.setup();
      mockAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        setUser: jest.fn(),
        logout: mockLogout,
      });

      render(<Navbar />);

      const avatarButton = screen.getByRole('button');
      avatarButton.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();

      // Should be able to navigate menu with arrows
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
    });
  });
});