# Figure Collector Frontend

React frontend for the Figure Collector application. Provides a user interface for managing figure collections. Features comprehensive test coverage with React Testing Library and Jest.

## Features

- User authentication (register, login, profile)
- Figure management interface (add, edit, delete)
- Search and filter functionality
- Statistical dashboard
- Version display with service status and validation
- Self-registration with backend service for version tracking

## Technology Stack

- TypeScript
- React 18
- Chakra UI
- React Query
- React Router
- React Hook Form
- Nginx (for static serving and API proxying)
- **Testing**: React Testing Library + Jest + jest-axe

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests in development
npm test -- --watch
```

### Environment Variables

```bash
# Required for API communication
REACT_APP_API_URL=/api

# Optional for development
REACT_APP_BACKEND_URL=http://localhost:5060
```

## Version Management

The frontend automatically registers its version with the backend service on startup. This eliminates circular dependencies and provides a clean architecture where:

- Frontend self-registers version from `package.json` on startup via `/register-service` endpoint
- Backend acts as orchestrator for all service version information
- Version info is displayed in the footer with hover popup showing service details

[... Rest of existing content ...]

## 🧪 Testing

### Continuous Testing Infrastructure Improvements

Our frontend testing infrastructure continues to evolve with significant enhancements across multiple areas:

#### Recent Test Improvements

- **Accessibility Testing**: 
  - Enhanced jest-axe integration across all components
  - Comprehensive WCAG 2.1 AA compliance checks
  - Improved screen reader compatibility testing

- **Component Test Stability**:
  - Fixed test utilities for Layout and FigureList components
  - Improved mocking strategies for more realistic testing
  - Simplified Login component tests with focused input validation

- **API Test Configuration**:
  - Improved Axios mocking configuration
  - Enhanced error scenario testing
  - More robust API interceptor tests

- **Test Reliability Enhancements**:
  - Resolved hanging promises in asynchronous tests
  - Improved async/await patterns
  - Better error tracking and state management

#### Key Testing Focus Areas

1. **Realistic User Interactions**
   - More precise form interaction simulations
   - Enhanced keyboard navigation testing
   - Comprehensive input validation scenarios

2. **Error Handling**
   - Extended coverage for error state testing
   - Improved fallback and error boundary tests
   - More sophisticated network error simulations

3. **Performance and Stability**
   - Reduced test flakiness
   - Optimized test execution time
   - Improved test isolation techniques

#### Recommended Testing Workflow

```bash
# Run comprehensive test suite
npm test

# Run tests for a specific component
npm test ComponentName.test.tsx

# Generate test coverage report
npm test -- --coverage
```

**Note**: Our continuous testing approach ensures high-quality, reliable, and accessible frontend components across all user interaction scenarios.

[... Rest of existing content remains the same ...]