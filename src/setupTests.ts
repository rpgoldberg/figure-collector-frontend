import React from 'react';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { configure } from '@testing-library/react';

// Mock react-query completely for v3 compatibility - MUST BE FIRST
jest.mock('react-query', () => {
  const mockReact = require('react');
  
  const MockQueryClient = function(options) {
    this.defaultOptions = options?.defaultOptions || {};
    this.clear = jest.fn();
    this.invalidateQueries = jest.fn();
    this.setQueryData = jest.fn();
    this.getQueryData = jest.fn();
  };

  const MockQueryClientProvider = ({ children, client, ...props }) =>
    mockReact.createElement('div', { 'data-testid': 'query-client-provider', ...props }, children);

  return {
    __esModule: true,
    QueryClient: MockQueryClient,
    QueryClientProvider: MockQueryClientProvider,
    useQuery: jest.fn((queryKey) => {
      // Return specific mock data based on query key
      let data = null;
      if (queryKey === 'figureStats') {
        data = {
          manufacturerStats: [
            { _id: 'Good Smile Company', count: 5 },
            { _id: 'ALTER', count: 3 },
          ],
          scaleStats: [
            { _id: '1/8', count: 6 },
            { _id: '1/7', count: 3 },
          ],
          locationStats: [
            { _id: 'Display Case', count: 5 },
            { _id: 'Storage Box', count: 3 },
          ]
        };
      } else if (queryKey === 'recentFigures') {
        data = {
          success: true,
          count: 4,
          page: 1,
          pages: 1,
          total: 4,
          data: [
            { _id: '1', name: 'Test Figure 1', manufacturer: 'Test Company' },
            { _id: '2', name: 'Test Figure 2', manufacturer: 'Test Company' },
            { _id: '3', name: 'Test Figure 3', manufacturer: 'Test Company' },
            { _id: '4', name: 'Test Figure 4', manufacturer: 'Test Company' },
          ]
        };
      } else if (queryKey === 'dashboardStats') {
        data = {
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
      }
      
      return {
        data,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
        refetch: jest.fn(() => Promise.resolve({ data })),
        isFetched: true,
      };
    }),
    useQueryClient: jest.fn(() => ({
      clear: jest.fn(),
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
      getQueryData: jest.fn(),
    })),
    useMutation: jest.fn(() => ({
      mutate: jest.fn(),
      mutateAsync: jest.fn(() => Promise.resolve({})),
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
      reset: jest.fn(),
    })),
  };
});

// Global Emotion runtime configuration for testing
global.__emotion_real = {
  cache: {
    name: 'css',
    styles: '',
    next: undefined,
    key: 'css',
    compat: undefined
  }
};

global.__EMOTION_RUNTIME_CONFIG__ = {
  cache: {
    name: 'css',
    styles: '',
    next: undefined,
    key: 'css',
    compat: undefined
  }
};

// Enhance Testing Library configuration for React 18
configure({
  // Increased timeout to match Jest global timeout
  asyncUtilTimeout: 15000,
  testIdAttribute: 'data-testid',
  // Avoid throwing for query suggestions; use lint rules instead
  throwSuggestions: false,
  // More aggressive error tracking for debugging
  asyncWrapper: async (cb) => {
    try {
      return await cb();
    } catch (error) {
      console.error('Async test failure:', error);
      throw error;
    }
  }
});

// Enhanced global error handling for async tests
const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
  console.error('Unhandled Async Test Failure:', {
    reason: event.reason,
    type: typeof event.reason,
    stack: event.reason instanceof Error ? event.reason.stack : 'No stack trace'
  });
  
  // Don't throw in tests to avoid infinite timeout loops
  event.preventDefault();
};
global.addEventListener('unhandledrejection', unhandledRejectionHandler);

// Mock timers to prevent infinite waits
global.setTimeout = ((cb: Function, delay?: number) => {
  // Force immediate execution for test environment
  const id = Math.random();
  Promise.resolve().then(() => cb());
  return id as any;
}) as any;

global.clearTimeout = jest.fn();
global.setInterval = jest.fn();
global.clearInterval = jest.fn();

