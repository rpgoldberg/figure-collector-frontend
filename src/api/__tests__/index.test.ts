import axios from 'axios';
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getFigures,
  getFigureById,
  createFigure,
  updateFigure,
  deleteFigure,
  searchFigures,
  filterFigures,
  getFigureStats,
} from '../index';
import { useAuthStore } from '../../stores/authStore';
import { mockUser, mockFigure, mockPaginatedResponse, mockStatsData } from '../../test-utils';
import { FigureFormData } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the auth store
jest.mock('../../stores/authStore');

describe('API Functions', () => {
  const mockGetState = jest.fn();
  const mockSetUser = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock auth store
    (useAuthStore as any).getState = mockGetState;
    
    // Default auth store state
    mockGetState.mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
      logout: mockLogout,
    });

    // Mock axios create method
    mockedAxios.create = jest.fn(() => ({
      ...mockedAxios,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })) as any;

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  describe('Auth API', () => {
    describe('loginUser', () => {
      it('should login user successfully', async () => {
        const responseData = {
          success: true,
          data: mockUser,
        };
        
        mockedAxios.post.mockResolvedValueOnce({ data: responseData });
        
        const result = await loginUser('test@example.com', 'password123');
        
        expect(result).toEqual(mockUser);
        expect(mockedAxios.post).toHaveBeenCalledWith('/users/login', {
          email: 'test@example.com',
          password: 'password123',
        });
      });

      it('should handle login error', async () => {
        const errorResponse = {
          response: {
            status: 401,
            data: { message: 'Invalid credentials' },
          },
        };
        
        mockedAxios.post.mockRejectedValueOnce(errorResponse);
        
        await expect(loginUser('test@example.com', 'wrongpassword'))
          .rejects
          .toEqual(errorResponse);
      });
    });

    describe('registerUser', () => {
      it('should register user successfully', async () => {
        const responseData = {
          success: true,
          data: mockUser,
        };
        
        mockedAxios.post.mockResolvedValueOnce({ data: responseData });
        
        const result = await registerUser('testuser', 'test@example.com', 'password123');
        
        expect(result).toEqual(mockUser);
        expect(mockedAxios.post).toHaveBeenCalledWith('/users/register', {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    describe('getUserProfile', () => {
      it('should get user profile successfully', async () => {
        const responseData = {
          success: true,
          data: mockUser,
        };
        
        mockedAxios.get.mockResolvedValueOnce({ data: responseData });
        
        const result = await getUserProfile();
        
        expect(result).toEqual(mockUser);
        expect(mockedAxios.get).toHaveBeenCalledWith('/users/profile');
      });
    });

    describe('updateUserProfile', () => {
      it('should update user profile successfully', async () => {
        const updatedUser = { ...mockUser, username: 'updateduser' };
        const responseData = {
          success: true,
          data: updatedUser,
        };
        
        mockedAxios.put.mockResolvedValueOnce({ data: responseData });
        
        const result = await updateUserProfile({ username: 'updateduser' });
        
        expect(result).toEqual(updatedUser);
        expect(mockedAxios.put).toHaveBeenCalledWith('/users/profile', { username: 'updateduser' });
      });
    });
  });

  describe('Figures API', () => {
    describe('getFigures', () => {
      it('should get figures with default pagination', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
        
        const result = await getFigures();
        
        expect(result).toEqual(mockPaginatedResponse);
        expect(mockedAxios.get).toHaveBeenCalledWith('/figures?page=1&limit=10');
      });

      it('should get figures with custom pagination', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
        
        const result = await getFigures(2, 5);
        
        expect(result).toEqual(mockPaginatedResponse);
        expect(mockedAxios.get).toHaveBeenCalledWith('/figures?page=2&limit=5');
      });
    });

    describe('getFigureById', () => {
      it('should get figure by id successfully', async () => {
        const responseData = {
          success: true,
          data: mockFigure,
        };
        
        mockedAxios.get.mockResolvedValueOnce({ data: responseData });
        
        const result = await getFigureById(mockFigure._id);
        
        expect(result).toEqual(mockFigure);
        expect(mockedAxios.get).toHaveBeenCalledWith(`/figures/${mockFigure._id}`);
      });

      it('should handle figure not found', async () => {
        const errorResponse = {
          response: { status: 404 },
        };
        
        mockedAxios.get.mockRejectedValueOnce(errorResponse);
        
        await expect(getFigureById('invalid-id'))
          .rejects
          .toEqual(errorResponse);
      });
    });

    describe('createFigure', () => {
      it('should create figure successfully', async () => {
        const figureFormData: FigureFormData = {
          manufacturer: mockFigure.manufacturer,
          name: mockFigure.name,
          scale: mockFigure.scale,
          mfcLink: mockFigure.mfcLink,
          location: mockFigure.location,
          boxNumber: mockFigure.boxNumber,
          imageUrl: mockFigure.imageUrl,
        };
        
        const responseData = {
          success: true,
          data: mockFigure,
        };
        
        mockedAxios.post.mockResolvedValueOnce({ data: responseData });
        
        const result = await createFigure(figureFormData);
        
        expect(result).toEqual(mockFigure);
        expect(mockedAxios.post).toHaveBeenCalledWith('/figures', figureFormData);
      });
    });

    describe('updateFigure', () => {
      it('should update figure successfully', async () => {
        const updatedData: FigureFormData = {
          manufacturer: mockFigure.manufacturer,
          name: 'Updated Figure Name',
          scale: mockFigure.scale,
        };
        
        const updatedFigure = { ...mockFigure, name: 'Updated Figure Name' };
        
        const responseData = {
          success: true,
          data: updatedFigure,
        };
        
        mockedAxios.put.mockResolvedValueOnce({ data: responseData });
        
        const result = await updateFigure(mockFigure._id, updatedData);
        
        expect(result).toEqual(updatedFigure);
        expect(mockedAxios.put).toHaveBeenCalledWith(`/figures/${mockFigure._id}`, updatedData);
      });
    });

    describe('deleteFigure', () => {
      it('should delete figure successfully', async () => {
        mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
        
        await deleteFigure(mockFigure._id);
        
        expect(mockedAxios.delete).toHaveBeenCalledWith(`/figures/${mockFigure._id}`);
      });

      it('should handle delete error', async () => {
        const errorResponse = {
          response: { status: 403 },
        };
        
        mockedAxios.delete.mockRejectedValueOnce(errorResponse);
        
        await expect(deleteFigure(mockFigure._id))
          .rejects
          .toEqual(errorResponse);
      });
    });

    describe('searchFigures', () => {
      it('should search figures successfully', async () => {
        const searchResults = [
          {
            id: mockFigure._id,
            manufacturer: mockFigure.manufacturer,
            name: mockFigure.name,
            scale: mockFigure.scale,
            mfcLink: mockFigure.mfcLink || '',
            location: mockFigure.location || '',
            boxNumber: mockFigure.boxNumber || '',
            imageUrl: mockFigure.imageUrl,
          },
        ];
        
        const responseData = {
          success: true,
          data: searchResults,
        };
        
        mockedAxios.get.mockResolvedValueOnce({ data: responseData });
        
        const result = await searchFigures('Hatsune Miku');
        
        expect(result).toEqual(searchResults);
        expect(mockedAxios.get).toHaveBeenCalledWith('/figures/search?query=Hatsune%20Miku');
      });

      it('should encode special characters in search query', async () => {
        const responseData = { success: true, data: [] };
        
        mockedAxios.get.mockResolvedValueOnce({ data: responseData });
        
        await searchFigures('test & search');
        
        expect(mockedAxios.get).toHaveBeenCalledWith('/figures/search?query=test%20%26%20search');
      });
    });

    describe('filterFigures', () => {
      it('should filter figures with all parameters', async () => {
        const filterParams = {
          manufacturer: 'Good Smile Company',
          scale: '1/8',
          location: 'Display Case A',
          boxNumber: 'A1',
          page: 1,
          limit: 10,
        };
        
        const expectedUrl = '/figures/filter?manufacturer=Good%20Smile%20Company&scale=1%2F8&location=Display%20Case%20A&boxNumber=A1&page=1&limit=10';
        
        mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
        
        const result = await filterFigures(filterParams);
        
        expect(result).toEqual(mockPaginatedResponse);
        expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
      });

      it('should filter figures with partial parameters', async () => {
        const filterParams = {
          manufacturer: 'Good Smile Company',
          page: 2,
        };
        
        const expectedUrl = '/figures/filter?manufacturer=Good%20Smile%20Company&page=2';
        
        mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
        
        const result = await filterFigures(filterParams);
        
        expect(result).toEqual(mockPaginatedResponse);
        expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
      });

      it('should handle empty filter parameters', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: mockPaginatedResponse });
        
        const result = await filterFigures({});
        
        expect(result).toEqual(mockPaginatedResponse);
        expect(mockedAxios.get).toHaveBeenCalledWith('/figures/filter?');
      });
    });

    describe('getFigureStats', () => {
      it('should get figure statistics successfully', async () => {
        const responseData = {
          success: true,
          data: mockStatsData,
        };
        
        mockedAxios.get.mockResolvedValueOnce({ data: responseData });
        
        const result = await getFigureStats();
        
        expect(result).toEqual(mockStatsData);
        expect(mockedAxios.get).toHaveBeenCalledWith('/figures/stats');
      });

      it('should handle stats error', async () => {
        const errorResponse = {
          response: { status: 500 },
        };
        
        mockedAxios.get.mockRejectedValueOnce(errorResponse);
        
        await expect(getFigureStats())
          .rejects
          .toEqual(errorResponse);
      });
    });
  });
});