import axios from 'axios';

// Keep an empty default for Vite's /api proxy during local development.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export default axios;
