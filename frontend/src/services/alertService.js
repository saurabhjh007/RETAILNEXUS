import api from './api';

export const alertService = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getUnreadCount: () => api.get('/alerts/unread-count'),
  acknowledge: (id) => api.patch(`/alerts/${id}/acknowledge`),
};
