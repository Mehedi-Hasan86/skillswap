import axios from 'axios';

const api = axios.create({
  // On Vercel the API is served from the same origin under /api.
  // Locally, VITE_API_URL (or the Vite proxy) points at the Express server.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