// Robust matchMedia polyfill for components/libraries that rely on it (e.g., framer-motion)
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      let listeners: Array<(e: MediaQueryListEvent) => void> = [];
      const mql: MediaQueryList = {
        media: query,
        matches: false,
        onchange: null,
        addListener: (cb: (e: MediaQueryListEvent) => void) => {
          listeners.push(cb);
        },
        removeListener: (cb: (e: MediaQueryListEvent) => void) => {
          listeners = listeners.filter(l => l !== cb);
        },
        addEventListener: (_: 'change', cb: (e: MediaQueryListEvent) => void) => {
          listeners.push(cb);
        },
        removeEventListener: (_: 'change', cb: (e: MediaQueryListEvent) => void) => {
          listeners = listeners.filter(l => l !== cb);
        },
        dispatchEvent: (event: Event) => {
          listeners.forEach(cb => cb(event as MediaQueryListEvent));
          return true;
        }
      } as any;
      return mql;
    }
  });
} else {
  // Ensure required methods exist for environments providing a partial implementation
  const originalMatchMedia = window.matchMedia.bind(window);
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      const mql: any = originalMatchMedia(query);
      mql.addListener = mql.addListener || ((cb: any) => mql.addEventListener && mql.addEventListener('change', cb));
      mql.removeListener = mql.removeListener || ((cb: any) => mql.removeEventListener && mql.removeEventListener('change', cb));
      mql.addEventListener = mql.addEventListener || (() => {});
      mql.removeEventListener = mql.removeEventListener || (() => {});
      mql.dispatchEvent = mql.dispatchEvent || (() => true);
      return mql;
    }
  });
}

// Mock window.scrollTo for Framer Motion animations
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});


// Create a simple, reliable mock axios instance
const createMockAxiosInstance = () => {
  const instance: any = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: {
      headers: { common: {}, delete: {}, head: {}, patch: {}, post: {}, put: {} },
    },
  };
  return instance;
};

// Create the global mock instance that tests can access
const mockApiInstance = createMockAxiosInstance();

// Make it globally available
(global as any).mockApiInstance = mockApiInstance;

// Create mock toast function
const mockToast = jest.fn((options: any) => {
  console.log('Mock toast called with:', options);
  return {
    id: 'mock-toast-id',
    status: options.status || 'info',
    title: options.title,
    description: options.description,
    onClose: jest.fn(),
    isActive: true,
  };
});


// Comprehensive axios mock to prevent ES module import issues
jest.mock('axios', () => {
  const mockAxios = {
    ...mockApiInstance,
    create: jest.fn(() => mockApiInstance), // Always return the same instance for consistency
  };
  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});

// Mock react-icons to provide consistent icon components for testing
jest.mock('react-icons/fa', () => {
  const mockReact = require('react');
  
  return {
    __esModule: true,
    FaHome: () => mockReact.createElement('span', { 'data-testid': 'fa-home' }, '🏠'),
    FaCube: () => mockReact.createElement('span', { 'data-testid': 'fa-cube' }, '📦'),
    FaPlus: () => mockReact.createElement('span', { 'data-testid': 'fa-plus' }, '+'),
    FaSearch: () => mockReact.createElement('span', { 'data-testid': 'fa-search' }, '🔍'),
    FaChartBar: () => mockReact.createElement('span', { 'data-testid': 'fa-chart-bar' }, '📊'),
    FaUser: () => mockReact.createElement('span', { 'data-testid': 'fa-user' }, '👤'),
    FaEye: () => mockReact.createElement('span', { 'data-testid': 'fa-eye' }, '👁'),
    FaEyeSlash: () => mockReact.createElement('span', { 'data-testid': 'fa-eye-slash' }, '🙈'),
    FaChevronLeft: () => mockReact.createElement('span', { 'data-testid': 'fa-chevron-left' }, '◀'),
    FaChevronRight: () => mockReact.createElement('span', { 'data-testid': 'fa-chevron-right' }, '▶'),
    FaFilter: () => mockReact.createElement('span', { 'data-testid': 'fa-filter' }, '🔽'),
    FaSortAmountDown: () => mockReact.createElement('span', { 'data-testid': 'fa-sort-amount-down' }, '↓'),
    FaEdit: () => mockReact.createElement('span', { 'data-testid': 'fa-edit' }, '✏️'),
    FaTrash: () => mockReact.createElement('span', { 'data-testid': 'fa-trash' }, '🗑️'),
    FaBoxOpen: () => mockReact.createElement('span', { 'data-testid': 'fa-box-open' }, '📦'),
    FaLink: () => mockReact.createElement('span', { 'data-testid': 'fa-link' }, '🔗'),
    FaQuestionCircle: () => mockReact.createElement('span', { 'data-testid': 'fa-question-circle' }, '❓'),
    FaImage: () => mockReact.createElement('span', { 'data-testid': 'fa-image' }, '🖼️'),
    FaUser: () => mockReact.createElement('span', { 'data-testid': 'fa-user' }, '👤'),
    FaSignOutAlt: () => mockReact.createElement('span', { 'data-testid': 'fa-sign-out-alt' }, '🚪'),
    FaFilter: () => mockReact.createElement('span', { 'data-testid': 'fa-filter' }, '🔍'),
    FaTimes: () => mockReact.createElement('span', { 'data-testid': 'fa-times' }, '✕'),
  };
});

