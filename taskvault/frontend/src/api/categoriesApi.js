import api, { unwrap } from './axios';

export const categoriesApi = {
  list: (params) => api.get('/categories', { params }).then((r) => r.data),
  adminAll: (params) => api.get('/categories/admin/all', { params }).then((r) => r.data),
  create: (payload) => api.post('/categories', payload).then(unwrap),
  get: (id) => api.get('/categories/' + id).then(unwrap),
  update: (id, payload) => api.put('/categories/' + id, payload).then(unwrap),
  remove: (id) => api.delete('/categories/' + id).then((r) => r.data)
};
