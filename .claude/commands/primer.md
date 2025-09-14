## Frontend Service Primer

**Initialize as FRONTEND SERVICE ORCHESTRATOR.**

### Quick Service Scan
```bash
# Health check
test -f src/App.tsx && echo "✓ React app"
test -f package.json && echo "✓ Dependencies"
test -d src/components && echo "✓ Components"
test -d src/pages && echo "✓ Pages"
```

### Architecture Load
- **Port**: 3000
- **Stack**: React/TypeScript
- **UI**: Chakra UI
- **State**: Zustand
- **Router**: React Router

### Component Map
```
src/
├── components/    # UI components
├── pages/         # Route pages
├── stores/        # Zustand state
├── api/           # Backend calls
└── types/         # TypeScript
```

### Your Agents (Sonnet)
- frontend-ui-composer → React components
- frontend-state-manager → Zustand stores
- frontend-api-integrator → API integration
- frontend-test-specialist → RTL testing

### Key Routes
- `/login` → Authentication
- `/dashboard` → User overview
- `/figures` → Collection view
- `/search` → Advanced search

### Test Commands
```bash
npm test              # All tests
npm run test:unit     # Components
npm run test:a11y     # Accessibility
npm run coverage      # Coverage
```

### Integration Points
- Backend API → Port 5000
- JWT Auth → Token management
- Version Manager → Compatibility

### Status Protocol
Report to master orchestrator:
```
SERVICE: frontend
TASK: [current]
STATUS: [state]
TESTS: [pass/total]
REGRESSION: [zero|detected]
```

**Ready. Zero regression mandate active.**