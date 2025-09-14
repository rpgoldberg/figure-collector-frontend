/**
 * React Hook Form Mock Utilities
 * Minimal mock with only register and setValue functionality
 */

interface MockFormData {
  [key: string]: any;
}

interface MockErrors {
  [key: string]: { message: string };
}

const mockFormData: MockFormData = {};
const mockErrors: MockErrors = {};

export const mockUseForm = (defaultValues?: any) => {
  // Clear previous state
  Object.keys(mockFormData).forEach(key => delete mockFormData[key]);
  Object.keys(mockErrors).forEach(key => delete mockErrors[key]);
  
  // Set default values
  if (defaultValues) {
    Object.assign(mockFormData, defaultValues);
  }
  
  return {
    register: jest.fn((name: string, rules?: any) => ({
      name,
      onChange: jest.fn((e: any) => {
        const value = e?.target?.value || e;
        mockFormData[name] = value;
      }),
      onBlur: jest.fn(),
      ref: jest.fn(),
    })),
    
    handleSubmit: jest.fn((onSubmit: (data: any) => void) => 
      jest.fn(async (e?: any) => {
        e?.preventDefault?.();
        return onSubmit(mockFormData);
      })
    ),
    
    setValue: jest.fn((name: string, value: any) => {
      mockFormData[name] = value;
    }),
    
    getValues: jest.fn((name?: string) => {
      return name ? mockFormData[name] : { ...mockFormData };
    }),
    
    watch: jest.fn((name?: string) => {
      return name ? mockFormData[name] : mockFormData;
    }),
    
    reset: jest.fn(() => {
      Object.keys(mockFormData).forEach(key => delete mockFormData[key]);
      Object.keys(mockErrors).forEach(key => delete mockErrors[key]);
    }),
    
    formState: {
      errors: mockErrors,
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    },
  };
};

export const clearMockFormData = () => {
  Object.keys(mockFormData).forEach(key => delete mockFormData[key]);
  Object.keys(mockErrors).forEach(key => delete mockErrors[key]);
};

export const getMockFormData = () => ({ ...mockFormData });
export const setMockFormData = (data: MockFormData) => {
  Object.assign(mockFormData, data);
};