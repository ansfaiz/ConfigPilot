import axios from 'axios';
import { toast } from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn('[ConfigPilot] Missing VITE_API_URL. Set it in your Vite env.');
}

const api = axios.create({
  baseURL: baseURL || '/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const skipToast = !!(err.config?.skipToast || err.config?.meta?.skipToast);

    if (err.response?.status === 401) {
      localStorage.removeItem('cp_token');
      if (!skipToast) toast.error('Session expired. Please sign in again.');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    // Network / CORS / timeout (no response)
    if (!err.response) {
      const msg =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Network error. Please check your connection.';
      if (!skipToast) toast.error(msg);
      return Promise.reject(err);
    }

    const apiMessage = err.response?.data?.error || err.response?.data?.message;
    if (apiMessage && !skipToast) toast.error(apiMessage);
    return Promise.reject(err);
  }
);

export default api;
