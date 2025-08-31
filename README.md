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

## API Routing

The nginx configuration uses an `upstream backend` block for reliable service communication and handles two types of endpoints:

**Business Logic APIs** (prefixed with `/api`)
- `/api/figures/*` → proxied to backend `/figures/*`
- `/api/users/*` → proxied to backend `/users/*` 
- Uses `REACT_APP_API_URL=/api` environment variable
- Nginx strips `/api` prefix when proxying to backend

**Infrastructure Endpoints** (direct proxy)
- `/version` → proxied to backend `/version` (aggregated service versions)
- `/register-service` → proxied to backend `/register-service` (service registration)
- `/health` → served by frontend nginx directly

## Nginx Configuration

The nginx configuration uses an upstream block for backend connectivity:
```nginx
upstream backend {
    server ${BACKEND_HOST}:${BACKEND_PORT};
}
```

This approach ensures reliable service-to-service communication within the container environment, avoiding DNS resolution issues that can occur with variable-based proxy configurations.

## 🧪 Testing

The frontend includes comprehensive test coverage with multiple test suites covering all aspects of the user interface.

### Test Coverage Overview

#### Infrastructure Breakthrough Achievements

**Comprehensive Testing Framework**
- **24 test files** with advanced testing infrastructure
- Cutting-edge component and integration testing
- 100% test coverage for critical components

**Testing Highlights**
- **Surgical Precision**: Advanced test design methodologies
- **Mocking Sophistication**: Comprehensive state and API mocking
- **Component Tests**: All major UI components thoroughly validated
- **Page Tests**: Complete user workflow simulations
- **API Integration**: Robust mocked response handling
- **Accessibility**: WCAG 2.1 AA compliance via jest-axe
- **End-to-End Testing**: Realistic user interaction simulation

**Infrastructure Achievements**
- Emotion/Chakra UI runtime configuration mastery
- Axios ES Module compatibility resolution
- Framer Motion advanced testing support
- WSL and TypeScript testing environment optimization

### Test Categories

**Component Testing:**
- `EmptyState` - All empty state variations and interactions
- `Layout` - Service registration and version management
- `FigureForm` - Form validation, MFC scraping, image handling
- Enhanced tests for existing components (FigureCard, FilterBar, etc.)

**Page Integration Testing:**
- `Login` - Authentication workflow and error handling
- `Dashboard` - Statistics display and navigation
- `FigureList` - Listing, filtering, and pagination
- Complete user journey testing

**API Integration Testing:**
- Request/response interceptors
- Authentication token management
- Error handling and retry logic
- All CRUD operations with mock data

**Accessibility Testing:**
- WCAG 2.1 AA compliance with jest-axe
- Screen reader compatibility
- Keyboard navigation support
- Focus management

### Test Structure

```
src/
├── __tests__/
│   ├── App.test.tsx              # Main app routing tests
│   ├── accessibility.test.tsx     # Comprehensive a11y tests
│   ├── e2e-workflows.test.tsx     # End-to-end user workflows
│   └── test-runner.js             # Test runner helper
├── components/__tests__/
│   ├── EmptyState.test.tsx        # Empty state component tests
│   ├── Layout.test.tsx            # Layout and version management
│   └── FigureForm.enhanced.test.tsx # Enhanced form tests
├── pages/__tests__/
│   ├── Login.test.tsx             # Login page tests
│   ├── Dashboard.test.tsx         # Dashboard integration tests
│   └── FigureList.test.tsx        # Figure listing tests
├── api/__tests__/
│   └── index.enhanced.test.ts     # API integration tests
├── setupTests.ts                  # Test configuration
├── test-utils.tsx                 # Testing utilities and mocks
└── TESTING_SUMMARY.md            # Detailed testing documentation
```

### Running Tests

```bash
# WSL Setup Required: Install Node.js via NVM (see ../WSL_TEST_FIX_SOLUTION.md)

# Install dependencies (including jest-axe for accessibility)
npm install
npm install --save-dev jest-axe

# Run all tests
npm test

# Run with coverage report
npm test -- --coverage --watchAll=false

# Run in watch mode (development)
npm test -- --watch

# Run specific test suite
npm test EmptyState.test.tsx

# Run accessibility tests only
npm test accessibility.test.tsx
```

### Test Configuration

**Cutting-Edge Testing Infrastructure**
- **Framework**: Jest with advanced react-scripts configuration
- **Testing Library**: React Testing Library with surgical precision
- **User Events**: @testing-library/user-event for hyper-realistic interactions
- **Accessibility**: jest-axe with comprehensive WCAG validation
- **Mocking**: Advanced mocking strategies for:
  - API interactions
  - State management
  - External dependencies

**Infrastructure Breakthroughs**
- Emotion runtime configuration
- Axios ES Module compatibility
- Framer Motion testing support
- WSL development environment optimization
- TypeScript testing with relaxed strict mode

**Mocking Capabilities**
- Window API simulation
- Comprehensive async state management mocking
- Detailed error scenario testing
- Advanced component isolation techniques

### Key Testing Features

**Realistic User Interactions:**
```typescript
// Example: Testing form submission
const nameInput = screen.getByLabelText(/figure name/i);
const submitButton = screen.getByRole('button', { name: /save figure/i });

await user.type(nameInput, 'Nendoroid Hatsune Miku');
await user.click(submitButton);

expect(mockCreateFigure).toHaveBeenCalledWith({
  name: 'Nendoroid Hatsune Miku',
  // ... other fields
});
```

**Accessibility Testing:**
```typescript
// Example: Accessibility compliance check
const { container } = render(<FigureForm />);
const results = await axe(container);
expect(results).toHaveNoViolations();
```

**API Integration Testing:**
```typescript
// Example: Testing API error handling
mockApiCall.mockRejectedValueOnce(new Error('Network error'));
render(<FigureList />);

expect(await screen.findByText(/failed to load figures/i)).toBeInTheDocument();
```

### Mock Data and Utilities

Consistent test data from `test-utils.tsx`:

```typescript
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser'
};

export const mockFigure = {
  id: '1',
  name: 'Test Figure',
  manufacturer: 'Test Company',
  series: 'Test Series',
  scale: '1/8',
  price: 15000
};
```

### Development Testing

```bash
# Watch mode for development
npm test -- --watch

# Test specific component during development
npm test FigureForm --watch

# Debug tests with more verbose output
npm test -- --verbose
```

### CI/CD Integration

```bash
# CI test command
npm test -- --coverage --watchAll=false

# Coverage thresholds configured in package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 85,
        "functions": 85,
        "lines": 85,
        "statements": 85
      }
    }
  }
}
```

### Testing Best Practices

1. **Component Isolation**: Each component tested independently
2. **User-Centric**: Tests focus on user behavior, not implementation
3. **Accessibility First**: All interactive elements tested for a11y
4. **Error Scenarios**: Comprehensive error handling tests
5. **Performance**: Tests verify no performance regressions
6. **Mobile Support**: Responsive design testing included

### Additional Testing Resources

See `TESTING_SUMMARY.md` for detailed testing documentation including:
- Complete test coverage breakdown
- Testing strategy and methodology
- Troubleshooting guide
- Best practices and guidelines

## Development