// Mock Chakra UI icons
jest.mock('@chakra-ui/icons', () => {
  const mockReact = require('react');
  return {
    __esModule: true,
    HamburgerIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'hamburger-icon', 
        ref,
        ...props 
      }, '☰')
    ),
    CloseIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'close-icon', 
        ref,
        ...props 
      }, '✕')
    ),
    ChevronDownIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'chevron-down-icon', 
        ref,
        ...props 
      }, '⌄')
    ),
    ChevronRightIcon: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'chevron-right-icon', 
        ref,
        ...props 
      }, '›')
    ),
  };
});

// Mock Chakra UI utils to resolve module dependency issues  
jest.mock('@chakra-ui/utils', () => {
  const mockReact = require('react');
  
  return {
    __esModule: true,
    // Context utilities
    createContext: jest.fn((options) => {
      const mockContext = mockReact.createContext(options?.defaultValue || {});
      const mockProvider = ({ children, value, ...rest }: any) => 
        mockReact.createElement(mockContext.Provider, { value: value || {}, ...rest }, children);
      const mockUseContext = () => mockReact.useContext(mockContext);
      
      return [mockProvider, mockUseContext, mockContext];
    }),
    // Common utilities that tests might need
    runIfFn: jest.fn((valueOrFn, ...args) => 
      typeof valueOrFn === 'function' ? valueOrFn(...args) : valueOrFn
    ),
    omit: jest.fn((obj, keys) => {
      const result = { ...obj };
      keys.forEach((key: string) => delete result[key]);
      return result;
    }),
    pick: jest.fn((obj, keys) => {
      const result: any = {};
      keys.forEach((key: string) => {
        if (key in obj) result[key] = obj[key];
      });
      return result;
    }),
    callAllHandlers: jest.fn((...handlers) => (event: any) => {
      handlers.forEach(handler => {
        if (typeof handler === 'function') {
          handler(event);
        }
      });
    }),
  };
});

