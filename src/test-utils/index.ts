/**
 * Test Utilities Index
 * Centralized imports for testing utilities
 */

export * from './mocks';

// Re-export commonly used testing utilities
export { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';
export { axe, toHaveNoViolations } from 'jest-axe';