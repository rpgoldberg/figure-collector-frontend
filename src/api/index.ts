import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Figure, FigureFormData, PaginatedResponse, SearchResult, StatsData, User } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Auth API
export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await api.post('/users/login', { email, password });
  return response.data.data;
};

export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  const response = await api.post('/users/register', { username, email, password });
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
