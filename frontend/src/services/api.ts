import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      toast.error('Session expired or unauthorized access. Please log in again.');
      window.location.href = '/login'; 
    } else if (error.response?.status === 403) {
      toast.error('Access forbidden. You do not have permission for this action.');
      console.error('Access forbidden', error.response.data);
    } else if (error.response?.status === 404) {
      toast.warn('Resource not found.');
      console.error('Resource not found', error.response.data);
    } else if (error && 'response' in error && error.response && error.response.status >= 500) {
      toast.error('Server error occurred. Please try again later.');
      console.error('Server error occurred', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your network connection.');
      console.error('Request timeout');
    } else if (!error.response) {
      toast.error('Network error - please check your internet connection.');
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { username: string; password: string }) =>
    api.post('/auth/register', userData),
  
  logout: () => Promise.resolve(),
  
  getCurrentUser: () => api.get('/auth/me'), 

  validateToken: () => api.get('/auth/validate-token'),
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
  delete: (id: number) => api.delete('/categories/${id}'),
};

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