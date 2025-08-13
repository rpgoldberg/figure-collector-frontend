import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable retries for testing
      retry: false,
      // Disable caching for tests
      cacheTime: 0,
    },
  },
});

const AllProviders = ({ children, initialRoutes = ['/'] }: { 
  children: React.ReactNode, 
  initialRoutes?: string[] 
}) => {
  // Mock services and registration
  jest.spyOn(global, 'fetch').mockImplementation((url: string) => {
    if (url === '/register-service') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      } as Response);
    }
    if (url === '/version') {
      return Promise.resolve({
        json: () => Promise.resolve({
          application: { version: '1.0.0', releaseDate: '2025-01-01' },
          services: {
            frontend: { version: '1.0.0', status: 'ok' },
            backend: { version: '1.0.0', status: 'ok' },
            scraper: { version: '1.0.0', status: 'ok' }
          }
        })
      } as Response);
    }
    return Promise.reject(new Error('Not found'));
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <MemoryRouter initialEntries={initialRoutes}>
          {children}
        </MemoryRouter>
      </ChakraProvider>
    </QueryClientProvider>
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

export * from '@testing-library/react';
export { customRender as render, renderAsync };
export { screen } from '@testing-library/react';