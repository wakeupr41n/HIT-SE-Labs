import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors globally - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/users/login', data);
export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);

// Health Records
export const createRecord = (data) => api.post('/health/records', data);
export const getRecords = (limit = 30) => api.get(`/health/records?limit=${limit}`);
export const getLatestRecord = () => api.get('/health/records/latest');
export const deleteRecord = (id) => api.delete(`/health/records/${id}`);

// AI Chat
export const sendChat = (message) => api.post('/ai/chat', { message });
export const getChatHistory = () => api.get('/ai/history');

export default api;

