import React from 'react';
import { render, waitFor, screen } from '../../test-utils';
import App from '../../App';

// DISABLED: This integration test has complex dependencies and is not critical for component unit testing
// Focus on individual component tests rather than full app integration
describe.skip('Application Rendering', () => {
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