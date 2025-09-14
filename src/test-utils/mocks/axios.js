/**
 * Axios Mock - CommonJS version for Jest compatibility
 */

const defaultResponse = {
  data: { success: true },
  status: 200,
  statusText: 'OK',
  headers: {},
};

const responseMap = {
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

const mockAxios = {
  get: jest.fn((url) => {
    const mockData = responseMap[url] || defaultResponse;
    return Promise.resolve(mockData);
  }),
  
  post: jest.fn((url, data) => {
    const mockData = responseMap[url] || { ...defaultResponse, data: { ...defaultResponse.data, ...data } };
    return Promise.resolve(mockData);
  }),
  
  put: jest.fn((url, data) => {
    return Promise.resolve({ ...defaultResponse, data: { ...defaultResponse.data, ...data } });
  }),
  
  delete: jest.fn(() => {
    return Promise.resolve(defaultResponse);
  }),
  
  create: jest.fn(() => mockAxios),
  
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
};

// CommonJS export for Jest
module.exports = mockAxios;
module.exports.default = mockAxios;