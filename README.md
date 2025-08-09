# Figure Collector Frontend

React frontend for the Figure Collector application. Provides a user interface for managing figure collections.

## Features

- User authentication (register, login, profile)
- Figure management interface (add, edit, delete)
- Search and filter functionality
- Statistical dashboard
- Version display with service status and validation
- Self-registration with backend service for version tracking

## Technology Stack

- TypeScript
- React
- Chakra UI
- React Query
- React Router
- Nginx (for static serving and API proxying)

## Version Management

The frontend automatically registers its version with the backend service on startup. This eliminates circular dependencies and provides a clean architecture where:

- Frontend self-registers version from `package.json` on startup
- Backend acts as orchestrator for all service version information
- Version info is displayed in the footer with hover popup showing service details
