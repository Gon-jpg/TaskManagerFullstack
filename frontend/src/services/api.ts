import axios, { AxiosError, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found');
    } else if (error && 'response' in error && error.response && error.response.status >= 500) {
      // Server error
      console.error('Server error occurred');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      console.error('Request timeout');
    } else if (!error.response) {
      // Network error
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { username: string; password: string }) =>
    api.post('/auth/register', userData),
  
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (userData: { username: string; password: string }) =>
    api.post('/users', userData),
  update: (id: number, userData: Partial<{ username: string; password: string }>) =>
    api.put(`/users/${id}`, userData),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  getById: (id: number) => api.get(`/tasks/${id}`),
  create: (taskData: {
    title: string;
    description: string;
    completed?: boolean;
    categoryId: number;
  }) => api.post('/tasks', taskData),
  update: (id: number, taskData: {
    title?: string;
    description?: string;
    completed?: boolean;
    categoryId?: number;
  }) => api.put(`/tasks/${id}`, taskData),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  toggleComplete: (id: number, completed: boolean) =>
    api.patch(`/tasks/${id}/complete`, { completed }),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (categoryData: { name: string }) =>
    api.post('/categories', categoryData),
  update: (id: number, categoryData: { name: string }) =>
    api.put(`/categories/${id}`, categoryData),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Helper functions
export const handleApiError = (error: AxiosError) => {
  if (error.response?.data) {
    return error.response.data;
  } else if (error.message) {
    return { message: error.message };
  } else {
    return { message: 'An unexpected error occurred' };
  }
};

export const isAuthError = (error: AxiosError) => {
  return error.response?.status === 401 || error.response?.status === 403;
};

export default api;