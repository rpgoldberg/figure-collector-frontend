export interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  token?: string;
}

export interface Figure {
  _id: string;
  manufacturer: string;
  name: string;
  scale: string;
  mfcLink: string;
  location: string;
  boxNumber: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FigureFormData {
  manufacturer: string;
  name: string;
  scale: string;
  mfcLink: string;
  location: string;
  boxNumber: string;
  imageUrl?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  page: number;
  pages: number;
  total: number;
  data: T[];
}

export interface SearchResult {
  id: string;
  manufacturer: string;
  name: string;
  scale: string;
  mfcLink: string;
  location: string;
  boxNumber: string;
  imageUrl?: string;
}

export interface StatsData {
  totalCount: number;
  manufacturerStats: { _id: string; count: number }[];
  scaleStats: { _id: string; count: number }[];
  locationStats: { _id: string; count: number }[];
}
