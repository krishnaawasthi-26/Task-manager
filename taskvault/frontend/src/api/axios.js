import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

let isRefreshing = false;
let queue = [];

const resolveQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = 'Bearer ' + token;
        return api(original);
      });
    }
    isRefreshing = true;
    try {
      const response = await axios.post(baseURL + '/auth/refresh', { refreshToken });
      const data = response.data.data;
      localStorage.setItem('accessToken', data.access_token || data.accessToken);
      localStorage.setItem('refreshToken', data.refresh_token || data.refreshToken);
      const nextToken = data.access_token || data.accessToken;
      resolveQueue(null, nextToken);
      original.headers.Authorization = 'Bearer ' + nextToken;
      return api(original);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const unwrap = (response) => response.data.data;
export default api;
