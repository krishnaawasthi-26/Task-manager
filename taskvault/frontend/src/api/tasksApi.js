import api, { unwrap } from './axios';

export const tasksApi = {
  list: (params) => api.get('/tasks', { params }).then((r) => r.data),
  create: (payload) => api.post('/tasks', payload).then(unwrap),
  get: (id) => api.get('/tasks/' + id).then(unwrap),
  update: (id, payload) => api.put('/tasks/' + id, payload).then(unwrap),
  patch: (id, payload) => api.patch('/tasks/' + id, payload).then(unwrap),
  remove: (id) => api.delete('/tasks/' + id).then((r) => r.data),
  stats: () => api.get('/tasks/stats').then(unwrap)
};
