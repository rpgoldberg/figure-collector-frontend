## Figure Collector Frontend Primer Command

**IMPORTANT**: This is the figure-collector-frontend service - a React/TypeScript frontend application with Chakra UI for the Figure Collector application.

### Step 1: Service Configuration
1. Read `CLAUDE.md` for service-specific configuration and agent instructions
2. Understand this service's role as the user interface for the Figure Collector application

### Step 2: Service Structure Analysis

**React Application Structure**:
- Read `src/index.tsx` and `src/App.tsx` for application bootstrap and routing
- Read `src/pages/` to understand page components and user workflows
- Read `src/components/` for reusable UI components and their responsibilities
- Read `src/stores/` for Zustand state management (auth, global state)
- Read `src/api/` for backend API integration and data fetching

**UI and Styling**:
- Review Chakra UI theme configuration in `src/theme.ts`
- Understand component styling patterns and responsive design
- Check accessibility implementations and ARIA compliance

**Testing Structure**:
- Examine `src/__tests__/` directory for current test coverage
- Review Jest configuration in `jest.config.js`
- Check React Testing Library setup and utilities
- Review accessibility testing with jest-axe

**Build and Development**:
- Review `package.json` for dependencies and npm scripts
- Check TypeScript configuration in `tsconfig.json`
- Review Docker configuration and nginx setup
- Check build optimization and bundle configuration

### Step 3: Service Understanding

**User Interface Components**:
- Figure management: Display, search, create, edit figure collections
- User authentication: Login, registration, profile management
- Dashboard: User overview and figure statistics
- Search and filtering: Advanced figure search capabilities
- Responsive design: Mobile and desktop compatibility

**State Management**:
- Zustand stores for authentication and global state
- Local component state for UI interactions
- API data caching and synchronization
- Form state management and validation

**API Integration**:
- RESTful API calls to backend service
- Authentication token management
- Error handling and user feedback
- Loading states and optimistic updates

### Step 4: Available Tools and Agents

**Available Sub-Agents**:
- `test-generator-frontend` (Haiku) - Jest + React Testing Library + MSW test generation
- `documentation-manager` (Haiku) - Documentation synchronization
- `validation-gates` - Testing and validation specialist

**Development Commands**:
- `npm start` - Development server with hot reload
- `npm run build` - Production build optimization
- `npm run test` - Jest test execution
- `npm run test:coverage` - Test coverage reporting
- `npm run lint` - ESLint code linting
- `npm run typecheck` - TypeScript type checking

### Step 5: Summary Report

After analysis, provide:
- **Service Purpose**: User interface for Figure Collector application
- **Technology Stack**: React, TypeScript, Chakra UI, Zustand, React Router
- **Key Functionality**: Figure browsing/management, user auth, search, responsive UI
- **Component Architecture**: Page components, reusable UI components, layout structure
- **State Management**: Zustand stores and local component state patterns
- **API Integration**: Backend communication, auth token handling, error management
- **Testing Strategy**: React Testing Library, accessibility testing, API mocking
- **UI/UX Features**: Responsive design, accessibility compliance, modern interface
- **Development Workflow**: Setup, testing, building, and deployment processes

**Remember**: This service is the primary user interface - user experience, accessibility, and performance are critical considerations for all changes.