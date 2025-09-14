import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockFigure } from '../../test-utils';
import FigureForm from '../FigureForm';
import { FigureFormData } from '../../types';

// Mock fetch for MFC scraping
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('FigureForm', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.getByLabelText(/myfigurecollection link/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/figure name/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /scale/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/storage location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/box number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
    });

    it('should render submit button with correct text for new figure', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /add figure/i })).toBeInTheDocument();
    });

    it('should render submit button with correct text for editing', () => {
      render(<FigureForm {...defaultProps} initialData={mockFigure} />);

      expect(screen.getByRole('button', { name: /update figure/i })).toBeInTheDocument();
    });

    it('should populate form with initial data when provided', () => {
      render(<FigureForm {...defaultProps} initialData={mockFigure} />);

      expect(screen.getByDisplayValue(mockFigure.manufacturer)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockFigure.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockFigure.scale)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockFigure.location || '')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockFigure.boxNumber || '')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockFigure.imageUrl || '')).toBeInTheDocument();
    });

    it('should show loading state on submit button when isLoading is true', () => {
      render(<FigureForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/manufacturer is required/i)).toBeInTheDocument();
        expect(screen.getByText(/figure name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate URL format for MFC link', async () => {
      const user = userEvent.setup();
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
      }, { timeout: 1000 });
    });

    it('should validate URL format for image URL', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const imageUrlInput = screen.getByLabelText(/image url/i);
      await user.type(imageUrlInput, 'invalid-url');
      
      // Fill required fields to trigger validation
      await user.type(screen.getByLabelText(/manufacturer/i), 'Test Manufacturer');
      await user.type(screen.getByLabelText(/figure name/i), 'Test Figure');
      
      // Submit to trigger validation
      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should allow empty optional fields', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      // Fill only required fields
      await user.type(screen.getByLabelText(/manufacturer/i), 'Test Manufacturer');
      await user.type(screen.getByLabelText(/figure name/i), 'Test Figure');

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            manufacturer: 'Test Manufacturer',
            name: 'Test Figure',
            scale: '',
            mfcLink: '',
            location: '',
            boxNumber: '',
            imageUrl: '',
          }),
          expect.any(Object)
        );
      }, { timeout: 1000 });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when form is valid', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const formData: FigureFormData = {
        manufacturer: 'Good Smile Company',
        name: 'Hatsune Miku',
        scale: '1/8',
        mfcLink: 'https://myfigurecollection.net/item/123',
        location: 'Display Case A',
        boxNumber: 'A1',
        imageUrl: 'https://example.com/image.jpg',
      };

      // Fill out the form
      await user.type(screen.getByLabelText(/manufacturer/i), formData.manufacturer);
      await user.type(screen.getByLabelText(/figure name/i), formData.name);
      await user.type(screen.getByRole('textbox', { name: /scale/i }), formData.scale);
      await user.type(screen.getByLabelText(/myfigurecollection link/i), formData.mfcLink!);
      await user.type(screen.getByLabelText(/storage location/i), formData.location!);
      await user.type(screen.getByLabelText(/box number/i), formData.boxNumber!);
      await user.type(screen.getByLabelText(/image url/i), formData.imageUrl!);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(formData, expect.any(Object));
      });
    });

    it('should not call onSubmit when form is invalid', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      // Submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Scale Formatting', () => {
    it('should format decimal scale to fraction on blur', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const scaleInput = screen.getByRole('textbox', { name: /scale/i });
      await user.type(scaleInput, '0.125');
      await user.tab(); // Trigger onBlur

      await waitFor(() => {
        expect(scaleInput).toHaveValue('1/8');
      });
    });

    it('should keep fraction format unchanged', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const scaleInput = screen.getByRole('textbox', { name: /scale/i });
      await user.type(scaleInput, '1/7');
      await user.tab(); // Trigger onBlur

      expect(scaleInput).toHaveValue('1/7');
    });

    it('should keep non-numeric scales unchanged', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const scaleInput = screen.getByRole('textbox', { name: /scale/i });
      await user.type(scaleInput, 'Nendoroid');
      await user.tab(); // Trigger onBlur

      expect(scaleInput).toHaveValue('Nendoroid');
    });
  });

  describe('MFC Link Functionality', () => {
    it('should open MFC link in new tab when link button is clicked', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const mfcLink = 'https://myfigurecollection.net/item/123';
      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, mfcLink);

      const linkButton = screen.getByRole('button', { name: /open mfc link/i });
      await user.click(linkButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(mfcLink, '_blank');
    });

    it('should disable link button when no MFC link is provided', () => {
      render(<FigureForm {...defaultProps} />);

      const linkButton = screen.getByRole('button', { name: /open mfc link/i });
      expect(linkButton).toBeDisabled();
    });

    it('should trigger MFC scraping when valid MFC link is provided', async () => {
      const user = userEvent.setup();
      const mockScrapedData = {
        success: true,
        data: {
          manufacturer: 'Good Smile Company',
          name: 'Scraped Figure',
          scale: '1/8',
          imageUrl: 'https://example.com/scraped-image.jpg',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScrapedData),
        headers: new Headers(),
      });

      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123');

      // Wait for the debounced scraping request
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledWith('/api/figures/scrape-mfc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mfcLink: 'https://myfigurecollection.net/item/123' }),
          });
        },
        { timeout: 2000 }
      );
    });

    it('should show loading spinner during MFC scraping', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, data: {} }),
              headers: new Headers(),
            });
          }, 100);
        })
      );

      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123');

      // Check for spinner during scraping
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner has role="status"
      });
    });

    it('should not trigger scraping for non-MFC links', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://example.com/some-link');

      // Wait a bit to ensure no request is made
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Image URL Functionality', () => {
    it('should open image link in new tab when image button is clicked', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const imageUrl = 'https://example.com/image.jpg';
      const imageInput = screen.getByLabelText(/image url/i);
      await user.type(imageInput, imageUrl);

      const imageButton = screen.getByRole('button', { name: /open image link/i });
      await user.click(imageButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(imageUrl, '_blank');
    });

    it('should disable image button when no image URL is provided', () => {
      render(<FigureForm {...defaultProps} />);

      const imageButton = screen.getByRole('button', { name: /open image link/i });
      expect(imageButton).toBeDisabled();
    });

    it('should show image preview when valid image URL is provided', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const imageUrl = 'https://example.com/image.jpg';
      const imageInput = screen.getByLabelText(/image url/i);
      await user.type(imageInput, imageUrl);

      await waitFor(() => {
        expect(screen.getByText(/image preview/i)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /figure preview/i })).toBeInTheDocument();
      });
    });

    it('should show error message when image fails to load', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const imageUrl = 'https://example.com/broken-image.jpg';
      const imageInput = screen.getByLabelText(/image url/i);
      await user.type(imageInput, imageUrl);

      await waitFor(() => {
        const image = screen.getByRole('img', { name: /figure preview/i });
        fireEvent.error(image);
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to load image/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tooltips and Help Text', () => {
    it('should show scale tooltip when question icon is hovered', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const scaleInfoButton = screen.getByRole('button', { name: /scale info/i });
      await user.hover(scaleInfoButton);

      await waitFor(() => {
        expect(screen.getByText(/common scales.*1\/8.*1\/7.*1\/6/i)).toBeInTheDocument();
      });
    });

    it('should show help text for MFC link', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.getByText(/click the link icon to open mfc page/i)).toBeInTheDocument();
    });

    it('should show help text for image URL', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.getByText(/leave blank to auto-fetch from mfc/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all buttons', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /open mfc link/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /scale info/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open image link/i })).toBeInTheDocument();
    });

    it('should associate labels with form inputs correctly', () => {
      render(<FigureForm {...defaultProps} />);

      expect(screen.getByLabelText(/manufacturer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/figure name/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /scale/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/storage location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/box number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
    });

    it('should show form errors with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<FigureForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /add figure/i });
      await user.click(submitButton);

      await waitFor(() => {
        const manufacturerInput = screen.getByLabelText(/manufacturer/i);
        expect(manufacturerInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle MFC scraping errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123');

      // Wait for error handling
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 2000 });

      // Note: Toast error messages would require more complex testing setup
      // For now, we just ensure the error doesn't break the component
    });

    it('should handle manual extraction requirement', async () => {
      const user = userEvent.setup();
      
      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'MANUAL_EXTRACT: Requires manual extraction',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        headers: new Headers(),
      });

      render(<FigureForm {...defaultProps} />);

      const mfcInput = screen.getByLabelText(/myfigurecollection link/i);
      await user.type(mfcInput, 'https://myfigurecollection.net/item/123');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });
});