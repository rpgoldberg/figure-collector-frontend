/**
 * Axios Mock Utilities
 * Simple response mocks without complex interceptors
 */

interface MockResponse {
  data: any;
  status: number;
  statusText: string;
  headers: any;
}

const defaultResponse: MockResponse = {
  data: { success: true },
  status: 200,
  statusText: 'OK',
  headers: {},
};

const responseMap: { [key: string]: any } = {
  '/api/figures': {
    data: {
      success: true,
      data: [
        { _id: '1', name: 'Test Figure 1', manufacturer: 'Test Company' },
        { _id: '2', name: 'Test Figure 2', manufacturer: 'ALTER' },
      ],
      count: 2,
      total: 2,
    },
  },
  '/api/auth/login': {
    data: {
      data: {
        user: { id: '123', email: 'test@example.com', token: 'mock-token' },
      },
    },
  },
};

export const mockAxios = {
  get: jest.fn((url: string) => {
    const mockData = responseMap[url] || defaultResponse;
    return Promise.resolve(mockData);
  }),
  
  post: jest.fn((url: string, data: any) => {
    const mockData = responseMap[url] || { ...defaultResponse, data: { ...defaultResponse.data, ...data } };
    return Promise.resolve(mockData);
  }),
  
  put: jest.fn((url: string, data: any) => {
    return Promise.resolve({ ...defaultResponse, data: { ...defaultResponse.data, ...data } });
  }),
  
  delete: jest.fn(() => {
    return Promise.resolve(defaultResponse);
  }),
  
  create: jest.fn(() => mockAxios),
};

export const setMockAxiosResponse = (url: string, response: any) => {
  responseMap[url] = response;
};

export const clearMockAxiosResponses = () => {
  Object.keys(responseMap).forEach(key => delete responseMap[key]);
};

// Default export for Jest module mapping
export default mockAxios;

// Named export as well for compatibility  
export { mockAxios as axios };

// ES6 module compatibility
const axiosModule = mockAxios;
axiosModule.default = mockAxios;

module.exports = axiosModule;
module.exports.default = mockAxios;