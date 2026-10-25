import api from './api';

export const reportService = {
  getValuationReport: (warehouseId) => api.get('/reports/valuation', { params: { warehouseId } }),
  downloadInventoryCsv: async (warehouseId) => {
    const token = localStorage.getItem('retailnexus_token');
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/reports/export/inventory-csv${warehouseId ? `?warehouseId=${warehouseId}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download CSV export');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `retailnexus-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};
