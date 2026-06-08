import api, { unwrap } from './axios';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then(unwrap),
  login: (payload) => api.post('/auth/login', payload).then(unwrap),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then(unwrap),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }).then((r) => r.data),
  me: () => api.get('/auth/me').then(unwrap)
};
