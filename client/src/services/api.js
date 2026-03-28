import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  get: (path) =>
    axios.get(`${BASE_URL}${path}`, { headers: getHeaders() }),

  post: (path, data) =>
    axios.post(`${BASE_URL}${path}`, data, { headers: getHeaders() }),

  put: (path, data) =>
    axios.put(`${BASE_URL}${path}`, data, { headers: getHeaders() }),

  patch: (path, data) =>
    axios.patch(`${BASE_URL}${path}`, data, { headers: getHeaders() }),

  delete: (path) =>
    axios.delete(`${BASE_URL}${path}`, { headers: getHeaders() }),
};

// Global interceptor for 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      // If we're not already on a public page, redirect to login
      if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
