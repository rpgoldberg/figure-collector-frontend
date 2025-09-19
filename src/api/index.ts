import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Figure, FigureFormData, PaginatedResponse, SearchResult, StatsData, User } from '../types';
import { createLogger } from '../utils/logger';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const logger = createLogger('API');

// DEBUGGING: Log the API URL being used
logger.info('API_URL configured as:', API_URL);
logger.info('Environment:', process.env.NODE_ENV);
logger.verbose('Full REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle response errors and token expiration
api.interceptors.response.use(
  (response) => {
    // On successful API calls, check if we got a new token
    const newToken = response.headers['x-new-token'] || response.headers['x-access-token'];
    if (newToken) {
      const { user, setUser } = useAuthStore.getState();
      if (user) {
        // Update the token in the store (refresh token on activity)
        setUser({ ...user, token: newToken.replace('Bearer ', '') });
      }
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (expired/invalid token)
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      
      // Clear auth state
      logout();
      
      // Clear localStorage
      localStorage.removeItem('auth-storage');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const loginUser = async (email: string, password: string): Promise<User> => {
  logger.verbose('Attempting login to:', API_URL + '/auth/login');
  logger.verbose('Login payload:', { email, password: '***hidden***' }); // sonar:ignore S2068

  const response = await api.post('/auth/login', { email, password });
  logger.verbose('Login response received:', response.data);

  const userData = response.data?.data;

  // Handle missing or malformed response data
  if (!userData) {
    return undefined as any;  // Return undefined for missing data
  }

  // Map accessToken to token for frontend compatibility
  return {
    _id: userData._id,
    username: userData.username,
    email: userData.email,
    isAdmin: userData.isAdmin,
    token: userData.accessToken  // Map accessToken to token
  };
};

export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  const response = await api.post('/auth/register', { username, email, password });
  const userData = response.data?.data;

  // Handle missing or malformed response data
  if (!userData) {
    return undefined as any;  // Return undefined for missing data
  }

  // Map accessToken to token for frontend compatibility
  return {
    _id: userData._id,
    username: userData.username,
    email: userData.email,
    isAdmin: userData.isAdmin,
    token: userData.accessToken  // Map accessToken to token
  };
};

export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await api.post('/auth/refresh');
  const data = response.data.data;

  // Map accessToken to token for frontend compatibility
  return {
    token: data.accessToken || data.token
  };
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const logoutAllSessions = async (): Promise<void> => {
  await api.post('/auth/logout-all');
};

export const getUserSessions = async (): Promise<any[]> => {
  const response = await api.get('/auth/sessions');
  return response.data.data;
};

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get('/users/profile');
  return response.data.data;
};

export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put('/users/profile', userData);
  return response.data.data;
};

// Figures API
export const getFigures = async (page = 1, limit = 10): Promise<PaginatedResponse<Figure>> => {
  const response = await api.get(`/figures?page=${page}&limit=${limit}`);
  return response.data;
};

export const getFigureById = async (id: string): Promise<Figure> => {
  const response = await api.get(`/figures/${id}`);
  return response.data.data;
};

export const createFigure = async (figureData: FigureFormData): Promise<Figure> => {
  const response = await api.post('/figures', figureData);
  return response.data.data;
};

export const updateFigure = async (id: string, figureData: FigureFormData): Promise<Figure> => {
  const response = await api.put(`/figures/${id}`, figureData);
  return response.data.data;
};

export const deleteFigure = async (id: string): Promise<void> => {
  await api.delete(`/figures/${id}`);
};

export const searchFigures = async (query: string): Promise<SearchResult[]> => {
  const response = await api.get(`/figures/search?query=${encodeURIComponent(query)}`);
  return response.data.data;
};

export const filterFigures = async (
  params: {
    manufacturer?: string;
    scale?: string;
    location?: string;
    boxNumber?: string;
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<Figure>> => {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
    
  const response = await api.get(`/figures/filter?${queryString}`);
  return response.data;
};

export const getFigureStats = async (): Promise<StatsData> => {
  const response = await api.get('/figures/stats');
  return response.data.data;
};
