import React from 'react';
import { render } from '../test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../App';

// Extend Jest expect to include accessibility checks
expect.extend(toHaveNoViolations);

describe('Application Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
