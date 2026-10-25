import api from './api';

export const dashboardService = {
  getSummary: (warehouseId) => api.get('/dashboard/summary', { params: { warehouseId } }),
};
