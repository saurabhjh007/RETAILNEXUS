import api from './api';

export const purchaseOrderService = {
  getPurchaseOrders: (params) => api.get('/purchase-orders', { params }),
  getPurchaseOrderById: (id) => api.get(`/purchase-orders/${id}`),
  createPurchaseOrder: (data) => api.post('/purchase-orders', data),
  updateStatus: (id, status) => api.patch(`/purchase-orders/${id}/status`, null, { params: { status } }),
  receiveGoods: (id, data) => api.post(`/purchase-orders/${id}/receive`, data),
};