// Enhanced Chakra UI React mock with comprehensive component coverage
jest.mock('@chakra-ui/react', () => {
  const mockReact = require('react');
  
  // Create mock components that render as appropriate semantic elements for testing
  const createMockComponent = (name: string, element: string = 'div') => 
    mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement(element, { 
        'data-testid': name, 
        ref, 
        ...props 
      }, children)
    );

  return {
    // Mock toast hook - need to use a prefixed name
    useToast: () => {
      return jest.fn((options: any) => {
        console.log('Mock toast called with:', options);
        return {
          id: 'mock-toast-id',
          status: options?.status || 'info',
          title: options?.title,
          description: options?.description,
          onClose: jest.fn(),
          isActive: true,
        };
      });
    },
    // Mock theme extending
    extendTheme: jest.fn((theme) => ({
      ...theme,
      breakpoints: theme?.breakpoints || {},
      colors: theme?.colors || {},
      fonts: theme?.fonts || {},
    })),
    // Mock commonly used components that might have issues
    ChakraProvider: ({ children }: any) => mockReact.createElement('div', {}, children),
    Box: mockReact.forwardRef(({ children, as, ...props }: any, ref: any) =>
      mockReact.createElement(as || 'div', { 
        'data-testid': 'box', 
        ref,
        ...props 
      }, children)
    ),
    Flex: createMockComponent('flex'),
    VStack: createMockComponent('vstack'),
    HStack: createMockComponent('hstack'),
    Button: mockReact.forwardRef(({ children, as, to, href, leftIcon, rightIcon, ...props }: any, ref: any) => {
      // Filter out Chakra-specific props that shouldn't be passed to DOM
      const { colorScheme, variant, size, isLoading, isDisabled, ...domProps } = props;
      
      // Handle RouterLink buttons - as={RouterLink} or as={Link} or to prop present
      if (as || to) {
        return mockReact.createElement('a', { 
          'data-testid': 'button', 
          ref,
          href: to || href,
          disabled: isDisabled || isLoading,
          ...domProps 
        }, [
          leftIcon && mockReact.createElement('span', { key: 'left-icon', 'data-testid': 'left-icon' }, leftIcon),
          children,
          rightIcon && mockReact.createElement('span', { key: 'right-icon', 'data-testid': 'right-icon' }, rightIcon)
        ].filter(Boolean));
      }
      
      return mockReact.createElement('button', { 
        'data-testid': 'button', 
        ref,
        disabled: isDisabled || isLoading,
        ...domProps 
      }, [
        leftIcon && mockReact.createElement('span', { key: 'left-icon', 'data-testid': 'left-icon' }, leftIcon),
        children,
        rightIcon && mockReact.createElement('span', { key: 'right-icon', 'data-testid': 'right-icon' }, rightIcon)
      ].filter(Boolean));
    }),
    IconButton: mockReact.forwardRef(({ children, isDisabled, isLoading, icon, ...props }: any, ref: any) =>
      mockReact.createElement('button', { 
        'data-testid': 'icon-button', 
        ref,
        disabled: isDisabled || isLoading,
        ...props 
      }, [icon, children])
    ),
    Input: mockReact.forwardRef(({ placeholder, ...props }: any, ref: any) =>
      mockReact.createElement('input', { 
        'data-testid': 'input', 
        ref,
        placeholder,
        ...props 
      })
    ),
    Checkbox: createMockComponent('checkbox', 'input'),
    Select: createMockComponent('select', 'select'),
    Textarea: createMockComponent('textarea', 'textarea'),
    FormControl: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'form-control', 
        ref,
        ...props 
      }, children)
    ),
    FormLabel: mockReact.forwardRef(({ children, htmlFor, ...props }: any, ref: any) =>
      mockReact.createElement('label', { 
        'data-testid': 'form-label', 
        ref,
        htmlFor,
        ...props 
      }, children)
    ),
    FormErrorMessage: createMockComponent('form-error-message'),
    Alert: createMockComponent('alert'),
    AlertIcon: createMockComponent('alert-icon'),
    AlertTitle: createMockComponent('alert-title'),
    AlertDescription: createMockComponent('alert-description'),
    // Additional components used by Login
    Heading: createMockComponent('heading', 'h1'),
    Text: createMockComponent('text', 'p'),
    Link: mockReact.forwardRef(({ children, href, isExternal, as, to, ...props }: any, ref: any) => {
      // Handle both Chakra UI Link and Router Link
      const element = as === require('react-router-dom').Link ? 'a' : 'a';
      const linkProps = {
        'data-testid': 'link',
        ref,
        href: href || (to ? to : undefined),
        ...(isExternal && { target: '_blank', rel: 'noopener noreferrer' }),
        ...props
      };
      return mockReact.createElement(element, linkProps, children);
    }),
    Icon: createMockComponent('icon', 'span'),
    InputGroup: createMockComponent('input-group'),
    InputRightElement: createMockComponent('input-right-element'),
    // Grid and layout components
    Grid: createMockComponent('grid'),
    GridItem: createMockComponent('grid-item'),
    Container: createMockComponent('container'),
    Spacer: createMockComponent('spacer'),
    Center: createMockComponent('center'),
    Stack: createMockComponent('stack'),
    // Other commonly used components
    Image: mockReact.forwardRef(({ src, alt, fallbackSrc, ...props }: any, ref: any) =>
      mockReact.createElement('img', { 
        'data-testid': 'image', 
        ref,
        src: src || fallbackSrc || '/placeholder.png',
        alt: alt || '',
        ...props 
      })
    ),
    Spinner: createMockComponent('spinner'),
    Badge: createMockComponent('badge'),
    Card: createMockComponent('card'),
    CardHeader: createMockComponent('card-header'),
    CardBody: createMockComponent('card-body'),
    CardFooter: createMockComponent('card-footer'),
    // Stats components
    Stat: createMockComponent('stat'),
    StatLabel: createMockComponent('stat-label'),
    StatNumber: createMockComponent('stat-number'),
    StatHelpText: createMockComponent('stat-help-text'),
    // Grid components
    SimpleGrid: createMockComponent('simple-grid'),
    Grid: createMockComponent('grid'),
    GridItem: createMockComponent('grid-item'),
    Divider: createMockComponent('divider', 'hr'),
    // Tooltip component for help text
    Tooltip: mockReact.forwardRef(({ children, label, ...props }: any, ref: any) =>
      mockReact.createElement('span', { 
        'data-testid': 'tooltip', 
        ref,
        'aria-label': label,
        title: label,
        ...props 
      }, children)
    ),
    // Navbar specific components
    Collapse: mockReact.forwardRef(({ children, in: isOpen, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'collapse', 
        ref,
        style: { display: isOpen ? 'block' : 'none' },
        ...props 
      }, children)
    ),
    Popover: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'popover', 
        ref,
        ...props 
      }, children)
    ),
    PopoverTrigger: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'popover-trigger', 
        ref,
        ...props 
      }, children)
    ),
    PopoverContent: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'popover-content', 
        ref,
        ...props 
      }, children)
    ),
    Avatar: mockReact.forwardRef(({ name, ...props }: any, ref: any) => {
      const initials = name ? name.charAt(0).toUpperCase() : 'U';
      return mockReact.createElement('div', { 
        'data-testid': 'avatar', 
        ref,
        role: 'img',
        'aria-label': `Avatar for ${name || 'user'}`,
        ...props 
      }, initials);
    }),
    Menu: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'menu', 
        ref,
        ...props 
      }, children)
    ),
    MenuButton: mockReact.forwardRef(({ children, as, ...props }: any, ref: any) => {
      const Component = as || 'button';
      return mockReact.createElement(Component, { 
        'data-testid': 'menu-button', 
        ref,
        ...props 
      }, children);
    }),
    MenuList: mockReact.forwardRef(({ children, ...props }: any, ref: any) =>
      mockReact.createElement('div', { 
        'data-testid': 'menu-list', 
        ref,
        role: 'menu',
        ...props 
      }, children)
    ),
    MenuItem: mockReact.forwardRef(({ children, as, to, href, icon, onClick, ...props }: any, ref: any) => {
      const Component = as || 'div';
      const itemProps = {
        'data-testid': 'menu-item',
        ref,
        role: 'menuitem',
        onClick,
        ...(to && { href: to }),
        ...(href && { href }),
        ...props
      };
      return mockReact.createElement(Component, itemProps, [
        icon && mockReact.createElement('span', { key: 'icon' }, icon),
        children
      ].filter(Boolean));
    }),
    MenuDivider: mockReact.forwardRef((props: any, ref: any) =>
      mockReact.createElement('hr', { 
        'data-testid': 'menu-divider', 
        ref,
        role: 'separator',
        ...props 
      })
    ),
    // Chakra UI hooks
    useColorModeValue: jest.fn((light) => light),
    useBreakpointValue: jest.fn((values) => values?.base || values),
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
      onToggle: jest.fn(),
    }),
  };
});

