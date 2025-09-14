/**
 * Chakra UI Mock Utilities
 * Only mocks components actually used by the application
 */
import React from 'react';

// Helper to filter Chakra-specific props
const filterChakraProps = (props: any) => {
  const {
    // Layout props
    w, h, minW, maxW, minH, maxH,
    // Spacing props
    m, mt, mr, mb, ml, mx, my, p, pt, pr, pb, pl, px, py,
    // Color props
    bg, color, borderColor,
    // Typography props
    fontSize, fontWeight,
    // Other Chakra props
    colorScheme, variant, size, spacing, direction,
    ...domProps
  } = props;
  return domProps;
};

// Create basic component mock
const createMockComponent = (testId: string, element: string = 'div') =>
  React.forwardRef(({ children, ...props }: any, ref: any) =>
    React.createElement(element, {
      'data-testid': testId,
      ref,
      ...filterChakraProps(props),
    }, children)
  );

export const mockChakraComponents = {
  // Layout
  Box: createMockComponent('box'),
  Flex: createMockComponent('flex'),
  VStack: createMockComponent('vstack'),
  HStack: createMockComponent('hstack'),
  Container: createMockComponent('container'),
  
  // Typography
  Heading: createMockComponent('heading', 'h1'),
  Text: createMockComponent('text', 'p'),
  
  // Form
  Input: React.forwardRef((props: any, ref: any) =>
    React.createElement('input', {
      'data-testid': 'input',
      ref,
      ...filterChakraProps(props),
    })
  ),
  Button: React.forwardRef(({ children, isLoading, leftIcon, rightIcon, ...props }: any, ref: any) =>
    React.createElement('button', {
      'data-testid': 'button',
      ref,
      disabled: props.isDisabled || isLoading,
      ...filterChakraProps(props),
    }, [
      leftIcon && React.createElement('span', { key: 'left' }, leftIcon),
      isLoading && React.createElement('span', { key: 'spinner', role: 'status' }, 'Loading...'),
      children,
      rightIcon && React.createElement('span', { key: 'right' }, rightIcon),
    ].filter(Boolean))
  ),
  
  // Form Controls
  FormControl: createMockComponent('form-control'),
  FormLabel: createMockComponent('form-label', 'label'),
  FormErrorMessage: createMockComponent('form-error-message'),
  
  // Feedback
  Alert: createMockComponent('alert'),
  AlertIcon: createMockComponent('alert-icon'),
  AlertTitle: createMockComponent('alert-title'),
  AlertDescription: createMockComponent('alert-description'),
  
  // Data Display
  Card: createMockComponent('card'),
  CardHeader: createMockComponent('card-header'),
  CardBody: createMockComponent('card-body'),
  
  // Navigation
  Link: React.forwardRef(({ children, href, to, ...props }: any, ref: any) =>
    React.createElement('a', {
      'data-testid': 'link',
      ref,
      href: href || to,
      ...filterChakraProps(props),
    }, children)
  ),
};

export const mockUseToast = () => jest.fn((options: any) => ({
  id: 'mock-toast',
  status: options?.status || 'info',
  title: options?.title,
  description: options?.description,
}));

export const mockUseDisclosure = () => ({
  isOpen: false,
  onOpen: jest.fn(),
  onClose: jest.fn(),
  onToggle: jest.fn(),
});