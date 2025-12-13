import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials)
};

// Job Cards API
export const jobCardsAPI = {
  create: (data) => api.post('/api/jobcards', data),
  getAll: () => api.get('/api/jobcards'),
  getById: (id) => api.get(`/api/jobcards/${id}`),
  addUpdate: (id, data) => api.post(`/api/jobcards/${id}/updates`, data),
  addParts: (id, data) => api.post(`/api/jobcards/${id}/parts`, data),
  getBill: (id) => api.get(`/api/jobcards/${id}/bill`),
  updateStatus: (id, status) => api.patch(`/api/jobcards/${id}/status`, { status })
};

// Kanban API
export const kanbanAPI = {
  getKanban: () => api.get('/api/kanban')
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/api/inventory'),
  search: (query) => api.get(`/api/inventory?q=${query}`),
  getByCode: (code) => api.get(`/api/inventory/${code}`)
};

export default api;

