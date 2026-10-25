import api from './api';

export const inventoryService = {
  getInventories: (params) => api.get('/inventory', { params }),
  getProductInventory: (productId) => api.get(`/inventory/product/${productId}`),
  adjustStock: (data) => api.post('/inventory/adjust', data),
  transferStock: (data) => api.post('/inventory/transfer', data),
  getMovements: (params) => api.get('/inventory/movements', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
};
