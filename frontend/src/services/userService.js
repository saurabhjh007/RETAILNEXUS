import api from './api';

export const userService = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
};
