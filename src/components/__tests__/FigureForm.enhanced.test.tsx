import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockFigure } from '../../test-utils';
import FigureForm from '../FigureForm';
import { FigureFormData } from '../../types';

// Increase Jest timeout for async operations
jest.setTimeout(60000);

// Mock fetch for MFC scraping
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

// Mock console methods to reduce noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Mock useToast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

describe('Enhanced FigureForm Tests', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  // Enhanced waitFor with better error handling and browser pool timing
  const waitForFormPopulation = async (expectedValues: Record<string, string>, timeout = 15000) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        for (const [field, expectedValue] of Object.entries(expectedValues)) {
          const input = screen.getByLabelText(new RegExp(field, 'i'));
          if (input.getAttribute('value') !== expectedValue) {
            throw new Error(`${field} not yet populated with ${expectedValue}`);
          }
        }
        return; // All fields populated successfully
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    throw new Error(`Form fields not populated within ${timeout}ms`);
  };

  // Enhanced waitFor with better error handling
  const waitForStable = async (callback: () => void | Promise<void>, options: { timeout?: number, interval?: number } = {}) => {
    const { timeout = 10000, interval = 50 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await callback();
        return;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    throw new Error(`waitForStable timed out after ${timeout}ms`);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFetch.mockClear();
    mockToast.mockClear();
  });

  afterEach(() => {
    if (jest.isMockFunction(setTimeout)) {
      jest.runOnlyPendingTimers();
    }
    jest.useRealTimers();
  });

  describe('Form Validation - Required Fields', () => {
    it('should validate manufacturer field is required', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/figure name/i);
      await user.type(nameInput, 'Test Figure');
      
      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/manufacturer is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate figure name field is required', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      await user.type(manufacturerInput, 'Test Manufacturer');
      
      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/figure name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit successfully when all required fields are filled', async () => {
       const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
       render(<FigureForm {...defaultProps} />);

       const manufacturerInput = screen.getByLabelText(/manufacturer/i);
       const nameInput = screen.getByLabelText(/figure name/i);

       await user.type(manufacturerInput, 'Test Manufacturer');
       await user.type(nameInput, 'Test Figure');

       const submitButton = screen.getByRole('button', { name: /add figure/i });
       await user.click(submitButton);

       await waitFor(() => {
         expect(mockOnSubmit).toHaveBeenCalledWith({
           manufacturer: 'Test Manufacturer',
           name: 'Test Figure',
           scale: '',
           mfcLink: '',
           location: '',
           boxNumber: '',
           imageUrl: '',
         });
       }, { timeout: 20000 });
     }, 30000);

    it('should not show validation errors initially', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.queryByText(/manufacturer is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/figure name is required/i)).not.toBeInTheDocument();
    });

    it('should clear validation errors when valid input is provided', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      // First trigger validation error
      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/manufacturer is required/i)).toBeInTheDocument();
      });

      // Then provide valid input
      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      await user.type(manufacturerInput, 'Valid Manufacturer');

      // Error should disappear
      await waitFor(() => {
        expect(screen.queryByText(/manufacturer is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('URL Validation', () => {
    it('should validate MFC link URL format', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'invalid-url');
      
      // Fill required fields to trigger validation
      await user.type(screen.getByLabelText(/manufacturer/i), 'Test Manufacturer');
      await user.type(screen.getByLabelText(/figure name/i), 'Test Figure');
      
      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
      });
    });

    it('should validate image URL format', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const imageInput = screen.getByLabelText(/image url/i);
      await user.type(imageInput, 'not-a-url');
      
      // Fill required fields to trigger validation
      await user.type(screen.getByLabelText(/manufacturer/i), 'Test Manufacturer');
      await user.type(screen.getByLabelText(/figure name/i), 'Test Figure');
      
      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
      });
    });

    it('should accept valid URLs', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const validUrls = [
        'https://myfigurecollection.net/item/123456',
        'http://example.com/image.jpg',
        'https://cdn.example.com/path/to/image.png'
      ];

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      const imageInput = screen.getByLabelText(/image url/i);

      for (const url of validUrls.slice(0, 1)) { // Test MFC link
        await user.clear(mfcInput);
        await user.type(mfcInput, url);
        await user.tab();
        
        await waitFor(() => {
          expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
        });
      }

      for (const url of validUrls.slice(1)) { // Test image URLs
        await user.clear(imageInput);
        await user.type(imageInput, url);
        await user.tab();
        
        await waitFor(() => {
          expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
        });
      }
    });

    it('should allow empty URLs (optional fields)', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      const imageInput = screen.getByLabelText(/image url/i);

      await user.clear(mfcInput);
      await user.clear(imageInput);
      await user.tab();

      expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
    });

    it('should handle URLs with special characters', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const specialUrls = [
        'https://example.com/image?param=value&other=test',
        'https://example.com/path/with spaces/image.jpg',
        'https://example.com/image.jpg#section',
        'https://sub.domain.com:8080/path/image.png',
      ];

      const imageInput = screen.getByLabelText(/image url/i);

      for (const url of specialUrls) {
        await user.clear(imageInput);
        await user.type(imageInput, url);
        await user.tab();
        
        // These should be considered valid URLs
        expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
      }
    });
  });

  describe('Scale Formatting', () => {
    it('should format decimal scale input to fraction format', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const scaleInput = screen.getByPlaceholderText(/1\/8.*1\/7.*Nendoroid/i);

      // Test various decimal inputs
      const testCases = [
        { input: '0.125', expected: '1/8' },
        { input: '0.143', expected: '1/7' }, // approximately
        { input: '0.167', expected: '1/6' }, // approximately
        { input: '0.25', expected: '1/4' },
        { input: '0.5', expected: '1/2' },
      ];

      for (const testCase of testCases) {
        await user.clear(scaleInput);
        await user.type(scaleInput, testCase.input);
        await user.tab(); // Trigger onBlur

        await waitFor(() => {
          expect(scaleInput).toHaveValue(testCase.expected);
        });
      }
    });

    it('should preserve existing fraction format', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const scaleInput = screen.getByPlaceholderText(/1\/8.*1\/7.*Nendoroid/i);

      const fractionInputs = ['1/8', '1/7', '1/6', '1/4'];

      for (const fraction of fractionInputs) {
        await user.clear(scaleInput);
        await user.type(scaleInput, fraction);
        await user.tab();

        expect(scaleInput).toHaveValue(fraction);
      }
    });

    it('should preserve non-numeric scale values', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const scaleInput = screen.getByPlaceholderText(/1\/8.*1\/7.*Nendoroid/i);

      const nonNumericScales = ['Nendoroid', 'Figma', 'Prize Figure', 'Life Size'];

      for (const scale of nonNumericScales) {
        await user.clear(scaleInput);
        await user.type(scaleInput, scale);
        await user.tab();

        expect(scaleInput).toHaveValue(scale);
      }
    });

    it('should handle invalid decimal inputs gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const scaleInput = screen.getByPlaceholderText(/1\/8.*1\/7.*Nendoroid/i);

      const invalidInputs = ['abc', '0', '-1', '2.5', 'invalid'];

      for (const input of invalidInputs) {
        await user.clear(scaleInput);
        await user.type(scaleInput, input);
        await user.tab();

        // Should preserve original input for invalid formats
        expect(scaleInput).toHaveValue(input);
      }
    });
  });

  // NOTE: MFC Scraping Functionality tests moved to figure-collector-integration-tests
  // These are cross-service integration tests that require backend API coordination
  // ALBEDO HYBRID PROTOCOL: Strategic isolation of 7 integration tests

  describe('Image Preview Functionality', () => {
    it('should show image preview when valid image URL is entered', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const imageInput = screen.getByLabelText(/image url/i);
      await user.type(imageInput, 'https://example.com/image.jpg');

      await waitFor(() => {
        expect(screen.getByText('Image Preview:')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Figure preview' })).toBeInTheDocument();
      });
    });

    it('should handle image load errors', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const imageInput = screen.getByLabelText(/image url/i);
      await user.type(imageInput, 'https://example.com/invalid-image.jpg');

      // Wait for image to appear
      const image = await screen.findByRole('img', { name: 'Figure preview' });
      
      // Simulate image load error
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      });
    });

    it('should reset image error when URL changes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const imageInput = screen.getByLabelText(/image url/i);
      
      // Enter invalid URL and trigger error
      await user.type(imageInput, 'https://example.com/bad-image.jpg');
      
      const image = await screen.findByRole('img', { name: 'Figure preview' });
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      });

      // Change URL
      await user.clear(imageInput);
      await user.type(imageInput, 'https://example.com/good-image.jpg');

      // Error should be reset
      await waitFor(() => {
        expect(screen.queryByText('Failed to load image')).not.toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Figure preview' })).toBeInTheDocument();
      });
    });

    it('should not show image preview for empty URL', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.queryByText('Image Preview:')).not.toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'Figure preview' })).not.toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('should open MFC link in new tab when link icon is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123456');

      const linkButton = screen.getByRole('button', { name: /open mfc link/i });
      await user.click(linkButton);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://myfigurecollection.net/item/123456', '_blank');
    });

    it('should open image link in new tab when image icon is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const imageInput = screen.getByLabelText(/image url/i);
      await user.type(imageInput, 'https://example.com/image.jpg');

      const imageButton = screen.getByRole('button', { name: /open image link/i });
      await user.click(imageButton);

      expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/image.jpg', '_blank');
    });

    it('should disable link buttons when URLs are empty', () => {
      render(<FigureForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /open mfc link/i });
      const imageButton = screen.getByRole('button', { name: /open image link/i });

      expect(linkButton).toBeDisabled();
      expect(imageButton).toBeDisabled();
    });

    it('should enable link buttons when URLs are entered', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      const imageInput = screen.getByLabelText(/image url/i);
      
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123456');
      await user.type(imageInput, 'https://example.com/image.jpg');

      const linkButton = screen.getByRole('button', { name: /open mfc link/i });
      const imageButton = screen.getByRole('button', { name: /open image link/i });

      expect(linkButton).toBeEnabled();
      expect(imageButton).toBeEnabled();
    });
  });

  describe('Form State Management', () => {
    it('should populate form with initial data correctly', () => {
      const initialData = {
        ...mockFigure,
        scale: '1/8',
        mfcLink: 'https://myfigurecollection.net/item/123456',
        location: 'Display Case A',
        boxNumber: 'Box 1',
        imageUrl: 'https://example.com/image.jpg'
      };

      render(<FigureForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByDisplayValue(initialData.manufacturer)).toBeInTheDocument();
      expect(screen.getByDisplayValue(initialData.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(initialData.scale)).toBeInTheDocument();
      expect(screen.getByDisplayValue(initialData.mfcLink)).toBeInTheDocument();
      expect(screen.getByDisplayValue(initialData.location)).toBeInTheDocument();
      expect(screen.getByDisplayValue(initialData.boxNumber)).toBeInTheDocument();
      expect(screen.getByDisplayValue(initialData.imageUrl)).toBeInTheDocument();
    });

    it('should handle partial initial data', () => {
      const partialData = {
        _id: mockFigure._id,
        manufacturer: 'Partial Manufacturer',
        name: 'Partial Name',
        scale: '',
        userId: mockFigure.userId,
        createdAt: mockFigure.createdAt,
        updatedAt: mockFigure.updatedAt,
      };

      render(<FigureForm {...defaultProps} initialData={partialData} />);

      expect(screen.getByDisplayValue('Partial Manufacturer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Partial Name')).toBeInTheDocument();
      
      // Optional fields should be empty
      expect(screen.getByPlaceholderText(/1\/8.*1\/7.*Nendoroid/i)).toHaveValue('');
      expect(screen.getByLabelText(/myfigurecollection link/i)).toHaveValue('');
      expect(screen.getByLabelText(/storage location/i)).toHaveValue('');
      expect(screen.getByLabelText(/box number/i)).toHaveValue('');
      expect(screen.getByLabelText(/image url/i)).toHaveValue('');
    });

    it('should preserve form state during re-renders', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { rerender } = render(<FigureForm {...defaultProps} />);

      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      await user.type(manufacturerInput, 'Test Manufacturer');

      // Re-render with different props (but same form state should persist)
      rerender(<FigureForm {...defaultProps} isLoading={true} />);

      expect(screen.getByDisplayValue('Test Manufacturer')).toBeInTheDocument();
    });

    it('should reset form when initialData changes', () => {
      const initialData1 = {
        ...mockFigure,
        manufacturer: 'First Manufacturer',
        name: 'First Figure',
      };

      const { rerender } = render(<FigureForm {...defaultProps} initialData={initialData1} />);

      expect(screen.getByDisplayValue('First Manufacturer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('First Figure')).toBeInTheDocument();

      const initialData2 = {
        ...mockFigure,
        manufacturer: 'Second Manufacturer',
        name: 'Second Figure',
      };

      rerender(<FigureForm {...defaultProps} initialData={initialData2} />);

      expect(screen.getByDisplayValue('Second Manufacturer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Second Figure')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should disable submit button when isLoading is true', () => {
      render(<FigureForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show loading spinner on submit button when isLoading is true', () => {
      render(<FigureForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      expect(submitButton).toHaveAttribute('data-loading');
    });

    it('should enable submit button when isLoading is false', () => {
      render(<FigureForm {...defaultProps} isLoading={false} />);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      expect(submitButton).toBeEnabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and associations', () => {
      render(<FigureForm {...defaultProps} />);

      const requiredFields = [
        { label: /manufacturer/i, required: false }, // Now conditional based on mfcLink
        { label: /figure name/i, required: false }, // Now conditional based on mfcLink
        { label: /scale/i, required: false, useRole: true },
        { label: /myfigurecollection link/i, required: false },
        { label: /storage location/i, required: false },
        { label: /box number/i, required: false },
        { label: /image url/i, required: false },
      ];

      requiredFields.forEach(({ label, required, useRole }) => {
        const input = useRole ?
          screen.getByPlaceholderText(/1\/8.*1\/7.*Nendoroid/i) :
          screen.getByLabelText(label);
        expect(input).toBeInTheDocument();

        // Fields have conditional validation based on MFC link presence
        // Scale field is always optional, others are conditional
      });
    });

    it('should have proper error message associations', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        const manufacturerError = screen.getByText(/manufacturer is required/i);
        const nameError = screen.getByText(/figure name is required/i);

        expect(manufacturerError).toBeInTheDocument();
        expect(nameError).toBeInTheDocument();
      });
    });

    it('should have proper button labels and roles', () => {
      render(<FigureForm {...defaultProps} />);

      const buttons = [
        { name: /add figure/i, role: 'button' },
        { name: /open mfc link/i, role: 'button' },
        { name: /open image link/i, role: 'button' },
        { name: /scale info/i, role: 'button' },
      ];

      buttons.forEach(({ name, role }) => {
        const button = screen.getByRole(role, { name });
        expect(button).toBeInTheDocument();
      });
    });

    it('should have proper form structure', () => {
      render(<FigureForm {...defaultProps} />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle form submission with special characters', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const specialData = {
        manufacturer: 'Manufacturer & Co Special',
        name: 'Figure Name with Brackets',
        scale: '1/8 Scale',
        location: 'Location & Storage',
        boxNumber: 'Box #1 Special',
      };

      // Use user.type for special characters to ensure proper timing
      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      const nameInput = screen.getByLabelText(/figure name/i);
      const scaleInput = screen.getByPlaceholderText(/1\/8.*1\/7.*Nendoroid/i);
      const locationInput = screen.getByLabelText(/storage location/i);
      const boxNumberInput = screen.getByLabelText(/box number/i);

      await user.type(manufacturerInput, specialData.manufacturer);
      await user.type(nameInput, specialData.name);
      await user.type(scaleInput, specialData.scale);
      await user.type(locationInput, specialData.location);
      await user.type(boxNumberInput, specialData.boxNumber);

      // Verify the inputs contain the expected values before submission
      await waitFor(() => {
        expect(manufacturerInput).toHaveValue(specialData.manufacturer);
        expect(nameInput).toHaveValue(specialData.name);
        expect(scaleInput).toHaveValue(specialData.scale);
        expect(locationInput).toHaveValue(specialData.location);
        expect(boxNumberInput).toHaveValue(specialData.boxNumber);
      });

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      // Wait for form submission to complete with optimized timing
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            manufacturer: specialData.manufacturer,
            name: specialData.name,
            scale: specialData.scale,
            location: specialData.location,
            boxNumber: specialData.boxNumber,
          })
        );
      }, { timeout: 5000 });
    }, 30000);

    it('should handle very long input values', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const longText = 'A'.repeat(1000);

      await user.type(screen.getByLabelText(/manufacturer/i), longText);
      await user.type(screen.getByLabelText(/figure name/i), longText);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            manufacturer: longText,
            name: longText,
          })
        );
      });
    });

    it('should handle Unicode characters in input values', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const unicodeData = {
        manufacturer: 'グッドスマイルカンパニー',
        name: '初音ミク Nendoroid',
      };

      await user.type(screen.getByLabelText(/manufacturer/i), unicodeData.manufacturer);
      await user.type(screen.getByLabelText(/figure name/i), unicodeData.name);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            manufacturer: unicodeData.manufacturer,
            name: unicodeData.name,
          })
        );
      });
    });

    it('should handle rapid form interactions', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<FigureForm {...defaultProps} />);

      const manufacturerInput = screen.getByLabelText(/manufacturer/i);
      const nameInput = screen.getByLabelText(/figure name/i);
      const submitButton = screen.getByRole('button', { name: /add figure/i });

      // Rapid typing and clicking
      await user.type(manufacturerInput, 'Test');
      await user.click(submitButton);
      await user.type(nameInput, 'Figure');
      await user.click(submitButton);

      // Should handle the interaction gracefully
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            manufacturer: 'Test',
            name: 'Figure',
          })
        );
      });
    });

    it('should not crash with malformed initial data', () => {
      const malformedData = {
        // Missing required fields
        manufacturer: null,
        name: undefined,
        // Wrong types
        scale: 123 as any,
        mfcLink: [] as any,
      } as any;

      expect(() => {
        render(<FigureForm {...defaultProps} initialData={malformedData} />);
      }).not.toThrow();
    });
  });
});