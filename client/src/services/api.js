import axios from 'axios';
import Cookies from 'js-cookie';

let BASE_URL = 'http://localhost:5000/api';
const envBase = import.meta.env.VITE_API_BASE_URL;

if (envBase) {
  const needsProtocol = !envBase.startsWith('http://') && !envBase.startsWith('https://');
  const host = needsProtocol ? `https://${envBase}` : envBase;
  BASE_URL = host.endsWith('/api') ? host : `${host}/api`;
} else if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
  // Render Blueprint 'fromService' sync is notoriously flaky during static site builds.
  // We can automatically deduce the API url by swapping '-builder' with '-api'.
  const builderHost = window.location.hostname;
  const apiHost = builderHost.replace('builder', 'api');
  BASE_URL = `https://${apiHost}/api`;
}

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
