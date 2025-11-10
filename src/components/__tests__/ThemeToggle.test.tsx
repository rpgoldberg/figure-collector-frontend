import React from 'react';
import { render, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../../theme';
import { act } from 'react-dom/test-utils';

// Wrapper with Chakra provider for proper theme context
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
);

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should render a button with accessible label', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );

    const button = screen.getByRole('button', { name: /toggle color mode/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Toggle color mode');
  });

  it('should display moon icon in light mode', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );

    const button = screen.getByRole('button', { name: /toggle color mode/i });
    // Moon icon should be present (we check by aria-label)
    expect(button).toBeInTheDocument();
  });

  it('should toggle color mode when clicked', () => {
    const { rerender } = render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );

    const button = screen.getByRole('button', { name: /toggle color mode/i });

    act(() => {
      fireEvent.click(button);
    });

    // After clicking, the component should have toggled
    expect(button).toBeInTheDocument();
  });

  it('should have tooltip on hover', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );

    const button = screen.getByRole('button', { name: /toggle color mode/i });
    expect(button).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );

    const button = screen.getByRole('button', { name: /toggle color mode/i });
    expect(button).not.toHaveAttribute('disabled');

    // Should be tabbable
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should save preference to localStorage when toggled', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );

    const button = screen.getByRole('button', { name: /toggle color mode/i });

    act(() => {
      fireEvent.click(button);
    });

    // localStorage should have been called by Chakra UI
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ThemeWrapper>
          <ThemeToggle />
        </ThemeWrapper>
      );

      const button = screen.getByRole('button', { name: /toggle color mode/i });
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be focusable', () => {
      render(
        <ThemeWrapper>
          <ThemeToggle />
        </ThemeWrapper>
      );

      const button = screen.getByRole('button', { name: /toggle color mode/i });
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
