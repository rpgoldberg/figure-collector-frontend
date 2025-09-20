# Figure Collector Frontend

React frontend for the Figure Collector application. Provides a user interface for managing figure collections. Features comprehensive test coverage with React Testing Library and Jest.

## Features

- Advanced user authentication (register, login, profile, session management)
  - Token refresh and multiple session support
  - Secure logout options (single and all sessions)
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

# Run tests with coverage (default)
npm test

# Run tests in watch mode for development
npm test:watch

# Run tests for CI environment
npm test:ci
```

### Environment Variables

```bash
# Required for API communication
REACT_APP_API_URL=/api

# Optional for development
REACT_APP_BACKEND_URL=http://localhost:5070
```

### Authentication Endpoints

The frontend now supports the following authentication endpoints:

- `POST /auth/login`: User login with credentials
  - Returns user data and access token
  - Handles token refresh with a secure mechanism
- `POST /auth/register`: Create new user account
  - Validates input and returns registered user profile
- `POST /auth/refresh`: Refresh authentication token
  - Automatically handled by Axios interceptors
  - Prevents unauthorized access during token expiration
- `POST /auth/logout`: Logout from current session
  - Clears current session tokens
- `POST /auth/logout-all`: Logout from all active sessions
  - Invalidates all session tokens for the user
- `GET /auth/sessions`: Retrieve active user sessions
  - Allows users to manage and view current login sessions

#### Session Management Features

- **Advanced Multiple Session Support**
  - Authenticate from multiple devices
  - Centralized view of active sessions
  - Fine-grained session access control

- **Robust Token Management**
  - Automatic, transparent token refresh
  - Seamless protection against unauthorized access
  - Centralized, secure session management

- **Flexible Logout Options**
  - Per-session logout capabilities
  - Global session termination
  - Device-level session granularity

#### Security Highlights

- Token refresh mechanism prevents unnecessary re-authentication
- Axios interceptors handle token management transparently
- LocalStorage integration for persistent auth state
- Immediate redirect to login on token invalidation

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

- **Comprehensive Coverage Enhancement** (Latest):
  - Achieved 80%+ coverage on new/modified code for SonarCloud compliance
  - Added 45+ new tests covering critical uncovered lines and conditions
  - Fixed all failing tests in api/index.ts and FigureForm components
  - Enhanced Layout component tests with version management scenarios

- **Accessibility Testing**:
  - Enhanced jest-axe integration across all components
  - Comprehensive WCAG 2.1 AA compliance checks
  - Improved screen reader compatibility testing

- **Component Test Stability**:
  - Fixed test utilities for Layout and FigureList components
  - Improved mocking strategies for more realistic testing
  - Simplified Login component tests with focused input validation
  - Added comprehensive FigureForm validation and scraping tests

- **API Test Configuration**:
  - Improved Axios mocking configuration
  - Enhanced error scenario testing
  - More robust API interceptor tests
  - Complete coverage of auth functions (refreshToken, logout, sessions)

- **Test Reliability Enhancements**:
  - Resolved hanging promises in asynchronous tests
  - Improved async/await patterns
  - Better error tracking and state management
  - Fixed localStorage and window.location mocking issues

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

#### Test Coverage Files

Key test files providing comprehensive coverage:
- `src/api/__tests__/index.test.ts` - API interceptors and auth functions
- `src/components/__tests__/Layout.test.tsx` - Version management and UI
- `src/components/__tests__/FigureForm.*.test.tsx` - Form validation, scraping, conditions
- `src/test-utils.tsx` - Shared testing utilities and providers

#### Recommended Testing Workflow

```bash
# Run comprehensive test suite
npm test

# Run tests for a specific component
npm test ComponentName.test.tsx

# Generate test coverage report
npm test -- --coverage

# Run tests without coverage (faster)
npm test -- --no-coverage

# Run specific test suite
npm test -- src/api/__tests__/index.test.ts
```

**Note**: Our continuous testing approach ensures high-quality, reliable, and accessible frontend components across all user interaction scenarios.

## Docker Deployment

### Production Container
```bash
# Build production image
docker build -t frontend .

# Run container
docker run -p 3008:3008 frontend
```

### Test Container (Toggleable)
The test container (`Dockerfile.test`) can run in two modes:

```bash
# Build test image
docker build -f Dockerfile.test -t frontend:test .

# Mode 1: Run tests (default)
docker run frontend:test

# Mode 2: Run as service (for integration testing)
docker run -e RUN_SERVER=1 -p 3013:3013 frontend:test
```

**Features:**
- Default mode runs test suite with coverage
- Setting `RUN_SERVER=1` starts the development server instead
- Useful for integration testing scenarios
- Consistent behavior across all services

[... Rest of existing content remains the same ...]