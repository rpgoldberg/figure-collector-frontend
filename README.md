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

- Frontend self-registers version from `package.json` on startup via `/register-service` endpoint
- Backend acts as orchestrator for all service version information
- Version info is displayed in the footer with hover popup showing service details

## API Routing

<<<<<<< Updated upstream
The nginx configuration handles two types of endpoints:
=======
The nginx configuration uses an `upstream backend` block for reliable service communication and handles two types of endpoints:
>>>>>>> Stashed changes

**Business Logic APIs** (prefixed with `/api`)
- `/api/figures/*` → proxied to backend `/figures/*`
- `/api/users/*` → proxied to backend `/users/*` 
- Uses `REACT_APP_API_URL=/api` environment variable
<<<<<<< Updated upstream
=======
- Nginx strips `/api` prefix when proxying to backend
>>>>>>> Stashed changes

**Infrastructure Endpoints** (direct proxy)
- `/version` → proxied to backend `/version` (aggregated service versions)
- `/register-service` → proxied to backend `/register-service` (service registration)
- `/health` → served by frontend nginx directly
<<<<<<< Updated upstream
=======

## Nginx Configuration

The nginx configuration uses an upstream block for backend connectivity:
```nginx
upstream backend {
    server ${BACKEND_HOST}:${BACKEND_PORT};
}
```

This approach ensures reliable service-to-service communication within the container environment, avoiding DNS resolution issues that can occur with variable-based proxy configurations.
>>>>>>> Stashed changes
