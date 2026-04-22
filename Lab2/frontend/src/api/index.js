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

// Reminders
export const getReminders = (params) => api.get('/reminders', { params });
export const getUnreadCount = () => api.get('/reminders/unread-count');
export const markReminderRead = (id) => api.put(`/reminders/${id}/read`);
export const markAllRead = () => api.put('/reminders/read-all');
export const checkReminders = () => api.post('/reminders/check');

// Reports
export const getReports = (params) => api.get('/reports', { params });
export const getReport = (id) => api.get(`/reports/${id}`);
export const generateReport = (data) => api.post('/reports/generate', data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);
export const downloadReportPdf = (id) => api.get(`/reports/${id}/pdf`, { responseType: 'blob' });

export default api;

