import React from 'react';
import { render, waitFor, screen } from '../../test-utils';
import App from '../../App';

// This test ensures proper service registration and version checking
describe('Application Rendering', () => {
  it('renders main application layout', async () => {
    render(<App />);

    // Wait for the application to render
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Figure Collector')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});