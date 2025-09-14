import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
// Removed createEmotionServer import
import createCache from '@emotion/cache';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable retries for testing
      retry: false,
      // Minimal caching for testing
      cacheTime: 1000,
      // Shorter stale time to simulate real-world loading
      staleTime: 0,
      // Longer timeout for async queries
      suspense: false,
      // Immediate refetching to simulate real-world behavior
      refetchOnWindowFocus: false,
      // Quick initial fetch
      refetchInterval: 0,
    },
  },
});

const AllProviders = ({ children, initialRoutes = ['/'] }: { 
  children: React.ReactNode, 
  initialRoutes?: string[] 
}) => {
  // Ensure emotion cache is unique for testing
  const emotionCache = createCache({ key: 'custom' });
// Removed extractCritical


  // Create theme with proper breakpoints for testing
  const testTheme = extendTheme({
    breakpoints: {
      base: '0px',
      sm: '320px', 
      md: '768px',
      lg: '960px',
      xl: '1200px',
      '2xl': '1536px',
    }
  });

  return (
    <CacheProvider value={emotionCache}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={testTheme}>
          <MemoryRouter initialEntries={initialRoutes}>
            {children}
          </MemoryRouter>
        </ChakraProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { 
    initialRoutes?: string[] 
  }
) => render(ui, { 
  wrapper: (props) => (
    <AllProviders 
      initialRoutes={options?.initialRoutes} 
      {...props} 
    />
  ), 
  ...options 
});

// Enhanced async utilities for React 18 testing
const renderAsync = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { 
    initialRoutes?: string[] 
  }
) => {
  const result = customRender(ui, options);
  await result.findByTestId('app-loaded'); // Assumes app has this attribute when fully loaded
  return result;
};

// Error boundary test helper
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong: {this.state.error?.message}</div>;
    }

    return this.props.children;
  }
}

// Render with error boundary for testing undefined data scenarios
const renderWithErrorBoundary = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { 
    initialRoutes?: string[];
    onError?: (error: Error) => void;
  }
) => {
  const { onError, ...renderOptions } = options || {};
  
  return customRender(
    <TestErrorBoundary onError={onError}>
      {ui}
    </TestErrorBoundary>,
    renderOptions
  );
};

// Mock data exports
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser'
};

export const mockFigure = {
  _id: '1',
  name: 'Test Figure',
  manufacturer: 'Test Company',
  series: 'Test Series',
  scale: '1/8',
  price: 15000,
  mfcLink: 'https://myfigurecollection.net/item/123456',
  imageUrl: 'https://example.com/test.jpg',
  location: 'Shelf A',
  boxNumber: 'Box 1',
  userId: '1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const mockStatsData = {
  totalCount: 10,
  manufacturerStats: [
    { _id: 'Good Smile Company', count: 5 },
    { _id: 'ALTER', count: 3 },
    { _id: 'Kotobukiya', count: 2 }
  ],
  scaleStats: [
    { _id: '1/8', count: 6 },
    { _id: '1/7', count: 3 },
    { _id: '1/6', count: 1 }
  ],
  locationStats: [
    { _id: 'Display Case', count: 5 },
    { _id: 'Storage Box', count: 3 },
    { _id: 'Shelf A', count: 2 }
  ]
};

export const mockPaginatedResponse = {
  success: true,
  count: 4,
  page: 1,
  pages: 1,
  total: 4,
  data: [
    { ...mockFigure, _id: '1', name: 'Figure 1' },
    { ...mockFigure, _id: '2', name: 'Figure 2' },
    { ...mockFigure, _id: '3', name: 'Figure 3' },
    { ...mockFigure, _id: '4', name: 'Figure 4' }
  ]
};

export * from '@testing-library/react';
export { customRender as render, renderAsync, renderWithErrorBoundary, TestErrorBoundary };
export { screen, waitFor, fireEvent, act } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';