import axios from 'axios';

const api = axios.create({
  // Production ALWAYS uses the same-origin /api served by the Vercel
  // serverless function. VITE_API_URL is only a local-dev convenience:
  // a stale value in client/.env must never be baked into a production build
  // (Vercel CLI can upload that file, which otherwise breaks every API call).
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
