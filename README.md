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

### SHALLTEAR PROTOCOL Test Infrastructure Improvements

The SHALLTEAR PROTOCOL introduced significant enhancements to our frontend testing infrastructure:

#### Key Improvements

- **Enhanced Test Performance**: Surgical precision in addressing test hanging issues
- **Comprehensive Timeout Management**: 
  - Extended test timeouts to handle complex async scenarios
  - Improved promise resolution and test stability
- **Advanced Component Testing**:
  - Fixed hanging promises in `FigureList.test.tsx`
  - Resolved infinite test loops in `Login.test.tsx`
- **Robust Setup Infrastructure**:
  - Enhanced `setupTests.ts` for more reliable test execution
  - Improved test configuration to handle complex component interactions

#### Specific Test Fixes

1. **Promise Handling**:
   - Resolved race conditions in asynchronous component tests
   - Implemented more robust async/await patterns
   - Added comprehensive error tracking

2. **Component Interaction Testing**:
   - Improved mocking strategies for complex component interactions
   - Enhanced user event simulation
   - Better state management in test environments

3. **Error Scenario Coverage**:
   - Extended error handling test coverage
   - Implemented more sophisticated error state testing
   - Added comprehensive fallback and error boundary tests

#### Performance Considerations

- Optimized test execution time
- Reduced flakiness in complex test scenarios
- Improved test isolation techniques

#### Recommended Testing Workflow

```bash
# Run tests with enhanced infrastructure
npm test

# Debug specific component tests
npm test ComponentName.test.tsx

# Generate comprehensive coverage report
npm test -- --coverage
```

**Note**: The SHALLTEAR PROTOCOL represents a breakthrough in our frontend testing methodology, providing more reliable, performant, and comprehensive test coverage.

[... Rest of existing content remains the same ...]