// Direct React Hook Form mock with proper exports
jest.mock('react-hook-form', () => {
  // Create a persistent form state that can be shared between test calls
  let globalFormState = {};

  return {
    __esModule: true,
    useForm: jest.fn(() => {
      // Initialize form state for this useForm call
      const formState = {
        manufacturer: '',
        name: '',
        scale: '',
        mfcLink: '',
        location: '',
        boxNumber: '',
        imageUrl: '',
        ...globalFormState
      };

      return {
        register: jest.fn(() => ({
          name: 'test',
          onChange: jest.fn(),
          onBlur: jest.fn(),
          ref: jest.fn(),
        })),
        handleSubmit: jest.fn((onSubmit) => jest.fn((e) => {
          e?.preventDefault?.();
          onSubmit?.(formState);
        })),
        formState: {
          errors: {},
          isSubmitting: false,
          isValid: true,
          isDirty: false,
          isSubmitted: false,
        },
        watch: jest.fn(() => ''),
        setValue: jest.fn((name, value) => {
          formState[name] = value;
          globalFormState[name] = value;
        }),
        getValues: jest.fn(() => formState),
        reset: jest.fn((newValues) => {
          Object.keys(formState).forEach(key => {
            formState[key] = newValues?.[key] || '';
          });
          globalFormState = { ...formState };
        }),
        trigger: jest.fn(() => Promise.resolve(true)),
        clearErrors: jest.fn(),
        setError: jest.fn(),
        control: {},
      };
    }),
    Controller: ({ render }) => render({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        name: 'test'
      },
      fieldState: {
        error: null
      }
    })
  };
});

// Note: Consolidated react-query mock is at the top of this file