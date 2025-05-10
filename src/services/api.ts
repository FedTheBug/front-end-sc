import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8080/api/v1';
const APP_KEY = 'PPTjT3ApHD';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'App-Key': APP_KEY,
    'Content-Type': 'application/json',
  },
});

export interface Server {
  model: string;
  ram: string;
  hdd: string;
  location: string;
  price: string;
}

export interface Pagination {
  per_page: number;
  page_no: number;
  total: number;
}

export interface ServerListResponse {
  data: Server[];
  pagination: Pagination;
}

export const apiService = {
  async getLocations() {
    const response = await api.get<{ data: string[] }>('/servers/locations');
    return response.data.data;
  },

  async getHddTypes() {
    const response = await api.get<{ data: string[] }>('/servers/hdd-types');
    return response.data.data;
  },

  async getServers(params: {
    per_page?: number;
    page_no?: number;
    min_storage?: string;
    max_storage?: string;
    ram?: string;
    location?: string;
  }) {
    const response = await api.get<ServerListResponse>('/servers/list', { params });
    return response.data;
  },
};
