import api from './api';

export const warehouseService = {
  getWarehouses: () => api.get('/warehouses'),
  getWarehouseById: (id) => api.get(`/warehouses/${id}`),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
};
