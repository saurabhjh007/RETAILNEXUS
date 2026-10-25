import api from './api';

export const supplierService = {
  getSuppliers: (params) => api.get('/suppliers', { params }),
  getActiveSuppliers: () => api.get('/suppliers/active'),
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  toggleActive: (id) => api.patch(`/suppliers/${id}/toggle-active`),
};
